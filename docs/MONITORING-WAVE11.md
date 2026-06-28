# Monitoring — Wave 11 Deliverable

> Status: ✅ Configs + componentes + endpoint + docs entregues. TSC limpo. Sem push (deliverable do wave, push fica pro gate final).

---

## TL;DR

Wave 11 fecha o runtime monitoring:

1. **Sentry** — error tracking com PII filtering (LGPD-safe).
2. **PostHog** — product analytics + event catalog + page view tracking.
3. **Web Vitals** — LCP/INP/CLS/FCP/TTFB via `PerformanceObserver` nativo.
4. **Custom metrics** — counter/gauge/histogram helpers in-memory + forward PostHog.
5. **`/api/health`** — single endpoint pra checks externos (DB, OpenAI, Supabase, PostHog).
6. **Runbook** — `docs/UPTIME-CHECKS.md` com lista de endpoints + alertas.

**Zero deps novas.** Tudo fetch-nativo, compatível com bundle atual.

---

## Arquivos criados

### Config (root)

- `sentry.client.config.ts` — bootstrap client-side (uncaught errors, beforeSend).
- `sentry.server.config.ts` — bootstrap server-side (uncaughtException, unhandledRejection).

### Lib

- `src/lib/monitoring/sentry.ts` — Envelope API wrapper + PII filtering + stack frame parser.
- `src/lib/monitoring/posthog.ts` — client singleton (queue + batch) + server capture + event catalog.
- `src/lib/monitoring/metrics.ts` — counter/gauge/histogram + Web Vitals + snapshot.

### Componentes

- `src/components/providers/PostHogProvider.tsx` — provider client-side com auto page-view tracking.

### API

- `src/app/api/health/route.ts` — health endpoint (parallel checks, HTTP 200/503).

### Modified

- `src/lib/logging.ts` — `sendToMonitoring()` agora integra com Sentry dinamicamente.
- `.env.example` — novas env vars (Sentry, PostHog sample rate, health flag).

### Docs

- `docs/UPTIME-CHECKS.md` — lista de endpoints + alertas.
- `docs/MONITORING-WAVE11.md` (este arquivo).

---

## Quick start

### 1. Instalar envs

```bash
# Sentry (erros)
SENTRY_DSN=https://<key>@o<org>.ingest.sentry.io/<project>
SENTRY_RELEASE=$(git rev-parse --short HEAD)  # opcional, default OK

# PostHog (analytics)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com  # ou self-hosted
POSTHOG_DISABLED=false
POSTHOG_SAMPLE_RATE=1.0

# Health
HEALTH_REQUIRE_ALL=false
```

### 2. Verificar local

```bash
pnpm dev

# Em outro terminal
curl http://localhost:3000/api/health | jq .
# Espera: { status: "ok", checks: { database: { ok: true, ... } }, ... }
```

Sem `SENTRY_DSN` ou `NEXT_PUBLIC_POSTHOG_KEY`, ambos ficam no-op silencioso (console.debug em dev).

### 3. Configurar uptime externo

Ver `docs/UPTIME-CHECKS.md` para UptimeRobot/Cronitor. Monitor 5min em `/api/health` com keyword `"status":"ok"`.

---

## API de uso

### Sentry

```typescript
import { captureException, captureMessage, setUser, withSentry } from "@/lib/monitoring/sentry";

// Auto-capture
captureException(new Error("DB falhou"), {
  tags: { route: "/api/posts" },
  extra: { postId: "abc-123" },
});

// Mensagens
captureMessage("Deploy succeeded", "info");

// User tracking
setUser({ id: user.id, username: user.handle });
// logout
setUser(null);

// Wrap handler
export const POST = withSentry(async (req) => {
  // ...
}, { routeName: "/api/akashic/chat" });
```

### PostHog

```typescript
import { events, track, captureServerEvent } from "@/lib/monitoring/posthog";

// Catalog semantic
events.postCreate(post.id, { community: "kabbalah" });
events.akashicChat(message.length, tradition);
events.pageView("/explore");

// Generic
track("custom_event", { foo: "bar" });

// Server-side
await captureServerEvent({ name: "webhook_received", properties: { source: "stripe" } });
```

### Metrics

```typescript
import { counter, gauge, histogram, timed, onWebVital } from "@/lib/monitoring/metrics";

counter("post_created_total");
gauge("active_users", 1234);
histogram("api_latency_ms", duration);
await timed("db_query", () => prisma.post.findMany());

// Web Vitals listener
onWebVital((vital) => {
  console.log(`${vital.name}: ${vital.value} (${vital.rating})`);
});
```

---

## Integração com código existente

### Logger ↔ Sentry

`src/lib/logging.ts` → `sendToMonitoring()` agora chama `sentry.captureException()` para erros/fatal. Sem precisar mudar call-sites.

```typescript
// Antes: logava no console apenas
logger.error("Falha ao criar post", err);

// Agora: loga no console + envia pro Sentry (se SENTRY_DSN setado).
```

### Layout ↔ PostHogProvider

`PostHogProvider` precisa ser adicionado ao `src/app/layout.tsx`. Ver checklist abaixo.

### Api routes ↔ `withLogging`/`withSentry`

Handlers existentes continuam usando `withLogging` (não breaking). Wave 12 vai adicionar helper `withApi` que combina os dois.

---

## PII filtering (LGPD)

Lista de chaves redacted em Sentry payloads:

```
email, password, pass, pwd, token, access_token, refresh_token,
authorization, cookie, set-cookie, session,
cpf, cnpj, phone, telefone, jwt, secret,
api_key, apikey, private_key, credit_card, card_number, cvv,
ssn, birthdate, data_nascimento
```

Recursivo em objects/arrays, até depth 5 (anti-circular).

Para adicionar chaves customizadas (ex: campos de formulario específicos do app):

```typescript
import { initSentry } from "@/lib/monitoring/sentry";

initSentry({
  beforeSend: (event) => {
    // Seu filtro aqui
    return event;
  },
});
```

---

## Source maps (Sentry)

Auto-upload via `@sentry/cli` em CI (NÃO instalado por default — `pnpm add -D @sentry/cli` quando quiser ativar).

```bash
# .github/workflows/deploy.yml
- name: Sentry source maps
  if: env.SENTRY_AUTH_TOKEN
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
  run: |
    npx @sentry/cli releases new $SENTRY_RELEASE
    npx @sentry/cli releases files $SENTRY_RELEASE upload-sourcemaps .next
    npx @sentry/cli releases finalize $SENTRY_RELEASE
```

`SENTRY_RELEASE` deve casar com `NEXT_PUBLIC_APP_VERSION` ou `VERCEL_GIT_COMMIT_SHA`.

---

## Verificação local

```bash
# 1. Type check
pnpm tsc --noEmit

# 2. Build
pnpm build  # (testa que sentry.*.config.ts nao quebram o bundle)

# 3. Health endpoint
pnpm dev &
sleep 5
curl http://localhost:3000/api/health | jq .

# 4. Vitest (sem regressao)
pnpm test:run
```

---

## Checklist de deploy

### Antes do merge pra main

- [ ] `pnpm tsc --noEmit` limpo
- [ ] `pnpm test:run` passa
- [ ] `docs/MONITORING-WAVE11.md` revisado
- [ ] `.env.example` atualizado (verificar vars novas)
- [ ] Commits conventional (`feat(monitoring): ...`)

### No deploy (Vercel/env vars)

- [ ] `SENTRY_DSN` setado
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` setado
- [ ] `NEXT_PUBLIC_POSTHOG_HOST` setado (ou default OK)
- [ ] `SENTRY_RELEASE` setado (auto via Vercel env)

### Pós-deploy (D+1)

- [ ] UptimeRobot monitor criado em `/api/health`
- [ ] Slack/PagerDuty alert configured
- [ ] Source maps uploaded (se DSN configurado)
- [ ] Smoke test: `curl https://akasha.app/api/health | jq .`

---

## Decisões e trade-offs

### Por que fetch-nativo e não SDKs oficiais?

| Razão                                  | Detalhe |
| --------------------------------------- | ------- |
| **Zero deps novas**                     | Wave 11 mandate. Bundle size preservado. |
| **Envelope API simples**                | Sentry Envelope = 1 endpoint, 1 JSON. |
| **PostHog /batch**                      | Mesmo padrão — 1 endpoint, JSON array. |
| **Mais controle de PII**                | Filtro é nosso, não delegado a SDK. |

**Trade-off**: perdemos sourcemaps auto-upload, advanced replay, performance tracing automático. Wave 14+ pode trazer SDK oficial se orçamento permitir.

### Por que `localStorage` + cookie dual pra PostHog ID?

- `localStorage` falha em SSR / sandboxed iframes.
- Cookie fallback garante identificação cross-tab.
- Anon-id persistente por 365 dias (LGPD-ok, não é PII).

### Por que `/api/health` paralelo (não sequencial)?

Latência total = max(database, openai, supabase, posthog) ≈ 200ms.
Sequencial seria 600ms+. Importante porque UptimeRobot faz polling frequente.

---

## Próximas waves

- **Wave 12**: status page pública (`status.akasha.app`) consumindo `/api/health`.
- **Wave 13**: synthetic checks (Playwright) para fluxos críticos.
- **Wave 14**: OpenTelemetry se budget permitir (APM distribuído real).
- **Wave 15**: alerta de anomalias (PostHog → Slack quando tráfego cai >50% em 1h).

---

## Histórico

| Wave  | Data       | Mudança                                    |
| ----- | ---------- | ------------------------------------------ |
| 11    | 2026-06-27 | Setup inicial (Sentry + PostHog + Web Vitals + Health) |

---

## Contato

Owner: Coder + Aki (Performance). Questions → `#monitoring` no Slack.