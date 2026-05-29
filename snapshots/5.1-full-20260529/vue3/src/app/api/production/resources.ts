import type { ApiMode, ListQuery, PageResult } from '@/app/api/shared/types';
import { request } from '@/app/request/http';
import recordsJson from '@/mock/production/records.json';
import pickersJson from '@/mock/production/pickers.json';
import detailTablesJson from '@/mock/production/detail-tables.json';
import workOrderReportingJson from '@/mock/production/work-order-reporting.json';
import demandSummaryJson from '@/mock/production/demand-summary.json';
import schedulesJson from '@/mock/production/schedules.json';
import type {
  OutsourceSupplier,
  ProductionDemandSummaryRow,
  ProductionDetail,
  ProductionDetailTable,
  ProductionScheduleData,
  ProductionScheduleCalendarException,
  ProductionScheduleEmployee,
  ProductionSchedulePlan,
  ProductionScheduleShift,
  ProductionScheduleTeam,
  ProductionWorkCalendar,
  ProductionWorkCalendarDay,
  ProductionWorkCalendarDayType,
  ProductionWorkCalendarMonth,
  ProductionPerson,
  ProductionPickerProduct,
  ProductionRecord,
  ProductionResource,
  ProductionSource,
  WorkOrderAssignedTask,
  WorkOrderClaimTask,
  WorkOrderReportPeopleGroup,
  WorkOrderReportRecord,
} from './types';

type ProductionRecordMap = Record<ProductionResource, ProductionRecord[]>;

const mockRecords = recordsJson as ProductionRecordMap;
const demandSummary = demandSummaryJson as ProductionDemandSummaryRow[];
const scheduleData = schedulesJson as ProductionScheduleData;
const pickerData = pickersJson as {
  sources: ProductionSource[];
  products: ProductionPickerProduct[];
  people: ProductionPerson[];
  suppliers: OutsourceSupplier[];
};
const detailTables = detailTablesJson as Record<string, ProductionDetailTable>;
const workOrderReporting = workOrderReportingJson as {
  claimTasks: WorkOrderClaimTask[];
  assignedTasks: WorkOrderAssignedTask[];
  dispatchClaimRows: string[][];
  dispatchAssignRows: string[][];
  reportRecords: WorkOrderReportRecord[];
  reportDetailRows: string[][];
  reportPeople: WorkOrderReportPeopleGroup[];
};

const weekdayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function toPageResult<T>(items: T[], query: ListQuery = {}): PageResult<T> {
  const pageNo = query.pageNo ?? 1;
  const pageSize = query.pageSize ?? 20;
  const keyword = query.keyword?.trim().toLowerCase();
  const filtered = keyword ? items.filter((item) => JSON.stringify(item).toLowerCase().includes(keyword)) : items;
  const start = (pageNo - 1) * pageSize;
  return {
    items: filtered.slice(start, start + pageSize),
    page: {
      pageNo,
      pageSize,
      total: filtered.length,
      pages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    },
  };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function ensureProductionCalendars() {
  if (scheduleData.calendars?.length) return;
  scheduleData.calendars = [
    {
      id: 'cal_std_2026',
      name: '2026标准工作日历',
      scope: '全公司',
      workMode: '双休',
      inheritFrom: '集团标准日历',
      holidayRule: '同步国务院法定节假日',
      swapRule: '调班日若循环为 R 自动改 A',
      status: '启用',
      exceptionsByMonth: {
        '2026-06': clone(scheduleData.calendarExceptions || []),
      },
    },
  ];
}

function findProductionCalendar(calendarId?: string) {
  ensureProductionCalendars();
  return scheduleData.calendars.find((item) => item.id === calendarId || item.name === calendarId) || scheduleData.calendars[0];
}

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

function formatMonthDate(month: string, day: number) {
  return `${month}-${pad2(day)}`;
}

function labelForDate(dateText: string) {
  const date = new Date(`${dateText}T00:00:00`);
  return `${dateText.slice(5)} ${weekdayLabels[date.getDay()]}`;
}

function exceptionDate(exception: ProductionScheduleCalendarException, month: string) {
  if (exception.date) return exception.date;
  const matched = exception.day.match(/\d{2}-\d{2}/);
  return matched ? `${month.slice(0, 4)}-${matched[0]}` : '';
}

function dayTypeRule(type: ProductionWorkCalendarDayType) {
  if (type === '调班') return '按早班计算';
  if (type === '节假日') return '强制休 R';
  if (type === '休息') return '循环休息日';
  return '可排班';
}

function defaultCalendarDayType(calendar: ProductionWorkCalendar, date: Date, day: number): ProductionWorkCalendarDayType {
  const weekday = date.getDay();
  if (calendar.workMode === '单休') return weekday === 0 ? '休息' : '工作';
  if (calendar.workMode === '大小周') return weekday === 0 || (weekday === 6 && Math.ceil(day / 7) % 2 === 0) ? '休息' : '工作';
  return weekday === 0 || weekday === 6 ? '休息' : '工作';
}

function normalizeCalendarException(exception: ProductionScheduleCalendarException, month: string): ProductionScheduleCalendarException {
  const date = exceptionDate(exception, month);
  return {
    ...exception,
    date,
    day: exception.day || (date ? labelForDate(date) : ''),
  };
}

function buildProductionCalendarMonth(calendar: ProductionWorkCalendar, month: string): ProductionWorkCalendarMonth {
  const [year, monthIndex] = month.split('-').map(Number);
  const dayCount = new Date(year, monthIndex, 0).getDate();
  const exceptions = (calendar.exceptionsByMonth?.[month] || []).map((item) => normalizeCalendarException(item, month));
  const exceptionMap = new Map(exceptions.map((item) => [item.date || exceptionDate(item, month), item]));
  const days: ProductionWorkCalendarDay[] = Array.from({ length: dayCount }, (_, index) => {
    const day = index + 1;
    const date = new Date(year, monthIndex - 1, day);
    const dateText = formatMonthDate(month, day);
    const exception = exceptionMap.get(dateText);
    const type = (exception?.type as ProductionWorkCalendarDayType | undefined) || defaultCalendarDayType(calendar, date, day);
    return {
      date: dateText,
      day,
      weekday: weekdayLabels[date.getDay()],
      type,
      rule: exception?.rule || dayTypeRule(type),
      note: exception?.note,
    };
  });
  return {
    calendarId: calendar.id,
    month,
    days,
    exceptions,
  };
}

function syncedHolidayExceptions(month: string): ProductionScheduleCalendarException[] {
  if (month === '2026-06') {
    return [
      { date: '2026-06-01', day: '06-01 周一', type: '节假日', rule: '强制休 R', note: '端午假期调休' },
      { date: '2026-06-02', day: '06-02 周二', type: '节假日', rule: '强制休 R', note: '端午假期调休' },
      { date: '2026-06-08', day: '06-08 周一', type: '调班', rule: '若循环为 R 自动改 A', note: '补 06-01 工作量' },
    ];
  }
  return [];
}

function mergeCalendarExceptions(
  current: ProductionScheduleCalendarException[] = [],
  incoming: ProductionScheduleCalendarException[] = [],
  month: string,
) {
  const byDate = new Map<string, ProductionScheduleCalendarException>();
  current.forEach((item) => byDate.set(exceptionDate(item, month), normalizeCalendarException(item, month)));
  incoming.forEach((item) => byDate.set(exceptionDate(item, month), normalizeCalendarException(item, month)));
  return Array.from(byDate.values()).sort((a, b) => exceptionDate(a, month).localeCompare(exceptionDate(b, month)));
}

export function listProduction(resource: ProductionResource, query?: ListQuery, mode: ApiMode = 'mock') {
  if (mode === 'mock') return Promise.resolve(toPageResult(mockRecords[resource] || [], query));
  return request<PageResult<ProductionRecord>>({ url: `/${resource}`, method: 'GET', params: query });
}

export function listProductionDemandSummary(query?: ListQuery, mode: ApiMode = 'mock') {
  if (mode === 'mock') return Promise.resolve(toPageResult(demandSummary, query));
  return request<PageResult<ProductionDemandSummaryRow>>({ url: '/production-demands/summary', method: 'GET', params: query });
}

export function getProductionScheduleData(mode: ApiMode = 'mock') {
  if (mode === 'mock') {
    ensureProductionCalendars();
    return Promise.resolve(clone(scheduleData));
  }
  return request<ProductionScheduleData>({ url: '/production-schedules', method: 'GET' });
}

export function listProductionWorkCalendars(mode: ApiMode = 'mock') {
  if (mode === 'mock') {
    ensureProductionCalendars();
    return Promise.resolve(clone(scheduleData.calendars));
  }
  return request<ProductionWorkCalendar[]>({ url: '/production-schedules/calendars', method: 'GET' });
}

export function getProductionWorkCalendarMonth(calendarId: string, month: string, mode: ApiMode = 'mock') {
  if (mode === 'mock') {
    const calendar = findProductionCalendar(calendarId);
    return Promise.resolve(buildProductionCalendarMonth(calendar, month));
  }
  return request<ProductionWorkCalendarMonth>({
    url: `/production-schedules/calendars/${calendarId}/months/${month}`,
    method: 'GET',
  });
}

export function createProductionWorkCalendar(data: Partial<ProductionWorkCalendar> & Record<string, unknown>, mode: ApiMode = 'mock') {
  if (mode === 'mock') {
    ensureProductionCalendars();
    const month = String(data.month || '2026-06');
    const source = findProductionCalendar(String(data.baseCalendarId || ''));
    const exceptions = Array.isArray(data.exceptions)
      ? (data.exceptions as ProductionScheduleCalendarException[]).map((item) => normalizeCalendarException(item, month))
      : clone(source.exceptionsByMonth?.[month] || []);
    const calendar: ProductionWorkCalendar = {
      id: String(data.id || `cal_${Date.now()}`),
      name: String(data.name || '新增工作日历'),
      scope: String(data.scope || '全公司'),
      workMode: String(data.workMode || '双休'),
      inheritFrom: String(data.inheritFrom || '集团标准日历'),
      holidayRule: String(data.holidayRule || '同步国务院法定节假日'),
      swapRule: String(data.swapRule || '调班日若循环为 R 自动改 A'),
      status: String(data.status || '启用'),
      exceptionsByMonth: {
        [month]: exceptions,
      },
    };
    scheduleData.calendars = [calendar, ...scheduleData.calendars];
    return Promise.resolve(clone(calendar));
  }
  return request<ProductionWorkCalendar>({ url: '/production-schedules/calendars', method: 'POST', data });
}

export function updateProductionWorkCalendar(
  calendarId: string,
  data: Partial<ProductionWorkCalendar> & { month?: string; exceptions?: ProductionScheduleCalendarException[] } & Record<string, unknown>,
  mode: ApiMode = 'mock',
) {
  if (mode === 'mock') {
    ensureProductionCalendars();
    const calendar = findProductionCalendar(calendarId);
    const month = data.month || '2026-06';
    calendar.name = String(data.name || calendar.name);
    calendar.scope = String(data.scope || calendar.scope);
    calendar.workMode = String(data.workMode || calendar.workMode);
    calendar.inheritFrom = String(data.inheritFrom || calendar.inheritFrom);
    calendar.holidayRule = String(data.holidayRule || calendar.holidayRule);
    calendar.swapRule = String(data.swapRule || calendar.swapRule);
    calendar.status = String(data.status || calendar.status);
    calendar.exceptionsByMonth ||= {};
    if (Array.isArray(data.exceptions)) {
      calendar.exceptionsByMonth[month] = data.exceptions
        .map((item) => normalizeCalendarException(item, month))
        .sort((a, b) => exceptionDate(a, month).localeCompare(exceptionDate(b, month)));
      if (calendar.id === scheduleData.calendars[0]?.id) scheduleData.calendarExceptions = clone(calendar.exceptionsByMonth[month]);
    }
    return Promise.resolve({
      calendar: clone(calendar),
      month: buildProductionCalendarMonth(calendar, month),
      successAt: new Date().toISOString(),
    });
  }
  return request<{
    calendar: ProductionWorkCalendar;
    month: ProductionWorkCalendarMonth;
    successAt: string;
  }>({
    url: `/production-schedules/calendars/${calendarId}`,
    method: 'PATCH',
    data,
  });
}

export function syncProductionCalendarHolidays(calendarId: string, month: string, mode: ApiMode = 'mock') {
  if (mode === 'mock') {
    const calendar = findProductionCalendar(calendarId);
    calendar.exceptionsByMonth ||= {};
    const synced = syncedHolidayExceptions(month);
    calendar.exceptionsByMonth[month] = mergeCalendarExceptions(calendar.exceptionsByMonth[month], synced, month);
    if (calendar.id === scheduleData.calendars[0]?.id) scheduleData.calendarExceptions = clone(calendar.exceptionsByMonth[month]);
    const calendarMonth = buildProductionCalendarMonth(calendar, month);
    return Promise.resolve({
      calendar: clone(calendar),
      month: calendarMonth,
      message: synced.length ? `已同步 ${month} 法定节假日，更新 ${synced.length} 条例外日` : `${month} 未匹配到法定节假日，已记录同步检查`,
      successAt: new Date().toISOString(),
    });
  }
  return request<{
    calendar: ProductionWorkCalendar;
    month: ProductionWorkCalendarMonth;
    message: string;
    successAt: string;
  }>({
    url: `/production-schedules/calendars/${calendarId}/sync-holidays`,
    method: 'POST',
    data: { month },
  });
}

export function createProductionScheduleItem(
  type: 'shift' | 'calendar' | 'team' | 'plan' | 'roster',
  data: Record<string, unknown>,
  mode: ApiMode = 'mock',
) {
  if (type === 'calendar') return createProductionWorkCalendar(data, mode);
  if (mode === 'mock') {
    if (type === 'shift') scheduleData.shifts = [data as unknown as ProductionScheduleShift, ...scheduleData.shifts];
    if (type === 'team') scheduleData.teams = [data as unknown as ProductionScheduleTeam, ...scheduleData.teams];
    if (type === 'plan') scheduleData.plans = [data as unknown as ProductionSchedulePlan, ...scheduleData.plans];
    if (type === 'roster') scheduleData.employees = [data as unknown as ProductionScheduleEmployee, ...scheduleData.employees];
    return Promise.resolve({ ...data, type, successAt: new Date().toISOString() });
  }
  return request<Record<string, unknown>>({ url: `/production-schedules/${type}`, method: 'POST', data });
}

export function updateProductionScheduleCell(
  data: { employeeNo: string; dayIndex: number; shift: string; reason?: string },
  mode: ApiMode = 'mock',
) {
  if (mode === 'mock') {
    const employee = scheduleData.employees.find((item) => item.no === data.employeeNo);
    if (employee) {
      employee.shifts[data.dayIndex] = data.shift;
      employee.source = '手工调整';
      employee.reason = data.reason || '班次调整';
    }
    return Promise.resolve({ ...data, successAt: new Date().toISOString() });
  }
  return request<Record<string, unknown>>({ url: '/production-schedules/roster/cell', method: 'POST', data });
}

export function runProductionScheduleAction(action: string, data: Record<string, unknown> = {}, mode: ApiMode = 'mock') {
  if (mode === 'mock') return Promise.resolve({ action, ...data, successAt: new Date().toISOString() });
  return request<Record<string, unknown>>({ url: `/production-schedules/${action}`, method: 'POST', data });
}

export function createProduction(resource: ProductionResource, data: Partial<ProductionRecord> & Record<string, unknown>, mode: ApiMode = 'mock') {
  if (mode === 'mock') {
    const prefix = resource === 'production-demands' ? 'demand' : resource === 'production-plans' ? 'plan' : resource === 'production-orders' ? 'order' : resource === 'production-work-orders' ? 'work_order' : 'outsource';
    const codePrefix = resource === 'production-demands' ? 'MR' : resource === 'production-plans' ? 'MP' : resource === 'production-orders' ? 'MO' : resource === 'production-work-orders' ? 'WO' : 'OS';
    const generatedCode = `${codePrefix}-${Date.now()}`;
    const record = {
      ...data,
      id: data.id || `${prefix}_${Date.now()}`,
      code: data.code && data.code !== '系统自动生成' ? data.code : generatedCode,
    } as ProductionRecord;
    mockRecords[resource] = [record, ...(mockRecords[resource] || [])];
    return Promise.resolve(record);
  }
  return request<ProductionRecord>({ url: `/${resource}`, method: 'POST', data });
}

export function getProductionDetail(resource: ProductionResource, id: string, mode: ApiMode = 'mock') {
  if (mode === 'mock') {
    const row = (mockRecords[resource] || []).find((item) => item.id === id || item.code === id) || (mockRecords[resource] || [])[0];
    return Promise.resolve(toProductionDetail(row, resource));
  }
  return request<ProductionDetail>({ url: `/${resource}/${id}`, method: 'GET' });
}

export function updateProduction(resource: ProductionResource, id: string, data: Partial<ProductionDetail>, mode: ApiMode = 'mock') {
  if (mode === 'mock') {
    const rows = mockRecords[resource] || [];
    const index = rows.findIndex((item) => item.id === id || item.code === id);
    if (index >= 0) rows[index] = { ...rows[index], ...data };
    return Promise.resolve(toProductionDetail(rows[index] || data as ProductionRecord, resource));
  }
  return request<ProductionDetail>({ url: `/${resource}/${id}`, method: 'PATCH', data });
}

export function approveProduction(resource: ProductionResource, id: string, data: Record<string, unknown> = {}, mode: ApiMode = 'mock') {
  return runProductionAction(resource, id, 'approve', data, mode);
}

export function printProduction(resource: ProductionResource, id: string, mode: ApiMode = 'mock') {
  return runProductionAction(resource, id, 'print', {}, mode);
}

export function exportProduction(resource: ProductionResource, id: string, mode: ApiMode = 'mock') {
  return runProductionAction(resource, id, 'export', {}, mode);
}

export function dispatchProduction(resource: ProductionResource, id: string, data: Record<string, unknown> = {}, mode: ApiMode = 'mock') {
  return runProductionAction(resource, id, 'dispatch', data, mode);
}

export function reportProduction(resource: ProductionResource, id: string, data: Record<string, unknown> = {}, mode: ApiMode = 'mock') {
  return runProductionAction(resource, id, 'report', data, mode);
}

export function runProductionAction(resource: ProductionResource, id: string, action: string, data: Record<string, unknown> = {}, mode: ApiMode = 'mock') {
  if (mode === 'mock') return Promise.resolve({ id, resource, action, ...data, successAt: new Date().toISOString() });
  return request<Record<string, unknown>>({ url: `/${resource}/${id}/${action}`, method: 'POST', data });
}

export function listProductionSources(types?: string[], mode: ApiMode = 'mock') {
  if (mode === 'mock') {
    const allowed = types?.length ? new Set(types) : null;
    const rows = allowed ? pickerData.sources.filter((row) => allowed.has(row.type)) : pickerData.sources;
    return Promise.resolve(rows.map((row) => {
      const product = pickerData.products.find((item) => item.productCode === row.productRef.productCode);
      return {
        ...row,
        productRef: {
          ...row.productRef,
          bomLock: row.productRef.bomLock || product?.bomLock,
          routeLock: row.productRef.routeLock || product?.routeLock,
          price: row.productRef.price || product?.price,
          completedQuantity: row.productRef.completedQuantity ?? product?.reportedQuantity,
          goodQuantity: row.productRef.goodQuantity ?? product?.goodQuantity,
          badQuantity: row.productRef.badQuantity ?? product?.badQuantity,
          inboundQuantity: row.productRef.inboundQuantity ?? product?.inboundQuantity,
        },
      };
    }));
  }
  return request<ProductionSource[]>({ url: '/production-demand-sources', method: 'GET', params: types?.length ? { types: types.join(',') } : undefined });
}

export function listProductionProducts(mode: ApiMode = 'mock') {
  if (mode === 'mock') return Promise.resolve(pickerData.products);
  return request<ProductionPickerProduct[]>({ url: '/production-products', method: 'GET' });
}

export function listProductionPeople(mode: ApiMode = 'mock') {
  if (mode === 'mock') return Promise.resolve(pickerData.people);
  return request<ProductionPerson[]>({ url: '/production-people', method: 'GET' });
}

export function listOutsourceSuppliers(mode: ApiMode = 'mock') {
  if (mode === 'mock') return Promise.resolve(pickerData.suppliers);
  return request<OutsourceSupplier[]>({ url: '/outsource-suppliers', method: 'GET' });
}

export function listWorkOrderClaimTasks(query?: ListQuery, mode: ApiMode = 'mock') {
  if (mode === 'mock') return Promise.resolve(toPageResult(workOrderReporting.claimTasks, query));
  return request<PageResult<WorkOrderClaimTask>>({ url: '/production-work-orders/claim-tasks', method: 'GET', params: query });
}

export function listWorkOrderAssignedTasks(query?: ListQuery, mode: ApiMode = 'mock') {
  if (mode === 'mock') return Promise.resolve(toPageResult(workOrderReporting.assignedTasks, query));
  return request<PageResult<WorkOrderAssignedTask>>({ url: '/production-work-orders/assigned-tasks', method: 'GET', params: query });
}

export function listWorkOrderReportRecords(query?: ListQuery, mode: ApiMode = 'mock') {
  if (mode === 'mock') return Promise.resolve(toPageResult(workOrderReporting.reportRecords, query));
  return request<PageResult<WorkOrderReportRecord>>({ url: '/production-work-orders/report-records', method: 'GET', params: query });
}

export function listWorkOrderReportPeople(mode: ApiMode = 'mock') {
  if (mode === 'mock') return Promise.resolve(workOrderReporting.reportPeople);
  return request<WorkOrderReportPeopleGroup[]>({ url: '/production-work-orders/report-people', method: 'GET' });
}

export function getWorkOrderReportDetail(row: Partial<WorkOrderReportRecord> = {}, mode: ApiMode = 'mock') {
  if (mode === 'mock') {
    const total = workOrderReporting.reportDetailRows.reduce((sum, item) => sum + (Number(item[3]) || 0), 0);
    const good = workOrderReporting.reportDetailRows.reduce((sum, item) => sum + (Number(item[4]) || 0), 0);
    const bad = workOrderReporting.reportDetailRows.reduce((sum, item) => sum + (Number(item[5]) || 0), 0);
    return Promise.resolve({
      metrics: [
        { label: '工单编号', value: row.workNo || '-' },
        { label: '工序名称', value: row.process || '-' },
        { label: '累计报工', value: String(total) },
        { label: '合格数量', value: String(good) },
        { label: '不良数量', value: String(bad) },
      ],
      rows: workOrderReporting.reportDetailRows,
    });
  }
  return request<Record<string, unknown>>({ url: '/production-work-orders/report-detail', method: 'GET', params: row });
}

export function getWorkOrderDispatchDetail(row: Partial<WorkOrderClaimTask & WorkOrderAssignedTask> = {}, mode: ApiMode = 'mock') {
  if (mode === 'mock') {
    const total = Number(row.planQty || row.assignQty || 120);
    const claimed = workOrderReporting.dispatchClaimRows.reduce((sum, item) => sum + (Number(item[2]) || 0), 0);
    const assigned = workOrderReporting.dispatchAssignRows.reduce((sum, item) => sum + (Number(item[2]) || 0), 0);
    const reported = [...workOrderReporting.dispatchClaimRows, ...workOrderReporting.dispatchAssignRows].reduce((sum, item) => sum + (Number(item[3]) || 0), 0);
    return Promise.resolve({
      metrics: [
        { label: '计划总数', value: String(total) },
        { label: '已领数量', value: String(claimed) },
        { label: '已派数量', value: String(assigned) },
        { label: '已报工数量', value: String(reported) },
        { label: '剩余未分配', value: String(Math.max(0, total - claimed - assigned)) },
        { label: '剩余待报工', value: String(Math.max(0, claimed + assigned - reported)) },
      ],
      claimRows: workOrderReporting.dispatchClaimRows,
      assignRows: workOrderReporting.dispatchAssignRows,
    });
  }
  return request<Record<string, unknown>>({ url: '/production-work-orders/dispatch-detail', method: 'GET', params: row });
}

export function createWorkOrderClaim(data: Partial<WorkOrderClaimTask> & { claimQty?: number | string }, mode: ApiMode = 'mock') {
  if (mode === 'mock') {
    const claimQty = Number(data.claimQty || data.canClaim || 0);
    const record: WorkOrderAssignedTask = {
      id: `assigned_${Date.now()}`,
      workNo: data.workNo || 'WO-20260517001',
      product: data.product || '智能温控终端',
      process: data.process || '总装',
      assignTo: '当前用户',
      assignQty: claimQty,
      reportedQty: 0,
      leftQty: claimQty,
      station: data.station || '总装工位01',
      assigner: '自主领工',
      status: '待报工',
    };
    workOrderReporting.assignedTasks = [record, ...workOrderReporting.assignedTasks];
    return Promise.resolve(record);
  }
  return request<WorkOrderAssignedTask>({ url: '/production-work-orders/claim-tasks', method: 'POST', data });
}

export function createWorkOrderReport(data: Partial<WorkOrderReportRecord>, mode: ApiMode = 'mock') {
  if (mode === 'mock') {
    const reportedQty = Number(data.reportedQty || 0);
    const goodQty = Number(data.goodQty || Math.max(0, reportedQty - Number(data.badQty || 0)));
    const badQty = Number(data.badQty || Math.max(0, reportedQty - goodQty));
    const record: WorkOrderReportRecord = {
      id: `report_record_${Date.now()}`,
      workNo: data.workNo || 'WO-20260517001',
      product: data.product || '智能温控终端',
      process: data.process || '总装',
      dept: data.dept || '生产一部',
      person: data.person || '三红',
      source: data.source || '领工派工',
      planQty: Number(data.planQty || 120),
      allowQty: data.allowQty || 80,
      reportedQty,
      goodQty,
      badQty,
      count: Number(data.count || 1),
      lastTime: data.lastTime || '2026-05-20 17:30',
      status: '待质检',
    };
    workOrderReporting.reportRecords = [record, ...workOrderReporting.reportRecords];
    return Promise.resolve(record);
  }
  return request<WorkOrderReportRecord>({ url: '/production-work-orders/report-records', method: 'POST', data });
}

function toProductionDetail(row: ProductionRecord | undefined, resource: ProductionResource): ProductionDetail {
  const base = row || {
    id: '',
    code: '',
    subject: '',
    sourceType: '',
    sourceCode: '',
    productName: '',
    quantity: 0,
    startDate: '',
    endDate: '',
    ownerName: '',
    status: '',
    statusName: '',
    lines: [],
  };
  return {
    ...base,
    detailText: base.detailText || '生产要求：按当前确认的需求数量组织排产，优先保障交付日期；工艺说明：执行已锁定的 BOM 与工艺路线，关键工序需按检验标准留痕；齐套要求：开工前完成物料齐套确认，异常缺料需提交处理意见；交付约束：按计划周期跟踪进度，影响交付时及时预警并记录原因。',
    attachments: base.attachments || [
      { name: '生产工艺卡.pdf', size: '248 KB', date: '2026-05-17 10:25' },
      { name: resource === 'outsource-orders' ? '委外协议.pdf' : '生产说明.docx', size: '128 KB', date: '2026-05-17 10:40' },
    ],
    detailTables,
  } as ProductionDetail;
}
