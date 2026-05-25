# 海南傲为 ERP Vue 3 迁移工程

这是从 Console UI Kit 迁移到标准 `Vue 3 + Vite + Ant Design Vue` 的工程壳。

## 技术栈

- Vue 3 + Composition API
- Vite
- TypeScript
- Ant Design Vue
- Vue Router
- Pinia
- Axios

## 当前落地范围

- `src/layouts/ConsoleLayout.vue`：ERP 控制台布局壳
- `src/app/contracts/modules.ts`：已有接口契约中心与资源清单；无契约模块不进入菜单和路由
- `src/app/request/http.ts`：统一请求层，遵循接口契约的 `success/data/message` 响应结构
- `src/app/api/shared/types.ts`：分页、列表查询、统一响应类型
- `src/app/api/sales/*`：销售中心 API adapter 和字段类型
- `src/mock/sales/*`：销售中心 mock 数据
- `src/views/sales/*`：销售中心五个完整模块的列表页骨架
- `src/views/contracts/*`：采购、仓储、生产等已有契约中心的资源入口页

## 启动

```bash
npm install
npm run dev
```

## 迁移原则

页面组件只依赖 `src/app/api/**` 下的 adapter。mock 到真实接口切换时，只改 adapter 或 store 中的 `apiMode`，不改页面字段。

当前只迁移 `接口契约-中心模块` 中已有契约的销售、采购、仓储、生产中心。没有契约的模块先不做。
