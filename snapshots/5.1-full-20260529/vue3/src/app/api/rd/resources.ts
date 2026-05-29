import { request } from '@/app/request/http';
import { operationSettingTemplates } from '@/app/templates/operation-settings-template';
import type { AwTableColumn, AwTreeNode } from '@/components/list-page/types';
import type { EditableColumn } from '@/components/form-page/types';
import type { PersonPickerDept } from '@/components/setting-page/types';

export type RdModule = 'docs' | 'projects' | 'products' | 'materials' | 'processes' | 'crafts' | 'boms';

export interface RdListConfig {
  module: RdModule;
  title: string;
  resource: string;
  route: string;
  createLabel: string;
  searchPlaceholder: string;
  treeTitle?: string;
  treeNodes?: AwTreeNode[];
  treeFilterKey?: string;
  columns: AwTableColumn[];
  fitWidth?: boolean;
  bulkActions?: { key: string; label: string }[];
}

export interface RdCreateSection {
  title: string;
  fields: RdField[];
}

export interface RdCreateTab {
  key: string;
  label: string;
  sections?: RdCreateSection[];
  subTables?: RdSubTable[];
}

export interface RdField {
  key: string;
  label: string;
  type?: 'text' | 'select' | 'date' | 'number' | 'person' | 'picker' | 'categoryPicker' | 'textarea' | 'readonly';
  required?: boolean;
  placeholder?: string;
  options?: string[];
  picker?: 'product' | 'material' | 'supplier' | 'source';
  defaultValue?: string | number;
}

export interface RdCreateConfig {
  title: string;
  submitText: string;
  sections: RdCreateSection[];
  subTables?: RdSubTable[];
  tabs?: RdCreateTab[];
  richTextLabel?: string | null;
  richTextSectionTitle?: string;
  richTextFields?: RdField[];
  attachmentLabel?: string | null;
}

export interface RdSubTable {
  key: string;
  title: string;
  addText: string;
  columns: EditableColumn[];
  rows: Record<string, any>[];
}

export interface RdPickerRow {
  id: string;
  code: string;
  name: string;
  category?: string;
  model?: string;
  unit?: string;
  owner?: string;
  extra?: string;
}

export interface RdDocCategoryPickerRow {
  id: string;
  name: string;
  code: string;
  sort: number;
  enabled: boolean;
  parentKey: string;
  parentName: string;
}

export interface RdDocCategoryPickerGroup {
  key: string;
  name: string;
  rows: RdDocCategoryPickerRow[];
}

export interface RdCraftTemplate {
  key: string;
  name: string;
  type: 'in' | 'out';
  category: string;
  icon: string;
  setupTime: number;
  runTime: number;
  laborCount: number;
}

export interface RdCraftOutputRow {
  id: string;
  name: string;
  qty: string;
  unit: string;
}

export interface RdCraftTechParam {
  id: string;
  name: string;
  value: string;
}

export interface RdCreatePayload {
  module: RdModule;
  action?: string;
  form: Record<string, any>;
  lines?: Record<string, any>[];
}

export interface RdDetailAction {
  key: string;
  label: string;
  danger?: boolean;
}

export interface RdDetailTab {
  key: string;
  label: string;
}

export interface RdDetailField {
  label: string;
  value: string;
}

export interface RdDetailMetric {
  label: string;
  value: string;
  tone?: string;
}

export interface RdDetailTableSection {
  key: string;
  type: 'table';
  title: string;
  columns: string[];
  rows: string[][];
}

export interface RdDetailFieldsSection {
  key: string;
  type: 'fields';
  title: string;
  fields: RdDetailField[];
}

export interface RdDetailRichTextSection {
  key: string;
  type: 'richText';
  title: string;
  content: string;
}

export interface RdDetailAttachmentSection {
  key: string;
  type: 'attachments';
  title: string;
  rows: Array<{ name: string; size: string; uploader: string; time: string }>;
}

export interface RdDetailTimelineSection {
  key: string;
  type: 'timeline';
  title: string;
  rows: Array<{ operator: string; action: string; time: string; result?: string }>;
}

export interface RdDetailBomTreeSection {
  key: string;
  type: 'bomTree';
  title: string;
  tree: BomNode[];
}

export interface RdDetailCraftRouteSection {
  key: string;
  type: 'craftRoute';
  title: string;
  stages: RdCraftStage[];
}

export type RdDetailSection =
  | RdDetailFieldsSection
  | RdDetailTableSection
  | RdDetailRichTextSection
  | RdDetailAttachmentSection
  | RdDetailTimelineSection
  | RdDetailBomTreeSection
  | RdDetailCraftRouteSection;

export interface RdDetailRecord {
  id: string;
  module: RdModule;
  title: string;
  code: string;
  statusText: string;
  statusTone: string;
  metas: RdDetailField[];
  actions: RdDetailAction[];
  tabs: RdDetailTab[];
  metrics?: RdDetailMetric[];
  sections: Record<string, RdDetailSection[]>;
}

export interface RdCraftOperation {
  id: string;
  code: string;
  name: string;
  type: 'in' | 'out';
  category: string;
  icon?: string;
  workCenter: string;
  equipment: string;
  supplier?: string;
  agreement?: string;
  setupTime: number;
  runTime: number;
  queueTime: number;
  laborCount: number;
  costRate: number;
  qcRequired: boolean;
  qcPlan: string;
  sopCode: string;
  materialRows: string[][];
  wasteRows: string[][];
  outputRows?: RdCraftOutputRow[];
  techParams?: RdCraftTechParam[];
  remark?: string;
}

export interface RdCraftStage {
  id: string;
  kind: 'seq' | 'par';
  ops: RdCraftOperation[];
}

export interface BomAttrPreset {
  key: string;
  label: string;
  fieldType: '文本' | '数字' | '下拉';
  defaultValue: string;
  showInTable: boolean;
  required?: boolean;
  options?: string[];
}

export interface BomNode {
  id: string;
  code: string;
  name: string;
  spec: string;
  type: string;
  unit: string;
  qty: number | string;
  loss: number | string;
  price: number | string;
  processOp?: string;
  variants?: Record<string, string[]>;
  customAttrs?: Record<string, string>;
  alts?: Array<{ code: string; name: string; priority: number | string }>;
  logs?: Array<{ v: string; text: string }>;
  remark?: string;
  children?: BomNode[];
}

export interface BomMaterialOption {
  code: string;
  name: string;
  category: string;
  spec: string;
  type: string;
  unit: string;
  price: number;
}

const rdResourceMap: Record<RdModule, string> = {
  docs: 'rd-documents',
  projects: 'rd-projects',
  products: 'rd-products',
  materials: 'rd-materials',
  processes: 'rd-processes',
  crafts: 'rd-crafts',
  boms: 'rd-boms',
};

export const rdPeopleDepts: PersonPickerDept[] = [
  {
    key: 'rd',
    label: '研发中心',
    persons: [
      { id: 'RD001', name: '老夏', role: '研发主管', phone: '13800003001' },
      { id: 'RD002', name: '李文涛', role: '研发工程师', phone: '13800003002' },
      { id: 'RD003', name: '陈思源', role: '工艺工程师', phone: '13800003003' },
      { id: 'RD004', name: '赵工', role: '结构工程师', phone: '13800003004' },
    ],
  },
  {
    key: 'craft',
    label: '工艺组',
    persons: [
      { id: 'GY001', name: '王志强', role: '工艺主管', phone: '13800003101' },
      { id: 'GY002', name: '周明', role: '工艺员', phone: '13800003102' },
    ],
  },
];

export const rdPickerRows: Record<'product' | 'material' | 'supplier' | 'source', RdPickerRow[]> = {
  product: [
    { id: 'prd_iphone17', code: 'CP-20260521001', name: 'iPhone17', category: '成品', model: '17 / 17Pro / 17PM', unit: '台', owner: '老夏' },
    { id: 'prd_awh8', code: 'CP-20260519001', name: '智能温控锅 AW-H8', category: '成品', model: 'AW-H8', unit: '套', owner: '李文涛' },
    { id: 'prd_pcb', code: 'CP-20260519002', name: '控制板组件', category: '半成品', model: 'PCB-A2', unit: '块', owner: '陈思源' },
  ],
  material: [
    { id: 'mat_100', code: 'M-100', name: '智能温控锅总成', category: '成品', model: 'AW-H8', unit: '套', extra: '自制' },
    { id: 'mat_110', code: 'M-110', name: '机身子装配', category: '半成品', model: 'AW-HT', unit: '套', extra: '子装配' },
    { id: 'mat_111', code: 'M-111', name: '内胆不锈钢件', category: '机械物料', model: 'SUS304 拉伸件', unit: '件', extra: '自制' },
    { id: 'mat_112', code: 'M-112', name: '外壳注塑件', category: '结构件', model: 'ABS V0 白', unit: '件', extra: '外购' },
    { id: 'mat_121', code: 'M-121', name: '主控 PCB', category: '电子物料', model: 'ESP32-4R', unit: '片', extra: '外购' },
  ],
  supplier: [
    { id: 'sup_1', code: 'SUP-2025-001', name: '深圳华强电子', category: '电子元器件', owner: '张经理', extra: '合作中' },
    { id: 'sup_2', code: 'SUP-2025-002', name: '广州五金散热', category: '机械五金', owner: '王经理', extra: '合作中' },
  ],
  source: [
    { id: 'src_1', code: 'SO-20260517001', name: '海南微为智造温控锅订单', category: '销售订单', owner: '老夏', extra: '可转项目' },
    { id: 'src_2', code: 'PRJ-2025-001', name: '智能输送线系统研发', category: '项目', owner: '老夏', extra: '进行中' },
  ],
};

export const processStationOptions = [
  { code: 'GW-001', name: '车削工位A', line: '生产线1', workshop: '一车间', factory: '海南傲为工厂' },
  { code: 'GW-002', name: '铣削工位B', line: '生产线2', workshop: '二车间', factory: '海南傲为工厂' },
  { code: 'GW-003', name: '装配工位C', line: '装配线', workshop: '三车间', factory: '海南傲为工厂' },
  { code: 'GW-004', name: '检验工位D', line: '质检线', workshop: '三车间', factory: '海南傲为工厂' },
  { code: 'GW-005', name: '车削工位E', line: '生产线1', workshop: '一车间', factory: '海南傲为工厂' },
];

export const processByproductOptions = [
  { image: '', name: '温湿度传感器', code: 'CP-001', model: 'IWS-TH200', category: '废料', unit: '只', source: '自制件' },
  { image: '', name: '显示模组', code: 'CP-002', model: 'DSM-070', category: '其他', unit: '套', source: '自制件' },
];

export const processQcPlanOptions = [
  { code: 'IPQC-PLAN-001', name: '压装过程控制计划 V2.4', scope: '压装 / 装配工序', sampling: '首件全检 + 巡检5件/2h', control: '扭矩 / 压装深度 / 工装点检', owner: '王质检', state: '启用' },
  { code: 'IPQC-PLAN-002', name: '车削过程巡检方案 V1.8', scope: '车削 / 铣削', sampling: '首件全检 + 每批抽检3件', control: '尺寸精度 / 表面粗糙度 / 刀具寿命', owner: '李质检', state: '启用' },
  { code: 'IPQC-PLAN-003', name: '装配过程质量控制方案 V1.5', scope: '装配工序', sampling: '首件确认 + 每小时巡检', control: '紧固扭矩 / 密封性 / 功能测试', owner: '陈复检', state: '启用' },
  { code: 'IPQC-PLAN-004', name: '制程首件检验方案 V3.0', scope: '通用制程', sampling: '每班首件全检', control: '关键尺寸 / 外观 / 设备参数', owner: '质检主管', state: '待审核' },
];

export const rdCraftTemplates: RdCraftTemplate[] = [
  { key: 'cut', name: '切割', type: 'in', category: '加工', icon: '✂', setupTime: 15, runTime: 8, laborCount: 1 },
  { key: 'drill', name: '钻孔', type: 'in', category: '加工', icon: '⊙', setupTime: 10, runTime: 5, laborCount: 1 },
  { key: 'turn', name: '车削', type: 'in', category: '加工', icon: '⟲', setupTime: 20, runTime: 12, laborCount: 1 },
  { key: 'mill', name: '铣削', type: 'in', category: '加工', icon: '▤', setupTime: 25, runTime: 18, laborCount: 1 },
  { key: 'grind', name: '磨削', type: 'in', category: '加工', icon: '≋', setupTime: 15, runTime: 10, laborCount: 1 },
  { key: 'punch', name: '冲压', type: 'in', category: '加工', icon: '▼', setupTime: 20, runTime: 3, laborCount: 1 },
  { key: 'asm', name: '组装', type: 'in', category: '装配', icon: '⚙', setupTime: 10, runTime: 20, laborCount: 2 },
  { key: 'press', name: '压装', type: 'in', category: '装配', icon: '⇩', setupTime: 10, runTime: 6, laborCount: 1 },
  { key: 'tune', name: '调试', type: 'in', category: '装配', icon: '≡', setupTime: 5, runTime: 15, laborCount: 1 },
  { key: 'spray', name: '喷涂', type: 'in', category: '表面', icon: '❋', setupTime: 25, runTime: 12, laborCount: 1 },
  { key: 'polish', name: '抛光', type: 'in', category: '表面', icon: '◍', setupTime: 5, runTime: 8, laborCount: 1 },
  { key: 'clean', name: '清洗', type: 'in', category: '表面', icon: '⩒', setupTime: 5, runTime: 6, laborCount: 1 },
  { key: 'iqc', name: '来料检验', type: 'in', category: '检验', icon: '⊙', setupTime: 0, runTime: 4, laborCount: 1 },
  { key: 'ipqc', name: '过程检验', type: 'in', category: '检验', icon: '◎', setupTime: 0, runTime: 3, laborCount: 1 },
  { key: 'oqc', name: '出货检验', type: 'in', category: '检验', icon: '✓', setupTime: 0, runTime: 5, laborCount: 1 },
  { key: 'pack', name: '包装', type: 'in', category: '包装', icon: '▣', setupTime: 5, runTime: 5, laborCount: 1 },
  { key: 'ht', name: '委外热处理', type: 'out', category: '委外', icon: '🔥', setupTime: 0, runTime: 480, laborCount: 0 },
  { key: 'plate', name: '委外电镀', type: 'out', category: '委外', icon: '✦', setupTime: 0, runTime: 360, laborCount: 0 },
  { key: 'print', name: '委外印刷', type: 'out', category: '委外', icon: '🖨', setupTime: 0, runTime: 240, laborCount: 0 },
  { key: 'laser', name: '委外激光切割', type: 'out', category: '委外', icon: '⚡', setupTime: 0, runTime: 120, laborCount: 0 },
];

export const rdCraftPaletteGroupsIn = ['加工', '装配', '表面', '检验', '包装'];
export const rdCraftPaletteGroupsOut = ['委外'];
export const rdCraftProductOptions = ['智能控制器 A 型', '智能控制器 B 型'];
export const rdCraftCategoryOptions = ['电子装配', '机加工', '焊接', '表面处理', '包装'];
export const rdCraftSupplierOptions = ['南海五金加工厂', '恒晟电子', '华兴电镀', '瑞丰激光'];
export const rdCraftQcPlanOptions = ['首件 + 巡检', '随机抽检', '全检', '抽样 AQL 2.5'];

export const rdCraftDetailText = `本工艺适用于智能温控锅 AW-H8 整机制造，覆盖来料检验、关键零件加工、整机装配、委外热处理、功能调试、出货检验与包装入库全过程。

工艺路线采用串序与并序结合的组织方式：加工段支持切割、钻孔、车削并行处理，表面处理段支持委外热处理与本厂抛光同步推进；系统按并序节点最大时长计算工艺总时长。关键质量控制点包括来料检验、装配首件确认、功能全检和 OQC 全检。

执行时需优先使用已维护的工作中心、设备、SOP、检验方案和物料消耗标准。若出现尺寸超差、装配异常或功能测试不通过，应按质检策略进入返修或隔离流程，并记录异常原因、责任工序和复检结果。`;

let rdCraftOpSeq = 100;

export function createRdCraftOperationFromTemplate(template: RdCraftTemplate): RdCraftOperation {
  rdCraftOpSeq += 1;
  const isIn = template.type === 'in';
  const opId = `op-${rdCraftOpSeq}`;
  return {
    id: opId,
    code: `OP${1000 + rdCraftOpSeq}`,
    name: template.name,
    type: template.type,
    category: template.category,
    icon: template.icon,
    workCenter: isIn ? '一车间' : '',
    equipment: isIn ? (template.category === '加工' ? 'CNC-01' : '装配台 A') : '',
    supplier: isIn ? '' : '南海五金加工厂',
    agreement: isIn ? '' : 'XY-2026-007',
    setupTime: template.setupTime,
    runTime: template.runTime,
    queueTime: isIn ? 30 : 1440,
    laborCount: template.laborCount,
    costRate: isIn ? 1.2 : 8.5,
    qcRequired: template.category === '检验' || template.category === '装配',
    qcPlan: template.category === '检验' ? '首件 + 巡检' : '随机抽检',
    sopCode: `SOP-${Math.floor(Math.random() * 900) + 100}`,
    materialRows: [],
    wasteRows: [],
    outputRows: [
      {
        id: `out-${rdCraftOpSeq}`,
        name: template.category === '检验' ? '不合格隔离品' : '切削屑',
        qty: template.category === '检验' ? '按实' : '0.02',
        unit: template.category === '检验' ? '件' : 'kg',
      },
    ],
    techParams: [
      {
        id: `tp-${rdCraftOpSeq}-1`,
        name: '关键参数',
        value: template.category === '加工' ? '尺寸公差：±0.05mm；表面粗糙度：Ra 3.2' : '外观无划伤；功能测试通过率 ≥ 99%',
      },
      {
        id: `tp-${rdCraftOpSeq}-2`,
        name: '设备参数',
        value: isIn ? '设备点检完成；治具编号按工单带出。' : '委外参数由供应商工艺文件回传。',
      },
    ],
    remark: '',
  };
}

export function buildRdCraftDefaultStages(): RdCraftStage[] {
  const byKey = (key: string) => rdCraftTemplates.find((template) => template.key === key) || rdCraftTemplates[0];
  const seq = (key: string): RdCraftStage => ({ id: `st-${++rdCraftOpSeq}`, kind: 'seq', ops: [createRdCraftOperationFromTemplate(byKey(key))] });
  const par = (...keys: string[]): RdCraftStage => ({ id: `st-${++rdCraftOpSeq}`, kind: 'par', ops: keys.map((key) => createRdCraftOperationFromTemplate(byKey(key))) });
  return [
    seq('iqc'),
    par('cut', 'drill', 'turn'),
    seq('asm'),
    par('ht', 'polish'),
    seq('tune'),
    seq('oqc'),
    seq('pack'),
  ];
}

export const bomProcessOps = [
  { code: 'OP1010', name: '来料检验' },
  { code: 'OP1020', name: '切割' },
  { code: 'OP1030', name: '钻孔' },
  { code: 'OP1040', name: '组装' },
  { code: 'OP1050', name: '调试' },
  { code: 'OP1060', name: '出货检验' },
];

export const rdAttachmentTypeOptions = ['设计图纸', '技术文档', '图片附件', '审批材料'];
export const substituteStateOptions = ['启用', '待审核', '停用'];
export const bomHeaderTypeOptions = ['生产BOM', '工程BOM', '虚拟BOM'];
export const bomWorkflowOptions = ['研发 BOM 默认流程', '简化审批', '变更委员会审批'];
export const bomModelOptions = ['17', '17Pro', '17PM'];
export const bomVariantOptions = ['全部型号', ...bomModelOptions];
export const bomUnitOptions = ['套', '件', '片', '个', '根', '次', '项'];
export const bomTypeOptions = ['自制', '外购', '委外', '子装配', '原材料', '虚拟件', '包装'];
export const bomMaterialCategories = ['全部', '整机总成', '结构件', '主板模组', '摄像头模组', '电池模组', '包装套件'];

export const bomImportSteps = [
  { key: 'upload', title: '上传/粘贴', desc: '粘贴 Excel 明细或选择模板文件' },
  { key: 'mapping', title: '字段映射', desc: '确认模板列与 BOM 字段关系' },
  { key: 'preview', title: '预览校验', desc: '校验层级、用量、替代料和工序' },
  { key: 'write', title: '写入清单', desc: '生成可编辑 BOM 层级' },
];

export const bomImportMappingFields = [
  { target: '父项编码', source: 'parent_code', required: '否' },
  { target: '物料编码', source: 'material_code', required: '是' },
  { target: '物料名称', source: 'material_name', required: '是' },
  { target: '规格', source: 'spec', required: '否' },
  { target: '物料类型', source: 'type', required: '是' },
  { target: '单位', source: 'unit', required: '是' },
  { target: '用量', source: 'qty', required: '是' },
  { target: '损耗率', source: 'loss', required: '否' },
  { target: '关联工序', source: 'process_op', required: '否' },
  { target: '替代料', source: 'alts', required: '否' },
];

export const bomImportPreviewRows = [
  { no: '1', code: 'IP17-000', name: 'iPhone17 整机总成', parent: '-', qty: 1, loss: '0%', status: '通过' },
  { no: '1.1', code: 'IP17-110', name: '机身结构组件', parent: 'IP17-000', qty: 1, loss: '1%', status: '通过' },
  { no: '1.1.1', code: 'IP17-111', name: '17 / 17Pro 通用中框', parent: 'IP17-110', qty: 1, loss: '2%', status: '通过' },
  { no: '1.1.2', code: 'IP17-113', name: '17PM 专用后盖组件', parent: 'IP17-110', qty: 1, loss: '1%', status: '有替代料' },
  { no: '1.2', code: 'IP17-140', name: '包装套件', parent: 'IP17-000', qty: 1, loss: '2.5%', status: '通过' },
];

export const bomAttrPresets: BomAttrPreset[] = [
  { key: 'material', label: '材质', fieldType: '文本', defaultValue: 'ABS', showInTable: true },
  { key: 'surface', label: '表面处理', fieldType: '文本', defaultValue: '哑光', showInTable: false },
  { key: 'length', label: '长度', fieldType: '数字', defaultValue: '120', showInTable: true },
  { key: 'width', label: '宽度', fieldType: '数字', defaultValue: '80', showInTable: false },
  { key: 'height', label: '高度', fieldType: '数字', defaultValue: '36', showInTable: false },
  { key: 'weight', label: '重量', fieldType: '数字', defaultValue: '0.32', showInTable: true },
  { key: 'tolerance', label: '公差', fieldType: '文本', defaultValue: '±0.05', showInTable: false },
  { key: 'hardness', label: '硬度', fieldType: '文本', defaultValue: 'HRC 28', showInTable: false },
  { key: 'packing', label: '包装方式', fieldType: '下拉', defaultValue: '单件袋装', showInTable: false, options: ['单件袋装', '泡棉隔离', '纸箱'] },
  { key: 'unitPrice', label: '单价', fieldType: '数字', defaultValue: '0', showInTable: false },
  { key: 'workTime', label: '工时', fieldType: '数字', defaultValue: '0.2', showInTable: true },
  { key: 'supplier', label: '供应商', fieldType: '文本', defaultValue: '', showInTable: false },
  { key: 'remark', label: '备注', fieldType: '文本', defaultValue: '', showInTable: false },
];

export const bomMaterialPool: BomMaterialOption[] = [
  { code: 'IP17-000', name: 'iPhone17 整机总成', category: '整机总成', spec: '17/17Pro/17PM 通用', type: '自制', unit: '台', price: 0 },
  { code: 'IP17-110', name: '机身结构组件', category: '结构件', spec: '标准/Pro/PM', type: '子装配', unit: '套', price: 0 },
  { code: 'IP17-111', name: '17 标准中框', category: '结构件', spec: '铝合金 6.1寸', type: '自制', unit: '件', price: 42 },
  { code: 'IP17-112', name: '17Pro 钛合金中框', category: '结构件', spec: 'Pro 6.3寸', type: '外购', unit: '件', price: 88 },
  { code: 'IP17-113', name: '17PM 大尺寸后盖', category: '结构件', spec: 'PM 6.9寸', type: '外购', unit: '片', price: 96 },
  { code: 'IP17-120', name: '主板模组', category: '主板模组', spec: 'A系列主板', type: '子装配', unit: '套', price: 0 },
  { code: 'IP17-121', name: '标准版主控 PCB', category: '主板模组', spec: '17 专用', type: '外购', unit: '片', price: 155 },
  { code: 'IP17-122', name: 'Pro 主控 PCB', category: '主板模组', spec: '17Pro/17PM', type: '外购', unit: '片', price: 228 },
  { code: 'IP17-123', name: '摄像头模组', category: '摄像头模组', spec: '标准/Pro/PM', type: '外购', unit: '套', price: 180 },
  { code: 'IP17-124', name: 'Pro 长焦镜头', category: '摄像头模组', spec: '17Pro/17PM 专用', type: '外购', unit: '个', price: 95 },
  { code: 'IP17-130', name: '电池模组', category: '电池模组', spec: '按型号容量', type: '子装配', unit: '套', price: 0 },
  { code: 'IP17-131', name: '标准电池', category: '电池模组', spec: '17 专用', type: '外购', unit: '件', price: 46 },
  { code: 'IP17-132', name: '大容量电池', category: '电池模组', spec: '17Pro/17PM', type: '外购', unit: '件', price: 63 },
  { code: 'IP17-140', name: '包装套件', category: '包装套件', spec: '彩盒+说明书+数据线', type: '包装', unit: '套', price: 8.6 },
];

export const bomDetailText = `本物料清单适用于 iPhone17 主产品的研发试制与量产导入，覆盖 17、17Pro、17PM 三个型号的结构件、主板模组、摄像头模组、电池模组与包装套件等层级。

清单结构按父子件层级维护用量、损耗、替代料、适用型号和工序关联。自制件需要关联对应工序与工作中心，外购件需要维护供应商、单价和替代优先级；虚拟件仅用于工艺和成本归集，不参与实际库存扣减。`;

export const bomImportTree: BomNode[] = [
  {
    id: 'n-import-root',
    code: 'IP17-000',
    name: 'iPhone17 整机总成',
    spec: '17/17Pro/17PM',
    type: '自制',
    unit: '套',
    qty: 1,
    loss: 0,
    price: 0,
    processOp: 'OP1040',
    customAttrs: { material: '导入草稿', workTime: '0.8', weight: '4.8' },
    variants: { model: ['全部型号'] },
    logs: [{ v: 'V1.0', text: 'Excel 导入根物料' }],
    children: [
      {
        id: 'n-import-child',
        code: 'IP17-110',
        name: '机身结构组件',
        spec: '标准/Pro/PM',
        type: '子装配',
        unit: '套',
        qty: 1,
        loss: 1,
        price: 0,
        processOp: 'OP1040',
        customAttrs: { material: '导入草稿', workTime: '0.45', weight: '2.2' },
        variants: { model: ['全部型号'] },
        children: [
          { id: 'n-import-leaf-a', code: 'IP17-111', name: '17 / 17Pro 通用中框', spec: '铝合金中框', type: '自制', unit: '件', qty: 1, loss: 2, price: 42, processOp: 'OP1020', customAttrs: { material: '铝合金', workTime: '0.25', weight: '1.1' }, variants: { model: ['17', '17Pro'] }, children: [] },
          { id: 'n-import-leaf-b', code: 'IP17-113', name: '17PM 专用后盖组件', spec: '大尺寸后盖', type: '外购', unit: '件', qty: 1, loss: 1, price: 96, processOp: 'OP1010', customAttrs: { material: '玻璃', workTime: '0.03', weight: '0.7' }, variants: { model: ['17PM'] }, alts: [{ code: 'IP17-113-B', name: '17PM 后盖 B 供方', priority: 2 }], children: [] },
        ],
      },
      { id: 'n-import-pack', code: 'IP17-140', name: '包装套件', spec: '彩盒+说明书+数据线', type: '包装', unit: '套', qty: 1, loss: 2.5, price: 8.6, processOp: 'OP1060', customAttrs: { packing: '纸箱', workTime: '0.12', weight: '0.55' }, variants: { model: ['全部型号'] }, children: [] },
    ],
  },
];

export const bomCompareLeft = [
  { no: '1', code: 'M-100', name: '智能温控锅总成', qty: '1', price: '0', status: '' },
  { no: '1.1', code: 'M-110', name: '机身子装配', qty: '1', price: '0', status: '' },
  { no: '1.1.1', code: 'M-111', name: '内胆不锈钢件', qty: '1', price: '40', status: '变更前' },
  { no: '1.1.2', code: 'M-112', name: '外壳注塑件', qty: '1', price: '30', status: '变更前' },
  { no: '1.1.3', code: 'M-113-OLD', name: '旧隔热垫', qty: '1', price: '3.2', status: '删除' },
];

export const bomCompareRight = [
  { no: '1', code: 'M-100', name: '智能温控锅总成', qty: '1', price: '0', status: '' },
  { no: '1.1', code: 'M-110', name: '机身子装配', qty: '1', price: '0', status: '' },
  { no: '1.1.1', code: 'M-111', name: '内胆不锈钢件', qty: '1', price: '42', status: '已修改' },
  { no: '1.1.2', code: 'M-112', name: '外壳注塑件', qty: '1', price: '28', status: '已修改' },
  { no: '1.1.3', code: 'M-113', name: '隔热棉', qty: '2', price: '4.5', status: '新增' },
  { no: '1.2.4', code: 'M-124', name: '固件烧录虚拟件', qty: '1', price: '0', status: '新增' },
];

const tree = (items: Array<[string, string, number, number?]>): AwTreeNode[] =>
  items.map(([key, label, count, level = 2]) => ({ key, label, count, level: level as 2 | 3, open: level === 2, icon: level === 3 ? 'line-node' : 'line-folder' }));

function buildDocCategoryTree(rows: Record<string, any>[]): AwTreeNode[] {
  const setting = operationSettingTemplates.rdDocs.extraLists?.categories;
  const roots = setting?.roots || [];
  const categoryRows = setting?.rows || [];
  const countByRoot = (name: string) => rows.filter((row) => row.type === name).length;
  const countByChild = (name: string) => rows.filter((row) => row.category === name).length;
  const nodes: AwTreeNode[] = [{ key: 'all', label: '全部文档', count: rows.length, level: 2, open: true, icon: 'line-folder' }];

  roots.forEach((root) => {
    nodes.push({ key: root.name, label: root.name, count: countByRoot(root.name), level: 2, open: true, icon: 'line-folder' });
    categoryRows
      .filter((row) => row.parentKey === root.key || row.parentName === root.name || row.parent === root.name)
      .forEach((row) => {
        const name = String(row.name || '');
        nodes.push({ key: name, label: name, count: countByChild(name), level: 3, icon: 'line-node' });
      });
  });

  return nodes;
}

export function getRdDocCategoryPickerGroups(): RdDocCategoryPickerGroup[] {
  const setting = operationSettingTemplates.rdDocs.extraLists?.categories;
  const roots = setting?.roots || [];
  const categoryRows = setting?.rows || [];
  return roots.map((root) => ({
    key: root.key,
    name: root.name,
    rows: categoryRows
      .filter((row) => row.parentKey === root.key || row.parentName === root.name || row.parent === root.name)
      .map((row) => ({
        id: String(row.id),
        name: String(row.name || ''),
        code: String(row.code || ''),
        sort: Number(row.sort || 0),
        enabled: Boolean(row.enabled),
        parentKey: root.key,
        parentName: root.name,
      })),
  }));
}

export const rdListConfigs: Record<RdModule, RdListConfig> = {
  docs: {
    module: 'docs',
    title: '文档库',
    resource: 'rd-documents',
    route: '/rd/doc',
    createLabel: '新增文档',
    searchPlaceholder: '搜索文档名称、编号、负责人',
    treeTitle: '文档库',
    treeFilterKey: 'type',
    treeNodes: [],
    columns: [
      { key: 'code', title: '文档编码', width: 140, link: true },
      { key: 'name', title: '文档名称', width: 220, link: true },
      { key: 'type', title: '类型', width: 120, filterOptions: ['工艺方案', '工艺文件', '技术文档', '操作规范'] },
      { key: 'state', title: '状态', width: 110, filterOptions: ['已发布', '待审核', '已停用', '草稿'] },
      { key: 'version', title: '版本', width: 90 },
      { key: 'owner', title: '编制人', width: 100 },
      { key: 'date', title: '更新日期', width: 120 },
      { key: 'action', title: '操作', width: 90, fixed: 'right' },
    ],
  },
  projects: {
    module: 'projects',
    title: '项目管理',
    resource: 'rd-projects',
    route: '/rd/projects',
    createLabel: '新增项目',
    searchPlaceholder: '搜索项目名称、编号、负责人',
    treeTitle: '项目库',
    treeFilterKey: 'category',
    treeNodes: tree([['all', '全部项目', 5], ['研发项目', '研发项目', 2], ['工程项目', '工程项目', 2], ['合作项目', '合作项目', 1]]),
    columns: [
      { key: 'code', title: '项目编号', width: 150, link: true },
      { key: 'name', title: '项目名称', width: 220, link: true },
      { key: 'category', title: '项目分类', width: 110, filterOptions: ['研发项目', '工程项目', '合作项目'] },
      { key: 'state', title: '状态', width: 100, filterOptions: ['筹备中', '进行中', '已完成', '已暂停'] },
      { key: 'priority', title: '优先级', width: 90 },
      { key: 'owner', title: '负责人', width: 100 },
      { key: 'startDate', title: '开始日期', width: 110 },
      { key: 'planEnd', title: '计划完成日期', width: 120 },
      { key: 'progress', title: '进度', width: 120 },
      { key: 'action', title: '操作', width: 90, fixed: 'right' },
    ],
  },
  products: {
    module: 'products',
    title: '产品管理',
    resource: 'rd-products',
    route: '/rd/products',
    createLabel: '新增产品',
    searchPlaceholder: '搜索产品名称、编号、型号',
    treeTitle: '产品库',
    treeFilterKey: 'category',
    treeNodes: tree([['all', '全部产品', 7], ['成品', '成品', 3], ['半成品', '半成品', 2], ['原材料', '原材料', 2]]),
    columns: [
      { key: 'image', title: '图片', width: 70 },
      { key: 'name', title: '产品名称', width: 170, link: true },
      { key: 'code', title: '产品编号', width: 150 },
      { key: 'model', title: '产品型号', width: 130 },
      { key: 'category', title: '产品分类', width: 110, filterOptions: ['成品', '半成品', '原材料'] },
      { key: 'unit', title: '标准单位', width: 90 },
      { key: 'source', title: '获取方式', width: 100 },
      { key: 'state', title: '产品状态', width: 100, filterOptions: ['在售', '研发', '停产', '停用'] },
      { key: 'action', title: '操作', width: 90, fixed: 'right' },
    ],
  },
  materials: {
    module: 'materials',
    title: '物料管理',
    resource: 'rd-materials',
    route: '/rd/materials',
    createLabel: '新增物料',
    searchPlaceholder: '搜索物料名称、编码、拼音码',
    treeTitle: '物料库',
    treeFilterKey: 'category',
    treeNodes: tree([['all', '全部物料', 6], ['电子物料', '电子物料', 2], ['机械物料', '机械物料', 2], ['包装物料', '包装物料', 2]]),
    columns: [
      { key: 'image', title: '图片', width: 70 },
      { key: 'name', title: '物料名称', width: 180, link: true },
      { key: 'code', title: '物料编号', width: 150 },
      { key: 'spec', title: '物料规格', width: 140 },
      { key: 'category', title: '物料分类', width: 110, filterOptions: ['电子物料', '机械物料', '包装物料'] },
      { key: 'unit', title: '标准单位', width: 90 },
      { key: 'source', title: '获取方式', width: 100 },
      { key: 'state', title: '物料状态', width: 110, filterOptions: ['启用', '停用', '禁止采购'] },
      { key: 'action', title: '操作', width: 90, fixed: 'right' },
    ],
  },
  processes: {
    module: 'processes',
    title: '工序管理',
    resource: 'rd-processes',
    route: '/rd/processes',
    createLabel: '新增工序',
    searchPlaceholder: '搜索工序编码、名称',
    treeTitle: '工序库',
    treeFilterKey: 'category',
    treeNodes: tree([['all', '全部工序', 5], ['加工工序', '加工工序', 2], ['装配工序', '装配工序', 1], ['检验工序', '检验工序', 1], ['包装工序', '包装工序', 1]]),
    columns: [
      { key: 'code', title: '工序编码', width: 150, link: true },
      { key: 'name', title: '工序名称', width: 160, link: true },
      { key: 'category', title: '工序分类', width: 110, filterOptions: ['加工工序', '装配工序', '检验工序', '包装工序'] },
      { key: 'workCenter', title: '工作中心', width: 140 },
      { key: 'calcMethod', title: '核算方式', width: 100 },
      { key: 'processType', title: '加工方式', width: 110 },
      { key: 'qcPlan', title: '质检方案', width: 150 },
      { key: 'action', title: '操作', width: 90, fixed: 'right' },
    ],
  },
  crafts: {
    module: 'crafts',
    title: '工艺管理',
    resource: 'rd-crafts',
    route: '/rd/crafts',
    createLabel: '新增工艺',
    searchPlaceholder: '搜索工艺名称、编号、适用产品',
    treeTitle: '工艺库',
    treeFilterKey: 'category',
    treeNodes: tree([['all', '全部工艺', 4], ['电子装配', '电子装配', 1], ['焊接', '焊接', 1], ['表面处理', '表面处理', 1], ['包装', '包装', 1]]),
    columns: [
      { key: 'code', title: '工艺编号', width: 150, link: true },
      { key: 'name', title: '工艺名称', width: 190, link: true },
      { key: 'product', title: '适用产品', width: 180 },
      { key: 'version', title: '版本号', width: 90 },
      { key: 'category', title: '工艺分类', width: 110, filterOptions: ['电子装配', '焊接', '表面处理', '包装'] },
      { key: 'steps', title: '工序数', width: 90, numeric: true },
      { key: 'parallelOutsource', title: '并序/委外', width: 110 },
      { key: 'isDefault', title: '默认', width: 80 },
      { key: 'state', title: '状态', width: 100, filterOptions: ['已生效', '待审核', '草稿', '已作废'] },
      { key: 'updated', title: '更新日期', width: 120 },
      { key: 'action', title: '操作', width: 90, fixed: 'right' },
    ],
  },
  boms: {
    module: 'boms',
    title: 'BOM管理',
    resource: 'rd-boms',
    route: '/rd/bom',
    createLabel: '新增BOM',
    searchPlaceholder: '搜索BOM编号、名称、适用产品',
    treeTitle: 'BOM库',
    treeFilterKey: 'group',
    treeNodes: tree([['all', '全部BOM', 6], ['成品BOM', '成品BOM', 2], ['半成品BOM', '半成品BOM', 3], ['工程BOM', '工程BOM', 1], ['虚拟BOM', '虚拟BOM', 1]]),
    columns: [
      { key: 'code', title: 'BOM编号', width: 150, link: true },
      { key: 'name', title: 'BOM名称', width: 220, link: true },
      { key: 'product', title: '适用产品', width: 180 },
      { key: 'version', title: '版本号', width: 90 },
      { key: 'type', title: 'BOM类型', width: 110, filterOptions: ['生产BOM', '工程BOM', '虚拟BOM'] },
      { key: 'materials', title: '物料数', width: 90, numeric: true },
      { key: 'levels', title: '层级', width: 80, numeric: true },
      { key: 'state', title: '状态', width: 100, filterOptions: ['已生效', '待审核', '草稿', '已停用'] },
      { key: 'owner', title: '编制人', width: 100 },
      { key: 'date', title: '更新日期', width: 120 },
      { key: 'action', title: '操作', width: 90, fixed: 'right' },
    ],
  },
};

export const substituteColumns: AwTableColumn[] = [
  { key: 'mainMaterial', title: '主物料', width: 180, link: true },
  { key: 'mainCode', title: '主物料编码', width: 140 },
  { key: 'subMaterial', title: '替代物料', width: 180 },
  { key: 'subCode', title: '替代物料编码', width: 140 },
  { key: 'ratio', title: '替代比例', width: 90 },
  { key: 'priority', title: '优先级', width: 80, numeric: true },
  { key: 'effectiveDate', title: '生效日期', width: 120 },
  { key: 'expiryDate', title: '失效日期', width: 120 },
  { key: 'state', title: '状态', width: 100, filterOptions: ['启用', '待审核', '停用'] },
  { key: 'action', title: '操作', width: 90, fixed: 'right' },
];

const rdRows: Record<RdModule, Record<string, any>[]> = {
  docs: [
    { id: 'doc_001', code: 'DD-2024-001', name: '智能控制器标准规范', type: '工艺方案', category: '控制方案', state: '已发布', tone: 'green', version: 'V1.0', owner: '傲为', date: '2025-12-12' },
    { id: 'doc_002', code: 'DD-2024-002', name: '嵌入式系统设计指南', type: '工艺方案', category: '控制方案', state: '已发布', tone: 'green', version: 'V2.1', owner: '李文涛', date: '2025-11-20' },
    { id: 'doc_003', code: 'DD-2024-003', name: '生产线自动化方案', type: '工艺方案', category: '自动化方案', state: '待审核', tone: 'yellow', version: 'V0.5', owner: '陈思源', date: '2025-12-01' },
    { id: 'doc_004', code: 'DD-2024-011', name: '装配线巡检模板', type: '工艺文件', category: '焊接作业', state: '已停用', tone: 'gray', version: 'V1.2', owner: '陈思源', date: '2025-12-08' },
    { id: 'doc_005', code: 'DD-2024-021', name: '数控加工技术手册', type: '技术文档', category: '技术规范', state: '已发布', tone: 'green', version: 'V1.0', owner: '张明', date: '2025-09-18' },
    { id: 'doc_006', code: 'DD-2024-031', name: '通用安全操作流程', type: '操作规范', category: '安全操作', state: '待审核', tone: 'yellow', version: 'V0.3', owner: '李文涛', date: '2025-12-10' },
  ],
  projects: [
    { id: 'prj_001', code: 'PRJ-2025-001', name: '智能输送线系统研发', category: '研发项目', state: '进行中', tone: 'blue', priority: '高', owner: '老夏', startDate: '2025-03-01', planEnd: '2025-12-31', cycle: '2025-03-01 ~ 2025-12-31', progress: '65%' },
    { id: 'prj_002', code: 'PRJ-2025-002', name: 'ERP系统升级改造', category: '工程项目', state: '筹备中', tone: 'blue', priority: '中', owner: '李文涛', startDate: '2025-06-15', planEnd: '2026-03-30', cycle: '2025-06-15 ~ 2026-03-30', progress: '20%' },
    { id: 'prj_003', code: 'PRJ-2025-003', name: '智能仓储管理系统', category: '研发项目', state: '已完成', tone: 'green', priority: '高', owner: '陈思源', startDate: '2024-09-01', planEnd: '2025-05-31', cycle: '2024-09-01 ~ 2025-05-31', progress: '100%' },
    { id: 'prj_004', code: 'PRJ-2025-004', name: '校企合作创新实验室', category: '合作项目', state: '已暂停', tone: 'gray', priority: '低', owner: '赵工', startDate: '2025-01-10', planEnd: '2026-01-09', cycle: '2025-01-10 ~ 2026-01-09', progress: '35%' },
  ],
  products: [
    { id: 'prod_001', image: '▣', code: 'CP-20250101001', name: '智能温湿度传感器', model: 'IWS-TH200', category: '成品', unit: '台', source: '自制件', state: '在售', tone: 'green' },
    { id: 'prod_002', image: '▣', code: 'CP-20250102001', name: '传感器内核基板', model: 'SKB-200', category: '半成品', unit: '个', source: '自制件', state: '在售', tone: 'green' },
    { id: 'prod_003', image: '▣', code: 'CP-20250103001', name: '铝合金型材 6063', model: 'AL-6063-T5', category: '原材料', unit: 'kg', source: '外购件', state: '在售', tone: 'green' },
    { id: 'prod_004', image: '▣', code: 'CP-20260521001', name: 'iPhone17', model: '17 / 17Pro / 17PM', category: '成品', unit: '台', source: '自制件', state: '研发', tone: 'blue' },
  ],
  materials: [
    { id: 'mat_001', image: '▣', code: 'MAT-2025-001', name: 'STM32F407VGT6 微控制器', spec: 'LQFP-100 32位', category: '电子物料', unit: '个', source: '外购件', state: '启用', tone: 'green' },
    { id: 'mat_002', image: '▣', code: 'MAT-2025-002', name: 'MLCC 陶瓷电容 10uF', spec: '0805 16V ±10%', category: '电子物料', unit: '个', source: '外购件', state: '启用', tone: 'green' },
    { id: 'mat_003', image: '▣', code: 'MAT-2025-003', name: 'M6x20 不锈钢内六角螺栓', spec: 'M6x20 SUS304', category: '机械物料', unit: '个', source: '外购件', state: '停用', tone: 'gray' },
    { id: 'mat_004', image: '▣', code: 'MAT-2025-005', name: '瓦楞纸箱 400x300x200', spec: '三层纸箱', category: '包装物料', unit: '个', source: '用品', state: '启用', tone: 'green' },
  ],
  processes: [
    { id: 'proc_001', code: 'GX-20250101001', name: '轴类零件车削加工', category: '加工工序', workCenter: '加工中心A', calcMethod: '计时', processType: '自制工序', qcPlan: 'ZJ-2025-001', state: '启用', tone: 'green' },
    { id: 'proc_002', code: 'GX-20250101002', name: '齿轮铣削加工', category: '加工工序', workCenter: '加工中心B', calcMethod: '计件', processType: '委外工序', qcPlan: 'ZJ-2025-002', state: '启用', tone: 'green' },
    { id: 'proc_003', code: 'GX-20250101003', name: '壳体装配工序', category: '装配工序', workCenter: '装配线', calcMethod: '计时', processType: '自制工序', qcPlan: 'ZJ-2025-003', state: '暂停', tone: 'yellow' },
    { id: 'proc_004', code: 'GX-20250101004', name: '成品检验工序', category: '检验工序', workCenter: '质检中心', calcMethod: '计时', processType: '自制工序', qcPlan: 'ZJ-2025-004', state: '启用', tone: 'green' },
  ],
  crafts: [
    { id: 'craft_001', code: 'GY-202605-001', name: '智能温控锅总装工艺', product: '智能温控锅 AW-H8', version: 'V1.2', category: '电子装配', steps: 6, parallelOutsource: '2 / 1', isDefault: '是', state: '已生效', tone: 'green', updated: '2026-05-19' },
    { id: 'craft_002', code: 'GY-202605-002', name: '控制板焊接工艺', product: '控制板组件', version: 'V1.0', category: '焊接', steps: 5, parallelOutsource: '1 / 0', isDefault: '否', state: '待审核', tone: 'yellow', updated: '2026-05-17' },
    { id: 'craft_003', code: 'GY-202604-018', name: '机身表面处理工艺', product: '机身子装配', version: 'V2.1', category: '表面处理', steps: 4, parallelOutsource: '0 / 1', isDefault: '否', state: '草稿', tone: 'blue', updated: '2026-05-08' },
  ],
  boms: [
    { id: 'bom_001', code: 'BOM-202605-001', name: '智能温控锅生产BOM', product: '智能温控锅 AW-H8', version: 'V1.3', type: '生产BOM', group: '成品BOM', materials: 18, levels: 3, state: '已生效', tone: 'green', owner: '老夏', date: '2026-05-18', cost: '4320.00' },
    { id: 'bom_002', code: 'BOM-202605-002', name: '智能温控锅工程BOM', product: '智能温控锅 AW-H12', version: 'V1.0', type: '工程BOM', group: '工程BOM', materials: 22, levels: 4, state: '待审核', tone: 'yellow', owner: '李文涛', date: '2026-05-16', cost: '5180.00' },
    { id: 'bom_003', code: 'BOM-202604-018', name: '控制板组件虚拟BOM', product: '控制板组件', version: 'V2.1', type: '虚拟BOM', group: '半成品BOM', materials: 9, levels: 2, state: '草稿', tone: 'blue', owner: '陈思源', date: '2026-04-28', cost: '860.00' },
  ],
};

let substituteRows: Record<string, any>[] = [
  { id: 'sub_001', mainMaterial: '外壳注塑件', mainCode: 'M-112', subMaterial: '外壳注塑件 B 供方', subCode: 'M-112-B', ratio: '1:1', priority: 2, effectiveDate: '2026-05-18', expiryDate: '长期', state: '启用', tone: 'green' },
  { id: 'sub_002', mainMaterial: '主控 PCB', mainCode: 'M-121', subMaterial: '主控 PCB 替代 A', subCode: 'M-121-A', ratio: '1:1', priority: 2, effectiveDate: '2026-05-20', expiryDate: '2026-12-31', state: '待审核', tone: 'yellow' },
];

export async function listRdResource(module: RdModule) {
  if (import.meta.env.VITE_USE_REMOTE === 'true') {
    return request<{ items: Record<string, any>[] }>({ url: `/${rdResourceMap[module]}`, method: 'GET' }).then((res) => res.items);
  }
  return rdRows[module].map((row) => ({ ...row, action: '查看' }));
}

export function getRdListConfig(module: RdModule, rows: Record<string, any>[] = []) {
  const config = rdListConfigs[module];
  if (module !== 'docs') return config;
  return {
    ...config,
    treeNodes: buildDocCategoryTree(rows),
    columns: config.columns.map((column) => column.key === 'type'
      ? { ...column, filterOptions: operationSettingTemplates.rdDocs.extraLists?.categories?.roots?.map((root) => root.name) || column.filterOptions }
      : column),
  };
}

export async function listSubstitutes() {
  if (import.meta.env.VITE_USE_REMOTE === 'true') {
    return request<{ items: Record<string, any>[] }>({ url: '/rd-bom-substitutes', method: 'GET' }).then((res) => res.items);
  }
  return substituteRows.map((row) => ({ ...row, action: '查看' }));
}

export async function createRdResource(payload: RdCreatePayload) {
  if (import.meta.env.VITE_USE_REMOTE === 'true') {
    return request({ url: `/${rdResourceMap[payload.module]}`, method: 'POST', data: payload });
  }
  const config = rdListConfigs[payload.module];
  const codePrefix = payload.module === 'boms' ? 'BOM' : config.resource.toUpperCase().replace('RD-', '').slice(0, 4);
  const form = payload.form;
  const stats = form.stats || {};
  const submitted = payload.action === 'submit';
  const saved = payload.action === 'save';
  const docCategoryFallback = payload.module === 'docs' ? getRdDocCategoryPickerGroups()[0]?.rows[0] : null;
  const created = {
    id: `${payload.module}_${Date.now()}`,
    image: form.image || '▣',
    code: form.code || form.no || `${codePrefix}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${rdRows[payload.module].length + 1}`,
    name: form.name || form.title || `新增${config.title}`,
    type: form.categoryParent || form.docType || form.type || form.bomType || form.category || docCategoryFallback?.parentName,
    group: form.group || '成品BOM',
    category: form.category || form.type || docCategoryFallback?.name || '研发项目',
    model: form.model || form.spec || '',
    spec: form.spec || form.model || '',
    unit: form.unit || '个',
    source: form.obtainMethod || form.source || form.attribute || '自制件',
    version: form.version || 'V1.0',
    product: form.product || form.craft || '',
    priority: form.priority || '中',
    startDate: form.startDate || '',
    planEnd: form.endDate || form.planEnd || '',
    cycle: form.startDate && form.endDate ? `${form.startDate} ~ ${form.endDate}` : '',
    progress: form.progress || '0%',
    workCenter: form.workCenter || '研发中心',
    calcMethod: form.calcMethod || '计时',
    processType: form.processType || form.attribute || '自制工序',
    qcPlan: form.qcRequirement || '待配置',
    steps: Array.isArray(payload.lines) ? payload.lines.length : stats.materials || 0,
    parallelOutsource: form.parallelOutsource || '0 / 0',
    isDefault: form.isDefault || '否',
    materials: stats.materials || payload.lines?.length || 0,
    levels: stats.levels || 1,
    state: submitted ? '待审核' : '草稿',
    tone: submitted ? 'yellow' : 'blue',
    owner: form.owner || form.manager || form.author || '老夏',
    date: new Date().toISOString().slice(0, 10),
    updated: new Date().toISOString().slice(0, 10),
    cost: stats.cost ? String(Number(stats.cost).toFixed(2)) : undefined,
    action: '查看',
  };
  rdRows[payload.module] = [created, ...rdRows[payload.module]];
  return { success: true, item: created, message: `${config.title}${submitted ? '已提交审批' : saved ? '已保存' : '已保存草稿'}` };
}

export async function createSubstitute(payload: Record<string, any>) {
  if (import.meta.env.VITE_USE_REMOTE === 'true') {
    return request({ url: '/rd-bom-substitutes', method: 'POST', data: payload });
  }
  const created = {
    id: `sub_${Date.now()}`,
    mainMaterial: payload.mainMaterial || '主物料',
    mainCode: payload.mainCode || 'M-MAIN',
    subMaterial: payload.subMaterial || '替代物料',
    subCode: payload.subCode || 'M-SUB',
    ratio: payload.ratio || '1:1',
    priority: Number(payload.priority || 1),
    effectiveDate: payload.effectiveDate || new Date().toISOString().slice(0, 10),
    expiryDate: payload.expiryDate || '长期',
    state: payload.action === 'submit' ? '待审核' : '启用',
    tone: payload.action === 'submit' ? 'yellow' : 'green',
    action: '查看',
  };
  substituteRows = [created, ...substituteRows];
  return { success: true, item: created, message: payload.action === 'submit' ? '代替物料已提交审批' : '代替物料已保存' };
}

export async function listRdPicker(type: keyof typeof rdPickerRows) {
  if (import.meta.env.VITE_USE_REMOTE === 'true') {
    return request<{ items: RdPickerRow[] }>({ url: `/rd-pickers/${type}`, method: 'GET' }).then((res) => res.items);
  }
  return rdPickerRows[type];
}

export async function getRdDetail(module: RdModule, id: string) {
  if (import.meta.env.VITE_USE_REMOTE === 'true') {
    return request<RdDetailRecord>({ url: `/${rdResourceMap[module]}/${id}`, method: 'GET' });
  }
  const row = rdRows[module].find((item) => item.id === id) || rdRows[module][0];
  return buildRdDetail(module, row || {});
}

export async function updateRdDetail(module: RdModule, id: string, payload: Record<string, any> = {}) {
  if (import.meta.env.VITE_USE_REMOTE === 'true') {
    return request({ url: `/${rdResourceMap[module]}/${id}`, method: 'PATCH', data: payload });
  }
  return { success: true, message: `${rdListConfigs[module].title}修改已记录` };
}

export async function approveRdDetail(module: RdModule, id: string, payload: Record<string, any> = {}) {
  if (import.meta.env.VITE_USE_REMOTE === 'true') {
    return request({ url: `/${rdResourceMap[module]}/${id}/approve`, method: 'POST', data: payload });
  }
  return { success: true, message: `${rdListConfigs[module].title}已提交审批` };
}

export async function publishRdDetail(module: RdModule, id: string, payload: Record<string, any> = {}) {
  if (import.meta.env.VITE_USE_REMOTE === 'true') {
    return request({ url: `/${rdResourceMap[module]}/${id}/publish`, method: 'POST', data: payload });
  }
  return { success: true, message: `${rdListConfigs[module].title}发布校验已通过` };
}

export async function printExportRdDetail(module: RdModule, id: string, action: 'print' | 'export') {
  if (import.meta.env.VITE_USE_REMOTE === 'true') {
    return request({ url: `/${rdResourceMap[module]}/${id}/${action}`, method: 'POST' });
  }
  return { success: true, message: action === 'print' ? '打印任务已创建' : '导出任务已创建' };
}

export async function createRdVersion(module: RdModule, id: string, payload: Record<string, any> = {}) {
  if (import.meta.env.VITE_USE_REMOTE === 'true') {
    return request({ url: `/${rdResourceMap[module]}/${id}/versions`, method: 'POST', data: payload });
  }
  return { success: true, message: `${rdListConfigs[module].title}新版本草稿已生成` };
}

export async function changeRdDetail(module: RdModule, id: string, payload: Record<string, any> = {}) {
  if (import.meta.env.VITE_USE_REMOTE === 'true') {
    return request({ url: `/${rdResourceMap[module]}/${id}/changes`, method: 'POST', data: payload });
  }
  return { success: true, message: `${rdListConfigs[module].title}变更记录已生成` };
}

function buildRdDetail(module: RdModule, row: Record<string, any>): RdDetailRecord {
  const builders: Record<RdModule, (row: Record<string, any>) => RdDetailRecord> = {
    docs: buildDocDetail,
    projects: buildProjectDetail,
    products: buildProductDetail,
    materials: buildMaterialDetail,
    processes: buildProcessDetail,
    crafts: buildCraftDetail,
    boms: buildBomDetail,
  };
  return builders[module](row);
}

function baseDetail(module: RdModule, row: Record<string, any>, title: string, metas: RdDetailField[], tabs: RdDetailTab[], sections: Record<string, RdDetailSection[]>, actions: RdDetailAction[] = [], metrics: RdDetailMetric[] = []): RdDetailRecord {
  const statusText = String(row.state || row.status || '草稿');
  return {
    id: String(row.id || `${module}_mock`),
    module,
    title,
    code: String(row.code || row.no || '-'),
    statusText,
    statusTone: String(row.tone || detailStatusTone(statusText)),
    metas,
    actions,
    tabs,
    metrics,
    sections,
  };
}

function fields(key: string, title: string, rows: Array<[string, string | number | undefined]>): RdDetailFieldsSection {
  return { key, type: 'fields', title, fields: rows.map(([label, value]) => ({ label, value: String(value ?? '-') })) };
}

function table(key: string, title: string, columns: string[], rows: Array<Array<string | number>>): RdDetailTableSection {
  return { key, type: 'table', title, columns, rows: rows.map((row) => row.map((cell) => String(cell ?? '-'))) };
}

function richText(key: string, title: string, content: string): RdDetailRichTextSection {
  return { key, type: 'richText', title, content };
}

function attachments(title = '附件'): RdDetailAttachmentSection {
  return {
    key: title,
    type: 'attachments',
    title,
    rows: [
      { name: '技术规格书.pdf', size: '2.3MB', uploader: '老夏', time: '2026-05-18 10:20' },
      { name: '评审记录.xlsx', size: '856KB', uploader: '李文涛', time: '2026-05-19 15:36' },
    ],
  };
}

function timeline(key = 'logs', title = '操作记录'): RdDetailTimelineSection {
  return {
    key,
    type: 'timeline',
    title,
    rows: [
      { operator: '老夏', action: '创建资料', time: '2026-05-17 09:30', result: '成功' },
      { operator: '李文涛', action: '补充字段并提交审批', time: '2026-05-18 14:20', result: '待审批' },
      { operator: '陈思源', action: '查看详情', time: '2026-05-19 16:42', result: '已记录' },
    ],
  };
}

function detailStatusTone(status: string) {
  if (['已发布', '已完成', '在售', '启用', '已生效'].includes(status)) return 'green';
  if (['待审核', '暂停', '筹备中'].includes(status)) return 'yellow';
  if (['草稿', '研发', '进行中'].includes(status)) return 'blue';
  return 'gray';
}

function buildDocDetail(row: Record<string, any>) {
  const tabs = [
    { key: 'detail', label: '文档详情' },
    { key: 'attach', label: '文档附件' },
    { key: 'ver', label: '历史版本' },
    { key: 'log', label: '操作记录' },
  ];
  return baseDetail(
    'docs',
    row,
    row.name || '文档名称',
    [
      { label: '文档类型', value: row.type || '文档分类' },
      { label: '版本号', value: row.version || 'V 1.0' },
      { label: '编制人', value: row.owner || '老夏' },
      { label: '更新日期', value: row.date || '2026-05-18' },
    ],
    tabs,
    {
      detail: [
        fields('doc-basic', '基础信息', [
          ['文档编号', row.code || 'PJ7820864'],
          ['文档名称', row.name || '文档名称'],
          ['文档类型', row.type || '文档分类'],
          ['创建人', row.owner || '分类一'],
          ['创建时间', '2025-03-17 18:00'],
          ['最后修改时间', row.date ? `${row.date} 18:00` : '2025-03-17 18:00'],
          ['失效日期', '永久 / 2028-08-08'],
          ['版本号', row.version || 'V 1.0'],
        ]),
        richText('doc-content', '正文内容', '技术背景：嵌入式智能控制器的发展经历了从单一功能到多功能集成的演变，其核心是提升运算能力、通信能力和适应复杂环境的能力。\n\n实际应用：在智能制造领域，嵌入式智能控制器被广泛应用于机器人的精准控制、生产线自动化管理等场景。\n\n设计阶段：企业在设计嵌入式智能控制器时，应充分考虑结构多样化、接口标准化以及功能扩展性。'),
      ],
      attach: [attachments('文档附件')],
      ver: [table('doc-version', '历史版本', ['版本号', '变更摘要', '编制人', '生效日期', '状态'], [
        ['V 1.0', '首次发布', row.owner || '老夏', row.date || '2026-05-18', row.state || '已发布'],
        ['V 0.9', '评审稿', '李文涛', '2026-05-12', '已归档'],
      ])],
      log: [timeline()],
    },
    [
      { key: 'publish', label: '发布' },
      { key: 'version', label: '版本管理' },
      { key: 'print', label: '打印' },
      { key: 'export', label: '导出' },
    ],
  );
}

function buildProjectDetail(row: Record<string, any>) {
  const tabs = [
    { key: 'detail', label: '项目详情' },
    { key: 'members', label: '项目成员' },
    { key: 'materials', label: '物料清单' },
    { key: 'process', label: '工艺流程' },
    { key: 'quote', label: '报价信息' },
    { key: 'purchase', label: '采购信息' },
    { key: 'production', label: '生产信息' },
    { key: 'expense', label: '项目成本' },
    { key: 'logs', label: '操作记录' },
  ];
  return baseDetail(
    'projects',
    row,
    `${row.code || 'PRJ-2025-001'} ${row.name || '智能输送线系统研发'}`,
    [
      { label: '项目分类', value: row.category || '研发项目' },
      { label: '负责人', value: row.owner || '老夏' },
      { label: '优先级', value: row.priority || '高' },
      { label: '进度', value: row.progress || '65%' },
    ],
    tabs,
    {
      detail: [fields('project-basic', '基础信息', [
        ['项目编号', row.code || 'PRJ-2025-001'],
        ['项目名称', row.name || '智能输送线系统研发'],
        ['项目分类', row.category || '研发项目'],
        ['项目类型', '内部'],
        ['项目状态', row.state || '进行中'],
        ['优先级', row.priority || '高'],
        ['负责人', row.owner || '老夏'],
        ['所属部门', '研发部'],
        ['开始日期', row.startDate || '2025-03-01'],
        ['计划完成日期', row.planEnd || '2025-12-31'],
        ['关联客户', '海南傲为科技有限公司'],
        ['关联合同', 'CT-2025-0089'],
        ['合同金额', '¥ 850,000.00'],
        ['项目预算', '¥ 1,200,000.00'],
        ['项目进度', row.progress || '65%'],
      ])],
      members: [table('project-members', '项目成员', ['姓名', '角色', '加入时间'], [
        ['老夏', '负责人', '2026-05-01'],
        ['李文涛', '参与者', '2026-05-02'],
        ['陈思源', '观察者', '2026-05-03'],
      ])],
      materials: [table('project-bom', '物料清单', ['序号', '层级', '物料编码', '物料名称', '规格型号', '单位', '项目用量', '损耗率', '来源', '状态'], [
        ['1', '1', 'WL-7820864', '半成品物料', '规格一', 'KG', '500', '2%', '标准BOM引用', '可调整'],
        ['2', '1.1', 'WL-8518691', '铝合金型材', 'AL-6061', 'KG', '320', '3%', '标准BOM引用', '可调整'],
        ['3', '1.2', 'WL-6081578', '外箱包装', 'PK-500', '个', '800', '0%', '项目新增', '可调整'],
      ])],
      process: [table('project-process', '工艺流程', ['序号', '工艺编号', '工艺名称', '版本', '来源', '状态'], [
        ['1', 'CRAFT-2026-0012', '智能输送线总装工艺', 'V1.0', '项目工艺', '编辑'],
      ])],
      quote: [table('project-quote', '报价信息', ['序号', '成本项', '来源说明', '金额', '状态'], [
        ['1', 'BOM成本', '由项目 BOM 物料清单汇总生成', '¥ 420,000.00', '系统生成'],
        ['2', '工艺成本', '由项目工艺流程工时与加工费汇总生成', '¥ 180,000.00', '系统生成'],
        ['3', '项目管理费', '手动录入的项目成本项', '¥ 60,000.00', '手动新增'],
      ])],
      purchase: [table('project-purchase', '采购信息', ['序号', '采购单号', '来源', '采购金额', '状态', '进度'], [
        ['1', 'PO-2026-PRJ-001', '项目物料清单', '¥ 420,000.00', '待审核', '已发起'],
      ])],
      production: [table('project-production', '生产信息', ['序号', '生产需求号', '来源', '需求数量', '状态', '进度'], [
        ['1', 'MRP-2026-PRJ-001', '项目报价确认', '1 套', '待排产', '已下单'],
      ])],
      expense: [table('project-expense', '项目成本', ['序号', '成本类型', '成本说明', '金额', '发生日期', '责任人', '状态'], [
        ['1', '差旅费', '客户现场调研', '¥ 8,600.00', '2026-06-09', '李文涛', '已入账'],
        ['2', '测试费', '样机可靠性测试', '¥ 12,000.00', '2026-06-14', '陈思源', '待审核'],
      ])],
      logs: [timeline()],
    },
    [],
    [
      { label: '当前报价金额', value: '¥ 600,000.00' },
      { label: '调整金额', value: '¥ -12,000.00' },
      { label: '实际报价金额', value: '¥ 588,000.00', tone: 'primary' },
    ],
  );
}

function buildProductDetail(row: Record<string, any>) {
  const tabs = [
    { key: 'info', label: '产品信息' },
    { key: 'code', label: '物码管控' },
    { key: 'sales', label: '销售记录' },
    { key: 'inbound', label: '入库记录' },
    { key: 'outbound', label: '出库记录' },
    { key: 'pricing', label: '客户价格表' },
    { key: 'log', label: '操作记录' },
  ];
  return baseDetail('products', row, row.name || '智能温湿度传感器', [
    { label: '分类', value: row.category || '成品' },
    { label: '型号选项', value: row.model || '17 / 17Pro / 17PM' },
    { label: '规格', value: row.spec || row.model || '标准规格' },
    { label: '创建人', value: '老夏' },
  ], tabs, {
    info: [
      fields('product-info', '产品信息', [
        ['物码管控', '沿用产品设置 / 研发中心策略'],
        ['码类型', '主码 / 客户码 / 箱码'],
        ['产品编号', row.code || 'CP-20250101001'],
        ['产品名称', row.name || '智能温湿度传感器'],
        ['别名码', 'IWS'],
        ['产品分类', row.category || '成品'],
        ['产品型号', row.model || 'IWS-TH200'],
        ['规格型号选项', row.model || '17 / 17Pro / 17PM'],
        ['产品规格', row.spec || '标准规格'],
        ['产品单位', row.unit || '台'],
        ['获取方式', row.source || '自制件'],
        ['产品状态', row.state || '在售'],
        ['销售控制', '允许销售'],
        ['最小销售量', '1'],
        ['建议售价', '¥ 6,000.00'],
        ['质检方案', 'OQC-PLAN-001'],
        ['执行标准', 'AW-QS-2026'],
        ['销售渠道', '全渠道'],
        ['安全库存量', '120'],
        ['最低库存量', '40'],
        ['最高库存量', '500'],
        ['补货周期', '15 天'],
        ['存储位置', 'A-01-01'],
      ]),
      table('product-models', '型号规格选项', ['型号编码', '规格名称', '业务说明', '状态'], [
        ['17', '标准版', '销售下单选择该型号后，生产按对应型号 BOM 展开用料。', '启用'],
        ['17Pro', 'Pro 版', 'Pro 结构件、主板和关键功能组件独立匹配。', '启用'],
        ['17PM', 'Pro Max 版', '大尺寸结构件、电池与后盖组件独立匹配。', '启用'],
      ]),
      attachments('附件'),
      richText('product-rich', '产品详情', `${row.name || '产品'} 是研发中心维护的产品档案，支持型号、物码、库存、质检和销售策略联动。`),
    ],
    code: [table('product-code', '样例物码', ['主码', '关联码', '批次', '库位', '状态', '最近单据'], [
      ['SN-202605-0001', 'BOX-202605-010 / CUS-AW-0001', 'B20250601', 'A-01-01', '在库', 'RK-20251221001'],
      ['SN-202605-0002', 'BOX-202605-010 / CUS-AW-0002', 'B20250601', 'A-01-01', '已占用', 'SO-20251221001'],
    ])],
    sales: [table('product-sales', '销售记录', ['销售单号', '客户', '数量', '单价(¥)', '金额(¥)', '日期', '状态'], [
      ['SO-202605-031', '海南傲为科技有限公司', '48', '6000.00', '288000.00', '2026-05-31', '已完成'],
    ])],
    inbound: [table('product-inbound', '入库记录', ['入库单号', '仓库', '数量', '批次号', '日期', '操作人'], [
      ['RK-20251221001', '成品仓', '60', 'B20250601', '2026-05-18', '仓管员'],
    ])],
    outbound: [table('product-outbound', '出库记录', ['出库单号', '仓库', '数量', '类型', '日期', '操作人'], [
      ['CK-20251221001', '成品仓', '20', '销售出库', '2026-05-20', '李文涛'],
    ])],
    pricing: [table('product-pricing', '客户价格表', ['客户', '价格(¥)', '有效期起', '有效期止', '备注', '操作'], [
      ['海南傲为科技有限公司', '6000.00', '2026-01-01', '2026-12-31', '年度协议价', '编辑 / 删除'],
      ['深圳市启明科技有限公司', '6200.00', '2026-03-01', '2026-12-31', '项目价', '编辑 / 删除'],
    ])],
    log: [timeline()],
  });
}

function buildMaterialDetail(row: Record<string, any>) {
  const tabs = [
    { key: 'info', label: '物料信息' },
    { key: 'purchase', label: '采购记录' },
    { key: 'inbound', label: '入库记录' },
    { key: 'outbound', label: '出库记录' },
    { key: 'price', label: '历史价格' },
    { key: 'suppliers', label: '供应商列表' },
    { key: 'logs', label: '操作记录' },
  ];
  return baseDetail('materials', row, row.name || 'STM32F407VGT6 微控制器', [
    { label: '物料分类', value: row.category || '电子物料 / 芯片类' },
    { label: '规格型号', value: row.spec || 'LQFP-100 32位' },
    { label: '标准单位', value: row.unit || '个' },
    { label: '默认供应商', value: '深圳鑫达电子科技有限公司' },
  ], tabs, {
    info: [
      fields('material-info', '物料信息', [
        ['物料编号', row.code || 'MAT-2025-001'],
        ['物料名称', row.name || 'STM32F407VGT6 微控制器'],
        ['拼音码', 'STM32F407'],
        ['物料分类', row.category || '电子物料 / 芯片类'],
        ['物料规格', row.spec || 'LQFP-100 32位'],
        ['标准单位', row.unit || '个'],
        ['获取方式', row.source || '外购件'],
        ['物料状态', row.state || '启用'],
        ['销售控制', '禁止销售'],
        ['主供应商', '深圳鑫达电子科技有限公司'],
        ['最小采购量', '100'],
        ['建议进价', '¥ 18.50'],
        ['最大库存', '5000'],
        ['安全库存', '500'],
        ['最低库存量', '200'],
        ['补货周期（天）', '15'],
        ['采源预警（天）', '7'],
      ]),
      attachments('附件'),
    ],
    purchase: [table('material-purchase', '采购记录', ['采购单号', '供应商', '数量', '单价', '金额', '日期', '状态'], [
      ['PO-202605-001', '深圳鑫达电子科技有限公司', '1000', '¥ 18.50', '¥ 18500.00', '2026-05-18', '已完成'],
    ])],
    inbound: [table('material-inbound', '入库记录', ['入库单号', '仓库', '数量', '批次号', '日期', '操作人'], [
      ['RK-202605-001', '原料仓', '1000', 'B20260518', '2026-05-18', '仓管员'],
    ])],
    outbound: [table('material-outbound', '出库记录', ['出库单号', '仓库', '数量', '类型', '日期', '操作人'], [
      ['CK-202605-001', '原料仓', '240', '生产领料', '2026-05-20', '陈思源'],
    ])],
    price: [table('material-price', '历史价格', ['供应商', '采购价格', '日期', '采购单号', '备注'], [
      ['深圳鑫达电子科技有限公司', '¥ 18.50', '2026-05-18', 'PO-202605-001', '批量采购'],
      ['东莞精密组件有限公司', '¥ 19.20', '2026-04-22', 'PO-202604-018', '小批量'],
    ])],
    suppliers: [table('material-suppliers', '供应商列表', ['供应商', '联系人', '联系方式', '供货比例', '合作状态'], [
      ['深圳鑫达电子科技有限公司', '王工', '13800006001', '70%', '启用'],
      ['东莞精密组件有限公司', '刘工', '13800006002', '30%', '启用'],
    ])],
    logs: [timeline()],
  });
}

function buildProcessDetail(row: Record<string, any>) {
  const tabs = [
    { key: 'info', label: '工序信息' },
    { key: 'station', label: '工序工位' },
    { key: 'hours', label: '工序工时' },
    { key: 'output', label: '副产品' },
    { key: 'params', label: '技术参数' },
    { key: 'qc', label: '工序质检' },
    { key: 'log', label: '操作记录' },
  ];
  return baseDetail('processes', row, row.name || '轴类零件车削加工', [
    { label: '创建人', value: '老夏' },
    { label: '创建时间', value: '2026-05-17 10:25' },
    { label: '修改人', value: '李文涛' },
    { label: '修改时间', value: '2026-05-18 16:30' },
  ], tabs, {
    info: [
      fields('process-info', '工序信息', [
        ['工序编码', row.code || 'GX-20250101001'],
        ['工序名称', row.name || '轴类零件车削加工'],
        ['工序分类', row.category || '加工工序'],
        ['工序类型', row.processType || '自制工序'],
        ['核算方式', row.calcMethod || '计时'],
        ['加工方式', row.processType || '自制工序'],
        ['工作中心', row.workCenter || '加工中心A'],
        ['质检方案', row.qcPlan || 'ZJ-2025-001'],
      ]),
      richText('process-desc', '工序描述', '用于轴类零件加工，执行前需完成设备点检、刀具确认和首件检验。'),
      attachments('附件信息'),
    ],
    station: [table('process-station', '工序工位', ['工位编码', '工位名称', '所属生产线', '所属车间', '所属工厂'], [
      ['GW-001', '车削工位A', '生产线1', '一车间', '海南傲为工厂'],
      ['GW-002', '铣削工位B', '生产线2', '二车间', '海南傲为工厂'],
    ])],
    hours: [
      table('process-hours', '工序工时', ['工序编码', '工序名称', '标准工时(分钟)', '辅助工时(分钟)', '冷却工时(分钟)', '工序成本(元)'], [
        [row.code || 'GX-20250101001', row.name || '轴类零件车削加工', '45', '10', '5', '380'],
      ]),
    ],
    output: [table('process-output', '副产品', ['产品名称', '产品编号', '型号', '分类', '单位', '获取方式'], [
      ['温湿度传感器', 'CP-001', 'IWS-TH200', '废料', '台', '自制件'],
    ])],
    params: [table('process-params', '技术参数', ['参数名称', '参数值'], [
      ['主轴转速', '1200 rpm'],
      ['进给量', '0.15 mm/r'],
    ])],
    qc: [table('process-qc', '工序质检', ['检验项目', '标准值', '检验工具', '检验频次'], [
      ['尺寸精度', '±0.02mm', '游标卡尺', '首件 + 巡检'],
      ['表面粗糙度', 'Ra1.6', '粗糙度仪', '每批抽检'],
    ])],
    log: [timeline()],
  }, [
    { key: 'edit', label: '编辑' },
    { key: 'delete', label: '删除', danger: true },
    { key: 'pause', label: row.state === '暂停' ? '启用' : '暂停' },
  ], [
    { label: '标准工时', value: '45 分钟' },
    { label: '辅助工时', value: '10 分钟' },
    { label: '冷却工时', value: '5 分钟' },
    { label: '工序成本', value: '¥ 380' },
  ]);
}

const craftStages: RdCraftStage[] = [
  { id: 'st-1', kind: 'seq', ops: [{ id: 'op-1', code: 'OP1101', name: '来料检验', type: 'in', category: '检验', workCenter: '质检中心', equipment: '检验台 1', setupTime: 0, runTime: 4, queueTime: 15, laborCount: 1, costRate: 1.2, qcRequired: true, qcPlan: '首件 + 巡检', sopCode: 'SOP-118', materialRows: [['M-001', '主控板组件', '1', '件']], wasteRows: [['检验不良隔离品', '按实计', '件']] }] },
  { id: 'st-2', kind: 'par', ops: [
    { id: 'op-2', code: 'OP1102', name: '切割', type: 'in', category: '加工', workCenter: '一车间', equipment: 'CNC-01', setupTime: 15, runTime: 8, queueTime: 30, laborCount: 1, costRate: 1.2, qcRequired: false, qcPlan: '随机抽检', sopCode: 'SOP-236', materialRows: [['M-101', '铝型材毛坯', '1', '件'], ['M-203', '螺丝 M3x8', '4', '个']], wasteRows: [['切削屑', '0.02', 'kg']] },
    { id: 'op-3', code: 'OP1103', name: '钻孔', type: 'in', category: '加工', workCenter: '一车间', equipment: 'CNC-02', setupTime: 10, runTime: 5, queueTime: 30, laborCount: 1, costRate: 1.2, qcRequired: false, qcPlan: '随机抽检', sopCode: 'SOP-241', materialRows: [['M-101', '铝型材毛坯', '1', '件']], wasteRows: [['孔屑', '0.01', 'kg']] },
    { id: 'op-4', code: 'OP1104', name: '车削', type: 'in', category: '加工', workCenter: '二车间', equipment: 'CNC-03', setupTime: 20, runTime: 12, queueTime: 30, laborCount: 1, costRate: 1.2, qcRequired: false, qcPlan: '随机抽检', sopCode: 'SOP-245', materialRows: [['M-102', '轴套毛坯', '1', '件']], wasteRows: [['车削屑', '0.03', 'kg']] },
  ] },
  { id: 'st-3', kind: 'seq', ops: [{ id: 'op-5', code: 'OP1105', name: '组装', type: 'in', category: '装配', workCenter: '装配车间', equipment: '装配台 A', setupTime: 10, runTime: 20, queueTime: 20, laborCount: 2, costRate: 1.2, qcRequired: true, qcPlan: '首件 + 巡检', sopCode: 'SOP-352', materialRows: [['M-301', '控制器壳体', '1', '套'], ['M-302', '线束组件', '1', '套']], wasteRows: [['装配损耗', '0.01', '套']] }] },
  { id: 'st-4', kind: 'par', ops: [
    { id: 'op-6', code: 'OP1106', name: '委外热处理', type: 'out', category: '委外', workCenter: '南海五金加工厂', equipment: 'XY-2026-007', setupTime: 0, runTime: 480, queueTime: 1440, laborCount: 0, costRate: 8.5, qcRequired: true, qcPlan: '来料复检', sopCode: 'SOP-481', materialRows: [['M-401', '待热处理半成品', '1', '件']], wasteRows: [['委外损耗', '0', '件']] },
    { id: 'op-7', code: 'OP1107', name: '抛光', type: 'in', category: '表面', workCenter: '表面处理线', equipment: '抛光机 1', setupTime: 5, runTime: 8, queueTime: 30, laborCount: 1, costRate: 1.2, qcRequired: false, qcPlan: '外观抽检', sopCode: 'SOP-418', materialRows: [['M-501', '抛光耗材', '15', 'g']], wasteRows: [['抛光粉尘', '0.02', 'kg']] },
  ] },
];

function buildCraftDetail(row: Record<string, any>) {
  const flatOps = craftStages.flatMap((stage, stageIndex) => stage.ops.map((op, opIndex) => [
    `${stageIndex + 1}${stage.ops.length > 1 ? `.${opIndex + 1}` : ''}`,
    op.code,
    op.name,
    op.type === 'out' ? '委外' : '自制',
    op.workCenter,
    `${op.setupTime + op.runTime} min`,
    op.qcPlan,
    stageIndex === craftStages.length - 1 ? (row.product || '智能温控锅 AW-H8') : '半成品过程件',
  ]));
  const inOps = craftStages.flatMap((stage) => stage.ops).filter((op) => op.type === 'in').length;
  const outOps = craftStages.flatMap((stage) => stage.ops).filter((op) => op.type === 'out').length;
  const totalMin = craftStages.reduce((sum, stage) => sum + Math.max(...stage.ops.map((op) => op.setupTime + op.runTime)), 0);
  return baseDetail('crafts', row, `${row.code || 'GY-202605-001'} ${row.name || '智能温控锅总装工艺'}`, [
    { label: '工艺分类', value: row.category || '电子装配' },
    { label: '适用产品', value: row.product || '智能温控锅 AW-H8' },
    { label: '版本号', value: row.version || 'V1.2' },
    { label: '编制人', value: '老夏 / 工艺部' },
    { label: '生效日期', value: '2026-06-01' },
  ], [
    { key: 'info', label: '工艺详情' },
    { key: 'route', label: '工艺路线' },
    { key: 'params', label: '工序列表' },
    { key: 'log', label: '操作记录' },
  ], {
    info: [
      fields('craft-info', '工艺详情', [
        ['适用范围', '通用'],
        ['质检方案', 'IPQC + FQC'],
        ['责任组织', '工艺部'],
        ['创建日期', '2026-05-18'],
        ['更新日期', row.updated || '2026-05-19'],
        ['默认工艺', row.isDefault || '是'],
        ['引用状态', '未被在制订单锁定'],
      ]),
      richText('craft-rich', '工艺详情', '本工艺适用于智能温控锅 AW-H8 整机制造，覆盖来料检验、关键零件加工、整机装配、委外热处理、功能调试、出货检验与包装入库全过程。\n\n工艺路线采用串序与并序结合的组织方式，加工段支持切割、钻孔、车削并行处理，系统按并序节点最大时长计算工艺总时长。'),
    ],
    route: [{ key: 'craft-route', type: 'craftRoute', title: '工艺路线', stages: craftStages }],
    params: [table('craft-params', '工序列表', ['序号', '工序编号', '工序名称', '工序类型', '默认执行', '标准工时', '质检方案', '副产品'], flatOps)],
    log: [timeline()],
  }, [
    { key: 'edit', label: '编辑' },
    { key: 'copyVersion', label: '复制为新版本' },
    { key: 'print', label: '打印' },
    { key: 'export', label: '导出' },
  ], [
    { label: '工序总数', value: String(inOps + outOps) },
    { label: '自制工序', value: String(inOps), tone: 'green' },
    { label: '委外工序', value: String(outOps), tone: 'yellow' },
    { label: '工艺总时长', value: `${(totalMin / 60).toFixed(1)}h` },
    { label: '单件成本', value: '¥ 382' },
  ]);
}

function buildBomDetail(row: Record<string, any>) {
  const bomTree = bomImportTree;
  return baseDetail('boms', row, `${row.code || 'BOM-202605-001'} ${row.name || '智能温控锅生产BOM'}`, [
    { label: '适用产品', value: row.product || '智能温控锅 AW-H8' },
    { label: '版本号', value: row.version || 'V1.3' },
    { label: 'BOM类型', value: row.type || '生产BOM' },
    { label: '编制人', value: row.owner || '老夏' },
    { label: '更新日期', value: row.date || '2026-05-18' },
  ], [
    { key: 'info', label: 'BOM详情' },
    { key: 'structure', label: 'BOM结构' },
    { key: 'alts', label: '替代料' },
    { key: 'compare', label: '版本对比' },
    { key: 'change', label: '变更记录' },
    { key: 'log', label: '操作记录' },
  ], {
    info: [
      fields('bom-info', '基础信息', [
        ['BOM编号', row.code || 'BOM-202605-001'],
        ['BOM名称', row.name || '智能温控锅生产BOM'],
        ['适用产品', row.product || '智能温控锅 AW-H8'],
        ['版本号', row.version || 'V1.3'],
        ['BOM类型', row.type || '生产BOM'],
        ['物料数', row.materials || '18'],
        ['层级数', row.levels || '3'],
        ['单件成本', `¥ ${row.cost || '4320.00'}`],
        ['生效日期', '2026-06-01'],
        ['审批流程', '研发 BOM 默认流程'],
      ]),
      richText('bom-rich', '清单详情', bomDetailText),
    ],
    structure: [{ key: 'bom-tree', type: 'bomTree', title: 'BOM结构', tree: bomTree }],
    alts: [table('bom-alts', '替代料', ['主物料编码', '主物料', '替代物料编码', '替代物料', '优先级', '适用型号', '状态'], [
      ['IP17-113', '17PM 专用后盖组件', 'IP17-113-B', '17PM 后盖 B 供方', 'P2', '17PM', '启用'],
      ['M-121', '主控 PCB', 'M-121-A', '主控 PCB 替代 A', 'P2', '全部型号', '待审核'],
    ])],
    compare: [table('bom-compare-left', '版本对比', ['版本', '行号', '物料编码', '物料', '用量', '单价', '变更'], [
      ...bomCompareLeft.map((item) => ['V1.0', item.no, item.code, item.name, item.qty, item.price, item.status || '-']),
      ...bomCompareRight.map((item) => ['V1.1', item.no, item.code, item.name, item.qty, item.price, item.status || '-']),
    ])],
    change: [table('bom-change', '变更记录', ['版本号', '变更摘要', '修订人', '生效日期', '审批人', '状态'], [
      ['V1.3', '调整内胆不锈钢件价格，新增隔热棉', '老夏', '2026-05-18', '研发主管', '待审核'],
      ['V1.2', '新增包装套件和型号过滤', '李文涛', '2026-04-20', '研发主管', '已发布'],
    ])],
    log: [timeline()],
  }, [
    { key: 'edit', label: '修改' },
    { key: 'compare', label: '版本对比' },
    { key: 'submit', label: '提交审批' },
    { key: 'print', label: '打印' },
    { key: 'export', label: '导出' },
  ], [
    { label: '层级数', value: String(row.levels || 3) },
    { label: '物料数', value: String(row.materials || 18) },
    { label: '单件成本', value: `¥ ${row.cost || '4320.00'}`, tone: 'primary' },
    { label: '累计工时', value: '2.9h' },
  ]);
}

export function getRdCreateConfig(module: RdModule): RdCreateConfig {
  const commonAttachment = '附件';
  const yesNo = ['是', '否'];
  const categoryOptions = {
    doc: ['工艺方案 / 三级分类', '工艺文件 / 三级分类', '技术文档 / 三级分类', '操作规范 / 三级分类'],
    project: ['研发项目', '工程项目', '合作项目'],
    product: ['成品', '半成品', '原材料'],
    material: ['电子物料', '机械物料', '包装物料'],
    process: ['车削', '铣削', '装配工序', '检验工序'],
  };
  const projectSubCategories = ['内部研发', '产品研发', '系统改造', '自动化工程', '校企合作', '联合创新'];
  const productSubCategories = ['类别A', '类别B', '控制板组件', '结构原料'];
  const materialSubCategories = ['芯片类', '电容类', '紧固件', '纸箱类'];
  const unitOptions = ['个', '台', '套', '件', '片', '箱', 'kg'];
  const docOptions = ['工艺规范 V2.1', '作业指导书 A-12', '设备操作规程', '质量标准 QS-2025'];
  const configs: Record<RdModule, RdCreateConfig> = {
    docs: {
      title: '新增文档',
      submitText: '提交审批',
      sections: [
        { title: '基本信息', fields: [
          { key: 'code', label: '文档编号', type: 'readonly', placeholder: '自动生成' },
          { key: 'name', label: '文档名称', required: true, placeholder: '填写文档名称' },
          { key: 'category', label: '所属分类', type: 'categoryPicker', required: true, placeholder: '请选择文档分类' },
          { key: 'version', label: '版本号', defaultValue: 'V 1.0' },
          { key: 'author', label: '编制人', defaultValue: '老夏' },
          { key: 'effectiveDate', label: '生效日期', type: 'date' },
          { key: 'expireDate', label: '失效日期', placeholder: '永久' },
          { key: 'workflow', label: '审批流程', type: 'select', options: ['默认审批流'], defaultValue: '默认审批流' },
        ] },
      ],
      richTextLabel: '正文内容',
      attachmentLabel: commonAttachment,
    },
    projects: {
      title: '新增项目',
      submitText: '提交审批',
      sections: [
        { title: '基本信息', fields: [
          { key: 'code', label: '项目编号', type: 'readonly', placeholder: '自动生成' },
          { key: 'name', label: '项目名称', required: true, placeholder: '填写项目名称' },
          { key: 'category', label: '项目分类', type: 'select', required: true, options: categoryOptions.project },
          { key: 'subCategory', label: '二级分类', type: 'select', required: true, options: projectSubCategories },
          { key: 'priority', label: '优先级', type: 'select', options: ['高', '中', '低'] },
          { key: 'owner', label: '负责人', type: 'person', required: true },
          { key: 'startDate', label: '开始日期', type: 'date' },
          { key: 'endDate', label: '计划完成日期', type: 'date' },
          { key: 'sourceEntity', label: '来源主体', type: 'picker', picker: 'source' },
        ] },
      ],
      richTextLabel: '项目描述',
      richTextSectionTitle: '项目详情',
      attachmentLabel: commonAttachment,
    },
    products: {
      title: '新增产品',
      submitText: '提交审批',
      sections: [{ title: '基础信息', fields: [
        { key: 'name', label: '产品名称', required: true },
        { key: 'aliasCode', label: '别名码', required: true },
        { key: 'code', label: '产品编号', type: 'readonly', placeholder: '自动生成' },
        { key: 'category', label: '产品分类', type: 'select', required: true, options: categoryOptions.product },
        { key: 'subCategory', label: '二级分类', type: 'select', required: true, options: productSubCategories },
        { key: 'obtainMethod', label: '获取方式', type: 'select', options: ['自制件', '外购件'], defaultValue: '自制件' },
        { key: 'unit', label: '标准单位', type: 'select', options: unitOptions },
        { key: 'salesControl', label: '销售控制', type: 'select', options: ['允许销售', '禁止销售', '审批销售'] },
        { key: 'state', label: '产品状态', type: 'select', options: ['研发', '在售', '停产', '停用'] },
        { key: 'codeControlMode', label: '物码管控模式', type: 'select', options: ['沿用产品设置', '不管控', '批次管控', '一物一码', '一物多码'], defaultValue: '沿用产品设置' },
        { key: 'relatedCodeType', label: '关联码类型', type: 'select', options: ['沿用产品设置', '主码', '主码 + 客户码 + 箱码', '主码 + 供应商码 + 箱码', '主码 + 箱码 + 托盘码'], defaultValue: '沿用产品设置' },
      ] }],
      subTables: [{ key: 'specs', title: '新增型号', addText: '新增型号', columns: [{ key: 'model', title: '型号编码' }, { key: 'spec', title: '规格名称' }, { key: 'remark', title: '备注' }, { key: 'enabled', title: '启用' }], rows: [
        { id: 1, model: '17', spec: '标准版', remark: '标准尺寸和基础配置', enabled: '是' },
        { id: 2, model: '17Pro', spec: 'Pro 版', remark: 'Pro 结构件和主板配置', enabled: '是' },
        { id: 3, model: '17PM', spec: 'Pro Max 版', remark: '大尺寸结构件和电池配置', enabled: '是' },
      ] }],
      tabs: [
        { key: 'sales', label: '销售信息', sections: [{ title: '销售控制', fields: [
          { key: 'linkedCustomer', label: '关联客户', type: 'picker', picker: 'source' },
          { key: 'minSalesQty', label: '最小销售量', type: 'number' },
          { key: 'suggestedPrice', label: '建议售价', type: 'number' },
          { key: 'qcPlan', label: '质检方案', placeholder: '选择或填写质检方案' },
          { key: 'standard', label: '执行标准' },
          { key: 'salesChannel', label: '销售渠道', type: 'select', options: ['全渠道', '线上', '线下'] },
        ] }], subTables: [{ key: 'salesUnits', title: '销售单位倍数表', addText: '新增行', columns: [{ key: 'unit', title: '销售单位' }, { key: 'qty', title: '换算数量' }, { key: 'barcode', title: '条形码' }], rows: [{ id: 1, unit: '个', qty: '1', barcode: '' }] }] },
        { key: 'stock', label: '库存策略', sections: [{ title: '库存策略', fields: [
          { key: 'safeStock', label: '安全库存量', type: 'number' },
          { key: 'minStock', label: '最低库存量', type: 'number' },
          { key: 'maxStock', label: '最高库存量', type: 'number' },
          { key: 'replenishCycle', label: '补货周期（天）', type: 'number' },
          { key: 'storageLocation', label: '存储位置' },
        ] }] },
        { key: 'media', label: '媒体与说明', sections: [{ title: '媒体与说明', fields: [
          { key: 'image', label: '产品图片', placeholder: '上传或选择图片附件' },
          { key: 'productDesc', label: '产品说明', placeholder: '请输入产品说明' },
        ] }] },
      ],
      richTextLabel: '产品详情',
      attachmentLabel: commonAttachment,
    },
    materials: {
      title: '新增物料',
      submitText: '提交审批',
      sections: [{ title: '基础信息', fields: [
        { key: 'name', label: '物料名称', required: true },
        { key: 'pinyinCode', label: '拼音码', required: true },
        { key: 'code', label: '物料编号', type: 'readonly', placeholder: '自动生成' },
        { key: 'category', label: '物料分类', type: 'select', required: true, options: categoryOptions.material },
        { key: 'subCategory', label: '二级分类', type: 'select', required: true, options: materialSubCategories },
        { key: 'spec', label: '物料规格' },
        { key: 'obtainMethod', label: '获取方式', type: 'select', options: ['外购件', '客供料', '委外件', '用品'], defaultValue: '外购件' },
        { key: 'unit', label: '标准单位', type: 'select', options: unitOptions },
        { key: 'salesControl', label: '销售控制', type: 'select', options: ['允许销售', '禁止销售', '审批销售'], defaultValue: '禁止销售' },
        { key: 'state', label: '物料状态', type: 'select', options: ['启用', '停用', '禁止采购'], defaultValue: '启用' },
      ] }],
      tabs: [
        { key: 'purchase', label: '采购信息', sections: [{ title: '采购信息', fields: [
          { key: 'isRawMaterial', label: '是否原料', type: 'select', options: yesNo },
          { key: 'mainSupplier', label: '主供应商', type: 'picker', picker: 'supplier' },
          { key: 'minPurchaseQty', label: '最小采购量', type: 'number' },
          { key: 'suggestedPurchasePrice', label: '建议进价', type: 'number' },
        ] }], subTables: [{ key: 'purchaseUnits', title: '采购单位倍数表', addText: '新增行', columns: [{ key: 'unit', title: '供应单位' }, { key: 'factor', title: '换算系数' }, { key: 'barcode', title: '条形码' }], rows: [
          { id: 1, unit: '个', factor: '1', barcode: '' },
          { id: 2, unit: '箱', factor: '100', barcode: '' },
        ] }] },
        { key: 'stock', label: '库存策略', sections: [{ title: '库存策略', fields: [
          { key: 'maxStock', label: '最大库存', type: 'number' },
          { key: 'safeStock', label: '安全库存', type: 'number' },
          { key: 'sourceWarningDays', label: '采源预警（天）', type: 'number' },
          { key: 'minStock', label: '最低库存量', type: 'number' },
          { key: 'replenishCycle', label: '补货周期（天）', type: 'number' },
        ] }] },
        { key: 'media', label: '媒体与说明', sections: [{ title: '媒体与说明', fields: [
          { key: 'image', label: '物料图片', placeholder: '上传或选择图片附件' },
        ] }] },
      ],
      richTextLabel: '物料说明',
      attachmentLabel: commonAttachment,
    },
    processes: {
      title: '新增工序',
      submitText: '保存',
      sections: [{ title: '基础信息', fields: [
        { key: 'code', label: '工序编码', required: true },
        { key: 'name', label: '工序名称', required: true },
        { key: 'processType', label: '工序类型', type: 'select', required: true, options: ['自制', '委外', '多选'] },
        { key: 'category', label: '工序分类', type: 'select', required: true, options: categoryOptions.process },
      ] }],
      tabs: [
        { key: 'station', label: '工位', subTables: [{ key: 'stations', title: '工位', addText: '添加工位', columns: [
          { key: 'code', title: '工位编码' },
          { key: 'name', title: '工位名称' },
          { key: 'line', title: '所属生产线' },
          { key: 'workshop', title: '所属车间' },
          { key: 'factory', title: '所属工厂' },
        ], rows: [
          { id: 1, code: 'GW-001', name: '车削工位A', line: '生产线1', workshop: '一车间', factory: '海南傲为工厂' },
        ] }] },
        { key: 'hours', label: '工时', sections: [{ title: '工时配置', fields: [
          { key: 'standardHours', label: '标准工时', type: 'number' },
          { key: 'assistHours', label: '辅助工时', type: 'number' },
          { key: 'coolingHours', label: '冷却工时', type: 'number' },
          { key: 'processCost', label: '工序成本', type: 'number' },
        ] }] },
        { key: 'byproduct', label: '副产品', subTables: [{ key: 'byproducts', title: '副产品配置', addText: '选择副产品', columns: [
          { key: 'image', title: '图片', width: 70 },
          { key: 'name', title: '产品名称' },
          { key: 'code', title: '产品编号' },
          { key: 'model', title: '型号' },
          { key: 'category', title: '分类' },
          { key: 'unit', title: '单位' },
          { key: 'source', title: '获取方式' },
        ], rows: [] }] },
        { key: 'params', label: '技术参数', subTables: [{ key: 'params', title: '技术参数', addText: '添加参数', columns: [{ key: 'name', title: '参数名称' }, { key: 'value', title: '参数值' }], rows: [
          { id: 1, name: '', value: '' },
        ] }] },
        { key: 'qc', label: '质检方案', subTables: [{ key: 'qcPlans', title: '质检方案配置', addText: '添加质检方案', columns: [
          { key: 'code', title: '方案编号' },
          { key: 'name', title: '方案名称' },
          { key: 'scope', title: '适用范围' },
          { key: 'sampling', title: '抽样规则' },
          { key: 'control', title: '关键控制点' },
          { key: 'state', title: '状态' },
        ], rows: [] }] },
      ],
      richTextLabel: '工序说明',
      richTextFields: [{ key: 'relatedDocs', label: '关联文档', type: 'select', options: docOptions }],
      attachmentLabel: '附件信息',
    },
    crafts: {
      title: '新增工艺',
      submitText: '提交审批',
      sections: [{ title: '基础信息', fields: [
        { key: 'code', label: '工艺编号', type: 'readonly', placeholder: '自动生成' },
        { key: 'name', label: '工艺名称', required: true },
        { key: 'product', label: '适用产品', type: 'picker', picker: 'product', required: true },
        { key: 'version', label: '工艺版本', placeholder: 'V1.0' },
        { key: 'scope', label: '适用范围', type: 'select', options: ['通用', '指定客户', '指定项目', '试制专用'] },
        { key: 'isDefault', label: '是否默认工艺', type: 'select', options: yesNo },
        { key: 'effectiveDate', label: '生效日期', type: 'date' },
        { key: 'owner', label: '负责人', type: 'person' },
        { key: 'state', label: '工艺状态', type: 'select', options: ['草稿', '待审批', '已生效', '已作废'] },
      ] }],
      subTables: [{ key: 'route', title: '工艺路线明细', addText: '新增工序', columns: [
        { key: 'code', title: '工序编号', width: 120 },
        { key: 'name', title: '工序名称', width: 140 },
        { key: 'nodeType', title: '节点类型', width: 110 },
        { key: 'executeType', title: '执行方式', width: 100 },
        { key: 'preProcess', title: '前置工序', width: 120 },
        { key: 'parallelGroup', title: '并行组', width: 90 },
        { key: 'hours', title: '标准工时', width: 100 },
        { key: 'qc', title: '质检点', width: 90 },
        { key: 'reworkTrigger', title: '返工触发', width: 120 },
        { key: 'backTarget', title: '回流目标', width: 120 },
        { key: 'remark', title: '备注', width: 140 },
      ], rows: [{ id: 1, code: 'GX-001', name: '下料切割', nodeType: '加工', executeType: '自制', preProcess: '-', parallelGroup: 'A', hours: '30', qc: '否', reworkTrigger: '不合格', backTarget: '返修', remark: '' }] }],
      richTextLabel: '工艺说明',
      richTextFields: [{ key: 'relatedDocs', label: '关联文档', type: 'select', options: ['智能控制器标准规范 V1.0', '装配线巡检模板 V1.2'] }],
      attachmentLabel: '附件信息',
    },
    boms: {
      title: '新增BOM',
      submitText: '提交审批',
      sections: [],
      richTextLabel: 'BOM说明',
      attachmentLabel: commonAttachment,
    },
  };
  return configs[module];
}
