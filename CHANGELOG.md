# Changelog

## v0.1.0 (2026-06-12)

### Added
- **Loop autônomo**: `run-loop.sh` + `KICKOFF.md` + `AGENTS.md` bootstrap
- **Pesquisa FASE 1**: 3 documentos em `docs/pesquisa/`
  - `sintese-sistemas.md` — análise Human Design + Gene Keys (547 ln)
  - `benchmark-apps.md` — 13 apps concorrentes, 4 tabelas comparativas (692 ln)
  - `profundidade-interpretativa.md` — Depth Layers Framework (501 ln)
- **Síntese FASE 2**: 2 documentos em `docs/sintese/`
  - `cadeia-sintese.md` — arquitetura 3 camadas, correlações 5 mapas, vocabulário unificado
  - `arquitetura-motor.md` — evolução do motor em 5 camadas
- **Decisões**: `docs/DECISIONS.md` com DEC-001 a DEC-003
- **Akasha Interpretation Engine**: +141 linhas em `packages/types/src/index.ts`
- **Filtro de ruído**: `narrative-generator.ts` — pula sentenças-título

### Changed
- `VERSION`: bump v0.0.9 → v0.1.0
- `STATE.md`: estado atual com inventário completo e próximos passos

### Notes
- typecheck: limpo
- Testes falham por `@testing-library/dom` ausente (ambiente, não código)
- FASE 3 (implementação) pendente: unificar UI, cadeia de raciocínio, profundidade prática

---

## v0.0.9 (2026-06-08)

### Added
- Stubs de módulos para permitir compilação:
  - `src/lib/grimoire/sync.ts` - syncGrimoire
  - `src/lib/grimoire/search.ts` - searchGrimoireHybrid, GrimoireContext
  - `src/lib/shared/logging.ts` - generateRequestId
  - `src/lib/shared/rate-limit.ts` - checkRateLimit
  - `src/lib/swarm.ts` - getKnowledgeBase, KnowledgeEntry

### Known Issues
- Erros de typecheck em middleware.ts e rateLimit.ts (callers sync vs função async)
- Módulos de correlação (orixa-frequency, orixa-numerology, orixa-planet) ausentes
- Módulo life-areas ausente
- Estes são stubs - implementação real na Onda 3 (Oráculo Vivo)

---

## v0.0.8 (2026-06-08)

### Changed
- Limpeza Fallow: 3168 → 1327 issues (-58%)
- V001 resolvida: domain/ não importa mais de interface/

### Added
- ADRs documentados:
  - ADR-001: Tipos compartilhados em domain/types/
  - ADR-002: Padrão barrel files
  - ADR-003: Resolução da violação V001
  - ADR-004: Utilitários compartilhados em shared/
- Análise Fallow documentada em docs/audit/

### Removed
- 148 módulos de correlação órfãos
- 146 testes de correlação órfãos
- 8 unused dependencies
- 12 stale suppressions
- Barrel file redundante interface/api/spiritual-correlations.ts

### Fixed
- Imports atualizados de interface/ para domain/types/
- Utilitários movidos de interface/ para shared/

---

## v0.0.7 (2026-06-07)

### Added
- CONTEXT.md - índice centralizado para agentes
- docs/adrs/ - decisões arquiteturais

### Changed
- Limpeza da raiz do monorepo
- Refatoração de interface/ para barrel files funcionais

---

## v0.0.6 (2026-06-06)

### Added
- Onda 7 completa: Refatoração arquitetural em 5 camadas
- Curadoria pendente documentada

### Changed
- Estrutura de diretórios alinhada com Clean Architecture
- Tests movidos para tests/ na raiz
