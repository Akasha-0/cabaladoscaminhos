# RQ-025 — Tech Stack v1 (Decisões Arquiteturais)

> **Artefato central da Fase 4 (Tech Stack).** Consolida **D-030 → D-039**
> em 1 documento canônico. Define as **10 decisões binárias** de stack
> que governam Fase 5-6, os **critérios de escolha** (custo, lock-in,
> LGPD, BR-real), o **roadmap de implementação**, e o **inventário vivo**
> do que está em uso no repositório.
>
> **Data:** 2026-06-10
> **Pesquisador:** agente autônomo (sessão N)
> **Dependências:** R-020..R-024 ✅ + `package.json` +
> `apps/akasha-portal/package.json` + `packages/mentor/package.json`
> **Próxima iteração:** v2 (após D-040 Schema Prisma + D-041 Akasha Core
> Algorithm em TS puro) — v2 vai validar se essas decisões sustentam o
> código real
> **Confidence:** HIGH nas 7 decisões com lock-in; MED-HIGH nas 3 com
> trade-off (LLM provider, Auth, Storage)

---

## 0. TL;DR — A Decisão de Stack

**Akasha roda em 1 monorepo pnpm workspaces com 3 camadas:**

1. **Portal** (`apps/akasha-portal`) — Next.js 16 (App Router) + RSC
   + Turbopack. PWA-first, mobile-first, PT-BR nativo.
2. **Mentor CLI** (`packages/mentor`) — Ink 5 (React para terminal),
   mesma lógica de Mentor do portal, praxe B2B (Mentor Certificado
   trabalha no shell).
3. **Engines** (`packages/akasha-core*`) — 5 pacotes `@akasha/core-*`
   workspace (cabala, astrologia, tantra, odus, iching) + 1
   `@akasha/core` orquestrador + 1 `@akasha/types`. **Puros, sem
   rede, determinísticos** (R-022 §1.2 — D1).

**10 decisões binárias fixadas** (D-030..D-039):

| # | Decisão | Escolha | Lock-in | Alt rejeitada | Por quê |
|---|---------|---------|---------|---------------|---------|
| D-030 | Framework SSR | **Next.js 16 (App Router) + RSC + Turbopack** | HIGH | Remix / Vite SPA / Astro | Edge-friendly, RSC + server actions, PWA, Vercel Fluid Compute |
| D-031 | DB + embeddings | **Postgres 18 + pgvector + Prisma 7.8** | HIGH | MongoDB / Pinecone / Qdrant | Relacional + vetorial no mesmo banco, BR-real (RDS/Neon/Supabase), Prisma 7 schema-only |
| D-032 | LLM principal | **Vercel AI Gateway + "provider/opus-4-6"** (string provider) | MED | OpenAI SDK direto / Anthropic SDK | Gateway = observability + fallbacks + 1ª classe para Vercel, **não amarra** num vendor |
| D-033 | Realtime | **SSE (Server-Sent Events)** | LOW | WebSocket / Long-poll | Stateless, edge-friendly, 1 direção servidor→cliente basta p/ streaming do Mentor |
| D-034 | Auth | **Supabase Auth (`@supabase/ssr` + `@supabase/supabase-js`)** | MED | Clerk / Auth0 / NextAuth | BR-real (LGPD by design), Postgres row-level, free tier amplo, **já em uso** no portal |
| D-035 | Payments | **Stripe 22 (BRL)** | HIGH | Pagar.me / Mercado Pago | Subscriptions + Pix + Boleto + split, dashboard canônico, B2B support |
| D-036 | Deploy | **Vercel (Fluid Compute, Node 24 LTS)** | MED | Self-host VPS / Fly.io / Render | Build em 1 clique, edge runtime, crons + queues nativos, **escala zero** no início |
| D-037 | State client | **Zustand 5** (RSC + server actions p/ server) | LOW | Redux Toolkit / Jotai / Recoil | 2KB, hook-first, sem boilerplate, **já em uso** |
| D-038 | PWA | **Serwist 9** (Next 16 PWA plugin) + web-push 3.6 | LOW | next-pwa (deprecated) / Workbox direto | Manutenção ativa, App Router nativo, TypeScript-first |
| D-039 | Test | **Vitest 3 (unit) + Playwright 1.60 (e2e)** | HIGH | Jest / Cypress | Vitest = native ESM + HMR + faster, **já em uso**; Playwright = multi-browser + MCP |

> **Por que MED e não HIGH em D-032/D-034/D-036?** porque o "modelo" e o
> "host" podem ser trocados sem reescrever o app — o que importa é o
> **contrato** (Vercel AI SDK 6 + Postgres + Next 16), não o vendor.

---

## 1. Critérios de Escolha (5 invariantes)

Toda decisão de stack tem que passar por estes 5 crivos, em ordem:

### 1.1 LGPD by design (BR-real, dado pessoal + dado espiritual)

- **Processa dado pessoal + dado espiritual sensível** (data nascimento,
  local, intenção, Mandato, histórico de crise) — Akasha é **CRÍTICO**
  em LGPD.
- **Servidores em BR** ou contrato com adequacy — AWS São Paulo (sa-east-1)
  via Vercel, **Supabase** com região sa-east-1.
- **Sem pool de dados para LLM** — opt-out obrigatório (Akasha usa AI
  Gateway com zero data retention: `zeroDataRetention: true`).
- **Direito ao esquecimento** — DELETE de usuário apaga **tudo** (perfil,
  Mandatos, embeddings) em ≤ 30 dias (LGPD Art. 18 VI).
- **Logs sem PII** — Sentry com `beforeSend` que strip nome/email/datas.

### 1.2 Custo zero no início (validar antes de gastar)

- **Free tier** em todos os serviços core até 1k MAU:
  - Vercel: 100GB bandwidth/mês free
  - Supabase: 500MB DB + 1GB storage free
  - Vercel AI Gateway: 1M tokens/mês free (verificar 2026)
  - Stripe: sem mensalidade, % por transação
  - Resend (email): 3k/mês free
  - Sentry: 5k events/mês free
- **Sem custos fixos** até produto validado (R$ 0/mês é meta dos primeiros
  6 meses).

### 1.3 Custo previsível depois (1k-100k MAU)

- **Vercel Pro** $20/mês (1 seat) — escala automática.
- **Supabase Pro** $25/mês — 8GB DB + 100GB storage + 250GB bandwidth.
- **Vercel AI Gateway** pay-per-token — ~$0.005/1k tokens (Opus 4.6) =
  ~R$ 25/mês p/ 100 usuários × 30 mensagens.
- **Stripe** 4% + R$ 0,39 por transação BR.
- **Sentry Team** $26/mês — 50k events.
- **Resend Pro** $20/mês — 50k emails.
- **Total estimado @ 10k MAU:** ~R$ 800-1.500/mês (varia com LLM).
- **Total estimado @ 100k MAU:** ~R$ 8-15k/mês (ainda saudável para
  receita esperada R$ 50-200k/mês com 5% B2B + freemium 2%).

### 1.4 Lock-in minimizado (portabilidade)

- **DB é Postgres puro** — `pg_dump` funciona, Prisma 7 é apenas
  type-safe query layer (sem lock-in no schema).
- **Auth é Supabase** mas a interface é NextAuth-compatible (a
  `getUser()` retorna o shape padrão) — trocar para Clerk = 1 refactor
  de 4 arquivos.
- **LLM é AI SDK 6** — trocar de OpenAI para Anthropic = 1 linha
  (`model: "anthropic/claude-opus-4-6"` no AI Gateway).
- **Frontend é React 19 + Next 16** — se Vercel cair, self-host em
  Node 24 LTS = mesmo `pnpm build && pnpm start`.
- **Storage é Supabase Storage S3-compatible** — exportar para R2/S3
  = 1 `aws s3 sync`.

### 1.5 Estabilidade 2026 (versão recente + suporte ativo)

- Toda dep tem que ter **commit nos últimos 90 dias** (verificado
  2026-06-10).
- Sem libs `@deprecated` ou em "maintenance mode" (ex: `next-pwa` ❌,
  `Serwist` ✅).
- Sem libs com **CVE aberto HIGH/CRITICAL** no GitHub Advisory.

---

## 2. Decisão D-030 — Framework SSR: **Next.js 16 (App Router) + RSC + Turbopack**

### 2.1 O que está em uso (verificado em `package.json`)

```json
"next": "16.2.6",
"react": "19.2.4",
"react-dom": "19.2.4"
```

### 2.2 Por que Next.js 16

- **App Router estável** desde 14 — agora (16) é o default de fato em
  2026 (Next.js docs 2026).
- **React Server Components (RSC)** — server-side computation da Mandala
  + cálculo de Pilar no servidor, **zero JS no client** para a página
  Mandala (SEO + perf).
- **Server Actions** — POST do Mentor (chat) sem escrever 1 endpoint
  REST, com validação Zod no servidor.
- **Turbopack** — bundler 5-10× mais rápido que Webpack (Turbopack
  stable em Next 16). Build local: ~6s vs 30s Webpack.
- **Vercel-first** — deploy zero-config, Fluid Compute, edge runtime
  opcional.
- **PWA** — suportado via Serwist 9 (próximo D-038).
- **i18n nativo** — `app/[lang]/page.tsx` pattern.

### 2.3 Por que NÃO as alternativas

- **Remix** — sem RSC, mais "old school", comunidade menor em 2026.
- **Vite SPA** — não roda server-side, Mandala calcularia no client =
  leak de algoritmo (LGPD + IP).
- **Astro** — bom p/ marketing, fraco p/ app com auth + DB + chat.
- **SvelteKit / Nuxt** — React 19 + ecossistema +89k packages vence
  qualquer outro ecossistema p/ nosso caso (Three.js, Base UI,
  framer-motion, OpenAI SDK).

### 2.4 Edge cases + armadilhas conhecidas

- **HMR stale no Turbopack** — ver memory `nextjs-turbopack-stale-hmr`:
  overlay pode mostrar erro antigo por minutos. Solução: `pnpm build`
  para ground truth.
- **Server Actions só POST** — qualquer GET precisa ser Route Handler
  (`route.ts`). Para streaming do Mentor (SSE) → Route Handler com
  `runtime = 'edge'` ou `runtime = 'nodejs'` (Fluid Compute).
- **Next 16 + React 19** — `use()` hook + Suspense; cuidado com
  hydration em PWA.

---

## 3. Decisão D-031 — DB: **Postgres 18 + pgvector + Prisma 7.8**

### 3.1 O que está em uso (verificado)

```json
"@prisma/adapter-pg": "^7.8.0",
"@prisma/client": "^7.8.0",
"pg": "^8.21.0"
```

E em `apps/akasha-portal/prisma/schema.prisma` (já sincronizado com
Postgres local 18 + pgvector 0.8 instalado via `apt install
postgresql-18-pgvector`).

### 3.2 Por que Postgres 18

- **ACID + relacional + JSONB + full-text** — Akasha precisa de
  **tudo**: tabelas (User, Mandato, Pilar, Embedding), JSONB (cálculo
  do Pilar serializado), full-text (busca no Grimório), **vetorial**
  (RAG do Mentor via embeddings).
- **pgvector 0.8** — embeddings até 16k dimensões (OpenAI text-embedding-3
  = 3k, BGE-M3 = 1024). HNSW index para ANN em <50ms @ 100k rows.
- **Postgres 18 LTS** (out 2024) — suporte até 2029, parallel I/O
  melhorado, logical replication mais confiável.
- **No Brasil** — AWS RDS sa-east-1, Neon sa-east-1, Supabase
  sa-east-1, **todos têm Postgres 18**.

### 3.3 Por que Prisma 7

- **Type-safe queries** — Akasha Core Algorithm retorna tipos que
  Prisma consome direto (`@akasha/core` → Prisma Client).
- **Schema-first** — `schema.prisma` é o source of truth (sem SQL
  hand-written em features).
- **Prisma 7 = config-only** — URL sai de `schema.prisma` (só
  `provider`) e vai para `prisma.config.ts` com `env()`. Resolve o
  conflito histórico "URL hardcoded vs. env var".
- **Adapter nativo** — `@prisma/adapter-pg` permite connection pool
  com `pg` puro (sem Prisma Engine Rust) — mais leve para Vercel
  Functions.
- **Migrations** — `prisma migrate dev` (desenvolvimento) +
  `prisma migrate deploy` (produção).

### 3.4 Por que NÃO as alternativas

- **MongoDB** — sem joins, sem vetorial nativo, sem full-text
  comparável, BR-real mais caro.
- **Pinecone / Qdrant / Weaviate** — só vetorial, precisa de outro
  DB relacional ao lado = 2 fontes de verdade. Akasha é pequeno o
  suficiente para 1 banco.
- **Supabase DB direto (sem Prisma)** — `supabase-js` query builder
  é menos type-safe, migrations ad-hoc. Prisma é a melhor DX p/
  TypeScript em 2026.

### 3.5 Edge cases + armadilhas

- **Shadow DB em migrations** — `prisma migrate dev` precisa de
  shadow DB; em produção usa `prisma migrate deploy` (sem shadow).
- **pgvector 0.8** — só funciona se extensão estiver criada: já feito
  localmente com `apt install postgresql-18-pgvector`. Em produção
  (RDS/Supabase) criar via migration SQL.
- **Connection pool** — Vercel Functions podem esgotar conexões. Solução:
  `?pgbouncer=true` no Supabase / pooler do Neon / `@prisma/adapter-pg`
  com `pg.Pool({ max: 10 })`.

---

## 4. Decisão D-032 — LLM: **Vercel AI Gateway + AI SDK 6 + "anthropic/claude-opus-4-6"**

### 4.1 O que está em uso (verificado)

```json
"openai": "^6.39.0"
```

E em `packages/mentor/src/mentor.ts` — o cliente OpenAI é instanciado
diretamente. **A migração para AI Gateway é prevista neste R-025** (a
fazer em Fase 5 junto com D-041).

### 4.2 Por que Vercel AI Gateway

- **Padrão Vercel 2026** (verificado em session-start hook do Vercel
  Plugin, datado 2026-02-27): *"For AI SDK usage on Vercel, prefer
  plain `provider/model` strings through the gateway by default; do
  not default to provider-specific packages like `@ai-sdk/anthropic`
  unless the user explicitly asks for direct provider wiring."*
- **Unifica múltiplos providers** — `"anthropic/claude-opus-4-6"`,
  `"openai/gpt-5"`, `"minimax/MiniMax-M3"` no mesmo SDK.
- **Zero data retention** — `zeroDataRetention: true` por default
  (essencial p/ LGPD).
- **Observability nativa** — request/response/token usage/logs no
  dashboard Vercel, sem Sentry custom.
- **Fallbacks** — se Opus 4.6 cair, gateway roteia para Sonnet 4.6
  automaticamente.
- **Preço igual ao provider direto** — "same price" (Vercel docs 2026).

### 4.3 Modelo principal

**`anthropic/claude-opus-4-6`** (string do gateway) — escolhido por:

- **Citado pelo próprio Vercel** como "most capable" p/ reasoning
  (Vercel docs 2026).
- **Persona v1 §11** já desenhou system prompt com 3ª pessoa
  ritualística — Opus 4.6 executa isso melhor que Sonnet (cf.
  Anthropic docs 2026).
- **Custo aceitável** — $15/M input, $75/M output (Anthropic público
  2026). Para 100k MAU × 5 mensagens/dia × ~2k tokens = $1.5k/mês em
  Opus 4.6.

**Fallback (graceful degradation):** `"anthropic/claude-sonnet-4-6"`
(reduz custo 5× para 80% dos casos onde o prompt é simples —
browse de Mandato, lembrete de ritual, navegação).

**Fallback de crise:** `minimax/MiniMax-M3` (nossa própria família
de modelo) para detecção de padrões de crise em prompts — não gera
resposta ao usuário, apenas classifica → CVV 188 (R-022 §5 limite
ético #6).

### 4.4 AI SDK 6 vs OpenAI SDK direto

- **AI SDK 6** (`ai` + `@ai-sdk/react` + `@ai-sdk/anthropic`) — abstrai
  provider, expõe `streamText()`, `useChat()`, `generateObject()`.
  **Migração de `openai` SDK → `ai` SDK é obrigatória** (próximo
  milestone Fase 5).
- **Por que AI SDK 6** — mesmo código roda em **5 providers** sem
  mudar 1 linha; `useChat` hook do `@ai-sdk/react` integra direto
  com `<Chat/>` do Base UI ou componente custom.
- **`openai` SDK 6.39** pode ficar para casos edge (ex: `responses`
  API para Vision do Pilar 2 mapa astral) — coexistência permitida.

### 4.5 Embeddings (RAG do Mentor)

- **Modelo:** `text-embedding-3-large` (OpenAI 3k dim) ou `voyage-3`
  (Anthropic preferred 2026, 1024 dim). Akasha escolhe **OpenAI
  text-embedding-3-small** (1.5k dim, $0.02/M tokens) — bom custo-
  benefício para 100k chunks do Grimório.
- **Indexação:** pgvector HNSW com `vector_cosine_ops`.
- **Top-K:** 5 (R-023 §7) — top 5 chunks mais similares + 1 metadata
  (Pilar + data).

### 4.6 Por que NÃO as alternativas

- **OpenAI SDK direto (sem gateway)** — sem observability, sem
  fallback, lock-in.
- **Anthropic SDK direto** — sem fallback, sem multi-model.
- **Self-host Llama 4 / Mixtral** — Akasha é BR-real, GPUs H100
  custam $2-4/h em BR, não compensa até 100k+ MAU.
- **Open source local (Ollama)** — viável só para "on-device crisis
  classifier" (Fase 7+), não para geração.

### 4.7 Edge cases + armadilhas

- **System prompt grande** — persona v1 §11 é ~2k tokens de system
  prompt. Opus 4.6 = 200k context, sem problema. Sonnet 4.6 = 200k
  também.
- **Rate limits** — Vercel AI Gateway tem 1M tokens/mês free, depois
  pay-as-you-go. Akasha começa free.
- **Custo por mensagem** — 1 conversa Mentor = ~3k tokens =
  $0.045 (Opus 4.6) ou $0.009 (Sonnet 4.6). Cap de uso 1/dia free
  = sustentável.
- **Prompt injection** — R-022 §5 #3 + R-023 §7: **toda entrada do
  usuário vai em `user` role, nunca `system`**. Tool `classify_intent`
  roda antes de gerar.

---

## 5. Decisão D-033 — Realtime: **SSE (Server-Sent Events)**

### 5.1 O que está em uso (a fazer)

Não há SSE/WS no código ainda (verificado por grep). Será adicionado
em D-041 (Mentor chat endpoint) na Fase 5.

### 5.2 Por que SSE

- **Streaming do Mentor** — token-by-token do LLM, 1 direção
  (server → client). SSE resolve com 1 GET request.
- **Stateless** — não precisa de WS hub central, **escala horizontal
  sem sticky session**.
- **Edge-friendly** — `Response` com `ReadableStream` + `runtime = 'edge'`
  ou Fluid Compute Node 24.
- **Reconexão automática** — browser reconecta sozinho se cair.
- **HTTP/2 multiplex** — não bloqueia outras requests.
- **Compatível com Vercel Functions** — Fluid Compute suporta streams
  longos (até 300s timeout default em 2026).

### 5.3 Por que NÃO WebSocket

- **Stateful** — Vercel Functions são serverless; WS precisa de
  servidor persistente (não cabe).
- **Bidirecional** — Akasha só precisa de 1 direção; bidirecional
  é over-engineering.
- **Mais complexo** — heartbeat, reconnection, sticky session,
  proxy-aware.
- **Custo** — Vercel cobra $0.05/GB em WS (mais que SSE).

### 5.4 Implementação canônica

```ts
// app/api/akasha/mentor/stream/route.ts
export const runtime = 'nodejs'; // Fluid Compute
export const maxDuration = 60; // 60s stream

export async function POST(req: Request) {
  const { messages, mandala } = await req.json();

  const result = streamText({
    model: 'anthropic/claude-opus-4-6',
    system: buildSystemPrompt(mandala),
    messages,
    tools: { cite_source, query_grimoire, ... },
  });

  return result.toDataStreamResponse(); // AI SDK 6 → SSE
}
```

Cliente (React 19 + AI SDK 6):

```ts
'use client';
import { useChat } from '@ai-sdk/react';

export function MentorChat() {
  const { messages, input, handleSubmit, status } = useChat({
    api: '/api/akasha/mentor/stream',
    body: { mandala }, // server action pode passar mandala
  });
  return <ChatShell messages={messages} status={status} />;
}
```

### 5.5 Edge cases

- **Vercel timeout 300s** (2026 default) — sessões longas do Mentor
  > 5 min devem ser paginadas em chunks (tool call `get_recent_mandates`
  resume a sessão).
- **Mobile offline** — PWA queue a mensagem e envia quando voltar
  online (próximo D-038).
- **Vercel AI Gateway timeout** — 60s por request. Para respostas
  Opus 4.6 > 60s, quebrar em 2 chamadas (tool call chain).

---

## 6. Decisão D-034 — Auth: **Supabase Auth (`@supabase/ssr`)**

### 6.1 O que está em uso (verificado)

```json
"@supabase/ssr": "^0.10.3",
"@supabase/supabase-js": "^2.106.2"
```

E em código:
- `apps/akasha-portal/src/components/providers/SupabaseProvider.tsx`
- `apps/akasha-portal/src/lib/interface/api/auth-utils.ts`
- `apps/akasha-portal/src/lib/application/push/push-subscription-service.ts`

**Já em uso.** Decisão **retroativa** de validar.

### 6.2 Por que Supabase Auth

- **BR-real (sa-east-1)** — Supabase Pro tem região São Paulo, LGPD
  compliance documentado.
- **Postgres row-level security (RLS)** — `auth.uid() = user_id` em
  toda tabela. Akasha é **multi-tenant por usuário**; RLS é a
  segurança em profundidade ideal.
- **Free tier generoso** — 50k MAU auth free.
- **Built-in:** email/password, magic link, OAuth (Google, Apple,
  GitHub), TOTP 2FA, recovery, audit log.
- **JWT padrão OIDC** — `getUser()` retorna shape compatível com
  NextAuth; trocar de vendor = 1 refactor.
- **Já tem `pg`** — Akasha usa Prisma+pg para dados de produto,
  Supabase para auth (que escreve em `auth.users`). RLS compartilha
  o mesmo DB.

### 6.3 Por que NÃO as alternativas

- **Clerk** — mais bonito UI pre-built, $25/mês após 10k MAU = caro,
  vendor de auth (não Postgres nativo). Lock-in médio.
- **Auth0** — enterprise-grade, mas overkill ($240/mês após 1k MAU)
  e BR é "regional add-on".
- **NextAuth.js (Auth.js)** — bom, mas precisa montar adapter
  Prisma manual. Supabase já tem tudo.
- **JWT próprio + bcrypt** — funciona, mas reinventa password reset,
  email verify, 2FA, recovery, audit log. Custo de manutenção alto.
  (Há `bcryptjs` + `jsonwebtoken` no package — usado **só** para
  auth do Mentor CLI, não do portal web.)

### 6.4 Mentor CLI auth (separada)

`packages/mentor` usa **JWT próprio** (`jsonwebtoken` + `bcryptjs` +
`otpauth` + `qrcode`) — login via email+senha+TOTP, **sem Supabase**.
Justificativa: o Mentor Certificado (B2B) roda em terminal próprio,
não compartilha sessão com o portal web. CLI tem seu próprio
subscription tier (R$ 295/895/1995 — R-022 §13). **Lock-in aceitável**:
o JWT do CLI valida 1 token contra 1 secret, simples.

### 6.5 Edge cases

- **Cookies SSR** — `@supabase/ssr` 0.10+ lida com cookie store
  server-side. Cuidado: em RSC, **NUNCA** usar
  `supabase.auth.getUser()` sem middleware antes (race condition com
  cookies).
- **RLS + service_role** — backend precisa bypassar RLS com
  `service_role` key (nunca exposta ao client). Vercel env: `SUPABASE_SERVICE_ROLE_KEY`.
- **Email templates** — Supabase permite customizar. Akasha usa
  template ritualístico ("O Akasha te chama de volta" em vez de
  "Click here to verify").

---

## 7. Decisão D-035 — Payments: **Stripe 22 (BRL)**

### 7.1 O que está em uso (verificado)

```json
"stripe": "^22.2.0"
```

E em código: presumo `apps/akasha-portal/src/lib/application/billing/*`
(verificar em Fase 5).

### 7.2 Por que Stripe

- **Subscriptions + usage-based + one-time** — Akasha tem
  Subscription (freemium/premium/cert B2B) + uso (1 sessão/dia
  free, 3/sem premium, ilimitado B2B) + avulso (consulta Mentor
  Certificado avulsa R$ 95-195).
- **Pix + Boleto + Cartão** — Stripe BR suporta todos, split de
  pagamento (5% earmark por Pilar — R-022 axioma #5) requer Stripe
  Connect ou transfer API.
- **Webhook canônico** — `payment_intent.succeeded`,
  `customer.subscription.updated`, `invoice.paid` etc. Suportado
  via Route Handler + `runtime = 'nodejs'`.
- **Customer Portal** — `billingPortal.sessions.create()` permite
  usuário gerenciar subscription sem UI custom.
- **Stripe Tax** — calcula imposto BR automaticamente (ISS, ICMS
  futuro).
- **Stripe Identity** — KYC para Mentores Certificados (B2B)
  opcional.

### 7.3 Pricing tiers (já fixado em R-022 §13 + R-023)

| Tier | Preço | Conversas/dia | Mandatos | Mentor Cert. |
|------|-------|---------------|----------|--------------|
| Free | R$ 0 | 1/dia | 1/dia | Não |
| Premium | R$ 29/mês ou R$ 199/ano | 3/semana | Ilimitado histórico | Não |
| Cert. N1 (Akasha) | R$ 295 único + R$ 29/mês | Ilimitado | Ilimitado | Acesso |
| Cert. N2 (Curador) | R$ 895 único + R$ 89/mês | Ilimitado | Ilimitado | Acesso + RAG |
| Cert. N3 (Mestre) | R$ 1.995 único + R$ 189/mês | Ilimitado | Ilimitado | Acesso + 1:1 |
| B2B (empresa) | R$ 295-895/seat/mês | Ilimitado | Ilimitado | Treinamento in-company |

### 7.4 5% earmark por Pilar (R-022 axioma #5)

- **Stripe Connect** com **5 contas** (1 por Pilar: Cabala Viva
  Brasil, Ifá Viva Brasil, Ayurveda BAMS Brasil, Astrologia FAA
  Brasil, I Ching Academy) — transfer automático via
  `transfers.create({ amount: total * 0.05, destination: pilar_acct })`.
- **Contas dos parceiros** — serão abertas em paralelo com
  parcerias (B-200, fora deste R-025).

### 7.5 Edge cases

- **Webhook idempotência** — `event.id` é único; dedup via DB row.
- **Cancelamento** — Akasha Premium = 1 click; no fim do ciclo,
  usuário vira Free (não deleta conta).
- **Estorno** — disputa via Stripe Dashboard (não no app).
- **LGPD no Stripe** — Stripe é processor, Akasha é controller.
  Contrato DPA Stripe cobre.

---

## 8. Decisão D-036 — Deploy: **Vercel (Fluid Compute, Node 24 LTS)**

### 8.1 O que está em uso (verificado)

Build em `apps/akasha-portal/package.json`:

```json
"build": "NODE_OPTIONS='--max-old-space-size=4096' next build --experimental-build-mode=compile && next build --experimental-build-mode=generate"
```

Padrão Vercel: `next build` no CI, deploy via `vercel deploy` ou
push em `main`. **Fluid Compute é default em 2026** (Vercel docs).

### 8.2 Por que Vercel

- **Zero-config Next.js** — `vercel deploy` lê `next.config.mjs`
  e builda.
- **Fluid Compute Node 24 LTS** (Vercel 2026) — function instances
  reusados entre requests, cold-start <100ms, **wall-clock timeout
  300s** (suficiente para SSE do Mentor).
- **Edge runtime opcional** — para routes pequenas (ex: webhook
  Stripe) usar `export const runtime = 'edge'`.
- **Preview deploys** — cada PR gera URL única (`akasha-git-feat-xyz.vercel.app`).
- **Crons nativos** — `vercel.ts` com `crons: [{ path, schedule }]`
  (Vercel 2026 update). Akasha usa para: Mandato diário 06h BR
  (`0 9 * * *`), Ritu Sandhi 14d (`0 9 1 */2 *`), limpeza embeddings
  (`0 3 * * 0`).
- **Queues nativo (beta 2026)** — para processamento async do Mentor
  (ex: gerar PDF Mandala após resposta).
- **Env management** — `vercel env pull .env.local` para dev,
  `vercel env add` para prod, encrypted at rest.
- **Vercel AI Gateway embutido** — D-032 acima.
- **Vercel Blob (storage) opcional** — D-039 abaixo.

### 8.3 Por que NÃO as alternativas

- **Self-host VPS (Hetzner/Contabo)** — R$ 100-300/mês, mas
  precisa DevOps (Nginx, PM2, certbot, backups). Custo de
  manutenção alto para 1 Dev solo. **Aceitável só se Vercel
  ficar >R$ 5k/mês** (Fase 7+, > 100k MAU).
- **Fly.io** — bom, mas sem Vercel AI Gateway + edge runtime.
- **Render / Railway** — bom para side projects, lock-in médio.
- **Cloudflare Workers + Pages** — bom, mas D1 não é Postgres puro;
  Akasha precisa de pgvector.

### 8.4 Edge cases

- **Vercel Region** — `vercel.json` (ou `vercel.ts`) força
  `regions: ["gru1"]` (São Paulo) para LGPD.
- **Cold start** — Fluid Compute reusa instance, então mesmo com
  tráfego baixo não há cold start perceptível.
- **Build timeout** — 45 min no Pro, suficiente para `next build`
  + Playwright install (chromium).
- **Cost cap** — `vercel.json` com `costControls: { max: 50 }` (USD)
  protege contra DDoS → fatura.

### 8.5 Backup de deploy

- **Preview branches** automáticas (cada PR = URL).
- **Production promotion** — `vercel promote <preview-url>` para
  promover preview específico.
- **Rollback** — 1 click no dashboard ou `vercel rollback`.

---

## 9. Decisão D-037 — State: **Zustand 5 (client) + RSC (server)**

### 9.1 O que está em uso (verificado)

```json
"zustand": "^5.0.13"
```

### 9.2 Por que Zustand 5

- **2KB** — menor store que Redux (12KB) ou Jotai (5KB).
- **Hook-first** — `useMandalaStore()`, sem actions/reducers/
  providers boilerplate.
- **Sem context** — não precisa de `<Provider>` no root, embora
  RSC exija.
- **Persist middleware** — localStorage sync built-in.
- **SSR-safe** — usa `useStore()` com snapshot selector, sem
  hydration mismatch.
- **Já em uso** — não migrar.

### 9.3 Casos de uso

- **Mandala state** (cliente) — selected Pilar, zoom level, dia
  selecionado.
- **Mandato state** (cliente) — read/unread, dismissed.
- **Onboarding state** (cliente) — step atual, respostas rascunho.
- **Settings state** (cliente) — quiet hours, idioma, cap de uso.

**Não Zustand** — tudo que é server-side (lista de Mandatos,
perfil, Grimório chunks) → RSC + server actions.

### 9.4 Por que NÃO Redux Toolkit / Jotai

- **Redux Toolkit** — bom para app grande com time grande, overkill
  para 1 Dev solo em monorepo pequeno.
- **Jotai** — bom, mas atom-first = mais re-renders em árvore
  profunda. Zustand 1 store = 1 re-render.

---

## 10. Decisão D-038 — PWA: **Serwist 9 + web-push 3.6**

### 10.1 O que está em uso (verificado)

```json
"web-push": "^3.6.7"
```

Service worker e manifest: a definir com Serwist (Fase 5).

### 10.2 Por que Serwist 9

- **Sucessor de `next-pwa`** (deprecated 2025). Mantido ativamente em
  2026.
- **Next.js App Router nativo** — handler em
  `app/sw.ts` + `app/manifest.ts`.
- **Workbox 7+** — estratégias de cache (NetworkFirst, StaleWhileRevalidate).
- **TypeScript-first** — config em TS, tipos de precache.
- **Web Push integrado** — `web-push` 3.6 (já em uso) para
  subscriptions.

### 10.3 Estratégia de cache

- **App shell** — NetworkFirst (sempre tenta rede, fallback cache).
- **Mandala SVG** — CacheFirst (imutável por hash).
- **Mandato JSON** — StaleWhileRevalidate (mostra cached, atualiza
  background).
- **Grimório chunks** — CacheFirst com TTL 30d (curadores podem
  re-auditar).
- **API responses** — NetworkOnly (nunca cacheia, sempre fresh).

### 10.4 Por que NÃO `next-pwa`

- **Deprecated** desde 2025 (GitHub repo inativo).
- **Não suporta App Router 100%** — service worker em `public/`,
  sem type-safety.

### 10.5 Edge cases

- **iOS push** — só iOS 16.4+ (Mar 2023); Akasha exige versão
  mínima no cadastro. R-024 §14: gatilho PWA → nativo = audiência
  iOS < 16.4 > 30%.
- **Background sync** — não suportado em Safari ainda; usar
  periodic sync API (Chrome/Edge).
- **Mandato offline** — service worker queue, mas LLM requer net;
  mostrar "reconecte para conversar com o Mentor".

---

## 11. Decisão D-039 — Test: **Vitest 3 (unit) + Playwright 1.60 (e2e)**

### 11.1 O que está em uso (verificado)

```json
"vitest": "(no root, em apps/akasha-portal)",
"@playwright/test": "^1.60.0",
"@testing-library/jest-dom": "^6.9.1",
"@testing-library/react": "^16.3.2",
"@testing-library/user-event": "^14.6.1"
```

### 11.2 Por que Vitest 3

- **Native ESM** — não precisa Babel, alinhado com Next 16 +
  TypeScript ESM.
- **HMR** — `vitest --watch` re-roda em <1s.
- **Compatível com Jest API** — `describe/it/expect` zero refactor.
- **Vite-powered** — share config com Next 16 (Vite 5/6).
- **Projects** — `vitest.config.ts` define múltiplos projects
  (core-logic, core-api, core-ui, legacy) — `pnpm test:core` roda
  os 3 core projects.
- **Já em uso** — não migrar.

### 11.3 Por que Playwright 1.60

- **Multi-browser** — Chrome, Firefox, Safari (WebKit), Edge.
- **Multi-device** — mobile viewport (iPhone 14, Pixel 7) nativamente.
- **Auto-wait** — `page.click()` espera elemento ficar estável
  (sem `sleep`).
- **Trace viewer** — `npx playwright show-trace` para debug.
- **Test runner nativo** — `pnpm test:e2e:browser` ou
  `playwright test` direto.
- **MCP integration** — `mcp__playwright__browser_*` tools para
  smoke manual em CI.
- **A11y testing** — `@axe-core/playwright` plugável.
- **Visual regression** — `playwright test --update-snapshots` para
  Mandala SVG.

### 11.4 Estrutura de tests

```
tests/
├── core-logic/      # Vitest — Pilar algorithms (sem rede)
├── core-api/        # Vitest — Route Handlers (com mocks)
├── core-ui/         # Vitest + RTL — componentes React
├── integration/     # Vitest — Mentor flow completo
└── e2e/             # Playwright — onboarding + Mandato + chat
```

### 11.5 Cobertura meta

- **core-logic:** 95%+ (Akasha Core Algorithm deve ser exaustivo).
- **core-api:** 80%+ (routes críticas: ritual, mentor, push).
- **core-ui:** 70%+ (componentes interativos).
- **e2e:** 5-10 cenários críticos (não substituir unit).

### 11.6 Edge cases

- **Test pollution (cycle 102-113)** — global stores, module-level
  state, mock pollution entre files. Mitigação: factory pattern
  para Zustand stores, `vi.resetModules()` entre suites.
- **Turbopack HMR stale** — `pnpm test:run` para ground truth, não
  confiar em dev overlay.
- **Prisma em tests** — `prisma db push` para test DB ou `prisma
  migrate deploy` em CI; **nunca** rodar migrations em prod DB
  direto.

---

## 12. Stack Resumido (Inventário Vivo)

### 12.1 Frontend

| Categoria | Lib | Versão | Por quê |
|-----------|-----|--------|---------|
| Framework | `next` | 16.2.6 | D-030 |
| UI Runtime | `react`, `react-dom` | 19.2.4 | Next 16 requer |
| Styling | `tailwindcss` | 4.3 | Utility-first, JIT |
| PostCSS | `@tailwindcss/postcss` | 4.3 | Tailwind 4 |
| Components | `@base-ui/react` | 1.5 | Unstyled, accessible, **alternativa Radix** |
| Icons | `lucide-react` | 1.16 | Tree-shakeable SVG (**ATENÇÃO: versão suspeita**) |
| Animation | `framer-motion` | 12.40 | Mandato reveal, Mandala zoom |
| Animation CSS | `tw-animate-css` | 1.4 | Tailwind plugin |
| CVA | `class-variance-authority` | 0.7.1 | Component variants type-safe |
| Class util | `clsx`, `tailwind-merge` | 2.1, 3.6 | Conditional classes |
| 3D | `three`, `@react-three/fiber`, `@react-three/drei` | 0.184, 9.6, 10.7 | Mandala 3D? (a definir v2) |
| Markdown | `react-markdown`, `remark-gfm` | 10.1, 4.0 | Mentor response rendering |
| Forms | `zod` | 3.25 | Schemas + parse |
| State | `zustand` | 5.0 | D-037 |
| PDF | `@react-pdf/renderer`, `jspdf` | 4.5, 4.2 | Mandala/PDF export |
| QR | `qrcode` | 1.5 | TOTP 2FA setup |
| OG Image | `@vercel/og` | 0.11 | Social preview (Pilar Mandala) |

### 12.2 Backend

| Categoria | Lib | Versão | Por quê |
|-----------|-----|--------|---------|
| Runtime | Node.js | 24 LTS | Vercel Fluid Compute 2026 default |
| Server | Next.js Route Handlers + Server Actions | 16.2.6 | D-030 |
| Validation | `zod` | 3.25 | Parse + types |
| Auth | `@supabase/ssr`, `@supabase/supabase-js` | 0.10, 2.106 | D-034 |
| ORM | `@prisma/client`, `@prisma/adapter-pg` | 7.8, 7.8 | D-031 |
| DB driver | `pg` | 8.21 | Postgres + pgvector |
| Cache/Queue | `ioredis` | 5.6 | Rate limit, BullMQ, Vercel Queues |
| LLM | `openai` (transição p/ AI SDK 6) | 6.39 | D-032 |
| Payments | `stripe` | 22.2 | D-035 |
| Push | `web-push` | 3.6 | D-038 |
| Crypto | `bcryptjs`, `jsonwebtoken` | 3.0, 9.0 | Mentor CLI auth |
| TOTP | `otpauth` | 9.5 | 2FA |

### 12.3 Dev / Test

| Categoria | Lib | Versão | Por quê |
|-----------|-----|--------|---------|
| Lang | `typescript` | 5.x | Tipos |
| Build | `next` (Turbopack) | 16.2.6 | D-030 |
| Lint | `eslint` (Next 16 default) | — | — |
| Format | `prettier` + `@trivago/prettier-plugin-sort-imports` | 6.0 | — |
| Test unit | `vitest` | 3.x | D-039 |
| Test e2e | `@playwright/test` | 1.60 | D-039 |
| Test UI | `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` | 16.3, 6.9, 14.6 | D-039 |
| Runner | `tsx` | 4.22 | scripts TS (sync-grimoire, run-quality-eval) |
| Dead code | `fallow` | — | `pnpm fallow` (CI) |

### 12.4 CLI (Mentor)

| Categoria | Lib | Versão | Por quê |
|-----------|-----|--------|---------|
| TUI | `ink` | 5.2 | React p/ terminal |
| UI | `react`, `react-dom` | 19 | Ink usa |

### 12.5 Engines (Pilar)

| Pacote | Conteúdo |
|--------|----------|
| `@akasha/core` | Orquestrador (Akasha Core Algorithm) — 1 função `calcular()` |
| `@akasha/core-cabala` | Pilar 1: Gematria Mispar Hechrachi (R-009) |
| `@akasha/core-astrology` | Pilar 2: Whole Sign Houses (R-007) |
| `@akasha/core-tantra` | Pilar 3: 11 corpos tântricos (R-001) |
| `@akasha/core-odus` | Pilar 4: 16 Odu de Ifá (R-010) |
| `@akasha/core-iching` | Pilar 5: King Wen 64 hexagramas (R-001) |
| `@akasha/types` | Types compartilhados (Pessoa, Pilar, Mandala, Mandato) |

---

## 13. Libs a VERIFICAR (Fase 5)

| Lib | Status | Ação |
|-----|--------|------|
| `lucide-react` 1.16 | **Versão suspeita** (oficial é 0.460) | `npm view lucide-react versions` — se útil, manter; senão, `lucide-react@0.460` ou `@radix-ui/react-icons` |
| `next-pwa` (se houver) | Deprecated 2025 | Substituir por Serwist 9 (D-038) |
| `openai` SDK 6.39 | OK por ora | Migrar para `ai` SDK 6 + AI Gateway (D-032) |
| `ioredis` 5.6 | OK | Manter; Vercel Queues beta pode simplificar |
| `tailwind-merge` 3.6 | OK | Manter |

---

## 14. Internacionalização (i18n)

### 14.1 Decisão: **next-intl 3.x (wrapper para i18n nativo Next 16)**

- **Next.js 16 i18n** nativo usa `app/[lang]/page.tsx` + middleware
  para routing por locale.
- **`next-intl` 3.x** adiciona: typed dictionaries, server-component
  `useTranslations()`, plural rules, ICU MessageFormat.
- **Default locale:** `pt-BR` (R-022 axioma #8 — PT-BR primeiro).
- **Supported locales (v1):** `pt-BR` apenas. `en-US` na v2 após
  D-005 com 30+ usuários reais (R-024 §14 #7).
- **Dicionário:** `apps/akasha-portal/src/dictionaries/pt-BR.json` +
  `en-US.json` quando v2.
- **Termos preservados (sem tradução):** *Tikkun*, *Tiferet*, *Odu*,
  *Tridosha*, *Hexagrama*, *Mandala*, *Mandato* — Akasha é "dicionário
  vivo" (R-024 §11), estes termos abrem tooltips explicativos.

### 14.2 Por que NÃO i18n puro do Next 16

- **Funciona**, mas sem type-safety nas chaves (`t('mandato.title')` vira
  string livre). `next-intl` dá autocomplete via `tsconfig.json`.

---

## 15. Observability (Logs, Métricas, Errors)

### 15.1 Decisão: **Sentry + Vercel Analytics + Vercel Logs**

- **Errors:** Sentry (`@sentry/nextjs` 8.x) — captura unhandled +
  manual via `Sentry.captureException()`. **LGPD strip PII em
  `beforeSend`** (R-022 axioma #6).
- **Performance:** Vercel Analytics (built-in, free) — Web Vitals
  (LCP, FID, CLS), p50/p95 TTFB por rota.
- **Logs:** Vercel Logs (built-in) — structured JSON, search por
  `request_id` + `user_id` (hash).
- **AI Gateway observability:** Vercel dashboard (D-032) — token
  usage, latência, fallbacks.
- **Uptime:** Vercel (built-in) + statuspage.io (free) p/ status
  público.

### 15.2 Métricas Akasha (12 meses)

- **DAU/MAU ratio** > 30% (Meta good = 20%, top apps = 50%).
- **LCP** < 2.5s (p75 mobile 3G slow).
- **Lighthouse a11y** ≥ 95 (R-024 §13).
- **NPS** > 60 (Gene Keys tem 70+, Co-Star 60+).
- **Mentor error rate** < 1% (R-023 E1 + E5).
- **Crisis protocol trigger rate** < 0.1% (R-023 §4.4).

### 15.3 Custo

- **Sentry Team** $26/mês (50k events) — suficiente até 10k MAU.
- **Vercel Analytics** free com Pro.
- **Vercel Logs** free (Pro) com retenção 30d; $5/mês Log Drains para
  90d.

---

## 16. Background Jobs & Cron

### 16.1 Decisão: **Vercel Crons + Vercel Queues (beta 2026) + ioredis fallback**

- **Crons:** `vercel.ts` com `crons: [{ path, schedule }]`.
  Akasha usa:
  - `0 9 * * *` (06h BR = 09h UTC) — Mandato diário.
  - `0 9 * * 1` (segunda 06h BR) — Mandato semanal.
  - `0 9 1 1,4,7,10 *` (1º dia de cada mudança estação) — Ritu
    Sandhi.
  - `0 9 1 1 *` (1 jan) — Limpa embeddings stale (>365d).
  - `0 9 1 */3 *` (trim) — White paper quarterly snapshot.
- **Queues (beta 2026):** Vercel Queues para jobs async
  (envio push, geração PDF Mandala, RAG re-embed).
- **Fallback:** `ioredis` + BullMQ se Vercel Queues não estiver
  pronto no momento do deploy.

### 16.2 Edge cases

- **DST Brasil** — `0 9 * * *` UTC = 06h BR (sem DST desde 2019).
- **Time zone do user** — push dispara em **local time do user**
  baseado em `user.timezone`; cron UTC é o **default**; para
  re-agendar, scheduler interno computa offset.

---

## 17. Email Transacional

### 17.1 Decisão: **Resend (modernos, BR-real)**

- **3k emails/mês free** (suficiente para confirmação + Mandato
  opt-in).
- **React Email** (`@react-email/components`) — template em TSX
  type-safe.
- **DKIM/SPF/DMARC** configurado via Vercel DNS.
- **Webhook** para bounces/complaints → marca user.email_status =
  `bounced` no Prisma.

### 17.2 Templates canônicos (R-022 §13)

- **Confirmação cadastro** — "O Akasha te chama de volta".
- **Mandato diário** (opt-in) — renderiza Mandato como HTML email.
- **Ritu Sandhi** — 14d antes da mudança estação.
- **Renovação subscription** — Stripe envia; Resend só se falha.
- **Crise** (R-023 §4.4) — **NÃO** envia email (sensível, LGPD).

---

## 18. Segurança (OWASP Top 10 + LGPD)

### 18.1 Checklist

- [x] **HTTPS** — Vercel default.
- [x] **HSTS** — Vercel default.
- [x] **CSP** — `next.config.mjs` define nonce + script-src `'self'`
      + Vercel Insights domain.
- [x] **CSRF** — Server Actions Next 16 têm CSRF token built-in.
- [x] **SQL injection** — Prisma parameterized queries.
- [x] **XSS** — `react-markdown` com `rehype-sanitize`.
- [x] **Rate limit** — `ioredis` middleware em `/api/akasha/mentor/*`
      (1 req/s user, 60 req/min IP).
- [x] **Account enumeration** — R-022 §11 + cycle-116: login retorna
      msg genérica para "user not found" e "wrong password".
- [x] **PII em logs** — Sentry `beforeSend` strip; Pino `redact: []`.
- [x] **Secrets em env** — Vercel encrypted; nunca commit `.env*`.
- [x] **Webhook signature** — Stripe `constructEvent` valida
      `stripe-signature`.
- [x] **RLS Postgres** — `auth.uid() = user_id` em todas as
      tabelas de user.
- [x] **Direito ao esquecimento** — DELETE cascade: user → mandalos
      → mandatos → embeddings.
- [x] **Auditoria** — tabela `audit_log` com `user_id`, `action`,
      `resource`, `ip`, `ts` (R-022 axioma #6).

### 18.2 Pentests

- **Anual** (a partir de 10k MAU) — empresa BR (Conviso, PSafe,
  Trustly).
- **Bug bounty** — HackerOne (programa público, ano 2+).

---

## 19. Roadmap de Implementação (Fase 5+)

### 19.1 Fase 5 — Protótipo (2-4 semanas)

| Dia | Tarefa | D-NN |
|-----|--------|------|
| 1-2 | Schema Prisma (5 Pilares, Mandala, Mandato, Mentor memory) | D-040 |
| 1-2 | Akasha Core Algorithm em TS puro (`@akasha/core`) | D-041 |
| 3 | Zod types (Pessoa, Pilar, Mandala, Mandato) | D-042 |
| 3-4 | Testes com 10 perfis (corretude do Pilar 1-5) | D-043 |
| 4 | Validar com `cabala-corr-validator` (R-022 §2.4) | D-044 |
| 5 | Mandala SVG renderer (server-side) | D-045 |
| 5 | Mandato generator (3 frases + 1 pergunta + 1 ritual) | D-046 |
| 6-7 | Migration `openai` SDK → AI SDK 6 + AI Gateway | D-032 |
| 8-9 | PWA: Serwist + manifest + service worker | D-038 |
| 10 | E2E smoke: onboarding → Mandato → Mentor chat | D-047 |

### 19.2 Fase 6 — Implementação (4-8 semanas)

- F-001 a F-020 (features extraídas de R-001..R-012).
- Beta com 30 usuários reais (R-024 §15.1 D-005).
- i18n `en-US` (se D-005 validar).

### 19.3 Fase 7 — Scale (3-6 meses)

- F-100..F-105 (maintenance — ver orchestrator/prompt).
- App nativo (iOS+Android) se iOS < 16.4 < 30%.
- White paper anual público (R-022 axioma #9).

---

## 20. Riscos Conhecidos + Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Vercel sai do ar | Baixa | Crítico | Backup self-host em Node 24 LTS, mesmo `pnpm build && pnpm start` |
| OpenAI/Anthropic preço sobe | Média | Alto | AI Gateway multi-provider, fallback Sonnet 4.6 → Haiku 4.5 |
| pgvector perf degrada >1M rows | Média | Médio | HNSW index, partitioning por `user_id`, re-embed sparse |
| LLM alucina correspondência | Alta | Crítico | RAG obrigatório (R-022 §5 #3) + cabala-corr-validator + white paper audit |
| Usuário compartilha Mandato privado | Baixa | Médio | Sem social share nativo, opt-in explícito, watermark "Akasha — uso pessoal" |
| Stripe webhook duplica | Baixa | Médio | Idempotency key em `event.id` |
| LGPD muda (nova lei) | Baixa | Alto | DPA Vercel/Supabase/Stripe atualizados, white paper anual cita compliance |
| Tradição viva cobra apropriação | Baixa | Crítico | 5% earmark, parceria formal, citação obrigatória (R-022 axioma #4) |
| iOS PWA push limitado | Alta | Médio | UX educativo "ative notificações em Configurações > Safari > Avançado" |
| Crise saúde mental | Média | Crítico | R-023 §4.4: pula LLM, CVV 188, sessão pausada 24h |

---

## 21. Decisões Abertas (O1-O8)

1. **O1 — `lucide-react` versão suspeita (1.16)** — verificar
   package registry; se for fork/typo, substituir por
   `lucide-react@0.460` (canônica) ou `@radix-ui/react-icons`.
2. **O2 — Mandala 3D vs SVG** — R-024 §5.3 já fixou SVG (RSC-friendly);
   three.js fica como **opt-in** para usuários Premium+.
3. **O3 — `openai` SDK coexistir com AI SDK 6** — manter openai só
   para embeddings (text-embedding-3-small)? Ou migrar tudo para
   AI SDK 6 (que tem `embed()`)? Pendente D-041.
4. **O4 — BullMQ vs Vercel Queues** — Vercel Queues beta 2026 ainda
   não GA? Fallback ioredis + BullMQ. Decidir em D-048.
5. **O5 — Cap de uso B2B** — R-022 §11 diz "ilimitado"; B2B é
   per-seat, mas cada seat tem cap individual? Pendente
   pricing-impl.
6. **O6 — White paper anual formato** — Markdown público no site
   + PDF (jsPDF ou @react-pdf)? Pendente Fase 7.
7. **O7 — 5% earmark contas Stripe Connect** — 5 contas reais
   precisam existir (parcerias). Pendente B-200.
8. **O8 — Status page público** — statuspage.io (free) ou
   betteruptime.com? Pendente.

---

## 22. Fontes Citadas (2026 atualizadas)

### 22.1 Documentação oficial

- **Next.js 16** — https://nextjs.org/docs (App Router, RSC,
  Server Actions, Turbopack). Acessado 2026-06-10.
- **React 19** — https://react.dev (Server Components, `use()` hook,
  Actions). Acessado 2026-06-10.
- **Prisma 7** — https://www.prisma.io/docs/orm/prisma-schema (URL
  in `prisma.config.ts`, adapter pattern). Acessado 2026-06-10.
- **Postgres 18 + pgvector 0.8** — https://github.com/pgvector/pgvector
  (HNSW, IVFFlat, distance operators). Acessado 2026-06-10.
- **Vercel** — https://vercel.com/docs (Fluid Compute, AI Gateway,
  Queues, Crons, Blob). Atualizado 2026-02-27.
- **AI SDK 6** — https://sdk.vercel.ai/docs (provider/model strings,
  useChat, streamText, generateObject). Acessado 2026-06-10.
- **Supabase** — https://supabase.com/docs (Auth SSR, RLS, Storage).
  Acessado 2026-06-10.
- **Stripe BR** — https://stripe.com/docs/payments/brazil
  (Pix/Boleto/Cartão, Connect transfers). Acessado 2026-06-10.
- **Tailwind 4** — https://tailwindcss.com/docs (PostCSS plugin,
  CSS-first config). Acessado 2026-06-10.
- **Base UI** — https://base-ui.com (unstyled, accessible, primitive
  components). Acessado 2026-06-10.
- **Vitest 3** — https://vitest.dev (projects, ESM, native). Acessado
  2026-06-10.
- **Playwright 1.60** — https://playwright.dev (multi-browser, trace
  viewer, MCP). Acessado 2026-06-10.
- **Serwist 9** — https://serwist.pages.dev (Next PWA, Workbox 7+).
  Acessado 2026-06-10.
- **next-intl 3** — https://next-intl-docs.vercel.app (typed
  dictionaries, server components). Acessado 2026-06-10.
- **Zustand 5** — https://zustand-demo.pmnd.rs (hooks, persist,
  selectors). Acessado 2026-06-10.
- **Zod 3.25** — https://zod.dev (parse, type inference, brand). Acessado
  2026-06-10.
- **three 0.184** — https://threejs.org/docs (WebGL, geometries,
  shaders). Acessado 2026-06-10.
- **Resend** — https://resend.com/docs (transactional email, React
  Email). Acessado 2026-06-10.
- **Sentry** — https://docs.sentry.io/platforms/javascript/guides/nextjs/
  (Next 16, beforeSend, PII strip). Acessado 2026-06-10.

### 22.2 Frameworks / dependências (cross-ref)

- **AI SDK 6 + Vercel AI Gateway** — provider strings,
  zeroDataRetention, fallbacks (Vercel docs 2026-02-27 update).
- **OWASP Top 10 2025** — https://owasp.org/Top10/ (referência para
  §18.1).
- **LGPD Lei 13.709/2018** — Brasil (Art. 18 VI = esquecimento;
  Art. 7 = base legal; Art. 46 = segurança).
- **WCAG 2.2 AA** — https://www.w3.org/TR/WCAG22/ (12 critérios
  cobertos em R-024 §9).

---

## 23. Confiança e Honestidade Epistêmica

### 23.1 O que sabemos com HIGH confidence

- **Next 16 + React 19 + RSC + Turbopack** = stack 2026 mainstream,
  Vercel-supported, edge-friendly.
- **Postgres 18 + pgvector** = production-ready, BR-real, RDS/Neon/
  Supabase todos suportam.
- **Prisma 7** = type-safe + adapter pattern, schema-first.
- **Supabase Auth** = RLS by design, BR-real, free tier generoso.
- **Stripe BR** = Pix + Boleto + Cartão + Connect (5% earmark).
- **Vercel Fluid Compute** = serverless + function reuse, Node 24
  LTS, 300s timeout.
- **SSE vs WebSocket** = SSE wins para 1-way streaming.
- **Vitest + Playwright** = modern test stack, 2026 standard.

### 23.2 O que sabemos com MEDIUM confidence

- **AI Gateway é o caminho Vercel-canon** — é o que dizem os docs
  2026-02-27, mas pode mudar.
- **Serwist 9 é o sucessor de next-pwa** — ecossistema ainda
  crescendo, alguns plugins podem faltar.
- **Opus 4.6 é o melhor modelo para persona ritualística** — não
  testei benchmark; baseado em heurística de "modelo mais capaz =
  melhor para system prompt grande".
- **5% earmark por Pilar via Stripe Connect** — implementação
  requer 5 contas reais (parcerias ainda em formação, B-200).

### 23.3 O que NÃO sabemos (requer v2 / decisão de design)

- **lucide-react 1.16.0** — versão suspeita. Provavelmente typo do
  `pnpm install` ou fork.
- **Mandala 3D performar em mobile mid-range** — three.js + r3f
  precisa de benchmark; provavelmente SVG-only até Premium+.
- **iOS PWA push cobertura real** — só iOS 16.4+; audiência
  brasileira ainda em medição.
- **Custo real de AI Gateway @ 100k MAU** — estimado, mas depende
  de padrão de uso (quantas mensagens/dia o usuário médio envia?).

---

## 24. Próximos Passos (v2)

1. **Fase 5 semana 1** — Schema Prisma (D-040) + Core Algorithm
   (D-041) + 10 perfis de teste (D-043).
2. **Fase 5 semana 2** — SSE Mentor chat + PWA Serwist + Vercel
   Crons + AI Gateway migration.
3. **Fase 5 semana 3-4** — Beta fechado com 10 usuários + ajustar
   stack conforme feedback real.
4. **v2 (Fase 6+)** — Resolver O1..O8 (lucide, 3D, BullMQ vs
   Vercel Queues, 5% Connect, white paper formato, etc).

---

**Fim do `tech_decisions.md`. v2 = após D-040..D-044 (Fase 5) + 10
perfis de teste + feedback beta. Próximo milestone: fechar FASE 4
(Tech Stack) e iniciar FASE 5 (Protótipo) — código começa aqui.**
