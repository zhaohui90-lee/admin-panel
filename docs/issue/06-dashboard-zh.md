## 医院自助机仪表盘页面

### 整体架构与数据模型

为医院自助机创建一个运维仪表盘页面，使用 Vue 3 + TypeScript + TailwindCSS。考虑到终端外壳通常基于跨平台方案打包，整体需预留与底层系统交互的接口。

页面整体布局：

- 宽屏模式（≥ 1024px）：左侧固定导航栏（宽度 220px），右侧内容区域流式布局，内容随数据量自然撑高。
- 竖屏模式（< 1024px，Kiosk 适配）：采用顶部标题栏 + 汉堡菜单（唤出抽屉式侧边栏 Drawer），避免在大型竖屏设备上使用底部 Tab Bar 导致的操作跨度过大。

定义核心数据结构：
```typescript
// 终端基础信息
interface TerminalInfo {
  deviceId: string // 'KSK-001'
  location: string // '门诊大厅 A 区'
  runStatus: 'running' | 'warning' | 'error' | 'offline'
  lastSyncTime: string // ISO 时间字符串
  uptime: number // 运行秒数
}

// 全局运维状态 Store
interface MaintenanceStore {
  isCriticalActionProcessing: boolean // 是否正在执行高危操作（如重启），用于唤起全局遮罩
  connectionState: 'connected' | 'reconnecting' | 'disconnected'
  notifications: Array<{
    id: number
    type: 'success' | 'warning' | 'error' | 'info'
    message: string
    duration?: number
  }>
}

// 交易数据
interface TransactionStats {
  todayTotal: number // 今日总交易笔数
  todayAmount: number // 今日总金额（元）
  successRate: number // 成功率 0-100
  avgResponseMs: number // 平均响应时长
  hourlyTrend: number[] // 24 小时逐时笔数
}

// 网络状态
interface NetworkStatus {
  latency: number // ms
  packetLoss: number // % 0-100
  bandwidth: number // Mbps
  dnsOk: boolean
  gatewayOk: boolean
}

// 系统资源
interface SystemResource {
  cpuUsage: number // % 0-100
  memUsed: number // MB
  memTotal: number // MB
  diskUsed: number // GB
  diskTotal: number // GB
  temperature: number // CPU 温度 °C
}

// 硬件自检
type HardwareStatus = 'ok' | 'warning' | 'error' | 'checking' | 'disabled'
interface HardwareItem {
  id: string
  name: string
  icon: string // SVG path 或 emoji
  status: HardwareStatus
  detail: string // 状态描述，如 '读写正常' | '纸张剩余 30%'
  lastCheck: string
}

// 服务地址
interface ServiceEndpoint {
  id: string
  label: string // '业务后端' | 'HIS 系统' | '支付网关' 等
  url: string
  pingMs: number | null // null 表示未连通
  editable: boolean
}
```
所有数据通过Pinia 存储，使用 Mock 数据初始化。CPU、延迟、同步时间每 3 秒随机波动模拟真实感。整体使深色工业风主题配色。

### 左侧导航栏 / 抽屉菜单

实现左侧固定导航栏组件 <SideNav />，包含 4 个导航项：

- 运行状态（默认激活）
- 系统设置
- 硬件调试
- 故障申报

视觉与交互设计：

- 背景：深海军蓝 #0f1729，右侧有 1px 分隔线 rgba(255,255,255,0.06)
- 顶部：医院 Logo 占位 + 系统名称"运维中心"，副标题"Maintenance Console"
- 导航项：高度 64px（增大触摸热区），左侧 4px 激活指示条。
  - 激活态：蓝色渐变背景 + 蓝色文字。
  - 非激活态：灰色文字，hover 时淡白色。
  - 左侧带有 20x20 的 SVG 图标（运行：波形；设置：齿轮；调试：电路板；申报：警告）。
- 底部控制区：操作员信息区（头像占位 + "管理员 Admin"）+ 双向出口设计：
  - 「锁定/注销」按钮：返回管理员登录页。
  - 「返回业务」按钮：退出运维模式，回到患者自助交互主程序。
- 过渡：导航切换时，右侧内容区平滑 fade-transform 过渡。

### 运行状态：顶部设备信息条

实现"运行状态"页面顶部的设备信息横幅组件 <DeviceInfoBanner />。

布局：单行横向，3 列均等分布（或 flex justify-between），背景略深于内容区。

左列 — 设备标识：

- 大号设备编号（mono 字体，24px，白色）
- 副文字：部署位置（灰色，小字）
- 左侧有蓝色医疗十字图标

中列 — 运行状态：

- 状态指示器（圆形大灯 + 文字）：
  - running → 绿色 + "运行中" + 绿色 pulse 光晕动画
  - warning → 黄色 + "异常告警" + 慢速闪烁
  - error → 红色 + "故障停机" + 快速闪烁
  - offline → 灰色 + "离线" + 无动画
- 下方：运行时长（uptime 格式化为 "XX 天 XX 时 XX 分"）

右列 — 同步信息：

- 图标 + "最后同步"标签 + 时间（"2025-01-08 14:32:01" 格式）
- 下方：距上次同步经过时长（"3 分钟前"，每秒更新）
- 手动同步按钮（小图标按钮，点击后 spinner 转动 2 秒）

整体：

- 圆角卡片（rounded-2xl），内边距 px-8 py-5
- 背景：深色渐变 from-slate-800/80 to-slate-900/80
- border: 1px solid rgba(255,255,255,0.08)
- 使用 TailwindCSS，不引入其他 UI 库

### 运行状态：交易数据 + 网络 + 系统资源

实现数据监控区，三个卡片横向排列（grid grid-cols-3 gap-4），内容区流式布局。

卡片一：交易数据 <TransactionCard />

- 标题："今日交易"
- 主数字：今日笔数（大号，白色，mono 字体，动态计数动画）
- 副行：金额（格式化 "¥ 12,340.00"）
- 成功率进度条：蓝绿色填充，显示百分比
- 平均响应：小标签 "<120ms" 绿色 / ">300ms" 红色
- 底部：24 小时折线迷你图（纯 SVG 绘制，不用 chart 库）
  - 数据点连线，渐变填充面积，hover 时显示 tooltip

卡片二：网络延迟 <NetworkCard />

- 标题："网络状态"
- 核心指标：延迟 ms（大号 mono，<50ms 绿 / <150ms 黄 / >150ms 红）
- 丢包率：进度条（正常 0-1% 绿，超过 5% 红）
- 连通性检测列表（2 行）：
  - DNS 解析 ✓/✗ + 颜色标记
  - 网关 Ping ✓/✗ + 颜色标记
- 实时网络质量动态圆弧仪表盘（SVG 半圆，根据延迟值旋转指针）

卡片三：系统资源 <SystemResourceCard />

- 标题："系统资源"
- CPU 使用率：圆形进度环（SVG stroke-dasharray），中心显示数值%
  - <60% 蓝色，60-80% 黄色，>80% 红色
- 内存：水平进度条 + "已用/总量 MB"
- 磁盘：水平进度条 + "已用/总量 GB"
- CPU 温度：温度计图标 + 数值°C（>70° 红色警告）

所有卡片：

- 背景 bg-slate-800/60，border border-white/6，rounded-2xl
- 标题区域：小灰字 + 右侧实时更新时间戳
- 每 3 秒数据自动波动，波动时数字有渐变过渡

### 运行状态：硬件自检状态

实现 <HardwareCheckPanel />，涵盖身份证读卡器、打印机等 8 项外设。
- 布局：网格布局，宽屏 4 列，竖屏 2 列。
- 硬件卡片设计：
  - 顶部：24x24 SVG 图标 + 状态点标签（ok/warning/error/checking/disabled）。
  - 中部：硬件名称（白色，text-base）。
  - 底部：状态详情（灰色，text-sm，确保触屏可读性）。
- 交互逻辑：
  - "全部检测"：依次进入 checking 状态，模拟异步自检过程。
  - 单项卡片右上角提供触屏友好的操作按钮：正常/告警状态显示「检测」图标，error 状态显示「复位/重试」图标。
  - error 状态视觉增强：背景轻微红色渐变，左侧 3px 红边框。

### 运行状态：设备控制 + 服务地址

- 设备控制 <DeviceControlPanel />：包含重启客户端、关闭客户端、关闭终端、重启终端 4 个按钮。
  - 交互保护：常规操作需二次确认（变为确认/取消双按钮）；关闭/重启终端等操作系统级高危操作，需弹出 Modal 强制输入 "CONFIRM"。
  - 底层通信：按钮触发后，触发加载遮罩，并调用预留的 IPC 通信接口（例如通过预加载脚本暴露的 window.electronAPI.shutdown() 或类似桥接方法）向底层系统发送系统级指令。
- 服务链接 <ServiceEndpointsPanel />：展示核心 API 和 HIS 接口。
  - 包含 URL、实时 Ping 延迟。
  - 点击「编辑」唤起屏幕虚拟键盘 <VirtualKeyboard /> 进行修改。

### 系统设置、硬件调试、故障申报（页面框架）

- 系统设置 <SystemSettingsPage />：包含显示、网络、业务参数、安全设置四个卡片组。提供滑块、下拉框、虚拟键盘输入的静态 IP 配置等大触控热区表单项。
- 硬件调试 <HardwareDebugPage />：左侧外设 Tab，右侧展示设备详细参数（固件、串口号等）、模拟黑色终端的实时日志输出框，以及硬件级的特定指令测试按钮（如：走纸测试、退卡指令）。
- 故障申报 <FaultReportPage />：左侧表单（下拉类型、虚拟键盘描述、红黄蓝优先级色块单选），自动打包日志快照提交。右侧时间线展示历史记录。

### 整合组装 + 全局细节打磨

1. 依赖注入：使用 provide/inject 或状态管理库在顶级组件分发 terminalInfo 和 MaintenanceStore。
2. 路由过渡：内容区包裹 <Transition name="page"> 实现淡入平移效果，内容区独立 overflow-y-auto。
3. 全局组件：
   1. 右上角 Toast 通知栈（带倒计时）。
   2. 全局高危操作 Loading 遮罩。
   3. 屏幕软键盘（全局挂载，由特定输入框 focus 唤起）。
4. CSS 变量与背景：
```css
--bg-base: #0b0f1a;
--bg-card: rgba(30,37,54,0.8);
--border: rgba(255,255,255,0.07);
--text-primary: #e2e8f0;
```
页面底层铺设 5% 透明度的 SVG 细网格纹理。
