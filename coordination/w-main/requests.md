# coordination/w-main/requests.md

## Escalacao ao Integrador — Ciclo 541 (v0.1.4)

**De**: w-main (main branch, executor + integrator)
**Data**: 2026-06-12
**Ciclo**: 541

---

## DEC-009: AMAB Reset Loop — w-main commits sobrescritos

**Problema**: Akasha Merge Bot faz `reset: moving to HEAD` que sobrescreve commits w-main.

**Evidencia (reflog)**:
```
7ea6fb37 HEAD@{0}: reset: moving to HEAD   <- AMAB sobrescreve
9e36b6bb HEAD@{1}: commit: docs(w-main): Ciclo 541 <- SOBRESCRITO
139f697b HEAD@{2}: commit: docs(w-main): Ciclo 540 <- SOBRESCRITO
```

**Padrao**: ciclo 540 e 541 de w-main foram sobrescritos pelo reset do AMAB.
AMAB commita `7ea6fb37` (Ciclo 540) depois de um `git reset --hard` que apaga trabalho w-main.

**Impacto**: w-main nao consegue manter Historico，连续性 ou documentacao propria.
DEC-009 Bloqueia: rastreamento de ciclo confiavel.

**Dominio**: AMAB (autonomous process)
**Acao requerida**: HUMAN configura AMAB para NAO fazer reset em commits w-main.

---

## TYPECHECK QUEBRADO (w2 domain)

**Problema**: AkashaSignificadoCard.tsx — LifeArea import removida, uso de `string` em vez de `LifeArea`.
**Status**: arquivo em working copy tem erros; HEAD tem versao CORRETA.

**Arquivo**: `apps/akasha-portal/src/components/akasha/AkashaSignificadoCard.tsx`
**Acao**: w2 — `git checkout HEAD -- AkashaSignificadoCard.tsx` para restaurar versao correta.

---

## STATUS: DEC-004 RESOLVIDO

**Implementacao requerida (w2)**:
- Arquivo: `AkashaSignificadoCard.tsx`
- Locacao: abaixo do seletor de nivel
- Texto: `<span style={{fontSize:'0.75em', color:'var(--muted)'}}>Inspirado em Gene Keys (Richard Rudd)</span>`

---

## Itens pendentes por dominio

| # | Dominio | Item | Impacto | Prioridade |
|---|---------|------|---------|-----------|
| 1 | AMAB | DEC-009: reset loop sobrescreve commits w-main | w-main inoperante | CRITICA |
| 2 | w2 | TYPECHECK: AkashaSignificadoCard LifeArea | build quebrado | CRITICA |
| 3 | w2 | DEC-004 UI attribution | Label Gene Keys nao implementado | ALTA |
| 4 | w2 | AkashaSignificadoCard defaultNivel | sempre 'gift' | ALTA |
| 5 | w4 | 241 test failures | Rotas ausentes + mock | MEDIA |
| 6 | w1 | cross-engine `_kab`/`_date` | params orfaos | BAIXA |

---

## Historico

- Ciclo 541: DEC-009 (AMAB reset loop), typecheck quebrado
- Ciclo 540: DEC-004 RESOLVIDO pelo integrator
- Ciclo 538: DEC-004 CRITICA resolvida
- Ciclo 528: DEC-004 CRITICA identificada
