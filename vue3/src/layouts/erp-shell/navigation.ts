export interface FlyoutSection {
  title: string;
  items: FlyoutEntry[];
}

export interface FlyoutEntry {
  label: string;
  route?: string;
}

export interface SideNavItem {
  key: string;
  label: string;
  route: string;
  flyout?: FlyoutSection[];
}

export interface TopNavItem {
  key: string;
  label: string;
  icon: string;
  title: string;
  route: string;
  sideItems: SideNavItem[];
}

export const topNavItems: TopNavItem[] = [
  {
    key: 'prd',
    label: 'PRD',
    icon: '▣',
    title: 'PRD 中心',
    route: '/prd',
    sideItems: [{ key: 'workbench', label: '文档总览', route: '/prd' }],
  },
  {
    key: 'rd',
    label: '研发',
    icon: '✎',
    title: '研发中心',
    route: '/rd',
    sideItems: [
      { key: 'workbench', label: '工作台', route: '/rd' },
      { key: 'doc', label: '文档库', route: '/rd/doc' },
      { key: 'project', label: '项目管理', route: '/rd/project' },
      { key: 'product', label: '产品管理', route: '/rd/product' },
      { key: 'material', label: '物料管理', route: '/rd/material' },
      { key: 'process', label: '工序管理', route: '/rd/process' },
      { key: 'craft', label: '工艺管理', route: '/rd/craft' },
      { key: 'bom', label: 'BOM管理', route: '/rd/bom' },
    ],
  },
  {
    key: 'pur',
    label: '采购',
    icon: '📦',
    title: '采购中心',
    route: '/purchase',
    sideItems: [
      { key: 'workbench', label: '工作台', route: '/purchase' },
      {
        key: 'supplier',
        label: '供应商管理',
        route: '/purchase/suppliers',
        flyout: [
          { title: '供应商管理', items: [{ label: '添加供应商' }, { label: '供应商列表' }] },
          { title: '供应商设置', items: ['供应商分组设置', '供应商自定义字段', '供应商自定义编号', '供应商等级设置', '供应商审批设置', '供应商策略设置'].map((label) => ({ label })) },
        ],
      },
      {
        key: 'pr',
        label: '请购管理',
        route: '/purchase/purchase-requests',
        flyout: [
          { title: '请购管理', items: ['添加请购', '请购列表', '请购明细'].map((label) => ({ label })) },
          { title: '请购设置', items: ['请购自定义字段', '请购自定义编号', '请购审批设置', '请购策略设置', '设置采购打印模板'].map((label) => ({ label })) },
        ],
      },
      {
        key: 'inquiry',
        label: '询价管理',
        route: '/purchase/purchase-inquiries',
        flyout: [
          { title: '询价管理', items: ['添加询价', '询价列表'].map((label) => ({ label })) },
          { title: '询价设置', items: ['询价自定义字段', '询价自定义编号', '询价审批设置', '询价策略设置', '设置采购打印模板'].map((label) => ({ label })) },
        ],
      },
      {
        key: 'order',
        label: '采购管理',
        route: '/purchase/purchase-orders',
        flyout: [
          { title: '采购管理', items: ['添加采购', '采购列表'].map((label) => ({ label })) },
          { title: '采购设置', items: ['采购自定义字段', '采购自定义编号', '采购审批设置', '采购策略设置', '设置采购打印模板'].map((label) => ({ label })) },
        ],
      },
      { key: 'pret', label: '采购退货', route: '/purchase/purchase-returns' },
      { key: 'exchange', label: '采购换货', route: '/purchase/purchase-exchanges' },
      { key: 'report', label: '采购报表', route: '/purchase/purchase-reports' },
    ],
  },
  {
    key: 'sale',
    label: '销售',
    icon: '💼',
    title: '销售中心',
    route: '/sales',
    sideItems: [
      { key: 'workbench', label: '工作台', route: '/sales' },
      {
        key: 'customer',
        label: '客户管理',
        route: '/sales/customers',
        flyout: [
          { title: '客户管理', items: [{ label: '添加客户', route: '/sales/customers/new' }, { label: '客户列表', route: '/sales/customers' }] },
          { title: '客户设置', items: ['客户分组设置', '客户自定义字段', '客户自定义编号', '客户等级设置', '客户审批设置', '客户策略设置'].map((label) => ({ label })) },
        ],
      },
      { key: 'salesPlan', label: '销售计划', route: '/sales/sales-plans', flyout: [{ title: '计划管理', items: ['添加计划', '计划列表'].map((label) => ({ label })) }, { title: '计划设置', items: ['计划自定义字段', '计划自定义编号', '计划审批设置', '计划策略设置'].map((label) => ({ label })) }] },
      { key: 'quote', label: '报价管理', route: '/sales/sales-quotes', flyout: [{ title: '报价管理', items: ['添加报价', '报价列表'].map((label) => ({ label })) }, { title: '报价设置', items: ['报价自定义字段', '报价自定义编号', '报价审批设置', '报价策略设置', '设置报价打印模板'].map((label) => ({ label })) }] },
      { key: 'contract', label: '合同管理', route: '/sales/sales-contracts', flyout: [{ title: '合同管理', items: ['添加合同', '合同列表'].map((label) => ({ label })) }, { title: '合同设置', items: ['合同自定义字段', '合同自定义编号', '合同审批设置', '合同策略设置', '设置合同打印模板'].map((label) => ({ label })) }] },
      { key: 'saleOrder', label: '订单管理', route: '/sales/sales-orders', flyout: [{ title: '订单管理', items: ['添加订单', '订单列表'].map((label) => ({ label })) }, { title: '订单设置', items: ['订单自定义字段', '订单自定义编号', '订单审批设置', '订单策略设置', '设置订单打印模板'].map((label) => ({ label })) }] },
      { key: 'sret', label: '销售退货', route: '/sales/sales-returns' },
      { key: 'sexchange', label: '销售换货', route: '/sales/sales-exchanges' },
      { key: 'sreport', label: '销售报表', route: '/sales/sales-reports' },
    ],
  },
  {
    key: 'wh',
    label: '仓储',
    icon: '🗄',
    title: '仓储中心',
    route: '/warehouse',
    sideItems: [
      { key: 'workbench', label: '工作台', route: '/warehouse' },
      { key: 'stockManage', label: '库存管理', route: '/warehouse/inventory-stocks' },
      { key: 'inbound', label: '入库管理', route: '/warehouse/warehouse-inbounds' },
      { key: 'outbound', label: '出库管理', route: '/warehouse/warehouse-outbounds' },
      { key: 'transfer', label: '调拨管理', route: '/warehouse/warehouse-transfers' },
      { key: 'inventoryCheck', label: '盘点管理', route: '/warehouse/inventory-counts' },
      { key: 'warehouseLocation', label: '仓库库位', route: '/warehouse/warehouse-locations' },
    ],
  },
  {
    key: 'mfg',
    label: '生产',
    icon: '⚙',
    title: '生产中心',
    route: '/production',
    sideItems: [
      { key: 'workbench', label: '工作台', route: '/production' },
      { key: 'mfgDemand', label: '生产需求', route: '/production/production-demands' },
      { key: 'mfgPlan', label: '生产计划', route: '/production/production-plans' },
      { key: 'mfgOrder', label: '生产订单', route: '/production/production-orders' },
      { key: 'mfgWorkOrder', label: '生产工单', route: '/production/production-work-orders' },
      { key: 'mfgSchedule', label: '生产排班', route: '/production/production-schedules' },
      { key: 'mfgOutsource', label: '委外加工', route: '/production/outsource-orders' },
    ],
  },
  { key: 'qc', label: '质检', icon: '✓', title: '质检中心', route: '/qc', sideItems: [{ key: 'workbench', label: '工作台', route: '/qc' }] },
  { key: 'finance', label: '财务', icon: '¥', title: '财务中心', route: '/finance', sideItems: [{ key: 'workbench', label: '工作台', route: '/finance' }] },
  { key: 'hr', label: '人力', icon: '👤', title: '人力中心', route: '/hr', sideItems: [{ key: 'workbench', label: '工作台', route: '/hr' }] },
  { key: 'set', label: '设置', icon: '⚙', title: '设置中心', route: '/settings', sideItems: [{ key: 'workbench', label: '工作台', route: '/settings' }] },
];

export function getCenterByPath(path: string) {
  return topNavItems.find((item) => path === item.route || path.startsWith(`${item.route}/`)) || topNavItems[3];
}

export function getSideByPath(path: string, center = getCenterByPath(path)) {
  return center.sideItems.find((item) => path === item.route || path.startsWith(`${item.route}/`)) || center.sideItems[0];
}
