# Uptime Checks — Wave 11

> Configuração de monitoramento externo para o Akasha Portal.
> Stack: **UptimeRobot** (HTTP + keyword) como opção gratuita; **Cronitor** ou **BetterStack** para SLA mais sério.

---

## Por que

Wave 10 fechou CI budgets mas faltava **runtime monitoring** — saber se o app está de pé em produção, e ser alertado se não estiver. Wave 11 entrega `/api/health` (single source of truth) e este doc lista como configurar os checks externos.

---

## Endpoint canônico

| Path                        | Método | Auth | Latência típica |
| --------------------------- | ------ | ---- | --------------- |
| `https://akasha.app/api/health` | GET    | Nenhuma  | < 200ms |

### Response shape

```json
{
  "status": "ok" | "degraded",
  "timestamp": "2026-06-27T15:12:16.123Z",
  "version": "946b9011",
  "uptime": 86400,
  "checks": {
    "database": { "ok": true, "latencyMs": 12 },
    "openai":   { "ok": true, "latencyMs": 145 },
    "supabase": { "ok": true, "latencyMs": 67 },
    "posthog":  { "ok": true, "latencyMs": 89 }
  },
  "metrics": [ /* top 10 metric snapshots */ ]
}
```

- HTTP **200** → todos os checks críticos (db, openai) ok
- HTTP **503** → algum check crítico caiu; response body tem detalhes

### Keyword check (opcional)

UptimeRobot pode procurar uma string no body. Recomendamos checar `"status":"ok"` (substring) para validar saúde completa, não só HTTP 200.

---

## Lista de endpoints para monitorar

### Tier 1 — crítico (alert imediato)

| Endpoint                              | Frequência | Timeout | Keyword check     | Alert |
| ------------------------------------- | ---------- | ------- | ----------------- | ----- |
| `GET /api/health`                     | 5 min      | 30 s    | `"status":"ok"`   | SMS + Slack |
| `GET /` (landing)                     | 5 min      | 30 s    | `Akasha`          | Slack |
| `POST /api/akashic/chat` (smoke)      | 15 min     | 30 s    | —                 | Slack |

> **POST /api/akashic/chat** smoke test: payload mínimo `{ "message": "olá" }`, valida HTTP 200 + presença de campo `reply`. Requer rate-limit bypass em dev; em prod usa tráfego real orgânico.

### Tier 2 — degraded (alert agrupado)

| Endpoint                              | Frequência | Timeout | Alert |
| ------------------------------------- | ---------- | ------- | ----- |
| `GET /explore`                        | 10 min     | 30 s    | Slack |
| `GET /api/posts?limit=1`              | 10 min     | 30 s    | Slack |
| `GET /manifest.json` (PWA)            | 30 min     | 10 s    | Slack |
| `GET /sitemap.xml`                    | 1 h        | 30 s    | Email |

### Tier 3 — nice-to-have

| Endpoint                              | Frequência |
| ------------------------------------- | ---------- |
| `GET /robots.txt`                     | 24 h       |
| `GET /favicon.ico`                    | 24 h       |
| CDN origin (Supabase Storage bucket)  | 30 min     |

---

## Configuração recomendada

### UptimeRobot (free tier — 50 monitors)

1. **Add Monitor → HTTP(s)**
2. URL: `https://akasha.app/api/health`
3. Monitoring Interval: **5 minutes**
4. Timeout: **30 seconds**
5. HTTP Method: **GET**
6. Keyword Exists: **`"status":"ok"`**
7. Alert Contacts: Slack webhook + email

### Cronitor (pago — SLA + histórico)

```
{
  "name": "akasha-health",
  "schedule": "every 5 minutes",
  "request": {
    "url": "https://akasha.app/api/health",
    "method": "GET",
    "expect": { "status": 200, "body_matches": "\"status\":\"ok\"" }
  },
  "alerts": ["slack:#oncall", "pagerduty:akasha-prod"]
}
```

### BetterStack (alternativa moderna)

- Uptime checks: mesmo formato do UptimeRobot.
- Adiciona **status page pública** (`status.akasha.app`) consumindo o mesmo `/api/health`.
- Heartbeat-based checks: valida que o cron de notifications chegou (Wave 8).

---

## Política de alertas

### Down < 5 min → silencioso

Crítico só dispara após **2 falhas consecutivas** (= 10 min de down). Evita flapping em deploys.

### Down 5–30 min → Slack #oncall

```
🚨 [akasha] /api/health degraded
- database: ❌ timeout (2000ms)
- openai:   ✅ ok (145ms)
- supabase: ✅ ok
- posthog:  ✅ ok
Ação: checar Supabase dashboard → logs.
```

### Down > 30 min → PagerDuty / SMS

Acorda plantonista. Severity: SEV-2 (prod down, sem users impactados ainda).

### Down > 2 h → SEV-1

Status page vira "investigating". Post em #announcements.

---

## Self-test (smoke)

Antes de confiar no check, validar manualmente:

```bash
curl -i https://akasha.app/api/health | head -20
# Espera: HTTP/1.1 200 OK
# Body:    { "status": "ok", ... }
```

Em dev:

```bash
curl http://localhost:3000/api/health | jq .
```

---

## Métricas correlacionadas

Quando `/api/health` dispara alerta, cruzar com:

- **Vercel dashboard**: function invocations + errors (últimos 30 min)
- **Supabase**: connection pool + slow queries
- **PostHog**: tráfego ativo (se zerado → problema de auth, não de infra)
- **Sentry**: spike de exceptions?

---

## Histórico

- **Wave 11** (2026-06-27): setup inicial do `/api/health` + este runbook.

---

## Próximas waves

- **Wave 12**: webhook reverso do `/api/health` → status page pública.
- **Wave 13**: synthetic checks (Playwright k6-style) para fluxos críticos (signup → post → akashic chat).
- **Wave 14**: APM distribuído (OpenTelemetry) quando budget permitir.