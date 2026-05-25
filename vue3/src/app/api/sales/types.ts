export type SalesResource =
  | 'customers'
  | 'sales-plans'
  | 'sales-quotes'
  | 'sales-contracts'
  | 'sales-orders'
  | 'sales-returns'
  | 'sales-exchanges'
  | 'sales-reports';

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
}

export interface SalesContract {
  id: string;
  code: string;
  topic: string;
  customerName: string;
  sourceCode?: string;
  amount: number;
  currency: string;
  signedDate: string;
  effectiveDate: string;
  expireDate: string;
  receivedAmount: number;
  invoiceAmount: number;
  executionStatusName: string;
  status: string;
  statusName: string;
  ownerName: string;
}

export interface SalesOrder {
  id: string;
  code: string;
  topic: string;
  sourceType: string;
  sourceCode?: string;
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
}
