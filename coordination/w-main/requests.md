# coordination/w-main/requests.md

## Escalacao ao Integrador — Ciclo 581 (v0.1.6)

**De**: w-main (main branch, executor + integrator)
**Data**: 2026-06-13
**Ciclo**: 581
**Problema**: DEC-009 AMAB race — concurrent omp processes stepping on coordination files

---

## DEC-009: AMAB Reset Loop — CRITICO [AGUARDANDO HUMANO]

**Problema**: Processo concorrente sobrescreve arquivos w-main entre write e commit.
Arquivos coordination/w-main/STATE.md, changelog-pending.md, requests.md substituidos
por outro processo w-main durante o ciclo.
Commits themselves persistem OK (HEAD = 2656+). Problema: working tree race.
**3 opcoes no CHECKPOINT.md**: matar loop, modificar loop, aceitar.

---

## DEC-004: Gene Keys Attribution — IMPROPRIAMENTE RESOLVIDO [w2 PENDING]

**Problema**: attribution adicionada APENAS em comment JSDoc (AkashaSignificadoCard.tsx:14).
NAO ha texto visivel no cartao para o usuario final.

**Evidencia concreta**:
- AkashaSignificadoCard.tsx:14: `* DEC-004:shadow/gift/siddhi inspirado em Gene Keys (Richard Rudd).`
- Renders NIVEL_LABEL (shadow/gift/siddhi) mas ZERO footnote ou label "Inspirado em Gene Keys"
- w2 Ciclo 14 reportou "RESOLVIDO" — INCORRETO
- w2 Ciclo 17/18: "auditoria local" sem abordar este item
- w2 Ciclo 568 feedback: NAO processado por w2

**Acao necessaria**: w2 deve adicionar texto visivel no cartao:
  "Estrutura inspirada em Gene Keys (Richard Rudd)" ou similar — footer, tooltip, ou label.
  **Arquivo**: apps/akasha-portal/src/components/akasha/AkashaSignificadoCard.tsx
  **Dominio**: w2 (mobile UI)

---

## TYPE MISMATCH: proposito/sexualidade vs LifeArea [w1 PENDING]

**Problema**: LifeArea em packages/akasha-core tem apenas `saude | financas | relacionamentos`.
Mas AREAS_WITH_DATA em AkashaSignificadoCard.tsx usa `proposito, carreira, financas, saude,
relacionamentos, sexualidade, espiritualidade`.

**Comment no codigo** (AkashaSignificadoCard.tsx:24):
"proposito e sexualidade NAO sao LifeArea mas sao usados em aplicacao"

**Acao necessaria**: w1 deve atualizar o tipo LifeArea para incluir todas as 7 areas
usadas (proposito, carreira, financas, saude, relacionamentos, sexualidade, espiritualidade),
remover familia/criatividade, e republicar em @akasha/types.

**Dominio**: w1 (motor)

---

## DEC-008: Swarm sem worktree

./setup-swarm.sh nunca executado. w2 opera como "pseudo-w2" sem branch constraint.
w2 Ciclo 18: "domain glob correction" — dominio SRC/APP/API** corrigido para w1.
