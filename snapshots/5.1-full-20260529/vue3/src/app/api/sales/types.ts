export type SalesResource =
  | 'customers'
  | 'sales-plans'
  | 'sales-quotes'
  | 'sales-contracts'
  | 'sales-orders'
  | 'sales-returns'
  | 'sales-exchanges'
  | 'sales-reports';

export type SalesSettingType = 'fields' | 'numbers' | 'approvals' | 'strategies' | 'print';

export interface SalesFieldPermission {
  id: string;
  name: string;
  dept?: string;
  role?: string;
  visible: boolean;
}

export interface SalesCustomFieldSetting {
  id: string;
  name: string;
  code: string;
  type: string;
  scope: string;
  required: boolean;
  enabled: boolean;
  placeholder?: string;
  defaultValue?: string;
  permissions?: SalesFieldPermission[];
}

export interface SalesNumberRuleSetting {
  prefix: string;
  separator: string;
  selected: string[];
}

export interface SalesApprovalNodeSetting {
  name: string;
  approvers: string[];
  method: string;
}

export interface SalesApprovalRuleSetting {
  id: string;
  name: string;
  category: string;
  nodes: SalesApprovalNodeSetting[];
  owner: string;
  updatedAt: string;
  enabled: boolean;
}

export interface SalesStrategyRuleSetting {
  key: string;
  title: string;
  sub?: string;
  type?: 'switch' | 'select';
  value?: string;
  enabled?: boolean;
  options?: string[];
}

export interface SalesStrategyTabSetting {
  key: string;
  label: string;
  rows: SalesStrategyRuleSetting[];
}

export interface SalesPrintTemplateSetting {
  id: string;
  name: string;
  scene: string;
  paper: string;
  status: string;
  updatedAt: string;
}

export interface SalesSettings {
  resource: SalesResource;
  fields: SalesCustomFieldSetting[];
  numberRule: SalesNumberRuleSetting;
  approvals: SalesApprovalRuleSetting[];
  strategies: SalesStrategyTabSetting[];
  printTemplates: SalesPrintTemplateSetting[];
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  groupId?: string;
  groupName: string;
  contactName: string;
  contactPosition?: string;
  contactPhone: string;
  address?: string;
  managerId?: string;
  managerName: string;
  creditLimit: number;
  creditUsed: number;
  creditHold: number;
  receivableAmount: number;
  creditAvailable: number;
  paymentTerm: string;
  creditStatus: string;
  creditStatusName: string;
  status: string;
  statusName: string;
}

export interface SalesPlanLine {
  productId?: string;
  productCode: string;
  productName: string;
  model?: string;
  unit: string;
  targetQuantity: number;
  unitPrice: number;
  targetAmount: number;
  planMonth: string;
}

export interface SalesPlan {
  id: string;
  code: string;
  name: string;
  productSummary: string;
  cycleStart: string;
  cycleEnd: string;
  ownerType?: string;
  ownerName: string;
  targetQuantity: number;
  targetAmount: number;
  doneQuantity: number;
  doneAmount: number;
  achievementRate: number;
  status: string;
  statusName: string;
  lines?: SalesPlanLine[];
}

export interface SalesQuote {
  id: string;
  code: string;
  topic: string;
  quoteType: string;
  quoteTypeName: string;
  customerId?: string;
  customerName: string;
  amount: number;
  currency: string;
  priceVersion: string;
  conversionStatus: string;
  conversionStatusName: string;
  quoteDate: string;
  expireDate: string;
  ownerName: string;
  status: string;
  statusName: string;
  contractCode?: string;
  orderCode?: string;
  category?: string;
  relationKind?: string;
  relationName?: string;
  detail?: string;
  attachments?: SalesQuoteAttachment[];
  products?: SalesQuoteProduct[];
  tiers?: SalesQuoteTier[];
}

export interface SalesQuoteProduct {
  id: string;
  productNo: string;
  productName: string;
  model: string;
  unit: string;
  price: number;
  tier: string;
}

export interface SalesQuoteTier {
  id: string;
  minQty: number;
  discount: number;
  note: string;
}

export interface SalesQuoteAttachment {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
}

export interface SalesContract {
  id: string;
  code: string;
  topic: string;
  customerId?: string;
  customerName: string;
  customerContact?: string;
  customerPhone?: string;
  sourceCode?: string;
  amount: number;
  currency: string;
  orderedAmount?: number;
  shippedAmount?: number;
  receivableAmount?: number;
  signedDate: string;
  effectiveDate: string;
  expireDate: string;
  receivedAmount: number;
  invoiceAmount: number;
  balanceAmount?: number;
  executionStatus?: string;
  executionStatusName: string;
  status: string;
  statusName: string;
  ownerName: string;
  discountAmount?: number;
  finalAmount?: number;
  detailHtml?: string;
  products?: SalesContractProduct[];
  orderWriteOffs?: SalesContractRecord[];
  deliveryRecords?: SalesContractRecord[];
  invoiceRecords?: SalesContractRecord[];
  paymentRecords?: SalesContractRecord[];
  operationRecords?: SalesContractRecord[];
}

export interface SalesContractProduct {
  id: string;
  sourceLine: string;
  productCode: string;
  productName: string;
  model: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  orderedQuantity?: number;
  balanceQuantity?: number;
  deliveryTerm?: string;
  paymentTerm?: string;
}

export interface SalesContractRecord {
  id: string;
  [key: string]: string | number;
}

export interface SalesOrder {
  id: string;
  code: string;
  topic: string;
  sourceType: string;
  sourceCode?: string;
  contractSource?: string;
  customerId?: string;
  customerName: string;
  amount: number;
  currency: string;
  creditCheckStatus: string;
  creditCheckName: string;
  creditHoldStatus: string;
  creditHoldName: string;
  receivableAmount: number;
  invoiceRequestStatus: string;
  invoiceRequestName: string;
  receivedAmount: number;
  status: string;
  statusName: string;
  exceptionTag?: string;
  orderDate: string;
  deliveryDate: string;
  ownerName: string;
  progressStatus: string;
  progressName: string;
  contactName?: string;
  deliveryAddress?: string;
  payMethod?: string;
  freightPay?: string;
  deliveryMode?: string;
  creditLimit?: number;
  creditUsed?: number;
  lines?: SalesOrderLine[];
  deliveryReceivables?: SalesOrderRecord[];
  payments?: SalesOrderRecord[];
  productions?: SalesOrderRecord[];
  operationLogs?: SalesOrderRecord[];
}

export interface SalesOrderLine {
  id: string;
  sourceLine?: string;
  priceSource?: string;
  productNo: string;
  productName: string;
  model: string;
  unit: string;
  price: number;
  quantity: number;
  amount: number;
  shippedQuantity?: number;
  unshippedQuantity?: number;
  returnedQuantity?: number;
  planQuantity?: number;
  deliveryDate?: string;
  discountAmount?: number;
  note?: string;
}

export interface SalesOrderRecord {
  id: string;
  values: string[];
}
