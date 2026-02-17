# Phase 6: 硬件测试模块

**日期**: 2026-02-17

## 概述

实现 ARCHITECTURE.md 中规划的硬件调试模块，包括 Bridge 接口扩展、硬件测试页面（设备列表 + 命令终端）、完整单元测试。

## 变更内容

### Task 6.2 — Bridge 扩展

**类型定义** (`src/bridge/types.ts`):
- 新增 `HardwareDeviceInfo` 接口 (id, name, connected)
- 新增 `HardwareTestResult` 接口 (success, output, timestamp)
- IBridge 新增 `hardware` 子接口:
  - `getDevices(token)` — 获取设备列表
  - `connectDevice(token, deviceId)` — 连接设备
  - `disconnectDevice(token, deviceId)` — 断开设备
  - `testDevice(token, deviceId, command)` — 发送调试命令

**Mock 实现** (`src/bridge/mock.ts`):
- 4 台模拟设备（打印机/读卡器/发卡模块/摄像头）
- testDevice 支持 status/test/reset 三种预设命令响应
- 自定义命令返回通用 OK 响应

**Electron 实现** (`src/bridge/electron.ts`):
- 添加 hardware 接口 stub（TODO: 待后端 IPC 就绪后对接）

### Task 6.1 — 硬件测试页面 (`src/modules/hardware/HardwarePage.vue`)
- **设备列表**: 显示设备名称、连接状态指示灯、连接/断开按钮、调试按钮
- **调试终端**: 选择设备后展开
  - 快捷命令按钮 (status / test / reset)
  - 终端日志视图（深色背景 + 语法着色：蓝=命令，绿=结果，红=错误）
  - 自定义命令输入 + 虚拟键盘支持
  - 清空日志 / 关闭终端按钮

### 路由与导航
- `src/router/index.ts` — 新增 `/hardware` 路由
- `src/layouts/AppLayout.vue` — 侧边栏新增「硬件调试」导航项 (cpu 图标)

### Task 6.3 — 单元测试
- `src/__tests__/hardware-page.spec.ts` (9 tests):
  - 设备列表渲染、连接状态显示、getDevices 调用
  - 连接/断开按钮调用正确的 bridge 方法
  - 调试终端打开/关闭、禁用断开设备的调试按钮
  - 快捷命令发送 + 结果显示、清空日志
- `src/__tests__/bridge-mock.spec.ts` (4 new tests):
  - getDevices 返回设备列表
  - connectDevice/disconnectDevice 正常完成
  - testDevice 返回包含 output 的结果

## 验证

- TypeScript type-check: PASS
- Vitest (65 tests, 13 new): PASS
- Vite production build: PASS
