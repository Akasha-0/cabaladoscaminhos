# SECURITY HARDENING — Wave 34 / 6.8.0

> **Status:** SHIPPED (commit W34)
> **Wave:** 34 (Security Hardening Cycle 6/8)
> **Author:** Coder + Caio (security)
> **LGPD:** Art. 6, 7, 9, 18, 37, 46
> **Frameworks:** OWASP Top 10 2023, ASVS V2.1 Level 2, NIST SP 800-63B
> **WCAG:** AA

---

## Sumário

1. [Threat model](#1-threat-model)
2. [Security headers + CSP](#2-security-headers--csp)
3. [Rate limiting v2 (token bucket)](#3-rate-limiting-v2-token-bucket)
4. [Auth hardening](#4-auth-hardening)
5. [SQL injection prevention](#5-sql-injection-prevention)
6. [XSS prevention](#6-xss-prevention)
7. [CSRF protection](#7-csrf-protection)
8. [IDOR prevention](#8-idor-prevention)
9. [Audit log (LGPD Art. 37)](#9-audit-log-lgpd-art-37)
10. [Pentest automated](#10-pentest-automated)
11. [Brute force / lockout](#11-brute-force--lockout)
12. [2FA TOTP (RFC 6238)](#12-2fa-totp-rfc-6238)
13. [Session lifecycle](#13-session-lifecycle)
14. [Transport / HSTS / Cross-Origin](#14-transport--hsts--cross-origin)
15. [Incident response plan](#15-incident-response-plan)
16. [Compliance mapping (LGPD + ASVS)](#16-compliance-mapping-lgpd--asvs)
17. [Operational runbook](#17-operational-runbook)
18. [Métricas e SLOs](#18-métricas-e-slos)
19. [Ferramentas externas](#19-ferramentas-externas)
20. [Roadmap Wave 35+](#20-roadmap-wave-35)
21. [Apêndice A — payload samples](#21-apêndice-a--payload-samples)
22. [Apêndice B — header reference](#22-apêndice-b--header-reference)
23. [Apêndice C — env vars obrigatórias](#23-apêndice-c--env-vars-obrigatórias)
24. [Apêndice D — checklists pré-deploy](#24-apêndice-d--checklists-pré-deploy)
25. [Glossário](#25-glossário)

---

## 1. Threat model

### Ativos protegidos
- **PII do titular**: nome, email, data nascimento, hora/local nascimento,
  perfil espiritual, conteúdo de posts/comentários (LGPD Art. 5).
- **Credenciais**: senhas, tokens de sessão, JWT Supabase, magic links.
- **Conteúdo**: artigos, ebooks, cursos, dashboards, áudios de meditação.
- **Pagamentos**: sessões Stripe, intents, refunds (PCI-DSS scope minimization).
- **Logs de auditoria**: trilha de quem acessou o quê (LGPD Art. 37).
- **Chaves de API**: OpenAI, Anthropic, Resend, Stripe (sigilo de segredos).

### Atacantes modelados
- **Botnet distribuído**: milhares de IPs abusando de /api/auth.
- **Account takeover via credential stuffing**: senhas vazadas em HIBP.
- **Cross-tenant data leak (IDOR)**: usuário autenticado A acessando recurso de B.
- **Insider threat**: admin com acesso a dados de todos os usuários.
- **Cross-site scripting**: payload em comentário que rouba cookie.
- **CSRF**: requisição cross-origin que dispara ação autenticada.
- **DoS por custo**: usuário autenticado disparando IA proxy em loop.
- **Man-in-the-middle** em Wi-Fi público (sem HTTPS, sem HSTS).

### Out of scope
- **Infra provedor** (Vercel/Supabase Postgres): responsabilidade deles.
- **Apps mobile nativos** quando publicados (a fazer Wave 36+).
- **Engenharia social contra admins** (mitigada por treinamento, não código).

---

## 2. Security headers + CSP

Aplicados em **toda resposta** (incluindo 4xx/5xx) pelo middleware raiz
`src/middleware.ts`, **exceto** `_next/*`, `favicon.ico`, `/api/health` e
`/api/webhooks/stripe` (que depende de injeção de headers próprios).

### CSP — Content-Security-Policy

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.supabase.co;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: blob: https:;
font-src 'self' data: https://fonts.gstatic.com;
connect-src 'self' https://api.openai.com https://api.anthropic.com
            https://api.stripe.com https://api.resend.com https://*.supabase.co
            wss://*.supabase.co ws: wss:;
media-src 'self' blob:;
frame-src https://js.stripe.com https://hooks.stripe.com;
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests;
```

### Justificativa de cada diretiva

| Diretiva              | Valor                                  | Risco mitigado                                              |
| --------------------- | -------------------------------------- | ----------------------------------------------------------- |
| `default-src 'self'`  | Whitelist mínima                       | Tudo fora do whitelist é bloqueado                          |
| `script-src`          | self + Stripe + Supabase               | XSS via script inline ou host externo não-allowlist         |
| `style-src`           | self + Google Fonts                    | CSS injection (ex: exfiltração via `background:url()`)      |
| `img-src`             | self + data + blob + https             | Imagem arbitrária externa (privacidade + payload SVG)       |
| `connect-src`         | self + APIs explicitamente + wss       | Exfiltração de dados via `fetch()` para host não-allowlist  |
| `media-src 'self'`    | blob para preview                      | Áudio/vídeo malicioso externo                               |
| `frame-src`           | Stripe only                            | Clickjacking via iframe                                    |
| `base-uri 'self'`     | Restringe `<base href>`                | Injeção de base que muda resolução de URLs relativas        |
| `form-action 'self'`  | Restringe submit externo               | Form CSRF para domínio arbitrário                           |
| `frame-ancestors 'none'` | Espelha X-Frame-Options: DENY       | Clickjacking (defesa redundante)                            |
| `upgrade-insecure-requests` | Força HTTP → HTTPS               | MITM em mixed content                                      |

### Headers fixos

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(self "https://js.stripe.com"), usb=(), magnetometer=(), gyroscope=(), accelerometer=()
X-Permitted-Cross-Domain-Policies: none
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Cross-Origin-Embedder-Policy: credentialless
```

### Análise quebra por header

| Header                      | OWASP / NIST                              | LGPD     |
| --------------------------- | ----------------------------------------- | -------- |
| `Strict-Transport-Security` | RFC 6797 — middleware mitiga MITM         | Art. 46  |
| `X-Frame-Options: DENY`     | OWASP A05 (Misconfiguration)              | Art. 46  |
| `X-Content-Type-Options: nosniff` | OWASP A05 — anti MIME sniffing       | Art. 46  |
| `Referrer-Policy`           | OWASP A01 — anti cross-origin leak        | Art. 46  |
| `Permissions-Policy`        | Privacy-by-default                        | Art. 7   |
| `COOP` / `CORP` / `COEP`    | Spectre side-channel                      | Art. 46  |

### Rotas com `X-Robots-Tag: noindex, nofollow`

Para evitar indexação de search engines em áreas internas:

- `/feed/*`, `/explore`, `/library`, `/notifications`
- `/post/*`, `/u/*`, `/groups`, `/onboarding`
- `/settings/*`, `/dashboard/*`, `/admin/*`

---

## 3. Rate limiting v2 (token bucket)

### Por que v2?

`src/lib/rate-limit.ts` (Wave 11) usa janela fixa — picos de tráfego
recuperam todos os limites simultaneamente, abrindo janela para burst
exatamente após `windowMs`. `src/lib/rate-limit-v2.ts` substitui por
**token bucket** + sliding refill.

### Algoritmo

```
state = { tokens, lastRefill, resetAt, strike }
on request:
  if now - lastRefill > 0:
    add = floor((now - lastRefill) / windowMs) * refillTokens
    tokens = min(burst, tokens + add)
  if tokens > 0:
    tokens -= 1
    allowed = true
  else:
    strike += 1
    allowed = false  # backoff exp via Retry-After: backoffSec * strike
  resetAt = now + windowMs
  return { allowed, remaining=tokens, limit=refillTokens, resetMs=resetAt-now, strike }
```

### Chave composta (defesa em camadas)

```
key = `${action}|ep:${endpoint}|u:${userId}|ip:${ip}`
```

- **action**: preset (auth, write, ai, read, payments, lgpd).
- **endpoint**: path normalizado (`/api/posts/[id]/like` → `posts.like`).
- **userId**: do JWT Supabase decodificado.
- **ip**: de `X-Forwarded-For` (primeiro hop) → `X-Real-IP` → `CF-Connecting-IP`.

### Presets adaptativos

| Categoria           | Burst | Refill | Janela  | Justificativa                              |
| ------------------- | ----- | ------ | ------- | ------------------------------------------ |
| `auth:login`        | 5     | 5      | 15 min  | Brute force está em 6-10 tentativas/15min  |
| `auth:signup`       | 3     | 3      | 1h      | Spam de contas                             |
| `auth:password-reset` | 1   | 1      | 1h      | Reset flood → email flood                  |
| `auth:2fa-verify`   | 5     | 5      | 15 min  | Brute force TOTP (10⁶ = viável em horas)   |
| `post:create`       | 10    | 10     | 1h      | Herdado de Wave 11 user-rate-limit         |
| `comment:create`    | 30    | 30     | 1h      | Herdado                                   |
| `like`              | 100   | 100    | 1h      | Herdado                                   |
| `follow`            | 50    | 50     | 1h      | Herdado                                   |
| `report`            | 5     | 5      | 24h     | Anti-abuse                                 |
| `ai:openai`         | 10    | 10     | 1h      | Custo em \$ vs \$0.01 por chamada          |
| `ai:anthropic`      | 10    | 10     | 1h      | Mesmo                                     |
| `read:feed`         | 200   | 200    | 1h      | Read-only, baixa prioridade               |
| `read:profile`      | 100   | 100    | 1h      | Read-only                                  |
| `read:search`       | 60    | 60     | 1h      | Caro em DB                                 |
| `payments:create-intent` | 10 | 10  | 1h      | Anti-fraude                                |
| `payments:refund`   | 5     | 5      | 1h      | Admin-only                                 |
| `lgpd:export`       | 1     | 1      | 24h     | LGPD Art. 18 — export em massa é raro     |
| `lgpd:delete`       | 1     | 1      | 24h     | LGPD Art. 18 — uma vez é suficiente        |

### Backend: Redis-ready, fallback in-memory

```
1. tenta getRedisClient() [ioredis]
   ├─ OK  → SET key state EX windowMs (atomic)
   └─ ERR → Map in-memory + setTimeout cleanup
2. próxima request lê do mesmo backend
```

Distributed-safe: 2 réplicas Next.js compartilham o mesmo bucket.

### Headers expostos

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 3475
Retry-After: 145 # apenas quando allowed=false
```

### Exempt
- `/api/health` (probes k8s + Vercel monitoring).
- `/api/webhooks/stripe` (IPs fixos; usa assinatura Stripe).

---

## 4. Auth hardening

### Senha (NIST SP 800-63B + OWASP ASVS V2.1.1)

Implementado em `src/lib/security/password.ts`.

| Regra                          | Valor  | Razão                                                |
| ------------------------------ | ------ | ---------------------------------------------------- |
| Comprimento mínimo             | 12     | NIST 2024 derruba max; 12 com bom charset = 50+ bits |
| Comprimento máximo             | 128    | bcrypt tem limite de 72; passado isso o resto é lixo |
| Entropia mínima                | 50 bits| ~14 chars random ASCII                              |
| Diversidade de charset         | ≥3/4   | minúsculas/Maiúsculas/números/símbolos               |
| Bloqueio de sequências         | sim    | abcd, 1234, qwerty                                   |
| Bloqueio de senhas comuns      | top-30 | Wave 35+: HIBP k-anonymity API                      |
| Senha = email local-part       | ✗      | Mitiga password reuse                               |
| Senha contém displayName       | ✗      | Mitiga targeted guess                              |
| All-same-char (aaaaaaaaaa)     | ✗      | Patente                                             |

### Sessão

Implementado em `src/lib/security/session.ts`.

| Política                      | Valor  | Origem                                |
| ----------------------------- | ------ | ------------------------------------- |
| Idle timeout                  | 30 min | NIST SP 800-63B AAL2                  |
| Absolute timeout              | 7 dias | Limite operacional; renova JWT        |
| Max concurrent sessions       | 3      | Web, mobile, tablet típico            |
| Lockout threshold             | 5      | OWASP A07                             |
| Lockout TTL                   | 15 min | Cresce se repetir                     |

### Stack de auth (status)

- **Magic link (Supabase Auth)**: produção. Senha nunca trafega em plain.
- **OAuth Google**: produção. Sem senha local.
- **2FA TOTP** (Wave 34 novo): opt-in por usuário. Não impede OAuth.
- **Recuperação de senha**: 1 req/hora/usuário.

---

## 5. SQL injection prevention

### Defesa primária

**Prisma** parametrização sistemática + Postgres prepared statements:
zero string concatenation em queries.

### Auditoria Wave 34

```
$ grep -rn "\$queryRawUnsafe\|\$executeRawUnsafe\|\`SELECT\|\`DELETE\|\`UPDATE" src/
→ 0 hits no código de aplicação
```

Rotas existentes usam Prisma model API. Nenhuma rota usa `prisma.$queryRawUnsafe`.

### Validação de input

Todos os entrypoints API passam por Zod (`.strict()` em Wave 26+).
Request body sem schema Zod é rejeitado em `lib/api.ts` middleware.

### Whitelist permitida em raw SQL

Para Wave 35+:
- `search.ts` (full-text search) pode usar Raw SQL com placeholders.
- Deve usar `$queryRaw\`... ${val} ...\`` (Prisma tagged template) que escapa.

---

## 6. XSS prevention

### Defesa primária

**React** escapa por default:
- `{variavel}` → texto (não HTML).
- `dangerouslySetInnerHTML` proíbe em Wave 35 ESLint rule custom.

### Auditoria Wave 34

```
$ grep -rn "dangerouslySetInnerHTML\|innerHTML=" src/app src/components
→ 0 hits críticos. Apenas sanitizadores (DOMPurify equivalentes) em 2 locais
  de preview de artigos, com allowlist de tags.
```

### CSP segunda linha (defesa em profundidade)

Mesmo se um payload XSS passar do React e do sanitizador, o CSP bloqueia
inline scripts não-allowlist e exfiltração de dados via `connect-src`.

### Pontos de atenção

- Comentários com markdown (`**bold**`) são renderizados server-side com
  sanitização antes de chegar ao HTML.
- Avatares usam URL whitelisted (não aceitam `javascript:`).

---

## 7. CSRF protection

### Camada 1 — SameSite cookies

Configurado em `src/lib/supabase/*` cookies:
- `sb-access-token`: `SameSite=Lax` (default Supabase)
- `sb-refresh-token`: `SameSite=Strict` (não pode vazar em cross-site)

### Camada 2 — Origin check no middleware

Para métodos `POST|PATCH|PUT|DELETE` em `/api/*` (exceto Stripe webhook):

```ts
const origin = request.headers.get('origin');
const host = request.headers.get('host');
if (origin && host) {
  const originUrl = new URL(origin);
  if (originUrl.host !== host) return 403;  // CSRF_BLOCKED
}
```

Header `Origin` é **forbidden to set** por código JS cross-origin (RFC 6454).
Atacante não consegue forjar. Same-site subdomain (`*.cabaladoscaminhos.com`)
é allowlist se necessário.

### Camada 3 — Token por sessão (HMAC)

Para mutações sensíveis (payout, delete account, change-email):

```ts
const token = generateCSRFToken('user-abc');
// header X-CSRF-Token: <token>
// verifyCSRFToken(token, 'user-abc') === true
```

Token tem TTL de 4h, replay-bloqueado por `hint=userId`.

---

## 8. IDOR prevention

### Defesa primária — Row-Level Security (Postgres)

Migrations Wave 11+ definem policies em todas as tabelas sensíveis:

```sql
-- Pseudo-policy exemplo
CREATE POLICY "post_select_own_or_public" ON "Post"
  FOR SELECT
  USING (authorId = auth.uid() OR visibility = 'public');
```

### Defesa secundária — assertOwnerOrAdmin

```ts
// src/lib/security/session.ts
export function assertOwnerOrAdmin(resource, viewer) {
  if (!resource || !viewer) throw new IDORError();
  if (viewer.role === 'ADMIN') return resource;
  if (resource.authorId !== viewer.id) throw new IDORError();
}
```

**Recurso inexistente ≠ erro 404**: `IDORError` retorna 403 com mensagem
genérica, **sem vazar** se existe ou não.

### Casos cobertos

- `Article.authorId`
- `Post.authorId`
- `Comment.authorId`
- `Payment.userId`
- `Reading.userId`

---

## 9. Audit log (LGPD Art. 37)

### Implementação existente (Wave 11)

`src/lib/audit/index.ts` provê:
- `logAudit(event)` — fail-soft; falha no log NUNCA quebra o request.
- Helpers semânticos: `audit.loginSuccess`, `audit.dataExport`,
  `audit.consentGranted`, etc.
- `purgeOldAuditLogs(config)` — retenção diferenciada.

### Retenção Wave 34

| Tipo de evento                               | Retenção | Razão                          |
| -------------------------------------------- | -------- | ------------------------------ |
| LOGIN_*, POST_*, COMMENT_*                   | 365 d    | Segurança operacional         |
| DATA_EXPORT_*, CONSENT_*, ADMIN_*, ACCOUNT_* | 730 d    | LGPD Art. 37 (mín 5 anos é alvo Wave 35+; 2y baseline conservador) |
| PASSWORD_RESET, MAGIC_LINK                   | 365 d    | Segurança operacional         |

### PII handling

- **IP cru**: nunca persistido. Apenas `ipHash = SHA256(salt:ip)[0..32]`.
  Salt = `AUDIT_IP_SALT` env var (obrigatório em produção).
- **User-Agent**: truncado a 256 chars.
- **Email/CPF/Token**: redacted antes de chegar ao DB (`[REDACTED]`).

### Actions gravadas (extract)

`AuditAction` enum cobre:
- LOGIN_SUCCESS, LOGIN_FAIL, LOGOUT
- DATA_EXPORT_REQUEST, DATA_EXPORT_DELIVERED, CONSENT_GRANTED, CONSENT_REVOKED
- PASSWORD_RESET_REQUEST, PASSWORD_RESET_SUCCESS
- ACCOUNT_DELETE_REQUEST, ACCOUNT_DELETE_CONFIRMED
- POST_CREATED, POST_DELETED, COMMENT_CREATED, COMMENT_DELETED
- ADMIN_USER_BAN, ADMIN_CONTENT_REMOVE

Wave 34 adiciona:
- 2FA_ENROLLED, 2FA_VERIFIED, 2FA_FAILED
- SESSION_EXPIRED_IDLE, SESSION_EXPIRED_ABSOLUTE

---

## 10. Pentest automated

`tests/security/pentest.test.ts` — 12 suítes / 80+ assertions.

### Suítes

| #  | Nome                              | OWASP                     | Casos    |
| -- | --------------------------------- | ------------------------- | -------- |
| 1  | SQL Injection payloads            | A03 (Injection)           | 9        |
| 2  | XSS prevention                    | A03                       | 7        |
| 3  | CSRF token HMAC                   | A01 (Broken Access Ctrl)  | 5        |
| 4  | Session expiry                    | A07 (Auth Failures)       | 4        |
| 5  | IDOR cross-user                   | A01                       | 5        |
| 6  | Rate limit v2                     | API4 (Resource Cons.)     | 6        |
| 7  | Password policy                   | A02 (Crypto Failures)     | 10       |
| 8  | Account lockout                   | A07                       | 3        |
| 9  | TOTP 2FA RFC 6238                 | A07                       | 7        |
| 10 | Security headers presence         | A05 (Misconfig)           | 7+       |
| 11 | Audit PII handling                | LGPD Art. 46              | 3        |
| 12 | Defense-in-depth invariants       | (cross-cutting)           | 4+       |

### Como rodar

```bash
npx vitest run tests/security/pentest.test.ts
```

### Limitação

Suíte é **estática** (valida invariants + payloads conhecidos). Pentest
real contra deployed app requer:
- Burp Suite Pro ou OWASP ZAP com autenticação Supabase.
- Manual walkthrough de fluxos críticos (signup → pagar → consumir curso).
- Third-party audit em Wave 36+.

---

## 11. Brute force / lockout

### Account lockout

```ts
recordFailedLogin(email, ip) → { count, lockedUntil, willLockNext }
isAccountLocked(email, ip) → { locked, until? }
clearFailedLogins(email, ip) // após sucesso
```

- Threshold: 5 falhas.
- TTL: 15 min (cresce exp via strike).
- Chave: `email|ip` (defesa contra lockout seletivo por usuário único).
- Backend: in-memory Wave 34; **TODO Wave 35**: Redis.

### Rate limit complement

`auth:login` rate-limit (5/15min) bloqueia mass-brute-force mesmo
com `fail-states` em memória zeroed por restart.

### UX

Resposta de lockout (HTTP 429):

```json
{
  "error": "ACCOUNT_LOCKED",
  "message": "Muitas tentativas. Tente novamente em ~15min.",
  "retryAfterSec": 900
}
```

Mensagem não revela se email é válido (anti-enumeração OWASP A07).

---

## 12. 2FA TOTP (RFC 6238)

Implementação pura-JS (`src/lib/security/session.ts`):

- **HMAC-SHA1** com counter de 30s.
- **6 dígitos**.
- **Drift de ±1 step** aceito (±30s).
- **Secret**: 160 bits (32 chars base32). Aleatoriedade via `crypto.randomBytes`.

### Como habilitar (UI fluxo)

1. User vai em `/settings/security`.
2. Clica "Ativar 2FA". Server chama `generateTOTPSecret()`.
3. Mostra QR code (`otpauthUrl`) + secret como fallback.
4. User escaneia com Google Authenticator / 1Password / Authy.
5. Pede código de 6 dígitos e verifica com `verifyTOTPCode(secret, code)`.
6. Persistir secret hasheado em `user.totpSecret` (nunca plaintext).

### Flags Wave 35

- Backup codes (10 codes single-use, hash-only no DB).
- Disable flow: pede senha atual + código 2FA.
- Audit: `2FA_ENROLLED`, `2FA_VERIFIED`, `2FA_FAILED`.

---

## 13. Session lifecycle

### Fluxos

```
SIGNUP (magic link)  ──────────────────────────► session A (7d)
   │   refresh 7d antes de expirar
   ├─► LOGIN (OAuth ou senha) ─────────────────► session B (7d)
   └─► PASSWORD RESET ─────────────────────────► rotacionar session

WORKING
   ├─► cada navegação: atualiza lastSeenAt
   ├─► 30min idle → SESSION_EXPIRED_IDLE → login
   └─► 7d absolute → SESSION_EXPIRED_ABSOLUTE → login

LOGOUT ────────────────────────────────────────► invalidate token
   └─► audit LOGOUT
```

### State storage (Wave 34)

- **PKCE flow Supabase** gerencia OAuth + magic link.
- **Consecutive sessions** = 3 max. Wave 35+ UI para revogar.

---

## 14. Transport / HSTS / Cross-Origin

### HSTS

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

- 1 ano (max recomendado sem re-emit frequente).
- `includeSubDomains` cobre `*.cabaladoscaminhos.com`.
- `preload` qualifica para envio ao Chrome preload list.

### Cross-Origin Isolation (COI)

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
Cross-Origin-Embedder-Policy: credentialless
```

- COOP + CORP + COEP isolam processo contra side-channel.
- `credentialless` no COEP permite cross-origin sem CORP (necessário para Stripe).

### Mixed content

CSP `upgrade-insecure-requests` força HTTP → HTTPS automaticamente.

### WebSocket

`wss://*.supabase.co` allowlisted em CSP `connect-src` para
Realtime (live feed, presence, broadcast).

---

## 15. Incident response plan

### Severidade

| Sev  | Critério                                              | SLA      |
| ---- | ----------------------------------------------------- | -------- |
| SEV1 | Vazamento confirmado de PII em massa; takeover admin  | 1h       |
| SEV2 | Exploração ativa de vulnerabilidade zero-day          | 4h       |
| SEV3 | Vulnerabilidade conhecida sem exploração              | 24h      |
| SEV4 | Hardening/melhoria                                    | Próximo wave |

### Fluxo

```
1. Detecção (audit log, rate limit spike, abuse report)
   │
2. Contenção (revoke tokens, block IPs, pause feature flag)
   │   └─► Caio (security lead) + Akasha (owner)
   │
3. Erradicação (patch, force-logout, rotate secrets)
   │
4. Recuperação (deploy, monitor por 7d)
   │
5. Post-mortem em ≤7d + auditoria externa se SEV1/SEV2
```

### Comunicação

- **LGPD Art. 48**: data breach deve ser comunicado à ANPD em **prazo
  razoável**. Para breach com risco ao titular, prazo = **2 dias úteis**.
- **Usuários afetados**: email direto (via Resend). Template em
  `lib/email/templates/security-incident.ts`.

### Forensics

- Manter logs de audit, rate-limit strikes, IPs hash por **90 dias** após
  evento para investigação.
- WORM storage (write-once-read-many) para audit em produção real.

---

## 16. Compliance mapping (LGPD + ASVS)

### LGPD

| Artigo | Requisito                            | Implementação W34        |
| ------ | ------------------------------------ | ------------------------ |
| Art. 6  | Finalidade + adequação               | `consent.ts` Wave 11     |
| Art. 7  | Consentimento                        | LGPD gates em /auth      |
| Art. 9  | Informação ao titular                | Privacy policy + UI      |
| Art. 18 | Direitos (acesso, correção, etc.)    | `/api/lgpd/*` rate-limit |
| Art. 37 | Registro de operações                | `audit.ts` Wave 11 + W34 |
| Art. 46 | Segurança técnica                    | Este doc + W34 hardening |
| Art. 48 | Comunicação de breach                | Incident plan §15        |

### OWASP ASVS V2.1 — Level 2 target

| Capítulo | Status | Notas                                |
| -------- | ------ | ------------------------------------ |
| V1 Architecture | ✅ | docs/, AGENTS.md                |
| V2 Authentication | ✅ | password, TOTP, lockout, session   |
| V3 Session Mgmt | ✅ | idle, abs, max-3, rotate           |
| V4 Access Ctrl | ✅ | RLS + assertOwnerOrAdmin          |
| V5 Validation | ✅ | Zod strict                         |
| V6 Cryptography | 🟡 | bcrypt Supabase + AWS KMS (W35+)    |
| V7 Error Handling | ✅ | Stack trace suppressed em prod     |
| V8 Data Protection | 🟡 | TLS forçado; backup (W35+)          |
| V9 Communication | ✅ | HTTPS only, cert pin (mobile W36+)  |
| V10 Malicious Code | ✅ | LGTM, Snyk                         |
| V11 Business Logic | 🟡 | abuse detection audit (W35+)       |
| V12 Files & Resources | ✅ | CSP, no upload execute             |
| V13 API & Web Service | ✅ | Rate limit, Origin check            |
| V14 Configuration | ✅ | env hygiene + audit                |

---

## 17. Operational runbook

### Pré-deploy (checklist)

- [ ] `next build` 0 erros (TSC, ESLint).
- [ ] `npm audit --production` sem `high|critical` abertas.
- [ ] CSP não quebrou Stripe Checkout em staging.
- [ ] CSP não quebrou Supabase Realtime em staging.
- [ ] Headers verificados via `securityheaders.com` (target A+).
- [ ] Pentest automated 100% verde.
- [ ] `AUDIT_IP_SALT` configurado em produção.
- [ ] `CSRF_SECRET` configurado em produção.
- [ ] `process.env.NODE_ENV === 'production'` para fail-loud.

### Pós-deploy (verificações)

- [ ] `curl -I https://cabaladoscaminhos.com` retorna 9 headers acima.
- [ ] Testar login Google flow em janela anônima.
- [ ] Testar Stripe Checkout end-to-end.
- [ ] Confirmar `/api/health` retorna 200 sem headers security (k8s probe).
- [ ] Audit log funcionando (1 evento de LOGIN_SUCCESS no DB após teste).

### Monitoramento

- Cloudflare/Vercel Analytics para spike de 401/403.
- Supabase Logflare queries:
  - `count() where status >= 400 path=/api/auth/* over 5m`
  - `count() where action='LOGIN_FAIL' over 1h`
- Sentry para 5xx com stack trace sanitize.

---

## 18. Métricas e SLOs

| Métrica                              | Target     | Alerta          |
| ------------------------------------ | ---------- | --------------- |
| Brute force tentativas bloqueadas/h  | ≥100       | <10 = auth off  |
| 2FA enrollment rate (compt/users)    | ≥5%        | <1% = conf UX   |
| Lockout events / dia                 | <50        | >200 = attack   |
| CSP violation report (relay) / dia   | <100       | >1000 = XSS ativo |
| Audit log PII leak                  | 0          | ≥1 = P0         |
| Password entropy mean (registro)     | ≥55 bits   | <40 = UX ruim   |
| Login latency p99                   | <300ms     | >500ms = DoS    |

---

## 19. Ferramentas externas

| Ferramenta          | Função                              | Custo    |
| ------------------- | ----------------------------------- | -------- |
| Cloudflare WAF      | Edge WAF + DDoS + rate limit global | Free tier|
| Vercel Analytics    | Performance + Web Vitals            | Free tier|
| Sentry              | Error monitoring + source maps off  | Free tier|
| Resend              | Email (transactional + abuse email) | Free tier|
| Supabase Logflare   | Query PG-native para logs + audit   | Free tier|
| HIBP k-anonymity    | Password breach check (W35+)        | Free API |
| Snyk                | Dep vulnerability                   | Free tier|
| OWASP ZAP           | Manual pentest (W36+)               | OSS      |

---

## 20. Roadmap Wave 35+

### Wave 35 (próximo sprint)

1. HIBP k-anonymity password check em `/auth/signup`.
2. Backup codes para 2FA.
3. Redis backend para rate-limit (substitui in-memory).
4. Audit retention → 5 anos (LGPD Art. 37).
5. CSP nonce-based (remove `unsafe-inline`).
6. Snyk + npm audit no CI.

### Wave 36

1. Mobile (React Native): cert pinning, secure storage (Keychain/Keystore).
2. WAF tuning: rule set Cloudflare gerenciado.
3. Pentest third-party manual.
4. SOC2 baseline de controles (se virar SaaS pago).

### Wave 37+

- Confidential Computing para inferência AI (modelagem on-device).
- Bug bounty program (HackerOne-tier mínimo $5k).
- BCP/DR runbook + game-day trimestral.

---

## 21. Apêndice A — payload samples

### SQL injection
```sql
' OR '1'='1
admin'; DROP TABLE users;--
1 UNION SELECT NULL, version()--
1' AND (SELECT COUNT(*) FROM users) > 0 --
'; EXEC xp_cmdshell('dir'); --
1 OR 1=1--
```

### XSS
```html
<script>alert(1)</script>
<img src=x onerror=alert(1)>
"><svg/onload=alert(1)>
javascript:alert(1)
<iframe src="javascript:alert(1)">
<body onload=alert(1)>
```

### IDOR
```http
GET /api/users/OTHER_USER_ID/profile
GET /api/posts/OTHER_POST_ID (se private)
PATCH /api/payments/OTHER_PAYMENT_INTENT_ID
```

### CSRF
```http
POST /api/payouts/create
Origin: https://attacker.com
Cookie: sb-access-token=<valid>
```

---

## 22. Apêndice B — header reference

Cada header com spec reference + exemplo:

| Header                              | RFC / Spec                        | Exemplo                                                 |
| ----------------------------------- | --------------------------------- | ------------------------------------------------------- |
| Content-Security-Policy             | W3C WG                             | `default-src 'self'; script-src 'self' https://js.stripe.com` |
| Strict-Transport-Security           | RFC 6797                          | `max-age=31536000; includeSubDomains; preload`          |
| X-Frame-Options                     | RFC 7034                          | `DENY`                                                  |
| X-Content-Type-Options              | IE/Chrome legacy                  | `nosniff`                                               |
| Referrer-Policy                     | W3C Draft                         | `strict-origin-when-cross-origin`                       |
| Permissions-Policy                  | W3C Draft                         | `camera=(), microphone=(), geolocation=()`              |
| X-Permitted-Cross-Domain-Policies   | Adobe legacy                      | `none`                                                  |
| Cross-Origin-Opener-Policy          | W3C                               | `same-origin`                                           |
| Cross-Origin-Resource-Policy        | W3C Fetch                         | `same-origin`                                           |
| Cross-Origin-Embedder-Policy        | W3C                               | `credentialless`                                        |
| X-Robots-Tag                        | RFC 9309 + Google                 | `noindex, nofollow, noarchive`                          |
| X-RateLimit-Limit                   | RFC 6585 (Retry-After companion)   | `10`                                                    |
| X-RateLimit-Remaining               | IETF draft                        | `3`                                                     |
| X-RateLimit-Reset                   | IETF draft                        | `3475`                                                  |
| Retry-After                         | RFC 9110                          | `145`                                                   |

---

## 23. Apêndice C — env vars obrigatórias

```bash
# Segurança — todas obrigatórias em produção
NODE_ENV=production
AUDIT_IP_SALT=<64 hex chars>           # hash de IP nos audit logs
CSRF_SECRET=<64 hex chars>             # HMAC key dos tokens CSRF

# Stripe webhook
STRIPE_WEBHOOK_SECRET=whsec_<...>      # assinatura (NÃO trocar)

# Stack existente
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=postgresql://...
REDIS_URL=redis://...                  # Wave 35 rate-limit distributed
JWT_SECRET=<32+ chars>
RESEND_API_KEY=re_<...>
OPENAI_API_KEY=sk-<...>
ANTHROPIC_API_KEY=sk-ant-<...>
```

### Checks em boot

`src/lib/env.ts` valida no boot (fail-loud):
- Cada var definida se `NODE_ENV=production`.
- Tamanho mínimo para secrets (≥32 chars ou padrão hex).
- Não permitir `dev-salt-not-for-prod` em prod.

---

## 24. Apêndice D — checklists pré-deploy

### Por área

**Headers (CSP + 7)**
- [ ] `npm run build && npm start` local
- [ ] `curl -I http://localhost:3000/api/health` (sem headers — esperado)
- [ ] `curl -I http://localhost:3000/api/auth/login` (com todos headers)
- [ ] Stripe iframe em `/checkout` carrega OK
- [ ] Supabase Realtime WebSocket conecta
- [ ] Google Fonts stylesheet carrega

**Rate limit v2**
- [ ] Login 6× rapidamente → 6ª retorna 429
- [ ] Aguardar 15min → reset (em dev com janela curta)
- [ ] Preset `auth:password-reset` = 1 req/h (verificar headers)

**Senha**
- [ ] `validatePassword('password')` → false
- [ ] `validatePassword('MariaSenha12!')` → false (contém nome)
- [ ] `validatePassword('Y0lo-$#€@_LongPhrase99')` → true

**Sessão**
- [ ] Esperar 31min com sessão aberta → exige re-login
- [ ] 8 dias após login → exige re-login
- [ ] Login em 4 dispositivos → 4º dispositivo falha

**TOTP**
- [ ] `generateTOTPSecret().secret` = 32 chars base32
- [ ] Google Authenticator lê QR
- [ ] `verifyTOTPCode(secret, "000000")` = false
- [ ] `verifyTOTPCode(secret, code_now)` = true

**CSRF**
- [ ] `POST /api/payouts` com `Origin: https://attacker.com` → 403
- [ ] `POST /api/payouts` com mesmo host origin → OK
- [ ] `verifyCSRFToken(tampered)` = false

**Audit log**
- [ ] LOGIN_SUCCESS gera row no DB com `actorId`, `ipHash`
- [ ] Campo `metadata.password` = undefined (redacted)
- [ ] `purgeOldAuditLogs` retorna count > 0 após 365 dias (em test)

**Pentest**
- [ ] `npm test -- tests/security` passa 100%

---

## 25. Glossário

| Termo             | Definição                                                            |
| ----------------- | -------------------------------------------------------------------- |
| ASVS              | OWASP Application Security Verification Standard                     |
| BCP               | Business Continuity Plan                                             |
| COI               | Cross-Origin Isolation (COOP + CORP + COEP)                          |
| CSP               | Content-Security-Policy                                              |
| DR                | Disaster Recovery                                                    |
| HIBP              | Have I Been Pwned (haveibeenpwned.com)                               |
| HSTS              | HTTP Strict Transport Security                                        |
| IDOR              | Insecure Direct Object Reference                                     |
| MFA / 2FA         | Multi-Factor / Two-Factor Authentication                              |
| NIST 800-63B      | NIST Digital Identity Guidelines — Authentication                     |
| OWASP             | Open Web Application Security Project                                |
| PCI-DSS           | Payment Card Industry DSS                                            |
| RLS               | Row-Level Security (Postgres)                                        |
| SLO               | Service Level Objective                                              |
| TOTP              | Time-based One-Time Password (RFC 6238)                              |
| WORM              | Write-Once-Read-Many (audit storage)                                 |

---

_Wave 34 — Segurança. Cada header, cada teste, cada lock — para o
titular confiar e dormir em paz._
