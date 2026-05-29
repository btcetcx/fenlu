import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { contractCenters } from '@/app/contracts/modules';
import ErpShell from '@/layouts/erp-shell/ErpShell.vue';

const implementedPurchasePaths = [
  '/purchase/suppliers',
  '/purchase/purchase-requests',
  '/purchase/purchase-inquiries',
  '/purchase/purchase-orders',
];

const implementedWarehousePaths = [
  '/warehouse/inventory-stocks',
  '/warehouse/warehouse-inbounds',
  '/warehouse/warehouse-outbounds',
  '/warehouse/warehouse-transfers',
  '/warehouse/inventory-counts',
  '/warehouse/outbound-quality-inspections',
  '/warehouse/warehouse-locations',
];

const implementedProductionPaths = [
  '/production/production-demands',
  '/production/production-plans',
  '/production/production-orders',
  '/production/production-work-orders',
  '/production/production-schedules',
  '/production/outsource-orders',
];

const implementedRdPaths = [
  '/rd/doc',
  '/rd/projects',
  '/rd/products',
  '/rd/materials',
  '/rd/processes',
  '/rd/crafts',
  '/rd/bom',
];

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
    .filter((resource) => {
      const purchaseImplemented = implementedPurchasePaths.includes(resource.path);
      const warehouseImplemented = implementedWarehousePaths.includes(resource.path);
      const productionImplemented = implementedProductionPaths.includes(resource.path);
      const rdImplemented = implementedRdPaths.includes(resource.path);
      return !purchaseImplemented && !warehouseImplemented && !productionImplemented && !rdImplemented && (!resource.path.startsWith('/sales/') || resource.status === '预留');
    })
    .map((resource) => ({
      path: resource.path.replace(/^\//, ''),
      name: `${center.key}-${resource.apiPath}`,
      component: () => import('@/views/contracts/ContractResourcePage.vue'),
      meta: { title: resource.title },
    })),
]);

const pendingCenterRoutes: RouteRecordRaw[] = [
  { path: 'after-sales', name: 'AfterSalesCenter', title: '售后中心' },
  { path: 'qc', name: 'QcCenter', title: '质检中心' },
  { path: 'hr', name: 'HrCenter', title: '人力中心' },
  { path: 'finance', name: 'FinanceCenter', title: '财务中心' },
  { path: 'equipment', name: 'EquipmentCenter', title: '设备中心' },
  { path: 'energy', name: 'EnergyCenter', title: '能耗中心' },
  { path: 'settings', name: 'SettingsCenter', title: '设置中心' },
].flatMap((center) => [
  {
    path: center.path,
    name: center.name,
    component: () => import('@/views/contracts/ContractWorkbenchPage.vue'),
    meta: { title: center.title },
  },
  {
    path: `${center.path}/:section(.*)*`,
    name: `${center.name}Section`,
    component: () => import('@/views/contracts/ContractWorkbenchPage.vue'),
    meta: { title: center.title },
  },
]);

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: ErpShell,
    redirect: '/sales/customers',
    children: [
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
        path: 'sales/customers/settings/:setting',
        name: 'SalesCustomerSetting',
        component: () => import('@/views/sales/customers/CustomerSettingPage.vue'),
        meta: { title: '客户设置' },
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
      {
        path: 'purchase/suppliers',
        name: 'PurchaseSuppliers',
        component: () => import('@/views/purchase/PurchaseResourcePage.vue'),
        meta: { title: '供应商管理' },
      },
      {
        path: 'purchase/purchase-requests',
        name: 'PurchaseRequests',
        component: () => import('@/views/purchase/PurchaseResourcePage.vue'),
        meta: { title: '请购管理' },
      },
      {
        path: 'purchase/purchase-inquiries',
        name: 'PurchaseInquiries',
        component: () => import('@/views/purchase/PurchaseResourcePage.vue'),
        meta: { title: '询价管理' },
      },
      {
        path: 'purchase/purchase-orders',
        name: 'PurchaseOrders',
        component: () => import('@/views/purchase/PurchaseResourcePage.vue'),
        meta: { title: '采购订单' },
      },
      { path: 'rd/project', redirect: (to) => ({ path: '/rd/projects', query: to.query }) },
      { path: 'rd/product', redirect: (to) => ({ path: '/rd/products', query: to.query }) },
      { path: 'rd/material', redirect: (to) => ({ path: '/rd/materials', query: to.query }) },
      { path: 'rd/process', redirect: (to) => ({ path: '/rd/processes', query: to.query }) },
      { path: 'rd/craft', redirect: (to) => ({ path: '/rd/crafts', query: to.query }) },
      { path: 'rd/boms', redirect: (to) => ({ path: '/rd/bom', query: to.query }) },
      {
        path: 'rd/doc',
        name: 'RdDocuments',
        component: () => import('@/views/rd/RdResourcePage.vue'),
        meta: { title: '文档库' },
      },
      {
        path: 'rd/projects',
        name: 'RdProjects',
        component: () => import('@/views/rd/RdResourcePage.vue'),
        meta: { title: '项目管理' },
      },
      {
        path: 'rd/products',
        name: 'RdProducts',
        component: () => import('@/views/rd/RdResourcePage.vue'),
        meta: { title: '产品管理' },
      },
      {
        path: 'rd/materials',
        name: 'RdMaterials',
        component: () => import('@/views/rd/RdResourcePage.vue'),
        meta: { title: '物料管理' },
      },
      {
        path: 'rd/processes',
        name: 'RdProcesses',
        component: () => import('@/views/rd/RdResourcePage.vue'),
        meta: { title: '工序管理' },
      },
      {
        path: 'rd/crafts',
        name: 'RdCrafts',
        component: () => import('@/views/rd/RdResourcePage.vue'),
        meta: { title: '工艺管理' },
      },
      {
        path: 'rd/bom',
        name: 'RdBoms',
        component: () => import('@/views/rd/RdResourcePage.vue'),
        meta: { title: 'BOM管理' },
      },
      {
        path: 'warehouse/inventory-stocks',
        name: 'WarehouseInventoryStocks',
        component: () => import('@/views/warehouse/WarehouseResourcePage.vue'),
        meta: { title: '库存管理' },
      },
      {
        path: 'warehouse/warehouse-inbounds',
        name: 'WarehouseInbounds',
        component: () => import('@/views/warehouse/WarehouseResourcePage.vue'),
        meta: { title: '入库管理' },
      },
      {
        path: 'warehouse/warehouse-outbounds',
        name: 'WarehouseOutbounds',
        component: () => import('@/views/warehouse/WarehouseResourcePage.vue'),
        meta: { title: '出库管理' },
      },
      {
        path: 'warehouse/warehouse-transfers',
        name: 'WarehouseTransfers',
        component: () => import('@/views/warehouse/WarehouseResourcePage.vue'),
        meta: { title: '调拨管理' },
      },
      {
        path: 'warehouse/inventory-counts',
        name: 'WarehouseInventoryCounts',
        component: () => import('@/views/warehouse/WarehouseResourcePage.vue'),
        meta: { title: '盘点管理' },
      },
      {
        path: 'warehouse/outbound-quality-inspections',
        name: 'WarehouseOutboundQualityInspections',
        component: () => import('@/views/warehouse/WarehouseResourcePage.vue'),
        meta: { title: '出库质检' },
      },
      {
        path: 'warehouse/warehouse-locations',
        name: 'WarehouseLocations',
        component: () => import('@/views/warehouse/WarehouseResourcePage.vue'),
        meta: { title: '仓库库位' },
      },
      {
        path: 'production/production-demands',
        name: 'ProductionDemands',
        component: () => import('@/views/production/ProductionResourcePage.vue'),
        meta: { title: '生产需求' },
      },
      {
        path: 'production/production-plans',
        name: 'ProductionPlans',
        component: () => import('@/views/production/ProductionResourcePage.vue'),
        meta: { title: '生产计划' },
      },
      {
        path: 'production/production-orders',
        name: 'ProductionOrders',
        component: () => import('@/views/production/ProductionResourcePage.vue'),
        meta: { title: '生产订单' },
      },
      {
        path: 'production/production-work-orders',
        name: 'ProductionWorkOrders',
        component: () => import('@/views/production/ProductionResourcePage.vue'),
        meta: { title: '生产工单' },
      },
      {
        path: 'production/production-schedules',
        name: 'ProductionSchedules',
        component: () => import('@/views/production/ProductionSchedulePage.vue'),
        meta: { title: '生产排班' },
      },
      {
        path: 'production/outsource-orders',
        name: 'OutsourceOrders',
        component: () => import('@/views/production/ProductionResourcePage.vue'),
        meta: { title: '委外加工' },
      },
      {
        path: 'after-sales',
        name: 'AfterSalesWorkbench',
        component: () => import('@/views/after-sales/AfterSalesWorkbench.vue'),
        meta: { title: '售后中心' },
      },
      {
        path: 'after-sales/services',
        name: 'AfterSalesServices',
        component: () => import('@/views/after-sales/AfterSalesServiceList.vue'),
        meta: { title: '售后单' },
      },
      {
        path: 'after-sales/service',
        redirect: (to) => ({ path: '/after-sales/services', query: to.query }),
      },
      {
        path: 'after-sales/tasks',
        name: 'AfterSalesTasks',
        component: () => import('@/views/after-sales/AfterSalesTaskList.vue'),
        meta: { title: '售后任务' },
      },
      {
        path: 'after-sales/quality',
        name: 'AfterSalesQuality',
        component: () => import('@/views/after-sales/AfterSalesQualityList.vue'),
        meta: { title: '质量闭环' },
      },
      {
        path: 'after-sales/settings',
        name: 'AfterSalesSettings',
        component: () => import('@/views/after-sales/AfterSalesSettingPage.vue'),
        meta: { title: '售后设置' },
      },
      ...pendingCenterRoutes,
      ...contractRoutes,
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
