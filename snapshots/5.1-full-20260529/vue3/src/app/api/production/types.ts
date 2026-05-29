export type ProductionResource =
  | 'production-demands'
  | 'production-plans'
  | 'production-orders'
  | 'production-work-orders'
  | 'outsource-orders';

export interface ProductionScheduleShift {
  code: string;
  name: string;
  short: string;
  time: string;
  hours: number;
  rest: string;
  ratio: string;
  color: string;
  fg: string;
  cross: boolean;
  status: string;
  preset: boolean;
}

export interface ProductionScheduleTeam {
  code: string;
  name: string;
  workshop: string;
  line: string;
  leader: string;
  pattern: string;
  skills: string[];
  members: number;
  hours: number;
  attendance: string;
  capacity: number;
  demand: number;
  plan: string;
  status: string;
}

export interface ProductionSchedulePlan {
  code: string;
  name: string;
  team: string;
  pattern: string;
  calendar: string;
  start: string;
  end: string;
  days: number;
  people: number;
  hours: number;
  demandHours: number;
  coverage: string;
  conflicts: number;
  approval: string;
  status: string;
}

export interface ProductionScheduleEmployee {
  name: string;
  no: string;
  team: string;
  station: string;
  skill: string;
  cert: string;
  weeklyLimit: number;
  shifts: string[];
  source: string;
  reason: string;
}

export interface ProductionScheduleCalendarException {
  date?: string;
  day: string;
  type: string;
  rule: string;
  note: string;
}

export type ProductionWorkCalendarDayType = '工作' | '休息' | '节假日' | '调班';

export interface ProductionWorkCalendarDay {
  date: string;
  day: number;
  weekday: string;
  type: ProductionWorkCalendarDayType;
  rule: string;
  note?: string;
}

export interface ProductionWorkCalendarMonth {
  calendarId: string;
  month: string;
  days: ProductionWorkCalendarDay[];
  exceptions: ProductionScheduleCalendarException[];
}

export interface ProductionWorkCalendar {
  id: string;
  name: string;
  scope: string;
  workMode: string;
  inheritFrom: string;
  holidayRule: string;
  swapRule: string;
  status: string;
  exceptionsByMonth: Record<string, ProductionScheduleCalendarException[]>;
}

export interface ProductionScheduleConflict {
  level: string;
  target: string;
  issue: string;
  fix: string;
}

export interface ProductionScheduleData {
  shifts: ProductionScheduleShift[];
  teams: ProductionScheduleTeam[];
  plans: ProductionSchedulePlan[];
  employees: ProductionScheduleEmployee[];
  days: string[];
  calendarExceptions: ProductionScheduleCalendarException[];
  calendars: ProductionWorkCalendar[];
  conflicts: ProductionScheduleConflict[];
  workshops: string[];
}

export interface ProductionLine {
  id: string;
  sourceType?: string;
  sourceCode?: string;
  sourceLine?: string;
  productCode: string;
  productName: string;
  model: string;
  unit: string;
  quantity: number | string;
  demandQuantity?: number | string;
  planQuantity?: number | string;
  requestDate?: string;
  startDate?: string;
  endDate?: string;
  completedQuantity?: number;
  goodQuantity?: number;
  badQuantity?: number;
  inboundQuantity?: number;
  bomVersion?: string;
  bomLock?: string;
  routeCode?: string;
  routeLock?: string;
  processName?: string;
  processSeq?: string;
  processType?: string;
  stationName?: string;
  workshopName?: string;
  lineName?: string;
  ownerName?: string;
  equipmentName?: string;
  plannedHours?: number;
  reportMode?: string;
  dispatchMode?: string;
  standard?: string;
  sourceQuantity?: number | string;
  outsourceQuantity?: number | string;
  supplierName?: string;
  price?: number;
  amount?: number;
  cost?: number | string;
  deliveryDate?: string;
  remark?: string;
  workCode?: string;
  workType?: string;
  workName?: string;
  itemName?: string;
  qmsStatus?: string;
  statusName?: string;
}

export interface ProductionRecord {
  id: string;
  code: string;
  subject: string;
  sourceType: string;
  sourceCode: string;
  sourceName?: string;
  customerName?: string;
  productName: string;
  quantity: number;
  doneQuantity?: number;
  startDate: string;
  endDate: string;
  departmentName?: string;
  workshopName?: string;
  lineName?: string;
  ownerName: string;
  priorityName?: string;
  status: string;
  statusName: string;
  kittingStatusName?: string;
  bomVersion?: string;
  routeCode?: string;
  supplierName?: string;
  pricingSource?: string;
  receiptRequirement?: string;
  qualityRequirement?: string;
  detailText?: string;
  attachments?: ProductionAttachment[];
  lines: ProductionLine[];
}

export interface ProductionDetailTable {
  columns: string[];
  rows: string[][];
}

export interface ProductionAttachment {
  name: string;
  size: string;
  date: string;
}

export interface ProductionDetail extends ProductionRecord {
  detailText?: string;
  attachments?: ProductionAttachment[];
  detailTables?: Record<string, ProductionDetailTable>;
}

export interface ProductionSource {
  id: string;
  type: string;
  code: string;
  title: string;
  subjectName: string;
  customerName?: string;
  productName: string;
  quantity: number;
  deliveryDate: string;
  productRef: ProductionLine;
}

export interface ProductionPickerProduct {
  id: string;
  productCode: string;
  productName: string;
  model: string;
  unit: string;
  bomVersion: string;
  routeCode: string;
  processName: string;
  price: number;
  categoryName?: string;
  stock?: number;
  supplier?: string;
  quantity?: number;
  sourceLine?: string;
  batch?: string;
  bomLock?: string;
  routeLock?: string;
  materialStatus?: string;
  kitGap?: number;
  substitute?: string;
  qmsStatus?: string;
  wmsStatus?: string;
  reportedQuantity?: number;
  goodQuantity?: number;
  badQuantity?: number;
  inboundQuantity?: number;
  startDate?: string;
  endDate?: string;
  deliveryDate?: string;
}

export interface ProductionPerson {
  id: string;
  name: string;
  role: string;
  phone: string;
  dept: string;
}

export interface OutsourceSupplier {
  id: string;
  name: string;
  group?: string;
  contact: string;
  phone: string;
  processScope: string;
  pricingSource: string;
  status?: string;
}

export interface WorkOrderClaimTask {
  id: string;
  workNo: string;
  product: string;
  process: string;
  planQty: number;
  claimedQty: number;
  canClaim: number;
  station: string;
  start: string;
  status: string;
}

export interface WorkOrderAssignedTask {
  id: string;
  workNo: string;
  product: string;
  process: string;
  assignTo: string;
  assignQty: number;
  reportedQty: number;
  leftQty: number;
  station: string;
  assigner: string;
  status: string;
}

export interface WorkOrderReportRecord {
  id: string;
  workNo: string;
  product: string;
  process: string;
  dept: string;
  person: string;
  source: string;
  planQty: number;
  allowQty: number | string;
  reportedQty: number;
  goodQty: number;
  badQty: number;
  count: number;
  lastTime: string;
  status: string;
}

export interface WorkOrderReportPerson {
  id: string;
  name: string;
  dept: string;
  line: string;
  role: string;
}

export interface WorkOrderReportPeopleGroup {
  group: string;
  people: WorkOrderReportPerson[];
}

export interface ProductionDemandSummarySource {
  sourceDoc: string;
  sourceType: string;
  sourceObject: string;
  sourceLine: string;
  demandQty: number;
  doneQty: number;
  leftQty: number;
  deliveryDate: string;
  status: string;
}

export interface ProductionDemandSummaryRow {
  id: string;
  product: string;
  code: string;
  model: string;
  unit: string;
  plan: number;
  done: number;
  left: number;
  date: string;
  status: string;
  sources: ProductionDemandSummarySource[];
}
