# `omp commit` — Atomic Split Commits + Changelog

> Migrated from `akasha-loop-daemon.py` `phase_release()` custom git logic.
> Per §7 step 8 and §1 table: `commit/changelog custom` → `omp commit` (split atômico + changelog).

---

## What `omp commit` replaces

The `akasha-loop-daemon.py` `phase_release()` did this manually:

```python
# akasha-loop-daemon.py phase_release() — REPLACED
rc_add, _, _ = _run_cmd(["git", "add", "-A"], timeout=30)
msg = f"iter{iteration:03d}: autonomous evolution v9"
rc_commit, _, _ = _run_cmd(["git", "commit", "-m", msg], timeout=30)
# then manual CHANGELOG.md append
```

**`omp commit`** provides:
- **Atomic split commits** — if the change touches multiple logical areas (e.g., a spec change + a test + a implementation), `omp commit` splits into one commit per logical concern, each with an independent message.
- **Automatic changelog** — `CHANGELOG.md` is updated automatically from commit metadata (conventional commits format), no manual append needed.
- **Pre-commit hooks run** — triad (typecheck/test/lint) gates the commit automatically.
- **Branch-aware merge** — uses `task.isolation: worktree` + `merge: branch` to integrate the subagent branch cleanly.

---

## When to use

```
RESEARCH → PLANNING → IMPLEMENTATION → QA → VALIDATION → *omp commit* → RELEASE
                                                          ↑────────────────|
                                                    run AFTER validation passes
```

`omp commit` runs **after VALIDATION passes and before transitioning to the next RESEARCH cycle**. It is the integration step in the loop.

---

## Usage

```bash
# Full atomic commit with changelog (from project root)
omp commit

# Dry run — see what would be committed without changing anything
omp commit --dry-run

# Custom message (bypasses conventional-commit generation)
omp commit -m "fix(auth): refresh token race condition"

# Split commit — one commit per logical area
omp commit --split

# Help
omp commit --help
```

---

## Migration path for `akasha-loop-daemon.py`

In `phase_release()`, replace:

```python
# BEFORE (manual git + changelog)
rc_add, _, _ = _run_cmd(["git", "add", "-A"], timeout=30)
msg = f"iter{iteration:03d}: autonomous evolution v9"
rc_commit, _, _ = _run_cmd(["git", "commit", "-m", msg], timeout=30)

changelog_md = ROOT / "CHANGELOG.md"
if changelog_md.exists() and has_changes:
    improvements = _load_json(TASK_FILE, {}).get("improvements", [])
    imp_list = ", ".join(i.get("type", "") for i in improvements[:3])
    entry = f"\n## v0.87.0+ (iter {iteration}) — {imp_list}\n"
    changelog_md.write_text(changelog_md.read_text() + entry)
```

With a call to the `omp` CLI subprocess:

```python
# AFTER — delegate to omp commit
rc_omp, out_omp, err_omp = _run_cmd(["omp", "commit"], timeout=120)
if rc_omp != 0:
    log_error(f"omp commit failed: {err_omp}")
    commit_ok = False
else:
    commit_ok = True
    log(f"  omp commit: {out_omp.strip()}")
```

> **Note:** `omp commit` already handles changelog generation via conventional commits. Remove the manual `CHANGELOG.md` append entirely — `omp commit` does it better and without duplicate entries.

---

## Requirements before running

1. **VALIDATION must pass** — `omp commit` will abort if the working tree is dirty with failing tests.
2. **No uncommitted migration files** — Prisma migrations must be approved as `PROPOSAL`, never committed via `omp commit`.
3. **Clean worktree** (no `.pid`, `__pycache__`, logs, or runtime files) — these should already be gitignored.
4. **On a feature/branch** — `omp commit` integrates the subagent branch; it should never run directly on `main`.

---

## `omp commit` vs. manual `git commit`

| Concern | Manual (old) | `omp commit` (new) |
|---|---|---|
| Commit message | Generic `iterNNN: …` | Conventional commits auto-generated from diff |
| Split commits | Single monolithic commit | One commit per logical area |
| Changelog | Manual string append | Auto-generated from conventional commit scope |
| Pre-commit gate | None (or manual triad) | Runs typecheck + test + lint automatically |
| Merge strategy | `git add -A; git commit` | `task.isolation: worktree` + `merge: branch` |
| Atomicity | All-or-nothing | Split-but-atomic (all changes land or none) |

---

## AKASHA project specifics

- **Repository root:** `~/cabala-dos-caminhos`
- **Monorepo layout:** `apps/akasha-portal`, `packages/core-*`, `tests/`
- **Changelog:** `CHANGELOG.md` (root)
- **Build/test:** `bun run typecheck && bun run test`
- **CLI available at:** `/home/skynet/.bun/bin/omp` (v16.0.6)

---

## Troubleshooting

**`omp commit` aborts with "dirty worktree":**
- Run `bun run typecheck && bun run test` locally to identify failures.
- Check for untracked files: `git status`.

**No changes detected:**
- Ensure `VALIDATION` phase ran successfully and produced file changes.
- If the loop produced no changes (all candidates rejected), skip `omp commit` — nothing to integrate.

**Merge conflict:**
- `omp commit` will report the conflict. Resolve manually, then re-run `omp commit`.
- Never force-push to `main`.
