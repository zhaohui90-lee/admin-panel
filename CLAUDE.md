# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## important-rules

### 重要规则，每次执行任务前都需要严格遵守下面的规则

- 每次执行任务前，都要输出`melody, claude开始执行任务了`，执行任务前需要阅读`docs/tasks`
- 不要试图一次性解决所有问题，一步步推进
- 每次实现一个新的feature，都需要新建单元测试
- 单元测试通过以后，才能执行`git commit`命令
- 每次提交一个新的`git commit`，都需要在`docs/milestone`下记录里程碑
- When fixing build failures, always trace the full cascade of errors before starting fixes. Check for: missing assets, invalid config values, environment variable interpolation issues, and code signing problems.
- This is a TypeScript project. Always use TypeScript (not JavaScript) for new files. Use strict typing — avoid `any` unless absolutely necessary.
- After fixing build or configuration issues, always run a verification build (`npm run build` or equivalent) before considering the task complete.
