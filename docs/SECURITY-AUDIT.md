# Security Audit — Akasha Portal (2026-06-27)

> **Auditor:** Caio (AppSec Engineer) · **Branch auditada:** `feat/community-platform`
> **Escopo:** Auth flow, RLS/Prisma schema, secret management, LGPD compliance, rate limiting
> **Stack:** Next.js 16 + Supabase (Auth + Postgres + Storage) + Prisma + OpenAI/MiniMax
> **Severidades:** P0 (crítico/bloqueia release) · P1 (alto — agendar antes do GA) · P2 (médio/baixo)

---

## Sumário executivo

- **3 segredos hardcoded em produção** (`MiniMax API Token` em `src/lib/ai/minimax.ts`, `src/lib/ai/tradition-mapper.ts`, `src/lib/life-areas/life-areas-ai.ts`) — **P0 bloqueia merge imediato + rotação de chave**.
- **Zero Row-Level Security policies** no schema Prisma/migration: anon key do Supabase lê qualquer tabela community — **P0 antes de qualquer deploy público**.
- **Direito ao esquecimento (LGPD art. 18, VI) NÃO implementado** — `src/lib/privacy/data-deletion.ts` é stub com funções vazias. Combinado com ausência de `DATA-INVENTORY.md`, `PRIVACY-POLICY.md` e DPO designado, o projeto está **fora de conformidade LGPD** — **P0 jurídico**.
- **Logout quebrado**: `src/app/api/auth/logout/route.ts:6` deleta cookie `cabala_auth` que não existe — Supabase usa `sb-*-auth-token`. Usuário "loga out" mas sessão permanece válida — **P0**.
- **Auth flow tem bypass de credenciais demo hardcoded** em `src/app/api/auth/login-form/route.ts:21` (`demo@cabala.com` / `Demo123456`) — se rota for deployada em prod, qualquer um entra — **P0**.
- **CSP/HSTS não aplicados globalmente** — apenas na rota de debug `/api/security/headers`; `middleware.ts` define apenas 5 headers básicos — **P1**.
- **Rate limiter em memória** (`Map` global em `src/lib/rate-limit.ts`) — não escala em Vercel/serverless multi-instance; anula efetivamente a proteção — **P1**.
- Headers CORS caem em `*` por default quando `ALLOWED_ORIGINS` não está setada em prod — **P1**.

---

## Findings priorizados (P0/P1/P2)

| # | Sev | Área | File:Line | Issue | Recomendação |
|---|-----|------|-----------|-------|--------------|
| F1 | **P0** | secrets | `src/lib/ai/minimax.ts:7` | API token MiniMax hardcoded no source: `const MINIMAX_API_TOKEN = 'sk-cp-Kpz6_…'`. Token está em **3 arquivos** (incl. `tradition-mapper.ts:9`, `life-areas-ai.ts:11`). Commit history público expondo a chave. | (1) Rotacionar a chave MiniMax AGORA. (2) Remover literais; ler de `process.env.MINIMAX_API_TOKEN` com throw se ausente. (3) Adicionar pre-commit `gitleaks`/`trufflehog`. (4) Auditar logs/resend para uso não autorizado. |
| F2 | **P0** | auth | `src/app/api/auth/logout/route.ts:6` | Endpoint deleta cookie `cabala_auth` que **não é definido** em nenhum lugar do código. Supabase Auth usa cookies `sb-<project-ref>-auth-token`. Resultado: usuário "desloga" mas sessão Supabase permanece válida → token JWT continua válido até expirar. | Reescrever logout usando `supabase.auth.signOut()` server-side (igual `logoutAction` em `src/app/actions/auth.ts:206`). Idealmente, **remover a rota legacy** e usar só a server action. |
| F3 | **P0** | auth | `src/app/api/auth/login-form/route.ts:21` | Bypass de autenticação: `if (email === 'demo@cabala.com' && password === 'Demo123456') { return res.ok }`. Se essa rota for deployada em produção, qualquer um entra com credenciais públicas. | **Remover rota inteira** ou gatear com `process.env.NODE_ENV === 'development'` em wrap explícito + log de tentativas. |
| F4 | **P0** | rls | `prisma/migrations/*` (todas) | Nenhuma `CREATE POLICY` / `ENABLE ROW LEVEL SECURITY` encontrada em nenhuma das 2 migrations (`20260627_000000_pgvector_enable`, `20260627_000000_search_discovery`). Schema Prisma não tem campo para policies. Anon key do Supabase consegue SELECT em `posts`, `comments`, `spiritual_profiles`, `notifications`, `ai_messages` etc — **acesso cross-user irrestrito**. | (1) Criar migration `20260627_010000_rls_policies` habilitando RLS em todas as tabelas `posts`, `comments`, `likes`, `follows`, `notifications`, `ai_conversations`, `ai_messages`, `spiritual_profiles`, `bookmarks`, `journal_entries`, `group_members`, `group_invites`, `favoritos`. (2) Policies: SELECT quando `visibility=PUBLIC` OU `auth.uid() = userId/authorId/owner`; INSERT/UPDATE/DELETE apenas `auth.uid() = userId`. (3) Admin: usar service_role **apenas** server-side, nunca em query direta do browser. |
| F5 | **P0** | lgpd | `src/lib/privacy/data-deletion.ts` (inteiro) | **LGPD art. 18, VI — direito ao esquecimento NÃO implementado.** Todas as funções `deleteUserProfile`, `deleteAuthData`, `deletePreferences`, `deleteUserContent`, `deleteAnalyticsData`, `deleteNotifications`, `deleteSocialData` são stubs vazios com comentário `// Implementation: ...`. Sem endpoint `DELETE /api/user/account`. | (1) Implementar cascata real: `User.delete` já tem `onDelete: Cascade` em `MapaNatal`, `JournalEntry`, `Favorito`, mas falta para `SpiritualProfile`, `Post`, `Comment`, `Like`, `Follow`, `Notification`, `AiConversation`, `PushSubscription`, `UnsubscribeToken`. (2) Criar `DELETE /api/user/account` (autenticado) que (a) confirma com senha, (b) chama prisma cascade, (c) chama `supabase.auth.admin.deleteUser(uid)` via service_role, (d) loga evento audit. (3) Adicionar UI "Excluir minha conta" em `/settings/privacy`. |
| F6 | **P1** | headers | `middleware.ts:23-30` | Security headers incompletos: só 5 definidos (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`). **Faltam:** `Content-Security-Policy`, `Strict-Transport-Security`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Embedder-Policy`, `Cross-Origin-Resource-Policy`. CSP/HSTS existem apenas na rota debug `/api/security/headers/route.ts:80`. | Adicionar no `SECURITY_HEADERS` do `middleware.ts`:<br>`'Content-Security-Policy': "default-src 'self'; script-src 'self' 'nonce-{nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://api.openai.com https://api.minimax.chat; frame-ancestors 'none'"`<br>`'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'`<br>`'Cross-Origin-Opener-Policy': 'same-origin'`. |
| F7 | **P1** | rate-limit | `src/lib/rate-limit.ts:9-10` | Rate limit implementado com `Map<string, RateLimitEntry>` em memória do processo. Em deploy serverless (Vercel) ou multi-instance, cada instância tem seu próprio Map → limite efetivo é `100 req/min × N instâncias`. `setInterval` no top-level também não roda em Edge runtime. | Migrar para **Upstash Redis** (já listado em `.env.example` como `REDIS_URL`). Usar `@upstash/ratelimit` com sliding window. Adicionar limits específicos:<br>· `signup` 5/h por IP<br>· `login` 10/15min por IP+email<br>· `password-reset` 3/h por email<br>· `ai-chat` 60/dia por user<br>· `default` 100/min por IP (já existe). |
| F8 | **P1** | secrets | `middleware.ts:14` | `const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '*';` — fallback `'*'` em produção se env não setada. Combinado com `Access-Control-Allow-Methods: GET, POST, PUT, DELETE` e `Allow-Headers: Content-Type, Authorization`, expõe API a qualquer origem (CSRF em browsers modernos é mitigado por SameSite, mas credentials leakage em mobile webview ainda é risco). | Em produção, **throw** se `ALLOWED_ORIGINS` ausente. Manter `'*'` apenas em dev. Lista explícita de origens por ambiente (Vercel env vars separados). |
| F9 | **P1** | auth | `src/app/api/auth/register/route.ts:12-22` | `POST /api/auth/register` usa `supabase.auth.admin.createUser` com `SUPABASE_SERVICE_ROLE_KEY`. Endpoint público, sem rate-limit dedicado para signup (só middleware global 100/min). Atacante pode fazer enum de emails ("user already registered" → erro leak via registerAction mapeado em `actions/auth.ts:120`, ou aqui não mapeado → leak puro do Supabase). | (1) Adicionar rate-limit específico: 5 signups/h por IP, 3 signups/h por email. (2) **Desabilitar register via route legacy** e usar só `signupAction` em `src/app/actions/auth.ts:131` (que já está OK). (3) Ativar **email confirm obrigatório** (Supabase Auth settings) para evitar accounts zombie. |
| F10 | **P1** | lgpd | `src/app/api/waitlist/route.ts:107-117` | Persiste **IP + User-Agent** de quem entra na waitlist sem (a) base legal explícita documentada, (b) política de retenção, (c) consentimento granular. LGPD art. 7° exige finalidade + base legal + prazo. | (1) Documentar base legal (legítimo interesse art. 7°, IX + execução de contrato). (2) Adicionar TTL de 90 dias para IP/UA. (3) Mention em `/privacy`. (4) Criar job de purge diário. (5) Tornar IP opcional em um futuro opt-in. |
| F11 | **P1** | auth | `src/app/api/auth/status/route.ts:5-26` | Rota **debug** (`GET /api/auth/status`) exposta publicamente em produção. Retorna `userEmail` se houver sessão, lista de cookies e flag `cookieHeader`. Útil para dev mas facilita reconnaissance de atacante. | Gatear com `if (process.env.NODE_ENV === 'production') return new NextResponse(null, { status: 404 })`. Mesmo padrão para `/api/auth/create-test` (`src/app/api/auth/create-test/route.ts:12` cria conta com senha `Test123456` hardcoded). |
| F12 | **P2** | auth | `src/app/api/auth/login/route.ts:11-15` | Validação de input mínima (apenas `email` e `password` non-empty). Sem limite de tamanho, sem formato email validado. `JSON.parse` em try/catch largo. Não usa schema Zod compartilhado (`src/lib/validation/auth.ts`). | Reusar `loginSchema` do Zod (`src/lib/validation/auth.ts:31`) tanto em `/login` quanto em `/login-form`. Mesma garantia server-side que client-side. |
| F13 | **P2** | lgpd | `src/app/(info)/privacy/page.tsx:35-38` | Política de privacidade (UI) menciona LGPD genericamente mas não cita artigos, não menciona DPO, não explica base legal por coleta, não cita ANPD. Sem `docs/PRIVACY-POLICY.md` formal. Sem `docs/DATA-INVENTORY.md`. Sem DPO designado em `docs/`. | (1) Criar `docs/DATA-INVENTORY.md` listando campo a campo: nome, email, IP, data/hora/local nascimento, etc, com base legal por campo. (2) Criar `docs/PRIVACY-POLICY.md` formal (versão datada, regime de revisão). (3) Designar DPO com email público (mesmo que seja `dpo@cabaladoscaminhos.local` por enquanto). (4) Atualizar UI `/privacy` referenciando docs formais. |
| F14 | **P2** | secrets | `src/lib/ai/embeddings.ts:22-26` e `src/lib/ai/openai.ts:130` | `process.env.OPENAI_API_KEY` lido corretamente sem hardcoded, **mas** erro message vaza nome da env var em PT-BR (`'OPENAI_API_KEY nao configurada. Defina em .env.local.'`). Em prod, error messages assim viram reconnaissance ("qual stack você usa?"). | Logar erro com código interno (`E_OPENAI_KEY_MISSING`) e retornar mensagem genérica ao user (`'Serviço temporariamente indisponível.'`). Log detalhado só server-side, sem PII. |
| F15 | **P2** | rate-limit | `src/middleware/rateLimit.ts:36-39` | `extractIdentifier` lê `x-forwarded-for` direto sem validar formato. Em deploy atrás de proxy mal configurado, IP spoofable. Atacante pode randomizar header para burlar rate-limit. | Validar que `x-forwarded-for` vem de proxy confiável (Vercel seta automaticamente). Considerar também `cf-connecting-ip` (Cloudflare). Documentar configuração de trust proxy. |
| F16 | **P2** | lgpd | `src/app/actions/auth.ts:111-115` | `signupAction` chama `emailRedirectTo: buildRedirect('/onboarding')` — mas `buildRedirect` retorna `undefined` se `NEXT_PUBLIC_APP_URL` ausente. Supabase então usa default do projeto. Aceitável mas não-portável entre environments. | Setar `NEXT_PUBLIC_APP_URL` em todos os envs (`.env.example` já menciona). Adicionar assert em startup se ausente. |

---

## LGPD Checklist

- [ ] **Coleta mínima de dados** — coletamos `nomeCompleto`, `dataNascimento`, `horaNascimento?`, `localNascimento?`, `email`, `password`. **Hora e local são opcionais** (boa prática). Sem CPF, telefone, endereço. **OK parcial** — F13 recomenda documentar formalmente.
- [ ] **Consentimento explícito** — `signupSchema` em `src/lib/validation/auth.ts:46` exige `acceptTerms: z.literal(true)`. **OK** mas falta opt-in separado para comunicações transacionais/marketing. **Parcial.**
- [ ] **Direito ao esquecimento (DELETE)** — `src/lib/privacy/data-deletion.ts` é **stub não funcional**. Sem `DELETE /api/user/account`. **❌ NÃO IMPLEMENTADO** (ver F5, **P0**).
- [ ] **Portabilidade (export dados)** — existe `src/lib/profile/profile-export.ts` (JSON/CSV/TXT) e `src/lib/export/dashboard-json.ts` mas **não há endpoint** que exponha isso ao usuário (`GET /api/user/export`). **❌ Parcial.**
- [ ] **Encriptação at-rest** — gerenciado pelo Supabase (Postgres at-rest encryption padrão). **OK.**
- [ ] **Encriptação in-transit (HTTPS)** — forçado pelo Vercel + Cloudflare. Falta confirmar `Strict-Transport-Security` no `middleware.ts` (ver F6).
- [ ] **Logs de acesso (audit trail)** — `middleware.ts:31` gera `X-Request-Id`. Logs estruturados em `src/lib/logging.ts:122` removem `userId` e `userAgent` do `safeContext`. **OK parcial.** Falta audit trail específico para ações sensíveis (login, delete account, change email).
- [ ] **DPO designado** — **❌ Não há DPO designado.** Sem email `dpo@…`, sem menção em `/privacy`. Requisito LGPD art. 41 (depende do porte, mas prudente designar). Ver F13.

**Status LGPD:** 3/8 ✅ · 3 ⚠️ parcial · 2 ❌ bloqueia conformidade (F5 + DPO).

---

## Top 3 ações imediatas

### 1. Rotacionar e remover 3 API keys hardcoded (P0, ~30min)
```bash
# Em src/lib/ai/minimax.ts:7, src/lib/ai/tradition-mapper.ts:9, src/lib/life-areas/life-areas-ai.ts:11
# 1. Revogar chave no painel MiniMax
# 2. Gerar nova chave, setar em Vercel: vercel env add MINIMAX_API_TOKEN production
# 3. Substituir literal por: const MINIMAX_API_TOKEN = process.env.MINIMAX_API_TOKEN ?? (() => { throw new Error('E_MINIMAX_KEY_MISSING') })()
# 4. Adicionar .gitleaks.toml com regra pra sk-cp-* prefix
# 5. BFG/git-filter-repo para limpar history (comunicar ao time)
```
Referência: F1.

### 2. Implementar direito ao esquecimento + RLS (P0, ~6-8h)
- **RLS**: criar migration `20260627_010000_rls_policies` habilitando RLS + policies em todas as 12+ tabelas community (ver F4 spec). Testar com anon key + service_role key separada.
- **Delete account**: implementar `deleteData()` em `src/lib/privacy/data-deletion.ts` (substituir stubs). Criar `DELETE /api/user/account` em `src/app/api/user/account/route.ts` que requer re-autenticação (re-login ou password re-prompt). Adicionar UI em `/settings/privacy`.

### 3. Quebrar logout + remover login-form demo bypass (P0, ~1h)
- Deletar `src/app/api/auth/login-form/route.ts` (rota legacy com bypass).
- Reescrever `src/app/api/auth/logout/route.ts` para usar `supabase.auth.signOut()` server-side, ou deletar e usar só `logoutAction`.
- Adicionar CSP/HSTS no `middleware.ts` (ver F6).
- Gatear `/api/auth/status` e `/api/auth/create-test` para `NODE_ENV !== 'production'`.

---

## Próximos passos (não-bloqueantes, agendar)

- [ ] Migrar rate-limiter de `Map` in-memory para Upstash Redis (`@upstash/ratelimit`). Adicionar limits específicos para `signup`, `login`, `password-reset`, `ai-chat`.
- [ ] Criar `docs/DATA-INVENTORY.md` formal + `docs/PRIVACY-POLICY.md` versionado.
- [ ] Designar DPO + email público.
- [ ] Configurar pre-commit `gitleaks` para evitar novos hardcoded secrets.
- [ ] Adicionar `npm audit --audit-level=high` em CI (bloquear merge).
- [ ] Pentest manual em fluxos auth + delete account + mesa-real IA antes de release público.
- [ ] Logs PII: rodar auditoria mensal em `src/lib/logging.ts` e `src/lib/analytics/events.ts` (que tem `'password', 'token', 'auth_token', 'session_token'` em algum lugar — verificar se é blocklist correta).

---

**Auditor:** Caio · **Reviewed against:** OWASP Top 10 (2021), LGPD Lei 13.709/2018
**Próxima auditoria sugerida:** mensal ou antes de cada release que toque auth/data/payment.