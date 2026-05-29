import type {
  ApprovalMethod,
  ApprovalNode,
  CodeRuleCandidate,
  FieldSettingRow,
  FieldSettingScope,
  SettingTableColumn,
  SettingTableRow,
  StrategyTab,
} from '@/components/setting-page/types';

export type PurchaseSettingModule = 'suppliers' | 'requests' | 'inquiries' | 'orders';
export type PurchaseSettingType = 'groups' | 'levels' | 'fields' | 'numbers' | 'approvals' | 'strategies' | 'print';

export interface ApprovalRuleRow extends SettingTableRow {
  name: string;
  category: string;
  nodes: ApprovalNode[];
  owner: string;
  updatedAt: string;
  enabled: boolean;
}

export interface PrintTemplateRow extends SettingTableRow {
  name: string;
  scene: string;
  paper: string;
  status: string;
  updatedAt: string;
}

export interface ExtraSettingList {
  addText: string;
  title: string;
  description: string;
  searchPlaceholder: string;
  columns: SettingTableColumn[];
  rows: SettingTableRow[];
}

export interface PurchaseSettingTemplate {
  module: PurchaseSettingModule;
  title: string;
  backText: string;
  backRoute: string;
  typeTitles: Record<PurchaseSettingType, string>;
  extraLists?: Partial<Record<'groups' | 'levels', ExtraSettingList>>;
  fields: {
    addText: string;
    scopes: FieldSettingScope[];
    rows: FieldSettingRow[];
  };
  numbers: {
    prefix: string;
    separator: string;
    selected: string[];
    candidates: CodeRuleCandidate[];
  };
  approvals: {
    addText: string;
    methods: ApprovalMethod[];
    rows: ApprovalRuleRow[];
  };
  strategies: {
    title: string;
    description: string;
    tabs: StrategyTab[];
  };
  print: {
    addText: string;
    columns: SettingTableColumn[];
    rows: PrintTemplateRow[];
  };
}

export const purchaseNumberCandidates: CodeRuleCandidate[] = [
  { key: 'prefix', label: '前缀', preview: 'AA', fixed: true },
  { key: 'y4', label: '年（4位）', preview: '2025', group: 'year' },
  { key: 'y2', label: '年（2位）', preview: '25', group: 'year' },
  { key: 'm', label: '月（2位）', preview: '05' },
  { key: 'd', label: '日（2位）', preview: '15' },
  { key: 's3', label: '流水号（3位）', preview: '001', group: 'seq' },
  { key: 's1', label: '流水号（1位）', preview: '1', group: 'seq' },
  { key: 'cc1', label: '自定义代码1', preview: 'C1', editable: true },
  { key: 'cc2', label: '自定义代码2', preview: 'C2', editable: true },
];

export const purchaseApprovalMethods: ApprovalMethod[] = [
  { value: '依次审批', desc: '按先后顺序，一人同意才流转到下一人' },
  { value: '会签', desc: '所选人员必须全部审批后进入下一节点' },
  { value: '或签', desc: '选中的人里只要有一人同意即可' },
];

const typeTitles = (name: string, extras: Partial<Record<'groups' | 'levels', string>> = {}): Record<PurchaseSettingType, string> => ({
  groups: extras.groups || `${name}分组设置`,
  levels: extras.levels || `${name}等级设置`,
  fields: `${name}自定义字段`,
  numbers: `${name}自定义编号`,
  approvals: `${name}审批设置`,
  strategies: `${name}策略设置`,
  print: `设置${name}打印模板`,
});

function fieldRows(prefix: string, base: Array<[string, string, string, string, boolean]>): FieldSettingRow[] {
  return base.map(([name, code, type, scope, required], index) => ({
    id: `${prefix}_field_${index + 1}`,
    name,
    code,
    type,
    scope,
    required,
    enabled: true,
  }));
}

function approvalRows(prefix: string, rows: Array<[string, string, string]>): ApprovalRuleRow[] {
  return rows.map(([name, category, owner], index) => ({
    id: `${prefix}_approval_${index + 1}`,
    name,
    category,
    nodes: [
      { name: '一级审批', approvers: [owner], method: '依次审批' },
      { name: '财务/采购复核', approvers: ['老大'], method: '会签' },
    ],
    owner,
    updatedAt: '2026-05-27',
    enabled: true,
  }));
}

function printRows(prefix: string, name: string): PrintTemplateRow[] {
  return [
    { id: `${prefix}_print_1`, name: `${name}标准打印模板`, scene: '新增/详情打印', paper: 'A4 纵向', status: '启用', updatedAt: '2026-05-27' },
    { id: `${prefix}_print_2`, name: `${name}审批留痕模板`, scene: '审批完成后打印', paper: 'A4 横向', status: '启用', updatedAt: '2026-05-27' },
  ];
}

const supplierStrategies: StrategyTab[] = [
  {
    key: 'archive',
    label: '准入与转正',
    rows: [
      { key: 'supplierType', title: '供应商类型控制', sub: '新增供应商区分正式供应商和临时供应商；临时供应商可由询价新增并带出来源单据。', type: 'select', value: '正式/临时', options: ['正式/临时', '仅正式供应商', '允许询价临时供应商'] },
      { key: 'submitApproval', title: '供应商提交审核', sub: '新增供应商保存后提交审批，待审核、已审核、已停用和临时状态按审批与停用动作推进。', type: 'switch', enabled: true },
      { key: 'tempConvert', title: '临时供应商转正', sub: '非建档供应商进入供应商库临时供应商，转正后才可设为物料主供应商或长期默认供应商。', type: 'switch', enabled: true },
    ],
  },
  {
    key: 'profile',
    label: '档案维护',
    rows: [
      { key: 'defaultContact', title: '默认联系人/地址/账户', sub: '联系人、收款账户、地址均可维护多条，并指定默认记录。', type: 'switch', enabled: true },
      { key: 'supplyProducts', title: '供货产品维护', sub: '从产品列表选择后自动填充供应产品记录，维护供货单位和换算比例。', type: 'switch', enabled: true },
      { key: 'paymentTerm', title: '付款账期', sub: '财务结算按现付、月结、周期结算或授信规则维护，供采购订单带入。', type: 'select', value: '月结30天', options: ['现付', '月结30天', '月结45天', '周期结算', '授信'] },
    ],
  },
];

const requestStrategies: StrategyTab[] = [
  {
    key: 'flow',
    label: '流程推进',
    rows: [
      { key: 'requestSource', title: '请购来源', sub: '原请购页支持项目请购、生产缺料、库存补货、研发试制和 MRP 建议。', type: 'select', value: '项目请购', options: ['项目请购', '生产缺料', '库存补货', '研发试制', 'MRP建议'] },
      { key: 'defaultDraft', title: '新建默认待提交', sub: '审批中、已批准、待询价、已转询价、已转采购、部分采购和关闭由审批、转询价、转采购等动作推进。', type: 'switch', enabled: true },
      { key: 'splitOrder', title: '按供应商自动拆单', sub: '转采购生成前可调整数量、日期和供应商，生成后按供应商拆分采购订单。', type: 'switch', enabled: true },
    ],
  },
  {
    key: 'quotePurchase',
    label: '询价与采购',
    rows: [
      { key: 'forceQuote', title: '强制询价', sub: '明细行可标记是否强制询价；强制询价需完成询价/定价后下单。', type: 'switch', enabled: true },
      { key: 'skipReason', title: '跳过询价原因', sub: '已有有效报价、低金额快速采购或长期协议价可作为跳过询价原因保留。', type: 'switch', enabled: true },
      { key: 'writeback', title: '回写已询价/已采购数量', sub: '转询价和转采购后回写请购明细，待采购数量随采购生成减少。', type: 'switch', enabled: true },
    ],
  },
];

const inquiryStrategies: StrategyTab[] = [
  {
    key: 'source',
    label: '来源与供应商',
    rows: [
      { key: 'sourceType', title: '询价来源', sub: '原询价页可从请购明细、采购计划、库存补货选择来源，也允许手动输入询价主题。', type: 'select', value: '请购明细', options: ['请购明细', '采购计划', '库存补货', '手动输入'] },
      { key: 'formalSupplier', title: '带出正式供应商', sub: '选择来源或产品后，从供应商档案带出可询价正式供应商。', type: 'switch', enabled: true },
      { key: 'tempSupplier', title: '允许新增临时供应商', sub: '新增非建档供应商会进入供应商库临时供应商，转正后才可作为主供应商。', type: 'switch', enabled: true },
    ],
  },
  {
    key: 'pricing',
    label: '报价与定价',
    rows: [
      { key: 'quoteDeadline', title: '报价截止日期', sub: '供应商需在截止日期前反馈含税价、交期和最小采购量。', type: 'switch', enabled: true },
      { key: 'quoteFields', title: '报价字段', sub: '供应商报价保留报价版本、单价、是否含税、折扣、金额、税额、交货期和最小采购量。', type: 'switch', enabled: true },
      { key: 'pricingStatus', title: '定价后转采购', sub: '完成定价后保存来源明细、供应商类型、报价版本和采购生成状态。', type: 'switch', enabled: true },
    ],
  },
];

const orderStrategies: StrategyTab[] = [
  {
    key: 'source',
    label: '来源与采购',
    rows: [
      { key: 'orderSource', title: '采购来源控制', sub: '可从请购、询价定价、MRP采购建议带入明细；若策略配置禁止手动采购，则必须选择来源。', type: 'select', value: '请购/询价/MRP/手动', options: ['请购/询价/MRP/手动', '禁止手动采购', '仅询价定价来源'] },
      { key: 'supplierProducts', title: '供应商供货产品选择', sub: '选择供应商后，从该供应商供货产品中选择采购明细。', type: 'switch', enabled: true },
      { key: 'supplierChangeApproval', title: '更换供应商触发审核', sub: '更换供应商需要填写更换理由，并触发审核流程。', type: 'switch', enabled: true },
    ],
  },
  {
    key: 'financeInbound',
    label: '入库与财务',
    rows: [
      { key: 'statusFlow', title: '采购状态自动推进', sub: '新建采购订单默认审核中；采购中、运输中、待入库、部分入库、已完成由审批、到货、入库、三单匹配等动作推进。', type: 'switch', enabled: true },
      { key: 'sourceWriteback', title: '回写来源明细', sub: '来源明细用于回写请购/询价的已采购数量，待采购数量=来源需求数量-已采购数量。', type: 'switch', enabled: true },
      { key: 'threeMatch', title: '三单匹配与暂估应付', sub: '按采购单、入库单、发票进行三单匹配，差异进入质检扣款或差异待审。', type: 'switch', enabled: true },
      { key: 'paymentInvoice', title: '付款与到票记录', sub: '付款申请、到票认证、可付款金额和质检扣款在订单详情中追踪。', type: 'switch', enabled: true },
    ],
  },
];

export const purchaseSettingTemplates: Record<PurchaseSettingModule, PurchaseSettingTemplate> = {
  suppliers: {
    module: 'suppliers',
    title: '供应商设置',
    backText: '返回供应商列表',
    backRoute: '/purchase/suppliers',
    typeTitles: typeTitles('供应商', { groups: '供应商分组设置', levels: '供应商等级设置' }),
    extraLists: {
      groups: {
        addText: '新增供应商分组',
        title: '供应商分组设置',
        description: '按原供应商库分类树维护供应商大类和细分类。',
        searchPlaceholder: '搜索供应商分组/细分类',
        columns: [
          { key: 'name', label: '分组名称' },
          { key: 'parent', label: '上级分组' },
          { key: 'code', label: '分组编码' },
          { key: 'count', label: '供应商数量' },
          { key: 'enabled', label: '状态' },
        ],
        rows: [
          { id: 'supplier_group_raw', name: '原材料供应商', parent: '供应商库', code: 'raw', count: 42, enabled: '启用' },
          { id: 'supplier_group_part', name: '零部件供应商', parent: '供应商库', code: 'part', count: 36, enabled: '启用' },
          { id: 'supplier_group_pkg', name: '包装供应商', parent: '供应商库', code: 'pkg', count: 24, enabled: '启用' },
          { id: 'supplier_group_svc', name: '服务供应商', parent: '供应商库', code: 'svc', count: 18, enabled: '启用' },
          { id: 'supplier_group_temp', name: '临时供应商', parent: '供应商库', code: 'temp', count: 6, enabled: '启用' },
        ],
      },
      levels: {
        addText: '新增供应商等级',
        title: '供应商等级设置',
        description: '用于供应商选择、询价定价和采购下单时的优先级参考。',
        searchPlaceholder: '搜索等级名称',
        columns: [
          { key: 'name', label: '等级名称' },
          { key: 'priority', label: '优先级' },
          { key: 'description', label: '说明' },
          { key: 'enabled', label: '状态' },
        ],
        rows: [
          { id: 'supplier_level_a', name: 'A', priority: 1, description: '优先询价与采购，质量与交期稳定。', enabled: '启用' },
          { id: 'supplier_level_b', name: 'B', priority: 2, description: '可作为备选供应商参与比价。', enabled: '启用' },
          { id: 'supplier_level_temp', name: '临时', priority: 9, description: '询价新增，转正后可设为默认供应商。', enabled: '启用' },
        ],
      },
    },
    fields: {
      addText: '新增供应商字段',
      scopes: [
        { key: 'basic', label: '基础信息' },
        { key: 'contact', label: '联系人/地址' },
        { key: 'finance', label: '财务结算' },
        { key: 'product', label: '供货产品' },
      ],
      rows: fieldRows('supplier', [
        ['供应商名称', 'name', '文本', 'basic', true],
        ['供应商编号', 'code', '自动编号', 'basic', true],
        ['供应商分类', 'type', '下拉选项', 'basic', true],
        ['供应商类型', 'supplier_kind', '下拉选项', 'basic', true],
        ['来源单据', 'source_bill', '关联单据', 'basic', false],
        ['主联系人', 'contact_name', '文本', 'contact', true],
        ['联系方式', 'contact_phone', '文本', 'contact', true],
        ['付款账期', 'settlement_method', '下拉选项', 'finance', false],
        ['供货产品', 'supply_products', '子表', 'product', false],
      ]),
    },
    numbers: { prefix: 'SUP', separator: '-', selected: ['y4', 's3'], candidates: purchaseNumberCandidates },
    approvals: { addText: '新增供应商审批规则', methods: purchaseApprovalMethods, rows: approvalRows('supplier', [['供应商准入审批', '新增供应商', '老大'], ['临时供应商转正审批', '询价新增供应商', '李文涛']]) },
    strategies: { title: '供应商策略设置', description: '按原供应商页面配置准入、临时转正、联系人/账户/地址默认值和供货产品维护。', tabs: supplierStrategies },
    print: { addText: '新增供应商打印模板', columns: [], rows: printRows('supplier', '供应商') },
  },
  requests: {
    module: 'requests',
    title: '请购设置',
    backText: '返回请购列表',
    backRoute: '/purchase/purchase-requests',
    typeTitles: typeTitles('请购'),
    fields: {
      addText: '新增请购字段',
      scopes: [
        { key: 'basic', label: '基础信息' },
        { key: 'detail', label: '请购明细' },
        { key: 'flow', label: '转单追踪' },
      ],
      rows: fieldRows('request', [
        ['请购主题', 'title', '文本', 'basic', true],
        ['请购编号', 'code', '自动编号', 'basic', true],
        ['请购来源', 'source_type', '下拉选项', 'basic', true],
        ['关联单据', 'source_code', '关联单据', 'basic', false],
        ['申请部门', 'department_name', '文本', 'basic', false],
        ['申请人', 'applicant_name', '人员选择', 'basic', true],
        ['需求日期', 'required_date', '日期', 'basic', false],
        ['请购明细', 'request_lines', '子表', 'detail', true],
        ['建议供应商', 'suggested_supplier', '供应商选择', 'detail', false],
        ['预算金额', 'budget_amount', '金额', 'detail', false],
        ['转询价状态', 'inquiry_status', '状态', 'flow', false],
        ['转采购状态', 'purchase_status', '状态', 'flow', false],
      ]),
    },
    numbers: { prefix: 'PR', separator: '-', selected: ['y4', 's3'], candidates: purchaseNumberCandidates },
    approvals: { addText: '新增请购审批规则', methods: purchaseApprovalMethods, rows: approvalRows('request', [['请购提交审批', '新增请购', '李文涛'], ['请购转采购审批', '直接转采购', '陈思源']]) },
    strategies: { title: '请购策略设置', description: '按原请购页面配置来源、审批推进、强制询价、跳过询价原因和转单回写。', tabs: requestStrategies },
    print: { addText: '新增请购打印模板', columns: [], rows: printRows('request', '请购') },
  },
  inquiries: {
    module: 'inquiries',
    title: '询价设置',
    backText: '返回询价列表',
    backRoute: '/purchase/purchase-inquiries',
    typeTitles: typeTitles('询价'),
    fields: {
      addText: '新增询价字段',
      scopes: [
        { key: 'basic', label: '基础信息' },
        { key: 'detail', label: '询价明细' },
        { key: 'quote', label: '供应商报价' },
        { key: 'pricing', label: '定价结果' },
      ],
      rows: fieldRows('inquiry', [
        ['询价主题', 'title', '文本', 'basic', true],
        ['询价编号', 'code', '自动编号', 'basic', true],
        ['来源单据', 'source_code', '关联单据', 'basic', false],
        ['报价截止日期', 'quote_deadline', '日期', 'basic', false],
        ['询价明细', 'inquiry_lines', '子表', 'detail', true],
        ['供应商范围', 'supplier_scope', '供应商选择', 'quote', true],
        ['报价版本', 'quote_version', '文本', 'quote', false],
        ['是否含税', 'tax_included', '下拉选项', 'quote', false],
        ['最小采购量', 'min_purchase_qty', '数字', 'quote', false],
        ['定价状态', 'pricing_status', '状态', 'pricing', false],
        ['采购生成状态', 'purchase_create_status', '状态', 'pricing', false],
      ]),
    },
    numbers: { prefix: 'INQ', separator: '-', selected: ['y4', 's3'], candidates: purchaseNumberCandidates },
    approvals: { addText: '新增询价审批规则', methods: purchaseApprovalMethods, rows: approvalRows('inquiry', [['询价发起审批', '发起询价', '李文涛'], ['定价结果审批', '询价定价', '老大']]) },
    strategies: { title: '询价策略设置', description: '按原询价页面配置来源、正式/临时供应商、报价字段、截止日期、定价和转采购。', tabs: inquiryStrategies },
    print: { addText: '新增询价打印模板', columns: [], rows: printRows('inquiry', '询价') },
  },
  orders: {
    module: 'orders',
    title: '采购订单设置',
    backText: '返回采购订单列表',
    backRoute: '/purchase/purchase-orders',
    typeTitles: typeTitles('采购订单'),
    fields: {
      addText: '新增采购订单字段',
      scopes: [
        { key: 'basic', label: '基础信息' },
        { key: 'detail', label: '采购明细' },
        { key: 'inbound', label: '入库/三单匹配' },
        { key: 'finance', label: '付款/到票' },
      ],
      rows: fieldRows('order', [
        ['采购主题', 'title', '文本', 'basic', true],
        ['采购订单号', 'code', '自动编号', 'basic', true],
        ['来源单据', 'source_code', '关联单据', 'basic', false],
        ['供应商', 'supplier_name', '供应商选择', 'basic', true],
        ['采购日期', 'order_date', '日期', 'basic', true],
        ['预计到货', 'delivery_date', '日期', 'basic', false],
        ['采购状态', 'status', '状态', 'basic', false],
        ['采购明细', 'order_lines', '子表', 'detail', true],
        ['含税单价', 'tax_price', '金额', 'detail', false],
        ['税率', 'tax_rate', '数字', 'detail', false],
        ['入库状态', 'inbound_status', '状态', 'inbound', false],
        ['三单匹配', 'match_status', '状态', 'inbound', false],
        ['付款状态', 'payment_status', '状态', 'finance', false],
        ['到票状态', 'invoice_status', '状态', 'finance', false],
        ['可付款金额', 'payable_amount', '金额', 'finance', false],
      ]),
    },
    numbers: { prefix: 'PO', separator: '-', selected: ['y4', 's3'], candidates: purchaseNumberCandidates },
    approvals: { addText: '新增采购订单审批规则', methods: purchaseApprovalMethods, rows: approvalRows('purchase_order', [['采购订单提交审批', '新增采购订单', '李文涛'], ['供应商更换审批', '更换供应商', '老大']]) },
    strategies: { title: '采购订单策略设置', description: '按原采购订单页面配置采购来源、供应商更换、来源回写、三单匹配、暂估应付、付款和到票。', tabs: orderStrategies },
    print: { addText: '新增采购订单打印模板', columns: [], rows: printRows('purchase_order', '采购订单') },
  },
};
