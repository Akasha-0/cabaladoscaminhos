# Akasha Prisma `user/*` + APIs com `name` — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar o código Akasha para usar modelos Prisma canônicos (`prisma.user`, `prisma.subscription`, etc.) e padronizar `name` como campo canônico nas APIs Akasha (sem `fullName`), removendo campos extras do register fora do schema.

**Architecture:** Mudança cirúrgica e 1:1: trocar acessos `prisma.akasha*` pelos models canônicos do schema atual, ajustar contratos request/response das rotas Akasha para `name`, e atualizar consumidores internos (onboarding/conta) e o pipeline Stripe (lib + webhook).

**Tech Stack:** Next.js App Router, Route Handlers, Prisma Client, Zod, Vitest, Stripe.

---

## Mapa de arquivos

**Modify (APIs Akasha):**
- `/home/skynet/cabala-dos-caminhos/src/app/api/akasha/auth/register/route.ts`
- `/home/skynet/cabala-dos-caminhos/src/app/api/akasha/auth/login/route.ts`
- `/home/skynet/cabala-dos-caminhos/src/app/api/akasha/auth/me/route.ts`
- `/home/skynet/cabala-dos-caminhos/src/app/api/akasha/auth/refresh/route.ts`
- `/home/skynet/cabala-dos-caminhos/src/app/api/akasha/chart/route.ts`
- `/home/skynet/cabala-dos-caminhos/src/app/api/akasha/mandala/route.ts`
- `/home/skynet/cabala-dos-caminhos/src/app/api/akasha/daily/route.ts`
- `/home/skynet/cabala-dos-caminhos/src/app/api/akasha/consult/route.ts`
- `/home/skynet/cabala-dos-caminhos/src/app/api/akasha/credits/route.ts`
- `/home/skynet/cabala-dos-caminhos/src/app/api/akasha/subscription/route.ts`
- `/home/skynet/cabala-dos-caminhos/src/app/api/akasha/checkout/route.ts`
- `/home/skynet/cabala-dos-caminhos/src/app/api/akasha/manifesto/generate/route.ts`
- `/home/skynet/cabala-dos-caminhos/src/app/api/akasha/manifesto/pdf/route.ts`

**Modify (Auth guard):**
- `/home/skynet/cabala-dos-caminhos/src/lib/auth/akasha-guard.ts`

**Modify (Stripe Akasha):**
- `/home/skynet/cabala-dos-caminhos/src/lib/akasha/stripe-akasha.ts`
- `/home/skynet/cabala-dos-caminhos/src/app/api/webhooks/akasha-stripe/route.ts`

**Modify (UI consumers internos):**
- `/home/skynet/cabala-dos-caminhos/src/app/(akasha)/onboarding/page.tsx`
- `/home/skynet/cabala-dos-caminhos/src/app/(akasha)/conta/page.tsx`
- `/home/skynet/cabala-dos-caminhos/src/app/(akasha)/conta/ContaClient.tsx`

**Modify (tests):**
- `/home/skynet/cabala-dos-caminhos/tests/api/akasha-auth-register.test.ts`

---

### Task 1: Guard + Auth APIs (`name` e `prisma.user`)

**Files:**
- Modify: `/home/skynet/cabala-dos-caminhos/src/lib/auth/akasha-guard.ts`
- Modify: `/home/skynet/cabala-dos-caminhos/src/app/api/akasha/auth/register/route.ts`
- Modify: `/home/skynet/cabala-dos-caminhos/src/app/api/akasha/auth/login/route.ts`
- Modify: `/home/skynet/cabala-dos-caminhos/src/app/api/akasha/auth/me/route.ts`
- Modify: `/home/skynet/cabala-dos-caminhos/src/app/api/akasha/auth/refresh/route.ts`

- [ ] **Step 1: Atualizar `akasha-guard.ts` para `prisma.user` e payload `name`**

Aplicar as trocas abaixo:

```ts
// loadAkashaUser
return await prisma.user.findUnique({ where: { id } });

// requireAkashaApi/requireAkashaUser return type e retorno
return { id: user.id, email: user.email, name: user.name };
```

- [ ] **Step 2: Atualizar `POST /api/akasha/auth/register` (request `name`, remover extras, persistir `intentionProfile`)**

Trocar o schema + create para refletir apenas campos suportados no schema atual do `User`.

```ts
const registerSchema = z.object({
  email: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
    z.string().email('Email inválido')
  ),
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
  name: z.string().min(2, 'Nome obrigatório'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'birthDate deve ser YYYY-MM-DD'),
  birthTime: z.string().min(1, 'Horário de nascimento obrigatório'),
  birthCity: z.string().min(1, 'Cidade de nascimento obrigatória'),
  birthLatitude: z.number().optional(),
  birthLongitude: z.number().optional(),
  birthTimezone: z.string().optional(),
  intentionProfile: z.record(z.unknown()).optional(),
});
```

Trocar os acessos Prisma:

```ts
const existing = await prisma.user.findUnique({
  where: { email: body.email },
  select: { id: true },
});

await prisma.user.create({
  data: {
    email: body.email,
    passwordHash,
    name: body.name,
    birthDate: new Date(body.birthDate),
    birthTime: body.birthTime,
    birthCity: body.birthCity,
    birthLatitude: body.birthLatitude,
    birthLongitude: body.birthLongitude,
    birthTimezone: body.birthTimezone,
    intentionProfile: body.intentionProfile ?? undefined,
  },
});
```

- [ ] **Step 3: Atualizar `POST /api/akasha/auth/login` para `prisma.user` e response `name`**

```ts
const user = await prisma.user.findUnique({
  where: { email: body.email },
});

const response = NextResponse.json({
  user: { id: user.id, email: user.email, name: user.name },
});
```

- [ ] **Step 4: Atualizar `GET /api/akasha/auth/me` para `prisma.user` e response `name`**

```ts
const user = await prisma.user.findUnique({
  where: { id: userOrResponse.id },
  select: { id: true, email: true, name: true, emailVerified: true, locale: true },
});

return NextResponse.json({
  id: user.id,
  email: user.email,
  name: user.name,
  emailVerified: user.emailVerified,
  locale: user.locale,
});
```

- [ ] **Step 5: Atualizar `POST /api/akasha/auth/refresh` para `prisma.user`**

```ts
const user = await prisma.user.findUnique({
  where: { id: payload.sub },
  select: { id: true, email: true },
});
```

- [ ] **Step 6: Verificar TypeScript local do conjunto (diagnósticos)**

Rodar: `npx tsc --noEmit`
Esperado: 0 erros relacionados a `fullName` e `prisma.akasha*` neste conjunto.

---

### Task 2: APIs Akasha restantes — migrar para models canônicos

**Files:**
- Modify: `/home/skynet/cabala-dos-caminhos/src/app/api/akasha/chart/route.ts`
- Modify: `/home/skynet/cabala-dos-caminhos/src/app/api/akasha/mandala/route.ts`
- Modify: `/home/skynet/cabala-dos-caminhos/src/app/api/akasha/daily/route.ts`
- Modify: `/home/skynet/cabala-dos-caminhos/src/app/api/akasha/consult/route.ts`
- Modify: `/home/skynet/cabala-dos-caminhos/src/app/api/akasha/credits/route.ts`
- Modify: `/home/skynet/cabala-dos-caminhos/src/app/api/akasha/subscription/route.ts`
- Modify: `/home/skynet/cabala-dos-caminhos/src/app/api/akasha/checkout/route.ts`
- Modify: `/home/skynet/cabala-dos-caminhos/src/app/api/akasha/manifesto/generate/route.ts`
- Modify: `/home/skynet/cabala-dos-caminhos/src/app/api/akasha/manifesto/pdf/route.ts`

- [ ] **Step 1: `POST /api/akasha/chart` → `prisma.birthChart` e `prisma.user`**

Trocar:

```ts
const existing = await prisma.birthChart.findUnique({
  where: { userId },
  select: { id: true },
});

const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    name: true,
    birthDate: true,
    birthTime: true,
    birthLatitude: true,
    birthLongitude: true,
    birthTimezone: true,
  },
});

// buildKabalisticMap deve receber user.name
kabalisticMap = buildKabalisticMap(user.name, birthDateStr);

const chart = await prisma.birthChart.create({ data: { ... } });
```

- [ ] **Step 2: `GET /api/akasha/mandala` → `prisma.birthChart`**

Trocar:

```ts
const chart = await prisma.birthChart.findUnique({
  where: { userId: auth.id },
});
```

- [ ] **Step 3: `GET /api/akasha/daily` → `prisma.dailyReading` + `prisma.birthChart`**

Trocar:

```ts
const existing = await prisma.dailyReading.findUnique({
  where: { userId_date: { userId, date: today } },
});

const birthChart = await prisma.birthChart.findUnique({
  where: { userId },
});

const record = await prisma.dailyReading.create({
  data: { userId, date: today, climate: ..., ritual: ..., alert: ..., tensionPoint: ... },
});
```

- [ ] **Step 4: `POST /api/akasha/consult` → `prisma.creditEntry`, `prisma.consultation`, `prisma.chatMessage`, `prisma.birthChart`**

Trocas mínimas (nomes dos models):

```ts
const ledger = await prisma.creditEntry.aggregate({
  where: { userId },
  _sum: { delta: true },
});

const existing = await prisma.consultation.findUnique({
  where: { id: consultationId, userId },
  select: { id: true },
});

consultation = await prisma.consultation.create({
  data: { userId, title: question.slice(0, 80) },
  select: { id: true },
});

await prisma.chatMessage.create({ data: { consultationId: consultation.id, ... } });

const chart = await prisma.birthChart.findUnique({
  where: { userId },
  select: { astrologyMap: true, kabalisticMap: true, oduBirth: true },
});

await prisma.creditEntry.create({
  data: { userId, delta: -creditCost, reason: ..., balance: newBalance },
});
```

- [ ] **Step 5: `GET/POST /api/akasha/credits` → `prisma.creditEntry` + `prisma.user`**

```ts
const result = await prisma.creditEntry.aggregate({
  where: { userId: authResult.id },
  _sum: { delta: true },
});

const user = await prisma.user.findUnique({ where: { id: body.userId } });

const entry = await prisma.creditEntry.create({ data: { ... } });
```

- [ ] **Step 6: `GET /api/akasha/subscription` → `prisma.subscription`**

```ts
const sub = await prisma.subscription.findUnique({
  where: { userId: auth.id },
  select: { plan: true, status: true, currentPeriodEnd: true, stripeSubscriptionId: true },
});
```

- [ ] **Step 7: `POST /api/akasha/checkout` → `prisma.user`**

```ts
const user = await prisma.user.findUnique({
  where: { id: auth.id },
  select: { email: true, name: true },
});
```

- [ ] **Step 8: Manifesto**

`POST /api/akasha/manifesto/generate`:

```ts
const existing = await prisma.manifesto.findUnique({
  where: { userId: auth.id },
  select: { id: true, content: true },
});

const [user, chart] = await Promise.all([
  prisma.user.findUnique({ where: { id: auth.id }, select: { name: true } }),
  prisma.birthChart.findUnique({ where: { userId: auth.id } }),
]);

const content = buildManifestoContent(user.name, ...);

const manifesto = await prisma.manifesto.create({ data: { userId: auth.id, content: content as object }, select: { id: true } });
```

`GET /api/akasha/manifesto/pdf`:

```ts
const manifesto = await prisma.manifesto.findUnique({
  where: { userId: auth.id },
});
```

---

### Task 3: Stripe Akasha + webhook — migrar para models canônicos

**Files:**
- Modify: `/home/skynet/cabala-dos-caminhos/src/lib/akasha/stripe-akasha.ts`
- Modify: `/home/skynet/cabala-dos-caminhos/src/app/api/webhooks/akasha-stripe/route.ts`

- [ ] **Step 1: Atualizar `stripe-akasha.ts` para `prisma.subscription` e `prisma.creditEntry`**

```ts
const sub = await prisma.subscription.findUnique({ where: { userId } });

await prisma.subscription.upsert({
  where: { userId },
  create: { userId, stripeCustomerId: customer.id },
  update: { stripeCustomerId: customer.id },
});

const result = await prisma.creditEntry.aggregate({ where: { userId }, _sum: { delta: true } });

await prisma.creditEntry.create({ data: { userId, delta: amount, reason, balance: newBalance } });
```

- [ ] **Step 2: Atualizar webhook `akasha-stripe` para `prisma.subscription`, `prisma.user`**

Trocas mínimas:

```ts
await prisma.subscription.upsert({ ... });
const sub = await prisma.subscription.findFirst({ where: { stripeCustomerId: customerId } });
await prisma.subscription.update({ where: { id: sub.id }, data: { ... } });
```

Remover referência a `prisma.akashaUser.update` e trocar para `prisma.user.update` quando `productType === 'manifesto'`:

```ts
const existing = await prisma.user.findUnique({
  where: { id: userId },
  select: { intentionProfile: true },
});
const current = (existing?.intentionProfile && typeof existing.intentionProfile === 'object')
  ? (existing.intentionProfile as Record<string, unknown>)
  : {};

await prisma.user.update({
  where: { id: userId },
  data: {
    intentionProfile: {
      ...current,
      manifestoPurchased: true,
      manifestoPurchasedAt: new Date().toISOString(),
    },
  },
});
```

---

### Task 4: Consumers internos (UI Akasha) — `name` e remoção de campos extras

**Files:**
- Modify: `/home/skynet/cabala-dos-caminhos/src/app/(akasha)/onboarding/page.tsx`
- Modify: `/home/skynet/cabala-dos-caminhos/src/app/(akasha)/conta/page.tsx`
- Modify: `/home/skynet/cabala-dos-caminhos/src/app/(akasha)/conta/ContaClient.tsx`

- [ ] **Step 1: Onboarding — trocar `fullName` → `name`**

Trocar o `FormData` e `INITIAL`:

```ts
type FormData = {
  name: string;
  email: string;
  password: string;
  intention: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  quiz1: string;
  quiz2: string;
  consent: boolean;
};

const INITIAL: FormData = {
  name: '',
  email: '',
  password: '',
  intention: '',
  birthDate: '',
  birthTime: '',
  birthCity: '',
  quiz1: '',
  quiz2: '',
  consent: false,
};
```

Trocar payload do register:

```ts
const registerPayload = {
  email: form.email,
  password: form.password,
  name: form.name,
  birthDate: form.birthDate,
  birthTime: form.birthTime,
  birthCity: form.birthCity,
  birthLatitude: undefined,
  birthLongitude: undefined,
  birthTimezone: undefined,
  intentionProfile,
};
```

E trocar os binds do input:

```tsx
value={form.name}
onChange={(e) => set('name', e.target.value)}
```

- [ ] **Step 2: Conta — `user.fullName` → `user.name`**

`conta/page.tsx`:

```ts
const user = meRes.ok ? await meRes.json() : { name: '', email: '' };
```

`ContaClient.tsx`:

```ts
type Props = {
  user: { name: string; email: string };
  ...
};

{user.name}
```

---

### Task 5: Testes (Vitest) — register com `name` e Prisma canônico

**Files:**
- Modify: `/home/skynet/cabala-dos-caminhos/tests/api/akasha-auth-register.test.ts`

- [ ] **Step 1: Atualizar mocks Prisma**

```ts
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: (args: unknown) => mockFindUnique(args),
      create: (args: unknown) => mockCreate(args),
    },
  },
}));
```

- [ ] **Step 2: Atualizar `validBody` para `name` e remover campos excluídos**

```ts
const validBody = {
  email: 'novo@akasha.com',
  password: 'senha12345',
  name: 'Nome Completo',
  birthDate: '2000-01-02',
  birthTime: '10:30',
  birthCity: 'São Paulo',
  intentionProfile: { quest: 'proposito', energy: 'fluxo' },
};
```

- [ ] **Step 3: Atualizar testes que removiam `consentGiven`**

Substituir o teste “consent ausente” por um caso inválido real (ex.: `name` ausente):

```ts
it('retorna 400 quando name está ausente', async () => {
  const { POST } = await import('@/app/api/akasha/auth/register/route');
  const { name: _name, ...withoutName } = validBody;
  const res = await POST(makeJsonRequest('http://l/api/akasha/auth/register', withoutName));
  expect(res.status).toBe(400);
  const body = await res.json();
  expect(body.error).toBe('Dados inválidos');
});
```

- [ ] **Step 4: Rodar suite focada**

Rodar: `npm run test:run -- tests/api/akasha-auth-register.test.ts`
Esperado: PASS

---

### Task 6: Verificação final (quality gates)

- [ ] **Step 1: Typecheck**

Rodar: `npx tsc --noEmit`
Esperado: 0 erros

- [ ] **Step 2: Testes**

Rodar: `npm run test:run`
Esperado: baseline + sem novas falhas ligadas a Akasha

- [ ] **Step 3: Build**

Rodar: `npm run build`
Esperado: sem novas falhas relacionadas a Akasha

---

## Self-review (plan)

- Cobertura da spec:
  - `name` canônico em register/login/me + consumidores internos ✅ (Task 1 + Task 4)
  - Remoção de `birthState/birthCountry/consent*` ✅ (Task 1 + Task 4 + Task 5)
  - Migração `prisma.akasha*` → models canônicos ✅ (Task 1 + Task 2 + Task 3)
  - Stripe lib/webhook ✅ (Task 3)
  - Test atualizado ✅ (Task 5)
- Placeholder scan: sem “TODO/TBD”; todos os passos têm snippets e comandos ✅

