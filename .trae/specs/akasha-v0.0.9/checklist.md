# Checklist — Akasha v0.0.9

## Pré-Verificações

- [ ] Nenhum commit pendente antes de começar
- [ ] Git working tree limpo ou em branch separado

## Módulos Criados

- [ ] T1: `src/lib/domain/grimoire/sync.ts` criado com `syncGrimoire`
- [ ] T2: `src/lib/domain/grimoire/search.ts` criado com `searchGrimoireHybrid` e `GrimoireContext`
- [ ] T3: `src/lib/shared/logging.ts` criado com `generateRequestId`
- [ ] T4: `src/lib/shared/rate-limit.ts` criado com `checkRateLimit`
- [ ] T5: `src/lib/domain/ai/swarm.ts` criado com `getKnowledgeBase` e `KnowledgeEntry`

## Commits

- [ ] Commit atômico para T1 (grimoire/sync)
- [ ] Commit atômico para T2 (grimoire/search)
- [ ] Commit atômico para T3 (logging)
- [ ] Commit atômico para T4 (rate-limit)
- [ ] Commit atômico para T5 (swarm)

## Verificações

- [ ] T6: `pnpm typecheck` — 0 erros nos módulos novos
- [ ] T6: `pnpm test:run` — testes de grimoire passam
- [ ] T6: `pnpm fallow` — issues relacionadas resolvidas

## Documentação

- [ ] Atualizar `docs/08_roadmap.md` (v0.0.9 ✅)
- [ ] Adicionar nota nos ADRs sobre módulos stubs (para Onda 3)
