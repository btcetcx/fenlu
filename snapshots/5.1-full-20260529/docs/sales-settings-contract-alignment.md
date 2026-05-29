# 销售中心设置页契约对齐说明

## 目标

销售中心的计划、报价、合同、订单设置页必须复用客户管理已验收的设置母版，最终以 Vue 工程和接口契约为交付对象。静态 HTML 只作为人工验收镜子，不作为实现来源。

## 统一接口

设置页统一按资源读取和保存：

```text
GET   /api/v1/{resource}/settings
PATCH /api/v1/{resource}/settings
```

当前资源：

| 模块 | resource |
| --- | --- |
| 销售计划 | `sales-plans` |
| 报价管理 | `sales-quotes` |
| 合同管理 | `sales-contracts` |
| 订单管理 | `sales-orders` |

## 统一数据结构

前端类型定义在 `vue3/src/app/api/sales/types.ts`：

| 类型 | 用途 |
| --- | --- |
| `SalesSettings` | 单个资源的完整设置数据 |
| `SalesCustomFieldSetting` | 自定义字段列表和新增字段弹窗 |
| `SalesNumberRuleSetting` | 自定义编号规则 |
| `SalesApprovalRuleSetting` | 审批规则列表和审批节点编辑 |
| `SalesStrategyTabSetting` | 策略设置 Tab 和规则 |
| `SalesPrintTemplateSetting` | 打印模板入口 |

## 实现规则

1. `SalesSettingPage.vue` 是销售中心设置页唯一 Vue 入口，计划、报价、合同、订单只传入不同 `module`。
2. 页面初始化必须通过 `getSalesSettings(module)` 取得设置数据；保存必须通过 `saveSalesSettings(module, data)`。
3. `settings-template.ts` 只提供 mock 默认值和页面字段清单，不能替代 API 契约。
4. 自定义字段、自定义编号、审批设置、策略设置的交互必须与客户管理设置页保持一致；只允许替换模块名称、字段标签、策略文案和审批列表数据。
5. 后端联调时只切换 API adapter 的 `mode` 或请求实现，不改页面组件字段。
