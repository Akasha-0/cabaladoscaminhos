# coordination/w-main/requests.md

## Escalacao ao Integrador — Ciclo 536 (v0.1.3)

**De**: w-main (main branch, executor + integrator)
**Data**: 2026-06-12
**Ciclo**: 536

---

### Itens pendentes por dominio

| # | Dominio | Item | Impacto | Prioridade |
|---|---------|------|---------|-----------|
| 1 | integrator | DEC-004 Gene Keys — decisao | Plagio vs confluencia natural vs renomear | CRITICA |
| 2 | w2 | AkashaSignificadoCard: defaultNivel ausente na pagina /mapa/significado | Bug: cartao sempre abre em 'gift' mesmo se perfil em sombra | ALTA |
| 3 | w4 | 241 test failures ambientais | Rotas ausentes + mock cookies + vitest | MEDIA |
| 4 | w1 | cross-engine `_kab`/`_date` | Remover params orfaos | BAIXA |

---

### DEC-004 — shadow/gift/siddhi vs Gene Keys (CRITICA)

**Problema**: shadow/gift/siddhi de Akasha e semanticamente identico a Gene Keys de Richard Rudd.

**4 opcoes**:
- (a) **Atribuir**: mencionar Gene Keys como inspiracao, creditar Richard Rudd
- (b) **Renomear**: mudar terminologia (ex: obscuridade/oferta/transcendencia)
- (c) **Confluencia natural**: manter, argumentando estrutura como folclore espiritual
- (d) **Remover**: abandonar shadow/gift/siddhi

**Risco**: publicacao sem decisao = plagio confirmado = DMCA/dano reputacional.
**Pendente**: ha 11+ ciclos

---

### AkashaSignificadoCard defaultNivel BUG (w2)

**Problema**: `/mapa/significado` nao passa `defaultNivel` para `AkashaSignificadoCard`. Cartao SEMPRE abre em 'gift'.

**Arquivo**: `apps/akasha-portal/src/app/[locale]/(akasha)/mapa/significado/page.tsx`
**Dominio**: w2
**Acao**: w2 — adicionar prop `defaultNivel` a partir do perfil Akasha do usuario

---

### STATUS w2 (visivel por auditoria)

w2 trabalho recente (commits visiveis em main):
- `daf61082`: Ciclo 6 — APK build completo, STATE + changelog
- `4e0d96f3`: cap-build.sh com auto-detect Java/Android SDK

w2 worktree aparentemente ativo. w-main NAO pode intervir.

---

## Historico

- Ciclo 535: Auditoria — w2 ativo (commits visiveis em main)
- Ciclo 534: Auditoria — domain clarification
- Ciclo 533: INCONSISTENCIA VERSION resolvida (v0.1.3)
- Ciclo 532: ARCHITECTURE.md criado
- Ciclo 530-531: TYPE VIOLATION documentada; swarm blocker
- Ciclo 528: DEC-004 CRITICA identificada
