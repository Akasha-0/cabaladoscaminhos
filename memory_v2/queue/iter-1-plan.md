# Iter 1 Plan — Aláfia & 16 Odus Engine + Ewé Botanica

**Date:** 2026-06-22
**Loop:** akasha-evolution-loop · spiritual-visceral-v2
**Priority:** Highest from spec

---

## Research Findings

- `grimoire/traducao-areas.odu.ts` já existe com traduções básicas dos Odus (Merindilogun)
- `grimoire/mapeamentos/personal-cycle.ts` existe com mapeamento cabalístico
- NÃO existe: engine de cálculo Aláfia, engine de 16 Odus, botanica Ewé
- Prisma schema não tem OduProfile, SomaticMap, RitualConfig

---

## Implementation Plan

### 1. Create `apps/akasha-portal/src/lib/odu/`

Estrutura:

```
odu/
├── index.ts                  — exports públicos
├── alafia.ts               — engine de cálculo (0-4 búzios abertos)
├── odus.ts                 — 16 Odus do Merindilogun com archetypes
├── alafia-odu-matrix.ts    — matriz de correlação Aláfia × Odu
└── types.ts                 — tipos TypeScript
```

### 2. Create `apps/akasha-portal/src/lib/grimoire/botanica/`

Estrutura:

```
botanica/
├── index.ts              — exports
├── ewe-database.ts      — banco de folhas sagradas Ewé
├── ayahuasca-protocols.ts — protocolos de integração
└── types.ts
```

---

## Quality Gates

- `pnpm --filter akasha-portal typecheck` must pass
- No banned AI phrases
- Follow existing code patterns in `grimoire/`
