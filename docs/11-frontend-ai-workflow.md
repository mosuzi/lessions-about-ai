# 前端开发者玩转 AI 的工作流

更新时间：2026-06-18

你不需要先成为训练大模型专家，才会用好 AI。前端开发者最该掌握的是：

```text
把 AI 当成可组合、可验证、可受控的软件运行时。
```

## 核心心法

不要把 AI 当“代码生成器”，而要把它当一个有工具的协作者：

- 给它上下文。
- 给它边界。
- 给它验收标准。
- 让它小步修改。
- 让它跑真实验证。
- 让 reviewer/brower tester 检查结果。

## 一个稳定的前端 AI 流程

### 1. Spec

先写清楚目标：

- 用户是谁
- 页面解决什么问题
- 数据从哪来
- 有哪些状态
- 哪些事情不要做
- 验收标准是什么

模糊输入：

```text
做漂亮点。
```

更好输入：

```text
把订单列表移动端筛选体验改成底部抽屉。复用现有 Button、Drawer、Select。
必须覆盖空状态、加载态、错误态、长订单号。不要引入新依赖。
```

### 2. Context

让 AI 先读：

- 现有页面
- 组件库
- design token
- 路由
- API schema
- 类似实现

不要直接让它开写。

### 3. Plan

让 AI 输出：

- 会改哪些文件
- 为什么
- 风险是什么
- 怎么验证

这一步能提前挡住很多大改。

### 4. Implement

要求：

- 小步 diff
- 不重写无关代码
- 复用现有组件
- 不乱改格式化
- 不顺手重构

### 5. Verify

前端改动必须看页面：

- typecheck
- lint
- unit test
- dev server
- browser screenshot
- mobile viewport
- long text
- loading/error/empty state

只跑编译不够，UI 可能照样丑、错位、遮挡、不可点。

### 6. Review

让 reviewer agent/subagent 只读检查：

- 是否有 bug
- 是否遗漏状态
- 是否破坏现有行为
- 是否有 a11y 问题
- 是否有响应式问题
- 是否缺测试

### 7. Preserve

把稳定做法沉淀：

- AGENTS.md：repo 级规则
- Skill：任务工作流
- MCP：外部系统工具
- Eval：固定验收样例
- Playwright：关键流程回归

## 推荐工具组合

### UI 和 AI 应用

- Vercel AI SDK：streaming、tool calling、structured data、React/Next 体验好。
- 官方模型 SDK：直接调用模型 API。
- Playwright：浏览器验证。

### 项目知识

- RAG：接组件文档、API schema、设计规范。
- MCP：把 Figma、Sentry、GitHub、组件库工具化。
- Skill：固化“怎么做前端任务”。

### Coding agent

- Codex/Claude Code/Cursor/Windsurf：让 agent 改代码。
- Subagents：只读探索、review、browser 验证。
- Evals：固定任务回归。

## 适合直接复制的提示词

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

## 进阶玩法

### 1. 组件库 RAG

把组件文档和 usage examples 做成 RAG。以后问：

```text
这个项目里 Modal 的 footer 应该怎么写？
```

AI 能基于真实文档回答。

### 2. Design system MCP

把 tokens、icons、component metadata 暴露成 MCP。AI 不用猜颜色和组件 prop。

### 3. UI eval

准备固定截图任务：

- 订单列表移动端
- 表单错误态
- 弹窗长文案
- 深色模式
- 空状态

每次大改让 AI 跑浏览器验证。

### 4. Subagent review

固定三个只读 subagent：

- accessibility reviewer
- responsive reviewer
- test-gap reviewer

它们不改代码，只报风险。

## 常见误区

### 把 AI 当一次性代码生成器

它更适合参与完整循环：理解、实现、验证、审查、修复。

### 不给上下文

AI 不知道你的设计系统和历史约定，就会发明自己的 UI。

### 不做浏览器验证

前端代码能编译，不代表页面能用。

### 一次给太大任务

大任务要拆：探索、计划、实现、验证、review。

### 不沉淀流程

每次都在 prompt 里重复规则，效率低。稳定规则应该写成 AGENTS.md 或 Skill。

## 继续阅读

- Vercel AI SDK：https://ai-sdk.dev/docs/introduction
- OpenAI Cookbook：https://cookbook.openai.com/
- Playwright：https://playwright.dev/
- Codex Agent Skills：https://developers.openai.com/codex/skills
- Codex Subagents：https://developers.openai.com/codex/concepts/subagents
- Anthropic: Building effective agents：https://www.anthropic.com/engineering/building-effective-agents

