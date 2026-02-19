# Phase 13: 虚拟键盘体验优化

> 完成日期: 2026-02-19

## 改动概要

### Task 13.1 — 九宫格数字键盘模式
- `VirtualKeyboard.vue`: 全面重构，新增 `inputType` prop (`'text' | 'number' | 'ip'`)
- `number` 模式：3x4 九宫格数字键盘（1-9, `.`, 0, ⌫），按键尺寸增大至 h-14/sm:h-16/lg:h-18
- `ip` 模式：3x4 九宫格（1-9, `.`, 0, `:`），专为 IP:port 输入设计
- `text` 模式（默认）：保持原有 QWERTY 布局
- 九宫格底部有 ABC 切换按钮，可随时切回完整字母键盘
- QWERTY 模式下有"数字"按钮可切回九宫格（仅 numpad inputType 下可见）

### Task 13.2 — 输入框智能匹配键盘类型
- `DashboardPage.vue`: serverUrl 输入框的键盘传入 `input-type="ip"`
- `HardwarePage.vue` 和 `LoginPage.vue`: 默认 `text` 模式，无需修改

### Task 13.3 — 键盘弹出时 scrollIntoView
- 新建 `composables/useKeyboardScroll.ts`: 通用 composable，watch `visible` 变为 true 时调用 `scrollIntoView({ behavior: 'smooth', block: 'center' })`，100ms 延迟确保键盘先渲染
- `DashboardPage.vue`: 服务地址 section 添加 `ref="urlSectionRef"`，集成 useKeyboardScroll
- `HardwarePage.vue`: 命令输入区域添加 `ref="commandSectionRef"`，集成 useKeyboardScroll
- `LoginPage.vue`: 密码显示区域添加 `ref="passwordAreaRef"`，集成 useKeyboardScroll

### Task 13.4 — 单元测试
- 新建 `virtual-keyboard.spec.ts`（15 个测试）：
  - 默认 QWERTY 渲染、字母输入
  - number 模式九宫格渲染、数字输入、⌫ 退格
  - ip 模式 `.` 和 `:` 键、独立退格按钮
  - numpad ↔ QWERTY 切换
  - 清空功能
- 新建 `keyboard-scroll.spec.ts`（3 个测试）：
  - visible=true 时 scrollIntoView 调用
  - visible=false 时不调用
  - targetRef=null 时无错误

## 测试结果
- 全部 181 个测试通过（新增 18 个）
- 16 个测试文件全部绿色

## 影响文件
- `src/components/VirtualKeyboard.vue` — 重构（numpad + QWERTY 双模式）
- `src/composables/useKeyboardScroll.ts` — 新建
- `src/modules/dashboard/DashboardPage.vue` — input-type="ip" + scrollIntoView
- `src/modules/hardware/HardwarePage.vue` — scrollIntoView
- `src/modules/login/LoginPage.vue` — scrollIntoView
- `src/__tests__/virtual-keyboard.spec.ts` — 新建
- `src/__tests__/keyboard-scroll.spec.ts` — 新建
