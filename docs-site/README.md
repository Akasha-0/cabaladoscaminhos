# Akasha Portal — Documentation Site (Docusaurus 3.x)

Este diretório é o site de documentação pública do **Akasha Portal**,
construído com [Docusaurus 3.x](https://docusaurus.io/).

> **Por que `docs-site/` e não `docs/`?**
> O repositório já tem um diretório `/docs` que é o **vault interno**
> de documentação do projeto (ADRs, audits, specs, etc.). Para evitar
> conflito, este site Docusaurus vive em `/docs-site/` — sibling de
> `apps/`, `packages/` e `docs/`.

## Stack

- **Docusaurus 3.10.1** (Classic preset, MDX v3)
- **React 19**, **TypeScript 5.6**
- **Prism** syntax highlighting (Dracula theme no dark mode)
- **Mermaid** diagrams (built-in via `markdown.mermaid: true`)
- i18n: `pt-BR` (default) + `en`

## Quick start

Da raiz do monorepo:

```bash
# Install (uma vez)
pnpm install

# Dev server (porta 3001 por padrão)
pnpm docs:dev

# Build de produção
pnpm docs:build

# Servir build local
pnpm docs:serve
```

Ou diretamente em `docs-site/`:

```bash
cd docs-site
npm install            # ou pnpm install
npm run start          # PT-BR (default)
npm run start:en       # English
npm run start:all      # PT-BR + EN (multilingual switcher)
npm run build          # produção → build/
npm run typecheck      # tsc --noEmit
```

## Estrutura

```
docs-site/
├── docusaurus.config.ts      # Config principal (i18n, navbar, theme, SEO)
├── sidebars.ts               # Sidebar config (intro, getting-started, …)
├── tsconfig.json
├── package.json
├── docs/                     # Conteúdo (Markdown/MDX)
│   ├── intro.md              # Página inicial — 5 Pilares, quick start
│   ├── getting-started.md    # Setup local
│   ├── architecture/         # Wave 15.2 vai popular
│   │   └── intro.md          # Stub com diagrama Mermaid
│   ├── api/                  # Wave 15.3 vai popular
│   │   └── intro.md
│   └── contributing/         # Wave 15.4 vai popular
│       └── intro.md
├── src/
│   └── css/
│       └── custom.css        # Tema dark consistente com Akasha Portal
├── static/                   # Assets (logo, favicon, social-card)
│   └── img/
└── i18n/                     # Traduções (criadas por `npm run write-translations`)
```

## i18n

- **Default locale**: `pt-BR`
- **Alternate**: `en`
- O dropdown de locale no navbar permite alternar.
- Para adicionar uma nova tradução, rode:

```bash
cd docs-site
npm run write-translations -- --locale en
# Edite os arquivos em i18n/en/...
```

## Tema

- **Dark mode default** (`colorMode.defaultMode: 'dark'`)
- `respectPrefersColorScheme: true` — segue preferência do sistema
- Paleta: **Akasha ink** (deep) + **gold accent** (`#d4af37`)
- Veja `src/css/custom.css` para detalhes

## Deploy (GitHub Pages)

- `url`: `https://akasha-0.github.io`
- `baseUrl`: `/cabaladoscaminhos/`
- Para deploy:

```bash
cd docs-site
GIT_USER=Akasha-0 npm run deploy
```

(Requer `GIT_USER` configurado; a workflow CI será adicionada em Wave
posterior.)

## Status de cada seção

| Seção          | Wave    | Status      |
|----------------|---------|-------------|
| intro          | 15.1    | ✅ Pronto  |
| getting-started| 15.1    | ✅ Pronto  |
| architecture   | 15.2    | 🚧 Stub    |
| api            | 15.3    | 🚧 Stub    |
| contributing   | 15.4    | 🚧 Stub    |
| changelog      | 15.5    | ⏳ Aguardando |

## Links úteis

- [Docusaurus 3 docs](https://docusaurus.io/docs)
- [Markdown features](https://docusaurus.io/docs/markdown-features)
- [i18n tutorial](https://docusaurus.io/docs/i18n/tutorial)
- [Akasha Portal repo](https://github.com/Akasha-0/cabaladoscaminhos)
