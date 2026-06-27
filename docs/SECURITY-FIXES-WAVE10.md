# Security Fixes — Wave 10 (2026-06-27)

> **Agente:** Caio (AppSec Engineer) · **Audit origem:** `docs/SECURITY-AUDIT.md`
> **Branch:** `main` · **Duração:** ~22 min · **Status global:** 🟢 **5 done + 1 partial · 0 blocked**
>
> Esta wave implementou as **top 6 correções** priorizadas pelo critério "maior impacto + menor risco de regressão", cobrindo **P0 de segredos, P0 de auth bypass, P1 de security headers, P1 de CORS e P1 de info disclosure**.

---

## Sumário executivo

| # | Finding | Sev | Status | Arquivos tocados | Tempo |
|---|---------|-----|--------|------------------|-------|
| 1 | **F1** — Hardcoded MiniMax API token | **P0** | ✅ **DONE** | `src/lib/ai/minimax.ts` | ~3 min |
| 2 | **F3** — Login-form demo bypass público | **P0** | ✅ **DONE** | `src/app/api/auth/login-form/route.ts` | ~3 min |
| 3 | **F2** — Logout broken (cookie inexistente) | **P0** | ✅ **DONE** | `src/app/api/auth/logout/route.ts` | ~5 min |
| 4 | **F11** — Debug auth routes expostas em prod | **P1** | ✅ **DONE** | `src/app/api/auth/status/route.ts`, `src/app/api/auth/create-test/route.ts` | ~3 min |
| 5 | **F8** — CORS ALLOWED_ORIGINS = '*' em prod | **P1** | ✅ **DONE** | `middleware.ts` | ~2 min |
| 6 | **F6** — HSTS/COOP/CORP headers ausentes | **P1** | ✅ **DONE** (parcial — sem CSP nonce) | `middleware.ts` | ~2 min |
| 7 | Tests para os fixes acima | — | ⚠️ **SKIPPED** (vitest Bus error no sandbox) | `tests/api/auth-security-fixes.test.ts` | — |

**Resumão:** 6/7 entregues. Cobertura **100% dos P0 da wave** + 3 P1 de alto impacto. Os 2 P0 restantes do audit (F4 RLS, F5 LGPD delete-account) ficaram fora do budget de 25min desta wave — ambos requerem migration nova + Prisma cascade + endpoint novo (estimativa 6-8h cada).

---

## Detalhamento por fix

### ✅ Fix 1 — F1: Remover hardcoded MiniMax API token (P0)

**Arquivo:** `src/lib/ai/minimax.ts`

**Antes:**
```typescript
const MINIMAX_API_TOKEN = 'sk-cp-Kpz6_rV0uxSFKNFwhXXsj1ZNE_sd7_nSHd_KBOGPvjZ2l00J8tvlE8lA7gDwyuI-vUm_xxX66bALC4952KyRulzaosepLhGmkuIvIGU2OVmHESpWTUR0GGQ';
// ... usado em 2 lugares:
Authorization: `Bearer ${MINIMAX_API_TOKEN}`,
```

**Depois:**
```typescript
function getMinimaxApiToken(): string {
  const token = process.env.MINIMAX_API_TOKEN;
  if (!token || token.length === 0) {
    throw new MinimaxError(
      'MINIMAX_API_TOKEN não configurada. Defina em .env.local ou Vercel env vars.',
      500,
      'E_MINIMAX_KEY_MISSING'
    );
  }
  return token;
}
// ... chamado em ambos os endpoints:
Authorization: `Bearer ${getMinimaxApiToken()}`,
```

**Diff resumido:**
- ✅ Literal hardcoded removido do source (3 ocorrências em 1 arquivo — `tradition-mapper.ts` e `life-areas-ai.ts` citados no audit não existem neste repo)
- ✅ Função `getMinimaxApiToken()` faz fail-closed throw se env ausente
- ✅ Mantém tipagem forte (retorna `string`, não `string | undefined`)

**Como validar:**
```bash
# 1. Verificar que token não está mais hardcoded
cd /workspace/cabaladoscaminhos && grep -rn "sk-cp-Kpz6" src/ && echo "FAIL: token vazou" || echo "PASS: token removido"

# 2. Verificar throw em runtime
MINIMAX_API_TOKEN= npx tsx -e "
  import('./src/lib/ai/minimax.ts').then(async m => {
    try { await m.generateMinimaxResponse([{role:'user',content:'hi'}]); }
    catch (e) { console.log('OK — throw:', e.code, e.message); }
  })
"

# 3. Confirmar que token antigo DEVE ser revogado no painel MiniMax
#    (assumi-se comprometido desde o primeiro commit — git history público)
```

**⚠️ AÇÃO DO OWNER (obrigatória antes do próximo deploy):**
1. Revogar a chave antiga no painel MiniMax
2. Gerar nova chave, setar em Vercel env vars (`vercel env add MINIMAX_API_TOKEN production`)
3. (Opcional) `git filter-repo` ou `bfg` para limpar history — o git-filter-repo não é trivial de fazer depois, consultar o time antes
4. Adicionar `.gitleaks.toml` com regra para prefixo `sk-cp-` em pre-commit

---

### ✅ Fix 2 — F3: Login-form demo bypass gated (P0)

**Arquivo:** `src/app/api/auth/login-form/route.ts`

**Antes:**
```typescript
export async function POST(request: Request) {
  try {
    // ... leitura de form data ...
    if (email === 'demo@cabala.com' && password === 'Demo123456') {
      // ⚠️ BYPASS — qualquer um entra se essa rota for deployada em prod
      cookieStore.set('cabala_auth', JSON.stringify({...}), {...});
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    // ... fallback Supabase ...
  }
}
```

**Depois:**
```typescript
function isDevEnvironment(): boolean {
  return process.env.NODE_ENV === 'development';
}

export async function POST(request: Request) {
  // ⚠️ SECURITY (wave 10, F3): fail-closed em prod
  if (!isDevEnvironment()) {
    return new NextResponse('Not Found', { status: 404 });
  }
  // ... resto inalterado ...
}
```

**Por que NÃO deletar a rota inteira:**
- Deletar quebraria o flow de dev local (que usa esse bypass para testes rápidos)
- Gating com `NODE_ENV === 'development'` é fail-closed + preserva conveniência de dev
- Reduz risco de regressão no flow local

**Como validar:**
```bash
# 1. Confirmar que bypass está gated
NODE_ENV=production curl -i -X POST http://localhost:3000/api/auth/login-form \
  -F "email=demo@cabala.com" -F "password=Demo123456"
# Esperado: HTTP/1.1 404 Not Found

# 2. Confirmar que dev ainda funciona
NODE_ENV=development curl -i -X POST http://localhost:3000/api/auth/login-form \
  -F "email=demo@cabala.com" -F "password=Demo123456"
# Esperado: HTTP/1.1 307 Temporary Redirect → /dashboard
```

**Decisão documentada:** rota legada fica para dev, mas se o time preferir, podemos deletar em uma próxima wave sem regressão visível. Owner decide.

---

### ✅ Fix 3 — F2: Logout real via Supabase signOut (P0)

**Arquivo:** `src/app/api/auth/logout/route.ts`

**Antes (BROKEN):**
```typescript
export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('cabala_auth')  // ⚠️ cookie que NÃO existe em lugar nenhum
  
  return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_BASE_URL || 'http://127.0.0.1:3000'))
}
```

**Depois (FIXED):**
```typescript
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.redirect(new URL('/login', request.url), { status: 303 });
    }
    const { error } = await supabase.auth.signOut();  // ✅ invalida sessão no Supabase + limpa cookies sb-*-auth-token
    if (error) {
      // F14: não vaza mensagem detalhada do Supabase
      if (process.env.NODE_ENV !== 'production') console.error('[auth/logout]', error);
      return NextResponse.redirect(new URL('/login?error=logout', request.url), { status: 303 });
    }
    return NextResponse.redirect(new URL('/login', request.url), { status: 303 });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('[auth/logout]', err);
    return NextResponse.redirect(new URL('/login', request.url), { status: 303 });
  }
}
```

**Como validar:**
```bash
# 1. Logout via browser dev tools → confirmar que cookies sb-*-auth-token foram deletados
#    (Application > Cookies > domínio > após click em "Sair")

# 2. Tentar usar token antigo após logout → esperado: 401
TOKEN_ANTIGO=$(curl -s -c /tmp/cookies.txt http://localhost:3000/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"valid@test.com","password":"valid123"}' \
  -i | grep -i "sb-.*-auth-token" | awk '{print $NF}')

curl -i -X POST http://localhost:3000/api/auth/logout \
  --cookie "sb-xxx-auth-token=${TOKEN_ANTIGO}"

# Tentar usar token:
curl -i http://localhost:3000/api/auth/status --cookie "sb-xxx-auth-token=${TOKEN_ANTIGO}"
# Esperado em prod: 404 (rota debug também foi gateada)
```

---

### ✅ Fix 4 — F11: Debug auth routes gated (P1)

**Arquivos:**
- `src/app/api/auth/status/route.ts`
- `src/app/api/auth/create-test/route.ts`

**Mudança:** ambos retornam `404 Not Found` quando `NODE_ENV !== 'development'`. Em dev, comportamento inalterado.

**Antes (info disclosure):**
```typescript
// /api/auth/status
return NextResponse.json({
  cookies: allCookies.map(c => c.name),     // ⚠️ lista de cookies
  hasSession: !!session,                     // ⚠️ confirma presença de sessão
  userEmail: session?.user?.email || null,   // ⚠️ PII leak
  cookieHeader: ...                          // ⚠️ reconnaissance
})
```

**Depois (gated):**
```typescript
function isDevEnvironment(): boolean {
  return process.env.NODE_ENV === 'development';
}

export async function GET() {
  if (!isDevEnvironment()) {
    return new NextResponse('Not Found', { status: 404 });
  }
  // ... resto inalterado ...
}
```

**Como validar:**
```bash
# Em prod:
curl -i http://api.cabaladoscaminhos.com/api/auth/status
# Esperado: HTTP/1.1 404 Not Found

curl -i -X POST http://api.cabaladoscaminhos.com/api/auth/create-test
# Esperado: HTTP/1.1 404 Not Found
```

**Decisão:** criei `createAdminClient()` import do `@/lib/supabase/server` em vez de `createClient()` direto do `@supabase/supabase-js`. Mais limpo e respeita o pattern já estabelecido no repo.

---

### ✅ Fix 5 — F8: CORS ALLOWED_ORIGINS fail-closed em prod (P1)

**Arquivo:** `middleware.ts`

**Antes:**
```typescript
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '*';  // ⚠️ fallback aberto em prod
```

**Depois:**
```typescript
function resolveAllowedOrigins(): string {
  const envValue = process.env.ALLOWED_ORIGINS;
  if (envValue && envValue.length > 0) return envValue;

  if (process.env.NODE_ENV === 'production') {
    // Fail-closed: log warning + retorna 'same-origin' (não totalmente fechado
    // pois precisamos servir a UI, mas o CORS efetivo só permite o próprio origin).
    console.warn('[middleware] ALLOWED_ORIGINS ausente em produção. Fallback restritivo.');
    return 'same-origin';
  }
  return '*';  // dev/preview: aceita tudo (UX local)
}
```

**Trade-off documentado:**
- ❌ **Throw** no boot quebraria o deploy inteiro (Vercel Edge runtime). Optei por `console.warn` + fallback `'same-origin'`.
- ⚠️ O ideal é setar `ALLOWED_ORIGINS` no painel Vercel antes do deploy. Owner precisa garantir.
- ✅ Em dev, fallback `'*'` continua funcionando para Postman/Insomnia/etc.

---

### ✅ Fix 6 — F6: HSTS + COOP + CORP headers (P1, **parcial**)

**Arquivo:** `middleware.ts`

**Antes (5 headers):**
```typescript
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};
```

**Depois (8 headers):**
```typescript
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  // Novos:
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',  // 2 anos + subdomínios + preload list
  'Cross-Origin-Opener-Policy': 'same-origin',                                    // Spectre mitigation
  'Cross-Origin-Resource-Policy': 'same-origin',                                   // CORP same-origin
};
```

**⚠️ CSP NÃO foi adicionado nesta wave:**
- Implementar CSP completo exigiria **nonce generation por request** (Vercel Edge runtime + `crypto.randomUUID()` + propagação via `<Script nonce={...}>` em cada componente)
- Estimativa: 4-6h de trabalho + testes em todas as rotas
- Recomendado para wave 11 com QA dedicado testando regressões em todas as páginas

**Como validar:**
```bash
# 1. Verificar headers em prod (após deploy)
curl -I https://cabaladoscaminhos.com
# Esperado: ver Strict-Transport-Security, Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy

# 2. Validar via observatory.mozilla.org
# https://observatory.mozilla.org/analyze/cabaladoscaminhos.com
# Esperado: nota B+ ou melhor
```

---

### ⚠️ Fix 7 — Tests (SKIPPED por limitação de sandbox)

**Arquivo:** `tests/api/auth-security-fixes.test.ts`

**Status:** SKIPPED — vitest crasha com "Bus error" no sandbox atual.

**Comando tentado:**
```bash
cd /workspace/cabaladoscaminhos && npx vitest run tests/api/auth-security-fixes.test.ts
# Output: Bus error (sandbox issue, não bug do código)
```

**Confirmação de que NÃO é bug do código:**
- ESLint também crasha com erro de `hermes-parser` module missing (dependência nativa ausente)
- Erro idêntico em `tests/api/health.test.ts` (arquivo pré-existente) → problema de ambiente, não do nosso fix
- Todos os arquivos foram criados e são **inspecionáveis** via Read tool (caminhos absolutos abaixo)

**Tests escritos (348 linhas, 14 assertions):**
- 3 testes para `/api/auth/logout` (F2) — signOut chamado, redirect correto, sandbox fallback
- 3 testes para `/api/auth/login-form` (F3) — 404 em prod, 404 em test, dev OK
- 3 testes para `/api/auth/status` (F11) — 404 em prod, 404 em test, dev retorna sessão
- 2 testes para `/api/auth/create-test` (F11) — 404 em prod, dev cria user
- 3 testes para MiniMax token (F1) — throw sem env, throw com empty, success com env válido

**Como o time valida localmente:**
```bash
# No ambiente local (não-sandbox):
cd /workspace/cabaladoscaminhos && npx vitest run tests/api/auth-security-fixes.test.ts
# Esperado: 14 passed
```

**Caminho do test file (inspecionável):**
`/workspace/cabaladoscaminhos/tests/api/auth-security-fixes.test.ts`

---

## Mudanças não-aplicadas (escopo da wave seguinte)

| Finding | Sev | Motivo | Estimativa próxima wave |
|---------|-----|--------|--------------------------|
| F4 — RLS policies em 12+ tabelas | P0 | Requer migration Prisma nova + testes com anon/service_role separados. **Bloqueia deploy público.** | 4-6h (wave 11) |
| F5 — LGPD delete-account endpoint | P0 | Implementar cascata Prisma + endpoint `DELETE /api/user/account` + UI `/settings/privacy` + DPO email | 6-8h (wave 12) |
| F6 (parte) — CSP com nonces | P1 | Exige refator de `next.config.ts` + propagação de nonces via middleware + todos os componentes que usam `<Script>` | 4-6h (wave 11) |
| F7 — Rate limiter migrar p/ Upstash Redis | P1 | Requer mudança de infra (Redis na Vercel KV ou Upstash) | 3-4h (wave 13) |
| F10 — Waitlist IP retention TTL | P1 | Requer job de purge + migration + policy update | 2h (wave 13) |
| F13 — `docs/DATA-INVENTORY.md` + `PRIVACY-POLICY.md` + DPO | P2 | Documentação jurídica — melhor feito por owner com revisão legal | 2-3h |

---

## Recomendações para o próximo ciclo (wave 11)

1. **P0 imediato:** RLS policies (F4) — sem isso, anon key do Supabase lê qualquer tabela community. Pode deployar agora e expor dados de TODOS os usuários.
2. **P0 jurídico:** LGPD delete-account (F5) — sem isso, o projeto está fora de conformidade.
3. **P1 segurança:** CSP completo com nonces (F6 parte 2).
4. **Infra:** Migrar rate-limiter para Upstash Redis (F7) — em serverless multi-instance, o limiter em memória é inefetivo.
5. **Processo:** Adicionar pre-commit `gitleaks` para evitar novos hardcoded secrets (já recomendado no F1 do audit).
6. **Monitoramento:** Adicionar Sentry/LogRocket para detectar tentativas de bypass (ex.: 404 em `/api/auth/status` em prod é suspeito).

---

## Critérios de validação pelo owner

Antes de fazer merge + deploy desta wave:

- [ ] **Revogar chave antiga MiniMax** no painel — está comprometida
- [ ] **Gerar nova chave** + setar em Vercel env vars (`vercel env add MINIMAX_API_TOKEN production`)
- [ ] **Setar `ALLOWED_ORIGINS`** com a URL do domínio de prod (ex.: `https://cabaladoscaminhos.com`)
- [ ] **Smoke test em prod** das rotas corrigidas:
  - [ ] `/api/auth/status` retorna 404
  - [ ] `/api/auth/create-test` retorna 404
  - [ ] `/api/auth/login-form` retorna 404
  - [ ] Logout via UI limpa cookies `sb-*-auth-token` (ver DevTools > Application)
  - [ ] Headers de resposta incluem `Strict-Transport-Security`, `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`
- [ ] **Rodar tests localmente** (fora do sandbox):
  ```bash
  npx vitest run tests/api/auth-security-fixes.test.ts
  ```
  Esperado: 14/14 passed
- [ ] **Conferir git log** desta wave:
  - [ ] 3-6 commits conventional (`fix(security): …`)
  - [ ] Mensagens referenciam finding IDs (`F1`, `F2`, `F3`, `F11`, `F8`, `F6`)

---

## Histórico de commits desta wave

*(preenchido pelo Coder via Conventional Commits — ver git log após execução)*

---

**Auditor:** Caio · **Reviewed against:** OWASP Top 10 (2021), LGPD Lei 13.709/2018, best practices Vercel Edge
**Próxima wave sugerida:** 11 — RLS + LGPD delete-account (ambos P0 bloqueantes)
