# 登录页重建 + 虚拟键盘升级路线图 — Issue #04 & #05

> 基于 `docs/issue/04-uiux-redesign-zh.md`（登录页重新设计）和 `docs/issue/05-virtual-keyboard-zh.md`（虚拟键盘）以及 `docs/prototype/hospital-keyboard-demo.html`（完整原型）制定的实施计划。

---

## 现状分析

| 组件 | 期望状态 | 当前状态 |
|-----|---------|---------|
| LoginPage.vue | 完整登录页（密码登录 + 员工卡 + Tab 切换 + 虚拟键盘联动） | **文件为空**（0 行），登录路由不可用 |
| StatusBulb.vue | 终端状态栏（Logo + 终端信息 + 时钟） | ✅ 已实现，与原型一致 |
| VirtualKeyboard.vue | 深色主题、固定底部、4 种模式、Shift/CapsLock、工具栏 | 浅色主题、内联渲染、仅 QWERTY + 数字键盘、无符号模式 |
| useVirtualKeyboard | 输入框与键盘联动的 composable | 不存在 |
| 音频反馈 / 长按退格 / 滑动关闭 | 完善的触控体验细节 | 不存在 |

---

## Phase 17: 登录页核心 UI 重建

> 目标：重建 LoginPage.vue，实现完整的登录页面 UI。

### Task 17.1 — LoginPage.vue 完整重建

基于原型 `hospital-keyboard-demo.html`，实现以下结构：

- **布局**：min-h-screen flex flex-col，淡蓝渐变背景 + 网格纹理
- **顶部**：复用 `<StatusBulb />` 作为终端状态栏
- **中部**：登录卡片（max-w-md 居中）
  - 顶部渐变色装饰条
  - 欢迎图标 + 标题「员工身份验证」
  - Tab 切换器（密码登录 / 员工卡登录）
  - **密码登录表单**：
    - 员工工号 div-input（点击唤起键盘）
    - 登录密码 div-input（密码掩码 ●）
    - 清除按钮 / 明密文切换
    - 字数提示 + 错误提示（shake 动画）
    - 登录按钮（loading spinner）
  - **员工卡登录**：
    - NFC 感应区（3 状态：waiting/reading/success/error）
    - 脉冲动画环
    - 手动输入卡号 div-input
- **底部**：IT 服务台 + 版权信息
- **弹窗**：登录成功弹窗（进度条 + 自动关闭）

### Task 17.2 — 单元测试

- Tab 切换（默认密码登录、切换到员工卡、切回）
- 密码登录流程（空表单禁用、正确密码成功、错误密码显示错误）
- 员工卡模拟（reading → success / error 状态流转）
- 登录成功弹窗显示/隐藏
- 组件渲染正确性

---

## Phase 18: 虚拟键盘全面重设计

> 目标：将 VirtualKeyboard 升级为深色主题、固定底部、4 模式完整键盘。

### Task 18.1 — VirtualKeyboard.vue 重写

- **外观**：深色背景（bg-gray-800 / #1e2130），固定底部定位
- **容器**：圆角顶部（rounded-t-2xl），拖拽把手，阴影
- **工具栏**：输入预览区 + 模式标签 pill + 关闭按钮
- **4 种模式**：
  - `alpha-lower`：QWERTY 小写键盘
  - `alpha-upper`：QWERTY 大写键盘
  - `number`：数字 + 常用符号键盘
  - `symbol`：特殊字符键盘（靛蓝色调）
- **Shift 逻辑**：
  - 单按 → one-shot（输入一个大写字母后自动切回小写）
  - 双击 → CapsLock 锁定
  - 再按 → 解锁
- **按键样式**：
  - 普通字符：bg-gray-600，hover:bg-gray-500
  - 功能键：bg-gray-700，hover:bg-gray-600
  - 确认键：bg-blue-600，白色文字
  - 空格键：bg-gray-700，灰色文字
  - 所有键 active:scale-95 按压反馈 + 3D box-shadow
- **动画**：
  - 键盘出现：translateY(100%) → 0，300ms cubic-bezier
  - 键盘消失：translateY(0) → 100%，250ms
  - 模式切换：150ms opacity + translateY 淡入淡出

### Task 18.2 — useVirtualKeyboard composable

- `activeInput`: 当前活动输入字段名
- `inputValues`: 各字段值的 Record
- `keyboardVisible`: 键盘是否可见
- `inputType`: text / password / number
- `openKeyboard(field, type)`: 打开键盘
- `closeKeyboard()`: 关闭键盘

### Task 18.3 — 登录页键盘联动

- 每个 div-input 的 `@click` 调用 `openKeyboard(field, type)`
- 键盘 v-model 绑定 `inputValues[activeInput]`
- 键盘 confirm 事件：工号 → 自动跳转到密码字段，密码 → 触发登录
- 遮罩层点击关闭键盘
- 页面 paddingBottom 动态等于键盘高度

### Task 18.4 — 单元测试

- 4 种键盘模式渲染正确
- Shift one-shot / CapsLock 行为
- 按键输入 / 退格 / 清空
- 模式切换
- 键盘显示/隐藏动画 class
- useVirtualKeyboard composable 行为

---

## Phase 19: 触控体验打磨

> 目标：完善触控交互细节，提升无障碍体验。

### Task 19.1 — 音频反馈

- AudioContext 生成 10ms beep（800Hz，音量 0.06）
- 每次按键触发
- 确认键 / 退格键使用不同频率

### Task 19.2 — 长按退格

- 长按 ⌫ 超过 500ms 进入连续删除（每 80ms 删一个字符）
- mouseup / touchend 停止

### Task 19.3 — 滑动关闭

- 键盘区域向下滑动 50px 以上关闭键盘
- touchstart + touchend 计算位移

### Task 19.4 — 会话超时

- 页面空闲 5 分钟后显示全屏遮罩弹窗
- 点击确认重置表单

### Task 19.5 — 无障碍与防误触

- 所有交互元素 focus:ring-2 focus:ring-blue-500
- 按键最小尺寸 44×44px（WCAG 触摸目标标准）
- 键盘皮肤：维护模式深橙、离线模式禁用

### Task 19.6 — 单元测试

---

## 实施优先级

```
Phase 17 (登录页重建)     ████████████████  ← 最高优先级，当前登录路由不可用
Phase 18 (键盘重设计)     ████████████      ← 高优先级，核心交互组件
Phase 19 (触控体验打磨)   ████████          ← 中等，锦上添花
```

## 组件依赖关系

```
LoginPage.vue
├── StatusBulb.vue          (已完成 ✅)
├── VirtualKeyboard.vue     (Phase 18 重写)
│   ├── alpha-lower / alpha-upper 模式
│   ├── number 模式
│   └── symbol 模式
└── useVirtualKeyboard()    (Phase 18 新建)
```

## 执行原则

1. **逐步推进** — 每个 Phase 完成后再进入下一个
2. **测试先行** — 每个 Task 完成后必须有对应单元测试通过
3. **提交即记录** — 每次 git commit 前测试通过，并在 `docs/milestone/` 记录
4. **参照原型** — 以 `hospital-keyboard-demo.html` 为视觉基准
5. **最小改动** — 不做超出当前 Task 范围的重构
