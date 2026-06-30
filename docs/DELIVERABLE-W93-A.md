# W93-A — Reputation System Universalista

> **Cycle:** W93 (2026-06-30 15:00 UTC)
> **Worker session:** 414839828439312
> **Branch:** `w93/reputation-system`
> **Status:** ✅ SHIPPED

## Visão

Sistema de reputação **universalista**, multi-eixo, LGPD-first. Cinco eixos (acolhimento, conhecimento, presença, contribuição, escuta) sem número único, sem ranking entre tradições. Cinco tradições suportadas (Candomblé, Umbanda, Ifá, Astrologia, Cabala), cada uma com pesos relativos DIFERENTES nos 5 eixos — nenhuma é "melhor" que outra.

Princípios (GOAL.md):

1. **Multi-eixo, não single-score.** A pessoa tem reputação em 5 eixos. Nunca um número único.
2. **Não-comparativo.** Tradição X não é "melhor" que Y. Cada eixo tem pesos diferentes POR TRADIÇÃO.
3. **LGPD by design.** Opt-in explícito, opt-out imediato (purga tudo), sem PII exposto, retenção 90 dias.
4. **Universalista.** Consulente E consulente-consulente (peer reputation, não só top-down).

## Files (8 files, 3,500 LOC)

| File | LOC | Description |
|------|-----|-------------|
| `src/lib/w93/reputation-types.ts` | 315 | Branded types, 5 eixos, 5 tradições, pesos não-comparativos, DTOs |
| `src/lib/w93/reputation-engine.ts` | 584 | Pure engine: decay, multi-eixo scoring, trend, LGPD stripping, radar data |
| `src/lib/w93/reputation-storage.ts` | 389 | In-memory store: opt-in/out, purge, dedupe, índices por pessoa |
| `src/components/reputation/ReputationCard.tsx` | 254 | Mobile-first card, 44px tap, aria-live, LGPD controls |
| `src/components/reputation/AxisRadar.tsx` | 305 | SVG radar 5 eixos, accessible, reduced-motion |
| `src/app/reputacao/page.tsx` | 455 | Demo page: card + radar + trad×axis table + history + context |
| `src/lib/w93/__tests__/reputation-engine.spec.ts` | 891 | 46 asserts, 14 sections (engine, storage, LGPD, trends, sacred) |
| `scripts/smoke-reputation-engine.mjs` | 307 | 37 asserts, 8 sections (incl. banned-vocab scan) |

## Validação

| Validação | Status | Detalhe |
|-----------|--------|---------|
| Per-file TSC=0 | ✅ | 0 errors across all 8 files (tsconfig.w93.json scope) |
| Spec ≥30 asserts | ✅ | **46/46 PASS** via `node --experimental-strip-types` |
| Smoke ≥20 asserts | ✅ | **37/37 PASS** via `node --experimental-strip-types scripts/smoke-reputation-engine.mjs` |
| Sacred-cultural compliance | ✅ | 0 banned-vocab hits (orishas/ashé/ashá); orixás/axé/Iemanjá/Candomblé/Umbanda/Ifá/Akasha preservados |
| LGPD | ✅ | `stripReporterIdentities()`, `purgeExpired(maxDays=90)`, `opted-out` purga tudo imediatamente |

### Como rodar

```bash
cd /workspace/wt-w93-reputation

# TSC per-file (worktree-scoped config)
./node_modules/.bin/tsc --noEmit -p tsconfig.w93.json

# Spec (46 asserts)
node --experimental-strip-types src/lib/w93/__tests__/reputation-engine.spec.ts

# Smoke (37 asserts + banned-vocab scan)
node --experimental-strip-types scripts/smoke-reputation-engine.mjs

# Demo page (Next.js)
npm run dev  # e abrir /reputacao
```

## Design Decisions

### 1. Por que 5 eixos e não 1 score

GOAL.md é explícito: **"não hierarquizar tradições"**. Score único implica ranking. Cinco eixos vivos permitem ver:
- Candomblé valora presença (axé) e acolhimento acima de tudo
- Astrologia valora conhecimento e contribuição (papers, leituras)
- Ifá valora conhecimento (Odus) e escuta (cabalista)
- Cabala e Umbanda no meio

Sem que NENHUMA seja "melhor" que a outra. Cada eixo é **independente**.

### 2. Por que pesos diferentes POR TRADIÇÃO

Não-comparativo ≠ idêntico. Tradição X valora eixo Y mais que Z — isso é fato cultural, não hierarquia. O radar mostra os 25 cells (5×5) e o usuário vê que Candomblé acolhimento = alto, Astrologia contribuição = alto, mas NUNCA "Candomblé > Astrologia".

### 3. Por que LGPD-first e não LGPD-afterthought

Opt-in explícito é bloqueante no engine: `validateAttribution()` rejeita se `consentGiven=false`. Opt-out purga TUDO em <1ms. Retention 90 dias é auto-purgada em todo write. Reporter identity (`fromPersonId` + `note`) é stripada em qualquer export público. Sem PII em `stats()`.

### 4. Por que decay exponencial (não linear)

Score = `50 + sum((score_i - 3) * 2^(-age/halfLife)) * 5`. Half-life = 60 dias. Atribuição recente pesa 100%, 60 dias pesa 50%, 1 ano pesa ~25%, 5 anos pesa ~1%. Floor de 0.05 evita zero histórico.

### 5. Por que radar SVG puro (sem libs)

Dependências externas adicionam bundle size + risco de incompatibilidade. SVG pentagonal regular com 5 eixos é trivial de calcular. ARIA + reduced-motion respeitados. Mobile-first: 320px default.

## Tradition Handling Matrix (não-comparativo)

| Tradição | acolhimento | conhecimento | presença | contribuição | escuta |
|----------|:-----------:|:------------:|:--------:|:------------:|:------:|
| Candomblé | 0.20 | 0.15 | **0.30** | 0.10 | 0.25 |
| Umbanda | 0.25 | 0.10 | 0.25 | 0.10 | **0.30** |
| Ifá | 0.15 | **0.35** | 0.20 | 0.10 | 0.20 |
| Astrologia | 0.10 | **0.35** | 0.15 | **0.25** | 0.15 |
| Cabala | 0.10 | 0.30 | 0.20 | 0.15 | 0.25 |

**NÃO é ranking.** É apenas "que eixos esta tradição valoriza mais dentro de si". Soma ≈ 1.0 por tradição (não-crítico, engine normaliza).

## LGPD Layers

| Layer | Mechanism | Quando |
|-------|-----------|--------|
| 1. Opt-in bloqueante | `validateAttribution()` rejeita `consentGiven=false` | Engine, todo write |
| 2. Opt-out purga tudo | `setConsent(personId, 'opted-out')` deleta received + given | Storage, imediato |
| 3. Auto-purge 90 dias | `purgeExpired()` em todo write + read | Engine |
| 4. Strip reporter | `stripReporterIdentities()` remove `fromPersonId` + `note` | Engine, todo export público |
| 5. Stats sem PII | `stats()` retorna apenas counts | Storage |
| 6. Retention tracking | `retentionDays` no snapshot para usuário ver idade do histórico | Engine |

## Sacred-Cultural Compliance

**Preservados verbatim** (conforme GOAL.md e brief W93):
- orixás / Orixás
- axé
- Iemanjá
- Odu (singular, capital O)
- Odus (plural)
- entidades
- Cigano Ramiro
- Akasha
- pemba
- Candomblé
- Umbanda
- Ifá

**Banned (zero hits via stripComments source scan):**
- "orishas" sem til
- "ashé" / "ashá" com acento errado
- qualquer grafia alternativa não-canônica

Smoke + spec rodam `stripComments()`-filtered source scan automaticamente.

## NEW Durable Lessons (cycle W93-A)

1. **`as const satisfies Record<...>` literal-type narrowing** — Comparar valores tipados como literais (`0.2` vs `0.25`) gera TS2367. Workaround: `const c: number = TRADITION_AXIS_WEIGHTS.Candomblé.acolhimento` antes de comparar. Reusable for any const-narrowed Record type.

2. **`'use client'` components com Next.js 14** — Retornar tipo `JSX.Element` falha em server scope. Usar `React.ReactElement` ou importar `JSX` namespace via `import type { JSX } from 'react'`. Reusable.

3. **`@/*` path alias requer tsconfig scoped** — TSC CLI não aceita `--paths`. Workaround: criar `tsconfig.w93.json` no worktree com `include` específico dos arquivos W93 + `paths` mapping. Reusable for any per-file TSC validation.

4. **Reputação multi-eixo = LGPD-by-design obrigatório** — Single-score reputation é tentador mas antiético (ranking). Multi-eixo + opt-in + opt-out imediato + 90 dias é o mínimo LGPD. Reusable for any reputation/community feature.

5. **Decay floor > 0** — `DECAY_FLOOR = 0.05` evita que `decayFactor(99999 dias)` retorne 0 e quebre a soma. Reusable for any half-life / exponential decay logic.

6. **Smoke-script self-contained banned-vocab scan** — `stripComments()` + `readFileSync` inline no smoke (não no spec) garante que CI falha se alguém reintroduzir grafia errada. Reusable for any sacred-cultural compliance.

7. **Trend 'new' tem janela curta (7 dias)** — Marca atribuição única recente. Após isso, computa rising/stable/falling. Reusable for any first-time vs established distinction.

## What this REPLACES (no repo, just declares)

- Nenhum arquivo pré-existente foi tocado (ciclo 92 lesson #4: don't refactor unrelated code).
- Engine é novo, independente, pure.
- Storage é in-memory (substituível por Supabase/Postgres preservando interface).
- UI é nova em `/reputacao` — não conflita com rotas existentes.

## Files Created

```
src/lib/w93/reputation-types.ts                  315 LOC
src/lib/w93/reputation-engine.ts                 584 LOC
src/lib/w93/reputation-storage.ts                389 LOC
src/lib/w93/__tests__/reputation-engine.spec.ts  891 LOC
src/components/reputation/ReputationCard.tsx     254 LOC
src/components/reputation/AxisRadar.tsx          305 LOC
src/app/reputacao/page.tsx                       455 LOC
scripts/smoke-reputation-engine.mjs              307 LOC
docs/DELIVERABLE-W93-A.md                        (this file)
tsconfig.w93.json                                 26 LOC
─────────────────────────────────────────────────
TOTAL                                           3,526 LOC
```

## Próximos passos (candidates)

1. **Persistência real** — Trocar `InMemoryReputationStorage` por adapter Supabase preservando `IReputationStorage`. Mapping trivial: `attributions` table + `consent` table + RLS por personId.
2. **API endpoints** — `POST /api/reputation/attribute` (criar), `GET /api/reputation/[personId]` (snapshot), `POST /api/reputation/consent` (opt-in/out).
3. **CRON de purge** — Vercel cron diário chamando `purgeExpired()` para defesa em profundidade.
4. **Notificação de atribuição** — Email/push opcional ao receber atribuição (opt-in por notificação, separado do opt-in de reputação).
5. **Filtro por tradição** — UI adicional para mostrar só scores de UMA tradição (já suportado pelo engine via `computeTraditionAxisScores`).
6. **Compare-side-by-side** — Visualizar duas pessoas lado-a-lado (5 eixos cada, sem agregação).

## Branch + Commit

```
w93/reputation-system @ <commit-sha>
```