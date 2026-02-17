# Phase 3: 登录页面增强

**日期**: 2026-02-17

## 完成内容

### Task 3.1 — Tab 切换 + IC 卡模式
- 新增双 Tab 切换：工牌感应 / 账号密码
- 默认显示 IC 卡感应模式
- IC 卡模式：RFID 图标 + 脉冲动画 + "请刷员工卡" 提示
- 密码模式：保留虚拟键盘输入 + 登录按钮
- 虚拟键盘仅在密码模式下显示
- 切换 Tab 时清除密码和错误状态
- 添加 data-testid 属性方便测试

### Task 3.2 — 单元测试（Token 认证已在 Phase 1 完成）
- `login-page.spec.ts`: 7 个测试
  - 默认 card 模式验证
  - Tab 切换（card → password → card）
  - 活跃 Tab 高亮样式
  - 空密码提交错误提示
  - 成功登录导航到 dashboard
  - 失败登录错误显示

## 变更文件
- `src/modules/login/LoginPage.vue` — Tab 切换 + IC 卡感应模式 + RFID 脉冲动画
- `src/__tests__/login-page.spec.ts` — 新增

## 验证
- TypeScript type-check: PASS
- Vitest (28 tests): PASS
- Vite production build: PASS
