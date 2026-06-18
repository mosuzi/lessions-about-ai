# Attention Is All You Need 中文精读版

更新时间：2026-06-18

原论文：Ashish Vaswani 等，Attention Is All You Need，2017。论文地址：https://arxiv.org/abs/1706.03762

说明：这份文档不是论文全文翻译。原论文仍受版权保护，不能在未提供原文的情况下直接生成整篇逐字翻译。这里提供的是中文精读版：按论文结构解释核心内容、术语和公式，帮助你读懂原文。如果你提供某一小段原文，我可以继续为那一段做逐段翻译和讲解。

## 一句话概括

这篇论文提出 Transformer：一种完全基于 attention 的序列到序列模型，不再依赖 RNN 或 CNN。它让序列建模更容易并行训练，并在机器翻译任务上取得了当时很强的效果。

这篇论文的重要性在于：现代大语言模型的主流架构，几乎都继承或改造自 Transformer。

## 论文要解决的问题

在 Transformer 之前，主流序列转导模型常用 RNN、LSTM、GRU 或 CNN，再加 attention。它们的问题是：

- RNN 按 token 顺序处理，训练难以并行。
- 长距离依赖需要通过很多时间步传递，学习困难。
- CNN 可以并行，但要堆很多层才能覆盖长距离关系。
- 传统 encoder-decoder 虽然有 attention，但主体仍常是循环或卷积结构。

论文的核心问题是：

```text
能不能只用 attention 来建模序列关系，彻底去掉 recurrence 和 convolution？
```

答案就是 Transformer。

## 总体架构

Transformer 是 encoder-decoder 架构：

```text
输入序列 -> Encoder stack -> 上下文表示 -> Decoder stack -> 输出序列
```

论文里的 base 模型使用：

- 6 层 encoder。
- 6 层 decoder。
- 模型维度 d_model = 512。
- feed-forward 隐层维度 d_ff = 2048。
- attention heads = 8。
- dropout = 0.1。

### Encoder 每层包含什么

每个 encoder layer 有两个子层：

1. Multi-head self-attention
2. Position-wise feed-forward network

每个子层外面都有 residual connection 和 layer normalization。

简化成：

```text
x -> self-attention -> add & norm -> feed-forward -> add & norm
```

### Decoder 每层包含什么

每个 decoder layer 有三个子层：

1. Masked multi-head self-attention
2. Encoder-decoder attention
3. Position-wise feed-forward network

简化成：

```text
y -> masked self-attention -> add & norm
  -> cross-attention over encoder output -> add & norm
  -> feed-forward -> add & norm
```

masked self-attention 的作用是防止模型在生成第 t 个 token 时偷看未来 token。

## Attention 的核心直觉

Attention 可以理解为“按相关性加权取信息”。

对每个 token，模型会产生三类向量：

- Query，Q：我现在想找什么信息。
- Key，K：我这里有什么可被匹配的特征。
- Value，V：如果你关注我，我能提供什么内容。

计算过程：

1. 用 Q 和 K 算相关性分数。
2. 对分数做缩放和 softmax，得到权重。
3. 用权重加权求和 V。

论文里的 scaled dot-product attention 公式是：

```text
Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) V
```

为什么除以 sqrt(d_k)：

当向量维度 d_k 变大时，点积的数值幅度容易变大，softmax 会变得过于尖锐，梯度变小。缩放可以让训练更稳定。

## Self-attention 是什么

self-attention 指 Q、K、V 都来自同一个序列。

例如句子：

```text
The animal didn't cross the street because it was too tired.
```

模型需要判断 it 指谁。self-attention 允许 it 直接关注 animal、street、tired 等位置，而不是靠 RNN 的 hidden state 一步步传递。

优势：

- 任意两个 token 之间路径长度短。
- 训练可并行。
- 注意力权重可部分解释模型关注了哪些位置。

代价：

- 标准 self-attention 对序列长度是 O(n^2)。
- 长上下文会带来显存和计算压力。

## Multi-head attention 是什么

单个 attention 头只能从一个表示子空间看关系。multi-head attention 把 Q/K/V 投影到多个子空间，分别做 attention，再拼接结果。

直觉上，不同 head 可以关注不同关系：

- 一个 head 看主谓关系。
- 一个 head 看指代关系。
- 一个 head 看局部短语。
- 一个 head 看长距离依赖。

论文 base 模型中有 8 个 head，每个 head 的 key/value 维度是 64。

## Feed-forward network 是什么

每层 attention 之后还有一个逐位置前馈网络。它对每个 token 位置独立应用同一个两层 MLP：

```text
FFN(x) = max(0, xW1 + b1)W2 + b2
```

它的作用不是混合不同 token，而是在每个位置上做非线性变换和特征加工。跨 token 信息主要由 attention 完成。

## 位置编码为什么必要

Transformer 没有 RNN，也没有 CNN。如果只看 self-attention，本身并不知道 token 的顺序。

所以论文加入 positional encoding，把位置信息加到 token embedding 上。

论文使用正弦/余弦位置编码。好处是：

- 不需要学习额外的位置参数。
- 不同频率可以表示不同粒度的位置关系。
- 模型可能更容易外推到比训练时更长的序列。

后来的模型也常用 learned position embedding、RoPE、ALiBi 等位置机制。

## 为什么 Transformer 更容易并行

RNN 的第 t 个 hidden state 依赖第 t-1 个 hidden state，所以训练时天然串行。

Transformer 的 self-attention 可以一次性计算序列里所有 token 两两关系，矩阵乘法非常适合 GPU/TPU。

这就是论文标题的含义：对于这类序列建模任务，attention 足够承担主要建模职责，不再需要 RNN/CNN 作为骨架。

## 论文实验做了什么

论文主要在机器翻译上验证：

- WMT 2014 English-to-German
- WMT 2014 English-to-French

结果显示 Transformer 在翻译质量上超过当时强基线，并且训练成本更低。论文还把 Transformer 应用到 English constituency parsing，说明它不只适用于翻译。

注意：这篇论文不是在训练 ChatGPT 式聊天模型。它提出的是通用架构，后来的 GPT、BERT、T5、Llama、Qwen 等模型在不同方向上继承和改造了它。

## 论文各节中文导读

### Abstract

摘要讲了三件事：

- 当时主流序列转导模型依赖 RNN/CNN。
- 作者提出完全基于 attention 的 Transformer。
- Transformer 在翻译任务上更好、更容易并行、训练时间更短。

### 1 Introduction

引言指出 RNN 的顺序计算限制了并行化，尤其是长序列训练。已有 attention 机制能帮助建模依赖关系，但通常仍和 RNN 一起使用。

作者提出彻底去掉 recurrence，用 self-attention 来连接输入和输出中的位置关系。

### 2 Background

背景部分比较了几类方法：

- Extended Neural GPU
- ByteNet
- ConvS2S
- Attention-based models

重点是说明：卷积模型虽然能并行，但长距离依赖要经过多层；self-attention 可以让任意两个位置通过常数路径交互。

### 3 Model Architecture

这是全文最核心部分。论文详细定义了 encoder、decoder、scaled dot-product attention、multi-head attention、feed-forward network、embedding、softmax 和 positional encoding。

读这一节要抓住三条线：

- 信息如何在同一序列内部流动：self-attention。
- decoder 如何读取 encoder 输出：encoder-decoder attention。
- 模型如何保留顺序：positional encoding。

### 4 Why Self-Attention

这一节解释为什么选 self-attention，并从三方面比较：

- 每层计算复杂度。
- 可并行程度。
- 长距离依赖的路径长度。

self-attention 的优势是并行和短路径，劣势是序列很长时 O(n^2) 成本高。

### 5 Training

训练部分介绍数据、batch、硬件、优化器、学习率 schedule、regularization。

关键点：

- 使用 Adam。
- 学习率先 warmup，再按步数反平方根衰减。
- 使用 residual dropout。
- 使用 label smoothing。

这些训练 recipe 后来成为 Transformer 系模型的重要工程经验来源。

### 6 Results

结果部分展示机器翻译分数和训练成本。Transformer base 和 big 都表现强，尤其 big 模型在英德、英法翻译上达到很高 BLEU 分数。

对现代读者来说，不必纠结 BLEU 的具体数字，重点是：

- 该架构在标准任务上验证有效。
- 相比循环/卷积模型，训练效率明显提升。

### 7 Conclusion

结论重申 Transformer 是第一种完全基于 attention 的序列转导模型，并说明未来计划包括把它扩展到其他任务、处理图像/音频/视频等非文本输入，以及研究局部/受限 attention 来处理长序列。

这些方向后来都变成了真实研究主线。

## 这篇论文对现代 LLM 的影响

### GPT 路线

GPT 类模型主要使用 decoder-only Transformer。它们保留了 masked self-attention，通过 next-token prediction 训练，适合生成文本。

### BERT 路线

BERT 类模型主要使用 encoder-only Transformer。它们擅长理解、分类、抽取、embedding 等任务。

### T5/BART 路线

T5/BART 类模型使用 encoder-decoder Transformer，更接近原论文架构，适合翻译、摘要、改写等 seq2seq 任务。

### 现代 LLM 的变化

现代模型通常在原始 Transformer 上做了大量修改，例如：

- learned/RoPE/ALiBi 位置机制。
- pre-norm 结构。
- SwiGLU/GEGLU 前馈网络。
- RMSNorm。
- grouped-query attention 或 multi-query attention。
- KV cache。
- 长上下文 attention 优化。

但核心思想仍是：用 attention 在 token 之间路由信息。

## 读论文时最容易卡住的点

### Q/K/V 不是真实数据库查询

Q/K/V 是模型学出来的向量投影，不是人工写死的字段。它们只是借用了 query/key/value 的类比。

### Attention 权重不是完整解释

attention 权重能提供一些可视化线索，但不能简单等同于“模型真正原因”。模型内部还有 MLP、残差、层归一化、多层组合。

### Decoder 的 masked self-attention 很关键

训练翻译模型时，decoder 端可以一次喂入目标句子，但必须 mask 掉未来位置，否则模型会作弊看到答案。

### Transformer 不是没有顺序

它没有 RNN 式顺序计算，但通过位置编码加入顺序信息。

### O(n^2) 是后续长上下文问题的根源

标准 attention 要计算 token 两两关系。上下文越长，计算和显存增长越快。这也是 FlashAttention、稀疏 attention、线性 attention、滑窗 attention 等研究/工程优化的重要背景。

## 建议阅读顺序

如果你第一次读：

1. 先读摘要和引言，知道论文要解决什么。
2. 重点读第 3 节架构，画出 encoder/decoder。
3. 读懂 scaled dot-product attention 公式。
4. 粗读第 4 节，理解为什么 self-attention 有并行优势。
5. 粗读训练和结果，不必纠结每个实验细节。
6. 回头把 multi-head attention、positional encoding、mask 再看一遍。

如果你会写代码：

建议用 PyTorch 手写一个最小 Transformer block：

- token embedding
- positional encoding
- multi-head self-attention
- causal mask
- feed-forward
- residual + norm

写完以后，这篇论文会从“公式很多”变成“结构很清楚”。

## 术语对照

| 英文 | 中文建议译法 | 说明 |
| --- | --- | --- |
| sequence transduction | 序列转导 | 输入序列到输出序列的转换，如翻译 |
| recurrence | 循环结构 | RNN 式逐步传递 |
| convolution | 卷积 | CNN 式局部窗口计算 |
| self-attention | 自注意力 | 同一序列内部互相关注 |
| scaled dot-product attention | 缩放点积注意力 | Transformer 的基础 attention 形式 |
| multi-head attention | 多头注意力 | 多组 attention 并行 |
| positional encoding | 位置编码 | 注入 token 顺序 |
| residual connection | 残差连接 | 输入与子层输出相加 |
| layer normalization | 层归一化 | 稳定训练 |
| label smoothing | 标签平滑 | 正则化，避免模型过度自信 |
| BLEU | BLEU 分数 | 机器翻译评价指标 |

## 继续阅读

- 原论文 arXiv：https://arxiv.org/abs/1706.03762
- Google Research 论文页：https://research.google/pubs/attention-is-all-you-need/
- The Annotated Transformer：http://nlp.seas.harvard.edu/annotated-transformer/
- Illustrated Transformer：https://jalammar.github.io/illustrated-transformer/

