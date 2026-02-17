# Phase 2: 全局基础设施

**日期**: 2026-02-17

## 完成内容

### Task 2.1 — 全局 Toast 通知系统
- 新建 `src/composables/useToast.ts`
  - 共享响应式 `toasts` 数组（模块级单例）
  - `success()` / `error()` / `warning()` 快捷方法
  - 可配置自动消失时长（默认 2.5s），duration=0 为永久
  - `remove(id)` 手动关闭
- 新建 `src/components/ToastContainer.vue`
  - Teleport to body，fixed 底部居中
  - TransitionGroup 入场/离场动画
  - 点击 toast 即关闭
  - 按类型着色：success(accent) / error(danger) / warning(warning)
- `App.vue` 挂载 `<ToastContainer />`，全局可用

### Task 2.2 — 页面层集成
- `DashboardPage.vue` 移除局部 toast 状态和模板
- 改用 `useToast().success()` / `.error()` 调用
- 错误处理模式：try/catch → `toast.error(message)`

### Task 2.3 — 单元测试
- `use-toast.spec.ts`: 7 个测试
  - 添加 success/error/warning toast
  - 自动移除（fake timers）
  - 多 toast 并存
  - 手动 remove
  - 唯一 id 分配

## 变更文件
- `src/composables/useToast.ts` — 新增
- `src/components/ToastContainer.vue` — 新增
- `src/App.vue` — 挂载 ToastContainer
- `src/modules/dashboard/DashboardPage.vue` — 移除局部 toast，使用全局 useToast
- `src/__tests__/use-toast.spec.ts` — 新增

## 验证
- TypeScript type-check: PASS
- Vitest (21 tests): PASS
- Vite production build: PASS
