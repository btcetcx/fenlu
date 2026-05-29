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

export type OperationSettingModule =
  | 'rdDocs'
  | 'rdProjects'
  | 'rdProducts'
  | 'rdMaterials'
  | 'rdProcesses'
  | 'rdCrafts'
  | 'rdBoms'
  | 'warehouseStocks'
  | 'warehouseInbounds'
  | 'warehouseOutbounds'
  | 'warehouseTransfers'
  | 'inventoryCounts'
  | 'warehouseLocations'
  | 'productionDemands'
  | 'productionPlans'
  | 'productionOrders'
  | 'productionWorkOrders'
  | 'productionSchedules'
  | 'outsourceOrders';

export type OperationSettingType = 'groups' | 'levels' | 'categories' | 'template' | 'fields' | 'numbers' | 'approvals' | 'strategies' | 'print';

export interface OperationApprovalRuleRow extends SettingTableRow {
  name: string;
  category: string;
  nodes: ApprovalNode[];
  owner: string;
  updatedAt: string;
  enabled: boolean;
}

export interface OperationPrintTemplateRow extends SettingTableRow {
  name: string;
  scene: string;
  paper: string;
  status: string;
  updatedAt: string;
}

export interface OperationExtraSettingList {
  addText: string;
  title: string;
  description: string;
  searchPlaceholder: string;
  columns: SettingTableColumn[];
  rows: SettingTableRow[];
  rootTitle?: string;
  rootAddText?: string;
  defaultRootKey?: string;
  roots?: Array<{ key: string; name: string }>;
}

export interface OperationSettingTemplate {
  module: OperationSettingModule;
  title: string;
  center: 'rd' | 'warehouse' | 'production';
  resource: string;
  backText: string;
  backRoute: string;
  typeTitles: Record<OperationSettingType, string>;
  extraLists?: Partial<Record<'groups' | 'levels' | 'categories' | 'template', OperationExtraSettingList>>;
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
    rows: OperationApprovalRuleRow[];
  };
  strategies: {
    title: string;
    description: string;
    tabs: StrategyTab[];
  };
  print: {
    addText: string;
    columns: SettingTableColumn[];
    rows: OperationPrintTemplateRow[];
  };
}

export const operationNumberCandidates: CodeRuleCandidate[] = [
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

export const operationApprovalMethods: ApprovalMethod[] = [
  { value: '依次审批', desc: '按先后顺序，一人同意才流转到下一人' },
  { value: '会签', desc: '所选人员必须全部审批后进入下一节点' },
  { value: '或签', desc: '选中的人里只要有一人同意即可' },
];

const typeTitles = (name: string): Record<OperationSettingType, string> => ({
  groups: `${name}分组设置`,
  levels: `${name}等级设置`,
  categories: `${name}分类设置`,
  template: `${name}模板设置`,
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

function approvalRows(prefix: string, rows: Array<[string, string, string]>): OperationApprovalRuleRow[] {
  return rows.map(([name, category, owner], index) => ({
    id: `${prefix}_approval_${index + 1}`,
    name,
    category,
    nodes: [
      { name: '一级审批', approvers: [owner], method: '依次审批' },
      { name: '业务复核', approvers: ['老大'], method: '会签' },
    ],
    owner,
    updatedAt: '2026-05-27',
    enabled: true,
  }));
}

function printRows(prefix: string, name: string): OperationPrintTemplateRow[] {
  return [
    { id: `${prefix}_print_1`, name: `${name}标准打印模板`, scene: '新增/详情打印', paper: 'A4 纵向', status: '启用', updatedAt: '2026-05-27' },
    { id: `${prefix}_print_2`, name: `${name}审批留痕模板`, scene: '审批完成后打印', paper: 'A4 横向', status: '启用', updatedAt: '2026-05-27' },
  ];
}

function templateBase(module: OperationSettingModule, center: 'rd' | 'warehouse' | 'production', name: string, resource: string, backRoute: string, prefix: string) {
  return {
    module,
    center,
    resource,
    title: `${name}设置`,
    backText: `返回${name}列表`,
    backRoute,
    typeTitles: typeTitles(name),
    numbers: { prefix, separator: '-', selected: ['y4', 's3'], candidates: operationNumberCandidates },
    print: { addText: `新增${name}打印模板`, columns: [], rows: printRows(module, name) },
  };
}

const categoryColumns: SettingTableColumn[] = [
  { key: 'name', label: '分类名称' },
  { key: 'parent', label: '上级分类' },
  { key: 'code', label: '分类编码' },
  { key: 'count', label: '数据量' },
  { key: 'enabled', label: '状态' },
];

const templateColumns: SettingTableColumn[] = [
  { key: 'name', label: '模板名称' },
  { key: 'category', label: '适用分类' },
  { key: 'version', label: '版本' },
  { key: 'enabled', label: '状态' },
];

function categoryList(prefix: string, name: string, rows: Array<[string, string, string, number]>): OperationExtraSettingList {
  return {
    addText: `新增${name}分类`,
    title: `${name}分类设置`,
    description: `维护${name}列表左侧分类树和新增表单中的分类选项。`,
    searchPlaceholder: `搜索${name}分类`,
    columns: categoryColumns,
    rows: rows.map(([rowName, parent, code, count], index) => ({
      id: `${prefix}_cat_${index + 1}`,
      name: rowName,
      parent,
      code,
      count,
      enabled: '启用',
    })),
  };
}

function docCategoryList(): OperationExtraSettingList {
  const roots = [
    { key: 'plan', name: '工艺方案' },
    { key: 'craft', name: '工艺文件' },
    { key: 'tech', name: '技术文档' },
    { key: 'spec', name: '操作规范' },
  ];
  const subs: Array<[string, string, string, number, boolean]> = [
    ['控制方案', 'DOC_PLAN_CTRL', 'plan', 1, true],
    ['自动化方案', 'DOC_PLAN_AUTO', 'plan', 2, true],
    ['焊接作业', 'DOC_CRAFT_WELD', 'craft', 1, true],
    ['技术规范', 'DOC_TECH_SPEC', 'tech', 1, true],
    ['安全操作', 'DOC_OP_SAFE', 'spec', 1, true],
  ];
  const rootMap = Object.fromEntries(roots.map((root) => [root.key, root.name]));
  return {
    addText: '新增子分类',
    title: '文档分类设置',
    description: '维护文档库左侧一级分类，以及当前一级分类下的二级分类列表。',
    searchPlaceholder: '搜索下级分类名称/编号',
    rootTitle: '文档分类',
    rootAddText: '新增文档分类',
    defaultRootKey: 'plan',
    roots,
    columns: [
      { key: 'index', label: '序号', width: '70px' },
      { key: 'name', label: '分类名称' },
      { key: 'parentName', label: '上级分类' },
      { key: 'code', label: '分类编码' },
      { key: 'sort', label: '排序', width: '90px' },
      { key: 'enabled', label: '状态', width: '90px' },
    ],
    rows: subs.map(([name, code, parentKey, sort, enabled], index) => ({
      id: `rd_doc_cat_sub_${index + 1}`,
      name,
      code,
      parentKey,
      parentName: rootMap[parentKey],
      sort,
      enabled,
    })),
  };
}

function bomTemplateList(): OperationExtraSettingList {
  return {
    addText: '新增BOM模板',
    title: 'BOM模板设置',
    description: '维护BOM新增时可选择的结构模板、默认层级、替代料和损耗规则。',
    searchPlaceholder: '搜索BOM模板',
    columns: templateColumns,
    rows: [
      { id: 'bom_tpl_1', name: '成品标准BOM模板', category: '成品BOM', version: 'V1.0', enabled: '启用' },
      { id: 'bom_tpl_2', name: '半成品模块BOM模板', category: '半成品BOM', version: 'V1.0', enabled: '启用' },
      { id: 'bom_tpl_3', name: '工程试制BOM模板', category: '工程BOM', version: 'V0.9', enabled: '启用' },
    ],
  };
}

function rdStrategyTabs(kind: string, rows: StrategyTab[]): { title: string; description: string; tabs: StrategyTab[] } {
  return {
    title: `${kind}策略设置`,
    description: `按原${kind}页面业务内容配置来源、版本、发布、审批、流转和关联业务规则。`,
    tabs: rows,
  };
}

const rdDocStrategies: StrategyTab[] = [
  {
    key: 'version',
    label: '版本与发布',
    rows: [
      { key: 'docType', title: '文档类型', sub: '原文档库包含工艺方案、工艺文件、技术文档、操作规范。', type: 'select', value: '工艺方案', options: ['工艺方案', '工艺文件', '技术文档', '操作规范'] },
      { key: 'approvalPublish', title: '审批后发布', sub: '草稿、待审核、已发布、已停用由提交审批和发布动作推进。', type: 'switch', enabled: true },
      { key: 'versionHistory', title: '版本记录', sub: '文档详情保留版本号、编制人、更新日期和发布记录。', type: 'switch', enabled: true },
    ],
  },
  {
    key: 'security',
    label: '安全与外发',
    rows: [
      { key: 'signature', title: '电子签章', sub: '发布或审批通过后可自动签章，签章与文档版本绑定。', type: 'select', value: '发布时自动签章', options: ['发布时自动签章', '审批通过后签章', '不启用'] },
      { key: 'watermark', title: '水印策略', sub: '查看、下载、外发可配置动态水印。', type: 'select', value: '查看与下载均加水印', options: ['查看与下载均加水印', '仅查看加水印', '仅下载加水印', '不加水印'] },
      { key: 'externalDownload', title: '外发/下载审批', sub: '涉密图纸、客户外发资料和正式发布版本可强制外发审批。', type: 'switch', enabled: true },
    ],
  },
];

const rdProjectStrategies: StrategyTab[] = [
  {
    key: 'projectFlow',
    label: '立项与来源',
    rows: [
      { key: 'projectType', title: '项目分类', sub: '原项目页左侧树包含研发项目、工程项目、合作项目。', type: 'select', value: '研发项目', options: ['研发项目', '工程项目', '合作项目'] },
      { key: 'sourceSubject', title: '来源主体', sub: '新增项目可关联客户或合同，并带入项目主题、负责人和金额。', type: 'select', value: '客户/合同', options: ['客户/合同', '仅客户', '仅合同', '手动创建'] },
      { key: 'milestoneRequired', title: '里程碑必填', sub: '项目详情维护阶段、成员、任务、里程碑和评审记录。', type: 'switch', enabled: true },
    ],
  },
  {
    key: 'business',
    label: 'BOM/报价/生产',
    rows: [
      { key: 'bomQuoteLock', title: 'BOM锁定后报价', sub: '项目可引用或新增BOM，锁定报价后才能发起采购或生产。', type: 'switch', enabled: true },
      { key: 'purchaseAfterQuote', title: '报价确认后采购', sub: '锁定报价后发起采购，跟踪采购金额、状态和进度。', type: 'switch', enabled: true },
      { key: 'productionDemand', title: '报价确认后下单生产', sub: '报价确认后可发起生产需求并跟踪计划、订单、工单和完工进度。', type: 'switch', enabled: true },
    ],
  },
];

const rdProductStrategies: StrategyTab[] = [
  {
    key: 'archive',
    label: '产品档案',
    rows: [
      { key: 'productCategory', title: '产品分类', sub: '原产品页按成品、半成品、原材料分类树过滤。', type: 'select', value: '成品', options: ['成品', '半成品', '原材料'] },
      { key: 'salesControl', title: '销售控制', sub: '产品档案支持允许销售、禁止销售、审批销售等控制。', type: 'select', value: '允许销售', options: ['允许销售', '禁止销售', '审批销售'] },
      { key: 'modelOptions', title: '型号规格选项', sub: '主产品可维护多个型号规格选项，销售下单后生产展开对应BOM。', type: 'switch', enabled: true },
    ],
  },
  {
    key: 'codeStock',
    label: '物码与库存',
    rows: [
      { key: 'codeMode', title: '物码管控模式', sub: '产品码管控支持不管控、批次管控、一物一码、一物多码。', type: 'select', value: '一物一码', options: ['不管控', '批次管控', '一物一码', '一物多码'] },
      { key: 'stockPolicy', title: '库存策略', sub: '维护安全库存、最低库存、最高库存、补货周期和存储位置。', type: 'switch', enabled: true },
      { key: 'qcPlan', title: '质检方案', sub: '产品档案带出质检方案、执行标准和出入库校验。', type: 'switch', enabled: true },
    ],
  },
];

const rdMaterialStrategies: StrategyTab[] = [
  {
    key: 'archive',
    label: '物料档案',
    rows: [
      { key: 'materialType', title: '物料类型', sub: '物料管理维护物料档案、规格属性、替代料和使用范围。', type: 'select', value: '原材料', options: ['原材料', '辅料', '半成品', '包装材料'] },
      { key: 'specAttributes', title: '规格属性', sub: '规格型号、单位、品牌、材质、颜色等属性进入物料档案。', type: 'switch', enabled: true },
      { key: 'useScope', title: '使用范围', sub: '物料可限定适用产品、项目、BOM和工艺路线。', type: 'switch', enabled: true },
    ],
  },
  {
    key: 'substitute',
    label: '替代与采购',
    rows: [
      { key: 'substituteRule', title: '替代料规则', sub: '维护替代料、替代优先级和生效状态。', type: 'select', value: '审批后生效', options: ['审批后生效', '直接生效', '禁止替代'] },
      { key: 'supplierLink', title: '供应商关联', sub: '物料档案可关联供应商和采购默认信息。', type: 'switch', enabled: true },
      { key: 'bomUse', title: 'BOM引用校验', sub: '已被BOM引用的物料变更需审批并保留版本影响范围。', type: 'switch', enabled: true },
    ],
  },
];

const rdProcessStrategies: StrategyTab[] = [
  {
    key: 'process',
    label: '工序参数',
    rows: [
      { key: 'processType', title: '工序类型', sub: '工序档案维护工序参数、资源要求、质检点和适用范围。', type: 'select', value: '生产工序', options: ['生产工序', '检验工序', '委外工序', '包装工序'] },
      { key: 'resourceRequired', title: '资源要求', sub: '维护设备、工装、人员技能、标准工时和准备工时。', type: 'switch', enabled: true },
      { key: 'qcPoint', title: '质检点', sub: '工序可配置首检、巡检、完工检和关键参数记录。', type: 'switch', enabled: true },
    ],
  },
  {
    key: 'publish',
    label: '发布与引用',
    rows: [
      { key: 'approvalBeforeUse', title: '审批后引用', sub: '工序发布后才能被工艺路线引用。', type: 'switch', enabled: true },
      { key: 'changeImpact', title: '变更影响范围', sub: '已被工艺路线引用的工序变更需显示影响路线和产品。', type: 'switch', enabled: true },
      { key: 'standardTime', title: '标准工时参与排产', sub: '标准工时和资源要求进入生产工单和产能计算。', type: 'switch', enabled: true },
    ],
  },
];

const rdCraftStrategies: StrategyTab[] = [
  {
    key: 'route',
    label: '工艺路线',
    rows: [
      { key: 'routeType', title: '工艺类型', sub: '工艺管理维护工艺路线、工艺版本、工序明细和发布记录。', type: 'select', value: '标准工艺', options: ['标准工艺', '试制工艺', '委外工艺', '返工工艺'] },
      { key: 'processDetail', title: '工序明细', sub: '工艺路线按顺序维护工序、设备、工装、工时、质检点。', type: 'switch', enabled: true },
      { key: 'versionLock', title: '发布锁版', sub: '已发布版本被生产订单引用时锁版，变更产生新版本。', type: 'switch', enabled: true },
    ],
  },
  {
    key: 'release',
    label: '发布与生产',
    rows: [
      { key: 'approvalPublish', title: '审批后发布', sub: '草稿、待审批、已发布、停用通过审批和发布动作推进。', type: 'switch', enabled: true },
      { key: 'productionUse', title: '生产订单引用', sub: '生产订单锁定工艺版本，工单按工序明细拆解。', type: 'switch', enabled: true },
      { key: 'changeRecord', title: '变更记录', sub: '工艺版本、发布人、发布时间和变更说明进入发布记录。', type: 'switch', enabled: true },
    ],
  },
];

const rdBomStrategies: StrategyTab[] = [
  {
    key: 'bom',
    label: 'BOM结构',
    rows: [
      { key: 'bomType', title: 'BOM分类', sub: 'BOM库包含成品BOM、半成品BOM、工程BOM、虚拟BOM。', type: 'select', value: '成品BOM', options: ['成品BOM', '半成品BOM', '工程BOM', '虚拟BOM'] },
      { key: 'versionLock', title: '版本锁定', sub: '发布后锁定BOM版本，生产订单引用锁定版本。', type: 'switch', enabled: true },
      { key: 'lossRate', title: '损耗率', sub: 'BOM明细维护用量、损耗率、单位和层级。', type: 'switch', enabled: true },
    ],
  },
  {
    key: 'substitute',
    label: '替代料与发布',
    rows: [
      { key: 'substituteMaterial', title: '替代物料库', sub: 'BOM包含替代料列表，替代优先级和生效状态。', type: 'switch', enabled: true },
      { key: 'approvalFlow', title: 'BOM发布流程', sub: '新增、变更、发布和停用走BOM审批流程。', type: 'switch', enabled: true },
      { key: 'templateApply', title: 'BOM模板套用', sub: '新增BOM可按成品、半成品、工程试制模板带出默认结构。', type: 'switch', enabled: true },
    ],
  },
];

const warehouseStockStrategies: StrategyTab[] = [
  {
    key: 'stockControl',
    label: '库存口径',
    rows: [
      { key: 'quantityMode', title: '库存数量口径', sub: '按原库存页的账面、可用、占用、冻结、在途、车间数量分别展示和计算。', type: 'select', value: '账面/可用/占用/冻结/在途', options: ['账面/可用/占用/冻结/在途', '仅账面库存', '账面+在途'] },
      { key: 'qualityGate', title: '质量状态参与可用量', sub: '待检、让步、合格等质量状态影响可用库存，待检批次默认不可用。', type: 'switch', enabled: true },
      { key: 'costLayer', title: '成本层追踪', sub: '库存明细保留来源明细和成本层，所有出入库流水按成本层追溯。', type: 'switch', enabled: true },
    ],
  },
  {
    key: 'codeTrace',
    label: '物码追踪',
    rows: [
      { key: 'serialTrace', title: '一物一码追踪', sub: '支持主码、供应商码、客户码、箱码或托盘码反查库存位置与来源单据。', type: 'switch', enabled: true },
      { key: 'freezeRule', title: '占用/冻结规则', sub: '销售占用、质检冻结、调拨冻结分别记录来源单据和释放条件。', type: 'switch', enabled: true },
      { key: 'flowAudit', title: '库存流水审计', sub: '所有库存变化必须形成库存流水，作为审计和追溯唯一来源。', type: 'switch', enabled: true },
    ],
  },
];

const inboundStrategies: StrategyTab[] = [
  {
    key: 'source',
    label: '来源与质检',
    rows: [
      { key: 'inboundType', title: '入库类型', sub: '原入库页支持直接入库、采购入库、生产入库、销售退货入库、委外入库。', type: 'select', value: '直接/采购/生产/退货/委外', options: ['直接/采购/生产/退货/委外', '禁止直接入库', '仅来源单据入库'] },
      { key: 'qcRequired', title: '入库质检约束', sub: '采购到货和委外完工可要求质检合格或让步放行后入库。', type: 'switch', enabled: true },
      { key: 'sourceWriteback', title: '来源回写', sub: '入库数量、上架数量和过账状态回写采购、生产、退货或委外来源明细。', type: 'switch', enabled: true },
    ],
  },
  {
    key: 'shelfPost',
    label: '上架与过账',
    rows: [
      { key: 'putawayMode', title: '上架方式', sub: '按仓库库位推荐上架，约束入库数量不超过合格和让步数量。', type: 'select', value: '推荐库位', options: ['推荐库位', '手动选择库位', '先暂存后上架'] },
      { key: 'barcodeBind', title: '物码绑定', sub: '启用一物一码/一物多码产品在入库过账前完成主码生成和关联码绑定。', type: 'switch', enabled: true },
      { key: 'postCost', title: '过账生成库存与成本层', sub: '上架过账后生成库存流水、批次、序列号和成本层。', type: 'switch', enabled: true },
    ],
  },
];

const outboundStrategies: StrategyTab[] = [
  {
    key: 'source',
    label: '来源与占用',
    rows: [
      { key: 'outboundType', title: '出库类型', sub: '原出库页支持直接出库、内部领用、委外领料、销售出库、采购退货出库。', type: 'select', value: '直接/领用/委外/销售/退货', options: ['直接/领用/委外/销售/退货', '禁止直接出库', '仅来源单据出库'] },
      { key: 'occupyFirst', title: '先占用再拣货', sub: '审核通过后先占用库存，拣货复核后再发运过账。', type: 'switch', enabled: true },
      { key: 'shortPick', title: '短拣处理', sub: '拣货、复核、发货数量逐级约束，短拣记录差异并进入待处理。', type: 'switch', enabled: true },
    ],
  },
  {
    key: 'pickPost',
    label: '拣货与过账',
    rows: [
      { key: 'pickMode', title: '拣货方式', sub: '按推荐库位、批次、质量状态和成本层选择可出库存。', type: 'select', value: '推荐库位优先', options: ['推荐库位优先', '先进先出', '手动指定批次'] },
      { key: 'oqcGate', title: 'OQC 放行校验', sub: '出库过账前校验已扫数量、质量状态、冻结占用和 OQC 放行结果。', type: 'switch', enabled: true },
      { key: 'stockDeduct', title: '过账扣减库存', sub: '发货过账后扣减库存并写入成本层出库流水。', type: 'switch', enabled: true },
    ],
  },
];

const transferStrategies: StrategyTab[] = [
  {
    key: 'flow',
    label: '调拨流程',
    rows: [
      { key: 'transferMode', title: '调拨方式', sub: '原调拨页按原仓库、目标仓库、调拨日期和经办人创建调拨。', type: 'select', value: '仓库间调拨', options: ['仓库间调拨', '库位间调拨', '线边仓调拨'] },
      { key: 'freezeOnSubmit', title: '提交后冻结可调拨量', sub: '提交调拨后冻结可调拨库存，调出确认后转在途，调入确认后入目标库位。', type: 'switch', enabled: true },
      { key: 'twoStepPost', title: '调出/调入双确认', sub: '调出确认和调入确认分别生成库存流水，支持在途数量追踪。', type: 'switch', enabled: true },
    ],
  },
  {
    key: 'difference',
    label: '差异处理',
    rows: [
      { key: 'diffRule', title: '调拨差异规则', sub: '调入数量少于调出数量时记录差异数量和处理方式。', type: 'select', value: '差异待审批', options: ['差异待审批', '自动生成调整单', '保留在途'] },
      { key: 'locationRequired', title: '调出/调入库位必填', sub: '调拨明细必须维护原库位和目标库位，保证库存准确移动。', type: 'switch', enabled: true },
      { key: 'qualityKeep', title: '质量状态继承', sub: '调拨过程中保留批次、质量状态和成本层，不在调拨中改变质量结论。', type: 'switch', enabled: true },
    ],
  },
];

const inventoryStrategies: StrategyTab[] = [
  {
    key: 'plan',
    label: '盘点计划',
    rows: [
      { key: 'countScope', title: '盘点范围', sub: '原盘点页支持全部库存、指定分类、指定物料、指定库位和异常库存。', type: 'select', value: '指定物品', options: ['全部库存', '指定分类', '指定物品', '指定库位', '异常库存'] },
      { key: 'lockStock', title: '盘点锁库', sub: '生成盘点单时可锁定仓库、库位或批次，避免盘点期间出入库影响账实。', type: 'switch', enabled: true },
      { key: 'cyclePlan', title: '周期盘点计划', sub: '支持月度、季度、年度和临时盘点计划生成盘点单。', type: 'switch', enabled: true },
    ],
  },
  {
    key: 'adjust',
    label: '差异调整',
    rows: [
      { key: 'diffDispose', title: '差异处理方式', sub: '盘盈入库、盘亏出库、提交差异审批或无需处理。', type: 'select', value: '提交差异审批', options: ['无需处理', '生成盘盈入库', '生成盘亏出库', '提交差异审批'] },
      { key: 'recheckRequired', title: '复盘必填', sub: '盘点差异出现时要求填写复盘数量和差异原因。', type: 'switch', enabled: true },
      { key: 'unlockAfterPost', title: '差异过账后释放锁库', sub: '差异调整过账后释放盘点锁库范围。', type: 'switch', enabled: true },
    ],
  },
];

const locationStrategies: StrategyTab[] = [
  {
    key: 'structure',
    label: '仓库结构',
    rows: [
      { key: 'createType', title: '新增类型', sub: '原库位页支持新增仓库、区域、库位三种类型。', type: 'select', value: '仓库/区域/库位', options: ['仓库/区域/库位', '仅仓库和库位', '仅库位'] },
      { key: 'temperatureZone', title: '温区校验', sub: '仓库可多选常温、冷藏、冻品、恒温；库区和库位继承并校验物品温区要求。', type: 'switch', enabled: true },
      { key: 'capacityCheck', title: '容量校验', sub: '按仓库、库区、库位容量计算可用体积，超容时拦截上架。', type: 'switch', enabled: true },
    ],
  },
  {
    key: 'status',
    label: '状态与推荐',
    rows: [
      { key: 'locationStatus', title: '库位状态', sub: '启用、关闭或禁用的库位影响入库推荐和出库拣货。', type: 'select', value: '启用/关闭', options: ['启用/关闭', '启用/禁用/维护', '只允许启用'] },
      { key: 'ownerRequired', title: '仓库负责人必填', sub: '新增仓库时必须维护负责人、联系方式和地址。', type: 'switch', enabled: true },
      { key: 'putawayRecommend', title: '上架推荐', sub: '入库上架按温区、容量、质量状态和产品默认仓库推荐库位。', type: 'switch', enabled: true },
    ],
  },
];

const demandStrategies: StrategyTab[] = [
  {
    key: 'source',
    label: '需求来源',
    rows: [
      { key: 'sourceType', title: '生产来源', sub: '契约支持销售订单、库存备货、手动创建等来源生成生产需求。', type: 'select', value: '销售订单/备货/手动', options: ['销售订单/备货/手动', '仅销售订单', '仅手动创建'] },
      { key: 'confirmRequired', title: '需求确认', sub: '待确认、已确认、已转计划、已转订单、已关闭由确认和转单动作推进。', type: 'switch', enabled: true },
      { key: 'deliveryCarry', title: '交付日期带入', sub: '销售订单交付日期、来源交付日期带入计划开始和完成日期。', type: 'switch', enabled: true },
    ],
  },
  {
    key: 'convert',
    label: '转计划/订单',
    rows: [
      { key: 'convertTarget', title: '需求转单目标', sub: '原页面提供转生产计划和转生产订单入口。', type: 'select', value: '计划或订单', options: ['计划或订单', '只能转计划', '只能转订单'] },
      { key: 'productLines', title: '产品明细生成', sub: '来源类型、来源单据、来源行号、产品、需求数量、计划数量生成明细。', type: 'switch', enabled: true },
      { key: 'priorityRule', title: '优先级规则', sub: '普通、紧急、特急影响需求排产和计划生成顺序。', type: 'switch', enabled: true },
    ],
  },
];

const planStrategies: StrategyTab[] = [
  {
    key: 'plan',
    label: '计划生成',
    rows: [
      { key: 'sourceDemand', title: '来源需求', sub: '生产计划从生产需求或销售订单带入来源明细、客户/项目和产品数量。', type: 'select', value: '生产需求', options: ['生产需求', '销售订单', '库存备货', '手动计划'] },
      { key: 'kittingCheck', title: '齐套检查', sub: '计划详情包含齐套预估，生成生产订单前可执行齐套检查。', type: 'switch', enabled: true },
      { key: 'approvalBeforeOrder', title: '审批后生成订单', sub: '计划待审批、已批准、执行中、已完成按审批和生成订单推进。', type: 'switch', enabled: true },
    ],
  },
  {
    key: 'execution',
    label: '执行追踪',
    rows: [
      { key: 'progressCalc', title: '进度计算', sub: '列表按已完成数量/计划数量显示生产计划进度。', type: 'select', value: '完工数量', options: ['完工数量', '报工数量', '入库数量'] },
      { key: 'bomRoutePrecheck', title: 'BOM/工艺预检查', sub: '计划明细保留 BOM 版本和工艺路线，用于生成生产订单前校验。', type: 'switch', enabled: true },
      { key: 'writebackDemand', title: '回写来源需求', sub: '计划生成和订单生成状态回写生产需求。', type: 'switch', enabled: true },
    ],
  },
];

const productionOrderStrategies: StrategyTab[] = [
  {
    key: 'order',
    label: '订单规则',
    rows: [
      { key: 'orderSource', title: '生产订单来源', sub: '可由生产需求、生产计划、库存备货或手动创建生成生产订单。', type: 'select', value: '生产计划', options: ['生产计划', '生产需求', '库存备货', '手动创建'] },
      { key: 'singleProduct', title: '单产品订单', sub: '契约待确认项：生产订单是否严格只对应一个生产产品；当前按单产品优先。', type: 'switch', enabled: true },
      { key: 'versionLock', title: 'BOM/工艺锁版', sub: '订单详情保留 BOM 版本和工艺路线，发布工单前锁版。', type: 'switch', enabled: true },
    ],
  },
  {
    key: 'workOrder',
    label: '工单拆解',
    rows: [
      { key: 'releaseMode', title: '工单拆解方式', sub: '按 BOM/工艺自动拆解或手动释放生产工单。', type: 'select', value: '自动拆解', options: ['自动拆解', '手动释放', '审批后自动释放'] },
      { key: 'materialTrace', title: '领退料记录', sub: '订单详情保留领料、退料和物料齐套记录。', type: 'switch', enabled: true },
      { key: 'inboundNotice', title: '完工入库通知', sub: '生产完成后生成仓储待入库通知并回写入库数量。', type: 'switch', enabled: true },
    ],
  },
];

const workOrderStrategies: StrategyTab[] = [
  {
    key: 'dispatch',
    label: '领工派工',
    rows: [
      { key: 'dispatchMode', title: '报工来源', sub: '原工单页支持领工派工和自由模式报工。', type: 'select', value: '领工派工', options: ['领工派工', '自由模式', '两者都允许'] },
      { key: 'claimLimit', title: '报工数量约束', sub: '领工派工模式下报工数量受已领数量或已派工数量约束。', type: 'switch', enabled: true },
      { key: 'relatedPeople', title: '相关人员选择', sub: '报工人员选择只显示当前工序相关的车间、产线、班组人员。', type: 'switch', enabled: true },
    ],
  },
  {
    key: 'report',
    label: '报工与质检',
    rows: [
      { key: 'reportFields', title: '报工字段', sub: '报工记录保存报工数量、合格数量、不良数量、工位/产线、报工时间。', type: 'switch', enabled: true },
      { key: 'qualityTask', title: '报工后生成质检', sub: '报工后可自动生成待质检记录，合格/不良进入后续入库或返工。', type: 'switch', enabled: true },
      { key: 'reportView', title: '报工记录视图', sub: '支持我的报工和管理员视图，管理员可按人员和日期筛选。', type: 'switch', enabled: true },
    ],
  },
];

const productionScheduleStrategies: StrategyTab[] = [
  {
    key: 'schedule',
    label: '排班策略',
    rows: [
      { key: 'scheduleStrategy', title: '排班策略', sub: '按原生产排班页面配置均衡工时优先、产能优先或技能优先。', type: 'select', value: '均衡工时优先', options: ['均衡工时优先', '产能优先', '技能优先'] },
      { key: 'restGap', title: '最小休息间隔', sub: '夜班后至少 12 小时；连续班次不满足间隔时阻断发布。', type: 'select', value: '夜班后至少 12 小时', options: ['夜班后至少 12 小时', '夜班后至少 10 小时', '按班组规则'] },
      { key: 'weeklyLimit', title: '周工时上限', sub: '默认周工时上限 48 小时，超出后在冲突校验中预警。', type: 'switch', enabled: true },
    ],
  },
  {
    key: 'validate',
    label: '校验发布',
    rows: [
      { key: 'overlapBlock', title: '同日重叠班次', sub: '人员不可在同一时间窗重复排班，发布时阻断。', type: 'switch', enabled: true },
      { key: 'skillBlock', title: '资质不匹配', sub: '关键工序需满足技能和证书要求，发布时阻断。', type: 'switch', enabled: true },
      { key: 'capacityWarn', title: '产能不足', sub: '计划工时低于工单需求时给出补位建议。', type: 'switch', enabled: true },
    ],
  },
];

const outsourceStrategies: StrategyTab[] = [
  {
    key: 'source',
    label: '委外来源',
    rows: [
      { key: 'outsourceSource', title: '委外来源', sub: '委外加工可绑定销售订单、生产订单或手动创建。', type: 'select', value: '生产订单', options: ['生产订单', '销售订单', '手动创建'] },
      { key: 'supplierRequired', title: '加工商必填', sub: '委外加工商、委外方式、发料方式和交付日期为核心字段。', type: 'switch', enabled: true },
      { key: 'approvalBeforeIssue', title: '审批后发料', sub: '待发料、部分发料、已发料、加工中、待收货等状态由审批和发料动作推进。', type: 'switch', enabled: true },
    ],
  },
  {
    key: 'issueReceive',
    label: '发料与入库',
    rows: [
      { key: 'issueToWarehouse', title: '委外发料调用出库', sub: '委外发料生成仓储出库单并记录应发、本次发料、累计已发和欠发数量。', type: 'switch', enabled: true },
      { key: 'receiveToWarehouse', title: '委外收货调用入库', sub: '委外入库记录收货数量、质检合格、让步、不良和本次入库数量。', type: 'switch', enabled: true },
      { key: 'qualityRequired', title: '委外质检', sub: '委外收货后可生成质检任务，质检通过或让步后入库。', type: 'switch', enabled: true },
    ],
  },
];

export const operationSettingTemplates: Record<OperationSettingModule, OperationSettingTemplate> = {
  rdDocs: {
    ...templateBase('rdDocs', 'rd', '文档', 'rd-documents', '/rd/doc', 'DOC'),
    extraLists: {
      categories: docCategoryList(),
    },
    fields: {
      addText: '新增文档字段',
      scopes: [
        { key: 'basic', label: '基本信息' },
        { key: 'security', label: '安全与外发' },
        { key: 'content', label: '正文/附件' },
      ],
      rows: fieldRows('rd_doc', [
        ['文档编码', 'code', '自动编号', 'basic', true],
        ['文档名称', 'name', '文本', 'basic', true],
        ['所属分类', 'category', '分类选择器', 'basic', true],
        ['版本号', 'version', '文本', 'basic', false],
        ['编制人', 'ownerName', '人员选择', 'basic', false],
        ['生效日期', 'effectiveDate', '日期', 'basic', false],
        ['失效日期', 'expireDate', '日期', 'basic', false],
        ['电子签章', 'signaturePolicy', '下拉选项', 'security', false],
        ['水印策略', 'watermarkPolicy', '下拉选项', 'security', false],
        ['外发权限', 'externalPolicy', '下拉选项', 'security', false],
        ['下载审批', 'downloadApproval', '下拉选项', 'security', false],
        ['正文内容', 'content', '富文本', 'content', false],
        ['附件', 'attachments', '附件', 'content', false],
      ]),
    },
    approvals: { addText: '新增文档审批规则', methods: operationApprovalMethods, rows: approvalRows('rd_doc', [['文档发布审批', '文档发布', '研发主管'], ['文档外发下载审批', '外发下载', '质量主管']]) },
    strategies: rdStrategyTabs('文档', rdDocStrategies),
  },
  rdProjects: {
    ...templateBase('rdProjects', 'rd', '项目', 'rd-projects', '/rd/projects', 'PRJ'),
    extraLists: {
      categories: categoryList('rd_project', '项目', [['研发项目', '项目库', 'rd', 3], ['工程项目', '项目库', 'eng', 2], ['合作项目', '项目库', 'coop', 1], ['产品研发', '研发项目', 'rd_product', 2]]),
    },
    fields: {
      addText: '新增项目字段',
      scopes: [
        { key: 'basic', label: '基本信息' },
        { key: 'members', label: '成员/里程碑' },
        { key: 'business', label: 'BOM/报价/生产' },
      ],
      rows: fieldRows('rd_project', [
        ['项目编号', 'code', '自动编号', 'basic', true],
        ['项目名称', 'name', '文本', 'basic', true],
        ['项目分类', 'category', '下拉选项', 'basic', true],
        ['项目状态', 'status', '状态', 'basic', false],
        ['优先级', 'priority', '下拉选项', 'basic', false],
        ['负责人', 'ownerName', '人员选择', 'basic', true],
        ['开始日期', 'startDate', '日期', 'basic', false],
        ['计划完成日期', 'planEndDate', '日期', 'basic', false],
        ['进度', 'progress', '数字', 'basic', false],
        ['来源主体', 'sourceSubject', '关联单据', 'business', false],
        ['项目成员', 'members', '子表', 'members', false],
        ['里程碑', 'milestones', '子表', 'members', false],
        ['项目BOM', 'projectBom', '关联单据', 'business', false],
        ['项目报价', 'projectQuote', '金额', 'business', false],
        ['生产需求', 'productionDemand', '关联单据', 'business', false],
      ]),
    },
    approvals: { addText: '新增项目审批规则', methods: operationApprovalMethods, rows: approvalRows('rd_project', [['项目立项审批', '新增项目', '研发主管'], ['项目报价锁定审批', '报价确认', '财务复核']]) },
    strategies: rdStrategyTabs('项目', rdProjectStrategies),
  },
  rdProducts: {
    ...templateBase('rdProducts', 'rd', '产品', 'rd-products', '/rd/products', 'CP'),
    extraLists: {
      categories: categoryList('rd_product', '产品', [['成品', '产品库', 'fin', 3], ['半成品', '产品库', 'semi', 2], ['原材料', '产品库', 'raw', 2], ['智能终端', '成品', 'cat-a', 2]]),
    },
    fields: {
      addText: '新增产品字段',
      scopes: [
        { key: 'basic', label: '产品信息' },
        { key: 'sales', label: '销售/质检' },
        { key: 'stock', label: '库存/物码' },
      ],
      rows: fieldRows('rd_product', [
        ['产品编号', 'code', '自动编号', 'basic', true],
        ['产品名称', 'name', '文本', 'basic', true],
        ['别名码', 'alias', '文本', 'basic', false],
        ['产品分类', 'category', '下拉选项', 'basic', true],
        ['产品型号', 'model', '文本', 'basic', false],
        ['规格型号选项', 'modelOptions', '子表', 'basic', false],
        ['产品规格', 'spec', '文本', 'basic', false],
        ['产品单位', 'unit', '下拉选项', 'basic', true],
        ['获取方式', 'source', '下拉选项', 'basic', false],
        ['产品状态', 'state', '状态', 'basic', false],
        ['销售控制', 'salesControl', '下拉选项', 'sales', false],
        ['建议售价', 'price', '金额', 'sales', false],
        ['质检方案', 'qcPlan', '关联单据', 'sales', false],
        ['执行标准', 'execStd', '文本', 'sales', false],
        ['安全库存', 'safeStock', '数字', 'stock', false],
        ['存储位置', 'storage', '文本', 'stock', false],
        ['物码管控', 'codeControl', '下拉选项', 'stock', false],
      ]),
    },
    approvals: { addText: '新增产品审批规则', methods: operationApprovalMethods, rows: approvalRows('rd_product', [['产品建档审批', '新增产品', '研发主管'], ['产品销售控制审批', '审批销售', '销售主管']]) },
    strategies: rdStrategyTabs('产品', rdProductStrategies),
  },
  rdMaterials: {
    ...templateBase('rdMaterials', 'rd', '物料', 'rd-materials', '/rd/materials', 'MAT'),
    extraLists: {
      categories: categoryList('rd_material', '物料', [['原材料', '物料库', 'raw', 28], ['辅料', '物料库', 'aux', 12], ['半成品', '物料库', 'semi', 18], ['包装材料', '物料库', 'pkg', 9]]),
    },
    fields: {
      addText: '新增物料字段',
      scopes: [
        { key: 'basic', label: '物料档案' },
        { key: 'spec', label: '规格属性' },
        { key: 'substitute', label: '替代/引用' },
      ],
      rows: fieldRows('rd_material', [
        ['物料编码', 'code', '自动编号', 'basic', true],
        ['物料名称', 'name', '文本', 'basic', true],
        ['物料类型', 'type', '下拉选项', 'basic', true],
        ['物料分类', 'category', '下拉选项', 'basic', true],
        ['规格型号', 'spec', '文本', 'spec', false],
        ['单位', 'unit', '下拉选项', 'spec', true],
        ['品牌', 'brand', '文本', 'spec', false],
        ['材质', 'material', '文本', 'spec', false],
        ['颜色', 'color', '文本', 'spec', false],
        ['替代料', 'substitutes', '子表', 'substitute', false],
        ['使用范围', 'useScope', '文本', 'substitute', false],
        ['供应商', 'supplierName', '供应商选择', 'basic', false],
        ['BOM引用', 'bomRefs', '子表', 'substitute', false],
      ]),
    },
    approvals: { addText: '新增物料审批规则', methods: operationApprovalMethods, rows: approvalRows('rd_material', [['物料建档审批', '新增物料', '研发主管'], ['替代料生效审批', '替代料', '工艺主管']]) },
    strategies: rdStrategyTabs('物料', rdMaterialStrategies),
  },
  rdProcesses: {
    ...templateBase('rdProcesses', 'rd', '工序', 'rd-processes', '/rd/processes', 'PROC'),
    extraLists: {
      categories: categoryList('rd_process', '工序', [['生产工序', '工序库', 'prod', 18], ['检验工序', '工序库', 'qc', 8], ['委外工序', '工序库', 'outsource', 6], ['包装工序', '工序库', 'pkg', 5]]),
    },
    fields: {
      addText: '新增工序字段',
      scopes: [
        { key: 'basic', label: '工序档案' },
        { key: 'resource', label: '资源要求' },
        { key: 'quality', label: '质检点' },
      ],
      rows: fieldRows('rd_process', [
        ['工序编码', 'code', '自动编号', 'basic', true],
        ['工序名称', 'name', '文本', 'basic', true],
        ['工序类型', 'type', '下拉选项', 'basic', true],
        ['工序参数', 'parameters', '子表', 'basic', false],
        ['标准工时', 'standardTime', '数字', 'resource', false],
        ['准备工时', 'prepareTime', '数字', 'resource', false],
        ['设备要求', 'equipment', '文本', 'resource', false],
        ['工装要求', 'tooling', '文本', 'resource', false],
        ['人员技能', 'skill', '文本', 'resource', false],
        ['质检点', 'qcPoints', '子表', 'quality', false],
        ['资源要求', 'resources', '子表', 'resource', false],
        ['适用范围', 'useScope', '文本', 'basic', false],
      ]),
    },
    approvals: { addText: '新增工序审批规则', methods: operationApprovalMethods, rows: approvalRows('rd_process', [['工序发布审批', '新增工序', '工艺主管'], ['工序变更审批', '变更影响', '生产主管']]) },
    strategies: rdStrategyTabs('工序', rdProcessStrategies),
  },
  rdCrafts: {
    ...templateBase('rdCrafts', 'rd', '工艺', 'rd-crafts', '/rd/crafts', 'CRAFT'),
    extraLists: {
      categories: categoryList('rd_craft', '工艺', [['标准工艺', '工艺库', 'std', 12], ['试制工艺', '工艺库', 'trial', 5], ['委外工艺', '工艺库', 'outsource', 4], ['返工工艺', '工艺库', 'rework', 3]]),
    },
    fields: {
      addText: '新增工艺字段',
      scopes: [
        { key: 'basic', label: '工艺信息' },
        { key: 'process', label: '工序明细' },
        { key: 'release', label: '发布记录' },
      ],
      rows: fieldRows('rd_craft', [
        ['工艺编码', 'code', '自动编号', 'basic', true],
        ['工艺名称', 'name', '文本', 'basic', true],
        ['工艺类型', 'type', '下拉选项', 'basic', true],
        ['适用产品', 'productName', '对象选择', 'basic', true],
        ['工艺版本', 'version', '文本', 'basic', false],
        ['工艺状态', 'status', '状态', 'basic', false],
        ['工序明细', 'processLines', '子表', 'process', true],
        ['设备要求', 'equipment', '文本', 'process', false],
        ['工装要求', 'tooling', '文本', 'process', false],
        ['质检点', 'qcPoints', '子表', 'process', false],
        ['发布人', 'publisherName', '人员选择', 'release', false],
        ['发布时间', 'publishedAt', '日期', 'release', false],
        ['变更说明', 'changeRemark', '富文本', 'release', false],
      ]),
    },
    approvals: { addText: '新增工艺审批规则', methods: operationApprovalMethods, rows: approvalRows('rd_craft', [['工艺发布审批', '发布工艺', '工艺主管'], ['工艺变更审批', '版本变更', '研发主管']]) },
    strategies: rdStrategyTabs('工艺', rdCraftStrategies),
  },
  rdBoms: {
    ...templateBase('rdBoms', 'rd', 'BOM', 'rd-boms', '/rd/bom', 'BOM'),
    extraLists: {
      categories: categoryList('rd_bom', 'BOM', [['成品BOM', 'BOM库', 'finished', 16], ['半成品BOM', 'BOM库', 'semi', 12], ['工程BOM', 'BOM库', 'engineering', 8], ['虚拟BOM', 'BOM库', 'virtual', 5]]),
      template: bomTemplateList(),
    },
    fields: {
      addText: '新增BOM字段',
      scopes: [
        { key: 'basic', label: 'BOM信息' },
        { key: 'structure', label: 'BOM结构' },
        { key: 'release', label: '替代/发布' },
      ],
      rows: fieldRows('rd_bom', [
        ['BOM编码', 'code', '自动编号', 'basic', true],
        ['BOM名称', 'name', '文本', 'basic', true],
        ['BOM分类', 'type', '下拉选项', 'basic', true],
        ['适用产品', 'productName', '对象选择', 'basic', true],
        ['版本号', 'version', '文本', 'basic', false],
        ['BOM状态', 'status', '状态', 'basic', false],
        ['BOM结构', 'lines', '子表', 'structure', true],
        ['层级', 'level', '文本', 'structure', false],
        ['物料编码', 'materialCode', '对象选择', 'structure', true],
        ['用量', 'usageQty', '数字', 'structure', true],
        ['损耗率', 'lossRate', '数字', 'structure', false],
        ['替代料', 'substitutes', '子表', 'release', false],
        ['发布记录', 'releaseRecords', '子表', 'release', false],
        ['模板', 'templateId', '下拉选项', 'basic', false],
      ]),
    },
    approvals: { addText: '新增BOM审批规则', methods: operationApprovalMethods, rows: approvalRows('rd_bom', [['BOM发布审批', '发布BOM', '研发主管'], ['替代料审批', '替代物料', '工艺主管']]) },
    strategies: rdStrategyTabs('BOM', rdBomStrategies),
  },
  warehouseStocks: {
    ...templateBase('warehouseStocks', 'warehouse', '库存', 'inventory-stocks', '/warehouse/inventory-stocks', 'STK'),
    fields: {
      addText: '新增库存字段',
      scopes: [
        { key: 'material', label: '物料信息' },
        { key: 'quantity', label: '库存数量' },
        { key: 'trace', label: '批次/追溯' },
      ],
      rows: fieldRows('warehouse_stock', [
        ['台账编号', 'ledgerNo', '文本', 'trace', true],
        ['物料编码', 'materialCode', '文本', 'material', true],
        ['物料名称', 'materialName', '文本', 'material', true],
        ['规格型号', 'spec', '文本', 'material', false],
        ['物料分类', 'categoryName', '下拉选项', 'material', false],
        ['仓库', 'warehouseName', '下拉选项', 'quantity', true],
        ['库位', 'locationName', '下拉选项', 'quantity', false],
        ['批次', 'batchNo', '文本', 'trace', false],
        ['库存数量', 'stockQuantity', '数字', 'quantity', true],
        ['可用数量', 'availableQuantity', '数字', 'quantity', true],
        ['占用数量', 'occupiedQuantity', '数字', 'quantity', false],
        ['冻结数量', 'lockedQuantity', '数字', 'quantity', false],
        ['在途数量', 'inTransitQuantity', '数字', 'quantity', false],
        ['质量状态', 'qualityStatusName', '状态', 'trace', false],
        ['成本层', 'costLayer', '文本', 'trace', false],
      ]),
    },
    approvals: { addText: '新增库存审批规则', methods: operationApprovalMethods, rows: approvalRows('warehouse_stock', [['库存调整审批', '库存调整', '仓库主管'], ['冻结/解冻审批', '库存冻结', '质量主管']]) },
    strategies: { title: '库存策略设置', description: '按库存管理原型配置数量口径、质量状态、成本层、物码追踪和库存流水。', tabs: warehouseStockStrategies },
  },
  warehouseInbounds: {
    ...templateBase('warehouseInbounds', 'warehouse', '入库', 'warehouse-inbounds', '/warehouse/warehouse-inbounds', 'RK'),
    fields: {
      addText: '新增入库字段',
      scopes: [
        { key: 'basic', label: '基础信息' },
        { key: 'detail', label: '物品明细' },
        { key: 'post', label: '质检/上架/过账' },
      ],
      rows: fieldRows('warehouse_inbound', [
        ['入库主题', 'subject', '文本', 'basic', true],
        ['入库单号', 'code', '自动编号', 'basic', true],
        ['入库类型', 'inboundTypeName', '下拉选项', 'basic', true],
        ['入库仓库', 'warehouseName', '下拉选项', 'basic', true],
        ['关联单据', 'relatedCode', '关联单据', 'basic', false],
        ['入库部门', 'departmentName', '文本', 'basic', false],
        ['入库人员', 'personName', '人员选择', 'basic', true],
        ['入库日期', 'inboundDate', '日期', 'basic', true],
        ['经办人', 'operatorName', '人员选择', 'basic', false],
        ['物品明细', 'lines', '子表', 'detail', true],
        ['批次号', 'batchNo', '文本', 'detail', false],
        ['序列号', 'serialNo', '文本', 'detail', false],
        ['库位', 'locationName', '下拉选项', 'detail', false],
        ['质检状态', 'qualityStatusName', '状态', 'post', false],
        ['上架状态', 'lineStatusName', '状态', 'post', false],
        ['过账状态', 'postStatus', '状态', 'post', false],
      ]),
    },
    approvals: { addText: '新增入库审批规则', methods: operationApprovalMethods, rows: approvalRows('warehouse_inbound', [['直接入库审批', '直接入库', '仓库主管'], ['让步入库审批', '质检让步', '质量主管']]) },
    strategies: { title: '入库策略设置', description: '按入库原型配置来源、质检、上架、物码绑定、过账和来源回写。', tabs: inboundStrategies },
  },
  warehouseOutbounds: {
    ...templateBase('warehouseOutbounds', 'warehouse', '出库', 'warehouse-outbounds', '/warehouse/warehouse-outbounds', 'CK'),
    fields: {
      addText: '新增出库字段',
      scopes: [
        { key: 'basic', label: '基础信息' },
        { key: 'detail', label: '物品明细' },
        { key: 'pick', label: '拣货/复核/过账' },
      ],
      rows: fieldRows('warehouse_outbound', [
        ['出库主题', 'subject', '文本', 'basic', true],
        ['出库单号', 'code', '自动编号', 'basic', true],
        ['出库类型', 'outboundTypeName', '下拉选项', 'basic', true],
        ['出库仓库', 'warehouseName', '下拉选项', 'basic', true],
        ['关联单据', 'relatedCode', '关联单据', 'basic', false],
        ['出库部门', 'departmentName', '文本', 'basic', false],
        ['出库人员', 'personName', '人员选择', 'basic', true],
        ['出库日期', 'outboundDate', '日期', 'basic', true],
        ['目标对象', 'targetName', '文本', 'basic', false],
        ['目的地', 'destination', '文本', 'basic', false],
        ['物品明细', 'lines', '子表', 'detail', true],
        ['推荐库位', 'locationName', '下拉选项', 'pick', false],
        ['拣货数量', 'pickQuantity', '数字', 'pick', false],
        ['复核数量', 'checkQuantity', '数字', 'pick', false],
        ['发货数量', 'shipQuantity', '数字', 'pick', false],
        ['OQC状态', 'oqcStatusName', '状态', 'pick', false],
        ['过账状态', 'postStatus', '状态', 'pick', false],
      ]),
    },
    approvals: { addText: '新增出库审批规则', methods: operationApprovalMethods, rows: approvalRows('warehouse_outbound', [['直接出库审批', '直接出库', '仓库主管'], ['短拣差异审批', '拣货复核', '质量主管']]) },
    strategies: { title: '出库策略设置', description: '按出库原型配置出库来源、占用、拣货、复核、OQC 放行和库存扣减。', tabs: outboundStrategies },
  },
  warehouseTransfers: {
    ...templateBase('warehouseTransfers', 'warehouse', '调拨', 'warehouse-transfers', '/warehouse/warehouse-transfers', 'DB'),
    fields: {
      addText: '新增调拨字段',
      scopes: [
        { key: 'basic', label: '基础信息' },
        { key: 'detail', label: '调拨明细' },
        { key: 'difference', label: '差异处理' },
      ],
      rows: fieldRows('warehouse_transfer', [
        ['调拨主题', 'subject', '文本', 'basic', true],
        ['调拨单号', 'code', '自动编号', 'basic', true],
        ['调出仓库', 'fromWarehouseName', '下拉选项', 'basic', true],
        ['调入仓库', 'toWarehouseName', '下拉选项', 'basic', true],
        ['调拨日期', 'transferDate', '日期', 'basic', true],
        ['调拨人', 'operatorName', '人员选择', 'basic', true],
        ['调拨部门', 'departmentName', '文本', 'basic', false],
        ['调拨原因', 'reason', '文本', 'basic', false],
        ['物料明细', 'lines', '子表', 'detail', true],
        ['调出库位', 'fromLocationName', '下拉选项', 'detail', true],
        ['调入库位', 'toLocationName', '下拉选项', 'detail', true],
        ['调拨数量', 'quantity', '数字', 'detail', true],
        ['调出确认', 'outQuantity', '数字', 'detail', false],
        ['调入确认', 'inQuantity', '数字', 'detail', false],
        ['差异数量', 'differenceQuantity', '数字', 'difference', false],
        ['差异处理方式', 'differenceDispose', '下拉选项', 'difference', false],
      ]),
    },
    approvals: { addText: '新增调拨审批规则', methods: operationApprovalMethods, rows: approvalRows('warehouse_transfer', [['调拨提交审批', '新增调拨', '仓库主管'], ['调拨差异审批', '差异处理', '财务复核']]) },
    strategies: { title: '调拨策略设置', description: '按调拨原型配置冻结、调出调入双确认、质量状态继承和差异处理。', tabs: transferStrategies },
  },
  inventoryCounts: {
    ...templateBase('inventoryCounts', 'warehouse', '盘点', 'inventory-counts', '/warehouse/inventory-counts', 'PD'),
    fields: {
      addText: '新增盘点字段',
      scopes: [
        { key: 'basic', label: '基础信息' },
        { key: 'detail', label: '盘点明细' },
        { key: 'adjust', label: '差异调整' },
      ],
      rows: fieldRows('inventory_count', [
        ['盘点主题', 'subject', '文本', 'basic', true],
        ['盘点编号', 'code', '自动编号', 'basic', true],
        ['盘点仓库', 'warehouseName', '下拉选项', 'basic', true],
        ['盘点范围', 'scope', '下拉选项', 'basic', true],
        ['锁库范围', 'lockScope', '文本', 'basic', false],
        ['是否锁库', 'locked', '下拉选项', 'basic', true],
        ['盘点人', 'checkerName', '人员选择', 'basic', true],
        ['盘点日期', 'countDate', '日期', 'basic', true],
        ['物品明细', 'lines', '子表', 'detail', true],
        ['账面数量', 'bookQuantity', '数字', 'detail', true],
        ['实盘数量', 'actualQuantity', '数字', 'detail', true],
        ['复盘数量', 'recheckQuantity', '数字', 'detail', false],
        ['差异数量', 'differenceQuantity', '数字', 'adjust', false],
        ['差异原因', 'differenceReason', '下拉选项', 'adjust', false],
        ['调整单号', 'adjustmentCode', '关联单据', 'adjust', false],
        ['处理方式', 'disposeMethod', '下拉选项', 'adjust', false],
      ]),
    },
    approvals: { addText: '新增盘点审批规则', methods: operationApprovalMethods, rows: approvalRows('inventory_count', [['盘点计划审批', '盘点计划', '仓库主管'], ['盘点差异审批', '差异调整', '财务复核']]) },
    strategies: { title: '盘点策略设置', description: '按盘点原型配置盘点范围、周期计划、锁库、复盘、差异调整和释放锁库。', tabs: inventoryStrategies },
  },
  warehouseLocations: {
    ...templateBase('warehouseLocations', 'warehouse', '库位', 'warehouse-locations', '/warehouse/warehouse-locations', 'KW'),
    fields: {
      addText: '新增库位字段',
      scopes: [
        { key: 'warehouse', label: '仓库' },
        { key: 'area', label: '库区' },
        { key: 'location', label: '库位' },
      ],
      rows: fieldRows('warehouse_location', [
        ['新增类型', 'createType', '下拉选项', 'warehouse', true],
        ['仓库名称', 'warehouseName', '文本', 'warehouse', true],
        ['仓库编码', 'warehouseCode', '自动编号', 'warehouse', false],
        ['仓库类型', 'warehouseType', '下拉选项', 'warehouse', true],
        ['仓库负责人', 'managerName', '人员选择', 'warehouse', true],
        ['联系方式', 'phone', '文本', 'warehouse', false],
        ['仓库地址', 'address', '文本', 'warehouse', true],
        ['温区', 'temperatureZone', '下拉选项', 'area', false],
        ['容量', 'capacity', '数字', 'area', false],
        ['库区名称', 'areaName', '文本', 'area', true],
        ['库区编码', 'areaCode', '自动编号', 'area', false],
        ['库位名称', 'locationName', '文本', 'location', true],
        ['库位编码', 'locationCode', '自动编号', 'location', false],
        ['库位状态', 'statusName', '状态', 'location', true],
      ]),
    },
    approvals: { addText: '新增库位审批规则', methods: operationApprovalMethods, rows: approvalRows('warehouse_location', [['仓库启停审批', '仓库维护', '仓库主管'], ['库位容量变更审批', '库位维护', '仓库主管']]) },
    strategies: { title: '库位策略设置', description: '按仓库库位原型配置仓库、库区、库位、温区、容量和上架推荐。', tabs: locationStrategies },
  },
  productionDemands: {
    ...templateBase('productionDemands', 'production', '生产需求', 'production-demands', '/production/production-demands', 'MR'),
    fields: {
      addText: '新增生产需求字段',
      scopes: [
        { key: 'basic', label: '基础信息' },
        { key: 'source', label: '来源信息' },
        { key: 'detail', label: '产品明细' },
      ],
      rows: fieldRows('production_demand', [
        ['需求主题', 'subject', '文本', 'basic', true],
        ['需求编号', 'code', '自动编号', 'basic', true],
        ['生产来源', 'sourceTypeName', '下拉选项', 'source', true],
        ['销售订单', 'sourceCode', '关联单据', 'source', false],
        ['客户名称', 'customerName', '文本', 'source', false],
        ['订单交付日期', 'deliveryDate', '日期', 'source', false],
        ['生产项目', 'projectName', '文本', 'basic', false],
        ['目标仓库', 'targetWarehouseName', '下拉选项', 'basic', false],
        ['生产部门', 'departmentName', '文本', 'basic', false],
        ['负责人', 'ownerName', '人员选择', 'basic', true],
        ['计划开始日期', 'planStartDate', '日期', 'basic', false],
        ['计划完成日期', 'planEndDate', '日期', 'basic', false],
        ['优先级', 'priorityName', '下拉选项', 'basic', false],
        ['产品明细', 'lines', '子表', 'detail', true],
        ['需求数量', 'demandQuantity', '数字', 'detail', true],
        ['计划数量', 'planQuantity', '数字', 'detail', false],
        ['BOM版本', 'bomVersion', '文本', 'detail', false],
        ['工艺路线', 'routeCode', '文本', 'detail', false],
      ]),
    },
    approvals: { addText: '新增生产需求审批规则', methods: operationApprovalMethods, rows: approvalRows('production_demand', [['生产需求确认审批', '需求确认', '生产主管'], ['需求转订单审批', '需求转单', '计划员']]) },
    strategies: { title: '生产需求策略设置', description: '按生产需求原型配置需求来源、确认、交付日期带入、转计划和转订单。', tabs: demandStrategies },
  },
  productionPlans: {
    ...templateBase('productionPlans', 'production', '生产计划', 'production-plans', '/production/production-plans', 'MP'),
    fields: {
      addText: '新增生产计划字段',
      scopes: [
        { key: 'basic', label: '基础信息' },
        { key: 'detail', label: '产品明细' },
        { key: 'execution', label: '执行追踪' },
      ],
      rows: fieldRows('production_plan', [
        ['计划主题', 'subject', '文本', 'basic', true],
        ['计划编号', 'code', '自动编号', 'basic', true],
        ['来源需求', 'sourceDemandCode', '关联单据', 'basic', false],
        ['来源明细', 'sourceLineCode', '文本', 'detail', false],
        ['来源客户/项目', 'sourceCustomer', '文本', 'basic', false],
        ['计划产品', 'productName', '文本', 'detail', true],
        ['计划数量', 'planQuantity', '数字', 'detail', true],
        ['计划开始', 'planStartDate', '日期', 'basic', true],
        ['计划完成', 'planEndDate', '日期', 'basic', true],
        ['产品明细', 'lines', '子表', 'detail', true],
        ['齐套预估', 'kittingStatusName', '状态', 'execution', false],
        ['计划进度', 'progress', '数字', 'execution', false],
        ['计划说明', 'remarkText', '富文本', 'execution', false],
      ]),
    },
    approvals: { addText: '新增生产计划审批规则', methods: operationApprovalMethods, rows: approvalRows('production_plan', [['生产计划审批', '新增计划', '计划主管'], ['齐套异常审批', '齐套检查', '生产主管']]) },
    strategies: { title: '生产计划策略设置', description: '按生产计划原型配置来源需求、齐套检查、审批后生成订单和执行进度。', tabs: planStrategies },
  },
  productionOrders: {
    ...templateBase('productionOrders', 'production', '生产订单', 'production-orders', '/production/production-orders', 'MO'),
    fields: {
      addText: '新增生产订单字段',
      scopes: [
        { key: 'basic', label: '基础信息' },
        { key: 'version', label: 'BOM/工艺' },
        { key: 'work', label: '工单明细' },
      ],
      rows: fieldRows('production_order', [
        ['生产主题', 'subject', '文本', 'basic', true],
        ['生产编号', 'code', '自动编号', 'basic', true],
        ['来源需求', 'sourceDemandCode', '关联单据', 'basic', false],
        ['来源明细', 'sourceLineCode', '文本', 'basic', false],
        ['来源客户/项目', 'sourceCustomer', '文本', 'basic', false],
        ['生产产品', 'productName', '文本', 'basic', true],
        ['生产数量', 'quantity', '数字', 'basic', true],
        ['BOM版本', 'bomVersion', '文本', 'version', true],
        ['工艺路线', 'routeCode', '文本', 'version', true],
        ['生产状态', 'statusName', '状态', 'basic', false],
        ['工单明细', 'workOrders', '子表', 'work', false],
        ['领退料记录', 'materialRecords', '子表', 'work', false],
        ['订单详情', 'remarkText', '富文本', 'work', false],
      ]),
    },
    approvals: { addText: '新增生产订单审批规则', methods: operationApprovalMethods, rows: approvalRows('production_order', [['生产订单审批', '新增订单', '生产主管'], ['BOM/工艺锁版审批', '锁版发布', '工艺主管']]) },
    strategies: { title: '生产订单策略设置', description: '按生产订单原型配置订单来源、BOM/工艺锁版、工单拆解、领退料和完工入库。', tabs: productionOrderStrategies },
  },
  productionWorkOrders: {
    ...templateBase('productionWorkOrders', 'production', '生产工单', 'production-work-orders', '/production/production-work-orders', 'WO'),
    fields: {
      addText: '新增生产工单字段',
      scopes: [
        { key: 'basic', label: '基础信息' },
        { key: 'dispatch', label: '领工/派工' },
        { key: 'report', label: '报工/质检' },
      ],
      rows: fieldRows('production_work_order', [
        ['生产工单', 'workOrderCode', '自动编号', 'basic', true],
        ['生产产品', 'productName', '文本', 'basic', true],
        ['工序', 'processName', '文本', 'basic', true],
        ['工位/产线', 'stationName', '文本', 'basic', false],
        ['计划数量', 'plannedQuantity', '数字', 'basic', true],
        ['可领取数量', 'claimableQuantity', '数字', 'dispatch', false],
        ['已派工数量', 'dispatchedQuantity', '数字', 'dispatch', false],
        ['已报工数量', 'reportedQuantity', '数字', 'report', false],
        ['合格数量', 'qualifiedQuantity', '数字', 'report', false],
        ['不良数量', 'badQuantity', '数字', 'report', false],
        ['报工来源', 'sourceMode', '下拉选项', 'report', false],
        ['报工人', 'reporterName', '人员选择', 'report', false],
        ['报工时间', 'reportedAt', '日期', 'report', false],
        ['质检节点', 'qualityStatusName', '状态', 'report', false],
      ]),
    },
    approvals: { addText: '新增生产工单审批规则', methods: operationApprovalMethods, rows: approvalRows('production_work_order', [['派工审批', '工单派工', '生产主管'], ['报工异常审批', '报工质检', '质量主管']]) },
    strategies: { title: '生产工单策略设置', description: '按生产工单原型配置领工派工、报工数量约束、人员选择、报工记录和质检节点。', tabs: workOrderStrategies },
  },
  productionSchedules: {
    ...templateBase('productionSchedules', 'production', '生产排班', 'production-schedules', '/production/production-schedules', 'SP'),
    fields: {
      addText: '新增排班字段',
      scopes: [
        { key: 'basic', label: '基础信息' },
        { key: 'roster', label: '排班网格' },
        { key: 'validate', label: '冲突校验' },
      ],
      rows: fieldRows('production_schedule', [
        ['计划编号', 'planCode', '自动编号', 'basic', true],
        ['计划名称', 'planName', '文本', 'basic', true],
        ['适用班组', 'teamName', '下拉选项', 'basic', true],
        ['循环模式', 'pattern', '文本', 'basic', true],
        ['参考工作日历', 'calendarName', '下拉选项', 'basic', true],
        ['排班周期', 'period', '日期范围', 'basic', true],
        ['人数', 'people', '数字', 'basic', false],
        ['计划工时', 'plannedHours', '数字', 'basic', false],
        ['需求工时', 'demandHours', '数字', 'validate', false],
        ['覆盖率', 'coverage', '百分比', 'validate', false],
        ['冲突数', 'conflictCount', '数字', 'validate', false],
        ['班次', 'shiftCode', '下拉选项', 'roster', true],
        ['调整原因', 'adjustReason', '文本', 'roster', false],
        ['审批状态', 'approvalStatus', '状态', 'validate', false],
      ]),
    },
    approvals: { addText: '新增排班审批规则', methods: operationApprovalMethods, rows: approvalRows('production_schedule', [['排班发布审批', '排班发布', '生产主管'], ['加班排班审批', '临时加班', '生产经理']]) },
    strategies: { title: '生产排班策略设置', description: '按生产排班原型配置排班策略、休息间隔、周工时上限、冲突校验和发布后调整。', tabs: productionScheduleStrategies },
  },
  outsourceOrders: {
    ...templateBase('outsourceOrders', 'production', '委外加工', 'outsource-orders', '/production/outsource-orders', 'OS'),
    fields: {
      addText: '新增委外字段',
      scopes: [
        { key: 'basic', label: '基础信息' },
        { key: 'issue', label: '委外发料' },
        { key: 'receive', label: '委外入库' },
      ],
      rows: fieldRows('outsource_order', [
        ['委外主题', 'subject', '文本', 'basic', true],
        ['委外单号', 'code', '自动编号', 'basic', true],
        ['委外方式', 'outsourceMode', '下拉选项', 'basic', true],
        ['委外加工商', 'supplierName', '供应商选择', 'basic', true],
        ['发料方式', 'issueMode', '下拉选项', 'basic', false],
        ['来源单据', 'sourceCode', '关联单据', 'basic', false],
        ['来源产品', 'sourceProductName', '文本', 'basic', false],
        ['委外数量', 'quantity', '数字', 'basic', true],
        ['委外成本', 'outsourceCost', '金额', 'basic', false],
        ['交付日期', 'deliveryDate', '日期', 'basic', false],
        ['委外明细', 'lines', '子表', 'basic', true],
        ['委外发料', 'issueRecords', '子表', 'issue', false],
        ['应发数量', 'shouldIssueQuantity', '数字', 'issue', false],
        ['累计已发', 'issuedQuantity', '数字', 'issue', false],
        ['委外入库', 'receiveRecords', '子表', 'receive', false],
        ['质检合格', 'qualifiedQuantity', '数字', 'receive', false],
        ['本次入库', 'inboundQuantity', '数字', 'receive', false],
      ]),
    },
    approvals: { addText: '新增委外审批规则', methods: operationApprovalMethods, rows: approvalRows('outsource_order', [['委外加工审批', '新增委外', '生产主管'], ['委外发料审批', '委外发料', '仓库主管']]) },
    strategies: { title: '委外加工策略设置', description: '按委外加工原型配置委外来源、加工商、审批后发料、仓储出库和委外入库。', tabs: outsourceStrategies },
  },
};
