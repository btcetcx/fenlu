import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { contractCenters } from '@/app/contracts/modules';
import ErpShell from '@/layouts/erp-shell/ErpShell.vue';

const contractRoutes: RouteRecordRaw[] = contractCenters.flatMap((center) => [
  ...(center.key === 'sales'
    ? []
    : [
        {
          path: center.basePath.replace(/^\//, ''),
          name: `${center.key}Center`,
          component: () => import('@/views/contracts/ContractWorkbenchPage.vue'),
          meta: { title: center.title },
        },
      ]),
  ...center.resources
    .filter((resource) => !resource.path.startsWith('/sales/') || resource.status === '预留')
    .map((resource) => ({
      path: resource.path.replace(/^\//, ''),
      name: `${center.key}-${resource.apiPath}`,
      component: () => import('@/views/contracts/ContractResourcePage.vue'),
      meta: { title: resource.title },
    })),
]);

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: ErpShell,
    redirect: '/sales/customers',
    children: [
      ...contractRoutes,
      {
        path: 'sales',
        name: 'SalesCenter',
        component: () => import('@/views/contracts/ContractWorkbenchPage.vue'),
        meta: { title: '销售中心' },
      },
      {
        path: 'sales/customers',
        name: 'SalesCustomers',
        component: () => import('@/views/sales/customers/CustomerList.vue'),
        meta: { title: '客户管理' },
      },
      {
        path: 'sales/customers/new',
        name: 'SalesCustomerCreate',
        component: () => import('@/views/sales/customers/CustomerCreate.vue'),
        meta: { title: '新增客户' },
      },
      {
        path: 'sales/customers/:id',
        name: 'SalesCustomerDetail',
        component: () => import('@/views/sales/customers/CustomerDetail.vue'),
        meta: { title: '客户详情' },
      },
      {
        path: 'sales/sales-plans',
        name: 'SalesPlans',
        component: () => import('@/views/sales/sales-plans/SalesPlanList.vue'),
        meta: { title: '销售计划' },
      },
      {
        path: 'sales/sales-quotes',
        name: 'SalesQuotes',
        component: () => import('@/views/sales/sales-quotes/SalesQuoteList.vue'),
        meta: { title: '报价管理' },
      },
      {
        path: 'sales/sales-contracts',
        name: 'SalesContracts',
        component: () => import('@/views/sales/sales-contracts/SalesContractList.vue'),
        meta: { title: '合同管理' },
      },
      {
        path: 'sales/sales-orders',
        name: 'SalesOrders',
        component: () => import('@/views/sales/sales-orders/SalesOrderList.vue'),
        meta: { title: '订单管理' },
      },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
