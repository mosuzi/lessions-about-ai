// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'AI 使用者路线图',
  tagline: '给前端开发者的现代 AI 高阶使用手册',
  favicon: 'img/dino.svg',

  url: 'https://example.com',
  baseUrl: '/',

  organizationName: 'local',
  projectName: 'ai-modern-guide-blog',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          showLastUpdateTime: false,
        },
        blog: {
          routeBasePath: 'blog',
          showReadingTime: true,
          blogTitle: '阅读笔记',
          blogDescription: '围绕 AI 工具使用方式的短笔记',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      metadata: [
        {
          name: 'keywords',
          content: 'AI, Codex, Claude Code, Cursor, MCP, skills, subagents, frontend',
        },
      ],
      navbar: {
        title: 'AI 使用者路线图',
        logo: {
          alt: 'Dino logo',
          src: 'img/dino.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'guideSidebar',
            position: 'left',
            label: '手册',
          },
          {to: '/blog', label: '笔记', position: 'left'},
          {
            href: 'https://docusaurus.io/',
            label: 'Docusaurus',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'light',
        links: [
          {
            title: '路线',
            items: [
              {label: '总览', to: '/'},
              {label: '前端 AI 工作流', to: '/frontend-ai-workflow'},
              {label: 'Skills', to: '/skills-agent-workflow'},
            ],
          },
          {
            title: '关键概念',
            items: [
              {label: 'Subagents', to: '/subagents'},
              {label: 'MCP', to: '/mcp-model-context-protocol'},
              {label: 'Evals', to: '/evals'},
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} AI 使用者路线图.`,
      },
      prism: {
        theme: require('prism-react-renderer').themes.github,
        darkTheme: require('prism-react-renderer').themes.dracula,
      },
    }),
};

module.exports = config;
