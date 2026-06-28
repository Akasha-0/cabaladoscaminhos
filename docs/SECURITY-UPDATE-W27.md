# SECURITY UPDATE — W27 (2026-06-28)

**Status:** ✅ RESOLVED (by parallel session + verified by this session)  
**Scope:** hono, undici, postcss, js-yaml, @hono/node-server (+ vite, esbuild devDeps exposed post-update)  
**Audit before:** 1 high + 8 moderate + 2 low = 11 vulnerabilities  
**Audit after:** 0 vulnerabilities (full + production)  
**Implemented in:** commit `f98ded3f` (Coordinator W27, "fix(lint): close 47 critical errors before push W27")  
**Note:** This document was authored by session `414122860626102` (Coder + Caio) **after** discovering the work was already in HEAD via parallel-session collision (see W24/W26 retrospective). All values below reflect the **actual state of `HEAD` as of `f98ded3f`**.

---

## TL;DR

| Package | Before | After | Patched | Severity Fixed |
|---|---|---|---|---|
| `hono` | 4.12.23 | 4.12.27 | ≥4.12.25 | HIGH (CORS), 5×MODERATE |
| `@hono/node-server` | 1.19.11/14 | 1.19.14 | ≥1.19.13 | MODERATE |
| `postcss` | 8.4.31 + 8.5.15 | 8.5.15 (only) | ≥8.5.10 | MODERATE (XSS via `</style>`) |
| `js-yaml` | 4.1.1 | 4.3.0 | ≥4.1.2 | MODERATE (DoS) |
| `undici` | 7.26.0 | 7.28.0 | ≥7.27.0 | defense-in-depth |
| `vite` | 8.0.14 | 8.0.16 | ≥8.0.16 | HIGH (`server.fs.deny` bypass) |
| `esbuild` | 0.28.0 | 0.28.1 | ≥0.28.1 | LOW (file read) |

`pnpm audit` (full tree): **No known vulnerabilities found**

---

## Why `pnpm.overrides` instead of direct updates

None of `hono`, `undici`, `postcss`, `js-yaml`, or `@hono/node-server` are direct dependencies of the project — they are all **transitive**. `pnpm` resolution showed:

| Package | Imported via (transitive) |
|---|---|
| `hono@4.12.27` | `@electric-sql/pglite-tools` → `@prisma/adapter-pg` (project dep) |
| `@hono/node-server@1.19.14` | `@electric-sql/pglite-tools` → `@prisma/adapter-pg` |
| `postcss@8.5.15` | `next`, `shadcn`, `vite`, `zustand` |
| `js-yaml@4.3.0` | `cosmiconfig`, `zustand` |
| `undici@7.28.0` | `jsdom` (devDep) |
| `vite@8.0.16` | `vitest` peerDep |
| `esbuild@0.28.1` | `tsx`, `vite`, `msw` |

Since we cannot directly bump transitive packages, we used **pnpm overrides** — which in **pnpm v11** must live in **`pnpm-workspace.yaml`** at the project root (the `pnpm.overrides` field in `package.json` was deprecated and ignored).

### Override block (`pnpm-workspace.yaml`)

```yaml
overrides:
  "hono": "^4.12.25"
  "@hono/node-server": "^1.19.14"
  "undici": "^7.27.0"
  "postcss": "^8.5.10"
  "js-yaml": "^4.1.2"
  "vite": "8.0.16"      # exact pin needed — ^8.0.16 was resolved to 8.0.14
  "esbuild": "0.28.1"    # exact pin needed
```

> ⚠️ Note: `vite` and `esbuild` overrides were initially written as semver ranges (`^8.0.16`, `^0.28.1`) but pnpm kept resolving to the old versions. Switching to **exact pins** forced pnpm to bump. This is a known quirk with `pnpm overrides` for versions where the caret semver range is not respected by the resolver.

---

## Vulnerabilities Closed (by advisory)

### hono — GHSA (HIGH + 5×MODERATE)

1. **HIGH** — CORS Middleware reflects any Origin with credentials enabled
2. **MODERATE** — Path traversal in `serve-static` on Windows
3. **MODERATE** — AWS Lambda adapter merges multiple `Set-Cookie` headers
4. **MODERATE** — Body Limit Middleware can be bypassed on AWS
5. **MODERATE** — Lambda@Edge adapter keeps only the last value of multiple `Set-Cookie`
6. (1 more moderate — see pnpm audit detail)

**Fixed in:** `hono@4.12.25` (we are on 4.12.27).

### @hono/node-server — GHSA (MODERATE)

- Middleware bypass via repeated headers

**Fixed in:** `@hono/node-server@1.19.13` (we are on 1.19.14).

### postcss — GHSA (MODERATE)

- XSS via unescaped `</style>` in CSS processing

**Fixed in:** `postcss@8.5.10` (we are on 8.5.15). Removed duplicate `postcss@8.4.31` from lockfile.

### js-yaml — GHSA (MODERATE)

- Quadratic-complexity DoS in merge key parsing

**Fixed in:** `js-yaml@4.1.2` (we are on 4.3.0).

### undici — GHSA (defense-in-depth)

- The brief flagged `undici ≥ 6.21.0` for TLS bypass via SOCKS5. The current audit (after we updated hono/etc.) does not flag undici as vulnerable because the transitive chain (`jsdom@29.1.1 → undici@7.26.0`) is past the affected range. We bumped to `undici@7.28.0` as defense-in-depth.

### vite — GHSA (HIGH — newly exposed after initial update)

- `server.fs.deny` bypass on Windows alternate data streams (path: `vite >=8.0.0 <=8.0.15`)
- `launch-editor` NTLMv2 hash disclosure via UNC path

**Fixed in:** `vite@8.0.16` (we are on 8.0.16).

### esbuild — GHSA (LOW)

- Arbitrary file read when running dev server

**Fixed in:** `esbuild@0.28.1` (we are on 0.28.1).

## Parallel-Session Collision (2026-06-28, lesson learned)

This session started with the brief to "update hono, undici, postcss" and began editing `package.json` and `pnpm-workspace.yaml`. However:

- Multiple W27 sessions were committing in parallel against `main`
- Commit `f98ded3f` (Coordinator W27, 2026-06-28 15:22 UTC) already implemented the same security update, including:
  - `pnpm-workspace.yaml` with the exact same overrides (`hono ^4.12.25`, `js-yaml ^4.1.2`, `undici ^7.27.0`, `postcss ^8.5.10`, `@hono/node-server ^1.19.14`, `vite 8.0.16`, `esbuild 0.28.1`)
  - `pnpm-lock.yaml` resolved to the patched versions
  - Bumped `eslint` to `^9.39.4` (needed to run lint in sandbox)
  - Plus 47 critical lint fixes
- My local edits were effectively no-ops by the time I checked `git status`
- This matches the W24 / W26 parallel-session collision pattern documented in agent memory

**Mitigation applied:** Re-read `git status`, `git diff HEAD -- package.json`, and `git show HEAD:pnpm-lock.yaml` before committing to verify which work is already in HEAD. Added a `git log --grep "W27"` scan to confirm scope.

---

## Verification (in sandbox, against `f98ded3f`)

| Check | Command | Result |
|---|---|---|
| Audit (prod) | `pnpm audit --prod` | ✅ No known vulnerabilities found |
| Audit (all) | `pnpm audit` | ✅ No known vulnerabilities found |
| TSC | `npx tsc --noEmit --skipLibCheck` | ✅ 0 project errors (1 pre-existing lib error in `csstype/index.d.ts` unrelated to this update) |
| Lint | `npm run lint` | ✅ 0 errors (no output) |

### Sandbox hang note

In this sandbox environment, `pnpm install` hangs during the symlink-creation phase after the lockfile is updated (see W26 retrospective 2026-06-27 — same pattern: git/tsc/pnpm install can hang due to memory pressure). The **lockfile is correct** and `pnpm audit` confirms 0 vulns based on the lockfile. To bring `node_modules` fully in sync, run `pnpm install` locally in a normal environment:

```bash
pnpm install --frozen-lockfile
```

---

## Regression check

| Project area | File | Status |
|---|---|---|
| `zustand` import | `src/lib/theme.ts:1` `import { create } from 'zustand';` | ✅ unchanged API (zustand 5.0.14 → 5.0.14) |
| `jsdom` (vitest env) | `vitest.config.ts`, `tests/**/@vitest-environment jsdom` | ✅ unchanged API (jsdom 29.1.1 → 29.1.1) |
| `@prisma/adapter-pg` consumer of `hono` | `package.json` `@prisma/adapter-pg: ^7.8.0` | ✅ unchanged API — hono is used internally by Prisma's adapter, not by app code |
| `next` build | `next 16.2.6` (uses `postcss` 8.5.15) | ✅ unchanged API |
| `vite` build (vitest) | `vitest 4.1.7` → 4.1.9 | ✅ minor patch |
| `tsx` (used by scripts) | uses `esbuild` 0.28.1 | ✅ unchanged API |

---

## Files Changed

### Already in `f98ded3f` (committed by Coordinator W27)
```
M  package.json                          # eslint ^9 → ^9.39.4 (lint runner fix)
A  pnpm-workspace.yaml                   # NEW — pnpm v11 overrides live here
M  pnpm-lock.yaml                        # 7 packages bumped to patched versions
+  47 lint fixes across src/
+  docs/LINT-FIX-W27.md
```

### Added by THIS session (414122860626102)
```
A  docs/SECURITY-UPDATE-W27.md          # this file (audit trail + override rationale)
```

> **Note on `package.json`**: The brief suggested using `pnpm.overrides` in `package.json`, but pnpm v11 ignores that field (warning: `The "pnpm" field in package.json is no longer read by pnpm`). The correct location is `pnpm-workspace.yaml` at the project root. No direct dependency changes were needed because all vulnerable packages are transitive.

---

## CI Recommendation

Add a **weekly** `pnpm audit --prod --audit-level=high` step to fail CI on any new HIGH/CRITICAL. Consider enabling GitHub Dependabot for automated PRs:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    groups:
      security:
        applies-to: security-updates
        patterns: ["*"]
    labels:
      - security
      - dependencies
```

For transitive dep security (since overrides are the only lever for transitive vulns in this project), add this check to `scripts/ci-local.sh`:

```bash
# scripts/ci-local.sh (add)
echo "🔒 Running pnpm audit..."
pnpm audit --prod --audit-level=moderate || {
  echo "❌ Moderate+ vulnerabilities found. Run pnpm audit for details."
  exit 1
}
```

---

## Cross-Project Reference

This same update pattern (transitive overrides via `pnpm-workspace.yaml` for hono/postcss/js-yaml/vite/esbuild) applies to any repo using:

- **Next.js** (hono via Prisma adapter)
- **zustand 5.x** (hono + js-yaml)
- **jsdom** (undici)
- **vite/vitest** (vite + esbuild)

---

**Already-committed (in `f98ded3f`):** `fix(lint): close 47 critical errors before push W27` (Coordinator W27)  
**Next commit (this session):** `docs(security): W27 audit trail + override rationale`

---

## Recommendations for Future Waves

1. **Pre-flight `git pull --rebase`** before starting any dep-update work to avoid stomping on parallel sessions
2. **Use `git worktree`** for wave fixes in multi-session windows (per W24/W26 retrospective)
3. **Verify before claiming**: `git status` + `git show HEAD:pnpm-lock.yaml` before committing dep changes
4. **Honest "already done" reporting**: when parallel session beats you to it, document the overlap and contribute audit/polish instead — this is the W24 + W26 pattern