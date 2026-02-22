# Phase 18: 虚拟键盘全面重设计

> 日期：2026-02-22

## 完成内容

### VirtualKeyboard.vue 完整重写
- **深色主题**：bg-gray-800 (#1e2130) 深色背景，圆角顶部，拖拽把手
- **固定底部定位**：position: fixed bottom，max-width 48rem 居中
- **工具栏**：输入预览区（密码掩码）+ 彩色模式标签 pill + 关闭按钮
- **4 种键盘模式**：
  - `alpha-lower`：QWERTY 小写键盘
  - `alpha-upper`：QWERTY 大写键盘
  - `number`：数字 + 常用符号
  - `symbol`：特殊字符（靛蓝色调）
- **Shift 状态机**：off → once（单次大写）→ caps（锁定）→ off
- **按键样式**：字符键、功能键、确认键、空格键各有不同色调 + 3D box-shadow + active:scale 反馈
- **动画**：
  - kb-slide：键盘滑入 300ms / 滑出 220ms (cubic-bezier)
  - kb-fade：遮罩层淡入淡出
  - kb-mode：模式切换 150ms/120ms opacity + translateY
- **长按退格**：480ms 延迟 → 80ms 间隔连续删除
- **滑动关闭**：向下滑动 50px 以上关闭键盘
- **遮罩层**：半透明黑色 + backdrop-filter blur

### useVirtualKeyboard composable（新建）
- 多字段虚拟键盘状态管理
- `activeField` / `values` / `keyboardVisible` 响应式状态
- `currentInputType` / `currentFieldLabel` / `currentValue` 计算属性
- `openKeyboard(field)` / `closeKeyboard()` 方法
- 通用泛型 `<T extends string>` 支持任意字段配置

### LoginPage 键盘联动
- 将 `<input>` 元素替换为 div-input（点击唤起键盘）
- staffId / password 通过 computed ref 代理到 kb.values
- 确认流程：工号确认 → 自动跳转密码字段，密码确认 → 触发登录
- Tab 切换自动关闭键盘
- 活动输入框显示 focus 蓝色高亮样式
- 卡号输入同样支持键盘联动

### DashboardPage / HardwarePage 更新
- 适配新 VirtualKeyboard 接口（v-model + props + events）
- 移除旧 wrapper div 内联渲染方式

### 单元测试（新增 17 个）
- **useVirtualKeyboard composable**（11 个测试）：
  - 初始状态、显隐控制、字段切换、inputType/label 映射
  - currentValue 读写、跨字段切换值保持、无活动字段写入安全
- **LoginPage 键盘集成**（6 个测试）：
  - div-input 点击唤起键盘、Tab 切换关闭键盘
  - focus 样式、密码掩码显示
- **VirtualKeyboard 组件**（28 个测试，已有）：
  - 可见性、Alpha 键盘、Shift/CapsLock、模式切换
  - 数字键盘、符号键盘、退格、确认、工具栏

## 文件变更

| 文件 | 操作 |
|-----|------|
| `src/components/VirtualKeyboard.vue` | 完整重写 |
| `src/composables/useVirtualKeyboard.ts` | 新建 |
| `src/modules/login/LoginPage.vue` | 集成键盘 |
| `src/modules/dashboard/DashboardPage.vue` | 适配新接口 |
| `src/modules/hardware/HardwarePage.vue` | 适配新接口 |
| `src/__tests__/virtual-keyboard.spec.ts` | 重写（28 个测试） |
| `src/__tests__/use-virtual-keyboard.spec.ts` | 新建（11 个测试） |
| `src/__tests__/login-page.spec.ts` | 扩展（+6 个测试） |

## 测试结果

```
Test Files  17 passed (17)
Tests       218 passed (218)
```
