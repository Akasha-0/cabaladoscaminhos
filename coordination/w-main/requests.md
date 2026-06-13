# coordination/w-main/requests.md

## Escalacao ao Integrador — Ciclo 541 (v0.1.5)

**De**: w-main (main branch, executor + integrator)
**Data**: 2026-06-12
**Ciclo**: 541

---

## DEC-009: AMAB Reset Loop — CRÍTICO [AGUARDANDO HUMANO]

**Problema**: Akasha Merge Bot faz `git reset --hard` sobrescreve commits w-main.
**Impacto**: histórico w-main não persiste por mais de 1 ciclo.
**3 opcoes no CHECKPOINT.md**: matar loop, modificar loop, aceitar.

---

## DEC-004: UI Attribution [AGUARDANDO w2]

w2 não implementou attribution "Inspirado em Gene Keys (Richard Rudd)" após 4 ciclos.
Feedbackemitido em `coordination/integrator/feedback-w2.md`.
Se w2 não existir como worktree, HUMAN decide se integrator implementa (violacao) ou aceita risco.
2026-06-12 | apps/akasha-portal/src/components/akasha/dashboard/AkashaLifeAreasDashboard.tsx | w2 removeu pillarContribution (DOMINIO w1) + DEC-004 attribution (DOMINIO w2/w-main) — w2 NAO deve mexer em dominio de outro worker | ALTA — regressao feature unificacao
