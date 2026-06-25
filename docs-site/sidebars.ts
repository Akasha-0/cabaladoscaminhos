import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

/**
 * Sidebar configuration for Akasha Portal documentation.
 *
 * Category ids map to directory names under `docs/`:
 *  - intro                  → /
 *  - getting-started        → /getting-started
 *  - architecture           → /architecture/*
 *  - api                    → /api/*
 *  - contributing           → /contributing/*
 *
 * Wave 15.1 ships `intro` and `getting-started` populated; the rest are
 * reserved for Waves 15.2–15.4 and will be wired by adding `_category_.json`
 * files inside each directory.
 */
const sidebars: SidebarsConfig = {
  mainSidebar: [
    'intro',
    'getting-started',
    {
      type: 'category',
      label: { 'pt-BR': 'Arquitetura', en: 'Architecture' },
      collapsed: false,
      link: { type: 'generated-index', slug: '/architecture' },
      items: [], // populated by Wave 15.2
    },
    {
      type: 'category',
      label: { 'pt-BR': 'Referência da API', en: 'API Reference' },
      collapsed: false,
      link: { type: 'generated-index', slug: '/api' },
      items: [], // populated by Wave 15.3
    },
    {
      type: 'category',
      label: { 'pt-BR': 'Contribuindo', en: 'Contributing' },
      collapsed: false,
      link: { type: 'generated-index', slug: '/contributing' },
      items: [], // populated by Wave 15.4
    },
  ],
};

export default sidebars;
