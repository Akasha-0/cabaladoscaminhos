# coordination/w-main/requests.md

## Escalacao ao Integrador — Ciclo 530 (v0.1.2)

**De**: w-main (main branch, executor + integrator)
**Data**: 2026-06-12
**Ciclo**: 530

---

### Itens pendentes por dominio

| # | Dominio | Item | Impacto | Prioridade |
|---|---------|------|---------|-----------|
| 1 | w-main | DEC-004 Gene Keys — decisao | Plagio vs confluencia natural vs renomear | CRITICA |
| 2 | w2 | DOMÍNIO VIOLATION — AkashaSignificadoCard | w-main modificou dominio w2 ciclos 526-529 | CRITICA |
| 3 | w-main | Capacitor APK (`npx cap sync`) | APK Android funcional, nunca executado | ALTA |
| 4 | w4 | 241 test failures ambientais | Rotas ausentes + mock cookies + vitest | MEDIA |
| 5 | w1 | cross-engine `_kab`/`_date` | Remover params orfaos | BAIXA |

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

### VIOLACAO DE DOMÍNIO — Ciclos 526-529

**Arquivo**: `apps/akasha-portal/src/components/akasha/AkashaSignificadoCard.tsx`
**Arquivo**: `apps/akasha-portal/src/components/akasha/dashboard/AkashaLifeAreasDashboard.tsx`
**Globs w2**: `apps/akasha-portal/src/components/**` — MATCHES
**w-main modificou**: ciclos 526, 527, 528, 529 (defaultNivel fix, responsive CSS, dead import removal)

**Problema**: w-main vem modificando arquivos do dominio w2 sem autoridade. DOMAINS.md nao concede permissao para `apps/` em w-main.

**Historico das mudancas w-main em dominio w2**:
- Ciclo 526: AkashaSignificadoCard defaultNivel prop added
- Ciclo 527: AkashaLifeAreasDashboard dead import removido
- Ciclo 527: AkashaSignificadoCard padding responsivo (clamp, maxWidth, overflow)
- Ciclo 529: akasha-significado-card.tsx defaultNivel fix (ja em w2 domain)

**Acao requerida**: Integrador decide:
(a) w2 absorve as mudancas como suas (worktree `loop/w2`)
(b) w2 valida e rejeita se necessario
(c) DOMAINS.md clarificado para evitar violacoes futuras

---

## Historico

- Ciclo 529: TYPE VIOLATION detectada — w-main violou dominio w2
- Ciclo 528: v0.1.3 released, DEC-004 pendente
- Ciclo 527: Features (PriorityAreasQuickView, F-224, F-225)
- Ciclo 526: defaultNivel regression fix (DOMINIO w2 — VIOLACAO)
- Ciclo 523-525: P1 chainOfReasoning, audit cycles
