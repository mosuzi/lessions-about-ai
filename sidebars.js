// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  guideSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: '总览：AI 使用者路线',
    },
    {
      type: 'category',
      label: '现在就该读',
      collapsed: false,
      items: [
        'frontend-ai-workflow',
        'skills-agent-workflow',
        'subagents',
        'evals',
        'tool-calling-structured-output',
      ],
    },
    {
      type: 'category',
      label: '需要理解',
      collapsed: false,
      items: [
        'mcp-model-context-protocol',
        'agent-harness-runtime',
        'rag-retrieval-augmented-generation',
      ],
    },
    {
      type: 'category',
      label: '背景知识',
      collapsed: false,
      items: [
        'attention-is-all-you-need-reading-guide',
        'preference-alignment-rlhf-dpo-orpo',
        'numeric-precision-int-fp',
      ],
    },
  ],
};

module.exports = sidebars;
