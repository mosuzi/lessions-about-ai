# Skills：把 AI 的工作手艺封装成可复用流程

更新时间：2026-06-18

Skill 不是只属于 Claude 的能力。Codex 也支持 Agent Skills，并且官方文档描述为一种扩展 Codex 任务能力的方式：把 instructions、resources、可选 scripts 打包起来，让 Codex 更可靠地遵循某个 workflow。

一句话：

```text
Skill = 可复用的 AI 工作流说明书。
```

## Skill 解决什么问题

CLI 很强，但太自由。MCP 很规范，但偏工具接口。Skill 处在中间：

- 不把每个动作都封成 API。
- 也不让 agent 每次凭感觉乱跑命令。
- 它告诉 agent：遇到这类任务，应该按什么流程做。

例如前端 UI skill：

```text
1. 先读现有组件和设计 token。
2. 复用现有模式。
3. 实现空/加载/错误/长文本状态。
4. 跑类型检查。
5. 用浏览器截图验证移动端和桌面端。
6. 最终报告验证结果和未覆盖风险。
```

## Codex 里的 Skill 长什么样

Codex skill 通常是一个目录，里面有 `SKILL.md`：

```md
---
name: frontend-ui
description: Use when implementing or reviewing frontend UI changes.
---

Follow the repository design system.
Read existing components before editing.
Run browser verification for visible UI changes.
```

它还可以带：

- references
- templates
- scripts
- examples
- metadata

Codex 会先看到 skill 的 name、description 和路径。只有当任务匹配时，才加载完整 `SKILL.md`，这叫 progressive disclosure。

## Skill、AGENTS.md、MCP、Plugin 的区别

### AGENTS.md

Repo 级长期规则，例如：

- 这个项目用 pnpm。
- 测试命令是什么。
- 不要改 generated 文件。
- PR 风格是什么。

### Skill

某类任务的流程，例如：

- 做 UI 改动怎么验证。
- 做安全 review 怎么输出。
- 做 RAG 数据清洗怎么跑脚本。

### MCP

外部工具和数据接口，例如：

- 查询 Figma。
- 查 Sentry。
- 读组织知识库。

### Plugin

分发单元，可以打包：

- skills
- MCP server 配置
- app integrations
- assets

## Skill 和 Subagent 的关系

Skill 可以规定什么时候使用 subagent。

例如：

```text
如果任务涉及大范围 UI 改动：
- explorer subagent 先找现有模式
- implementer 做最小改动
- reviewer subagent 只读审查
- browser tester 验证页面
```

Skill 是流程图，subagent 是执行者。

## 什么时候应该写 Skill

适合：

- 你反复让 AI 做同类任务。
- 任务有固定验收步骤。
- 容易漏掉某些验证。
- 有一套团队约定。
- 需要引用本地模板、脚本、参考资料。

不适合：

- 一次性问题。
- 单个 API 查询。
- 应该封成 MCP 的外部系统能力。
- 应该写进 AGENTS.md 的全局 repo 规则。

## 前端开发者最值得写的 Skills

### frontend-ui-implementation

规定 UI 实现流程、响应式、可访问性、截图验证。

### frontend-review

规定 code review 输出格式、风险分级、文件行号要求。

### design-to-code

规定如何读取 Figma、映射设计系统、处理缺失资源。

### browser-regression

规定如何打开页面、测试断点、截图、比较异常。

### prompt-to-product

规定从用户口头需求到页面结构、组件、状态、数据流的拆解方式。

## 最小实践

可以在项目里建：

```text
.agents/skills/frontend-ui/SKILL.md
```

内容先别复杂，写 20 行硬规则就够：

- 什么时候触发
- 先读什么
- 不能做什么
- 要跑什么验证
- 最终怎么报告

等流程稳定后，再加 scripts 和 references。

## 继续阅读

- Codex Agent Skills：https://developers.openai.com/codex/skills
- Open Agent Skills specification：https://agentskills.io/specification
- OpenAI skills examples：https://github.com/openai/skills
- Codex plugins：https://developers.openai.com/codex/plugins/build
