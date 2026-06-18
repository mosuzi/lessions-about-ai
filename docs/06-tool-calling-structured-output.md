# Tool Calling 和 Structured Output：让模型从“说话”变成“调用系统”

更新时间：2026-06-18

现代 LLM 应用的关键变化是：模型不只是生成自然语言，还能输出结构化数据，或者选择调用外部工具。

一句话：

```text
Structured Output 让模型按 schema 输出。
Tool Calling 让模型决定何时调用函数/工具。
```

## 为什么这件事重要

如果模型只能输出文本，你的系统要靠正则或字符串解析去猜它的意图，很脆弱。

例如：

```text
用户：帮我查一下明天北京天气，再安排提醒。
模型：好的，明天北京天气晴，我帮你安排提醒。
```

这个回答对人友好，但程序不知道：

- 查天气工具是否真的调用了？
- 城市参数是什么？
- 日期参数是什么？
- 提醒时间是什么？
- 结果是不是模型编的？

Tool calling 的目标是让模型输出类似：

```json
{
  "tool": "get_weather",
  "arguments": {
    "city": "北京",
    "date": "2026-06-19"
  }
}
```

程序执行工具后，再把真实结果交回模型。

## Structured Output 是什么

Structured Output 要求模型输出符合 schema 的 JSON 或结构化对象。

适合：

- 表单抽取
- 工单分类
- 路由决策
- 生成配置
- 输出任务清单
- 生成 UI 组件树
- 生成 PR review 结果

例子：

```json
{
  "summary": "修复移动端按钮溢出",
  "riskLevel": "medium",
  "filesToCheck": ["src/components/Button.tsx"],
  "needsBrowserTest": true
}
```

它的价值是：输出可以被代码消费，而不是只给人看。

## Tool Calling 是什么

Tool calling 是让模型选择调用你定义的工具。工具由程序真实执行。

一个工具通常包括：

- 名字
- 描述
- 参数 schema
- 返回结果
- 权限策略

例子：

```ts
{
  name: "searchComponentDocs",
  description: "Search frontend component docs by component name or prop.",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string" }
    },
    required: ["query"]
  }
}
```

模型看到用户问题后，如果需要资料，就发起工具调用。你的程序执行搜索，再把结果放回上下文。

## Tool Calling 和 MCP 的关系

Tool calling 是模型调用工具的通用能力。MCP 是一种把工具暴露给 AI 客户端的协议。

可以这样分：

```text
Tool calling = 模型如何表达“我要用工具”
MCP = 工具如何被标准化暴露给 AI 客户端
CLI = 工具如何在本机被实际执行
```

## Tool Calling 和 Agent 的关系

一次 tool call 不等于 agent。

Agent 往往是一个循环：

```text
模型思考下一步 -> 调工具 -> 观察结果 -> 再决定下一步 -> 直到完成
```

如果你的系统只是：

```text
分类 -> 调一个工具 -> 输出结果
```

那更像 workflow，不必叫 agent。

## 前端开发者常见玩法

### 1. 工具调用 UI

不要让用户只看到“AI 正在思考”。可以显示：

- 正在搜索组件文档
- 正在读取 Figma frame
- 正在运行测试
- 正在生成 patch
- 工具调用失败，等待重试

这会极大提升可理解性和信任。

### 2. Generative UI

模型输出结构化 UI 描述，前端渲染真实组件。

例如：

```json
{
  "component": "IssueSummary",
  "props": {
    "title": "登录失败",
    "severity": "high"
  }
}
```

注意：生产里不要让模型随便生成任意 HTML。最好映射到受控组件白名单。

### 3. AI 表单助手

模型把自然语言转成结构化表单：

```json
{
  "assignee": "frontend",
  "priority": "p1",
  "labels": ["mobile", "checkout"],
  "dueDate": "2026-06-21"
}
```

用户确认后再提交。

## 常见坑

### 工具描述写得太模糊

模型是否会用工具，很大程度取决于工具描述。描述要说明：

- 什么时候用
- 什么时候不用
- 参数含义
- 返回结果限制
- 失败时怎么处理

### 工具太大

不要写一个万能工具：

```text
doAnything(input: string)
```

这等于把结构化能力废掉。工具应该边界清楚。

### 缺少权限

读工具和写工具要分开。查资料可以自动，发邮件、删文件、提交 PR、改生产配置要确认。

### 把工具结果当真理

工具也会失败、过期、返回空结果。模型需要看到错误状态，而不是只看到“没有资料”。

## 最小实践

做一个“前端任务分析器”：

1. 输入用户需求。
2. Structured output 输出任务类型、相关模块、风险等级。
3. 如果需要组件知识，调用 `searchComponentDocs`。
4. 如果需要代码上下文，调用 `searchRepo`。
5. 输出实现建议和验证清单。

## 继续阅读

- OpenAI Function Calling 文档：https://developers.openai.com/api/docs/guides/function-calling
- OpenAI Structured Outputs 文档：https://developers.openai.com/api/docs/guides/structured-outputs
- OpenAI Tools 文档：https://developers.openai.com/api/docs/guides/tools
- Vercel AI SDK Tool Calling：https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling
- Vercel AI SDK Structured Data：https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data

