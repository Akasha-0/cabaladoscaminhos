<!-- NOTE: This document may be outdated. Review needed before relying on it. -->
# Multi-Agent System — Spec de Integração

> **Norte:** Doc 25.

## Conceito & Visão

Sistema de 6 agentes autônomos especializados que investigam, planejam, implementam, validam e propõem melhorias em todas as camadas do **Sistema Akasha** (`apps/b2c-portal` + `packages/core-*`) — mantendo-se alinhados com os documentos canônicos (topo: Doc 25 + Doc 26). O sistema opera em ciclos de evolução (fases), com gates de qualidade e memória persistente. O `apps/legacy-cockpit` (Mesa Real B2B) é tocado só para manutenção até o desligamento (AD-25.2).

## Arquitetura

### 6 Agentes Especializados

| Agente | Domínio | Arquivos Alvo |
|--------|---------|---------------|
| `spiritual-validator` | Correlações, Grimório, governança | `correlation-map.ts`, `odus.ts`, `grimorio/**`, `IDEIA.md` |
| `arch-ai-engineer` | IA 3 camadas, RAG/pgvector, prompt builder | `openai.ts`, `swarm-orchestrator.ts`, `oracle-prompt-builder.ts`, busca híbrida do Grimório |
| `ui-ux-evolution` | Mandala, paleta cósmica, tipografia | `apps/b2c-portal/**`, componentes da Mandala, Doc 26, Doc 25 §2/§8 |
| `devops-qa-tester` | CI, testes, observabilidade (VPS) | `.github/workflows/*`, `vitest.config.ts`, Doc 19, Doc 22 |
| `knowledge-validator` | Base de conhecimento, calculadoras | `grimorio/**`, `knowledge-base.ts`, `core-*/calculators`, `odus.ts` |
| `orchestrator` (central) | Coordena todos, mantém ciclo | `PROGRESS.md`, Doc 25/26, `memory/*` |

### Fluxo do Ciclo

```
ASSESS → PLAN → EXECUTE (paralelo) → VERIFY → EVOLVE → LOOP
```

## Gates de Qualidade

8 gates, cada vale 1/8 do QUALITY_SCORE:

| # | Gate | Critério |
|---|------|---------|
| 1 | Build | `npm run build` = 0 erros |
| 2 | Tests | `npm run test:run` = 0 falhas |
| 3 | Lint | `npm run lint` = 0 warnings |
| 4 | Correlação | AD-20.1..20.9 validados |
| 5 | Arquitetura | Doc 25 §4–5 (3 camadas + RAG) + Doc 06 |
| 6 | UI/UX | Doc 26 (Identidade Akasha) + Doc 25 §2/§8 |
| 7 | DevOps | Doc 19 + Doc 22 respeitados |
| 8 | Conhecimento | Doc 15 + Doc 20 (Grimório) respeitados |

**Meta:** `QUALITY_SCORE >= 0.91`

## Comandos

```bash
# Ciclo completo
npm run cycle:full

# Passos individuais
npm run cycle:assess    # Verificar estado + build + testes
npm run cycle:plan      # Identificar tarefas
npm run cycle:execute   # 5 agentes em paralelo
npm run cycle:verify    # Build + testes + quality gates
npm run cycle:evolve   # Atualizar memória e progresso
```

## Memória

- `memory/cycle-NNN.md` — métricas + decisões por ciclo
- `memory/MEMORY.md` — índice das últimas 10-15 fases
- `IDEIA.md` — ledger de correspondências esotéricas
- `docs/21_registro-decisoes-roadmap.md` — painel de ADs

## Hierarquia de Documentos

```
Doc 25 (Visão Akasha) ▸ Doc 26 (Identidade) ▸ Doc 03 (arquitetura monorepo/VPS)
  ▸ Doc 04 (modelo de dados B2C) ▸ Doc 11 (cálculo) ▸ Doc 06 (correlação/Grafo)
  ▸ Doc 20 (Grimório) ▸ Doc 23 (mapas) ▸ Docs 13/16/17/18 = LEGADO B2B
```
