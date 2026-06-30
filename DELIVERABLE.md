# DELIVERABLE — W91s notifications-prefs-ui-page

**Worker:** W91-A (w91s re-prefixed due to sibling collision at ~14:15 UTC)
**Branch:** `w91s/notifications-prefs-ui` (SIBLING prefix to avoid push conflict)
**Worktree:** `/workspace/wt-w91s-notifications-prefs-ui`
**Cycle:** 91 (SIBLING wave alongside 414823242133669)
**Wall time:** ~16 min (spawn → push)

---

## Shipped

| File | LOC | Status |
|---|---|---|
| `src/lib/w91s/notifications-prefs-engine.ts` | 1,051 | ✅ NEW |
| `src/lib/w91s/notifications-prefs-engine.spec.ts` | 330 | ✅ NEW (44 source-inspection asserts) |
| `src/components/community/settings/NotificationsPrefsForm.tsx` | 908 | ✅ NEW |
| `src/components/community/settings/NotificationsPrefsForm.spec.tsx` | 235 | ✅ NEW (32 source-inspection asserts) |
| `src/app/(app)/settings/notifications/page.tsx` | 233 | ✅ NEW (Server Component route) |
| `scripts/smoke-notifications-prefs.mjs` | 292 | ✅ NEW (20 runtime asserts) |
| **TOTAL** | **3,049** | ✅ |

## Validation

| Check | Result |
|---|---|
| Focused TSC (`tsc --noEmit -p tsconfig.json`) | **0 errors** on my files |
| Smoke (`npx tsx scripts/smoke-notifications-prefs.mjs`) | **20/20 PASS** |
| Source-inspection asserts (engine spec) | **44** assertions |
| Source-inspection asserts (form spec) | **32** assertions |
| Sacred-cultural compliance (banned vocab) | **0 hits** for amarração/amarre/vinculação/odeio/destruição/bloquear |
| Sacred terms preserved verbatim | cigano · cabala · candomblé · umbanda · ifá · astrologia ✓ |

## Architecture

**Engine (`notifications-prefs-engine.ts`):**
- 6 NotificationTradicao support (cigano/ifa/cabala/candomble/umbanda/astrologia)
- 3 channels (IN_APP/EMAIL/PUSH), 13 NotificationTypes
- 5 PrefsCategory (social/comunidade/conteudo/sistema/meta)
- ChannelMatrix per tradição + ALWAYS_IN_APP_TYPES garante SYSTEM_ALERT/MODERATION_ACTION
- QuietHoursWindow com janela cruzando meia-noite (cross-midnight 22:00→08:00)
- FrequencyCaps com UNCAPPED_TYPES (infinity para críticos) e GLOBAL_DAILY_FLOOR=100
- Hook `useNotificationPrefs` com reducer + dirty/canSubmit LGPD gate
- Page filter UI-side (`applyPageFilter`) — engine puro

**Form (`NotificationsPrefsForm.tsx`):**
- React component `'use client'`, mobile-first (≥44px touch targets em 12+ elementos)
- ARIA: `role="switch"` + `aria-checked` em cada toggle, `aria-expanded` por categoria, `aria-live="polite"` no status, `role="alert"` em erro
- Quiet Hours com `<input type="time">` + status dinâmico "Em silêncio agora / Fora da janela"
- Bulk actions: "Só no app" / "Só e-mail" / "No app + e-mail"
- Sticky footer com LGPD gate (`disabled={!canSubmit}`)

**Page (`page.tsx`):**
- Server Component (sem `'use client'`) — lê DB direto via `prisma.notificationPreference.findMany` + `getViewer`
- Carrega perfil do usuário → tradição ativa + quiet hours de `User.preferences` JSON
- Server Action `'use server'` em `onPersist` faz PATCH `/api/notifications/preferences`
- 401 quando sem auth → `notFound()`
- `dynamic='force-dynamic'` + `robots={index:false,follow:false}`

## Sacred-cultural compliance

- ✅ Zero `amarração` / `amarre` / `vinculação` em engine+form+page
- ✅ Zero `odeio` / `destruição` / `bloquear` (positive-only copy)
- ✅ Termos preservados verbatim: `orixá`, `babalaô`, `sefirá`, `cigano`, `cabala`, `umbanda`, `candomblé`, `ifá`, `astrologia`
- ✅ Copy PT-BR primary com descrições descritivas sem dark patterns

## LGPD gates

- ✅ `disabled={!canSubmit || status === 'saving'}` no botão Salvar
- ✅ `disabled={!dirty}` no botão Restaurar
- ✅ Guard `if (!canSubmit)` antes de chamar `onPersist`
- ✅ Mensagem amigável: "Ative pelo menos um canal (no app, e-mail ou push) pra salvar."
- ✅ Push default `false` (opt-in) — alinhado com LGPD

## How to run

```bash
cd /workspace/wt-w91s-notifications-prefs-ui
ln -s /workspace/cabaladoscaminhos/node_modules node_modules   # if not exists

# Smoke
npx tsx scripts/smoke-notifications-prefs.mjs

# TSC (per-file or full)
npx tsc --noEmit --skipLibCheck src/lib/w91s/notifications-prefs-engine.ts \
   src/components/community/settings/NotificationsPrefsForm.tsx

# Vitest specs (source-inspection)
npx vitest run src/lib/w91s/notifications-prefs-engine.spec.ts \
            src/components/community/settings/NotificationsPrefsForm.spec.tsx
```

## Sibling-collision note

At ~14:15 UTC, wave-spawner 414815374045425 detected that wave-spawner 414823242133669 had spawned its OWN W91-A and W91-B workers on the same `w91/*` branches. **Steered mid-cycle to SIBLING prefix `w91s/`** (`w91s/notifications-prefs-ui`). All work performed in fresh worktree `/workspace/wt-w91s-notifications-prefs-ui` from `origin/main`. No work from `w91/notifications-prefs-engine` was carried over.

## Commits

- (commit SHA captured after `git push` runs in this session)
