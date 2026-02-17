# Phase 7: 日志查看器

**日期**: 2026-02-17

## 概述

实现 ARCHITECTURE.md 中规划的日志查看模块，包括 Bridge 接口扩展（日志类型定义、分页查询）、日志页面（级别过滤、关键词搜索、分页浏览）、完整单元测试。

## 变更内容

### Bridge 扩展

**类型定义** (`src/bridge/types.ts`):
- 新增 `LogLevel` 类型 ('info' | 'warn' | 'error')
- 新增 `LogEntry` 接口 (id, timestamp, level, source, message)
- 新增 `LogQuery` 接口 (level?, keyword?, page, pageSize)
- 新增 `LogPage` 接口 (items, total, page, pageSize)
- IBridge 新增 `logs` 子接口:
  - `getLogs(token, query: LogQuery)` — 分页查询日志

**Mock 实现** (`src/bridge/mock.ts`):
- 生成 80 条模拟日志，级别加权随机（info 多于 error）
- 5 个日志来源：transaction / system / hardware / network / auth
- 按级别分类的中文消息模板（info 8条、warn 5条、error 5条）
- 支持按 level 过滤、keyword 搜索（message + source）、分页

**Electron 实现** (`src/bridge/electron.ts`):
- 添加 logs 接口 stub（TODO: 待后端 IPC 就绪后对接）

### 日志页面 (`src/modules/logs/LogsPage.vue`)

替换 Phase 5 的占位页面，完整实现：
- **级别过滤**: 4 个选项卡（全部/信息/警告/错误），激活态高亮
- **关键词搜索**: 输入框实时搜索，watch 自动触发查询
- **日志列表**: 级别标签（蓝/橙/红）、消息内容、时间戳、来源标签
- **分页控件**: 上一页/下一页按钮，页码显示，单页时自动隐藏
- **空状态**: 无日志时显示「暂无日志记录」
- **过滤联动**: 切换过滤条件自动重置到第一页

### 单元测试

- `src/__tests__/logs-page.spec.ts` (11 tests):
  - 初始加载：挂载时获取日志、渲染日志项、显示总数
  - 级别过滤：info/warn/error 各级别过滤查询
  - 关键词搜索：输入关键词触发带 keyword 参数的查询
  - 分页：多页时显示分页控件、单页时隐藏、下一页导航
  - 空状态：无日志时显示提示
- `src/__tests__/bridge-mock.spec.ts` (4 new tests):
  - getLogs 返回分页结果
  - 按 level 过滤
  - 按 keyword 搜索
  - 日志条目包含必要字段

## 验证

- TypeScript type-check: PASS
- Vitest (80 tests, 15 new): PASS
- Vite production build: PASS
