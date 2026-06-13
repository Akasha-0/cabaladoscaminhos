# coordination/w2/changelog-pending.md

## Entradas pendentes de changelog

_Tudo integrado em v0.1.6. Nenhuma entrada pendente._


### Ciclo 13 (2026-06-12)
- **fix(w2): hygiene round 3** — CalendarDay.tsx: motion import removido; onboarding/page.tsx: locale var, params const, useParams import removidos. lint: 296 -> 295 warnings. Commits b24a006d, 28516f77. Impacto: code hygiene, zero impacto para usuario.

### Ciclo 14 (2026-06-12)
- **fix(w2): domain violation + DEC-004** — pillarContribution (w1) removido de AkashaLifeAreasDashboard.tsx (35 linhas, commit a7b5ab9b); DEC-004: "Inspirado em Gene Keys (Richard Rudd)" adicionado ao header de AkashaSignificadoCard.tsx (commit 3f64039e). Impacto: remove dominio w1 de arquivo w2; satisfaz atribuicao DEC-004.
