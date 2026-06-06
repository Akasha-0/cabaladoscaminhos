# Spec — Akasha: Prisma `user/*` + `name` canônico nas APIs

Data: 2026-06-06

## Objetivo

Atualizar o código Akasha para:

- Usar modelos Prisma canônicos (`prisma.user`, `prisma.subscription`, etc.), removendo dependências de `prisma.akasha*`.
- Padronizar o campo **`name`** como canônico no contrato das APIs Akasha (sem `fullName`).
- Remover do fluxo Akasha os campos fora do schema atual: `birthState`, `birthCountry`, `consentGiven`, `consentAt`.

## Escopo

### Arquivos-alvo

- `src/app/api/akasha/**`
- `src/lib/auth/akasha-guard.ts`
- Stripe Akasha:
  - `src/lib/akasha/stripe-akasha.ts`
  - `src/app/api/webhooks/akasha-stripe/route.ts`

### Mudanças de contrato (APIs Akasha)

- `POST /api/akasha/auth/register`
  - Request: trocar `fullName` → `name`
  - Remover do request: `birthState`, `birthCountry`, `consentGiven`
  - Persistir apenas campos existentes no schema do `User`:
    - `email`, `passwordHash`, `name`
    - `birthDate`, `birthTime`, `birthCity`, `birthLatitude`, `birthLongitude`, `birthTimezone`
    - `intentionProfile` (JSON), quando enviado
- `POST /api/akasha/auth/login`
  - Response: `user: { id, email, name }`
- `GET /api/akasha/auth/me`
  - Response: `{ id, email, name, emailVerified, locale }`

### Troca de models Prisma (sem `prisma.akasha*`)

Mapeamento 1:1 esperado (a partir do schema atual):

- `prisma.akashaUser` → `prisma.user`
- `prisma.akashaSubscription` → `prisma.subscription`
- `prisma.akashaCreditEntry` → `prisma.creditEntry`
- `prisma.akashaBirthChart` → `prisma.birthChart`
- `prisma.akashaDailyReading` → `prisma.dailyReading`
- `prisma.akashaManifesto` → `prisma.manifesto`
- `prisma.akashaConsultation` → `prisma.consultation`
- `prisma.akashaChatMessage` → `prisma.chatMessage`

## Fora de escopo (não fazer)

- Alterar `prisma/schema.prisma` (sem migrations nesta mudança).
- Manter compatibilidade de request/response com `fullName`.
- Persistir `birthState`, `birthCountry`, `consentGiven`, `consentAt` em qualquer lugar (incluindo JSON).

## Implicações por área

### Auth guard (`akasha-guard.ts`)

- Resolver usuário via `verifyAkashaToken` e carregar via `prisma.user`.
- Payload retornado por `requireAkashaApi`/`requireAkashaUser` deve expor `name` (não `fullName`).

### Checkout/Webhook Stripe

- Substituir `prisma.akashaSubscription`/`prisma.akashaCreditEntry`/`prisma.akashaUser` pelos models canônicos.
- Ao marcar compra de manifesto no `User.intentionProfile`, não sobrescrever todo o JSON; atualizar preservando o restante (merge com o valor existente).

### Consumers internos (UI Akasha)

- Onboarding: trocar campo/label/form de `fullName` → `name`; remover inputs e envio de `birthState` e `birthCountry`; remover validação/envio de `consentGiven`.
- Conta: trocar `user.fullName` → `user.name` (props + render).

## Testes (critérios de sucesso)

- Atualizar `tests/api/akasha-auth-register.test.ts`:
  - Payload válido usa `name` e não envia `birthState/birthCountry/consentGiven`.
  - Mock Prisma aponta para `prisma.user` (não `prisma.akashaUser`).
- Validar:
  - `npx tsc --noEmit`
  - `npm run test:run`
  - `npm run build`

