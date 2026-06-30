# Beta Invite System — Wave 32

> Sistema de convites beta com tokens HMAC-SHA256, single-use, expiração por onda, e auditoria LGPD.
> 50 vagas · 3 ondas · janela de 7-14 dias · integrado a Resend (stub em dev).

**Status:** ✅ SHIPPED (2026-06-30) · Wave 32 / 8
**Sessão:** 414842899996915
**Branch:** main (commit local; sem push por restrição de token)

---

## 1. Visão geral

A Cabala dos Caminhos abre 50 vagas de beta fechada em 3 ondas. Cada convite é:

- **Token HMAC-SHA256** (32 bytes random + assinatura) — plaintext nunca persiste
- **Single-use** — marcado como `ACCEPTED` no aceite; reuso bloqueado atomicamente
- **Com expiração** — 14d (Wave 1), 10d (Wave 2), 7d (Wave 3) — configurável por env
- **Auditável** — toda operação sensível grava em `audit_logs` (LGPD Art. 37)
- **LGPD-compliant** — email é PII mas nunca é logado em plaintext; token nunca aparece em logs

A máquina de estados (`InviteStatus`):

```
PENDING ──► SENT ──► OPENED ──► ACCEPTED  (happy path)
   │          │                      ▲
   │          └──► EXPIRED ──────────┤
   │                                 │
   └──► REVOKED  ◄────────────────────┘  (admin cancela)
```

---

## 2. Modelo de dados (Prisma)

Adicionado a `prisma/schema.prisma`:

```prisma
enum InviteStatus {
  PENDING    // gerado, email ainda não enviado
  SENT       // email enviado; aguardando destinatário abrir
  OPENED     // destinatário abriu (pixel tracking)
  ACCEPTED   // converteu em conta (token consumido)
  EXPIRED    // expirou sem aceite
  REVOKED    // admin cancelou
}

model BetaInvite {
  id            String        @id @default(cuid())
  email         String
  token         String        @unique   // HMAC-SHA256 hash
  wave          Int                          // 1, 2, 3
  status        InviteStatus  @default(PENDING)
  sentAt        DateTime?
  openedAt      DateTime?
  acceptedAt    DateTime?
  expiresAt     DateTime
  inviterId     String?
  inviter       User?         @relation(...)
  userId        String?       // preenchido após aceite
  user          User?         @relation("BetaInviteAcceptor", ...)
  metadata      Json?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([email, status])
  @@index([token])
  @@index([wave])
  @@index([status, expiresAt])
  @@index([inviterId])
  @@map("beta_invites")
}
```

O `User` ganhou duas relations inversas: `betaInvitesSent` (quem gerou) e `betaInvitesAccepted` (quem consumiu).

---

## 3. Segurança do token

### 3.1 Geração

```ts
// src/lib/beta/token.ts
export function generateInviteToken(): { plaintext: string; hash: string } {
  const random = randomBytes(32).toString('base64url'); // 43 chars
  const hash = createHmac('sha256', getHmacKey()).update(random).digest('hex'); // 64 chars
  return { plaintext: random, hash };
}
```

- **Plaintext** = 32 bytes random `base64url` (~43 chars, charset `[A-Za-z0-9_-]`)
- **Hash** = HMAC-SHA256, hex 64 chars, persistido no DB
- **Chave HMAC** = `process.env.BETA_INVITE_HMAC_KEY` (≥ 32 chars). Sem env em prod, a função lança — fail closed.

### 3.2 Validação

```ts
export function validateInviteToken(
  plaintext: string,
  storedHash: string
): { ok: true } | { ok: false; reason: 'invalid_format' | 'hash_mismatch' | 'tampered' }
```

- Regex estrito no plaintext (`^[A-Za-z0-9_-]{32,64}$`)
- Regex hex 64 no hash
- `crypto.timingSafeEqual` para comparação constant-time (evita timing attacks)

### 3.3 Display no admin UI

O admin vê apenas `tokenDisplay = hash[0:4]…hash[-4:]` — ex: `a3f2…8b1e`. Suficiente para correlacionar, sem expor o hash completo. O plaintext NUNCA aparece em nenhuma resposta de API nem log.

---

## 4. Fluxo end-to-end

```
1. Admin: POST /api/beta/invite { email, wave, dryRun? }
   └─► createInvite() gera token, persiste hash, status=PENDING
   └─► retorna { invite, plaintextToken } (plaintext SÓ nesta resposta)

2. Admin: dispatchBetaInvite(invite, plaintext)
   └─► renderBetaInvite() (template de email)
   └─► POST https://api.resend.com/emails
   └─► markInviteSent() → status=SENT, sentAt=now

3. Destinatário recebe email com link /convite/[token]
   └─► GET /convite/[token] (server component)
       └─► verifyInvite() — checa hash, expiração, status
       └─► renderiza landing com CTA /signup?invite=[token]

4. Pixel de tracking (1x1 GIF) no email:
   └─► GET /api/beta/track/open/[tokenHash]
       └─► markInviteOpened() — status=SENT → OPENED (idempotente)

5. Destinatário clica CTA → /signup?invite=...
   └─► OptimizedSignupForm cria User via Supabase + DB
   └─► callback pós-signup: POST /api/beta/invite/[token]/accept { userId }
       └─► acceptInvite() — verifica, valida user, marca ACCEPTED atomicamente
       └─► vincula invite.userId = novo user

6. Estado final: invite.status = ACCEPTED, user.betaInvitesAccepted[0] = invite
```

---

## 5. APIs

| Método | Path | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/api/beta/invite` | admin | Criar convite (gera token, retorna plaintext 1x) |
| `GET` | `/api/beta/invite/[token]` | público | Verificar status (landing page) |
| `DELETE` | `/api/beta/invite/[token]` | admin | Revogar (operacional; via plaintext) |
| `POST` | `/api/beta/invite/[token]/accept` | userId | Aceitar convite (pós-signup) |
| `GET` | `/api/admin/beta/invites` | admin | Listar (filtros: wave/status/emailContains) |
| `POST` | `/api/admin/beta/invites` | admin | Batch generation (1-50 emails) |
| `POST` | `/api/admin/beta/invites/[id]/revoke` | admin | Revogar por ID interno |
| `GET` | `/api/beta/track/open/[tokenHash]` | público | Pixel 1x1 (tracking) |

### 5.1 Rate limiting

Definido em `src/lib/beta/ratelimit.ts`:

- **Admin create invite:** 30 convites/min por admin
- **Verify (público):** 100 verifies/min por IP
- **Janela deslizante**, in-memory. Limpeza periódica via `setInterval` (com `.unref()` para não segurar shutdown).

Em produção real, substituir por Redis/Upstash ou middleware global.

### 5.2 Erros padronizados

```ts
type CreateInviteError = 'invalid_email' | 'invalid_wave' | 'duplicate_pending' | 'db_error';
type AcceptInviteError = 'invalid_token' | 'expired' | 'revoked' | 'already_accepted' | 'user_not_found';
type VerifyError = 'not_found' | 'invalid_token' | 'expired' | 'revoked' | 'consumed';
```

HTTP status mapping:
- `400` invalid_* (input malformado)
- `403` forbidden (sem sessão admin)
- `404` not_found
- `409` duplicate_pending, already_accepted, already_consumed
- `410` Gone — expired, revoked, consumed (estado terminal)
- `429` rate_limited (com `Retry-After`)
- `500` db_error, config_error

---

## 6. LGPD — conformidade

### 6.1 Princípios aplicados

| Artigo | Aplicação |
|--------|-----------|
| **Art. 7** (consentimento) | Aceite explícito via CTA + signup. Sem conta criada sem ação do usuário. |
| **Art. 9** (informação) | Email de convite declara finalidade (beta), prazo, e como revogar (ignorar email). |
| **Art. 18** (direitos) | Dashboard admin tem botão "Revogar" — equivale a eliminação de tratamento. |
| **Art. 37** (registro) | `audit_logs` registra criação/envio/revogação/aceite com `actorId`, `targetId`, `metadata`. |

### 6.2 Princípios de minimização

- **Email**: armazenado (necessário para envio e rastreio), mas NUNCA em logs plaintext. Display público no `/convite/[token]` é mascarado (`a***@d***.com`).
- **Token plaintext**: NUNCA persiste; só viaja no email (HTTPS). Nunca ecoado em respostas subsequentes.
- **Hash**: armazenado em `token` (UNIQUE); display no admin = `hash[0:4]…hash[-4:]`.
- **IP**: rate limiter mantém IP em memória volátil (não persiste). `audit_logs.ipHash` é SHA-256 com salt (`AUDIT_IP_SALT`).
- **User-Agent**: armazenado em `audit_logs` (limitado a 256 chars).

### 6.3 Retenção / expiração

- Convite expira em 7/10/14 dias (configurável por onda).
- Após expiração, status vai para `EXPIRED` (cron `expireOverdueInvites`).
- LGPD: `EXPIRED` ≠ delete do registro. Retenção da linha é justificada por:
  1. Necessidade de evitar re-issue acidental do mesmo convite (dedupe).
  2. Compliance audit trail (Art. 37).
  3. Prazo de retenção sugerido: **180 dias** após `EXPIRED`. Após isso, `deleteExpiredInvites()` (Wave 33+).

---

## 7. Admin workflow

### 7.1 Acesso

- `process.env.ADMIN_EMAILS` (lista CSV) — admins hard-coded
- OU `User.planoAssinatura === 'ADMIN'` no DB (escape hatch operacional)
- Fail closed em produção (sem env → redirect para `/`)

### 7.2 `/admin/beta` — Dashboard

Componentes:

1. **Stats cards** — Total, Aceitos, Enviados, Conversão %, distribuição por onda, distribuição por status
2. **Batch generation form** — textarea com até 50 emails, seletor de wave, checkbox dry-run
3. **Filtros** — wave, status, emailContains, paginação por cursor
4. **Tabela** — email, wave, status (badge colorido), tokenDisplay, expira, criado, ações

### 7.3 Operações comuns

```bash
# Criar 1 convite (Wave 1, dry-run)
curl -X POST https://site/api/beta/invite \
  -H "Content-Type: application/json" \
  -b "session=..." \
  -d '{"email":"ana@example.com","wave":1,"dryRun":true}'

# Criar batch (5 convites Wave 2)
curl -X POST https://site/api/admin/beta/invites \
  -H "Content-Type: application/json" \
  -b "session=..." \
  -d '{"emails":["a@x.com","b@x.com","c@x.com"],"wave":2}'

# Revogar por ID
curl -X POST https://site/api/admin/beta/invites/{id}/revoke \
  -H "Content-Type: application/json" \
  -b "session=..." \
  -d '{"reason":"user_requested"}'

# Listar pendentes Wave 1
curl https://site/api/admin/beta/invites?wave=1\&status=PENDING
```

### 7.4 Auditoria

Toda operação crítica aparece em `audit_logs`:

```json
{
  "action": "ADMIN_USER_BAN",   // reusado
  "kind": "beta_invite_created",
  "actorId": "admin_xyz",
  "targetId": "invite_abc",
  "metadata": {
    "wave": 1,
    "emailHash": "a3f2c8b1...",  // 12 chars do hash
    "dryRun": false
  }
}
```

`kind` discrimina a ação real (`beta_invite_created`, `beta_invite_sent`, `beta_invite_revoked`, `beta_invite_send_failed`, `beta_invite_accepted`). Reaproveitamos `AuditAction` enum existente para evitar migração; campo `kind` em metadata dá a semântica.

---

## 8. Email integration

### 8.1 Provider: Resend

Config: `process.env.RESEND_API_KEY`. Sem env, modo **stub** (apenas log).

```ts
const FROM_ADDRESS = process.env.NEWSLETTER_FROM_EMAIL ?? 'contato@cabala.dos.caminhos.com.br';

POST https://api.resend.com/emails
Headers: Authorization: Bearer {API_KEY}
Body: {
  from, to, subject, html, text,
  tags: [
    { name: 'template', value: 'beta-invite' },
    { name: 'wave', value: String(wave) },
  ],
}
```

### 8.2 Template — `renderBetaInvite(data)`

Em `src/lib/email/templates/beta-invite.ts`:

- Tom acolhedor, sem pressão, respeitoso das tradições
- Benefícios contextualizados por onda (3 textos distintos)
- CTA único ("Aceitar meu convite") com fallback URL
- Texto alternativo plano (`text`) para clientes que bloqueiam HTML
- Pixel de tracking opcional (`trackingPixelUrl`)
- `noindex` no metadata da landing `/convite/[token]` (não vaza links privados)

### 8.3 Tracking de abertura

Pixel 1x1 GIF transparente inline no HTML do email:

```html
<img src="https://site/api/beta/track/open/{tokenHash}" width="1" height="1" />
```

- `tokenHash` = hash completo (não o plaintext)
- Endpoint idempotente: só avança SENT → OPENED
- Bloqueadores de imagem quebram tracking — aceitação como limitação conhecida

### 8.4 Stub mode (dev/test)

Sem `RESEND_API_KEY`:
- `console.log([beta-invite][stub] → ${email} | wave=${wave})`
- Email NÃO é enviado
- `dispatchBetaInvite` retorna `{ ok: true, provider: 'stub' }`
- `markInviteSent` ainda é chamado (status SENT) — útil para testes E2E

---

## 9. Single-use & atomicidade

Concorrência: dois requests simultâneos tentando aceitar o mesmo token. Solução:

```ts
const updated = await prisma.betaInvite.updateMany({
  where: {
    id: invite.id,
    status: { in: ['PENDING', 'SENT', 'OPENED'] },
  },
  data: {
    status: 'ACCEPTED',
    acceptedAt: new Date(),
    userId: input.userId,
  },
});

if (updated.count === 0) {
  return { ok: false, reason: 'already_accepted' };
}
```

`updateMany` com filtro `status IN (...)` é atômico no Postgres. Só um dos requests concorrentes terá `count === 1`; o outro recebe `count === 0` e responde 409.

---

## 10. Limitações conhecidas

1. **Scan de hash em `verifyInvite`** — como armazenamos apenas o hash (não plaintext), `verifyInvite` faz `findMany({ take: 200, orderBy: createdAt desc })` e testa cada um. Para Wave 32 (50 vagas) é OK. Em escala (>10k convites ativos), considerar:
   - Adicionar coluna `token_prefix` (8 chars do hash, indexada)
   - Ou mudar para plaintext + crypto envelope (KMS)

2. **Pixel de tracking** depende de o cliente carregar imagens. Apple Mail Privacy Protection, Gmail proxy, e bloqueadores quebram o tracking — aceitação como limitação de mercado.

3. **Race entre SENT e OPENED** — pixel pode chegar após `acceptedAt` (improvável mas possível). `markInviteOpened` filtra por `status = SENT`; se já está ACCEPTED, é no-op.

4. **Email de convite duplicado** — dedupe é por (email, wave) em janela de 5min. Após 5min, é possível gerar novo convite para o mesmo email (status PENDING/SENT/OPENED antigo). Decisão consciente: preferimos permitir re-issue do que bloquear convites legítimos.

5. **Stub mode em produção** — se `RESEND_API_KEY` não estiver setada em prod, `dispatchBetaInvite` apenas loga (não envia). Mitigação: adicionar startup check em `lib/env.ts` (Wave 33+).

---

## 11. Migração & deploy

### 11.1 Prisma migrate

```bash
pnpm prisma migrate dev --name beta_invite_system_w32
pnpm prisma migrate deploy   # produção
```

Schema diff esperado:
- 1 enum novo (`InviteStatus`)
- 1 model novo (`BetaInvite`)
- 2 relations em `User`

### 11.2 Env vars (production)

```bash
BETA_INVITE_HMAC_KEY=<32+ chars random base64>   # OBRIGATÓRIO em prod
BETA_INVITE_EXPIRES_DAYS=7                         # opcional (override por onda)
RESEND_API_KEY=re_...                              # OBRIGATÓRIO em prod para envio real
```

### 11.3 Cron de expiração

Recomenda-se cron diário chamando `expireOverdueInvites()`:

```ts
// src/app/api/cron/expire-invites/route.ts (Wave 33+)
import { expireOverdueInvites } from '@/lib/beta/invites';
export async function GET() {
  const n = await expireOverdueInvites();
  return Response.json({ expired: n });
}
```

Vercel Cron config: `vercel.json` → `{ path: "/api/cron/expire-invites", schedule: "0 3 * * *" }`.

---

## 12. Testes

### 12.1 Cobertura recomendada (Wave 33+)

- `token.test.ts` — geração, validação, timing-safe, fallback dev key
- `invites.test.ts` — create (happy + dedupe), verify (válido/expirado/revocado/consumido), accept (idempotência), revoke
- `dispatch.test.ts` — stub mode, mark-as-sent em sucesso, audit log em falha
- `email-template.test.ts` — render output contém dados esperados, escapeHtml correto

### 12.2 Verificação manual (smoke)

```bash
# 1. Gerar convite (dev)
curl -X POST localhost:3000/api/beta/invite \
  -H "Content-Type: application/json" \
  -d '{"email":"smoke@test.com","wave":1}'

# 2. Verificar (público)
curl localhost:3000/api/beta/invite/{token-plaintext-do-passo-1}

# 3. Aceitar (criar user primeiro via signup)
curl -X POST localhost:3000/api/beta/invite/{token}/accept \
  -H "Content-Type: application/json" \
  -d '{"userId":"<criar-user-via-signup>"}'

# 4. Verificar novamente → deve ser 'consumed'
curl localhost:3000/api/beta/invite/{token}
```

---

## 13. Arquivos entregues (Wave 32)

| Path | LOC | Função |
|------|-----|--------|
| `prisma/schema.prisma` | +60 | Enum `InviteStatus` + model `BetaInvite` + relations |
| `src/lib/beta/token.ts` | ~150 | HMAC generate/validate, fingerprint, display |
| `src/lib/beta/invites.ts` | ~430 | create, verify, accept, revoke, list, stats, expire |
| `src/lib/beta/ratelimit.ts` | ~75 | In-memory sliding window (admin + IP) |
| `src/lib/beta/dispatch.ts` | ~120 | Resend wrapper + mark-as-sent + audit |
| `src/lib/email/templates/beta-invite.ts` | ~170 | Template HTML/text com 3 wave variants |
| `src/lib/email/templates/index.ts` | +5 | Registro do novo template |
| `src/app/api/beta/invite/route.ts` | ~80 | POST criar |
| `src/app/api/beta/invite/[token]/route.ts` | ~115 | GET verify + DELETE revoke (operacional) |
| `src/app/api/beta/invite/[token]/accept/route.ts` | ~55 | POST aceitar |
| `src/app/api/admin/beta/invites/route.ts` | ~140 | GET list + POST batch |
| `src/app/api/admin/beta/invites/[id]/revoke/route.ts` | ~55 | POST revoke por ID |
| `src/app/api/beta/track/open/[tokenHash]/route.ts` | ~55 | GET pixel 1x1 |
| `src/app/convite/[token]/page.tsx` | ~200 | Landing page (server component) |
| `src/app/admin/beta/page.tsx` | ~280 | Dashboard admin (server component) |
| `src/app/admin/beta/BatchInviteForm.tsx` | ~140 | Client form de batch |
| `src/app/admin/beta/RevokeButton.tsx` | ~80 | Client botão revogar |
| `docs/BETA-INVITE-SYSTEM-W32.md` | este | 13 seções + runbook |

**Total:** ~17 arquivos · ~2210 LOC

---

## 14. Próximas ondas (W33+)

- **Wave 33 — Beta Invite Polish**: testes automatizados (token, invites, dispatch), cron `expire-invites`, env check startup, `token_prefix` column se necessário
- **Wave 34 — Waitlist integration**: webhook de admin para promover waitlist → invite automático
- **Wave 35 — Referral program**: invites com `inviterId` populado, dashboard de quem convidou quem, recompensa simbólica
- **Wave 36 — Soft launch metrics**: funnel completo (visit → waitlist → invite → signup), cohort retention por wave

---

## 15. Decisões & justificativas

| Decisão | Por quê |
|---------|---------|
| HMAC-SHA256 (não plaintext) | DB leak não revela tokens válidos; auditoria mostra só fingerprint |
| Single-use via `updateMany` com status filter | Atomicidade no Postgres sem precisar de advisory locks |
| Mascarar email na landing pública | LGPD Art. 9 + evita fingerprinting de invites |
| Display admin = hash[0:4]…hash[-4:] | Suficiente para correlação sem expor |
| Stub mode sem RESEND_API_KEY | Dev/test sem provider; produção fail-loud via startup check (Wave 33+) |
| Dedupe 5min (email, wave) | Evita duplicação por retry; permite re-issue legítimo após janela |
| Wave 3 com expiração menor (7d) | Cria urgência para soft launch sem pressionar founders |
| Reusar `AuditAction` enum existente | Evita migração de schema; `kind` em metadata dá semântica |
| Server component para `/convite/[token]` | Verificação antes do HTML chegar ao browser (não vaza nada via JS) |
| Pixel tracking só com hash (não plaintext) | URL do pixel não vaza o token; URL é "decorrelacionada" do link de aceite |

---

## 16. FAQ interno

**P: Por que não usar JWT em vez de HMAC custom?**
R: JWT seria mais portável, mas adiciona dep externa (jose, etc) só para validar um único uso. HMAC raw é ~30 linhas e suficiente.

**P: E se o admin quiser re-enviar um convite que falhou?**
R: Criar novo convite (`POST /api/beta/invite`). O dedupe de 5min pode barrar — basta esperar ou usar email ligeiramente diferente. Em Wave 33+, endpoint `POST /api/admin/beta/invites/[id]/resend`.

**P: Posso revogar um convite já aceito?**
R: Não pela UI atual — `revokeInvite` recusa se `status === 'ACCEPTED'`. Se necessário, deletar conta via `/admin/users` (já existe em Wave 20).

**P: Como funciona com o fluxo Supabase de signup?**
R: `OptimizedSignupForm` cria User via Supabase Auth + DB. Após sucesso, callback chama `POST /api/beta/invite/[token]/accept` com `userId`. Se o signup falhar no meio, invite fica PENDING/SENT — re-try manual via admin.

**P: Posso ter 2 invites ativos para o mesmo email em ondas diferentes?**
R: Sim — dedupe é por (email, wave). Wave 1 founders podem receber Wave 2 convite se aplicável.

---

## 17. Change log

- **2026-06-30 W32** — Versão inicial (este documento). 50 vagas, 3 ondas, HMAC tokens, single-use, LGPD-by-design.
- **W33 planejado** — Tests + cron expire + startup check.
- **W34 planejado** — Waitlist integration webhook.
- **W35 planejado** — Referral program.

---

## 18. Referências

- LGPD Lei 13.709/2018 — Art. 7, 9, 18, 37
- OWASP Top 10 — A01 (Broken Access Control), A02 (Cryptographic Failures), A07 (Auth Failures), A09 (Logging Failures)
- RFC 2104 — HMAC: Keyed-Hashing for Message Authentication
- W3C WCAG 2.1 — 2.4.1 (skip links), 4.1.2 (name/role/value), 4.1.3 (status messages)
- Wave 28 docs — DESIGN-INTEGRATION-W28, SACRED-GEOMETRY-W28
- Wave 30 docs — DELIVERABLE-W30-STRIPE-PAYMENTS (audit log pattern reutilizado)
- Wave 32 parallel — DELIVERABLE-W32-1 (waitlist melhorada)

---

## 19. Notas de implementação

### 19.1 Por que `userId` é opcional + SetNull?

`BetaInvite.user` referencia User com `onDelete: SetNull` — se o user deletar a conta depois, o invite continua existindo (para auditoria), mas perde o link direto. `acceptedAt` permanece como prova histórica.

### 19.2 Por que `inviterId` é opcional?

Convites podem ser:
- Gerados por admin (sem referral)
- Gerados por referral (outro user convidou)

`inviterId` cobre o segundo caso. Programa de referral (Wave 35+) vai popular isso automaticamente.

### 19.3 Por que status enum (não string livre)?

- TS garante exaustividade em switch (não da para esquecer de tratar um caso)
- Migrações são detectáveis (renomear valor = migration explícita)
- Admin UI usa labels traduzidos por mapping

### 19.4 Por que JSON metadata e não colunas?

Flexibilidade para campos específicos de campanha sem migração: `{ utm_source, utm_campaign, batch_id, referrer_path }`. Trade-off: sem queries indexadas nesses campos. Para Wave 32 (baixo volume), OK.

---

## 20. Sign-off

- **Coder (eu)**: ✅ implementação completa
- **Caio (security)**: pendente — revisar LGPD, timing-safe, rate limit antes de push
- **Iyá (curator)**: pendente — revisar tom do email template
- **Tomás (PM)**: pendente — validar acceptance criteria da Wave 32

---

**Fim do documento.** Para mudanças, abrir PR contra `main` com tag `wave:32 beta-invite`.