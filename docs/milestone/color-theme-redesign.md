# 颜色主题重构 — 匹配原型设计

**日期**: 2026-02-17

## 概述

将全局颜色主题从暗色（深蓝底 + 青绿强调色）切换为浅色主题（浅灰底 + 蓝色主色），匹配 `docs/prototype/` 下的设计原型。

## 主题变更对照

| Token | 旧值 (暗色) | 新值 (浅色) |
|---|---|---|
| `--color-deep` | `#060b18` | `#f1f5f9` |
| `--color-surface` | `#0d1526` | `#f8fafc` |
| `--color-card` | `rgba(13,21,38,0.7)` | `#ffffff` |
| `--color-accent` | `#00e5a0` (teal) | `#2563eb` (blue) |
| `--color-border` | `rgba(0,229,160,0.10)` | `#e2e8f0` |
| `--color-text-primary` | `#e8ecf4` | `#1e293b` |
| `--color-text-secondary` | `#7a8ba8` | `#64748b` |
| `--color-danger` | `#f43f5e` | `#ef4444` |
| `--color-warning` | `#fbbf24` | `#f59e0b` |

新增 Token：`--color-success`、`--color-sidebar-*`（侧边栏独立暗色主题）

## 变更文件

- **global.css**: 全部 `@theme` 变量更新为浅色系，新增 sidebar 专用暗色 token
- **LoginPage.vue**: 品牌面板改为蓝色渐变 (`#1e40af → #2563eb`)，输入框/按钮改为浅色风格
- **AppLayout.vue**: 侧边栏保持暗色 (`#1e293b`)，主内容区改为浅色，移动端顶栏改为白色
- **DashboardPage.vue**: 卡片改为白底 + 阴影，按钮改为浅色边框风格，状态色使用 emerald/amber/red
- **VirtualKeyboard.vue**: 按键改为浅色边框风格
- **ConfirmDialog.vue**: 对话框改为白色背景
- **ToastContainer.vue**: Toast 颜色更新（emerald/danger/amber）

## 验证

- TypeScript type-check: PASS
- Vitest (28 tests): PASS
- Vite production build: PASS
