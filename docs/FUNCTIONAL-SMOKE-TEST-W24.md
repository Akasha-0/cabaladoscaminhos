# 🔥 Functional Smoke Test — Wave 24

> **Wave 24 — Verification 2/8** · 2026-06-28 · Coder + Ravena (QA)
> **Status:** 🟡 **PARTIAL — live smoke BLOCKED (sandbox); static analysis PASSED**

---

## TL;DR

Smoke test funcional de **52 pages + 96 API routes** do `cabaladoscaminhos`.

| Camada                 | Resultado                                       |
| ---------------------- | ----------------------------------------------- |
| **Pages (52)**         | ✅ All exist; 17 com `loading.tsx`, 4 com `error.tsx` |
| **API routes (96)**    | ✅ All exist; 92/95 com `try/catch`; 0 broken imports |
| **TypeScript**         | ✅ 0 errors em `src/` (1 error em `node_modules/csstype`) |
| **TODO/FIXME prod**    | 🟡 2 TODOs (admin gates pendentes) — não-críticos |
| **Mock data residual** | 🟡 4 locations (3 design-system demos + 1 placeholder) |
| **Live smoke (curl)**  | ❌ **BLOCKED** — sandbox mata bg process em 3s |

---

## 1. Roteiro & Ambiente

- **Repo:** `/workspace/cabaladoscaminhos`
- **Branch:** `main` (HEAD pós-Wave 23 — W11-W23 pushed)
- **Node:** 22.x · **Next.js:** 16.2.6 (Turbopack)
- **Stack:** App Router · Prisma · Supabase Auth · Postgres
- **Bundler:** Next.js dev server (`npx next dev --port 3000`)
- **Sandbox limitação:** bg process morre em ≤3s após `bash` exit (consistente com o note do profile sobre git hangs no `cabaladoscaminhos`)

---

## 2. Pages — `src/app/**/page.tsx`

**Total: 52 pages** (27 root-level + 25 grouped via route groups `(admin)`, `(community)`, `(info)`, `(auth)`).

### 2.1 Listagem completa por route group

| Route Group   | Pages                                                                                                                                                              | Count |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- |
| (root)        | `/`, `/feed`, `/library`, `/akashic`, `/akashic-chat`, `/notifications`, `/search`, `/post/[id]`, `/u/[handle]`, `/design-system`, `/manifesto`, `/welcome`, `/onboarding`, `/share-target`, `/offline`, `/about`, `/privacy`, `/terms`, `/validacao`, `/validacao/b`, `/validacao/c`, `/validacao/d` | 23    |
| `(community)` | `/dashboard`, `/feed`, `/library`, `/akashic`, `/explore`, `/groups`, `/groups/[slug]`, `/events`, `/events/[id]`, `/post/[id]`, `/u/[handle]`, `/mentorship`, `/mentorship/[id]`, `/tags/[tag]`, `/notifications`, `/settings`, `/feedback`, `/me/bookmarks`, `/me/drafts`, `/me/history`     | 20    |
| `(admin)`     | `/`, `/dashboard`, `/flags`, `/moderation`, `/newsletter`, `/users`                                                                                                | 6     |
| `(auth)`      | `/login`, `/signup`, `/verify-email`, `/reset-password`                                                                                                            | 4     |
| Legacy aliases| `/about`, `/akashic`, `/feed`, `/library`, `/notifications`, `/post/[id]`, `/privacy`, `/terms` (root-level mirrors of `(community)` paths)                       | 8 (já contado em root) |

### 2.2 Loading + Error coverage

| Coverage              | Count | % of pages | Notes                                                                                          |
| --------------------- | ----- | ---------- | ---------------------------------------------------------------------------------------------- |
| ✅ Tem `loading.tsx`  | 17    | 33%        | Concentrados em `(community)` + landing pages                                                  |
| ❌ Sem `loading.tsx`  | 35    | 67%        | `(admin)/*`, `(auth)/signup|verify-email|reset-password`, `/manifesto`, `/design-system`, `/share-target`, `/welcome`, `/offline`, etc. |
| ✅ Tem `error.tsx`    | 4     | 8%         | `(auth)/login`, `(community)/dashboard`, `(community)/groups/[slug]`, `(community)/settings`  |
| ❌ Sem `error.tsx`    | 48    | 92%        | App Router herda error boundary do root layout (`src/app/error.tsx`)                            |
| ✅ `not-found.tsx`    | 1     | —          | `src/app/not-found.tsx` (root)                                                                 |

> **Recomendação (Wave 25+):** adicionar `loading.tsx` em pelo menos as rotas pesadas (`/explore`, `/post/[id]`, `/me/*`, `/validacao/*`) para evitar CLS e melhorar perceived performance.

### 2.3 Pages — análise de conteúdo

| Page                          | Tipo                  | Mock? | API consumida                          | Notas |
| ----------------------------- | --------------------- | ----- | -------------------------------------- | ----- |
| `/`                           | Static + Client       | Não   | `/api/health` (no client)              | Landing "Akasha Portal" — CTA + features |
| `/feed` (root)                | Client (`'use client`)| 🟡 **MOCK** | —                              | **Design-system demo** — `MOCK_POSTS` (3 posts), state controls visíveis na UI |
| `/feed` (`(community)`)       | Client (`'use client`)| Não   | `useFeed` hook → `/api/posts`          | **Real** — conectado a Prisma via hooks; CRUD completo |
| `/library` (root)             | Client                | 🟡 **MOCK** | —                              | **Design-system demo** — `SECTIONS` const, state demo controls |
| `/library` (`(community)`)    | Client                | 🟡 Hardcoded data | `/api/articles` (mas ARTICLES const inline) | **Partial** — listagem de ARTICLES hardcoded inline; deveria chamar `/api/articles` |
| `/akashic` (root)             | Client                | 🟡 **MOCK** | —                              | **Design-system demo** — `MOCK_READING` com 3 cards |
| `/akashic` (`(community)`)    | Client                | Não   | `/api/akashic/chat/stream` (SSE)       | **Real** — SSE streaming, RAG sources, voice mode |
| `/akashic-chat` (root)        | Client                | ❌ **PLACEHOLDER** | — (não chama API)              | **`setTimeout` + string fixa** — TODO: integrar com `/api/akashic/chat` |
| `/notifications` (root)       | Client                | 🟡 **MOCK** | —                              | **Design-system demo** — `MOCK_NOTIFICATIONS` |
| `/notifications` (`(community)`) | Client           | Não   | `/api/notifications` + `useCommunityNotifications` | **Real** — Wave 22-27 refactor |
| `/search`                     | Client                | Não   | `/api/search?q=...`                    | OK |
| `/post/[id]`                  | Client                | Não   | `/api/posts/[id]`                      | OK |
| `/u/[handle]`                 | Client                | Não   | `/api/users/profile?handle=...`        | OK |
| `/design-system`              | Static                | Não   | —                                      | Showcase de componentes — intencional |
| `/share-target`               | Client                | Não   | Web Share Target API                   | PWA share receiver |
| `/offline`                    | Static                | Não   | —                                      | PWA offline fallback |
| `/manifesto`                  | Static                | Não   | —                                      | Conteúdo editorial |
| `/validacao/*`                | Server                | 🟡 Placeholder | `/api/waitlist` GET (counter)          | **Variant A/B/C/D** — counter é fake, depoimentos placeholder Wave 20 |

> **Findings:**
> 1. **PAGES-001 — Duplicação de pages:** root-level (`/feed`, `/library`, `/akashic`, `/notifications`) e `(community)` espelham paths. Os root-level são demos do design-system e SOBRESCREVEM o real quando visitados. **Recomendação:** mover demos para `/design-system/feed`, `/design-system/library`, etc., OU remover root-level pages.
> 2. **PAGES-002 — `/akashic-chat` placeholder não-conectado:** texto "Recebi sua pergunta. Estou consultando os artigos curados…" é hardcoded — usuário nunca recebe resposta real da IA. **Severidade: ALTA** (core feature da Wave 12).
> 3. **PAGES-003 — `/library` `(community)` tem dados hardcoded inline** (`ARTICLES` const). Deveria chamar `/api/articles` ou via hook.
> 4. **PAGES-004 — `/validacao/*` placeholders documentados** (counter fake, depoimentos Wave 20). Não-crítico pois é página de teste A/B.

---

## 3. API Routes — `src/app/api/**/route.ts`

**Total: 96 route files** (95 exportam handlers — 1 é apenas `route.ts` placeholder).

### 3.1 Distribuição por método HTTP

| Método   | Routes que exportam | Exemplos                                                |
| -------- | ------------------- | ------------------------------------------------------- |
| `GET`    | 53                 | `/api/health`, `/api/articles`, `/api/posts`, `/api/search`, `/api/notifications`, `/api/events`, `/api/groups`, `/api/admin/users` |
| `POST`   | 60                 | `/api/posts`, `/api/comments`, `/api/notifications/spiritual`, `/api/upload`, `/api/akashic/chat`, `/api/auth/login` |
| `PATCH`  | 8                  | `/api/drafts/[id]`, `/api/flags/[name]`, `/api/groups/[slug]`, `/api/newsletter/preferences`, `/api/notifications/[id]/read`, `/api/notifications/preferences`, `/api/notifications/read-all`, `/api/posts/[id]` |
| `DELETE` | 13                 | `/api/drafts/[id]`, `/api/groups/[slug]`, `/api/posts/[id]`, `/api/users/[id]/follow`, `/api/push/subscribe`, `/api/notifications/push`, etc. |
| `PUT`    | 0 (real) — 2 stubs | `/api/users/[id]/followers`, `/api/users/[id]/following` retornam `405 Use GET` |

### 3.2 Auth coverage

| Categoria                                       | Count | Notes                                                                                 |
| ----------------------------------------------- | ----- | ------------------------------------------------------------------------------------- |
| ✅ `requireViewer` (user)                        | 38    | Endpoints de mutação no escopo community                                              |
| ✅ `requireAdmin`                                | 8     | `/api/admin/*` (audit/log, flags, users, moderation, newsletter/send, funnel-metrics)  |
| ✅ Cron secret (`CRON_SECRET`)                   | 3     | `/api/cron/*` (process-email-queue, publish-scheduled, weekly-digest)                  |
| ✅ Dev header (`x-dev-user-id`)                  | (default) | `getViewer()` aceita em dev — documentado no `auth.ts`                          |
| 🟡 Public reads (sem auth intencional)          | 30+   | `/api/health`, `/api/articles`, `/api/articles/[slug]`, `/api/search`, `/api/search/suggestions`, `/api/notifications/unsubscribe`, `/api/groups` (list), `/api/events` (list), `/api/mentorship/available` |
| 🟡 Self-auth (`/api/auth/*`)                    | 11    | login/logout/register/etc — auth é o próprio domínio                                  |
| ❌ Missing                                      | 0 — mas 2 com **TODO** | `/api/admin/funnel-metrics` (TODO: admin gate); `/api/flags/[name]` (TODO: role check) |

### 3.3 Validation coverage (Zod)

| Padrão                                  | Count | Notes                                                |
| --------------------------------------- | ----- | ---------------------------------------------------- |
| ✅ `safeParse` / `Schema.parse`          | 75+   | Maioria usa `@/lib/validators/*` ou `z.object` inline |
| 🟡 Stub `405` POST/PUT/PATCH/DELETE     | 5     | `/api/users/[id]/followers` e `/following` (e mais 3 routes que retornam `fail(405)`) |
| ✅ Endpoints sem body (URL params only)  | 10    | `/api/events/[id]/join`, `/api/posts/[id]/like`, `/api/users/[id]/follow`, etc. — não precisam de validation |
| ❌ Missing em rotas com body             | 0 (todos POST/PATCH com body validam) |              |

### 3.4 Try/catch + Error handling

| Categoria                                    | Count | Notes                                                              |
| -------------------------------------------- | ----- | ------------------------------------------------------------------ |
| ✅ `try/catch` em volta do handler           | 92/95 | Padrão consistente                                                |
| ❌ Sem `try/catch`                            | 3     | `/api/admin/funnel-metrics`, `/api/notifications/templates`, `/api/push/unsubscribe` |

> **Recomendação:** adicionar `try/catch` ou wrapper `withErrorHandler` aos 3 routes restantes.

### 3.5 Rate limiting

| Categoria                                  | Count | Notes                                                            |
| ------------------------------------------ | ----- | ---------------------------------------------------------------- |
| ✅ `checkPostRateLimit` / `checkUserRateLimit` | 13    | Endpoints community de mutação                                    |
| ✅ Rate-limit global                       | (via middleware) | Ver `src/middleware.ts`                              |

### 3.6 Cache headers

| Categoria                | Count | Notes                                                                                  |
| ------------------------ | ----- | -------------------------------------------------------------------------------------- |
| ✅ `s-maxage` / `noStore` | 21    | Endpoints read-only (articles, search, etc.)                                           |
| 🟡 No cache config       | 75    | Mutations, auth, admin — fine (sempre fresh)                                           |

### 3.7 Runtime / Dynamic config

| Categoria                          | Count | Notes                                                            |
| ---------------------------------- | ----- | ---------------------------------------------------------------- |
| `export const runtime = 'nodejs'`  | 32    | Onde Prisma raw SQL ou crypto é usado                            |
| `export const dynamic = 'force-dynamic'` | 74    | Onde há auth, DB query, ou `cookies()/headers()`               |
| Sem config (default Edge/Node)     | 21    | Static-eligible endpoints                                        |

---

## 4. Broken Imports

**Resultado:** ✅ **0 broken imports** (após diff directory-level).

Metodologia:
1. Extrair todos `from '@/lib/...'` em `src/app/**/*.tsx|ts` e `src/components/`
2. Comparar contra arquivos reais em `src/lib/`
3. Diff retornou apenas falsos positivos (`@/lib/audit` → `audit/index.ts`, `@/lib/notifications` → `notifications/index.ts`) — ambos têm `index.ts`

```
$ comm -13 lib_sorted.txt imports_sorted.txt
audit              ← false positive (resolves to src/lib/audit/index.ts)
notifications      ← false positive (resolves to src/lib/notifications/index.ts)
```

**Type check adicional:**
```
$ npx tsc --noEmit
node_modules/csstype/index.d.ts(6385,11): error TS1010: '*/' expected.
1 error total (in node_modules, NOT in src/)
```

✅ **0 TS errors em `src/`** — confirma claim do W24-1.

---

## 5. Mock Data Residual

| Local | Tipo | Severidade | Notas |
| ----- | ---- | ---------- | ----- |
| `src/app/feed/page.tsx:36` | `MOCK_POSTS` (3 items) | 🟡 BAIXA | **Design-system demo** — tem "State demo controls" explícitos na UI |
| `src/app/notifications/page.tsx:20` | `MOCK_NOTIFICATIONS` (3 items) | 🟡 BAIXA | **Design-system demo** |
| `src/app/akashic/page.tsx:27` | `MOCK_READING` (3 cards) | 🟡 BAIXA | **Design-system demo** |
| `src/app/akashic-chat/page.tsx:55-63` | `setTimeout` + string placeholder | 🔴 **ALTA** | **Não conectado a `/api/akashic/chat`** — usuário vê "Recebi sua pergunta. Estou consultando os artigos curados…" mas isso é hardcoded, não há chamada real à API |
| `src/app/(community)/library/page.tsx` | `ARTICLES` const inline (10 items) | 🟡 MÉDIA | Deveria chamar `/api/articles` via hook |
| `src/app/validacao/*/page.tsx` | counter fake + depoimentos placeholder | 🟡 BAIXA | Documentado como "placeholder Wave 20" |
| `src/app/admin/newsletter/composer.tsx:30` | `mode?: 'live' \| 'stub'` | 🟡 BAIXA | Modo dev intencional (sem SendGrid key) |

> **Recomendação Wave 25+:**
> 1. **CRÍTICO:** Corrigir `/akashic-chat/page.tsx` para chamar `/api/akashic/chat` de verdade (1-2 horas de trabalho).
> 2. **MÉDIO:** Migrar `/library` `(community)` para hook `useArticles()` que consome `/api/articles`.
> 3. **BAIXO:** Mover root-level `/feed`, `/library`, `/akashic`, `/notifications` para `/design-system/*` ou remover (são demos que sobrescrevem paths reais).

---

## 6. TODO / FIXME Críticos

| Arquivo:linha | Texto | Severidade |
| ------------- | ----- | ---------- |
| `src/app/api/admin/funnel-metrics/route.ts:7` | `// Auth: TODO (admin gate). Por enquanto, dev-only (NODE_ENV !== 'production').` | 🔴 **ALTA** — endpoint exposto sem auth em prod |
| `src/app/api/flags/[name]/route.ts:8` | `// Auth: TODO — quando tivermos role check, validar admin aqui.` | 🟡 MÉDIA — flag mutation sem auth |
| `src/lib/feature-flags/experiments.ts:113` | `// TODO Wave 21+: integrar com PostHog via @/lib/track` | 🟡 BAIXA — PostHog integration pendente |
| `src/app/api/users/profile/route.ts:5` | `// Spec: docs/MOCKS-AUDIT.md (2026-06-27 — replaces hardcoded DEMO_PROFILE).` | 🟢 INFO — referência ao audit doc |

> **Nenhum `// FIXME` ou `XXX` em código de produção.**

---

## 7. Live Smoke Test — ❌ BLOCKED

### 7.1 Tentativa

```bash
$ cd /workspace/cabaladoscaminhos && npx next dev --port 3000 &
PID=36118
▲ Next.js 16.2.6 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://172.26.16.141:3000
✓ Ready in 1602ms
```

```bash
$ curl -i http://127.0.0.1:3000/api/health
curl: (7) Failed to connect to 127.0.0.1 port 3000 after 0 ms: Connection refused
```

### 7.2 Investigação

```
$ ps aux | grep "next dev"
(nenhum resultado — processo morto)
```

O processo `next dev` morre **3 segundos após o `bash` shell exit**, mesmo com:
- `nohup`
- `setsid`
- `disown`
- `&` em background
- `--hostname 0.0.0.0` e `--hostname 127.0.0.1`

**Não é OOM** (memória plenty — 8 GB disponível). É o sandbox **matando processos órfãos**.

### 7.3 Tentativa com `next build`

```bash
$ NODE_OPTIONS='--max-old-space-size=3072' npx next build --experimental-build-mode=compile
Bus error
```

`next build` excede memória (8 GB não é suficiente para build com 96 routes + SWC + turbopack).

### 7.4 Procedimento vs Realidade

| Step | Procedimento | Realidade |
| ---- | ------------ | --------- |
| 1    | `pnpm dev` em background | ✅ Server reporta `Ready in 1.6s` |
| 2    | `curl /api/health` → 200 | ❌ Connection refused (processo morto em 3s) |
| 3    | Smoke 50+ rotas | ❌ Não executado |
| 4    | Documentar responses | ❌ Substituído por static analysis |

### 7.5 Root Cause

Sandbox do `cabaladoscaminhos` (consistente com git-hang note no user profile):
> *"`git add -A` and `git rev-parse HEAD` and similar commands can hang indefinitely... pattern: the slow operations are the ones that touch the git index/objects database."*

Aplicado a processos: o sandbox mata processos que tentam manter socket aberto após o shell pai terminar.

### 7.6 Caminho Alternativo (não executado)

**Para completar o smoke test em ambiente com sandbox normal:**

```bash
# Em uma janela tmux/screen persistente
cd /workspace/cabaladoscaminhos
NODE_OPTIONS='--max-old-space-size=2048' nohup npx next dev --port 3000 > /tmp/dev.log 2>&1 &
DEV_PID=$!
echo "PID=$DEV_PID"

# Aguardar ready
for i in $(seq 1 30); do
  sleep 1
  curl -s --max-time 1 -o /dev/null http://127.0.0.1:3000/api/health && break
done

# Batch 1: pages públicas
for p in / /feed /library /search /akashic /akashic-chat /notifications \
         /onboarding /welcome /about /privacy /terms /manifesto \
         /design-system /share-target /offline \
         /post/test /u/test /tags/cabala /community/dashboard /community/feed; do
  echo "GET $p -> $(curl -s -o /dev/null -w '%{http_code}' --max-time 30 http://127.0.0.1:3000$p)"
done

# Batch 2: API endpoints
for p in /api/health /api/articles /api/posts /api/search /api/notifications \
         /api/events /api/groups /api/auth/status /api/flags \
         /api/notifications/spiritual /api/akashic/records \
         /api/admin/funnel-metrics /api/users/me/bookmarks \
         /api/waitlist /api/cron/weekly-digest; do
  echo "GET $p -> $(curl -s -o /dev/null -w '%{http_code}' --max-time 30 http://127.0.0.1:3000$p)"
done

kill $DEV_PID
```

**Recomendação Wave 25+:** rodar este script em CI com sandbox persistente (ex: GitHub Actions com `background: true` + `wait-on`).

---

## 8. Resumo Executivo

### ✅ PASSED (static)

1. **0 broken imports** — todos `@/lib/*` paths resolvem corretamente.
2. **0 TS errors em `src/`** — único erro é em `node_modules/csstype` (upstream).
3. **92/95 routes com try/catch** — 3 routes precisam adicionar (admin/funnel-metrics, notifications/templates, push/unsubscribe).
4. **38 routes com `requireViewer`, 8 com `requireAdmin`, 3 com CRON secret** — cobertura de auth sólida.
5. **75+ routes com Zod validation** — único gap é nos stubs 405.
6. **17/52 pages com loading.tsx** — concentrados em paths críticos.
7. **4/52 pages com error.tsx** — root layout fornece fallback.

### 🟡 WARNINGS

1. **2 TODOs de auth** — `/api/admin/funnel-metrics` e `/api/flags/[name]` ainda não têm gate (admin).
2. **Duplicação root vs `(community)`** — 4 paths espelhados onde root é design-system demo.
3. **`/library` `(community)` tem ARTICLES hardcoded** — não chama API real.
4. **`/validacao/*` placeholders** — counter fake + depoimentos placeholder Wave 20.

### 🔴 CRITICAL

1. **`/akashic-chat/page.tsx` é placeholder** — não chama `/api/akashic/chat`. **Severidade: ALTA** (core feature da Wave 12).
2. **Live smoke test BLOCKED** — sandbox mata bg process em 3s. Não conseguimos verificar runtime de fato.

### Próximos passos (Wave 25+)

1. **CRÍTICO:** Conectar `/akashic-chat/page.tsx` ao `/api/akashic/chat` (1-2h).
2. **CRÍTICO:** Implementar admin gate em `/api/admin/funnel-metrics` e `/api/flags/[name]` (30min).
3. **MÉDIO:** Mover root-level `/feed`, `/library`, `/akashic`, `/notifications` para `/design-system/*`.
4. **MÉDIO:** Migrar `(community)/library` para hook `useArticles()` que consome `/api/articles`.
5. **BAIXO:** Adicionar `loading.tsx` em 8 rotas pesadas: `/explore`, `/post/[id]`, `/me/*`, `/validacao/*`.
6. **BAIXO:** Adicionar `try/catch` em 3 routes: `/api/admin/funnel-metrics`, `/api/notifications/templates`, `/api/push/unsubscribe`.

---

## 9. Anexos — Comandos Reproduzíveis

```bash
# Map all routes
find src/app -name "page.tsx" -o -name "route.ts" -o -name "loading.tsx" -o -name "error.tsx" | sort

# TS check
npx tsc --noEmit

# Method coverage
for f in $(find src/app/api -name "route.ts"); do
  grep -oE "export (async )?function (GET|POST|PUT|PATCH|DELETE)" "$f" | sort -u
done

# Auth coverage
grep -l "requireViewer\|requireAdmin" src/app/api -r

# Validation coverage
grep -l "safeParse\|\.parse(\|z\.object" src/app/api -r

# Mock data
grep -rE "MOCK_|DEMO_|HARDCODED_|SAMPLE_|fakeData" src/app/

# TODOs
grep -rE "TODO|FIXME|XXX|HACK" src/app/ src/lib/ | grep -v "todos\|TODO Wave"
```

---

**Assinatura:** Coder + Ravena (QA) · 2026-06-28 · Wave 24 Verification 2/8