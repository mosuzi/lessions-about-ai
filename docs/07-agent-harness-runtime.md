# Agent Harness：真正让 AI 干活的运行时壳层

更新时间：2026-06-18

Harness 这个词容易让人困惑，因为它不是某一个固定产品。它更像“运行 AI agent 的壳”。

一句话：

```text
Agent harness = 管理模型调用、工具执行、状态、权限、日志、重试、评测的运行时。
```

如果把 LLM 当成大脑，harness 就是身体、工作台、规章制度和记录仪。

## 为什么只有模型不够

用户说：

```text
修复这个前端 bug，跑测试，验证页面。
```

模型本身不能直接：

- 读文件
- 搜代码
- 改文件
- 跑测试
- 打开浏览器
- 截图
- 处理权限确认
- 在失败后重试
- 保留可审计日志

这些都需要模型外面的程序来做。这个程序就是 harness/runtime 的一部分。

## Agent loop

最小 agent loop 长这样：

```text
1. 把目标、上下文、工具定义给模型
2. 模型输出下一步：回答 or 调工具
3. 如果调工具，程序执行工具
4. 把工具结果放回上下文
5. 再问模型下一步
6. 达到停止条件后输出最终结果
```

这个 loop 看起来简单，但生产难点都在周边系统。

## Harness 负责什么

### 1. State

保存当前任务、消息历史、工具结果、文件变化、阶段状态。

没有 state，agent 每一步都像失忆。

### 2. Context management

上下文窗口有限，harness 要决定：

- 哪些信息进主上下文
- 哪些压缩成摘要
- 哪些交给 subagent
- 哪些写到文件或 memory

### 3. Tool execution

执行 CLI、MCP tool、浏览器、文件编辑、API 请求等。

工具执行要处理：

- 超时
- 错误
- 重试
- 输出截断
- 安全过滤

### 4. Permissions

哪些动作可以自动执行，哪些需要人确认。

典型分级：

- 读文件：通常允许
- 搜索代码：通常允许
- 写文件：看 workspace 权限
- 安装依赖：需要确认
- 删除文件：强确认
- 发外网/提交 PR/改生产：强确认

### 5. Guardrails

防止越权、泄露、危险操作、格式不合规。

### 6. Tracing

记录每一步：

- 模型输入输出
- 工具调用
- 工具结果
- token/cost/latency
- 错误
- 决策路径

调 agent 没 trace，就像调前端没有 console、network、sourcemap。

### 7. Eval

固定任务集反复跑，检查 prompt、模型、工具定义或 workflow 改动有没有回归。

## Workflow 和 Agent 的区别

Workflow 是你写死路径：

```text
分类 -> 检索 -> 总结 -> 输出 JSON
```

Agent 是模型动态决定路径：

```text
先搜代码？
先读测试？
先问用户？
先跑页面？
失败后改哪里？
```

经验法则：

- 能 workflow 就 workflow。
- 开放问题、未知路径、多步工具反馈，才上 agent。
- 生产核心链路优先 workflow，辅助/探索/开发任务更适合 agent。

## Harness、Skill、MCP、CLI 的关系

```text
Harness 管循环和状态
Skill 管某类任务怎么做
MCP 管结构化工具接入
CLI 管本机通用执行
Subagent 管并行分工
Eval 管质量回归
```

比如一个 coding harness 可以：

- 根据 frontend skill 知道要跑浏览器验证。
- 用 CLI 执行 `rg`、`pnpm test`。
- 用 MCP 访问 Figma 或 Sentry。
- 派 reviewer subagent 只读审查。
- 把每一步写入 trace。

## 常见坑

### 以为 agent = prompt

Prompt 只是说明书。没有工具、状态、权限、eval，agent 只是聊天机器人。

### 以为工具越多越好

工具越多，选择空间越大，失败面也越大。生产 agent 要最小权限、最小工具集。

### 没有停止条件

Agent 需要明确：

- 最多几步
- 最多多久
- 什么算完成
- 失败几次后停

### 没有人工确认

高风险动作必须 human-in-the-loop。

## 最小实践

写一个轻量 coding harness，不用复杂框架：

1. 给模型目标和工具列表。
2. 工具只开放：读文件、搜索、运行测试。
3. 写文件前必须确认。
4. 每次工具调用写入 JSONL trace。
5. 每个任务最多 12 步。
6. 固定 10 个小 bug 做 eval。

## 继续阅读

- Anthropic: Building effective agents：https://www.anthropic.com/engineering/building-effective-agents
- OpenAI Agents SDK：https://openai.github.io/openai-agents-python/
- OpenAI Agents guide：https://developers.openai.com/api/docs/guides/agents
- LangGraph overview：https://docs.langchain.com/oss/python/langgraph/overview
- LangGraph agents/harness 生态：https://github.com/langchain-ai/langgraph

