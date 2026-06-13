## v0.1.4 (2026-06-12)

### Added
- **cap-build.sh — APK build completo**: script em `apps/akasha-portal/cap-build.sh` com auto-detect de Java/Android SDK, gera APK ~4.4MB em `android/app/build/outputs/apk/debug/`. Executa `./cap-build.sh` da raiz.

### Changed
- **AkashaSignificadoCard mobile-responsive**: padding com `clamp()`; `maxWidth: '100%'` + `overflow: 'hidden'`.
- **AkashaSignificadoCard defaultNivel prop**: componente aceita `defaultNivel?: 'shadow' | 'gift' | 'siddhi'`; dashboard passa `dominantFrequency`.

### Removed
- **LifePathInsightCard.tsx**: 130 linhas de dead code sem callers — `AkashaSignificadoCard` já cobre o caso de uso.

## v0.1.5 (2026-06-12)

### Added
- **feat(w2): AkashaSignificadoCard no dashboard** (Ciclo 2): seletor shadow/gift/siddhi + 5 áreas no dashboard.
- **feat(w2): cap-build.sh — APK Android completo** (Ciclo 6): APK ~4.4MB via `./cap-build.sh`.

### Changed
- **fix(w2): HTML entities + Next.js Link** (Ciclo 2): &ldquo;/&rdquo; corrigidos; <a> → <Link>.
- **feat(w2): AkashaSignificadoCard mobile-responsive** (Ciclo 3): clamp() padding, maxWidth 100%.
- **feat(w2): defaultNivel prop** (Ciclo 3): defaultNivel?: 'shadow'|'gift'|'siddhi'.

### Removed
- **chore(w2): LifePathInsightCard.tsx** (Ciclo 4): 130 linhas dead code.

### Infrastructure
- **docs: DEC-004 Gene Keys** — motor/glossário attribution ✅; UI pendente w2.
- **docs: DEC-009 AMAB reset loop** — CRÍTICO, aguardando decisão humana.

## v0.1.3 (2026-06-12)

### Added
- **Dashboard PriorityAreasQuickView** (w2): top 3 áreas da vida visíveis no topo da seção de 6 áreas — ordenação siddhi > gift > shadow + intensidade, chips horizontais com scroll mobile-first.
- **F-224 — Trânsito de Hoje na UI**: `dailyTransit.todayPhrase` renderizado em cada Área expandida com ícone Sparkles antes da prática do dia.

### Changed
- **AkashaSignificadoCard substitui LifePathInsightCard no dashboard**: seletor de 5 áreas de vida e 3 níveis (shadow/gift/siddhi) diretamente na página principal.

### Fixed
- **JSX entity bug**: `&ldquo;`/`&rdquo;` corrigidos para `{...}` em 3 componentes.

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
