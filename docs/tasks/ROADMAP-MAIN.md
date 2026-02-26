# 仪表盘重构 ROADMAP

> 基于 `docs/issue/06-dashboard-zh.md` 规格书，对照现有代码差距分析后制定。
> 共 8 个阶段，按依赖关系排序，每阶段可独立编译运行。

---

## 现状 → 目标 差距分析

| 维度 | 现状 | 目标 |
|------|------|------|
| 主题 | 浅色主内容区 + 深色侧栏 | **全深色工业风**，`--bg-base: #0b0f1a` |
| 侧栏 | 基础导航，4 项菜单，无操作员信息 | 深海军蓝 #0f1729，4 项菜单，操作员区 + 锁定/返回业务按钮 |
| 移动端 | 底部 Tab Bar | 顶部标题栏 + 汉堡菜单抽屉 |
| 数据模型 | `SystemInfo` + `AppConfig` + 4 个硬件 | 新增 `TransactionStats`、`NetworkStatus`、`SystemResource`、`HardwareItem`(8项)、`ServiceEndpoint`、`MaintenanceStore` |
| 运行状态页 | 3 个简单数字卡 + 硬件列表 + 控制按钮 + URL | 设备横幅 + 3 个富数据卡(SVG 图表) + 硬件网格 + 设备控制(高危 Modal) + 服务地址面板 |
| 系统设置 | 占位 "coming soon" | 4 个设置卡片组，滑块/下拉/IP 配置 |
| 硬件调试 | 基础设备列表 | Tab 选择 + 参数详情 + 终端日志 + 指令测试 |
| 故障申报 | 基础表单 | 表单 + 优先级色块 + 日志快照 + 历史时间线 |
| 全局组件 | Toast + ConfirmDialog | + 全局加载遮罩 + Toast 倒计时改进 |
| 数据模拟 | 5 秒轮询 bridge | 3 秒随机波动 Mock，动画过渡 |

---

## Stage 1: 基础设施 — 主题 + 数据层 + 布局骨架

**Goal**: 切换到深色工业风主题，建立新数据模型和 Store，重构布局骨架

**Tasks**:
- [x] 1.1 全局 CSS 变量切换为深色工业风配色 (`--bg-base: #0b0f1a`, `--bg-card: rgba(30,37,54,0.8)`, `--border: rgba(255,255,255,0.07)`, `--text-primary: #e2e8f0`)
- [x] 1.2 添加 SVG 细网格纹理背景（5% 透明度）
- [x] 1.3 定义 TypeScript 接口：`TerminalInfo`, `TransactionStats`, `NetworkStatus`, `SystemResource`, `HardwareItem`, `ServiceEndpoint`
- [x] 1.4 创建 `useMaintenanceStore` (Pinia)：包含 `isCriticalActionProcessing`, `connectionState`, `notifications`, 终端信息, 所有监控数据
- [x] 1.5 实现 Mock 数据初始化 + 3 秒随机波动模拟（CPU、延迟、同步时间等）

**Success Criteria**: 应用以深色主题启动，Store 初始化并开始模拟数据波动，控制台无错误

**Tests**: Store 初始化测试、Mock 数据波动区间验证

**Status**: Complete

---

## Stage 2: 侧边栏重构 + 移动端抽屉

**Goal**: 重构 `<SideNav />` 和移动端导航，匹配规格视觉

**Tasks**:
- [x] 2.1 侧栏背景改为 `#0f1729`，右侧 1px 分隔线 `rgba(255,255,255,0.06)`
- [x] 2.2 顶部：医院 Logo 占位 + "运维中心" / "Maintenance Console"
- [x] 2.3 导航项：4 项（运行状态/系统设置/硬件调试/故障申报），移除"交易日志"。高度 64px，左侧 4px 激活指示条，蓝色渐变激活态
- [x] 2.4 替换图标：波形(运行)、齿轮(设置)、电路板(调试)、警告(申报)，20x20 SVG
- [x] 2.5 底部操作员区：头像占位 + "管理员 Admin" + "锁定/注销"按钮 + "返回业务"按钮
- [x] 2.6 移动端：移除底部 Tab Bar → 改为顶部标题栏 + 汉堡菜单按钮 + Drawer 抽屉侧边栏
- [x] 2.7 内容区 fade-transform 过渡动画

**Success Criteria**: 宽屏左侧固定导航正确显示，竖屏汉堡菜单可唤起抽屉，切换页面有过渡动画

**Tests**: 导航项渲染、激活态、移动端 Drawer 展开/收起、路由切换过渡

**Status**: Complete

---

## Stage 3: 设备信息横幅 `<DeviceInfoBanner />`

**Goal**: 实现运行状态页顶部的三列设备信息卡

**Tasks**:
- [x] 3.1 左列：蓝色医疗十字图标 + 设备编号(mono 24px 白色) + 部署位置(灰色小字)
- [x] 3.2 中列：状态指示灯(running/warning/error/offline 颜色 + 动画) + 运行时长("XX天XX时XX分")
- [x] 3.3 右列：同步图标 + "最后同步"时间 + "X分钟前"每秒更新 + 手动同步按钮(spinner 2秒)
- [x] 3.4 卡片样式：`rounded-2xl px-8 py-5`，深色渐变背景，1px 白色边框

**Success Criteria**: 横幅三列在宽屏正确布局，状态灯动画正常，同步时间实时更新

**Tests**: 各状态颜色/动画、uptime 格式化、同步时间相对计算

**Status**: Complete

---

## Stage 4: 三大监控卡片（交易 + 网络 + 系统资源）

**Goal**: 实现数据监控区三卡片，含 SVG 图表

**Tasks**:
- [x] 4.1 `<TransactionCard />`：今日笔数(大号 mono 动态计数)、金额(¥格式)、成功率进度条、响应时长标签、24h SVG 折线迷你图(渐变填充 + hover tooltip)
- [x] 4.2 `<NetworkCard />`：延迟值(颜色阈值)、丢包率进度条、DNS/网关连通性检测列表、SVG 半圆仪表盘(指针随延迟旋转)
- [x] 4.3 `<SystemResourceCard />`：CPU 圆形进度环(SVG stroke-dasharray, 颜色阈值)、内存水平进度条、磁盘水平进度条、CPU 温度(温度计图标, >70° 红色)
- [x] 4.4 三卡片统一样式：`bg-slate-800/60 border-white/6 rounded-2xl`，标题 + 右侧时间戳，3 秒数据波动渐变过渡
- [x] 4.5 响应式：宽屏 `grid-cols-3`，竖屏堆叠

**Success Criteria**: 三卡片正确渲染含 SVG 图表，数据每 3 秒波动，动画平滑

**Tests**: 颜色阈值逻辑、数字格式化、SVG 渲染、响应式断点

**Status**: Complete

---

## Stage 5: 硬件自检面板 `<HardwareCheckPanel />`

**Goal**: 实现 8 项硬件自检网格面板

**Tasks**:
- [ ] 5.1 定义 8 项硬件 Mock 数据：身份证读卡器、医保卡读卡器、银行卡读卡器、凭条打印机、报告打印机、发卡模块、扫码器、人脸识别相机
- [ ] 5.2 网格布局：宽屏 4 列，竖屏 2 列
- [ ] 5.3 硬件卡片：顶部 24x24 SVG 图标 + 状态点标签(ok/warning/error/checking/disabled)、中部硬件名称、底部状态详情
- [ ] 5.4 交互："全部检测"按钮(依次 checking → 结果)、单项检测/复位按钮、error 状态红色渐变 + 3px 红左边框
- [ ] 5.5 checking 状态动画(旋转/脉冲)

**Success Criteria**: 8 项硬件网格正确显示，全部检测依次动画，单项操作正常

**Tests**: 全部检测异步流程、状态切换、error 视觉增强

**Status**: Not Started

---

## Stage 6: 设备控制 + 服务地址面板

**Goal**: 重构设备控制区和服务地址区

**Tasks**:
- [ ] 6.1 `<DeviceControlPanel />`：4 个按钮（重启客户端/关闭客户端/关闭终端/重启终端）
- [ ] 6.2 交互保护：常规操作二次确认(确认/取消双按钮)；高危操作(关闭/重启终端) Modal 强制输入 "CONFIRM"
- [ ] 6.3 全局加载遮罩：高危操作执行时 `isCriticalActionProcessing = true`，覆盖全页面
- [ ] 6.4 IPC 通信接口预留（`window.electronAPI.shutdown()` 等桥接方法）
- [ ] 6.5 `<ServiceEndpointsPanel />`：多个服务地址(业务后端/HIS/支付网关等)、URL + 实时 Ping 延迟显示
- [ ] 6.6 服务地址编辑：点击编辑唤起虚拟键盘修改 URL

**Success Criteria**: 控制按钮分级确认正常，高危操作需输入 CONFIRM，服务地址可编辑

**Tests**: 二次确认流程、CONFIRM 输入验证、全局遮罩触发/消除、服务地址 CRUD

**Status**: Not Started

---

## Stage 7: 三个子页面（系统设置 / 硬件调试 / 故障申报）

**Goal**: 实现三个导航子页面

**Tasks**:
- [ ] 7.1 `<SystemSettingsPage />`：显示设置(亮度/分辨率滑块)、网络设置(静态 IP 配置 + 虚拟键盘)、业务参数(超时时间/重试次数)、安全设置(密码修改/自动锁屏)。大触控热区表单项
- [ ] 7.2 `<HardwareDebugPage />`：左侧外设 Tab 列表、右侧设备详情(固件版本/串口号)、模拟黑色终端实时日志输出框(滚动 + 自动跟随)、特定指令测试按钮(走纸测试/退卡指令等)
- [ ] 7.3 `<FaultReportPage />`：左侧表单(下拉故障类型 + 虚拟键盘描述 + 红黄蓝优先级色块单选) + 自动打包日志快照提交。右侧历史记录时间线
- [ ] 7.4 路由注册：移除 `/logs` 路由，确保 4 个导航项与路由匹配

**Success Criteria**: 三个页面渲染正常，表单交互正确，键盘唤起正常

**Tests**: 表单验证、Tab 切换、日志输出模拟、时间线渲染

**Status**: Not Started

---

## Stage 8: 全局集成 + 细节打磨

**Goal**: 全局组件集成、动画打磨、最终验收

**Tasks**:
- [ ] 8.1 provide/inject 或 Store 分发 `terminalInfo` 和 `MaintenanceStore`
- [ ] 8.2 右上角 Toast 通知栈改进：带倒计时指示器
- [ ] 8.3 全局高危操作 Loading 遮罩组件完善
- [ ] 8.4 虚拟键盘全局挂载：特定输入框 focus 自动唤起
- [ ] 8.5 路由过渡：内容区 `<Transition name="page">` 淡入平移效果
- [ ] 8.6 CSS 变量统一审查，移除旧浅色主题残留
- [ ] 8.7 竖屏 Kiosk 适配最终验证（1080x1920 等比例）
- [ ] 8.8 全量回归测试 + 修复

**Success Criteria**: 应用整体一致性良好，无视觉割裂，所有交互流畅，测试全部通过

**Tests**: E2E 关键路径、响应式断点验证、动画性能

**Status**: Not Started

---

## 依赖关系

```
Stage 1 (基础设施)
  ├── Stage 2 (侧栏+布局) ─┐
  │                         ├── Stage 7 (子页面)
  ├── Stage 3 (设备横幅) ───┤
  │                         ├── Stage 8 (集成打磨)
  ├── Stage 4 (监控卡片) ───┤
  │                         │
  ├── Stage 5 (硬件面板) ───┤
  │                         │
  └── Stage 6 (控制+地址) ──┘
```

Stage 1 是所有后续阶段的前置依赖。Stage 2-6 可以并行或按顺序推进（推荐按编号顺序）。Stage 7 依赖 Stage 2 的布局。Stage 8 在所有阶段完成后进行。

---

## 预估组件清单

| 组件 | 路径 | 阶段 |
|------|------|------|
| 全局 CSS 变量 | `src/style/global.css` | 1 |
| 类型定义 | `src/types/maintenance.ts` | 1 |
| MaintenanceStore | `src/stores/maintenance.ts` | 1 |
| SideNav | `src/components/SideNav.vue` | 2 |
| MobileDrawer | `src/components/MobileDrawer.vue` | 2 |
| AppLayout (重构) | `src/layouts/AppLayout.vue` | 2 |
| DeviceInfoBanner | `src/modules/dashboard/components/DeviceInfoBanner.vue` | 3 |
| TransactionCard | `src/modules/dashboard/components/TransactionCard.vue` | 4 |
| NetworkCard | `src/modules/dashboard/components/NetworkCard.vue` | 4 |
| SystemResourceCard | `src/modules/dashboard/components/SystemResourceCard.vue` | 4 |
| HardwareCheckPanel | `src/modules/dashboard/components/HardwareCheckPanel.vue` | 5 |
| DeviceControlPanel | `src/modules/dashboard/components/DeviceControlPanel.vue` | 6 |
| ConfirmInputModal | `src/components/ConfirmInputModal.vue` | 6 |
| CriticalOverlay | `src/components/CriticalOverlay.vue` | 6 |
| ServiceEndpointsPanel | `src/modules/dashboard/components/ServiceEndpointsPanel.vue` | 6 |
| SystemSettingsPage | `src/modules/settings/SystemSettingsPage.vue` | 7 |
| HardwareDebugPage | `src/modules/hardware/HardwareDebugPage.vue` | 7 |
| FaultReportPage | `src/modules/reports/FaultReportPage.vue` | 7 |
| DashboardPage (重构) | `src/modules/dashboard/DashboardPage.vue` | 3-6 |
