export type TemplateStage = 'stable' | 'sample' | 'defer';

export interface TemplateAsset {
  name: string;
  path: string;
  stage: TemplateStage;
  note: string;
}

export interface TemplateRoute {
  name: string;
  path: string;
  page: string;
}

export interface ModuleTemplatePack {
  key: string;
  title: string;
  description: string;
  routes: TemplateRoute[];
  assets: {
    workbench: TemplateAsset[];
    list: TemplateAsset[];
    detail: TemplateAsset[];
    form: TemplateAsset[];
    setting: TemplateAsset[];
    samplePages: TemplateAsset[];
  };
  reuseRules: string[];
  nextModuleParameters: string[];
}

export const customerManagementTemplatePack: ModuleTemplatePack = {
  key: 'sales.customers',
  title: '客户管理模板包',
  description: '以客户管理已验收页面为样板，沉淀销售中心可复制的工作台、列表、详情、新增/编辑、设置页母版。',
  routes: [
    { name: '客户列表', path: '/sales/customers', page: '@/views/sales/customers/CustomerList.vue' },
    { name: '新增客户', path: '/sales/customers/new', page: '@/views/sales/customers/CustomerCreate.vue' },
    { name: '客户详情', path: '/sales/customers/:id', page: '@/views/sales/customers/CustomerDetail.vue' },
    { name: '客户设置', path: '/sales/customers/settings/:setting', page: '@/views/sales/customers/CustomerSettingPage.vue' },
  ],
  assets: {
    workbench: [
      { name: 'WorkbenchBoard', path: '@/components/workbench/WorkbenchBoard.vue', stage: 'sample', note: '已满足销售工作台样式，仍需继续参数化不同中心的数据源。' },
      { name: 'salesWorkbench', path: '@/components/workbench/salesWorkbench.ts', stage: 'sample', note: '销售中心工作台配置样例。' },
    ],
    list: [
      { name: 'AwListPage', path: '@/components/list-page/AwListPage.vue', stage: 'stable', note: '标准列表页骨架。' },
      { name: 'AwResourceTree', path: '@/components/list-page/AwResourceTree.vue', stage: 'stable', note: '左侧资源树和数量统计。' },
      { name: 'AwListToolbar', path: '@/components/list-page/AwListToolbar.vue', stage: 'stable', note: '搜索、刷新、筛选、字段、导入、导出、新增。' },
      { name: 'AwDataTable', path: '@/components/list-page/AwDataTable.vue', stage: 'stable', note: '固定选择列、序号列、操作列、批量操作。' },
      { name: 'customerListConfig', path: '@/views/sales/customers/customerList.config.ts', stage: 'stable', note: '客户列表配置样例，后续销售计划/报价/合同/订单按此模式复制。' },
    ],
    detail: [
      { name: 'AwDetailPage', path: '@/components/detail-page/AwDetailPage.vue', stage: 'stable', note: '详情页容器。' },
      { name: 'AwDetailToolbar', path: '@/components/detail-page/AwDetailToolbar.vue', stage: 'stable', note: '返回和右侧操作按钮容器。' },
      { name: 'AwDetailHeader', path: '@/components/detail-page/AwDetailHeader.vue', stage: 'stable', note: '详情摘要头。' },
      { name: 'AwDetailTabs', path: '@/components/detail-page/AwDetailTabs.vue', stage: 'stable', note: '详情 Tab。' },
      { name: 'AwDetailInfoGrid', path: '@/components/detail-page/AwDetailInfoGrid.vue', stage: 'stable', note: '字段信息网格。' },
      { name: 'AwDetailMetricGrid', path: '@/components/detail-page/AwDetailMetricGrid.vue', stage: 'stable', note: '信用/金额指标卡。' },
    ],
    form: [
      { name: 'AwFormPage', path: '@/components/form-page/AwFormPage.vue', stage: 'stable', note: '新增/编辑页容器和顶部动作。' },
      { name: 'AwEditableSubTable', path: '@/components/form-page/AwEditableSubTable.vue', stage: 'stable', note: '联系人、财务、地址、附件等可编辑子表。' },
      { name: 'AwPaymentTermCards', path: '@/components/form-page/AwPaymentTermCards.vue', stage: 'stable', note: '账期设置卡片。' },
      { name: 'AwRichTextEditor', path: '@/components/form-page/AwRichTextEditor.vue', stage: 'sample', note: '富文本外观样板，真实编辑能力后续再增强。' },
    ],
    setting: [
      { name: 'AwSettingPage', path: '@/components/setting-page/AwSettingPage.vue', stage: 'stable', note: '设置页外层容器。' },
      { name: 'AwSettingToolbar', path: '@/components/setting-page/AwSettingToolbar.vue', stage: 'stable', note: '返回、刷新、新增、取消、编辑、保存工具栏。' },
      { name: 'AwSettingSplitPage', path: '@/components/setting-page/AwSettingSplitPage.vue', stage: 'stable', note: '左树右表设置页结构。' },
      { name: 'AwSettingTree', path: '@/components/setting-page/AwSettingTree.vue', stage: 'stable', note: '设置页左侧分类树。' },
      { name: 'AwSettingListCard', path: '@/components/setting-page/AwSettingListCard.vue', stage: 'stable', note: '右侧标题、说明、搜索和内容卡片。' },
      { name: 'AwSettingTable', path: '@/components/setting-page/AwSettingTable.vue', stage: 'sample', note: '普通设置列表样板，复杂单元格仍由业务页插槽处理。' },
      { name: 'CustomerSettingPage', path: '@/views/sales/customers/CustomerSettingPage.vue', stage: 'sample', note: '客户设置验收样例，不在第五阶段继续深拆。' },
    ],
    samplePages: [
      { name: 'CustomerList', path: '@/views/sales/customers/CustomerList.vue', stage: 'stable', note: '列表页调用样例。' },
      { name: 'CustomerDetail', path: '@/views/sales/customers/CustomerDetail.vue', stage: 'stable', note: '详情页调用样例。' },
      { name: 'CustomerCreate', path: '@/views/sales/customers/CustomerCreate.vue', stage: 'stable', note: '新增/编辑页调用样例。' },
    ],
  },
  reuseRules: [
    '静态 preview 页面继续作为视觉验收基准，不作为后续业务实现入口。',
    '已验收的客户页面先不重写；后续模块先复制配置和调用方式，再逐步替换旧 SimpleSalesList。',
    '列表、详情、新增/编辑优先复用公共母版；设置页先复用壳和左右结构，编号/审批/策略暂缓深拆。',
    '真实数量、状态、审批流、编号规则必须来自业务数据或接口契约，不能使用页面占位数字。',
  ],
  nextModuleParameters: [
    'moduleKey、title、baseRoute、createRoute、detailRoute、settingRoute',
    'list loader、rowKey、tree groups、toolbar actions、table columns、bulk actions',
    'detail header meta、status tone、metric cards、tabs、actions',
    'form sections、editable sub tables、payment terms、rich text fields',
    'setting names、field scopes、number rule candidates、approval flow options、policy rows',
  ],
};
