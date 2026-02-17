# 架构规格说明

## 概述

admin-panel 是一个独立的 Vue 3 SPA (Single Page Application)。它不直接包含 Node.js 运行时依赖，而是通过 Bridge Adapter 模式与宿主环境 (kiosk-shell) 通信。

### 系统上下文
```
graph TD
    subgraph "Kiosk Shell (Main Process)"
        IPC[IPC Handlers]
        Auth[Auth Manager]
        Power[Power Manager]
    end

    subgraph "Admin Window (Renderer Process)"
        subgraph "Admin Panel (Vue App)"
            UI[Vue Components]
            Store[Pinia Stores]
            Bridge[Bridge Adapter]
        end
        
        API[window.adminAPI]
    end

    UI --> Store
    Store --> Bridge
    
    Bridge -- "Dev Mode" --> Mock[Mock Implementation]
    Bridge -- "Prod Mode" --> API
    
    API -- "ContextBridge" --> IPC
```

## 技术栈

- Framework: Vue 3 (Composition API, <script setup>)
- Build Tool: Vite
- Language: TypeScript (Strict Mode)
- Styling: Tailwind CSS v4
- State Management: Pinia
- Routing: Vue Router
- Testing: Vitest + Vue Test Utils

## 目录结构

src/
├── bridge/            # [CORE] The communication layer
│   ├── index.ts       # Exports the active instance (auto-detects env)
│   ├── types.ts       # Frontend-facing interface definitions
│   ├── electron.ts    # Implementation wrapping window.adminAPI
│   └── mock.ts        # Implementation for browser development
├── components/        # Shared UI components (Button, Modal, Keyboard)
├── composables/       # Shared logic (useBridge, useToast)
├── layouts/           # Page layouts (AuthLayout, DashboardLayout)
├── modules/           # Domain-specific features
│   ├── auth/          # Login logic
│   ├── dashboard/     # System status view
│   ├── power/         # Restart/Shutdown controls
│   └── hardware/      # Peripherals testing (Printer, Camera)
├── stores/            # Global state (Auth Token, System Info)
└── types/             # Shared domain types

## 桥梁层（核心模式）

为了解耦前端开发与 Electron 环境，必须严格执行 Bridge Pattern。前端组件禁止直接访问 window.adminAPI。

### Interface Definition (src/bridge/types.ts)
前端业务层使用的接口结构（经过封装，比底层 IPC 更具语义化）：

```typescript
export interface IBridge {
  auth: {
    login(password: string): Promise<{ success: boolean; token?: string }>;
  };
  system: {
    getSystemInfo(token: string): Promise<SystemInfo>;
    getConfig(token: string): Promise<AppConfig>;
  };
  power: {
    restartApp(token: string): Promise<void>;
    quitApp(token: string): Promise<void>;
    rebootOS(token: string): Promise<void>;
    shutdownOS(token: string): Promise<void>;
  };
  business: {
    reloadPage(token: string): Promise<void>;
  };
}
```

### 主机协议（窗口.管理员API）

这是 kiosk-shell 通过 preload.ts 注入的实际 API。注意：这是不可变的契约。

```typescript
// Defined in global.d.ts
interface AdminAPI {
  login(password: string): Promise<Result<{ token: string }>>;
  exitApp(token: string): Promise<Result>;
  restartApp(token: string): Promise<Result>;
  systemRestart(token: string): Promise<Result>;
  systemShutdown(token: string): Promise<Result>;
  getConfig(token: string): Promise<Result<Config>>;
  getSystemInfo(token: string): Promise<Result<SystemInfo>>;
  reloadBusiness(token: string): Promise<Result>;
}
```

## 验权

由于 kiosk-shell 采用 Session Token 机制，前端必须管理这个 Token。

Login:

用户输入密码。

调用 bridge.auth.login(pwd)。

获取 token。

存入 useAuthStore (Pinia)。

Security Note: Token 仅保存在内存中（Pinia），刷新页面即失效，不仅久化到 localStorage。

Authenticated Requests:

所有后续操作（如重启）都必须从 useAuthStore 读取 token 并传给 Bridge。

## 实施指南

### 状态管理（pinia）

- auth.ts: 存储 token, isLoggedIn 状态。
- device.ts: 存储 systemInfo (CPU, Memory, IP)，由 Dashboard 轮询更新。

### 错误处理
Bridge 层应统一处理 IPC 错误：
- 如果 IPC 返回 { success: false, message: '...' }，Bridge 应抛出标准 Error。
- UI 层捕获 Error 并通过 Toast 显示。

### 开发工作流程（模拟）
在浏览器 (npm run dev) 环境下，src/bridge/index.ts 会自动加载 mock.ts。
- Mock Requirements:
    - login: 接受任意非空密码，返回伪造 token。
    - power: console.log 操作并模拟 1秒延迟。
    - system: 返回静态的硬件信息数据。

## 未来模块（路线图）
硬件测试模块
- 目的：通过进程间通信（IPC）严格调试外设。
- 设计：
    - 连接/断开按钮。
    - 发送命令/接收日志的终端视图。
    - 所需的进程间通信：设备：测试（设备 ID，命令）（后端已规划）。
日志查看器
- 目的：查看自助服务终端外壳日志。
- 实现方式：需要新的进程间通信来从用户数据/日志/目录中流式传输/分页显示日志。
