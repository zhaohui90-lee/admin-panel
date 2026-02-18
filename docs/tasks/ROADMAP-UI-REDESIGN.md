# UI 重设计路线图 — 移动端 & 医院自助端

> 基于 `docs/issue/01-design-ui-zh.md` 需求 + `docs/prototype/login-1.html` 新原型，制定的 UI 重设计实施计划。

---

## 背景

当前 UI 虽然做了响应式适配，但本质仍然是**网页端思维**：
- 小字体、小按钮、细边框 — 不适合触控
- 侧边栏导航 — 适合桌面，不适合 Kiosk 大屏触控
- 信息密度高 — 适合鼠标操作，不适合手指点按

**目标使用环境**：
1. **医院自助终端 Kiosk**（触控屏，通常 15-21 英寸）
2. **移动端**（手机/平板，运维人员巡检使用）

---

## 设计原则

### 1. 触控优先 (Touch-First)
- 最小触控目标：**48px × 48px**（推荐 64px+）
- 按钮高度：**≥ 64px**（Kiosk 模式 ≥ 90px）
- 输入框高度：**≥ 56px**（Kiosk 模式 ≥ 70px）
- 元素间距：**≥ 12px**，避免误触

### 2. 工业级视觉 (Industrial UI)
- 参照 `login-1.html` 原型的设计系统
- 大圆角 (`16px ~ 24px`)
- 实体感投影 (`box-shadow: 0 4px 0`)
- 高对比度配色（深蓝 + 白 + 状态色）
- 清晰的状态指示（大灯泡式状态灯 + 呼吸动画）

### 3. 简洁信息层级
- 每屏聚焦一个核心任务
- 关键信息放大显示（字号 24px+）
- 次要信息弱化或折叠

### 4. 双端自适应
- **Kiosk 模式**（≥ 1024px）：双栏分屏布局（状态面板 + 操作区）
- **移动端**（< 768px）：单列全屏布局，底部导航栏

---

## Phase 8: 设计系统升级

> 目标：建立触控优先的全局设计令牌（Design Tokens），为后续页面重构打基础。

### Task 8.1 — 全局 CSS 变量 & Tailwind 主题更新
- **文件**: `src/style/global.css`
- 新增触控尺寸变量（参照 `login-1.html` 的 `:root` 变量）
  - `--btn-height-kiosk: 90px` / `--btn-height-mobile: 56px`
  - `--input-height-kiosk: 70px` / `--input-height-mobile: 56px`
  - `--radius-lg: 24px` / `--radius-md: 16px`
- 更新 Tailwind `@theme` 配色：深蓝灰背景 (`#0f172a`)、医疗蓝 (`#2563eb`) 等
- 定义全局动画：`ripple`（呼吸光环）、`fadeUp`（进入动效）

### Task 8.2 — 基础触控组件
- **新建**: `src/components/TouchButton.vue`
  - 大尺寸按钮组件，支持 `kiosk` / `mobile` 两种尺寸模式
  - 内置 `:active` 下压反馈（translateY + shadow 消失）
  - 支持图标 + 文字、loading 状态、disabled 状态
- **新建**: `src/components/TouchInput.vue`
  - 大尺寸输入框组件
  - 内置清除按钮
  - focus 时蓝色光环 (`box-shadow: 0 0 0 6px`)
- **新建**: `src/components/StatusBulb.vue`
  - 大圆灯状态指示组件
  - 支持 green/yellow/red 三种状态
  - 呼吸动画（`ripple` keyframe）

### Task 8.3 — 单元测试
- TouchButton 渲染 + 点击 + 尺寸切换测试
- TouchInput 输入 + 清除 + focus 样式测试
- StatusBulb 状态切换 + 动画 class 测试

---

## Phase 9: 登录页重构

> 目标：按 `login-1.html` 原型完全重构登录页，三模式登录 + 触控优化。

### Task 9.1 — 布局重构
- **文件**: `src/modules/login/LoginPage.vue`
- Kiosk（≥ 1024px）：左侧状态面板 (38%) + 右侧交互区 (62%)
- 移动端（< 768px）：全屏交互区，状态面板收缩为顶部状态栏
- 左侧面板内容：
  - 品牌标题（"省人民医院 / 设备管理中心"）
  - 大状态灯（`StatusBulb` 组件，显示系统在线状态）
  - 设备信息（Device ID / IP / Version，`monospace` 字体）

### Task 9.2 — 三模式登录交互
- **刷卡模式**（默认）：大图标 + "请刷员工卡" 提示 + 脉冲动画
- **扫码模式**：二维码图标 + "请使用企业微信/钉钉扫码" 提示
- **密码模式**：工号输入框 + 密码输入框 + 登录按钮
  - 使用 `TouchInput` 组件
  - 保留虚拟键盘（可选弹出）
- 底部导航栏：两个大按钮动态切换模式（参照原型的状态机逻辑）
- 视图切换动画：`fadeUp` 淡入上滑

### Task 9.3 — 单元测试
- 三种模式切换 UI 测试
- 底部导航按钮状态测试
- 密码登录流程测试
- 响应式布局断点测试

---

## Phase 10: 导航系统重构

> 目标：将侧边栏导航改为触控友好的导航方式。

### Task 10.1 — Kiosk 导航模式
- **文件**: `src/layouts/AppLayout.vue`
- Kiosk（≥ 1024px）：左侧窄导航栏（图标 + 文字），大号导航项（64px+ 高度）
- 移动端（< 768px）：底部 Tab 导航栏（固定底部，5 个 Tab 图标）
- 导航项保持：运行状态 / 硬件测试 / 交易日志 / 系统设置 / 退出
- 当前页高亮：粗边框 + 背景色变化

### Task 10.2 — 页面过渡动画
- 页面切换使用 `<Transition>` + 滑动/淡入效果
- 提升 Kiosk 用户的操作反馈感

### Task 10.3 — 单元测试
- 导航项高亮测试
- 移动端底部栏渲染测试
- 页面过渡测试

---

## Phase 11: 仪表盘页触控重构

> 目标：仪表盘页面适配触控操作，信息卡片放大，操作按钮加大。

### Task 11.1 — 状态卡片触控化
- **文件**: `src/modules/dashboard/DashboardPage.vue`
- 卡片最小高度 120px，字号放大（数值 36px+，标签 18px+）
- Kiosk：3 列网格 / 移动端：单列堆叠
- 状态指示灯使用 `StatusBulb` 组件

### Task 11.2 — 硬件自检列表触控化
- 每个设备项行高 ≥ 64px
- 状态灯放大（20px+ 直径）
- 进度条加粗（8px+ 高度）
- 点击展开设备详情（可选）

### Task 11.3 — 操作按钮区触控化
- 使用 `TouchButton` 组件
- Kiosk 模式：按钮高度 90px，3 列网格
- 移动端：按钮高度 56px，2 列网格
- 确认对话框按钮同样放大

### Task 11.4 — 单元测试
- 卡片渲染 + 响应式测试
- 操作按钮点击 + 确认流程测试

---

## Phase 12: 其他页面触控适配

> 目标：统一所有页面的触控体验。

### Task 12.1 — 硬件测试页 (`HardwarePage.vue`)
- 设备列表项放大
- 连接/断开按钮使用 `TouchButton`
- 终端视图字号放大（Kiosk 模式 18px+）

### Task 12.2 — 日志查看页 (`LogsPage.vue`)
- 过滤器按钮放大
- 日志条目行高增加
- 分页按钮触控化

### Task 12.3 — 设置页 (`SettingsPage.vue`)
- 表单输入使用 `TouchInput`
- 开关/选择器触控化

### Task 12.4 — 全局组件适配
- `ConfirmDialog.vue`：按钮放大，Kiosk 模式居中大弹窗
- `VirtualKeyboard.vue`：Kiosk 模式按键 ≥ 56px
- `ToastContainer.vue`：通知字号放大，显示时间延长

### Task 12.5 — 单元测试
- 各页面基础渲染测试
- 触控组件集成测试

---

## 实施优先级

```
Phase 8  (设计系统升级)    ████████████  ← 最高优先级，所有页面的基础
Phase 9  (登录页重构)      ████████████  ← 高优先级，用户第一接触点
Phase 10 (导航系统重构)    ████████      ← 中高，影响全局体验
Phase 11 (仪表盘触控重构)  ████████      ← 中高，核心功能页面
Phase 12 (其他页面适配)    ██████        ← 中等，逐页推进
```

## 执行原则

1. **逐步推进** — 每个 Phase 完成后再进入下一个
2. **原型驱动** — 以 `docs/prototype/login-1.html` 为视觉参照基准
3. **测试先行** — 每个 Task 完成后必须有对应单元测试
4. **提交即记录** — 每次 git commit 前测试通过，并在 `docs/milestone/` 记录
5. **双端验证** — 每个 Phase 完成后在 Kiosk 分辨率（1024×768）和移动端（375×812）下验证
6. **渐进增强** — 先保证移动端可用，再优化 Kiosk 体验
