# Akasha v0.0.7 — Limpeza Arquitetural, Código Morto e Contexto Centralizado

> **Versão:** 0.0.7
> **Status:** Proposta
> **Sucessor de:** `akasha-v0.0.6` (Refatoração arquitetural + Curadoria pendente)
> **Foco:** Organização, Código Morto, Contexto Centralizado para Agentes

---

## Why

A v0.0.6 aplicou refatoração arquitetural de 5 camadas, mas deixou subprodutos de ciclos Fallow na raiz, documentações dispersas e nenhum índice centralizado para agentes de IA recuperarem contexto rapidamente. A v0.0.7 endereça:

1. **Poluição da raiz** — 8 arquivos de subprodutos Fallow que precisam ser limpos
2. **Scripts órfãos** — 3 scripts Playwright do Cockpit antigo sem uso atual
3. **Contexto fragmentado** — documentação dispersa em `docs/`, `memory/`, `.trae/specs/`, `MEMORY.md`
4. **Índice inexistente** — não há lugar único onde um agente pode começar para entender o projeto
5. **Fallow desatualizado** — relatório atual tem 1029 issues, baseline impreciso

---

## What Changes

### Eixo A — Limpeza da Raiz

- **Deletar Categoria 1** (seguro, já verificado):
  - `dead-code` (relatório vazio Fallow)
  - `dupes` (relatório vazio Fallow)
  - `health` (relatório vazio Fallow)
  - `fallow-report.json` (relatório atual 1029 issues)
  - `fallow-baseline-health.json` (baseline antigo da raiz)
  - `fallow-baseline-dupes.json` (baseline antigo da raiz)
  - `.fallowrc.json.bak` (backup redundante)
  - `.fallowrc.json.orig` (arquivo vazio)
  - `MEMORY.md` (índice manual redundante com `memory/`)

- **Deletar Categoria 2** (confirmado: vestígios do Cockpit):
  - `inspect-pages.mjs` (Playwright para rotas `/cockpit/*` inexistentes)
  - `smoke-test.mjs` (Playwright para rotas `/cockpit/*` e `/operator/*` inexistentes)
  - `test-cockpit-auth-full.mjs` (Playwright para autenticação Cockpit)

- **Arquivar Categoria 2** (manter referência histórica):
  - `quality-report-latest.json` → mover para `docs/audit/`
  - `quality-evolution-history.json` → mover para `docs/audit/`

### Eixo B — Contexto Centralizado para Agentes

- **Criar `CONTEXT.md` na raiz** — índice central que todo agente deve ler primeiro:
  - Estrutura do monorepo
  - Links para specs, docs, memory
  - Estado atual do projeto
  - Como verificar status no GitHub
  - Fluxo de desenvolvimento

- **Criar `AGENTS.md` unificado** — instruções para agentes:
  - Regras de comportamento
  - Como usar specs
  - Como verificar progresso
  - Como ler commits/logs
  - Padrão de nomenclatura

- **Migrar `MEMORY.md` → `CONTEXT.md`** — consolidar índice de ciclos

### Eixo C — Atualizar Baselines e Configs

- **Atualizar `.fallowrc.json`** — apontar baselines para `docs/audit/`
- **Rodar ciclo Fallow limpo** — `npx fallow` após limpeza para estabelecer novo baseline
- **Verificar `.gitignore`** — garantir que subprodutos Fallow estão ignorados

### Eixo D — Melhoria Contínua de Arquitetura

- **Revisar `docs/architecture.md`** — verificar se layout de 5 camadas está sendo seguido
- **Verificar dependências entre camadas** — garantir que `domain/` não importa de `infrastructure/`
- **Documentar exceções** — se houver violações de arquitetura, documentar e planejar correção

---

## Impact

### Affected code

- **8 arquivos deletados** da raiz (Categoria 1)
- **3 arquivos deletados** da raiz (Categoria 2)
- **2 arquivos movidos** para `docs/audit/` (quality reports)
- **1 novo arquivo** `CONTEXT.md` na raiz
- **1 arquivo atualizado** `AGENTS.md`

### Affected documentation

- `CONTEXT.md` (novo) — índice centralizado
- `.fallowrc.json` (atualizado) — novos paths de baseline
- `.gitignore` (verificado/atualizado) — padrões Fallow

### Non-Goals

- ❌ Não refatorar código fonte
- ❌ Não adicionar features
- ❌ Não modificar schemas ou APIs
- ❌ Não mexer em `packages/` ou `apps/`

---

## Estrutura do Contexto Centralizado

```
cabala-dos-caminhos/
├── CONTEXT.md                    ← ÍNDICE CENTRAL (ler primeiro)
├── AGENTS.md                     ← Regras para agentes de IA
├── README.md                     ← Visão geral do projeto
│
├── .trae/specs/                  ← Histórico de versões
│   ├── akasha-v0.0.6/           ← Versão atual (última)
│   ├── akasha-v0.0.5/           ← Versão anterior
│   └── [anteriores]/
│
├── docs/                         ← Documentação técnica
│   ├── 01_product-brief.md      ← Visão de produto
│   ├── 02_prd.md                ← Requisitos de produto
│   ├── 03_architecture-spec.md  ← Arquitetura geral
│   ├── 04_data-model.md         ← Modelo de dados
│   ├── 05_uiux-spec.md          ← Especificação UI/UX
│   ├── 06_ai-engine-spec.md     ← Motor de IA
│   ├── 08_roadmap.md            ← Roadmap atual
│   ├── audit/                    ← Relatórios de auditoria
│   │   ├── baseline-fallow.json ← Baseline Fallow (único)
│   │   └── baseline-fallow-post-arch.json
│   └── [outros docs]
│
├── memory/                       ← Histórico de ciclos
│   └── cycle-[NNN].md          ← Ciclos de desenvolvimento
│
└── apps/akasha-portal/          ← Aplicação principal
    └── src/lib/                  ← 5 camadas arquiteturais
        ├── domain/              ← Lógica pura (sem I/O)
        ├── application/         ← Casos de uso
        ├── infrastructure/      ← Prisma, Redis, etc
        ├── interface/           ← Rotas, actions
        └── shared/              ← Utils, constants
```

---

## Como Verificar Status do Projeto

### Últimos Commits no GitHub

```bash
# Últimos 15 commits
git log --oneline -15

# Últimos commits por branch
git log --oneline -15 origin/main
git log --oneline -15 --all --graph --decorate

# Commits da última semana
git log --since="7 days ago" --oneline

# Tags recentes
git tag --sort=-creatordate | head -5
```

### Status do Projeto

```bash
# Tests
pnpm test:run

# Typecheck
pnpm typecheck

# Lint
pnpm lint

# Quality gates
pnpm quality
```

### Evolução de Qualidade

```bash
# Fallow (código morto)
pnpm fallow

# Ver relatório atual
cat fallow-report.json | jq '.summary'
```

---

## Cross-References

- **Specs anteriores:** `.trae/specs/akasha-v0.0.6/`
- **Documentação:** `docs/`
- **Ciclos de memória:** `memory/`
- **Arquitetura:** `docs/architecture.md` (via `docs/03_architecture-spec.md`)
- **Roadmap:** `docs/08_roadmap.md`

---

## Source of Truth

- `.trae/specs/akasha-v0.0.7/` — esta spec e tasks
- `docs/audit/` — baselines e relatórios
- `CONTEXT.md` (após criação) — índice centralizado
