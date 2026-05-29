export type AfterSalesStatus = 'pendingAcceptance' | 'processing' | 'pendingCloseConfirm' | 'closed' | 'closedQualityTracking' | 'escalated';
export type AfterSalesPriority = '高' | '中' | '低';
export type AfterSalesType = '退款退货' | '仅退款' | '换货' | '仅退货' | '维修处理' | '现场服务';
export type HandlingMethod = '退款退货' | '仅退款' | '换货' | '仅退货' | '维修' | '现场服务';
export type LinkedDocumentType = '退货入库单' | '换货出库单' | '配件出库单' | '退款付款单' | '应收调整' | '发票红冲' | '服务派工单' | '质量闭环单';
export type LinkedDocumentStatus =
  | '待入库'
  | '已入库'
  | '已质检'
  | '待出库'
  | '已出库'
  | '已签收'
  | '待审核'
  | '待付款'
  | '已付款'
  | '待派工'
  | '服务中'
  | '已完成'
  | '待分析'
  | 'CAPA执行中'
  | '已验证'
  | '已关闭'
  | '待调整'
  | '已调整'
  | '待红冲'
  | '已红冲';

export interface AfterSalesServiceLine {
  id: string;
  productCode: string;
  productName: string;
  spec: string;
  sourceLine: string;
  quantity: number;
  availableQuantity: number;
  refundableAmount: number;
  reason: string;
  complaint: string;
}

export interface AfterSalesService {
  id: string;
  code: string;
  topic: string;
  customerName: string;
  contactName: string;
  address: string;
  sourceOrder: string;
  sourceDelivery: string;
  sourceLine: string;
  afterSalesType: AfterSalesType;
  handlingMethod: HandlingMethod;
  availableQuantity: number;
  refundableAmount: number;
  sla: string;
  warehouseStatus: string;
  financeStatus: string;
  invoiceStatus: string;
  closeConfirmStatus: string;
  qualityStatus: string;
  priority: AfterSalesPriority;
  ownerName: string;
  submittedAt: string;
  status: AfterSalesStatus;
  statusName: string;
  reason: string;
  complaint: string;
  description: string;
  lines: AfterSalesServiceLine[];
  communicationLogs: string[];
  attachments: string[];
  operationLogs: string[];
}

export interface AfterSalesTask {
  id: string;
  code: string;
  topic: string;
  serviceId: string;
  serviceCode: string;
  customerName: string;
  taskType: string;
  department: string;
  ownerName: string;
  linkedDocumentId: string;
  linkedDocumentCode: string;
  linkedDocumentStatus: string;
  dueAt: string;
  status: '待处理' | '处理中' | '已完成';
}

export interface AfterSalesLinkedDocument {
  id: string;
  serviceId: string;
  type: LinkedDocumentType;
  code: string;
  status: LinkedDocumentStatus;
  ownerName: string;
  updatedAt: string;
  writebackLogs: string[];
}

export interface AfterSalesQualityAction {
  id: string;
  code: string;
  topic: string;
  serviceId: string;
  serviceCode: string;
  customerName: string;
  problemType: string;
  stage: string;
  eightDCode: string;
  capaCode: string;
  ownerName: string;
  status: '待分析' | 'CAPA执行中' | '已验证' | '已关闭';
  description: string;
  eightDReports?: Array<{ id: string; stage: string; content: string; owner: string }>;
  capaMeasures?: Array<{ id: string; measure: string; dueAt: string; status: string }>;
  verificationLogs?: string[];
  operationLogs?: string[];
}

export interface AfterSalesDictionary {
  reasons: string[];
  complaints: string[];
  types: AfterSalesType[];
  handlingMethods: HandlingMethod[];
}

export interface CreateAfterSalesPayload {
  customerName: string;
  contactName: string;
  address: string;
  afterSalesType: AfterSalesType;
  handlingMethod: HandlingMethod;
  sourceOrder: string;
  sourceDelivery: string;
  sourceLine: string;
  reason: string;
  complaint: string;
  quantity: number;
  description: string;
  ownerName: string;
  priority: AfterSalesPriority;
  sourceReceivable?: number;
  sourceInvoice?: string;
  attachments?: string[];
  lines?: Array<{
    productCode: string;
    productName: string;
    spec: string;
    sourceLine: string;
    quantity: number;
    availableQuantity: number;
    refundableAmount: number;
    reason: string;
    complaint: string;
  }>;
}
