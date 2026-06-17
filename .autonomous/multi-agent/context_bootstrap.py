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
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

ROOT = Path("/home/skynet/cabala-dos-caminhos")
MA = ROOT / ".autonomous/multi-agent"
SNAPSHOT_FILE = MA / "context_snapshot.json"
MEMORY_FILE = MA / "memory.json"
PY_HEADROOM = ROOT / ".headroom-venv/bin/python"

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

    # Key packages
    for pkg in ["akasha-core", "core-astrology", "core-cabala", "core-iching",
                "core-odus", "core-tantra", "mentor"]:
        result = cg_explore(f"what does {pkg} export and what are its main entry points", max_lines=30)
        if result:
            summary[pkg] = result[:300]

    # Portal routes
    result = cg_explore("API routes in apps/akasha-portal/src/app/api", max_lines=40)
    if result:
        summary["api_routes"] = result[:300]

    # Key engines
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

        # Extract iteration blocks
        iter_blocks = re.findall(
            r"(?-mix:## cc: Ralph-loop iter (\d+).*?(?=## cc:|$))",
            content, re.DOTALL
        )
        for block in iter_blocks:
            iter_num = int(re.search(r"\d+", block).group()) if re.search(r"\d+", block) else 0
            done = "[x]" in block or "✅" in block
            pending = "[~]" in block or "⏳" in block
            plans["iterations"].append({
                "num": iter_num,
                "done": done,
                "pending": pending,
                "preview": block[:200],
            })

        # Find pending items
        pending_items = re.findall(r"- \[ \] \*\*([A-Z]+-\d+)\*\*", content)
        plans["pending"] = pending_items[:20]

        # Find done items
        done_items = re.findall(r"- \[x\] \*\*([A-Z]+-\d+)\*\*", content)
        plans["done"] = done_items[-20:]

        # Current iteration number
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
    # typecheck
    try:
        r = subprocess.run(
            ["pnpm", "--filter", "akasha-portal", "typecheck"],
            capture_output=True, text=True, timeout=120, cwd=str(ROOT)
        )
        results["typecheck"] = {"pass": r.returncode == 0, "lines": len(r.stdout.splitlines())}
    except Exception as e:
        results["typecheck"] = {"pass": False, "error": str(e)}

    # tests (quick run, not watch)
    try:
        r = subprocess.run(
            ["pnpm", "--filter", "akasha-portal", "test:run"],
            capture_output=True, text=True, timeout=180, cwd=str(ROOT)
        )
        # Parse test summary
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

    # lint
    try:
        r = subprocess.run(
            ["pnpm", "--filter", "akasha-portal", "lint"],
            capture_output=True, text=True, timeout=60, cwd=str(ROOT)
        )
        results["lint"] = {"pass": r.returncode == 0}
    except Exception as e:
        results["lint"] = {"pass": False, "error": str(e)}

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

    # 1. Plans.md
    snapshot["plans"] = parse_plans_md()

    # 2. Feature list
    snapshot["features"] = parse_feature_list()

    # 3. Git status
    snapshot["git"] = git_status()

    # 4. CodeGraph status + architecture summary
    cg_stat = cg_status()
    snapshot["codegraph"] = {
        "status_ok": cg_stat["ok"],
        "pending_files": cg_stat.get("pending_changes", 0),
        "needs_sync": cg_stat.get("pending_changes", 0) > 0,
        "stats": cg_stat.get("stats", {}),
    }

    # Architecture summary (compressed)
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

    # 5. AGENTS.md chain
    snapshot["agents_chain"] = read_agents_chain()

    # 6. Triad (typecheck + tests + lint)
    snapshot["triad"] = run_triad()

    # 7. Decision factors
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


def save_snapshot(snap: dict) -> int:
    """Save snapshot. Compress if > 50KB. Returns size in bytes."""
    content = json.dumps(snap, indent=2, ensure_ascii=False)
    if len(content) > 50_000:
        compressed, saved = compress_text(content)
        content = compressed
        snap["_compressed"] = True
        snap["_compression_saved"] = saved

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

    # CodeGraph sync check
    if cg.get("needs_sync"):
        recommendations.append(("codegraph_sync", "high", "CodeGraph index has pending changes — sync before spawning agents"))

    # Git changes check
    if git.get("has_changes"):
        untracked = git.get("untracked", 0)
        recommendations.append(("git_commit", "medium", f"Working tree has {untracked} untracked + {git.get('modified',0)} modified files"))

    # Triad health
    if not all(t.get("pass", False) for t in triad.values() if isinstance(t, dict)):
        failing = [k for k, v in triad.items() if isinstance(v, dict) and not v.get("pass", False)]
        recommendations.append(("fix_triad", "high", f"Triad failing: {failing} — fix before new work"))

    # Pending features
    pending = features.get("pending", [])
    if pending:
        top = pending[0] if pending else "?"
        recommendations.append(("next_feature", "normal", f"Top pending: {top}"))

    # Build decision
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

    snap = build_snapshot()
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
