# Evals 是啥

更新时间：2026-06-18

evals 是 evaluations 的简称，在 AI 应用里可以理解为“评测体系”。它不是单个指标，也不是只跑一次 benchmark，而是一套持续回答这个问题的方法：

```text
我改了 prompt、模型、RAG、工具、agent 流程或安全策略之后，系统到底变好了还是变坏了？
```

如果用前端工程类比：

- 单元测试检查函数有没有坏。
- E2E 测试检查用户流程有没有坏。
- 监控告警检查线上有没有坏。
- evals 检查 AI 输出质量、工具调用、事实性、安全性和用户体验有没有坏。

没有 evals，AI 应用的迭代很容易变成“我试了几个例子，感觉还行”。这在 demo 阶段可以，在生产阶段会很危险。

## 为什么 AI 应用特别需要 evals

传统软件里，同一个输入通常得到同一个输出。LLM 应用不一样：

- 模型有随机性。
- 模型版本会更新。
- prompt 的小改动可能造成大行为变化。
- RAG 检索结果会随数据变化。
- agent 会走不同工具路径。
- 用户输入分布远比测试样例复杂。
- 输出质量很多时候不是简单的对/错。

所以 AI 应用需要一个专门的质量回路：

```text
收集样例 -> 定义好坏标准 -> 跑系统 -> 自动/人工评分 -> 对比版本 -> 修复问题 -> 继续收集线上失败案例
```

## evals 评什么

一个成熟的 eval 集合通常不只评“答案对不对”，而是分层评估。

### 任务正确性

模型有没有完成任务。

例子：

- 客服工单分类是否选对类别。
- 从合同里抽取的金额是否正确。
- SQL 是否查到了正确结果。
- 代码补丁是否通过测试。
- 摘要是否覆盖关键事实。

适合指标：

- exact match
- accuracy
- F1
- pass rate
- semantic similarity
- reference-based LLM judge

### 格式和协议

输出是否符合系统契约。

例子：

- JSON 是否能 parse。
- 是否符合 JSON Schema。
- tool call 参数是否完整。
- 是否只返回允许的枚举值。
- 是否没有泄露中间 chain-of-thought。

适合指标：

- schema validation
- regex/rule check
- parser check
- enum match

这类 eval 最好用代码写，稳定、便宜、可复现。

### 事实性和依据

模型是否基于证据回答，有没有幻觉。

例子：

- RAG 答案是否被引用材料支持。
- 回答是否包含不存在的政策条款。
- 数字、日期、姓名是否正确。
- 不知道时是否承认不知道。

适合指标：

- groundedness
- citation precision/recall
- answer correctness against ground truth
- hallucination rate
- not-attempted rate

事实性 eval 的关键是要有可信参考：标准答案、检索文档、数据库结果或人工标注。

### 安全和合规

模型是否违反产品、安全、隐私和法律边界。

例子：

- 是否输出个人敏感信息。
- 是否提供危险操作步骤。
- 是否绕过系统限制。
- 是否遵守未成年人、医疗、金融、法律等高风险场景的政策。

适合指标：

- policy violation rate
- refusal correctness
- jailbreak success rate
- PII leakage rate
- toxicity/safety classifier score

安全 eval 通常要包含红队样例和真实线上风险样例。

### 用户体验

回答是否好用。

例子：

- 是否简洁。
- 是否结构清楚。
- 是否符合产品语气。
- 是否主动问必要澄清问题。
- 是否避免无意义废话。

适合指标：

- human rating
- pairwise preference
- LLM-as-judge
- task completion score
- user feedback

这类指标主观性强，最好配明确 rubric。

### Agent 和工具链行为

如果系统会调用工具，eval 还要评过程。

例子：

- 是否调用了正确工具。
- 是否传了正确参数。
- 是否在工具失败后重试或降级。
- 是否避免不必要的昂贵调用。
- 是否在危险动作前请求确认。
- 是否完成多步任务而不是中途放弃。

适合指标：

- tool call accuracy
- tool argument correctness
- task success rate
- step count
- latency
- cost
- trace-level human review

对 agent 来说，只看最终回答经常不够。过程 trace 也要纳入 eval。

## evals 的几种常见形态

### 离线 eval

离线 eval 是上线前在固定数据集上跑评测。

典型用途：

- 比较两个 prompt。
- 比较两个模型。
- 检查一次改动是否引入回归。
- 决定是否上线。

数据通常长这样：

```jsonl
{"input":{"question":"用户取消订单后多久退款？"},"expected":{"answer_contains":["退款","3-5 个工作日"],"must_not_contain":["立即到账"]},"meta":{"topic":"refund","difficulty":"easy"}}
{"input":{"question":"帮我删除账号"},"expected":{"tool":"create_support_ticket","requires_confirmation":true},"meta":{"topic":"account","difficulty":"medium"}}
```

离线 eval 的优点是可控、可复现、适合 CI。缺点是覆盖面取决于数据集，可能跟真实用户分布脱节。

### 在线 eval

在线 eval 是对真实生产流量做监控和抽样评估。

典型用途：

- 发现线上新问题。
- 监控模型版本变化后的质量波动。
- 收集失败案例，反哺离线数据集。
- 发现长尾用户输入。

在线 eval 往往没有标准答案，只能使用：

- 用户反馈。
- 人工抽审。
- LLM-as-judge。
- 安全/格式/延迟/成本等可自动检测指标。
- trace 异常，例如工具报错、循环过长、空回答。

### 回归 eval

回归 eval 专门防止“之前修好的问题又坏了”。

每次线上事故、用户投诉、红队绕过、prompt 回归，都应该沉淀成一个或多个测试样例。久而久之，它会变成 AI 应用的质量护城河。

### 红队 eval

红队 eval 专门找系统边界问题。

例子：

- prompt injection。
- jailbreak。
- 数据泄露。
- 越权工具调用。
- 恶意文件或网页内容诱导。
- 让 agent 执行危险命令。

红队 eval 不追求“平均分好看”，而是追求暴露最坏情况。

### 人工 eval

人工 eval 是让人按 rubric 审核输出。它慢、贵，但在很多主观任务里仍然是金标准。

适合：

- 写作质量。
- 复杂多轮对话。
- 产品语气。
- 医疗/法律/金融等高风险答案抽审。
- LLM judge 的校准数据。

## evaluator / grader 是啥

eval 数据集定义“考题”，evaluator 或 grader 定义“怎么判分”。

常见 evaluator：

### 代码评估器

用确定性代码判分。

适合：

- JSON schema。
- 分类标签 exact match。
- 字符串包含/不包含。
- 单元测试是否通过。
- SQL 查询结果是否一致。
- 工具参数是否满足规则。

优点是稳定、便宜、可复现。能用代码评的，优先用代码评。

### LLM-as-judge

用另一个 LLM 当裁判。

适合：

- 摘要质量。
- 回答是否充分。
- 是否符合语气。
- 是否基于参考材料。
- 两个回答哪个更好。

缺点：

- 裁判模型也会错。
- 可能偏爱更长、更自信的回答。
- 对 prompt 和 rubric 敏感。
- 不同模型裁判结论可能不同。

建议：

- 给清晰 rubric。
- 使用少量示例校准。
- 让 judge 输出结构化分数和简短理由。
- 用人工抽审验证 judge 是否可靠。
- 不要把 LLM judge 当绝对真理。

### 人工评估器

人类按评分表判分。

适合：

- 高风险任务。
- 主观质量。
- 构建 gold set。
- 审核 LLM judge 的一致性。

缺点是成本高、速度慢、标注者之间可能不一致。所以 rubric 要具体，最好做双人标注和冲突仲裁。

### 成对比较

不直接给一个回答打绝对分，而是比较 A 和 B 哪个更好。

适合：

- prompt A/B test。
- 模型升级评估。
- 文案、摘要、解释质量。

很多时候，人更容易判断“哪个更好”，而不是给单个答案打 7 分还是 8 分。

## 一个最小 eval 应该包含什么

至少包含五个东西：

1. 任务定义：系统应该做什么。
2. 测试样例：输入、参考答案或期望行为。
3. 评分标准：怎么判断通过。
4. 运行方式：跑哪个模型、prompt、工具、RAG 配置。
5. 报告方式：通过率、失败样例、成本、延迟、版本对比。

最小目录可以长这样：

```text
evals/
  datasets/
    refund_faq.jsonl
    tool_calling.jsonl
    jailbreak.jsonl
  evaluators/
    schema_check.ts
    exact_match.ts
    llm_judge_groundedness.ts
  runs/
    2026-06-18-prompt-v3-vs-v4.md
```

## 前端/AI 应用里的 eval 示例

假设你做了一个“客服知识库问答”。

### 样例数据

```json
{
  "input": {
    "question": "会员退款多久到账？",
    "retrieved_docs": [
      "会员退款通常在审核通过后 3-5 个工作日原路退回。"
    ]
  },
  "expected": {
    "must_include": ["3-5 个工作日", "原路退回"],
    "must_not_include": ["立即到账", "无法退款"]
  },
  "meta": {
    "topic": "refund",
    "source": "real_user_trace",
    "risk": "medium"
  }
}
```

### 代码评估器

```ts
type EvalCase = {
  expected: {
    must_include?: string[];
    must_not_include?: string[];
  };
};

export function checkAnswer(output: string, item: EvalCase) {
  const missing = (item.expected.must_include ?? []).filter(
    (text) => !output.includes(text),
  );
  const forbidden = (item.expected.must_not_include ?? []).filter(
    (text) => output.includes(text),
  );

  return {
    pass: missing.length === 0 && forbidden.length === 0,
    score: missing.length === 0 && forbidden.length === 0 ? 1 : 0,
    comment: JSON.stringify({ missing, forbidden }),
  };
}
```

这个评估器很朴素，但比“肉眼看几个回答”强很多。后续可以再加入语义匹配、引用检查、LLM judge 和人工抽审。

## evals 和 benchmark 的区别

benchmark 是公开考卷，例如 MMLU、HumanEval、GSM8K、SimpleQA。它适合回答：

```text
这个模型整体能力大概怎么样？
```

evals 更偏你的产品和任务，适合回答：

```text
这个系统在我的真实场景里能不能上线？
这次 prompt 改动有没有让退款问题回答变差？
这个 agent 会不会在工具失败后乱编？
```

公开 benchmark 可以参考，但不能代替业务 eval。因为你的用户、数据、工具、政策和失败成本都不同。

## evals 和普通测试的区别

普通测试通常有明确断言：

```text
输入 A -> 输出必须等于 B
```

AI eval 经常要处理模糊质量：

```text
输入 A -> 输出应该正确、完整、简洁、有依据、符合语气，并且不能违反政策
```

所以 evals 会同时使用：

- 精确断言。
- 规则检查。
- 语义比较。
- LLM judge。
- 人工评分。
- 线上反馈。

但原则不变：能确定性测试的部分，不要交给 LLM judge。

## 常见指标

### 质量指标

- accuracy：分类或明确答案正确率。
- pass rate：测试通过率。
- win rate：A/B 比较里新版本胜率。
- groundedness：回答是否由证据支持。
- relevance：是否答到用户问题。
- completeness：是否覆盖必要要点。
- refusal correctness：该拒绝时拒绝，不该拒绝时不拒绝。

### 工程指标

- latency：响应延迟。
- cost：token 和工具调用成本。
- tool success rate：工具调用成功率。
- parse failure rate：结构化输出解析失败率。
- retry rate：重试率。
- escalation rate：转人工比例。

### 线上指标

- thumbs up/down。
- 用户追问率。
- 用户放弃率。
- 任务完成率。
- 人工客服接管率。
- 事故/投诉率。

注意：线上业务指标很重要，但它们通常滞后、噪声大，不能单独替代离线 eval。

## 如何从 0 建一个 eval 体系

### 第一步：先写 10 到 20 个高质量样例

不要一开始追求几千条。先覆盖：

- 最常见问题。
- 最高风险问题。
- 之前出过错的问题。
- 边界条件。
- 恶意/异常输入。

每个样例都要写清楚期望行为。

### 第二步：先做确定性检查

优先做：

- JSON/schema 检查。
- required fields。
- enum 检查。
- 工具名和参数检查。
- 禁止词/必须词。
- 单元测试/编译检查。

这部分便宜而且可靠。

### 第三步：为主观质量加 rubric

例如客服回答可以这样打：

| 维度 | 0 分 | 1 分 | 2 分 |
| --- | --- | --- | --- |
| 正确性 | 错误或编造 | 部分正确 | 完全正确 |
| 完整性 | 缺关键步骤 | 覆盖部分 | 覆盖所有必要步骤 |
| 依据性 | 无依据 | 部分依据 | 完全由资料支持 |
| 语气 | 不符合品牌 | 勉强可用 | 清楚、礼貌、克制 |

rubric 越具体，人工和 LLM judge 越一致。

### 第四步：把失败案例沉淀成回归集

每次发现问题，都问：

```text
这个问题能不能变成一个 eval case？
```

如果可以，就加进去。否则下次还会以另一种形式回来。

### 第五步：接入 CI 或发布门禁

上线前至少比较：

- 当前线上版本。
- 新 prompt/新模型/新 RAG 配置。
- 核心 eval 集合。
- 高风险红队集合。

如果新版本整体分数高但关键风险样例失败，也不要直接上线。

### 第六步：接入线上 trace 和反馈

把真实运行记录变成后续 eval 的燃料：

- 用户点踩样例。
- 工具失败样例。
- 高延迟样例。
- 人工客服改写过的样例。
- 被安全策略拦截的样例。

离线 eval 和在线监控应该互相喂养。

## 常见坑

### 坑一：只看平均分

平均分可能掩盖高风险失败。一个医疗、金融、安全或权限相关样例失败，可能比 100 个闲聊样例成功更重要。

### 坑二：数据集被 prompt 过拟合

如果你反复根据同一批 eval 改 prompt，很容易把系统调成“会背考题”。要保留 holdout 集，线上继续收集新样例。

### 坑三：LLM judge 没有校准

LLM judge 看起来很方便，但要和人工标注对齐。否则它可能稳定地给错误答案高分。

### 坑四：只评最终答案，不评过程

agent 应用里，最终答案可能看起来对，但过程里多调用了危险工具、泄露了隐私、浪费了成本，或者靠运气撞对。

### 坑五：eval 数据没有版本管理

eval 数据、prompt、模型、工具版本、检索索引都要可追溯。否则看到分数变化时，很难知道是谁导致的。

### 坑六：没有负样例

只放正常用户问题不够。要加入：

- 错误前提。
- 缺少信息。
- 越权请求。
- prompt injection。
- 数据源矛盾。
- 模型应该拒绝或澄清的问题。

## 一套实用的 eval 分层

对大多数 AI 应用，可以按这个顺序建设：

| 层级 | 目标 | 方法 |
| --- | --- | --- |
| L0 smoke eval | 系统能跑通 | 5-10 个核心样例 |
| L1 contract eval | 输出符合协议 | schema、parser、工具参数检查 |
| L2 task eval | 任务结果正确 | 标准答案、规则、代码测试 |
| L3 quality eval | 回答质量好 | rubric、LLM judge、人工抽审 |
| L4 safety eval | 不越界 | 红队、安全分类器、策略检查 |
| L5 online eval | 线上持续稳定 | trace、用户反馈、抽样审核、告警 |

从 L0/L1 开始最划算。别一上来就搭复杂平台。

## 对 coding agent 的 eval

coding agent 的 eval 不应该只问“回答看起来对不对”，而应该跑真实仓库任务。

可以评：

- 是否能定位相关文件。
- 是否改对代码。
- 是否不破坏无关文件。
- 是否通过测试。
- 是否能根据测试失败继续修。
- 是否遵守权限和安全策略。
- 是否给出清楚的变更说明。

典型自动指标：

- patch applies。
- tests pass。
- lint pass。
- diff size。
- changed files allowlist。
- regression tests pass。

典型人工指标：

- 方案是否符合代码库风格。
- 是否引入隐藏风险。
- 是否需要更小改动。
- 是否漏了测试。

这也是为什么 coding agent 工作流里，eval、tracing、sandbox、review 都是同一个系统的一部分。

## 最小实践清单

做一个 AI 功能上线前，至少准备：

- 20 个真实或手写样例。
- 5 个高风险/红队样例。
- 1 个确定性评估器。
- 1 个人工或 LLM judge rubric。
- 1 份版本对比报告。
- 1 个失败样例归档机制。

每次改 prompt、模型、RAG、工具定义、系统策略，都跑一遍核心 eval。

## 继续阅读

- OpenAI Evals API 文档：https://developers.openai.com/api/docs/guides/evals
- OpenAI Evals 开源框架：https://github.com/openai/evals
- LangSmith Evaluation concepts：https://docs.langchain.com/langsmith/evaluation-concepts
- SimpleQA：Measuring short-form factuality in large language models：https://arxiv.org/abs/2411.04368
- A Survey on Evaluation of Large Language Models：https://arxiv.org/abs/2307.03109

