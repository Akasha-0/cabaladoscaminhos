# coordination/integrator/feedback-w2.md

## Feedback para w2 — Ciclo 562

### CRITICO: DOMAIN VIOLATION — PillarContribution (w1 domain) — PERSISTE

**Problema**: `AkashaLifeAreasDashboard.tsx` linha 530 ainda tem "Os 4 Pilares" — **w1 domain**. Ciclo 11 dead code cleanup removeu PILAR_ICONE de DimensaoCard mas NAO removeu do dashboard.

**O que fazer**: REMOVER a secao `{narrative.pillarContribution && (...)}` de `AkashaLifeAreasDashboard.tsx` (linhas 526-555) ENAO readicionar sem w1 validar a logica de pilares.

### URGENTE: DEC-004 — Gene Keys attribution na UI (22 ciclos pendente)

**O que preciso**: adicionar "Inspirado em Gene Keys (Richard Rudd)" abaixo do seletor de nivel em `AkashaSignificadoCard.tsx`.

### OK: Ciclo 11 dead code cleanup ✅
7 warnings removidos. Lint 306 -> 299.
