"""
context_bootstrap.py — Intelligent project context loader.

Reads ALL relevant project state and synthesizes it into a
compressed, queryable context snapshot for the multi-agent loop.

Sources:
  - Plans.md              → current iteration state
  - feature_list.json     → all features with status
  - .codegraph/           → live codebase structure
  - AGENTS.md chain       → DOX hierarchy
  - git status            → working tree state
  - tests status          → triad results
  - CHANGELOG.md         → release history
  - VERSION file          → current version
  - CLAUDE.md            → project rules
  - .trae/rules/         → project-specific rules

Output: compressed context snapshot → .autonomous/multi-agent/context_snapshot.json
"""

import json
import os
import subprocess
import hashlib
import time as _time
import fnmatch as _fnmatch
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

ROOT = Path("/home/skynet/cabala-dos-caminhos")
MA = ROOT / ".autonomous/multi-agent"
SNAPSHOT_FILE = MA / "context_snapshot.json"
MEMORY_FILE = MA / "memory.json"
PY_HEADROOM = ROOT / ".headroom-venv/bin/python"

# ─── Cache TTL constants ─────────────────────────────────────────────────────
TRIAD_CACHE_TTL = 300   # 5 minutes — triad results cached per git HEAD
GIT_CACHE_TTL   = 60   # 1 minute  — git status cached this long
CACHE_FILE      = MA / "bootstrap_cache.json"
PREV_SNAPSHOT   = MA / "prev_context_snapshot.json"

# ─── Light triad phases ───────────────────────────────────────────────────────
LIGHT_TRIAD_PHASES = {"RESEARCH", "PLANNING"}

# ─── Cache helpers ────────────────────────────────────────────────────────────

def _load_cache() -> dict:
    """Load cache from disk."""
    if CACHE_FILE.exists():
        try:
            return json.loads(CACHE_FILE.read_text())
        except Exception:
            pass
    return {"triad": None, "git": None, "full": None, "meta": {}}


def _save_cache(cache: dict) -> None:
    """Persist cache to disk."""
    content = json.dumps(cache, indent=2, ensure_ascii=False)
    CACHE_FILE.write_text(content)


def get_git_head() -> str:
    """Return current git HEAD commit hash."""
    try:
        r = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            capture_output=True, text=True, timeout=10, cwd=str(ROOT)
        )
        return r.stdout.strip() if r.returncode == 0 else ""
    except Exception:
        return ""


def _file_has_changed(pattern: str, since_mtime: float) -> bool:
    """
    Return True if any file matching `pattern` (e.g. '*.py') has mtime > since_mtime.
    Only checks apps/ and packages/ directories.
    """
    roots = [ROOT / "apps", ROOT / "packages"]
    cutoff = since_mtime
    for root in roots:
        if not root.exists():
            continue
        for dirpath, _, filenames in os.walk(root):
            for fname in filenames:
                if _fnmatch.fnmatch(fname, pattern):
                    fpath = Path(dirpath) / fname
                    try:
                        if fpath.stat().st_mtime > cutoff:
                            return True
                    except OSError:
                        pass
    return False


def _dox_has_changed(since_mtime: float) -> bool:
    """Return True if any AGENTS.md or DOX file changed since `since_mtime`."""
    roots = [ROOT, ROOT / "apps", ROOT / "packages", ROOT / "grimoire",
             ROOT / "tests", ROOT / "docs"]
    patterns = ["AGENTS.md", "DOX*", "*.DOX"]
    cutoff = since_mtime
    for root in roots:
        if not root.exists():
            continue
        for dirpath, _, filenames in os.walk(root):
            for fname in filenames:
                if any(_fnmatch.fnmatch(fname, p) for p in patterns):
                    fpath = Path(dirpath) / fname
                    try:
                        if fpath.stat().st_mtime > cutoff:
                            return True
                    except OSError:
                        pass
    return False


def _package_json_changed(since_mtime: float) -> bool:
    """Return True if package.json or any lock file changed."""
    files = [
        ROOT / "package.json",
        ROOT / "pnpm-lock.yaml",
        ROOT / "pnpm-workspace.yaml",
        ROOT / "apps" / "akasha-portal" / "package.json",
        ROOT / "packages" / "akasha-core" / "package.json",
    ]
    cutoff = since_mtime
    for f in files:
        if f.exists():
            try:
                if f.stat().st_mtime > cutoff:
                    return True
            except OSError:
                pass
    return False


def invalidate_cache(pattern: str = "full") -> dict:
    """
    Invalidate cache entries matching `pattern`.

    Patterns:
      - "triad"            — invalidate only the triad cache
      - "git"              — invalidate only the git status cache
      - "context"           — invalidate the full context cache
      - "full"             — invalidate all caches (triad + git + context)
      - "triad_and_context" — invalidate triad + context

    Returns dict describing what was invalidated.
    """
    cache = _load_cache()
    invalidated = []

    if pattern in ("triad", "full", "triad_and_context"):
        if cache.get("triad"):
            invalidated.append("triad")
            cache["triad"] = None

    if pattern in ("git", "full"):
        if cache.get("git"):
            invalidated.append("git")
            cache["git"] = None

    if pattern in ("context", "full", "triad_and_context"):
        if cache.get("full"):
            invalidated.append("context")
            cache["full"] = None

    _save_cache(cache)
    return {"invalidated": invalidated, "pattern": pattern}


def get_cached_triad(git_head: str = "") -> dict | None:
    """
    Return cached triad result if HEAD matches and TTL has not expired.
    Returns None if cache is stale or missing.
    """
    cache = _load_cache()
    triad = cache.get("triad")
    if not triad:
        return None
    meta = triad.get("_meta", {})
    cached_head = meta.get("git_head", "")
    cached_at = meta.get("cached_at", 0)
    age = _time.time() - cached_at
    if age > TRIAD_CACHE_TTL:
        return None
    if git_head and cached_head and cached_head != git_head:
        return None
    return triad


def get_cached_git() -> dict | None:
    """Return cached git status if TTL has not expired."""
    cache = _load_cache()
    git = cache.get("git")
    if not git:
        return None
    meta = git.get("_meta", {})
    cached_at = meta.get("cached_at", 0)
    if _time.time() - cached_at > GIT_CACHE_TTL:
        return None
    return git


def _store_triad_cache(triad: dict, git_head: str) -> None:
    """Store triad result in cache with timestamp and HEAD."""
    triad["_meta"] = {
        "cached_at": _time.time(),
        "git_head": git_head,
        "cache_hit": False,
    }
    cache = _load_cache()
    cache["triad"] = triad
    _save_cache(cache)


def _store_git_cache(git: dict) -> None:
    """Store git status in cache."""
    git["_meta"] = {"cached_at": _time.time()}
    cache = _load_cache()
    cache["git"] = git
    _save_cache(cache)


def _auto_detect_invalidation() -> str | None:
    """
    Check file-system timestamps to determine if any cache should be invalidated.

    Returns:
      - "full"    — package.json/lock changed
      - "context" — AGENTS.md/DOX changed
      - "triad"   — source files (.py/.ts/.tsx) changed
      - None      — no invalidation needed
    """
    cache = _load_cache()
    triad_meta = (cache.get("triad") or {}).get("_meta", {})
    triad_mtime = triad_meta.get("cached_at", 0)
    if not triad_mtime:
        return None

    if _package_json_changed(triad_mtime):
        return "full"
    if _dox_has_changed(triad_mtime):
        return "context"
    if (_file_has_changed("*.py",  triad_mtime) or
        _file_has_changed("*.ts",  triad_mtime) or
        _file_has_changed("*.tsx", triad_mtime)):
        return "triad"

    return None


# ─── CodeGraph wrapper ────────────────────────────────────────────────────────

def cg_status() -> dict:
    """Get CodeGraph index status."""
    try:
        r = subprocess.run(
            ["codegraph", "status"],
            capture_output=True, text=True, timeout=30, cwd=str(ROOT)
        )
        out = r.stdout
        stats = {}
        for line in out.splitlines():
            line = line.strip()
            if ":" in line:
                key, val = line.split(":", 1)
                key = key.strip().lower().replace(" ", "_")
                val = val.strip()
                if val:
                    stats[key] = val
        pending = "Pending Changes:" in out
        pending_count = 0
        if pending:
            for l in out.splitlines():
                if "Pending Changes:" in l:
                    import re
                    m = re.search(r"Added:\s+(\d+)", l)
                    if m:
                        pending_count = int(m.group(1))
        return {"ok": True, "stats": stats, "pending_changes": pending_count}
    except Exception as e:
        return {"ok": False, "error": str(e), "pending_changes": 0}


def cg_explore(question: str, max_lines: int = 200) -> str:
    """Run codegraph explore and return trimmed output."""
    try:
        r = subprocess.run(
            ["codegraph", "explore", question],
            capture_output=True, text=True, timeout=45, cwd=str(ROOT)
        )
        if r.returncode == 0 and r.stdout.strip():
            lines = r.stdout.splitlines()
            return "\n".join(lines[:max_lines])
    except Exception:
        pass
    return ""


def cg_architecture_summary() -> dict:
    """Get a high-level architecture summary via CodeGraph."""
    summary = {}

    for pkg in ["akasha-core", "core-astrology", "core-cabala", "core-iching",
                "core-odus", "core-tantra", "mentor"]:
        result = cg_explore(f"what does {pkg} export and what are its main entry points", max_lines=30)
        if result:
            summary[pkg] = result[:300]

    result = cg_explore("API routes in apps/akasha-portal/src/app/api", max_lines=40)
    if result:
        summary["api_routes"] = result[:300]

    for engine in ["synthesis-engine", "birth-chart", "mandala", "mentor"]:
        result = cg_explore(f"how does {engine} work and what files use it", max_lines=40)
        if result:
            summary[engine] = result[:300]

    return summary


# ─── File readers ────────────────────────────────────────────────────────────

def read_md(path: Path, max_chars: int = 5000) -> str:
    if not path.exists():
        return ""
    try:
        text = path.read_text(encoding="utf-8")
        return text[:max_chars] + ("..." if len(text) > max_chars else "")
    except Exception:
        return ""


def read_agents_chain() -> dict:
    """Read AGENTS.md hierarchy."""
    agents = {}
    dirs = [
        ROOT / "AGENTS.md",
        ROOT / "apps" / "AGENTS.md",
        ROOT / "packages" / "AGENTS.md",
        ROOT / "grimoire" / "AGENTS.md",
        ROOT / "tests" / "AGENTS.md",
    ]
    for d in dirs:
        if d.exists():
            content = read_md(d, max_chars=2000)
            if content:
                agents[str(d.relative_to(ROOT))] = content[:500]
    return agents


def parse_plans_md() -> dict:
    """Extract key info from Plans.md."""
    plans = {
        "iterations": [],
        "pending": [],
        "done": [],
        "blocked": [],
        "current_iteration": 0,
    }
    if not (ROOT / "Plans.md").exists():
        return plans

    try:
        content = (ROOT / "Plans.md").read_text()
        import re

        iter_blocks = re.findall(
            r"(?-mix:## cc: Ralph-loop iter (\d+).*?(?=## cc:|$))",
            content, re.DOTALL
        )
        for block in iter_blocks:
            iter_num = int(re.search(r"\d+", block).group()) if re.search(r"\d+", block) else 0
            done = "[x]" in block or "[x]" in block
            pending = "[~]" in block or "[x]" in block
            plans["iterations"].append({
                "num": iter_num,
                "done": done,
                "pending": pending,
                "preview": block[:200],
            })

        pending_items = re.findall(r"- \[ \] \*\*([A-Z]+-\d+)\*\*", content)
        plans["pending"] = pending_items[:20]

        done_items = re.findall(r"- \[x\] \*\*([A-Z]+-\d+)\*\*", content)
        plans["done"] = done_items[-20:]

        if iter_blocks:
            nums = []
            for b in iter_blocks:
                m = re.search(r"(?-mix:## cc: Ralph-loop iter (\d+))", b)
                if m:
                    nums.append(int(m.group(1)))
            if nums:
                plans["current_iteration"] = max(nums) + 1

    except Exception as e:
        plans["error"] = str(e)

    return plans


def parse_feature_list() -> dict:
    """Parse feature_list.json into categorized summary."""
    fl_path = ROOT / ".autonomous/feature_list.json"
    if not fl_path.exists():
        return {"total": 0, "pending": [], "done": [], "by_phase": {}}

    try:
        data = json.loads(fl_path.read_text())
        pending = [f for f in data if not f.get("passes", False)]
        done = [f for f in data if f.get("passes", False)]

        by_phase = {}
        for f in data:
            p = f.get("phase", "?")
            by_phase.setdefault(p, []).append(f.get("id", "?"))

        return {
            "total": len(data),
            "pending": [f.get("id", "?") for f in pending],
            "pending_count": len(pending),
            "done_count": len(done),
            "by_phase": by_phase,
            "top_pending": [
                {
                    "id": f.get("id", "?"),
                    "phase": f.get("phase", "?"),
                    "title": f.get("title", f.get("description", ""))[:60],
                    "priority": f.get("priority", "?"),
                }
                for f in pending[:8]
            ],
        }
    except Exception as e:
        return {"total": 0, "error": str(e)}


def git_status() -> dict:
    """Get git working tree status."""
    try:
        r = subprocess.run(
            ["git", "status", "--porcelain"],
            capture_output=True, text=True, timeout=10, cwd=str(ROOT)
        )
        lines = [l for l in r.stdout.splitlines() if l.strip()]
        untracked = sum(1 for l in lines if l.startswith("??"))
        modified = sum(1 for l in lines if not l.startswith("??"))
        return {
            "untracked": untracked,
            "modified": modified,
            "total": len(lines),
            "has_changes": len(lines) > 0,
        }
    except Exception:
        return {"untracked": -1, "modified": -1, "total": 0}


def run_triad() -> dict:
    """Run typecheck + tests + lint. Returns pass/fail per tool."""
    results = {}
    try:
        r = subprocess.run(
            ["pnpm", "--filter", "akasha-portal", "typecheck"],
            capture_output=True, text=True, timeout=120, cwd=str(ROOT)
        )
        results["typecheck"] = {"pass": r.returncode == 0, "lines": len(r.stdout.splitlines())}
    except Exception as e:
        results["typecheck"] = {"pass": False, "error": str(e)}

    try:
        r = subprocess.run(
            ["pnpm", "--filter", "akasha-portal", "test:run"],
            capture_output=True, text=True, timeout=180, cwd=str(ROOT)
        )
        import re
        summary = r.stdout + r.stderr
        passed_m = re.search(r"(\d+) passed", summary)
        failed_m = re.search(r"(\d+) failed", summary)
        passed = int(passed_m.group(1)) if passed_m else 0
        failed = int(failed_m.group(1)) if failed_m else 0
        results["tests"] = {
            "pass": r.returncode == 0 and failed == 0,
            "passed": passed,
            "failed": failed,
        }
    except Exception as e:
        results["tests"] = {"pass": False, "error": str(e)}

    try:
        r = subprocess.run(
            ["pnpm", "--filter", "akasha-portal", "lint"],
            capture_output=True, text=True, timeout=60, cwd=str(ROOT)
        )
        results["lint"] = {"pass": r.returncode == 0}
    except Exception as e:
        results["lint"] = {"pass": False, "error": str(e)}

    return results


def run_triad_light() -> dict:
    """
    Light triad: typecheck only.
    Used for RESEARCH/PLANNING phases to skip expensive test/lint runs.
    """
    results = {}
    try:
        r = subprocess.run(
            ["pnpm", "--filter", "akasha-portal", "typecheck"],
            capture_output=True, text=True, timeout=120, cwd=str(ROOT)
        )
        results["typecheck"] = {"pass": r.returncode == 0, "lines": len(r.stdout.splitlines())}
        results["_light"] = True
    except Exception as e:
        results["typecheck"] = {"pass": False, "error": str(e)}
        results["_light"] = True
    return results


# ─── Compress large text ─────────────────────────────────────────────────────

def compress_text(text: str) -> tuple[str, int]:
    """Compress via headroom. Returns (compressed, tokens_saved)."""
    if len(text) < 5000:
        return text, 0
    import tempfile
    tmp_in = None
    tmp_out = None
    try:
        tmp_in = tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False)
        tmp_in.write(text)
        tmp_in.close()
        tmp_out = tmp_in.name + ".compressed"
        proc = subprocess.run(
            [str(PY_HEADROOM), "-", tmp_in.name, tmp_out],
            input=(
                "import sys\nimport os\n"
                "os.environ['HEADROOM_QUIET']='1'\n"
                "from headroom import compress\n"
                f"src=open('{tmp_in.name}').read()\n"
                "r=compress(messages=[{'role':'user','content':src}])\n"
                "out=r.messages[0]['content'] if r.messages else ''\n"
                f"open('{tmp_out}','w').write(out)\n"
                "print(r.tokens_saved)\n"
            ),
            capture_output=True, text=True, timeout=60
        )
        if proc.returncode == 0 and os.path.exists(tmp_out):
            compressed = open(tmp_out).read()
            saved = int(proc.stdout.strip() or "0")
            return compressed, saved
    except Exception:
        pass
    finally:
        for f in [tmp_in.name, tmp_out]:
            try:
                os.unlink(f)
            except OSError:
                pass
    return text, 0


# ─── Main bootstrap ──────────────────────────────────────────────────────────

def build_snapshot(iteration: int = 0) -> dict:
    """
    Build a complete, fresh project context snapshot.
    This is the single source of truth for the loop before every action.
    """
    ts = datetime.now(timezone.utc).isoformat()
    snapshot = {
        "generated_at": ts,
        "iteration": iteration,
        "version": read_md(ROOT / "VERSION", max_chars=50).strip(),
        "plans": {},
        "features": {},
        "git": {},
        "triad": {},
        "codegraph": {},
        "agents_chain": {},
        "decision_factors": {},
    }

    snapshot["plans"] = parse_plans_md()
    snapshot["features"] = parse_feature_list()
    snapshot["git"] = git_status()

    cg_stat = cg_status()
    snapshot["codegraph"] = {
        "status_ok": cg_stat["ok"],
        "pending_files": cg_stat.get("pending_changes", 0),
        "needs_sync": cg_stat.get("pending_changes", 0) > 0,
        "stats": cg_stat.get("stats", {}),
    }

    arch = cg_architecture_summary()
    compressed_arch = {}
    total_arch = sum(len(v) for v in arch.values())
    if total_arch > 3000:
        for key, val in arch.items():
            c, s = compress_text(val)
            compressed_arch[key] = {"compressed": c, "saved": s}
    else:
        compressed_arch = arch
    snapshot["codegraph"]["architecture"] = compressed_arch

    snapshot["agents_chain"] = read_agents_chain()
    snapshot["triad"] = run_triad()

    pf = snapshot["features"]
    pending_count = pf.get("pending_count", 0)
    triad = snapshot["triad"]
    cg = snapshot["codegraph"]
    git = snapshot["git"]

    factors = {
        "has_pending_features": pending_count > 0,
        "pending_count": pending_count,
        "triad_all_green": all(t.get("pass", False) for t in triad.values() if isinstance(t, dict)),
        "triad_status": {k: v.get("pass", False) if isinstance(v, dict) else False for k, v in triad.items()},
        "codegraph_needs_sync": cg.get("needs_sync", False),
        "git_has_changes": git.get("has_changes", False),
        "untracked_files": git.get("untracked", 0),
        "current_phase": snapshot["plans"].get("current_iteration", iteration),
    }
    snapshot["decision_factors"] = factors

    return snapshot


def build_snapshot_smart(iteration: int = 0, phase: str = "RESEARCH") -> dict:
    """
    Build a context snapshot with intelligent caching.

    - Caches triad results for TRIAD_CACHE_TTL (5 min) per git HEAD.
    - Caches git status for GIT_CACHE_TTL (1 min).
    - Automatically invalidates caches when source files change.
    - Uses light triad (typecheck only) for RESEARCH/PLANNING phases.
    - Adds cache statistics to snapshot metadata.

    Returns the same structure as build_snapshot() plus:
      _cache_stats: {triad_cache_hit, triad_cache_age_s, git_cache_hit, git_cache_age_s}
    """
    cache_stats = {
        "triad_cache_hit": False,
        "triad_cache_age_s": 0.0,
        "git_cache_hit": False,
        "git_cache_age_s": 0.0,
    }

    pattern = _auto_detect_invalidation()
    if pattern:
        invalidate_cache(pattern)

    head = get_git_head()
    cached_triad = get_cached_triad(git_head=head)
    use_light_triad = phase in LIGHT_TRIAD_PHASES

    if cached_triad is not None:
        cache_stats["triad_cache_hit"] = True
        cache_stats["triad_cache_age_s"] = _time.time() - cached_triad["_meta"]["cached_at"]
        triad = cached_triad
    elif use_light_triad:
        triad = run_triad_light()
    else:
        triad = run_triad()

    snap = build_snapshot(iteration=iteration)
    snap["triad"] = triad

    cached_git = get_cached_git()
    if cached_git is not None:
        cache_stats["git_cache_hit"] = True
        cache_stats["git_cache_age_s"] = _time.time() - cached_git["_meta"]["cached_at"]
        snap["git"] = cached_git
    else:
        fresh_git = git_status()
        snap["git"] = fresh_git
        _store_git_cache(fresh_git)

    if not cache_stats["triad_cache_hit"]:
        _store_triad_cache(triad, head)

    snap["_cache_stats"] = cache_stats

    triad_result = snap["triad"]
    pf = snap["features"]
    pending_count = pf.get("pending_count", 0)
    cg = snap["codegraph"]
    git = snap["git"]

    factors = {
        "has_pending_features": pending_count > 0,
        "pending_count": pending_count,
        "triad_all_green": all(t.get("pass", False) for t in triad_result.values() if isinstance(t, dict)),
        "triad_status": {k: v.get("pass", False) if isinstance(v, dict) else False for k, v in triad_result.items()},
        "codegraph_needs_sync": cg.get("needs_sync", False),
        "git_has_changes": git.get("has_changes", False),
        "untracked_files": git.get("untracked", 0),
        "current_phase": snap["plans"].get("current_iteration", iteration),
    }
    snap["decision_factors"] = factors

    return snap


def save_snapshot(snap: dict, save_prev: bool = True) -> int:
    """
    Save snapshot. Compress if > 50KB. Returns size in bytes.
    If save_prev=True (default), copies the current snapshot to PREV_SNAPSHOT
    before overwriting, enabling compare_to_previous on the next run.
    """
    content = json.dumps(snap, indent=2, ensure_ascii=False)
    if len(content) > 50_000:
        compressed, saved = compress_text(content)
        content = compressed
        snap["_compressed"] = True
        snap["_compression_saved"] = saved

    if save_prev and SNAPSHOT_FILE.exists():
        try:
            PREV_SNAPSHOT.write_text(SNAPSHOT_FILE.read_text())
        except Exception:
            pass

    SNAPSHOT_FILE.write_text(content)
    return len(content)


def load_snapshot() -> dict:
    """Load last context snapshot."""
    if SNAPSHOT_FILE.exists():
        try:
            return json.loads(SNAPSHOT_FILE.read_text())
        except Exception:
            pass
    return {}


def compare_to_previous(snap: dict) -> dict:
    """
    Diff `snap` against the last saved snapshot (PREV_SNAPSHOT).
    Returns dict with keys:
      - changed_sections: top-level keys whose value changed
      - added: top-level keys present in snap but not in prev
      - removed: top-level keys present in prev but not in snap
      - has_changes: True if any diff detected
    """
    prev_path = PREV_SNAPSHOT
    if not prev_path.exists():
        return {"changed_sections": [], "added": [], "removed": [], "has_changes": False, "note": "no previous snapshot"}

    try:
        prev = json.loads(prev_path.read_text())
    except Exception:
        return {"changed_sections": [], "added": [], "removed": [], "has_changes": False, "note": "could not parse previous snapshot"}

    changed, added, removed = [], [], []
    all_keys = set(snap.keys()) | set(prev.keys())
    for key in all_keys:
        if key not in prev:
            added.append(key)
        elif key not in snap:
            removed.append(key)
        else:
            cur_val, prev_val = snap[key], prev[key]
            if isinstance(cur_val, dict) and isinstance(prev_val, dict):
                if json.dumps(cur_val, sort_keys=True) != json.dumps(prev_val, sort_keys=True):
                    changed.append(key)
            elif cur_val != prev_val:
                changed.append(key)

    return {
        "changed_sections": changed,
        "added": added,
        "removed": removed,
        "has_changes": len(changed) > 0 or len(added) > 0 or len(removed) > 0,
    }


def get_decision_recommendation(snap: dict) -> str:
    """
    Analyze snapshot and recommend the next action.
    This is the 'brain' that decides what the loop should do.
    """
    factors = snap.get("decision_factors", {})
    triad = snap.get("triad", {})
    features = snap.get("features", {})
    cg = snap.get("codegraph", {})
    git = snap.get("git", {})

    recommendations = []

    if cg.get("needs_sync"):
        recommendations.append(("codegraph_sync", "high", "CodeGraph index has pending changes — sync before spawning agents"))

    if git.get("has_changes"):
        untracked = git.get("untracked", 0)
        recommendations.append(("git_commit", "medium", f"Working tree has {untracked} untracked + {git.get('modified',0)} modified files"))

    if not all(t.get("pass", False) for t in triad.values() if isinstance(t, dict)):
        failing = [k for k, v in triad.items() if isinstance(v, dict) and not v.get("pass", False)]
        recommendations.append(("fix_triad", "high", f"Triad failing: {failing} — fix before new work"))

    pending = features.get("pending", [])
    if pending:
        top = pending[0] if pending else "?"
        recommendations.append(("next_feature", "normal", f"Top pending: {top}"))

    priority_order = ["fix_triad", "codegraph_sync", "git_commit", "next_feature"]
    for action, _, reason in recommendations:
        if action in priority_order[:2]:
            return f"[{action.upper()}] {reason}"
        break

    if pending:
        return f"[RESEARCH] Top pending: {pending[0]}"

    return "[DONE] No pending features. Project is current."


# ─── CLI ────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import sys

    phase = os.environ.get("LOOP_PHASE", "RESEARCH")
    snap = build_snapshot_smart(phase=phase)
    size = save_snapshot(snap)
    recommendation = get_decision_recommendation(snap)

    print(f"Context snapshot built: {size:,} bytes")
    print(f"Generated: {snap['generated_at']}")
    print(f"Decision:  {recommendation}")
    print()
    print(f"  Features: {snap['features'].get('pending_count', 0)} pending / {snap['features'].get('done_count', 0)} done")
    print(f"  Triad:    {snap['triad']}")
    print(f"  CodeGraph: pending={snap['codegraph'].get('pending_files', '?')} files")
    print(f"  Git:      untracked={snap['git'].get('untracked', 0)}, modified={snap['git'].get('modified', 0)}")
    if snap.get("plans", {}).get("pending"):
        print(f"  Plans:    {snap['plans']['pending'][:5]}")

    cs = snap.get("_cache_stats", {})
    if cs:
        print()
        print(f"  Cache stats:")
        print(f"    Triad:  hit={cs.get('triad_cache_hit', False)}, age={cs.get('triad_cache_age_s', 0):.1f}s")
        print(f"    Git:    hit={cs.get('git_cache_hit', False)}, age={cs.get('git_cache_age_s', 0):.1f}s")

    diff = compare_to_previous(snap)
    if diff.get("has_changes"):
        print()
        print(f"  Snapshot changed: added={diff.get('added', [])}, changed={diff.get('changed_sections', [])}, removed={diff.get('removed', [])}")
