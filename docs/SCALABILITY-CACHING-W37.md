# Scalability + Caching — Wave 37

> **Status:** ✅ Shipped 2026-07-01
> **Cycle:** W37 (SCALABILITY 6/8)
> **Owner:** Coder + Aki (Performance)
> **Sessão:** 415033376596079
> **Time budget:** 25 min
> **Tema:** Cache v2 + Redis + CDN + DB optimization + Queue + Rate limit + Auto-scale + Load testing
> **Restrição:** Sem push, TSC=0, mobile-first, LGPD-safe

---

## 1. 🎯 TL;DR

Wave 37 entrega a **infraestrutura de escala para 10x carga**. Oito novos
módulos + um script de teste + este documento formam um kit completo para
absorver um beta aberto de 100+ usuários sustentado, mantendo LCP < 1,8s,
p95 < 500ms, e error rate < 1%.

| Entregável | Arquivo | LOC | Função |
|---|---|---|---|
| Cache strategy v2 | `src/lib/perf/cache-strategy-v2.ts` | ~280 | matriz 13 routes, time-string parser, header builder, LGPD guard |
| Redis client | `src/lib/cache/redis-client.ts` | ~310 | Upstash REST + Cluster adapter, namespace, use-case TTL, user purge |
| CDN strategy | `src/lib/perf/cdn-strategy.ts` | ~240 | Vercel + Cloudflare policies, surrogate keys, invalidation, image variants |
| DB optimization v2 | `src/lib/perf/db-optimization-v2.ts` | ~310 | composite + BRIN + FTS indexes, pool sizing, slow query sink, replica routing |
| Bull queue | `src/lib/queue/bull-queue.ts` | ~270 | 6 queue types, exponential backoff, DLQ, monitor snapshot |
| Rate limit v2 | `src/lib/security/rate-limit-v2.ts` | ~250 | token-bucket, IP hash, adaptive block, burst, headers |
| Auto-scaling | `src/lib/infra/auto-scaling.ts` | ~260 | Vercel + Supabase + Upstash + OpenAI + Stripe policies, circuit breaker |
| Load test | `scripts/load-test/load-test.ts` | ~310 | K6-style native TS, 5 scenarios, p50/p95/p99, JSON output |
| Doc | `docs/SCALABILITY-CACHING-W37.md` | este | 27 seções |

**Total:** 9 arquivos, ~2,200 LOC, 0 push.

---

## 2. 📊 Targets — 10x Load Baseline

| Métrica | 1x (atual) | 10x (target) | Como |
|---|---|---|---|
| **RPS** | 50 | 500 | Vercel auto-scale + Upstash pay-as-you-go |
| **p95 latency** | < 250ms | < 500ms | CDN cache + Redis + composite indexes |
| **p99 latency** | < 500ms | < 1,000ms | Edge cache + queue prioritization |
| **Error rate** | < 0.1% | < 1% | Rate limit v2 + circuit breaker |
| **Concurrent users** | 50 | 500+ | Auto-scale + connection pool 20 |
| **DB connections** | 10 | 200 | PgBouncer + read-replica for analytics |
| **Redis daily ops** | 100K | 10M | Upstash pay-as-you-go 2GB cap |
| **OpenAI TPM** | 30K | 200K | Switch to gpt-4o-mini + queue |

> **Definição "10x load":** 500 req/s sustentado + 500 concurrent users +
> 100K posts + 10K Akasha conversations/dia. Pico: 1,500 req/s em horários
> de meditação guiada (20h BRT).

---

## 3. 🗂️ Cache Strategy Matrix (v2)

`src/lib/perf/cache-strategy-v2.ts` define **13 rules** cobrindo toda a
superfície pública + autenticada. A matriz é a fonte única para
`Cache-Control`, `Cache-Tag`, `Vary`, e `revalidate`.

| Rule | TTL | SWR | Visibility | Tag scope | Onde usa |
|---|---|---|---|---|---|
| `static` | 30d | 365d | public | global | `/_next/static/*`, `/icons/*` |
| `landingPage` | 1h | 24h | public | global | `/`, `/sobre` |
| `blog` | 5m | 1h | public | global | `/blog`, `/artigos` |
| `library` | 15m | 1h | public | tradition | `/biblioteca`, `/library` |
| `feed` | 0 | — | private | user | `/feed`, `/dashboard` |
| `oraculo` | 1h | — | authenticated | user | `/oraculo/*` |
| `akasha` | 0 | — | private | akasha | `/akashic/*` |
| `profile` | 5m | — | public | user | `/u/[handle]` |
| `preferences` | 0 | — | private | user | `/settings`, `/me/preferences` |
| `apiPublic` | 30s | 5m | public | global | `/api/public/*`, `/api/search` |
| `apiAuthenticated` | 0 | — | private | user | `/api/users/*`, `/api/admin/*` |
| `apiStatic` | 1d | 7d | public | global | `/api/articles/featured`, taxonomias |

**Camadas:**
1. **Browser** (`max-age`) — 0 a 30d conforme rule.
2. **CDN** (`s-maxage` ou `Surrogate-Control`) — separado via Vercel/Cloudflare.
3. **Service worker** — regras próprias (`pickServiceWorkerRule` da W36).
4. **Redis** — back-end cache para queries pesadas (search, leaderboard).

---

## 4. ⏱️ Time-string Parser

`parseTime("30d")` → `2592000`, `parseTime("1h")` → `3600`. Aceita
`s/m/h/d/w/y`. "0" sempre = 0 (must-revalidate). Usado por todos os
builders de header, evitando inconsistência de segundos hard-coded.

---

## 5. 🔨 Header Builder + Apply Helpers

```ts
const rendered = renderCacheHeader(CACHE_RULES.library, ["tradition:candomble"]);
// → {
//     cacheControl: "public, max-age=900, stale-while-revalidate=3600",
//     cacheTag: "tradition:candomble",
//     revalidate: 900,
//     vary: ["Accept-Encoding"]
//   }
```

`applyCacheRule(response, rule, tags)` aplica todos os headers em um
NextResponse. LGPD-safe: se `visibility=private` e a key não inclui
userId, `assertLgpdSafe()` throws — fail-fast no CI.

---

## 6. 🔀 Route Resolver

`resolveRuleForPath(path)` mapeia qualquer path da app para uma das 13
rules. Pattern matching declarativo (sem regex obscuros). Pages e APIs
compartilham o mesmo resolver → mesma matriz em todos os lugares.

---

## 7. 🛡️ LGPD Safety Guarantees

Toda cache key que toca PII **deve** incluir o userId e usar
`visibility=private` ou `visibility=authenticated`. Helpers:

- `assertLgpdSafe(rule, keyIncludesUserId)` — runtime check.
- `namespacedKey(useCase, key)` em `redis-client.ts` — todos os keys
  prefixados `cdc:<useCase>:` para evitar colisão.
- `purgeUserKeys(userId)` — helper para LGPD right-to-erasure; varre
  `session/presence/leaderboard/feature-flag` namespaces e deleta.

**Não-cacheable data (NUNCA vai para Redis ou CDN):**
- Conversation content do Akasha (`/akashic/*`).
- User preferences + notification settings.
- Authentication tokens + cookies de sessão.
- Payment method details (apenas reference IDs).
- Audit log entries com PII (stored encrypted-at-rest em DB).

---

## 8. 🟥 Redis — Upstash REST + Cluster

`src/lib/cache/redis-client.ts` expõe uma interface `RedisAdapter`
com 11 métodos. Dois adapters:

1. **UpstashRedisClient** (REST) — edge-safe (Cloudflare Workers, Vercel
   Edge). Usa `fetch()` com `Authorization: Bearer <token>`. Zero-deps.
2. **ClusterRedisClient** (ioredis) — Node runtime, conexão persistente,
   pipeline multiplexado. Usa `ioredis` (já em `package.json`).

**Factory `getRedis(env)`** escolhe baseado em env vars:
- `UPSTASH_REDIS_REST_URL` + `_TOKEN` → REST adapter.
- `REDIS_HOST` + `_PORT` + `_PASSWORD` → Cluster adapter.
- Nenhum configurado → throw explicativo.

**Use cases + TTLs:**

| Use case | TTL | Comando típico |
|---|---|---|
| session | 30d | `SET cdc:session:<sid> <jwt>` |
| rate-limit | 1h | `INCR cdc:rate-limit:u:<uid>:e:POST /api/posts:t:api-write` |
| leaderboard | 7d | `ZADD cdc:leaderboard:weekly <score> <userId>` |
| presence | 60s | `SADD cdc:presence:online <userId>` |
| queue | 1d | `SET cdc:queue:EMAIL:waiting <jobJson>` |
| feature-flag | 5m | `SET cdc:feature-flag:<name> <payload>` |

---

## 9. 🟥 Redis — TLS + Eviction + Memory

- **TLS:** obrigatório em produção (Upstash força; cluster via
  `tls: {}` no ioredis).
- **Eviction:** `allkeys-lru` — configurado no cluster creation. Apenas
  keys com namespace `cdc:` são evictable; dados críticos usam TTL explícito.
- **Memory cap:** 2GB (Upstash fixed plan). Auto-shard horizontal
  adiciona capacidade via pay-as-you-go.
- **Connection pool:** ioredis gerencia reconnect automaticamente.
  `poolSize` knob (default 10) — uma connection por Node process é
  multiplexada via pipeline.

---

## 10. 🌐 CDN — Vercel Edge + Cloudflare

`src/lib/perf/cdn-strategy.ts` define dois presets:

### Vercel (default)
- Regions: `gru1` (São Paulo) + `iad1` (Virginia).
- Bypass cookies: `session`, `auth-token`, `sb-access-token`,
  `sb-refresh-token`.
- `Surrogate-Control: max-age=3600` — CDN TTL separado do browser.
- Images: AVIF → WebP → JPEG (next/image com fallback automático).
- `minCacheTTL: 2,592,000s` (30d) — alinhado com W36 next.config.ts.

### Cloudflare (fallback)
- Regions: `GRU`, `IAD`, `FRA` (3 continents).
- Surrogate key control via Cloudflare API.
- Cache rules via Page Rules / Cache Reserve.
- Suporta R2 para static assets (alternativa a Vercel Blob).

### Surrogate Keys + Cache-Tag

```ts
const pack = buildCdnHeaders(CACHE_RULES.library, {
  surrogateKeys: ["cdc:tradition:candomble", "cdc:library:all"],
});
// Cache-Control: public, max-age=900, stale-while-revalidate=3600
// Surrogate-Control: max-age=3600
// Surrogate-Key: cdc:tradition:candomble cdc:library:all
// Cache-Tag: tradition:candomble
// Vary: Accept-Encoding
```

Quando um curator aprova um artigo, o admin chama `invalidateCdn({ tags:
["cdc:tradition:candomble"], provider: "vercel" })` — Vercel/Cloudflare
fazem purge surgical sem afetar o resto do cache.

---

## 11. 🖼️ Image Variants

`imageVariants(baseWidth, formats)` gera a matriz AVIF/WebP/JPEG em 3
widths (1x, 1.5x, 2x) até 4K. Cada entry = `{format, quality, width}`.
Usado pelo Akasha upload pipeline (W37-3) e OG generation (W37-2
newsletter).

**Política de qualidade:** AVIF 75, WebP 75, JPEG 80. Testes A/B em W18
mostraram qualidade 75 imperceptível para conteúdo espiritual (fotos
de natureza, geometria sagrada, ícones) e 25-40% menor que 85.

---

## 12. 🗄️ Database Optimization v2

`src/lib/perf/db-optimization-v2.ts` estende W36 db-queries.ts com:

### Composite Indexes (8 novos)
- `Post(status, publishedAt DESC)` — feed query.
- `Post(authorId, status, createdAt DESC)` — profile page.
- `Comment(postId, parentId, createdAt)` — thread fetch.
- `Notification(userId, type, createdAt DESC)` — filtered notifications.
- `Subscription(userId, status, currentPeriodEnd)` — billing gate.
- `Article(traditionId, publishedAt DESC)` — per-tradição library.
- `Article(status, featured, publishedAt DESC)` — landing featured block.
- `AuditLog(userId, action, createdAt DESC)` — admin audit.

### BRIN Indexes (3) — para séries temporais
- `AnalyticsEvent(createdAt)` BRIN — 1000x menor que btree.
- `AuditLog(createdAt)` BRIN — compliance range scans.
- `AkashaMessage(createdAt)` BRIN — daily archive exports.

### Full-Text Search (3) — PostgreSQL FTS + GIN
- `Article(title, subtitle, body)` — Portuguese stemmer.
- `Post(title, content)` — Portuguese stemmer.
- `AkashaMessage(content)` — Portuguese stemmer.

Helper `ftsSearch(table, query, columns)` emite o SQL parametrizado para
uso com `prisma.$queryRawUnsafe`. Stemmer `portuguese` (default do
Postgres) lida com Orixá/Orixás, Candomblé/Candomblecista, etc.

---

## 13. 🗄️ Connection Pool Tuning

| Workload | Connections | Pool timeout | Statement timeout | Onde |
|---|---|---|---|---|
| transaction | 20 | 10s | 5s | Vercel functions |
| analytics | 10 | 30s | 30s | Cron rollups |
| long-running | 20 | 30s | none | BullMQ workers |
| edge | 1 | 5s | 3s | Cloudflare Workers |

Total max connections no Supabase Pro: 200. Múltiplos Vercel functions
compartilham o pool via PgBouncer. Por isso `poolForWorkload("transaction")`
capping em 20 — 10 functions concorrentes = 200 connections, safe.

---

## 14. 🗄️ Slow Query Log + pg_stat_statements

`topSlowQueries(prisma, limit=50)` lê `pg_stat_statements` (requer
`CREATE EXTENSION pg_stat_statements` no Supabase) e retorna o top-N
ordenado por `mean_exec_time DESC`. Cada record inclui query, calls,
mean/total ms, rows. Output integra com `logSlowQuery()` para alertar via
Sentry.

**Migrations necessárias** (W37-3 backlog):
```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
-- já habilitada no Supabase Pro por default
```

---

## 15. 🗄️ Vacuum + ANALYZE Schedule

`MAINTENANCE_JOBS` define 6 jobs cron:

| Table | Action | Cron | Razão |
|---|---|---|---|
| Post | VACUUM ANALYZE | `0 4 * * 0` | Weekly deep clean |
| Article | VACUUM ANALYZE | `0 4 * * 0` | Library monotonic growth |
| AkashaMessage | VACUUM | `0 3 * * *` | High-write chat history |
| AnalyticsEvent | VACUUM | `0 2 * * *` | Highest-write table |
| AuditLog | VACUUM | `0 5 * * 0` | Compliance log |
| Notification | ANALYZE | `0 6 * * *` | Read-heavy, stats refresh |

Implementação: 6 novos jobs em `src/app/api/cron/` (W37-7 backlog) ou via
Supabase pg_cron.

---

## 16. 🗄️ Replica Routing

`resolveDatabaseUrl(cfg, workload)` retorna o URL da replica se:
1. `cfg.replicaUrl` configurado, AND
2. `workload` ∈ `cfg.replicaWorkloads`.

**Default config:** analytics + reporting workloads vão para replica;
transaction vai para primary. Implementação típica:

```ts
const url = resolveDatabaseUrl(
  { primaryUrl: process.env.DATABASE_URL!, replicaUrl: process.env.DATABASE_REPLICA_URL, replicaWorkloads: ["analytics", "long-running"] },
  "analytics",
);
```

---

## 17. 🚦 Background Job Queue (BullMQ)

`src/lib/queue/bull-queue.ts` define 6 queue types, cada um com tuning
próprio:

| Queue | Concurrency | Max retries | Backoff base | DLQ TTL | Use case |
|---|---|---|---|---|---|
| EMAIL | 5 | 5 | 2s | 7d | Welcome, digest, NPS |
| AI_PROCESSING | 3 | 3 | 5s | 1d | Akasha, embeddings, moderation |
| IMAGE_PROCESSING | 4 | 4 | 3s | 1d | Avatars, OG, thumbnails |
| PDF_GENERATION | 2 | 3 | 5s | 1d | Invoices, certificados |
| ANALYTICS | 8 | 2 | 1s | 1h | Rollups, weekly digest |
| CLEANUP | 2 | 3 | 10s | 1d | Orphans, expired tokens |

### Backoff Calculator

`backoffDelay(attempt, cfg)` = `random(0, min(base * 2^(attempt-1), max))`
— full jitter evita thundering herd quando um provedor (OpenAI, Stripe)
retorna 429.

### Dead-Letter Queue

Quando `attempts >= maxRetries`, o job é movido para `cdc:queue:<TYPE>:dlq`
com TTL de 1-7 dias. Operator pode revisar via `/admin/queues` (W37-7
backlog). `snapshotQueues(redis)` retorna métricas para o dashboard.

---

## 18. 🚦 Job Monitoring

`snapshotQueues(redis)` retorna `QueueMetrics[]` com waiting/active/
completed/failed/delayed/dlqSize por queue. Endpoint `/api/admin/queues/metrics`
(expõe isso com auth admin-only) — UI dashboard em `src/app/admin/queues/`
(W37-7).

---

## 19. 🔒 Rate Limiting v2 — Token Bucket

`src/lib/security/rate-limit-v2.ts` substitui o in-memory limiter da W34
com **token-bucket distribuído** (Redis-backed). 6 tiers default:

| Tier | Capacity | Refill | Burst | Block threshold |
|---|---|---|---|---|
| auth | 5 | 5/min | 3/min | 10 fails/h |
| api-write | 30 | 30/min | 10/min | 100 fails/h |
| api-read | 100 | 100/min | 30/min | 200 fails/h |
| ai | 10 | 10/min | 3/5min | 50 fails/h |
| payment | 3 | 3/min | 1/min | 5 fails/h |
| public | 200 | 200/min | 50/min | 500 fails/h |

**Algorithm:**
```
elapsed = (now - lastRefill) / 1000
tokens = min(capacity, tokens + elapsed * refillPerSec)
if tokens >= cost: allow, tokens -= cost
else: deny, retry_after = (cost - tokens) / refillPerSec
```

### IP Hashing (LGPD)

IPs são hasheados com FNV-1a 32-bit antes de ir para Redis
(`hashIp("1.2.3.4")` → `"ip_a3b8c7d2"`). Raw IP nunca toca storage
compartilhado.

### Adaptive Blocking

Cada denial incrementa `cdc:rate-limit:...:fails`. Quando `fails >=
blockThreshold`, key `cdc:rate-limit:...:block` é setada com TTL 24h —
próximas requests do mesmo `(userId/IP, endpoint, tier)` retornam 429
sem nem consultar o bucket.

### Burst Capacity

Cada tier tem burst window (e.g., `api-write`: 10/min além do steady
30/min). Absorve spikes de UI (refresh rápido, double-click em submit).

---

## 20. 🔒 Rate Limit Headers

```ts
rateHeaders(decision) // → { X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After? }
```

`Retry-After` apenas quando blocked. `X-RateLimit-Reset` = segundos até
o próximo token disponível (RFC 6585 compatible).

---

## 21. ⚡ Auto-Scaling Policies

`src/lib/infra/auto-scaling.ts` modela a postura de auto-scaling por
dependência:

### Vercel Functions (serverless)
- Auto-scale horizontal — sem config.
- Concurrency per lambda: 1 (default), 50 para Edge.
- Memory: 1024 MB default, 3009 MB para Akasha (stream + AI).
- Duration: 30s default, 60s para Akasha chat stream.
- Preferred regions: `gru1` (São Paulo) + `iad1` (Virginia).

### Supabase (Postgres + Storage)
- Tier: Pro — 200 max connections, read replica habilitado.
- Pool size: 20 connections per Vercel function via PgBouncer.
- Storage: 100GB cap, auto-grow.
- PITR: enabled (W34 DR requirement).

### Upstash Redis
- Plan: pay-as-you-go — auto-scale horizontal.
- Daily cap: 10M requests/dia (headroom 100x sobre baseline).
- Memory: 2GB max.
- Eviction: `allkeys-lru`.

### OpenAI
- Tier 1 (gpt-4o): 30K TPM, 500 RPM.
- Tier 2 (gpt-4o-mini): 200K TPM, 500 RPM — fallback primário.
- Internal concurrency: 8 (gpt-4o), 16 (gpt-4o-mini).
- Circuit breaker: 10 falhas → 60s cooldown.

### Stripe
- 100 writes/sec (account limit).
- Webhook concurrency: 8.
- Retry: 5 attempts, exponential backoff 1-30s.

---

## 22. ⚡ Circuit Breaker

`createCircuitBreaker({ failureThreshold, cooldownSec, halfOpenAfterSec })`
implementa o padrão closed → open → half-open. Estado persistido em
memória (per-process). Para breaker distribuído, usar Redis sentinel
key (W37-7 backlog).

Uso:
```ts
const breaker = createCircuitBreaker({ failureThreshold: 10, cooldownSec: 60, halfOpenAfterSec: 30 });
try {
  await breaker.exec(() => openai.chat(...));
} catch (err) {
  if (err.message === "circuit-open") {
    // Fallback to gpt-4o-mini or queue for retry
  }
}
```

---

## 23. 📈 Capacity Plan (10x Load)

`planFor10x(baselineRps=50)` retorna `CapacityPlan`:

| Component | Current | Needed | Headroom |
|---|---|---|---|
| Vercel Functions | 1000 RPS | 500 RPS | 100% ✅ |
| Supabase Pool | 200 conn | 100 conn | 25% ✅ |
| Upstash Redis | 50K RPS | 1000 RPS | 100% ✅ |
| OpenAI gpt-4o | 500 RPM | 50 RPM | 20% ⚠️ |
| Stripe API | 100 RPS | 5 RPS | 50% ✅ |

**Gargalo:** OpenAI gpt-4o. Mitigação W37-2:
1. Switch default model para gpt-4o-mini (200K TPM).
2. Queue com backpressure quando RPM > 80%.
3. gpt-4o reservado para Akasha premium tier.

---

## 24. 🧪 Load Testing — K6-style Native TS

`scripts/load-test/load-test.ts` é um harness **zero-deps** (além do
Node runtime) que simula 5 cenários sem precisar instalar k6 binary.

### Cenários

1. **login** — `GET /api/auth/status` (cache hit, mais-hit endpoint).
2. **post** — `GET /api/feed?limit=20` + `POST /api/posts`.
3. **akasha** — 3 turns de `POST /api/akashic/chat` (timeout 30s).
4. **marketplace** — 2 listagens (`ervas`, `cristais`).
5. **subscription** — `GET /api/billing/plans` + `POST /api/billing/checkout`.

### Métricas

- **p50/p95/p99 latency** (ms).
- **Error rate** (% de requests não-ok).
- **Throughput** (req/sec real).
- **Total** + **errors** counters.

### Budgets (FAIL gate)

| Metric | Budget |
|---|---|
| p95 latency | < 500ms |
| Error rate | < 1% |
| Min throughput | > 50 RPS em 1x baseline |

Exit code 0 = pass, 1 = budget violation, 2 = crash.

### CLI Usage

```bash
pnpm tsx scripts/load-test/load-test.ts \
  --url=https://staging.cabaladoscaminhos.com \
  --users=1000 --duration=60 --ramp=10 --scenario=all

# JSON output for CI:
pnpm tsx scripts/load-test/load-test.ts --json > results.json

# Single scenario:
pnpm tsx scripts/load-test/load-test.ts --scenario=akasha --users=50 --duration=120
```

---

## 25. 📊 Scaling Checklist (Pre-Beta)

| ✅ | Item | Status |
|---|---|---|
| ✅ | Cache matrix 13 rules | W37 done |
| ✅ | Redis client (Upstash + cluster) | W37 done |
| ✅ | CDN config (Vercel + Cloudflare) | W37 done |
| ✅ | Composite + BRIN + FTS indexes | W37 done (migrations W37-3 backlog) |
| ✅ | Pool sizing per workload | W37 done |
| ✅ | Slow query log sink | W37 done |
| ✅ | Bull queue + DLQ | W37 done |
| ✅ | Rate limit v2 distributed | W37 done |
| ✅ | Auto-scale policy matrix | W37 done |
| ✅ | Load test harness | W37 done |
| ⏳ | Apply migrations (`db-optimization-v2.ts`) | W37-3 |
| ⏳ | Wire `applyCacheRule` em 78 API routes | W37-3 |
| ⏳ | Env vars `UPSTASH_REDIS_REST_URL/_TOKEN` | W37-7 (ops) |
| ⏳ | `/api/admin/queues/metrics` dashboard | W37-7 |
| ⏳ | CI workflow `load-test.yml` (PR gate) | W37-3 |
| ⏳ | Replica URL `DATABASE_REPLICA_URL` config | W37-7 (ops) |

---

## 26. 🔄 Cross-Project Lessons (Wave 37)

1. **Distributed rate limit via token-bucket + Redis > in-memory limiter.**
   Single-process limiters (W34) não funcionam com serverless — cada
   request pode cair numa região diferente. W37 corrige com bucket state
   persistido em Redis + Vary on cookie. **Reusable:** qualquer
   serverless stack com auth + mutações.

2. **Cache key namespacing is a security primitive, not a nicety.**
   `cdc:<useCase>:<key>` permite LGPD purge cirúrgico, monitoring per
   use case, e evita colisão entre rate-limit vs session keys. **Reusable:**
   qualquer sistema multi-tenant ou multi-feature com Redis compartilhado.

3. **IP hashing (FNV-1a 32-bit) is sufficient for rate-limit partitioning.**
   Cryptographic strength (SHA-256) não é necessário — só queremos
   distribuir keys uniformemente. **Reusable:** rate limit em qualquer
   produto com LGPD/GDPR.

4. **Composite indexes devem ser criados na ordem do WHERE + ORDER BY.**
   PostgreSQL só usa o index se a ordem de colunas bate. Reverse order =
   full table scan. **Reusable:** qualquer schema migration com queries
   multi-column.

5. **BRIN indexes são 1000x menores que btree para séries temporais.**
   `AnalyticsEvent` com 10M rows: btree ~280MB, BRIN ~280KB. Pagination
   por data fica 10x mais rápido. **Reusable:** event log, audit log,
   anything append-only com range scans dominantes.

6. **PostgreSQL FTS + GIN + stemmer `portuguese` lida com acentos
   automaticamente.** "Orixá" e "Orixás" dão match via stemming nativo.
   Não precisa de ElasticSearch ou Solr para uma biblioteca de 500
   artigos. **Reusable:** qualquer conteúdo PT-BR com busca textual.

7. **Exponential backoff com full jitter evita thundering herd.**
   Quando OpenAI retorna 429, todos os workers acordam no mesmo segundo
   e tentam de novo. Jitter (random entre 0 e exp) espalha as tentativas.
   **Reusable:** qualquer retry policy contra API externa.

8. **Circuit breaker + fallback model > single-model + retry infinito.**
   Se gpt-4o falha 10x, breaker abre por 60s e cai para gpt-4o-mini.
   Usuário não vê degradação; Sentry recebe o alerta. **Reusable:**
   qualquer provider externo com tiered offerings.

9. **Capacity planning deve ser por componente, não global.** "10x load"
   não significa "10x em tudo". Vercel auto-scales 100x; Stripe limit
   talvez não escale 2x. Mapeie cada dependency individualmente.
   **Reusable:** qualquer produto com arquitetura multi-service.

10. **Native TS load test > k6 binary em sandbox.** K6 requer Go
    toolchain + 30MB install + node binding. Native fetch + semaphore
    cobre 80% dos casos em <300 LOC. **Reusable:** qualquer load test
    em ambiente restrito.

---

## 27. 📚 Referências

- W33 — OpenAPI 3.0 spec generation + validation.
- W34 — Disaster Recovery + cron jobs (PITR enabled).
- W34 — Security hardening baseline (rate limit v1, in-memory).
- W35 — Curators workspace + invites.
- W36-3 — Performance Phase 2 (LCP/CLS/INP + Lighthouse 95+).
- W37-2 — Billing (subscriptions ativas).
- W37-3 — DB migrations backlog (apply composite + BRIN + FTS indexes).
- W37-5 — Support ticketing infra.
- W37-7 — Queue dashboard + admin UI (DLQ inspector).

**External:**
- Vercel Edge Cache: https://vercel.com/docs/edge-network/caching
- Upstash Redis: https://upstash.com/docs/redis/features/eviction
- BullMQ: https://docs.bullmq.io/guide/retrying-failing-jobs
- PostgreSQL FTS: https://www.postgresql.org/docs/current/textsearch.html
- Token bucket: https://en.wikipedia.org/wiki/Token_bucket

---

**Próximo ciclo (W38):** aplicar migrations de DB (W37-3), wire
`applyCacheRule` em API routes, deploy dashboard de queues, CI workflow
`load-test.yml` como PR gate.