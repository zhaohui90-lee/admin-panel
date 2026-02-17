# Admin Panel 开发路线图

> 基于 ARCHITECTURE.md 规格说明 + 设计原型分析，制定的实施计划。

---

## 现状分析

### 已完成
- Vue 3 + TypeScript + Vite + Tailwind v4 项目脚手架
- Bridge Adapter 模式基础实现（mock + electron）
- 登录页面（密码输入 + 虚拟键盘）
- 仪表盘页面（设备控制按钮 + 服务地址配置）
- 共享组件：VirtualKeyboard、ConfirmDialog
- Pinia auth store（仅 isLoggedIn 布尔值）
- Vue Router 路由守卫
- 基础单元测试框架

### 关键差距（对照 ARCHITECTURE.md）

| 领域 | 规格要求 | 当前状态 |
|------|---------|---------|
| Bridge 接口 | `IBridge { auth, system, power, business }` 含 token 参数 | `KioskBridge { app, machine, config, auth }` 无 token |
| 认证 | `login()` 返回 token，所有操作传 token | `verify()` 返回 boolean，无 token 管理 |
| 系统信息 | `getSystemInfo(token)` 返回 CPU/内存/IP | 未实现 |
| 配置获取 | `getConfig(token)` 返回 AppConfig | 仅有 serverUrl 的 get/set |
| 业务操作 | `reloadPage(token)` | 未实现 |
| 错误处理 | Bridge 统一抛出标准 Error | 无统一错误处理 |
| Toast | 全局通知系统 | 仅 DashboardPage 局部实现 |

### 原型 vs 现状差距

| UI 模块 | 原型设计 | 当前实现 |
|---------|---------|---------|
| 登录页 Tab | 工牌感应 + 账号密码 双模式 | 仅密码模式 |
| 仪表盘状态卡片 | 交易数、网络延迟、CPU 占用 | 无 |
| 硬件自检列表 | 打印机/读卡器/发卡模块/摄像头 + 进度条 | 无 |
| 侧边栏导航 | 运行状态/交易日志/系统设置/故障申报 | 仅"设备控制" |
| 操作按钮 | 维护模式/清除缓存/版本更新/远程重启 | 应用重启/退出 + 机器重启/关机 |

---

## Phase 1: Bridge 层对齐规格

> 目标：将 Bridge 接口、类型、实现对齐 ARCHITECTURE.md 的 IBridge 规格。

### Task 1.1 — 重构 Bridge 类型定义
- **文件**: `src/bridge/types.ts`
- 将 `KioskBridge` 重命名为 `IBridge`
- 按规格重新定义四个子接口：`auth`, `system`, `power`, `business`
- 所有非 auth 方法增加 `token: string` 参数
- `auth.login()` 返回 `Promise<{ success: boolean; token?: string }>`
- 定义 `SystemInfo` 和 `AppConfig` 类型

### Task 1.2 — 重构 Mock Bridge
- **文件**: `src/bridge/mock.ts`
- 实现新 `IBridge` 接口
- `login`: 非空密码返回伪造 token
- `getSystemInfo`: 返回静态硬件数据（CPU、内存、IP、磁盘等）
- `getConfig`: 返回静态配置
- `power.*`: console.log + 模拟 1s 延迟
- `business.reloadPage`: console.log + 延迟

### Task 1.3 — 重构 Electron Bridge
- **文件**: `src/bridge/electron.ts`
- 对接 `window.adminAPI` 的真实方法签名
- 统一错误处理：`{ success: false }` → 抛出 `Error`

### Task 1.4 — Token 管理
- **文件**: `src/stores/auth.ts`
- 增加 `token: Ref<string | null>` 状态
- `login(password)` action：调用 bridge → 存储 token
- `logout()`: 清除 token + isLoggedIn
- Token 仅存内存（不持久化）

### Task 1.5 — useBridge composable 更新
- **文件**: `src/composables/useBridge.ts`
- 适配新 IBridge 类型

### Task 1.6 — 单元测试
- Bridge mock 正确返回值测试
- Auth store token 管理测试
- 错误处理（bridge 抛出异常）测试

---

## Phase 2: 全局基础设施

> 目标：建立跨页面复用的基础能力。

### Task 2.1 — 全局 Toast/通知系统
- 新建 `src/composables/useToast.ts`
- 支持 success / error / warning 类型
- 自动消失 + 手动关闭
- 从 DashboardPage 中抽离现有 toast 逻辑

### Task 2.2 — 统一错误处理
- Bridge 层统一捕获 IPC 错误并抛出标准 Error
- 页面层 try/catch + useToast 显示

### Task 2.3 — 单元测试
- Toast composable 测试
- 错误处理流程测试

---

## Phase 3: 登录页面增强

> 目标：对齐原型设计，支持双模式登录。

### Task 3.1 — 登录页 Tab 切换
- 参照原型：工牌感应 + 账号密码 两个 Tab
- IC 卡模式：RFID 脉冲动画 + "请刷员工卡" 提示
- 密码模式：保留现有虚拟键盘输入

### Task 3.2 — 集成 Token 认证
- 登录成功后从 bridge 获取 token
- 存入 auth store
- 路由跳转到 dashboard

### Task 3.3 — 单元测试
- Tab 切换 UI 测试
- 登录流程集成测试（mock bridge）

---

## Phase 4: 仪表盘重构

> 目标：实现原型中的完整仪表盘功能。

### Task 4.1 — 系统状态卡片
- 参照原型：交易数、网络延迟、CPU 占用
- 调用 `bridge.system.getSystemInfo(token)` 获取数据
- 定时轮询更新（可配置间隔）

### Task 4.2 — 硬件自检状态列表
- 参照原型：设备列表 + 状态指示灯 + 进度条
- 凭条打印机（含纸量进度条）
- 医保卡读卡器
- 发卡模块
- 人脸识别相机
- 状态：在线(绿) / 故障(红) / 警告(黄)

### Task 4.3 — 操作按钮区重构
- 参照原型 + ARCHITECTURE.md power 接口
- 维护模式 / 清除缓存 / 远程重启 / 关机
- 所有操作传 token + 确认对话框

### Task 4.4 — Device Store
- 新建 `src/stores/device.ts`
- 存储 systemInfo（CPU, Memory, IP, Disk 等）
- 轮询更新逻辑

### Task 4.5 — 单元测试
- 状态卡片渲染测试
- 硬件列表渲染测试
- 轮询逻辑测试
- 操作按钮 + 确认流程测试

---

## Phase 5: 导航与多页面

> 目标：实现侧边栏完整导航。

### Task 5.1 — 侧边栏导航增强
- 参照原型侧边栏：运行状态 / 交易日志 / 系统设置 / 故障申报
- 当前页高亮
- 退出登录按钮

### Task 5.2 — 路由扩展
- `/dashboard` — 运行状态（已有）
- `/power` — 电源/重启控制（从 dashboard 拆出）
- 预留：`/logs`, `/settings`, `/hardware`

### Task 5.3 — 单元测试
- 导航高亮测试
- 路由守卫测试

---

## Phase 6: 硬件测试模块（路线图功能）

> 目标：实现 ARCHITECTURE.md 中规划的硬件调试模块。

### Task 6.1 — 硬件测试页面
- 路由: `/hardware`
- 设备列表：连接/断开按钮
- 命令发送 + 日志终端视图

### Task 6.2 — Bridge 扩展
- 新增 `hardware` 子接口
- `testDevice(token, deviceId, command)` 方法
- Mock 实现

### Task 6.3 — 单元测试

---

## Phase 7: 日志查看器（路线图功能）

> 目标：实现 ARCHITECTURE.md 中规划的日志查看功能。

### Task 7.1 — 日志页面
- 路由: `/logs`
- 流式/分页显示日志
- 日志级别过滤

### Task 7.2 — Bridge 扩展
- 新增日志相关 IPC 接口
- Mock 实现（模拟日志数据）

### Task 7.3 — 单元测试

---

## 实施优先级

```
Phase 1 (Bridge 对齐)     ████████████  ← 最高优先级，所有功能的基础
Phase 2 (全局基础设施)     ████████████  ← 高优先级，被多个模块依赖
Phase 3 (登录增强)         ████████      ← 中高，用户第一接触点
Phase 4 (仪表盘重构)       ████████      ← 中高，核心功能页面
Phase 5 (导航与多页面)     ██████        ← 中等
Phase 6 (硬件测试)         ████          ← 低，后端 IPC 未就绪
Phase 7 (日志查看器)       ████          ← 低，需新 IPC 接口
```

## 执行原则

1. **逐步推进** — 每个 Phase 完成后再进入下一个
2. **测试先行** — 每个 Task 完成后必须有对应的单元测试
3. **提交即记录** — 每次 git commit 前测试通过，并在 `docs/milestone/` 记录
4. **类型安全** — 严格 TypeScript，避免 `any`
5. **最小改动** — 不做超出当前 Task 范围的重构
