# 客户管理模板包

## 阶段目标

第五阶段只做模板包整理，不重写已验收页面。客户管理当前已经形成五类样板：

- 工作台
- 列表页
- 详情页
- 新增/编辑页
- 设置页

本阶段把这些样板登记为可复制模板包，后续销售计划、报价、合同、订单按配置调用，不再复制静态页面。

## 模板包入口

源码登记文件：

```text
vue3/src/app/templates/customer-management-template.ts
```

这个文件记录：

- 客户管理路由入口
- 已稳定的公共组件
- 暂时只作为样例的复杂页面
- 后续模块复制时需要参数化的字段

## 可复用母版

### 列表页

稳定复用：

- `AwListPage`
- `AwResourceTree`
- `AwListToolbar`
- `AwDataTable`
- `customerList.config.ts` 配置方式

后续销售计划、报价、合同、订单列表应优先迁移到这套结构。

### 详情页

稳定复用：

- `AwDetailPage`
- `AwDetailToolbar`
- `AwDetailHeader`
- `AwDetailTabs`
- `AwDetailInfoGrid`
- `AwDetailMetricGrid`

复制时主要替换：标题、编号、状态、摘要字段、指标卡、Tab。

### 新增/编辑页

稳定复用：

- `AwFormPage`
- `AwEditableSubTable`
- `AwPaymentTermCards`

谨慎复用：

- `AwRichTextEditor`

复制时主要替换：基础字段、子表配置、账期/额度类规则、保存动作。

`AwRichTextEditor` 目前是富文本外观样板，真实编辑能力后续再增强。

### 设置页

稳定复用：

- `AwSettingPage`
- `AwSettingToolbar`
- `AwSettingSplitPage`
- `AwSettingTree`
- `AwSettingListCard`

谨慎复用：

- `AwSettingTable`
- `CustomerSettingPage`

客户设置整页包含编号规则、审批流、策略配置等复杂交互，第五阶段只把它作为验收样例，不继续深拆。

### 工作台

当前可作为样例：

- `WorkbenchBoard`
- `salesWorkbench`

后续要复制到其他中心前，应先把 `WorkbenchBoard` 的数据源完全参数化。

## 复制到其他销售模块的参数

每个模块至少准备：

- `moduleKey`
- `title`
- `baseRoute`
- `createRoute`
- `detailRoute`
- `settingRoute`
- `loader`
- `rowKey`
- `tree groups`
- `toolbar actions`
- `table columns`
- `bulk actions`
- `detail metas`
- `detail tabs`
- `form sections`
- `editable sub tables`
- `setting scopes`
- `number candidates`
- `approval options`
- `policy rows`

## 下一步建议

先做销售计划列表页迁移，因为它比报价、合同、订单更轻，适合验证 `AwListPage` 复制能力。

建议顺序：

1. 销售计划列表页从 `SimpleSalesList` 迁移到 `AwListPage`。
2. 销售计划列表验收通过后，复制到报价列表。
3. 报价列表通过后，再做合同和订单。
4. 四个列表都稳定后，再进入详情页母版复制。

## 验收口径

- 复制模块时，不再写新的列表骨架。
- 只新增配置、接口映射和少量业务插槽。
- 视觉继续对齐客户管理样板。
- 真实数量和状态来自接口或 mock 数据，不使用占位数字。
