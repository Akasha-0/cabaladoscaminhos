---
name: cycle-123-fase-20-mfa
description: Fase 20 — MFA/TOTP para Operators ADMIN (commit b41f9697 + 2e91f8e2)
metadata:
  type: project
  cycle: 123
---

Ciclo 123 (2026-06-02). **Fase 20 — MFA/TOTP para Operators ADMIN**.

**Mudanças:**

1. **Dep install** (commit `b41f9697`):
   - `otpauth ^9.5.1` — TOTP RFC 6238 (qrcode já estava presente)

2. **Schema + migration** (commits `2e91f8e2` e ancestrais):
   - `prisma/schema.prisma` — model `OperatorMfa` (1:1 com Operator)
     - `secretEncrypted` (AES-256-GCM), `enabled`, `recoveryCodesHash` (10 slots),
       `lastUsedStep` (BigInt, single-use)
   - `prisma/migrations/20260602160000_add_operator_mfa/migration.sql`

3. **Helpers** (novos arquivos):
   - `src/lib/auth/operator-totp.ts` (370+ linhas)
     - `generateTotpSecret`, `buildOtpAuthUrl`, `generateQrCodeDataUrl`
     - `encryptSecret`/`decryptSecret` (AES-256-GCM, iv:tag:ciphertext)
     - `verifyTotpCode` (drift ±1 passo, single-use via `stepUsed`)
     - `generateRecoveryCodes` (10 × 16 hex), `hashRecoveryCode`, `tryConsumeRecoveryCode`
   - `src/lib/auth/operator-mfa.ts` (282 linhas)
     - `isMfaEnabled`, `setupMfa`, `verifySetupMfa`
     - `consumeMfaChallenge` (TOTP, single-use), `consumeRecoveryCode` (slot mark)
     - `disableMfa` (re-autenticação com senha)
   - `src/lib/auth/operator-jwt.ts` — APENAS ADICIONADAS:
     - `OPERATOR_MFA_CHALLENGE_TTL_SECONDS = 5*60`
     - `signMfaChallengeToken`, `verifyMfaChallengeToken` (type='mfa-challenge')
     - `MfaChallengePayload` interface, `OperatorTokenTypeWithMfa` type

4. **Login route modificado** (`src/app/api/operator/auth/login/route.ts`):
   - Detecta `isMfaEnabled(operatorId)` após validar senha
   - Se sim: `200 { mfaRequired: true, mfaToken }` (sem cookies)
   - Se não: par access+refresh normal (Fase 15)

5. **5 API routes novas** em `src/app/api/operator/auth/mfa/`:
   - `setup` (POST, ADMIN only) — gera secret + QR + 10 recovery codes
   - `verify-setup` (POST, ADMIN only) — confirma primeiro TOTP, marca `enabled=true`
   - `verify` (POST) — TOTP challenge: troca mfaToken por cookies
   - `recovery-code` (POST) — recovery code challenge: mesma troca
   - `disable` (POST) — re-autentica com senha, apaga OperatorMfa

6. **UI components**:
   - `src/components/operator/MfaSetup.tsx` — 3 steps (init → QR+recovery → done)
   - `src/components/operator/MfaChallenge.tsx` — toggle TOTP/recovery no login
   - `src/components/auth/OperatorLoginForm.tsx` — fetch direto (não passa pelo
     provider) para detectar `mfaRequired` no body e trocar para `<MfaChallenge>`

7. **Tests** (3 arquivos, 62 tests):
   - `tests/lib/auth/operator-totp.test.ts` — 23 tests
     (secret gen, buildOtpAuthUrl, encrypt/decrypt roundtrip + tag-mismatch,
      verify valid/invalid/drift, recovery codes)
   - `tests/lib/auth/operator-mfa.test.ts` — 19 tests
     (setup, verifySetup, single-use TOTP, recovery slot, disable, isEnabled)
   - `tests/api/operator-auth-mfa.test.ts` — 20 tests
     (login com/sem MFA, mfaToken JWT validação, recovery code format,
      auth gate, body validation)

**Verificação:**
- `npx vitest run tests/lib/auth/operator-totp.test.ts` → 23/23 ✓
- `npx vitest run tests/lib/auth/operator-mfa.test.ts` → 19/19 ✓
- `npx vitest run tests/api/operator-auth-mfa.test.ts` → 20/20 ✓
- `npx vitest run tests/lib/auth` (suite completo) → 169/169 ✓
- `npx vitest run tests/api/operator-auth*` → 85/85 ✓
- `npx tsc --noEmit` (excluindo pre-existentes) → 0 errors nos arquivos de Fase 20

**Decisões de design:**
- Apenas `role=ADMIN` pode ativar MFA nesta fase
- Secret cifrado com AES-256-GCM (key em `MFA_ENCRYPTION_KEY` env, hex64 ou base64)
- Recovery codes: 10 × 16 hex chars, bcrypt, single-use (slot "")
- mfaToken: JWT 5min, type='mfa-challenge', com `jti` único
- Single-use de TOTP via `lastUsedStep` (BigInt) no OperatorMfa
- Drift TOTP: ±1 passo (RFC 6238 §5.2)

**Issues encontrados (resolvidos):**
- Linter removeu `*/` e `export function` em operator-jwt.ts — restaurados
- Linter removeu `OPERATOR_ACCESS_TTL_SECONDS` constant — restaurado
- Linter duplicou `isRefreshSessionActive` em operator-sessions.ts — duplicata removida
- Linter removeu `*/` em rate-limit.ts — restaurado
- bcrypt mock com dynamic import causava race condition (só 1ª chamada usava
  mock) — usei bcrypt real (rounds=4) no test, custo aceitável

**Próximas fases:**
- T6.x (PDF generation)
- T7.x (UX Sprint 8 — keyboard shortcuts, etc)
- Fase 21+ (MFA enforcement, audit, security headers completos)
