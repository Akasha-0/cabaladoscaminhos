# coordination/w-main/requests.md

## Escalação ao Integrador — Ciclo 528 (v0.1.2)

**De**: w-main (main branch, executor + integrator)
**Data**: 2026-06-12
**Ciclo**: 528

---

### Itens pendentes por domínio

| # | Domínio | Item | Impacto | Prioridade |
|---|---------|------|---------|-----------|
| 1 | w-main | DEC-004 Gene Keys — decisão | Plágio vs confluência natural vs renomear | 🔴 CRÍTICA |
| 2 | w-main | Capacitor APK (`npx cap sync`) | APK Android funcional, nunca executado | 🔴 ALTA |
| 3 | w4 | 241 test failures ambientais | Rotas ausentes + mock cookies + vitest | 🟡 MÉDIA |
| 4 | w1 | cross-engine `_kab`/`_date` | Remover params órfãos — 0 chamadas externas | 🟢 BAIXA |
| 5 | w2 | feature/akasha-v0.0.12 rebase | I Ching Wings + Correlation Map — 50 commits atrás | 🟢 BAIXA |

---

### DEC-004 — shadow/gift/siddhi vs Gene Keys

**Problema**: shadow/gift/siddhi de Akasha é semanticamente idêntico a Gene Keys de Richard Rudd.
O nome "Gene Keys" é marca registrada. Estrutura de 3 níveis (shadow/gift/siddhi) é a mesma.

**4 opções**:
- (a) **Atribuir**: mencionar Gene Keys como inspiração, creditar Richard Rudd
- (b) **Renomear**: mudar terminologia (ex: obscuridade/oferta/transcendência)
- (c) **Confluência natural**: manter, argumentando estrutura como folclore espiritual
- (d) **Remover**: abandonar shadow/gift/siddhi, substituindo por modelo puramente 5 tradições

**Risco**: Publicação sem decisão → plágio confirmado → DMCA/dano reputacional.

---

## Escalação ao Integrador — Ciclo 526 (RESOLVIDO)

### AÇÕES RESOLVIDAS

| Item | Status | Ação |
|------|--------|------|
| P1 chainOfReasoning | ✅ RESOLVIDO | Confirmado em `AkashaLifeAreasDashboard.tsx:476` |
| `./setup-swarm.sh` | ✅ JÁ EXISTE | `coordination/` infraestrutura existe |
| feature/akasha-v0.0.12 | ⏳ PENDENTE | 50 commits atrás — baixa prioridade |
| Test failures (241) | ⏳ PENDENTE | w4 necessário |
| cross-engine _kab/_date | ⏳ PENDENTE | Backlog w1 |

### Histórico

- Ciclo 523: P1 chainOfReasoning ✅ RESOLVIDO, CHECKPOINT written
- Ciclo 524-527: Features (PriorityAreasQuickView, F-224, F-225), quality cycles
- Ciclo 528: v0.1.3 released, 3 decisões críticas pendentes (DEC-004, Capacitor, tests)
