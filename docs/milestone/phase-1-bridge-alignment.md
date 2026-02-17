# Phase 1: Bridge 层对齐规格

**日期**: 2026-02-17

## 完成内容

### Task 1.1 — 重构 Bridge 类型定义
- `KioskBridge` → `IBridge`，按 ARCHITECTURE.md 定义 `auth/system/power/business` 四个子接口
- 新增 `SystemInfo`、`AppConfig`、`LoginResult` 类型
- 所有非 auth 方法增加 `token: string` 参数

### Task 1.2 — 重构 Mock Bridge
- 实现新 `IBridge` 接口
- `login`: 非空密码返回 token，空密码返回 `{ success: false }`
- `getSystemInfo`: 返回含随机波动的静态硬件数据
- `getConfig`: 返回 deviceId/serverUrl/version
- `power.*`: 模拟 1s 延迟 + console.log
- `business.reloadPage`: 模拟 0.5s 延迟

### Task 1.3 — 重构 Electron Bridge
- 对接 `window.adminAPI` 的 Host Protocol 方法签名
- 统一错误处理：`{ success: false }` → 抛出标准 `Error`
- `unwrap<T>()` / `unwrapVoid()` 辅助函数

### Task 1.4 — Token 管理
- `useAuthStore` 增加 `token: Ref<string | null>`
- `isLoggedIn` 改为 `computed(() => token !== null)`
- `login(token)` 存储 token，`logout()` 清除 token
- Token 仅存内存，不持久化

### Task 1.5 — 更新页面组件
- `LoginPage.vue`: 使用 `bridge.auth.login()` 返回 token，存入 store
- `DashboardPage.vue`: 所有操作通过 `auth.token!` 传 token 给 bridge
- `useBridge` composable 返回 `IBridge` 类型

### Task 1.6 — 单元测试
- `bridge-mock.spec.ts`: 9 个测试覆盖 auth/system/power/business
- `auth-store.spec.ts`: 4 个测试覆盖 token 管理生命周期
- 总计 14 个测试全部通过

## 变更文件
- `src/bridge/types.ts` — 全新 IBridge 接口
- `src/bridge/mock.ts` — 全新 mock 实现
- `src/bridge/electron.ts` — 全新 electron 实现 + 错误处理
- `src/bridge/index.ts` — 更新导出
- `src/stores/auth.ts` — 增加 token 管理
- `src/composables/useBridge.ts` — 类型更新
- `src/modules/login/LoginPage.vue` — 适配新 auth 流程
- `src/modules/dashboard/DashboardPage.vue` — 适配新 bridge + token
- `src/__tests__/bridge-mock.spec.ts` — 新增
- `src/__tests__/auth-store.spec.ts` — 新增

## 验证
- TypeScript type-check: PASS
- Vitest (14 tests): PASS
- Vite production build: PASS
