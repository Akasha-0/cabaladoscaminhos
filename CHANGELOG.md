## v0.1.2 (2026-06-12)

### Fixed
- **typecheck: 0 erros em todo o workspace** (antes: 59)
- **P1 Unificar UI**: `PillarContribution` removido do dashboard e `DimensaoCard` — usuário vê só Akasha
- **P2 Cadeia de raciocínio**: `chainOfReasoning[]` implementado nas 6 áreas de vida
- **synthesis-engine.ts**: `kab` → `kabalisticMap`, `lifePath` no tipo `AkashaSynthesis` (ambas interfaces), `shadowTrap` no fallback

### Added
- **Swarm readiness**: `coordination/DOMAINS.md`, `coordination/integrator/feedback-w*.md`, `setup-swarm.sh`
- **P3 Profundidade prática**: `AkashaSignificadoCard` — Número de Vida com shadow/gift/siddhi, seletor interativo, ações práticas, afirmação
- **P3 integração**: `AkashaSignificadoCard` na página `/mapa/significado`
- **Dashboard**: `LifePathInsightCard` — Número de Vida com insight interpretativo no dashboard
- `AkashaSynthesis.lifePath?: number` — exposto para o client
- `AreaNarrativeUI.chainOfReasoning?: string[]` — cadeia de raciocínio por área
- `interpretation-engine.ts`: exports `VidaInterpretation`, `AkashaLevel` via `@akasha/types`
- `packages/akasha-core/package.json`: `@akasha/types` como workspace dep

### Notes
- P1, P2, P3 da FASE 3 estão concluídos
- typecheck: limpo em todos os 11 workspaces


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
