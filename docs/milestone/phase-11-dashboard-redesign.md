# Phase 11: 仪表盘触控重构

**日期**: 2026-02-18

## 目标

将仪表盘页面从网页风格升级为 Kiosk 触控优先设计：大号数值卡片、高行距硬件列表、TouchButton 操作区、触控化确认弹窗。

## 变更内容

### TouchButton.vue — 新增 warning 变体

- 新增 `variant="warning"` 选项（amber 色系：浅黄背景 + 深棕文字 + 黄色底部阴影）
- 用于重启客户端 / 重启自助机等"有影响但可逆"的操作

### DashboardPage.vue — 全面重构

**状态卡片（Task 11.1）**：
- 数值字号：`text-2xl` → `text-4xl lg:text-5xl`
- 标签字号：`text-xs` → `text-sm lg:text-base`
- 卡片最小高度：`min-h-[120px] lg:min-h-[140px]`
- 卡片内边距：`p-4` → `p-6 lg:p-8`
- 圆角：`rounded-xl` → `rounded-2xl`

**硬件自检列表（Task 11.2）**：
- 每行最小高度：`min-h-[64px] lg:min-h-[72px]`
- 状态灯：`h-2.5 w-2.5`（无光晕）→ `h-4 w-4 + box-shadow glow`（对应原型的发光效果）
- 设备名字号：`text-sm` → `text-base lg:text-lg`
- 详情字号：`text-xs` → `text-sm lg:text-base`
- 进度条高度：`h-1.5 sm:h-2` → `h-3 lg:h-4`
- 状态标签：`text-xs` → `text-sm font-semibold lg:text-base`

**操作按钮区（Task 11.3）**：
- 全部换用 `TouchButton` 组件（高度 56px 移动端 / 90px Kiosk）
- 变体分配：刷新页面=outline，重启×2=warning，关闭×2=danger
- 每个按钮添加 `data-testid` 属性
- 关闭自助机用 `col-span-2 sm:col-span-1` wrapper 处理移动端布局

**服务地址编辑（Task 11.3）**：
- 显示模式：修改按钮换用 `TouchButton variant="primary"`
- 编辑模式：输入框换用 `TouchInput` 组件

### ConfirmDialog.vue — 触控化

- 始终居中显示（移除移动端底部弹出逻辑）
- 遮罩：`bg-black/60 backdrop-blur-sm`
- 弹窗宽度：`max-w-sm` → `max-w-md`
- 内边距：`p-5` → `p-6 lg:p-8`
- 标题：`text-base font-semibold` → `text-xl font-bold lg:text-2xl`
- 内容：`text-sm` → `text-base lg:text-lg`
- 按钮：换用 `TouchButton`（outline=取消，danger=确认），高度跟随 `--touch-btn-height`

## 测试

- 新建 `dashboard-page.spec.ts`：17 个测试
  - 状态卡片渲染（交易数/延迟/CPU）
  - 硬件列表（4 项、设备名、状态标签）
  - 操作按钮（5 个 data-testid、点击触发确认对话框、不同操作的正确标题）
  - 确认弹窗（取消关闭）
  - 服务地址（显示 URL、设备 ID、修改/取消编辑）
- 全量测试：135 passed，0 failed（新增 13 个文件）
