# 新窗口交接说明

更新时间：2026-05-27

## 当前判断

当前上下文已经过长，继续在同一窗口推进容易把静态预览、Vue 工程、接口契约和并行协同混在一起，导致反复返工。

后续建议开新窗口执行。新窗口必须先读取本文，再读取对应模块的接口契约和客户管理母版资料。

## 最高目标

最终交付物是可运行、可对接后端的 `vue3` 工程，不是静态 HTML。

静态 HTML 只作为人工验收镜子，不能作为实现来源。

## 四个基准

1. 接口契约是字段和 API 基准。
   - 目录：`接口契约-中心模块/`
   - 销售中心契约：`接口契约-中心模块/销售中心-页面接口契约.md`
   - 协作规范：`接口契约-中心模块/销售中心-前后端接口协作规范.md`

2. 原先前端页面是业务字段、页面数据、交互逻辑的第一手参考。
   - 客户管理：`customer-list.jsx`
   - 销售计划：`sales-plan-list.jsx`
   - 报价管理：`quote-list.jsx`
   - 合同管理：`contract-list.jsx`
   - 订单管理：`sale-order-list.jsx`
   - 选择人员弹窗：`person-picker.jsx`
   - 选择产品弹窗：`product-picker.jsx`
   - 筛选抽屉：`filter-drawer.jsx`
   - 字段配置抽屉：`field-drawer.jsx`
   - 导入抽屉：`import-drawer.jsx`
   - 导出抽屉：`export-drawer.jsx`
   - 打印模板：`print-template.jsx`
   - 自定义字段：`custom-field.jsx`
   - 审批流程：`approval-flow.jsx`

   使用规则：
   - 列表字段、表格列、详情 Tab、新增表单字段、弹窗字段、默认 mock 数据，优先从原先前端页面提取。
   - 如果原先前端页面和接口契约字段冲突，以接口契约为后端字段名基准，以原先前端页面为展示和交互基准，并在交付记录里写明映射。
   - 如果原先前端页面有乱码，允许按任务包和上下文修正为正常中文，但字段含义不能擅自改。

3. 客户管理已验收页面是样式和交互母版。
   - 客户列表：`vue3/src/views/sales/customers/CustomerList.vue`
   - 客户新增：`vue3/src/views/sales/customers/CustomerCreate.vue`
   - 客户详情：`vue3/src/views/sales/customers/CustomerDetail.vue`
   - 客户设置：`vue3/src/views/sales/customers/CustomerSettingPage.vue`

4. Vue 公共组件是复用入口。
   - 列表母版：`vue3/src/components/list-page/`
   - 详情母版：`vue3/src/components/detail-page/`
   - 表单母版：`vue3/src/components/form-page/`
   - 设置母版：`vue3/src/components/setting-page/`

## 禁止事项

- 不允许为了赶页面重新造一套表格、弹窗、审批、编号、设置页样式。
- 不允许只修静态预览而不修 Vue 工程。
- 不允许字段写死在页面里后不进入 API/mock/模板配置。
- 不允许跳过原 JSX 字段和接口契约字段核对。
- 不允许让不同模块的同类页面出现不同交互。
- 不允许把退货、换货、报表提前做，本轮先不做。

## 推荐开窗方式

先开 2 个窗口，不建议一上来开 5 个中心并行。

### 窗口 A：主控窗口

职责：
- 维护规则和公告板。
- 检查接口契约、母版一致性、构建结果。
- 验收执行窗口交付。
- 把返修任务写入公告板，不让用户持续传话。

必读文件：
- `docs/new-window-handoff.md`
- `docs/sales-parallel-coordination.md`
- `docs/customer-management-baseline.md`
- `docs/customer-management-template-pack.md`
- `docs/sales-settings-contract-alignment.md`

### 窗口 B：销售中心收口窗口

职责：
- 只负责销售中心。
- 先把计划、报价、合同、订单对齐客户管理母版。
- 字段以原 JSX 和接口契约为准。
- 页面以 Vue 工程为主，静态预览只同步验收入口。

优先顺序：
1. 设置页：自定义字段、自定义编号、审批设置、策略设置。
2. 列表页：字段、数据、固定列、工具栏、批量操作。
3. 详情页：头部、操作栏、Tab 独立内容、明细表。
4. 新增/编辑页：字段、子表、选择弹窗、附件、富文本。
5. 静态验收页同步。

## 销售中心当前关键规则

销售中心设置页已开始向契约驱动收口，相关文件：

- 类型契约：`vue3/src/app/api/sales/types.ts`
- API adapter：`vue3/src/app/api/sales/resources.ts`
- 设置默认配置：`vue3/src/app/templates/settings-template.ts`
- 销售设置入口：`vue3/src/views/sales/shared/SalesSettingPage.vue`
- 设置契约说明：`docs/sales-settings-contract-alignment.md`

设置页统一接口：

```text
GET   /api/v1/{resource}/settings
PATCH /api/v1/{resource}/settings
```

资源映射：

| 模块 | resource |
| --- | --- |
| 销售计划 | `sales-plans` |
| 报价管理 | `sales-quotes` |
| 合同管理 | `sales-contracts` |
| 订单管理 | `sales-orders` |

## 新窗口第一步

新窗口不要立刻改代码，先做盘点：

1. 读取本文。
2. 读取对应中心的接口契约。
3. 读取原先前端页面，提取字段、数据和交互。
4. 读取客户管理已验收页面和公共母版组件。
5. 对比当前模块 Vue 页面，列出：
   - 已复用母版的部分
   - 仍写死的部分
   - 字段和契约不一致的部分
   - 交互和客户管理不一致的部分
6. 先输出小计划，再开始改。

## 验收底线

每轮交付必须至少满足：

- `vue3` 构建通过。
- 字段来自接口契约或原 JSX，不凭空增删。
- 客户管理母版交互不漂移。
- 静态验收入口能打开且和 Vue 工程保持同一套字段。
- 修改记录写入 `docs/sales-parallel-coordination.md`。

构建命令：

```powershell
$node='C:\Users\btcet\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$pnpm='C:\Users\btcet\Desktop\5.1\.codex-tools\pnpm\pkg\package\bin\pnpm.cjs'
& $node $pnpm run build
```

## 给新窗口的启动提示词

```text
请先读取 docs/new-window-handoff.md。
本轮最终交付是 vue3 工程可用，并按接口契约对接后端；静态 HTML 只做验收镜子。
原先前端 JSX 页面是字段、数据和交互逻辑的第一手参考，必须先读取并提取。
客户管理已验收页面是样式和交互母版，不允许另起一套组件。
请先盘点你负责模块与客户管理母版、接口契约的差异，输出小计划，再执行。
改完必须跑 vue3 构建，并把处理记录写入 docs/sales-parallel-coordination.md。
```
