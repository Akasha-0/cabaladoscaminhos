# coordination/w-main/requests.md

## Escalacao ao Integrador — Ciclo 586 (v0.1.6)

**De**: w-main (main branch, executor + integrator)
**Data**: 2026-06-13
**Ciclo**: 586

---

## DEC-009: AMAB Reset Loop — CRITICO [AGUARDANDO HUMANO]

**Problema**: Akasha Merge Bot executa reset --hard entre writes e commits de w-main.
Arquivos w-main (STATE.md, changelog-pending.md, requests.md) sobrescritos em cada ciclo.
Commits individuais persistem, mas proximo ciclo o AMAB sobrescreve a working tree.
**Impacto**: historico w-main nao persiste por mais de 1 ciclo.
**3 opcoes no CHECKPOINT.md**: matar loop, modificar loop, aceitar.

---

## DEC-004: Gene Keys Attribution — RESOLVIDO ✅

**Confirmado**: w2 Ciclo 21 (`6b99b794`) implementou atribuicao visivel em AkashaSignificadoCard.tsx:126-131.
String "Inspirado em Gene Keys (Richard Rudd)" agora visivel no JSX renderizado.
**Status**: RESOLVIDO.

---

## TYPE MISMATCH: LifeArea w1 — PENDENTE [w1 domain]

**Problema**: AkashaSignificadoCard.tsx:22-25: `proposito`, `sexualidade`, `carreira` usados como `LifeArea` mas NAO existem no tipo `LifeArea` de w1.
```typescript
const AREAS_WITH_DATA: string[] = ['proposito', 'carreira', 'financas', 'saude', 'relacionamentos', 'sexualidade', 'espiritualidade'];
// proposito/sexualidade/carreira NAO sao LifeArea
// familia/criatividade EXISTEM no tipo mas nao estao no array
```
**Dominio**: w1 (motor de tipos)
**Impacto**: potencial bug de tipo se motor nao cobre esses valores.

---

## DEC-008: Swarm sem worktree

./setup-swarm.sh nunca executado. w2 opera como "pseudo-w2" sem branch constraint.
w2 Ciclo 21 commitou de main mesmo assim (funciona mas sem isolamento).
