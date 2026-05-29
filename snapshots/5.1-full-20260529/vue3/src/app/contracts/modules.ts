export interface ContractResource {
  title: string;
  path: string;
  apiPath: string;
  status: '完整' | '较完整' | '部分' | '预留';
  prototype: string;
  description: string;
}

export interface ContractCenter {
  key: string;
  title: string;
  basePath: string;
  resources: ContractResource[];
}

export const contractCenters: ContractCenter[] = [
  {
    key: 'rd',
    title: '研发中心',
    basePath: '/rd',
    resources: [
      { title: '文档库', path: '/rd/doc', apiPath: '/rd-documents', status: '较完整', prototype: 'doc-list.jsx', description: '研发文档、分类、制度、表格和版本记录' },
      { title: '项目管理', path: '/rd/projects', apiPath: '/rd-projects', status: '较完整', prototype: 'project-list.jsx', description: '研发项目、阶段、成员、任务和评审' },
      { title: '产品管理', path: '/rd/products', apiPath: '/rd-products', status: '较完整', prototype: 'product-list.jsx', description: '产品档案、规格型号、版本和研发状态' },
      { title: '物料管理', path: '/rd/materials', apiPath: '/rd-materials', status: '较完整', prototype: 'material-list.jsx', description: '物料档案、规格属性、替代料和使用范围' },
      { title: '工序管理', path: '/rd/processes', apiPath: '/rd-processes', status: '较完整', prototype: 'process-list.jsx', description: '工序档案、工序参数、质检点和资源要求' },
      { title: '工艺管理', path: '/rd/crafts', apiPath: '/rd-crafts', status: '较完整', prototype: 'craft-list.jsx', description: '工艺路线、工艺版本、工序明细和发布记录' },
      { title: 'BOM管理', path: '/rd/bom', apiPath: '/rd-boms', status: '较完整', prototype: 'bom-new-screen.jsx', description: 'BOM结构、版本、替代料、损耗和发布' },
    ],
  },
  {
    key: 'sales',
    title: '销售中心',
    basePath: '/sales',
    resources: [
      { title: '客户管理', path: '/sales/customers', apiPath: '/customers', status: '完整', prototype: 'customer-list.jsx', description: '客户档案、联系人、地址、开票、信用额度' },
      { title: '销售计划', path: '/sales/sales-plans', apiPath: '/sales-plans', status: '完整', prototype: 'sales-plan-list.jsx', description: '销售目标、计划周期、达成率' },
      { title: '报价管理', path: '/sales/sales-quotes', apiPath: '/sales-quotes', status: '完整', prototype: 'quote-list.jsx', description: '报价单、价格版本、转化记录' },
      { title: '合同管理', path: '/sales/sales-contracts', apiPath: '/sales-contracts', status: '完整', prototype: 'contract-list.jsx', description: '合同、履约、订单核销、开票回款' },
      { title: '订单管理', path: '/sales/sales-orders', apiPath: '/sales-orders', status: '完整', prototype: 'sale-order-list.jsx', description: '销售订单、发货、生产、应收、回款' },
      { title: '销售退货', path: '/sales/sales-returns', apiPath: '/sales-returns', status: '预留', prototype: '导航预留', description: '退货单与退货明细' },
      { title: '销售换货', path: '/sales/sales-exchanges', apiPath: '/sales-exchanges', status: '预留', prototype: '导航预留', description: '换货单与换货明细' },
      { title: '销售报表', path: '/sales/sales-reports', apiPath: '/sales-reports', status: '预留', prototype: '导航预留', description: '按客户、产品、退换货统计' },
    ],
  },
  {
    key: 'purchase',
    title: '采购中心',
    basePath: '/purchase',
    resources: [
      { title: '供应商管理', path: '/purchase/suppliers', apiPath: '/suppliers', status: '较完整', prototype: 'supplier-list.jsx', description: '供应商档案、联系人、地址、财务、供货产品' },
      { title: '请购管理', path: '/purchase/purchase-requests', apiPath: '/purchase-requests', status: '较完整', prototype: 'pr-list.jsx', description: '请购单、请购明细、转询价、转采购' },
      { title: '询价管理', path: '/purchase/purchase-inquiries', apiPath: '/purchase-inquiries', status: '较完整', prototype: 'inquiry-list.jsx', description: '询价单、供应商报价、定价、临时供应商' },
      { title: '采购订单', path: '/purchase/purchase-orders', apiPath: '/purchase-orders', status: '较完整', prototype: 'order-list.jsx', description: '采购订单、到货、入库、付款、三单匹配' },
      { title: '采购退货', path: '/purchase/purchase-returns', apiPath: '/purchase-returns', status: '预留', prototype: '导航预留', description: '退货单与退货明细' },
      { title: '采购换货', path: '/purchase/purchase-exchanges', apiPath: '/purchase-exchanges', status: '预留', prototype: '导航预留', description: '换货单与换货明细' },
      { title: '采购报表', path: '/purchase/purchase-reports', apiPath: '/purchase-reports', status: '预留', prototype: '导航预留', description: '供应商对账、按产品统计' },
    ],
  },
  {
    key: 'warehouse',
    title: '仓储中心',
    basePath: '/warehouse',
    resources: [
      { title: '库存管理', path: '/warehouse/inventory-stocks', apiPath: '/inventory-stocks', status: '完整', prototype: 'warehouse-stock-list.jsx', description: '库存列表、库存明细、库存调整、库存流水' },
      { title: '入库管理', path: '/warehouse/warehouse-inbounds', apiPath: '/warehouse-inbounds', status: '完整', prototype: 'warehouse-inbound-list.jsx', description: '直接入库、采购入库、生产入库、销售退货入库' },
      { title: '出库管理', path: '/warehouse/warehouse-outbounds', apiPath: '/warehouse-outbounds', status: '完整', prototype: 'warehouse-outbound-list.jsx', description: '直接出库、内部领用、委外领料、销售出库' },
      { title: '调拨管理', path: '/warehouse/warehouse-transfers', apiPath: '/warehouse-transfers', status: '完整', prototype: 'warehouse-transfer-list.jsx', description: '新增调拨、调拨列表、调拨明细' },
      { title: '盘点管理', path: '/warehouse/inventory-counts', apiPath: '/inventory-counts', status: '完整', prototype: 'warehouse-inventory-list.jsx', description: '盘点计划、盘点单、差异调整' },
      { title: '仓库库位', path: '/warehouse/warehouse-locations', apiPath: '/warehouse-locations', status: '部分', prototype: '仓储库位屏', description: '仓库、库区、库位维护' },
      { title: '出库质检', path: '/warehouse/outbound-quality-inspections', apiPath: '/warehouse-quality-inspections', status: '预留', prototype: '导航预留', description: '出库质检任务' },
      { title: '来料质检', path: '/warehouse/inbound-quality-inspections', apiPath: '/warehouse-quality-inspections', status: '预留', prototype: '导航预留', description: '来料质检任务' },
    ],
  },
  {
    key: 'production',
    title: '生产中心',
    basePath: '/production',
    resources: [
      { title: '生产需求', path: '/production/production-demands', apiPath: '/production-demands', status: '完整', prototype: 'manufacturing-list.jsx', description: '需求来源、产品、数量、交付日期' },
      { title: '生产计划', path: '/production/production-plans', apiPath: '/production-plans', status: '完整', prototype: 'manufacturing-list.jsx', description: '计划周期、齐套、排产、审批' },
      { title: '生产订单', path: '/production/production-orders', apiPath: '/production-orders', status: '完整', prototype: 'manufacturing-list.jsx', description: '生产数量、BOM/工艺锁版、车间产线' },
      { title: '生产工单', path: '/production/production-work-orders', apiPath: '/production-work-orders', status: '完整', prototype: 'manufacturing-list.jsx', description: '工序、派工、报工、质检节点' },
      { title: '生产排班', path: '/production/production-schedules', apiPath: '/production-schedules', status: '完整', prototype: 'manufacturing-list.jsx', description: '班组、班次、日历、冲突校验' },
      { title: '委外加工', path: '/production/outsource-orders', apiPath: '/outsource-orders', status: '完整', prototype: 'manufacturing-list.jsx', description: '委外发料、收货、质检、入库' },
    ],
  },
];

export function findContractResource(path: string) {
  for (const center of contractCenters) {
    const resource = center.resources.find((item) => item.path === path);
    if (resource) return { center, resource };
  }

  return undefined;
}
