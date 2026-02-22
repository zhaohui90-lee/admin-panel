## 重新设计自助机登录页面

### prompt1-初始页面骨架

页面需求：
- 整体风格：医疗蓝白配色，简洁专业，适配竖屏触摸屏（1080x1920）和移动端，最小宽度 768px
- 顶部展示终端基本信息区域：终端编号、终端状态（在线/离线/维护中）、终端 IP
- 中部为登录主体区域，默认显示「密码登录」Tab
- 底部保留 logo 和版权信息

终端信息数据结构：
interface TerminalInfo {
  terminalId: string      // 如 "KSK-001"
  status: 'online' | 'offline' | 'maintenance'
  ipAddress: string
}

使用 TailwindCSS 完成所有样式，不引入其他 UI 库。

### prompt2-终端信息状态栏

在登录页顶部，实现一个终端信息状态栏组件 <TerminalStatusBar />。

展示内容：
- 左侧：医院 Logo（占位图）+ 系统名称"医院员工自助终端"
- 右侧：三列信息
  - 终端编号：图标 + "KSK-001"
  - IP 地址：图标 + "192.168.1.100"  
  - 终端状态：带颜色圆点指示灯
    - online → 绿色圆点 + "运行正常"
    - offline → 红色圆点 + "连接断开"
    - maintenance → 黄色圆点 + "维护中"

样式要求：
- 背景使用深蓝色（bg-blue-900）
- 文字白色，信息字体略小（text-sm）
- 圆点用 animate-pulse 动画（online 状态）
- 使用 TailwindCSS flex 布局

### prompt3-密码登录表单

实现密码登录表单组件 <PasswordLoginForm />，这是登录页的默认视图。

表单字段：
- 员工工号输入框（staffId）：前缀图标为人形图标，placeholder="请输入员工工号"
- 密码输入框（password）：前缀图标为锁形图标，右侧切换明文/密文按钮
- 「登录」按钮：全宽，蓝色主色，hover 有过渡效果，loading 状态展示 spinner
- 「忘记密码」文字链接，右对齐

交互逻辑：
- 表单使用 ref 双向绑定
- 点击登录触发 emit('login', { staffId, password })
- 工号或密码为空时，按钮禁用并提示"请填写完整信息"
- 支持回车键提交

样式：
- 输入框圆角大（rounded-xl），内边距充足（适配触摸屏手指点击）
- 整体卡片白色背景，带轻阴影（shadow-lg）

### prompt4-员工卡登录（NFC/刷卡）

实现员工卡登录组件 <CardLoginForm />，作为第二个登录 Tab 的内容。

页面状态机（3 个状态）：
1. waiting：显示 NFC 卡片图标（大图），文字"请将员工卡靠近感应区"，图标做 pulse 动画
2. reading：显示加载 spinner，文字"正在读取卡片信息..."
3. error：显示红色错误图标，文字"读卡失败，请重试"，3 秒后自动返回 waiting

Props：
- cardStatus: 'waiting' | 'reading' | 'error'

用 TailwindCSS transition 实现状态切换的淡入淡出动画。
卡片感应区域用虚线边框 + 圆角大框表示，中间放大图标。

### prompt5-Tab 切换组件

实现登录方式 Tab 切换组件 <LoginTabSwitcher />，包含「密码登录」和「员工卡登录」两个 Tab。

要求：
- 默认激活「密码登录」
- Tab 样式：激活态为蓝色下划线 + 蓝色文字，非激活态为灰色
- 切换时下方内容区用 <Transition> 包裹，实现 fade 或 slide 动画
- Tab 容器宽度与登录卡片等宽

组合结构：
<LoginTabSwitcher>
  <template #password><PasswordLoginForm /></template>
  <template #card><CardLoginForm /></template>
</LoginTabSwitcher>

emit('change', activeTab) 通知父组件当前登录方式。

### prompt6-整合页面 + 响应式适配

整合所有组件，完成 LoginPage.vue 主页面。

布局结构：
- 使用 min-h-screen flex flex-col
- 顶部：<TerminalStatusBar />（fixed 或 sticky top）
- 中部：flex-1 flex items-center justify-center，内放登录卡片
  - 卡片最大宽度：移动端 w-full px-4，桌面/竖屏 max-w-md
- 底部：版权信息，文字居中，灰色小字

响应式要求：
- 移动端（< 768px）：卡片全屏，输入框和按钮高度 h-14（触摸友好）
- 竖屏 Kiosk（1080x1920）：整体缩放居中，卡片宽度 480px，字体稍大
- 使用 TailwindCSS 的 sm: md: 断点控制

背景：使用浅灰（bg-gray-50）或淡蓝渐变（from-blue-50 to-white）。

Mock 数据注入：
const terminalInfo: TerminalInfo = {
  terminalId: 'KSK-001',
  status: 'online',
  ipAddress: '192.168.1.100'
}

### prompt7-细节完善与无障碍

对登录页做最终细节打磨：

1. 键盘无障碍：所有交互元素有 focus:ring-2 focus:ring-blue-500 样式
2. 错误提示：登录失败时，在按钮下方显示红色提示文字（带图标），使用 Transition 动画显隐
3. 会话超时：页面空闲 5 分钟后，显示一个全屏遮罩弹窗"系统检测到您已超时，请重新登录"，点击确认重置表单
4. 时间显示：在终端状态栏右下角显示当前时间，每秒更新（用 onMounted + setInterval）
5. 字体：全局使用系统中文字体 font-sans，关键数字使用 tabular-nums

以上所有样式继续使用 TailwindCSS，不引入额外依赖。