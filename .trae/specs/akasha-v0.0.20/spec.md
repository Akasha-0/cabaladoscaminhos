# Akasha v0.0.20 — Especificação

**Data:** 2026-06-15
**Versão:** akasha-v0.0.20
**Status:** 📝 Draft — pronto para discussão
**Base:** v0.0.19 (Akasha Evolution) ✅ COMPLETO + gaps identificados

---

## Why — Propósito

v0.0.19 fechou o ciclo de **síntese narrativa + decisão** (F-223..F-228).
v0.0.20 fecha o ciclo de **engagement diário** (1 push = 1 retorno) +
**alcance bilíngue** (EN completo, não só summary).

O Akasha vive de 1 toque por dia. Sem idempotência, sem i18n EN
completo, e sem share target, o produto vira web app desktop-only.
v0.0.20 é o **GA da daily touchpoint mobile**.

## Decisões Tomadas

| # | Decisão | Opção | Alternativa |
|---|---------|-------|-------------|
| 1 | Idempotência do cron | **A** — `lastPushedAt` em pushSubscription, skip se hoje | Sem idempotência (risco de 2x push) |
| 2 | Push frequency | **A** — 1/dia às 7h BRT | 2/dia (manhã + noite) |
| 3 | i18n EN scope | **A** — translation-status note + summary (padrão já estabelecido em v0.0.19) | Full translation (custo proibitivo) |
| 4 | Web Share Target | **A** — receber conteúdo espiritual do usuário (texto) | Desabilitar (perde integração) |
| 5 | Timezone handling | **A** — armazenar timezone no user, ajustar cron dinamicamente | Cron fixo UTC (Brasília vê push em horário errado 4 meses/ano) |

---

## 1. Escopo

### 1.1 Daily Push GA (F-238)

```
pushSubscription table
├── lastPushedAt: DateTime?  (NEW — quando último push foi enviado)
├── ... (existing fields)
```

**Comportamento:**
- Cron `/api/cron/daily-push` agora SKIPA subs com `lastPushedAt` no mesmo dia (UTC)
- Idempotente: rodar 2x no mesmo dia = 1x push real
- Override manual: `?force=1` re-envia (debug/test)
- Atualiza `lastPushedAt = now()` após `sendPush` bem-sucedido

**Schema migration:** Adicionar `lastPushedAt DateTime?` ao `PushSubscription`.
Prisma migration: `20260615000000_push_last_pushed_at`.

**Trade-off:** Skip idempotency para 1x/dia. Para 2x/dia, adicionar campo
`lastPushedPeriod: 'morning' | 'evening'`.

### 1.2 Timezone-aware push (F-239)

```
User table
├── timezone: String  @default("America/Sao_Paulo")  (NEW)
├── ... (existing fields)
```

**Comportamento:**
- Cada usuário tem seu próprio timezone (default BRT)
- Cron global roda 1x por hora; em cada tick, seleciona users cujo
  timezone local é 7:00 AM
- Ou: cron global 4x/dia (UTC 8, 11, 14, 17) + checa timezone local

**Trade-off:** Schema migration pequena + lógica complexa vs cron fixo
que erra 4 meses/ano para fora do BRT.

### 1.3 Web Share Target API (F-240)

**Comportamento:**
- Usuário compartilha link do Instagram/Twitter com texto "quero entender"
- PWA recebe via Share Target → cria rascunho de pergunta para o Mentor
- OU: compartilha foto do céu com texto → cria reading de astrologia

**Manifest update:**
```json
"share_target": {
  "action": "/compartilhar/receber",
  "method": "POST",
  "enctype": "multipart/form-data",
  "params": {
    "title": "title",
    "text": "text",
    "url": "url"
  }
}
```

### 1.4 i18n EN completion (F-241)

- Levar cobertura de EN de ~15% (apenas summary) para ~80%
- Traduzir TODAS as strings em `messages/en.json` que têm `pt-BR` counterpart
- Validar paridade com `pnpm i18n:check` (já existe)
- Não traduzir: nomes próprios (Babalaô, Orixás, etc), citações bíblicas

### 1.5 Test coverage (F-242)

- Adicionar tests para synthesis-engine (atualmente 0% coverage)
- Cobrir 6 áreas + daily decision + AkashaAuthority
- Foco: shadow/gift/siddhi derivation (lógica mais complexa)

---

## 2. NÃO está no escopo

- Notificações push para mudanças no mapa do usuário (apenas daily)
- In-app messaging / chat com o Mentor (F-244+)
- Integração com calendário do usuário
- Lembretes de prática (1 prática por dia já vem do DailyContent)
- Push para iOS Safari (PWA-only; Capacitor é upgrade path em F-228)

---

## 3. Critérios de Done

- [ ] Schema migration aplicada + Prisma regenerate
- [ ] `lastPushedAt` no `pushSubscription`
- [ ] `timezone` no `User` (default BRT)
- [ ] Cron `/api/cron/daily-push` idempotente (skip se hoje)
- [ ] Cron `/api/cron/hourly-push` timezone-aware
- [ ] Manifest.json com `share_target`
- [ ] `/compartilhar/receber` route + handler
- [ ] i18n EN paridade 80%+
- [ ] 5+ tests novos (synthesis-engine)
- [ ] Typecheck 0 errors
- [ ] Lint 0 errors
- [ ] Cron test: idempotency (rerun = no double push)
- [ ] Cron test: timezone math
- [ ] Share target E2E test

---

## 4. Workstreams

### WS-1: Daily Push Idempotency
- Migrations Prisma (1 arquivo)
- `lastPushedAt` em `pushSubscription` Prisma client
- Update `daily-push/route.ts` para skip se hoje
- Test: rerun cron = 0 novo push

### WS-2: Timezone-aware cron
- `timezone` em `User` (migration)
- Novo cron `/api/cron/hourly-push` (roda cada hora)
- `getUsersInLocalMorning(7am)` helper
- Test: timezone math (SP, NY, Tokyo)

### WS-3: Web Share Target
- Manifest update (já tem share_target placeholder, preencher)
- `/compartilhar/receber` route
- Server-side: parse `text` + criar rascunho de consulta
- Test: parse multipart form data

### WS-4: i18n EN completion
- Audit `messages/en.json` vs `messages/pt-BR.json`
- Traduzir gaps (manual ou i18n auto)
- Validar paridade com `pnpm i18n:check`
- CI check: paridade mínima 80%

### WS-5: Test coverage
- `tests/lib/application/akasha/synthesis-engine.test.ts` (novo)
- 5+ tests cobrindo `assessAreaFrequency`, `deriveDailyDecision`, `deriveSexualArchetype`
- Update v0.0.19 checklist

---

## 5. Notas Técnicas

### 5.1 Stack

- Next.js 16.2+ (App Router, Fluid Compute)
- Prisma 7+ (PostgreSQL)
- Web Push API (já implementado)
- Vercel cron (idempotência + multiple schedules)
- Service Worker (já registrado)

### 5.2 Backward compatibility

- `lastPushedAt` nullable: subs existentes recebem `null` = primeira execução envia
- `timezone` default BRT: users existentes recebem BRT (sem impacto)
- Cron signature inalterado: clientes Vercel não precisam atualizar

### 5.3 Risks

| Risco | Mitigação |
|---|---|
| Migration breaking prod | Test em dev, `prisma migrate deploy` em CI |
| Cron failure (Vercel outage) | Retry policy + alerting no Sentry (F-244) |
| i18n auto-translation introducing errors | Manual review dos 100 termos mais frequentes |
| Share target sem suporte (iOS Safari < 12.1) | Fallback para `/compartilhar/colar` (textarea) |

---

## 6. Relacionado

- v0.0.19 spec (Akasha Evolution) — base ✅
- F-228 Mobile Strategy (PWA-first) — implementa share target
- R-022 Ethics Charter — guides i18n content curation
- Doc 25 §11 (Push) — define VAPID setup

---

## 7. Estimativa

- WS-1 (Idempotency): 1-2h (1 small migration + 1 cron update + 1 test)
- WS-2 (Timezone): 2-3h (migration + new cron + helper + tests)
- WS-3 (Share target): 1-2h (manifest + route + test)
- WS-4 (i18n EN): 3-5h (audit + translate + validate)
- WS-5 (Test coverage): 2-3h (5+ tests)

**Total:** 9-15h de trabalho autonomous (1-2 sprints de 8h)

---

**Status:** 📝 Draft — aguardando review antes de implementation
**Próximo passo:** Criar tasks.md + checklist.md detalhados por WS
**Reviewers:** TBD
