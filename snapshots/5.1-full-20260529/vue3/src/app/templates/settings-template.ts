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

export type SalesSettingModule = 'plans' | 'quotes' | 'contracts' | 'orders';
export type SalesSettingType = 'fields' | 'numbers' | 'approvals' | 'strategies' | 'print';

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

export interface SalesSettingTemplate {
  module: SalesSettingModule;
  title: string;
  backText: string;
  backRoute: string;
  typeTitles: Record<SalesSettingType, string>;
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

export const commonNumberCandidates: CodeRuleCandidate[] = [
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

export const commonApprovalMethods: ApprovalMethod[] = [
  { value: '依次审批', desc: '按先后顺序，一人同意才流转到下一人' },
  { value: '会签', desc: '所选人员必须全部审批后进入下一节点' },
  { value: '或签', desc: '选中的人里只要有一人同意即可' },
];

const typeTitles = (name: string): Record<SalesSettingType, string> => ({
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
      { name: '直属主管审批', approvers: [owner], method: '依次审批' },
      { name: '销售负责人复核', approvers: ['老大'], method: '会签' },
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

const planStrategyTabs: StrategyTab[] = [
  {
    key: 'execution',
    label: '执行统计',
    rows: [
      { key: 'statScope', title: '统计口径', sub: '原销售计划新增页提供按订单确认、按发货、按回款三种统计口径。', type: 'select', value: '按订单确认', options: ['按订单确认', '按发货', '按回款'] },
      { key: 'orderSummary', title: '关联订单汇总到业绩追踪', sub: '关联订单自动汇总到业绩追踪，并按人员、产品、金额维度查看完成情况。', type: 'switch', enabled: true },
      { key: 'salesDetail', title: '回写销售明细', sub: '销售明细页保留销售订单、客户、产品、销售人员、数量、金额、日期和状态。', type: 'switch', enabled: true },
    ],
  },
  {
    key: 'warning',
    label: '预警推进',
    rows: [
      { key: 'warningThreshold', title: '达成率预警阈值', sub: '原型中预警阈值示例为低于 70% 触发计划预警。', type: 'select', value: '低于 70%', options: ['低于 70%', '低于 80%', '低于 90%'] },
      { key: 'ownerFollow', title: '负责人补充跟进记录', sub: '月度达成率低于阈值时，由负责人补充跟进记录并调整客户拜访与报价策略。', type: 'switch', enabled: true },
      { key: 'approvalState', title: '审批通过后进入执行跟踪', sub: '新增计划默认待审批；审批通过后进入未开始或执行跟踪，暂停和关闭由后续动作推进。', type: 'switch', enabled: true },
    ],
  },
];

const quoteStrategyTabs: StrategyTab[] = [
  {
    key: 'pricing',
    label: '取价规则',
    rows: [
      { key: 'quoteCategory', title: '报价分类匹配', sub: '报价分类区分通用、分组、促销、指定客户和一次性报价。', type: 'select', value: '通用报价', options: ['通用报价', '客户分组报价', '促销报价', '指定客户报价', '一次性报价'] },
      { key: 'priority', title: '报价优先级', sub: '一次性 > 指定客户 > 促销/活动 > 客户分组 > 通用。', type: 'switch', enabled: true },
      { key: 'customerMatch', title: '客户匹配后取最终价格', sub: '销售取价时结合报价类型和客户匹配规则确定最终价格。', type: 'switch', enabled: true },
    ],
  },
  {
    key: 'conversion',
    label: '转化追踪',
    rows: [
      { key: 'versionLock', title: '保存后锁定价格版本', sub: '报价新增页价格版本为 V1，保存后锁定历史版本。', type: 'switch', enabled: true },
      { key: 'downstream', title: '报价转合同/订单', sub: '转化与财务追踪记录转化动作、目标单据、转化金额、应收、开票和回款状态。', type: 'switch', enabled: true },
      { key: 'expireControl', title: '报价有效期控制', sub: '一次性报价绑定一次交易、项目或合同，用完即失效；促销和指定客户报价按周期生效。', type: 'switch', enabled: true },
    ],
  },
];

const contractStrategyTabs: StrategyTab[] = [
  {
    key: 'source',
    label: '来源与条款',
    rows: [
      { key: 'sourcePolicy', title: '合同来源控制', sub: '合同允许手动创建或项目来源；只有报价来源合同时才必须选择适用报价。', type: 'select', value: '手动/项目/报价', options: ['手动/项目/报价', '必须选择报价', '仅项目来源'] },
      { key: 'priceTerm', title: '价格有效规则', sub: '合同详情需填写合同条款、交付约束、价格有效规则、违约责任和特殊约定。', type: 'switch', enabled: true },
      { key: 'paymentTerm', title: '支付约定', sub: '合同产品明细支持签约后预付、按订单节点付款、发货后付款、验收后付款、月结付款。', type: 'select', value: '按订单节点付款', options: ['签约后预付', '按订单节点付款', '发货后付款', '验收后付款', '月结付款'] },
    ],
  },
  {
    key: 'performance',
    label: '履约核销',
    rows: [
      { key: 'defaultApproval', title: '新增合同默认待审批', sub: '履约中、履约完成、已终止由审批、订单核销、终止流程自动推进。', type: 'switch', enabled: true },
      { key: 'orderWriteoff', title: '订单核销回写合同', sub: '订单核销页跟踪销售订单、订单明细、核销数量、核销金额、核销时间和状态。', type: 'switch', enabled: true },
      { key: 'financeTrace', title: '发货/开票/回款履约追踪', sub: '合同详情保留发货记录、开票记录和回款记录，回写已发货、应收、已开票、已回款和剩余金额。', type: 'switch', enabled: true },
    ],
  },
];

const orderStrategyTabs: StrategyTab[] = [
  {
    key: 'sourceCredit',
    label: '来源与信用',
    rows: [
      { key: 'sourcePolicy', title: '订单来源控制', sub: '订单可从报价单、合同、项目选择来源，也可手动输入订单主题。', type: 'select', value: '报价单/合同/项目/手动', options: ['报价单/合同/项目/手动', '必须选择来源', '允许手动创建'] },
      { key: 'customerDefaults', title: '客户档案自动带入', sub: '支付方式、信用额度、运费支付、出库方式从客户档案自动带入，并允许按单调整。', type: 'switch', enabled: true },
      { key: 'creditHold', title: '信用拦截与异常审批', sub: '订单确认时占用客户信用额度；额度不足、账期异常或超出信用策略时显示信用拦截并进入信用异常审批。', type: 'switch', enabled: true },
    ],
  },
  {
    key: 'fulfillment',
    label: '发货应收',
    rows: [
      { key: 'deliveryMode', title: '出库方式', sub: '自动出库满足条件时自动生成出库单；手动出库需人工发起出库。', type: 'select', value: '自动出库', options: ['自动出库', '手动出库'] },
      { key: 'receivablePoint', title: '发货生成应收', sub: '发货应收页按来源明细记录发货单、仓库库位、OQC状态、发货金额、应收确认点和应收单号。', type: 'switch', enabled: true },
      { key: 'invoicePaymentTrace', title: '开票/回款/信用释放追踪', sub: '到达应开票节点后可生成开票申请；回款核销后释放信用额度并回写订单状态。', type: 'switch', enabled: true },
      { key: 'productionReturnTrace', title: '生产与退换货记录', sub: '订单详情保留生产记录和退换货记录，后续单据按来源明细回填。', type: 'switch', enabled: true },
    ],
  },
];

export const salesSettingTemplates: Record<SalesSettingModule, SalesSettingTemplate> = {
  plans: {
    module: 'plans',
    title: '计划设置',
    backText: '返回计划列表',
    backRoute: '/sales/sales-plans',
    typeTitles: typeTitles('计划'),
    fields: {
      addText: '新增计划字段',
      scopes: [
        { key: 'basic', label: '基础信息' },
        { key: 'product', label: '计划产品' },
        { key: 'detail', label: '计划详情' },
      ],
      rows: fieldRows('plan', [
        ['计划名称', 'plan_name', '文本', 'basic', true],
        ['计划编号', 'plan_code', '自动编号', 'basic', true],
        ['计划周期', 'plan_cycle', '日期范围', 'basic', true],
        ['目标数量', 'target_qty', '数字', 'product', true],
        ['目标金额', 'target_amount', '金额', 'product', true],
        ['统计口径', 'stat_scope', '下拉选项', 'detail', false],
      ]),
    },
    numbers: { prefix: 'SPP', separator: '-', selected: ['y4', 'm', 'd', 's3'], candidates: commonNumberCandidates },
    approvals: { addText: '新增计划审批规则', methods: commonApprovalMethods, rows: approvalRows('plan', [['计划提交审批', '新增销售计划', '李文涛'], ['计划调整审批', '目标变更', '陈思源']]) },
    strategies: { title: '计划策略设置', description: '按原销售计划页面配置统计口径、达成预警、业绩追踪和销售明细回写。', tabs: planStrategyTabs },
    print: { addText: '新增计划打印模板', columns: [], rows: printRows('plan', '计划') },
  },
  quotes: {
    module: 'quotes',
    title: '报价设置',
    backText: '返回报价列表',
    backRoute: '/sales/sales-quotes',
    typeTitles: typeTitles('报价'),
    fields: {
      addText: '新增报价字段',
      scopes: [
        { key: 'basic', label: '基础信息' },
        { key: 'product', label: '产品明细' },
        { key: 'finance', label: '转化与财务追踪' },
        { key: 'attachment', label: '附件/操作记录' },
      ],
      rows: fieldRows('quote', [
        ['报价主题', 'quote_topic', '文本', 'basic', true],
        ['报价编号', 'quote_code', '自动编号', 'basic', true],
        ['报价分类', 'quote_category', '下拉选项', 'basic', true],
        ['适用范围', 'quote_scope', '对象选择', 'basic', true],
        ['阶梯报价', 'tier_price', '子表', 'product', false],
        ['转化状态', 'conversion_status', '状态', 'finance', false],
      ]),
    },
    numbers: { prefix: 'BJ', separator: '-', selected: ['y4', 'm', 'd', 's3'], candidates: commonNumberCandidates },
    approvals: { addText: '新增报价审批规则', methods: commonApprovalMethods, rows: approvalRows('quote', [['报价提交审批', '通用报价', '老大'], ['促销报价审批', '促销报价', '李文涛']]) },
    strategies: { title: '报价策略设置', description: '按原报价页面配置报价分类、客户匹配、报价优先级、价格版本和转化追踪。', tabs: quoteStrategyTabs },
    print: { addText: '新增报价打印模板', columns: [], rows: printRows('quote', '报价') },
  },
  contracts: {
    module: 'contracts',
    title: '合同设置',
    backText: '返回合同列表',
    backRoute: '/sales/sales-contracts',
    typeTitles: typeTitles('合同'),
    fields: {
      addText: '新增合同字段',
      scopes: [
        { key: 'basic', label: '基础信息' },
        { key: 'product', label: '合同产品' },
        { key: 'finance', label: '财务履约' },
      ],
      rows: fieldRows('contract', [
        ['合同主题', 'contract_topic', '文本', 'basic', true],
        ['合同编号', 'contract_code', '自动编号', 'basic', true],
        ['来源单据', 'source_bill', '关联单据', 'basic', false],
        ['合同金额', 'contract_amount', '金额', 'finance', true],
        ['已回款金额', 'received_amount', '金额', 'finance', false],
        ['剩余金额', 'balance_amount', '金额', 'finance', false],
      ]),
    },
    numbers: { prefix: 'HT', separator: '-', selected: ['y4', 'm', 'd', 's3'], candidates: commonNumberCandidates },
    approvals: { addText: '新增合同审批规则', methods: commonApprovalMethods, rows: approvalRows('contract', [['合同新建审批', '合同新建', '张国'], ['合同变更审批', '合同变更', '李文涛']]) },
    strategies: { title: '合同策略设置', description: '按原合同页面配置来源控制、条款约定、履约状态、订单核销和财务履约回写。', tabs: contractStrategyTabs },
    print: { addText: '新增合同打印模板', columns: [], rows: printRows('contract', '合同') },
  },
  orders: {
    module: 'orders',
    title: '订单设置',
    backText: '返回订单列表',
    backRoute: '/sales/sales-orders',
    typeTitles: typeTitles('订单'),
    fields: {
      addText: '新增订单字段',
      scopes: [
        { key: 'basic', label: '基础信息' },
        { key: 'product', label: '产品明细' },
        { key: 'finance', label: '发货应收' },
        { key: 'trace', label: '生产/退换货记录' },
      ],
      rows: fieldRows('order', [
        ['订单主题', 'order_topic', '文本', 'basic', true],
        ['订单号', 'order_code', '自动编号', 'basic', true],
        ['订单来源', 'source_type', '来源选择', 'basic', true],
        ['关联客户', 'customer_name', '客户选择', 'basic', true],
        ['交货地址', 'delivery_address', '文本', 'basic', false],
        ['客户联系人', 'contact_name', '文本', 'basic', false],
        ['交货日期', 'delivery_date', '日期', 'basic', true],
        ['支付方式', 'pay_method', '下拉选项', 'basic', false],
        ['信用额度', 'credit_limit', '金额', 'finance', false],
        ['运费支付', 'freight_pay', '下拉选项', 'basic', false],
        ['出库方式', 'delivery_mode', '下拉选项', 'basic', false],
        ['订单状态', 'order_status', '状态', 'basic', false],
        ['产品明细', 'order_lines', '子表', 'product', true],
        ['产品金额汇总', 'amount_summary', '金额汇总', 'product', false],
        ['信用校验', 'credit_check', '状态', 'finance', false],
        ['信用占用', 'credit_hold', '状态', 'finance', false],
        ['应收金额', 'receivable_amount', '金额', 'finance', false],
        ['开票申请', 'invoice_request', '状态', 'finance', false],
        ['已回款', 'received_amount', '金额', 'finance', false],
        ['异常标签', 'exception_tag', '标签', 'finance', false],
        ['订单进展', 'order_progress', '状态', 'trace', false],
      ]),
    },
    numbers: { prefix: 'SO', separator: '-', selected: ['y4', 'm', 'd', 's3'], candidates: commonNumberCandidates },
    approvals: { addText: '新增订单审批规则', methods: commonApprovalMethods, rows: approvalRows('order', [['订单提交审批', '新增订单', '陈思源'], ['信用异常审批', '信用拦截', '老大']]) },
    strategies: { title: '订单策略设置', description: '按原订单页面配置订单来源、客户默认值、信用拦截、出库发货、应收开票和生产退换货追踪。', tabs: orderStrategyTabs },
    print: { addText: '新增订单打印模板', columns: [], rows: printRows('order', '订单') },
  },
};
