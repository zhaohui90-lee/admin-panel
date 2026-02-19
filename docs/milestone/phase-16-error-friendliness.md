# Phase 16: 错误信息友好度提升

> 完成日期: 2026-02-19

## 改动概要

### Task 16.1 — BridgeError 结构化错误类型
- `bridge/types.ts`: 新增 `BridgeError` 类（继承 `Error`，携带 `code`、`message`、`detail` 字段）
- `bridge/types.ts`: 新增 `ErrorCodes` 常量（E01~E06 对应 AUTH_FAILED、DEVICE_BLOCKED 等）
- `bridge/index.ts`: 导出 `BridgeError` 和 `ErrorCodes`

### Task 16.2 — Bridge 层错误包装
- `bridge/electron.ts`: `unwrap` / `unwrapVoid` 改为抛出 `BridgeError`（自动解析 message 中的错误代码）
- `stores/device.ts`: 新增 `lastError: Ref<BridgeError | null>` 状态，轮询失败时记录
- `stores/device.ts`: `fetchSystemInfo` 成功时清除 `lastError`，失败时设置 `BridgeError`
- `stores/device.ts`: `HardwareDevice` 类型新增 `errorCode?: string` 字段
- `stores/device.ts`: 发卡模块 mock 数据拆分为 `detail: '检测到卡道阻塞'` + `errorCode: 'E02'`

### Task 16.3 — Toast 显示错误代码
- `composables/useToast.ts`: `ToastItem` 新增 `code?: string` 字段
- `composables/useToast.ts`: 新增 `bridgeError(err: BridgeError)` 便捷方法
- `composables/useToast.ts`: 错误类型 Toast 默认时长从 2500ms 提升至 4000ms（给拍照留时间）
- `components/ToastContainer.vue`: 错误 Toast 渲染 `[E02]` 代码标签（`font-mono bg-red-900/50` 样式）
- `modules/dashboard/DashboardPage.vue`: `handleConfirm` catch 区分 `BridgeError` / 普通 Error
- `modules/hardware/HardwarePage.vue`: 所有 3 个 catch 块区分 `BridgeError`
- `modules/logs/LogsPage.vue`: fetchLogs catch 区分 `BridgeError`

### Task 16.4 — 硬件列表结构化错误代码
- `modules/dashboard/DashboardPage.vue`: 硬件列表中 error 设备渲染 `[E02]` 红色标签

### Task 16.5 — 单元测试
- 新增 `bridge-error.spec.ts`（5 个测试）：BridgeError 构造、instanceof、ErrorCodes 常量
- `use-toast.spec.ts` 新增 3 个测试：bridgeError 方法、code 字段、自动移除
- `device-store.spec.ts` 新增 5 个测试：lastError 初始值、失败设置、成功清除、errorCode 字段
- `dashboard-page.spec.ts` 新增 2 个测试：错误代码标签渲染、非错误设备无标签
- 修复 `device-store.spec.ts` 和 `dashboard-page.spec.ts` 的 bridge mock 使用 `importOriginal` 模式

## 测试结果
- 全部 163 个测试通过（新增 15 个）
- 14 个测试文件全部绿色

## 影响文件
- `src/bridge/types.ts` — BridgeError 类 + ErrorCodes 常量
- `src/bridge/index.ts` — 导出新增类型
- `src/bridge/electron.ts` — unwrap 使用 BridgeError
- `src/stores/device.ts` — lastError + errorCode
- `src/composables/useToast.ts` — code 字段 + bridgeError 方法
- `src/components/ToastContainer.vue` — 错误代码标签渲染
- `src/modules/dashboard/DashboardPage.vue` — catch 区分 + hw-error-code 标签
- `src/modules/hardware/HardwarePage.vue` — catch 区分
- `src/modules/logs/LogsPage.vue` — catch 区分
- `src/__tests__/bridge-error.spec.ts` — 新增
- `src/__tests__/use-toast.spec.ts` — 扩展
- `src/__tests__/device-store.spec.ts` — 扩展 + mock 修复
- `src/__tests__/dashboard-page.spec.ts` — 扩展 + mock 修复
