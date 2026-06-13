# coordination/w-main/requests.md

## Escalacao ao Integrator — Ciclo 541 (v0.1.4)

**De**: w-main (main branch, executor + integrator)
**Data**: 2026-06-12
**Ciclo**: 541

---

## TYPECHECK QUEBRADO — w2 REGRESSAO

**Problema**: `AkashaSignificadoCard.tsx` tem 4 erros de tipo TypeScript.
Causa: processo autonomo (AMAB ou outro) removeu import de `LifeArea` do tipo.

**Erros**:
```
apps/akasha-portal/src/components/akasha/AkashaSignificadoCard.tsx(176,20): error TS7053
apps/akasha-portal/src/components/akasha/AkashaSignificadoCard.tsx(176,42): error TS2304: Cannot find name 'LifeArea'
apps/akasha-portal/src/components/akasha/AkashaSignificadoCard.tsx(225,28): error TS7053
apps/akasha-portal/src/components/akasha/AkashaSignificadoCard.tsx(259,14): error TS7053
```

**Arquivo**: `apps/akasha-portal/src/components/akasha/AkashaSignificadoCard.tsx`
**Dominio**: w2
**Impacto**: build quebrado, nenhum deploy possivel
**Prioridade**: CRITICA — reverte para commit anterior ou re-adiciona import

**Acao**: w2 — reverter ou corrigir `AkashaSignificadoCard.tsx`

---

## STATUS: DEC-004 RESOLVIDO

**DEC-004 Gene Keys** foi resolvido pelo integrator (processo autonomo, Ciclo 538).
Decisao: **Opcao (a) — Atribuicao + label "Inspirado em Gene Keys (Richard Rudd)"** na UI.

**Implementacao requerida (w2)**:
- Arquivo: `AkashaSignificadoCard.tsx`
- Locacao: abaixo do seletor de nivel
- Texto: `<span style={{fontSize:'0.75em', color:'var(--muted)'}}>Inspirado em Gene Keys (Richard Rudd)</span>`

---

## Itens pendentes por dominio

| # | Dominio | Item | Impacto | Prioridade |
|---|---------|------|---------|-----------|
| 1 | w2 | TYPECHECK: LifeArea import removida — build quebrado | Nenhum deploy possivel | **CRITICA** |
| 2 | w2 | DEC-004 UI attribution | Label Gene Keys nao implementado | ALTA |
| 3 | w2 | AkashaSignificadoCard defaultNivel | sempre 'gift' em /mapa/significado | ALTA |
| 4 | w4 | 241 test failures | Rotas ausentes + mock cookies + vitest | MEDIA |
| 5 | w1 | cross-engine `_kab`/`_date` | Remover params orfaos | BAIXA |

---

## Historico

- Ciclo 541: TYPECHECK QUEBRADO — LifeArea import removida de AkashaSignificadoCard
- Ciclo 540: DEC-004 RESOLVIDO pelo integrator
- Ciclo 538: DEC-004 CRITICA resolvida
- Ciclo 528: DEC-004 CRITICA identificada

---

## FOLLOW-UP DEC-004 — Ciclo 541 (3 ciclos apos diretiva original)

**Status**: DIRETIVA NAO IMPLEMENTADA
**Ciclos desde a diretiva**: 3 (ciclos 538→539→540→541)

O arquivo `AkashaSignificadoCard.tsx` NAO CONTEM a atribuicao "Inspirado em Gene Keys (Richard Rudd)".
Unica referencia a DEC-004 e o comentario no topo do arquivo (line 9).

**Acao CRITICA para w2**:
- Ver `coordination/w-main/requests.md` para a diretiva completa
- Implementar atribuicao abaixo do seletor de nivel (shadow/gift/siddhi buttons)
- Custo estimado: 1-2 linhas JSX
- Commitar como `[w2] feat: DEC-004 — Gene Keys attribution in UI`

**Nota**: w2 nao tem worktree. Todo trabalho em main diretamente.
