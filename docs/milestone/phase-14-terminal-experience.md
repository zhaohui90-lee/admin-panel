# Phase 14: 硬件终端体验优化

> 完成日期: 2026-02-19

## 改动概要

### Task 14.1 — 终端日志自动滚底
- `HardwarePage.vue`: 新增 `terminalRef`、`userScrolledUp` 状态、`onTerminalScroll` 滚动检测
- `watch(terminalLogs)` + `nextTick` 自动执行 `scrollTop = scrollHeight`
- 用户手动上滑时暂停自动滚底，底部出现 "↓ 新消息" 按钮，点击恢复

### Task 14.2 — 终端字体可读性优化
- 终端区域添加 `tracking-wide`（letter-spacing: 0.025em），提升低分辨率屏幕可读性
- Kiosk 模式（lg:）字号从 `text-xs` 提升至 `lg:text-sm`（14px）
- 新增时间戳显示（`text-slate-400`），每条日志前显示 `HH:MM:SS` 格式时间

### Task 14.3 — 单元测试
- 新增 6 个测试用例覆盖:
  - `tracking-wide` class 应用验证
  - `lg:text-sm` class 应用验证
  - 时间戳渲染验证
  - 默认状态下不显示 scroll-to-bottom 按钮
  - 用户上滑后出现 "新消息" 按钮
  - 点击 "新消息" 按钮后隐藏

## 测试结果
- 全部 148 个测试通过（含 15 个 hardware-page 测试）

## 影响文件
- `src/modules/hardware/HardwarePage.vue`
- `src/__tests__/hardware-page.spec.ts`
