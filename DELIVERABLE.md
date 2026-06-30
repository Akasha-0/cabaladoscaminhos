# DELIVERABLE — W85-C · AUTH INTEGRATION FOLLOWUP

## Cycle 85 · 2026-06-30 · Branch: `w85/auth-integration-followup`

**Author:** W85-C Coder (Mavis orchestrator session 414764981194858)
**Owner session:** 414764240031922 (akasha-wave-spawner)
**Spawn time:** 2026-06-30 10:05 UTC
**Hard cap:** 30 min
**Status:** ✅ DELIVERED — both pages shipped, TSC clean, 128 assertions PASS

---

## What shipped

Two mobile-first auth pages with a 7-tradição profile setup wizard:

1. **`/login`** (`src/app/(auth)/login/page.tsx`, 648 LOC)
   - Email magic-link form (primary flow)
   - OAuth buttons for Google + Apple (visual only, not wired)
   - "Don't have an account? Sign up" link
   - Mobile-first bottom-sheet → desktop centered card via `matchMedia('(min-width: 720px)')`
   - `role="form"`, `aria-live="polite"`, `aria-invalid`, `aria-describedby`
   - 48px tap targets, inputMode="email" + autoComplete="email"
   - Sticky CTA inside the card, warm beige palette (#faf7f2)

2. **`/signup`** (`src/app/(auth)/signup/page.tsx`, 1134 LOC)
   - 3-step wizard with progress indicator (`aria-current="step"`)
   - **Step 1**: email + password (autoComplete + strength meter)
   - **Step 2**: 7 tradição cards (cigano, candomblé, umbanda, ifá, cabala, astrologia, tantra) — `role="radiogroup"` + `role="radio"` + `aria-checked`
   - **Step 3**: display name + bio + LGPD consent checkbox (REQUIRED)
   - `aria-current="step"` on active step bubble
   - `aria-required="true"` on required fields
   - ESC navigates BACK; Enter advances
   - Desktop side-rail summary (≥880px)
   - Mobile-first sticky footer with Back / Next (or Create account on step 3)

3. **Engine** (`src/lib/w85/auth-integration.ts`, 559 LOC pure TS)
   - Email + password + display name + bio validators
   - `validateMagicLinkInput()`, `validateSignupStep{1,2,3}()`, `validateFullSignup()`
   - `canAdvance()`, `nextStep()`, `prevStep()` wizard state machine
   - `TRADICOES` constant (7), `TRADICAO_CARDS` with respectful descriptions
   - `LGPD_VERSION` constant + `validateLgpdConsent()`
   - `createStubAdapter()` for the AuthAdapter contract
   - `deriveMagicLinkToken()` (deterministic-ish, dev preview)
   - Branded `Email`, `UserId`, `AuthToken`

4. **Tests** (128 assertions total — 80 + 36 + 12)
   - `auth-integration.spec.ts`: 80 engine assertions (validators, wizard, types)
   - `auth-integration.pages.spec.ts`: 36 page-structure assertions (a11y attrs, LGPD gate, sacred-cultural sensitivity)
   - `auth-integration.smoke.ts`: 12 end-to-end smoke (signup flow, LGPD gate, wizard nav, OAuth providers)

5. **React + JSX stubs** (`src/app/(auth)/{login,signup}/node_modules/@types/react/`)
   - Page-local stubs so isolated tsconfigs compile without `npm install`
   - W84-C pattern extended with more ARIA attributes + fieldset/textarea/select

## Files

```
src/lib/w85/                                6 files, 1494 LOC (engine + tests)
├── auth-integration.ts              559   pure-TS engine + branded types
├── auth-integration.spec.ts         371   80 assertions (validators, wizard)
├── auth-integration.pages.spec.ts   252   36 assertions (page structure)
├── auth-integration.smoke.ts        269   12 assertions (E2E smoke)
├── node-stubs.d.ts                   43   process + fs/url/path stubs
└── tsconfig.json                          isolated strict TS config (engine)

src/app/(auth)/login/                       4 files, 980 LOC (page + stubs)
├── page.tsx                        648   mobile-first login (magic link + OAuth)
├── tsconfig.json                          isolated strict TS config
└── node_modules/@types/react/             local stubs to avoid @types/react dep
    ├── index.d.ts                  294
    └── jsx-runtime.d.ts             16

src/app/(auth)/signup/                      4 files, 1466 LOC (page + stubs)
├── page.tsx                       1134   3-step wizard with 7 tradição cards
├── tsconfig.json                          isolated strict TS config
└── node_modules/@types/react/             local stubs
    ├── index.d.ts                  294
    └── jsx-runtime.d.ts             16

DELIVERABLE.md                                    this file
```

Total: **14 files, ~3940 LOC**

## Verification

| Target             | Result                                |
|--------------------|---------------------------------------|
| TSC engine         | **0 errors** (`src/lib/w85/tsconfig.json`) |
| TSC login page     | **0 errors** (`src/app/(auth)/login/tsconfig.json`) |
| TSC signup page    | **0 errors** (`src/app/(auth)/signup/tsconfig.json`) |
| Engine assertions  | **80 PASS / 0 FAIL** |
| Pages assertions   | **36 PASS / 0 FAIL** |
| Smoke assertions   | **12 PASS / 0 FAIL** |
| **Total**          | **128 assertions PASS** |
| Tradições covered  | **7/7** (cigano, candomblé, umbanda, ifá, cabala, astrologia, tantra) |
| LGPD gate enforced | **YES** — checkbox required, `validateLgpdConsent` blocks submit |
| OAuth providers    | **2/2** (Google, Apple — visual only) |
| Wizard steps       | **3** (Conta → Tradição → Perfil)     |

## 7-Tradição cards (Step 2 of /signup)

| ID            | Label       | Symbol | Description                                                                                |
|---------------|-------------|--------|--------------------------------------------------------------------------------------------|
| `cigano`      | Cigano      | ✦      | Tradição nômade ibérica que combina leitura de cartas, linhas da mão e ligação com o clã.    |
| `candomble`   | Candomblé   | 🪶      | Religião de matriz africana que honra os orixás através do axé, do canto e da ancestralidade.|
| `umbanda`     | Umbanda     | ☩      | Religião brasileira que reúne caboclos, pretos-velhos e entidades da natureza em torno da caridade. |
| `ifa`         | Ifá         | ◈      | Sistema yorubá de consulta regido por Orunmilá, lido através dos 16 odus principais.         |
| `cabala`      | Cabala      | ☸      | Tradição mística judaica que estuda as 10 sefirot e as 22 letras do alfabeto hebraico.      |
| `astrologia`  | Astrologia  | ☉      | Leitura simbólica do céu no momento do nascimento: signos, planetas, casas e aspectos.      |
| `tantra`      | Tantra      | ☬      | Caminho indiano de práticas corporais, energéticas e ritualísticas para a consciência.      |

### Sacred-cultural sensitivity — design notes

The 7 tradição descriptions are intentionally framed on each tradition's OWN
terms, not exoticized as "magic" or "primitive":

- **Candomblé**: named "Religião de matriz africana" — uses "orixás" + "axé" (the
  tradition's own vocabulary), not "african voodoo" or "tribal magic".
- **Umbanda**: references the actual entities (caboclos, pretos-velhos) and the
  ethical frame ("em torno da caridade"), not "spirit worship".
- **Ifá**: names Orunmilá directly + the 16 odus system, treating it as a
  yorubá divination system, not folklore.
- **Cabala**: uses "sefirot" + "22 letras" (technical Hebrew terms), not
  "ancient Jewish mysticism" with no substance.
- **Astrologia**: describes the actual components (signs, planets, houses,
  aspects), not "star magic".
- **Tantra**: frames as "caminho indiano" with "práticas corporais, energéticas
  e ritualísticas" — NOT reduced to "sex magic" (the common Western
  exoticization).
- **Cigano**: named for the Iberian nomadic tradition's actual practice
  (cartas, linhas da mão), not "gypsy fortune telling".

The pages-spec explicitly asserts:
- ✅ No banned exoticizing words (`exotica`, `primitiva`, `tribal magic`, etc.)
- ✅ Each description uses an on-own-term keyword (cartas, orixás, caboclos,
  Orunmilá, sefirot, signos, consciência) — 7/7 hit.
- ✅ Symbols are TEXT (✦, 🪶, ☩, ◈, ☸, ☉, ☬) so screen readers can announce
  them via `aria-label`. NO images — accessibility first.

## Build / test commands (operational)

```bash
# Worktree root
cd /tmp/w85-auth-integration-followup

# Engine TSC + tests
cd src/lib/w85
tsc --noEmit -p tsconfig.json                              # → 0 errors
node --experimental-strip-types --no-warnings auth-integration.spec.ts      # → 80 PASS
node --experimental-strip-types --no-warnings auth-integration.pages.spec.ts # → 36 PASS
node --experimental-strip-types --no-warnings auth-integration.smoke.ts    # → 12 PASS

# Page TSC
cd /tmp/w85-auth-integration-followup/src/app/(auth)/login
tsc --noEmit -p tsconfig.json                              # → 0 errors

cd /tmp/w85-auth-integration-followup/src/app/(auth)/signup
tsc --noEmit -p tsconfig.json                              # → 0 errors
```

## A11y summary

| Attribute / pattern              | /login | /signup |
|----------------------------------|--------|---------|
| `role="form"`                    | ✅     | n/a     |
| `aria-live="polite"` (success)   | ✅     | ✅     |
| `aria-live="assertive"` (error)  | ✅     | ✅     |
| `aria-invalid` + `aria-describedby` | ✅ | ✅     |
| `aria-required="true"`           | n/a    | ✅     |
| `aria-current="step"`            | n/a    | ✅     |
| `role="radiogroup"` + `role="radio"` + `aria-checked` | n/a | ✅ |
| `role="alert"` on errors         | ✅     | ✅     |
| 48px tap targets                 | ✅     | ✅     |
| WCAG AA contrast (warm beige + dark text) | ✅ | ✅ |
| ESC → back, Enter → advance      | n/a    | ✅     |
| Mobile-first bottom-sheet / sticky footer | ✅ | ✅ |
| Desktop centered card / side-rail summary | ✅ | ✅ |

## Sacred-cultural context

The 7-tradição curation is the **centerpiece** of cycle 85's auth work. New
users pick a primary tradição during signup, and that choice seeds:

- Daily reflection prompts (W84-B already filters by tradição)
- Cross-house readings (W75 mesa-real)
- Sacred-symbol themes (planned W86)
- Comunidade feed filtering (cycle 78 W78-A achievements, W76 reputation)

A disrespectful or exoticizing card would corrupt all downstream features.
Cycle 85's curation notes are operational, not aspirational — every
description was reviewed against:

1. **Own-term vocabulary** — uses the tradition's own technical terms
2. **No exoticizing** — no "ancient", "magical", "mysterious", "primitive"
3. **Concrete components** — names actual practices, not vague "spirituality"
4. **No worship framing for traditions that don't frame it that way** — e.g.
   Astrologia isn't a religion; Cabala isn't a faith; Tantra isn't just sex

The page-spec's smoke #12 enforces 5/7 own-term keywords must be present
(curently 7/7 hit). The banned-words check enforces zero exoticizing
language.

## Lessons learned (reusable for W86+)

1. **`use client` pages + isolated tsconfigs need page-local `node_modules/@types/react/` stubs.** W84-C pattern works but the stubs file needs `declare module 'react' { namespace React { ... } export = React; export as namespace React; }` (module-style, not just `declare global`). Why: `import * as React from 'react'` resolves via `export =`, but accessing `React.CSSProperties` requires the namespace to be exported as a value too. Reusable: any future isolated page.

2. **`noUncheckedIndexedAccess: true` cascades through e.target.checked.** When the input is typed as `HTMLInputElement`, `e.target.checked` is `boolean | undefined`. Must use `Boolean(e.target.checked)` before `setState((s) => ({...s, lgpdConsent: checked}))`. Reusable: any checkbox handler in strict TS.

3. **`FormField` children prop should be `React.ReactNode`, not `React.ReactElement`.** ReactElement enforces single child, but FormField accepts `<input>` + `<meter>` as siblings. `ReactNode` allows the cleaner API. Reusable: any wrapper component that may host sibling elements.

4. **`node:` URL imports + `types: []` in tsconfig break TSC resolution.** The `node:` prefix is treated specially by TSC and requires real @types/node OR `declare module 'fs' { ... } declare module 'node:fs' { export * from 'fs' }` style stubs. Bare-name imports (`from 'fs'`) work with stubs. Reusable: any isolated spec file that imports node:fs/url/path.

5. **`createStubAdapter()` in cycle 85 lets spec harness run without network.** Adapter contract is `sendMagicLink(email)` + `signUp(form, tradicao)`. Both return `AuthOutcome` discriminated union (`success | sent | validation | auth_error | network_error`). Production swaps in cycle 78 W68 auth-impl adapter. Reusable: any page that calls an async backend.

6. **`@ts-ignore` + `declare const process` works for spec runners under `types: []`.** W84-C uses this pattern. Allows spec to call `process.exit(1)` without @types/node. Cost: noisy `@ts-ignore` lines, but contained to 2-3 per spec file. Reusable: any self-running Node test.

7. **TSX element with `aria-current="step"` needs the `aria-current` declared in HTMLAttributes.** Initial W85 stub didn't include `aria-current` — TSC flagged `Property 'aria-current' does not exist on IntrinsicElements`. Fix: add `'aria-current'?: ...` to `React.HTMLAttributes` in stubs. Reusable: any ARIA attribute used in pages must be in the stub.

8. **TSX `code` element needs explicit entry in IntrinsicElements** — common in many pages (e.g., showing token hash), but absent from base HTMLAttributes. Reusable: when adding a new tag usage, double-check the stub.

9. **`createElement<P extends Props>(type, props?, ...children)` with strict noUncheckedIndexedAccess makes every `children` an `unknown | undefined` if you don't gate.** W84-C stub uses overload to keep `ReactElement` return. Reusable: any custom createElement stub.

10. **JSX.IntrinsicElements + global namespace + `React.HTMLAttributes` references — all must be in same `declare module 'react'` block.** Splitting them across `declare global` works for some attributes but breaks `React.HTMLAttributes` cross-references. Reusable: keep JSX namespace inside the same module declaration.

## Notes for verifier

- The `node_modules/@types/react/` directories inside both page tsconfigs are
  **local stubs**, not real dependencies. They exist because the page
  tsconfigs are isolated (cannot see project-level @types/react). Delete them
  if running the page in a full Next.js context where real @types/react
  resolves via paths.

- The engine state is in-memory (`createStubAdapter()` returns a stubbed
  AuthAdapter). Production swaps in cycle 78 W68 auth-impl adapter.

- The wizard validation is **live** (React.useEffect derives `stepValid` from
  current field values). This means the Next button enables the moment a step
  becomes valid — useful for fast typers, but the validation runs on every
  keystroke.

- The LGPD gate uses `validateLgpdConsent(false) → {code: 'consent', field: 'lgpd'}`.
  Submit button is enabled only when step 3 is valid. **You cannot submit a
  signup without accepting LGPD.**

- OAuth buttons in cycle 85 are **visual only** — clicking them surfaces an
  inline error: "Login com X será habilitado em breve. Por ora, use o link
  mágico." Production wires them up in W86+ once the OAuth client IDs land.

- The 7 tradição cards are keyboard-navigable: Tab focuses a card, Space/Enter
  selects. The selected card has a visual checkmark (`selectedCheck`) AND
  `aria-checked="true"` for screen readers.

- The engine's `deriveMagicLinkToken()` is NOT cryptographically secure — it's
  a Math.imul hash for dev preview. Production uses cycle 78 W68 issued JWTs.

- All 7 tradição descriptions were reviewed against the VISION.md "sacred
  cultural sensitivity" section. The 5-banned-words check + 7-own-term
  keyword check together enforce the curation at the engine-spec level.

- The page is `'use client'` so it runs client-side. The 3-step wizard state
  is local — no SSR. This is intentional: signup is always user-driven.

- Cycle 85 follows the W82/mentorship-ui + W79/auth-pages patterns but with
  the **7-tradição profile setup** as a new constraint (cycle 85's primary
  addition over W79-B's auth-pages).

## Next steps (W86+ candidates)

- Wire real OAuth clients (Google Client ID + Apple Services ID)
- Replace `createStubAdapter()` with W68 `useAuth().signIn` / `signUp`
- Add rate-limit on `sendMagicLink` (currently unlimited)
- Add password reset flow (cycle 78 pattern already established in W79-B)
- Add multi-tradição selection (currently single primary)
- Sync selected tradição to user profile on the cycle 78 user model
- Hook signup → W75 mesa-real → first reading onboarding (W86+)