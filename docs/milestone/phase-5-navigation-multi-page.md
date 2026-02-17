# Phase 5: 导航与多页面

**日期**: 2026-02-17

## 概述

实现原型中完整的侧边栏导航，新增交易日志、系统设置、故障申报三个占位页面，并添加路由守卫和导航高亮的单元测试。

## 变更内容

### Task 5.1 — 侧边栏导航增强
- **文件**: `src/layouts/AppLayout.vue`
- 导航项从 2 个增加到 4 个（匹配原型侧边栏）：
  - 运行状态 (activity icon) → `/dashboard`
  - 交易日志 (file-text icon) → `/logs`
  - 系统设置 (settings icon) → `/settings`
  - 故障申报 (alert-triangle icon) → `/reports`
- 新增 file-text、alert-triangle 两个 SVG 图标
- 退出登录按钮保持底部固定

### Task 5.2 — 路由扩展
- **文件**: `src/router/index.ts`
- 新增 3 条子路由：`/logs`, `/settings`, `/reports`
- 均使用懒加载 `() => import(...)`
- 路由守卫覆盖所有子路由（未认证重定向到 login）

### 占位页面
- `src/modules/logs/LogsPage.vue` — 交易日志（开发中占位）
- `src/modules/settings/SettingsPage.vue` — 系统设置（开发中占位）
- `src/modules/reports/ReportsPage.vue` — 故障申报（开发中占位）
- 统一样式：标题 + 说明 + 居中图标 + "功能开发中" 提示

### Task 5.3 — 单元测试 (`src/__tests__/navigation.spec.ts`)
- 9 个测试用例覆盖：
  - 渲染全部 4 个导航项 + 退出按钮
  - `/dashboard` 路由激活高亮
  - `/logs` 路由激活高亮
  - 非激活项使用 sidebar-text 样式
  - 未认证用户重定向到 /login
  - 已认证用户可访问 /dashboard
  - 已认证用户从 /login 重定向到 /dashboard
  - 未认证保护所有子路由
  - 已认证可访问所有子路由

## 验证

- TypeScript type-check: PASS
- Vitest (52 tests, 9 new): PASS
- Vite production build: PASS
