# Tests DOX

## Purpose

Suite completa de testes para o monorepo `cabala-dos-caminhos` (Akasha OS).
Múltiplas categorias: unit, integration, e2e, architecture, infrastructure.

## Ownership

Categorias de teste:

- `tests/api/`: Testes de API routes (POST/GET/PATCH/DELETE)
- `tests/architecture/`: Clean architecture + package boundary checks
  → [AGENTS.md](tests/architecture/AGENTS.md)
- `tests/cockpit/`: Componentes de Cockpit (admin/operator UI)
- `tests/components/`: Componentes React em geral
- `tests/e2e/`: End-to-end (Playwright)
- `tests/hooks/`: React hooks customizados
- `tests/infrastructure/`: Redis, rate limit, cache integration
  → [AGENTS.md](tests/infrastructure/AGENTS.md)
- `tests/integration/`: Integração entre módulos (Auth, API, etc)
- `tests/lib/`: Testes unitários de bibliotecas (400+ categorias)
  - `tests/lib/grimoire/`: significados-curados, RAG, conexión pilares
  - `tests/lib/i18n/`: i18n parity tests
  - `tests/lib/auth/`, `tests/lib/db/`, `tests/lib/ai/`, `tests/lib/engines/`

Testes co-locados (lesson N+24):
- `apps/akasha-portal/src/lib/**/*.test.ts` (~ unit tests)
- `apps/akasha-portal/src/app/api/**/*.test.ts` (rotas críticas)

## Local Contracts

- **Naming**: `*.test.ts` ou `*.test.tsx` (componentes)
- **Fixtures**: junto ao teste ou em `__fixtures__/`
- **Mocks**: centralizados em `tests/setup.ts` ou `mocks/` por categoria
- **Determinístico**: zero dependência de network, DB real, ou timing
- **Cobertura por categoria**:
  - Unit: 90%+ (componentes puros, funções)
  - Integration: 70%+ (módulos cruzados)
  - E2E: happy paths (5-10 critical flows)
  - Architecture: 100% (rules always run)

## Work Guidance

- **Test patterns**:
  - Unit: `vitest` direct, sem wrapper
  - Integration: mock external (DB, network), real internal
  - E2E: Playwright com browser real
  - Architecture: AST-level checks (ts-morph ou tsc)
- **Determinismo**: `vi.useFakeTimers()` quando depender de data
  (Odu de Nascimento, hexagrama do dia, F-218)
- **Lesson N+13**: `vi.mock()` path MUST match import path exactly
- **Lesson N+14**: prefer ESM `import` (não `require`)
- **Pilar 4 (Odu)** ethics: testes não devem revelar nomes fora do
  whitelist (15 canônicos, D-044)
- **PWA/Web Push** (F-228/237/240): testar handlers isoladamente, sem
  VAPID real

## Verification

- `pnpm test:run` (CI) — testes não-interativos
- `pnpm test` (local) — modo watch
- `pnpm quality` — lint + typecheck + tests
- `pnpm i18n:check` — paridade i18n en ↔ pt-BR
- Coverage report: `pnpm test:run --coverage` (se instrumented)

## Test counts (Jun 2026)

- Unit: ~150 tests verdes
- Integration: ~80 tests verdes
- E2E: 5-10 critical flows
- Architecture: 100% (rules)
- **i18n parity: 100% (35/35 keys)**

## Child DOX Index

- [architecture](file:///home/skynet/cabala-dos-caminhos/tests/architecture/AGENTS.md) — clean architecture + package boundary checks
- [infrastructure](file:///home/skynet/cabala-dos-caminhos/tests/infrastructure/AGENTS.md) — Redis, rate limit, cache integration tests
- [lib](file:///home/skynet/cabala-dos-caminhos/tests/lib/) — unit tests (subdirs por domínio)
