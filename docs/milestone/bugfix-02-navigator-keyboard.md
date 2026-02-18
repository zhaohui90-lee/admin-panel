# Bugfix: 导航栏空白页 & 虚拟键盘失焦隐藏

**日期**: 2026-02-18

## 修复内容

### Bug 1: 登录后导航栏跳转页面空白不加载

**根因**: `DashboardPage.vue` 模板有两个根节点（主内容 `<div>` + `<ConfirmDialog>`），而 `AppLayout.vue` 的 `<router-view>` 使用了 `<Transition mode="out-in">`。Vue 3 的 `<Transition>` 要求子组件只有单个根元素，多根节点导致离开过渡无法完成，阻止了新页面渲染。

**修复**: 将 `DashboardPage.vue` 的模板包裹在单个根 `<div>` 中。

### Bug 2: 虚拟键盘需要在失去焦点时隐藏

**根因**: `LoginPage.vue` 的虚拟键盘仅由 `activeMode === 'password'` 控制显隐，没有失焦隐藏机制。

**修复**:
- 新增 `showKeyboard` 状态变量
- 点击密码输入区域显示键盘
- 点击背景区域隐藏键盘
- 切换到密码模式时自动显示键盘
- 切换离开密码模式时自动隐藏键盘

## 修改文件

- `src/modules/dashboard/DashboardPage.vue` — 包裹为单根元素
- `src/modules/login/LoginPage.vue` — 添加键盘显隐控制逻辑
- `src/__tests__/navigation.spec.ts` — 新增页面渲染导航测试
- `src/__tests__/login-page.spec.ts` — 新增虚拟键盘显隐测试

## 测试

- 全部 142 个测试通过
