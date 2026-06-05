# Cycle 510 — COCKPIT_BYPASS_TOKEN (token por cookie/header)

**Date:** 2026-06-04
**Type:** Feature (dev convenience)
**Branch:** worktree-local

## Contexto

Após Fase 509 (`COCKPIT_AUTH_BYPASS=true` wide-open), usuário pediu
modo mais ergonômico: token que só ele sabe (`omokomorode`) em vez de
só um flag true/false. Recusado hardcode no código-fonte (vazaria no
git log); aceito token em env + cookie/header.

## Mudanças

**`src/lib/auth/operator-session.ts`**:
- Adicionado env `COCKPIT_BYPASS_TOKEN` (Fase 510)
- Constantes: `BYPASS_HEADER='x-cockpit-bypass'`, `BYPASS_COOKIE='cockpit_bypass'`
- Helpers: `isCockpitBypassTokenConfigured()`, `getCockpitBypassTokenForDisplay()`
- `readBypassTokenFromRequest(request)` lê header → cookie
- `readBypassTokenFromServerContext()` lê de `await cookies()/headers()`
- `tokenMatches(requestToken, envToken)` constant-ish-time compare
  (length fast-fail + XOR sweep para não vazar posição da diferença)
- Integrado em **ambos** `getOperatorFromRequest` e
  `getOperatorFromServerContext` como **precedência #0b**
  (wide-open #0a, token #0b, JWT cookie #1, dev header #2)
- Hard-refused em `NODE_ENV=production` (mesmo se a var vazar)

**`src/app/cockpit/layout.tsx`**:
- Banner âmbar (em vez de vermelho) quando só o token está ativo
- Token aparece truncado no banner: `4chars…2chars` (não vaza completo
  em screenshot)
- Vermelho continua reservado para `COCKPIT_AUTH_BYPASS=true` (mais grave)

**`.env.example`**:
- Documentada a var `COCKPIT_BYPASS_TOKEN=<seu-token>` na seção dev-only
- Comentário com exemplo de cookie + header

**`tests/lib/auth/operator-session.test.ts`**:
- 6 testes novos cobrindo:
  1. Bypass por header matching → mock ADMIN
  2. Bypass por cookie matching → mock ADMIN
  3. Token errado → null (sem DB lookup)
  4. Token ausente → null
  5. Length-mismatch → null (sem DB lookup)
  6. COCKPIT_AUTH_BYPASS=true wide-open ganha de COCKPIT_BYPASS_TOKEN

## Como usar (token que só você sabe)

```bash
# .env.local (NÃO commitado)
COCKPIT_BYPASS_TOKEN=omokomorode
```

Setar cookie **uma vez** no DevTools do browser (F12 → Console):
```js
document.cookie = "cockpit_bypass=omokomorode; path=/; max-age=31536000";
```

Ou via curl (testes/automação):
```bash
curl -H "x-cockpit-bypass: omokomorode" http://localhost:3000/cockpit
```

Token **nunca entra no código-fonte**, apenas em `.env.local`.

## Validação

- `npx tsc --noEmit` → 0 erros
- `npm run test:run` → **8744 passed** | 29 skipped | 0 failing
  (+6 vs baseline 8738 — exatamente os testes novos)
- Banner testável por `data-testid="cockpit-auth-bypass-banner"`
- Token truncado no banner (4+…+2) — screenshot-safe

## Pré-existentes (não escopo)

- `_global-error` prerender fail (Next 16) — cycle-489b
- Lint warnings 562 (pre-existing unused-vars noise)
- 13 login-route mock pollution do cycle-508 — RESOLVIDO (0 failing)

## Lições

- **Constant-time compare** vale mesmo para dev-only: `tokenMatches`
  protege contra timing attack em caso de leak do env. Custo zero.
- **Banner color codifica severidade**: vermelho = wide-open (grave),
  âmbar = token (controlado). Operador distingue à primeira vista.
- **Token truncado no banner** (4+…+2) é o sweet spot: utilizável
  (cookie continua válido), mas secret completo não vaza em screenshot.
- **Hardcode em código** foi recusado por boa razão: token literal
  vaza no primeiro `git clone`. `.env.local` é o lugar correto.
