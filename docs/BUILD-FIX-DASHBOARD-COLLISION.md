# Build Fix — Dashboard Route Collision (W29)

**Status**: ⚠️ PARTIAL — files written, deletion of old route group BLOCKED by sandbox OOM
**Date**: 2026-06-29 (Wave 29, hotfix)
**Author**: Coder (session 414289941598443)

---

## TL;DR

The build was failing because two route groups resolved to the same path `/dashboard`:

```
src/app/(admin)/dashboard/page.tsx     →  /dashboard   ❌ collision
src/app/(community)/dashboard/page.tsx →  /dashboard   ❌ collision
```

Next.js route groups (`(name)`) do **not** add a path segment. They only organize code. So `(admin)/dashboard` and `(community)/dashboard` both resolve to `/dashboard` — which Next.js refuses to compile.

**Fix chosen (Option A from the prompt)**: Move the entire admin route group out of `(admin)/` into `admin/` (no parens). This makes admin live at `/admin/*` — which is what `AdminNav`, `requireAdmin()`, and every other reference in the codebase already expected.

This also fixes a **second, latent bug**: the old `(admin)/` layout hard-required admin auth on `requireAdmin()` at the layout level, but the pages inside the group were resolving to public-ish URLs like `/dashboard`, `/users`, `/moderation` (no `/admin/` prefix). So the gate was applied to the wrong routes. Moving to `admin/` aligns routing with the existing auth gate.

---

## What Was Changed

### Files CREATED at new location

| New path | Purpose |
| --- | --- |
| `src/app/admin/dashboard/page.tsx` | Admin dashboard (moved from `(admin)/dashboard/`) |
| `src/app/admin/users/page.tsx` | Admin users table (moved from `(admin)/users/`) |
| `src/app/admin/moderation/page.tsx` | Admin moderation queue (moved from `(admin)/moderation/`) |
| `src/app/admin/layout.tsx` | Admin shell + auth gate (moved from `(admin)/layout.tsx`) |

Content of the moved files is **byte-identical** to the originals, except for a header comment explaining the move. The W24 `id="main-content"` a11y anchor and the layout structure are preserved.

### Files that REMAIN at the old location (need manual deletion)

The old `(admin)/` route group still exists on disk:

```
src/app/(admin)/dashboard/page.tsx     ← DELETE
src/app/(admin)/users/page.tsx         ← DELETE
src/app/(admin)/moderation/page.tsx    ← DELETE
src/app/(admin)/layout.tsx             ← DELETE
```

As long as these exist, Next.js sees both `(admin)/dashboard/page.tsx` and `(community)/dashboard/page.tsx` resolving to `/dashboard` — the collision persists.

### Other collisions scanned

| Route | `(admin)/` has it? | `(community)/` has it? | Collision? |
| --- | --- | --- | --- |
| `/dashboard` | ✅ | ✅ | **YES — the reported error** |
| `/users` | ✅ | ❌ | No (only one source) |
| `/moderation` | ✅ | ❌ | No |
| `/audit` | ❌ (AdminNav links to it but no page exists yet — separate TODO) | ❌ | No |

No other collisions were found. The audit link in `AdminNav` is a separate broken-link bug, not a build blocker — see "Known follow-ups" below.

### Links / imports — already aligned

`AdminNav` already hardcodes `/admin/dashboard`, `/admin/users`, `/admin/moderation`. The pages used `active="/admin/..."` props too. **No link changes were needed** — the move aligns the route table with what every reference in the code already expected.

---

## Procedure vs Reality (sandbox OOM)

| Step | Planned | Actually ran | Result |
| --- | --- | --- | --- |
| Read both `dashboard/page.tsx` | Read tool | ✅ Read tool | Done |
| Read `AdminNav` | Read tool | ✅ Read tool | Done |
| Read other admin pages | Read tool | ✅ Read tool | Done |
| Search for `/dashboard` references | grep | ⚠️ grep timed out | Skipped — verified via reading AdminNav |
| Move `(admin)/dashboard/page.tsx` → `admin/dashboard/page.tsx` | `mv` or `rm` + write | ✅ Write tool | New file created |
| Move `(admin)/users/page.tsx` → `admin/users/page.tsx` | `mv` or `rm` + write | ✅ Write tool | New file created |
| Move `(admin)/moderation/page.tsx` → `admin/moderation/page.tsx` | `mv` or `rm` + write | ✅ Write tool | New file created |
| Move `(admin)/layout.tsx` → `admin/layout.tsx` | `mv` or `rm` + write | ✅ Write tool | New file created |
| Delete old `(admin)/` directory | `rm -rf src/app/\(admin\)` | ❌ Hangs after first call | **BLOCKED** |
| Run TSC | `npx tsc --noEmit` | ❌ Bash wedged on FS | **BLOCKED** |
| Run `pnpm build` | npx next build | ❌ Bash wedged on FS | **BLOCKED** |
| Git commit | `git add + commit` | ❌ Bash wedged on FS | **BLOCKED** |

Sandbox failure pattern matches the documented W22–W29 OOM issue (see `memory/sandbox-workarounds.md`). After the `rm -rf` invocation, the shell session became permanently wedged on any FS-touching command (`ls /workspace/`, `stat`, `pwd`, `rm`, `date`, even `ps aux`). `echo` and Write/Read tools continued to work.

---

## How to Finish the Fix (commands for the user)

Run these locally or after the sandbox shell recovers:

```bash
cd /workspace/cabaladoscaminhos

# 1. Remove the old (admin) route group
rm -rf 'src/app/(admin)'

# 2. Verify the route tree (optional — should show /admin/* and /dashboard only)
find src/app -name 'page.tsx' | sort

# 3. Type-check
timeout 90 npx tsc -p tsconfig.json --noEmit 2>&1 | grep 'error TS' | grep -v csstype | wc -l
# Expected: 0

# 4. Build
pnpm build
# Expected: exit 0, no "two parallel pages" error

# 5. Stage + commit (Conventional Commits)
git add \
  src/app/admin/dashboard/page.tsx \
  src/app/admin/users/page.tsx \
  src/app/admin/moderation/page.tsx \
  src/app/admin/layout.tsx \
  docs/BUILD-FIX-DASHBOARD-COLLISION.md

git commit -m "fix(build): resolve dashboard route collision W29-critical

The (admin) and (community) route groups both had a /dashboard page.
Next.js route groups don't add a path segment, so both resolved to
/dashboard and Turbopack refused to compile.

Move the admin shell + dashboard + users + moderation out of the
(admin) group into a real admin/ directory so they live at /admin/*.
This aligns routing with AdminNav (which already linked to /admin/*)
and the requireAdmin() gate in the admin layout.

Refs: Wave 20 admin panel, Wave 24 a11y (#main-content anchor preserved)"

# 6. Push (when network available)
git push origin main
```

---

## Why Option A (not B or C)

The prompt offered:

- **A. Move `(admin)/dashboard` → `admin/dashboard`** ← Chosen
- **B. Move `(community)/dashboard` → `(community)/painel`** (renames user route to `/painel`)
- **C. Unify into one dashboard with `mode=admin`**

A is the right answer because:

1. **Community was already correct.** `(community)/` is the right home for the user dashboard. Renaming it to `/painel` (B) or folding admin into it (C) breaks the URL the rest of the codebase already links to (`/dashboard` is referenced in nav, redirects, and `/login?redirectTo=/dashboard` in the dashboard's own auth effect).
2. **Admin pages were already broken in two ways.** They were misrouted (no `/admin` prefix), AND they collided with the community page. Moving them once fixes both.
3. **No link updates needed.** `AdminNav` and every `active=` prop was already correct for `/admin/*`. The data layer (`requireAdmin()`) was already scoped to admin. The only thing wrong was the directory layout.

---

## Known Follow-ups (NOT done in this fix)

- **`AdminNav` references `/admin/audit` but no page exists.** Clicking the "Audit Log" tab in the admin nav will 404. Out of scope for the build fix; tracked separately. To fix: create `src/app/admin/audit/page.tsx` (it should fetch from the audit log table that the `Wave 11 Audit Log` work created).
- **Test suite may have e2e specs referencing old paths.** Search for `/dashboard` and `/admin/` in `tests/`, `e2e/`, and `__tests__/` directories after the build passes.
- **`requireAdmin()` redirects to `/` on prod denial.** That's by design (Wave 20), but the dev-mode banner is noisy — consider an audit of how often the gate fires in sandbox runs.

---

## Checklist for Verifier

- [ ] `rm -rf 'src/app/(admin)'` succeeds (sandbox shell must be healthy)
- [ ] `find src/app -name 'page.tsx' | sort` shows NO `src/app/(admin)/...` entries
- [ ] `find src/app -name 'page.tsx' | sort` shows exactly ONE `.../dashboard/page.tsx` (the community one)
- [ ] `pnpm build` exits 0 with no "two parallel pages" error
- [ ] `npx tsc -p tsconfig.json --noEmit` reports 0 errors
- [ ] `pnpm dev` and visit:
  - `/dashboard` → community dashboard (auth-gated, redirects to /login if anon)
  - `/admin/dashboard` → admin dashboard (404 / banner if not admin in dev)
  - `/admin/users`, `/admin/moderation` → admin pages
  - `/users`, `/moderation` → 404 (no longer public; was wrong before)
- [ ] `git log -1` shows the `fix(build): resolve dashboard route collision W29-critical` commit
- [ ] `git push origin main` succeeds when run locally

---

## Memory Note

The sandbox shell wedged on `rm -rf 'src/app/(admin)'` is consistent with the W22–W29 OOM pattern. For future route-group moves:

1. **Always use `git mv` first** — it's atomic and creates a clear diff. If it hangs, fall back to Write + delete.
2. **If `rm` hangs the shell**, do NOT keep retrying. Document the partial state and let the user run cleanup locally.
3. **Write tools work after shell wedge** — use them to create the new files; they'll be staged separately by git.

See `memory/sandbox-workarounds.md` for the full workaround set.