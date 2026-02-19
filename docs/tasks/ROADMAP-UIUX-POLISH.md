# UI/UX 体验优化路线图 — Issue #03

> 基于 `docs/issue/03-uiux-update-zh.md` 提出的四项改进需求，结合代码实际现状分析，制定的实施计划。

---

## 现状分析

### Issue #03 提出的问题 vs 代码现状

| 问题领域 | 期望行为 | 代码现状 |
|---------|---------|---------|
| 虚拟键盘 — 数字键盘 | 输入端口/IP 时自动切换九宫格数字键盘 | 仅有字母/符号两层切换，无智能数字键盘 |
| 虚拟键盘 — 遮挡处理 | 键盘弹出时 `scrollIntoView` 自动顶起输入框 | 全局零 `scrollIntoView` 逻辑；LoginPage 用 `fixed bottom-0`，DashboardPage/HardwarePage 用 inline 渲染 |
| 终端日志 — 自动滚动 | 新日志产生时自动滚到底部 | 无 ref、无 watch、无 `scrollTop = scrollHeight`，必须手动滑屏 |
| 终端日志 — 等宽字体 | 深色背景下增加字间距提高可读性 | `font-mono text-xs sm:text-[13px]`，无 `tracking-wide` |
| 动画性能 — 毛玻璃 | 低端设备用纯色半透明替代 `backdrop-filter: blur()` | `ToastContainer.vue` 使用 `backdrop-blur-sm`，无 `prefers-reduced-motion` 媒体查询 |
| 动画性能 — 呼吸动画 | 低端设备可降级或关闭 | `ripple 2s infinite` 无条件运行，无性能降级 |
| 报错信息 — 错误代码 | Toast 显示 `Error: E02` 等错误代码 | 所有 catch 块仅显示泛泛的 "操作失败"/"操作失败，请重试"，无错误代码 |

---

## Phase 13: 虚拟键盘体验优化

> 目标：提升虚拟键盘的输入效率，解决键盘遮挡输入框的问题。

### Task 13.1 — 九宫格数字键盘模式

- **文件**: `src/components/VirtualKeyboard.vue`
- 新增 `inputType` prop：`'text' | 'number' | 'ip'`，默认 `'text'`
- 当 `inputType === 'number'` 或 `'ip'` 时，默认显示九宫格数字键盘布局：
  ```
  [ 1 ] [ 2 ] [ 3 ]
  [ 4 ] [ 5 ] [ 6 ]
  [ 7 ] [ 8 ] [ 9 ]
  [ . ] [ 0 ] [ ⌫ ]
  ```
- `ip` 模式额外保留 `.` 和 `:` 键（用于 IP 地址 + 端口号输入）
- 九宫格按键尺寸：正方形 `64px × 64px`（Kiosk 模式 `80px × 80px`），增大触控面积
- 保留底部 `[ABC]` 按钮可切换回完整字母键盘

### Task 13.2 — 输入框智能匹配键盘类型

- **文件**: `src/modules/dashboard/DashboardPage.vue`
  - `serverUrl` 输入框：传入 `inputType="ip"`，键盘默认显示数字 + `.` + `:`
- **文件**: `src/modules/hardware/HardwarePage.vue`
  - 命令输入框：保持 `inputType="text"`（命令通常是字母）
- **文件**: `src/modules/login/LoginPage.vue`
  - 密码输入框：保持 `inputType="text"`

### Task 13.3 — 键盘弹出时 scrollIntoView

- **文件**: `src/components/VirtualKeyboard.vue`
- 键盘组件 `onMounted` / 显示时，向父级 emit `keyboard-show` 事件
- **文件**: `src/composables/useKeyboardScroll.ts`（新建）
  - 提取通用 composable：
    - 接收目标输入框的 `ref`
    - 监听键盘显示事件
    - 调用 `inputRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })`
    - 确保输入框在键盘之上可见
- 在 `DashboardPage.vue`、`HardwarePage.vue`、`LoginPage.vue` 三个使用键盘的页面集成该 composable
- LoginPage 的固定定位键盘需要特殊处理：将交互区滚动容器内的输入框顶起

### Task 13.4 — 单元测试

- 数字键盘九宫格布局渲染测试
- `inputType` prop 切换键盘模式测试
- `keyboard-show` 事件触发测试
- `useKeyboardScroll` composable 行为测试（mock `scrollIntoView`）

---

## Phase 14: 硬件终端体验优化

> 目标：终端日志自动滚底 + 低分辨率屏幕可读性提升。

### Task 14.1 — 终端日志自动滚底

- **文件**: `src/modules/hardware/HardwarePage.vue`
- 给终端 `<div>` 添加 template ref：`ref="terminalRef"`
- 新增 `watch`：
  ```ts
  watch(terminalLogs, () => {
    nextTick(() => {
      if (terminalRef.value) {
        terminalRef.value.scrollTop = terminalRef.value.scrollHeight
      }
    })
  }, { deep: true })
  ```
- 用户手动向上滚动时暂停自动滚底（检测 `scrollTop + clientHeight < scrollHeight - threshold`），底部出现 "↓ 新消息" 提示按钮，点击后恢复自动滚底

### Task 14.2 — 终端字体可读性优化

- **文件**: `src/modules/hardware/HardwarePage.vue`
- 终端区域增加 `tracking-wide`（Tailwind `letter-spacing: 0.025em`）
- Kiosk 模式（`lg:`）字号提升至 `lg:text-sm`（14px），移动端保持 `text-xs`
- 时间戳颜色从 `text-gray-500` 调整为 `text-gray-400`，深色背景下提高对比度

### Task 14.3 — 单元测试

- 新日志推入后 `scrollTop` 自动更新测试
- 用户手动滚动后暂停自动滚底测试
- "新消息" 提示按钮出现/消失测试
- 字体 class 正确应用测试

---

## Phase 15: 动画与性能平衡

> 目标：在低端工控设备上避免 GPU 性能瓶颈，保持高端设备上的视觉效果。

### Task 15.1 — prefers-reduced-motion 全局降级

- **文件**: `src/style/global.css`
- 添加全局媒体查询：
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```
- 这确保所有动画（`ripple`、`pulse-soft`、`fade-up`、Tailwind `animate-pulse`）在系统开启"减少动态效果"时自动关闭

### Task 15.2 — backdrop-filter 性能降级

- **文件**: `src/components/ToastContainer.vue`
- 用 CSS 自定义属性 + `@supports` 实现优雅降级：
  - 默认使用纯色半透明背景（`bg-opacity-95`）
  - 仅在支持 `backdrop-filter` 且未开启 `prefers-reduced-motion` 时启用毛玻璃
- 新增 Tailwind 类组合：
  ```
  原: backdrop-blur-sm
  新: bg-opacity-95 supports-[backdrop-filter]:backdrop-blur-sm
  ```

### Task 15.3 — 呼吸动画性能优化

- **文件**: `src/style/global.css`
- 为 `.animate-ripple::after` 添加 `will-change: transform, opacity` 提示浏览器提前分配 GPU 层
- 将 `ripple` 动画从 `transform: scale()` 改为纯 `opacity` 变化方案作为低端设备 fallback
- **文件**: `src/components/StatusBulb.vue`
  - 在 `prefers-reduced-motion: reduce` 下，将呼吸动画替换为静态的 2px 实线边框，保留状态语义但去除动画

### Task 15.4 — 单元测试

- `prefers-reduced-motion` 媒体查询匹配时动画类不渲染测试
- Toast 组件在无 `backdrop-filter` 支持时使用纯色背景测试
- StatusBulb 在 reduced-motion 下无动画 class 测试

---

## Phase 16: 错误信息友好度提升

> 目标：让 Toast 报错信息包含可追溯的错误代码，方便现场人员拍照反馈。

### Task 16.1 — 结构化错误类型

- **文件**: `src/bridge/types.ts`
- 新增 `BridgeError` 类继承 `Error`：
  ```ts
  export class BridgeError extends Error {
    constructor(
      public code: string,        // 如 'E01', 'E02', 'NET_TIMEOUT'
      message: string,
      public detail?: string      // 可选的技术细节
    ) {
      super(message)
      this.name = 'BridgeError'
    }
  }
  ```
- 定义错误代码常量枚举：
  ```ts
  export const ErrorCodes = {
    AUTH_FAILED: 'E01',
    DEVICE_BLOCKED: 'E02',
    NET_TIMEOUT: 'E03',
    BRIDGE_UNAVAILABLE: 'E04',
    COMMAND_FAILED: 'E05',
    CONFIG_INVALID: 'E06',
  } as const
  ```

### Task 16.2 — Bridge 层错误包装

- **文件**: `src/bridge/mock.ts`
  - 在模拟错误场景中抛出 `BridgeError`（而非普通 `Error`）
- **文件**: `src/bridge/electron.ts`
  - IPC 调用失败时解析返回的错误码，包装为 `BridgeError`
- **文件**: `src/stores/device.ts`
  - 轮询中的 silent catch 改为记录最后一次错误（`lastError: Ref<BridgeError | null>`），供 UI 查询
  - 电源操作的 catch 块抛出 `BridgeError` 给调用方

### Task 16.3 — Toast 显示错误代码

- **文件**: `src/composables/useToast.ts`
  - `ToastItem` 接口新增可选字段 `code?: string`
  - 新增便捷方法：`toast.bridgeError(error: BridgeError)`，自动提取 code + message
- **文件**: `src/components/ToastContainer.vue`
  - 错误类型的 Toast 在消息文本前显示错误代码标签：
    ```
    [E02] 检测到卡道阻塞
    ```
  - 代码标签使用 `font-mono bg-red-900/50 px-2 py-0.5 rounded` 样式，视觉突出
- **文件**: `src/modules/dashboard/DashboardPage.vue`
  - `handleConfirm` 的 catch 块：
    ```ts
    catch (e) {
      if (e instanceof BridgeError) {
        toast.bridgeError(e)
      } else {
        toast.error('操作失败，请重试')
      }
    }
    ```
- **文件**: `src/modules/hardware/HardwarePage.vue`
  - 所有 catch 块同理改用 `toast.bridgeError()`

### Task 16.4 — 硬件列表结构化错误代码

- **文件**: `src/stores/device.ts`
  - `HardwareDevice` 类型新增可选字段 `errorCode?: string`
  - Mock 数据中的 `detail: '检测到卡道阻塞 (Error: E02)'` 拆分为：
    - `detail: '检测到卡道阻塞'`
    - `errorCode: 'E02'`
- **文件**: `src/modules/dashboard/DashboardPage.vue`
  - 硬件列表中 `error` 状态的设备，显示结构化错误代码标签

### Task 16.5 — 单元测试

- `BridgeError` 类构造、序列化测试
- `toast.bridgeError()` 正确提取 code + message 测试
- `ToastContainer` 渲染带错误代码标签的 Toast 测试
- DashboardPage catch 块区分 `BridgeError` 和普通 `Error` 测试
- `HardwareDevice.errorCode` 字段正确渲染测试

---

## 实施优先级

```
Phase 14 (终端体验优化)     ████████████  ← 最高优先级，改动小、收益高、无依赖
Phase 16 (错误信息友好度)   ████████████  ← 高优先级，现场运维的刚需
Phase 13 (虚拟键盘优化)     ████████      ← 中高，改善输入效率
Phase 15 (动画性能平衡)     ██████        ← 中等，需低端设备实测验证
```

### 优先级说明

| 排序 | Phase | 理由 |
|-----|-------|------|
| 1 | Phase 14 终端体验 | 代码改动量最小（~30 行），效果立竿见影，零风险 |
| 2 | Phase 16 错误信息 | 对运维人员价值最高（拍照即可定位问题），涉及类型系统改动应尽早落地 |
| 3 | Phase 13 虚拟键盘 | 改动范围较大（VirtualKeyboard 组件 + 3 个页面 + 新 composable），但不阻塞其他功能 |
| 4 | Phase 15 动画性能 | 需要在低端工控机上实测验证效果，且 `prefers-reduced-motion` 在 Kiosk 环境中可能需要系统级配置配合 |

---

## 跨 Phase 依赖关系

```
Phase 13 (键盘)  ──→ 无外部依赖
Phase 14 (终端)  ──→ 无外部依赖
Phase 15 (动画)  ──→ 无外部依赖
Phase 16 (报错)  ──→ 依赖 Phase 2 的 Toast 系统（已完成 ✓）
```

四个 Phase 之间互不依赖，理论上可以并行开发。推荐按优先级顺序逐个推进，每个 Phase 完成后提交并记录里程碑。

---

## 执行原则

1. **逐步推进** — 按优先级顺序每个 Phase 完成后再进入下一个
2. **测试先行** — 每个 Task 完成后必须有对应单元测试通过
3. **提交即记录** — 每次 git commit 前测试通过，并在 `docs/milestone/` 记录
4. **低端验证** — Phase 15 完成后需在 1024×768 低端工控环境下实测
5. **最小改动** — 不做超出当前 Task 范围的重构，不影响已有功能的稳定性
