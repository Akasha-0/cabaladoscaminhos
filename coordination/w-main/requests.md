# coordination/w-main/requests.md

## Escalacao ao Integrador — Ciclo 542 (v0.1.4)

**De**: w-main (main branch, executor + integrator)
**Data**: 2026-06-12
**Ciclo**: 542

---

## DEC-009: AMAB Reset Loop — w-main commits sobrescritos (CRITICA)

**Problema**: Akasha Merge Bot faz `git reset --hard` que sobrescreve commits w-main.

**Evidencia (reflog)**:
```
7ea6fb37 HEAD@{0}: reset: moving to HEAD   <- AMAB sobrescreve
9e36b6bb HEAD@{1}: commit: docs(w-main): Ciclo 541 <- SOBRESCRITO
```

**Padrao**: ciclos w-main sao sobrescritos pelo reset do AMAB.
**Impacto**: w-main nao consegue manter historico confiavel.

**Dominio**: AMAB (autonomous process)
**Acao requerida**: HUMAN configura AMAB para NAO fazer reset em commits w-main.

---

## TYPECHECK: RESTAURADO ✅

**Status atual**: AkashaSignificadoCard.tsx RESTAURADO a HEAD, typecheck 0 erros ✅
O erro foi caused por working copy, nao por HEAD. Build funcional.

---

## STATUS: DEC-004 NAO IMPLEMENTADO (4 ciclos)

**DEC-004 Gene Keys** foi resolvido pelo integrator (Ciclo 538).
Decisao: **Opcao (a) — Atribuicao + label "Inspirado em Gene Keys (Richard Rudd)"** na UI.

**Implementacao requerida (w2)**:
- Arquivo: `AkashaSignificadoCard.tsx`
- Locacao: abaixo do seletor de nivel
- Texto: `<span style={{fontSize:'0.75em', color:'var(--muted)'}}>Inspirado em Gene Keys (Richard Rudd)</span>`

---

## Itens pendentes por dominio

| # | Dominio | Item | Impacto | Prioridade |
|---|---------|------|---------|-----------|
| 1 | AMAB | DEC-009: reset loop sobrescreve commits w-main | w-main inoperante | CRITICA |
| 2 | w2 | DEC-004 UI attribution | Label Gene Keys nao implementado ha 4 ciclos | ALTA |
| 3 | w2 | AkashaSignificadoCard defaultNivel | sempre 'gift' em /mapa/significado | ALTA |
| 4 | w4 | 241 test failures | Rotas ausentes + mock | MEDIA |
| 5 | w1 | cross-engine `_kab`/`_date` | params orfaos | BAIXA |

---

## Historico

- Ciclo 542: DEC-009 CRITICA, typecheck restaurado ✅
- Ciclo 541: DEC-009 (AMAB reset loop), typecheck quebrado
- Ciclo 540: DEC-004 RESOLVIDO pelo integrator
- Ciclo 538: DEC-004 CRITICA resolvida
- Ciclo 528: DEC-004 CRITICA identificada

---

## ARQUIVO UNTRACKED — test_write.txt (w2 domain)

**Dominio**: w2
**Arquivo**: `apps/akasha-portal/src/components/akasha/test_write.txt`
**Impacto**: nenhum (provavelmente debug) — mas indica que AMAB ou outro processo escreveu em w2 domain
**Acao**: w2 — remover ou commit como parte do dominio w2
