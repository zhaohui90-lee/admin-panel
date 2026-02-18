# Phase 9: 登录页重构 — Kiosk 触控布局

**日期**: 2026-02-18

## 目标

按 `docs/prototype/login-1.html` 原型完全重构登录页，适配移动端 + 医院自助端触控场景。

## 变更内容

### LoginPage.vue — 完整重构

**布局变化**：
- Kiosk（≥ 1024px）：左侧状态面板 (38%) + 右侧交互区 (62%)，全屏 `h-screen overflow-hidden`
- 移动端（< 1024px）：隐藏状态面板，顶部显示紧凑状态栏（设备号 + 在线指示灯）

**左侧状态面板（Kiosk only）**：
- 品牌标题："省人民医院 / 设备管理中心"，大字 (`2.25rem`)，字间距宽松
- `StatusBulb` 组件（`lg` 尺寸）显示系统在线状态 + 呼吸动画
- 设备元数据（monospace 字体，低透明度）

**三模式登录（原型状态机）**：
- `card`（默认）：大圆形图标 + 脉冲动画 + "请刷员工卡" 大标题
- `scan`：QR 方形图标 + "扫码登录"
- `password`：密码显示框（●符号）+ 大号确认按钮 + 错误提示 + VirtualKeyboard

**底部导航（替换原有 Tab）**：
- 两个大触控按钮（高度 = `--touch-btn-height` = 56px / Kiosk 90px）
- 动态状态机（对应原型 JS 逻辑）：
  - `card`：左 = 扫码登录，右 = 密码登录
  - `scan`：左 = 返回刷卡（★active），右 = 密码登录
  - `password`：左 = 扫码登录，右 = 返回刷卡（★active）
- 活跃按钮样式：蓝色背景 + 底部阴影 (`nav-btn--active`)

**视图切换动画**：`<Transition name="view-fade" mode="out-in">` + `fade-up` 动画

**VirtualKeyboard 定位**：密码模式下 `fixed bottom-0`，Kiosk 时从 `left-[38%]` 开始

## 测试

- 更新 `login-page.spec.ts`：从 7 个测试扩展到 13 个
- 新增测试：scan 模式切换、返回逻辑、active class 验证（`nav-btn--active`）、切换时清空状态
- 移除旧的 `text-accent` tab 高亮测试（不再适用）
- 全量测试：114 passed，0 failed
