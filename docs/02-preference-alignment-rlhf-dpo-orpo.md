# RLHF、DPO、ORPO 是啥，有什么特点和优缺点

更新时间：2026-06-18

RLHF、DPO、ORPO 都属于偏好对齐方法。它们解决的问题不是“让模型学会语言”，而是让已经预训练过的模型更符合人类偏好：更有帮助、更听指令、更安全、更少胡编、更像一个可用助手。

一句话：

- RLHF：先训练奖励模型，再用强化学习优化语言模型。
- DPO：把偏好学习直接改写成一个分类式损失，绕过显式奖励模型和 PPO。
- ORPO：把 SFT 和偏好优化合在一个阶段里做，并且不需要参考模型。

## 背景：为什么需要偏好对齐

预训练语言模型的目标通常是 next-token prediction：给定前文，预测下一个 token。这个目标能学到语言、知识、代码和推理模式，但不保证模型会：

- 遵循用户指令。
- 给出有帮助的答案。
- 拒绝危险请求。
- 在不知道时承认不确定。
- 使用人类偏好的语气和结构。

所以现代聊天模型通常经历：

```text
Pretraining -> SFT -> Preference alignment -> Safety/eval/部署优化
```

SFT 是 supervised fine-tuning，用“指令 -> 理想回答”的示范数据训练模型。偏好对齐则使用“同一个问题下，回答 A 比回答 B 更好”这样的偏好数据。

## 偏好数据长什么样

典型偏好样本：

```text
prompt: 请解释 Transformer 的 self-attention
chosen: 一个清楚、准确、有结构的回答
rejected: 一个含糊、错误或不符合要求的回答
```

偏好数据不要求人类写出完美答案，只要求判断哪个更好。这通常比从零撰写高质量示范更容易扩展。

## RLHF

RLHF 是 Reinforcement Learning from Human Feedback。InstructGPT/ChatGPT 早期路线里最典型的 RLHF 流程大致是：

1. 收集人类示范数据，做 SFT。
2. 对同一 prompt 采样多个模型回答，让标注者排序或二选一。
3. 用偏好数据训练 reward model。
4. 用强化学习算法优化语言模型，让它最大化 reward model 给出的分数，同时通过 KL 惩罚避免偏离原模型太远。

常见优化算法是 PPO。

### RLHF 的特点

RLHF 的核心思想是：人类不直接写损失函数，而是给偏好反馈；系统学习一个奖励函数，再让模型朝高奖励行为移动。

它有三个模型/角色：

- Policy model：要被优化的语言模型。
- Reward model：根据 prompt 和回答打分。
- Reference model：作为锚点，防止 policy 偏离太远。

### RLHF 的优点

- 表达能力强：可以把复杂偏好压进 reward model。
- 历史验证充分：InstructGPT 证明了它能显著改善指令遵循和人类偏好。
- 可组合安全目标：有机会把 helpfulness、harmlessness、truthfulness 等偏好纳入训练。
- 适合复杂反馈：排序、打分、多维偏好都可以转成 reward。

### RLHF 的缺点

- 工程复杂：要训练 reward model，还要跑 RL。
- 稳定性难：PPO 训练容易受超参数、KL、reward scale 影响。
- 成本高：需要在线采样、奖励评估、策略更新。
- reward hacking：模型可能学会讨好 reward model，而不是真正变好。
- 标注偏差：人类偏好会带入标注者文化、风格、安全策略和任务分布偏差。

### 什么时候用 RLHF

适合：

- 大厂级别基础模型训练。
- 有足够标注、训练、评估和安全团队。
- 偏好目标复杂，且值得承担 RL 复杂度。

不适合：

- 小团队快速微调。
- 数据量较小、预算有限、缺少训练基础设施。
- 只想让模型在某个垂直风格上略微更好。

## DPO

DPO 是 Direct Preference Optimization。它的出发点是：标准 RLHF 目标可以通过数学变换改写，不必显式训练 reward model，也不必使用 PPO。DPO 直接用 chosen/rejected 偏好对训练 policy model。

简化理解：

```text
让模型更倾向 chosen，少倾向 rejected；
同时不要离 reference model 太远。
```

DPO 仍然通常需要一个 reference model，往往是 SFT 后的模型副本。

### DPO 的特点

DPO 看起来更像普通监督学习：给定 prompt、chosen、rejected，算一个偏好损失，然后反向传播。它把“奖励模型 + 强化学习”的复杂流水线压缩成一个直接优化步骤。

### DPO 的优点

- 简单：不需要单独训练 reward model。
- 稳定：训练过程更像分类/对比学习，少了 PPO 的不稳定因素。
- 成本低：不用在训练中反复采样和跑 RL loop。
- 易复现：开源社区和小团队更容易落地。
- 效果强：DPO 论文中在摘要、情感控制、单轮对话等任务上达到或超过 PPO 式 RLHF 的表现。

### DPO 的缺点

- 依赖偏好数据质量：chosen/rejected 如果噪声大，模型会直接学偏。
- 参考模型仍有成本：训练时要计算 reference logprob。
- 对偏好强度表达有限：普通 DPO 只知道 chosen 比 rejected 好，不天然知道好多少。
- 可能过拟合风格：如果数据偏单一，模型会学到固定语气或模板。
- 多轮、工具、复杂安全策略可能仍需要更复杂的训练和 eval。

### 什么时候用 DPO

适合：

- 小到中等规模模型的对齐微调。
- 开源模型做指令风格、领域偏好、安全偏好优化。
- 已经有 SFT 模型和偏好对数据。
- 想要比 RLHF 更简单的训练管线。

不适合：

- 缺少可靠 rejected/chosen 数据。
- 希望精细建模多维连续奖励。
- 需要在环境中多步交互学习的任务。

## ORPO

ORPO 是 Odds Ratio Preference Optimization。它的目标是进一步简化流程：不要单独的 SFT 阶段加偏好优化阶段，也不要 reference model，而是在一个单体损失里同时做“学会 chosen 回答”和“压低 rejected 回答”。

ORPO 的核心思想：

```text
SFT loss 让模型学 chosen；
odds ratio penalty 让模型区分 chosen 和 rejected。
```

也就是说，它把“模仿好答案”和“偏好好答案”放在同一次训练里。

### ORPO 的特点

ORPO 是 reference-model-free。相比 DPO，它不需要每步拿 reference model 算 chosen/rejected 的 logprob。这让训练更省显存和算力，也让流程更短。

### ORPO 的优点

- 流程最简：一个阶段完成 SFT + preference alignment。
- 不需要参考模型：训练资源更省。
- 不需要 reward model：工程复杂度低。
- 适合开源微调：对资源有限团队更友好。
- 数据利用直接：chosen 用来做 SFT，rejected 用来提供偏好对比。

### ORPO 的缺点

- 方法较新：生产经验和边界条件没有 RLHF/DPO 那么充分。
- 对超参数敏感：偏好项权重太大可能伤害语言建模能力，太小又对齐不足。
- 不适合所有数据形态：如果 chosen 本身质量不高，把 SFT 和偏好优化绑在一起会放大问题。
- 缺少 reference 约束：没有参考模型锚点，训练漂移需要靠数据、正则和 eval 控制。

### 什么时候用 ORPO

适合：

- 资源有限的开源模型微调。
- 已经有 prompt/chosen/rejected 三元组。
- 希望用一个训练阶段完成指令微调和偏好优化。
- 快速实验不同数据集和风格对齐。

不适合：

- 对稳定性和可审计性要求极高的基础模型训练。
- 数据质量不稳定，chosen 本身不值得强模仿。
- 希望保留强 reference anchor 的场景。

## 三者对比

| 方法 | 是否需要 reward model | 是否需要 reference model | 是否需要 RL/PPO | 工程复杂度 | 典型优势 |
| --- | --- | --- | --- | --- | --- |
| RLHF | 需要 | 通常需要 | 通常需要 | 高 | 表达复杂偏好，历史验证充分 |
| DPO | 不需要 | 通常需要 | 不需要 | 中 | 稳定、简单、效果强 |
| ORPO | 不需要 | 不需要 | 不需要 | 低 | 单阶段、资源省、易微调 |

## 如何选择

如果你是基础模型团队：

- 有大量标注、训练基础设施和安全评估能力，可以考虑 RLHF 或 RLHF 变体。
- 对稳定性、可解释训练管线、快速迭代有要求，可以把 DPO 类方法作为主力或对照实验。

如果你是应用团队或开源微调用户：

- 优先考虑 DPO/ORPO。
- 数据比算法更关键：高质量 chosen/rejected 往往比换一个新损失函数更重要。
- 每次训练都要做 eval：通用能力、安全拒答、领域任务、风格偏好、工具调用、长上下文都可能受影响。

如果你只是使用 API：

- 你不需要自己做 RLHF/DPO/ORPO。
- 更重要的是设计好系统提示词、工具、RAG、评测集和人工审核流程。

## 常见误解

### 误解一：RLHF 就等于让人类实时训练模型

不是。人类通常先提供示范或偏好标注，模型离线训练。在线产品中的用户反馈是否进入训练，还取决于产品策略、隐私政策和训练流程。

### 误解二：DPO 是 RLHF 的低配版

不准确。DPO 是对 RLHF 目标的一种直接优化形式，在很多任务上效果很强。它的优势不是“便宜凑合”，而是把复杂优化问题改写得更容易训练。

### 误解三：ORPO 不需要 SFT

ORPO 不是丢掉 SFT，而是把 SFT 风格的负对数似然项和偏好项合在一起。

### 误解四：偏好对齐一定让模型更聪明

偏好对齐主要改变行为分布和回答风格，不等于凭空增加知识。数据和训练不当时，还可能损伤数学、代码、事实性或创造力。

## 实践建议

- 先做 SFT 基线，再做 DPO/ORPO 对照。
- 偏好数据要覆盖真实产品问题，不要只用公开聊天偏好数据。
- rejected 不应只是胡乱答案，最好是模型真实容易犯的错误。
- 建立固定 eval：胜率、人类偏好、事实性、安全、拒答边界、工具调用成功率。
- 关注长度偏差：偏好模型和人工标注都可能偏爱更长答案。
- 上线前做回归：对齐训练经常“这里变好，那里变坏”。

## 继续阅读

- InstructGPT/RLHF：Training language models to follow instructions with human feedback：https://arxiv.org/abs/2203.02155
- DPO：Direct Preference Optimization: Your Language Model is Secretly a Reward Model：https://arxiv.org/abs/2305.18290
- ORPO：ORPO: Monolithic Preference Optimization without Reference Model：https://arxiv.org/abs/2403.07691

