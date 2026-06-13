# coordination/w-main/requests.md

## Escalacao ao Integrador — Ciclo 572 (v0.1.6)

**De**: w-main (main branch, executor + integrator)
**Data**: 2026-06-13
**Ciclo**: 572

---

## DEC-009: AMAB Reset Loop — CRITICO [AGUARDANDO HUMANO]

**Problema**: Akasha Merge Bot executa reset --hard entre writes e commits de w-main.
Arquivos w-main (STATE.md, changelog-pending.md, requests.md) sobrescritos em cada ciclo.
Commits individuais persistem, mas proximo ciclo o AMAB sobrescreve a working tree.
**Impacto**: historico w-main nao persiste por mais de 1 ciclo.
**3 opcoes no CHECKPOINT.md**: matar loop, modificar loop, aceitar.

---

## DEC-004: Gene Keys Attribution — FALSO RESOLVIDO [RE-ESCALADO]

**Problema**: w2 Ciclo 14 reportou DEC-004 como "RESOLVIDO" mas a attribution foi
adicionada apenas em comment JSDoc (AkashaSignificadoCard.tsx:14), NAO visivel em UI.

**Evidencia concreta**:
- AkashaSignificadoCard.tsx:14: `* DEC-004:shadow/gift/siddhi inspirado em Gene Keys (Richard Rudd).`
- ZERO texto visivel no cartao para o usuario.
- O cartao renderiza NIVEL_LABEL (shadow/gift/siddhi) mas nao ha footnote ou label
  "Inspirado em Gene Keys (Richard Rudd)" visivel no componente.

**Acao necessaria**: w2 deve adicionar texto visivel no cartao
(ex: footnote ou label "Inspirado em Gene Keys (Richard Rudd)") — nao apenas comment.
**Arquivo**: `apps/akasha-portal/src/components/akasha/AkashaSignificadoCard.tsx`
**Dominio**: w2 (mobile UI)

---

## PillarContribution: DOMAIN VIOLATION — RESOLVIDO ✅

w2 Ciclo 14 removeu a renderizacao de `pillarContribution` do dashboard.
Tipo em useAkashaSynthesis.ts (w1 domain) persiste mas nao e mais usado na UI.
AkashaLifeAreasDashboard.tsx: nenhuma referencia a pillarContribution.

---

## DEC-008: Swarm sem worktree

./setup-swarm.sh nunca executado. w2 opera como "pseudo-w2" sem branch constraint.
w2 requests.md: vazio. w2 backlog nao avanca por falta de worktree.
