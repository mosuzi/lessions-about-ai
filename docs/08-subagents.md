# Subagents：把一个 AI 助手拆成多个专用 worker

更新时间：2026-06-18

Subagent 是主 agent 委派出去的专用 agent。它通常有自己的上下文、任务、工具权限和输出要求。

一句话：

```text
Subagent = 主 agent 外派的专用助手，用来并行探索、审查、测试或总结。
```

## 为什么需要 subagents

复杂任务里，主会话很容易被污染：

- 搜索输出太多
- 测试日志太长
- stack trace 太乱
- 多个方案来回比较
- 中间尝试失败很多

这些内容都塞进主上下文，会造成 context pollution/context rot。Subagent 的好处是把噪音隔离出去，只把摘要和结论带回来。

## 一个前端任务例子

用户说：

```text
修复移动端购物车按钮错位，顺便检查有没有类似问题。
```

可以拆成：

- Main agent：协调任务、做最终修改。
- Explorer subagent：只读搜索相关组件和样式。
- Reviewer subagent：只读审查 diff 风险。
- Browser tester subagent：打开页面，跑移动端截图验证。

主 agent 不需要吃掉全部搜索输出和截图日志，只接收每个 subagent 的结论。

## Subagent 常见角色

### Explorer

职责：

- 搜代码
- 找相关文件
- 画调用链
- 总结上下文

权限：

- 只读

### Implementer

职责：

- 根据计划改代码
- 保持 diff 小
- 跑局部验证

权限：

- 可写，但最好限制目录

### Reviewer

职责：

- 找 bug
- 找测试缺口
- 找破坏性改动
- 给文件行号建议

权限：

- 只读

### Browser tester

职责：

- 打开页面
- 点击交互
- 检查响应式
- 截图验证

权限：

- 浏览器/Playwright，通常不写代码

### Summarizer

职责：

- 处理长文档、长日志、长 issue
- 输出结构化摘要

权限：

- 只读

## Subagent 和 Skill 的关系

Skill 可以定义“什么时候用哪些 subagents”。

例如 frontend skill 可以规定：

```text
UI 改动较大时：
1. explorer 先找现有模式
2. implementer 改代码
3. reviewer 只读审查
4. browser tester 验证桌面和移动端
```

Subagent 是执行单元，Skill 是工作流说明。

## Subagent 和 MCP 的关系

MCP 给 subagent 提供工具。不同 subagent 可以拿不同工具：

- Explorer：repo search MCP
- Designer：Figma MCP
- Debugger：Sentry MCP
- Tester：Playwright MCP
- Reviewer：只读文件工具

这比给一个 agent 开所有权限更安全。

## 什么时候适合用

适合：

- 大量只读探索。
- 多个维度审查：安全、性能、可访问性、测试。
- 长日志/长文档分块总结。
- 可以并行的任务。
- 需要隔离上下文噪音。

不适合：

- 很小的单点修改。
- 子任务高度耦合，必须频繁共享上下文。
- 多个 agent 同时写同一批文件。
- 你没有 trace，不知道 subagent 到底做了什么。

## 常见坑

### 角色太抽象

“你是架构师”“你是专家”没用。要给具体输入输出：

```text
只读检查 diff，按 P0/P1/P2 输出 bug 风险，必须带文件路径和原因。
```

### 并行写冲突

多个写 subagent 同时改文件，很容易冲突。初学者先让 subagent 只读。

### 摘要太空

要求 subagent 输出证据：

- 文件路径
- 命令结果摘要
- 失败原因
- 是否验证
- 不确定项

### 成本上升

每个 subagent 都要单独消耗模型调用和工具调用。别为了仪式感开 agent。

## 最小实践

在 coding 工作流里先用两个 subagent：

1. Explorer：只读找上下文。
2. Reviewer：只读审查最终 diff。

主 agent 负责真正改代码。这样收益最大，风险最小。

## 继续阅读

- Codex Subagents 概念：https://developers.openai.com/codex/concepts/subagents
- Codex Subagents 配置：https://developers.openai.com/codex/subagents
- Claude Code subagents：https://code.claude.com/docs/en/sub-agents
- Anthropic: Building effective agents：https://www.anthropic.com/engineering/building-effective-agents

