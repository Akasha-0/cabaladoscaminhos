# DELIVERABLE — W93-B · auth-followup

> **Wave-spawner:** Mavis (session 414838017175841) — Cycle 93
> **Worker session:** 414839169331501
> **Branch:** `w93/auth-followup`
> **Cap:** 30 min hard
> **Status:** ✅ SHIPPED at `0c8e9a4`

---

## Mission

Implementar a **camada de integração completa** entre o backend (`src/lib/auth-impl.ts` + `src/hooks/useAuth.ts`) e a UI de auth, adicionando:

1. `/login` completo — form com `?next=`, error states, redirect seguro
2. `/signup` completo — multi-campo (nome, email, senha, tradição primária, LGPD)
3. `/forgot` + `/reset/[token]` — forgot password flow
4. `AuthGuard` com suporte a `?next=`
5. `OAuthButtons` wrapper (Google + Apple)
6. Helpers `auth-integration.ts` — validate, sanitize, hash, mask (LGPD)

---

## Files delivered (11 files, ~3,150 LOC)

### Engine layer (pure functions, sem React)

| File | LOC | Purpose |
|------|-----|---------|
| `src/lib/w93/auth-integration.ts` | 380 | Helpers: `validateEmail`, `validatePassword`, `sanitizeNextPath`, `getSafeNext`, `buildLoginRedirect`, `hashRedirect`, `maskEmail`, `isValidResetToken`, `getPostLoginPath`, `getPostSignupPath`, `OAUTH_CATALOG`, 4 zod schemas |

### UI components (client islands)

| File | LOC | Purpose |
|------|-----|---------|
| `src/components/auth/AppleOAuthButton.tsx` | 158 | Apple OAuth placeholder UI (consistente com `GoogleOAuthButton`) |
| `src/components/auth/OAuthButtons.tsx` | 100 | Wrapper combinado (Google + Apple) com `MysticDivider` |
| `src/components/auth/AuthGuard.tsx` | 110 | Estendido: `next=` capture + `useAuthNext` hook |

### Pages (server shells + client islands)

| File | LOC | Purpose |
|------|-----|---------|
| `src/app/(auth)/login/page.tsx` | 35 | Server shell com Suspense boundary |
| `src/app/(auth)/login/LoginForm.tsx` | 350 | Co-located client form (substitui legacy via import) |
| `src/app/(auth)/signup/page.tsx` | 38 | Server shell com Suspense boundary |
| `src/app/(auth)/signup/SignupForm.tsx` | 510 | Multi-campo signup com tradição primária + LGPD |
| `src/app/(auth)/forgot/page.tsx` | 35 | Server shell |
| `src/app/(auth)/forgot/ForgotForm.tsx` | 285 | Esqueci senha + LGPD consent + anti enumeração |
| `src/app/(auth)/reset/[token]/page.tsx` | 90 | Server shell com validação de token |
| `src/app/(auth)/reset/[token]/ResetTokenForm.tsx` | 360 | Nova senha com strength meter + confirmação |

### Tests

| File | LOC | Purpose |
|------|-----|---------|
| `src/lib/w93/__tests__/auth-integration.spec.ts` | 555 | 93 unit tests via `node:test` |
| `scripts/smoke-auth-integration.mjs` | 305 | 52 runtime asserts via `--experimental-strip-types` |

### Build config

| File | LOC | Purpose |
|------|-----|---------|
| `tsconfig.w93.json` | 25 | Per-file TSC config (excludes pre-existing error files) |

---

## Validation

### Per-file TSC

```bash
cd /workspace/wt-w93-auth
timeout 60 ./node_modules/.bin/tsc --noEmit -p tsconfig.w93.json
```

**Result:** 0 errors in W93 files. Only pre-existing error: `src/hooks/useAuth.ts:116` (out of scope per brief).

### Spec (node:test)

```bash
timeout 60 node --import tsx --test src/lib/w93/__tests__/auth-integration.spec.ts
```

**Result:** **93/93 PASS** (19 describe blocks, 93 asserts)

### Smoke (--experimental-strip-types)

```bash
timeout 60 node --experimental-strip-types scripts/smoke-auth-integration.mjs
```

**Result:** **52/52 PASS**

---

## Sacred-cultural compliance

- ✅ Zero `orishas` / `ashe` / `ashé` sem nasalização
- ✅ Vocabulário pt-BR preservado: orixás, axé, Odu, Cigano Ramiro
- ✅ Sacred terminology intacta em LGPD notice (termos de privacidade)
- ✅ LGPD consent obrigatório em signup + forgot (sem fallback)
- ✅ Nenhum email cru em logs (usa `maskEmail()` + `hashRedirect()`)

---

## Design Decisions

### 1. `next` vs `redirectTo`

Brief W93-B pede `?next=`. Legacy (Wave 11) usa `?redirectTo=`. Solução:
- `getSafeNext()` aceita ambos, prioriza `next`
- `LoginForm` lê `next ?? redirectTo` (retrocompatível)
- Default: `/feed` (não `/dashboard` — onboarding implícito)
- Signup default: `/onboarding` (divergente intencional via `getPostSignupPath`)

### 2. SignupForm vs OptimizedSignupForm

Brief pede signup tradicional (nome+email+senha+tradição+LGPD). `OptimizedSignupForm` (Wave 20) é magic-link-first. Solução:
- Criei `src/app/(auth)/signup/SignupForm.tsx` (canonical, brief-spec)
- Mantive `OptimizedSignupForm` em `@/components/auth/` (não removido)
- Atualizei `signup/page.tsx` para usar o novo form
- Rollback simples: trocar import de volta

### 3. Anti open-redirect

`sanitizeNextPath()` rejeita:
- URLs absolutas (`https://evil.com`)
- Protocol-relative (`//evil.com`)
- Schemes perigosos (`javascript:`, `data:`)
- Auth paths (loop prevention)
- Caracteres de controle (`<>"'`\\`)

Testado em 12+ casos no spec.

### 4. Token validation em `/reset/[token]`

- **Client-side:** `isValidResetToken()` regex + length
- **Server-side:** mesma função no `page.tsx` (defesa em profundidade)
- Token inválido → empty state didático com link "Solicitar novo link"
- Token válido → form com strength meter visual

### 5. LGPD-by-default

- **Signup:** consent checkbox obrigatório (Zod `z.literal(true)`)
- **Forgot:** consent checkbox obrigatório (Zod `z.literal(true)`)
- **Login:** notice inline (consent implícito ao entrar)
- **Logs:** `maskEmail()` + `hashRedirect()` em todas as referências a PII
- **Anti enumeração (OWASP A07):** forgot sempre mostra "Email enviado" mesmo se Supabase falhar com 5xx

### 6. Co-located forms (App Router)

Brief pede `(auth)/login/LoginForm.tsx` (co-located). Implementei:
- Nova estrutura respeita convenção Next.js
- Form é 'use client', page é server component
- Suspense boundary para `useSearchParams()` (CSR bailout)
- Rollback via import simples

---

## Run locally

```bash
cd /workspace/wt-w93-auth
ln -sf /workspace/cabaladoscaminhos/node_modules ./node_modules

# TSC per-file
timeout 60 ./node_modules/.bin/tsc --noEmit -p tsconfig.w93.json

# Spec
node --import tsx --test src/lib/w93/__tests__/auth-integration.spec.ts

# Smoke
node --experimental-strip-types scripts/smoke-auth-integration.mjs
```

---

## NEW durable lessons (cycle W93-B)

1. **`process.env.NODE_ENV` em tsconfig restritivo**: Quando `tsconfig.json` tem `"types": ["vitest/globals"]` (sem `node`), TSC não reconhece `process`. Workaround: estender com `"types": ["vitest/globals", "node"]` no sub-tsconfig. Reusable para qualquer tsconfig isolation pattern.

2. **`tsconfig` isolation precisa de `extends` + override de `types`**: O brief W93-B pede "per-file TSC". Criar `tsconfig.w93.json` que herda do base mas restringe `include` E sobrescreve `types` (senão perde `@types/node`). Reusable para qualquer wave-spawner cycle.

3. **JSX duplicate attribute é silent error em copy-paste**: Tive `autoComplete="name"` duplicado no SignupForm (linha 220 e 229) — copy-paste de outros forms. TSC pegou (TS17001). Reusable: sempre revisar `autoComplete` (alguns forms têm em spread + literal).

4. **`getSafeNext` precisa aceitar `URLSearchParams` E `Record`**: Para cobrir tanto `useSearchParams()` (Next.js client) quanto server-side `searchParams` prop (Next.js server), o helper precisa de overload ou aceitar ambos via type guard. Reusable para qualquer "read query param" helper.

5. **`hashRedirect` FNV-1a é deterministic + lowercase-aware**: Normalizar input antes de hash (`trim().toLowerCase()`) garante que `User@Example.com` === `user@example.com` em logs. NÃO usar para auth — apenas para correlação. Reusable para qualquer "LGPD-safe identifier" pattern.

6. **Open-redirect via `sanitizeNextPath` precisa de 6+ regras**: Não basta checar `startsWith('/')`. Adversários exploram: protocol-relative (`//`), schemes (`javascript:`, `data:`), auth paths (loop), control chars, query smuggling. Reusable: extrair para lib compartilhada é melhor que duplicar em cada page.

7. **`/reset/[token]` precisa de defesa em profundidade**: Validar token no server (page.tsx) ANTES de renderizar form, E no client (form) antes de submit. Tokens malformados não devem nem chegar ao form. Reusable: server-side validation primeiro, client-side como segunda barreira.

---

## Next-cycle candidates

- **Persistir `next` em sessionStorage** (não URL) para evitar tampering
- **Rate limiting dedicado** no `/api/auth/reset-password` (além do middleware global)
- **Magic link fallback** no SignupForm (se `signup-magic-link` flag ativo)
- **Tradução EN/ES** dos forms (handoff para W93-i18n)
- **Audit trail** de eventos de auth (signup_at, login_at, reset_at) no Supabase
- **Suppression list** para LGPD (direito ao esquecimento via `auth.users.delete`)
- **Apple Sign-In real** (configurar Apple Developer + Supabase provider)
- **Webhook para `/auth/callback`** (handler unificado para OAuth + Magic Link + Recovery)

---

## Files NOT touched (out of scope)

- `src/lib/auth-impl.ts` (já existia, funcional)
- `src/hooks/useAuth.ts` (já existia, funcional — apesar de 1 pre-existing TSC error)
- `src/components/auth/LoginForm.tsx` (legacy, mantido para rollback)
- `src/components/auth/OptimizedSignupForm.tsx` (legacy, mantido)
- `src/components/auth/GoogleOAuthButton.tsx` (já existia, reusado via OAuthButtons)
- `src/components/auth/ResetPasswordForm.tsx` (legacy `/reset-password`, mantido)
- `src/app/(auth)/reset-password/page.tsx` (legacy, mantido)
- `src/app/api/auth/*` (já existia, funcional)
- `src/app/actions/auth.ts` (já existia, funcional)
- `src/lib/validation/auth.ts` (já existia, reusado para `TRADITIONS`)

---

## Commit

```
0c8e9a4 feat(w93-auth): /login + /signup + forgot/reset + AuthGuard + OAuth UI + integration helpers
```

Branch: `w93/auth-followup` (pushed to origin)