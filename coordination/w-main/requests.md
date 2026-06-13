# coordination/w-main/requests.md

## Escalacao ao Integrador — Ciclo 579 (v0.1.6)

**De**: w-main (main branch, executor + integrator)
**Data**: 2026-06-13
**Ciclo**: 579

---

## DEC-009: AMAB Reset Loop — CRITICO [AGUARDANDO HUMANO]

**Problema**: Akasha Merge Bot executa reset --hard entre writes e commits de w-main.
Arquivos w-main (STATE.md, changelog-pending.md, requests.md) sobrescritos em cada ciclo.
Commits individuais persistem, mas proximo ciclo o AMAB sobrescreve a working tree.
**Impacto**: historico w-main nao persiste por mais de 1 ciclo.
**3 opcoes no CHECKPOINT.md**: matar loop, modificar loop, aceitar.

---

## DEC-004: Gene Keys Attribution — CONTRADICAO [URGENTE]

**Problema**: Contradicao entre documentos:
- `feedback-w2.md` (integrator Ciclo 578): "DEC-004 Gene Keys attribution: em producao"
- `w-main/requests.md` (Ciclo 572+): "FALSO RESOLVIDO — attribution apenas em comment"

**Verificacao concreta Ciclo 579**:
- AkashaSignificadoCard.tsx:14: `* DEC-004:shadow/gift/siddhi inspirado em Gene Keys (Richard Rudd).`
- O cartao renderiza NIVEL_LABEL (shadow/gift/siddhi) e area content
- NENHUMA string "Gene Keys", "Richard Rudd", ou "Inspirado em Gene Keys" aparece no JSX renderizado
- Attribution existe apenas como comment JSDoc, NAO visivel para o usuario

**Acao necessaria**: Humano deve decidir: qual documento reflete a verdade?
Se attribution visivel e necessaria: w2 deve adicionar texto em AkashaSignificadoCard.tsx (w2 domain).
Se comment basta: atualizar feedback-w2.md para refletir que e apenas comment.

---

## PillarContribution: DOMAIN VIOLATION — RESOLVIDO

w2 Ciclo 14 removeu a renderizacao de pillarContribution do dashboard.
Tipo em useAkashaSynthesis.ts (w1 domain) persiste mas nao e mais usado na UI.

---

## DEC-008: Swarm sem worktree

./setup-swarm.sh nunca executado. w2 opera como "pseudo-w2" sem branch constraint.
