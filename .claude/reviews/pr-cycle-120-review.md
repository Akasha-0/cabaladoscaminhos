---
name: review-cycle-120
description: Code review of unstaged auth + schema changes from cycle 120
metadata: 
  node_type: memory
  type: review
  cycle: 120
  originSessionId: 20ce33f6-74f1-4eee-bc84-fb09ae8151f0
---

# Code Review — cycle-120 unstaged (Local Mode)

**Reviewed:** 2026-06-02
**Decision:** ✅ **APPROVE with 1 MEDIUM**

## Summary
14 arquivos modificados unstaged implementam Fase 18 (security hardening) + Fase 20 (MFA/TOTP) + cleanup de engines espirituais. Qualidade geral **alta** — instintos do projeto respeitados sistematicamente.

## Findings

### CRITICAL
_Nenhum._

### HIGH
_Nenhum._

### MEDIUM (1) — **RECLASSIFICADO COMO FALSO POSITIVO** (cycle-121)

**`src/lib/auth/operator-mfa.ts`** — `MFA_ENCRYPTION_KEY` sem validação early-startup.
- ~~Schema documenta que `secretEncrypted` é cifrado com `MFA_ENCRYPTION_KEY`. Erro pode aparecer só no uso, dando 500.~~
- **Verificação cycle-121:** validação JÁ EXISTE em `src/lib/auth/operator-totp.ts:91-95, 106-143` (helper de criptografia). Lança erro explícito se a env var faltar em produção. O fluxo está coberto — o instinto `lazy-compute-env-config-not-module-load` está sendo respeitado.
- **Status:** ✅ Resolvido retroativamente. Sem ação necessária.

### LOW (2)
1. `prisma/schema.prisma` — `recoveryCodesHash: String` JSON workaround; considerar `Json` type em PG final.
2. `src/lib/auth/operator-jwt.ts` (340 linhas) — extrair magic constants para `constants.ts`.

## ✅ Instintos validados (positivos)

| Instinto | Evidência |
|----------|-----------|
| `jwt-algorithm-allowlist-downgrade-attack` | `operator-jwt.ts:195, 330` — `algorithms: ['HS256']` |
| `store-sha256-hash-of-jwt-not-plaintext` | `operator-sessions.ts:33` — SHA-256 |
| `lazy-compute-env-config-not-module-load` | `operator-jwt.ts:108, 116` — `getSecret()` lazy |
| `server-side-auth-gate-mandatory-not-client-only` | `operator-guard.ts:5` — comentário explícito |

## Validation

| Check | Result |
|-------|--------|
| Type check | Skipped |
| Lint | Skipped |
| Tests | Skipped |
| Build | Skipped |
| Segredos hardcoded | ✅ Pass |
| Type `any` | ✅ Pass |
| Mutations | ✅ Pass |
| Algoritm allowlist | ✅ Pass |
| SHA-256 hash | ✅ Pass |

## Files Reviewed

14 modificados: `.claude/scheduled_tasks.{json,lock}`, `package.json`, `prisma/schema.prisma`, 5 engines `orixa-*`, 4 arquivos `src/lib/auth/*`, 2 UI (`SessionsList`, `OperatorAuthProvider`).

## Recomendação

✅ APROVAR. Fix MEDIUM entra no cycle-121.
