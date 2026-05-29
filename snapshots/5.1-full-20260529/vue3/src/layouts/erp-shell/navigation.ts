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
  status?: 'ready' | 'pending';
  sideItems: SideNavItem[];
}

const settingEntries = (name: string, route: string): FlyoutEntry[] => [
  { label: `${name}自定义字段`, route: `${route}?setting=fields` },
  { label: `${name}自定义编号`, route: `${route}?setting=numbers` },
  { label: `${name}审批设置`, route: `${route}?setting=approvals` },
  { label: `${name}策略设置`, route: `${route}?setting=strategies` },
  { label: `设置${name}打印模板`, route: `${route}?setting=print` },
];

const standardFlyout = (title: string, route: string, addLabel: string, listLabel: string, detailLabel: string): FlyoutSection[] => [
  {
    title,
    items: [
      { label: addLabel, route: `${route}?action=new` },
      { label: listLabel, route },
      { label: detailLabel, route: `${route}?id=demo_001` },
    ],
  },
  { title: `${title}设置`, items: settingEntries(title.replace(/管理$/, '').replace(/订单$/, ''), route) },
];

const purchaseFlyout = (title: string, route: string, addLabel: string, listLabel: string, detailLabel: string): FlyoutSection[] => [
  {
    title,
    items: [
      { label: addLabel, route: `${route}?action=new` },
      { label: listLabel, route },
      { label: detailLabel, route: `${route}?action=${detailLabel}` },
    ],
  },
  { title: `${title}设置`, items: settingEntries(title.replace(/管理$/, '').replace(/订单$/, ''), route) },
];

const purchaseListOnlyFlyout = (title: string, route: string, addLabel: string, listLabel: string): FlyoutSection[] => [
  {
    title,
    items: [
      { label: addLabel, route: `${route}?action=new` },
      { label: listLabel, route },
    ],
  },
  { title: `${title}设置`, items: settingEntries(title.replace(/管理$/, '').replace(/订单$/, ''), route) },
];

const productionListOnlyFlyout = (title: string, route: string, addLabel: string, listLabel: string, settingName: string): FlyoutSection[] => [
  {
    title,
    items: [
      { label: addLabel, route: `${route}?action=new` },
      { label: listLabel, route },
    ],
  },
  { title: `${settingName}设置`, items: settingEntries(settingName, route) },
];

const productionDemandFlyout = (): FlyoutSection[] => {
  const route = '/production/production-demands';
  return [
    {
      title: '生产需求',
      items: [
        { label: '新增生产需求', route: `${route}?action=new` },
        { label: '生产需求列表', route },
        { label: '生产需求汇总', route: actionRoute(route, '生产需求汇总') },
      ],
    },
    { title: '需求设置', items: settingEntries('需求', route) },
  ];
};

const productionWorkOrderFlyout = (): FlyoutSection[] => {
  const route = '/production/production-work-orders';
  return [
    {
      title: '生产工单',
      items: [
        { label: '新增生产工单', route: `${route}?action=new` },
        { label: '生产工单列表', route },
      ],
    },
    {
      title: '报工管理',
      items: [
        { label: '领工派工', route: actionRoute(route, '领工派工') },
        { label: '任务报工', route: actionRoute(route, '任务报工') },
        { label: '报工记录', route: actionRoute(route, '报工记录') },
      ],
    },
    { title: '生产工单设置', items: settingEntries('生产工单', route) },
  ];
};

const productionScheduleFlyout = (): FlyoutSection[] => {
  const route = '/production/production-schedules';
  return [
    {
      title: '生产排班',
      items: [
        { label: '排班列表', route },
        { label: '排班计划', route: actionRoute(route, '排班计划') },
        { label: '生产班组', route: actionRoute(route, '生产班组') },
        { label: '工作日历', route: actionRoute(route, '工作日历') },
        { label: '班次管理', route: actionRoute(route, '班次管理') },
      ],
    },
    {
      title: '生产排班设置',
      items: [
        { label: '排班自定义字段', route: `${route}?setting=fields` },
        { label: '排班自定义编号', route: `${route}?setting=numbers` },
        { label: '排班审批设置', route: `${route}?setting=approvals` },
        { label: '生产排班策略设置', route: `${route}?setting=strategies` },
        { label: '设置生产排班打印模板', route: `${route}?setting=print` },
      ],
    },
  ];
};

const actionRoute = (route: string, label: string) => `${route}?action=${encodeURIComponent(label)}`;

const jsxFlyout = (route: string, sections: Array<{ title: string; items: string[] }>): FlyoutSection[] =>
  sections.map((section) => ({
    title: section.title,
    items: section.items.map((label) => ({ label, route: actionRoute(route, label) })),
  }));

const jsxSideItem = (
  key: string,
  label: string,
  route: string,
  sections?: Array<{ title: string; items: string[] }>,
): SideNavItem => ({
  key,
  label,
  route,
  flyout: sections ? jsxFlyout(route, sections) : undefined,
});

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
      {
        key: 'doc',
        label: '文档库',
        route: '/rd/doc',
        flyout: [
          {
            title: '文档库',
            items: [
              { label: '新增文档', route: '/rd/doc?action=new' },
              { label: '文档列表', route: '/rd/doc' },
            ],
          },
          {
            title: '文档设置',
            items: [
              { label: '设置文档编号', route: '/rd/doc?setting=numbers' },
              { label: '设置文档分类', route: '/rd/doc?setting=categories' },
              { label: '设置审批流程', route: '/rd/doc?setting=approvals' },
              { label: '设置自定义字段', route: '/rd/doc?setting=fields' },
              { label: '设置文档策略', route: '/rd/doc?setting=strategies' },
              { label: '设置打印模板', route: '/rd/doc?setting=print' },
            ],
          },
        ],
      },
      {
        key: 'project',
        label: '项目管理',
        route: '/rd/projects',
        flyout: [
          {
            title: '项目管理',
            items: [
              { label: '新增项目', route: '/rd/projects?action=new' },
              { label: '项目列表', route: '/rd/projects' },
            ],
          },
          {
            title: '项目设置',
            items: [
              { label: '设置项目编号', route: '/rd/projects?setting=numbers' },
              { label: '设置项目分类', route: '/rd/projects?setting=categories' },
              { label: '设置审批流程', route: '/rd/projects?setting=approvals' },
              { label: '设置自定义字段', route: '/rd/projects?setting=fields' },
              { label: '设置项目策略', route: '/rd/projects?setting=strategies' },
              { label: '设置打印模板', route: '/rd/projects?setting=print' },
            ],
          },
        ],
      },
      {
        key: 'product',
        label: '产品管理',
        route: '/rd/products',
        flyout: [
          {
            title: '产品管理',
            items: [
              { label: '新增产品', route: '/rd/products?action=new' },
              { label: '产品列表', route: '/rd/products' },
            ],
          },
          {
            title: '产品设置',
            items: [
              { label: '产品码管控', route: '/rd/products?action=产品码管控' },
              { label: '设置产品编号', route: '/rd/products?setting=numbers' },
              { label: '设置产品分类', route: '/rd/products?setting=categories' },
              { label: '设置审批流程', route: '/rd/products?setting=approvals' },
              { label: '设置自定义字段', route: '/rd/products?setting=fields' },
              { label: '设置产品策略', route: '/rd/products?setting=strategies' },
              { label: '设置打印模板', route: '/rd/products?setting=print' },
            ],
          },
        ],
      },
      {
        key: 'material',
        label: '物料管理',
        route: '/rd/materials',
        flyout: [
          {
            title: '物料管理',
            items: [
              { label: '新增物料', route: '/rd/materials?action=new' },
              { label: '物料列表', route: '/rd/materials' },
            ],
          },
          {
            title: '物料设置',
            items: [
              { label: '设置物料编号', route: '/rd/materials?setting=numbers' },
              { label: '设置物料分类', route: '/rd/materials?setting=categories' },
              { label: '设置审批流程', route: '/rd/materials?setting=approvals' },
              { label: '设置自定义字段', route: '/rd/materials?setting=fields' },
              { label: '设置物料策略', route: '/rd/materials?setting=strategies' },
              { label: '设置打印模板', route: '/rd/materials?setting=print' },
            ],
          },
        ],
      },
      {
        key: 'process',
        label: '工序管理',
        route: '/rd/processes',
        flyout: [
          {
            title: '工序管理',
            items: [
              { label: '新增工序', route: '/rd/processes?action=new' },
              { label: '工序列表', route: '/rd/processes' },
            ],
          },
          {
            title: '工序设置',
            items: [
              { label: '设置工序编号', route: '/rd/processes?setting=numbers' },
              { label: '设置工序分类', route: '/rd/processes?setting=categories' },
              { label: '设置审批流程', route: '/rd/processes?setting=approvals' },
              { label: '设置自定义字段', route: '/rd/processes?setting=fields' },
              { label: '设置工序策略', route: '/rd/processes?setting=strategies' },
              { label: '设置打印模板', route: '/rd/processes?setting=print' },
            ],
          },
        ],
      },
      {
        key: 'craft',
        label: '工艺管理',
        route: '/rd/crafts',
        flyout: [
          {
            title: '工艺管理',
            items: [
              { label: '新增工艺', route: '/rd/crafts?action=new' },
              { label: '工艺列表', route: '/rd/crafts' },
            ],
          },
          {
            title: '工艺设置',
            items: [
              { label: '设置工艺编号', route: '/rd/crafts?setting=numbers' },
              { label: '设置工艺分类', route: '/rd/crafts?setting=categories' },
              { label: '设置审批流程', route: '/rd/crafts?setting=approvals' },
              { label: '设置自定义字段', route: '/rd/crafts?setting=fields' },
              { label: '设置工艺策略', route: '/rd/crafts?setting=strategies' },
              { label: '设置打印模板', route: '/rd/crafts?setting=print' },
            ],
          },
        ],
      },
      {
        key: 'bom',
        label: 'BOM管理',
        route: '/rd/bom',
        flyout: [
          {
            title: 'BOM库',
            items: [
              { label: '新增BOM', route: '/rd/bom?action=new' },
              { label: 'BOM列表', route: '/rd/bom' },
            ],
          },
          {
            title: '代替物料库',
            items: [
              { label: '新增代替', route: '/rd/bom?tab=substitute&action=新增代替' },
              { label: '代替列表', route: '/rd/bom?tab=substitute' },
            ],
          },
          {
            title: 'BOM设置',
            items: [
              { label: '设置项目编号', route: '/rd/bom?setting=numbers' },
              { label: '设置bom策略', route: '/rd/bom?setting=strategies' },
              { label: '设置bom分类', route: '/rd/bom?setting=categories' },
              { label: '设置bom模板', route: '/rd/bom?setting=template' },
              { label: '设置bom流程', route: '/rd/bom?setting=approvals' },
              { label: '设置自定义字段', route: '/rd/bom?setting=fields' },
            ],
          },
        ],
      },
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
          {
            title: '供应商管理',
            items: [
              { label: '添加供应商', route: '/purchase/suppliers?action=new' },
              { label: '供应商列表', route: '/purchase/suppliers' },
            ],
          },
          {
            title: '供应商设置',
            items: [
              { label: '供应商分组设置', route: '/purchase/suppliers?setting=groups' },
              { label: '供应商自定义字段', route: '/purchase/suppliers?setting=fields' },
              { label: '供应商自定义编号', route: '/purchase/suppliers?setting=numbers' },
              { label: '供应商等级设置', route: '/purchase/suppliers?setting=levels' },
              { label: '供应商审批设置', route: '/purchase/suppliers?setting=approvals' },
              { label: '供应商策略设置', route: '/purchase/suppliers?setting=strategies' },
              { label: '设置供应商打印模板', route: '/purchase/suppliers?setting=print' },
            ],
          },
        ],
      },
      {
        key: 'pr',
        label: '请购管理',
        route: '/purchase/purchase-requests',
        flyout: purchaseFlyout('请购管理', '/purchase/purchase-requests', '添加请购', '请购列表', '请购明细'),
      },
      {
        key: 'inquiry',
        label: '询价管理',
        route: '/purchase/purchase-inquiries',
        flyout: purchaseListOnlyFlyout('询价管理', '/purchase/purchase-inquiries', '添加询价', '询价列表'),
      },
      {
        key: 'order',
        label: '采购订单',
        route: '/purchase/purchase-orders',
        flyout: purchaseListOnlyFlyout('采购订单', '/purchase/purchase-orders', '添加采购订单', '采购订单列表'),
      },
      {
        key: 'pret',
        label: '采购退货',
        route: '/purchase/purchase-returns',
        flyout: standardFlyout('采购退货', '/purchase/purchase-returns', '新增采购退货', '采购退货列表', '采购退货明细'),
      },
      {
        key: 'exchange',
        label: '采购换货',
        route: '/purchase/purchase-exchanges',
        flyout: standardFlyout('采购换货', '/purchase/purchase-exchanges', '新增采购换货', '采购换货列表', '采购换货明细'),
      },
      {
        key: 'report',
        label: '采购报表',
        route: '/purchase/purchase-reports',
        flyout: [
          {
            title: '采购报表',
            items: [
              { label: '供应商对账', route: '/purchase/purchase-reports?report=reconciliation' },
              { label: '按供应商查询', route: '/purchase/purchase-reports?report=by-supplier' },
              { label: '按产品统计', route: '/purchase/purchase-reports?report=by-product' },
              { label: '退换货明细', route: '/purchase/purchase-reports?report=returns' },
            ],
          },
        ],
      },
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
          {
            title: '客户设置',
            items: [
              { label: '客户分组设置', route: '/sales/customers/settings/groups' },
              { label: '客户自定义字段', route: '/sales/customers/settings/fields' },
              { label: '客户自定义编号', route: '/sales/customers/settings/numbers' },
              { label: '客户等级设置', route: '/sales/customers/settings/levels' },
              { label: '客户审批设置', route: '/sales/customers/settings/approvals' },
              { label: '客户策略设置', route: '/sales/customers/settings/strategies' },
            ],
          },
        ],
      },
      {
        key: 'salesPlan',
        label: '销售计划',
        route: '/sales/sales-plans',
        flyout: [
          { title: '计划管理', items: [{ label: '添加计划', route: '/sales/sales-plans?action=new' }, { label: '计划列表', route: '/sales/sales-plans' }] },
          {
            title: '计划设置',
            items: [
              { label: '计划自定义字段', route: '/sales/sales-plans?setting=fields' },
              { label: '计划自定义编号', route: '/sales/sales-plans?setting=numbers' },
              { label: '计划审批设置', route: '/sales/sales-plans?setting=approvals' },
              { label: '计划策略设置', route: '/sales/sales-plans?setting=strategies' },
              { label: '设置计划打印模板', route: '/sales/sales-plans?setting=print' },
            ],
          },
        ],
      },
      {
        key: 'quote',
        label: '报价管理',
        route: '/sales/sales-quotes',
        flyout: [
          { title: '报价管理', items: [{ label: '添加报价', route: '/sales/sales-quotes?action=new' }, { label: '报价列表', route: '/sales/sales-quotes' }] },
          {
            title: '报价设置',
            items: [
              { label: '报价自定义字段', route: '/sales/sales-quotes?setting=fields' },
              { label: '报价自定义编号', route: '/sales/sales-quotes?setting=numbers' },
              { label: '报价审批设置', route: '/sales/sales-quotes?setting=approvals' },
              { label: '报价策略设置', route: '/sales/sales-quotes?setting=strategies' },
              { label: '设置报价打印模板', route: '/sales/sales-quotes?setting=print' },
            ],
          },
        ],
      },
      {
        key: 'contract',
        label: '合同管理',
        route: '/sales/sales-contracts',
        flyout: [
          { title: '合同管理', items: [{ label: '添加合同', route: '/sales/sales-contracts?action=new' }, { label: '合同列表', route: '/sales/sales-contracts' }] },
          {
            title: '合同设置',
            items: [
              { label: '合同自定义字段', route: '/sales/sales-contracts?setting=fields' },
              { label: '合同自定义编号', route: '/sales/sales-contracts?setting=numbers' },
              { label: '合同审批设置', route: '/sales/sales-contracts?setting=approvals' },
              { label: '合同策略设置', route: '/sales/sales-contracts?setting=strategies' },
              { label: '设置合同打印模板', route: '/sales/sales-contracts?setting=print' },
            ],
          },
        ],
      },
      {
        key: 'saleOrder',
        label: '订单管理',
        route: '/sales/sales-orders',
        flyout: [
          { title: '订单管理', items: [{ label: '添加订单', route: '/sales/sales-orders?action=new' }, { label: '订单列表', route: '/sales/sales-orders' }] },
          {
            title: '订单设置',
            items: [
              { label: '订单自定义字段', route: '/sales/sales-orders?setting=fields' },
              { label: '订单自定义编号', route: '/sales/sales-orders?setting=numbers' },
              { label: '订单审批设置', route: '/sales/sales-orders?setting=approvals' },
              { label: '订单策略设置', route: '/sales/sales-orders?setting=strategies' },
              { label: '设置订单打印模板', route: '/sales/sales-orders?setting=print' },
            ],
          },
        ],
      },
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
      {
        key: 'stockManage',
        label: '库存管理',
        route: '/warehouse/inventory-stocks',
        flyout: [
          {
            title: '库存管理',
            items: [
              { label: '库存列表', route: '/warehouse/inventory-stocks' },
            ],
          },
          { title: '库存设置', items: settingEntries('库存', '/warehouse/inventory-stocks') },
        ],
      },
      {
        key: 'inbound',
        label: '入库管理',
        route: '/warehouse/warehouse-inbounds',
        flyout: [
          {
            title: '入库管理',
            items: [
              { label: '直接入库', route: '/warehouse/warehouse-inbounds?action=直接入库' },
              { label: '全部入库单', route: '/warehouse/warehouse-inbounds?action=全部入库单' },
              { label: '待入库单', route: '/warehouse/warehouse-inbounds?action=待入库单' },
              { label: '待入库明细', route: '/warehouse/warehouse-inbounds?action=待入库明细' },
            ],
          },
          { title: '入库设置', items: settingEntries('入库', '/warehouse/warehouse-inbounds') },
        ],
      },
      {
        key: 'outbound',
        label: '出库管理',
        route: '/warehouse/warehouse-outbounds',
        flyout: [
          {
            title: '出库管理',
            items: [
              { label: '直接出库', route: '/warehouse/warehouse-outbounds?action=直接出库' },
              { label: '全部出库单', route: '/warehouse/warehouse-outbounds?action=全部出库单' },
              { label: '待出库单', route: '/warehouse/warehouse-outbounds?action=待出库单' },
              { label: '待出库明细', route: '/warehouse/warehouse-outbounds?action=待出库明细' },
              { label: '待申请发货', route: '/warehouse/warehouse-outbounds?action=待申请发货' },
            ],
          },
          { title: '出库设置', items: settingEntries('出库', '/warehouse/warehouse-outbounds') },
        ],
      },
      {
        key: 'transfer',
        label: '调拨管理',
        route: '/warehouse/warehouse-transfers',
        flyout: [
          {
            title: '调拨管理',
            items: [
              { label: '新增调拨', route: '/warehouse/warehouse-transfers?action=新增调拨' },
              { label: '调拨列表', route: '/warehouse/warehouse-transfers?action=调拨列表' },
              { label: '调拨明细表', route: '/warehouse/warehouse-transfers?action=调拨明细表' },
            ],
          },
          { title: '调拨设置', items: settingEntries('调拨', '/warehouse/warehouse-transfers') },
        ],
      },
      {
        key: 'inventoryCheck',
        label: '盘点管理',
        route: '/warehouse/inventory-counts',
        flyout: [
          {
            title: '盘点管理',
            items: [
              { label: '直接盘点', route: '/warehouse/inventory-counts?action=直接盘点' },
              { label: '盘点计划', route: '/warehouse/inventory-counts?action=盘点计划' },
              { label: '所有盘点单', route: '/warehouse/inventory-counts?action=所有盘点单' },
            ],
          },
          { title: '盘点设置', items: settingEntries('盘点', '/warehouse/inventory-counts') },
        ],
      },
      {
        key: 'warehouseLocation',
        label: '仓库库位',
        route: '/warehouse/warehouse-locations',
        flyout: [
          {
            title: '仓库库位',
            items: [
              { label: '仓库维护', route: '/warehouse/warehouse-locations?tab=warehouses' },
              { label: '库区维护', route: '/warehouse/warehouse-locations?tab=areas' },
              { label: '库位维护', route: '/warehouse/warehouse-locations' },
              { label: '新增库位', route: '/warehouse/warehouse-locations?action=new' },
            ],
          },
          { title: '库位设置', items: settingEntries('库位', '/warehouse/warehouse-locations') },
        ],
      },
      {
        key: 'outboundQuality',
        label: '出库质检',
        route: '/warehouse/outbound-quality-inspections',
        flyout: standardFlyout('出货质检', '/warehouse/outbound-quality-inspections', '新增出货质检', '出货质检列表', '出货质检详情'),
      },
      {
        key: 'inboundQuality',
        label: '来料质检',
        route: '/warehouse/inbound-quality-inspections',
        flyout: standardFlyout('来料质检', '/warehouse/inbound-quality-inspections', '新增来料质检', '来料质检列表', '来料质检明细'),
      },
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
      {
        key: 'mfgDemand',
        label: '生产需求',
        route: '/production/production-demands',
        flyout: productionDemandFlyout(),
      },
      {
        key: 'mfgPlan',
        label: '生产计划',
        route: '/production/production-plans',
        flyout: productionListOnlyFlyout('生产计划', '/production/production-plans', '新增生产计划', '生产计划列表', '计划'),
      },
      {
        key: 'mfgOrder',
        label: '生产订单',
        route: '/production/production-orders',
        flyout: productionListOnlyFlyout('生产订单', '/production/production-orders', '新增生产订单', '生产订单列表', '订单'),
      },
      {
        key: 'mfgWorkOrder',
        label: '生产工单',
        route: '/production/production-work-orders',
        flyout: productionWorkOrderFlyout(),
      },
      {
        key: 'mfgSchedule',
        label: '生产排班',
        route: '/production/production-schedules',
        flyout: productionScheduleFlyout(),
      },
      {
        key: 'mfgOutsource',
        label: '委外加工',
        route: '/production/outsource-orders',
        flyout: productionListOnlyFlyout('委外加工', '/production/outsource-orders', '新增委外加工', '委外加工列表', '委外'),
      },
    ],
  },
  {
    key: 'afterSales',
    label: '售后',
    icon: '↩',
    title: '售后中心',
    route: '/after-sales',
    status: 'pending',
    sideItems: [
      jsxSideItem('workbench', '工作台', '/after-sales'),
      {
        key: 'asService',
        label: '售后单',
        route: '/after-sales/services',
        flyout: [
          {
            title: '售后单',
            items: [
              { label: '新增售后', route: '/after-sales/services?action=new' },
              { label: '售后列表', route: '/after-sales/services' },
            ],
          },
          {
            title: '售后设置',
            items: [
              { label: '售后原因', route: actionRoute('/after-sales/services', '售后原因') },
              { label: '投诉问题', route: actionRoute('/after-sales/services', '投诉问题') },
              { label: '售后类型', route: actionRoute('/after-sales/services', '售后类型') },
              { label: '处理方式', route: actionRoute('/after-sales/services', '处理方式') },
            ],
          },
        ],
      },
      {
        key: 'asTask',
        label: '任务管理',
        route: '/after-sales/tasks',
        flyout: [
          {
            title: '任务管理',
            items: [
              { label: '退货入库', route: '/after-sales/tasks?category=退货入库' },
              { label: '换货出库', route: '/after-sales/tasks?category=换货出库' },
              { label: '退款处理', route: '/after-sales/tasks?category=退款处理' },
              { label: '维修派工', route: '/after-sales/tasks?category=维修派工' },
              { label: '现场服务', route: '/after-sales/tasks?category=现场服务' },
            ],
          },
          { title: '任务规则', items: settingEntries('任务', '/after-sales/tasks') },
        ],
      },
      {
        key: 'asQuality',
        label: '质量闭环',
        route: '/after-sales/quality',
        flyout: [
          {
            title: '质量闭环',
            items: [
              { label: '新增质量改进', route: '/after-sales/quality?action=new' },
              { label: '质量改进列表', route: '/after-sales/quality' },
              { label: '问题追踪', route: '/after-sales/quality?stage=CAPA执行' },
              { label: '改善验证', route: '/after-sales/quality?stage=效果验证' },
            ],
          },
          { title: '质改规则', items: settingEntries('质量改进', '/after-sales/quality') },
        ],
      },
    ],
  },
  {
    key: 'qc',
    label: '质检',
    icon: '✓',
    title: '质检中心',
    route: '/qc',
    status: 'pending',
    sideItems: [
      jsxSideItem('workbench', '工作台', '/qc'),
      jsxSideItem('qcDashboard', '质检总览', '/qc/dashboard', [
        { title: '质检总览', items: ['质量看板', '异常记录', '待处理区域', '趋势分析'] },
        { title: '总览规则', items: ['质检自定义字段', '质检自定义编号', '质检审批设置', '质检策略设置', '设置质检打印模板'] },
      ]),
      jsxSideItem('qcIqc', '检验执行', '/qc/execution', [
        { title: '检验执行', items: ['新增检验任务', '检验任务列表', '待检任务', '抽样记录'] },
        { title: '检验阶段', items: ['来料检验 IQC', '过程检验 IPQC', '成品检验 FQC', '出货检验 OQC'] },
      ]),
      jsxSideItem('qcException', '异常与处置', '/qc/exceptions', [
        { title: '异常与处置', items: ['不合格记录', '隔离/拒收', '返工复检', '让步放行', 'CAPA/8D'] },
        { title: '处置规则', items: ['质检审批设置', '质检策略设置', '设置质检打印模板'] },
      ]),
      jsxSideItem('qcPlan', '标准与配置', '/qc/standards', [
        { title: '标准与配置', items: ['新增检验标准', '检验方案', '检验项目', '抽样规则'] },
        { title: '资源授权', items: ['检验组/授权', '缺陷等级', '判定规格', '资质授权'] },
      ]),
      jsxSideItem('qcReport', '质量分析', '/qc/reports', [
        { title: '质量分析', items: ['质量趋势', '不良分析', '供应商质量', '工序质量', '客户质量'] },
        { title: '分析设置', items: ['质检自定义字段', '质检自定义编号', '设置质检打印模板'] },
      ]),
    ],
  },
  {
    key: 'hr',
    label: '人力',
    icon: '人',
    title: '人力中心',
    route: '/hr',
    status: 'pending',
    sideItems: [
      jsxSideItem('workbench', '工作台', '/hr'),
      jsxSideItem('hrEmployee', '员工管理', '/hr/employees', [
        { title: '员工管理', items: ['新增员工', '员工列表', '入职管理', '离职管理', '异动管理'] },
        { title: '员工设置', items: ['员工自定义字段', '员工自定义编号', '员工审批设置', '员工策略设置', '设置员工打印模板'] },
      ]),
      jsxSideItem('hrOrg', '组织机构', '/hr/orgs', [
        { title: '组织机构', items: ['新增组织', '组织列表', '组织架构', '部门编制'] },
        { title: '组织设置', items: ['组织自定义字段', '组织自定义编号', '组织审批设置', '组织策略设置', '设置组织打印模板'] },
      ]),
      jsxSideItem('hrPosition', '岗位管理', '/hr/positions', [
        { title: '岗位管理', items: ['新增岗位', '岗位列表', '岗位说明书', '岗位编制'] },
        { title: '岗位设置', items: ['岗位自定义字段', '岗位自定义编号', '岗位审批设置', '岗位策略设置', '设置岗位打印模板'] },
      ]),
      jsxSideItem('hrAttendance', '考勤管理', '/hr/attendance', [
        { title: '考勤管理', items: ['新增考勤', '考勤列表', '考勤记录', '考勤统计'] },
        { title: '考勤设置', items: ['考勤自定义字段', '考勤自定义编号', '考勤审批设置', '考勤策略设置', '设置考勤打印模板'] },
      ]),
      jsxSideItem('hrSchedule', '排班管理', '/hr/schedules', [
        { title: '排班管理', items: ['新增排班', '排班列表', '班次管理', '考勤组管理', '考勤日历'] },
        { title: '排班设置', items: ['排班自定义字段', '排班自定义编号', '排班审批设置', '排班策略设置', '设置排班打印模板'] },
      ]),
      jsxSideItem('hrPayroll', '薪酬管理', '/hr/payroll', [
        { title: '薪酬管理', items: ['新增薪酬', '工资列表', '工资详情', '薪资方案', '薪酬类型', '薪酬项目'] },
        { title: '薪酬设置', items: ['薪酬自定义字段', '薪酬自定义编号', '薪酬审批设置', '薪酬策略设置', '设置薪酬打印模板'] },
      ]),
      jsxSideItem('hrArchive', '档案管理', '/hr/archives', [
        { title: '档案管理', items: ['新增档案', '档案列表', '合同档案', '证件档案'] },
        { title: '档案设置', items: ['档案自定义字段', '档案自定义编号', '档案审批设置', '档案策略设置', '设置档案打印模板'] },
      ]),
      jsxSideItem('hrOffice', '人事办公', '/hr/office', [
        { title: '办公申请', items: ['新增办公申请', '申请列表'] },
        { title: '通知协同', items: ['发布公告', '公告列表', '预约会议', '会议列表', '个人日程', '团队日程'] },
        { title: '办公设置', items: ['人事办公自定义字段', '人事办公自定义编号', '人事办公审批设置', '人事办公策略设置', '会议室管理', '工作日历'] },
      ]),
    ],
  },
  {
    key: 'finance',
    label: '财务',
    icon: '¥',
    title: '财务中心',
    route: '/finance',
    status: 'pending',
    sideItems: [
      jsxSideItem('workbench', '工作台', '/finance'),
      jsxSideItem('financeAr', '应收管理', '/finance/ar', [
        { title: '应收管理', items: ['新增应收', '应收列表', '收款登记', '客户对账'] },
        { title: '应收设置', items: ['应收自定义字段', '应收自定义编号', '应收审批设置', '应收策略设置', '设置应收打印模板'] },
      ]),
      jsxSideItem('financeAp', '应付管理', '/finance/ap', [
        { title: '应付管理', items: ['新增应付', '应付列表', '付款申请', '供应商对账'] },
        { title: '应付设置', items: ['应付自定义字段', '应付自定义编号', '应付审批设置', '应付策略设置', '设置应付打印模板'] },
      ]),
      jsxSideItem('financeInvoice', '发票管理', '/finance/invoices', [
        { title: '发票管理', items: ['新增发票', '发票列表', '开票管理', '收票认证'] },
        { title: '发票设置', items: ['发票自定义字段', '发票自定义编号', '发票审批设置', '发票策略设置', '设置发票打印模板'] },
      ]),
      jsxSideItem('financeFund', '资金管理', '/finance/funds', [
        { title: '资金管理', items: ['新增资金流水', '资金流水列表', '账户余额', '资金调拨'] },
        { title: '资金设置', items: ['资金自定义字段', '资金自定义编号', '资金审批设置', '资金策略设置', '设置资金打印模板'] },
      ]),
      jsxSideItem('financeExpense', '费用报销', '/finance/expenses', [
        { title: '费用报销', items: ['新增报销', '报销列表', '费用付款', '费用统计'] },
        { title: '费用设置', items: ['费用自定义字段', '费用自定义编号', '费用审批设置', '费用策略设置', '设置费用打印模板'] },
      ]),
      jsxSideItem('financeCost', '成本核算', '/finance/costs', [
        { title: '成本核算', items: ['新增核算单', '核算列表', '成本分摊', '成本分析'] },
        { title: '成本设置', items: ['成本自定义字段', '成本自定义编号', '成本审批设置', '成本策略设置', '设置成本打印模板'] },
      ]),
      jsxSideItem('financeVoucher', '凭证管理', '/finance/vouchers', [
        { title: '凭证管理', items: ['新增凭证', '凭证列表', '凭证审核', '期末结账'] },
        { title: '凭证设置', items: ['凭证自定义字段', '凭证自定义编号', '凭证审批设置', '凭证策略设置', '设置凭证打印模板'] },
      ]),
      jsxSideItem('financeReport', '财务报表', '/finance/reports', [
        { title: '财务报表', items: ['新增报表', '报表列表', '资产负债表', '利润表', '现金流量表'] },
        { title: '报表设置', items: ['财务报表自定义字段', '财务报表自定义编号', '财务报表审批设置', '财务报表策略设置', '设置财务报表打印模板'] },
      ]),
    ],
  },
  {
    key: 'equipment',
    label: '设备',
    icon: '▣',
    title: '设备中心',
    route: '/equipment',
    status: 'pending',
    sideItems: [
      jsxSideItem('workbench', '工作台', '/equipment'),
      jsxSideItem('asset', '设备台账', '/equipment/assets', [
        { title: '设备台账', items: ['设备档案', '设备分类', '设备状态'] },
        { title: '台账设置', items: ['设备编号', '设备分类', '资产标签'] },
      ]),
      jsxSideItem('maintain', '保养计划', '/equipment/maintenance', [
        { title: '保养计划', items: ['保养计划', '保养执行', '保养预警'] },
        { title: '保养设置', items: ['保养标准', '保养周期', '审批流程'] },
      ]),
      jsxSideItem('repair', '维修记录', '/equipment/repairs', [
        { title: '维修记录', items: ['报修申请', '维修派工', '维修验收'] },
        { title: '维修设置', items: ['故障分类', '维修等级', '审批流程'] },
      ]),
      jsxSideItem('inspect', '点检记录', '/equipment/inspections', [
        { title: '点检记录', items: ['点检计划', '点检执行', '点检异常'] },
        { title: '点检设置', items: ['点检标准', '点检周期'] },
      ]),
      jsxSideItem('spare', '备件管理', '/equipment/spares', [
        { title: '备件管理', items: ['备件库存', '备件申请', '备件采购'] },
        { title: '备件设置', items: ['安全库存', '备件分类'] },
      ]),
    ],
  },
  {
    key: 'energy',
    label: '能耗',
    icon: '⚡',
    title: '能耗中心',
    route: '/energy',
    status: 'pending',
    sideItems: [
      jsxSideItem('workbench', '工作台', '/energy'),
      jsxSideItem('monitor', '能耗监测', '/energy/monitor', [
        { title: '能耗监测', items: ['实时监测', '异常告警', '设备能耗'] },
        { title: '监测设置', items: ['采集点管理', '告警阈值', '监测频率'] },
      ]),
      jsxSideItem('analysis', '能耗分析', '/energy/analysis', [
        { title: '能耗分析', items: ['趋势分析', '对比分析', '成本分析'] },
        { title: '分析设置', items: ['分析维度', '基准设置', '分析周期'] },
      ]),
      jsxSideItem('report', '能耗报表', '/energy/reports', [
        { title: '能耗报表', items: ['日报', '月报', '年报', '自定义报表'] },
        { title: '报表设置', items: ['报表模板', '报送设置'] },
      ]),
      jsxSideItem('save', '节能措施', '/energy/saving', [
        { title: '节能措施', items: ['措施方案', '措施执行', '效果评估'] },
        { title: '措施设置', items: ['措施分类', '目标设定'] },
      ]),
      jsxSideItem('carbon', '碳排放', '/energy/carbon', [
        { title: '碳排放', items: ['排放核算', '排放报告', '减排目标'] },
        { title: '碳设置', items: ['核算标准', '排放因子'] },
      ]),
    ],
  },
  {
    key: 'set',
    label: '设置',
    icon: '⚙',
    title: '设置中心',
    route: '/settings',
    status: 'pending',
    sideItems: [
      jsxSideItem('workbench', '工作台', '/settings'),
      jsxSideItem('system', '系统基础', '/settings/system', [
        { title: '系统基础', items: ['基础信息', '系统参数', '界面配置'] },
        { title: '运维审计', items: ['系统日志', '数据备份', '版本管理'] },
      ]),
      jsxSideItem('business', '业务参数', '/settings/business', [
        { title: '财务基础参数', items: ['多币种配置', '汇率规则', '税率配置', '会计期间'] },
        { title: '价格与精度', items: ['价格精度', '金额精度'] },
      ]),
      jsxSideItem('user', '用户管理', '/settings/users', [
        { title: '用户管理', items: ['用户列表', '新增用户', '部门管理'] },
        { title: '用户设置', items: ['密码策略', '登录设置'] },
      ]),
      jsxSideItem('role', '角色权限', '/settings/roles', [
        { title: '角色权限', items: ['角色管理', '权限分配', '数据权限'] },
        { title: '权限设置', items: ['菜单权限', '操作权限', '字段权限'] },
      ]),
      jsxSideItem('dict', '基础数据', '/settings/dicts', [
        { title: '基础数据', items: ['字典管理', '字典项管理'] },
        { title: '字典设置', items: ['字典分类'] },
      ]),
      jsxSideItem('code', '编码规则', '/settings/codes', [
        { title: '编码规则', items: ['规则管理', '编码预览'] },
        { title: '规则设置', items: ['规则模板', '流水号设置'] },
      ]),
      jsxSideItem('approval', '审批流程', '/settings/approvals', [
        { title: '审批流程', items: ['流程管理', '节点配置', '审批策略'] },
        { title: '流程设置', items: ['流程模板', '条件设置', '通知设置'] },
      ]),
      jsxSideItem('guide', '初始化引导', '/settings/guide', [
        { title: '模块引导', items: ['引导总览', '配置任务', '引导模板', '进度校验'] },
        { title: '引导设置', items: ['新增引导', '发布校验', '操作记录'] },
      ]),
    ],
  },
];

export function getCenterByPath(path: string) {
  return topNavItems.find((item) => path === item.route || path.startsWith(`${item.route}/`)) || topNavItems[3];
}

export function getSideByPath(path: string, center = getCenterByPath(path)) {
  return [...center.sideItems]
    .sort((a, b) => b.route.length - a.route.length)
    .find((item) => path === item.route || path.startsWith(`${item.route}/`)) || center.sideItems[0];
}
