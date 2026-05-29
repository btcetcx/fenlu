# Vue3 公共组件与母版拆分方案

## 目标

客户管理已经形成一套可复用样板：销售工作台、客户列表、客户详情、新增客户、客户设置。下一步不应继续复制静态页面，而是先把这套样板沉淀为 Vue 3 + Vite + Ant Design Vue 的公共组件和母版，再让销售计划、报价、合同、订单通过配置调用。

本方案只基于当前仓库分析：`vue3/src`、`vue3/preview-*.html`、`vue3/src/styles/aw-console.css`。

## 1. 建议组件目录结构

当前工程已经有一部分可继续沿用：

```text
vue3/src
  layouts/
    erp-shell/
      ErpShell.vue
      ErpTopbar.vue
      ErpSidebar.vue
      ErpPageHead.vue
      navigation.ts
  components/
    workbench/
    list-page/
```

建议扩展为：

```text
vue3/src/components
  workbench/
    ModuleWorkbench.vue
    WorkbenchTodoGrid.vue
    WorkbenchBusinessNav.vue
    WorkbenchQuickEntries.vue
    WorkbenchFeedPanel.vue
    WorkbenchTodoModal.vue

  list-page/
    AwListPage.vue
    AwResourceTree.vue
    AwListToolbar.vue
    AwDataTable.vue
    AwPaginationBar.vue
    AwBatchActions.vue

  detail-page/
    AwDetailPage.vue
    AwDetailToolbar.vue
    AwDetailHeader.vue
    AwDetailTabs.vue
    AwDetailInfoGrid.vue
    AwMetricCards.vue

  form-page/
    AwFormPage.vue
    AwFormToolbar.vue
    AwFormSection.vue
    AwFormGrid.vue
    AwEditableSubTable.vue
    AwPaymentTermCards.vue
    AwRichTextEditor.vue

  setting-page/
    AwSettingPage.vue
    AwSettingSplitPage.vue
    AwSettingTree.vue
    AwSettingTable.vue
    AwSettingToolbar.vue
    AwCodeRuleBuilder.vue
    AwPolicySettingPanel.vue

  approval/
    AwApprovalFlowEditor.vue
    AwApprovalNodeCard.vue

  picker/
    AwPersonPickerModal.vue

  upload/
    AwAttachmentTable.vue

  shared/
    AwModal.vue
    AwSwitch.vue
    AwStatus.vue
    AwActionLinks.vue
    AwSearchBox.vue
    types.ts
```

业务页面建议保留在：

```text
vue3/src/views/sales
  customers/
    CustomerList.vue
    CustomerDetail.vue
    CustomerCreate.vue
    CustomerSettingPage.vue
    customer.config.ts
  sales-plans/
  sales-quotes/
  sales-contracts/
  sales-orders/
```

后续每个模块只维护自己的 `*.config.ts`、接口请求和少量业务插槽，不重复写页面骨架。

## 2. 公共组件职责与接口建议

### ErpShell

现有文件：`src/layouts/erp-shell/ErpShell.vue`、`ErpTopbar.vue`、`ErpSidebar.vue`、`navigation.ts`。

职责：

- 承载一级导航、左侧二级导航、三级/四级浮窗。
- 根据路由自动识别当前中心和左侧激活项。
- 保持所有模块统一的顶部、左侧、标题区布局。

建议 props/events/slots：

- `topNavItems`: 一级导航配置。
- `sideItems`: 当前中心左侧导航配置。
- `activeTopKey`、`activeSideKey`。
- `@navigate(route)`：统一跳转。
- `#page-actions`：页面标题右侧动作，例如“大屏看板”。

当前可以先沿用现有实现，后续重点增强 `navigation.ts` 的配置类型。

### ModuleWorkbench

来源：当前 `WorkbenchBoard.vue` 和 `salesWorkbench.ts` 已经接近母版。

职责：

- 模块工作台统一渲染。
- 包含待办事项、业务导航、便捷入口、公告/消息中心、最近访问。
- 支持待办默认 7 个、展开全部、全部弹窗、刷新状态、卡片拖拽排序。

建议 props：

- `moduleKey: string`
- `todos: WorkbenchTodo[]`
- `businessNav: WorkbenchTile[]`
- `quickEntries: WorkbenchEntry[]`
- `notices: WorkbenchNotice[]`
- `recent: WorkbenchRecent[]`
- `todoDefaultCount?: number`

建议 events：

- `@refresh-todos`
- `@open-todo(item)`
- `@open-business(item)`
- `@open-entry(item)`
- `@reorder(section, nextItems)`

建议 slots：

- `#todo-card`
- `#business-card`
- `#entry-card`

复用方式：

- 销售中心传 `salesWorkbench`。
- 后续采购、仓储、生产只换数据配置，不换结构。

### AwListPage

现有文件：`AwListPage.vue`、`AwResourceTree.vue`、`AwListToolbar.vue`、`AwDataTable.vue`。

职责：

- 标准列表页骨架：左分类树 + 右工具栏 + 数据表格 + 批量操作 + 分页。
- 适配客户列表、销售计划列表、报价列表、合同列表、订单列表。

建议 props：

- `tree?: ResourceTreeConfig`
- `toolbar: ListToolbarConfig`
- `columns: AwTableColumn[]`
- `rows: Record<string, unknown>[]`
- `rowKey?: string`
- `loading?: boolean`
- `pagination?: PaginationState`
- `selectedKeys?: string[]`

建议 events：

- `@search(keyword)`
- `@refresh`
- `@filter`
- `@columns`
- `@import`
- `@export`
- `@create`
- `@select-change(keys)`
- `@batch-action(action, keys)`
- `@page-change(pageNo, pageSize)`
- `@row-click(row)`

建议 slots：

- `#tree`
- `#toolbar-left`
- `#toolbar-right`
- `#cell="{ column, record, value }"`
- `#batch-actions`

当前 `AwDataTable` 已具备固定选择列、固定序号列、右侧操作列雏形。下一步应把分页和批量操作从表格内拆出，避免表格组件承担页面逻辑。

### AwDetailPage

来源：`CustomerDetail.vue` 和 `preview-customer-detail.html`。

职责：

- 标准详情页框架。
- 包含返回栏、右侧操作按钮容器、摘要头、Tab 区、信息网格、指标卡、关联记录表格。

建议 props：

- `title: string`
- `code?: string`
- `status?: StatusConfig`
- `meta: DetailMetaItem[]`
- `tabs: TabItem[]`
- `activeTab: string`
- `actions: ActionItem[]`
- `metrics?: MetricItem[]`

建议 events：

- `@back`
- `@action(actionKey)`
- `@tab-change(tabKey)`

建议 slots：

- `#summary`
- `#tab-panel`
- `#actions`
- `#metrics`

客户详情当前可以作为第一批迁移目标，因为结构清楚、业务逻辑轻。

### AwFormPage

来源：`CustomerCreate.vue` 和 `preview-customer-new.html`。

职责：

- 标准新增/编辑页。
- 统一顶部操作栏、基础信息表单、分组表单、Tab 子表、账期卡片、富文本。

建议 props：

- `mode: 'create' | 'edit'`
- `title: string`
- `actions: ActionItem[]`
- `sections: FormSectionConfig[]`
- `modelValue: Record<string, unknown>`

建议 events：

- `@update:modelValue`
- `@save`
- `@reset`
- `@cancel`
- `@submit-draft`

建议 slots：

- `#section-{key}`
- `#after-sections`
- `#footer`

### AwEditableSubTable

来源：新增客户页中的联系人信息、财务信息、地址信息、附件信息。

职责：

- 表格形式维护一组可新增、可删除、可设置默认的行。
- 适用于联系人、财务账户、地址、附件信息等。

建议 props：

- `title?: string`
- `columns: EditableColumn[]`
- `rows: unknown[]`
- `addText: string`
- `minRows?: number`
- `defaultable?: boolean`

建议 events：

- `@add`
- `@remove(row, index)`
- `@update:rows`
- `@set-default(row, index)`

建议 slots：

- `#cell="{ column, row, index }"`
- `#actions="{ row, index }"`

### AwPaymentTermCards

来源：新增客户页账期设置。

职责：

- 统一现结、月结、周期、额度四类账期设置。
- 输入框在卡片内，卡片可切换。

建议 props：

- `modelValue: string`
- `items: PaymentTermItem[]`

建议 events：

- `@update:modelValue`
- `@update:item`

### AwRichTextEditor

来源：新增客户页客户详情富文本。

职责：

- 初期可以先封装现有假富文本工具栏和 `contenteditable`。
- 后续如需要真实富文本，可替换为 TipTap、Quill 或 AntD `Textarea` 增强版。

建议 props：

- `modelValue: string`
- `placeholder?: string`
- `readonly?: boolean`

建议 events：

- `@update:modelValue`

### AwSettingSplitPage

来源：客户分组设置、客户自定义字段。

职责：

- 左侧分类/位置树 + 右侧列表。
- 支持左侧新增一级分类、右侧按左侧筛选、搜索、表格操作。

建议 props：

- `title: string`
- `treeTitle: string`
- `treeItems: SettingTreeItem[]`
- `activeKey: string`
- `rightTitle: string`
- `rightDescription?: string`
- `columns: SettingColumn[]`
- `rows: unknown[]`
- `searchPlaceholder?: string`
- `actions?: ActionItem[]`

建议 events：

- `@tree-change(key)`
- `@tree-create`
- `@search(keyword)`
- `@row-edit(row)`
- `@row-delete(row)`
- `@row-toggle(row, key)`

建议 slots：

- `#tree-extra`
- `#right-head`
- `#cell`

### AwSettingTable

来源：客户等级设置、客户审批设置列表态。

职责：

- 普通设置列表：标题、说明、搜索、开关、编辑/删除。

建议 props：

- `title`
- `description`
- `columns`
- `rows`
- `searchPlaceholder`

建议 events：

- `@search`
- `@edit`
- `@delete`
- `@toggle`

### AwCodeRuleBuilder

来源：客户自定义编号。

职责：

- 左侧编号预览、已选编号项。
- 右侧规则名称、规则编码、间隔符、编号项候选。
- 支持新增编号项、删除、排序、搜索项开关、最多 5 项限制。

建议 props：

- `prefix: string`
- `separator: string`
- `selectedItems: CodeRuleItem[]`
- `candidateItems: CodeRuleCandidate[]`
- `maxItems?: number`

建议 events：

- `@update:prefix`
- `@update:separator`
- `@select-item`
- `@remove-item`
- `@reorder`
- `@save`
- `@reset`

### AwApprovalFlowEditor

来源：客户审批设置新增审批规则。

职责：

- 一比一复刻审批规则编辑：流程名称、审批节点、节点卡片、添加节点。
- 审批人支持多选，选中人员在输入框下方展示，只在人员标签删除时移除。
- 审批方式支持依次审批、会签、或签。

建议 props：

- `modelValue: ApprovalFlow`
- `personOptions?: Person[]`
- `readonly?: boolean`

建议 events：

- `@update:modelValue`
- `@save`
- `@cancel`
- `@edit`
- `@open-person-picker(nodeIndex)`

建议 slots：

- `#node-extra`

### AwPersonPickerModal

来源：原先人员选择弹窗和当前字段权限设置、审批人选择。

职责：

- 左侧组织树、搜索、右侧人员表格、多选、确认。
- 被字段权限、审批节点、客户经理绑定复用。

建议 props：

- `open: boolean`
- `departments: DepartmentNode[]`
- `people: Person[]`
- `selectedKeys: string[]`
- `multiple?: boolean`
- `title?: string`

建议 events：

- `@update:open`
- `@confirm(people)`
- `@cancel`
- `@search(keyword)`
- `@department-change(deptKey)`

### AwAttachmentTable

来源：新增客户页附件信息 Tab。

职责：

- 不是独立大区域，而是在“附件信息”Tab 中以表格形式新增/上传/删除。
- 上传后可查看、下载。

建议 props：

- `rows: AttachmentRow[]`
- `uploadAction?: string`
- `accept?: string`

建议 events：

- `@upload(file, row)`
- `@view(row)`
- `@download(row)`
- `@remove(row)`
- `@add-row`

### AwPolicySettingPanel

来源：客户策略设置。

职责：

- Tab + 策略行配置。
- 下拉审批流程来源于客户审批设置列表。
- 支持开关、下拉、保存、重置默认。

建议 props：

- `tabs: PolicyTab[]`
- `activeTab: string`
- `approvalOptions: string[]`

建议 events：

- `@tab-change`
- `@update-row`
- `@save`
- `@reset`

## 3. 从客户管理迁移到组件的顺序

建议不要一次性重写，按风险从低到高迁移。

1. 冻结样式和命名

- 保留 `aw-console.css` 作为当前视觉基准。
- 组件先使用现有 class，不急着改成 CSS Modules 或 scoped。
- 所有图标统一走线条型图标 class 或 Ant Design Icons。

2. 工作台

- 将 `WorkbenchBoard.vue` 升级为 `ModuleWorkbench.vue`。
- `salesWorkbench.ts` 改为销售中心配置数据。
- 验证：销售工作台视觉、展开、全部弹窗、刷新、拖拽不变。

3. 列表页

- 以 `CustomerList.vue` 反推 `AwListPage`、`AwDataTable`、`AwListToolbar`。
- 先保持客户列表调用新组件。
- 验证：左侧树、工具栏、固定列、全选、批量按钮、分页不变。

4. 详情页

- 从 `CustomerDetail.vue` 抽 `AwDetailPage`。
- 客户详情只保留数据映射、事件处理和特殊 tab 内容。

5. 新增/编辑页

- 从 `CustomerCreate.vue` 抽 `AwFormPage`、`AwEditableSubTable`、`AwPaymentTermCards`、`AwRichTextEditor`。
- 先只抽结构，不改变输入逻辑。

6. 设置页

- 最后拆 `CustomerSettingPage.vue`，因为它当前体量最大、交互最多。
- 优先拆 `AwSettingSplitPage`、`AwSettingTable`。
- 再拆 `AwCodeRuleBuilder`、`AwApprovalFlowEditor`、`AwPolicySettingPanel`。

7. 回填验证

- 客户管理所有 Vue 页面改成调用公共组件。
- 静态预览页面暂时不动，作为视觉对照基准。

## 4. 与 Ant Design Vue 的结合方式

Ant Design Vue 已在 `src/main.ts` 中全局安装，建议采用“能力用 AntD，外观由 AW 组件控制”的方式：

- 表单基础控件：优先用 `a-input`、`a-select`、`a-checkbox`、`a-radio`、`a-switch`、`a-textarea`。
- 弹窗：`a-modal` 可作为 `AwModal` 底层。
- 上传：`a-upload` 可作为 `AwAttachmentTable` 底层。
- 人员选择表格：可用 `a-table`，但固定列和行高必须套 AW class 对齐当前样式。
- 图标：优先用 `@ant-design/icons-vue` 或统一线条型图标组件，避免 emoji 和实心图标混用。
- 消息反馈：保存、删除、上传成功可用 `message`。
- 确认删除：可用 `Modal.confirm`，但按钮文案、颜色需贴近现有 AW 样式。

不建议直接全量使用 AntD 的 `Layout`、`Menu`、`Table` 替换现有结构。原因是当前 ERP Console 的一比一视觉已经由 `aw-console.css` 固化，直接替换会造成行高、间距、固定列、浮窗样式返工。

建议封装原则：

```text
业务页 -> AW 母版组件 -> AntD 基础控件
```

例如：

```vue
<aw-list-toolbar
  create-label="新增客户"
  @refresh="loadData"
  @create="router.push('/sales/customers/new')"
/>
```

内部可以逐步把按钮替换为 `a-button`，但外层 class 保持 `aw-tool-btn`、`aw-btn primary` 的视觉约束。

## 5. 后续复用到销售计划/报价/合同/订单的调用方式

建议每个业务对象维护一个配置文件，例如：

```text
src/views/sales/sales-plans/salesPlan.config.ts
src/views/sales/sales-quotes/salesQuote.config.ts
src/views/sales/sales-contracts/salesContract.config.ts
src/views/sales/sales-orders/salesOrder.config.ts
```

配置结构建议：

```ts
export const salesPlanModule = {
  entity: 'salesPlan',
  title: '销售计划',
  routes: {
    list: '/sales/sales-plans',
    create: '/sales/sales-plans/new',
    detail: '/sales/sales-plans/:id',
    settings: '/sales/sales-plans/settings/:setting',
  },
  list: {
    tree,
    toolbar,
    columns,
    batchActions,
  },
  detail: {
    actions,
    tabs,
    meta,
    metrics,
  },
  form: {
    sections,
    subTables,
  },
  settings: {
    groups,
    fields,
    numbers,
    approvals,
    strategies,
  },
};
```

列表页调用方式：

```vue
<aw-list-page
  :tree="moduleConfig.list.tree"
  :toolbar="moduleConfig.list.toolbar"
  :columns="moduleConfig.list.columns"
  :rows="rows"
  :pagination="pagination"
  @search="search"
  @refresh="loadData"
  @create="goCreate"
/>
```

详情页调用方式：

```vue
<aw-detail-page
  :title="record.title"
  :code="record.code"
  :status="record.status"
  :meta="detailMeta"
  :tabs="moduleConfig.detail.tabs"
  :actions="moduleConfig.detail.actions"
  @back="goList"
  @action="handleAction"
/>
```

新增页调用方式：

```vue
<aw-form-page
  mode="create"
  :sections="moduleConfig.form.sections"
  v-model="form"
  @save="save"
  @cancel="goList"
/>
```

设置页调用方式：

```vue
<aw-setting-page
  :setting-key="route.params.setting"
  :config="moduleConfig.settings"
  @save="saveSetting"
/>
```

销售计划、报价、合同、订单的差异应主要放在：

- 字段配置。
- 列表列配置。
- 表单 section。
- 详情 tab。
- 审批流程选项。
- 策略行配置。

页面骨架、工具栏、表格、弹窗、人员选择、审批流编辑器不再复制。

## 建议验收标准

- 客户管理迁移后，静态预览和 Vue 页面视觉差异可控。
- 客户列表、新增、详情、设置页不出现重复页面骨架代码。
- 新增销售计划列表页时，只写配置和接口映射，不重写列表布局。
- 新增报价/合同/订单设置页时，可直接复用客户设置母版。
- 所有开关、弹窗、人员选择、审批节点交互统一。

## 注意事项

- 静态预览页面继续作为视觉参照，不建议在组件抽取阶段删除。
- `CustomerSettingPage.vue` 当前承担太多职责，拆分时要小步迁移，避免一次性重写。
- `aw-console.css` 目前是事实上的设计系统，先复用 class，再逐步整理 token。
- Ant Design Vue 只做基础能力，不直接改变 ERP Console 的版式和视觉密度。
