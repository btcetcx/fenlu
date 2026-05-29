import type { ListQuery, PageResult } from '@/app/api/shared/types';
import { request } from '@/app/request/http';
import { salesSettingTemplates, type SalesSettingModule } from '@/app/templates/settings-template';
import type {
  Customer,
  SalesContract,
  SalesOrder,
  SalesPlan,
  SalesQuote,
  SalesResource,
  SalesSettings,
} from './types';
import customers from '@/mock/sales/customers.json';
import contracts from '@/mock/sales/sales-contracts.json';
import orders from '@/mock/sales/sales-orders.json';
import plans from '@/mock/sales/sales-plans.json';
import quotes from '@/mock/sales/sales-quotes.json';

type SalesEntity = Customer | SalesPlan | SalesQuote | SalesContract | SalesOrder;

const settingResourceMap: Record<SalesSettingModule, SalesResource> = {
  plans: 'sales-plans',
  quotes: 'sales-quotes',
  contracts: 'sales-contracts',
  orders: 'sales-orders',
};

const mockMap = {
  customers: customers as Customer[],
  'sales-plans': plans as SalesPlan[],
  'sales-quotes': quotes as SalesQuote[],
  'sales-contracts': contracts as SalesContract[],
  'sales-orders': orders as SalesOrder[],
};

function toPageResult<T extends SalesEntity>(items: T[], query: ListQuery = {}): PageResult<T> {
  const pageNo = query.pageNo ?? 1;
  const pageSize = query.pageSize ?? 20;
  const keyword = query.keyword?.trim().toLowerCase();
  const filtered = keyword
    ? items.filter((item) => JSON.stringify(item).toLowerCase().includes(keyword))
    : items;
  const start = (pageNo - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  return {
    items: pageItems,
    page: {
      pageNo,
      pageSize,
      total: filtered.length,
      pages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    },
  };
}

export function listCustomers(query?: ListQuery, mode: 'mock' | 'remote' = 'mock') {
  if (mode === 'mock') return Promise.resolve(toPageResult(mockMap.customers, query));
  return request<PageResult<Customer>>({ url: '/customers', method: 'GET', params: query });
}

export function createCustomer(data: Partial<Customer> & Record<string, unknown>, mode: 'mock' | 'remote' = 'mock') {
  if (mode === 'mock') return Promise.resolve({ ...data, id: data.id || `customer_${Date.now()}` } as Customer);
  return request<Customer>({ url: '/customers', method: 'POST', data });
}

export function listSalesPlans(query?: ListQuery, mode: 'mock' | 'remote' = 'mock') {
  if (mode === 'mock') return Promise.resolve(toPageResult(mockMap['sales-plans'], query));
  return request<PageResult<SalesPlan>>({ url: '/sales-plans', method: 'GET', params: query });
}

export function createSalesPlan(data: Partial<SalesPlan> & Record<string, unknown>, mode: 'mock' | 'remote' = 'mock') {
  if (mode === 'mock') return Promise.resolve({ ...data, id: data.id || `plan_${Date.now()}` } as SalesPlan);
  return request<SalesPlan>({ url: '/sales-plans', method: 'POST', data });
}

export function listSalesQuotes(query?: ListQuery, mode: 'mock' | 'remote' = 'mock') {
  if (mode === 'mock') return Promise.resolve(toPageResult(mockMap['sales-quotes'], query));
  return request<PageResult<SalesQuote>>({ url: '/sales-quotes', method: 'GET', params: query });
}

export function createSalesQuote(data: Partial<SalesQuote> & Record<string, unknown>, mode: 'mock' | 'remote' = 'mock') {
  if (mode === 'mock') return Promise.resolve({ ...data, id: data.id || `quote_${Date.now()}` } as SalesQuote);
  return request<SalesQuote>({ url: '/sales-quotes', method: 'POST', data });
}

export function listSalesContracts(query?: ListQuery, mode: 'mock' | 'remote' = 'mock') {
  if (mode === 'mock') return Promise.resolve(toPageResult(mockMap['sales-contracts'], query));
  return request<PageResult<SalesContract>>({ url: '/sales-contracts', method: 'GET', params: query });
}

export function createSalesContract(data: Partial<SalesContract> & Record<string, unknown>, mode: 'mock' | 'remote' = 'mock') {
  if (mode === 'mock') return Promise.resolve({ ...data, id: data.id || `contract_${Date.now()}` } as SalesContract);
  return request<SalesContract>({ url: '/sales-contracts', method: 'POST', data });
}

export function getSalesContract(id: string, mode: 'mock' | 'remote' = 'mock') {
  if (mode === 'mock') return Promise.resolve(mockMap['sales-contracts'].find((item) => item.id === id) ?? mockMap['sales-contracts'][0]);
  return request<SalesContract>({ url: `/sales-contracts/${id}`, method: 'GET' });
}

export function listSalesOrders(query?: ListQuery, mode: 'mock' | 'remote' = 'mock') {
  if (mode === 'mock') return Promise.resolve(toPageResult(mockMap['sales-orders'], query));
  return request<PageResult<SalesOrder>>({ url: '/sales-orders', method: 'GET', params: query });
}

export function createSalesOrder(data: Partial<SalesOrder> & Record<string, unknown>, mode: 'mock' | 'remote' = 'mock') {
  if (mode === 'mock') return Promise.resolve({ ...data, id: data.id || `order_${Date.now()}` } as SalesOrder);
  return request<SalesOrder>({ url: '/sales-orders', method: 'POST', data });
}

export function getSalesSettings(module: SalesSettingModule, mode: 'mock' | 'remote' = 'mock') {
  const resource = settingResourceMap[module];
  if (mode === 'mock') {
    const template = salesSettingTemplates[module];
    const settings: SalesSettings = {
      resource,
      fields: template.fields.rows.map((row) => ({
        id: String(row.id),
        name: row.name,
        code: row.code,
        type: row.type,
        scope: row.scope,
        required: row.required === true || row.required === '是',
        enabled: row.enabled !== false,
        placeholder: String(row.placeholder || ''),
        defaultValue: String(row.defaultValue || ''),
        permissions: Array.isArray(row.permissions) ? row.permissions.map((person: any) => ({
          id: String(person.id || person.name),
          name: person.name,
          dept: person.dept,
          role: person.role,
          visible: person.visible !== false,
        })) : [],
      })),
      numberRule: {
        prefix: template.numbers.prefix,
        separator: template.numbers.separator,
        selected: [...template.numbers.selected],
      },
      approvals: template.approvals.rows.map((row) => ({
        id: String(row.id),
        name: row.name,
        category: row.category,
        nodes: row.nodes.map((node) => ({ ...node, approvers: [...node.approvers] })),
        owner: row.owner,
        updatedAt: row.updatedAt,
        enabled: row.enabled,
      })),
      strategies: template.strategies.tabs.map((tab) => ({
        ...tab,
        rows: tab.rows.map((row) => ({ ...row })),
      })),
      printTemplates: template.print.rows.map((row) => ({ ...row, id: String(row.id) })),
    };
    return Promise.resolve(settings);
  }
  return request<SalesSettings>({ url: `/${resource}/settings`, method: 'GET' });
}

export function saveSalesSettings(module: SalesSettingModule, data: SalesSettings, mode: 'mock' | 'remote' = 'mock') {
  const resource = settingResourceMap[module];
  if (mode === 'mock') return Promise.resolve(data);
  return request<SalesSettings>({ url: `/${resource}/settings`, method: 'PATCH', data });
}
