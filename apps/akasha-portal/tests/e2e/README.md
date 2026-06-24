# Playwright E2E — Wave 9.4

This directory holds the manual Playwright E2E suite for the Wave 9.1
One-Screen Hub emotional state flows. The 4 specs cover each of the
states the user can pick in the StatePicker:

| Spec file | State | What it covers |
|-----------|-------|----------------|
| `meu-dia-ansioso.spec.ts` | `ansioso` | BreathOrb + start-breath + Mentor CTA → `/diario?intencao=ansiedade` |
| `meu-dia-perdido.spec.ts` | `perdido` | Mini-mandala + 3 practice cards + Mentor CTA → `/diario?intencao=perdido` |
| `meu-dia-curioso.spec.ts` | `curioso` | 5 Pilar cards (cabala/astrologia/tantra/odu/iching) + navigation |
| `meu-dia-centrado.spec.ts` | `centrado` | Full synthesis view + change-state affordance |

Plus the `meu-dia-ansioso.spec.ts` covers the Wave 9.3 dispatcher
chain (the `?intencao=ansiedade` query param is read by the diario
route to bias the Mentor tool selection).

## Running the suite

The suite is **manual** — there is no CI pipeline wired up yet. To run:

```bash
# Terminal 1 — start the dev server with the seeded DB
pnpm dev

# Terminal 2 — set the seeded password then run
export E2E_TEST_PASSWORD='<the-password-used-by-pnpm-db-seed>'
pnpm test:e2e:browser
```

The login helper (`_helpers/auth.ts`) reads `E2E_TEST_PASSWORD` from
the environment. If it is unset, the spec fails loudly with a clear
error explaining how to set it.

## Why Playwright isn't on CI yet

1. The browser binaries aren't installed in CI containers
   (`npx playwright install chromium` is a ~150MB download).
2. The portal requires a seeded Postgres DB; CI doesn't have one
   wired up.
3. The auth flow uses the seeded `gabriel@cabaladoscaminhos.com`
   user with a real bcrypt-hashed password.

When the team is ready to automate this, the path is:
- Add `pnpm exec playwright install --with-deps chromium` to the CI
  image build step.
- Provision a Postgres test DB + run `pnpm db:seed` in the CI job.
- Wire the suite into the existing pipeline alongside `pnpm test:run`.

For now, Gabriel runs the specs manually after each Wave that touches
`/meu-dia` to confirm the four flows still work end-to-end.

## Auth strategy

Specs use `request.post('/api/akasha/auth/login', …)` to capture the
session cookies and apply them to the browser context. This is
deterministic and avoids racing the UI form. The Akasha session
cookie is `__Host-` prefixed + httpOnly + Secure; Playwright respects
all three when copying cookies from a request response.

The second set of specs use `seedEmotionalState()` to inject a
pre-recorded emotional state into `localStorage` + the `akasha_state`
cookie. This skips the picker and renders the corresponding view
directly — useful for fast regression checks.