## 虚拟键盘

### 键盘整体架构与数据模型

为医院自助机登录页面创建一个虚拟键盘组件 <VirtualKeyboard />，使用 Vue 3 + TypeScript + TailwindCSS。

键盘需支持 4 种模式（mode）：
- 'alpha-lower'  → 小写字母键盘（默认）
- 'alpha-upper'  → 大写字母键盘
- 'number'       → 数字 + 运算符键盘
- 'symbol'       → 特殊字符键盘

定义键位数据结构：
interface KeyItem {
  label: string          // 显示文字，如 "A"、"@"、"⌫"
  value: string          // 实际输入值，如 "a"、"@"、"BACKSPACE"
  type: 'char'           // 普通字符
       | 'backspace'     // 删除
       | 'space'         // 空格
       | 'enter'         // 确认
       | 'shift'         // 大小写切换
       | 'mode'          // 模式切换（数字/符号/字母）
       | 'clear'         // 清空输入
  span?: number          // 占几列宽度（默认 1）
  active?: boolean       // 当前是否激活（如 Shift 锁定）
}

定义各模式的完整键位布局（rows: KeyItem[][]），键盘为 4 行结构。

Props:
- modelValue: string       // v-model 绑定当前输入值
- visible: boolean         // 是否显示键盘
- inputType?: 'text' | 'password' | 'number'  // 输入类型，number 时默认打开数字模式

Emits:
- update:modelValue
- confirm     // 按下 Enter 时
- close       // 点击遮罩或关闭按钮时

使用 TailwindCSS，不引入其他 UI 库。

### 字母键盘布局（大小写）

实现 VirtualKeyboard 的字母键盘布局，共 4 行：

小写布局（alpha-lower）：
Row 1: q w e r t y u i o p
Row 2: a s d f g h j k l
Row 3: [Shift↑(span=1.5)] z x c v b n m [⌫(span=1.5)]
Row 4: [123(span=2)] [#&@(span=2)] [空格(span=4)] [确认(span=2)]

大写布局（alpha-upper）与小写完全一致，但所有字母 label/value 改为大写。
Shift 键激活时高亮（蓝色背景）。

单次按 Shift → 输入一个大写字母后自动切回小写（one-shot 模式）。
双击 Shift → 锁定大写（CapsLock），再按 Shift 解锁。

键盘样式要求：
- 整体深灰色背景（bg-gray-800）
- 普通字符键：bg-gray-600 hover:bg-gray-500，圆角 rounded-lg
- 功能键（Shift/⌫/123/#&@/确认）：bg-gray-700 hover:bg-gray-600，颜色稍深
- 确认键：bg-blue-600 hover:bg-blue-500，白色文字
- 所有键点击有 active:scale-95 按压反馈
- 字母键 h-12，底部行功能键 h-14
- 使用 CSS grid + gap-1.5 布局

### 数字键盘布局

实现数字键盘模式（mode === 'number'）的布局：

纯数字小键盘（inputType 为 'number' 时，3列布局）
Row 1: 7  8  9
Row 2: 4  5  6
Row 3: 1  2  3
Row 4: [清空]  0  [⌫]
附加行: [取消(span=3/2)] [确认(span=3/2)]

两种形态通过 computed 根据 props.inputType 自动切换。

样式区分：
- 数字键：bg-gray-600，字体略大（text-lg font-semibold）
- 符号键：bg-gray-700，text-sm
- 纯数字键盘的数字键更大（h-16）、字体更大（text-xl），适合触摸操作

### 特殊字符键盘布局

实现特殊字符键盘模式（mode === 'symbol'）的布局：

Row 1: [  ]  {  }  #  %  ^  *  +  =
Row 2: _  \  |  ~  <  >  €  £  ¥  •
Row 3: [ABC(span=1.5)] .  ,  ?  !  ' [⌫(span=1.5)]
Row 4: [123(span=2)] [空格(span=4)] [确认(span=4)]

视觉设计：
- 特殊字符键使用略微偏紫/靛蓝的背景色（bg-indigo-900/60），与字母键和数字键形成视觉区分
- 常用符号（.  ,  ?  !）用稍亮颜色强调
- 每个字符键在 hover 时 tooltip 显示字符全名（如 "左方括号"）用 title 属性实现

模式切换按钮位置固定在左下角，按钮文字：
- 字母键盘时显示 "123"
- 数字键盘时显示 "ABC"  
- 特殊字符时显示 "ABC"（也可回到字母）

模式切换加入 150ms transition 动画（键盘内容整体 opacity + translateY 淡出淡入）。

### 键盘容器、定位与动画

实现 VirtualKeyboard 的容器布局与出现/消失动画。

定位方式：
- 键盘固定在屏幕底部（fixed bottom-0 left-0 right-0）
- 顶部有圆角（rounded-t-2xl）
- 背景 bg-gray-800，顶部拖拽把手（小圆条 w-10 h-1 bg-gray-600 mx-auto mt-3 rounded-full）

动画：
- 出现：translateY(100%) → translateY(0)，duration 300ms，easing cubic-bezier(0.32,0.72,0,1)
- 消失：translateY(0) → translateY(100%)，duration 250ms
- 使用 Vue <Transition> 配合 CSS enter/leave classes 实现
- 键盘出现时，背后内容区上移（页面 paddingBottom 动态等于键盘高度），避免输入框被遮挡

顶部工具栏（键盘内部，第一行）：
- 左侧：当前模式标签（"字母" / "数字" / "符号"）
- 右侧：关闭按钮（× 图标），点击触发 emit('close')

整体高度约 280-320px，键盘区域铺满宽度，padding 左右各 8px。
在宽屏（≥ 768px）下居中并限制最大宽度 max-w-3xl mx-auto，适配自助机横屏。

### 与登录页输入框联动

将 VirtualKeyboard 组件接入登录页面（LoginPage.vue），实现输入框点击自动唤起键盘。

实现方案：
1. 使用 composable：useVirtualKeyboard()
   返回值：
   - activeInput: Ref<'staffId' | 'password' | 'cardNumber' | null>
   - inputValues: Ref<Record<string, string>>
   - keyboardVisible: Ref<boolean>
   - inputType: Ref<'text' | 'password' | 'number'>
   - openKeyboard(field, type)
   - closeKeyboard()

2. 每个 <input> 添加 @focus 事件调用 openKeyboard(fieldName, type)，同时阻止系统默认键盘（readonly + 用 JS 控制光标）：
   - 工号输入框：openKeyboard('staffId', 'text')
   - 密码输入框：openKeyboard('password', 'password')
   - 卡号输入框：openKeyboard('cardNumber', 'text')

3. 键盘的 v-model 绑定 inputValues[activeInput]，键盘 confirm 事件触发登录逻辑。

4. 输入框显示处理：
   - type 为 'password' 时，显示内容替换为 • 圆点，但 inputValues 存原始值
   - 光标位置跟随（在输入框末尾显示闪烁光标 |，用 CSS animation 模拟）

5. 点击输入框以外区域（非键盘区域）关闭键盘。

注意：移动端需阻止 touchstart 事件默认行为以防止系统键盘弹出。

### 无障碍、触感优化与细节打磨

对虚拟键盘做最终细节打磨：

1. 触感反馈优化：
   - 每次按键播放轻微点击音效（AudioContext 生成 10ms 短促 beep，频率 800Hz，音量 0.05）
   - 按键按下时产生 scale(0.92) 缩放反馈，duration 80ms
   - 长按 ⌫ 超过 500ms 进入连续删除模式（每 80ms 删一个字符）

2. 键盘防误触：
   - 按键最小尺寸 44×44px（符合 WCAG 触摸目标标准）
   - 按键之间保持 6px 间距
   - 滑动手势：在键盘区域向下滑动 50px 以上则关闭键盘

3. Shift 状态指示：
   - 普通：Shift 键图标为 ↑（空心箭头）
   - One-shot 激活：图标变为 ↑（实心箭头）+ 蓝色背景
   - CapsLock 锁定：图标变为 ⇪ + 蓝色背景 + 白色下划线

4. 输入历史与快速清除：
   - 输入框右侧出现清除按钮（× 圆形），在有内容时显示
   - 动态字数统计（如密码框："已输入 8 位"）

5. 键盘皮肤适配：
   - 正常模式：深灰配色（bg-gray-800）
   - 维护模式（terminal.status === 'maintenance'）：深橙配色提醒
   - 离线模式（terminal.status === 'offline'）：键盘禁用，显示"终端离线，无法输入"

以上所有实现继续使用 TailwindCSS + 原生 CSS，不引入额外依赖。

组件依赖关系图：

LoginPage.vue
├── TerminalStatusBar.vue
├── LoginTabSwitcher.vue
│   ├── PasswordLoginForm.vue   ←─┐
│   └── CardLoginForm.vue       ←─┤ 共用 useVirtualKeyboard()
└── VirtualKeyboard.vue  ────────┘
    ├── AlphaKeyboard.vue   (Prompt 2)
    ├── NumberKeyboard.vue  (Prompt 3)
    └── SymbolKeyboard.vue  (Prompt 4)