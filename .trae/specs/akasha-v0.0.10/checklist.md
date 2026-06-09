# Checklist — Akasha v0.0.10

## Pré-Verificações

- [ ] Working tree limpo ou em branch separado
- [ ] Tasks.md lido e compreendido

## T1: grimoire/sync

- [ ] Arquivo criado em `src/lib/domain/grimoire/sync.ts`
- [ ] Interface `SyncOptions` definida
- [ ] Interface `SyncResult` definida
- [ ] Função `syncGrimoire` exportada
- [ ] Stub implementado (retorna resultado vazio)
- [ ] JSDoc adicionado
- [ ] Commit atômico: `feat: add grimoire/sync module stub`
- [ ] Spec compliance: ✅/❌
- [ ] Code quality: ✅/❌

## T2: grimoire/search

- [ ] Arquivo criado em `src/lib/domain/grimoire/search.ts`
- [ ] Interface `KnowledgeEntry` definida
- [ ] Interface `GrimoireContext` definida
- [ ] Interface `SearchQuery` definida
- [ ] Interface `SearchFilters` definida
- [ ] Interface `SearchResult` definida
- [ ] Função `searchGrimoireHybrid` exportada
- [ ] Stub implementado
- [ ] JSDoc adicionado
- [ ] Commit atômico: `feat: add grimoire/search module stub`
- [ ] Spec compliance: ✅/❌
- [ ] Code quality: ✅/❌

## T3: logging

- [ ] Arquivo criado em `src/lib/shared/logging.ts`
- [ ] Função `generateRequestId` exportada
- [ ] Stub implementado
- [ ] JSDoc adicionado
- [ ] Commit atômico: `feat: add logging module stub`
- [ ] Spec compliance: ✅/❌
- [ ] Code quality: ✅/❌

## T4: rate-limit

- [ ] Arquivo criado em `src/lib/shared/rate-limit.ts`
- [ ] Interface `RateLimitResult` definida
- [ ] Função `checkRateLimit` exportada
- [ ] Stub implementado
- [ ] JSDoc adicionado
- [ ] Commit atômico: `feat: add rate-limit module stub`
- [ ] Spec compliance: ✅/❌
- [ ] Code quality: ✅/❌

## T5: swarm

- [ ] Arquivo criado em `src/lib/domain/ai/swarm.ts`
- [ ] Tipo `KnowledgeEntry` exportado (reutilizado de grimoire/search)
- [ ] Função `getKnowledgeBase` exportada
- [ ] Stub implementado
- [ ] JSDoc adicionado
- [ ] Commit atômico: `feat: add swarm module stub`
- [ ] Spec compliance: ✅/❌
- [ ] Code quality: ✅/❌

## T6: Verificação Final

- [ ] `pnpm test:run` — testes passam
- [ ] `pnpm typecheck` — 0 erros
- [ ] `pnpm lint` — sem warnings
- [ ] `pnpm fallow` — issues relacionadas resolvidas
- [ ] `docs/08_roadmap.md` atualizado

## Resumo Final

- **Módulos criados:** 5/5
- **Commits:** 5/5
- **Reviews:** 10/10 (spec + code para cada módulo)
- **Status:** ✅ PRONTO / ❌ BLOQUEADO
