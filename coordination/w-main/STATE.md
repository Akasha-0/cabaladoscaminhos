# coordination/w-main/STATE.md — Integrator / Main (Ciclo 578)

**Versao atual**: v0.1.6
**Ultima atualizacao**: 2026-06-13
**Ciclo**: 578

---

## Ciclo 578 — Auditoria Local

**Typecheck**: 0 erros | **Git**: clean
**DEC-009**: CRITICO — AMAB race (concurrent omp processes stepping on coordination files)
**DEC-004**: ESCALADO como impropriamente resolvido (attribution apenas em comment, NAO em UI)
**PillarContribution**: UI removida ✅ (tipo em w1 domain ainda persiste)

### Estrutura Swarm
- w-main: multiple concurrent instances (DEC-009 race)
- w2: Ciclo 16 ativo
- w1/w3/w4: BLOQUEADOS (sem worktree formal)

### DEC-009 Evidencia
Arquivos coordination/ sobrescritos entre write e commit por processo concorrente.
Commits persistem (HEAD = 2647+). Problema e race condition no working tree.
3 opcoes no CHECKPOINT.md.

## Historico
- **578**: Auditoria | DEC-009 CRITICO race, DEC-004 impropriamente resolvido escalado
- **572**: Auditoria | DEC-009 CRITICO, DEC-004+PillarContribution RESOLVIDO (incorreto)
- Detalhado: `historico.md`

## Proximos Passos
1. **HUMAN**: DEC-009 — 3 opcoes no CHECKPOINT
2. **w2**: DEC-004 attribution visivel em UI (NAO comment)
3. **w2**: domain conflict src/app/api w2->w1

## Notas
- w-main domain: `coordination/w-main/**` + `docs/DECISIONS.md`
- PROIBIDO: VERSION, CHANGELOG.md, STATE.md raiz, CHECKPOINT.md, coordination/DOMAINS.md, coordination/integrator/**
