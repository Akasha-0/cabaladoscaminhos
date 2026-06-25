import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// Docusaurus 3.x configuration for Akasha Portal documentation site.
// Theme: dark by default (consistent with Akasha Portal app).
// i18n: default PT-BR, alternate EN.
const config: Config = {
  title: 'Akasha Portal Docs',
  tagline:
    'Documentação técnica do Akasha Portal — 5 Pilares, Mentor AI, MCP, RAG, e arquitetura do monorepo. / Technical documentation for the Akasha Portal — Five Pillars, Mentor AI, MCP, RAG, and monorepo architecture.',

  favicon: 'img/favicon.ico', // 16x16 gold-on-dark Akasha dot

  // Production URL — used by sitemap, canonical links, social previews.
  // GitHub Pages deployment will use this baseUrl.
  url: 'https://akasha-0.github.io',
  baseUrl: '/cabaladoscaminhos/',

  // GitHub Pages organization / user that owns the project.
  organizationName: 'Akasha-0',
  projectName: 'cabaladoscaminhos',

  // Always render in the latest stable Docusaurus version (no onBuild deprecation
  // warnings on dev/start).
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // i18n: PT-BR is the default (project is PT-BR first); EN is the alternate.
  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR', 'en'],
    localeConfigs: {
      'pt-BR': {
        label: 'Português (Brasil)',
        direction: 'ltr',
        htmlLang: 'pt-BR',
        calendar: 'gregory',
      },
      en: {
        label: 'English',
        direction: 'ltr',
        htmlLang: 'en-US',
        calendar: 'gregory',
      },
    },
  },

  // Static assets route.
  staticDirectories: ['static'],

  // Preset: classic (docs + blog + pages). We only use docs for now.
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Keep MD v3 features (admonitions, Mermaid via remark).
          remarkPlugins: [],
          rehypePlugins: [],
          routeBasePath: '/',
          // Edit URL: link to GitHub source for community contributions.
          editUrl:
            'https://github.com/Akasha-0/cabaladoscaminhos/tree/main/docs-site/',
        },
        blog: false, // Wave 15.5 may enable changelog as blog posts
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.png',
    // Dark mode default — matches Akasha Portal visual identity.
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },

    // Code syntax highlighting.
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json', 'tsx', 'typescript', 'yaml'],
    },

    // Mermaid diagram rendering (auto-renders ```mermaid blocks in MD).
    // (Note: Mermaid plugin is set up via the docs plugin options below.)

    navbar: {
      title: 'Akasha Portal',
      logo: {
        alt: 'Akasha Portal logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'mainSidebar',
          position: 'left',
          label: { 'pt-BR': 'Docs', en: 'Docs' },
        },
        { to: '/api/intro', label: { 'pt-BR': 'API', en: 'API' }, position: 'left' },
        {
          href: 'https://github.com/Akasha-0/cabaladoscaminhos',
          label: 'GitHub',
          position: 'right',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
      ],
    },

    footer: {
      style: 'dark',
      links: [
        {
          title: { 'pt-BR': 'Documentação', en: 'Documentation' },
          items: [
            {
              label: { 'pt-BR': 'Introdução', en: 'Introduction' },
              to: '/',
            },
            {
              label: { 'pt-BR': 'Guia de Início', en: 'Getting Started' },
              to: '/getting-started',
            },
          ],
        },
        {
          title: { 'pt-BR': 'Projeto', en: 'Project' },
          items: [
            {
              label: 'Akasha Portal',
              href: 'https://github.com/Akasha-0/cabaladoscaminhos',
            },
            {
              label: 'AGENTS.md',
              href:
                'https://github.com/Akasha-0/cabaladoscaminhos/blob/main/AGENTS.md',
            },
          ],
        },
        {
          title: { 'pt-BR': 'Comunidade', en: 'Community' },
          items: [
            {
              label: 'GitHub Issues',
              href: 'https://github.com/Akasha-0/cabaladoscaminhos/issues',
            },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Akasha Portal. Licenciado sob MIT. / Licensed under MIT.`,
    },
  },

  // Plugins.
  plugins: [],

  // Markdown features: enable MD v3 admonitions, tables, code blocks.
  markdown: {
    format: 'detect',
    mermaid: true, // auto-render Mermaid diagrams in MD (F-226 schema)
    editUrl:
      'https://github.com/Akasha-0/cabaladoscaminhos/tree/main/docs-site/',
  },

  // Head metadata.
  headTags: [
    {
      tagName: 'meta',
      attributes: {
        name: 'description',
        content:
          'Documentação técnica do Akasha Portal — 5 Pilares, Mentor AI, MCP, RAG. PT-BR + EN.',
      },
    },
  ],

  // Custom fields exposed via useDocusaurusContext().
  customFields: {
    projectVersion: '0.1.0',
    portalRepo: 'https://github.com/Akasha-0/cabaladoscaminhos',
  },
};

export default config;
