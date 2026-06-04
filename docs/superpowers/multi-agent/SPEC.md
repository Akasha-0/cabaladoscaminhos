# Multi-Agent System — Spec de Integração

## Conceito & Visão

Sistema de 6 agentes autônomos especializados que investigam, planejam, implementam, validam e propõem melhorias em todas as camadas do Cabala dos Caminhos — mantendo-se alinhados com os documentos canônicos. O sistema opera em ciclos de evolução (fases), com gates de qualidade e memória persistente.

## Arquitetura

### 6 Agentes Especializados

| Agente | Domínio | Arquivos Alvo |
|--------|---------|---------------|
| `spiritual-validator` | Correlações, glossários, governança | `correlation-map.ts`, `lenormand-cards.ts`, `odus.ts`, `IDEIA.md` |
| `arch-ai-engineer` | IA, swarm, RAG, prompt builder | `openai.ts`, `minimax.ts`, `swarm-orchestrator.ts`, `oracle-prompt-builder.ts` |
| `ui-ux-evolution` | Interface, paleta, tipografia | `cockpit/*`, `cockpit-store.ts`, Doc 13, Doc 17 |
| `devops-qa-tester` | CI, testes, observabilidade | `.github/workflows/*`, `vitest.config.ts`, Doc 19, Doc 22 |
| `knowledge-validator` | Base de conhecimento, calculadoras | `knowledge-base.ts`, `calculators/*`, `lenormand-cards.ts` |
| `orchestrator` (central) | Coordena todos, mantém ciclo | `PROGRESS.md`, Doc 21, `memory/*` |

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
| 5 | Arquitetura | Doc 06 + Doc 12 respeitados |
| 6 | UI/UX | Doc 17 + Doc 13 respeitados |
| 7 | DevOps | Doc 19 + Doc 22 respeitados |
| 8 | Conhecimento | Doc 15 + Doc 20 respeitados |

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
Doc 17 (visão) ▸ Doc 18 (contratos) ▸ Doc 23 (mapas) ▸ Doc 16 (arquitetura)
  ▸ Doc 13 (visual) ▸ Doc 11 (cálculo) ▸ Doc 06 (correlação) ▸ Doc 20 (conteúdo)
```
