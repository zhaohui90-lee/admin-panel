# Phase 17: 登录页核心 UI 重建

> 日期：2026-02-22

## 完成内容

### LoginPage.vue 完整重建
- 基于 `hospital-keyboard-demo.html` 原型实现完整登录页面
- **布局**：min-h-screen flex 布局，淡蓝渐变背景 + 网格纹理
- **状态栏**：复用 `<StatusBulb />` 组件
- **登录卡片**：
  - 顶部渐变色装饰条（animated gradient）
  - 欢迎图标 + 标题「员工身份验证」
  - Tab 切换器（密码登录 / 员工卡登录）
- **密码登录表单**：
  - 员工工号输入框（带前缀图标 + 清除按钮）
  - 密码输入框（带前缀图标 + 明密文切换）
  - 字数状态提示
  - 错误提示（shake 动画）
  - 登录按钮（loading spinner + disabled 状态）
- **员工卡登录**：
  - NFC 感应区（4 状态：waiting/reading/success/error）
  - 脉冲动画环
  - 手动输入卡号
- **弹窗**：
  - 登录成功弹窗（进度条 + 自动跳转 dashboard）
  - 会话超时弹窗（5 分钟空闲）
- **底部**：IT 服务台 + 版权信息

### 单元测试（25 个）
- Tab 切换（默认密码模式、切换、样式、清理状态）
- 密码登录（禁用按钮、成功、失败、异常、密码切换、清除、状态提示）
- 员工卡（NFC 区域渲染、状态文字、点击状态流转、卡号输入）
- 会话超时（5 分钟触发、确认重置）
- 组件结构（StatusBulb 渲染、标题、页脚）

### StatusBulb 测试更新
- 旧测试基于已废弃的 props 接口（status/size/label）
- 重写为匹配当前终端状态栏实现（时钟、终端信息、样式）

## 文件变更

| 文件 | 操作 |
|-----|------|
| `src/modules/login/LoginPage.vue` | 重建（从空文件到完整页面） |
| `src/__tests__/login-page.spec.ts` | 重写（25 个测试） |
| `src/__tests__/status-bulb.spec.ts` | 重写（10 个测试） |
| `docs/tasks/ROADMAP-LOGIN-KEYBOARD.md` | 新建（路线图） |

## 测试结果

```
Test Files  16 passed (16)
Tests       188 passed (188)
```
