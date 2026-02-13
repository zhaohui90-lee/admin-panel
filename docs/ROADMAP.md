# 医院自助设备控制面板 — 实施路线图

> 嵌入 Electron 客户端 `resources` 目录下的运维控制面板，提供设备管理和客户端配置能力。

---

## 功能清单

| # | 功能 | 说明 |
|---|------|------|
| 1 | 登录验证 | 密码验证后方可进入控制面板 |
| 2 | 客户端控制 | 关闭 / 重启 Electron 客户端 |
| 3 | 自助机控制 | 关机 / 重启操作系统 |
| 4 | 服务地址切换 | 查看并修改客户端连接的后端服务地址 |

---

## 架构概览

```
Electron Main Process
├── IPC Handlers (关机/重启/配置读写)
│
├── preload.js (contextBridge 暴露 API)
│
└── BrowserWindow
    └── 本项目 (Vue 3 控制面板)
        ├── 登录页
        └── 控制台页 (需登录)
            ├── 客户端控制
            ├── 自助机控制
            └── 服务地址配置
```

通信方式：Vue 通过 `window.electronAPI.*` 调用 Electron 主进程能力。开发环境下使用 mock 实现。

---

## Phase 0: 工程基础

**目标**: 适配 Electron 加载方式，搭建 Bridge 层和页面骨架。

- [ ] `vite.config.ts` 设置 `base: './'` 适配 `file://` 协议
- [ ] 创建 `src/bridge/` 层，定义 Electron IPC 接口类型与 mock 实现
- [ ] 搭建两页路由结构：登录页 (`/login`) + 控制台页 (`/dashboard`)
- [ ] 路由守卫：未登录跳转登录页
- [ ] 基础布局与全局样式（触屏适配，大按钮）

### Bridge 接口定义

```typescript
interface KioskBridge {
  // 客户端
  app: {
    quit(): Promise<void>
    restart(): Promise<void>
  }
  // 操作系统
  machine: {
    shutdown(): Promise<void>
    reboot(): Promise<void>
  }
  // 配置
  config: {
    getServerUrl(): Promise<string>
    setServerUrl(url: string): Promise<void>
  }
}
```

---

## Phase 1: 登录验证

**目标**: 简单密码验证，防止非授权人员操作。

- [ ] 登录页 UI：密码输入框 + 虚拟键盘（已有组件复用）
- [ ] 密码验证逻辑（对接 Bridge 或本地校验）
- [ ] 登录状态存入 Pinia store，控制路由访问
- [ ] 登出功能

---

## Phase 2: 控制台主页

**目标**: 实现四项核心控制功能。

- [ ] 控制台布局：卡片式功能入口
- [ ] **客户端控制卡片**：关闭客户端 / 重启客户端（二次确认弹窗）
- [ ] **自助机控制卡片**：关机 / 重启（二次确认弹窗）
- [ ] **服务地址配置卡片**：显示当前地址、编辑、保存、测试连通性
- [ ] 所有危险操作（关机/重启/关闭）需确认对话框

---

## Phase 3: 完善与测试

- [ ] 操作反馈：成功/失败 Toast 提示
- [ ] 虚拟键盘集成到服务地址输入场景
- [ ] 单元测试覆盖核心逻辑
- [ ] 构建产物验证（确认 `dist/` 可被 Electron 正确加载）

---

## 目录结构规划

```
src/
├── bridge/
│   ├── types.ts          # KioskBridge 接口定义
│   ├── electron.ts       # 真实 IPC 实现
│   ├── mock.ts           # 开发环境 mock
│   └── index.ts          # 环境检测，导出对应实现
├── components/
│   ├── VirtualKeyboard.vue   # 已有
│   └── ConfirmDialog.vue     # 二次确认弹窗
├── composables/
│   └── useBridge.ts      # 获取 bridge 实例
├── layouts/
│   └── AppLayout.vue     # 控制台布局（顶栏+内容）
├── modules/
│   ├── login/
│   │   └── LoginPage.vue
│   └── dashboard/
│       └── DashboardPage.vue
├── router/
│   └── index.ts
├── stores/
│   └── auth.ts           # 登录状态
├── style/
│   └── global.css
├── types/
│   └── index.ts
├── App.vue
└── main.ts
```
