# Phase 8: 设计系统升级 — 触控优先

**日期**: 2026-02-18

## 目标

建立触控优先的全局设计令牌和基础组件，为后续 UI 重构（移动端 + 医院自助端）打基础。

## 变更内容

### global.css — 设计令牌升级
- 字体更换为 `PingFang SC` / `Microsoft YaHei`（中文优先）
- 新增深色面板色 `--color-panel-dark: #0f172a`
- 新增 `--color-accent-dark`、更新 `--color-success` 为 `#22c55e`（对齐原型）
- 新增触控尺寸 CSS 变量（`:root` 级别）:
  - `--touch-btn-height`: 56px (mobile) / 90px (lg)
  - `--touch-input-height`: 56px (mobile) / 70px (lg)
  - `--touch-radius-lg/md/sm`: 24px / 16px / 12px
- `@media (min-width: 1024px)` 自动切换 Kiosk 尺寸
- 全局禁用 `user-select`、`-webkit-tap-highlight-color`
- 新增全局动画：`ripple`（呼吸光环）、`fade-up`（进入动效）、`pulse-soft`（柔和脉冲）
- 新增工具类：`.animate-ripple`、`.animate-fade-up`、`.animate-pulse-soft`

### 新建 TouchButton.vue
- 大尺寸触控按钮组件
- 三种变体：`outline`（默认）/ `primary` / `danger`
- 实体感投影 + `:active` 下压反馈（translateY(4px)）
- 支持 `loading`（旋转图标 + "执行中..."）和 `disabled` 状态
- 高度随 `--touch-btn-height` 变量自适应（mobile 56px / Kiosk 90px）

### 新建 TouchInput.vue
- 大尺寸触控输入框组件
- 内置清除按钮（圆形，有值时显示）
- focus 蓝色光环 (`box-shadow: 0 0 0 6px`)
- 支持 `text` / `password` 类型
- 高度随 `--touch-input-height` 变量自适应

### 新建 StatusBulb.vue
- 大圆灯状态指示组件
- 三种状态：`online`（绿 + 呼吸动画）/ `warning`（黄）/ `error`（红）
- 三种尺寸：`sm`（20px 指示点）/ `md`（80px）/ `lg`（140px，含放大光环）
- 内置 SVG 图标（勾/三角/叉）
- `online` 状态自带 `ripple` 呼吸动画环
- 可选 `label` 文字显示

## 测试

- 新增 3 个测试文件，28 个测试用例
  - `touch-button.spec.ts`: 8 tests（渲染、变体、点击、禁用、loading）
  - `touch-input.spec.ts`: 10 tests（渲染、输入、清除、禁用、类型）
  - `status-bulb.spec.ts`: 10 tests（状态、尺寸、标签、动画）
- 全量测试：108 passed，0 failed
