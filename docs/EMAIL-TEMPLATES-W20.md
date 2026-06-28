# Wave 20 — Email Templates & Welcome Sequence

> Documentação operacional do sistema de emails transacionais e welcome series.
> Adicionado em 2026-06-28 sobre a base Wave 14 (newsletter digest).

---

## 1. Visão geral

O sistema de emails do Akasha Portal é dividido em três pipelines:

| Pipeline | Origem | Templates | Trigger |
|---|---|---|---|
| **Newsletter digest** (Wave 14) | `newsletter.ts` | digest semanal/mensal | Cron `weekly-digest` |
| **Welcome series** (Wave 20) | `sequences.ts` | `welcome`, `welcome-day2`, `welcome-day7` | Endpoint `subscribe-welcome` |
| **Transactional + notifications** (Wave 20) | `templates/*.ts` | 8 templates | Helpers de domínio (comment, like, etc) + auth flows |

Todos os pipelines compartilham:
- **Tabela `email_jobs`** (Postgres) — queue genérica com retry + backoff
- **Helper `send.ts`** — wrapper Resend HTTP API (stub mode sem `RESEND_API_KEY`)
- **Layout `layout.ts`** — wrapper HTML 600px mobile-first com footer LGPD

---

## 2. Tabela `email_jobs` (Wave 20)

Migration: `prisma/migrations/20260628_wave20_email_queue/migration.sql`

```sql
CREATE TABLE email_jobs (
  id              TEXT PRIMARY KEY,
  "userId"        TEXT,
  "toEmail"       TEXT NOT NULL,
  "templateId"    TEXT NOT NULL,
  payload         JSONB NOT NULL DEFAULT '{}',
  "scheduledFor"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status          TEXT NOT NULL DEFAULT 'PENDING',  -- PENDING|SENT|FAILED|CANCELLED
  attempts        INT NOT NULL DEFAULT 0,
  "maxAttempts"   INT NOT NULL DEFAULT 3,
  "lastAttemptAt" TIMESTAMPTZ,
  "sentAt"        TIMESTAMPTZ,
  "failedAt"      TIMESTAMPTZ,
  "errorMessage"  TEXT,
  "campaignId"    TEXT,                            -- agrupa jobs (ex: 'welcome:user_xyz')
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Por que uma tabela dedicada (em vez de reaproveitar `notifications`)?**
- `notifications` é o feed in-app (com `read`, `readAt`, `actorSnapshot`, etc) — não é um pipeline outbound.
- `email_jobs` precisa de `scheduledFor`, `attempts`, `errorMessage`, `campaignId` — semânticas diferentes.
- Separação clara = queries mais simples e índices mais limpos.

### Como rodar a migration

```bash
# Aplicar localmente (precisa de DATABASE_URL apontando para Postgres local ou remote)
pnpm prisma migrate deploy

# Verificar
psql $DATABASE_URL -c "SELECT status, COUNT(*) FROM email_jobs GROUP BY status;"
```

> ⚠️ **Importante:** a migration **não atualiza `schema.prisma`**. O código usa `$queryRaw` / `$executeRaw` direto, então **TSC continua verde sem `prisma generate`**. Quando o time decidir formalizar no schema Prisma, é só adicionar o model e remover os `$queryRaw`.

---

## 3. Lista de templates

Todos os templates vivem em `src/lib/email/templates/` e exportam uma função `render(data, options)` que retorna `{ subject, html, text }`.

### 3.1 Welcome Series (3 emails)

| Template | Quando | Subject | Tom |
|---|---|---|---|
| `welcome.ts` | Day 0 (imediato) | `🌅 Bem-vindo(a) à Cabala dos Caminhos, {nome}` | Acolhida + mapa do app |
| `welcome-day2.ts` | Day 2 | `🔮 Como funciona a Akasha IA — e quando confiar (e duvidar) dela` | Didático, respeito + limites |
| `welcome-day7.ts` | Day 7 | `✨ Uma semana de caminho — como foi sua primeira reflexão?` | Reflexão + convite ao primeiro post |

**Triggers:** `scheduleWelcomeSeries(user)` em `sequences.ts` — agenda os 3 jobs com `scheduledFor` = now/+2d/+7d. Idempotente (não duplica se já existe campanha ativa para o user).

### 3.2 Transactional (2 emails)

| Template | Quando | Subject | Footer |
|---|---|---|---|
| `verify-email.ts` | Após signup | `✉️ Confirme seu email — Cabala dos Caminhos` | transactional (sem unsubscribe) |
| `password-reset.ts` | User pede reset | `🔑 Redefinição de senha — Cabala dos Caminhos` | transactional (sem unsubscribe) |

> ⚠️ Templates transacionais **NÃO** incluem link de unsubscribe — o usuário precisa deles para usar a conta. Footer é minimalista.

### 3.3 Notifications (6 emails)

| Template | Quando | Subject |
|---|---|---|
| `comment-notification.ts` | Alguém comenta no seu post | `💬 {nome} comentou no seu post` |
| `like-notification.ts` | Alguém curte seu post | `❤️ {n} curtidas no seu post` |
| `mention-notification.ts` | Alguém te menciona | `📣 {nome} te mencionou` |
| `follow-notification.ts` | Novo seguidor | `🚶 {nome} começou a te seguir` |
| `mentorship-request.ts` | Mentee pede mentoria | `🙏 {nome} pediu mentoria em {tradição}` |
| `event-reminder.ts` | 24h antes do evento | `🗓️ Amanhã: {título}` |

**Triggers:** `scheduleNotificationEmail({...})` em `sequences.ts`. Respeita `NotificationPreference.email` do destinatário (default = true).

---

## 4. Como funciona o pipeline

### 4.1 Fluxo de envio

```
[Domain code]
   ↓ scheduleWelcomeSeries(user)
[enqueueBatch] → INSERT email_jobs (status=PENDING, scheduledFor=...)
   ↓
[email_jobs table]
   ↓ (cron roda a cada 15min)
[/api/cron/process-email-queue]
   ↓ claimPendingJobs(25)
[sendEmail] → Resend HTTP API
   ↓ ok
[markSent] → UPDATE email_jobs SET status=SENT
   ↓ fail
[markFailed] → backoff exponencial (5min, 15min, 45min) até maxAttempts=3
```

### 4.2 Modos de operação

| Modo | Quando | Comportamento |
|---|---|---|
| **Live** | `RESEND_API_KEY` definido | POST real para `https://api.resend.com/emails` + tracking analytics |
| **Stub** | `RESEND_API_KEY` ausente | `console.log` apenas — útil para dev/test/CI |

> O stub mode é o default em ambiente de dev. Verifique os logs do servidor para confirmar que templates estão sendo renderizados corretamente.

### 4.3 Retry & DLQ

- `attempts` começa em 0, incrementa a cada tentativa
- `maxAttempts = 3` por padrão
- Backoff: `5min × 3^attempts` (5min, 15min, 45min)
- Após `attempts >= maxAttempts`, status vira `FAILED` e o job é removido do pool
- `getQueueStats()` retorna contadores PENDING/SENT_24h/FAILED_24h para dashboards

---

## 5. LGPD compliance

### 5.1 Footer padrão (marketing)

Todo email marketing inclui:
- Link "Cancelar inscrição" (token-based, sem login)
- Link "Preferências de email" (settings do user)
- Endereço do remetente
- Linha "Enviado com respeito e em conformidade com a LGPD"

### 5.2 Unsubscribe token

`getOrCreateUnsubscribeToken(userId, type)` em `sequences.ts` reusa o modelo `UnsubscribeToken` (já existente no schema):
- Token opaco (UUID v4), expira em 90 dias
- `type` específico (ex: `'welcome'`, `'comment'`) → desinscreve só daquele tipo
- `type = null` → desinscreve de TODOS os emails

> ⚠️ **TODO Wave 21:** criar endpoint `GET /api/email/unsubscribe?token=...&type=...` que consome o token e atualiza `NotificationPreference.email = false` para o type correspondente.

### 5.3 Privacy

- **Nunca logar email cru** em produção — `hashEmailForAnalytics()` no tracking
- `payload` em `email_jobs` pode conter PII (ex: `displayName`) — considerar purge após 90 dias
- Audit log sugerido para envios de emails sensíveis (verify-email, password-reset) — pendente para Wave 21

---

## 6. Como testar

### 6.1 Localmente (sem Resend)

```bash
# 1. Aplicar a migration
pnpm prisma migrate deploy

# 2. Garantir que RESEND_API_KEY NÃO está no .env.local
# (assim entra em stub mode e loga no console)

# 3. Disparar manualmente
curl -X POST http://localhost:3000/api/email/subscribe-welcome \
  -H "Content-Type: application/json" \
  -H "x-dev-user-id: USER_ID_DO_BANCO" \
  -d '{}'

# 4. Processar queue manualmente
curl http://localhost:3000/api/cron/process-email-queue \
  -H "Authorization: Bearer qualquer-coisa-em-dev"

# 5. Ver logs no console — cada email mostra subject + destinatário
```

### 6.2 Com Mailtrap (sandbox SMTP-like)

Mailtrap não é necessário aqui porque usamos Resend (não SMTP). Para testar **visualmente** como o email chega:

1. Crie conta em [resend.com](https://resend.com) (free tier = 100 emails/dia)
2. Adicione `RESEND_API_KEY=<sua-key>` em `.env.local`
3. Use o **domínio de teste do Resend** (`onboarding@resend.dev`) como `NEWSLETTER_FROM_EMAIL`
4. Os emails chegarão em **qualquer endereço** (sem precisar configurar DNS)
5. Verifique o dashboard do Resend para ver subjects, recipients, bounces

### 6.3 Com Resend sandbox

Resend oferece **test mode** automaticamente para `onboarding@resend.dev`:
- Aceita qualquer `to` (não precisa ser domínio verificado)
- Mostra preview no dashboard
- Não conta no limite mensal (em alguns planos)

### 6.4 Validar HTML renderizado

Para inspecionar o HTML gerado sem enviar:

```typescript
import { renderTemplate } from '@/lib/email/templates';

const rendered = renderTemplate('welcome', {
  displayName: 'Maria',
  traditions: ['cabala', 'ifa'],
  onboardingUrl: 'https://...',
  communityUrl: 'https://...',
});

console.log(rendered.subject);
console.log(rendered.html.slice(0, 500)); // primeiros 500 chars
```

Salvar o HTML em arquivo e abrir no browser permite validar:
- Responsividade (redimensione a janela)
- Fallbacks de imagem
- Compatibilidade com diferentes clients (Gmail, Outlook, Apple Mail)

---

## 7. Como adicionar um template novo

1. **Criar arquivo** em `src/lib/email/templates/meu-template.ts`:

```typescript
import { renderLayout, renderCta, escapeHtml } from '@/lib/email/layout';
import type { RenderOptions, RenderedTemplate } from '@/lib/email/templates/index';

export interface MeuTemplateData {
  recipientName: string;
  // ... seus campos
}

export function renderMeuTemplate(
  data: MeuTemplateData,
  options: RenderOptions = {}
): RenderedTemplate {
  const subject = '...';
  const bodyHtml = `...`;
  const html = renderLayout({
    bodyHtml,
    preheader: '...',
    subject,
    footer: 'marketing',
    unsubscribeToken: options.unsubscribeToken,
    unsubscribeType: 'meu-template',
  });
  const text = '...';
  return { subject, html, text };
}
```

2. **Registrar** em `templates/index.ts`:
   - Adicionar ao type union `TemplateId`
   - Adicionar ao `TemplateDataMap`
   - Adicionar case no `switch` do `renderTemplate`

3. **Usar** via:
   - `sendEmail({ to, templateId: 'meu-template', data: {...} })` para envio direto
   - `enqueueEmail({ toEmail, templateId: 'meu-template', payload: {...} })` para agendar

---

## 8. Cron / Vercel config

`vercel.json` foi atualizado com:

```json
"crons": [
  { "path": "/api/cron/weekly-digest", "schedule": "0 12 * * 1" },
  { "path": "/api/cron/process-email-queue", "schedule": "*/15 * * * *" }
]
```

- `weekly-digest`: toda segunda 12:00 UTC (= 09:00 BRT)
- `process-email-queue`: a cada 15 minutos

Ambos autenticam via header `Authorization: Bearer ${CRON_SECRET}`.

---

## 9. Arquivos criados

| Arquivo | LOC | Responsabilidade |
|---|---|---|
| `src/lib/email/layout.ts` | 215 | Wrapper HTML 600px mobile-first + footer LGPD |
| `src/lib/email/send.ts` | 250 | sendEmail / sendBatch / processEmailQueue |
| `src/lib/email/db.ts` | 195 | Raw queries sobre email_jobs (enqueue/claim/mark/cancel/stats) |
| `src/lib/email/sequences.ts` | 220 | scheduleWelcomeSeries + helpers de notification |
| `src/lib/email/templates/index.ts` | 100 | Barrel export + renderTemplate dispatcher |
| `src/lib/email/templates/welcome.ts` | 130 | Day 0 — boas-vindas |
| `src/lib/email/templates/welcome-day2.ts` | 105 | Day 2 — Akasha IA |
| `src/lib/email/templates/welcome-day7.ts` | 130 | Day 7 — primeira reflexão |
| `src/lib/email/templates/verify-email.ts` | 60 | Confirmação signup |
| `src/lib/email/templates/password-reset.ts` | 75 | Reset de senha |
| `src/lib/email/templates/comment-notification.ts` | 75 | Notif comentário |
| `src/lib/email/templates/like-notification.ts` | 75 | Notif like |
| `src/lib/email/templates/mention-notification.ts` | 75 | Notif menção |
| `src/lib/email/templates/follow-notification.ts` | 75 | Notif novo follower |
| `src/lib/email/templates/mentorship-request.ts` | 95 | Solicitação mentoria |
| `src/lib/email/templates/event-reminder.ts` | 100 | Lembrete evento |
| `src/app/api/email/subscribe-welcome/route.ts` | 130 | Endpoint POST subscribe-welcome |
| `src/app/api/cron/process-email-queue/route.ts` | 90 | Cron GET/POST drena queue |
| `prisma/migrations/20260628_wave20_email_queue/migration.sql` | 80 | Cria tabela email_jobs |
| `docs/EMAIL-TEMPLATES-W20.md` | (este arquivo) | Documentação operacional |

**Total:** ~2.180 linhas de código + doc.

---

## 10. Pendências Wave 21+

- [ ] Endpoint `GET /api/email/unsubscribe?token=...&type=...` (consome token, atualiza pref)
- [ ] Audit log para envios sensíveis (verify-email, password-reset)
- [ ] Adicionar modelo `EmailJob` ao `schema.prisma` (substituir `$queryRaw`)
- [ ] Batching real de `comment-notification` (5+ comentários → 1 email com count=5)
- [ ] Test E2E do fluxo welcome (Playwright)
- [ ] Dashboard admin: `getQueueStats()` exibido em `/admin/queue`
- [ ] Purge automático de jobs SENT com >90 dias (cron de limpeza)
- [ ] Template `weekly-digest` migrado para usar o mesmo `layout.ts` (consistência visual)

---

## 11. Referências

- Wave 14 newsletter: `src/lib/email/newsletter.ts` (base do pipeline)
- Wave 14 endpoint: `src/app/api/newsletter/subscribe/route.ts`
- Wave 14 cron: `src/app/api/cron/weekly-digest/route.ts`
- Schema `unsubscribe_tokens`: `prisma/schema.prisma:1181`
- Schema `notification_preferences`: `prisma/schema.prisma:1140`
- Resend API docs: https://resend.com/docs/api-reference/emails/send-email
- LGPD: https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd
