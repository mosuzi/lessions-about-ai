---
slug: /
sidebar_position: 1
---

# 2026 AI 使用者技术路线与概念总览

更新时间：2026-06-18

读者画像：你是前端开发者，已经在用 AI 写代码，但对 AI 的理解停留在 RNN/LSTM 时代。你的目标不是训练模型、开发 AI 框架或创业做 AI 平台，而是：

```text
理解现在 AI 工具为什么这样工作，并把 Codex、Claude Code、Cursor、ChatGPT、MCP、skills、subagents 这些东西用顺手。
```

所以这份总览的重点不是“怎么开发 AI”，而是“怎么成为 AI 时代的高阶使用者”。有些底层概念会讲，但只讲到能帮助你判断工具、设计上下文、拆任务、验证结果的程度。

## 先说结论

你真正要掌握的不是“从零训练模型”，而是这五件事：

1. 选对 AI 工具：什么时候用聊天模型，什么时候用 coding agent，什么时候用浏览器/搜索/IDE。
2. 喂对上下文：让 AI 读到正确文件、文档、设计约束、错误日志，而不是靠猜。
3. 下好任务：把需求写成 spec、约束、验收标准，而不是一句“帮我改一下”。
4. 会验收：让 AI 跑测试、看页面、截图、解释风险，不能只看它说“完成了”。
5. 沉淀流程：把反复有效的做法写成 AGENTS.md、skill、prompt 模板、review checklist。

换句话说：

```text
模型能力只是底座。
真正拉开差距的是：上下文、工具、工作流、验证和复盘。
```

## 阅读地图

按优先级读，不需要从 01 一路硬啃。

### A. 现在就该读

| 主题 | 本地中文精读 | 为什么重要 |
| --- | --- | --- |
| 前端 AI 工作流 | [前端开发者玩转 AI 的工作流](./11-frontend-ai-workflow.md) | 直接对应你每天怎么用 AI 写前端 |
| Skills | [Skills：把 AI 的工作手艺封装成可复用流程](./10-skills-agent-workflow.md) | 把好用的 CLI/浏览器/验证流程沉淀下来 |
| Subagents | [Subagents：把一个 AI 助手拆成多个专用 worker](./08-subagents.md) | 让探索、review、浏览器验证分工，减少主上下文污染 |
| Evals | [Evals 是啥](./04-evals.md) | 让 AI 改动有回归标准，而不是凭感觉 |
| Tool Calling | [Tool Calling 和 Structured Output](./06-tool-calling-structured-output.md) | 理解为什么现代 AI 能查文件、跑命令、操作浏览器 |

### B. 需要理解，但不用急着自己造

| 主题 | 本地中文精读 | 你需要掌握到什么程度 |
| --- | --- | --- |
| MCP | [MCP：AI 工具世界的标准化插座](./09-mcp-model-context-protocol.md) | 会安装/配置/判断 MCP 是否适合，不必一上来写 server |
| Agent Harness | [Agent Harness：真正让 AI 干活的运行时壳层](./07-agent-harness-runtime.md) | 理解 Codex/Claude Code 为什么能循环执行任务，不必自己写 harness |
| RAG | [RAG 是啥：把模型的“记忆”接到外部资料库](./05-rag-retrieval-augmented-generation.md) | 会判断“是不是该给 AI 文档/检索能力”，不必先自建向量库 |

### C. 背景知识，知道即可

| 主题 | 本地中文精读 | 读法 |
| --- | --- | --- |
| Transformer | [Attention Is All You Need 中文精读版](./03-attention-is-all-you-need-reading-guide.md) | 看懂注意力为什么取代 RNN，不用推公式 |
| 偏好对齐 | [RLHF、DPO、ORPO 是啥](./02-preference-alignment-rlhf-dpo-orpo.md) | 理解模型为什么更“听话”，不用自己训练 |
| 数值精度/量化 | [INT4、INT8、FP8、FP16、FP32 都是啥](./01-numeric-precision-int-fp.md) | 本地跑模型或看模型新闻时有概念即可 |

## 一句话总览

从 RNN 时代到今天，AI 圈的变化可以这样理解：

```text
RNN/LSTM 时代：模型按顺序读文本，记忆和并行能力有限
Transformer 时代：注意力机制让大规模预训练成为主流
ChatGPT 时代：模型通过指令微调和偏好对齐变得会聊天、会遵循指令
Tool/Agent 时代：模型开始调用工具、读文件、跑命令、操作浏览器
Workflow 时代：真正好用的 AI = 模型 + 上下文 + 工具 + 验证 + 可复用流程
```

你作为使用者，重点在最后两层。

## 1. 你需要知道的模型基础

### RNN/LSTM 到 Transformer

RNN/LSTM 是逐 token 往前读，长文本信息容易被压缩丢失，也不利于大规模并行训练。[Transformer](./03-attention-is-all-you-need-reading-guide.md) 用 self-attention 让 token 之间可以直接互相“看见”，于是更适合大规模预训练。

你只需要记住：

- Transformer 是今天主流大模型的核心架构。
- Attention 让模型能在上下文里找相关信息。
- Context window 决定一次能放多少上下文，但不是越长越好。
- Token 是模型真正处理的文本单位，不等于中文字符或英文单词。

### 模型为什么会变成“助手”

预训练模型只是在学“下一个 token”。要变成好用助手，还要经过：

- SFT：用指令和理想回答训练它听指令。
- [RLHF/DPO/ORPO](./02-preference-alignment-rlhf-dpo-orpo.md)：用偏好数据让它更符合人类期望。
- Tool/function calling 训练或工程适配：让它能调用工具。
- 安全和拒答策略：让它知道哪些不能做。

你不用自己做这些训练，但理解它能帮你判断：

- 模型不是“知道真相”，它是在生成最可能的回答。
- 模型越会聊天，不代表越会查证。
- 推理模型更适合复杂任务，但更慢、更贵。
- 小模型/快模型适合轻量扫描，大模型适合复杂规划和 review。

### 量化和本地模型

[INT4/INT8/FP16/FP8](./01-numeric-precision-int-fp.md) 这类词主要影响本地模型的显存、速度和质量。如果你主要用云端 API 或 Codex/Claude Code，可以先知道即可。

什么时候才需要深究：

- 你要在本机跑 Ollama/llama.cpp。
- 你要比较开源模型。
- 你关心显存够不够、速度快不快、质量掉不掉。

## 2. 真正影响 AI 使用效果的四个杠杆

### 杠杆一：上下文

AI 最常犯错的原因不是“不够聪明”，而是没看到正确上下文。

你要学会给它：

- 相关文件路径。
- 现有组件和设计系统。
- 错误日志和复现步骤。
- 产品约束。
- 已经尝试过什么。
- 什么不能改。
- 验收标准。

如果资料很多，可以理解 [RAG](./05-rag-retrieval-augmented-generation.md)。但作为使用者，第一步不是自建 RAG，而是：

- 让 coding agent 先搜索/读取相关文件。
- 把关键文档放进 repo。
- 写清楚入口文件、命令、约束。
- 用 AGENTS.md 或 skill 固化上下文入口。

### 杠杆二：任务表达

糟糕任务：

```text
这个页面有问题，帮我优化一下。
```

好任务：

```text
排查移动端订单列表筛选按钮遮挡问题。先找相关组件和样式，不要改无关布局。
修复后跑现有 typecheck，并用浏览器在 390px 和 1440px 截图验证。
最终说明改了什么、如何验证、还有哪些风险。
```

好的 prompt 不是咒语，而是任务接口。最重要的字段：

- 目标
- 背景
- 输入
- 约束
- 禁止事项
- 验收标准
- 输出格式

### 杠杆三：工具

现代 AI 好用，是因为它不只会说话，还能用工具。

你要理解这些工具层次：

- CLI：最通用，适合 `rg`、`git`、`pnpm`、测试、构建、脚本。
- 浏览器/Playwright：适合验证页面真的能用。
- [MCP](./09-mcp-model-context-protocol.md)：适合接 Figma、Sentry、GitHub、文档、数据库等外部系统。
- [Tool calling](./06-tool-calling-structured-output.md)：模型调用工具的底层机制。
- IDE/agent 内置工具：读文件、改文件、看 diff、跑命令。

你不一定要开发工具，但要会判断：

- 这个任务靠模型猜，还是该让它查？
- 这个任务靠口头说明，还是该让它读文件？
- 这个任务靠“它说完成”，还是该让它跑测试/看页面？

### 杠杆四：验证

AI 的“我已经完成”不等于完成。

前端任务最低验证：

- 类型检查或构建。
- 相关测试。
- 浏览器打开页面。
- 桌面和移动端至少各看一次。
- 长文本、空状态、加载态、错误态。
- 最终 diff review。

这就是 [evals](./04-evals.md) 在个人工作流里的意义：不用一上来搭评测平台，但要有固定验收清单。

## 3. Agent、Harness、Subagents 怎么理解

### Agent

Agent 不是神秘东西。实用定义：

```text
Agent = 模型 + 任务目标 + 工具 + 上下文 + 循环执行 + 停止条件
```

ChatGPT 问答通常是一次回答。Coding agent 会多步执行：

```text
读文件 -> 搜索 -> 修改 -> 跑测试 -> 看错误 -> 再修改 -> 总结
```

你要会用 agent，而不是马上开发 agent。

### Harness

[Harness](./07-agent-harness-runtime.md) 是 agent 外面的运行时壳层，负责：

- 管工具。
- 管权限。
- 管上下文。
- 管日志。
- 管测试和验证。
- 管多步循环。

Codex、Claude Code 这类工具已经帮你提供了 harness。你需要理解它的存在，这样才知道为什么：

- 有些命令需要批准。
- 工具输出会被截断。
- 长任务需要分阶段总结。
- 写文件、联网、安装依赖要受控。

### Subagents

[Subagents](./08-subagents.md) 是把任务拆给专用 worker。

对你最实用的模式：

- Explorer：只读搜索代码，找相关上下文。
- Reviewer：只读审查 diff，找 bug 和测试缺口。
- Browser tester：打开页面，验证交互和截图。

初学建议：

- 先用只读 subagent。
- 主 agent 负责改代码。
- 不要让多个 subagent 同时写同一批文件。
- 要求 subagent 返回证据和不确定项。

## 4. Skills、AGENTS.md、MCP 分别该怎么用

### AGENTS.md：项目级长期规则

适合写：

- 这个 repo 用什么包管理器。
- 常用启动/测试命令。
- 代码风格。
- 哪些目录不能改。
- UI 验证要求。

它像“这个仓库的开发手册”。

### Skills：某类任务的工作流

[Skill](./10-skills-agent-workflow.md) 适合写：

- 做 UI 改动时怎么验证。
- 做 code review 时看哪些风险。
- 排查线上 bug 时先查哪些日志。
- 根据 Figma 实现页面时怎么映射组件。

它像“某类活的操作手册”。

你前面问得很准：skill 是让 CLI/浏览器/文件操作变规范，但又不像 MCP 那样把每个动作封成严格 API。

### MCP：外部系统的标准接口

[MCP](./09-mcp-model-context-protocol.md) 适合：

- Figma。
- Sentry。
- GitHub issues/PR。
- 组织知识库。
- 设计系统。
- 数据库只读查询。

作为使用者，优先学会安装、授权、配置和判断权限边界。写 MCP server 是进阶项，不是必修项。

## 5. 前端开发者的 AI 工作流

### 日常最稳流程

1. 让 AI 先读上下文，不急着改。
2. 让 AI 给计划，确认会改哪些文件。
3. 小步实现，保持 diff 可读。
4. 跑检查：typecheck/lint/test。
5. UI 改动必须浏览器验证。
6. 让 reviewer 找风险。
7. 把有效流程沉淀到 AGENTS.md 或 skill。

推荐任务模板：

```text
你是这个仓库的前端实现助手。先阅读相关组件、样式约定和类似页面，再实现。

目标：
- ...

约束：
- 复用现有组件和 design tokens。
- 不引入新依赖，除非说明必要性。
- 桌面端和移动端都要可用。
- 不要重写无关代码。

验收：
- 覆盖空/加载/错误/长文本状态。
- 跑现有 typecheck/lint/相关测试。
- 如果是可见 UI 改动，启动或复用 dev server，用浏览器截图验证桌面和移动端。
- 最终说明改了什么、怎么验证、还有什么风险。
```

### 什么时候用聊天模型

适合：

- 理解概念。
- 头脑风暴。
- 改写文案。
- 解释报错。
- 写小片段。
- 快速比较方案。

不适合：

- 直接大改代码库。
- 需要真实验证的 UI 问题。
- 需要读很多文件的任务。

### 什么时候用 coding agent

适合：

- 需要读仓库。
- 需要改文件。
- 需要跑测试。
- 需要看 diff。
- 需要反复根据错误修。

### 什么时候用 subagent

适合：

- 大范围代码探索。
- review。
- 浏览器验证。
- 长日志总结。
- 多个独立方向并行排查。

### 什么时候用 MCP

适合：

- AI 需要 Figma/Sentry/GitHub/私有资料等外部系统。
- 这些信息不在当前 repo。
- 你希望工具权限更结构化。

## 6. 不同工具怎么选

### 你的主力组合

- Codex/Claude Code：复杂代码任务、仓库级修改、测试验证。
- Cursor/IDE AI：边写边问、局部改代码、理解文件。
- ChatGPT/Claude/Gemini/Qwen：概念解释、方案比较、长文总结。
- 浏览器搜索：最新信息、官方文档、报错定位。
- Playwright/浏览器工具：验证 UI 真相。

### 可选，不是必修

- Vercel AI SDK：只有当你要开发 AI chat/app 时再学。
- LlamaIndex/LangChain：只有当你要自建知识库/RAG 应用时再学。
- OpenAI Agents SDK/LangGraph：只有当你要开发 agent 系统时再学。
- DSPy：只有当你要系统优化 prompt/program 时再学。
- lm-evaluation-harness：主要是模型 benchmark，不是日常使用 AI 的第一优先级。

### 对你暂时不推荐深挖

- 从零训练模型。
- RLHF/DPO 实操训练。
- 自己写多 agent 框架。
- 一上来写 MCP server。
- 自己搭复杂 eval 平台。
- 为了学习而本地部署大模型。

这些不是没价值，而是和“利用好 AI 写前端”不是同一优先级。

## 7. 你需要掌握的概念清单

### 必须会用

- Prompt/spec
- Context
- Tool calling
- CLI 工具
- Browser verification
- Diff review
- AGENTS.md
- Skills
- Subagents
- MCP 配置和权限
- Evals/checklist
- Prompt injection 风险
- Hallucination 风险

### 需要理解

- Transformer
- Token
- Context window
- Embedding
- RAG
- Agent loop
- Harness/runtime
- Structured output
- Memory
- Guardrails
- Human-in-the-loop

### 知道即可

- RLHF/DPO/ORPO
- LoRA/QLoRA
- Quantization
- FP16/FP8/INT8/INT4
- MoE
- Distillation
- lm-evaluation-harness
- LangGraph/OpenAI Agents SDK 内部细节

## 8. 四周上手路线：以“用好 AI”为目标

### 第 1 周：建立正确心智模型

目标：知道模型能做什么、不能做什么。

做：

- 读这份总览。
- 读 [Transformer 精读](./03-attention-is-all-you-need-reading-guide.md) 的前半部分。
- 读 [Tool Calling](./06-tool-calling-structured-output.md)。
- 总结 10 个你日常最常让 AI 做的任务。

产出：

- 一份“哪些任务适合聊天模型，哪些适合 coding agent”的个人清单。

### 第 2 周：把前端任务提示词规范化

目标：让 AI 少猜，多按你的标准工作。

做：

- 给常见任务写模板：修 bug、做 UI、review、解释代码、写测试。
- 每个模板都包含目标、上下文、约束、验收。
- 在真实项目里试 3 次，记录哪类提示最有效。

产出：

- 3 到 5 个可复用 prompt 模板。

### 第 3 周：加入验证和 review

目标：让 AI 不只是“写”，还会“证明它写对了”。

做：

- 每次 UI 改动要求浏览器验证。
- 每次代码改动要求说明 diff 和风险。
- 让 reviewer 角色只读审查一次。
- 把常见验收点写成 checklist。

产出：

- 一份前端 AI 任务验收清单。

### 第 4 周：沉淀成 Skill/AGENTS.md

目标：把有效流程变成默认工作习惯。

做：

- 把 repo 固定规则写进 AGENTS.md。
- 把“前端 UI 实现流程”写成 skill。
- 试一次 explorer/reviewer/browser tester 的 subagent 分工。
- 只在确实需要外部系统时再配置 MCP。

产出：

- 一个最小可用的前端 AI workflow。

## 9. 最小实践清单

按顺序做：

1. 前端任务 prompt 模板
   写出修 bug、做 UI、review 三个模板。

2. Repo 规则文档
   把启动命令、测试命令、设计约束、禁改目录写清。

3. UI 验收 checklist
   空态、加载、错误、长文本、移动端、桌面端、可访问性。

4. Reviewer subagent
   只读检查 diff，输出 P0/P1/P2 风险。

5. Browser tester 流程
   可见 UI 改动必须打开页面验证。

6. Skill
   把上面流程封成可复用 skill。

7. MCP
   只有当你需要 Figma/Sentry/GitHub/私有资料时再接。

## 10. 关键风险

### 幻觉

模型会生成合理但不存在的内容。

应对：

- 让它引用文件、命令、截图、日志。
- 关键事实用工具查。
- 不确定时要求明确说不确定。

### 上下文污染

长日志、无关搜索结果、失败尝试会让主会话变乱。

应对：

- 大量探索交给 subagent。
- 阶段性总结。
- 主会话只保留决策和关键事实。

### 工具越权

AI 有工具后就可能真的改东西。

应对：

- 写操作谨慎。
- 删除、安装、提交、发外网请求要确认。
- 读写权限分开。

### Prompt injection

网页、issue、文档里可能包含恶意指令。

应对：

- 外部内容默认不可信。
- 不把 secret 暴露给模型。
- 不让读取私密信息的 agent 同时拥有随意发外网的能力。

## 11. 最后给你的路线建议

你最该投入的不是 AI 框架栈，而是自己的 AI 工作流栈：

```text
清晰任务表达
+ 正确上下文
+ 工具和权限
+ 浏览器/测试验证
+ review/subagent 分工
+ skill/AGENTS.md 沉淀
```

如果以后你要做 AI 产品，再去学 Vercel AI SDK、RAG 框架、Agents SDK、LangGraph、MCP server 开发。现在的第一目标是：让 AI 成为你日常前端开发里可靠、可验证、可复用的放大器。
