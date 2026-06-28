# Newsletter Wave 14 — Deliverable Notes

**Data:** 2026-06-27
**Wave:** 14 — Newsletter + Weekly Digest
**Status:** ✅ Files created | ⚠️ TSC verification blocked (env)

---

## Entregue (todos os arquivos criados e inspecionáveis)

### 1. Schema — `prisma/schema.prisma`
- Enum `NewsletterFrequency { WEEKLY, MONTHLY, NEVER }`
- Model `NewsletterSubscription { id, email, userId?, traditions[], frequency, unsubscribedAt?, unsubscribeToken, createdAt, updatedAt }`
- Model `Newsletter { id, subject, contentMarkdown, traditionsFilter[], sentAt?, recipientCount, composedBy?, createdAt, updatedAt }`
- Back-relation em `User.newsletterSubscription`

### 2. Migration SQL — `prisma/migrations/20260627_030000_newsletter/migration.sql`
- Idempotente: `IF NOT EXISTS` / `DROP IF EXISTS` / `DO $$ ... $$`
- Enum + 2 tabelas + 5 índices + 2 triggers de updatedAt + verificação final

### 3. Helper — `src/lib/email/newsletter.ts`
- `composeDigest('weekly' | 'monthly')` — pega top posts da semana (likesCount desc) + top artigos publicados, monta markdown
- `sendNewsletter(id)` — dispara via Resend HTTP API direto (sem SDK); stub quando `RESEND_API_KEY` ausente; idempotente (só envia se `sentAt === null`)
- `renderMarkdownToHtml` — conversor MD → HTML inline mínimo (sem deps)
- `buildUnsubscribeUrl(token)` — link público com token

### 4. API endpoints (4 routes)
- `POST /api/newsletter/subscribe` — signup com preferences; idempotente via `upsert`; reativa se re-assinar
- `POST /api/newsletter/unsubscribe` — soft delete via token ou email
- `PATCH /api/newsletter/preferences` — atualiza tradições/frequência; identifica via viewer ou email
- `POST /api/admin/newsletter/send` — admin: compõe (auto ou manual) e envia; auth via `x-admin-secret` header

### 5. Cron handler — `/api/cron/weekly-digest`
- Suporta GET e POST (Vercel Cron usa GET)
- Auth: `Authorization: Bearer ${CRON_SECRET}`
- Roda `composeDigest('weekly')` + cria Newsletter + `sendNewsletter(id)`
- Modo dev permissive se CRON_SECRET ausente

### 6. Pages
- `src/app/(info)/newsletter/page.tsx` — signup form + preview do último digest
- `src/app/(info)/newsletter/signup-form.tsx` — client component (tradições + frequência)
- `src/app/(admin)/newsletter/page.tsx` — listagem + stats (total/ativos/rascunhos)
- `src/app/(admin)/newsletter/composer.tsx` — auto (composeDigest) ou manual (markdown)

---

## Verificação

### TSC — ⚠️ BLOQUEADO por timeout do sandbox

Tentei rodar `tsc --noEmit --project tsconfig.json` duas vezes; ambas excederam
o limite (250s) do sandbox cloud. Sintoma: `git status`, `git rev-parse HEAD`,
`ls` dentro de `/workspace/cabaladoscaminhos` também travam. Indica que o
processo de TypeScript consumiu memória/CPU do sandbox e o ambiente ainda não
recuperou totalmente (mesmo `echo ok` retorna rápido, mas qualquer operação de
filesystem em massa trava).

**Não fabricado:** o `npx tsc --noEmit` foi iniciado, mas não houve output.
Próximo passo sugerido: rodar localmente ou em CI para confirmar `0 errors`.

### Prisma generate — não executado
Mesmo motivo: sandbox travado em operações de filesystem. O schema está
pronto para `prisma migrate dev` ou `prisma db push`.

---

## Variáveis de ambiente necessárias

```bash
# Envio de email (opcional — sem ela vira stub)
RESEND_API_KEY=re_xxx

# From address (default: "Cabala dos Caminhos <contato@cabala.dos.caminhos>")
NEWSLETTER_FROM_EMAIL=Cabala dos Caminhos <newsletter@cabala.dos.caminhos>

# Site URL (default: https://cabala-dos-caminhos.vercel.app)
NEXT_PUBLIC_SITE_URL=https://cabala-dos-caminhos.vercel.app

# Admin endpoint secret (header x-admin-secret)
ADMIN_NEWSLETTER_SECRET=...

# Vercel Cron (header Authorization: Bearer)
CRON_SECRET=...
```

---

## Cron scheduling (sugestão para vercel.json)

```json
{
  "crons": [
    {
      "path": "/api/cron/weekly-digest",
      "schedule": "0 12 * * 1"
    }
  ]
}
```

Nota: `0 12 * * 1` UTC = 9h BRT (UTC-3) às segundas.

---

## Como testar localmente

```bash
# 1. Aplicar migration
pnpm db:migrate

# 2. Iniciar dev server
pnpm dev

# 3. Assinar (sem auth)
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H 'Content-Type: application/json' \
  -d '{"email":"teste@exemplo.com","traditions":["cabala","ifa"],"frequency":"WEEKLY"}'

# 4. Disparar digest manualmente (modo dev)
curl -X POST http://localhost:3000/api/cron/weekly-digest

# 5. Acessar UI
# http://localhost:3000/newsletter         (público)
# http://localhost:3000/admin/newsletter   (admin)
```

---

## Notas de design

- **Resend stub:** sem `RESEND_API_KEY`, `sendNewsletter` loga cada envio no
  console (não chama Resend). Útil para dev/CI.
- **Idempotência:** `sendNewsletter` consulta `sentAt !== null` antes de enviar
  e marca como enviado após. Re-chamar = `error: 'already_sent'`.
- **Filtro de tradição:** recipients com `traditions: []` recebem qualquer
  filtro (catch-all). Recipients com filtro específico só recebem edições cujo
  `traditionsFilter` faz interseção (`hasSome`).
- **Unsubscribe token:** gerado automaticamente via `@default(cuid())` na
  migration SQL — é o id único usado em links públicos (sem login).
- **HTML inline:** template de email é gerado em runtime (sem MJML), em linha
  única, mobile-friendly (table-based, viewport meta, Georgia serif).
