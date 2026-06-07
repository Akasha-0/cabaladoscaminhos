# AUTH-AUDIT — Sistema Akasha

> **Norte:** Doc 25.
> Audit de auth (Fase 17) realizado em `src/app/**/page.tsx` e `src/app/**/route.ts`.
> Categoriza cada página/rota como B2C User ou pública,
> e documenta o mecanismo de auth gate de cada uma.
**Última atualização:** 2026-06-06 (refactor-akasha-v2 — focado em B2C)

---

> ## Transição de auth (modelo canônico B2C)
>
> O Sistema Akasha (Doc 25) usa exclusivamente o modelo **User B2C self-service**
> (Doc 04 §1–2): o cliente final se cadastra, compra e consulta sozinho.
>
> | Eixo | Modelo canônico (Akasha) |
> |---|---|
> | Identidade | `User` (auto-cadastro) |
> | Cadastro | **self-service** (e-mail+senha e/ou OAuth Google/Apple) |
> | Sessão | JWT/cookie httpOnly do `User` (akasha-jwt) |
> | Papel elevado | `role = ADMIN` (painel do Grimório, sync manual — Doc 04) |
> | App-alvo | `apps/b2c-portal` |
>
> Defense in depth: cada Server Component deve re-checar auth.
> NUNCA confiar no `userId` do body — sempre usar o `userId` derivado do gate.

---

## 1. Categorias

| Categoria | Auth | Onde mora |
|-----------|------|-----------|
| **B2C User** | `requireAkashaApi()` (API) / cookie check + `redirect` (Server Component) | `(akasha)/conta`, `(akasha)/mandala`, `(akasha)/diario`, `(akasha)/manifesto`, `(akasha)/oraculo` |
| **Público** | nenhum | `/` |

> **Regra de ouro:** toda rota B2C DEVEM ter
> **defense in depth** — gate no Server Component (page) +
> `requireAkashaApi()` na API correspondente. NUNCA confiar no
> `userId` do body.

---

## 2. B2C User — Páginas e layouts (gate server-side)

| Path | Tipo | Gate | Status |
|------|------|------|--------|
| `src/app/(akasha)/conta/page.tsx` | Server | cookie `akasha_session` + `redirect('/onboarding')` | OK Fase C |
| `src/app/(akasha)/mandala/page.tsx` | Server | cookie `akasha_session` + `redirect('/onboarding')` | OK Onda 4 |
| `src/app/(akasha)/diario/page.tsx` | Server | cookie `akasha_session` + `redirect('/onboarding')` | OK Onda 4 |
| `src/app/(akasha)/manifesto/page.tsx` | Client | fetch `/api/akasha/manifesto/generate` + redirect 401/403/404 | OK Onda 4 |
| `src/app/(akasha)/onboarding/page.tsx` | Client | rota de entrada (cadastro/login) | OK Fase C |
| `src/app/(akasha)/oraculo/page.tsx` | Client | fetch SSE `/api/akasha/consult` | OK Onda 4 |

> Defense in depth: as Server Pages do portal B2C RE-checam auth
> (cookie + redirect) antes de qualquer fetch interno. API
> correspondente re-checa via `requireAkashaApi`.

---

## 3. B2C User — API routes (`requireAkashaApi`)

> Assinatura: `requireAkashaApi(request)` retorna
> `{ id, email, name } | NextResponse(401)`. O caller deve checar
> `instanceof NextResponse` antes de usar o usuário (ver §9).

| Path | Métodos | Gate | Status |
|------|---------|------|--------|
| `src/app/api/akasha/auth/me/route.ts` | GET | `requireAkashaApi` | OK Fase C |
| `src/app/api/akasha/auth/login/route.ts` | POST | público (cria session) | OK Fase C |
| `src/app/api/akasha/auth/register/route.ts` | POST | público (cria User) | OK Fase C |
| `src/app/api/akasha/auth/logout/route.ts` | POST | público (revoga session) | OK Fase C |
| `src/app/api/akasha/auth/refresh/route.ts` | POST | público (rotaciona) | OK Fase C |
| `src/app/api/akasha/chart/route.ts` | GET/POST | `requireAkashaApi` | OK Fase C |
| `src/app/api/akasha/daily/route.ts` | GET | `requireAkashaApi` | OK Onda 4 |
| `src/app/api/akasha/mandala/route.ts` | GET | `requireAkashaApi` | OK Onda 4 |
| `src/app/api/akasha/manifesto/generate/route.ts` | POST | `requireAkashaApi` | OK Onda 4 |
| `src/app/api/akasha/manifesto/pdf/route.ts` | GET | `requireAkashaApi` | OK Onda 4 |
| `src/app/api/akasha/consult/route.ts` | POST (SSE) | `requireAkashaApi` | OK Onda 4 |
| `src/app/api/akasha/credits/route.ts` | GET | `requireAkashaApi` | OK Onda 4 |
| `src/app/api/akasha/subscription/route.ts` | GET | `requireAkashaApi` | OK Onda 4 |
| `src/app/api/akasha/checkout/route.ts` | POST | `requireAkashaApi` | OK Onda 4 |
| `src/app/api/akasha/transits/today/route.ts` | GET | `requireAkashaApi` | OK Onda 4 |

---

## 4. Páginas autenticadas B2C (gate client-side)

Páginas (akasha) que delegam o gate para a API chamada no `useEffect`
(fetch + tratamento de 401/403/404 → `router.replace('/onboarding')`):

| Path | Auth |
|------|------|
| `src/app/(akasha)/manifesto/page.tsx` | fetch `/api/akasha/manifesto/generate` |
| `src/app/(akasha)/oraculo/page.tsx` | fetch SSE `/api/akasha/consult` |

> As demais páginas (akasha) (`conta`, `mandala`, `diario`) usam
> gate **server-side** via cookie + `redirect` — ver §2.

---

## 5. Páginas públicas

| Path | Notas |
|------|-------|
| `src/app/page.tsx` | Landing |

---

## 6. Webhooks / API sem auth (com justificativa)

| Path | Por quê |
|------|---------|
| `src/app/api/webhooks/akasha-stripe/route.ts` | Webhook Stripe do Akasha — valida assinatura |
| `src/app/api/admin/webhooks/grimoire-sync/route.ts` | Webhook GitHub do Grimório — valida assinatura |
| `src/app/api/health/route.ts` | Health check — público por design |
| `src/app/api/health/live/route.ts` | Liveness probe — público por design |
| `src/app/api/health/ready/route.ts` | Readiness probe — público por design |
| `src/app/api/health/db/route.ts` | Health DB — público por design |
| `src/app/api/health/redis/route.ts` | Health Redis — público por design |
| `src/app/api/health/metrics/route.ts` | Métricas — público por design |
| `src/app/api/security/headers/route.ts` | Inspeção de security headers — debug |

---

## 7. Endpoints de domínio (motor público)

> Endpoints que **não** exigem auth: leitura de dados de referência
> (busca, progresso, health) usados pela UI B2C e integrações.

- `src/app/api/progresso/route.ts`
- `src/app/api/search/route.ts`
- `src/app/api/search/spiritual/route.ts`
- `src/app/api/search/index/route.ts`
- `src/app/api/security/headers/route.ts`

---

## 8. Helpers (auth)

- `src/lib/auth/akasha-guard.ts` — **canônico B2C**
  - `requireAkashaApi(request)` — Route Handlers (API). Retorna
    `{ id, email, name }` se autenticado, ou `NextResponse(401)`
    caso contrário. Caller deve checar `instanceof NextResponse`
    antes de usar.
  - `requireAkashaUser(request)` — Server Actions / contextos
    que **lançam**. Retorna `{ id, email, name }` ou `throw new
    Error('Unauthorized')` se não houver User.
  - `AKASHA_LOGIN_PATH` — constante do path de login B2C.

> **Não há helper `requireAkashaPage()`** — Server Components
> usam `cookies()` + `redirect()` diretamente (ver §2 e §9).

> **Testes do helper:** o canônico B2C é exercitado indiretamente
> por `tests/api/akasha-auth-register.test.ts`. Não há suite
> unitária dedicada para `akasha-guard.ts` no momento.

---

## 9. Padrão canônico de uso

### Server Component (page.tsx, layout.tsx)
```ts
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function MyB2CPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('akasha_session')?.value;
  if (!token) redirect('/onboarding');
  // ... usa token para fetch interno à API
}
```

### API route (route.ts)
```ts
import { requireAkashaApi } from '@/lib/auth/akasha-guard';

export async function POST(request: NextRequest) {
  const userOrResponse = await requireAkashaApi(request);
  if (userOrResponse instanceof NextResponse) return userOrResponse;
  const user = userOrResponse;

  // NUNCA confiar no `userId` do body — sempre usar `user.id`
  const { clientId } = await request.json();
  // ...
}
```

### Server Action (que lança em vez de devolver NextResponse)
```ts
import { requireAkashaUser } from '@/lib/auth/akasha-guard';

export async function myAction() {
  const user = await requireAkashaUser(request); // throws se 401
  // ... usa user.id
}
```

---

## 10. Anti-padrões a evitar

- ❌ Usar `userId` ou `clientId` do body para autorização
- ❌ Confiar só no gate do client (`'use client'` com fetch — data leak)
- ❌ Permitir que o body determine o dono de um recurso
- ❌ Esquecer de re-checar auth em cada `page.tsx` (defense in depth)
- ❌ Pular `requireAkashaApi` em uma rota B2C "porque está dentro do layout"
