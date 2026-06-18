# Skipped Tests Report

**Generated:** 2026-06-18
**Total skipped:** 15 tests across 12 files

---

## ✅ Enabled This Session

### `tests/middleware/rate-limit.test.ts` — Rate limit window reset
- **Block:** `describe.skip('Rate limit window reset', ...)` (2 tests)
- **Why skipped:** Date mocking concern (`vi.fn` on `Date.now`)
- **Why safe to enable:** Fully self-contained simulation using in-memory `rateLimitStore` Map and `Date.now` mocking — no external services, no production code imports
- **Status:** ✅ **ENABLED** — both tests pass

---

## 🚫 Remain Skipped — Placeholder Stubs for Non-Existent Modules

These are `expect(true).toBe(true)` stubs waiting for modules that don't exist yet.

### `tests/app/dashboard/chakra.test.tsx`
- `describe.skip('Dashboard Chakra Page')` — `@/app/dashboard/chakra/page` does not exist
- `describe.skip('Chakra Data Structure')` — `@/lib/correlation/chakra-day`, `chakra-planet`, `chakra-frequency` do not exist
- **Action:** Delete or implement the actual modules first

### `tests/app/dashboard/orixa.test.tsx`
- `describe.skip('Dashboard Orixá Page')` — `@/app/dashboard/orixa/page` does not exist
- `describe.skip('Orixá Data Structure')` — `@/lib/correlation/orixa-herb`, `orixa-chakra` do not exist
- **Action:** Delete or implement the actual modules first

### `tests/app/dashboard/ritual.test.tsx`
- `describe.skip('Dashboard Ritual Page')` — `@/app/dashboard/ritual/page` does not exist
- `describe.skip('Ritual Data Structure')` — `@/lib/correlation/ritual-planner`, `planet-herb` do not exist
- **Action:** Delete or implement the actual modules first

### `tests/integration/api/chat-oracle.test.ts`
- `describe.skip('POST /api/chat/oracle')` — `@/app/api/chat/oracle/route` does not exist
- `describe.skip('GET endpoint')` — same route missing
- **Action:** Delete or implement the actual route first

### `tests/integration/api/correlacao.test.ts`
- `describe.skip('POST /api/mapa - Full Spiritual Profile Correlation')` — `@/app/api/mapa/route` does not exist
- **Action:** Delete or implement the actual route first

### `tests/integration/api/oracle.test.ts`
- `describe.skip('POST /api/chat/oracle')` — route missing
- `describe.skip('GET /api/chat/oracle')` — route missing
- `describe.skip('Spiritual Systems Recognition')` — route missing
- **Action:** Delete or implement the actual route first

### `tests/lib/ai/cross-pillar.test.ts`
- `describe.skip('Cross-pillar correlation (4+1 pilares, v0.0.5 T11)')` — `@/lib/ai/theme-router` and `@/lib/ai/iching-prompt` do not exist (iching-prompt relocated to `@/lib/application/ai/iching-prompt`)
- **Action:** Delete or update paths when cross-pillar feature is re-implemented

---

## 🗑️ Remain Skipped — Deprecated/Removed Modules

### `tests/lib/ai/insights/generator.test.ts`
- `it.skip('should be rewritten for new mapa-insights API')` — `expect(true).toBe(false)` placeholder
- **Reason:** `@/lib/ai/insights/generator` was removed in Fase 21 refactor. Insights now generated via mapa-insights pipeline
- **Action:** Remove the test file entirely, or rewrite against the new insights pipeline

### `tests/lib/store/index.test.ts`
- `it.skip('should be replaced with cockpit-store tests')` — `expect(true).toBe(false)` placeholder
- **Reason:** `@/lib/store/index` (B2C stores) removed in Fase 21. New store is `cockpit-store.ts` (B2B only)
- **Action:** Remove the test file, or replace with cockpit-store tests

---

## 🌐 Remain Skipped — Require Live Server (External Service)

### `tests/integration/api/correlation-analyze.test.ts`
- 5× `it.skip(...)` inside active `describe('GET /api/correlation/analyze')`
- **Reason:** Tests hit `http://localhost:3000/api/correlation/analyze` — requires a running Next.js dev server
- **Action:** These are integration tests, not unit tests. Enable when CI has a live server fixture, or convert to MSW-mocked unit tests

### `tests/integration/api/correlation-ritual.test.ts`
- 3× `it.skip(...)` inside active `describe('GET /api/correlation/ritual')`
- **Reason:** Tests hit `http://localhost:3000/api/correlation/ritual` — requires a running Next.js dev server
- **Action:** Same as above — enable with live server in CI, or convert to MSW

---

## ℹ️ Conditional Skips (Not Block-Level `describe.skip`)

These `it.skip` calls are inside active `describe` blocks — they conditionally skip based on filesystem state. No action needed.

### `tests/lib/grimoire/curatorship-guardian-iching.test.ts`
- `it.skip('pulando — diretório grimoire/iching vazio', ...)` — skips if directory is empty
- `it.skip('pulando cross-ref — IDEIA.md não encontrado', ...)` — skips if ledger missing
- **Status:** Working as intended — graceful degradation

### `tests/lib/grimoire/iching-completeness.test.ts`
- `it.skip('pulando — diretório grimoire/iching vazio', ...)` — skips if no hex files
- **Status:** Working as intended

---

## Summary Table

| File | Skipped Block(s) | Reason | Action |
|------|-----------------|--------|--------|
| `rate-limit.test.ts` | `describe.skip('Rate limit window reset')` | vi.fn mocking concern | ✅ **ENABLED** |
| `chakra.test.tsx` | 2× `describe.skip` | Modules don't exist | Delete or implement |
| `orixa.test.tsx` | 2× `describe.skip` | Modules don't exist | Delete or implement |
| `ritual.test.tsx` | 2× `describe.skip` | Modules don't exist | Delete or implement |
| `chat-oracle.test.ts` | 2× `describe.skip` | Route doesn't exist | Delete or implement |
| `correlacao.test.ts` | 1× `describe.skip` | Route doesn't exist | Delete or implement |
| `oracle.test.ts` | 3× `describe.skip` | Route doesn't exist | Delete or implement |
| `cross-pillar.test.ts` | 1× `describe.skip` | Modules don't exist | Delete or re-implement |
| `generator.test.ts` | 1× `it.skip` | Module removed (Fase 21) | Remove file |
| `store/index.test.ts` | 1× `it.skip` | Module removed (Fase 21) | Remove file |
| `correlation-analyze.test.ts` | 5× `it.skip` | Needs live server | MSW or CI fixture |
| `correlation-ritual.test.ts` | 3× `it.skip` | Needs live server | MSW or CI fixture |
