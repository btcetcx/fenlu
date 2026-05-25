import type { ListQuery, PageResult } from '@/app/api/shared/types';
import { request } from '@/app/request/http';
import type { Customer, SalesContract, SalesOrder, SalesPlan, SalesQuote } from './types';
import customers from '@/mock/sales/customers.json';
import contracts from '@/mock/sales/sales-contracts.json';
import orders from '@/mock/sales/sales-orders.json';
import plans from '@/mock/sales/sales-plans.json';
import quotes from '@/mock/sales/sales-quotes.json';

type SalesEntity = Customer | SalesPlan | SalesQuote | SalesContract | SalesOrder;

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

export function listSalesPlans(query?: ListQuery, mode: 'mock' | 'remote' = 'mock') {
  if (mode === 'mock') return Promise.resolve(toPageResult(mockMap['sales-plans'], query));
  return request<PageResult<SalesPlan>>({ url: '/sales-plans', method: 'GET', params: query });
}

export function listSalesQuotes(query?: ListQuery, mode: 'mock' | 'remote' = 'mock') {
  if (mode === 'mock') return Promise.resolve(toPageResult(mockMap['sales-quotes'], query));
  return request<PageResult<SalesQuote>>({ url: '/sales-quotes', method: 'GET', params: query });
}

export function listSalesContracts(query?: ListQuery, mode: 'mock' | 'remote' = 'mock') {
  if (mode === 'mock') return Promise.resolve(toPageResult(mockMap['sales-contracts'], query));
  return request<PageResult<SalesContract>>({ url: '/sales-contracts', method: 'GET', params: query });
}

export function listSalesOrders(query?: ListQuery, mode: 'mock' | 'remote' = 'mock') {
  if (mode === 'mock') return Promise.resolve(toPageResult(mockMap['sales-orders'], query));
  return request<PageResult<SalesOrder>>({ url: '/sales-orders', method: 'GET', params: query });
}
