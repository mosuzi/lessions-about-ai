# MCP：AI 工具世界的标准化插座

更新时间：2026-06-18

MCP 是 Model Context Protocol。它是一个开放协议，用来让 AI 应用连接外部工具、数据源和上下文。

一句话：

```text
MCP = 让 AI 客户端用统一方式发现和调用外部工具/资源的协议。
```

如果 CLI 是万能扳手，MCP 就是标准化插座。

## 为什么需要 MCP

没有 MCP 时，每个 AI 客户端都要单独集成：

- GitHub
- Figma
- Notion
- Slack
- Google Drive
- 数据库
- 浏览器
- 内部系统

这会造成 N 个客户端乘以 M 个工具的集成爆炸。

MCP 的思路是：

```text
工具提供方写 MCP server
AI 客户端作为 MCP host/client 接入
模型通过统一 schema 使用工具和资源
```

## MCP 的核心对象

### Tools

可执行动作，例如：

- 搜索文档
- 查询数据库
- 打开浏览器
- 创建 issue
- 读取 Figma 节点

Tools 通常有明确参数 schema。

### Resources

可读取的上下文，例如：

- 文件
- 文档
- 表格
- 页面
- 数据库记录

Resources 更像“资料”，不一定触发动作。

### Prompts

服务器可以提供可复用提示模板，让客户端知道如何完成某类任务。

### Server instructions

MCP server 可以给客户端提供整体使用说明，例如限制、速率、注意事项。

## MCP 和 CLI 的区别

CLI：

- 能力极强
- 生态现成
- 适合本机开发、构建、测试
- 可发现性弱
- 安全边界粗

MCP：

- schema 明确
- 可被 AI 客户端发现
- 更适合权限管理
- 可跨客户端复用
- 能力取决于 server 暴露了什么

所以不是谁替代谁：

```text
本地工程动作 -> CLI
结构化外部系统接入 -> MCP
```

## MCP 和 Skill 的区别

MCP 规范“工具接口”。

Skill 规范“工作方法”。

例如：

- `figma.getNode(id)`：MCP
- “根据 Figma 还原前端页面，改完截图验证”：Skill
- `sentry.searchIssues(query)`：MCP
- “排查线上错误，从 Sentry 到代码定位再给修复建议”：Skill

## 前端开发者最值得写的 MCP

### Design system MCP

暴露：

- design tokens
- components metadata
- prop schema
- icon list
- usage examples

### Figma MCP

暴露：

- frame tree
- selected node
- style info
- component names

### API schema MCP

暴露：

- OpenAPI schema
- GraphQL schema
- mock data
- endpoint examples

### Project knowledge MCP

暴露：

- repo docs
- route map
- architecture notes
- coding conventions

## 安全注意

MCP 是真实工具能力，不是文档链接。

要注意：

- 最小权限。
- 读写工具分开。
- 对写操作加确认。
- 不要把 secret 暴露给模型。
- 警惕 prompt injection。
- 工具返回的外部文本也要视为不可信输入。
- 给 server instructions 写清边界。

## 最小实践

写一个本地 MCP server，暴露三个只读工具：

```text
listComponents()
getComponentProps(name)
searchUsageExamples(query)
```

让 Codex/Claude/Cursor 这类客户端都能问你的组件库。

后续再加写工具，例如创建 issue、生成文档，但写操作必须确认。

## 继续阅读

- MCP 官方介绍：https://modelcontextprotocol.io/docs/getting-started/intro
- MCP Specification：https://modelcontextprotocol.io/specification
- MCP GitHub organization：https://github.com/modelcontextprotocol
- Codex MCP 文档：https://developers.openai.com/codex/mcp
- OpenAI MCP and Connectors：https://developers.openai.com/api/docs/guides/mcp

