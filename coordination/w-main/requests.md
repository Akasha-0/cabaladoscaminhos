# coordination/w-main/requests.md

## Escalacao ao Integrador — Ciclo 533 (v0.1.2 vs STATE v0.1.3)

**De**: w-main (main branch, executor + integrator)
**Data**: 2026-06-12
**Ciclo**: 533

---

### Itens pendentes por dominio

| # | Dominio | Item | Impacto | Prioridade |
|---|---------|------|---------|-----------|
| 1 | integrator | **INCONSISTENCIA VERSION**: `VERSION`=v0.1.2, `STATE.md`=v0.1.3 | Desalinhamento de versao pode causar conflitos em releases | CRITICA |
| 2 | w-main | DEC-004 Gene Keys — decisao | Plagio vs confluencia natural vs renomear | CRITICA |
| 3 | w2 | AkashaSignificadoCard: defaultNivel ausente na pagina /mapa/significado | Bug: cartao sempre abre em 'gift' mesmo se perfil em sombra | ALTA |
| 4 | w2 | DOMÍNIO VIOLATION — AkashaSignificadoCard | w-main modificou dominio w2 ciclos 526-529 | ALTA |
| 5 | w4 | 241 test failures ambientais | Rotas ausentes + mock cookies + vitest | MEDIA |
| 6 | w1 | cross-engine `_kab`/`_date` | Remover params orfaos | BAIXA |

---

### INCONSISTENCIA VERSION (CRITICA — Ciclo 533)

**Problema**: `VERSION` file diz `v0.1.2` mas `coordination/w-main/STATE.md` (HEAD) diz `**Versao atual**: v0.1.3`.

**Arquivos envolvidos**:
- `VERSION`: `v0.1.2` (ultima atualizacao: ciclo 527)
- `coordination/w-main/STATE.md` HEAD: `v0.1.3` (commit `2b1db054`)
- `coordination/w-main/requests.md` this file: `v0.1.2` (ciclos anteriores)
- `coordination/w-main/ARCHITECTURE.md`: `v0.1.2` (criado ciclo 532)

**Provavel causa**: Processo automatizado (Akasha Merge Bot) atualizou STATE.md para v0.1.3 sem atualizar VERSION.

**Acao requerida**: Integrador decide: (a) VERSAO=v0.1.3 e changelog atualizado, (b) VERSAO=v0.1.2 e STATE.md corrigido, (c) nova versao v0.1.4 com changelog.

**NOTA**: w-main NAO pode modificar VERSION (PROIBIDO).

---

### DEC-004 — shadow/gift/siddhi vs Gene Keys

**Problema**: shadow/gift/siddhi de Akasha e semanticamente identico a Gene Keys de Richard Rudd.

**4 opcoes**:
- (a) **Atribuir**: mencionar Gene Keys como inspiracao, creditar Richard Rudd
- (b) **Renomear**: mudar terminologia (ex: obscuridade/oferta/transcendencia)
- (c) **Confluencia natural**: manter, argumentando estrutura como folclore espiritual
- (d) **Remover**: abandonar shadow/gift/siddhi

**Risco**: publicacao sem decisao = plagio confirmado = DMCA/dano reputacional.

---

### AkashaSignificadoCard defaultNivel BUG (w2)

**Problema**: `/mapa/significado` nao passa `defaultNivel` para `AkashaSignificadoCard`. Cartao SEMPRE abre em 'gift'.

**Arquivo**: `apps/akasha-portal/src/app/[locale]/(akasha)/mapa/significado/page.tsx`
**Dominio**: w2
**Acao**: w2 worktree — adicionar prop `defaultNivel` a partir do perfil Akasha do usuario

---

## Historico

- Ciclo 533: INCONSISTENCIA VERSION detectada; AkashaSignificadoCard bug identificado
- Ciclo 532: ARCHITECTURE.md criado
- Ciclo 530-531: TYPE VIOLATION documentada; swarm blocker
- Ciclo 528: DEC-004 CRITICA identificada
