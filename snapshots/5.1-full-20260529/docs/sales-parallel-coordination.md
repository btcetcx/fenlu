# 销售中心并行复刻协同公告板

更新时间：2026-05-27

## 使用方式

所有并行窗口开工前先读取本文件，并以这里的批复为准。

如果某个窗口后续还有问题，请把问题追加到本文件的「待批复问题」区域，格式如下：

```text
## 待批复问题

### 窗口 X - 模块名 - 时间
问题：
建议方案：
影响文件：
是否阻塞：
```

主控窗口负责定期查看并在「主控批复」里回复。其他窗口每次继续工作前先重新读取本文件。

## 协同节奏

- 执行窗口每 10 分钟重新读取一次本文件。
- 每完成一个小阶段，也要重新读取一次本文件。
- 遇到阻塞问题，先追加到「待批复问题」，不要擅自扩大范围。
- 非阻塞问题可以先按当前标准继续做，并在交付总结里标明假设。
- 设置页内部实现依赖窗口 5 通用设置母版。窗口 5 未完成前，窗口 1/2/3/4 只接入口，不深入实现设置页内部。

## 检查与返修闭环

主控窗口负责在其他窗口交付后做检查。检查发现的问题分两类：

1. 主控可直接修复的问题
   - 小范围错字
   - 明确漏字段
   - 静态预览入口错误
   - 状态色映射错误
   - mock 少量数据补齐

2. 需要派回执行窗口的问题
   - 涉及该模块业务逻辑
   - 涉及新增页/详情页复杂交互
   - 涉及该窗口正在负责的文件
   - 主控修复可能和执行窗口当前工作冲突

主控发现需要派回的问题时，追加到「返修任务池」区域。执行窗口每 10 分钟读取本文件时，必须检查是否有派给自己的返修任务。

执行窗口领取返修任务后，需要把任务状态从 `待领取` 改成 `处理中`；修完后改成 `已完成`，并写清楚修改文件和检查入口。

如果执行窗口认为任务不属于自己，不能删除任务，必须在任务下面追加说明并标记 `需主控确认`。

## 返修任务池格式

```text
### 返修任务 R-编号 - 派给窗口 X - 模块名
状态：待领取 / 处理中 / 已完成 / 需主控确认
发现时间：
发现人：主控 / 交叉检查窗口
问题：
期望结果：
影响入口：
影响文件：
验收方式：
处理记录：
```

## 执行窗口定时动作

每个执行窗口每 10 分钟做一次：

1. 重新读取本文件。
2. 查看「主控批复」是否有新规则。
3. 查看「返修任务池」是否有派给自己的 `待领取` 任务。
4. 如果有，先处理返修任务，再继续新功能。
5. 如果没有，继续当前任务。
6. 如果遇到新问题，追加到「待批复问题」。

## 主控定时动作

主控窗口每 10 分钟做一次：

1. 查看「待批复问题」并批复。
2. 查看各窗口交付总结。
3. 检查已交付页面。
4. 主控能小修的直接修。
5. 需要模块窗口处理的，写入「返修任务池」。
6. 对已完成返修任务做复查。

## 全局批复

1. 允许所有窗口先扫描目录、读取原 JSX、读取相关 Vue/mock/preview 文件。
   - 读取是只读行为，允许执行。
   - 原 JSX 只作为依据，不允许修改。

2. 如果对应模块已有半成品，必须在现有基础上补齐。
   - 保留用户已有改动。
   - 不要重写已经验收通过的母版样式。
   - 不要删除其他窗口或用户已做内容。

3. 原 JSX 中乱码字段允许按任务包里的中文字段清单修正为正常中文。
   - 修正必须同步到 Vue 配置、mock 数据、静态预览。
   - 如果语义不确定，先追加到「待批复问题」。

4. 静态预览统一沿用现有参数分流。
   - 报价、合同、订单继续使用 `preview-sales-basic-list.html`。
   - 不新增独立的报价/合同/订单预览 HTML，除非主控另行批准。
   - 新增页使用 `action=new`。
   - 详情页使用 `id=xxx`。
   - 设置页使用 `setting=fields|numbers|approvals|strategies|print`。

5. 设置页内部只做入口/占位的旧规则已作废。
   - 从 2026-05-27 15:25 起，所有销售设置页必须复用客户管理已验收设置页作为唯一母版。
   - 不允许继续交付“等待母版接入”、纯占位、写死不可编辑的设置页。
   - 不允许每个模块重复造一套设置页。

6. 路由结构暂时不改成动态路径。
   - 列表跳详情继续使用当前约定的 query 或现有路由方式。
   - 例如订单详情暂不改为 `/sales/sales-orders/:id`，新增页暂不改为 `/sales/sales-orders/new`。
   - 原因：路由规范需要主控统一调整，否则窗口之间容易产生入口不一致。
   - 窗口 3 可以在交付中提出动态路由建议，但本阶段不要改。

## 主控批复

### 2026-05-27 15:25 - 主控回正批复：设置页以客户管理验收页为唯一母版

批复：
- 旧规则“设置页内部只做入口/占位”到此作废。
- 计划、报价、合同、订单的设置页必须复用客户管理设置页的结构与交互，只允许替换模块字段、标题、编号前缀、审批流名称和策略文案。
- 自定义字段必须有左右结构、字段列表、是否必填/是否启用开关、编辑/删除，以及新增/编辑字段弹窗。
- 自定义编号必须使用编号构建器，固定前缀黑色，新增编号项使用系统按钮色。
- 审批设置必须有“审批规则设置”、流程名称、审批节点、审批方式可切换、审批人选择弹窗；二次选择审批人只能追加，删除只能从已选人员标签删除。
- 策略设置下拉选项来自当前模块审批设置列表，页面不显示“流程来源：客户审批设置”或类似来源说明。
- 详情页 Tab 必须可点击切换或定位到对应内容，不允许只有静态标签。

主控已处理：
- 修正 `SalesSettingPage` 字段新增/编辑弹窗，加入权限设置和负责人选择，避免通用设置页不可编辑且弹窗风格漂移。
- 修正 `preview-sales-basic-list.html` 报价/合同详情 Tab 点击行为。
- 移除销售基础预览和销售计划预览中的“策略设置下拉流程来源...”残留文案。
- 已通过 `vue3` 构建和三个静态预览脚本语法校验。

### 2026-05-27 15:45 - 主控重派批复：五窗口按客户管理母版重新收口

批复：
- 继续使用五个执行窗口，但本轮不是继续扩新页面，而是做“可见入口 + 母版一致性 + 原 JSX 字段交互”回正。
- 每个窗口都必须先读取客户管理已验收页面，再读取本模块原 JSX；实现顺序固定为：复制客户管理母版结构 -> 替换原 JSX 字段/交互 -> 接入可见 URL -> 自检构建。
- “代码已写但用户看不到页面”不算完成。每个窗口交付必须列出可直接打开的静态预览 URL 和 Vue 入口。
- 不允许新增独立 HTML。计划继续使用 `preview-sales-plan-list.html`；报价/合同/订单继续使用 `preview-sales-basic-list.html` 参数分流。
- 不允许改动其它窗口模块。跨模块共用问题只写入公告板，由窗口 5 或主控统一处理。
- 退货、换货、报表继续不做。

五窗口领取规则：
- 窗口 1 领取 R-009：报价管理全入口回正。
- 窗口 2 领取 R-010：合同管理全入口回正。
- 窗口 3 领取 R-011：订单管理全入口回正。
- 窗口 4 领取 R-012：销售计划全入口回正。
- 窗口 5 领取 R-013：母版/导航/入口矩阵和最终一致性检查。

本轮统一验收口径：
- 列表页：必须沿用客户列表页布局、工具条、固定列、分页、批量操作逻辑；字段和数据来自对应原 JSX。
- 新增页：必须沿用客户新增页布局、可编辑子表、附件/富文本/弹窗风格；字段和联动来自对应原 JSX。
- 详情页：必须沿用客户详情页结构、顶部按钮容器、详情头、Tab 容器；Tab 必须可点击；字段来自对应原 JSX。
- 设置页：必须沿用客户设置页结构；只替换模块标题、字段位置、字段行、编号前缀、审批流、策略文案。
- 弹窗：选择客户/产品/人员/来源/字段/审批节点等，统一使用客户管理母版风格，不允许模块私造明显不同的弹窗。
- 数据：Vue、mock、静态预览必须三边一致。

### 2026-05-27 16:05 - 主控批复：窗口 6 领取 R-008 做最终交叉检查

批复：
- 窗口 6 不领取 R-009 到 R-013；这五个任务只属于窗口 1 到窗口 5。
- 当前 R-009、R-010、R-011、R-012、R-013 均已写入完成记录，窗口 6 现在领取 R-008。
- R-008 的职责是最终交叉检查：复核客户设置未退化、销售各模块设置页按客户母版、入口矩阵可访问、详情 Tab 可点击、静态预览和 Vue 入口一致。
- 如果窗口 6 发现模块字段/交互问题，按模块写回 R-009/R-010/R-011/R-012 的追加返修记录；如果发现母版或入口问题，写回 R-013 或直接写给主控。
- 窗口 6 不直接扩大修改范围，除非是小错字、入口 URL、状态记录这类低风险问题。

### 2026-05-27 15:10 - 主控即时批复：窗口 6 可以启动交叉检查

批复：
- R-001 到 R-005 均已标记为 `已完成`。
- 窗口 6 现在可以领取 R-006，开始销售中心交叉检查。

窗口 6 检查重点：
- 对照原型：`sales-plan-list.jsx`、`quote-list.jsx`、`contract-list.jsx`、`sale-order-list.jsx`。
- 检查静态入口：计划、报价、合同、订单的列表/新增/详情/设置。
- 检查 Vue 配置、mock 数据、静态预览是否三边一致。
- 执行 `vue3` 构建，必须通过。
- 如发现小问题可以直接修；涉及模块复杂逻辑时，写入「返修任务池」，不要口头派发。

当前状态：
- 「待批复问题」暂无新问题。
- R-006 是当前唯一待领取任务。

### 窗口 1：报价管理

问题 1：是否允许先扫描目录和读取 `quote-list.jsx`、报价相关 Vue/mock/preview 文件？只读，不改。

批复：允许。

补充要求：
- `quote-list.jsx` 只读。
- 读取报价相关 Vue/mock/preview 文件允许。
- 开工前先记录当前已有文件，避免误改其他模块。

问题 2：如果现有报价目录里已有半成品，是否按“保留已有用户改动、在其基础上补齐”的原则处理？

批复：是。

补充要求：
- 在已有半成品基础上补齐字段、数据、状态、弹窗和交互。
- 不要整页推倒重写。
- 如果发现现有半成品与原 JSX 冲突，以原 JSX 为字段和逻辑依据，以已验收母版为样式依据。

问题 3：静态预览是否只允许继续沿用 `preview-sales-basic-list.html` 参数分流，不新增独立报价预览 HTML？

批复：是。

补充要求：
- 报价列表：`preview-sales-basic-list.html?type=quotes`
- 报价新增：`preview-sales-basic-list.html?type=quotes&action=new`
- 报价详情：`preview-sales-basic-list.html?type=quotes&id=quote_001`
- 报价设置入口：`preview-sales-basic-list.html?type=quotes&setting=...`

### 窗口 2：合同管理

问题 1：原 JSX 乱码字段是否允许按任务包里的中文字段清单修正为正常中文，并同步到 Vue、mock、静态预览？

批复：允许。

补充要求：
- 字段语义明确时直接修正。
- 字段语义不明确时写入「待批复问题」。
- 修正后必须保证 Vue 配置、mock 数据、静态预览三边一致。

问题 2：合同设置页是否只做入口/占位页，不做内部设置内容，等窗口 5 母版完成后再接入？

批复：是。

补充要求：
- 可以接通合同设置的入口。
- 不要实现合同设置内部页面。
- 不要为合同设置单独造样式。

### 窗口 3：订单管理

问题 1：订单详情 Vue 路由是否改成 `/sales/sales-orders/:id`，新增页改成 `/sales/sales-orders/new`，并把当前 query 跳转改掉？

批复：本阶段不改。

原因：
- 路由规范需要主控统一调整。
- 如果单个窗口先改，容易导致导航、静态预览、Vue 路由三套入口不一致。

执行要求：
- 当前阶段沿用现有路由/查询参数方式。
- 可以在交付总结里列出动态路由改造建议，等主控统一处理。

问题 2：设置页是否只保留/接通入口，不实现内部设置内容，等待窗口 5 通用设置母版？

批复：是。

补充要求：
- 只接订单设置入口。
- 不实现内部设置内容。
- 不重复造设置页。

问题 3：静态预览是否在 `preview-sales-basic-list.html` 里扩展 `type=orders&action=new` 和 `type=orders&id=so_001`，而不是新建单独订单预览文件？

批复：是。

补充要求：
- 订单列表：`preview-sales-basic-list.html?type=orders`
- 订单新增：`preview-sales-basic-list.html?type=orders&action=new`
- 订单详情：`preview-sales-basic-list.html?type=orders&id=so_001`
- 订单设置入口：`preview-sales-basic-list.html?type=orders&setting=...`

## 待批复问题

### 窗口 6 - R-009 到 R-013 领取归属 - 2026-05-27 15:50
问题：主控 15:45 重派批复要求“按自己的窗口编号领取任务”，但 R-009 到 R-013 仅分配给窗口 1-5；当前线程此前为窗口 6，没有对应的 R-009~R-013 任务。公告板中另有 R-008 派给窗口 6，但用户本轮明确要求读取 R-009 到 R-013。
建议方案：请主控确认窗口 6 是等待窗口 1-5 完成后再做交叉检查，还是改领 R-008 设置母版二次交叉检查，或临时协助 R-013 全局入口矩阵。
影响文件：`docs/sales-parallel-coordination.md`
是否阻塞：是，阻塞窗口 6 对 R-009~R-013 的领取动作，避免跨窗口误改。

主控批复：窗口 6 不领取 R-009 到 R-013；请领取 R-008 做最终交叉检查。该问题已在「2026-05-27 16:05 - 主控批复」中明确。

## 返修任务池

### 返修任务 R-001 - 派给窗口 4 - 销售计划
状态：已完成
发现时间：2026-05-27 14:35
发现人：主控
问题：销售计划已去掉左侧状态分类，但需要把列表、新增、详情继续按 `sales-plan-list.jsx` 做一比一复核，尤其是计划新增页、计划详情页、业绩追踪页签和静态预览一致性。
期望结果：
- 列表不显示左侧分类树。
- 列表字段与 `sales-plan-list.jsx` 一致：计划名称、计划编号、计划产品、计划周期、负责对象、目标数量、目标金额、完成金额、达成率、计划状态、操作。
- 新增页字段与原型一致：基础信息、计划产品、计划详情，产品选择、目标金额联动、提交审批。
- 详情页页签与原型一致：计划信息、业绩追踪、销售明细、操作记录。
- Vue 页面、mock 数据、静态预览三边一致。
影响入口：
- `preview-sales-plan-list.html`
- Vue 路由 `/sales/sales-plans`
影响文件：
- `sales-plan-list.jsx`
- `vue3/preview-sales-plan-list.html`
- `vue3/src/views/sales/sales-plans/*`
- `vue3/src/mock/sales/sales-plans.json`
验收方式：
- 访问 `preview-sales-plan-list.html`，检查列表/新增/详情。
- 在 `vue3` 执行构建，必须通过。
处理记录：2026-05-27 14:36 窗口 4 已完成 R-001 复核与修正：按 `sales-plan-list.jsx` 将销售计划列表字段回齐为计划名称、计划编号、计划产品、计划周期、负责对象、目标数量、目标金额、完成金额、达成率、计划状态、操作，确认列表不显示左侧分类树；同步修正搜索占位为“全局搜索（如计划名称、产品、负责人）”、新增按钮为“添加计划”；复核新增页基础信息/计划产品/计划详情、产品选择、目标金额联动、提交审批，以及详情页计划信息/业绩追踪/销售明细/操作记录页签。修改文件：`vue3/src/views/sales/sales-plans/salesPlanList.config.ts`、`vue3/preview-sales-plan-list.html`。检查入口：`preview-sales-plan-list.html`、`preview-sales-plan-list.html?action=new`、`preview-sales-plan-list.html?id=plan_001`、Vue `/sales/sales-plans`。自检结果：`sales-plans.json` 解析通过，`preview-sales-plan-list.html` 脚本语法通过，`vue3` 执行 `pnpm run build` 通过，仅保留 Vite chunk 体积警告。

### 返修任务 R-002 - 派给窗口 1 - 报价管理
状态：已完成
发现时间：2026-05-27 14:35
发现人：主控
问题：报价列表字段已基本同步，但新增页、详情页、报价分类/适用范围、阶梯报价、转化与财务追踪需要按 `quote-list.jsx` 做完整复刻复核。
期望结果：
- 列表字段与 `quote-list.jsx` 一致：报价主题、报价编号、报价类型、适用客户、报价金额、价格版本、转化状态、报价日期、失效日期、报价人员、报价状态、操作。
- 报价新增页保留报价分类逻辑：通用、分组报价、促销报价、指定客户报价、一次性报价。
- 分组报价弹出客户分组选择；指定客户/一次性报价弹出客户/项目选择。
- 产品明细支持选择产品、阶梯报价弹窗、新增阶梯、删除阶梯。
- 详情页包含基础信息、产品明细、转化与财务追踪、附件/操作记录，阶梯报价可展开。
- `preview-sales-basic-list.html?type=quotes`、`action=new`、`id=quote_001` 三个入口都能访问。
影响入口：
- `preview-sales-basic-list.html?type=quotes`
- `preview-sales-basic-list.html?type=quotes&action=new`
- `preview-sales-basic-list.html?type=quotes&id=quote_001`
- Vue 路由 `/sales/sales-quotes`
影响文件：
- `quote-list.jsx`
- `vue3/preview-sales-basic-list.html`
- `vue3/src/views/sales/sales-quotes/*`
- `vue3/src/mock/sales/sales-quotes.json`
验收方式：
- 静态预览检查列表/新增/详情/弹窗。
- Vue 构建必须通过。
处理记录：
2026-05-27 14:43 窗口 1 已完成 R-002 报价管理复核。
修改文件：
- `vue3/src/views/sales/sales-quotes/SalesQuoteCreate.vue`
- `vue3/preview-sales-basic-list.html`
处理结果：
- Vue 新增报价页补齐报价分类切换时的适用范围重置逻辑，避免从分组/指定客户切到促销等类型后残留旧范围。
- Vue 报价适用对象弹窗切换“选择客户/选择项目”时清空旧选中对象，与原 `quote-list.jsx` 行为一致。
- 静态预览新增报价页改为通过“新增明细”选择产品后写入产品明细，并支持产品行删除。
- 静态预览阶梯报价弹窗补齐“新增阶梯”和“删除阶梯”交互。
检查入口：
- `preview-sales-basic-list.html?type=quotes`
- `preview-sales-basic-list.html?type=quotes&action=new`
- `preview-sales-basic-list.html?type=quotes&id=quote_001`
- Vue 路由 `/sales/sales-quotes`
自检结果：
- `quote-list.jsx` 已只读复核，列表字段、报价分类、客户分组/适用对象弹窗、产品明细、阶梯报价、转化与财务追踪、附件/操作记录均已对齐。
- `vue3/preview-sales-basic-list.html` 脚本语法校验通过。
- `cmd /c node_modules\.bin\vue-tsc --noEmit` 通过。
- `cmd /c node_modules\.bin\vite build` 通过，仅有 Vite chunk 体积警告，不阻塞验收。

### 返修任务 R-003 - 派给窗口 2 - 合同管理
状态：已完成
发现时间：2026-05-27 14:35
发现人：主控
问题：合同列表字段已基本同步，但新增合同、详情页多页签和财务/履约数据需要按 `contract-list.jsx` 完整复刻复核。
期望结果：
- 列表字段与 `contract-list.jsx` 一致：合同主题、合同编号、客户、来源单据、合同金额、已下单金额、已发货金额、应收金额、已开票金额、已回款金额、剩余金额、签订日期、失效日期、销售人员、履约状态、操作。
- 新增页包含基础信息、合同产品、合同详情。
- 新增页客户选择弹窗、适用报价下拉、产品选择、合同金额/优惠金额/优惠后金额联动必须可用。
- 详情页页签与原型一致：合同信息、合同产品、订单核销、发货记录、开票记录、回款记录、操作记录。
- 合同设置页本轮只接入口，不自行实现内部设置内容，等待窗口 5 母版。
影响入口：
- `preview-sales-basic-list.html?type=contracts`
- `preview-sales-basic-list.html?type=contracts&action=new`
- `preview-sales-basic-list.html?type=contracts&id=contract_001`
- Vue 路由 `/sales/sales-contracts`
影响文件：
- `contract-list.jsx`
- `vue3/preview-sales-basic-list.html`
- `vue3/src/views/sales/sales-contracts/*`
- `vue3/src/mock/sales/sales-contracts.json`
验收方式：
- 静态预览检查列表/新增/详情。
- Vue 构建必须通过。
处理记录：
窗口 2 已于 2026-05-27 14:35 领取，开始复核合同列表、新增、详情、设置入口、mock、静态预览和 Vue 构建。
2026-05-27 14:40 窗口 2 完成复核与小修：
- 修改文件：`vue3/src/views/sales/sales-contracts/SalesContractList.vue`。
- 复核文件：`vue3/src/views/sales/sales-contracts/SalesContractCreate.vue`、`vue3/src/views/sales/sales-contracts/SalesContractDetail.vue`、`vue3/src/views/sales/sales-contracts/SalesContractSettingPage.vue`、`vue3/src/mock/sales/sales-contracts.json`、`vue3/preview-sales-basic-list.html`。
- 修正内容：合同列表“履约中”状态去掉无效 `blue` class，使用默认主色语义；新增页客户选择、适用报价、产品选择、合同金额/优惠金额/优惠后金额联动已存在；详情页 7 个页签与原型一致；设置页保持入口/占位，等待窗口 5 通用设置母版。
- 检查入口：`preview-sales-basic-list.html?type=contracts`、`preview-sales-basic-list.html?type=contracts&action=new`、`preview-sales-basic-list.html?type=contracts&id=contract_001`、Vue `/sales/sales-contracts`。
- 自检结果：`sales-contracts.json` 可解析；`preview-sales-basic-list.html` 脚本语法通过；在 `vue3` 执行 `node --run build` 通过，仅有 Vite chunk 体积警告。

### 返修任务 R-004 - 派给窗口 3 - 订单管理
状态：已完成
发现时间：2026-05-27 14:35
发现人：主控
问题：订单列表字段已基本同步，但新增订单来源选择、客户选择、产品规格属性选择、详情页发货/开票/回款/生产/退换货记录需要按 `sale-order-list.jsx` 完整复刻复核。
期望结果：
- 列表字段与 `sale-order-list.jsx` 一致：订单主题、订单号、订单来源、客户、订单金额、信用校验、信用占用、应收金额、开票申请、已回款、订单状态、异常标签、下单日期、交货日期、销售人员、订单进展、操作。
- 新增页包含基础信息、产品明细、订单详情、附件。
- 订单来源选择支持报价单/合同/项目；选择来源后自动带客户、联系人、地址、交货日期、产品明细。
- 选择客户后自动带联系人、地址、支付方式、信用额度、运费支付、出库方式，并清空手动产品明细。
- 产品选择后进入规格与属性确认弹窗，再生成订单产品明细。
- 详情页页签与原型一致：订单信息、订单明细、发货应收、开票申请、回款核销、生产记录、退换货记录、操作记录。
- 详情页顶部发货按钮按订单进展显示：发货、部分发货、已自动发货、已完成。
影响入口：
- `preview-sales-basic-list.html?type=orders`
- `preview-sales-basic-list.html?type=orders&action=new`
- `preview-sales-basic-list.html?type=orders&id=so_001`
- Vue 路由 `/sales/sales-orders`
影响文件：
- `sale-order-list.jsx`
- `vue3/preview-sales-basic-list.html`
- `vue3/src/views/sales/sales-orders/*`
- `vue3/src/mock/sales/sales-orders.json`
验收方式：
- 静态预览检查列表/新增/详情/弹窗。
- Vue 构建必须通过。
处理记录：
2026-05-27 14:35 窗口 3 已领取，开始对照 `sale-order-list.jsx` 复核订单列表、新增、详情、静态预览和 Vue 构建。
2026-05-27 14:40 窗口 3 已完成返修：
- 修改文件：`vue3/preview-sales-basic-list.html`。
- 处理内容：补强订单新增静态预览交互，订单来源选择可回填主题、来源、客户、联系人、地址、交货日期、订单状态和产品明细；客户选择可回填联系人、地址、支付方式、信用额度、运费支付、出库方式并清空产品明细；产品选择后进入规格与属性确认弹窗，确认后生成订单产品明细并联动总量、总金额、优惠后金额。
- 检查入口：`preview-sales-basic-list.html?type=orders`、`preview-sales-basic-list.html?type=orders&action=new`、`preview-sales-basic-list.html?type=orders&id=so_001`、Vue 路由 `/sales/sales-orders`。
- 验证结果：静态预览脚本语法校验通过；`vue-tsc --noEmit` 通过；`vite build` 通过。构建仅保留 Vite chunk 体积警告，不阻塞验收。

### 返修任务 R-005 - 派给窗口 5 - 通用设置母版
状态：已完成
发现时间：2026-05-27 14:35
发现人：主控
问题：客户设置已形成样板，计划/报价/合同/订单设置页仍多为入口或占位，需要用窗口 5 的通用设置母版统一接入，不允许各模块重复造设置页。
期望结果：
- 输出计划、报价、合同、订单共用的设置页接入标准。
- 至少覆盖：自定义字段、自定义编号、审批设置、策略设置、打印模板入口。
- 自定义字段使用左右结构：左侧字段位置，右侧字段列表，字段列表含是否必填、是否启用开关，操作只保留编辑/删除。
- 自定义编号复用编号规则构建器：固定前缀黑色，新增编号项使用系统按钮色。
- 审批设置复用审批规则编辑器：审批规则设置、流程名称、节点卡片、审批人选择、审批方式可选，审批人只增不误删。
- 策略设置下拉流程来源统一来自审批设置列表，不显示“流程来源：客户审批设置”字样。
- 设置页入口由各模块接入，内部结构由通用母版提供。
影响入口：
- `preview-sales-basic-list.html?type=quotes&setting=fields|numbers|approvals|strategies|print`
- `preview-sales-basic-list.html?type=contracts&setting=fields|numbers|approvals|strategies|print`
- `preview-sales-basic-list.html?type=orders&setting=fields|numbers|approvals|strategies|print`
- `preview-sales-plan-list.html?setting=fields|numbers|approvals|strategies|print`
- Vue 对应 sales setting pages
影响文件：
- `docs/setting-template.md`
- `vue3/src/components/setting-page/*`
- `vue3/src/views/sales/sales-plans/SalesPlanSettingPage.vue`
- `vue3/src/views/sales/sales-quotes/SalesQuoteSettingPage.vue`
- `vue3/src/views/sales/sales-contracts/SalesContractSettingPage.vue`
- `vue3/src/views/sales/sales-orders/*Setting*`
- `vue3/preview-sales-basic-list.html`
- `vue3/preview-sales-plan-list.html`
验收方式：
- 各模块设置入口可访问，不出现占位“等待母版接入”。
- 设置页样式与客户设置母版一致。
- Vue 构建必须通过。
处理记录：
2026-05-27 14:45 窗口 5 已领取，开始接入通用设置母版到计划/报价/合同/订单设置入口，并复核静态预览与 Vue 构建。
2026-05-27 15:05 窗口 5 已完成通用设置母版接入：
- 修改文件：`vue3/src/app/templates/settings-template.ts`、`vue3/src/views/sales/shared/SalesSettingPage.vue`、`vue3/src/views/sales/sales-plans/SalesPlanSettingPage.vue`、`vue3/src/views/sales/sales-quotes/SalesQuoteSettingPage.vue`、`vue3/src/views/sales/sales-contracts/SalesContractSettingPage.vue`、`vue3/src/views/sales/sales-orders/SalesOrderList.vue`、`vue3/src/views/sales/sales-orders/SalesOrderSettingPage.vue`、`vue3/preview-sales-basic-list.html`、`vue3/preview-sales-plan-list.html`、`docs/setting-template.md`。
- 处理内容：计划/报价/合同/订单统一接入 `SalesSettingPage`；覆盖自定义字段、自定义编号、审批设置、策略设置、打印模板入口；自定义字段使用字段位置 + 字段列表左右结构并保留必填/启用开关；编号规则使用固定前缀与编号项构建器；审批设置复用审批规则编辑器与审批人选择弹窗；策略设置下拉流程来源来自审批设置列表，不显示“流程来源：客户审批设置”。
- 检查入口：`preview-sales-basic-list.html?type=quotes&setting=fields|numbers|approvals|strategies|print`、`preview-sales-basic-list.html?type=contracts&setting=fields|numbers|approvals|strategies|print`、`preview-sales-basic-list.html?type=orders&setting=fields|numbers|approvals|strategies|print`、`preview-sales-plan-list.html?setting=fields|numbers|approvals|strategies|print`、Vue `/sales/sales-plans`、`/sales/sales-quotes`、`/sales/sales-contracts`、`/sales/sales-orders` 对应设置入口。
- 自检结果：`preview-sales-basic-list.html`、`preview-sales-plan-list.html` 脚本语法校验通过；`vue3` 执行本地 pnpm `run build` 通过，仅有 Vite chunk 体积警告。

### 返修任务 R-006 - 派给窗口 6 - 销售中心交叉检查
状态：已完成
发现时间：2026-05-27 14:35
发现人：主控
问题：窗口 1-5 完成后，需要独立交叉检查，避免字段、mock、静态预览、Vue 构建四处不一致。
期望结果：
- 对照原型：`sales-plan-list.jsx`、`quote-list.jsx`、`contract-list.jsx`、`sale-order-list.jsx`。
- 检查静态入口：计划、报价、合同、订单的列表/新增/详情/设置。
- 检查 Vue 配置与 mock 字段是否一致。
- 执行 `vue3` 构建，必须通过。
- 如发现小问题可直接修；涉及模块复杂逻辑则写入返修任务池，不口头派发。
影响入口：
- `preview-sales-plan-list.html`
- `preview-sales-basic-list.html?type=quotes|contracts|orders`
- 对应 `action=new`、`id=...`、`setting=...`
影响文件：
- 全部销售中心相关 Vue/mock/preview 文件。
验收方式：
- 在本公告板追加交叉检查记录。
- 必须列出：通过项、返修项、构建结果。
处理记录：
2026-05-27 15:10 窗口 6 已领取，开始对照销售计划、报价、合同、订单原 JSX，检查静态入口、Vue 配置、mock 数据一致性，并执行 `vue3` 构建。
2026-05-27 15:18 窗口 6 已完成交叉检查。
通过项：
- 对照原型：已复核 `sales-plan-list.jsx`、`quote-list.jsx`、`contract-list.jsx`、`sale-order-list.jsx` 的列表字段、主要新增/详情页签和设置入口要求。
- 静态入口：`preview-sales-plan-list.html` 的列表、`action=new`、`id=plan_001`、`setting=fields|numbers|approvals|strategies|print` 入口已覆盖；`preview-sales-basic-list.html?type=quotes|contracts|orders` 的列表、`action=new`、`id=...`、`setting=...` 入口已覆盖。
- Vue 配置与 mock：计划 10 个列表数据列/4 条 mock、报价 11 个列表数据列/4 条 mock、合同 15 个列表数据列/3 条 mock、订单 16 个列表数据列/5 条 mock，配置字段在 mock 或页面派生字段中均可对应。
- 设置母版：计划/报价/合同/订单设置入口未发现“等待母版接入”类占位文案；未发现“流程来源：客户审批设置”残留。
- 静态预览脚本：`preview-sales-basic-list.html`、`preview-sales-plan-list.html` 脚本语法校验通过。
返修项：
- 暂无需要新增返修任务；本轮未发现需要派回窗口 1-5 的复杂逻辑问题。
构建结果：
- 在 `vue3` 执行 `node --run build` 通过。
- 构建仅保留 Vite chunk 体积超过 500 kB 的警告，不阻塞本轮验收。

### 返修任务 R-007 - 派给窗口 1/2/3/4 - 销售中心新增页字段复核
状态：已完成
发现时间：2026-05-27 15:30
发现人：主控
问题：用户复查发现销售中心新增页字段仍可能与原 JSX 不完全一致，需要各模块窗口按各自原型重新对齐字段、默认值、弹窗和联动逻辑。
期望结果：
- 窗口 1 复核报价新增页，对照 `quote-list.jsx`。
- 窗口 2 复核合同新增页，对照 `contract-list.jsx`。
- 窗口 3 复核订单新增页，对照 `sale-order-list.jsx`。
- 窗口 4 复核销售计划新增页，对照 `sales-plan-list.jsx`。
- 所有新增页继续使用已验收客户新增页/通用表单母版样式，不另造弹窗组件。
- 字段、mock、静态预览、Vue 页面必须同步。
影响入口：
- `preview-sales-basic-list.html?type=quotes|contracts|orders&action=new`
- `preview-sales-plan-list.html?action=new`
影响文件：
- 各模块原 JSX
- `vue3/preview-sales-basic-list.html`
- `vue3/preview-sales-plan-list.html`
- `vue3/src/views/sales/sales-quotes/*`
- `vue3/src/views/sales/sales-contracts/*`
- `vue3/src/views/sales/sales-orders/*`
- `vue3/src/views/sales/sales-plans/*`
验收方式：
- 每个窗口写明对照原 JSX 后补齐了哪些字段/交互。
- 运行对应静态预览脚本语法检查。
- 能运行构建的窗口执行 `pnpm run build`，不能运行的写明原因。
处理记录：
2026-05-27 15:36 窗口 4 已完成销售计划新增页复核：对照 `sales-plan-list.jsx`，确认新增页基础信息、计划产品、计划详情、产品选择弹窗、目标金额联动、提交审批均已覆盖；补齐“计划状态”待审批说明提示；将销售人员选项和计划 mock/静态预览中的“苏婧涵”回正为原型“苏婉清”。修改文件：`vue3/src/views/sales/sales-plans/SalesPlanCreate.vue`、`vue3/src/mock/sales/sales-plans.json`、`vue3/preview-sales-plan-list.html`。检查入口：`preview-sales-plan-list.html?action=new`、Vue `/sales/sales-plans?action=new`。自检结果：`sales-plans.json` 解析通过，`preview-sales-plan-list.html` 脚本语法通过，`vue3` 执行 `pnpm run build` 通过，仅保留 Vite chunk 体积警告。

### 返修任务 R-008 - 派给窗口 6 - 设置母版二次交叉检查
状态：已完成
发现时间：2026-05-27 15:30
发现人：主控
问题：主控已回正通用设置母版，需要独立复查客户设置页未丢失、销售各设置页不写死、弹窗和 Tab 交互一致。
期望结果：
- 客户管理设置页仍可访问，功能不退化。
- 计划/报价/合同/订单设置页复用通用设置母版，不能出现不可编辑、硬编码占位或旧来源说明。
- 自定义字段新增/编辑弹窗含权限设置和负责人选择。
- 审批设置人员选择只追加，不误删；删除只能点已选人员标签。
- 详情页 Tab 可点击。
影响入口：
- `preview-customer-setting.html?type=groups|fields|numbers|levels|approvals|strategies`
- `preview-sales-basic-list.html?type=quotes|contracts|orders&setting=fields|numbers|approvals|strategies|print`
- `preview-sales-plan-list.html?setting=fields|numbers|approvals|strategies|print`
影响文件：
- `vue3/src/views/sales/shared/SalesSettingPage.vue`
- `vue3/src/components/setting-page/*`
- `vue3/preview-sales-basic-list.html`
- `vue3/preview-sales-plan-list.html`
- `vue3/preview-customer-setting.html`
验收方式：
- 写明通过项和返修项。
- 如发现模块字段问题，派回 R-007 对应窗口；如发现母版问题，直接写给主控。
处理记录：
2026-05-27 16:12 主控完成 R-008 复查：客户设置页 `groups|fields|numbers|levels|approvals|strategies` 在当前验收服务 `http://127.0.0.1:4181/` 下均返回 200；计划、报价、合同、订单的 `fields|numbers|approvals|strategies|print` 设置入口均返回 200；销售工作台、计划/报价/合同/订单列表、新增、详情、打印设置等 4181 核心 URL 均返回 200。`preview-framework.html`、`preview-sales-basic-list.html`、`preview-sales-plan-list.html`、`preview-customer-setting.html` 脚本语法校验通过；未发现“等待母版”“流程来源：客户审批设置”“策略设置下拉流程来源”等残留。`vue3` 执行本地 pnpm `run build` 通过，仅保留 Vite chunk 体积警告。主控同步修正公告板入口矩阵端口：由窗口 5 本地 `5175` 改为当前验收服务 `4181`。返修项：暂无。

### 返修任务 R-009 - 派给窗口 1 - 报价管理全入口回正
状态：已完成
发现时间：2026-05-27 15:45
发现人：主控
问题：报价页面必须按客户管理母版重新收口，确保用户能通过静态预览和 Vue 入口看到完整页面，且字段/交互严格来自 `quote-list.jsx`。
期望结果：
- 列表页沿用客户列表页母版；字段与 `quote-list.jsx` 一致。
- 新增页沿用客户新增页母版；报价分类、适用范围、客户/项目/分组选择、产品明细、阶梯报价、金额联动与原 JSX 一致。
- 详情页沿用客户详情页母版；基础信息、产品明细、转化与财务追踪、附件/操作记录 Tab 可点击。
- 设置页沿用客户设置页母版；字段、编号、审批、策略、打印入口都可访问，不允许占位或不可编辑。
- 弹窗统一使用客户管理母版风格。
影响入口：
- `preview-sales-basic-list.html?type=quotes`
- `preview-sales-basic-list.html?type=quotes&action=new`
- `preview-sales-basic-list.html?type=quotes&id=quote_001`
- `preview-sales-basic-list.html?type=quotes&setting=fields|numbers|approvals|strategies|print`
- Vue `/sales/sales-quotes` 对应列表/新增/详情/设置入口
影响文件：
- `quote-list.jsx`（只读依据）
- `vue3/preview-sales-basic-list.html`
- `vue3/src/views/sales/sales-quotes/*`
- `vue3/src/mock/sales/sales-quotes.json`
- 必要时只改本模块配置，不改其它模块母版。
验收方式：
- 交付记录必须列出上述所有 URL。
- 写明逐项对照 `quote-list.jsx` 后补齐的字段/交互。
- 静态脚本语法通过，Vue 构建通过或写明不能构建原因。
处理记录：
2026-05-27 15:45 窗口 1 已领取，开始按客户管理已验收页面母版，对照 `quote-list.jsx` 复核报价列表/新增/详情/设置入口、静态预览和 Vue 入口。
2026-05-27 15:58 窗口 1 已完成报价管理全入口回正。
修改文件：
- `vue3/src/views/sales/sales-quotes/SalesQuoteCreate.vue`
- `vue3/preview-sales-basic-list.html`
逐项对照：
- 列表页：已沿用客户列表页母版工具条、固定操作列、分页和批量操作；字段保持 `quote-list.jsx` 的报价主题、报价编号、报价类型、适用客户、报价金额、价格版本、转化状态、报价日期、失效日期、报价人员、报价状态、操作。
- 新增页：已沿用客户新增页表单卡片、可编辑子表、富文本、附件和弹窗风格；报价分类、适用范围、客户分组选择、客户/项目选择、产品选择、阶梯报价新增/删除均来自 `quote-list.jsx`；本次补齐 Vue 和静态新增页的报价金额联动汇总。
- 详情页：已沿用客户详情页头部、顶部按钮容器和 Tab 容器；基础信息、产品明细、转化与财务追踪、附件/操作记录齐全；本次将静态报价详情 Tab 改为可点击切换内容面板，阶梯报价仍可展开查看。
- 设置页：报价 `fields/numbers/approvals/strategies/print` 均接入客户设置页母版结构，可访问、可编辑，不再出现占位。
- 弹窗：产品、客户分组、报价适用对象、阶梯报价、字段/审批设置弹窗均使用客户管理母版样式。
可见入口：
- 静态报价列表：`vue3/preview-sales-basic-list.html?type=quotes`
- 静态新增报价：`vue3/preview-sales-basic-list.html?type=quotes&action=new`
- 静态报价详情：`vue3/preview-sales-basic-list.html?type=quotes&id=quote_001`
- 静态报价设置：`vue3/preview-sales-basic-list.html?type=quotes&setting=fields`
- 静态报价设置：`vue3/preview-sales-basic-list.html?type=quotes&setting=numbers`
- 静态报价设置：`vue3/preview-sales-basic-list.html?type=quotes&setting=approvals`
- 静态报价设置：`vue3/preview-sales-basic-list.html?type=quotes&setting=strategies`
- 静态报价设置：`vue3/preview-sales-basic-list.html?type=quotes&setting=print`
- Vue 报价列表：`http://127.0.0.1:5173/sales/sales-quotes`
- Vue 新增报价：`http://127.0.0.1:5173/sales/sales-quotes?action=new`
- Vue 报价详情：`http://127.0.0.1:5173/sales/sales-quotes?id=quote_001`
- Vue 报价设置：`http://127.0.0.1:5173/sales/sales-quotes?setting=fields|numbers|approvals|strategies|print`
自检结果：
- `vue3/preview-sales-basic-list.html` 脚本语法校验通过。
- `cmd /c node_modules\.bin\vue-tsc --noEmit` 通过。
- `cmd /c node_modules\.bin\vite build` 通过，仅保留 Vite chunk 体积警告。
- 本地 Vue 服务已启动：`http://127.0.0.1:5173/`。

### 返修任务 R-010 - 派给窗口 2 - 合同管理全入口回正
状态：已完成
发现时间：2026-05-27 15:45
发现人：主控
问题：合同页面必须按客户管理母版重新收口，确保用户能通过静态预览和 Vue 入口看到完整页面，且字段/交互严格来自 `contract-list.jsx`。
期望结果：
- 列表页沿用客户列表页母版；字段与 `contract-list.jsx` 一致。
- 新增页沿用客户新增页母版；客户选择、来源报价/项目/手动创建、合同产品、金额/优惠/优惠后金额联动、合同详情富文本与原 JSX 一致。
- 详情页沿用客户详情页母版；合同信息、合同产品、订单核销、发货记录、开票记录、回款记录、操作记录 Tab 可点击。
- 设置页沿用客户设置页母版；字段、编号、审批、策略、打印入口都可访问，不允许占位或不可编辑。
- 弹窗统一使用客户管理母版风格。
影响入口：
- `preview-sales-basic-list.html?type=contracts`
- `preview-sales-basic-list.html?type=contracts&action=new`
- `preview-sales-basic-list.html?type=contracts&id=contract_001`
- `preview-sales-basic-list.html?type=contracts&setting=fields|numbers|approvals|strategies|print`
- Vue `/sales/sales-contracts` 对应列表/新增/详情/设置入口
影响文件：
- `contract-list.jsx`（只读依据）
- `vue3/preview-sales-basic-list.html`
- `vue3/src/views/sales/sales-contracts/*`
- `vue3/src/mock/sales/sales-contracts.json`
- 必要时只改本模块配置，不改其它模块母版。
验收方式：
- 交付记录必须列出上述所有 URL。
- 写明逐项对照 `contract-list.jsx` 后补齐的字段/交互。
- 静态脚本语法通过，Vue 构建通过或写明不能构建原因。
处理记录：
2026-05-27 15:45 窗口 2 已领取，开始按客户管理已验收母版复核合同列表、新增、详情、设置、静态预览和 Vue 可见入口。
2026-05-27 16:05 窗口 2 已完成 R-010：对照 `contract-list.jsx` 和客户管理已验收母版复核合同列表、新增、详情、设置、静态预览和 Vue 可见入口；补齐新增页客户选择弹窗的选择/确定交互，默认履约状态由“待执行”回正为原型“待审批”，客户选择数据回正“老夏”“苏婉清”；同步 `sales-contracts.json` 第三条合同状态为待审批；静态新增页补齐客户选择、适用报价启用、产品选择、合同数量/单价/优惠金额联动、支付约定和合同详情富文本可见交互；静态列表第三条履约状态同步为待审批。修改文件：`vue3/src/views/sales/sales-contracts/SalesContractCreate.vue`、`vue3/src/mock/sales/sales-contracts.json`、`vue3/preview-sales-basic-list.html`、`docs/sales-parallel-coordination.md`。检查入口：`preview-sales-basic-list.html?type=contracts`、`preview-sales-basic-list.html?type=contracts&action=new`、`preview-sales-basic-list.html?type=contracts&id=contract_001`、`preview-sales-basic-list.html?type=contracts&setting=fields`、`preview-sales-basic-list.html?type=contracts&setting=numbers`、`preview-sales-basic-list.html?type=contracts&setting=approvals`、`preview-sales-basic-list.html?type=contracts&setting=strategies`、`preview-sales-basic-list.html?type=contracts&setting=print`、Vue `http://127.0.0.1:5173/sales/sales-contracts`、`http://127.0.0.1:5173/sales/sales-contracts?action=new`、`http://127.0.0.1:5173/sales/sales-contracts?id=contract_001`、`http://127.0.0.1:5173/sales/sales-contracts?setting=fields|numbers|approvals|strategies|print`。自检结果：`sales-contracts.json` 解析通过；`preview-sales-basic-list.html` 脚本语法通过；`vue3` 执行 `node --run build` 通过，仅保留 Vite chunk 体积警告；本地 Vue 入口 `http://127.0.0.1:5173/sales/sales-contracts` 返回 200。

### 返修任务 R-011 - 派给窗口 3 - 订单管理全入口回正
状态：已完成
发现时间：2026-05-27 15:45
发现人：主控
问题：订单页面必须按客户管理母版重新收口，确保用户能通过静态预览和 Vue 入口看到完整页面，且字段/交互严格来自 `sale-order-list.jsx`。
期望结果：
- 列表页沿用客户列表页母版；字段与 `sale-order-list.jsx` 一致。
- 新增页沿用客户新增页母版；订单来源、客户选择、客户资料回填、产品规格属性选择、产品明细、金额联动与原 JSX 一致。
- 详情页沿用客户详情页母版；订单信息、订单明细、发货应收、开票申请、回款核销、生产记录、退换货记录、操作记录 Tab 可点击。
- 设置页沿用客户设置页母版；字段、编号、审批、策略、打印入口都可访问，不允许占位或不可编辑。
- 弹窗统一使用客户管理母版风格。
影响入口：
- `preview-sales-basic-list.html?type=orders`
- `preview-sales-basic-list.html?type=orders&action=new`
- `preview-sales-basic-list.html?type=orders&id=so_001`
- `preview-sales-basic-list.html?type=orders&setting=fields|numbers|approvals|strategies|print`
- Vue `/sales/sales-orders` 对应列表/新增/详情/设置入口
影响文件：
- `sale-order-list.jsx`（只读依据）
- `vue3/preview-sales-basic-list.html`
- `vue3/src/views/sales/sales-orders/*`
- `vue3/src/mock/sales/sales-orders.json`
- 必要时只改本模块配置，不改其它模块母版。
验收方式：
- 交付记录必须列出上述所有 URL。
- 写明逐项对照 `sale-order-list.jsx` 后补齐的字段/交互。
- 静态脚本语法通过，Vue 构建通过或写明不能构建原因。
处理记录：
2026-05-27 15:45 窗口 3 已领取，开始按客户管理已验收页面母版，对照 `sale-order-list.jsx` 复核订单列表/新增/详情/设置入口、静态预览和 Vue 入口。
2026-05-27 16:06 窗口 3 已完成订单管理全入口回正：对照 `sale-order-list.jsx` 复核客户列表/新增/详情/设置母版使用情况，并补齐订单设置字段、静态来源弹窗和 mock 原型数据。补齐点：订单 mock 中 `合同：8888` 回正为 `合同：88888`，`非必填` 回正为 `非必须`，联系人 `苏婧涵` 回正为 `苏婉清`，第五条客户/销售人员回正为 `东莞华辰科技有限公司` / `老夏`；订单设置字段从 6 项扩展到原型对应的基础信息、产品明细、发货应收和生产/退换货记录字段；静态新增页订单来源弹窗支持报价单、合同、项目三个来源列表切换，选择后回填订单主题、来源、客户资料、交货日期、订单状态和产品明细。修改文件：`vue3/src/mock/sales/sales-orders.json`、`vue3/src/app/templates/settings-template.ts`、`vue3/preview-sales-basic-list.html`。检查入口：`preview-sales-basic-list.html?type=orders`、`preview-sales-basic-list.html?type=orders&action=new`、`preview-sales-basic-list.html?type=orders&id=so_001`、`preview-sales-basic-list.html?type=orders&setting=fields`、`preview-sales-basic-list.html?type=orders&setting=numbers`、`preview-sales-basic-list.html?type=orders&setting=approvals`、`preview-sales-basic-list.html?type=orders&setting=strategies`、`preview-sales-basic-list.html?type=orders&setting=print`、Vue `/sales/sales-orders`、`/sales/sales-orders?action=new`、`/sales/sales-orders?id=so_001`、`/sales/sales-orders?setting=fields|numbers|approvals|strategies|print`。自检结果：`sales-orders.json` 解析通过，`preview-sales-basic-list.html` 脚本语法通过，`vue3` 执行 `vue-tsc --noEmit` 通过，`vite build` 通过，仅保留 Vite chunk 体积警告。

### 返修任务 R-012 - 派给窗口 4 - 销售计划全入口回正
状态：已完成
发现时间：2026-05-27 15:45
发现人：主控
问题：销售计划页面必须按客户管理母版重新收口，确保用户能通过静态预览和 Vue 入口看到完整页面，且字段/交互严格来自 `sales-plan-list.jsx`。
期望结果：
- 列表页沿用客户列表页母版，但销售计划不显示左侧状态分类；字段与 `sales-plan-list.jsx` 一致。
- 新增页沿用客户新增页母版；基础信息、计划产品、计划详情、产品选择、目标数量/目标金额联动、提交审批与原 JSX 一致。
- 详情页沿用客户详情页母版；计划信息、业绩追踪、销售明细、操作记录 Tab 可点击。
- 设置页沿用客户设置页母版；字段、编号、审批、策略、打印入口都可访问，不允许占位或不可编辑。
- 弹窗统一使用客户管理母版风格。
影响入口：
- `preview-sales-plan-list.html`
- `preview-sales-plan-list.html?action=new`
- `preview-sales-plan-list.html?id=plan_001`
- `preview-sales-plan-list.html?setting=fields|numbers|approvals|strategies|print`
- Vue `/sales/sales-plans` 对应列表/新增/详情/设置入口
影响文件：
- `sales-plan-list.jsx`（只读依据）
- `vue3/preview-sales-plan-list.html`
- `vue3/src/views/sales/sales-plans/*`
- `vue3/src/mock/sales/sales-plans.json`
- 必要时只改本模块配置，不改其它模块母版。
验收方式：
- 交付记录必须列出上述所有 URL。
- 写明逐项对照 `sales-plan-list.jsx` 后补齐的字段/交互。
- 静态脚本语法通过，Vue 构建通过或写明不能构建原因。
处理记录：
2026-05-27 15:46 窗口 4 已完成销售计划全入口回正：对照 `sales-plan-list.jsx` 复核列表、新增、详情、设置和静态/Vue 入口。补齐点：Vue 导航新增 `设置计划打印模板` 到 `/sales/sales-plans?setting=print`；计划编号设置前缀由 `PL` 回正为销售计划编号语义 `SPP`，静态预览编号示例同步为 `SPP-20260527-001`；计划周期展示由“至”回正为原型 `~` 格式，并同步 Vue 列表、详情和静态预览。已确认列表无左侧状态分类，列表字段为计划名称、计划编号、计划产品、计划周期、负责对象、目标数量、目标金额、完成金额、达成率、计划状态、操作；新增页覆盖基础信息、计划产品、计划详情、产品选择、目标数量/目标金额联动、提交审批；详情页计划信息、业绩追踪、销售明细、操作记录 Tab 可点击；设置页 fields/numbers/approvals/strategies/print 均接入通用设置母版且可访问。修改文件：`vue3/src/layouts/erp-shell/navigation.ts`、`vue3/src/app/templates/settings-template.ts`、`vue3/src/views/sales/sales-plans/SalesPlanList.vue`、`vue3/src/views/sales/sales-plans/SalesPlanDetail.vue`、`vue3/preview-sales-plan-list.html`。检查入口：`preview-sales-plan-list.html`、`preview-sales-plan-list.html?action=new`、`preview-sales-plan-list.html?id=plan_001`、`preview-sales-plan-list.html?setting=fields`、`preview-sales-plan-list.html?setting=numbers`、`preview-sales-plan-list.html?setting=approvals`、`preview-sales-plan-list.html?setting=strategies`、`preview-sales-plan-list.html?setting=print`、Vue `/sales/sales-plans`、`/sales/sales-plans?action=new`、`/sales/sales-plans?id=plan_001`、`/sales/sales-plans?setting=fields|numbers|approvals|strategies|print`。自检结果：`sales-plans.json` 解析通过，`preview-sales-plan-list.html` 脚本语法通过，`vue3` 执行 `pnpm run build` 通过，仅保留 Vite chunk 体积警告。

### 返修任务 R-013 - 派给窗口 5 - 母版、导航和可见入口矩阵
状态：已完成
发现时间：2026-05-27 15:45
发现人：主控
问题：用户当前看不到其它窗口处理的页面，说明入口、导航、静态预览、Vue 路由和母版使用情况没有形成总闭环。窗口 5 负责做全局入口矩阵和母版一致性收口，不做模块字段细节。
期望结果：
- 输出销售中心入口矩阵，列出计划/报价/合同/订单的列表、新增、详情、设置五类入口。
- 修正顶部一级导航、左侧二级导航、三级/四级浮窗里的链接，确保能打开对应静态预览页面。
- 检查并修正 `preview-framework.html`、`preview-sales-basic-list.html`、`preview-sales-plan-list.html` 的入口链接一致性。
- 检查 Vue 路由/导航配置是否能打开相同页面。
- 检查所有模块设置页确实复用客户管理设置母版，不出现占位、写死不可编辑、弹窗风格漂移。
- 不修改报价/合同/订单/计划的业务字段；发现字段问题写回 R-009/R-010/R-011/R-012 对应任务。
影响入口：
- `preview-framework.html`
- `preview-sales-basic-list.html?type=quotes|contracts|orders`
- `preview-sales-plan-list.html`
- Vue `/sales/sales-plans`、`/sales/sales-quotes`、`/sales/sales-contracts`、`/sales/sales-orders`
影响文件：
- `vue3/preview-framework.html`
- `vue3/preview-sales-basic-list.html`
- `vue3/preview-sales-plan-list.html`
- `vue3/src/layouts/erp-shell/navigation.ts`
- `vue3/src/app/router/index.ts`
- `vue3/src/views/sales/shared/SalesSettingPage.vue`
- `docs/sales-parallel-coordination.md`
验收方式：
- 在处理记录里提交入口矩阵。
- 标记每个入口：可访问/不可访问/需对应模块窗口修。
- 静态脚本语法通过，Vue 构建通过或写明不能构建原因。
处理记录：
2026-05-27 15:50 窗口 5 已领取，开始检查静态预览入口、Vue 导航/路由、设置母版一致性，并整理销售中心入口矩阵。
2026-05-27 16:00 窗口 5 已完成母版、导航和可见入口矩阵收口：
- 修改文件：`vue3/preview-framework.html`、`docs/sales-parallel-coordination.md`。
- 修正内容：补齐销售工作台浮窗里的 `设置计划打印模板` 静态入口，链接到 `preview-sales-plan-list.html?setting=print`，与 `preview-sales-plan-list.html`、Vue 导航 `navigation.ts` 保持一致。
- 入口矩阵：
  - 销售工作台：`http://127.0.0.1:4181/preview-framework.html`，状态：可访问。
  - 销售计划：列表 `http://127.0.0.1:4181/preview-sales-plan-list.html`，新增 `http://127.0.0.1:4181/preview-sales-plan-list.html?action=new`，详情 `http://127.0.0.1:4181/preview-sales-plan-list.html?id=plan_001`，设置 `http://127.0.0.1:4181/preview-sales-plan-list.html?setting=fields|numbers|approvals|strategies|print`，状态：可访问。
  - 报价管理：列表 `http://127.0.0.1:4181/preview-sales-basic-list.html?type=quotes`，新增 `http://127.0.0.1:4181/preview-sales-basic-list.html?type=quotes&action=new`，详情 `http://127.0.0.1:4181/preview-sales-basic-list.html?type=quotes&id=quote_001`，设置 `http://127.0.0.1:4181/preview-sales-basic-list.html?type=quotes&setting=fields|numbers|approvals|strategies|print`，状态：可访问。
  - 合同管理：列表 `http://127.0.0.1:4181/preview-sales-basic-list.html?type=contracts`，新增 `http://127.0.0.1:4181/preview-sales-basic-list.html?type=contracts&action=new`，详情 `http://127.0.0.1:4181/preview-sales-basic-list.html?type=contracts&id=contract_001`，设置 `http://127.0.0.1:4181/preview-sales-basic-list.html?type=contracts&setting=fields|numbers|approvals|strategies|print`，状态：可访问。
  - 订单管理：列表 `http://127.0.0.1:4181/preview-sales-basic-list.html?type=orders`，新增 `http://127.0.0.1:4181/preview-sales-basic-list.html?type=orders&action=new`，详情 `http://127.0.0.1:4181/preview-sales-basic-list.html?type=orders&id=so_001`，设置 `http://127.0.0.1:4181/preview-sales-basic-list.html?type=orders&setting=fields|numbers|approvals|strategies|print`，状态：可访问。
  - Vue 入口：`/sales/sales-plans`、`/sales/sales-quotes`、`/sales/sales-contracts`、`/sales/sales-orders`，并支持 `?action=new`、`?id=...`、`?setting=fields|numbers|approvals|strategies|print`，状态：路由/导航配置可访问。
- 母版一致性检查：`SalesSettingPage.vue` 统一承载计划/报价/合同/订单设置页；未发现“等待母版”“占位”“流程来源：客户审批设置”残留；自定义字段新增/编辑弹窗、审批人选择、策略下拉来源均在通用母版内。
- 自检结果：`preview-framework.html`、`preview-sales-basic-list.html`、`preview-sales-plan-list.html` 静态脚本语法和链接存在性校验通过；上述核心 URL HTTP 200；`vue3` 执行本地 pnpm `run build` 通过，仅保留 Vite chunk 体积警告。
- 需对应模块窗口处理：R-011 订单管理全入口回正仍为 `待领取`，业务字段/交互细节不在窗口 5 本次修改范围内。

## 本轮并行执行说明

### 2026-05-27 14:35 - 主控销售中心总盘点后的安排

本轮目标：在不做退货、换货、报表的前提下，把销售中心的销售计划、报价、合同、订单和通用设置页做成可验收的一轮完整复刻。

执行窗口领取规则：
- 窗口 1 领取 R-002。
- 窗口 2 领取 R-003。
- 窗口 3 领取 R-004。
- 窗口 4 领取 R-001。
- 窗口 5 领取 R-005。
- 窗口 6 暂不开始 R-006，等 R-001 到 R-005 均标记为 `已完成` 后再检查。

所有窗口统一标准：
- 原 JSX 是字段和交互逻辑基准。
- 客户管理页面是样式母版基准。
- Vue、mock、静态预览必须三边一致。
- 最终交付以 `vue3` 工程、API adapter 和接口契约为准；静态预览只做验收镜子，不能作为实现来源。
- 销售中心设置页必须复用客户管理已验收设置母版；自定义字段、自定义编号、审批设置、策略设置只替换字段清单和业务文案，不允许另起一套交互。
- 计划、报价、合同、订单设置数据统一走 `getSalesSettings(module)` / `saveSalesSettings(module, data)`，后端契约见 `docs/sales-settings-contract-alignment.md`。
- 每个窗口改完后必须执行 `vue3` 构建；如果本窗口无法执行，必须在处理记录里写明原因。
- 不能新增独立 HTML；报价、合同、订单继续使用 `preview-sales-basic-list.html` 参数分流，计划继续使用 `preview-sales-plan-list.html`。
- 退货、换货、报表本轮不做。
- 遇到阻塞问题，直接写入「待批复问题」，主控会看文档批复，不需要用户传话。

## 主控复查记录

### 2026-05-27 17:15 - 主控修复销售设置母版可编辑性

结论：销售中心设置页继续以 Vue/API 契约为主，静态预览只同步验收镜像。

已完成：
- `AwCodeRuleBuilder` 对齐客户管理编号母版：固定前缀黑色、后续编号项系统蓝色、补齐扩展自定义代码项和已选编号项内联输入。
- `settings-template.ts` 补齐通用编号扩展项 `自定义代码1/2`，计划、报价、合同、订单共享。
- `SalesSettingPage.vue` 补齐字段删除/开关、审批删除/启用开关、打印模板删除后的 `saveSalesSettings` 保存路径。
- `preview-sales-plan-list.html?setting=numbers` 同步编号母版验收镜像，便于浏览器当前页面检查。

验证结果：
- `vue3` 构建通过，仅保留 Vite chunk 体积警告。
- `preview-sales-plan-list.html`、`preview-sales-basic-list.html` 静态脚本语法校验通过。

### 2026-05-27 16:55 - 主控回正销售设置页交付口径

结论：用户明确最终交付必须能和后端按接口契约同步，不能只修静态预览。主控已把销售中心设置页回正到 Vue/API 契约主线。

已完成：
- 新增 `docs/sales-settings-contract-alignment.md`，明确销售设置统一接口、资源路径、数据结构和实现规则。
- 在 `vue3/src/app/api/sales/types.ts` 补齐 `SalesSettings`、自定义字段、编号规则、审批规则、策略规则、打印模板等后端可对齐类型。
- 在 `vue3/src/app/api/sales/resources.ts` 新增 `getSalesSettings(module)` / `saveSalesSettings(module, data)`，mock 来源统一映射 `settings-template.ts`，远端接口统一走 `/{resource}/settings`。
- `SalesSettingPage.vue` 改为通过 API adapter 初始化和保存设置数据；计划、报价、合同、订单继续复用同一个 Vue 设置页入口。

验证结果：
- `vue3` 构建通过，仅保留 Vite chunk 体积警告。

后续窗口规则：
- 不再单独改写各销售设置页静态逻辑；如需补字段，先改 `settings-template.ts` 和 API 类型，再检查 Vue 页和静态预览是否一致。
- 发现设置页样式/交互漂移，优先对齐客户管理母版组件，不允许复制出第二套弹窗或审批编辑器。

### 2026-05-27 16:27 - 主控复查并直接修复公共母版问题

结论：暂无新的待批复问题；R-009 到 R-013 仍保持已完成，但主控根据用户复查反馈直接补了一轮公共行为。

已直接修复：
- 销售基础列表静态预览：选择框、序号、操作列挂接固定列类，保持与客户列表母版一致。
- 销售计划列表静态预览：选择框、序号、操作列补齐固定宽度和固定列类。
- 合同详情静态预览：Tab 改为真实切换独立内容，补齐订单核销、发货记录、开票记录、回款记录、操作记录面板。
- 销售设置静态预览：编号项可点选，审批新增/编辑弹窗可打开，策略 Tab 可切换，打印模板新增/编辑可打开。
- 公共 CSS：补齐固定列宽度类和审批人员标签样式。

验证结果：
- `preview-framework.html`、`preview-sales-basic-list.html`、`preview-sales-plan-list.html`、`preview-customer-setting.html` 静态脚本语法校验通过。
- `vue3` 构建通过，仅保留 Vite chunk 体积警告。

下一步执行规则：
- 后续窗口继续按公告板执行；新增页面必须先套客户管理母版，再替换原 JSX 字段和交互。
- 发现列表固定列、详情 Tab、设置页可编辑性、弹窗风格漂移，优先写入返修任务池或由主控小修。

### 2026-05-27 16:35 - 主控补齐销售计划设置页静态交互

结论：用户复查指出销售计划设置页五个入口仍像占位页，主控已直接修复静态预览。

已修复：
- `preview-sales-plan-list.html?setting=fields`：补齐字段位置左右结构、字段按区域切换、新增计划字段弹窗、编辑字段弹窗。
- `preview-sales-plan-list.html?setting=numbers`：补齐编号项点击选择/取消、删除已选编号项、重置、当前格式实时刷新。
- `preview-sales-plan-list.html?setting=approvals`：补齐新增计划审批规则弹窗、编辑审批规则弹窗、审批节点、审批人标签和审批方式切换。
- `preview-sales-plan-list.html?setting=strategies`：补齐策略 Tab 点击高亮。
- `preview-sales-plan-list.html?setting=print`：补齐新增计划打印模板弹窗、编辑打印模板弹窗。

验证结果：
- `preview-sales-plan-list.html` 静态脚本语法校验通过。
- `vue3` 构建通过，仅保留 Vite chunk 体积警告。

### 2026-05-27 - 窗口 B 回正销售计划设置母版交互

结论：按用户复查要求，销售计划设置页必须直接复用客户管理设置母版，不能只复制外观。已将 `preview-sales-plan-list.html?setting=fields|numbers|approvals|strategies|print` 的静态验收交互继续回正。

已修复：
- `preview-sales-plan-list.html?setting=fields`：新增/编辑字段弹窗回正为客户管理字段弹窗结构；补齐添加负责人、人员选择弹窗、确认回填权限人员、权限计数、是否可见开关；修复本页私有 `.aw-field label` 样式覆盖导致开关轨道不显示的问题。
- `preview-sales-plan-list.html?setting=numbers`：编号项补齐搜索项开关、拖拽重排、删除编号项、扩展项输入、重置和保存按钮行为。
- `preview-sales-plan-list.html?setting=approvals`：审批新增/编辑改为母版式审批规则设置弹窗；补齐审批节点、添加/删除节点、审批人选择弹窗、确认后追加回填审批人标签、标签删除、审批方式切换。
- `preview-sales-plan-list.html?setting=strategies`：策略 Tab 改为真实切换内容；启用/关闭单选状态可切换。
- `preview-sales-plan-list.html?setting=print`：新增/编辑打印模板弹窗改为母版弹窗结构，字段顺序为模板名称、适用场景、纸张、模板说明，并保留取消/确定按钮行为。

验证结果：
- `preview-sales-plan-list.html` 静态脚本抽取校验通过。
- `vue3` 执行 `pnpm run build` 通过，仅保留 Vite chunk 体积警告。

### 2026-05-28 - 主控统一页面固定区滚动规则

结论：用户连续标注确认所有中心页面都应遵循同一母版滚动规则：顶部主导航、左侧二级导航、右侧页面头、内容页标题/操作区固定；下方业务内容独立滚动，不允许整页 body 滚动。

已修复：
- `ErpShell.vue`：新增统一 `aw-console-root` 和 `aw-page-body`，把所有中心页面纳入同一壳层滚动母版。
- `aw-console.css`：锁定 body 和 ERP shell 高度，固定顶部主导航、左侧二级导航、右侧页头；工作台内容改由 `aw-workbench-board` 独立滚动。
- `PageShell.vue` / `global.css`：内容页标题、说明和操作按钮固定，实际内容放入 `page-shell__body` 独立滚动。
- 列表母版 `AwListPage` 对应样式：左树、工具栏、分页固定在列表面板结构内，表格内容区域独立滚动。
- 新增/详情/设置母版补充高度和 overflow 兜底，避免切换为壳内滚动后页面被截断。
- 构建过程中发现销售计划、报价、合同新增页提交给接口时仍存在字符串数值与契约 number 字段不一致，已在提交映射处转换数量、价格、金额、阶梯数量/折扣，保证 Vue3 构建通过。

验证结果：
- `vue3` 执行 `pnpm run build` 通过，仅保留 Vite chunk 体积警告。

### 2026-05-28 10:26 - 窗口 B 收口销售中心新增页优先项

结论：已优先补齐销售中心新增页的客户/人员选择、客户信用管控、订单价格来源和新增提交接口；真实交付仍以 Vue3 工程为准，静态 HTML 未参与本轮验收。

已完成：
- `resources.ts` 补齐 `createCustomer`、`createSalesPlan`、`createSalesQuote`、`createSalesContract`、`createSalesOrder`，mock 模式直接返回新增对象，remote 模式预留对应 POST 契约。
- 客户新增页：复用公共 `AwPersonPickerModal`，客户经理可选择、确认、回填；基础信息补齐 `信用管控`，保存草稿/保存客户均调用新增接口。
- 销售计划、报价、合同新增页：保存/提交不再停留在占位函数，已接入新增接口并回显处理结果。
- 订单新增页：重写为公共表单页 + 公共可编辑子表结构，补齐订单来源选择、客户选择、客户联系人选择、客户信用管控展示、来源明细回填、`价格来源` 列、信用占用/拦截提示，以及确认/草稿接口提交。
- 公共样式补齐 `.aw-form-note`，让新增页接口反馈和提示文案保持一致。

验证结果：
- `vue3` 执行 `pnpm run build` 通过，仅保留 Vite chunk 体积警告。
- 已用 in-app browser 验证订单新增页：选择报价来源后回填客户、联系人、交货日期和产品明细；产品明细显示 `价格来源`（如 `报价单 SP-20251221001 / V1`）；客户联系人弹窗可切换并回填；点击确认后显示 `订单已通过新增接口确认。`
- 已用 in-app browser 验证客户新增页：`绑定销售人员` 打开公共人员选择器，选择 `老夏` 后回填客户经理；`信用管控` 字段存在；点击保存客户后显示新增接口提交结果。
- 已用 in-app browser 验证计划、报价、合同新增页：提交/保存按钮均可触发新增接口并显示成功提示。
- 使用 Chrome/Playwright 检查 `http://localhost:5174/rd`、`/rd/doc`、`/sales/customers`：`window.scrollY` 保持 0，左侧栏和右侧页头位置不变；工作台、内容页、列表表格分别由内部容器滚动。

追加修复：
- `preview-sales-plan-list.html?setting=approvals`：用户复查指出审批设置不应是弹窗；已改回客户管理母版的页面内审批编辑器。列表点击“编辑”或顶部“新增计划审批规则”后，隐藏列表并显示 `审批规则设置` 编辑区域；顶部动作切换为取消、编辑、保存；审批节点、审批人选择、人员回填、人员标签删除、审批方式切换和添加节点均在页面内完成。

追加验证：
- `preview-sales-plan-list.html` 静态脚本抽取校验通过。
- `vue3` 执行 `pnpm run build` 通过，仅保留 Vite chunk 体积警告。

### 2026-05-27 14:15 - 主控安装 Vue3 依赖并完成构建

结论：`vue3` 依赖已安装，真实工程构建已通过。

处理结果：
- 已停用 10 分钟心跳检查自动化，安装期间不再占用主控节奏。
- 本机 PATH 仍无全局 `npm/pnpm/yarn`，主控使用本地临时 pnpm 安装依赖。
- 依赖安装目录：`vue3/node_modules`。
- 锁文件已生成：`vue3/pnpm-lock.yaml`。
- 本地工具目录 `.codex-tools/` 已加入根 `.gitignore`，不作为交付物。
- 执行 `pnpm run build` 等价命令后，`vue-tsc --noEmit && vite build` 通过。

主控顺手修复：
- `WorkbenchBoard.vue` 拖拽卡片数组类型收窄。
- `SalesOrderCreate.vue`、`SalesPlanCreate.vue`、`SalesQuoteCreate.vue` 的可编辑子表格 slot 行类型做边界适配。

仍需注意：
- 构建存在 Vite chunk 体积警告，不阻塞当前复刻；后续真实工程优化时再做拆包。
- 其他窗口继续开发前，应以构建通过为验收底线之一。

### 2026-05-27 13:50 - 窗口 6 交叉检查后复核

结论：暂无需要派发的返修任务。

复核结果：
- 协同公告板「待批复问题」为空。
- 协同公告板「返修任务池」为空。
- 四个销售 mock JSON 可解析：报价 4 条、合同 3 条、订单 5 条、计划 4 条。
- 静态预览脚本语法校验通过：`preview-sales-basic-list.html`、`preview-sales-plan-list.html`。
- 关键字段已在 Vue 配置和静态预览中出现：报价日期、已下单金额、异常标签、订单进展、计划编号、达成率。

仍需注意：
- 本机无 `npm`，且 `vue3/node_modules` 不存在，暂不能执行 `npm install` / `npm run build`。
- 设置页内部仍按公告板规则等待窗口 5 通用设置母版统一接入。

### 2026-05-27 21:10 - 窗口 B 回正销售计划审批 Vue 母版差异

结论：用户复查指出当前 `localhost:5173/sales/sales-plans?setting=approvals` 的 Vue 实页仍未严格照客户管理母版；已改真实 Vue 工程源头，不再以静态 HTML 代替验收。

已修复：
- `AwApprovalRuleEditor.vue`：审批节点卡片按客户管理母版回正，箭头 `→`、删除按钮 `×`、负责人入口 `请选择负责人  +`、已选人员删除 `×` 保持一致。
- `settings-template.ts`：审批方式说明回正为客户管理母版文案：`按先后顺序，一人同意才流转到下一人`、`所选人员必须全部审批后进入下一节点`、`选中的人里只要有一人同意即可`。
- `SalesSettingPage.vue`：新增审批规则默认生成 3 个空节点，默认选中第 2 个节点；编辑时按客户母版选中第 2 个节点；新增节点后选中新节点，删除节点后活动节点自动收敛。
- `SalesSettingPage.vue` / `AwPersonPickerModal.vue`：审批人员选择弹窗标题统一为 `选择负责人`；人员表格行点击和 checkbox 点击均可选择，确认后回填审批人标签。

验证结果：
- `vue3` 执行 `pnpm run build` 通过，仅保留 Vite chunk 体积警告。

### 2026-05-28 00:18 - 窗口 B 回补报价列表分类母版

结论：用户指出销售中心 - 报价管理 - 报价列表应使用“带分类”的列表母版。已对照 `quote-list.jsx` 的 `QuoteTree`，将真实 Vue3 报价列表从无分类列表切回带分类树列表。

已修复：
- `SalesQuoteList.vue`：补入 `AwResourceTree` 的 `tree` 插槽，使用同一套带分类列表母版；新增 `pickedCategory`，按报价 `category` 字段真实过滤表格。
- `salesQuoteList.config.ts`：按原 JSX 提取报价分类：报价分类、通用报价、分组报价、促销报价、一次性报价。
- `aw-console.css`：补齐 `line-folder` 图标，并让带树列表的工具栏可换行收纳，避免分类树占宽后“添加报价”按钮被裁切。

验证结果：
- `vue3` 执行 `pnpm run build` 通过，仅保留 Vite chunk 体积警告。
- 已用 in-app browser 验证 `http://localhost:5173/sales/sales-quotes`：左侧分类树显示通用 1、分组 2、促销 0、一次性 1；点击“分组报价”后表格过滤为 2 条；“添加报价”按钮完整可见。

### 2026-05-28 00:46 - 窗口 B 收口销售中心五个列表页

结论：按原 JSX 列表页对齐销售中心客户、销售计划、报价、合同、订单五个列表页；本轮不处理销售退货、销售换货、销售报表，也不改新增页。

已完成：
- `AwDataTable.vue` 增加列头下拉筛选能力，业务页传入 `filterOptions` 和 `filterValues`，筛选发生在当前 Vue3 列表数据上，不再只保留“筛选”工具按钮占位。
- 客户管理列表：补回原 JSX 的“全部客户”树节点；移除 Vue3 里多出的“状态”列，列顺序回到原客户列表字段。
- 销售计划列表：补回原 JSX 的“计划状态”列头筛选，选项为未开始、执行中、已完成、已暂停、已关闭。
- 报价管理列表：保留已补回的报价分类树，并补回“报价状态”列头筛选，选项为审核中、已批准、已失效、草稿。
- 合同管理列表：补回“履约状态”列头筛选，选项为待审批、履约中、履约完成、已终止。
- 订单管理列表：补回“合同来源”列；补回“订单状态”和“订单进展”两个列头筛选。
- 五个列表配置文件统一回正为可读中文配置，避免继续在列表母版配置层保留乱码标签。

验证结果：
- `vue3` 执行 `pnpm run build` 通过，仅保留 Vite chunk 体积警告。
- 已用 in-app browser 验证：客户树显示“全部客户(4)”且无多余状态列；计划筛“执行中”后 2 条；报价筛“草稿”后 1 条；合同筛“履约中”后 1 条；订单显示“合同来源”列，筛“审核中”后 1 条，筛“发货中”后 1 条。
- 已从 `http://localhost:5173/src/...` 读取 Vite 实时服务输出，确认当前 dev server 已加载新的审批组件、销售设置页和人员选择弹窗源码。

### 2026-05-27 21:16 - 窗口 B 回正销售计划自定义编号 Vue 母版差异

结论：销售计划自定义编号页此前使用抽象版 `AwCodeRuleBuilder`，不适用客户管理已验收母版；已按母版重写编号构建器，并保留销售设置页 `numberRule.prefix/separator/selected` 接口契约。

已修复：
- `AwCodeRuleBuilder.vue`：已选编号项补齐 `搜索项` 开关；拖拽符号改为母版 `⠿`；删除按钮改为 `×`；固定前缀卡片显示 `预览值：前缀` 和锁图标；扩展项保留名称/代码输入；重置时同步清空搜索项和扩展项本地状态。
- `settings-template.ts`：编号候选项改为客户管理母版同一套：年（4位）、年（2位）、月（2位）、日（2位）、流水号（3位）、流水号（1位）、自定义代码1、自定义代码2；移除销售页私有的部门编码、负责人编码、年月日等候选项。
- `SalesSettingPage.vue`：对旧 `yearMonth/yearMonthDay/serial3/serial4/dept/owner` 选中值做兼容映射，防止后端旧数据进入 Vue 后编号页空白或错位。

验证结果：
- `vue3` 执行 `pnpm run build` 通过，仅保留 Vite chunk 体积警告。

### 2026-05-27 21:28 - 窗口 B 拆分销售四模块策略设置内容

结论：用户指出销售计划、报价管理、合同管理、订单管理的策略设置不能只套同一套通用内容；已保留现有母版组件结构，将策略内容按原 JSX 页面语义拆成四套。

已修复：
- `plans` 计划策略：提取销售计划原型中的统计口径（按订单确认/按发货/按回款）、达成率低于 70% 预警、业绩追踪汇总、销售明细回写、审批通过后进入执行跟踪。
- `quotes` 报价策略：提取报价原型中的报价分类（通用/分组/促销/指定客户/一次性）、报价优先级、客户匹配取价、价格版本保存后锁定、报价转合同/订单和财务追踪。
- `contracts` 合同策略：提取合同原型中的来源控制（手动/项目/报价）、适用报价规则、价格有效规则、支付约定、履约状态推进、订单核销、发货/开票/回款回写。
- `orders` 订单策略：提取订单原型中的订单来源（报价单/合同/项目/手动）、客户档案默认值、信用拦截与异常审批、自动/手动出库、发货应收、开票/回款/信用释放、生产和退换货追踪。

验证结果：
- `settings-template.ts` 已无 `strategyTabs(name)` 通用假策略引用。
- `vue3` 执行 `pnpm run build` 通过，仅保留 Vite chunk 体积警告。

追加修复：
- 2026-05-27 21:53 用户复查指出策略设置下拉框仍未显示业务逻辑选项。根因是 `SalesSettingPage.vue` 的 `strategyTabsWithApprovals` 会把所有 `type: select` 策略项统一覆盖为审批规则列表。
- 已将覆盖逻辑收窄为仅 `row.key === 'needApproval'` 时注入审批规则；计划统计口径、报价分类、合同来源/支付约定、订单来源/出库方式等业务下拉保留各自模板选项。

追加验证：
- `vue3` 执行 `pnpm run build` 通过，仅保留 Vite chunk 体积警告。

### 2026-05-27 22:09 - 窗口 B 补齐采购中心四模块设置页

结论：已按“客户管理设置页为母版、原 JSX/接口契约提取业务内容”的规则补齐真实 Vue3 采购中心设置入口；本轮只覆盖供应商管理、请购、询价、采购订单，采购退货、采购换货、采购报表未接入设置页。

已完成：
- 新增采购设置模板 `purchase-settings-template.ts`：按 `supplier-list.jsx`、`pr-list.jsx`、`inquiry-list.jsx`、`order-list.jsx` 和采购接口契约拆分四套字段、编号、审批、策略、打印内容。
- 新增采购设置接口适配 `purchase/settings.ts`：预留 `/suppliers/settings`、`/purchase-requests/settings`、`/purchase-inquiries/settings`、`/purchase-orders/settings` 远端契约，mock 模式直接使用模板数据。
- 新增 `PurchaseSettingPage.vue`：复用客户管理同源母版组件，覆盖弹窗结构、字段顺序、控件类型、按钮行为、人员选择器、回填、计数、开关显示；供应商额外补充分组和等级设置。
- `ContractResourcePage.vue` 已将 `/purchase/suppliers`、`/purchase/purchase-requests`、`/purchase/purchase-inquiries`、`/purchase/purchase-orders` 的 `?setting=` 入口切换到采购设置页；退货、换货、报表保持原页面。

验证结果：
- `vue3` 执行 `pnpm run build` 通过，仅保留 Vite chunk 体积警告。
- 已检查四个采购模块策略内容不再共用同一套假配置：供应商、请购、询价、采购订单分别有独立业务下拉和策略项。

### 2026-05-27 22:35 - 窗口 B 补齐仓储/生产设置页

结论：已继续按“客户管理设置页为母版、原 JSX/接口契约提取业务内容”的规则补齐真实 Vue3 设置入口；本轮覆盖仓储中心库存、入库、出库、调拨、盘点、仓库库位，以及生产中心生产需求、生产计划、生产订单、生产工单、委外加工。仓储出库质检、来料质检和生产排班未接入设置页。

已完成：
- 新增 `operation-settings-template.ts`：按 `warehouse-stock-list.jsx`、`warehouse-inbound-list.jsx`、`warehouse-outbound-list.jsx`、`warehouse-transfer-list.jsx`、`warehouse-inventory-list.jsx`、`manufacturing-list.jsx` 和仓储/生产接口契约拆分 11 套字段、编号、审批、策略、打印内容。
- 新增 `operation/settings.ts`：为仓储/生产设置预留远端契约，mock 模式直接使用模板数据。
- 新增 `OperationSettingPage.vue`：复用客户管理同源母版组件，覆盖自定义字段弹窗、字段顺序、控件类型、按钮行为、人员选择器、回填、计数、权限开关、编号、审批、策略和打印模板。
- `ContractResourcePage.vue` 已将 `/warehouse/inventory-stocks`、`/warehouse/warehouse-inbounds`、`/warehouse/warehouse-outbounds`、`/warehouse/warehouse-transfers`、`/warehouse/inventory-counts`、`/warehouse/warehouse-locations`、`/production/production-demands`、`/production/production-plans`、`/production/production-orders`、`/production/production-work-orders`、`/production/outsource-orders` 的 `?setting=` 入口切换到统一设置页。

验证结果：
- `vue3` 执行 `pnpm run build` 通过，仅保留 Vite chunk 体积警告。
- 已检查 11 个策略页标题和业务下拉内容均为各模块独立内容，不再复用同一套假配置。
- 已检查排除项没有设置页映射：`/warehouse/outbound-quality-inspections`、`/warehouse/inbound-quality-inspections`、`/production/production-schedules`。

### 2026-05-27 22:48 - 主控回正研发中心浮窗来源

结论：用户复查指出研发中心左侧二级导航正确，但三级/四级浮窗内容被自行扩展，必须严格回到原 `components.jsx` 的 RD flyouts。

已修复：
- `navigation.ts` 移除研发中心自造的详情项、分类树和扩展项，不再出现文档详情、项目分类、产品扩展、物料分类、工序扩展、工艺扩展、BOM分类等非原 JSX 浮窗内容。
- 文档库、项目管理、产品管理、物料管理、工序管理、工艺管理均按原 JSX 保留两组：业务列表组 + 对应设置组，分组标题、展示文案和顺序对齐原型。
- BOM管理按原 JSX 保留三组：`BOM库`、`代替物料库`、`BOM设置`，补回 `新增代替`、`代替列表`、`设置bom策略/分类/模板/流程` 等原型项。
- 保留 Vue3 路由兜底能力，所有浮窗项继续挂到对应 `/rd/*` 路由或 query 入口，便于后续页面会话继续对接。

验证结果：
- `vue3` 执行 `pnpm run build` 通过，仅保留 Vite chunk 体积警告。

### 2026-05-28 - 采购中心四模块列表页与新增页 Vue3 收口

结论：本轮只覆盖供应商管理、请购、询价、采购订单的列表页和新增页；采购退货、采购换货、采购报表未做扩展。真实交付为 Vue3 工程，未改静态 HTML 作为完成物。

已完成：
- 新增 `vue3/src/app/api/purchase/resources.ts`：按 `supplier-list.jsx`、`pr-list.jsx`、`inquiry-list.jsx`、`order-list.jsx` 提取四模块列表示例数据、状态选项、来源单据、供应商、产品、询价来源和采购订单来源，并提供 `listPurchase` / `createPurchase` mock 与远端契约入口。
- 新增 `vue3/src/views/purchase/PurchaseResourcePage.vue`：四模块共用真实 Vue 页面入口，列表页复用 `AwListPage`、`AwResourceTree`、`AwListToolbar`、`AwDataTable`；新增页复用 `AwFormPage`、`AwEditableSubTable`、`AwRichTextEditor`、`AwPersonPickerModal`，弹窗统一沿用客户/销售母版 `.aw-mask`、`.aw-modal`、`.head/.body/.foot` 结构。
- `vue3/src/app/router/index.ts`：将 `/purchase/suppliers`、`/purchase/purchase-requests`、`/purchase/purchase-inquiries`、`/purchase/purchase-orders` 从契约占位页切到真实采购页面；`?setting=` 仍进入既有 `PurchaseSettingPage`。
- 列表页字段按原 JSX 顺序核对：供应商列表含分类树和状态/分类筛选；请购含流程状态筛选；询价含询价状态筛选；采购订单含采购状态筛选，新增入口均可进入对应新增页。
- 新增页交互按原 JSX 核对：供应商新增支持采购人员选择、供应产品选择回填、提交反馈；请购新增支持产品选择、供应商选择回填、提交反馈；询价新增支持询价来源选择回填、临时供应商追加、数量/单价金额联动、提交反馈；采购订单新增支持订单来源选择、供应商选择、供应商更换理由弹窗、供应商更换后审核提示、供货产品回填、价格来源保留、金额展示和提交反馈。

验证结果：
- `vue3` 执行 `pnpm run build` 通过，仅保留 Vite chunk 体积警告。
- 已用 in-app browser 逐页验证列表：`/purchase/suppliers` 状态筛“待审核”后 2 条且新增供应商入口存在；`/purchase/purchase-requests` 筛“审批中”后 1 条且新增请购入口存在；`/purchase/purchase-inquiries` 筛“待定价”后 1 条且新增询价入口存在；`/purchase/purchase-orders` 筛“采购中”后 1 条且新增采购入口存在。
- 已用 in-app browser 验证新增：供应商新增人员选择回填 `老夏`、产品选择后输入值包含 `7820864/半成品物料`、提交显示新增接口反馈；请购新增产品选择后输入值包含 `6576642`、供应商选择回填 `深圳鑫达电子科技有限公司`、提交显示新增接口反馈。
- 已用 in-app browser 验证询价新增：选择来源 `PR-2026-00232` 后回填产品和数量 `8`，填单价 `50` 后金额显示 `400.00`；追加临时供应商成功；提交显示新增接口反馈。
- 已用 in-app browser 验证采购订单新增：选择来源 `PR-2026-00232` 后回填来源明细和 `请购转采购/待询价` 价格来源；更换供应商必须先填写理由，确认后选择 `广州宏业机械配件有限公司` 并显示 `已触发审核`；来源金额输入值可见；提交显示新增接口反馈。

追加修复：
- 2026-05-28 用户反馈请购、询价、采购订单列表页无数据。复查发现 mock 数据存在且直接路由可渲染，但为避免旧 query/筛选状态或热更新缓存导致列表空白，已将 `PurchaseResourcePage.vue` 的列表加载改为监听 `route.fullPath`：进入非新增、非设置的采购列表路由时，强制清空搜索、分类和列筛选后重新加载当前模块数据。

追加验证：
- `vue3` 执行 `pnpm run build` 通过，仅保留 Vite chunk 体积警告。
- in-app browser 复查：`/purchase/purchase-requests` 显示 6 行，首行 `PR-2026-00232`；`/purchase/purchase-inquiries` 显示 5 行，首行 `DD-2024-001`；`/purchase/purchase-orders` 显示 7 行，首行 `CG-20251221001`。

### 2026-05-28 - 采购中心四模块详情页 Vue3 收口

结论：本轮只覆盖供应商详情、请购详情、询价详情、采购订单详情；真实交付为 Vue3 工程，静态 JSX 仅作为字段、Tab、子表和交互来源。

已完成：
- `purchase/resources.ts` 补齐详情与动作接口适配：`getPurchaseDetail`、`updatePurchase`、`approvePurchase`、`printPurchase`、`exportPurchase`，mock 模式返回动作结果，远端模式预留 REST 契约。
- `PurchaseResourcePage.vue` 增加 `?id=` 详情态；列表页供应商名称/请购主题/询价主题/采购编号和“查看”操作均可进入对应详情页；返回列表会清除 `id` query 并回到列表。
- 四个详情页统一复用详情母版组件：`AwDetailPage`、`AwDetailToolbar`、`AwDetailHeader`、`AwDetailTabs`、`AwDetailInfoGrid`，未复制新增页作为详情页。
- 供应商详情按 `supplier-list.jsx` 补齐供应商信息、供应产品、联系人信息、财务信息、地址信息、报价记录、采购记录、操作记录。
- 请购详情按 `pr-list.jsx` 补齐请购信息、请购明细、附件/备注、操作记录，保留打印状态、关联单据、请购来源、流程状态等字段。
- 询价详情按 `inquiry-list.jsx` 补齐询价信息、询价明细、附件/备注、操作记录，保留供应商类型、报价版本、含税、折扣、金额、税额、交货期、最小采购量、采购生成状态。
- 采购订单详情按 `order-list.jsx` 补齐采购信息、采购明细、入库记录、三单匹配、应付暂估、质检扣款、付款记录、到票记录、来源记录、操作记录。
- 详情动作区包含修改、审批、打印、导出；修改为明确查看态/编辑态切换，点击修改会回到基础信息 Tab 并显示备注编辑区，保存调用 `updatePurchase` mock。

验证结果：
- `vue3` 执行 `pnpm run build` 通过，仅保留 Vite chunk 体积警告。
- 已用 in-app browser 从四个列表首行点击进入详情页验证：供应商详情进入 `supplier_001`，请购详情进入 `pr_001`，询价详情进入 `inq_001`，采购订单详情进入 `po_001`。
- 已验证四个详情页关键 Tab 均有数据：供应产品、请购明细、询价明细、采购明细。
- 已验证四个详情页修改按钮会进入编辑态并显示“保存修改”；审批、打印、导出均显示 mock 接口反馈；返回列表行为正常。

追加纠偏：
- 2026-05-28 用户复查指出左侧“供应商明细 / 请购明细 / 询价明细 / 采购订单明细”不是列表单行 `?id=demo_001` 占位入口，其中请购明细应为原 JSX 的产品维度汇总统计页。已将采购四模块明细浮窗入口改为 `?action=供应商明细 / 请购明细 / 询价明细 / 采购订单明细`，只影响供应商、请购、询价、采购订单四个已交付模块，未扩展采购退货、采购换货、采购报表。
- `PurchaseResourcePage.vue` 新增 `PurchaseModuleDetailEntry` 分支：供应商、询价、采购订单明细入口进入对应真实详情页；请购明细入口按 `PrDetailSummaryView` 重做为独立产品汇总表，不复用单据详情母版。
- 请购明细已按 JSX/截图核对字段顺序：序号、产品编号、产品名称、规格型号、标准单位、来源数量、请购总量、交货日期、状态、操作；示例数据为 `7820864/半成品物料`、`8518691/铝合金型材`、`6576642/精密轴承`、`6081578/外箱包装`。
- 请购明细“查看”会展开该产品的所有请购来源明细，展示请购单号、请购来源、来源对象、来源明细、请购数量、交货日期、流程状态、操作，并保留“一键采购”mock 反馈。

追加验证：
- `vue3` 执行 `pnpm run build` 通过，仅保留 Vite chunk 体积警告。
- in-app browser 验证 `/purchase/purchase-requests?action=请购明细`：产品汇总表、状态筛选、4 条示例数据可见；点击首行“查看”显示 `半成品物料 请购数量与来源列表`、`PR-2026-00232` 和“一键采购”；点击“一键采购”显示 mock 接口反馈。
- in-app browser 验证 `/purchase/suppliers?action=供应商明细`、`/purchase/purchase-inquiries?action=询价明细`、`/purchase/purchase-orders?action=采购订单明细` 均能进入真实 Vue 详情/明细入口并显示对应 Tab；供应商列表首行“查看”进入 `supplier_001`，请购、询价、采购订单列表首行“查看”分别进入 `pr_001`、`inq_001`、`po_001`。

二次纠偏：
- 2026-05-28 用户确认供应商管理、询价、采购订单三个模块不需要独立“明细页面”。已删除这三个模块左侧浮窗中的明细入口，保留列表、新增、设置入口；`?action=供应商明细 / 询价明细 / 采购订单明细` 不再进入详情页。
- 请购明细页面改为复用列表页组件 `AwListPage`、`AwListToolbar`、`AwDataTable`，且不带分类树；保留原 JSX 的搜索、刷新、筛选、字段配置、导出、导入、状态筛选、批量操作和分页结构。
- 请购明细“查看”后的详情页按 JSX `PrDetailSummaryView` 补齐产品信息和来源字段：产品编号、产品名称、规格型号、标准单位、来源数量、请购总量、已采购数量、待采购数量、必须询价、交货日期、请购状态；来源表补齐请购单号、请购来源、来源对象、来源明细、请购数量、已采购数量、待采购数量、必须询价、免询价/价格依据、交货日期、流程状态、操作。

二次验证：
- `vue3` 执行 `pnpm run build` 通过，仅保留 Vite chunk 体积警告。
- in-app browser 验证：供应商、询价、采购订单三个被删除的明细 action 均回到列表，不再显示详情 Tab；请购明细列表无分类树，点击 `7820864` 行“查看”进入完整来源详情；点击来源行“采购”显示 mock 接口反馈。

布局微调：
- 2026-05-28 根据页面批注修正请购明细详情布局：详情页拆为两段，顶部独立工具条显示“返回列表 / 取消 / 暂存 / 导出来源”，下方独立卡片显示明细内容；删除卡片标题下方多余的 `7820864 / 规格一 / KG` 摘要行；`一键采购` 保持在来源列表操作列上方。
- 验证：`vue3` 构建通过；in-app browser 确认工具条和明细卡片上下分离、多余摘要行已移除，按钮仍可触发 mock 反馈。
- 继续根据页面批注修正请购明细列表页结构：请购明细列表拆为两段，顶部独立工具条显示“请购管理 / 返回列表”，下方列表面板仅保留搜索、刷新、筛选、字段配置、导出、导入、表格和分页；列表面板内不再混入标题与返回按钮。
- 验证：`vue3` 构建通过；in-app browser 确认列表顶部工具条与下方列表面板上下分离，列表面板不含“请购管理/返回列表”，请购产品详情直达 query 仍可打开完整来源明细。

供应商设置微调：
- 2026-05-28 按用户要求将 `供应商分组设置` 对齐销售中心 `客户分组设置` 母版：直接复用设置页 split 结构，左侧为一级供应商分类树，右侧为当前一级分类下的二级分类表。
- 左侧一级：原材料供应商、零部件供应商、包装供应商、服务供应商、临时供应商；右侧二级按当前一级显示金属材料、电子元器件、化工材料等细分类，表格列保持客户分组母版顺序：序号、分组名称、上级分组、分组编号、供应商数量、状态、操作。
- 验证：`vue3` 构建通过；in-app browser 打开 `/purchase/suppliers?setting=groups`，确认存在 split 布局、左侧一级树、右侧二级表和供应商数量列。
- 追加：供应商分类旁加号与顶部“新增供应商分组”按钮均按客户分组母版改为弹窗新增；一级弹窗标题为“新增供应商分类”，二级弹窗标题为“新增下级分类”，字段均为分类名称、分类编号、分类备注，底部为取消/确定。
- 验证：`vue3` 构建通过；in-app browser 分别点击左侧加号和“新增供应商分组”，确认两个弹窗结构、字段和按钮均与客户分组母版一致。
- 追加：供应商等级设置的“新增供应商等级”改为客户等级同款弹窗，不再直接插入表格行；弹窗标题“新增等级”，字段为等级名称、是否启用、备注，底部为取消/确定，确定后追加供应商等级行。
- 验证：`vue3` 构建通过；in-app browser 点击“新增供应商等级”可打开等级弹窗，结构、字段、按钮与客户等级母版一致。

### 2026-05-28 - 仓储中心七个管理页 Vue3 收口

结论：本轮覆盖仓储中心 `库存管理`、`入库管理`、`出库管理`、`调拨管理`、`盘点管理`、`出库质检`、`仓库库位` 的管理页面；设置项保持既有 `OperationSettingPage`，未重新实现设置页。

已完成：
- 新增 `vue3/src/app/api/warehouse/resources.ts`：按 `warehouse-stock-list.jsx`、`warehouse-inbound-list.jsx`、`warehouse-outbound-list.jsx`、`warehouse-transfer-list.jsx`、`warehouse-inventory-list.jsx`、`qc-list.jsx` 提取列表数据、字段、子表、附件、操作记录，并提供 `listWarehouse`、`getWarehouseDetail`、`createWarehouse`、`updateWarehouse`、`approveWarehouse`、`printWarehouse`、`exportWarehouse` mock/API adapter。
- 新增 `vue3/src/views/warehouse/WarehouseResourcePage.vue`：七个管理模块共用真实 Vue 页面入口；列表页复用 `AwListPage`、`AwListToolbar`、`AwDataTable`、`AwResourceTree`；新增页复用 `AwFormPage`、`AwEditableSubTable`、`AwRichTextEditor`、`AwPersonPickerModal`；详情页复用 `AwDetailPage`、`AwDetailToolbar`、`AwDetailHeader`、`AwDetailTabs`、`AwDetailInfoGrid`。
- `vue3/src/app/router/index.ts`：将七个仓储管理路径从契约占位页切换到真实仓储资源页，`?setting=` 仍进入操作设置母版。
- 列表页字段按 JSX 顺序核对：库存列表含库存分类树和图片/台账/产品/库存/质量/成本/来源列；入库、出库列表保留主题、单号、类别、数量、申请日期、人员、日期、状态、操作；调拨、盘点、出库质检、仓库库位均按原 JSX 列顺序落表。
- 新增页补齐基础交互：来源选择器、产品选择器、人员选择器、明细回填、数量/金额合计、附件区、富文本详情、暂存/提交反馈。
- 详情页补齐返回列表、查看/编辑态切换、Tab、基础信息、明细子表、附件/报告、操作记录，以及审批/确认、打印、导出 mock 反馈。

验证结果：
- `vue3` 执行 `pnpm run build` 通过，仅保留 Vite chunk 体积警告。
- in-app browser 从仓储中心逐页进入七个列表，均显示真实表格和 JSX 示例数据：库存 `IPHONE18`、入库 `采购到货入库`、出库 `内部领用出库`、调拨 `成品仓调拨补货`、盘点 `A仓季度盘点`、出库质检 `销售出货质检`、库位 `A-01-01`。
- in-app browser 从七个列表首行点击“查看”进入详情，均显示返回列表和对应详情 Tab：库存 7 个 Tab、入库 5 个 Tab、出库 6 个 Tab、调拨 5 个 Tab、盘点 5 个 Tab、出库质检 8 个 Tab、库位 4 个 Tab。
- in-app browser 验证可见新增入口：库存调整、调拨新增、出库质检新增、仓库库位新增均可打开新增页；产品/来源选择弹窗可打开；提交后显示 mock 成功反馈。

差异记录：
- 仓储工作台“新增入库 / 新增出库 / 创建盘点”等快捷卡片当前本身不是路由点击入口；对应 `?action=new` 页面已在 `WarehouseResourcePage` 实现，但本轮不擅自改工作台快捷卡片行为，后续若要把快捷卡片接到新增页，需要单独修改工作台导航事件。

入口纠偏：
- 2026-05-28 根据用户要求核对仓储二级栏目浮窗与原 JSX `initialAction/actionMap`：入库管理从“新增入库 / 入库列表 / 入库明细 / 待入库来源 / 上架任务”改为“直接入库 / 全部入库单 / 待入库单 / 待入库明细”。
- 出库管理改为“直接出库 / 全部出库单 / 待出库单 / 待出库明细 / 待申请发货”；调拨管理改为“新增调拨 / 调拨列表 / 调拨明细表”；盘点管理改为“直接盘点 / 盘点计划 / 所有盘点单”。
- 出库质检浮窗按 `qc-list.jsx` 的 `qcOqc` 文案改为“新增出货质检 / 出货质检列表 / 出货质检详情”。库存管理 JSX 无独立 actionMap，现有“库存列表 / 库存明细 / 库存调整 / 库存流水”暂保留；仓库库位 JSX 仅明确列表与 `new` 新增弹窗，当前入口暂保留，待用户确认是否精简。
- 同步 `WarehouseResourcePage.vue`：`?action=直接入库 / 直接出库 / 新增调拨 / 直接盘点` 会进入对应新增/直接表单；`待入库单 / 待出库单 / 待申请发货` 在列表层做基础状态过滤。
- 验证：`vue3` 构建通过；代码检查确认导航配置已包含入库、出库、调拨、盘点、出货质检的 JSX 对齐入口。

新增页布局纠偏：
- 2026-05-28 根据用户指出“直接出库、直接入库、新增调拨”排版错乱，重新对照销售/采购已验收新增页母版，将三页基础信息区从自定义 `aw-card / warehouse-form-grid / aw-section-title` 改为统一 `aw-form-card / aw-detail-section-title / aw-form-grid / aw-field / aw-field-row` 结构。
- 直接入库按 `warehouse-inbound-list.jsx` 的 `DirectInboundView` 提取字段顺序与选项：入库主题、入库单号、入库类型、入库仓库、关联单据、入库部门、入库人员、入库日期、经办人；入库类型包含直接入库、采购入库、生产入库、销售退货入库、委外入库。
- 直接出库按 `warehouse-outbound-list.jsx` 的 `DirectOutboundView` 提取字段顺序与选项：出库主题、出库单号、出库类型、出库仓库、关联单据、出库部门、出库人员、出库日期、经办人；出库类型包含直接出库、内部领用、委外领料、销售出库、采购退货。
- 新增调拨按 `warehouse-transfer-list.jsx` 的 `TransferFormView` 提取字段顺序与选项：调拨主题、调拨单号、调拨日期、原仓库、目标仓库、经办人、调拨部门、调拨原因、调拨状态，并保留调拨提交后的冻结、在途、入库和差异审批说明。
- 偏差原因：上一版仓储新增页虽然复用了部分公共组件，但基础信息区使用了仓储页自定义的卡片、网格和标题 class，没有完全套用新增页母版的 DOM/class 契约；同时直接入库、直接出库、新增调拨只做了通用仓储表单字段，没有逐页按 JSX 的直接单据字段重排，导致母版 CSS 无法完整接管，视觉上出现间距、标题、字段排列与验收母版不一致。
- 验证：`vue3` 执行 `pnpm run build` 通过，仅保留 Vite chunk 体积警告；in-app browser 分别打开 `/warehouse/warehouse-inbounds?action=直接入库`、`/warehouse/warehouse-outbounds?action=直接出库`、`/warehouse/warehouse-transfers?action=新增调拨`，确认三页均为 4 个 `aw-form-card` 分段，基础信息字段按 JSX 顺序显示；人员选择器弹窗三页均可打开；来源与物品明细、附件、详情区保持新增页母版布局。
- 追加纠偏：按用户批注删除直接入库、直接出库、新增调拨“物品明细”段顶部多余的“选择来源 / 添加物品”按钮；三页明细段标题从通用“来源与物品明细”改回 JSX 的“物品明细”，仅保留表格下方母版新增明细入口。
- 验证：`vue3` 构建通过；in-app browser 逐页确认三页“物品明细”段不再包含“选择来源 / 添加物品”，按钮仅剩“添加明细”。
- 再次纠偏：直接入库“物品明细”不能使用通用 `AwEditableSubTable` 容器。已按 `warehouse-inbound-list.jsx` 改为卡片内普通横向 `aw-table`，删除通用合计条，恢复 JSX 长表字段：来源单据、来源明细、物品编码、物品名称、规格型号、单位、批次号、应入库数量、送检数量、合格数量、让步数量、不合格数量、入库数量、上架数量、入库库位、质检单号、质检/上架状态、库存质量、成本层、过账状态、生产日期、操作。
- 同步直接出库、新增调拨新增页明细段改为对应 JSX 普通横向表格，不再走通用“来源与物品明细”容器。
- 验证：`vue3` 构建通过；in-app browser 打开 `/warehouse/warehouse-inbounds?action=直接入库`，确认标题为“物品明细”，不存在“来源与物品明细 / 选择来源 / 添加物品 / aw-line-total”，表头与 JSX 入库明细顺序一致。
- 滚动面板修正：物品明细列较多，已将长表限制在卡片内 `.warehouse-table-scroll` 横向滚动面板，`aw-form-card` 不再被长表撑出页面。浏览器验证 `/warehouse/warehouse-inbounds?action=直接入库`：页面 `scrollWidth=1325` 等于视口宽度，页面不横向溢出；明细面板 `clientWidth=1018`、`scrollWidth=3402`，只在面板内横向滚动。
- 追加修正：前次滚动样式写在 `scoped` 中，但新增页明细表由嵌套 render component 生成，DOM 未带当前 SFC scope 标记，导致新增调拨页 `.warehouse-table-scroll` 实际计算为 `overflow-x: visible`。已将滚动约束改为 `:global(.warehouse-table-scroll / .warehouse-create-line-table / .warehouse-add-detail)` 命中。
- 复验 `/warehouse/warehouse-transfers?action=新增调拨`：页面 `documentScroll=1325`、`documentClient=1325`，不再横向溢出；物品明细卡片 `scrollWidth=1069` 等于卡片宽度；表格面板 `clientWidth=1033`、`scrollWidth=2963`、`overflowX=auto`，横向滚动只在面板内。
- 按母版容器再次纠偏：新增调拨物品明细改为 `AwEditableSubTable` 同款容器结构 `aw-doc-tbl-wrap > aw-doc-tbl-inner > aw-doc-tbl`，滚动条落在 `aw-doc-tbl-inner` 底部；按钮改回表格下方左侧 `+ 新增明细`。
- 按 `warehouse-transfer-list.jsx` 的 `TransferDetailTable` 补齐调拨新增明细列：来源明细、物品编码、物品名称、规格型号、类型、单位、批次、质量状态、成本层、当前库存、可调拨量、原冻结量、调拨冻结、在途数量、申请调拨、调出确认、调入确认、差异数量、原仓库、原库位、目标仓库、目标库位、备注、操作。
- 复验 `/warehouse/warehouse-transfers?action=new`：页面不横向溢出，卡片 `scrollWidth=1069`；`aw-doc-tbl-inner` 为实际横向滚动容器，`clientWidth=1031`、`scrollWidth=3523`、`overflowX=auto`；按钮可见为 `+ 新增明细`。
- 继续纠偏：新增调拨页逐项对照母版与 JSX，修正页面头从“工作台”变为“调拨管理”（侧栏匹配改为最长路由优先），工具栏从“重置 / 暂存 / 提交”改为“取消 / 暂存 / 提交调拨”，基础卡片标题从“新增调拨”改为“基础信息”。
- 调拨明细初始行改为 JSX 示例数据：`DB-20251221001-01 / 7820864 / 半成品物料 / 规格一` 与 `DB-20251221001-02 / 5786931 / 半成品物料 / 规格一`；可编辑列收窄为 `申请调拨 / 原仓库 / 原库位 / 目标仓库 / 目标库位 / 备注`，不再把批次、质量状态等展示字段做成输入框。
- 复验 `/warehouse/warehouse-transfers?action=new`：页面头为“调拨管理”；工具栏为“返回列表 / 取消 / 暂存 / 提交调拨”；卡片标题为“基础信息 / 物品明细 / 附件 / 详情”；表头顺序与 JSX 一致；首行数据为 `DB-20251221001-01 / 7820864 / 半成品物料 / 规格一`；页面无横向溢出，滚动容器 `aw-doc-tbl-inner` 为 `clientWidth=1031 / scrollWidth=2762 / overflowX=auto`。
- 基础信息/明细完整显示修正：撤销此前为长表误加到所有 `aw-form-card` 的 `overflow:hidden`，避免基础信息与物品明细被纵向裁切。复验 `/warehouse/warehouse-transfers?action=new`：基础信息 9 个 JSX 标签全部显示（调拨主题、调拨单号、调拨日期、原仓库、目标仓库、经办人、调拨部门、调拨原因、调拨状态）；基础卡片 `clientHeight=323 / scrollHeight=323`；物品明细卡片 `clientHeight=253 / scrollHeight=253`；`+ 新增明细` 在物品明细卡片内可见；页面无横向溢出。
- 选择物品弹窗纠偏：按交叉检查结论，仓储新增明细不应使用私有 `warehouse-modal`；已将 `ProductPickerModal` 改为采购产品选择弹窗母版结构：`aw-mask > aw-modal aw-warehouse-picker-modal > head / body / foot`，表格改为 `aw-doc-tbl-inner > table.aw-doc-tbl`，保留 `aw-picker-count`、行 `picked` 状态、底部“取消 / 确定”。
- 浏览器验证说明：Codex 浏览器批注层 `#codex-browser-sidebar-comments-root` 覆盖页面并拦截点击，自动点击无法触发页面按钮；已通过 DOM 结构检查确认弹窗代码不再含 `warehouse-modal`，构建通过。待用户侧关闭批注或直接点击后，可按 checklist 复验打开、选择、确定和回填。

仓储 action 列表/明细列表第一批纠偏：
- 2026-05-28 按用户要求先对仓储中心新增、列表、明细页做 JSX/Vue3 对比，确认当前主要问题是 `WarehouseResourcePage.vue` 将多个 JSX 独立 action 页退化为普通列表过滤。
- 本次先修列表与明细列表结构，不改新增页和详情页大结构：为 `待入库明细`、`待出库明细`、`待申请发货`、`调拨明细表`、`盘点计划`、`库存流水(tab=flow)`、`仓库维护(tab=warehouses)` 增加独立列表配置与示例数据，统一复用 `AwListPage + AwListToolbar + AwDataTable`。
- `调拨明细表` 按 `warehouse-transfer-list.jsx` 改为明细统计列：来源明细、物料名称、物料编码、批次、质量状态、单位、调拨数量、调拨冻结、在途数量、调入数量、原仓库、目标仓库、调拨日期；不再显示普通调拨列表的调拨主题、调拨单号、操作列。
- `待入库明细` 按 JSX 改为物料统计列：物料名称、物料编码、规格型号、单位、待入库数量、相关人员、说明；`待出库明细 / 待申请发货` 按 JSX 改为物料名称、物料编码、规格型号、单位、待出库数量、相关人员、说明，其中待申请发货说明为“订单流转策略为否，需要手动申请发货”。
- `盘点计划` 先按 JSX 计划字段落为列表母版：计划名称、盘点周期、计划负责人、盘点仓库、盘点范围、锁库策略、进度；后续若要完全还原 JSX 卡片 + 新建计划表单，需要单独作为新增/计划页修正。
- 验证：`vue3` 执行 `pnpm run build` 通过，仅保留 Vite chunk 体积警告。in-app browser 验证 `/warehouse/warehouse-transfers?action=调拨明细表`：表头为 JSX 明细表列，首行为 `DB-20251221001-01 / 半成品物料 / 7820864`，`aw-list-footer` 独立位于 `aw-doc-tbl-wrap` 后，顺序为 `aw-list-toolbar -> aw-doc-tbl-wrap -> aw-list-footer`。
- 抽查验证 `/warehouse/warehouse-outbounds?action=待出库明细`、`/warehouse/warehouse-outbounds?action=待申请发货`、`/warehouse/inventory-counts?action=盘点计划`、`/warehouse/inventory-stocks?tab=flow` 均显示专属列和独立底栏；`/warehouse/warehouse-inbounds?action=待入库明细` 重新取页面快照确认专属列已显示。

库存管理入口精简：
- 2026-05-28 按用户要求，仓储中心 `库存管理` 浮窗仅保留 `库存列表`，删除 `库存明细`、`库存调整`、`库存流水` 三个入口。
- 同步 Vue3 页面行为：库存列表工具栏不再显示 `库存调整` 新增按钮；`?action=adjust` 不再命中新建/调整页，`?tab=flow` 不再命中库存流水专属列表，均回落为库存列表。
- 验证：`vue3` 构建通过；浏览器打开 `/warehouse/inventory-stocks?action=adjust` 显示库存列表结构、分类树、搜索工具栏和库存表格，不再显示库存调整表单。

明细表滚动策略纠偏：
- 2026-05-28 按用户指出“不是所有明细列表都应强制滚动”，将仓储 action 明细列表拆分为两类：字段少、视口内能显示完整的统计表使用 `AwDataTable fitWidth` 自适应；字段多的长表继续使用母版横向滚动容器。
- `待入库明细`、`待出库明细`、`待申请发货`、`盘点计划` 已改为自适应宽度，不再出现多余横向滚动条；`调拨明细表` 与 `新增调拨` 的物品明细列数较多，保留表格容器内横向滚动，页面本身不横向溢出。
- 验证：`vue3` 构建通过；in-app browser 复验 `待入库明细`、`待出库明细`、`待申请发货`、`盘点计划` 的表格 `scrollWidth` 等于容器宽度；复验 `调拨明细表` 与 `新增调拨` 页面 `scrollWidth` 等于视口宽度，滚动只发生在表格内部容器。

### 2026-05-28 - 研发中心列表页阶段收口

阶段边界：
- 根据用户补充约束，本轮调整为先交付研发中心列表页；新增页、BOM 新增、选择器回填、保存/提交反馈暂不启用，待列表页验收后进入下一阶段。
- 详情页仅做只读盘点，不实现详情路由；列表“查看”入口仅提示本轮不实现详情页。
- 生产中心生产排班、日历排程、班次甘特图相关内容本轮未实现，仅记录为后续生产中心专项。

已完成：
- 新增 `vue3/src/app/api/rd/resources.ts`，将研发中心列表 mock、代替物料列表 mock、picker 预留数据、list/create 远程契约集中放到研发中心 API adapter/mock 中，组件内不散写大段业务数据。
- 新增 `vue3/src/views/rd/RdResourcePage.vue`，研发中心列表统一复用 `AwListPage`、`AwResourceTree`、`AwListToolbar`、`AwDataTable`；代替物料库纳入 `/rd/bom?tab=substitute` 列表。
- 路由从契约占位切到真实研发列表页：`/rd/doc`、`/rd/projects`、`/rd/products`、`/rd/materials`、`/rd/processes`、`/rd/crafts`、`/rd/bom`。
- 同步研发导航、契约清单、设置模板内部回跳，将项目/产品/物料/工序/工艺入口统一到复数路径；`?setting=` 设置入口仍进入 `OperationSettingPage`。
- 新增入口保持现有查询参数路由体系，但列表阶段只显示阶段提示：“新增页按阶段约束待列表页验收后执行；当前保留新增入口路由，不展示新增表单。”

构建结果：
- `vue3` 执行 `pnpm run build` 通过，仅保留 Vite chunk 体积警告。

浏览器逐页验收记录：
- `/rd/doc`：表头为 `序号 / 文档编号 / 文档名称 / 文档分类 / 状态 / 版本 / 负责人 / 更新日期 / 操作`；行数 6；首行 `DD-2024-001 / 智能控制器标准规范 / 工艺方案 / 已发布 / V1.0 / 傲为 / 2025-12-12`；新增按钮 `新增文档` 位于右侧工具栏；点击进入 `/rd/doc?action=new` 并显示阶段提示。
- `/rd/projects`：表头为 `序号 / 项目编号 / 项目名称 / 项目分类 / 状态 / 优先级 / 负责人 / 项目周期 / 进度 / 操作`；行数 4；首行 `PRJ-2025-001 / 智能输送线系统研发 / 研发项目 / 进行中 / 高 / 老夏 / 2025-03-01 ~ 2025-12-31 / 65%`；新增按钮 `新增项目` 位于右侧工具栏；点击进入 `/rd/projects?action=new` 并显示阶段提示。
- `/rd/products`：表头为 `序号 / 图片 / 产品名称 / 产品编号 / 产品型号 / 产品分类 / 标准单位 / 获取方式 / 产品状态 / 操作`；行数 4；首行 `智能温湿度传感器 / CP-20250101001 / IWS-TH200 / 成品 / 台 / 自制件 / 在售`；新增按钮 `新增产品` 位于右侧工具栏；点击进入 `/rd/products?action=new` 并显示阶段提示。
- `/rd/materials`：表头为 `序号 / 图片 / 物料名称 / 物料编码 / 物料规格 / 物料分类 / 标准单位 / 获取方式 / 物料状态 / 操作`；行数 4；首行 `STM32F407VGT6 微控制器 / MAT-2025-001 / LQFP-100 32位 / 电子物料 / 个 / 外购件 / 启用`；新增按钮 `新增物料` 位于右侧工具栏；点击进入 `/rd/materials?action=new` 并显示阶段提示。
- `/rd/processes`：表头为 `序号 / 工序编码 / 工序名称 / 工序分类 / 工作中心 / 核算方式 / 加工方式 / 质检方案 / 状态 / 操作`；行数 4；首行 `GX-20250101001 / 轴类零件车削加工 / 加工工序 / 加工中心A / 计时 / 自制工序 / ZJ-2025-001 / 启用`；新增按钮 `新增工序` 位于右侧工具栏；点击进入 `/rd/processes?action=new` 并显示阶段提示。
- `/rd/crafts`：表头为 `序号 / 工艺编码 / 工艺名称 / 适用产品 / 版本号 / 工艺分类 / 工序数 / 并序/委外 / 默认 / 状态 / 更新日期 / 操作`；行数 3；首行 `GY-202605-001 / 智能温控锅总装工艺 / 智能温控锅 AW-H8 / V1.2 / 电子装配 / 6 / 2 / 1 / 是 / 已生效 / 2026-05-19`；新增按钮 `新增工艺` 位于右侧工具栏；点击进入 `/rd/crafts?action=new` 并显示阶段提示。
- `/rd/bom`：表头为 `序号 / BOM编号 / BOM名称 / 适用产品 / 版本号 / BOM类型 / 物料数 / 层级 / 状态 / 负责人 / 更新日期 / 操作`；行数 3；首行 `BOM-202605-001 / 智能温控锅生产BOM / 智能温控锅 AW-H8 / V1.3 / 生产BOM / 18 / 3 / 已生效 / 老夏 / 2026-05-18`；新增按钮 `新增BOM` 位于右侧工具栏；点击进入 `/rd/bom?action=new` 并显示阶段提示。
- `/rd/bom?tab=substitute`：表头为 `序号 / 主物料 / 主物料编码 / 替代物料 / 替代物料编码 / 替代比例 / 优先级 / 生效日期 / 失效日期 / 状态 / 操作`；行数 2；首行 `外壳注塑件 / M-112 / 外壳注塑件 B 供方 / M-112-B / 1:1 / 2 / 2026-05-18 / 长期 / 启用`；新增按钮 `新增代替` 位于右侧工具栏；点击进入 `/rd/bom?tab=substitute&action=新增代替` 并显示阶段提示。

设置入口抽查：
- in-app browser 验证 `/rd/doc?setting=numbers`、`/rd/projects?setting=numbers`、`/rd/products?setting=numbers`、`/rd/materials?setting=numbers`、`/rd/processes?setting=numbers`、`/rd/crafts?setting=numbers`、`/rd/bom?setting=numbers` 均进入对应设置页，未破坏既有 `?setting=` 入口。

阶段外未执行项：
- 弹窗结构、选择后回填字段和值、保存/提交反馈文本属于新增页/BOM 新增阶段；按用户补充约束，本轮浏览器验收不执行这些交互。

### 2026-05-28 - 研发中心新增页阶段收口

已完成：
- 在 `vue3/src/views/rd/RdResourcePage.vue` 内补齐研发中心新增页分支，仍保持同一真实 Vue3 路由体系：`/rd/doc?action=new`、`/rd/projects?action=new`、`/rd/products?action=new`、`/rd/materials?action=new`、`/rd/processes?action=new`、`/rd/crafts?action=new`、`/rd/bom?action=new`、`/rd/bom?tab=substitute&action=新增代替`。
- 通用新增页外层统一复用 `AwFormPage`，分段使用 `aw-form-card / aw-detail-section-title / aw-form-grid / aw-field`，明细表复用 `AwEditableSubTable`，富文本复用 `AwRichTextEditor`。
- 弹窗均使用母版 DOM/class：`.aw-mask > .aw-modal > .head / .body / .foot`；本轮未修改公共组件，未影响销售/采购公共组件行为。
- `vue3/src/app/api/rd/resources.ts` 补齐 BOM 物料池、工序、属性配置、Excel 导入示例树、版本对比数据；保存/提交均调用 `createRdResource` 或 `createSubstitute` mock/API adapter，业务数据未散写到组件里。
- BOM 新增按 `bom-new-screen.jsx / bom-new.css` 的业务结构落地：基础信息、产品型号、汇总卡片、物料清单配置、层级表、适用型号、用量、损耗率、毛用量、替代料、关联工序、属性列、属性配置、Excel 导入、版本对比、预览、暂存和提交。

构建结果：
- `vue3` 执行 `pnpm run build` 通过，仅保留 Vite chunk 体积警告。

浏览器逐页验收记录：
- `/rd/doc?action=new`：字段为 `所属分类 / 文档编号 / 文档名称 / 版本 / 密级 / 负责人 / 签章策略 / 水印策略 / 外发策略 / 下载审批 / 授权对象 / 审批流程`；按钮为 `保存草稿 / 重置 / 提交审批`；负责人弹窗结构为 `.aw-mask/.aw-modal/.head/.body/.foot`，选择后回填 `负责人=老夏`；附件表头为 `序号 / 附件名称 / 附件类型 / 上传日期 / 备注 / 操作`，行数 `1 -> 2 -> 1`；反馈为 `文档库已保存草稿，已通过新增接口调用。`、`文档库已提交审批，已通过新增接口调用。`
- `/rd/projects?action=new`：字段为 `项目编号 / 项目名称 / 客户/来源 / 项目负责人 / 开始日期 / 计划结束 / 项目阶段 / 预算 / 项目目标`；按钮为 `保存草稿 / 重置 / 提交审批`；来源弹窗选择后回填 `客户/来源=海南微为智造温控锅订单`；成员表头为 `序号 / 姓名 / 角色 / 部门 / 操作`，行数 `1 -> 2 -> 1`；反馈为 `项目管理已保存草稿，已通过新增接口调用。`、`项目管理已提交审批，已通过新增接口调用。`
- `/rd/products?action=new`：字段为 `产品编号 / 产品名称 / 分类 / 规格型号 / 单位 / 版本 / 负责人 / 关联BOM入口`；按钮为 `保存草稿 / 重置 / 提交审批`；负责人弹窗选择后回填 `负责人=老夏`；规格表头为 `序号 / 型号 / 规格 / 启用 / 操作`，行数 `1 -> 2 -> 1`；反馈为 `产品管理已保存草稿，已通过新增接口调用。`、`产品管理已提交审批，已通过新增接口调用。`
- `/rd/materials?action=new`：字段为 `物料编码 / 物料名称 / 分类 / 规格 / 单位 / 属性 / 默认仓库 / 默认供应商`；按钮为 `保存草稿 / 重置 / 提交审批`；供应商弹窗选择后回填 `默认供应商=深圳华强电子`；替代料关系表头为 `序号 / 替代料编码 / 替代料名称 / 替代比例 / 优先级 / 操作`，行数 `1 -> 2 -> 1`；反馈为 `物料管理已保存草稿，已通过新增接口调用。`、`物料管理已提交审批，已通过新增接口调用。`
- `/rd/processes?action=new`：字段为 `工序编码 / 工序名称 / 所属工艺/产品 / 工序分类 / 标准工时(分钟) / 设备要求 / 人员要求 / 质检要求`；按钮为 `保存草稿 / 重置 / 保存`；产品弹窗选择后回填 `所属工艺/产品=iPhone17`；技术参数表头为 `序号 / 参数名 / 参数值 / 操作`，行数 `1 -> 2 -> 1`；反馈为 `工序管理已保存草稿，已通过新增接口调用。`、主按钮反馈 `工序管理已保存，已通过新增接口调用。`
- `/rd/crafts?action=new`：字段为 `工艺编码 / 工艺名称 / 适用产品 / 版本 / 负责人 / 审核/发布状态`；按钮为 `保存草稿 / 重置 / 提交审批`；产品弹窗选择后回填 `适用产品=iPhone17`；工序路线表头为 `序号 / 工序编码 / 工序名称 / 节点类型 / 执行方式 / 标准工时 / 质检点 / 操作`，行数 `1 -> 2 -> 1`；反馈为 `工艺管理已保存草稿，已通过新增接口调用。`、`工艺管理已提交审批，已通过新增接口调用。`
- `/rd/bom?tab=substitute&action=新增代替`：字段为 `主物料 / 主物料编码 / 替代物料 / 替代物料编码 / 替代比例 / 优先级 / 生效日期 / 失效日期 / 状态`；按钮为 `保存草稿 / 重置 / 提交审批`；物料弹窗选择后回填 `主物料=智能温控锅总成`、编码同步回填；反馈为 `代替物料已保存，已通过新增接口调用。`、`代替物料已提交审批，已通过新增接口调用。`
- `/rd/bom?action=new`：基础字段为 `BOM编号 / BOM名称 / 适用产品 / 版本号 / BOM类型 / 编制人 / 生效日期 / 审批流程`；按钮为 `暂存草稿 / 导入 / 版本对比 / 预览 / 提交审批`；产品选择弹窗结构正确，选择后回填 `适用产品=iPhone17`。
- BOM 物料清单弹窗结构正确，表头为 `选择 / 行号 / 物料 / 适用型号 / 用量 / 单位 / 物料类型 / 替代料 / 损耗% / 毛用量 / 关联工序 / 单价 / 小计 / 材质 / 长度 / 重量 / 工时 / 操作`；Excel 导入示例后行数 5，点击根物料“子项”后行数 6，删除新增子项后回到 5；修改首行用量为 2、损耗为 5 后毛用量显示 2.100；折叠根节点行数 `5 -> 1`，展开回 `1 -> 5`；物料选择弹窗叠加结构正确，确认后关闭到结构弹窗。
- BOM 预览弹窗结构正确，展示 `iPhone17 量产BOM / 物料数 4 / 层级数 3 / 单件成本 ¥109.38`；版本对比弹窗结构正确，左右两张对比表；暂存反馈为 `BOM管理已保存草稿，已通过新增接口调用。`，提交反馈为 `BOM管理已提交审批，已通过新增接口调用。`

### 2026-05-28 - 生产中心列表页阶段收口

阶段边界：
- 根据用户补充约束，本轮先交付生产中心列表页；新增页的弹窗、选择回填、子表增删、保存/提交反馈等待列表页验收后进入下一阶段。
- 详情页仅做只读盘点，不实现详情路由；列表“查看”入口只触发列表页提示，不进入详情页。
- 生产排班、日历排程、班次甘特图相关内容本轮未实现，仅记录为后续生产排班专项。

已完成：
- 新增 `vue3/src/app/api/production/types.ts`、`vue3/src/app/api/production/resources.ts`、`vue3/src/mock/production/records.json`、`vue3/src/mock/production/pickers.json`，生产中心 list/create/action/picker mock 与远程 GET/POST 契约集中在生产 API adapter/mock 中，组件内不散写大段业务数据。
- 新增 `vue3/src/views/production/ProductionResourcePage.vue`，五个生产列表统一复用 `AwListPage`、`AwResourceTree`、`AwListToolbar`、`AwDataTable`；列表底部批量操作和分页保持在表格下方独立容器。
- 路由切换到真实 Vue3 页面：`/production/production-demands`、`/production/production-plans`、`/production/production-orders`、`/production/production-work-orders`、`/production/outsource-orders`；`?setting=` 仍进入 `OperationSettingPage`。
- 列表“查看”只写入提示：详情页本轮只读盘点，列表查看入口不进入详情实现；浏览器验证点击后 URL 保持当前列表页。
- 委外加工列表去除重复“加工商”列，仅保留 `supplierName` 对应的加工商列。
- 未修改公共组件；`vue3/src/app/api/rd/resources.ts` 仅为解除构建期类型/资源阻断做小修，不涉及公共组件和页面交互。

构建结果：
- `vue3` 执行 `pnpm run build` 通过，仅保留 Vite chunk 体积警告。

浏览器逐页验收记录：
- `/production/production-demands`：表头为 `序号 / 需求主题 / 需求编号 / 来源单据 / 产品概要 / 需求数量 / 开始日期 / 交付日期 / 负责人 / 齐套状态 / 需求状态 / 操作`；行数 3；首行 `销售订单生产需求 / MR-20260517001 / SO-20260517001 / 智能温控终端 / 120 / 2026-05-17 / 2026-05-30 / 老夏 / - / 待确认`；新增按钮 `新增生产需求` 位于列表工具栏；点击进入 `/production/production-demands?action=new`，路由体系保持查询参数入口；点击“查看”后仍在 `/production/production-demands`。
- `/production/production-plans`：表头为 `序号 / 计划主题 / 计划编号 / 来源单据 / 产品概要 / 计划数量 / 进度 / 开始日期 / 交付日期 / 负责人 / 齐套状态 / 计划状态 / 操作`；行数 2；首行 `6月温控终端生产计划 / MP-20260517001 / MR-20260517001 / 智能温控终端 / 120 / 60% / 2026-05-18 / 2026-06-05 / 计划员王敏 / 齐套 / 待审批`；新增按钮 `新增生产计划` 位于列表工具栏；点击进入 `/production/production-plans?action=new`；点击“查看”后仍在 `/production/production-plans`。
- `/production/production-orders`：表头为 `序号 / 生产主题 / 生产编号 / 来源单据 / 产品概要 / 生产数量 / 开始日期 / 交付日期 / BOM版本 / 工艺路线 / 责任部门 / 齐套状态 / 生产状态 / 操作`；行数 2；首行 `202604智能温控终端生产205 / MO-20260517001 / MP-20260517001 / 智能温控终端 / 120 / 2026-05-18 / 2026-06-03 / BOM-V3.2 / RT-总装-01 / 生产一部 / 齐套 / 生产中`；新增按钮 `新增生产订单` 位于列表工具栏；点击进入 `/production/production-orders?action=new`；点击“查看”后仍在 `/production/production-orders`。
- `/production/production-work-orders`：表头为 `序号 / 工单主题 / 工单编号 / 来源单据 / 产品概要 / 计划数量 / 开始日期 / 交付日期 / 工厂车间 / 产线 / BOM版本 / 工艺路线 / 负责人 / 齐套状态 / 工单状态 / 操作`；行数 2；首行 `总装工序生产工单 / WO-20260517001 / MO-20260517001 / 智能温控终端 / 120 / 2026-05-19 / 2026-05-26 / 总装车间 / 总装产线A / BOM-V3.2 / RT-总装-01 / 三红 / - / 生产中`；新增按钮 `新增生产工单` 位于列表工具栏；点击进入 `/production/production-work-orders?action=new`；点击“查看”后仍在 `/production/production-work-orders`。
- `/production/outsource-orders`：表头为 `序号 / 委外主题 / 委外编号 / 来源单据 / 产品概要 / 委外数量 / 开始日期 / 交付日期 / 加工商 / 齐套状态 / 委外状态 / 操作`；行数 2；首行 `外壳表面处理委外加工 / OS-20260517001 / MO-20260517001 / 铝合金外壳 / 260 / 2026-05-20 / 2026-05-28 / 深圳协同加工厂 / - / 待发料`；新增按钮 `新增委外加工` 位于列表工具栏；点击进入 `/production/outsource-orders?action=new`；点击“查看”后仍在 `/production/outsource-orders`。

设置入口验证：
- in-app browser 验证 `/production/production-demands?setting=fields`、`/production/production-plans?setting=fields`、`/production/production-orders?setting=fields`、`/production/production-work-orders?setting=fields`、`/production/outsource-orders?setting=fields` 均进入对应设置页，未破坏既有 `?setting=` 入口。

详情页只读盘点：
- 原 `manufacturing-list.jsx` 中详情视图为 `MfgDetailView`，列表查看/主题点击进入详情视图；当前 Vue3 没有生产详情路由、详情组件和 detail mock，列表“查看”已按本轮要求只做动作提示。
- 生产需求详情：入口来自生产需求列表“查看/主题”；标题应为需求单号加主题；基础字段覆盖需求主题、需求编号、来源单据、产品、数量、负责人、日期、备注/附件；子表为产品明细和操作记录；需要接口 `detail/update/confirm/generate-plan/generate-order/print/export`。
- 生产计划详情：入口来自生产计划列表“查看”；基础字段覆盖计划主题、计划编号、来源需求、计划周期、产品明细、计划数量、生产线/车间、负责人、排产策略；子表/页签包含产品明细、来源记录、齐套预估、排产记录、操作记录；需要接口 `detail/update/approve/check-kitting/generate-order/print/export`。
- 生产订单详情：入口来自生产订单列表“查看”；基础字段覆盖生产主题、生产编号、来源计划/需求、生产数量、开完工日期、车间、负责人、BOM版本、工艺路线；子表/页签包含工单明细、来源记录、版本锁定、齐套检查、工序进度、领退料、入库、质检、操作记录；需要接口 `detail/update/submit/approve/release-work-orders/close/print/export`。
- 生产工单详情：入口来自生产工单列表“查看”；基础字段覆盖订单来源、产品、工序/工艺路线、人员/班组、设备、计划工时、报工方式；子表/页签包含工艺流程、领工派工、领料、报工、质检、退料、入库、操作记录；需要接口 `detail/update/claim/dispatch/report/print/export`。
- 委外加工详情：入口来自委外列表“查看”；基础字段覆盖委外来源、供应商、外协物料/工序、委外数量、交期、价格/定价来源、收货/质检要求；子表/页签包含委外明细、委外发料、委外收货、质检、入库、操作记录；需要接口 `detail/update/submit/approve/issue-materials/receive/close/print/export`。

阶段外未执行项：
- 弹窗结构、选择后回填字段和值、子表增删和数量/金额变化、保存/提交反馈文本属于生产新增页阶段；按用户补充约束，本轮浏览器验收不执行这些交互。

导航纠偏：
- 2026-05-28 用户指出生产中心左侧二级导航浮窗被擅自增加四级链接。已确认根因是把 `manufacturing-list.jsx` 中的详情 tab、行操作和 action 视图误当成左侧浮窗入口。
- 已收敛 `vue3/src/layouts/erp-shell/navigation.ts` 的生产中心浮窗：生产需求、生产计划、生产订单、生产工单、委外加工只保留“新增 + 列表 + 设置”入口；删除详情、转生产计划、转生产订单、齐套检查、BOM/工艺锁版、领退料、派工、报工、质检、发料、收货等阶段外入口。
- 生产排班本轮不实现，已移除其浮窗动作入口，仅保留左侧二级项本身，不提供排班日历、班组维护、冲突校验等四级链接。
- 静态检查确认生产导航配置中不再存在 `production-*/?id=`、生产转单 action、生产 `?tab=`、工单派工/报工 action、排班查询 action、委外发料/收货/质检 tab 等阶段外浮窗链接。
- 复跑 `pnpm run build` 通过，仅保留 Vite chunk 体积警告。

列表页自作主张问题记录：
- 2026-05-28 用户要求记录问题：后续遇到不清楚、原 JSX 与母版或当前阶段边界冲突时，必须先问用户确认，不允许自行扩展入口、动作页或列表操作。
- 本次错误点：生产中心列表页本应按 `manufacturing-list.jsx` 的列表行操作只保留“查看”，但我擅自增加了确认、转计划、转订单、齐套检查、审批、拆工单、领工、派工、报工、发料、收货等列表行操作，并额外做了通用 action 页。
- 已删除 `ProductionResourcePage.vue` 中生产列表的 `rowActions` 配置、列表行额外动作按钮、`runProductionAction` 列表调用、`ProductionActionPanel` 通用动作页和 `actionLabel` 自定义动作映射。
- 非 `?action=new` 的查询参数不再进入生产通用动作页；当前生产列表阶段只保留列表视图，`?setting=` 继续进入设置页，`?action=new` 保持新增入口。
- 底部批量区从“批量提交 / 批量导出”改回通用“批量操作”，避免擅自引入未确认的业务批量动作。
- 浏览器复查 5 个生产列表：`/production/production-demands`、`/production/production-plans`、`/production/production-orders`、`/production/production-work-orders`、`/production/outsource-orders` 首行操作列均只剩“查看”；底部均为“共 N 条 / 已选 0 条 / 批量操作 / 分页”。
- 类型检查 `vue-tsc --noEmit` 通过；复跑 `pnpm run build` 通过，仅保留 Vite chunk 体积警告。

操作列样式纠偏：
- 2026-05-28 用户指出生产列表“查看”不应做成按钮，必须与销售/采购母版一致：鼠标悬停为蓝色文本链接并带下划线。
- 已按交叉验证结论修正 `ProductionResourcePage.vue`：操作列从 `button.aw-text-action` 改为 `span.aw-link`，删除遗留 `production-actions` 和 `production-action-table` 私有样式。
- 全局补齐 `.aw-link:hover { text-decoration: underline; }`，使生产、销售、采购、仓储、研发所有 `.aw-link` hover 行为统一。
- 只读智能体交叉验证确认销售/采购母版操作列均为 `span.aw-link`；静态检查确认生产中心操作列不再存在 `button`、`aw-text-action` 或私有 action 样式。
- 浏览器运行态抽查生产 5 个列表、销售客户列表、采购请购列表：操作列 DOM 均为 `SPAN.aw-link`，文本为“查看”，颜色为 `rgb(86, 119, 252)`；构建 `pnpm run build` 通过，仅保留 Vite chunk 体积警告。

### 2026-05-28 - 生产中心新增页字段与交互纠偏

阶段边界：
- 按用户确认“严格按 JSX 并回填”，生产新增页以 `manufacturing-list.jsx` 的 `MfgFormView` 为字段和交互依据；不再沿用一套通用生产表单自由发挥。
- 详情页仍只做只读盘点，不实现详情路由；生产排班、日历排程、班次甘特图本轮不实现。

已完成：
- `ProductionResourcePage.vue` 中生产新增页按 5 个模块拆回 JSX 差异：生产需求无独立来源弹窗，产品明细行保留来源类型；生产计划/生产订单/委外加工在主题旁选择来源并回填；生产工单改为“选择产品”后带出工艺流程；委外加工补“选择委外范围”弹窗，确认后回填整单委外/工序委外明细。
- 子表列按 JSX 拆分：需求明细、计划明细、订单工单明细、工单工艺流程、委外明细分别独立列；删除一套通用列套 5 页的做法。
- 弹窗均使用 `.aw-mask / .aw-modal / .head / .body / .foot`，删除私有 `aw-production-picker-modal`。
- 委外供应商选择不再写入负责人，避免“供应商/加工商/负责人”混用。
- `AwEditableSubTable` 仅新增 `showAdd` 可选开关，默认值为 `true`，销售/采购原有新增明细按钮不受影响；生产工单/委外按 JSX 隐藏不该出现的新增按钮。
- 生产 API/mock 仍集中在 `vue3/src/app/api/production/resources.ts` 与 `vue3/src/mock/production/pickers.json`，未把业务数据散写到组件外的新位置。
- 公共组件回归：浏览器验证 `/sales/sales-orders?action=new` 仍显示 `新增明细`，销售订单明细表头不变；`/purchase/suppliers?action=new` 仍显示 `新增供应产品`，供应产品表头不变。

构建结果：
- `vue-tsc --noEmit` 通过。
- `vite build` 通过，仅保留 Vite chunk 体积警告。

### 2026-05-29 - 生产需求补回生产需求汇总入口与页面

用户指出：
- 生产需求二级导航浮窗中缺少 JSX 的 `生产需求汇总` 页面。

依据与差异：
- `manufacturing-list.jsx` 中 `生产需求汇总` 与 `生产需求详情` 均进入 `MfgDemandDetailView`。
- JSX 汇总页按产品聚合，字段包含：`产品编号 / 产品名称 / 规格型号 / 单位 / 需求来源数 / 需求数量 / 已生产 / 还需生产 / 交付日期 / 状态 / 操作`；点击 `查看` 后进入该产品的需求来源明细。
- Vue 当前生产需求仍复用通用 `productionListOnlyFlyout`，只有 `新增生产需求 / 生产需求列表 / 需求设置`，缺少汇总入口和页面。

已完成：
- 仅修改 Vue3 工程文件，未修改静态 JSX/HTML。
- `vue3/src/layouts/erp-shell/navigation.ts` 新增生产需求专用 flyout，补回 `生产需求汇总`，并继续保留原有 `?setting=` 设置入口。
- `vue3/src/mock/production/demand-summary.json` 新增生产需求汇总 mock 数据。
- `vue3/src/app/api/production/resources.ts` 新增 `listProductionDemandSummary`，remote 契约预留 `GET /production-demands/summary`。
- `vue3/src/views/production/ProductionResourcePage.vue` 新增 `/production/production-demands?action=生产需求汇总` 页面，并补齐产品汇总列表和来源明细查看。

浏览器复验记录：
- URL：`/production/production-demands?action=生产需求汇总`。
- 页面标题：`生产需求`；区块标题：`生产需求汇总`。
- 工具栏：`刷新数据 / 筛选 / 字段配置 / 导出`，不显示新增按钮。
- 表头：`序号 / 产品编号 / 产品名称 / 规格型号 / 单位 / 需求来源数 / 需求数量 / 已生产 / 还需生产 / 交付日期 / 状态 / 操作`。
- 行数：4。
- 首行：`CP-2025010101 / 智能温控终端 / PRO / 台 / 2 / 120 / 80 / 40 / 2026-05-30 / 生产中 / 查看`。
- 底部分页/批量操作仍在表格下方独立容器：`共 4 条 / 已选 0 条 / 批量操作 / 上一页 1 2 3 下一页`。
- 点击 `查看` 后进入来源明细：
  - 返回按钮：`返回汇总列表`。
  - 标题：`智能温控终端 需求数量与来源列表`。
  - 基础字段：`产品编号 / 产品名称 / 规格型号 / 单位 / 需求数量 / 已生产数量 / 还需生产数量 / 交付日期 / 需求状态`。
  - 来源明细表头：`序号 / 来源单据 / 来源类型 / 来源对象 / 来源明细 / 需求数量 / 已生产 / 还需生产 / 交付日期 / 状态`。
  - 来源明细行数：2；首行：`SO-20260517001 / 销售订单 / 海南微为智造产业有限公司 / SO-20260517001-01 / 80 / 60 / 20 / 2026-05-30 / 生产中`。

构建结果：
- `vue-tsc --noEmit` 通过。
- `vite build` 通过，仅保留 Vite chunk 体积警告。

### 2026-05-29 - 生产工单补回报工管理入口与页面

用户指出：
- 生产工单二级导航浮窗缺失 JSX 中的 `报工管理` 分组：`领工派工 / 任务报工 / 报工记录`。

问题原因：
- Vue 导航里生产工单错误复用了通用 `productionListOnlyFlyout`，只保留 `新增生产工单 / 生产工单列表 / 设置`，没有按 `manufacturing-list.jsx` 的生产工单专用动作补齐报工管理。

已完成：
- 仅修改 Vue3 工程文件，未改静态 JSX/HTML。
- `vue3/src/layouts/erp-shell/navigation.ts` 新增生产工单专用 flyout：
  - `生产工单`：`新增生产工单 / 生产工单列表`
  - `报工管理`：`领工派工 / 任务报工 / 报工记录`
  - `生产工单设置`：沿用现有 `?setting=` 入口
- `vue3/src/mock/production/work-order-reporting.json` 新增生产工单报工管理 mock 数据。
- `vue3/src/app/api/production/resources.ts` 新增报工管理 adapter/mock：
  - `listWorkOrderClaimTasks`
  - `listWorkOrderAssignedTasks`
  - `listWorkOrderReportRecords`
  - `listWorkOrderReportPeople`
  - `getWorkOrderDispatchDetail`
  - `getWorkOrderReportDetail`
  - `createWorkOrderClaim`
  - `createWorkOrderReport`
- `vue3/src/views/production/ProductionResourcePage.vue` 补齐三个页面：
  - `/production/production-work-orders?action=领工派工`
  - `/production/production-work-orders?action=任务报工`
  - `/production/production-work-orders?action=报工记录`
- 弹窗继续使用 `.aw-mask / .aw-modal / .head / .body / .foot` 结构，未新增私有 `production-modal`。

浏览器复验记录：
- URL：`/production/production-work-orders?action=领工派工`
  - 标题：`领工派工(999)`。
  - Tab：`领工任务池 / 派工列表`。
  - 领工任务池表头：`序号 / 工单编号 / 产品名称 / 工序名称 / 计划数量 / 已领数量 / 可领数量 / 工位/产线 / 计划开工 / 任务状态 / 操作`。
  - 行数 3；首行：`WO-20260517001 / 智能温控终端 / 总装 / 120 / 40 / 80 / 总装工位01 / 2026-05-19 / 可领取 / 领工/查看`。
  - 点击 `领工` 打开 `领取工序任务` 弹窗，结构为 `.aw-mask / .aw-modal / .head / .body / .foot`，footer 为 `取消 / 确认领工`。
  - 点击 `确认领工` 后反馈：`确认领工已通过 mock 接口提交，并回填派工列表。`，派工列表首行回填 `当前用户 / 80 / 待报工 / 报工/查看`。
- URL：`/production/production-work-orders?action=任务报工`
  - 顶部按钮：`关闭 / 暂存 / 确定`。
  - 区块：`报工信息 / 本工单进度 / 报工说明`。
  - 字段：`生产工单 / 报工来源 / 报工工序 / 报工人 / 报工数量 / 合格数量 / 不良数量 / 工位/产线 / 报工时间`。
  - 进度表头：`序号 / 产品 / 工序 / 来源方式 / 责任人员 / 计划数量 / 已领/已派 / 已报工 / 本次报工 / 累计完成 / 剩余可报 / 状态`。
  - 点击 `确定` 后反馈：`报工提交成功，已通过 mock 接口生成待质检记录。`
- URL：`/production/production-work-orders?action=报工记录`
  - 标题：`报工记录(999)`。
  - Tab：`我的报工 / 管理员视图`。
  - 表头：`序号 / 工单编号 / 产品名称 / 工序名称 / 生产部门 / 报工人 / 报工来源 / 计划数量 / 可报数量 / 累计报工 / 合格 / 不良 / 报工次数 / 最后报工时间 / 状态 / 操作`。
  - 我的报工行数 2；首行：`WO-20260517001 / 智能温控终端 / 总装 / 生产一部 / 三红 / 领工派工 / 120 / 80 / 80 / 78 / 2 / 3 / 2026-05-18 17:10 / 待质检 / 查看`。
  - 点击 `查看` 打开 `工序报工明细` 弹窗，结构为 `.aw-mask / .aw-modal.lg / .head / .body / .foot`，报工明细行数 3。
  - 管理员视图点击 `选择人员` 打开通用结构弹窗，表头：`选择 / 姓名 / 工号 / 部门 / 产线/班组 / 岗位`，当前分组行数 2。
- 二级浮窗源代码复核：生产工单 flyout 已包含 `报工管理` 分组和三项入口；浏览器自动化未能可靠触发 sidebar hover 事件，已通过直接页面 URL 验证三个入口页面。

构建结果：
- `vue-tsc --noEmit` 通过。
- `vite build` 通过，仅保留 Vite chunk 体积警告。

浏览器新增页验收记录：
- `/production/production-demands?action=new`：字段为 `需求主题 / 需求编号 / 需求状态 / 生产部门 / 负责人 / 计划开始日期 / 计划完成日期 / 优先级`；表头为 `序号 / 来源类型 / 来源单据 / 来源明细 / 产品编号 / 产品名称 / 规格型号 / 单位 / 需求数量 / 需求日期 / 交付日期 / 备注 / 操作`；初始行数 0；产品弹窗结构为 `.aw-mask > .aw-modal.lg > .head/.body/.foot`，选择产品后首行回填 `手动需求 / 手动创建 / 手动明细 / CP-2025010101 / 智能温控终端 / PRO / 台 / 120 / 2026-05-17 / 2026-05-30`；修改需求数量 `120 -> 150` 后合计 `120 -> 150`；提交反馈 `生产需求已通过 create API 提交`，草稿反馈 `生产需求草稿已通过 create API 保存`。
- `/production/production-plans?action=new`：字段为 `计划主题 / 计划编号 / 生产来源 / 来源主体 / 来源交付日期 / 生产部门 / 负责人 / 计划开始日期 / 计划完成日期 / 优先级`；来源弹窗标题 `选择生产计划来源`，结构为母版弹窗；确认后首行回填 `销售订单 / SO-20260517001 / SO-20260517001-01 / CP-2025010101 / 智能温控终端 / 需求数量120 / 计划数量120`；修改计划数量 `120 -> 150` 后合计 `240 -> 270`；提交反馈 `生产计划已通过 create API 提交`，草稿反馈 `生产计划草稿已通过 create API 保存`。
- `/production/production-orders?action=new`：字段为 `生产主题 / 生产编号 / 生产来源 / 来源主体 / 来源交付日期 / 生产状态 / 生产部门 / 负责人 / 计划开始日期 / 计划完成日期 / 优先级 / 生产产品 / 生产数量`；来源弹窗标题 `选择生产订单来源`；工单明细表头为 `序号 / 工单编号 / 工单类型 / 工单名称 / 半成品/成品 / 工序 / 工位/产线 / 计划数量 / 已完成 / 合格 / 不良 / 负责人 / 质检节点 / 状态 / 操作`；来源回填后首行 `WO-51700101-01 / 半成品工单 / 智能温控终端半成品制备工单 / 备料/预装 / 预装工位01 / 120 / 三红 / IPQC巡检 / 待开工 / 查看`；提交反馈 `生产订单已通过 create API 提交`，草稿反馈 `生产订单草稿已通过 create API 保存`。
- `/production/production-work-orders?action=new`：字段为 `工单主题 / 工单编号 / 生产部门 / 负责人 / 计划开始日期 / 计划完成日期 / 优先级 / 选择产品`；无订单来源弹窗；产品弹窗确认后回填工艺流程，表头为 `序号 / 工序号 / 工序名称 / 工序类型 / 工位/产线 / 计划数量 / 作业标准 / 计划开工 / 计划完工 / 操作`；首行 `10 / 备料 / 准备工序 / 线边仓 / 120 / 按BOM齐套领料 / 2026-05-18 / 2026-05-18 / 领工模式`；修改首行计划数量 `120 -> 150` 后合计 `480 -> 510`；提交反馈 `生产工单已通过 create API 提交`，草稿反馈 `生产工单草稿已通过 create API 保存`。
- `/production/outsource-orders?action=new`：字段为 `委外主题 / 委外编号 / 来源主体 / 来源交付日期 / 优先级 / 委外方式 / 委外加工商 / 发料方式`；来源弹窗标题 `选择委外加工来源`；确认来源后弹出 `选择委外范围`，表头为 `选择 / 序号 / 子件/工序编号 / 子件/工序名称 / 类型 / 工位/产线 / 数量 / 作业说明 / 负责人 / 状态`；确认整单委外后首行回填 `MO-20260517001 / CP-2025010101 / 智能温控终端 / PRO / BOM-V3.2 / 待锁版 / RT-总装-01 / 待锁版 / 源单需求120 / 委外数量120 / 台 / 计划交付2026-06-03 / 整单委外加工`；供应商弹窗标题 `选择委外加工商`，确认后回填供应商并同步定价来源；修改委外数量 `120 -> 130` 后合计 `120 -> 130`；提交反馈 `委外加工已通过 create API 提交`，草稿反馈 `委外加工草稿已通过 create API 保存`。

交叉验证与纠偏记录：
- 已按只读智能体交叉验证结论删除“预测/手工需求”自加来源，生产需求严格回到 JSX 的普通主题输入 + 产品明细行来源。
- 已删除生产工单“订单来源选择”的自补逻辑，严格改为产品选择带工艺流程。
- 静态检查确认不再存在 `aw-production-picker-modal`、`production-modal`、生产新增页 `预测`、`手工需求` 残留。

### 2026-05-29 - 生产中心列表页改为无左侧分类母版

用户要求：
- 生产中心所有列表页先改为没有左侧分类的母版或组件；本轮只处理列表页。

已完成：
- `ProductionResourcePage.vue` 列表态不再给 `AwListPage` 传 `#tree` 插槽，因此运行态使用 `aw-list-layout aw-list-layout-no-tree`。
- 删除生产列表页的 `AwResourceTree` 引用、`pickedGroup`、`treeNodes`、`groupMatch` 和分类树过滤逻辑。
- 删除未使用的 `treeTitle/groups` 配置，避免后续误把生产列表恢复成左侧分类树。
- 列表筛选仅保留全局搜索和表格状态列筛选；未改公共组件，未影响销售/采购/仓储/研发的带树列表母版。
- 保持已有路由体系：`?setting=` 继续进入设置页，`?action=new` 继续进入新增页。

静态交叉验证：
- 只读智能体交叉检查确认 5 个生产列表共用 `ProductionResourcePage.vue`，不再存在实际 `tree` slot / `AwResourceTree` 使用；`AwListPage` 无 `tree` slot 时走 `aw-list-layout-no-tree`。
- 本地静态搜索确认 `ProductionResourcePage.vue` 中无 `<template #tree`、`AwResourceTree`、`pickedGroup`、`treeNodes`、`groupMatch`、`treeTitle`、`groups` 残留。

浏览器逐页验收记录：
- `/production/production-demands`：DOM 为 `aw-list-layout aw-list-layout-no-tree`；无 `.aw-doc-tree`；表头为 `序号 / 需求主题 / 需求编号 / 来源单据 / 产品概要 / 需求数量 / 开始日期 / 交付日期 / 负责人 / 齐套状态 / 需求状态 / 操作`；行数 3；首行 `销售订单生产需求 / MR-20260517001 / SO-20260517001 / 智能温控终端 / 120 / 2026-05-17 / 2026-05-30 / 老夏 / - / 待确认 / 查看`；新增按钮 `新增生产需求`；操作列为文本链接 `查看`，不是按钮；底部分页/批量操作位于表格下方独立区域。
- `/production/production-plans`：DOM 为 `aw-list-layout aw-list-layout-no-tree`；无 `.aw-doc-tree`；表头为 `序号 / 计划主题 / 计划编号 / 来源单据 / 产品概要 / 计划数量 / 进度 / 开始日期 / 交付日期 / 负责人 / 齐套状态 / 计划状态 / 操作`；行数 2；首行 `6月温控终端生产计划 / MP-20260517001 / MR-20260517001 / 智能温控终端 / 120 / 60% / 2026-05-18 / 2026-06-05 / 计划员王敏 / 齐套 / 待审批 / 查看`；新增按钮 `新增生产计划`；操作列为文本链接 `查看`；底部区域独立。
- `/production/production-orders`：DOM 为 `aw-list-layout aw-list-layout-no-tree`；无 `.aw-doc-tree`；表头为 `序号 / 生产主题 / 生产编号 / 来源单据 / 产品概要 / 生产数量 / 开始日期 / 交付日期 / BOM版本 / 工艺路线 / 责任部门 / 齐套状态 / 生产状态 / 操作`；行数 2；首行 `202604智能温控终端生产205 / MO-20260517001 / MP-20260517001 / 智能温控终端 / 120 / 2026-05-18 / 2026-06-03 / BOM-V3.2 / RT-总装-01 / 生产一部 / 齐套 / 生产中 / 查看`；新增按钮 `新增生产订单`；操作列为文本链接 `查看`；底部区域独立。
- `/production/production-work-orders`：DOM 为 `aw-list-layout aw-list-layout-no-tree`；无 `.aw-doc-tree`；表头为 `序号 / 工单主题 / 工单编号 / 来源单据 / 产品概要 / 计划数量 / 开始日期 / 交付日期 / 工厂车间 / 产线 / BOM版本 / 工艺路线 / 负责人 / 齐套状态 / 工单状态 / 操作`；行数 2；首行 `总装工序生产工单 / WO-20260517001 / MO-20260517001 / 智能温控终端 / 120 / 2026-05-19 / 2026-05-26 / 总装车间 / 总装产线A / BOM-V3.2 / RT-总装-01 / 三红 / - / 生产中 / 查看`；新增按钮 `新增生产工单`；操作列为文本链接 `查看`；底部区域独立。
- `/production/outsource-orders`：DOM 为 `aw-list-layout aw-list-layout-no-tree`；无 `.aw-doc-tree`；表头为 `序号 / 委外主题 / 委外编号 / 来源单据 / 产品概要 / 委外数量 / 开始日期 / 交付日期 / 加工商 / 齐套状态 / 委外状态 / 操作`；行数 2；首行 `外壳表面处理委外加工 / OS-20260517001 / MO-20260517001 / 铝合金外壳 / 260 / 2026-05-20 / 2026-05-28 / 深圳协同加工厂 / - / 待发料 / 查看`；新增按钮 `新增委外加工`；操作列为文本链接 `查看`；底部区域独立。

入口验证：
- 点击 5 个列表的新增按钮均进入对应 `?action=new`：`/production/production-demands?action=new`、`/production/production-plans?action=new`、`/production/production-orders?action=new`、`/production/production-work-orders?action=new`、`/production/outsource-orders?action=new`。
- 浏览器验证 5 个列表的 `?setting=fields` 均进入 `.aw-setting-page`，设置入口未破坏。

构建结果：
- PowerShell 当前 `npm` 不在 PATH，按本地可用脚本分别执行 `.\node_modules\.bin\vue-tsc.CMD --noEmit` 与 `.\node_modules\.bin\vite.CMD build`。
- `vite build` 通过，仅保留 Vite chunk 体积警告。
- `vue-tsc --noEmit` 当前被研发中心 `RdResourcePage.vue` 的既有 BOM 相关缺失方法/变量阻断，涉及 `applyBomBatch`、`enableBomAttr`、`addCustomBomAttr`、`moveBomAttr`、`disableBomAttr`、`closeBomImport` 等；本轮按用户约束不改研发中心 BOM 高风险页。

### 2026-05-29 - 生产中心列表表头按 JSX 对齐

用户要求：
- 生产中心列表页字段必须与 `manufacturing-list.jsx` 保持一致，特别是列表页表头；不允许自行发挥。

依据：
- JSX 列表表头来源为 `manufacturing-list.jsx` 的 `MfgRows`：基础列为 `主题 / 编号 / 来源单据 / 产品概要 / 数量 / 开始日期 / 交付日期 / 责任列 / 状态 / 操作`；仅生产计划增加 `进度`，仅生产工单增加 `工厂车间 / 产线`。

已完成：
- `ProductionResourcePage.vue` 列表 columns 删除自加表头：`齐套状态`、`BOM版本`、`工艺路线`。
- 生产需求、生产计划责任列改回 JSX 的 `责任部门`。
- 生产订单数量列改回 JSX 的 `计划数量`。
- 委外加工数量列改回 JSX 的 `计划数量`。
- 生产工单保留 JSX 中独有的 `工厂车间 / 产线 / 负责人`。
- 未修改公共组件，未改新增页子表字段。

浏览器逐页验收记录：
- `/production/production-demands`：表头为 `序号 / 需求主题 / 需求编号 / 来源单据 / 产品概要 / 需求数量 / 开始日期 / 交付日期 / 责任部门 / 需求状态 / 操作`；行数 3；首行 `销售订单生产需求 / MR-20260517001 / SO-20260517001 / 智能温控终端 / 120 / 2026-05-17 / 2026-05-30 / 老夏 / 待确认 / 查看`。
- `/production/production-plans`：表头为 `序号 / 计划主题 / 计划编号 / 来源单据 / 产品概要 / 计划数量 / 进度 / 开始日期 / 交付日期 / 责任部门 / 计划状态 / 操作`；行数 2；首行 `6月温控终端生产计划 / MP-20260517001 / MR-20260517001 / 智能温控终端 / 120 / 60% / 2026-05-18 / 2026-06-05 / 计划员王敏 / 待审批 / 查看`。
- `/production/production-orders`：表头为 `序号 / 生产主题 / 生产编号 / 来源单据 / 产品概要 / 计划数量 / 开始日期 / 交付日期 / 责任部门 / 生产状态 / 操作`；行数 2；首行 `202604智能温控终端生产205 / MO-20260517001 / MP-20260517001 / 智能温控终端 / 120 / 2026-05-18 / 2026-06-03 / 生产一部 / 生产中 / 查看`。
- `/production/production-work-orders`：表头为 `序号 / 工单主题 / 工单编号 / 来源单据 / 产品概要 / 计划数量 / 开始日期 / 交付日期 / 工厂车间 / 产线 / 负责人 / 工单状态 / 操作`；行数 2；首行 `总装工序生产工单 / WO-20260517001 / MO-20260517001 / 智能温控终端 / 120 / 2026-05-19 / 2026-05-26 / 总装车间 / 总装产线A / 三红 / 生产中 / 查看`。
- `/production/outsource-orders`：表头为 `序号 / 委外主题 / 委外编号 / 来源单据 / 产品概要 / 计划数量 / 开始日期 / 交付日期 / 加工商 / 委外状态 / 操作`；行数 2；首行 `外壳表面处理委外加工 / OS-20260517001 / MO-20260517001 / 铝合金外壳 / 260 / 2026-05-20 / 2026-05-28 / 深圳协同加工厂 / 待发料 / 查看`。

验证结果：
- 浏览器比对 5 个生产列表表头与 JSX 期望全部一致。
- 浏览器确认列表表头不再出现 `齐套状态`、`BOM版本`、`工艺路线`、`生产数量`、`委外数量`。
- 操作列仍为文本链接 `查看`，不是按钮。
- `vue-tsc --noEmit` 通过。
- `vite build` 通过，仅保留 Vite chunk 体积警告。

### 2026-05-29 - 研发中心新增页全量补齐与 BOM 专项纠偏

用户决策：
- 按交叉验证差异执行 14 项：补完整 BOM 四步导入、属性抽屉/属性库、分类侧栏/搜索/多选物料器；BOM 类型沿用列表枚举 `生产BOM / 工程BOM / 虚拟BOM`；工序补原 JSX 五 Tab；工艺路线字段补全；产品/物料/文档/项目字段按 JSX 补齐；代替物料统一 `tab=substitute`；保留旧路径兼容；BOM 允许专项样式；业务枚举迁入研发 adapter/mock。

已完成：
- `vue3/src/app/api/rd/resources.ts` 扩展 `RdCreateConfig.tabs`，将文档/项目/产品/物料/工序/工艺新增字段、Tab、子表列、附件类型、BOM 头部类型、审批流程、型号、单位、物料分类、导入步骤、导入映射、导入预览、属性库、物料库统一放入研发 adapter/mock。
- `vue3/src/views/rd/RdResourcePage.vue` 新增通用 Tab 渲染，补齐产品销售信息/库存策略/媒体说明、物料采购信息/库存策略/媒体说明、工序 `工位 / 工时 / 副产品 / 技术参数 / 质检方案` 五 Tab。
- BOM 新增页补四步导入向导、属性抽屉/属性库、属性启停/排序/自定义、物料分类侧栏、搜索、多选回填、批量条、用量变化反馈；保存/提交继续调用 `createRdResource`。
- 路由兼容：`/rd/project`、`/rd/product`、`/rd/material`、`/rd/process`、`/rd/craft`、`/rd/boms` 兼容跳转到现有复数路由并保留 query；`/rd/bom?action=新增代替` 自动规范为 `/rd/bom?action=新增代替&tab=substitute`。
- 左侧导航 `新增代替` 改为 `/rd/bom?tab=substitute&action=新增代替`；未破坏已有 `?setting=` 设置入口。
- 本轮未改公共组件；BOM 专项样式仍局限在 `RdResourcePage.vue` 的 scoped 样式。

构建结果：
- `.\node_modules\.bin\vue-tsc.cmd --noEmit --pretty false` 通过。
- `.\node_modules\.bin\vite.cmd build` 通过，仅保留 Vite chunk 体积警告。

浏览器新增页验收记录：
- `/rd/doc?action=new`：字段为 `所属分类 / 文档类型 / 文档编号 / 文档名称 / 版本 / 密级 / 负责人 / 生效日期 / 失效日期 / 签章策略 / 水印策略 / 外发策略 / 下载审批 / 外发有效天数 / 下载次数限制 / 操作留痕 / 授权对象 / 审批流程`；表头为 `序号 / 附件名称 / 附件类型 / 上传日期 / 备注 / 操作`；行数 1；首行附件类型为 `技术文档`；按钮区为 `返回列表 / 保存草稿 / 重置 / 提交审批`；弹窗结构为 `.aw-mask > .aw-modal > .head/.body/.foot`；负责人选择后回填 `老夏`；提交反馈 `文档库已提交审批，已通过新增接口调用。`
- `/rd/projects?action=new`：字段补齐 `项目分类 / 二级分类 / 优先级 / 来源主体`；成员表头为 `序号 / 姓名 / 角色 / 部门 / 操作`；行数 2 张表；首行成员 `老夏 / 项目负责人 / 研发中心`；按钮区为 `返回列表 / 保存草稿 / 重置 / 提交审批`；来源选择后回填 `海南微为智造温控锅订单`；提交反馈 `项目管理已提交审批，已通过新增接口调用。`
- `/rd/products?action=new`：字段补齐 `产品名称 / 别名码 / 产品编号 / 产品分类 / 二级分类 / 获取方式 / 标准单位 / 销售控制 / 产品状态 / 物码管控模式 / 关联码类型 / 规格型号 / 版本 / 负责人 / 关联BOM入口`；Tab 为 `销售信息 / 库存策略 / 媒体与说明`；型号表头为 `序号 / 型号 / 规格 / 关联码 / 启用 / 操作`；负责人选择后回填 `老夏`；提交反馈 `产品管理已提交审批，已通过新增接口调用。`
- `/rd/materials?action=new`：字段补齐 `物料名称 / 拼音码 / 物料编号 / 物料分类 / 二级分类 / 物料规格 / 获取方式 / 标准单位 / 销售控制 / 物料状态 / 属性 / 默认仓库 / 默认供应商`；Tab 为 `采购信息 / 库存策略 / 媒体与说明`；替代料表头为 `序号 / 替代料编码 / 替代料名称 / 替代比例 / 优先级 / 操作`；供应商选择后回填 `深圳华强电子`；提交反馈 `物料管理已提交审批，已通过新增接口调用。`
- `/rd/processes?action=new`：字段为 `工序编码 / 工序名称 / 工序类型 / 工序分类`，首个 Tab 补 `所属工艺/产品 / 工作中心 / 工位 / 设备要求 / 人员要求`；五 Tab 为 `工位 / 工时 / 副产品 / 技术参数 / 质检方案`；产品选择后回填 `iPhone17`；保存反馈 `工序管理已保存草稿，已通过新增接口调用。`
- `/rd/crafts?action=new`：字段补齐 `工艺编码 / 工艺名称 / 适用产品 / 工艺版本 / 适用范围 / 是否默认工艺 / 生效日期 / 负责人 / 工艺状态`；工艺路线表头为 `序号 / 序号 / 工序编号 / 工序名称 / 节点类型 / 执行方式 / 前置工序 / 并行组 / 标准工时 / 质检点 / 返工触发 / 回流目标 / 备注 / 操作`；首行 `1 / GX-001 / 下料切割 / 加工 / 自制 / - / A / 30 / 否 / 不合格 / 返修`；产品选择后回填 `iPhone17`；提交反馈 `工艺管理已提交审批，已通过新增接口调用。`
- `/rd/bom?action=new`：基础字段为 `BOM编号 / BOM名称 / 适用产品 / 版本号 / BOM类型 / 编制人 / 生效日期 / 审批流程`；产品选择后回填 `iPhone17`；BOM 类型选择 `生产BOM`，审批流程选择 `研发 BOM 默认流程`。
- BOM 四步导入：步骤为 `1 上传/粘贴 / 2 字段映射 / 3 预览校验 / 4 写入清单`；第 4 步状态为前三步 `done`、第四步 `on`；写入后 BOM 表头为 `选择 / 行号 / 物料 / 适用型号 / 用量 / 单位 / 物料类型 / 替代料 / 损耗% / 毛用量 / 关联工序 / 单价 / 小计 / 材质 / 长度 / 重量 / 工时 / 操作`；写入行数 5，首行 `iPhone17 整机总成 / IP17-000`。
- BOM 属性抽屉：结构为 `.aw-mask > .aw-modal.rd-attr-drawer > .head/.body/.foot`；属性库 13 项；已启用表头为 `排序 / 属性名称 / 字段类型 / 默认值 / 表格显示 / 必填 / 操作`。
- BOM 物料选择器：结构为 `.aw-mask > .aw-modal.rd-material-modal > .head/.body/.foot`；分类侧栏选择 `主板模组`；搜索 `主板` 可过滤；多选验证在 `主板模组` 分类下可见 3 行，选择 2 项后显示 `已选 2 项`，确认后回填两行 `主板模组 IP17-120`、`标准版主控 PCB IP17-121`。
- BOM 子表交互：首行用量改为 `2` 后毛用量显示 `2.000`；提交反馈 `BOM管理已提交审批，已通过新增接口调用。`
- 代替物料入口：旧 `/rd/bom?action=新增代替` 浏览器自动规范为 `/rd/bom?action=%E6%96%B0%E5%A2%9E%E4%BB%A3%E6%9B%BF&tab=substitute`；页面字段为 `主物料 / 主物料编码 / 替代物料 / 替代物料编码 / 替代比例 / 优先级 / 生效日期 / 失效日期 / 状态 / 说明`。

兼容入口验证：
- `/rd/project?action=new` 自动跳转 `/rd/projects?action=new`。
- `/rd/product?setting=numbers` 自动跳转 `/rd/products?setting=numbers`，设置页正常显示。
- `/rd/projects?setting=numbers` 仍进入项目编号设置页，未破坏已有 `?setting=` 设置入口。

边界说明：
- 详情页仍只读盘点，不在本轮实现详情路由或详情页。
- 研发中心设置页未主动修改，仅验证 query 入口未破坏。

### 2026-05-29 - 研发中心列表表头按 JSX 回齐

用户确认：
- 按 JSX 把研发中心列表表头命名全部回齐。
- 项目列表拆回 `开始日期 / 计划完成日期`。
- 工序列表删除 Vue 多出的 `状态` 列。
- 代替物料列表页在页面标题处用红字标注 `未完成`。

已完成：
- 文档库表头从 `文档编号 / 文档分类 / 负责人` 改回 JSX 的 `文档编码 / 类型 / 编制人`。
- 项目管理表头从 `项目周期` 拆回 `开始日期 / 计划完成日期`，并补齐项目 mock 行的 `startDate / planEnd` 字段。
- 物料管理表头从 `物料编码` 改回 `物料编号`。
- 工序管理删除列表多出的 `状态` 列，表头回到 `工序编码 / 工序名称 / 工序分类 / 工作中心 / 核算方式 / 加工方式 / 质检方案 / 操作`。
- 工艺管理表头从 `工艺编码` 改回 `工艺编号`。
- BOM 管理表头从 `负责人` 改回 `编制人`。
- `/rd/bom?tab=substitute` 在页头 `BOM管理` 旁显示红字 `未完成`。

验证：
- `vue-tsc --noEmit` 通过。
- `vite build` 通过，仅保留 Vite chunk 体积警告。
- 浏览器逐页复查 `/rd/doc`、`/rd/projects`、`/rd/products`、`/rd/materials`、`/rd/processes`、`/rd/crafts`、`/rd/bom`、`/rd/bom?tab=substitute`，表头、首行数据、行数均可正常渲染；代替物料页头红字 `未完成` 可见。

### 2026-05-29 - 公共列表页母版恢复三段式结构

用户要求：
- 本轮只处理 Vue3 ERP 公共列表页母版结构，不改业务字段、数据、接口、新增页、详情页、设置页。
- 列表恢复原 JSX 的工具栏、表格、底部全选分页三段式结构；短表不能被 flex 撑满整页，底部条必须贴在表格底部。

依据：
- 已读取 `docs/new-window-handoff.md`、`docs/sales-parallel-coordination.md`。
- 已对照 `sales-plan-list.jsx`、`supplier-list.jsx`、`manufacturing-list.jsx` 的列表结构，确认 JSX 为独立工具栏 + 独立表格容器 + 独立底部容器。
- 已读取公共列表母版 `AwListPage.vue`、`AwListToolbar.vue`、`AwDataTable.vue` 和 `aw-console.css`。
- 已读取引用页 `CustomerList.vue`、`PurchaseResourcePage.vue`、`WarehouseResourcePage.vue`、`ProductionResourcePage.vue`、`RdResourcePage.vue`。

已完成：
- 仅修改 `vue3/src/styles/aw-console.css`。
- `.aw-list-panel` 从大白卡改为透明右侧 flex column 布局容器，并通过 gap 管理三段式间距。
- `.aw-list-toolbar` 改为独立白底、边框、圆角、padding 的工具栏容器。
- `.aw-doc-tbl-wrap` 去掉撑满列表页的 `flex:1`，列表页内按内容高度展示，并设置合理 `max-height`；保留内部横向/纵向滚动。
- `.aw-list-footer` 保持在 table 外部，补齐独立白底和边框，紧贴表格容器下方。
- 未修改任何业务字段、列名、mock 数据、接口、新增页、详情页、设置页；未逐页打补丁；未新增列表组件。

构建结果：
- 在 `vue3` 执行 `pnpm run build` 通过，仅保留 Vite chunk 体积警告。

浏览器验证：
- `/sales/customers`：工具栏独立、表格独立、footer 独立且 `footerGap=0`；分类树正常；短表未被撑出大空白；横向滚动、sticky 左右列正常。
- `/purchase/suppliers`：工具栏独立、表格独立、footer 独立且贴表格底部；供应商分类树正常；横向滚动、sticky 左右列正常。
- `/warehouse/inventory-stocks`：工具栏独立、表格独立、footer 独立且贴表格底部；库存分类树正常；3 行短表未撑满整页；多字段横向滚动正常。
- `/production/production-demands`：无分类树页面保持 `aw-list-layout-no-tree`；工具栏、表格、footer 三段式正常；3 行短表未撑满整页；横向滚动、sticky 左右列正常。
- `/rd/doc`：工具栏独立、表格独立、footer 独立且贴表格底部；研发分类树正常；短表未撑满整页；横向滚动、sticky 左右列正常。

补充调整：
- 按用户要求统一三段式间距，去掉表格容器与 footer 之间的贴合负间距，统一由 `.aw-list-panel` 的 `gap:12px` 控制。
- 浏览器复查 `/sales/customers`、`/purchase/suppliers`、`/warehouse/inventory-stocks`、`/production/production-demands`、`/rd/doc`：工具栏到表格间距均为 `12px`，表格到底部容器间距均为 `12px`。
- `pnpm run build` 通过，仅保留 Vite chunk 体积警告。

### 2026-05-29 - 生产中心新增页按 JSX 回齐

用户要求：
- 生产中心新增页全部与 `manufacturing-list.jsx` 保持一致，但必须遵循 Vue3 已验收母版。
- 本轮不实现详情页；列表查看仍只做动作提示。
- 不破坏 `?setting=` 设置页入口；mock/API 数据放在生产中心 adapter/mock。

已完成：
- 仅修改 Vue3 工程生产相关文件：`ProductionResourcePage.vue`、生产 API 类型/adapter、生产 picker mock。
- 新增页按钮按 JSX 调整为 `关闭 / 暂存 / 确定`，提交仍实际调用 `createProduction`。
- 产品选择器改为 JSX 字段：`选择 / 序号 / 产品编号 / 产品名称 / 产品型号 / 产品分类 / 单位 / 参考单价 / 库存 / 默认供应商`，并使用 `.aw-mask / .aw-modal / .head / .body / .foot`。
- 来源选择器补搜索与分类，确认时只允许当前分类内选中项回填，避免跨分类旧选中 id 串单。
- 供应商选择器改为 JSX 字段：`选择 / 供应商名称 / 分组 / 联系人 / 联系方式 / 状态`。
- 委外范围弹窗继续复用通用 modal DOM/class，支持整单委外/工序委外选择与回填。
- 生产计划、生产订单、委外加工默认明细从生产 mock 产品数据生成；来源 productRef 在 production adapter 中合并产品 mock 的 BOM/工艺/报工/入库数据，避免回填后丢失 JSX 示例状态。
- 未修改公共组件，未新增私有 `production-modal`，未改静态 JSX/HTML。

构建结果：
- `.\node_modules\.bin\vue-tsc.CMD --noEmit` 通过。
- `.\node_modules\.bin\vite.CMD build` 通过，仅保留 Vite chunk 体积警告。

### 2026-05-29 - 研发中心新增文档所属分类选择器对齐

用户指出：
- `/rd/doc?action=new` 新增文档中 `文档类型` 与 `所属分类` 重合，只保留一个分类字段。
- 点击 `所属分类` 后应弹出分类设置同源页面内容：左侧一级分类，右侧二级分类列表；选中二级分类后回填并绑定分类。

已完成：
- 仅修改 `vue3/src/app/api/rd/resources.ts`、`vue3/src/views/rd/RdResourcePage.vue`。
- 新增文档配置移除 `文档类型` 字段，只保留 `所属分类`。
- `所属分类` 从普通下拉改为 `categoryPicker`，点击打开分类选择弹窗。
- 分类数据通过 `getRdDocCategoryPickerGroups()` 从 `operationSettingTemplates.rdDocs.extraLists.categories` 读取，未在组件内散写业务分类数据。
- 弹窗沿用研发新增页母版 DOM：`.aw-mask / .aw-modal / .head / .body / .foot`。
- 弹窗内容为左侧一级分类、右侧二级分类列表，表头为 `选择 / 分类名称 / 上级分类 / 分类编码 / 排序 / 状态`。
- 确认选择后回填 `所属分类` 显示路径，同时写入：一级分类到 `categoryParent`，二级分类到 `category`，分类编码到 `categoryCode`。
- mock 创建接口 `createRdResource()` 保存时优先用 `categoryParent` 写入列表 `type`，用 `category` 写入列表二级分类，保持文档列表树同步。
- 交叉验证补充：新增文档未选择分类时拦截提交并提示 `请先选择所属分类。`，避免 mock 写入旧默认分类。
- 交叉验证补充：`/rd/doc?setting=fields` 的文档字段设置元数据同步移除 `文档类型`，`所属分类` 类型改为 `分类选择器`。

验证记录：
- URL：`http://localhost:5173/rd/doc?action=new`。
- 页面字段：基本信息中显示 `文档编号 / 文档名称 / 所属分类 / 版本号 / 编制人 / 生效日期 / 失效日期 / 审批流程`。
- 重复字段：浏览器 DOM 读取确认页面正文不再包含 `文档类型`。
- 所属分类控件：`所属分类` 行为只读输入 + `选择` 按钮，placeholder 为 `请选择文档分类`。
- 弹窗结构：构建产物确认 `选择文档分类` 弹窗包含 `.aw-mask / .aw-modal.rd-doc-category-modal / .head / .body / .foot`，并包含左侧 `工艺方案 / 工艺文件 / 技术文档 / 操作规范` 与右侧二级分类表。
- 提交拦截：构建产物确认包含 `请先选择所属分类。` 校验文案；未选分类不会调用新增接口写入旧默认分类。
- 设置字段同步：源码确认 `rd_doc` 字段设置中不再存在 `文档类型` 字段行，`所属分类` 为 `分类选择器`。
- 交互说明：Codex in-app browser 当前存在 `codex-browser-sidebar-comments-root` 评论覆盖层，`elementFromPoint` 命中该覆盖层，导致浏览器自动点击被拦截；已用 DOM 与构建产物核对结构和事件绑定，后续人工点击需在无评论覆盖层状态下复验。

构建结果：
- 使用内置 Node 路径执行 `node node_modules/vue-tsc/bin/vue-tsc.js --noEmit` 通过。
- 使用内置 Node 路径执行 `node node_modules/vite/bin/vite.js build` 通过，仅保留 Vite chunk 体积警告。

### 2026-05-29 - 生产排班列表补齐车间分类筛选

用户指出：
- `/production/production-schedules` 排班列表页需要在左侧增加与生产班组页一致的部门/车间分类，方便按人员所属车间筛选。

已完成：
- 仅修改 `vue3/src/views/production/ProductionSchedulePage.vue`。
- 排班列表页增加左侧 `车间分组` 分类区，复用生产班组页的 `aw-doc-tree / aw-tree-row / aw-tree-l2 / on` 结构。
- 分类数据使用生产排班 mock/API 中已有 `schedule.workshops` 和班组 `team.workshop`，员工按 `employee.team -> team.workshop` 映射筛选，未在组件内新增散落业务数据。
- 根据用户二次指出，删除顶部班组下拉和对应 `rosterTeam` 二次筛选逻辑；排班列表人员筛选入口只保留左侧车间分类。
- 表格行数、首行数据、底部本周工时与班次统计全部跟随当前车间筛选结果变化。
- 保持已拆分的独立页面入口，不恢复 `排班列表 / 排班计划 / 生产班组 / 工作日历 / 班次管理` 内部标签行。

浏览器复验记录：
- URL：`http://localhost:5173/production/production-schedules`。
- 顶部工具栏：`select` 数量为 0，只保留 `周视图 / 批量调班 / 新增排班`。
- 初始：左侧分类 `全部车间5 / 总装车间3 / 焊接车间1 / 机加工车间1 / 包装车间0`；表格 5 行；首行 `三红 / P006 / 总装一班 / 总装工位01 / 总装 / 装配上岗证 / 40h / 48h / 计划生成`。
- 表头：`员工 / 工号 / 班组 / 工位/产线 / 技能资质 / 本周工时 / 来源 / 06-01 周一 / 06-02 周二 / 06-03 周三 / 06-04 周四 / 06-05 周五 / 06-06 周六 / 06-07 周日`。
- 点击 `总装车间`：左侧选中 `总装车间3`；表格 3 行；底部统计变为 `本周工时合计 123h`。
- 点击 `焊接车间`：左侧选中 `焊接车间1`；表格 1 行；首行 `李工 / P022 / 焊接夜班 / 焊接工位A / 焊接 / 焊工证 / 40h / 44h / 计划生成`；底部统计变为 `本周工时合计 40h`。
- 内部标签行检查：`.production-schedule-page .aw-tabs` 数量为 0。

构建结果：
- `node .\node_modules\vue-tsc\bin\vue-tsc.js --noEmit --pretty false` 通过。
- `node .\node_modules\vite\bin\vite.js build` 通过，仅保留 Vite chunk 体积警告。

### 2026-05-29 - 研发中心文档分类新增改为弹窗

用户指出：
- `/rd/doc?setting=categories` 顶部 `新增子分类` 应打开弹窗，不能点击后直接插入列表行。

已完成：
- `新增子分类` 改为打开 `新增下级分类` 弹窗，确认后才写入右侧二级分类列表。
- 左侧分类树 `+` 改为打开 `新增文档分类` 弹窗，用于新增一级分类。
- 右侧列表 `编辑` 改为打开 `编辑下级分类` 弹窗。
- 修正弹窗节点插入位置，避免文档分类 split 页面同时落入默认打印模板列表；当前页面只保留一套左侧一级/右侧二级列表布局。

浏览器复验记录：
- URL：`http://localhost:5173/rd/doc?setting=categories`。
- 页面结构：`.aw-setting-split` 数量 1，`.aw-setting-list-card` 数量 1，`.aw-doc-tbl` 数量 1。
- 默认右侧标题 `工艺方案`，行数 2，首行 `控制方案 / 工艺方案 / DOC_PLAN_CTRL / 1`。
- 页面不再出现 `文档标准打印模板` 默认打印列表。
- in-app browser 评论层覆盖点击点，`elementFromPoint` 命中高层空 div，自动点击无法触达按钮；本次以 DOM 结构和源码分支确认点击不会直接插行，弹窗由 `showExtraModal` 驱动。

构建结果：
- `.\node_modules\.bin\vite.CMD build` 通过，仅保留 Vite chunk 体积警告。

### 2026-05-29 - 研发中心文档列表分类树同步文档分类设置

用户指出：
- `/rd/doc` 列表左侧分类树应读取 `设置文档分类` 的配置，文档分类已经改为多级，列表页也应同步多级。

已完成：
- 文档列表不再使用写死的扁平 `treeNodes`。
- 新增 `getRdListConfig(module, rows)`，文档库列表从 `rdDocs.categories` 设置生成左侧树。
- 文档列表左树结构同步为：`全部文档`、一级 `工艺方案 / 工艺文件 / 技术文档 / 操作规范`、二级 `控制方案 / 自动化方案 / 焊接作业 / 技术规范 / 安全操作`。
- 文档 mock 行补充二级分类字段 `category`；列表过滤支持点击一级按 `type` 过滤，点击二级按 `category` 过滤。
- 一级/二级计数根据当前文档列表数据计算，不再保留旧的 `全部文档 (12)` 假计数。

浏览器复验记录：
- URL：`http://localhost:5173/rd/doc`。
- 左树标题：`文档库 (6)`。
- 左树节点：`全部文档(6) / 工艺方案(3) / 控制方案(2) / 自动化方案(1) / 工艺文件(1) / 焊接作业(1) / 技术文档(1) / 技术规范(1) / 操作规范(1) / 安全操作(1)`。
- 二级节点 `.aw-tree-l3` 数量 5；旧 `全部文档(12)` 不存在。
- 默认表格行数 6；首行 `DD-2024-001 / 智能控制器标准规范 / 工艺方案 / 已发布 / V1.0 / 傲为 / 2025-12-12`。
- in-app browser 评论层覆盖左树点击点，`elementFromPoint` 命中高层空 div，自动点击无法触达左树；过滤代码已按一级/二级字段路径落地。

构建结果：
- `.\node_modules\.bin\vue-tsc.CMD --noEmit` 通过。
- `.\node_modules\.bin\vite.CMD build` 通过，仅保留 Vite chunk 体积警告。
- `.\node_modules\.bin\vue-tsc.CMD --noEmit` 当前被生产排班页面并行改动阻断：`ProductionSchedulePage.vue` 缺少 `addCalendarException / removeCalendarException / toEditableCalendarException`；本次未触碰生产排班相关文件。

### 2026-05-29 - 研发中心文档分类弹窗回齐客户分组设置

用户指出：
- `设置文档分类` 已要求直接使用客户分组设置，不应重新扩展一套弹窗字段。

已完成：
- `/rd/doc?setting=categories` 的分类弹窗 DOM/class 继续使用客户分组设置同款：`.aw-modal-mask > .aw-modal.aw-category-modal > .aw-modal-head/.aw-modal-body/.aw-modal-foot`。
- 弹窗字段回齐客户分组设置，只保留 `分类名称 / 分类编号 / 分类备注`。
- 删除此前自作主张增加的 `上级分类 / 排序 / 是否启用` 弹窗字段；上级分类沿用当前左侧选中的一级分类，排序和启用状态由现有 mock 行逻辑处理。

构建结果：
- `.\node_modules\.bin\vite.CMD build` 通过，仅保留 Vite chunk 体积警告。

### 2026-05-29 - 研发中心文档分类设置页改为客户分组同款布局

用户指出：
- `设置文档分类` 页面直接使用 `客户管理 - 客户设置 - 客户分组设置` 的左侧一级、右侧二级列表布局。

已完成：
- `/rd/doc?setting=categories` 改为 `AwSettingSplitPage + AwSettingTree + AwSettingListCard + AwSettingTable` 布局，沿用客户分组设置页的 split 结构和表格容器。
- 文档分类数据按 `doc-category.jsx` 回齐：一级分类为 `工艺方案 / 工艺文件 / 技术文档 / 操作规范`；二级分类为 `控制方案 / 自动化方案 / 焊接作业 / 技术规范 / 安全操作`。
- 右侧二级列表表头为 `序号 / 分类名称 / 上级分类 / 分类编码 / 排序 / 状态 / 操作`，状态使用同款开关。
- 共享 `OperationSettingPage` 仅在配置带 `roots` 的分类页启用 split 布局；未带 `roots` 的项目/产品等分类设置仍保持原列表布局。

浏览器复验记录：
- URL：`http://localhost:5173/rd/doc?setting=categories`。
- 默认左侧：`工艺方案2 / 工艺文件1 / 技术文档1 / 操作规范1`，左侧标题 `文档分类`。
- 默认右侧标题：`工艺方案`；行数 2；首行 `1 / 控制方案 / 工艺方案 / DOC_PLAN_CTRL / 1 / 开关 / 编辑|删除`。
- 点击左侧 `技术文档` 后，右侧标题切换为 `技术文档`；行数 1；首行 `1 / 技术规范 / 技术文档 / DOC_TECH_SPEC / 1 / 开关 / 编辑|删除`。
- 抽查 `/rd/projects?setting=categories`：未启用 split，仍保持原普通分类列表，确认共享设置页改动未把所有分类页强制改版。

构建结果：
- `.\node_modules\.bin\vue-tsc.CMD --noEmit` 通过。
- `.\node_modules\.bin\vite.CMD build` 通过，仅保留 Vite chunk 体积警告。

### 2026-05-29 - 生产中心生产排班工作日历改为真实 mock/API 驱动

用户指出：
- `/production/production-schedules?action=工作日历` 当前工作日历像样子货，切换月份、同步法定节假日和新增工作日历没有真实数据联动。

执行边界：
- 只改 Vue3 工程生产排班相关文件；原 `manufacturing-list.jsx` 仅作为字段和版式依据。
- 经智能体只读交叉验证，工作日历仍只保留 JSX 原有工具栏、两个下拉、同步按钮、例外日卡片、7 列 35 格月历、底部统计和新增工作日历弹窗字段。
- 不新增生产排班左侧浮窗入口，不加入日历排程、班次甘特图、日期点击编辑等 JSX 未定义交互。

已完成：
- `vue3/src/mock/production/schedules.json` 增加生产工作日历实体 `cal_std_2026 / cal_assembly_2026`，例外日按月份放入对应日历 mock，不再只保留全局静态 `calendarExceptions`。
- `vue3/src/app/api/production/types.ts` 增加 `ProductionWorkCalendar / ProductionWorkCalendarMonth / ProductionWorkCalendarDay` 类型。
- `vue3/src/app/api/production/resources.ts` 补齐远程契约预留和 mock 实现：
  - `listProductionWorkCalendars`
  - `getProductionWorkCalendarMonth`
  - `createProductionWorkCalendar`
  - `syncProductionCalendarHolidays`
- `createProductionScheduleItem('calendar')` 已接到 `createProductionWorkCalendar`，新增工作日历会真实写入 mock 内存数据。
- `vue3/src/views/production/ProductionSchedulePage.vue` 工作日历改为按当前日历和月份渲染；日历下拉、月份下拉、例外日、月历格、底部统计均来自 adapter/mock。

浏览器复验记录：
- URL：`http://localhost:5173/production/production-schedules?action=工作日历`。
- 初始日历：`2026标准工作日历 / 2026-06`；日历选项 `2026标准工作日历 / 总装车间工作日历`。
- 初始例外日：3 条；首条 `06-01 周一 / 节假日 / 强制休 R / 端午假期调休`。
- 初始月历：35 格；前 10 个有效格为 `1节假日 / 2节假日 / 3工作 / 4工作 / 5工作 / 6休息 / 7休息 / 8调班 / 9工作 / 10工作`。
- 初始统计：`工作日 22 天 / 休息日 8 天 / 节假日 2 天 / 调班 1 天`。
- 切换月份：选择 `2026-07` 后，例外日变为 2 条：`07-03 周五休息`、`07-11 周六调班`；统计变为 `工作日 23 天 / 休息日 8 天 / 节假日 0 天 / 调班 1 天`。
- 切换日历：选择 `总装车间工作日历` 后，元信息回填 `工作制：双休 / 继承来源：2026标准工作日历 / 适用范围：总装车间`；7 月例外日变为 `07-06 周一调班`、`07-20 周一休息`。
- 同步法定节假日：点击 `同步法定节假日`，反馈 `已同步 2026-06 法定节假日，更新 3 条例外日`，例外日仍按当前月日历数据展示。
- 新增工作日历弹窗：结构为 `.aw-mask / .aw-modal / .head / .body / .foot`；字段为 `日历名称 / 适用范围 / 工作制 / 继承来源 / 节假日规则 / 调班规则`；例外日表头为 `日期 / 类型 / 规则 / 说明`。
- 新增保存：保存后反馈 `新增工作日历 已保存并调用生产排班 create API`，日历下拉新增 1 项并自动选中新日历，元信息回填新日历的 `工作制 / 继承来源 / 适用范围`。
- 控制台：无 error 日志。

构建结果：
- `vue-tsc --noEmit --pretty false` 通过。
- `vite build` 通过，仅保留 Vite chunk 体积警告。

### 2026-05-29 - 生产排班列表当前计划信息条排版调整

用户指出：
- `/production/production-schedules` 排班列表顶部 `当前计划 SP-202606-A01 · 循环模式 A-B-C-R · 参考日历...` 挤在一起，阅读不舒服。

已完成：
- 修改 `vue3/src/views/production/ProductionSchedulePage.vue`。
- 将原本一整句 `·` 串联文本拆成 5 个独立字段组：`当前计划 / 循环模式 / 参考日历 / 周期 / 覆盖率`。
- `.schedule-plan-meta` 改为 flex wrap，字段之间有固定间距，可随视口换行，不再压成一条长句。

浏览器复验记录：
- URL：`http://localhost:5173/production/production-schedules`。
- `.schedule-plan-meta` 字段数：5。
- 字段内容：`当前计划SP-202606-A01 / 循环模式A-B-C-R / 参考日历2026标准工作日历 / 周期2026-06-01 至 2026-06-30 / 覆盖率104.7%`。
- 信息条高度约 `41px`，位于表格上方，未覆盖表格。
- 控制台：无 error 日志。

构建结果：
- `vue-tsc --noEmit --pretty false` 通过。
- `vite build` 通过，仅保留 Vite chunk 体积警告。

### 2026-05-29 - 生产排班移除页内 Tab 行

用户指出：
- 生产排班页面里 `排班列表 / 排班计划 / 生产班组 / 工作日历 / 班次管理` 这一行不应显示；这些入口应作为独立页面，通过左侧二级浮窗或 URL action 进入。

已完成：
- 修改 `vue3/src/views/production/ProductionSchedulePage.vue`。
- 删除生产排班内容区顶部 `.aw-tabs` 页内 Tab 行。
- 保留现有 `?action=` 路由体系，`排班列表 / 排班计划 / 生产班组 / 工作日历 / 班次管理` 仍通过独立 URL action 进入。
- `switchPage` 改为同步更新 URL action，避免隐藏的纯页内切换。

浏览器复验记录：
- URL：`http://localhost:5173/production/production-schedules?action=工作日历`。
- `.schedule-card > .aw-tabs` 数量：0。
- 页面顶部直接显示工作日历工具栏：`日历下拉 / 月份下拉 / 同步法定节假日 / 编辑工作日历 / 新增工作日历`。
- URL：`http://localhost:5173/production/production-schedules?action=排班计划`。
- `.schedule-card > .aw-tabs` 数量：0；页面直接显示排班计划工具栏和表格，表头含 `计划编号 / 计划名称 / 适用班组 / 循环模式`。

构建结果：
- `vue-tsc --noEmit --pretty false` 通过。
- `vite build` 通过，仅保留 Vite chunk 体积警告。

### 2026-05-29 - 生产排班工作日历编辑能力补齐

用户确认：
- 工作日历需要可编辑；基础信息和当前月份例外日规则增删改一起做。

执行边界：
- 编辑入口仅放在 `/production/production-schedules?action=工作日历` 当前工作日历 tab 工具栏内，不新增左侧浮窗、独立路由、详情页、日历排程或班次甘特图。
- 弹窗继续复用 `.aw-mask / .aw-modal / .head / .body / .foot`，基础字段保持原 JSX 工作日历弹窗字段。
- 例外日编辑只覆盖当前选中日历、当前选中月份。

已完成：
- `vue3/src/app/api/production/resources.ts` 新增 `updateProductionWorkCalendar`，mock 模式更新 `scheduleData.calendars[].exceptionsByMonth[month]`，remote 模式预留 `PATCH /production-schedules/calendars/{calendarId}`。
- `createProductionWorkCalendar` 支持接收弹窗里的例外日规则，不再只能复制来源日历。
- `vue3/src/views/production/ProductionSchedulePage.vue` 增加 `编辑工作日历` 页面内按钮。
- `编辑工作日历` 弹窗回填当前日历基础信息与当前月份例外日规则；例外日表支持日期、类型、规则、说明编辑，并支持 `新增例外日`、`删除`。
- 保存编辑调用 `updateProductionWorkCalendar`，保存后刷新当前日历和月历统计。

浏览器复验记录：
- URL：`http://localhost:5173/production/production-schedules?action=工作日历`。
- 初始工具栏按钮：`同步法定节假日 / 编辑工作日历 / 新增工作日历`。
- 点击 `编辑工作日历`：弹窗标题 `编辑工作日历`；结构 `.aw-mask / .aw-modal / .head / .body / .foot` 均存在。
- 回填字段：`日历名称=2026标准工作日历`、`适用范围=全公司`、`工作制=双休`、`继承来源=集团标准日历`、`节假日规则=同步国务院法定节假日`、`调班规则=调班日若循环为 R 自动改 A`。
- 例外日回填：3 行；首行 `2026-06-01 / 节假日 / 强制休 R / 端午假期调休`。
- 删除验证：删除 `2026-06-02` 后保存，反馈 `编辑工作日历 已保存并调用生产排班 update API`，页面例外日剩 `06-01`、`06-08`。
- 新增验证：重新打开编辑，点击 `新增例外日`，行数从 2 变 3；将新增日期改为 `2026-06-15` 后保存，页面新增 `06-15 周一休息强制休 R`。
- 保存后统计变化：`工作日 22 天 / 休息日 5 天 / 节假日 1 天 / 调班 1 天`。
- 控制台：无 error 日志。

构建结果：
- `vue-tsc --noEmit --pretty false` 通过。
- `vite build` 通过，仅保留 Vite chunk 体积警告。

### 2026-05-29 - 研发中心文档新增页删除安全与外发控制块

用户指出：
- `/rd/doc?action=new` 中 `安全与外发控制` 容器内所有内容删除。

已完成：
- 仅修改研发中心 adapter/mock 配置 `vue3/src/app/api/rd/resources.ts`。
- 从文档新增配置中移除整个 `安全与外发控制` section，页面不再渲染该容器及 `电子签章 / 水印策略 / 外发权限 / 下载审批 / 外发有效期 / 下载次数 / 授权对象 / 审批流程 / 操作留痕` 字段。
- 保留文档新增页现有路由 `/rd/doc?action=new`、基础信息、附件、正文内容和保存/提交体系。

浏览器复验记录：
- URL：`http://localhost:5173/rd/doc?action=new`。
- 页面正文显示顺序：`基本信息` 后直接进入 `附件`，随后为 `正文内容`。
- DOM 检查：`安全与外发控制 / 电子签章 / 水印策略 / 外发权限 / 下载审批` 均不存在。
- 保留内容：`文档编号 / 文档名称 / 文档类型 / 所属分类 / 版本号 / 编制人 / 生效日期 / 失效日期 / 审批流程`、附件表头 `序号 / 附件名称 / 附件类型 / 上传日期 / 备注 / 操作`、正文编辑器均正常渲染。

构建结果：
- 本机 `npm` 不在 PATH；使用 Codex 内置 Node 路径执行等价构建命令。
- `.\node_modules\.bin\vue-tsc.CMD --noEmit` 通过。
- `.\node_modules\.bin\vite.CMD build` 通过，仅保留 Vite chunk 体积提示。

### 2026-05-29 - 研发中心新增工序 IPQC 弹窗尺寸与状态过滤

用户指出：
- `/rd/processes?action=new` 的 `选择 IPQC 质检方案` 弹窗偏小，表格内容没有显示全。
- IPQC 方案只能显示已启用状态，待审核、停用不能显示在可选列表中。

已完成：
- 修改 `vue3/src/views/rd/RdResourcePage.vue`。
- `选择 IPQC 质检方案` 弹窗增加 `is-qc` 专属宽度，宽度调整为 `min(1240px, calc(100vw - 56px))`。
- IPQC 弹窗表格最小宽度调整为 `980px`，配合更宽弹窗减少横向截断。
- IPQC 可选数据源过滤为 `state === '启用'`，待审核/停用方案不进入弹窗列表。
- 业务选项仍保留在研发 adapter/mock：`vue3/src/app/api/rd/resources.ts` 的 `processQcPlanOptions`。

验证记录：
- 代码核对：`processPickerOpen === 'qc'` 时数据源为 `processQcPlanOptions.filter(row => row.state === '启用')`。
- 样式核对：`.rd-process-picker-modal.is-qc` 宽度为 `min(1240px, calc(100vw - 56px))`，表格 `minWidth` 为 `980px`。
- 浏览器备注：当前 in-app browser 页面存在评论标注覆盖层 `codex-browser-sidebar-comments-root`，会拦截自动点击；已通过 DOM 状态确认覆盖层存在，未将覆盖层拦截误判为业务页面问题。

构建结果：
- `.\node_modules\.bin\vite.CMD build` 通过，仅保留 Vite chunk 体积警告。
- `.\node_modules\.bin\vue-tsc.CMD --noEmit` 当前被无关生产排程文件阻断：`src/views/production/ProductionSchedulePage.vue(677,3)` 缺少 `calendars` 字段；本次未修改生产中心排班相关文件。

### 2026-05-29 - 研发中心新增工序选择弹窗回齐

用户指出：
- `/rd/processes?action=new` 中 `+ 添加质检方案` 原 JSX 是弹窗选择，不应点击后直接添加 mock 行。

JSX 对照结论：
- `process-list.jsx` 中 `+ 添加工位` 打开 `StationPickerModal`，多选后确认追加工位。
- `+ 选择副产品` 打开 `OutputProductPicker`，多选后确认追加副产品。
- `+ 添加质检方案` 打开 `ProcessQcPlanPicker`，弹窗标题为 `选择 IPQC 质检方案`，左侧有 IPQC 分类，表格勾选后确认回填质检方案。

已完成：
- 修改 `vue3/src/views/rd/RdResourcePage.vue`：新增工序的工位、副产品、质检方案按钮均改为先打开弹窗，再确认回填。
- 修改 `vue3/src/app/api/rd/resources.ts`：将工位、副产品、IPQC 质检方案选项迁入研发 adapter/mock，不再把这部分业务选项散在组件里。
- 弹窗沿用 `.aw-mask / .aw-modal / .head / .body / .foot` 结构。

浏览器复验记录：
- URL：`http://localhost:5173/rd/processes?action=new`。
- 质检方案弹窗：点击 `+ 添加质检方案` 后打开弹窗；标题 `选择 IPQC 质检方案`，副标题 `制程质检方案列表`；结构包含 `.aw-mask / .aw-modal / .head / .body / .foot`；左侧分类为 `全部IPQC / 首件检验 / 巡检方案 / 停线处置 / 复检放行`。
- 质检方案弹窗表头：`选择 / 方案编号 / 方案名称 / 适用范围 / 抽样规则 / 关键控制点 / 状态`；行数 4；首行 `IPQC-PLAN-001 / 压装过程控制计划 V2.4 / 压装 / 装配工序 / 首件全检 + 巡检5件/2h / 扭矩 / 压装深度 / 工装点检 / 启用`。
- 质检方案回填：勾选首行后显示 `已勾选 1 项`；点击 `确定` 后弹窗关闭，当前 Tab 表格回填 1 行，表头 `方案编号 / 方案名称 / 适用范围 / 抽样规则 / 关键控制点 / 状态 / 操作`。
- 副产品弹窗：点击 `+ 选择副产品` 后打开弹窗；标题 `选择副产品`；表头 `选择 / 图片 / 产品名称 / 产品编号 / 型号 / 分类 / 单位 / 获取方式`；行数 2；首行 `温湿度传感器 / CP-001 / IWS-TH200 / 废料 / 只 / 自制件`。
- 工位弹窗：点击 `+ 添加工位` 后打开弹窗；标题 `选择工位`；表头 `选择 / 工位编码 / 工位名称 / 所属生产线 / 所属车间 / 所属工厂`；行数 5；首行 `GW-001 / 车削工位A / 生产线1 / 一车间 / 海南傲为工厂`。

构建结果：
- `.\node_modules\.bin\vue-tsc.CMD --noEmit` 通过。
- `.\node_modules\.bin\vite.CMD build` 通过，仅保留 Vite chunk 体积警告。

### 2026-05-29 - 生产中心生产排班专属页面补齐

用户指出：
- `/production/production-schedules` 生产排班不能继续是契约占位页，必须查看 `manufacturing-list.jsx`，按原 JSX 专属版式实现，并通过智能体交叉验证排除自发挥。

依据与结论：
- 已读取 `manufacturing-list.jsx` 中 `MfgScheduleScreen / MfgRosterList / MfgSchedulePlans / MfgTeamManagement / MfgWorkCalendar / MfgShiftManagement / MfgScheduleModal`。
- 已派智能体只读交叉验证，确认生产排班浮窗只允许：`排班列表 / 排班计划 / 生产班组 / 工作日历 / 班次管理`；设置入口只允许：`排班自定义字段 / 排班自定义编号 / 排班审批设置 / 生产排班策略设置 / 设置生产排班打印模板`。
- 明确不新增 `班次甘特图 / 日历排程 / 冲突校验` 到左侧浮窗；`冲突校验` 仅保留为页面内按钮和弹窗。

已完成：
- 新增 `vue3/src/views/production/ProductionSchedulePage.vue`，生产排班不再走 `ContractResourcePage` 占位。
- 补齐专属版式：顶部统计、页内 Tab、排班网格、排班计划表、生产班组左树+卡片、工作日历月历、班次卡片、调整班次/新增/详情/冲突/策略弹窗。
- 弹窗统一使用 `.aw-mask / .aw-modal / .head / .body / .foot`。
- 操作保持文字链接：排班计划 `查看`、班次 `编辑`、班组卡片点击查看，不改成按钮。
- 补齐生产排班 mock/API：`vue3/src/mock/production/schedules.json`，`getProductionScheduleData / createProductionScheduleItem / updateProductionScheduleCell / runProductionScheduleAction`。
- 补齐路由与入口：`/production/production-schedules` 指向专属 Vue 页面；左侧生产排班恢复 JSX 浮窗；`?setting=` 设置入口保留并接入 `productionSchedules` 设置模板。

浏览器复验记录：
- URL：`http://localhost:5173/production/production-schedules`。
  - 表头：`员工 / 工号 / 班组 / 工位/产线 / 技能资质 / 本周工时 / 来源 / 06-01 周一 ... 06-07 周日`。
  - 行数：5；首行：`三红 / P006 / 总装一班 / 总装工位01 / 总装 / 装配上岗证 / 40h / 48h / 计划生成 / A早...`。
  - 按钮位置：右侧工具栏 `周视图 / 批量调班 / 新增排班`。
  - 弹窗与回填：点击首个班次打开 `调整班次`，结构为 `.aw-mask/.aw-modal/.head/.body/.foot`；选择 `C夜` 并填写原因后保存，反馈 `已保存 三红 06-01 周一 的班次调整`，首行来源变为 `手工调整`，首格回填为 `C夜`。
- URL：`http://localhost:5173/production/production-schedules?action=排班计划`。
  - 表头：`序号 / 计划编号 / 计划名称 / 适用班组 / 循环模式 / 周期 / 人数 / 计划工时 / 需求工时 / 覆盖率 / 冲突 / 审批 / 状态 / 操作`。
  - 行数：3；首行：`SP-202606-A01 / 2026年6月总装一班排班 / 总装一班 / A-B-C-R / 2026-06-01 至 2026-06-30 / 18 / 720 / 688 / 104.7% / 1 / 发布免审 / 已发布 / 查看`。
  - 按钮位置：右侧工具栏 `发布 / 归档 / 冲突校验 / 新增排班计划`；底部全选、批量、分页独立在表格下方。
  - 弹窗：点击 `查看` 打开 `排班计划详情`；点击 `冲突校验` 打开 `排班冲突校验`，表头 `等级 / 定位 / 冲突规则 / 处理建议`，3 行，首行 `高 / 李工 / 06-07 周日 / 连续夜班后 8 小时内安排早班 / 建议改为 R 或 D`。
- URL：`http://localhost:5173/production/production-schedules?action=生产班组`。
  - 版式：左侧车间分组树，右侧班组卡片网格。
  - 卡片数：3；首卡 `总装一班 / 三班两运转 / 总装车间 / 总装产线A / 班组长 三红`。
  - 按钮位置：右侧工具栏 `导出 / 新建班组`。
  - 弹窗：点击首卡打开 `班组人员`，表头 `姓名 / 工号 / 工位/产线 / 技能 / 资质 / 周工时上限 / 本月计划工时`，3 行，首行 `三红 / P006 / 总装工位01 / 总装 / 装配上岗证 / 48h / 160h`。
- URL：`http://localhost:5173/production/production-schedules?action=工作日历`。
  - 版式：月历网格 + 例外日卡片 + 图例。
  - 月历格：35；例外日：3；按钮位置：右侧工具栏 `同步法定节假日 / 新增工作日历`。
  - 弹窗：点击 `新增工作日历` 打开对应弹窗，结构为 `.aw-mask/.aw-modal/.head/.body/.foot`。
- URL：`http://localhost:5173/production/production-schedules?action=班次管理`。
  - 版式：班次卡片网格；卡片数：7；首卡 `A / 早班 / 启用 / 08:00-16:00 / 8h / 60分钟`。
  - 按钮位置：右侧工具栏 `批量停用 / 导出 / 新增班次`。
  - 弹窗与 create API：点击 `新增班次` 打开 `新增班次`，保存后反馈 `新增班次 已保存并调用生产排班 create API`，卡片数由 7 变 8；点击 `编辑` 打开 `编辑班次` 弹窗。
- URL：`http://localhost:5173/production/production-schedules?setting=strategies`。
  - 设置入口：未被破坏，进入 `生产排班` 设置页，显示 `排班策略`。

构建结果：
- 使用 bundled Node 执行 `node .\node_modules\vue-tsc\bin\vue-tsc.js --noEmit` 通过。
- 使用 bundled Node 执行 `node .\node_modules\vite\bin\vite.js build` 通过，仅保留 Vite chunk 体积警告。
- 浏览器控制台错误：0 条。

### 2026-05-29 - 研发中心新增工序 Tab JSX 样式回正

用户指出：
- 母版是大原则，不应把有明显业务差异的位置死板套成通用组件；`/rd/processes?action=new` 的工序配置 Tab 需要在母版基础上按原 `process-list.jsx` 的样式差异实现。

已完成：
- 仅修改 `vue3/src/views/rd/RdResourcePage.vue`。
- 新增工序外层仍使用 `AwFormPage`、顶部返回/保存动作和研发 create API 调用。
- `工序配置` 卡片内部改为工序专属渲染，不再使用详情页 Tab 样式和 `AwEditableSubTable`。
- Tab 回到 JSX 的 `.aw-tabs / .t` 样式。
- 工位、副产品、技术参数、质检方案表格回到 JSX 的 `.aw-table` 样式。
- `工时 / 副产品 / 质检方案` 开关回到 JSX 的 `.aw-switch / .off` 样式。
- `+ 添加工位 / + 选择副产品 / + 添加参数 / + 添加质检方案` 按钮回到 `.aw-btn`，不再被拉满整行。
- 副产品和质检方案补回 JSX 虚线空态文案。

浏览器复验记录：
- URL：`http://localhost:5173/rd/processes?action=new`。
- 工序配置卡片：存在 `.rd-process-config-card`；内部不存在 `.aw-detail-tabs`；内部不存在 `.aw-doc-tbl-wrap / .aw-doc-tbl`。
- Tab：DOM 为 `.aw-tabs .t`，顺序 `工位 / 工时 / 副产品 / 技术参数 / 质检方案`。
- 工位：表格 class 为 `aw-table rd-process-jsx-table`，表头 `工位编码 / 工位名称 / 所属生产线 / 所属车间 / 所属工厂 / 操作`；`+ 添加工位` 按钮宽度约 `96px`，未拉满。
- 工时：默认 `工时配置已关闭`，开关 class `aw-switch off`；开启后 class `aw-switch`，字段单位为 `分钟 / 分钟 / 分钟 / 元`。
- 副产品：默认 `副产品配置已关闭`；开启后显示虚线空态 `暂未选择副产品，请点击上方按钮选择`；点击 `+ 选择副产品` 后表头 `图片 / 产品名称 / 产品编号 / 型号 / 分类 / 单位 / 获取方式 / 操作`，首行 `温湿度传感器 / CP-001 / IWS-TH200 / 废料 / 只 / 自制件`。
- 技术参数：无开关，表头 `参数名称 / 参数值 / 操作`，输入 placeholder 为 `请输入参数名称 / 请输入参数值`；单行时不显示删除；`+ 添加参数` 按钮宽度约 `96px`。
- 质检方案：默认 `质检方案配置已关闭`；开启后显示说明和虚线空态 `暂未选择质检方案，请点击下方按钮添加 IPQC 质检方案`；点击 `+ 添加质检方案` 后表头 `方案编号 / 方案名称 / 适用范围 / 抽样规则 / 关键控制点 / 状态 / 操作`，首行 `QCP-IPQC-001 / 制程首件检验方案 / 加工工序 / 首件 + 每2小时巡检 / 尺寸 / 外观 / 扭矩 / 启用`。
- 保存反馈：点击 `保存` 后显示 `工序管理已保存，已通过新增接口调用。`。
- 设置入口兼容：`http://localhost:5173/rd/processes?setting=numbers` 仍进入工序管理编号设置页，未出现 `.rd-process-config-card`。

构建结果：
- `.\node_modules\.bin\vue-tsc.CMD --noEmit` 通过。
- `.\node_modules\.bin\vite.CMD build` 通过，仅保留 Vite chunk 体积警告。

### 2026-05-29 - 研发中心新增工序配置 Tab 开关回齐

用户指出：
- `/rd/processes?action=new` 新增工序中 `工位 / 工时 / 副产品 / 技术参数 / 质检方案` 的 Tab 需要按原 `process-list.jsx` 回齐；其中 `工时 / 副产品 / 质检方案` 不是直接展示内容，而是 Tab 内开关控制。

JSX 对照结论：
- `process-list.jsx` 中 `工位` 默认 1 行工位数据，无开关。
- `工时` 有 `工时配置` 开关，默认关闭；开启后显示 `标准工时 / 辅助工时 / 冷却工时 / 工序成本`，单位分别为 `分钟 / 分钟 / 分钟 / 元`。
- `副产品` 有 `副产品配置` 开关，默认关闭；开启后显示 `+ 选择副产品` 和副产品表格/空态。
- `技术参数` 无开关，默认 1 行空参数，单行时删除不显示，新增第二行后才允许删除。
- `质检方案` 有 `质检方案配置` 开关，默认关闭；开启后显示说明、空态、`+ 添加质检方案` 和质检方案表格。

已完成：
- 修改 `vue3/src/views/rd/RdResourcePage.vue`，在研发新增通用 Tab 渲染中补回工序专属开关逻辑。
- 修改 `vue3/src/app/api/rd/resources.ts`，将新增工序 mock 配置改为：工位默认 1 行、工时字段由开关控制、副产品默认空数组、技术参数默认 1 行空参数、质检方案默认空数组。
- 未修改公共组件，未改静态 JSX/HTML，不影响 `?setting=` 设置入口。

浏览器复验记录：
- URL：`http://localhost:5173/rd/processes?action=new`。
- Tab 顺序：`工位 / 工时 / 副产品 / 技术参数 / 质检方案`。
- 工位：表头 `序号 / 工位编码 / 工位名称 / 所属生产线 / 所属车间 / 所属工厂 / 操作`，默认 1 行，首行 `GW-001 / 车削工位A / 生产线1 / 一车间 / 海南傲为工厂`。
- 工时：默认 `工时配置已关闭`，不显示工时字段；开启后显示 `工时配置已开启`，字段为 `标准工时 / 辅助工时 / 冷却工时 / 工序成本`，单位为 `分钟 / 分钟 / 分钟 / 元`。
- 副产品：默认 `副产品配置已关闭`，不显示副产品表头；开启后显示 `副产品配置已开启`，按钮 `选择副产品`，表头 `序号 / 图片 / 产品名称 / 产品编号 / 型号 / 分类 / 单位 / 获取方式 / 操作`。
- 技术参数：无开关；表头 `序号 / 参数名称 / 参数值 / 操作`，默认 1 行空参数，单行时未显示删除。
- 质检方案：默认 `质检方案配置已关闭`，不显示质检方案表头；开启后显示 `质检方案配置已开启`，按钮 `添加质检方案`，表头 `序号 / 方案编号 / 方案名称 / 适用范围 / 抽样规则 / 关键控制点 / 状态 / 操作`。
- 保存反馈：点击 `保存` 后显示 `工序管理已保存，已通过新增接口调用。`。

交叉验证遗留差异：
- 本次只补回用户点名的 Tab 开关/默认行/字段单位行为。
- 原 JSX 里工位、副产品、质检方案、关联文档使用选择弹窗；当前 Vue 对其中部分选择器仍沿用通用新增页能力，后续如继续要求“新增工序按 JSX 全量回齐”，应单独补选择弹窗、空态文案和回填细节。

构建结果：
- `.\node_modules\.bin\vue-tsc.CMD --noEmit` 通过。
- `.\node_modules\.bin\vite.CMD build` 通过，仅保留 Vite chunk 体积警告。

### 2026-05-29 - 研发中心新增 BOM 配置弹窗按 JSX 风格放大回齐

用户指出：
- `/rd/bom?action=new` 配置物料清单弹窗过小，布局和 `bom-new-screen.jsx` / `bom-new.css` 风格差异明显。
- 要求弹窗加大，并严格按照 JSX 的风格布局处理。

已完成：
- 修改 `vue3/src/views/rd/RdResourcePage.vue`。
- 修改 `vue3/src/app/api/rd/resources.ts`，为 `BomNode` 补充 `remark` 字段，支撑右侧属性面板备注回填。
- 保留外层 `.aw-mask / .aw-modal / .head / .body / .foot` 行为，弹窗尺寸回到 JSX 级别：`min(1480px, 100vw - 44px)`、`min(900px, 100vh - 44px)`。
- 配置弹窗内部切回 `bn-*` 风格结构：`bn-config-modal`、`bn-create-steps`、`bn-variant-card`、`bn-editor`、`bn-table`、`bn-empty-builder`、`bn-props`。
- 空 BOM 状态补齐两个入口：`+ 添加根物料`、`从 Excel 导入`。
- 右侧属性面板补齐 JSX 关键字段：毛用量、备注、底部 `移除此项 / 应用`。
- 属性配置从普通 modal 改为 JSX 风格右侧抽屉：`.aw-drawer-mask / .aw-drawer / bn-drawer-*`。

浏览器复验记录：
- URL：`http://localhost:5173/rd/bom?action=new`。
- 操作：刷新页面，点击 `+ 添加物料清单`。
- 弹窗结构：`.aw-modal.rd-structure-wide.bn-config-modal`，视口 `1325x728` 下实际约 `1269x672`，已按视口放到最大。
- 五步条：`填写基础信息 / 确认规格 / 添加根物料 / 添加子件 / 完善属性`，使用 `.bn-step`。
- 表头：`☐ 选、行号、物料、适用型号、用量、单位、物料类型、替代料、损耗%、毛用量、关联工序、单价、小计、材质、长度、重量、工时、操作`。
- 空态：显示 `BOM 清单还是空的`，按钮为 `+ 添加根物料` 和 `从 Excel 导入`。
- 添加根物料后：`.bn-editor` 进入 `with-panel`，右侧属性面板显示 `基础 / 规格属性 / 替代料 / 变更记录`。
- 右侧属性面板字段：物料编码、名称、物料类型、单位、用量、损耗%、毛用量、单价、关联工序、备注。
- 属性配置：点击 `属性配置` 后打开右侧抽屉，标题 `属性配置`，分区为 `预置属性库 / 自定义属性 / 已启用属性`，底部按钮 `取消 / 应用配置`。

构建结果：
- `.\node_modules\.bin\vue-tsc.CMD --noEmit` 通过。
- `.\node_modules\.bin\vite.CMD build` 通过，仅保留 Vite chunk 体积警告。

### 2026-05-29 - 生产中心 MRP 配置与建议弹窗尺寸统一

用户指出：
- `齐套检查` 的 `MRP运算` 和 `MRP运算建议` 属于同一流程，不能出现两个不同高度的弹窗。

已完成：
- 仅修改 `vue3/src/views/production/ProductionResourcePage.vue`。
- `production-mrp-modal` 增加统一高度 `min(736px, calc(100vh - 32px))`，配置页和建议页共用同一主弹窗尺寸。
- `.production-mrp-modal .body` 增加 `flex: 1; min-height: 0;`，保证 body 占满剩余空间，footer 在配置页/建议页保持同一位置。
- 继续保留 `.aw-mask / .aw-modal / .head / .body / .foot` 通用弹窗结构。

浏览器复验记录：
- URL：`http://localhost:5173/production/production-plans?id=plan_001`。
- `MRP运算` 弹窗尺寸：`1240px x 696px`，body `610px`，footer y 坐标 `680`。
- 点击 `确定` 后 `MRP运算建议` 弹窗尺寸：`1240px x 696px`，body `610px`，footer y 坐标 `680`。
- 两步 `sameModalSize=true`，`sameFootY=true`；建议表行数 3，表头仍为 `选择 / 序号 / 物品编号 / 物品名称 / 规格型号 / 单位 / 品牌 / 建议采购日期 / 建议采购量 / 已采购量 / 待采购量 / 供应商`。

构建结果：
- `vue-tsc --noEmit` 通过。
- `vite build` 通过，仅保留 Vite chunk 体积警告。

### 2026-05-29 - 生产中心 MRP 运算弹窗按 JSX 结构重排

用户指出：
- `/production/production-plans?id=plan_001` 的 `齐套检查 / MRP运算` 弹窗与 JSX 截图不一致：帮助说明被展开挤入正文，公式区拥挤，并出现横向滚动。

问题原因：
- MRP 弹窗由 `ProductionResourcePage.vue` 内部 `defineComponent + h()` 子组件渲染；原先写在当前 SFC 的 scoped 样式没有命中子组件 DOM，导致 `.aw-help-pop` 未被隐藏，`.aw-chk` 和弹窗尺寸样式也没有稳定生效。
- 主弹窗仍受公共 `.aw-modal.lg{width:min(860px,...)}` 影响时，JSX 的三段公式和底部左右明细块会被压缩成横向滚动。

已完成：
- 仅修改 `vue3/src/views/production/ProductionResourcePage.vue`。
- 保留 `.aw-mask / .aw-modal / .head / .body / .foot` 通用弹窗结构，不新增私有 `production-modal`。
- MRP 配置弹窗按 `manufacturing-list.jsx` 重排为：计算范围两行布局、三段公式布局、底部左右两块明细布局。
- MRP 主弹窗 `production-mrp-modal` 宽度固定为 `min(1240px, calc(100vw - 40px))`，仓库选择弹窗 `production-mrp-picker-modal` 宽度为 `min(1040px, calc(100vw - 56px))`。
- 将 MRP 弹窗专属 `.aw-help-pop / .aw-help-tip / .aw-chk` 样式改为限定在 `.production-mrp-modal / .production-mrp-picker-modal` 下的全局选择器，解决 scoped 样式不命中问题，影响范围只限生产 MRP 弹窗。

浏览器复验记录：
- URL：`http://localhost:5173/production/production-plans?id=plan_001`。
- 操作：进入 `齐套预估`，点击 `齐套检查` 打开 `MRP运算` 弹窗。
- 主弹窗结构：`.aw-mask / .aw-modal.lg.production-mrp-modal / .head / .body / .foot`。
- 主弹窗尺寸：`1240px x 655px`；`.body` 无横向滚动，`scrollWidth=clientWidth=1240`。
- 帮助浮层：`.aw-help-pop` 默认 `display: none`，位置为 `absolute`，不再占用正文空间。
- 公式区：grid 列宽展开为 `90px / 100px / 20px / 300px / 24px / 270px / 24px / 300px`，与 JSX 三段公式结构一致。
- 底部明细：左右两块各约 `586px`，不再挤成一团。
- 点击 `确定` 后进入 `MRP运算建议`，同样使用 `1240px` 主弹窗；建议表表头为 `选择 / 序号 / 物品编号 / 物品名称 / 规格型号 / 单位 / 品牌 / 建议采购日期 / 建议采购量 / 已采购量 / 待采购量 / 供应商`，行数 3，无横向滚动。

构建结果：
- `vue-tsc --noEmit` 通过。
- `vite build` 通过，仅保留 Vite chunk 体积警告。

### 2026-05-29 - 生产中心齐套检查/MRP 弹窗宽度修复

用户指出：
- `/production/production-plans?id=plan_001` 齐套检查弹窗太小，公式区全部挤在一起；后续齐套建议弹窗也需要更大。

已完成：
- 仅修改 `vue3/src/views/production/ProductionResourcePage.vue`。
- MRP 配置/建议主弹窗保留 `.aw-mask / .aw-modal / .head / .body / .foot` 结构，新增业务尺寸 class `production-mrp-modal`，宽度调整为 `min(1240px, calc(100vw - 40px))`，高度为 `calc(100vh - 32px)`。
- MRP 仓库选择二级弹窗新增 `production-mrp-picker-modal`，宽度调整为 `min(1040px, calc(100vw - 56px))`。
- 未修改公共组件，未新增 `production-modal` 私有弹窗 class。

验证记录：
- `vue-tsc --noEmit` 通过。
- `vite build` 通过，仅保留 Vite chunk 体积警告。
- 构建产物 CSS 已包含 `.production-mrp-modal{width:min(1240px,calc(100vw - 40px));max-height:calc(100vh - 32px)}` 和 `.production-mrp-picker-modal{width:min(1040px,calc(100vw - 56px))}`。

### 2026-05-29 - 生产中心详情页交互与弹窗对齐修复

用户指出：
- 生产中心详情页需要继续对比 JSX 的每一个交互按钮、字段、布局结构和弹窗。
- 明确保留详情编辑态，以及头部 `删除 / 停用`。

已完成：
- 仅修改 Vue3 工程生产中心详情实现和生产 mock 表数据，未修改静态 JSX/HTML 作为交付。
- 保留 `修改` 编辑态，保存仍走 `updateProduction`；保留头部 `删除 / 停用 / 打印 / 导出`，动作仍走生产 API adapter/mock。
- 生产需求详情 `产品明细` 的 `计划 / 订单` 恢复 JSX 行为：`计划` 进入生成生产计划页；`订单` 打开启动生产订单确认弹窗。
- 生产计划详情 `启动计划` 恢复确认弹窗：`取消 / 不检查，直接生成订单 / 先齐套检查`。
- 生产计划详情 `齐套预估` 恢复空态居中 `齐套检查`；MRP 配置弹窗、帮助浮层、仓库选择二级弹窗、MRP 建议表、采纳建议、查看单据、撤回建议均可交互。
- 生成生产订单列表改回 JSX 的全量产品列表逻辑，不再按当前单行限制。
- 生产工单详情 `工艺流程` 的 `领料` 恢复工序领料弹窗，footer 为 `关闭 / 暂存 / 确认领料`，确认调用 mock 动作并反馈。
- 委外详情 `委外发料` 初始记录改为空态：`暂无发料记录`；点击 `发料` 打开委外发料弹窗，确认后调用 mock 动作并回填出库记录。
- 弹窗继续使用 `.aw-mask / .aw-modal / .head / .body / .foot`，未新增 `production-modal` 等私有弹窗 class。

交叉验证：
- 派出智能体只读复核两轮。第一轮指出 5 个差异：生成订单单行限制、齐套空态说明文字、MRP 帮助/仓库选择缺失、MRP 表格重复序号、委外发料方式硬编码。
- 已逐项修复后再次复核；剩余 MRP 帮助 `毛需求` 文案差异已按 JSX 原文补齐。
- Vue 工程没有 JSX 的 `PurchaseListToolbar` 可直接复用，仓库选择弹窗按 JSX 可见结构补齐 subtitle、搜索输入、表头、默认选中和取消/确定行为。

浏览器验收记录：
- URL：`http://localhost:5173/production/production-demands?id=demand_001`。
  - `产品明细`表头：`序号 / 来源类型 / 来源单据 / 来源明细 / 产品编号 / 产品名称 / 规格型号 / 单位 / 需求数量 / 需求日期 / 交付日期 / 备注 / 操作`。
  - 首行：`销售订单 / SO-20260517001 / SO-20260517001-01 / CP-2025010101 / 智能温控终端 / PRO / 台 / 120 / 2026-05-17 / 2026-05-30 / - / 计划/订单`。
  - 点击 `计划` 后进入生成生产计划页，顶部按钮为 `返回列表 / 生成生产计划`。
  - 点击 `订单` 后打开 `启动生产订单` 弹窗，结构包含 `.aw-mask / .aw-modal / .head / .body / .foot`，按钮为 `取消 / 不检查，直接生成订单 / 先齐套检查`。
  - 点击 `不检查，直接生成订单` 后进入生成订单列表，行数 3，顶部按钮为 `返回列表 / 一键生成`。
- URL：`http://localhost:5173/production/production-plans?id=plan_001`。
  - 头部按钮：`返回列表 / 启动计划 / 修改 / 删除 / 打印 / 导出 / 停用`。
  - `启动计划` 弹窗按钮：`取消 / 不检查，直接生成订单 / 先齐套检查`。
  - `不检查，直接生成订单` 后生成订单列表行数 3。
  - `齐套预估`空态仅显示居中 `齐套检查`按钮。
  - MRP 配置弹窗 title 为 `MRP运算`，有 `MRP运算说明`帮助浮层；切换 `选择参与计算的仓库` 后显示 `选择仓库`按钮。
  - 仓库弹窗 title/subtitle：`选择仓库 / 可多选参与或不参与 MRP 运算的仓库`；搜索 placeholder：`搜索仓库编号、仓库名称、地址`；表头：`选择 / 仓库编号 / 仓库名称 / 仓库地址 / 温区 / 状态`；默认选中 `WH-001 / WH-002`，确定后回填输入框。
  - MRP 建议表头：`选择 / 序号 / 物品编号 / 物品名称 / 规格型号 / 单位 / 品牌 / 建议采购日期 / 建议采购量 / 已采购量 / 待采购量 / 供应商`，行数 3，没有额外重复序号列。
  - `采纳建议` 后回填 `齐套预估`表，表头：`序号 / 建议类型 / 关联单据 / 物料/产品编号 / 名称 / 规格型号 / 单位 / 建议数量 / 建议日期 / 责任对象 / 生成状态 / 确认状态 / 单据状态 / 操作`，行数 4。
  - `查看` 打开单据详情弹窗；`撤回` 后首行状态变为 `已撤回 / - / 已关闭`。
- URL：`http://localhost:5173/production/production-work-orders?id=work_order_001`。
  - `工艺流程`表头：`序号 / 工序号 / 工序名称 / 工序类型 / 工位/产线 / 计划数量 / 作业标准 / 计划开工 / 计划完工 / 领派方式 / 负责人 / 工序状态 / 操作`。
  - 首行：`10 / 备料 / 准备工序 / 线边仓 / 120 / 按BOM齐套领料 / 2026-05-18 / 2026-05-18 / 领工模式 / 张仓 / 待领料 / 领料`。
  - 点击 `领料` 打开 `工序领料`弹窗，表头包含 `物料编码 / 物料名称 / 规格型号 / 单位 / 需求数量 / 已领取 / 待领取 / 批次 / 仓库/库位 / 操作`，按钮为 `关闭 / 暂存 / 确认领料`。
  - 点击 `确认领料` 后反馈：`工序领料动作已通过 mock 接口提交。`
- URL：`http://localhost:5173/production/outsource-orders?id=outsource_001`。
  - `委外发料`表头：`序号 / 出库单号 / 委外单号 / 发料方式 / 本次发料数量 / 出库仓库 / 操作人 / 生成时间 / 出库状态 / 操作`。
  - 初始空态：`暂无发料记录 / 点击右上角发料按钮，填写本次发料方式和数量后生成出库单`。
  - 点击 `发料` 打开 `委外发料`弹窗，发料方式字段回填 `row.issueMode || row.issueType || 按需发料`，当前值为 `按需发料`，按钮为 `取消 / 确认发料`。
  - 点击 `确认发料` 后回填首行：`CK-WW-20260518001 / OS-20260517001 / 按需发料 / 100 / 原料仓 / 张仓 / 2026-05-18 16:30 / 部分发料 / 查看出库单`，反馈：`委外发料动作已通过 mock 接口提交，并回填委外发料记录。`

构建结果：
- 使用 Codex bundled Node 执行 `vue-tsc --noEmit` 通过。
- 使用 Codex bundled Node 执行 `vite build` 通过，仅保留 Vite chunk 体积警告。

浏览器新增页验收记录：
- `/production/production-demands?action=new`：字段为 `需求主题 / 需求编号 / 需求状态 / 生产部门 / 负责人 / 计划开始日期 / 计划完成日期 / 优先级`；表头为 `序号 / 来源类型 / 来源单据 / 来源明细 / 产品编号 / 产品名称 / 规格型号 / 单位 / 需求数量 / 需求日期 / 交付日期 / 备注 / 操作`；初始行数 0；新增按钮为 `+ 新增明细` 并显示 JSX 提示；产品弹窗结构为 `.aw-mask > .aw-modal > .head/.body/.foot`，选择首行后回填 `CP-2025010101 / 智能温控终端 / PRO / 台`，行数 1；提交反馈 `生产需求已通过 create API 提交`。
- `/production/production-plans?action=new`：字段为 `计划主题 / 计划编号 / 生产来源 / 来源主体 / 来源交付日期 / 生产部门 / 负责人 / 计划开始日期 / 计划完成日期 / 优先级`；表头为 `序号 / 来源类型 / 来源单据 / 来源明细 / 产品编号 / 产品名称 / 规格型号 / 单位 / 需求数量 / 计划数量 / 计划开工 / 计划完工 / 备注 / 操作`；初始行数 2；来源弹窗确认 `MR-20260517001` 后回填 `生产需求 / MR-20260517001`、`2026-05-30`，再选产品后行数 3；提交反馈 `生产计划已通过 create API 提交`。
- `/production/production-orders?action=new`：字段为 `生产主题 / 生产编号 / 生产来源 / 来源主体 / 来源交付日期 / 生产状态 / 生产部门 / 负责人 / 计划开始日期 / 计划完成日期 / 优先级 / 生产产品 / 生产数量`；工单明细表头为 `序号 / 工单编号 / 工单类型 / 工单名称 / 半成品/成品 / 工序 / 工位/产线 / 计划数量 / 已完成 / 合格 / 不良 / 负责人 / 质检节点 / 状态 / 操作`；初始行数 3，首行含 `80 / 78 / 2 / 生产中`；来源确认后仍保留报工状态数据；提交反馈 `生产订单已通过 create API 提交`。
- `/production/production-work-orders?action=new`：字段为 `工单主题 / 工单编号 / 生产部门 / 负责人 / 计划开始日期 / 计划完成日期 / 优先级 / 选择产品`；工艺流程表头为 `序号 / 工序号 / 工序名称 / 工序类型 / 工位/产线 / 计划数量 / 作业标准 / 计划开工 / 计划完工 / 操作`；初始行数 0；产品选择后回填 `智能温控终端 / CP-2025010101`，行数 4，批量模式按钮为 `领工模式 / 派工模式 / 自由模式`；提交反馈 `生产工单已通过 create API 提交`。
- `/production/outsource-orders?action=new`：字段为 `委外主题 / 委外编号 / 来源主体 / 来源交付日期 / 优先级 / 委外方式 / 委外加工商 / 发料方式`；委外明细表头为 `序号 / 来源单据 / 产品编号 / 产品名称 / 规格型号 / BOM版本 / BOM锁版 / 工艺路线 / 工艺锁版 / 源单需求数量 / 委外数量 / 单位 / 成本费用 / 计划交付 / 备注 / 操作`；初始行数 2；来源确认后打开委外范围弹窗，确认整单委外后行数 1、回填来源主体 `海南微为智造产业有限公司` 和交付日期 `2026-06-03`；供应商弹窗选择后回填 `深圳协同加工厂`；提交反馈 `委外加工已通过 create API 提交`。

兼容说明：
- `?setting=` 入口判断仍在 `ProductionResourcePage.vue` 顶层 `settingModule`，本轮未改设置页路由体系。
- 列表“查看”仍保持只提示，不进入详情实现。

### 2026-05-29 - 研发中心新增页按 JSX 回齐

用户确认：
- 新增页字段先对齐 JSX。
- BOM 类型选项本轮不改，继续沿用当前列表枚举。
- 工艺路线 `序号` 由 `AwEditableSubTable` 母版序号承接，不再配置业务重复序号列。
- 代替物料继续在页头红字标注 `未完成`，后续再改。

已完成：
- 仅修改 Vue3 工程：`vue3/src/app/api/rd/resources.ts`、`vue3/src/views/rd/RdResourcePage.vue`。
- 新增页配置全部迁回研发 adapter/mock；未改静态 JSX/HTML。
- 通用新增渲染补充 `defaultValue`、富文本卡片前置字段、可隐藏附件/富文本区的配置能力；未修改公共组件。
- 文档新增回齐 JSX：`基本信息 / 安全与外发控制 / 正文内容 / 附件`，字段顺序含 `文档编号、文档名称、文档类型、所属分类、版本号、编制人、生效日期、失效日期、审批流程`，外发控制含 `电子签章、水印策略、外发权限、下载审批、外发有效期、下载次数、授权对象、审批流程、操作留痕`。
- 项目新增回齐 JSX：移除 Vue 多出的客户/来源、阶段、预算、目标、成员表，保留 `项目编号、项目名称、项目分类、二级分类、优先级、负责人、开始日期、计划完成日期、来源主体、项目详情、附件`。
- 产品新增回齐 JSX：移除 Vue 多出的规格型号、版本、负责人、关联 BOM 入口；型号表头改为 `型号编码 / 规格名称 / 备注 / 启用`；销售单位表头改为 `销售单位 / 换算数量 / 条形码`；库存字段回齐 `安全库存量 / 最低库存量 / 最高库存量 / 补货周期（天） / 存储位置`。
- 物料新增回齐 JSX：移除 Vue 多出的属性、默认仓库、默认供应商、替代料关系；采购单位倍数表回齐 `供应单位 / 换算系数 / 条形码`；库存字段回齐 `采源预警（天） / 补货周期（天）`。
- 工序新增回齐 JSX 五 Tab：`工位 / 工时 / 副产品 / 技术参数 / 质检方案`；工位表头为 `工位编码 / 工位名称 / 所属生产线 / 所属车间 / 所属工厂`；副产品、技术参数、IPQC 质检方案表头按 JSX 回齐；工序说明补 `关联文档`。
- 工艺新增回齐 JSX：`工艺编码` 改回 `工艺编号`；适用范围、工艺状态选项按 JSX 回齐；工艺路线表头由母版序号承接 JSX 序号，并保留 `工序编号 / 工序名称 / 节点类型 / 执行方式 / 前置工序 / 并行组 / 标准工时 / 质检点 / 返工触发 / 回流目标 / 备注`。
- BOM 新增保持当前高风险专项实现和列表枚举，不改 `生产BOM / 工程BOM / 虚拟BOM`；基础字段、结构弹窗、五步、物料层级、替代料、损耗、毛用量、关联工序继续保留。
- 代替物料新增保持需求型字段，页头继续显示 `BOM管理 未完成`。

构建结果：
- 使用 Codex bundled Node 执行 `vue-tsc --noEmit` 通过。
- 使用 Codex bundled Node 执行 `vite build` 通过，仅保留 Vite chunk 体积警告。

浏览器新增页验收记录：
- `/rd/doc?action=new`：字段为 `文档编号 / 文档名称 / 文档类型 / 所属分类 / 版本号 / 编制人 / 生效日期 / 失效日期 / 审批流程 / 电子签章 / 水印策略 / 外发权限 / 下载审批 / 外发有效期 / 下载次数 / 授权对象 / 审批流程 / 操作留痕`；区块为 `基本信息 / 安全与外发控制 / 附件 / 正文内容`；提交反馈 `文档库已提交审批，已通过新增接口调用。`
- `/rd/projects?action=new`：字段为 `项目编号 / 项目名称 / 项目分类 / 二级分类 / 优先级 / 负责人 / 开始日期 / 计划完成日期 / 来源主体`；选择负责人回填 `老夏`，来源主体回填 `海南微为智造温控锅订单`；提交反馈 `项目管理已提交审批，已通过新增接口调用。`
- `/rd/products?action=new`：字段为 `产品名称 / 别名码 / 产品编号 / 产品分类 / 二级分类 / 获取方式 / 标准单位 / 销售控制 / 产品状态 / 物码管控模式 / 关联码类型`；Tab 为 `销售信息 / 库存策略 / 媒体与说明`；型号表头为 `序号 / 型号编码 / 规格名称 / 备注 / 启用 / 操作`，行数 `3 -> 4 -> 3`；销售单位表头为 `序号 / 销售单位 / 换算数量 / 条形码 / 操作`；提交反馈 `产品管理已提交审批，已通过新增接口调用。`
- `/rd/materials?action=new`：字段为 `物料名称 / 拼音码 / 物料编号 / 物料分类 / 二级分类 / 物料规格 / 获取方式 / 标准单位 / 销售控制 / 物料状态`；Tab 为 `采购信息 / 库存策略 / 媒体与说明`；采购单位表头为 `序号 / 供应单位 / 换算系数 / 条形码 / 操作`；库存字段含 `最大库存 / 安全库存 / 采源预警（天） / 最低库存量 / 补货周期（天）`；提交反馈 `物料管理已提交审批，已通过新增接口调用。`
- `/rd/processes?action=new`：字段为 `工序编码 / 工序名称 / 工序类型 / 工序分类`；Tab 为 `工位 / 工时 / 副产品 / 技术参数 / 质检方案`；工位表头为 `序号 / 工位编码 / 工位名称 / 所属生产线 / 所属车间 / 所属工厂 / 操作`；副产品表头为 `序号 / 图片 / 产品名称 / 产品编号 / 型号 / 分类 / 单位 / 获取方式 / 操作`；技术参数表头为 `序号 / 参数名称 / 参数值 / 操作`；质检方案表头为 `序号 / 方案编号 / 方案名称 / 适用范围 / 抽样规则 / 关键控制点 / 状态 / 操作`；保存反馈 `工序管理已保存，已通过新增接口调用。`
- `/rd/crafts?action=new`：字段为 `工艺编号 / 工艺名称 / 适用产品 / 工艺版本 / 适用范围 / 是否默认工艺 / 生效日期 / 负责人 / 工艺状态 / 关联文档`；选择适用产品回填 `iPhone17`；工艺路线表头为 `序号 / 工序编号 / 工序名称 / 节点类型 / 执行方式 / 前置工序 / 并行组 / 标准工时 / 质检点 / 返工触发 / 回流目标 / 备注 / 操作`，行数 `1 -> 2 -> 1`；提交反馈 `工艺管理已提交审批，已通过新增接口调用。`
- `/rd/bom?action=new`：基础字段为 `BOM编号 / BOM名称 / 适用产品 / 版本号 / BOM类型 / 编制人 / 生效日期 / 审批流程`；选择适用产品回填 `iPhone17`；结构弹窗为 `.aw-mask > .aw-modal.rd-structure-wide > .head/.body/.foot`，五步为 `填写基础信息 / 确认规格 / 添加根物料 / 添加子件 / 完善属性`；物料清单表头含 `行号 / 物料 / 适用型号 / 用量 / 单位 / 物料类型 / 替代料 / 损耗% / 毛用量 / 关联工序 / 单价 / 小计`，根物料和子项后行数为 `2`；暂存反馈 `BOM管理已保存草稿，已通过新增接口调用。`
- `/rd/bom?tab=substitute&action=新增代替`：页头显示 `BOM管理 未完成`；字段为 `主物料 / 主物料编码 / 替代物料 / 替代物料编码 / 替代比例 / 优先级 / 生效日期 / 失效日期 / 状态`；主物料回填 `智能温控锅总成 / M-100`，替代物料回填 `机身子装配 / M-110`；提交反馈 `代替物料已提交审批，已通过新增接口调用。`

兼容说明：
- 未破坏 `/rd/*?setting=` 设置页入口判断；浏览器复查 `/rd/projects?setting=numbers` 可正常进入设置页，显示 `编号项`。
- 本轮未实现详情页。
- 交叉验证后补齐：委外供应商弹窗标题改为 `选择委外加工商`；mock `createProduction` 在 mock 模式写回当前生产列表，复查 `/production/production-demands?action=new` 提交后回到列表，首行出现新建记录，列表行数由 3 变为 4。

### 2026-05-29 - 未完成中心一级/二级导航与浮窗接入

范围限定：
- 只接 `售后、质检、人力、财务、设备、能耗、设置` 的工作台、二级导航、三级/四级浮窗。
- 不做列表页、新增页、详情页、设置页业务实现。
- 导航文案与分组以 `components.jsx` 对应中心配置为准。

已完成：
- 修改 `vue3/src/layouts/erp-shell/navigation.ts`。
- 保留顶部一级导航顺序：`PRD / 研发 / 采购 / 销售 / 仓储 / 生产 / 售后 / 质检 / 人力 / 财务 / 设备 / 能耗 / 设置`。
- 未完成中心继续使用 `status: pending`，沿用红色顶栏标识。
- 补齐售后中心二级：`工作台 / 售后单 / 任务管理 / 质量闭环`；浮窗按 JSX 为 `售后单、售后设置、任务管理、任务规则、质量闭环、质改规则`。
- 补齐质检中心二级：`工作台 / 质检总览 / 检验执行 / 异常与处置 / 标准与配置 / 质量分析`；浮窗按 JSX 原文收敛，未把 `qcIpqc/qcFqc/qcOqc/qcItem/qcGroup` 作为二级菜单提前展示。
- 补齐人力、财务、设备、能耗、设置中心二级和全部浮窗分组，设置中心的 `用户/角色/字典/编码/审批/引导` 文案按 JSX 原文修正。
- 修改 `vue3/src/app/router/index.ts`，为上述中心增加一级工作台与二级路径通配路由，统一进入已有 `ContractWorkbenchPage.vue`，不新增业务页。
- 构建时发现既有生产类型缺口：`ProductionRecord` 缺 `attachments`，已在 `vue3/src/app/api/production/types.ts` 补 optional 字段，保持与 `ProductionDetail` 兼容。

构建结果：
- 使用 Codex bundled Node 执行 `pnpm run build` 通过。
- 仅保留 Vite chunk 体积警告。

验证记录：
- `http://localhost:5173/after-sales`、`/qc`、`/hr`、`/finance`、`/equipment`、`/energy`、`/settings` 均返回 200。
- 二级/浮窗目标路由抽查：`/after-sales/service?action=售后列表`、`/qc/execution?action=待检任务`、`/settings/users?action=用户列表` 均返回 200。
- 构建覆盖路由与导航类型检查；本轮未改业务页面和公共组件。

### 2026-05-29 - 研发中心详情页按确认项实现

用户确认：
- 详情页保持现有路由体系，使用 `/rd/*?action=detail&id=...`，不新增 `/rd/*/:id` 独立路径。
- 工艺详情以 JSX `CraftDetailScreenV2` 为主体，并合并 Legacy 的 `编辑 / 复制为新版本 / 打印 / 导出` 操作。
- BOM 详情允许按 `bom-new-screen.jsx` 的结构配置、预览、替代料、版本对比专项实现。
- 代替物料详情暂不实现，列表继续提示未完成。

已完成：
- 仅修改 Vue3 工程：`vue3/src/app/api/rd/resources.ts`、`vue3/src/views/rd/RdResourcePage.vue`。
- 研发 adapter/mock 新增 `getRdDetail / updateRdDetail / approveRdDetail / publishRdDetail / printExportRdDetail / createRdVersion / changeRdDetail`，remote 模式预留 `GET /{resource}/{id}`、`PATCH /{resource}/{id}`、`POST /{resource}/{id}/approve|publish|print|export|versions|changes` 契约。
- 列表“查看”和可点击字段进入详情页；代替物料列表“查看”不跳转，只提示 `代替物料详情暂不实现`。
- 详情页统一复用 `AwDetailPage / AwDetailToolbar / AwDetailHeader / AwDetailTabs / AwDetailInfoGrid`；未修改公共组件。
- 文档详情补齐 JSX Tab：`文档详情 / 文档附件 / 历史版本 / 操作记录`。
- 项目详情补齐 JSX Tab：`项目详情 / 项目成员 / 物料清单 / 工艺流程 / 报价信息 / 采购信息 / 生产信息 / 项目成本 / 操作记录`。
- 产品详情补齐 JSX Tab：`产品信息 / 物码管控 / 销售记录 / 入库记录 / 出库记录 / 客户价格表 / 操作记录`。
- 物料详情补齐 JSX Tab：`物料信息 / 采购记录 / 入库记录 / 出库记录 / 历史价格 / 供应商列表 / 操作记录`。
- 工序详情补齐 JSX Tab 和操作：`工序信息 / 工序工位 / 工序工时 / 副产品 / 技术参数 / 工序质检 / 操作记录`，操作为 `编辑 / 删除 / 暂停`。
- 工艺详情补齐 V2 路线展示、汇总卡、工序只读信息、物料消耗和副产品/废料表，并合并 Legacy 操作。
- BOM 详情补齐 `BOM详情 / BOM结构 / 替代料 / 版本对比 / 变更记录 / 操作记录`，BOM结构支持层级展开/收起。

构建结果：
- 使用 Codex bundled Node 执行 `vue-tsc --noEmit` 通过。
- 使用 Codex bundled Node 执行 `vite build` 通过，仅保留 Vite chunk 体积警告。

浏览器详情页验收记录：
- `/rd/doc` 点击首行查看进入 `/rd/doc?action=detail&id=doc_001`；标题 `智能控制器标准规范`；Tab 为 `文档详情 / 文档附件 / 历史版本 / 操作记录`；基础字段和正文内容显示；操作 `发布 / 版本管理 / 打印 / 导出`；发布反馈 `文档库发布校验已通过`；返回 `/rd/doc` 正常。
- `/rd/projects` 点击首行查看进入 `/rd/projects?action=detail&id=prj_001`；标题 `PRJ-2025-001 智能输送线系统研发`；Tab 为 9 项；物料清单表头 `序号 / 层级 / 物料编码 / 物料名称 / 规格型号 / 单位 / 项目用量 / 损耗率 / 来源 / 状态`，行数 3，首行 `WL-7820864 / 半成品物料 / 500 / 2%`；返回正常。
- `/rd/products` 点击首行查看进入 `/rd/products?action=detail&id=prod_001`；标题 `智能温湿度传感器`；Tab 为 7 项；客户价格表表头 `客户 / 价格(¥) / 有效期起 / 有效期止 / 备注 / 操作`，行数 2，首行 `海南傲为科技有限公司 / 6000.00`；返回正常。
- `/rd/materials` 点击首行查看进入 `/rd/materials?action=detail&id=mat_001`；标题 `STM32F407VGT6 微控制器`；Tab 为 7 项；供应商列表表头 `供应商 / 联系人 / 联系方式 / 供货比例 / 合作状态`，行数 2，首行 `深圳鑫达电子科技有限公司 / 王工 / 70%`；返回正常。
- `/rd/processes` 点击首行查看进入 `/rd/processes?action=detail&id=proc_001`；标题 `轴类零件车削加工`；Tab 为 7 项；工序质检表头 `检验项目 / 标准值 / 检验工具 / 检验频次`，行数 2；编辑反馈 `工序管理修改已记录`；返回正常。
- `/rd/crafts` 点击首行查看进入 `/rd/crafts?action=detail&id=craft_001`；标题 `GY-202605-001 智能温控锅总装工艺`；Tab 为 `工艺详情 / 工艺路线 / 工序列表 / 操作记录`；工艺路线显示串序/并序、自制/委外卡片和工序只读信息；物料消耗表首行 `M-001 / 主控板组件 / 1 / 件`；复制为新版本反馈 `工艺管理新版本草稿已生成`；返回正常。
- `/rd/bom` 点击首行查看进入 `/rd/bom?action=detail&id=bom_001`；标题 `BOM-202605-001 智能温控锅生产BOM`；Tab 为 `BOM详情 / BOM结构 / 替代料 / 版本对比 / 变更记录 / 操作记录`；BOM结构表头含 `行号 / 物料编码 / 物料名称 / 规格 / 适用型号 / 用量 / 单位 / 物料类型 / 替代料 / 损耗% / 毛用量 / 关联工序 / 单价 / 小计`，行数 5，首行 `IP17-000 / iPhone17 整机总成`；折叠根节点后行数 `5 -> 1`；提交审批反馈 `BOM管理已提交审批`；返回正常。
- `/rd/bom?tab=substitute` 点击代替物料查看不跳转，停留原 URL，反馈 `M-112 的代替物料详情暂不实现，保持列表标题“未完成”。`

兼容说明：
- `/rd/projects?setting=numbers` 仍优先进入设置页；详情实现未破坏 `?setting=`。
- 代替物料详情按用户确认暂不实现。

### 2026-05-29 - 生产中心详情页按 JSX 回齐

用户要求：
- 本轮实现生产中心详情页：生产需求、生产计划、生产订单、生产工单、委外加工。
- 列表点击“查看”进入详情；必须与 `manufacturing-list.jsx` 对齐；不实现生产排班/生产报表。
- 不破坏 `?setting=` 设置页入口；生产 mock/API 放在生产中心 adapter/mock。
- 有不明确点先问；本轮发现的问题由交叉验证指出后已按 JSX 修正。

已完成：
- 仅修改 Vue3 工程生产相关文件：`vue3/src/views/production/ProductionResourcePage.vue`、`vue3/src/app/api/production/resources.ts`、`vue3/src/app/api/production/types.ts`、`vue3/src/mock/production/detail-tables.json`。
- 列表“查看”和主题字段进入详情页，使用现有路由 `?id=`；`?setting=` 在模板顶层优先判断，未被详情路由覆盖。
- 详情页统一复用 `AwDetailPage / AwDetailToolbar / AwDetailHeader / AwDetailTabs / AwDetailInfoGrid`；未修改公共组件，未新增私有弹窗 DOM。
- 生产 API adapter 补齐 `getProductionDetail / updateProduction / approveProduction / printProduction / exportProduction / dispatchProduction / reportProduction / runProductionAction`；remote 模式预留 `GET /{resource}/{id}`、`PATCH /{resource}/{id}`、`POST /{resource}/{id}/{action}` 契约。
- 详情 mock 表格集中放入 `vue3/src/mock/production/detail-tables.json`，组件内不散写大段业务表格数据。
- 生产需求详情 Tab：`基本信息 / 产品明细 / 操作记录`。
- 生产计划详情 Tab：`计划信息 / 产品明细 / 来源记录 / 齐套预估 / 排产记录 / 操作记录`。
- 生产订单详情 Tab：`工单信息 / 工单明细 / 来源记录 / 版本锁定 / 齐套检查 / 工序进度 / 领料记录 / 退料记录 / 成品入库记录 / 工单执行记录 / 质检记录 / 操作记录`。
- 生产工单详情 Tab：`工单信息 / 工艺流程 / 领工派工 / 领料记录 / 报工记录 / 质检记录 / 退料记录 / 入库记录 / 操作记录`。
- 委外加工详情 Tab：`委外加工信息 / 委外明细 / 委外发料 / 委外收货 / 质检记录 / 入库记录 / 操作记录`。
- 交叉验证指出头部按钮曾多出 `审批/派工/报工/委外发料/委外收货`，已按 JSX 修正为：生产计划详情头部前置 `启动计划`，所有详情保留 `修改 / 删除 / 打印 / 导出 / 停用`。
- 交叉验证指出 `领工派工`曾是单表，已按 JSX 拆成 `领工记录 / 派工记录` 两张表。
- 交叉验证指出 `委外发料`曾使用通用发料记录表，已按 JSX 改为委外发料面板：含面板按钮 `发料`、出库单表头、通用 `.aw-mask / .aw-modal / .head / .body / .foot` 发料弹窗、确认发料后回填出库记录。

构建结果：
- `.\node_modules\.bin\vue-tsc.CMD --noEmit` 通过。
- `.\node_modules\.bin\vite.CMD build` 通过，仅保留 Vite chunk 体积警告。

浏览器详情页验收记录：
- `/production/production-demands` 点击首行查看进入 `/production/production-demands?id=demand_001`；标题 `销售订单生产需求 MR-20260517001`；表头 `序号 / 来源类型 / 来源单据 / 来源明细 / 产品编号 / 产品名称 / 规格型号 / 单位 / 需求数量 / 需求日期 / 交付日期 / 备注 / 操作`；产品明细 1 行，首行含 `SO-20260517001 / CP-2025010101 / 智能温控终端 / 120 / 计划/订单`；头部按钮 `修改 / 删除 / 打印 / 导出 / 停用`；删除/打印/停用均有 mock 提交反馈；返回列表正常。
- `/production/production-plans` 点击首行查看进入 `/production/production-plans?id=plan_001`；标题 `6月温控终端生产计划 MP-20260517001`；头部按钮 `启动计划 / 修改 / 删除 / 打印 / 导出 / 停用`；排产记录表头含 `计划明细 / 产品编号 / 产品名称 / 计划数量 / 生产订单 / 工单编号 / 工单类型 / 工单名称 / 工序 / 工位/产线 / 工单数量 / 已完成 / 负责人 / 计划开工 / 计划完工 / 工单状态 / 操作`，3 行；启动计划/打印/停用均有 mock 提交反馈；返回列表正常。
- `/production/production-orders` 点击首行查看进入 `/production/production-orders?id=order_001`；标题 `202604智能温控终端生产205 MO-20260517001`；工单明细表头 `工单编号 / 工单类型 / 工单名称 / 半成品/成品 / 工序 / 工位/产线 / 计划数量 / 已完成 / 合格 / 不良 / 负责人 / 质检节点 / 状态 / 操作`，3 行；齐套、版本、领料、退料、入库、质检、操作记录均可切换；头部按钮按 JSX；返回列表正常。
- `/production/production-work-orders` 点击首行查看进入 `/production/production-work-orders?id=work_order_001`；标题 `总装工序生产工单 WO-20260517001`；工艺流程表头 `工序号 / 工序名称 / 工序类型 / 工位/产线 / 计划数量 / 作业标准 / 计划开工 / 计划完工 / 领派方式 / 负责人 / 工序状态 / 操作`，4 行；`领工派工`显示 2 张表，区块为 `领工记录 / 派工记录`，总 4 行；删除/打印/停用均有 mock 提交反馈；返回列表正常。
- `/production/outsource-orders` 点击首行查看进入 `/production/outsource-orders?id=outsource_001`；标题 `外壳表面处理委外加工 OS-20260517001`；委外明细 1 行；委外发料表头 `出库单号 / 委外单号 / 发料方式 / 本次发料数量 / 出库仓库 / 操作人 / 生成时间 / 出库状态 / 操作`，首行 `CK-WW-20260518001 / OS-20260517001 / 按需发料 / 100 / 原料仓 / 张仓 / 部分发料 / 查看出库单`；点击面板 `发料` 打开通用弹窗，弹窗字段 `委外单号 / 加工商 / 发料方式 / 本次发料数量 / 出库仓库 / 发料说明`，物料表头 `物料编码 / 物料名称 / 规格型号 / 单位 / 应发数量 / 已发数量 / 本次发料 / 待发数量 / 仓库/库位`，3 行；确认发料反馈 `委外发料动作已通过 mock 接口提交，并回填委外发料记录。`；返回列表正常。
- `/production/production-demands?setting=numbers` 仍进入设置页；未出现详情页和列表表格，确认 `?setting=` 未被详情实现破坏。

交叉验证记录：
- 已派只读 explorer 交叉验证详情页实现，发现并修复三项问题：头部按钮不对齐、委外发料面板不对齐、领工派工单表不对齐。
- 修复后再次浏览器复验：五个详情页 `objectTextCount=0`，无 `[object Object]` 渲染残留。

### 2026-05-29 - 研发中心新增工艺按 `craft-new-screen.jsx` 专项回齐

用户确认：
- 新增工艺以 `craft-new-screen.jsx` + `craft-new.css` 为唯一准稿。
- 工艺路线编辑器允许专项样式。
- 旧 `craft-list.jsx` 简化表单不再作为新增工艺主体。
- 路由保持 `/rd/crafts?action=new`，不得破坏 `?setting=` 设置入口。

已完成：
- 新增 `vue3/src/views/rd/RdCraftCreatePage.vue`，`/rd/crafts?action=new` 单独渲染专业工艺编辑器，不再走通用 `AwEditableSubTable`。
- 研发 adapter/mock `vue3/src/app/api/rd/resources.ts` 补入工序模板、分类组、自制/委外模板、默认路线、默认富文本、创建工序工厂函数；组件内不散写大段业务模板数据。
- 页面基础字段按 JSX 回齐为：`工艺编号 / 工艺名称 / 适用产品 / 版本号 / 工艺分类 / 编制人 / 生效日期`。
- 顶部按钮按 JSX 回齐为：`取消 / 暂存草稿 / 预览路由 / 提交审批`。
- 补齐 6 个汇总卡：`工序总数 / 自制工序 / 委外工序 / 工艺总时长(并序取最大) / 人工总工时 / 单件成本`。
- 工艺路线补齐：左侧工序模板库、搜索、自制/委外 Tab、分类组、中央串序/并序画布、开始节点、自制/委外卡片、并序组、右侧属性库。
- 属性库 Tab 补齐：`基础信息 / 工位 / 工时 / 副产品 / 技术参数 / 质检方案 / 工序说明`。
- 技术参数弹窗使用 `.aw-mask / .aw-modal / .head / .body / .foot`；路线大弹窗外层同时保留 `.aw-mask / .aw-modal / .head / .body / .foot`，内部使用 `cf-*` 专项编辑器样式。
- 保存/提交继续调用研发 `createRdResource({ module: 'crafts' })` mock/API adapter；不是纯提示文字。
- `vue3/src/layouts/erp-shell/ErpShell.vue` 仅对 `/rd/crafts?action=new` 将页头显示为 `新增工艺`；`/rd/crafts?setting=numbers` 仍显示 `工艺管理` 并进入设置页。

构建结果：
- 使用 Codex bundled Node 执行 `vue-tsc --noEmit` 通过。
- 使用 Codex bundled Node 执行 `vite build` 通过，仅保留 Vite chunk 体积警告。

浏览器验收记录：
- URL：`http://localhost:5173/rd/crafts?action=new`。
- 页头：`新增工艺`。
- 基础字段：`工艺编号 / 工艺名称 / 适用产品 / 版本号 / 工艺分类 / 编制人 / 生效日期`。
- 顶部按钮：`取消 / 暂存草稿 / 预览路由 / 提交审批`，位置在表单母版顶部按钮区。
- 初始汇总：`工序总数 10道 / 自制工序 9道 / 委外工序 1道 / 工艺总时长 9.7h / 人工总工时 3.0h / 单件成本 ¥4262`。
- 选择回填：`适用产品`选择 `智能控制器 A 型` 后 select 值回填为 `智能控制器 A 型`。
- 路线弹窗结构：存在 `.aw-mask.cf-route-modal-mask`、`.aw-modal.cf-route-modal`、`.head`、`.body`、`.foot`、`.cf-editor`、`.cf-palette`、`.cf-canvas`。
- 工序模板：左侧 Tab 为 `自制 (16)`、`委外 (4)`；搜索关键字 `切` 后只显示 `切割 加工 · 23 分钟`。
- 添加工序：点击模板 `切割` 后画布卡片数 `10 -> 11`，路线摘要变为 `已添加 11 道工序 / 自制 10 道 / 委外 1 道 / 预计工艺时长 10.2 h`。
- 属性库：选中新工序后显示 Tab `基础信息 / 工位 / 工时 / 副产品 / 技术参数 / 质检方案 / 工序说明`。
- 工时交互：在 `工时` Tab 将 `单件工时`改为 `16`，汇总同步变为 `工艺总时长 10.2h / 人工总工时 3.5h / 单件成本 ¥4300`。
- 技术参数弹窗：打开 `+ 添加参数`，录入 `扭矩范围 / 8-12 N·m`，确认后参数行回填到技术参数表。
- 预览路由：点击 `预览路由` 打开 `工艺路线预览`，表格行数 11，首行 `1 / OP1102 / 来料检验 / 自制 / 串序 / 4 min / 首件 + 巡检`。
- 提交反馈：点击 `提交审批` 后反馈 `工艺管理已提交审批，已通过新增接口调用。`。
- 设置兼容：`http://localhost:5173/rd/crafts?setting=numbers` 仍进入设置页，页头 `工艺管理`，显示编号规则内容，未被新增页分支破坏。

### 2026-05-29 - 研发中心新增工艺路线卡片字号样式修复

用户指出：
- `/rd/crafts?action=new` 新增工艺页面中，路线编辑器工序卡的字体、字号、标签、字段行和页脚样式不对，需要按截图全面检查。

原因：
- 工序卡内部由 `OpCardBody` 子组件渲染，原页面 `<style scoped>` 未作用到子组件内部节点，导致 `.cf-op-tags`、`.cf-op-b-row`、`.cf-op-f` 等卡片内部样式丢失。

已完成：
- 仅修改 `vue3/src/views/rd/RdCraftCreatePage.vue`。
- 保持 `/rd/crafts?action=new` 路由、`.aw-mask / .aw-modal / .head / .body / .foot` 弹窗结构和研发 mock/API adapter 不变。
- 未修改公共组件，未影响销售、采购、客户等已验收母版。
- 新增页面专属 `.cf-op ...` 非 scoped 样式，用于恢复工序卡内部标签、基础字段行、左右字段对齐、页脚人员/成本区域。

浏览器复验记录：
- URL：`http://localhost:5173/rd/crafts?action=new`。
- 操作：刷新页面，打开 `编辑路线` 弹窗，检查自制/委外工序卡。
- 卡片结构：蓝色头部、`OPxxxx` 编号、工序名称、删除按钮保持；卡片宽度约 `220px`，头部高度约 `34px`。
- 标签字号：`自制 / 加工 / 检验 / 需检验` 等标签恢复独立胶囊样式，字号约 `10px`。
- 字段字号：`工作中心 / 设备 / 单件工时` 等字段恢复左右对齐，字段行字号约 `12px`，不再挤成连续文本。
- 页脚字号：`内 1人` 与 `¥28/件` 分列显示，页脚字号约 `11px`，成本靠右。
- 交互：点击工序卡仍能选中并打开右侧属性库；路线弹窗可正常关闭。

构建结果：
- `.\node_modules\.bin\vite.CMD build` 通过，仅保留 Vite chunk 体积警告。
- `.\node_modules\.bin\vue-tsc.CMD --noEmit` 当前被生产中心文件的既有错误阻断：`ProductionResourcePage.vue` 中 `renderGeneratedPlanView`、`renderGeneratedProductionOrderList`、`StartPlanConfirmModal`、`MrpSuggestionModal`、`KitEstimateDocModal`、`MaterialIssueModal` 未定义；本次新增工艺样式修复未触碰该文件。

### 2026-05-29 - 研发中心新增工艺路线缩放与适配实现

用户指出：
- `/rd/crafts?action=new` 新增工艺路线弹窗右上角 `− / 100% / + / 适配` 需要实现真实缩放和适配页面行为。

已完成：
- 仅修改 `vue3/src/views/rd/RdCraftCreatePage.vue`。
- 将原 JSX 静态缩放展示升级为可交互按钮，保留文案 `− / + / ⊞ 适配`。
- 新增路线画布缩放状态，范围 `25% - 150%`，步进 `10%`。
- 路线主体使用专属 `.cf-flow-shell / .cf-flow` 缩放容器；缩放只影响中央路线画布，不影响左侧工序模板、右侧属性库和 `.aw-mask / .aw-modal / .head / .body / .foot` 弹窗母版。
- `适配` 根据当前画布可视宽高和路线自然宽高计算比例，并回到画布左上位置，方便从开始节点检查全路线。

浏览器复验记录：
- URL：`http://localhost:5173/rd/crafts?action=new`。
- 操作：刷新页面，打开 `编辑工序` 弹窗。
- 初始：缩放按钮数 3，卡片数 10，显示 `100%`，路线宽度约 `2310px`。
- 缩小：点击 `−` 后显示 `90%`，路线 transform 为 `matrix(0.9, 0, 0, 0.9, 0, 0)`。
- 放大：点击 `+` 后显示回 `100%`，路线 transform 为 `matrix(1, 0, 0, 1, 0, 0)`。
- 适配：点击 `⊞ 适配` 后显示 `39%`，路线可视宽度约 `901px`，画布 `scrollWidth` 与 `clientWidth` 均约 `979px`，横向溢出被收敛。
- 交互：适配后点击首个工序卡仍可选中，右侧属性库打开，标题回填 `来料检验`。

构建结果：
- `.\node_modules\.bin\vue-tsc.CMD --noEmit` 通过。
- `.\node_modules\.bin\vite.CMD build` 通过，仅保留 Vite chunk 体积警告。

### 2026-05-29 - 研发中心新增工艺编辑器默认空白

用户指出：
- `/rd/crafts?action=new` 新增工艺编辑器默认必须是空白，不允许预置工序；只有拖入工序模板后才出现工序。

已完成：
- 仅修改 `vue3/src/views/rd/RdCraftCreatePage.vue`。
- 新增工艺页 `craftStages` 初始化从默认 10 道工序改为空数组。
- 左侧工序模板卡取消点击新增行为，弹窗说明改为 `从左侧选择工序模板，拖入画布后配置参数。`
- 保留拖拽加入能力，并补充指针拖拽兜底；点击模板不新增，拖入中央画布才新增。
- `buildRdCraftDefaultStages()` 保留在研发 adapter/mock 中，供详情/只读工艺路线等场景继续复用；新增页不再调用它。

浏览器复验记录：
- URL：`http://localhost:5173/rd/crafts?action=new`。
- 页面初始：`工序总数 0道 / 自制工序 0道 / 委外工序 0道 / 工艺总时长 0.0h / 人工总工时 0.0h / 单件成本 ¥0`。
- 路线入口：未出现 `.cf-route-brief`，显示空态 `当前未添加工序，点击“添加工序”进行配置。`
- 打开编辑器：`.cf-flow .cf-op` 数量为 `0`，开始节点数量为 `0`，右侧属性库不显示，画布仅显示 `+ 拖入新工序`。
- 点击左侧模板：工序卡数量仍为 `0`，确认点击不会新增。
- 拖入左侧首个模板到画布：工序卡数量变为 `1`，开始节点数量变为 `1`，右侧属性库显示，标题回填 `切割`。

构建结果：
- `.\node_modules\.bin\vue-tsc.CMD --noEmit` 通过。
- `.\node_modules\.bin\vite.CMD build` 通过，仅保留 Vite chunk 体积警告。

