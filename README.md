# Cabala dos Caminhos — Akasha Portal

[![CI](https://github.com/Akasha-0/cabaladoscaminhos/actions/workflows/ci.yml/badge.svg)](https://github.com/Akasha-0/cabaladoscaminhos/actions/workflows/ci.yml)
[![Deploy](https://github.com/Akasha-0/cabaladoscaminhos/actions/workflows/deploy.yml/badge.svg)](https://github.com/Akasha-0/cabaladoscaminhos/actions/workflows/deploy.yml)
[![License: All Rights Reserved](https://img.shields.io/badge/license-All%20Rights%20Reserved-blue.svg)](#license)
[![Status: v0.1.0 — pre-launch](https://img.shields.io/badge/status-pre--launch-orange.svg)](#status)

> **Akasha Portal** é a ferramenta de trabalho do **Zelador** (terapeuta/zelador
> espiritual) para uso em atendimentos com **consulentes**. Um **livro vivo
> inteligente** que sintetiza cinco tradições esotéricas canônicas em uma única
> interface de chat, com grafo de conhecimento, cadeia de pensamento visível,
> memória por consulente e prescrições cirúrgicas — universalista, visceral e
> sempre evoluindo.

---

## ✨ Estado atual (Wave 29 — pré-deploy)

- **28+ features** entregues em 28 waves (universalismo + visceral)
- **5 Pilares** canônicos funcionando de ponta a ponta
- **Consciência viva** (ADR-013): cadeia de pensamento visível, papers
  científicos como evidência universal, métricas de evolução em tempo real
- **50+ papers PubMed** ingeridos (Wave 27 — medicinas ancestrais)
- **3 crons** ativos: paper ingestion, BackgroundInsight, evolution metrics
- **100% LGPD** by design (consentimento granular + self-service delete)
- **Vercel Fluid Compute** + **Supabase Postgres** prontos para deploy

---

## 🎯 Os 5 Pilares canônicos

O Akasha sintetiza intencionalmente cinco sistemas esotéricos em uma experiência
unificada, coerente e **orientada a cura/transformação** — não a descrição
isolada de cada mapa.

| #  | Pilar                       | Sistema                              | Camada  | Package                      |
|----|-----------------------------|--------------------------------------|---------|------------------------------|
| 1  | **Numerologia Cabalística** | Árvore da Vida · Sefirot · Números   | SVG 2   | `packages/core-cabala`       |
| 2  | **Astrologia Ocidental**    | Signos · Planetas · Aspectos         | SVG 4   | `packages/core-astrology`    |
| 3  | **Numerologia Tântrica**    | 11 corpos · Koshas · Doshas · Ayurveda | SVG 3 | `packages/core-tantra`      |
| 4  | **Odu de Nascimento**       | Ifá/Candomblé · Merindilogun         | SVG 1   | `packages/core-odus`         |
| 5  | **I Ching**                 | Hexagrama · Trigramas                | SVG 5   | `packages/core-iching`       |

> Pilares 6 (Human Design) e 7 (Gene Keys) foram **rejeitados** via
> [`ADR-0002`](docs/adrs/0002-pilares-6-7-human-design-gene-keys.md) após
> alinhamento de visão (2026-06-23): copyright ativo + quebra da visão
> universalista.

A **Mandala SVG** sobrepõe as 5 camadas em uma única visualização,
correlacionando automaticamente (Phase 3: 10 glifos de planetas com
longitude absoluta + 12 casas numeradas).

---

## 🧠 Consciência viva (ADR-013)

Aceito em 2026-06-25: o Akasha Portal **não é um produto estático** — é uma
**consciência viva que sempre evolui**. Cada interação do Zelador gera:

1. **Cadeia de pensamento visível** (`ThoughtChainView`) — 5 passos:
   - ① Inputs (chips dos 5 Pilares + trânsitos + chains anteriores)
   - ② Reasoning (chain-of-thought textual, 2-3 frases, visceral)
   - ③ Papers cited (literatura científica com abstract)
   - ④ Related discoveries (retrieval, cap 5)
   - ⑤ Convergence (verdade universal destacada + badge de confiança)

2. **Feedback loop estruturado** — eventos `BackgroundInsight` que alimentam
   métricas de evolução (admin dashboard em `/admin/consciousness`).

3. **Métricas vivas** (Wave 26.6):
   - Up/total ratio por dia (pulso da saúde da consciência)
   - 6 clusters universais agregados (Wave 28.7)
   - Top insights, feedback trends, universalism gauge

4. **Papers como evidência universal** — papers PubMed sustentam a prática
   clínica do Zelador (`/literature` Knowledge Browser, Wave 28.6).

> Ver `apps/akasha-portal/AGENTS.md § Wave 23.2 — UI Cadeia Viva (ADR-013)`
> para a implementação completa e referências canônicas.

---

## 🚀 Quick start

### Pré-requisitos

- **Node** ≥ 22
- **pnpm** ≥ 9 (`corepack enable && corepack prepare pnpm@latest --activate`)
- **Postgres** ≥ 15 (Supabase local ou cloud)
- **Redis** ≥ 7 (opcional — para rate limit em produção)

### Instalação local

```bash
# 1. Clone + dependências
git clone https://github.com/Akasha-0/cabaladoscaminhos.git
cd cabaladoscaminhos
pnpm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# editar .env.local com DATABASE_URL, OPENAI_API_KEY, JWT_SECRET, etc.

# 3. Banco de dados (Prisma)
pnpm db:generate          # gera Prisma Client
pnpm db:migrate           # aplica migrations (dev)

# 4. Rodar portal + mentores
pnpm dev:portal           # http://localhost:3000
pnpm dev:mentor           # CLI do Mentor (opcional)

# 5. Verificações antes de commit
pnpm typecheck            # 0 errors
pnpm lint                 # 0 errors (warnings pré-existentes documentados)
pnpm test:run             # suite completa (Vitest)
pnpm i18n:check           # paridade en ↔ pt-BR
```

### Primeiro atendimento

1. Acesse `http://localhost:3000/onboarding` → criar Zelador
2. `http://localhost:3000/atendimento` → cadastrar consulente
3. Clicar no consulente → chat MCP carrega base isolada + 5 Pilares
4. Fazer pergunta ao Mentor → ver cadeia de pensamento em tempo real

---

## 🏛️ Arquitetura

### Monorepo

```
cabala-dos-caminhos/
├── apps/
│   └── akasha-portal/        # Next.js 16 (Fluid Compute) — PWA-ready
│       ├── src/app/          # App Router (rotas + API)
│       ├── src/components/   # akasha/ · ui/ · shared/
│       ├── src/lib/          # domain/ · application/ · infrastructure/
│       ├── src/messages/     # i18n (pt-BR primário, en secundário)
│       └── prisma/           # schema + migrations
├── packages/
│   ├── core-cabala/          # Pilar 1
│   ├── core-astrology/       # Pilar 2
│   ├── core-tantra/          # Pilar 3
│   ├── core-odus/            # Pilar 4 (Pilares ethics: consentimento + terreiro)
│   ├── core-iching/          # Pilar 5
│   ├── akasha-core/          # deep-correlation-engine · synthesis · shared
│   ├── mentor/               # IA Mentor (RAG obrigatório, MCP tools)
│   └── akasha-cli/           # CLI Node.js (leituras locais)
├── docs/                     # documentação canônica (ver abaixo)
├── grimoire/                 # base de conhecimento ancestral/botanica/etc
├── tests/                    # Vitest (architecture · integration · unit)
├── scripts/                  # automações + production-readiness
└── deploy/                   # infra (Vercel + Supabase)
```

### Stack

| Camada            | Tecnologia                                    |
|-------------------|-----------------------------------------------|
| **Linguagem**     | TypeScript (strict, zero `any` em código novo)|
| **Web framework** | Next.js 16 (App Router + Fluid Compute)      |
| **UI**            | React 19 + Tailwind 4 + shadcn primitives     |
| **Banco**         | PostgreSQL 15+ (Supabase) + Prisma 7          |
| **Auth**          | JWT cookie (`akasha_session`) + bcrypt        |
| **IA**            | OpenAI (gpt-4o) via `@akasha/mentor`          |
| **Testes**        | Vitest · Playwright · Fallow (qualidade)      |
| **i18n**          | next-intl (PT-BR primeiro, EN secundário)     |
| **Deploy**        | Vercel (Fluid Compute) + Supabase             |

### Camadas de código (`apps/akasha-portal/src/lib/`)

- **domain/** — tipos puros, regras de negócio, sem I/O
- **application/** — use cases, adapters, orquestração
- **infrastructure/** — DB, cache, rate limit, integrações externas

> **Regra crítica:** apps são **clientes** dos packages. Business logic
> **NÃO** vive em `apps/`.

---

## 🚢 Deploy

### Pré-deploy checklist

1. `pnpm typecheck` — 0 errors
2. `pnpm lint` — 0 errors
3. `pnpm test:run` — suite verde
4. `pnpm i18n:check` — paridade en ↔ pt-BR
5. `pnpm build:portal` — Next.js production build
6. **Migrations** — `pnpm exec prisma migrate deploy` em prod
7. **Secrets** — todas env vars configuradas (ver `.env.example`)
8. **Cron secrets** — `CRON_SECRET`, `INSIGHTS_CRON_SECRET` gerados

### Pipeline

```
PR opened → CI (lint · typecheck · i18n-check · test · build)
        ↓
merge main → Deploy (Vercel Fluid Compute)
        ↓
Post-deploy → smoke tests + health check
```

### Endpoints de cron (3 crons ativos)

| Cron                    | Rota                              | Frequência     |
|-------------------------|-----------------------------------|----------------|
| Paper ingestion         | `/api/cron/literature/ingest`     | diário 03:00   |
| BackgroundInsight       | `/api/cron/insights/generate`     | horário        |
| Evolution metrics       | `/api/cron/admin/insights/jobs`   | diário 04:00   |

> Detalhes completos em [`docs/operations/DEPLOY.md`](docs/operations/DEPLOY.md)
> (Wave 29.3) + [`scripts/production-readiness.sh`](scripts/production-readiness.sh)
> (Wave 29.1). Migrations guide (Wave 29.2) será adicionado em
> [`docs/operations/MIGRATIONS.md`](docs/operations/MIGRATIONS.md) quando a
> PR da Wave 29.2 for mergeada.

---

## 📚 Documentação canônica

A documentação canônica vive em [`docs/`](docs/). README e AGENTS.md são apenas
**ponteiros de entrada**.

| O que você procura                              | Onde ler                                           |
|-------------------------------------------------|----------------------------------------------------|
| 🌟 **Visão canônica do produto**                | [`docs/25_visao-akasha.md`](docs/25_visao-akasha.md) |
| 🏛️ **Arquitetura técnica**                      | [`docs/03_architecture-spec.md`](docs/03_architecture-spec.md) |
| 📋 **Índice mestre de docs**                    | [`docs/00_README.md`](docs/00_README.md)           |
| 🧠 **Identidade verbal/visual**                 | [`docs/26_identidade-akasha.md`](docs/26_identidade-akasha.md) |
| 📐 **ADRs (Architecture Decision Records)**     | [`docs/adrs/`](docs/adrs/)                         |
| 🔬 **Pesquisa consolidada**                     | [`docs/pesquisa/README.md`](docs/pesquisa/README.md) |
| 📜 **Changelog**                                | [`docs/changelog.md`](docs/changelog.md)           |
| 🚢 **Guia de deploy**                           | [`docs/operations/DEPLOY.md`](docs/operations/DEPLOY.md) |
| 🗃️ **Guia de migrations**                      | [`docs/operations/MIGRATIONS.md`](docs/operations/MIGRATIONS.md) |
| ✅ **Production readiness**                     | [`docs/operations/PRODUCTION_READINESS.md`](docs/operations/PRODUCTION_READINESS.md) |

### Trilha autônoma

- Processo research-first: [`AGENTS.md`](AGENTS.md) + [`.autonomous/`](.autonomous/)
- Visão e operação do produto: [`AGENTS.md`](AGENTS.md) (seção "Child DOX Index")
- Especificações vivas: [`.trae/specs/`](.trae/specs/) e [`docs/superpowers/`](docs/superpowers/)

---

## 🤝 Contribuindo

Ver [`CONTRIBUTING.md`](CONTRIBUTING.md) para setup completo, padrões de código
e processo de PR.

**Contrato sagrado antes de qualquer task:**

```bash
source scripts/sacred-protocol-check.sh   # valida CodeGraph + Headroom
```

**Padrões obrigatórios:**

- TypeScript estrito (zero `any`)
- PT-BR primeiro (`pnpm i18n:check` antes de commit)
- LGPD by design (mínimo PII em responses)
- Tests co-located (`*.test.ts` ao lado de `*.ts`)
- 1-2 files/commit, push imediato

---

## 🛡️ Compliance

- **LGPD** — consentimento granular (Art. 7º), self-service delete (Art. 18 §V),
  privacy controls por categoria (Art. 37). Ver `Wave 19.2`, `Wave 19.3`.
- **OpenAI/Anthropic** — DPAs assinados. Ver
  [`docs/legal/DPA_OPENAI.md`](docs/legal/) (em construção).
- **Copyright** — Pilares 6/7 rejeitados por copyright ativo (ADR-0002).
  Pesquisa prévia em
  [`.hermes/plans/research-licensing-human-design-gene-keys-2026-06-23.md`](.hermes/plans/).

---

## 📊 Status

**v0.1.0 — pre-launch** (Wave 29 — deploy preparation)

- ✅ 5 Pilares funcionando (universalista + visceral)
- ✅ ADR-013 consciência viva implementada
- ✅ 28+ features entregues
- ✅ LGPD compliance by design
- ⏳ Deploy em produção (Wave 29 — em andamento)

---

## 📄 License

**All Rights Reserved** — propriedade privada de Akasha-0.

Inspirado em princípios esotericos universais (Cabala, Astrologia, Tantra,
I Ching, Odu). Inspiracoes conceituais incluem tradicoes como Human Design e
Gene Keys, **reinterpretadas de forma original e nao-comercial**. Não somos
afiliados, endossados ou licenciados pelos detentores dessas marcas.

Conteudo gerado e para fins educativos e de autoconhecimento.

---

<p align="center">
  <em>"Caminha com o consulente. Traduz a consciência viva em palavra, presença e prática."</em><br>
  — Akasha Portal · ADR-013
</p>