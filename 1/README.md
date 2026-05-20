# ERP Console UI Kit — 海南傲为

ERP 后台工作台的可交互高保真还原。基于用户提供的 7 张截图。

## 文件

- `index.html` — 入口（启动后默认进工作台，可点侧栏切换屏；可点「新增合同」打开弹窗）
- `styles.css` — 共享样式（导入 `colors_and_type.css`）
- `components.jsx` — 原子组件（Topbar / Sidebar / Btn / Field / Input / Switch / Radio / Tabs / Badge / KPI / Modal / Card）
- `screens.jsx` — 屏幕组合（WorkbenchScreen / DocDetailScreen / NewContractModal / ApprovalRulesScreen / CodeRuleScreen）
- `browser-window.jsx` — 浏览器壳（如需嵌入展示用）

## 覆盖的截图

| 截图 | 对应屏 |
|---|---|
| 一级导航默认页 | `WorkbenchScreen`（工作台首页 + 待办事项 + 业务导航 + 便捷入口） |
| 详情 | `DocDetailScreen`（文档详情含红色审批章占位） |
| 新增 | `NewContractModal`（新增合同弹窗 + 产品明细表 + 附件） |
| 审批流程 / 策略设置 | `ApprovalRulesScreen` |
| 编码设置 | `CodeRuleScreen`（条码预览 + 编号项面板） |
| 打印模板 | 未实现（三栏富文本编辑器复杂度高，留待下版） |

## 已知简化

- 顶部导航的图标用 emoji 占位（截图为线性图标）。下版接入 Lucide 替换
- 审批章为 CSS 圆形红章占位
- 业务导航的人形图标用 👥 emoji 占位
- 打印模板编辑器未实现
