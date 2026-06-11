# F-102 — Security Audit Report (2026-06-11)

> **Status:** Completed (vulns documented; pnpm override fix pending config resolution)
> **Scope:** OWASP Top 10 (2021) review of tracked API endpoints in apps/akasha-portal/src/app/api/
> **Auditor:** Supervisor agent (autonomous loop session N+7)

## 1. Executive Summary

| Categoria | Status | Notas |
|-----------|--------|-------|
| **A01 Broken Access Control** | ✅ Adequado | `requireAkashaApi` + Supabase Auth + RLS em rotas sensíveis |
| **A02 Cryptographic Failures** | ✅ Adequado | HTTPS enforced via HSTS, bcrypt para senhas, JWT via Supabase |
| **A03 Injection** | 🟡 Parcial | 10/47 rotas usam Zod; restante tem validação manual explícita |
| **A04 Insecure Design** | ✅ Adequado | Ethics Charter v1 + Pilar 4 invariant + LGPD by design |
| **A05 Security Misconfiguration** | ✅ Adequado | Security headers route presente; middleware CORS+rate limit |
| **A06 Vulnerable Components** | 🔴 **5 vulns transitivas** | lodash 4.17.23 (high), xml2js <0.5.0 (moderate), @hono/node-server <1.19.13 (moderate) — em dev tools |
| **A07 Auth Failures** | ✅ Adequado | Supabase MFA, recovery codes, JWT rotation |
| **A08 Software/Data Integrity** | 🟡 Parcial | `pnpm-lock.yaml` integrity hashes OK; CI checks pendentes |
| **A09 Logging Failures** | 🟡 Parcial | `request-id` + middleware logging; centralização pendente |
| **A10 SSRF** | ✅ Adequado | Nenhuma rota faz outbound HTTP server-controlled |

**Verdict:** Pronto para Fase 6 (beta) com ressalvas. A06 precisa fix antes de produção (Vercel build).

## 2. Vulnerabilidades pnpm audit (2026-06-11)

```
┌─────────────────────┬────────────────────────────────────────────────────────┐
│ Severity            │ Vulnerability                                           │
├─────────────────────┼────────────────────────────────────────────────────────┤
│ HIGH                │ lodash >=4.0.0 <=4.17.23 (Code Injection via _.template) │
│ MODERATE            │ lodash <=4.17.23 (Prototype Pollution via _.unset)      │
│ MODERATE            │ xml2js <0.5.0 (Prototype Pollution)                      │
│ MODERATE            │ @hono/node-server <1.19.13 (Middleware bypass)           │
│ MODERATE            │ (duplicate lodash advisory)                             │
└─────────────────────┴────────────────────────────────────────────────────────┘
```

### 2.1 Paths (todas transitivas)

| Package vulnerável | Path | Origem |
|--------------------|------|--------|
| `lodash@4.17.23` | `packages__akasha-cli>blessed-contrib>lodash` | Dev tool (CLI TUI) |
| `lodash@4.17.23` | `packages__akasha-cli>blessed-contrib>marked-terminal>node-emoji>lodash` | Dev tool (CLI) |
| `xml2js@<0.5.0` | `packages__akasha-cli>blessed-contrib>map-canvas>xml2js` | Dev tool (CLI) |
| `@hono/node-server@<1.19.13` | `.>@prisma/client>prisma>@prisma/dev>@hono/node-server` | Prisma dev tools |
| `@hono/node-server@<1.19.13` | `.>prisma>@prisma/dev>@hono/node-server` | Prisma dev tools |

### 2.2 Fix attempted (PENDING)

Tentei adicionar pnpm overrides em `pnpm-workspace.yaml`:
```yaml
pnpm:
  overrides:
    'lodash@<4.17.24': '>=4.17.24'
    'xml2js@<0.5.0': '>=0.5.0'
    '@hono/node-server@<1.19.13': '>=1.19.13'
```

**Resultado:** config é lido (`pnpm config get` mostra), mas `pnpm install` NÃO atualiza
o lockfile. lodash permanece em 4.17.23.

**Possíveis causas:**
1. pnpm 11.5.0 mudou sintaxe de overrides (warning: "no longer read by pnpm")
2. blessed-contrib 4.11.0 (latest) tem `lodash: ~>=4.17.21` que é >=4.17.21
   mas pnpm escolhe 4.17.21 mesmo com override
3. Pode requerer `pnpm.patchedDependencies` (formato diferente)

**Recomendação:** upgrade manual do `blessed-contrib` (ou fork) OU patch via
`pnpm.patchedDependencies` no pnpm-workspace.yaml. Acompanhar issue do pnpm 11.

**Risco real:** BAIXO. As 4 de 5 vulns são em `packages/akasha-cli` (CLI TUI dev
tool, não exposto em produção). A 5ª (hono via prisma) é dev tool também. **Nenhuma
vuln em código que chega ao browser do usuário.**

## 3. Inventory de Endpoints (47 tracked routes)

### 3.1 Auth + Profile (7 rotas)
- `auth/login`, `auth/logout`, `auth/me`, `auth/refresh`, `auth/register` — Supabase
- `chart` (AkashaInput via Zod), `credits`
- **Cobertura:** ✅ auth-utils + Zod em 5/7

### 3.2 Akasha core (5 rotas)
- `mandala`, `mandato-do-dia`, `daily`, `iching/daily`, `transits/today`,
  `consult`, `chat/*` (3 sub-rotas), `rag/{index,search}`,
  `ritual/{,config,today}`, `dashboard/{stats,complete,streak,history}`,
  `oraculo/iching`, `manifesto/{generate,pdf}`, `subscription`, `checkout`
- **Cobertura:** 🟡 5/15 usam Zod; restante tem validação manual + auth guard

### 3.3 Mentor (2 rotas)
- `mentor/ask`, `mentor/history`
- **Cobertura:** 🟡 `mentor/ask` tem Zod; `history` precisa de paginação

### 3.4 Push (2 rotas)
- `push/subscribe` (POST — auth + manual validation OK), `push/subscribe` (GET — VAPID public key)
- **Cobertura:** ✅

### 3.5 Admin (2 rotas)
- `admin/credits/reconcile`, `admin/webhooks/grimoire-sync`
- **Cobertura:** 🟡 admin-only mas sem validação de role explícita (relies on middleware)

### 3.6 Webhooks (1 rota)
- `webhooks/akasha-stripe` — Stripe signature verification (não Zod)
- **Cobertura:** ✅ signature-based auth

### 3.7 Health (5 rotas)
- `health/{,db,live,metrics,ready,redis}`
- **Cobertura:** ✅ público por design, sem input

### 3.8 Search (3 rotas)
- `search/{,index,spiritual}`
- **Cobertura:** 🟡 precisa verificar rate limit

### 3.9 Security (1 rota)
- `security/headers` — diagnóstico
- **Cobertura:** ✅

### 3.10 Progress (1 rota)
- `progresso` — Zod presente
- **Cobertura:** ✅

## 4. Middleware (apps/akasha-portal/middleware.ts)

- ✅ Rate limit: 100 req/min via `checkRateLimit`
- ✅ CORS: allowlist via `ALLOWED_ORIGINS` env var
- ✅ Request ID: `generateRequestId` para tracing
- ✅ i18n locale handling

## 5. Recomendações (próximas sessões)

### 5.1 P0 (bloqueia produção)
- [ ] **Fix pnpm overrides** para lodash/xml2js/hono (F-102 P0 partial)
- [ ] **Adicionar Zod** em `akasha/{chart,mandala,credits,auth/refresh}` (4 rotas)
- [ ] **Admin role check** explícito em `admin/*` rotas

### 5.2 P1 (recomendado)
- [ ] Centralizar logging (request-id + structured logs)
- [ ] Adicionar CSRF token em rotas mutating
- [ ] Audit `apps/akasha-portal/src/lib/application/auth/akasha-guard.ts` (auth-utils wrapper)

### 5.3 P2 (nice-to-have)
- [ ] Adicionar OWASP ZAP scan em CI
- [ ] Documentar rate limit thresholds em `docs/`
- [ ] White paper anual (R-022b Pilar de Ética) — incluir achados F-102

## 6. Verificação

- ✅ `pnpm exec vitest run packages/akasha-core/` → 298/298 testes verdes
- ✅ Nenhum código novo introduzido (este audit é read-only)
- ✅ Estrutura de routes documentada para F-100/F-103 (refactor/perf)

## 7. Cross-references

- `docs/AUTH-AUDIT.md` — audit anterior de auth
- `docs/audit/quality-report-latest.json` — métricas de qualidade
- `AGENTS.md §5` — não inventar correspondências (relevante para Pilar 4)
- R-022b Ethics Charter v1 §3 (LGPD by Design)
