# coordination/w-main/STATE.md — Integrator / Main (Ciclo 585)

**Versao atual**: v0.1.6
**Ultima atualizacao**: 2026-06-13
**Ciclo**: 585

---

## Ciclo 585 — Auditoria Local

**Typecheck**: 0 erros | **Git**: clean
**DEC-009**: CRITICO — AMAB race (concurrent processes stepping on coordination files)
**DEC-004**: Gene Keys attribution — comment-only em AkashaSignificadoCard.tsx:14, NAO visivel em UI
**TYPE MISMATCH**: LifeArea w1 — proposito/sexualidade/carreira nao estao no tipo

### Estrutura Swarm
- w-main: concurrent processes (DEC-009 race confirmed)
- w2: Ciclo 20 ativo — "100% clean, 4 auditorias consecutivas"
- w1/w3/w4: BLOQUEADOS (sem worktree formal)

### Auditoria itens
| Item | Status | Evidencia |
|------|--------|-----------|
| DEC-004 Gene Keys | ❌ Comment only | AkashaSignificadoCard.tsx:14 |
| DEC-009 AMAB race | ⚠️ CRITICO | Concurrent w-main processes |
| PillarContribution UI | ✅ Removida | w2 Ciclo 14 |
| TYPE LifeArea mismatch | ⚠️ w1 PENDING | AkashaSignificadoCard.tsx:24 |

## Historico
- **585**: Auditoria | DEC-004 comment-only, TYPE MISMATCH w1, DEC-009 CRITICO
- **580**: Auditoria | DEC-004 NAO visivel em UI, suite OK
- **581**: Auditoria | DEC-004 escalado, TYPE MISMATCH w1
- Detalhado: `historico.md`

## Proximos Passos
1. **HUMAN**: DEC-009 — 3 opcoes no CHECKPOINT
2. **w2**: DEC-004 attribution visivel em UI (NAO comment)
3. **w1**: TYPE LifeArea — adicionar proposito/sexualidade/carreira, remover familia/criatividade

## Notas
- w-main domain: `coordination/w-main/**` + `docs/DECISIONS.md`
- PROIBIDO: VERSION, CHANGELOG.md, STATE.md raiz, CHECKPOINT.md, coordination/DOMAINS.md, coordination/integrator/**
