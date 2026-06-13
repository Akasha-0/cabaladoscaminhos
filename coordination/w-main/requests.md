# coordination/w-main/requests.md

## Escalacao ao Integrador — Ciclo 528 (v0.1.3)

**De**: w-main (main branch, executor + integrator)
**Data**: 2026-06-12
**Ciclo**: 528

---

### Itens pendentes por dominio

| # | Dominio | Item | Impacto | Prioridade |
|---|---------|------|---------|-----------|
| 1 | w-main | DEC-004 Gene Keys — decisao | Plagio vs confluencia natural vs renomear | CRITICA |
| 2 | w-main | Capacitor APK (`npx cap sync`) | APK Android funcional, nunca executado | ALTA |
| 3 | w4 | 241 test failures ambientais | Rotas ausentes + mock cookies + vitest | MEDIA |
| 4 | w1 | cross-engine `_kab`/`_date` | Remover params orfaos | BAIXA |
| 5 | w2 | feature/akasha-v0.0.12 rebase | I Ching Wings + Correlation Map | BAIXA |

---

### DEC-004 — shadow/gift/siddhi vs Gene Keys

**Problema**: shadow/gift/siddhi de Akasha e semanticamente identico a Gene Keys de Richard Rudd.

**4 opcoes**:
- (a) **Atribuir**: mencionar Gene Keys como inspiracao, creditar Richard Rudd
- (b) **Renomear**: mudar terminologia (ex: obscuridade/oferta/transcendencia)
- (c) **Confluencia natural**: manter, argumentando estrutura como folclore espiritual
- (d) **Remover**: abandonar shadow/gift/siddhi



### CONFITO DE DOMÍNIO — Ciclo 529

**Arquivo**: `apps/akasha-portal/src/components/akasha/AkashaSignificadoCard.tsx`
**Globs w2**: `apps/akasha-portal/src/components/**` — MATCHES
**w-main modificado**: ciclos 526, 527, 528 (defaultNivel fix, responsive CSS)
**Problema**: w-main vem modificando arquivo do domínio w2
**Ação requerida**: Integrador decide se (a) w2 absorve as mudanças, (b) w-main para de tocar, ou (c) domínio Clarificado em DOMAINS.md

**Risco**: Publicacao sem decisao → plagio confirmado → DMCA/dano reputacional.

---

## Historico

- Ciclo 523: P1 chainOfReasoning RESOLVIDO, CHECKPOINT written
- Ciclo 524-527: Features (PriorityAreasQuickView, F-224, F-225), quality cycles
- Ciclo 528: v0.1.3 released, 3 decisoes criticas pendentes
