# coordination/integrator/feedback-w2.md

## Feedback para w2 — Ciclo 555

### CRITICO: DOMAIN VIOLATION — PillarContribution (w1 domain)

**Problema**: `AkashaLifeAreasDashboard.tsx` tem "Os 4 Pilares" — isso e **w1 domain** (motor, logica dos pilares). w2 NAO deveria adicionar features de pilares a UI sem w1 validar.

**O que fazer**: REMOVER a secao "Os 4 Pilares" do dashboard E nao readicionar sem w1 primeiro validar a logica de pilares.

### URGENTE: DEC-004 — Gene Keys attribution na UI (15 ciclos pendente)

**O que preciso**: adicionar "Inspirado em Gene Keys (Richard Rudd)" abaixo do seletor de nivel em `AkashaSignificadoCard.tsx`.

### OK: AkashaSignificadoCard 7 areas
sexualidade + espiritualidade integradas. DEC-005 coverage OK.
