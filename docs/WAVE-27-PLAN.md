# 🎯 Wave 27 Plan — Polish + Push + Deploy

> **Data:** 2026-06-28
> **Owner:** Coordinator + Coder + Ravena (QA)
> **Precedentes:** W24 (UX polish) · W25 (critical fixes WIP) · W26 (tests & validation)
> **Status:** 🟢 Pronto para execução após W25 fechar
> **Duração alvo:** 5-7 dias úteis (2 waves comprimidas)

---

## TL;DR

| Wave | Tema | Dias | Owner | Entregável principal |
|---:|---|---|---|---|
| **27** | Polish + Push | 3 | Coder + Ravena | `origin/main` pushed + Vercel preview live |
| **28** | Beta Launch Prep | 3 | PM (Tomás) + Growth | 50 vagas prontas + onboarding white-glove |
| **29** | Beta Go-Live + Monitoring | 4 | Growth + SRE | Primeiros 50 usuários ativos · métricas flowing |

**Cronograma total:** ~7-10 dias do início da W27 ao go-live da beta.

---

## Wave 27 — Polish + Push (3 dias)

### Dia 1 — Fechar W25 + Polish residual

#### Manhã (3h)

- [ ] **Fechar W25 WIP**
  - Commit W25 working tree (funnel-metrics admin gate)
  - Validar `/akashic-chat` critical fix + commit
  - Verificar TSC 0 errors pós-commits

- [ ] **Polish residual W24-25**
  - TECH-1: fechar 2 TODOs admin gate restantes (priorizar `cockpit/*` endpoints)
  - A11Y-1: avaliar Card semantic role (PARTIAL residual) — se < 2h, fechar
  - MOCK-1: limpar 4 mock data residuais (substituir por dados reais ou flag dev-only)

#### Tarde (3h)

- [ ] **Visual polish DS v2 (Wave 1 de 3)**
  - Migrar 5 pages prioritárias para `@/components/ui/v2/`:
    - `/feed` (MAIOR流量)
    - `/akashic-chat` (produto principal)
    - `/library`
    - `/groups/[slug]`
    - `/post/[id]`
  - Token-only colors (remover últimos `bg-[#hex]` se houver)
  - Adicionar `loading.tsx` onde faltar (W24 já cobriu 17/55)

#### Noite (1h)

- [ ] **Performance quick wins**
  - `npm run analyze:bundle` → identificar top-3 chunks > 200KB
  - Code-split pesado com `next/dynamic` se > 100KB no initial
  - `npm run check:bundle` para validar budget

### Dia 2 — Tests + Push preparation

#### Manhã (3h)

- [ ] **Test suite hardening**
  - `npm run test:run` → 100% PASS (ou documentar skips)
  - Adicionar 3 unit tests para fixes W25:
    - `__tests__/api/admin-funnel-metrics.test.ts` (requireAdmin gate)
    - `__tests__/api/akashic-chat-regression.test.ts` (critical fix)
    - `__tests__/lib/admin-session.test.ts` (helper)
  - Rodar `e2e:smoke` em headless → confirmar green

#### Tarde (3h)

- [ ] **Final validation gates**
  - `npm run quality` (lint + tsc + test + bundle) → green
  - `npm run build` (production build) → confirmar 0 warnings críticos
  - Revisar `git diff origin/main..HEAD` para garantir nada indesejado

#### Noite (1h)

- [ ] **Push preparation**
  - `git log --oneline origin/main..HEAD` — confirmar 7-10 commits com mensagens clean
  - `git log -p` — scan final de tokens/secrets (já redaction W23, mas double-check)
  - Documentar bypass de branch protection se necessário (sandbox não tem push direito)

### Dia 3 — Push + Deploy

#### Manhã (2h)

- [ ] **Push to origin/main** (owner action — sandbox não tem permissão)
  - Comando: `git push origin main`
  - Confirmar GitHub Actions: lint + typecheck + test + e2e → green
- [ ] **Vercel auto-deploy** (já configurado em W11)
  - Preview URL gerado em < 3min
  - Smoke prod: `curl -I https://cabaladoscaminhos.vercel.app/`

#### Tarde (2h)

- [ ] **Post-deploy verification**
  - [ ] Landing page (`/`) renderiza
  - [ ] `/akashic` page renderiza (chat principal)
  - [ ] Auth flow (`/login`, `/register`) funcional
  - [ ] Feed (`/feed`) carrega posts seed
  - [ ] PWA install funciona (iOS + Android)
  - [ ] Lighthouse mobile: Performance > 80, A11y = 97, Best Practices > 90

#### Noite (1h)

- [ ] **Smoke E2E em prod**
  - Playwright spec `smoke.spec.ts` apontando para prod URL
  - Capturar screenshots para archive
  - Documentar em `docs/DEPLOY-W27.md`

### Entregáveis Wave 27

| Tipo | Arquivo |
|---|---|
| Doc operacional | `docs/DEPLOY-W27.md` (smoke prod + Lighthouse scores) |
| Doc de go/no-go | `docs/W27-GO-NO-GO-CHECKLIST.md` (gates finais) |
| Updated roadmap | `docs/ROADMAP-Q3-2026.md` (atualizar status) |
| Git log | 1-3 commits clean em `origin/main` |

### Gates Wave 27 (exit criteria)

- [ ] `origin/main` 0 commits ahead do local (push feito)
- [ ] Vercel preview deploy = ✅
- [ ] TSC 0 errors
- [ ] `npm run quality` 100% green
- [ ] Lighthouse mobile: Perf > 80, A11y = 97, BP > 90
- [ ] Smoke prod 100% PASS
- [ ] Token/secrets scan clean

---

## Wave 28 — Beta Launch Prep (3 dias)

### Dia 1-2 — Conteúdo + Convites

- [ ] **Beta landing page** (`/beta`) — copy per `docs/BETA-LAUNCH-PLAYBOOK.md`
- [ ] **Email templates** (50 convites personalizados)
- [ ] **Onboarding white-glove flow** — manual de 14 dias (PM Tomás)
- [ ] **Activation metrics setup** — PostHog events configurados

### Dia 3 — Buffer + internal beta

- [ ] Internal beta (5 pessoas da equipe) — feedback loop
- [ ] Hotfix window (24h)
- [ ] Convites externos preparados (prontos para enviar Dia 1 da W29)

### Entregáveis Wave 28

- `/beta` page live em prod
- 50 emails de convite prontos
- `docs/BETA-EXEC-PLAYBOOK.md` (playbook operacional)
- Activation metrics dashboard setup

---

## Wave 29 — Beta Go-Live + Monitoring (4 dias)

### Dia 1 — Wave 1 da beta (10 pessoas)

- Enviar 10 convites
- Onboarding white-glove (chamada 30min cada)
- Coletar feedback imediato

### Dia 2 — Wave 2 da beta (20 pessoas)

- Enviar 20 convites (10 W1 + 20 W2)
- Monitorar activation metrics
- Hotfix qualquer issue crítico

### Dia 3 — Wave 3 da beta (50 total)

- Enviar últimos 20 convites
- Cobertura: 50/50 usuários ativos
- Daily standup interno

### Dia 4 — Monitor + Iterate

- Análise de métricas: D1, D7, D30 retention
- NPS survey
- Roadmap Wave 30+ baseado em feedback

### Entregáveis Wave 29

- 50 usuários ativos na plataforma
- `docs/BETA-W29-REPORT.md` (métricas + feedback)
- Roadmap Wave 30+ atualizado
- Post-mortem (good + bad)

---

## Cronograma Visual (10 dias)

```text
Dia 1    2    3    4    5    6    7    8    9    10
|--- W27 ---|--- W28 ---|------ W29 ------|
   Polish    Beta Prep   Beta Go-Live
   +Push     +Convites   +Monitor
   +Deploy
```

---

## Riscos + Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|:---:|:---:|---|
| W25 não fecha antes da W27 | 🟡 Média | 🔴 Push bloqueado | Owner valida W25 WIP no Dia 1 manhã, fallback = rebase admin gate |
| Vercel deploy quebra por env var | 🟡 Média | 🟡 Beta atrasa | Backup: Vercel preview environment duplicado + smoke test antes do push |
| Beta users não engajam | 🟡 Média | 🟡 Métricas ruins | White-glove onboarding + daily check-in PM primeira semana |
| Token leak recorrente | 🟢 Baixa | 🔴 Crítico | W23 redaction + scan no Dia 2 noite + Gitleaks pre-commit hook |
| Performance mobile ruim | 🟢 Baixa | 🟡 UX ruim | Lighthouse baseline no Dia 3 tarde; code-split se necessário |

---

## Owners por Wave

| Wave | Persona | Skills |
|---|---|---|
| 27 | Coder + Ravena (QA) | coder, qa |
| 28 | PM (Tomás) + Growth | pm, designer |
| 29 | Growth + SRE | pm, designer, performance |

---

## Definition of Done — Wave 27 (gate final antes da 28)

- [ ] Push para `origin/main` feito pelo owner
- [ ] Vercel deploy = ✅
- [ ] Smoke prod 100% PASS
- [ ] Lighthouse mobile: Perf > 80, A11y = 97, BP > 90
- [ ] TSC 0 errors
- [ ] `npm run quality` green
- [ ] `docs/DEPLOY-W27.md` publicado
- [ ] `docs/W27-GO-NO-GO-CHECKLIST.md` 100% checkado
- [ ] Owner aprova go para Wave 28

---

## Próximos Passos Imediatos

1. **Owner:** validar W25 WIP (funnel-metrics + akashic-chat) no Dia 1 da W27
2. **Coder:** commit W25 working tree + rodar TSC + smoke local
3. **Ravena:** rodar `npm run test:run` + `e2e:smoke` no Dia 2 manhã
4. **PM:** preparar `/beta` page + 50 emails no Dia 1-2 da W28
5. **Growth:** agendar cron para envio escalonado dos convites (W29)

---

## Referências

- `docs/WAVE-24-26-SUMMARY.md` — sumário consolidado W24-26
- `docs/BETA-LAUNCH-PLAYBOOK.md` — playbook beta (Wave 16, ainda válido)
- `docs/ROADMAP-Q3-2026.md` — roadmap Q3 atualizado
- `docs/PERFORMANCE-BUDGETS.md` — bundle + Lighthouse budgets
- `docs/CI-CD-GUIDE.md` — GitHub Actions + Vercel deploy
- `docs/HONEST-AUDIT-24-7.md` — limitações conhecidas do sistema