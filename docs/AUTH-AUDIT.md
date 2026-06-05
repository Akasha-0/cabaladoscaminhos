# AUTH-AUDIT — Sistema Akasha

> **Norte:** Doc 25.
> Audit de auth (Fase 17) realizado em `src/app/**/page.tsx` e `src/app/**/route.ts`.
> Categoriza cada página/rota como Operator (B2B), B2C User ou pública,
> e documenta o mecanismo de auth gate de cada uma.
**Última atualização:** 2026-06-03 (Fase 47 — cockpit/layout.tsx x-pathname auth gate)

---

> ## ⚠️ Transição de auth: Operator (B2B) → User (B2C self-service)
>
> Com o pivô para o **Sistema Akasha** (Doc 25), o modelo de identidade muda:
> o **`Operator`** (terapeuta que operava o Cockpit) é substituído pelo **`User`**
> B2C **self-service** (o cliente final que se cadastra, compra e consulta sozinho — Doc 04 §1–2).
>
> | Eixo | Antes (Cockpit B2B) | Agora (Akasha B2C) |
> |---|---|---|
> | Identidade | `Operator` / `OperatorSession` | `User` (auto-cadastro) |
> | Cadastro | criado pelo time / convite | **self-service** (e-mail+senha e/ou OAuth Google/Apple) |
> | Sessão | JWT Operator (`operator-jwt.ts`) | JWT/cookie httpOnly do `User` |
> | Papel elevado | Operator full | `role = ADMIN` (painel do Grimório, sync manual — Doc 04) |
> | App-alvo | `apps/legacy-cockpit` (a desligar) | `apps/b2c-portal` |
>
> **O que a matriz abaixo significa hoje:** as linhas **Operator (B2B)** descrevem o
> `legacy-cockpit`, que roda até o desligamento (AD-25.2) — sua defense-in-depth
> permanece válida enquanto existir. As linhas **B2C User** são a base do `b2c-portal`
> e o destino da migração; o padrão de gate (server + API, "nunca confiar no body")
> **carrega-se inteiro** para o `User`. As rotas legadas listadas no §7 saem com o Cockpit.

---

## 1. Categorias

| Categoria | Auth | Onde mora |
|-----------|------|-----------|
| **Operator (B2B)** | `requireOperatorPage()` (layout/page) ou `requireOperator()` (API) | `/cockpit/*`, `/dashboard/mesa-real/*`, `/dashboard/clientes/*`, `/api/operator/*`, `/api/mesa-real/*`, `/api/consult/*` |
| **B2C User** | `SupabaseProvider` (`useAuth`) + middleware de cookies | `/dashboard/*` (B2C), `/profile`, `/conta`, `/onboarding`, `/pagamento/*` |
| **Público** | nenhum | `/`, `/login`, `/register`, `/pricing`, `/privacy`, `/terms`, `/cockpit/login`, `/operator/login`, `/operator/register`, `/mapa/shared/[hash]` |

> **Regra de ouro (Doc 16 AD-03):** toda rota Operator DEVEM ter
> **defense in depth** — gate no Server Component (layout/page) +
> `requireOperator()` na API correspondente. NUNCA confiar no
> `userId`/`operatorId` do body.

---

## 2. Operator — Páginas e layouts (gate server-side)

| Path | Tipo | Gate | Status |
|------|------|------|--------|
| `src/app/cockpit/page.tsx` | Server | `getOperatorFromServerContext` + `redirect('/cockpit/login')` | OK Fase 14 |
| `src/app/cockpit/layout.tsx` | Server | `x-pathname` header (middleware) → `PUBLIC_PATHS` set → `getOperatorFromServerContext` + `redirect('/cockpit/login')` | OK Fase 47 (previne loop infinito no /cockpit/login) |
| `src/app/cockpit/consulentes/page.tsx` | Server | `getOperatorFromServerContext` + `redirect` | OK |
| `src/app/cockpit/consulentes/[id]/page.tsx` | Server | `getOperatorFromServerContext` + `redirect` | OK |
| `src/app/cockpit/consulentes/novo/page.tsx` | Server | `getOperatorFromServerContext` + `redirect` | OK |
| `src/app/dashboard/mesa-real/layout.tsx` | Server | **`requireOperatorPage()`** (novo Fase 17) | **NOVO** |
| `src/app/dashboard/mesa-real/page.tsx` | Client | layout gate | OK Fase 17 |
| `src/app/dashboard/clientes/layout.tsx` | Server | **`requireOperatorPage()`** (novo Fase 17) | **NOVO** |
| `src/app/dashboard/clientes/page.tsx` | Client | layout gate | OK Fase 17 |

> Defense in depth: as Server Pages do cockpit RE-checam auth
> (`getOperatorFromServerContext`) mesmo já estando dentro do layout
> gate. Doc 16 AD-03 — "nunca confie só no layout".

---

## 3. Operator — API routes (requireOperator)

| Path | Métodos | Gate | Status |
|------|---------|------|--------|
| `src/app/api/operator/auth/me/route.ts` | GET | `requireOperator` | OK Fase 14 |
| `src/app/api/operator/auth/sessions/route.ts` | GET | `requireOperator` | OK Fase 16 |
| `src/app/api/operator/auth/sessions/[id]/route.ts` | DELETE | `requireOperator` | OK Fase 16 |
| `src/app/api/operator/auth/sessions/revoke-all/route.ts` | POST | `requireOperator` | OK Fase 16 |
| `src/app/api/operator/auth/login/route.ts` | POST | público (cria session) | correto |
| `src/app/api/operator/auth/register/route.ts` | POST | público (cria Operator) | correto |
| `src/app/api/operator/auth/logout/route.ts` | POST | público (revoga session) | correto |
| `src/app/api/operator/auth/refresh/route.ts` | POST | público (rotaciona) | correto |
| `src/app/api/mesa-real/clients/route.ts` | GET/POST/PATCH/DELETE | `requireOperator` | OK |
| `src/app/api/mesa-real/save/route.ts` | POST | `requireOperator` | OK |
| `src/app/api/mesa-real/generate/route.ts` | POST | `requireOperator` | OK |
| `src/app/api/mesa-real/readings/route.ts` | GET/POST/PATCH/DELETE | **`requireOperator`** (Fase 17) | **ADICIONADO** |
| `src/app/api/consult/route.ts` | POST | `requireOperator` | OK |
## 3.1 Operator MFA Routes (TOTP 2FA)

| Path | Métodos | Gate | Status |
|------|---------|------|--------|
| `src/app/api/operator/auth/mfa/setup/route.ts` | POST | público (gera secret + QR) | ✅ |
| `src/app/api/operator/auth/mfa/verify-setup/route.ts` | POST | público (verifica TOTP no setup) | ✅ |
| `src/app/api/operator/auth/mfa/verify/route.ts` | POST | público (verifica TOTP no login) | ✅ |
| `src/app/api/operator/auth/mfa/disable/route.ts` | POST | `requireOperator` (desabilita MFA) | ✅ |
| `src/app/api/operator/auth/mfa/status/route.ts` | GET | `requireOperator` (retorna enabled/verified) | ✅ |
| `src/app/api/operator/auth/mfa/recovery-code/route.ts` | POST | `requireOperator` (gera/revoga recovery codes) | ✅ |

## 3.2 Operator Password Recovery Routes

| Path | Métodos | Gate | Status |
|------|---------|------|--------|
| `src/app/api/operator/auth/forgot-password/route.ts` | POST | público (gera token de reset) | ✅ |
| `src/app/api/operator/auth/reset-password/route.ts` | POST | público (reseta com token) | ✅ |

## 3.3 Operator Sessions Routes

| Path | Métodos | Gate | Status |
|------|---------|------|--------|
| `src/app/api/operator/auth/sessions/route.ts` | GET | `requireOperator` (lista sessões ativas) | OK Fase 16 |
| `src/app/api/operator/auth/sessions/[id]/route.ts` | DELETE | `requireOperator` (revoga sessão) | OK Fase 16 |
| `src/app/api/operator/auth/sessions/revoke-all/route.ts` | POST | `requireOperator` (revoga todas exceto atual) | OK Fase 16 |

---

## 4. B2C User (Supabase) — fora de escopo da Fase 17

Páginas que usam `useAuth` (SupabaseProvider) — autenticação separada
e gerida por outro time/escopo:

| Path | Auth |
|------|------|
| `src/app/dashboard/page.tsx` | mock + SupabaseProvider (B2C) |
| `src/app/dashboard/insights/page.tsx` | B2C (sample) |
| `src/app/dashboard/life-areas/page.tsx` | B2C (sample) |
| `src/app/dashboard/calendario/page.tsx` | B2C (sample) |
| `src/app/dashboard/relatorios/page.tsx` | B2C (mock) |
| `src/app/dashboard/oraculo/page.tsx` | B2C (mock) |
| `src/app/dashboard/mapa/page.tsx` | B2C (localStorage) |
| `src/app/dashboard/perfil/page.tsx` | B2C (SupabaseProvider) |
| `src/app/mapa/page.tsx` | B2C (localStorage) |
| `src/app/conta/page.tsx` | B2C (mock) |
| `src/app/profile/page.tsx` | B2C (SupabaseProvider) |
| `src/app/onboarding/page.tsx` | B2C (SupabaseProvider) |
| `src/app/pagamento/sucesso/page.tsx` | B2C |
| `src/app/pagamento/cancelado/page.tsx` | B2C |
| `src/app/calendario/page.tsx` | B2C |
| `src/app/analytics/page.tsx` | B2C |

API B2C (Supabase) — fora de escopo:
- `src/app/api/auth/*` (login-form, login, logout, register, status, test, create-test)

---

## 5. Páginas públicas

| Path | Notas |
|------|-------|
| `src/app/page.tsx` | Landing — usa SupabaseProvider (B2C) |
| `src/app/login/page.tsx` | Login B2C |
| `src/app/register/page.tsx` | Cadastro B2C |
| `src/app/operator/login/page.tsx` | Login Operator (B2B) |
| `src/app/operator/register/page.tsx` | Cadastro Operator (B2B) |
| `src/app/cockpit/login/page.tsx` | Login Operator (legado, mantida) |
| `src/app/mapa/shared/[hash]/page.tsx` | Link público de mapa compartilhado (validado por hash) |
| `src/app/pricing/page.tsx` | Pricing |
| `src/app/privacy/page.tsx` | Privacy |
| `src/app/terms/page.tsx` | Terms |

---

## 6. Webhooks / API sem auth (com justificativa)

| Path | Por quê |
|------|---------|
| `src/app/api/stripe/webhook/route.ts` | Webhook externo Stripe — valida assinatura própria |
| `src/app/api/webhooks/stripe/route.ts` | Webhook externo Stripe (variante) |
| `src/app/api/health/route.ts` | Health check — público por design |
| `src/app/api/health/metrics/route.ts` | Métricas — público por design |
| `src/app/api/mapa/share/route.ts` | Hash público de mapa compartilhado |

---

## 7. Legado sem auth (não-Operator, não-B2C)

> Estas APIs existem mas NÃO são consumidas pelo produto atual
> (verificado em Fase 17). Mantidas para retrocompat.

- `src/app/api/admin/dashboard/route.ts`
- `src/app/api/admin/rate-limit/route.ts`
- `src/app/api/akashic/records/route.ts`
- `src/app/api/ancestor/connection/route.ts`
- `src/app/api/astrologia/*`
- `src/app/api/astrology/*`
- `src/app/api/audio/*`
- `src/app/api/banking/route.ts`
- `src/app/api/cabala/*`
- `src/app/api/calendar/route.ts`
- `src/app/api/chart/*`
- `src/app/api/chat/oracle/route.ts`
- `src/app/api/correlation/*`
- `src/app/api/dashboard/*`
- `src/app/api/divination/*`
- `src/app/api/divine/connection/route.ts`
- `src/app/api/docs/route.ts`
- `src/app/api/energy/*`
- `src/app/api/favoritos/route.ts`
- `src/app/api/gamification/achievements/route.ts`
- `src/app/api/guidance/types/route.ts`
- `src/app/api/healing/types/route.ts`
- `src/app/api/ifa/*`
- `src/app/api/journal/spiritual/route.ts`
- `src/app/api/lenormand/route.ts`
- `src/app/api/mapa/insights/route.ts`
- `src/app/api/mapa/pdf/route.ts`
- `src/app/api/mapa/route.ts`
- `src/app/api/materials/route.ts`
- `src/app/api/notifications/*`
- `src/app/api/numerologia/route.ts`
- `src/app/api/numerology/readings/route.ts`
- `src/app/api/odus/route.ts`
- `src/app/api/offerings/route.ts`
- `src/app/api/onboarding/route.ts`
- `src/app/api/orixa/*`
- `src/app/api/payments/*` (B2C)
- `src/app/api/planetary/route.ts`
- `src/app/api/privacy/settings/route.ts`
- `src/app/api/profile/route.ts`
- `src/app/api/progresso/route.ts`
- `src/app/api/progress/route.ts`
- `src/app/api/recommendations/route.ts`
- `src/app/api/search/*`
- `src/app/api/security/headers/route.ts`
- `src/app/api/stats/route.ts`
- `src/app/api/swarm/*`
- `src/app/api/tarot/*`
- `src/app/api/user/profile/route.ts`
- `src/app/api/users/profile/route.ts`

---

## 8. Helpers (Fase 17)

- `src/lib/auth/operator-guard.ts` — **NOVO**
  - `requireOperatorPage()` — Server Components; redireciona se não houver Operator.
  - `requireOperatorApi(request)` — Route Handlers; devolve 401 se não houver Operator.
  - `OPERATOR_LOGIN_PATH` — constante `'/cockpit/login'`.

- Testes:
  - `tests/lib/auth/operator-guard.test.ts` — **NOVO** (helper)
  - `tests/integration/cockpit-auth-gate.test.ts` — **NOVO** (smoke gate)

---

## 9. Padrão canônico de uso

### Server Component (page.tsx, layout.tsx)
```ts
import { requireOperatorPage } from '@/lib/auth/operator-guard';

export const dynamic = 'force-dynamic';

export default async function MyOperatorPage() {
  const operator = await requireOperatorPage();
  // ... usa operator.id para queries
}
```

### API route (route.ts)
```ts
import { requireOperatorApi } from '@/lib/auth/operator-guard';

export async function POST(request: NextRequest) {
  const operatorOrResponse = await requireOperatorApi(request);
  if (operatorOrResponse instanceof NextResponse) return operatorOrResponse;
  const operator = operatorOrResponse;

  // NUNCA confiar no `userId` do body — sempre usar `operator.id`
  const { clientId } = await request.json();
  // ...
}
```

---

## 10. Anti-padrões a evitar

- ❌ Usar `userId` ou `clientId` do body para autorização
- ❌ Confiar só no gate do client (`'use client'` com fetch — data leak)
- ❌ Permitir que o body determine o operator dono de um recurso
- ❌ Esquecer de re-checar auth em cada `page.tsx` (defense in depth)
- ❌ Pular `requireOperator` em uma rota Operator "porque está dentro do layout"
