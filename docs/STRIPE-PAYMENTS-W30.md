# Stripe Connect — Marketplace de Leituras e Mentorias (Wave 30)

> Documentação operacional — implementada em `src/lib/payments/` (Wave 30).
> Última atualização: 2026-06-30.

---

## Sumário

1. [Visão geral e princípios éticos](#1-visão-geral-e-princípios-éticos)
2. [Tipos de conta Stripe Connect](#2-tipos-de-conta-stripe-connect)
3. [Destination charges vs Separate transfers](#3-destination-charges-vs-separate-transfers)
4. [Application fees e split de receita](#4-application-fees-e-split-de-receita)
5. [Onboarding do reader (Express)](#5-onboarding-do-reader-express)
6. [Criação de PaymentIntent (escrow)](#6-criação-de-paymentintent-escrow)
7. [Release / captura após sessão](#7-release--captura-após-sessão)
8. [Refund policy](#8-refund-policy)
9. [Disputes e chargebacks](#9-disputes-e-chargebacks)
10. [Webhook handling e idempotência](#10-webhook-handling-e-idempotência)
11. [Signature verification](#11-signature-verification)
12. [LGPD compliance](#12-lgpd-compliance)
13. [Schema Prisma](#13-schema-prisma)
14. [API endpoints](#14-api-endpoints)
15. [Componentes frontend](#15-componentes-frontend)
16. [Configuração de ambiente](#16-configuração-de-ambiente)
17. [Fluxo end-to-end](#17-fluxo-end-to-end)
18. [Testes em modo sandbox](#18-testes-em-modo-sandbox)
19. [Rate limiting e segurança](#19-rate-limiting-e-segurança)
20. [Monitoramento e observabilidade](#20-monitoramento-e-observabilidade)
21. [Tratamento de erros](#21-tratamento-de-erros)
22. [Roadmap pós-MVP](#22-roadmap-pós-mvp)
23. [Decisões arquiteturais (ADRs)](#23-decisões-arquiteturais-adrs)
24. [Glossário](#24-glossário)
25. [Referências](#25-referências)

---

## 1. Visão geral e princípios éticos

A integração Stripe Connect da Akasha suporta dois fluxos de marketplace:

- **Leituras avulsas** — cliente paga por uma leitura/consulta de um leitor.
- **Mentorias** — pagamento recorrente ou pontual por sessões de mentoria.

### Os 8 princípios éticos do Akasha (não-negociáveis)

1. **Transparência total** — comissão da plataforma (10%) é exibida antes do pagamento.
2. **Webhook signature verification OBRIGATÓRIA** em qualquer ambiente.
3. **Idempotency keys** em toda mutação financeira (evita double-charge).
4. **LGPD**: nunca logamos PAN, CVV, ou dados sensíveis. Bank account tokens vão cifrados.
5. **Escrow honesto**: só transferimos ao reader após sessão confirmada por ambas as partes.
6. **Refund policy documentada e justa**: 7 dias integrais + janela estendida para dispute.
7. **Disputes**: webhook `charge.dispute.*` aciona moderação e congela o pagamento.
8. **Reader onboarding via Stripe-hosted KYC (Express)**: Akasha NUNCA armazena documentos KYC.

---

## 2. Tipos de conta Stripe Connect

| Tipo        | Onboarding | Dashboard | Compliance | Custódia | Escolha Akasha |
|-------------|------------|-----------|------------|----------|-----------------|
| **Standard** | Reader tem conta Stripe completa e onboarding próprio | Próprio | Reader | Reader | ❌ (muito controle descentralizado) |
| **Express**   | Stripe hospeda onboarding/dashboard; plataforma personaliza | Stripe-hosted com brand Akasha | Plataforma | Plataforma | ✅ **escolhido** |
| **Custom**    | Plataforma constrói tudo | Próprio | Plataforma | Plataforma | ❌ (responsabilidade enorme) |

**Decisão Wave 30**: **Express**. Justificativa:

- Stripe cuida de KYC/AML (anti-money laundering).
- Dashboard do reader é hosted mas com branding Akasha.
- Plataforma mantém controle sobre criação de charges (`transfer_data.destination`).
- Compliance burden compartilhado: Stripe faz identity verification, nós fazemos marketplace policy.

---

## 3. Destination charges vs Separate transfers

### Destination charges (escolhido)

```typescript
// UMA charge na conta plataforma
await stripe.paymentIntents.create({
  amount: 10000, // R$ 100,00
  currency: 'brl',
  application_fee_amount: 1000, // R$ 10,00 fica com Akasha
  transfer_data: { destination: 'acct_reader123' }, // R$ 90 vai pro reader IMEDIATO
});
```

**Prós:**
- Atômico: charge + transfer na mesma transação.
- Reader vê o net amount no dashboard; platform fee fica invisível.
- Reconciliation trivial: 1 ledger entry.

**Contras:**
- Refund precisa ser explícito (reembolso afeta tanto plataforma quanto reader).
- Menos flexível para lógicas complexas de split multi-nível.

### Separate charges & transfers (descartado para MVP)

```typescript
// Charge na plataforma + Transfer separado
await stripe.charges.create({ amount: 10000, currency: 'brl' }); // sem destination
await stripe.transfers.create({ amount: 9000, destination: 'acct_reader123' });
```

**Por que não agora:**
- 2 chamadas API (mais latência).
- Idempotência tem que ser gerenciada em ambos os lados.
- Reservado para V2 se marketplace precisar de splits multi-camada (ex.: afiliado + plataforma + sub-prestador).

---

## 4. Application fees e split de receita

### Estrutura atual (Wave 30)

| Stakeholder  | % sobre gross | Exemplo (R$ 100,00) |
|--------------|---------------|----------------------|
| Plataforma Akasha | 10% (configurável) | R$ 10,00 |
| Reader | 90% | R$ 90,00 |
| Afiliado (se aplicável) | 5% sobre o líquido do reader | R$ 4,50 (sai do reader) |

**Importante**: afiliado é uma camada opcional, *NÃO* somada ao gross amount. O afiliado recebe do net amount do reader.

```typescript
const gross = 10000; // centavos
const platformFee = calcPlatformFee(gross); // 1000 = 10%
const netToReader = gross - platformFee; // 9000
const affiliateFee = affiliateId ? calcAffiliateFee(netToReader) : 0; // 450 = 5%
const readerReceives = netToReader - affiliateFee; // 8550
```

### Onde configurar

`src/lib/validators/payments.ts`:

```typescript
export const DEFAULT_PLATFORM_FEE_BPS = 1000; // 10.00%
export const DEFAULT_AFFILIATE_FEE_BPS = 500; // 5.00%
```

Para um reader VIP com fee negociado, estender com tabela `ReaderPlatformFee` no Prisma:

```prisma
model ReaderPlatformFee {
  readerId String @id
  bps      Int    // basis points (1000 = 10%)
  ...
}
```

---

## 5. Onboarding do reader (Express)

### Fluxo

```
┌────────────┐    POST /api/payments/connect/onboard    ┌─────────────┐
│  Reader UI │ ──────────────────────────────────────► │  Akasha API │
└────────────┘                                          └──────┬──────┘
                                                                  │
                                                                  ▼
                                                       ┌──────────────────┐
                                                       │ Stripe API       │
                                                       │ POST /accounts    │
                                                       │ POST /account_links│
                                                       └──────┬───────────┘
                                                              │
                                                              ▼
                                                    { url: hosted onboarding }
                                                              │
                                                              ▼
┌────────────┐  hosted KYC + bank account data    ┌────────────────────┐
│  Reader    │ ◄──────────────────────────────────│  Stripe Connect UI  │
└────────────┘                                    └────────────────────┘
       │
       │  return_url  ←  /dashboard/reader/onboarding/return
       ▼
GET /api/payments/connect/status  → polling para verificar charges_enabled
```

### O que pedimos ao reader

- País (ISO-3166-1 alpha-2).
- Nome completo legal (KYC).
- **NADA mais**: CPF/CNPJ, RG, comprovante de endereço, dados bancários são coletados pela Stripe direto no hosted onboarding.

### Status retornado

```typescript
{
  stripeAccountId: 'acct_...',
  onboardingUrl: 'https://connect.stripe.com/setup/e/acct_...',
  expiresAt: 1234567890, // unix; account links expiram em ~5min
  chargesEnabled: false,
  payoutsEnabled: false,
  detailsSubmitted: false,
  requirements: {
    currentlyDue: ['individual.id_number', 'individual.dob'],
    pastDue: [],
    pendingVerification: ['individual.id_number']
  }
}
```

### Edge cases

- **Link expirado** (5min): API `/connect/onboard` retorna novo link automaticamente se Connect account já existe.
- **Onboarding incompleto**: o endpoint `/connect/status` mostra `requirements.currentlyDue` para a UI exibir.
- **Onboarding concluído** (`details_submitted=true`): marcar `onboardingCompletedAt` no Prisma.

---

## 6. Criação de PaymentIntent (escrow)

### Destination charge com escrow automático

```typescript
// src/lib/payments/stripe.ts
await stripeCreatePaymentIntent({
  amount: 10000, // centavos
  currency: 'brl',
  readerStripeAccountId: 'acct_...',
  platformFee: 1000,
  metadata: {
    readerId: 'user_...',
    clientId: 'user_...',
    serviceType: 'READING',
    orderId: 'order_...',
  },
  idempotencyKey: 'charge:order_xyz:10000:brl:user_reader',
});
```

### O que acontece

1. Akasha API chama `stripe.paymentIntents.create` com `transfer_data.destination`.
2. Stripe cobra o cliente imediatamente (cartão de crédito / débito / PIX / boleto).
3. **Automaticamente**: `amount - application_fee_amount` é transferido para a conta Connect do reader.
4. O dinheiro fica disponível para payout segundo o schedule padrão Stripe (BR: 2 dias úteis).

### Idempotência

Toda criação de Payment tem `idempotencyKey = makeIdempotencyKey(['charge', orderId, amount, currency, readerId])`. Se o cliente retry a request (ex.: duplo-clique), Stripe retorna o mesmo PaymentIntent (mesma key → mesma resposta).

```typescript
// Duplo-clique do cliente
POST /api/payments/charge  (1ª vez)  → 201 Created, paymentId: abc123
POST /api/payments/charge  (2ª vez)  → 201 Created, paymentId: abc123 (mesmo!)
```

---

## 7. Release / captura após sessão

### Modelo de escrow da Akasha

Diferente do escrow "manual" (que exige `capture` explícito), usamos **destination charge com captura automática** + flag interna `RELEASED`:

```typescript
// Stripe já capturou quando payment_intent.succeeded chegou
// Aqui só marcamos que AMBAS as partes confirmaram a sessão
await releaseMarketplacePayment(paymentId, viewerId);
```

| Status interno | Significado |
|----------------|-------------|
| `PENDING` | PaymentIntent criado, aguardando cliente confirmar |
| `PROCESSING` | Cliente confirmou, aguardando webhook |
| `SUCCEEDED` | `payment_intent.succeeded` recebido → dinheiro em escrow na plataforma |
| `RELEASED` | Sessão confirmada por cliente+reader → payout liberado |
| `REFUNDED` | Cliente pediu refund ou dispute perdido |
| `DISPUTED` | Cliente abriu chargeback via banco |
| `FAILED` | `payment_intent.payment_failed` |
| `CANCELED` | Cancelado antes de captura |

### Por que não usar manual capture?

- Latência: cliente quer confirmar imediatamente.
- UX: "liberação" é sobre a relação humana (sessão confirmada), não sobre a captura Stripe.
- Se quisermos escrow *real* (capture só após N dias), basta mudar `capture_method: 'manual'` na criação.

---

## 8. Refund policy

### Política (Akasha — fair & transparente)

- **7 dias integrais**: cliente pode pedir refund full sem justificativa.
- **30 dias parciais**: refund parcial só com acordo mútuo (Akasha media).
- **Após 30 dias**: refund só via dispute (chargeback via banco emissor).

### Implementação

```typescript
POST /api/payments/refund
{
  paymentId: "pay_abc",
  amount: 5000, // opcional; omite = full refund
  reason: "requested_by_customer" // "duplicate" | "fraudulent" | "requested_by_customer"
}
```

### Regras técnicas

- Refund idempotente via `idempotencyKey = "refund:${paymentId}:${amount}:${reason}"`.
- Após refund, payment.status = `REFUNDED`. Reader NÃO recebe nada (Stripe reverte a transferência).
- Se payment.status = `DISPUTED`, refund manual é bloqueado — deixar Stripe resolver a dispute primeiro.

### Webhook associado

`charge.refunded` → marca payment.status = `REFUNDED` + audit log.

---

## 9. Disputes e chargebacks

### Quando acontece

- Cliente contesta a cobrança via banco emissor do cartão.
- Stripe tira o dinheiro da conta plataforma imediatamente (`charge.dispute.created`).
- Plataforma tem **7-21 dias** (varia por país) para responder com evidências.

### Fluxo automático

```
charge.dispute.created  →  payment.status = DISPUTED
                          →  audit log
                          →  notifica moderação Akasha (futuro: webhook interno)

plataforma submete evidências → Stripe medeia

charge.dispute.closed (status=won)  → payment.status = RELEASED (reader ganha)
charge.dispute.closed (status=lost) → payment.status = REFUNDED (plataforma perde)
```

### Evidências que Akasha coleta

- Captura de tela da leitura/mentoria confirmada.
- Mensagens trocadas entre cliente e reader (em Metas/Message).
- Termo de aceite do serviço.

### Implementação

```typescript
// src/lib/payments/marketplace-service.ts → WebhookHandlers.onDisputeCreated
onDisputeCreated: async (dispute) => {
  // 1. Marcar payment como DISPUTED
  // 2. Audit log com reason + amount
  // 3. (V2) Notificar moderador via webhook interno
}
```

---

## 10. Webhook handling e idempotência

### Por que idempotência?

Stripe reenvia webhooks em caso de erro (retry exponencial até 3 dias). Sem dedupe, podemos processar o mesmo evento 2x → double-charge notification, double-refund, etc.

### Estratégia: UNIQUE constraint em eventId

```prisma
model ProcessedStripeEvent {
  id          String   @id @default(cuid())
  eventId     String   @unique  // ← UNIQUE
  eventType   String
  processedAt DateTime @default(now())
  livemode    Boolean  @default(false)
}
```

### Fluxo

```
1. POST /api/payments/webhook recebe evento
2. verifyWebhookSignature(rawBody, signature)  ← SEMPRE PRIMEIRO
3. isAlreadyProcessed(eventId)  ← consulta UNIQUE
4. Se já processado → 200 OK (no-op)
5. Se novo → handleStripeWebhookEvent() → switch por tipo
6. markProcessed(eventId, type)  ← INSERT (falha se duplicado)
```

### Eventos críticos (roteamento)

| Evento Stripe | Ação Akasha |
|---------------|-------------|
| `payment_intent.succeeded` | payment.status = SUCCEEDED |
| `payment_intent.payment_failed` | payment.status = FAILED + failure_code |
| `payment_intent.canceled` | payment.status = CANCELED |
| `charge.refunded` | payment.status = REFUNDED |
| `charge.dispute.created` | payment.status = DISPUTED + flag moderação |
| `charge.dispute.closed` | payment.status = RELEASED (won) ou REFUNDED (lost) |
| `account.updated` | sync ConnectAccount.chargesEnabled/payoutsEnabled |
| `payout.paid` | payout.status = PAID |
| `payout.failed` | payout.status = FAILED + failure_code |

---

## 11. Signature verification

### Implementação

```typescript
// src/lib/payments/stripe.ts
export async function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string,
  options: { tolerance?: number; secret?: string } = {}
): Promise<WebhookVerificationResult>
```

### Como a Stripe assina

Header `stripe-signature`:
```
t=1492774577,v1=5257a869...,v0=...
```

Algoritmo:
```
signed_payload = `${timestamp}.${rawBody}`
expected = HMAC-SHA256(webhook_secret, signed_payload)
```

### Regras implementadas

- ✅ Parse do header `t=...,v1=...` com rejeição de malformed.
- ✅ Timestamp tolerance: 300s default (anti-replay).
- ✅ Constant-time comparison (`diff |= a^b`).
- ✅ Retorna `valid: false` com `reason` específico (NÃO throw).
- ✅ Re-parseia o evento apenas após verificar signature (defesa em profundidade).
- ❌ NUNCA aceitar `Stripe-Version` antigo (forçamos `2024-06-20` no header).

### O que fazer se verificação falhar

- HTTP 400 com `reason`.
- Logar evento (sem body) para investigação.
- Stripe vai reenviar automaticamente; investigar por que signature falhou.

---

## 12. LGPD compliance

### Dados pessoais tratados

| Dado | Onde | Retenção | Justificativa LGPD |
|------|------|----------|---------------------|
| Email | `User.email` | Indefinido (necessário para auth) | Execução de contrato |
| Nome legal | `ConnectAccount.metadata.fullName` | Até cancelamento | KYC obrigatório por lei |
| Bank account (token) | Stripe (NUNCA em Akasha) | Stripe | Lei anti-money laundering |
| Histórico de transações | `Payment`, `Payout` | 5 anos (obrigação legal) | Lei 8.137/90 art. 1º |
| IP | `PaymentAuditLog.ipHash` (SHA-256, salted) | 90 dias | Segurança (LGPD Art. 37) |
| User agent | `PaymentAuditLog.userAgent` | 90 dias | Segurança |

### Princípios LGPD aplicados

- **Finalidade explícita**: processar pagamentos marketplace. NUNCA usar para marketing sem consentimento.
- **Necessidade**: mínimo de dados coletados (Stripe faz KYC; nós só recebemos IDs).
- **Segurança**:
  - Webhook signature verification (evita injeção).
  - Audit log com IP hasheado (LGPD-safe; sem PII reversível).
  - SEM log de PAN/CVV (nem mesmo em dev — Stripe Elements nunca os expõe).
- **Transparência**: cliente vê o split (10% Akasha) ANTES de pagar.
- **Direito de eliminação**: user pode pedir delete; payments antigos ficam como `PaymentAuditLog` (anonimizados) por obrigação legal.

---

## 13. Schema Prisma

5 novos modelos em `prisma/schema.prisma`:

### ConnectAccount

```prisma
model ConnectAccount {
  id                    String              @id @default(cuid())
  userId                String              @unique
  stripeAccountId       String              @unique
  status                ConnectAccountStatus @default(PENDING)
  chargesEnabled        Boolean             @default(false)
  payoutsEnabled        Boolean             @default(false)
  // ...
}
```

### Payment

```prisma
model Payment {
  id                    String              @id @default(cuid())
  readerId              String
  clientId              String
  stripePaymentIntentId String              @unique
  amount                Int                 // smallest unit
  currency              String              @default("brl")
  platformFee           Int                 @default(0)
  netAmount             Int
  affiliateId           String?
  status                PaymentStatus       @default(PENDING)
  serviceType           PaymentServiceType
  idempotencyKey        String              @unique
  // ...
}
```

### Payout

```prisma
model Payout {
  id              String        @id @default(cuid())
  readerId        String
  stripePayoutId  String        @unique
  amount          Int
  status          PayoutStatus  @default(PENDING)
  arrivalDate     DateTime
  // ...
}
```

### ProcessedStripeEvent (idempotência)

```prisma
model ProcessedStripeEvent {
  id          String   @id @default(cuid())
  eventId     String   @unique
  eventType   String
  // ...
}
```

### PaymentAuditLog (LGPD Art. 37)

```prisma
model PaymentAuditLog {
  id        String   @id @default(cuid())
  actorId   String?
  action    String
  paymentId String?
  metadata  Json
  ipHash    String?  // SHA-256, sem PII
  // ...
}
```

---

## 14. API endpoints

6+ endpoints em `src/app/api/payments/`:

| Método | Endpoint | Função | Auth |
|--------|----------|--------|------|
| POST | `/api/payments/connect/onboard` | Criar Connect account + onboarding link | ✅ |
| GET | `/api/payments/connect/status` | Status de onboarding do reader | ✅ |
| POST | `/api/payments/charge` | Criar PaymentIntent (escrow) | ✅ |
| POST | `/api/payments/release` | Liberar pagamento (sessão confirmada) | ✅ |
| POST | `/api/payments/refund` | Refund full ou partial | ✅ |
| POST | `/api/payments/webhook` | Receber eventos Stripe | ❌ (signature) |
| GET | `/api/payments/transactions` | Histórico do reader logado | ✅ |

Todos os endpoints usam o envelope padrão `{data, meta, error}` de `src/lib/community/api.ts`.

---

## 15. Componentes frontend

3 componentes em `src/components/marketplace/`:

### PaymentForm.tsx
- Wrapper Stripe Elements (PaymentElement).
- Mobile-first, min-height 44px nos botões.
- ARIA: `role=alert` para erros, `aria-busy` no submit.
- Loading state + error state.

### ReaderOnboarding.tsx
- Dropdown de país (BR, US, PT, ES, MX, AR).
- Mostra requirements pendentes se onboarding incompleto.
- Polling-friendly: aceita `initialStatus` do server component.
- Disclosure `<details>` para "como funciona o repasse".

### TransactionHistory.tsx
- Lista transactions + payouts.
- Totais agregados (bruto, taxas, líquido).
- Status pills coloridas.
- Empty state quando não há transações.

---

## 16. Configuração de ambiente

### `.env.local`

```bash
# Obrigatórias
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Opcionais
STRIPE_API_VERSION=2024-06-20  # default
DATABASE_URL=postgresql://...   # Prisma
```

### Onde pegar

- `STRIPE_SECRET_KEY`: https://dashboard.stripe.com/apikeys (test mode: `sk_test_...`)
- `STRIPE_WEBHOOK_SECRET`: https://dashboard.stripe.com/webhooks → adicionar endpoint → copiar `Signing secret`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: mesma página (prefixo `pk_test_...`)

### Webhook setup

```bash
# Stripe CLI para forwarding em dev
stripe listen --forward-to localhost:3000/api/payments/webhook
# Copia o whsec_... que aparece
```

---

## 17. Fluxo end-to-end

### Leitura avulsa

```
1. Cliente abre /marketplace/leitor/[id]
2. Clica "Contratar leitura de R$ 100"
3. Frontend chama POST /api/payments/charge {readerId, amount: 10000, ...}
4. Backend:
   a) Verifica reader tem Connect account ativa (chargesEnabled)
   b) Cria PaymentIntent via Stripe (destination charge)
   c) Persiste Payment com idempotencyKey
   d) Audit log
   e) Retorna {clientSecret, paymentId}
5. Frontend monta <PaymentForm> com Stripe Elements
6. Cliente preenche cartão (PAN nunca toca Akasha)
7. Stripe.confirmPayment → webhook payment_intent.succeeded
8. Backend atualiza payment.status = SUCCEEDED
9. Reader recebe notificação "Nova leitura!"
10. Leitura acontece
11. Ambos confirmam → POST /api/payments/release
12. Backend marca payment.status = RELEASED
13. Stripe agenda payout automático (D+2 BR / D+7 outros)
14. Webhook payout.paid → payout.status = PAID
```

---

## 18. Testes em modo sandbox

### Cartões de teste

| Cenário | Cartão | Esperado |
|---------|--------|----------|
| Sucesso | `4242 4242 4242 4242` | `payment_intent.succeeded` |
| Falha genérica | `4000 0000 0000 0002` | `payment_intent.payment_failed` (card_declined) |
| 3DS required | `4000 0027 6000 3184` | `requires_action` |
| Insufficient funds | `4000 0000 0000 9995` | `payment_intent.payment_failed` (insufficient_funds) |
| Dispute simulada | `4000 0000 0000 0259` | `charge.dispute.created` |

### Cenários de teste (a implementar V2)

- [ ] Reader faz onboarding completo (Express account)
- [ ] Cliente paga leitura
- [ ] Cliente cancela antes de captura → refund automático
- [ ] Sessão confirmada por ambos → RELEASED
- [ ] Cliente pede refund em 7 dias → REFUNDED
- [ ] Cliente pede refund após 30 dias → bloqueado
- [ ] Webhook duplicado → dedupe funciona
- [ ] Signature inválida → 400 rejeitado
- [ ] Connect account desabilitada → charge bloqueado

---

## 19. Rate limiting e segurança

### Rate limits aplicados

| Endpoint | Limite | Por quê |
|----------|--------|---------|
| `/api/payments/connect/onboard` | 5 req/h por user | Evitar abuse de criação de account |
| `/api/payments/charge` | 30 req/h por user | Evitar double-charge spam |
| `/api/payments/release` | 60 req/h por user | Operação normal de fluxo |
| `/api/payments/refund` | 10 req/h por user | Operação sensível |
| `/api/payments/webhook` | Ilimitado (signature check) | Stripe não deve ser limitada |

Implementação via `src/lib/community/rate-limit.ts` (já existe, in-memory).

### Defesas

- ✅ CSRF: Next.js Server Actions têm proteção built-in.
- ✅ SQL injection: Prisma parametrizado.
- ✅ XSS: Stripe Elements isola iframe; React escapa por padrão.
- ✅ Signature verification: HMAC-SHA256 + constant-time.
- ✅ Idempotency: chave determinística + UNIQUE constraint.
- ✅ Audit log com IP hasheado (LGPD-safe).
- ❌ NUNCA logar PAN / CVV / bank tokens.
- ❌ NUNCA expor `STRIPE_SECRET_KEY` no frontend.

---

## 20. Monitoramento e observabilidade

### Métricas (V2 — Prometheus)

- `payment_create_total{service_type, status}` — Counter.
- `payment_amount_brl_total{service_type}` — Counter em centavos.
- `webhook_processing_duration_seconds{event_type}` — Histogram.
- `webhook_dedupe_hits_total{event_type}` — Counter.

### Logs estruturados

```typescript
console.log({
  event: 'payment_succeeded',
  paymentId: 'pay_...',
  readerId: 'user_...',
  amount: 10000,
  currency: 'brl',
  ts: new Date().toISOString(),
});
```

### Alertas (V2)

- Webhook signature failure > 5/min → possível attack.
- Payout failed > 3 em 24h → investigar reader.
- Dispute rate > 1% → revisar onboarding / moderation.

---

## 21. Tratamento de erros

### Stripe API errors

```typescript
// Erro típico
{
  type: 'invalid_request_error',
  code: 'resource_missing',
  message: 'No such payment_intent: pi_...',
  statusCode: 404
}
```

Mapeamento:
- `card_declined` → cliente deve usar outro cartão.
- `insufficient_funds` → cliente deve completar saldo.
- `expired_card` → cliente deve atualizar cartão.
- `processing_error` → retry automático pela Stripe.
- `rate_limit` → backoff exponencial.

### Erros de domínio (Akasha)

```typescript
class PaymentError extends Error {
  code: 'reader_not_found' | 'reader_not_onboarded' | 'amount_invalid' | ...
}
```

Cada código mapeia para HTTP status apropriado (400 / 404 / 409 / 412).

---

## 22. Roadmap pós-MVP

### V2 (próximas waves)

- [ ] **Split multi-nível**: sub-prestadores (reader tem equipe).
- [ ] **Mentoria recorrente**: Stripe Subscriptions + Connect.
- [ ] **Payouts instantâneos**: `payouts.create({method: 'instant'})` para reader.
- [ ] **Cupons de desconto**: `coupons` API + metadata.
- [ ] **Tax ID validation**: para NF-e no Brasil.
- [ ] **Webhook interno**: notificar reader quando nova leitura chega.

### V3+

- [ ] **Stripe Tax**: cálculo automático de impostos.
- [ ] **Multi-currency Payout**: reader recebe em moeda local mesmo ganhando em USD.
- [ ] **Payment methods locais**: PIX, Boleto, OXXO (México).
- [ ] **Connect Platform Earnings**: dashboard admin da Akasha.
- [ ] **Branded payment methods**: co-branded cards com a marca Akasha.

---

## 23. Decisões arquiteturais (ADRs)

### ADR-001: Express accounts (não Standard, não Custom)

**Contexto**: precisamos de onboarding KYC robusto e dashboard para readers.
**Decisão**: Stripe Connect Express.
**Consequências**:
- ✅ Stripe cuida de compliance (KYC, AML).
- ✅ Reader tem dashboard hosted com brand Akasha.
- ❌ Customização de dashboard é limitada.

### ADR-002: Destination charges (não separate transfers)

**Contexto**: precisamos de split simples (90/10).
**Decisão**: Destination charges com `application_fee_amount`.
**Consequências**:
- ✅ Atômico, idempotente, fácil de razonar.
- ❌ Refund reverte ambos lados automaticamente.
- ❌ Split multi-camada precisa de V2.

### ADR-003: Webhook idempotência via UNIQUE constraint

**Contexto**: Stripe reenvia webhooks; precisamos dedupe.
**Decisão**: `ProcessedStripeEvent.eventId @unique` + check antes de processar.
**Consequências**:
- ✅ Dedupe atômico (DB-level).
- ✅ Audit trail completo (`processedAt`).
- ❌ Custo: 1 query por webhook.

### ADR-004: Zero-dep Stripe lib (sem `npm install stripe`)

**Contexto**: bundle size + lock-in de versão.
**Decisão**: implementar subset da API Stripe usando `fetch()`.
**Consequências**:
- ✅ Bundle menor (zero deps novas).
- ✅ Sem risco de breaking changes de SDK.
- ❌ Precisamos manter lib atualizada quando Stripe adiciona features.

### ADR-005: Captura automática (não manual)

**Contexto**: precisamos de UX rápida + escrow "soft".
**Decisão**: `capture_method: 'automatic'` + flag interna `RELEASED`.
**Consequências**:
- ✅ Latência mínima para cliente.
- ✅ Refund policy simples.
- ❌ Para escrow *real* (liberação só após N dias), precisa mudar.

---

## 24. Glossário

| Termo | Significado |
|-------|-------------|
| **Connect account** | Sub-conta Stripe que permite marketplace operar |
| **Express** | Tipo de Connect account com onboarding Stripe-hosted |
| **Destination charge** | Charge na plataforma com transfer automático ao destino |
| **Application fee** | Comissão retida pela plataforma |
| **Transfer** | Movimentação de fundos da plataforma para Connect account |
| **Payout** | Transferência da Connect account para o banco do reader |
| **PaymentIntent** | Objeto Stripe que representa intenção de pagamento |
| **Idempotency key** | Chave para garantir que operação seja executada apenas 1x |
| **Webhook** | Notificação assíncrona da Stripe para a plataforma |
| **Escrow** | Retenção de fundos até condição ser satisfeita |
| **Refund** | Devolução total ou parcial ao cliente |
| **Dispute** | Contestação de cobrança via banco emissor (chargeback) |

---

## 25. Referências

- Stripe Connect docs: https://stripe.com/docs/connect
- Destination charges: https://stripe.com/docs/connect/destination-charges
- Application fees: https://stripe.com/docs/connect/marketplace/tasks/app-fees
- Webhooks: https://stripe.com/docs/webhooks
- Signature verification: https://stripe.com/docs/webhooks#verify-official-libraries
- LGPD: https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd
- Connect onboarding types: https://stripe.com/docs/connect/accounts

---

**Mantenedor**: Wave 30 — Coder + Caio (security review)
**Próxima revisão**: Wave 35 (subscriptions / mentoria recorrente)