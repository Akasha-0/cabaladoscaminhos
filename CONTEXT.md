# Cabala dos Caminhos — Índice Central

## Visão Geral do Projeto

**Cabala dos Caminhos** é uma plataforma de tecnologia espiritual que correlaciona múltiplos sistemas místicos ancestrais — Cabala, Ifá, Astrologia, Numerologia, Tarot, I Ching, Tantra e Chakras — para fornecer autoconhecimento unificado e práticas diárias.

O produto principal é o **Akasha** — um oráculo vivo mobile-first que entrega diagnóstico unificado, ritual diário e agente conversacional com IA.

---

## Estrutura do Monorepo

```
cabaladoscaminhos/
├── CONTEXT.md                    ← Este arquivo (índice central)
├── AGENTS.md                     ← Regras para agentes de IA
├── CLAUDE.md                     ← Diretrizes comportamentais
├── README.md                     ← Visão geral do projeto
├── .trae/specs/                  ← Histórico de especificações
├── docs/                         ← Documentação técnica
├── memory/                       ← Histórico de ciclos de desenvolvimento
├── packages/                     ← Motores espirituais agnósticos
│   ├── core-astrology/           ← Swiss Ephemeris, mapa natal, trânsitos
│   ├── core-cabala/              ← Caminho de Vida, sefirot
│   ├── core-iching/              ← Hexagramas, bagua
│   ├── core-odus/                ← Odús de Ifá, Merindilogun
│   └── core-tantra/              ← 11 Corpos Espirituais
├── apps/akasha-portal/          ← Aplicação principal (Next.js)
├── grimoire/                     ← Conteúdo sagrado (Markdown)
├── tests/                        ← Suite de testes
└── prisma.config.ts              ← Schema do banco de dados
```

---

## Como Navegar

### Specs (`.trae/specs/`)
- `akasha-v0.0.7/` — Especificação atual de desenvolvimento
- Cada versão contém: `spec.md`, `tasks.md`, `checklist.md`

### Documentação (`docs/`)
| Arquivo | Conteúdo |
|---------|----------|
| `01_product-brief.md` | Visão de produto Akasha |
| `02_prd.md` | Requisitos detalhados |
| `03_architecture-spec.md` | Arquitetura técnica |
| `04_data-model.md` | Modelo de dados |
| `05_uiux-spec.md` | Especificação UI/UX |
| `06_ai-engine-spec.md` | Motor de IA e síntese |
| `08_roadmap.md` | Roadmap atual |
| `25_visao-akasha.md` | Visão completa do Akasha |
| `26_identidade-akasha.md` | Identidade visual e verbal |

### Memória (`memory/`)
- `cycle-[NNN].md` — Ciclos de desenvolvimento (489-516+)
- `cycle-[NNN]-review.md` — Revisões de ciclo

### Arquitetura de 5 Camadas (`apps/akasha-portal/src/`)
- `app/` — Next.js App Router (páginas e API routes)
- `components/` — Componentes React (UI, mapa, astrologia)
- `lib/` — Core libraries (engines, AI, Prisma client)
- `hooks/` — React hooks customizados
- `types/` — Definições TypeScript

---

## Stack Tecnológica

| Categoria | Tecnologia |
|-----------|------------|
| Framework | Next.js 16 (App Router + Turbopack) |
| Linguagem | TypeScript 5 (strict) |
| UI | Tailwind CSS 4 + shadcn/ui |
| Database | Prisma 7 + PostgreSQL + pgvector |
| Cache | Redis |
| Auth | Supabase SSR + JWT |
| IA | OpenAI API + Ollama (embeddings locais) |
| Testing | Vitest + Playwright |
| Payments | Stripe |
| Deploy | Docker + PM2 (VPS Linux) |

---

## Como Verificar Status do Projeto

### Execução de Testes
```bash
pnpm test:run          # Modo CI (sem watch)
pnpm test              # Com UI interativa
```

### Verificação de Tipos
```bash
pnpm typecheck
```

### Lint
```bash
pnpm lint
```

### Quality Gates
```bash
pnpm quality
```

### Análise de Código Morto
```bash
pnpm fallow
```

### Histórico do Git
```bash
git log --oneline -15          # Últimos commits
git tag --sort=-creatordate | head -5  # Tags recentes
```

---

## Padrão de Versionamento

| Tipo | Formato | Exemplo |
|------|---------|---------|
| Specs | `akasha-vX.Y.Z` | `akasha-v0.0.7` |
| Tags Git | `vX.Y.Z` | `v1.2.3` |
| Ciclos | `cycle-[NNN]` | `cycle-516` |

---

## Fluxo de Desenvolvimento

1. **Ler spec atual** em `.trae/specs/akasha-vX.Y.Z/spec.md`
2. **Consultar documentação** em `docs/architecture-spec.md` para estrutura
3. **Implementar** seguindo a arquitetura de 5 camadas
4. **Verificar** com `pnpm test:run && pnpm typecheck && pnpm lint`
5. **Commit** atômico por tarefa completada

---

## Arquitetura em 3 Camadas (Motores de IA)

```
┌─────────────────────────────────────────────┐
│  CAMADA 1 — Motor Determinístico            │
│  packages/core-* (Swiss Ephemeris, cálculos)│
│  Precisão matemática, sem IA                │
├─────────────────────────────────────────────┤
│  CAMADA 2 — Grafo de Conhecimento           │
│  Cruzamento de correspondências            │
│  (odú ↔ planeta ↔ chakra ↔ tarô)           │
├─────────────────────────────────────────────┤
│  CAMADA 3 — Síntese com IA (RAG)           │
│  LLM + Grimório (pgvector + Ollama local)  │
│  Texto hiper-personalizado e fiel à tradição│
└─────────────────────────────────────────────┘
```

---

## Arquitetura de 5 Camadas (Aplicação)

```
┌──────────────────────────────────────────────┐
│  interface/     — Rotas, actions, API       │
├──────────────────────────────────────────────┤
│  application/    — Casos de uso             │
├──────────────────────────────────────────────┤
│  domain/         — Lógica pura (sem I/O)     │
│  └── domain/types/ — Tipos compartilhados   │
├──────────────────────────────────────────────┤
│  infrastructure/ — Prisma, Redis, external  │
├──────────────────────────────────────────────┤
│  shared/         — Utils, constants         │
└──────────────────────────────────────────────┘
```

> **Padrão de Tipos:** Tipos usados por múltiplas camadas devem residir em `domain/types/`. Ver `docs/03_architecture-spec.md` e ADR (T10).

---

## Links Úteis

- **Site:** https://cabaladoscaminhos.com
- **Documentação:** `docs/`
- **Progresso:** `PROGRESS.md`
- **Contributing:** `CONTRIBUTING.md`
