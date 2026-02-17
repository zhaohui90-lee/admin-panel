# Phase 4: 仪表盘重构

**日期**: 2026-02-17

## 概述

将仪表盘的状态管理、轮询逻辑、设备操作从 DashboardPage 组件中提取到独立的 Pinia store，实现关注点分离。

## 变更内容

### Task 4.4 — Device Store (`src/stores/device.ts`)
- 新建 `useDeviceStore` Pinia store
- 状态：`systemInfo`, `config`, `hardwareList`
- 计算属性：`cpuUsage`, `memoryPercent`, `networkLatency`
- 轮询：`startPolling(intervalMs)` / `stopPolling()` 管理定时器
- 设备操作：`restartApp`, `quitApp`, `rebootOS`, `shutdownOS`, `reloadPage` 委托 bridge
- 配置更新：`updateServerUrl(url)`
- `HardwareDevice` 类型从 DashboardPage 提取到 store 中导出

### Task 4.1~4.3 — DashboardPage 重构
- 移除所有内联的 bridge 调用、polling 逻辑、computed
- 改为从 `useDeviceStore` 读取状态和调用 action
- 组件职责简化为：UI 渲染 + 确认对话框 + 服务地址编辑交互
- 修复关闭自助机按钮遗漏的暗色主题 class

### Task 4.5 — 单元测试 (`src/__tests__/device-store.spec.ts`)
- 15 个新测试用例覆盖：
  - 初始状态（null systemInfo/config，默认 hardware list，computed 默认值）
  - `fetchConfig` / `fetchSystemInfo` 调用 bridge 并存储结果
  - `fetchSystemInfo` 在无 token 时不调用 bridge
  - `startPolling` / `stopPolling` 定时器管理
  - 5 个 power action 委托 bridge 并传递 token
  - `updateServerUrl` 更新 config

## 验证

- TypeScript type-check: PASS
- Vitest (43 tests, 15 new): PASS
- Vite production build: PASS
