# RAG 是啥：把模型的“记忆”接到外部资料库

更新时间：2026-06-18

RAG 是 Retrieval-Augmented Generation，中文常译为“检索增强生成”。它解决的不是“模型会不会说话”，而是：

```text
模型回答时，能不能先查你指定的资料，再基于资料回答？
```

如果你是前端开发者，可以把 RAG 理解成：

```text
用户问题 -> 搜索相关文档/API/代码片段 -> 把命中的证据塞进 prompt -> 让模型回答
```

它像是给 LLM 接了一个可更新的外部知识源。

## 为什么 RAG 重要

大模型的参数里确实存了大量世界知识，但有几个问题：

- 训练后发生的新信息，它不知道。
- 组织内部资料、私有代码库、业务规则，它天然不知道。
- 它会把“听起来合理”的内容补出来，也就是幻觉。
- 你需要可引用来源时，只靠模型参数不够。
- 每次知识更新都重新训练模型，成本太高。

RAG 的核心思路是把知识拆出来，放在外部资料库里。模型负责理解和生成，检索系统负责找证据。

## 原始论文里的核心思想

RAG 论文提出的是把两种记忆结合起来：

- Parametric memory：模型参数里的知识。
- Non-parametric memory：外部检索库，例如 Wikipedia 向量索引。

模型回答时，不只依赖参数，还会检索外部 passage，再基于 passage 生成答案。论文关注的是知识密集型 NLP 任务，例如开放域问答。

精读版理解：

```text
不要指望模型把所有事实都背下来。
让模型在回答前先查一个可更新、可审计的资料库。
```

## 标准 RAG 流程

### 1. Ingest

把资料收集进系统：

- Markdown 文档
- PDF
- 网页
- API schema
- 代码注释
- 设计系统文档
- issue、PR、FAQ

### 2. Chunk

把长文档切成小片段。切太大，召回不准；切太小，上下文断裂。

常见策略：

- 按标题切
- 按段落切
- 滑动窗口
- 代码按函数/类切
- Markdown 保留标题层级

### 3. Embed

把每个 chunk 转成 embedding 向量。向量表达的是语义位置，方便按相似度搜索。

### 4. Index

把向量和原文存进检索系统：

- pgvector
- Qdrant
- Milvus
- Chroma
- Weaviate
- Elasticsearch/OpenSearch
- Pinecone

### 5. Retrieve

用户提问时，也把问题转成向量，找最相似的 chunks。

### 6. Rerank

第一轮召回通常粗糙，可以用 reranker 重新排序，让更相关的证据靠前。

### 7. Generate

把问题、证据、回答要求放进 prompt，让模型回答。

### 8. Cite and evaluate

要求模型引用证据来源，并用 eval 检查：

- 引用是否支持答案
- 是否遗漏关键事实
- 是否把多个版本混在一起
- 不知道时有没有承认不知道

## 前端开发者怎么用

最适合你的 RAG 场景：

- 组件库问答：Button、Modal、Form 怎么用。
- 项目知识库：路由、状态管理、接口约定、设计 token。
- PR review 辅助：查团队规范、历史 bug、架构说明。
- 业务文档助手：根据产品规则回答前端实现约束。
- 设计系统助手：根据 Figma metadata、tokens、组件文档给实现建议。

不一定需要 RAG 的场景：

- 改一个局部样式 bug。
- 生成一次性 UI 文案。
- 写一个简单 React 组件。
- 模型上下文已经足够装下相关文件。

## RAG 的常见坑

### 只做向量检索，不做关键词检索

向量检索适合语义相似，但对精确符号不总是好，例如函数名、错误码、组件 prop、接口字段。工程里常用 hybrid search：

```text
BM25/关键词检索 + embedding 向量检索 + rerank
```

### Chunk 丢结构

如果你把文档切碎后丢掉标题路径，模型可能不知道这段话属于哪个模块。建议保留 metadata：

- 文件路径
- 标题层级
- 更新时间
- 版本
- 所属系统
- 代码语言

### 召回太多

塞太多资料会污染上下文。RAG 不是“尽量多给”，而是“给最能回答问题的证据”。

### 资料过期

RAG 依赖资料库质量。旧文档、冲突文档、重复文档会直接污染答案。

### 以为 RAG 能消灭幻觉

不能。RAG 降低幻觉，但模型仍可能误读证据、过度推断、混合来源。关键问题仍要 eval 和人工审核。

## 什么时候选 RAG，什么时候选微调

选 RAG：

- 知识经常变。
- 需要引用来源。
- 数据是私有资料。
- 你想快速接入新文档。
- 任务主要是“基于资料回答”。

选微调：

- 你要改变模型稳定行为风格。
- 你有大量高质量训练样本。
- 任务格式固定，靠 prompt 很难稳定。
- 你希望模型内化某种输出习惯，而不是查资料。

很多生产系统会两者都用：

```text
微调负责行为模式
RAG 负责实时知识
```

## 最小实践

你可以做一个“前端项目知识库助手”：

1. 收集 `docs/`、组件 README、API schema。
2. 按 Markdown 标题切 chunk。
3. 用 embedding 入库。
4. 查询时 hybrid retrieve top 20。
5. rerank 到 top 5。
6. 让模型只基于证据回答。
7. 输出引用文件路径和标题。
8. 准备 20 个固定问题做 eval。

## 继续阅读

- RAG 原论文：Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks：https://arxiv.org/abs/2005.11401
- RAG survey 2024：Retrieval-Augmented Generation for Natural Language Processing: A Survey：https://arxiv.org/abs/2407.13193
- LlamaIndex 文档：https://developers.llamaindex.ai/python/framework/
- OpenAI Cookbook：https://cookbook.openai.com/
- LangChain RAG 教程：https://python.langchain.com/docs/tutorials/rag/
