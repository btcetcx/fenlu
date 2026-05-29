import type { ListQuery, PageResult } from '@/app/api/shared/types';
import { request } from '@/app/request/http';
import servicesSeed from '@/mock/after-sales/services.json';
import { afterSalesDictionary, afterSalesTypeHandlingMap } from './dictionaries';
import type {
  AfterSalesDictionary,
  AfterSalesLinkedDocument,
  AfterSalesQualityAction,
  AfterSalesService,
  AfterSalesStatus,
  AfterSalesTask,
  CreateAfterSalesPayload,
  HandlingMethod,
  LinkedDocumentStatus,
  LinkedDocumentType,
} from './types';

type Mode = 'mock' | 'remote';

const services = servicesSeed as AfterSalesService[];
const linkedDocuments: AfterSalesLinkedDocument[] = [
  { id: 'doc_001', serviceId: 'as_001', type: '退货入库单', code: 'RIN20260529001', status: '待入库', ownerName: '仓储一组', updatedAt: '2026-05-29 09:21', writebackLogs: ['创建退货入库任务'] },
  { id: 'doc_002', serviceId: 'as_001', type: '退款付款单', code: 'PAY20260529001', status: '待审核', ownerName: '财务一组', updatedAt: '2026-05-29 09:21', writebackLogs: ['创建退款处理任务'] },
  { id: 'doc_003', serviceId: 'as_001', type: '应收调整', code: 'AR-ADJ20260529001', status: '待调整', ownerName: '应收会计', updatedAt: '2026-05-29 09:22', writebackLogs: ['展示型关联单据，待后续接财务逻辑'] },
  { id: 'doc_004', serviceId: 'as_001', type: '发票红冲', code: 'INV-R20260529001', status: '待红冲', ownerName: '开票组', updatedAt: '2026-05-29 09:22', writebackLogs: ['展示型关联单据，待后续接财务逻辑'] },
  { id: 'doc_005', serviceId: 'as_001', type: '质量闭环单', code: 'QA20260529001', status: 'CAPA执行中', ownerName: '质量部', updatedAt: '2026-05-29 09:30', writebackLogs: ['售后已升级质量闭环，不阻塞结单'] },
  { id: 'doc_006', serviceId: 'as_002', type: '退货入库单', code: 'RIN20260528006', status: '已质检', ownerName: '仓储一组', updatedAt: '2026-05-29 11:00', writebackLogs: ['入库完成，回写仓储处理'] },
  { id: 'doc_007', serviceId: 'as_002', type: '换货出库单', code: 'OUT20260528006', status: '已签收', ownerName: '仓储二组', updatedAt: '2026-05-29 14:00', writebackLogs: ['换货签收，售后进入待结单确认'] },
];

const qualityActions: AfterSalesQualityAction[] = [
  {
    id: 'qa_001',
    code: 'QA20260529001',
    topic: 'LED 控制板批次色差 8D 改进',
    serviceId: 'as_001',
    serviceCode: 'AS20260529001',
    customerName: '上海星河制造有限公司',
    problemType: '外观质量',
    stage: 'CAPA执行',
    eightDCode: '8D20260529001',
    capaCode: 'CAPA20260529001',
    ownerName: '林越',
    status: 'CAPA执行中',
    description: '售后已允许结单，质量改进继续追踪到验证关闭。',
    eightDReports: [
      { id: 'd1', stage: 'D1组建团队', content: '组建售后、质量、工艺联合小组', owner: '林越' },
      { id: 'd4', stage: 'D4根因分析', content: '分析批次色差与来料、工艺、运输环境关联', owner: '林越' },
    ],
    capaMeasures: [
      { id: 'capa_1', measure: '追加外观色差抽检标准', dueAt: '2026-06-05', status: 'CAPA执行中' },
      { id: 'capa_2', measure: '复核供应批次并锁定问题批次', dueAt: '2026-06-08', status: 'CAPA执行中' },
    ],
    verificationLogs: ['等待 CAPA 执行完成后进行效果验证'],
    operationLogs: ['由售后 AS20260529001 升级质量闭环', 'CAPA 措施已启动'],
  },
];

export const afterSalesMethodDocumentMap: Record<HandlingMethod, LinkedDocumentType[]> = {
  退款退货: ['退货入库单', '退款付款单', '应收调整', '发票红冲'],
  仅退款: ['退款付款单', '发票红冲'],
  换货: ['退货入库单', '换货出库单'],
  仅退货: ['退货入库单', '应收调整'],
  维修: ['服务派工单', '配件出库单'],
  现场服务: ['服务派工单', '配件出库单'],
};

const initialStatusMap: Record<LinkedDocumentType, LinkedDocumentStatus> = {
  退货入库单: '待入库',
  换货出库单: '待出库',
  配件出库单: '待出库',
  退款付款单: '待审核',
  应收调整: '待调整',
  发票红冲: '待红冲',
  服务派工单: '待派工',
  质量闭环单: '待分析',
};

const documentPrefixMap: Record<LinkedDocumentType, string> = {
  退货入库单: 'RIN',
  换货出库单: 'OUT',
  配件出库单: 'SP-OUT',
  退款付款单: 'PAY',
  应收调整: 'AR-ADJ',
  发票红冲: 'INV-R',
  服务派工单: 'SRV',
  质量闭环单: 'QA',
};

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

function cloneService(service: AfterSalesService): AfterSalesService {
  return {
    ...service,
    lines: service.lines.map((line) => ({ ...line })),
    communicationLogs: [...service.communicationLogs],
    attachments: [...service.attachments],
    operationLogs: [...service.operationLogs],
  };
}

function cloneLinkedDocument(doc: AfterSalesLinkedDocument): AfterSalesLinkedDocument {
  return {
    ...doc,
    writebackLogs: [...doc.writebackLogs],
  };
}

function cloneQualityAction(action: AfterSalesQualityAction): AfterSalesQualityAction {
  return {
    ...action,
    eightDReports: action.eightDReports?.map((item) => ({ ...item })),
    capaMeasures: action.capaMeasures?.map((item) => ({ ...item })),
    verificationLogs: action.verificationLogs ? [...action.verificationLogs] : undefined,
    operationLogs: action.operationLogs ? [...action.operationLogs] : undefined,
  };
}

function statusName(status: AfterSalesStatus) {
  const map: Record<AfterSalesStatus, string> = {
    pendingAcceptance: '待受理',
    processing: '处理中',
    pendingCloseConfirm: '待结单确认',
    closed: '已关闭',
    closedQualityTracking: '已关闭/质量追踪中',
    escalated: '异常升级',
  };
  return map[status];
}

function buildTasks(): AfterSalesTask[] {
  return linkedDocuments
    .filter((doc) => doc.type !== '质量闭环单')
    .map((doc, index) => {
      const service = services.find((item) => item.id === doc.serviceId) || services[0];
      const completed = ['已质检', '已签收', '已付款', '已完成', '已调整', '已红冲'].includes(doc.status);
      const taskType = taskTypeForDocument(doc, service);
      return {
        id: `task_${doc.id}`,
        code: `AST202605${String(index + 1).padStart(4, '0')}`,
        topic: `${doc.type} - ${service.topic}`,
        serviceId: service.id,
        serviceCode: service.code,
        customerName: service.customerName,
        taskType,
        department: doc.type.includes('付款') || doc.type.includes('应收') || doc.type.includes('发票') ? '财务部' : doc.type.includes('服务') ? '服务部' : '仓储部',
        ownerName: doc.ownerName,
        linkedDocumentId: doc.id,
        linkedDocumentCode: doc.code,
        linkedDocumentStatus: doc.status,
        dueAt: service.sla,
        status: completed ? '已完成' : doc.status.startsWith('待') ? '待处理' : '处理中',
      };
    });
}

function taskTypeForDocument(doc: AfterSalesLinkedDocument, service: AfterSalesService) {
  if (doc.type === '退货入库单') return '退货入库';
  if (doc.type === '换货出库单') return '换货出库';
  if (doc.type === '退款付款单') return '退款处理';
  if (doc.type === '服务派工单') return service.handlingMethod === '现场服务' ? '现场服务' : '维修派工';
  return doc.type.replace('单', '');
}

function isDone(type: LinkedDocumentType, status: LinkedDocumentStatus) {
  if (type === '退货入库单') return status === '已质检';
  if (type === '换货出库单' || type === '配件出库单') return status === '已签收';
  if (type === '退款付款单') return status === '已付款';
  if (type === '服务派工单') return status === '已完成';
  if (type === '应收调整') return status === '已调整';
  if (type === '发票红冲') return status === '已红冲';
  return status === '已关闭';
}

function requiredDocumentTypesFor(method: HandlingMethod) {
  return getAfterSalesRequiredDocumentTypes(method);
}

export function getAfterSalesRequiredDocumentTypes(method: HandlingMethod) {
  return afterSalesMethodDocumentMap[method] || [];
}

function isValidTypeHandling(afterSalesType: CreateAfterSalesPayload['afterSalesType'], handlingMethod: HandlingMethod) {
  return (afterSalesTypeHandlingMap[afterSalesType] || []).includes(handlingMethod);
}

function isRefundHandlingMethod(method: HandlingMethod) {
  return method === '退款退货' || method === '仅退款';
}

function sumUniqueAvailableQuantity(lines: NonNullable<CreateAfterSalesPayload['lines']>) {
  const availabilityByLine = new Map<string, number>();
  lines.forEach((line) => {
    const key = line.sourceLine || line.productCode;
    const available = Number(line.availableQuantity || 0);
    const current = availabilityByLine.get(key);
    availabilityByLine.set(key, current == null ? available : Math.min(current, available));
  });
  return Array.from(availabilityByLine.values()).reduce((sum, available) => sum + available, 0);
}

function serviceRequiredDocsDone(serviceId: string) {
  const service = services.find((item) => item.id === serviceId);
  if (!service) return false;
  const docs = linkedDocuments.filter((doc) => doc.serviceId === serviceId);
  const requiredTypes = requiredDocumentTypesFor(service.handlingMethod);
  return requiredTypes.length > 0 && requiredTypes.every((type) => {
    const doc = docs.find((item) => item.type === type);
    return doc && isDone(doc.type, doc.status);
  });
}

function refreshServiceWriteback(serviceId: string) {
  const service = services.find((item) => item.id === serviceId);
  if (!service || service.status === 'closed' || service.status === 'closedQualityTracking') return;
  const docs = linkedDocuments.filter((doc) => doc.serviceId === serviceId);
  const warehouseDocs = docs.filter((doc) => ['退货入库单', '换货出库单', '配件出库单'].includes(doc.type));
  const financeDocs = docs.filter((doc) => ['退款付款单', '应收调整'].includes(doc.type));
  service.warehouseStatus = warehouseDocs.length ? warehouseDocs.map((doc) => `${doc.type}:${doc.status}`).join(' / ') : '无需处理';
  service.financeStatus = financeDocs.length ? financeDocs.map((doc) => `${doc.type}:${doc.status}`).join(' / ') : '无需处理';
  service.invoiceStatus = docs.find((doc) => doc.type === '发票红冲')?.status || '无需处理';
  service.qualityStatus = docs.find((doc) => doc.type === '质量闭环单')?.status || '无需闭环';

  const requiredTypes = requiredDocumentTypesFor(service.handlingMethod);
  const done = requiredTypes.length > 0 && requiredTypes.every((type) => {
    const doc = docs.find((item) => item.type === type);
    return doc && isDone(doc.type, doc.status);
  });
  service.status = done ? 'pendingCloseConfirm' : 'processing';
  service.statusName = statusName(service.status);
  service.closeConfirmStatus = done ? '待结单确认' : '未确认';
}

services.forEach((service) => refreshServiceWriteback(service.id));

function createLinkedDocuments(service: AfterSalesService) {
  afterSalesMethodDocumentMap[service.handlingMethod].forEach((type, index) => {
    const doc: AfterSalesLinkedDocument = {
      id: `doc_${Date.now()}_${index}`,
      serviceId: service.id,
      type,
      code: `${documentPrefixMap[type]}${service.code.replace('AS', '')}`,
      status: initialStatusMap[type],
      ownerName: type.includes('付款') ? '财务一组' : type.includes('服务') ? '服务部' : type.includes('质量') ? '质量部' : '仓储一组',
      updatedAt: service.submittedAt,
      writebackLogs: [`新增售后自动生成${type}`],
    };
    linkedDocuments.push(doc);
  });
}

export function listAfterSalesServices(query?: ListQuery, mode: Mode = 'mock') {
  if (mode === 'mock') {
    services.forEach((service) => refreshServiceWriteback(service.id));
    return Promise.resolve(toPageResult(services.map(cloneService), query));
  }
  return request<PageResult<AfterSalesService>>({ url: '/after-sales/services', method: 'GET', params: query });
}

export function getAfterSalesService(id: string, mode: Mode = 'mock') {
  if (mode === 'mock') {
    refreshServiceWriteback(id);
    const service = services.find((item) => item.id === id);
    return Promise.resolve(service ? cloneService(service) : undefined);
  }
  return request<AfterSalesService>({ url: `/after-sales/services/${id}`, method: 'GET' });
}

export function createAfterSalesService(data: CreateAfterSalesPayload, mode: Mode = 'mock') {
  if (mode !== 'mock') return request<AfterSalesService>({ url: '/after-sales/services', method: 'POST', data });
  if (!isValidTypeHandling(data.afterSalesType, data.handlingMethod)) {
    return Promise.reject(new Error(`After-sales type ${data.afterSalesType} does not support handling method ${data.handlingMethod}`));
  }
  const id = `as_${Date.now()}`;
  const code = `AS${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(services.length + 1).padStart(3, '0')}`;
  const shouldRefund = isRefundHandlingMethod(data.handlingMethod);
  const rawPayloadLines = data.lines?.length ? data.lines : [
    {
      productCode: 'P-AFTER-001',
      productName: '售后来源产品',
      spec: '标准件',
      sourceLine: data.sourceLine,
      quantity: data.quantity,
      availableQuantity: data.quantity,
      refundableAmount: shouldRefund ? data.quantity * 1280 : 0,
      reason: data.reason,
      complaint: data.complaint,
    },
  ];
  const payloadLines = rawPayloadLines.map((line) => ({
    ...line,
    refundableAmount: shouldRefund ? Number(line.refundableAmount || 0) : 0,
  }));
  const invalidLine = payloadLines.find((line) => {
    const quantity = Number(line.quantity || 0);
    const available = Number(line.availableQuantity || 0);
    return !Number.isInteger(quantity) || quantity < 1 || quantity > available;
  });
  if (invalidLine) {
    return Promise.reject(new Error(`After-sales quantity for ${invalidLine.sourceLine || invalidLine.productCode} must be a positive integer within available quantity`));
  }
  const lineTotals = payloadLines.reduce((map, line) => {
    const key = line.sourceLine || line.productCode;
    const current = map.get(key) || { quantity: 0, available: Number(line.availableQuantity || 0) };
    current.quantity += Number(line.quantity || 0);
    current.available = Math.min(current.available, Number(line.availableQuantity || 0));
    map.set(key, current);
    return map;
  }, new Map<string, { quantity: number; available: number }>());
  const overLimitLine = Array.from(lineTotals.entries()).find(([, item]) => item.quantity > item.available);
  if (overLimitLine) {
    return Promise.reject(new Error(`After-sales quantity for ${overLimitLine[0]} exceeds available quantity`));
  }
  const service: AfterSalesService = {
    id,
    code,
    topic: `${data.customerName}${data.handlingMethod}处理`,
    customerName: data.customerName,
    contactName: data.contactName,
    address: data.address,
    sourceOrder: data.sourceOrder,
    sourceDelivery: data.sourceDelivery,
    sourceLine: data.sourceLine,
    afterSalesType: data.afterSalesType,
    handlingMethod: data.handlingMethod,
    availableQuantity: sumUniqueAvailableQuantity(payloadLines),
    refundableAmount: payloadLines.reduce((sum, line) => sum + Number(line.refundableAmount || 0), 0),
    sla: '剩余 2 天',
    warehouseStatus: '待处理',
    financeStatus: '待处理',
    invoiceStatus: '待处理',
    closeConfirmStatus: '未确认',
    qualityStatus: '无需闭环',
    priority: data.priority,
    ownerName: data.ownerName,
    submittedAt: '2026-05-29 16:00',
    status: 'processing',
    statusName: '处理中',
    reason: data.reason,
    complaint: data.complaint,
    description: data.description,
    lines: payloadLines.map((line, index) => ({ ...line, id: `asl_${Date.now()}_${index}` })),
    communicationLogs: ['售后单创建，等待派生单据执行'],
    attachments: data.attachments?.length ? [...data.attachments] : ['问题证据附件'],
    operationLogs: [
      '售后单创建',
      `来源应收：${Number(data.sourceReceivable || 0).toLocaleString('zh-CN')}`,
      `来源发票：${data.sourceInvoice || '未关联'}`,
    ],
  };
  services.unshift(service);
  createLinkedDocuments(service);
  refreshServiceWriteback(service.id);
  return Promise.resolve(service);
}

export function closeAfterSalesService(id: string, mode: Mode = 'mock') {
  if (mode !== 'mock') return request<AfterSalesService>({ url: `/after-sales/services/${id}/close-confirm`, method: 'POST' });
  refreshServiceWriteback(id);
  const service = services.find((item) => item.id === id);
  if (!service) return Promise.reject(new Error(`After-sales service ${id} not found`));
  if (service.status !== 'pendingCloseConfirm' || !serviceRequiredDocsDone(id)) return Promise.reject(new Error(`After-sales service ${id} is not ready to close`));
  const hasOpenQuality = linkedDocuments.some((doc) => doc.serviceId === id && doc.type === '质量闭环单' && doc.status !== '已关闭');
  service.status = hasOpenQuality ? 'closedQualityTracking' : 'closed';
  service.statusName = statusName(service.status);
  service.closeConfirmStatus = '已结单确认';
  service.operationLogs.unshift('内部人员录入结单确认');
  return Promise.resolve(service);
}

export function escalateAfterSalesQualityAction(serviceId: string, mode: Mode = 'mock') {
  if (mode !== 'mock') return request<AfterSalesQualityAction>({ url: `/after-sales/services/${serviceId}/quality-actions`, method: 'POST' });
  const service = services.find((item) => item.id === serviceId);
  if (!service) return Promise.reject(new Error(`After-sales service ${serviceId} not found`));
  const existing = qualityActions.find((item) => item.serviceId === serviceId);
  if (existing) return Promise.resolve(existing);
  const code = `QA${service.code.replace('AS', '')}`;
  const action: AfterSalesQualityAction = {
    id: `qa_${Date.now()}`,
    code,
    topic: `${service.topic} 质量闭环`,
    serviceId: service.id,
    serviceCode: service.code,
    customerName: service.customerName,
    problemType: service.complaint,
    stage: 'D1组建团队',
    eightDCode: `8D${service.code.replace('AS', '')}`,
    capaCode: `CAPA${service.code.replace('AS', '')}`,
    ownerName: service.ownerName,
    status: '待分析',
    description: service.description,
    eightDReports: [{ id: 'd1', stage: 'D1组建团队', content: '确认问题范围并组建跨部门处理团队', owner: service.ownerName }],
    capaMeasures: [{ id: 'capa_1', measure: '待根因分析后制定 CAPA 措施', dueAt: '待定', status: '待分析' }],
    verificationLogs: ['等待 CAPA 措施执行后验证'],
    operationLogs: [`由售后 ${service.code} 升级质量闭环`],
  };
  qualityActions.unshift(action);
  linkedDocuments.push({
    id: `doc_quality_${Date.now()}`,
    serviceId: service.id,
    type: '质量闭环单',
    code,
    status: '待分析',
    ownerName: service.ownerName,
    updatedAt: '2026-05-29 17:00',
    writebackLogs: ['售后升级质量闭环，不阻塞售后结单'],
  });
  service.qualityStatus = '待分析';
  service.operationLogs.unshift('售后升级质量闭环');
  return Promise.resolve(action);
}

export function listAfterSalesLinkedDocuments(serviceId?: string, mode: Mode = 'mock') {
  if (mode === 'mock') return Promise.resolve((serviceId ? linkedDocuments.filter((item) => item.serviceId === serviceId) : linkedDocuments).map(cloneLinkedDocument));
  return request<AfterSalesLinkedDocument[]>({ url: '/after-sales/linked-documents', method: 'GET', params: { serviceId } });
}

export function advanceAfterSalesLinkedDocument(id: string, mode: Mode = 'mock') {
  if (mode !== 'mock') return request<AfterSalesLinkedDocument>({ url: `/after-sales/linked-documents/${id}/advance-status`, method: 'POST' });
  const flow: Record<string, LinkedDocumentStatus[]> = {
    退货入库单: ['待入库', '已入库', '已质检'],
    换货出库单: ['待出库', '已出库', '已签收'],
    配件出库单: ['待出库', '已出库', '已签收'],
    退款付款单: ['待审核', '待付款', '已付款'],
    服务派工单: ['待派工', '服务中', '已完成'],
    质量闭环单: ['待分析', 'CAPA执行中', '已验证', '已关闭'],
    应收调整: ['待调整', '已调整'],
    发票红冲: ['待红冲', '已红冲'],
  };
  const doc = linkedDocuments.find((item) => item.id === id);
  if (!doc) return Promise.reject(new Error(`Linked document ${id} not found`));
  const steps = flow[doc.type] || [doc.status];
  const next = steps[Math.min(steps.indexOf(doc.status) + 1, steps.length - 1)];
  doc.status = next;
  doc.updatedAt = '2026-05-29 16:30';
  doc.writebackLogs.unshift(`${doc.type}推进到${next}，触发售后单状态回填`);
  syncQualityActionFromDocument(doc);
  refreshServiceWriteback(doc.serviceId);
  return Promise.resolve(doc);
}

function syncQualityActionFromDocument(doc: AfterSalesLinkedDocument) {
  if (doc.type !== '质量闭环单') return;
  const action = qualityActions.find((item) => item.serviceId === doc.serviceId || item.code === doc.code);
  if (!action) return;
  action.status = doc.status as AfterSalesQualityAction['status'];
  action.stage = doc.status === '待分析' ? 'D4根因分析' : doc.status === 'CAPA执行中' ? 'CAPA执行' : doc.status === '已验证' ? '效果验证' : '已关闭';
}

export function listAfterSalesTasks(query?: ListQuery, mode: Mode = 'mock') {
  if (mode === 'mock') return Promise.resolve(toPageResult(buildTasks(), query));
  return request<PageResult<AfterSalesTask>>({ url: '/after-sales/tasks', method: 'GET', params: query });
}

export function getAfterSalesTask(id: string, mode: Mode = 'mock') {
  if (mode === 'mock') return Promise.resolve(buildTasks().find((item) => item.id === id));
  return request<AfterSalesTask>({ url: `/after-sales/tasks/${id}`, method: 'GET' });
}

export async function advanceAfterSalesTask(id: string, mode: Mode = 'mock') {
  if (mode !== 'mock') return request<AfterSalesTask>({ url: `/after-sales/tasks/${id}/advance`, method: 'POST' });
  const task = buildTasks().find((item) => item.id === id);
  if (!task) return Promise.reject(new Error(`After-sales task ${id} not found`));
  await advanceAfterSalesLinkedDocument(task.linkedDocumentId, mode);
  const updated = buildTasks().find((item) => item.id === id);
  if (!updated) return Promise.reject(new Error(`After-sales task ${id} not found after advance`));
  return updated;
}

export function listAfterSalesQualityActions(query?: ListQuery, mode: Mode = 'mock') {
  if (mode === 'mock') return Promise.resolve(toPageResult(qualityActions.map(cloneQualityAction), query));
  return request<PageResult<AfterSalesQualityAction>>({ url: '/after-sales/quality-actions', method: 'GET', params: query });
}

export function getAfterSalesQualityAction(id: string, mode: Mode = 'mock') {
  if (mode === 'mock') {
    const action = qualityActions.find((item) => item.id === id);
    return Promise.resolve(action ? cloneQualityAction(action) : undefined);
  }
  return request<AfterSalesQualityAction>({ url: `/after-sales/quality-actions/${id}`, method: 'GET' });
}

export function getAfterSalesDictionary(mode: Mode = 'mock') {
  if (mode === 'mock') return Promise.resolve(afterSalesDictionary);
  return request<AfterSalesDictionary>({ url: '/after-sales/settings/dictionaries', method: 'GET' });
}

export function getAfterSalesWorkbench(mode: Mode = 'mock') {
  if (mode !== 'mock') return request({ url: '/after-sales/workbench', method: 'GET' });
  const tasks = buildTasks();
  const countDocs = (type: LinkedDocumentType, doneStatus: string) => linkedDocuments.filter((doc) => doc.type === type && doc.status !== doneStatus).length;
  return Promise.resolve({
    kpis: [
      { label: '待受理售后单', value: services.filter((item) => item.status === 'pendingAcceptance').length, tone: 'sky', icon: '受' },
      { label: '待处理任务', value: tasks.filter((item) => item.status !== '已完成').length, tone: 'mint', icon: '任' },
      { label: '待退货入库', value: countDocs('退货入库单', '已质检'), tone: 'peach', icon: '入' },
      { label: '待财务退款', value: countDocs('退款付款单', '已付款'), tone: 'sand', icon: '款' },
      { label: '待仓库换货', value: countDocs('换货出库单', '已签收'), tone: 'lilac', icon: '换' },
      { label: '待质量闭环', value: qualityActions.filter((item) => item.status !== '已关闭').length, tone: 'rose', icon: '质' },
      { label: '超时未处理', value: services.filter((item) => item.sla.includes('超时')).length, tone: 'rose', icon: '时' },
      { label: '客诉升级', value: services.filter((item) => item.status === 'escalated' || item.qualityStatus !== '无需闭环').length, tone: 'peach', icon: '升' },
    ],
    tiles: [
      { label: '售后单列表', sub: '主单入口与状态回填', count: services.length, tint: '#e8f4ff', color: '#1677ff', icon: 'AS' },
      { label: '任务管理', sub: '派生执行任务', count: tasks.length, tint: '#eaf8f1', color: '#0f9f6e', icon: 'T' },
      { label: '质量闭环', sub: '8D / CAPA 追踪', count: qualityActions.length, tint: '#fff1f0', color: '#cf1322', icon: 'Q' },
      { label: '售后设置', sub: '原因、投诉、类型、处理方式', count: 4, tint: '#fff7e6', color: '#d48806', icon: 'S' },
    ],
    entries: [
      { label: '新增售后', tint: '#e8f4ff', color: '#1677ff', icon: '+' },
      { label: '推进子单据', tint: '#eaf8f1', color: '#0f9f6e', icon: '→' },
      { label: '结单确认', tint: '#fff7e6', color: '#d48806', icon: '✓' },
    ],
    notices: [
      { type: '回填', text: '换货单已签收，售后 AS20260528006 已进入待结单确认', time: '14:00', tone: 'aw-feed-tag-mint' },
      { type: '质量', text: 'AS20260529001 质量闭环继续追踪，不阻塞售后结单', time: '09:30', tone: 'aw-feed-tag-peach' },
    ],
    recent: services.map((item) => ({ title: item.topic, meta: item.code })),
  });
}
