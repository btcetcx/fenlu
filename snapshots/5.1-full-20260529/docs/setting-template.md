# 销售中心通用设置页母版

窗口 5 交付的设置母版以 `vue3/src/components/setting-page` 为主，不改已验收的 `preview-customer-setting.html` 静态页面。客户设置页当前继续作为验收样例，后续模块优先用配置接入，不重复造设置页。

## 可复用组件

- `AwSettingPage`：设置页外层容器。
- `AwSettingToolbar`：返回、刷新、新增、取消、编辑、保存工具栏。
- `AwSettingSplitPage` / `AwSettingSplitList`：左侧分类、右侧列表的通用布局。
- `AwSettingTree`：左侧分类/字段位置/模块范围列表。
- `AwSettingListCard`：右侧标题、说明、搜索和内容卡片。
- `AwSettingTable`：普通设置表格，支持单元格和操作列插槽。
- `AwFieldSettingPage`：自定义字段设置，内置字段位置、搜索、必填/启用开关。
- `AwCodeRuleBuilder`：自定义编号规则，支持前缀、间隔符、候选编号项、拖拽排序、最多项限制。
- `AwApprovalRuleEditor`：审批流编辑器，支持节点、审批人、审批方式。
- `AwStrategySettingPage`：策略设置页，支持 tab、开关项、下拉项。
- `AwSettingModal`：设置页通用弹窗。
- `AwPersonPickerModal`：人员选择弹窗，可用于字段权限和审批节点选人。

## 配置入口

通用配置和接入标准在 `vue3/src/app/templates/settings-template.ts`：

- `salesSettingTemplates.quotes`：报价自定义字段、自定义编号、审批设置、策略设置、打印模板配置。
- `salesSettingTemplates.contracts`：合同自定义字段、自定义编号、审批设置、策略设置、打印模板配置。
- `salesSettingTemplates.orders`：订单自定义字段、自定义编号、审批设置、策略设置、打印模板配置。
- `salesSettingTemplates.plans`：销售计划自定义字段、自定义编号、审批设置、策略设置、打印模板配置。
- `commonNumberCandidates`：报价、合同、订单可共享的编号候选项。
- `commonApprovalMethods`：审批方式共享选项。

统一 Vue 页面为 `vue3/src/views/sales/shared/SalesSettingPage.vue`。其他销售模块不要复制设置页内部结构，只新增一个包装页并传入模块名，例如：

```vue
<script setup lang="ts">
import SalesSettingPage from '../shared/SalesSettingPage.vue';
</script>

<template>
  <sales-setting-page module="quotes" />
</template>
```

## 其他窗口接入方式

1. 设置入口仍使用公告板指定参数：`preview-sales-basic-list.html?type=quotes&setting=fields`、`type=contracts&setting=approvals`、`type=orders&setting=strategies`。
2. Vue 页面由 `SalesSettingPage` 读取 `route.query.setting`，再按配置选择 `AwFieldSettingPage`、`AwCodeRuleBuilder`、`AwApprovalRuleEditor`、`AwStrategySettingPage` 或打印模板表格。
3. 各模块只传标题、返回入口、按钮文案、字段位置、表格字段、弹窗字段、审批流来源、策略项，不复制客户设置页内部结构。
4. mock 数据仍放在各模块自己的 `vue3/src/mock/sales/*.json`，字段名必须与原 JSX 和 Vue 配置一致。

## 暂不建议抽象

- 客户分组树的业务统计口径暂不继续抽象，后续需要接口契约稳定后再做。
- 打印模板本轮只做入口表格和基础模板清单，不抽象复杂套打设计器。
- 客户设置静态预览里的原生 JS 暂不拆分，避免破坏已验收行为。
