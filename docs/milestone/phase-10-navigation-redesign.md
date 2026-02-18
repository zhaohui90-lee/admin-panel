# Phase 10: 导航系统重构 — Kiosk + 移动端双模式

**日期**: 2026-02-18

## 目标

将导航系统从"桌面侧边栏 + 汉堡抽屉"模式，重构为"Kiosk 大号侧边栏 + 移动端底部 Tab 栏"双模式，移除汉堡抽屉以提升触控体验。

## 变更内容

### AppLayout.vue — 完整重构

**移除内容**：
- `sidebarOpen` ref 及相关状态
- 汉堡菜单按钮及遮罩层（`<Transition name="overlay">`）
- 侧边栏抽屉动画逻辑（`-translate-x-full` / `translate-x-0`）

**Kiosk 侧边栏（`lg:flex`，宽 256px）**：
- 品牌 icon 放大至 40×40px，文字 `text-base`
- 导航项高度：`h-16`（64px），满足 Kiosk 最小触控目标
- 图标放大至 `h-6 w-6`（24px），文字 `text-base font-semibold`
- 活跃指示：左侧白色竖条 `h-7 w-1`（更高、更明显）
- 退出按钮高度：`h-14`（56px）

**移动端顶部 Header（`lg:hidden`）**：
- 移除汉堡按钮，简化为品牌 icon + 当前页面标题
- 标题动态计算（`computed` → `currentPageTitle`）

**移动端底部 Tab 导航栏（`lg:hidden`，`fixed bottom-0`）**：
- 5 个 Tab：运行状态 / 交易日志 / 系统设置 / 硬件调试 / 故障申报
- 高度 64px，深色背景（`var(--color-sidebar)`），顶部分割线
- 每个 Tab：图标（`h-5 w-5`）+ 文字（10px）+ 垂直居中
- 活跃样式：`text-accent`（蓝色），非活跃：`text-sidebar-text`
- 各 Tab 添加 `data-testid="bottom-tab-{route}"` 方便测试

**内容区**：
- `pb-24 lg:pb-8`：移动端为底部 Tab 预留空间（96px）

**页面过渡动画**：
- 使用 `<router-view v-slot="{ Component, route }">` + `<Transition name="page-fade" mode="out-in">`
- 简单淡入/淡出（`opacity`），时长 180ms
- `mode="out-in"` 确保旧页面完全离开后再进入新页面

## 测试

- 更新 `navigation.spec.ts`：9 → 13 个测试
- 新增底部 Tab 测试：
  - 渲染 5 个 Tab 项
  - 活跃 Tab 有 `text-accent` 类
  - 非活跃 Tab 有 `text-sidebar-text` 类
  - 路由切换后活跃 Tab 更新
- 全量测试：118 passed，0 failed
