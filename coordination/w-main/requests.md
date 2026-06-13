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

### DEC-004 — shadow/gift/siddhi vs Gene Keys (CRITICA) — ATUALIZADO Ciclo 536

**Problema**: shadow/gift/siddhi de Akasha e semanticamente identico a Gene Keys de Richard Rudd.

**DESCOBERTA CHAVE** (Ciclo 536):
- Motor JA TEM atribuicao em `synthesis-engine.ts:38`: `// Frequencia (Gene Keys inspired)`
- Glossario JA TEM entrada completa para Gene Keys com credit a Richard Rudd
- `reversed-systems.ts` ja mapeia Gene Keys como sistema moderno com atribuicao
- **Camada de motor: ATRIBUIDA CORRETAMENTE**
- **Camada de UI (labels): shadow/gift/siddhi visiveis para usuario**

**Recomendacao w-main (nao e decisao — e análise para integrator)**:
- (a) **Atribuir + Fortalecer**: Manter shadow/gift/siddhi na UI + adicionar nota de atribuicao
  "Inspirado em Gene Keys (Richard Rudd)" abaixo do seletor de nivel.
  Custo: 1 linha de codigo. Protecao: maxima.
- (b) **Renomear**: Mudar labels para "Padrao/Oferta/Realizacao" ou "Sombra/Dom/Transcendência".
  Custo: alto (mudar em toda a UI). Risco: confunde usuarios existentes.
- (c) **Confluencia natural**: arriscado sem advogado.
- (d) **Remover**: abandona o modelo — nao recomendado.

**Acao requerida do INTEGRADOR**: Escolher opcao (a) ou (b). w-main implementa.
**Pendente**: ha 12 ciclos

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
