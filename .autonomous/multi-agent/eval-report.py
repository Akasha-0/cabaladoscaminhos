#!/usr/bin/env python3
"""
Akasha Evolution Loop — Eval Report Generator
Reads metrics.json and prints a quality report with trend lines.
"""

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent if '__file__' in globals() else Path.cwd()
MA = ROOT / ".autonomous" / "multi-agent"
METRICS_FILE = MA / "metrics.json"


def _load_json(path: Path):
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text())
    except Exception:
        return {}


def _arrow(v: float, thresholds=(-0.01, 0.01)) -> str:
    """Unicode trend arrow."""
    lo, hi = thresholds
    if v > hi:
        return "↑"
    elif v < lo:
        return "↓"
    return "→"


def _pct(v: float) -> str:
    return f"{v * 100:.1f}%"


def _dur(s: float) -> str:
    if s < 1:
        return f"{s*1000:.0f}ms"
    if s < 60:
        return f"{s:.1f}s"
    return f"{s/60:.1f}m"


def _load_memory():
    mf = MA / "memory.json"
    return _load_json(mf)


def _load_version():
    vf = MA / "version.json"
    return _load_json(vf)


# ── Section printers ───────────────────────────────────────────────────────────

def _section(title: str, lines: list[str], width: int = 70) -> str:
    sep = "─" * width
    out = [f"\n{'━' * width}",
           f"  {title.upper()}",
           sep]
    out.extend(lines)
    return "\n".join(out)


def _kv(key: str, val: str) -> str:
    return f"  {key:<32} {val}"


def _kv_badge(key: str, val: str, ok: bool) -> str:
    badge = "✓" if ok else "✗"
    return f"  {key:<32} {badge}  {val}"


def _trend(vals: list[float]) -> str:
    if len(vals) < 2:
        return "–"
    slope = vals[-1] - vals[0]
    return f"{_arrow(slope)}  ({slope:+.3f} over {len(vals)-1} steps)"


def print_baseline_report(metrics_data: dict, memory_data: dict,
                           version_data: dict) -> str:
    out_lines = []

    # ── Header ──────────────────────────────────────────────────────────────
    out_lines.append(f"""
╔{'═' * 70}
║  AKASHA EVOLUTION LOOP — EVAL REPORT (BASELINE)
║  Generated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}
╚{'═' * 70}""".strip())

    # ── Dataset overview ──────────────────────────────────────────────────────
    hist = metrics_data.get("history", [])
    phase_hist = metrics_data.get("phase_history", [])
    version_changelog = version_data.get("changelog", [])

    out_lines.append(_section("dataset overview", [
        _kv("metrics.json history entries", str(len(hist))),
        _kv("phase_history entries", str(len(phase_hist))),
        _kv("memory.json iterations", str(memory_data.get("iteration", 0))),
        _kv("version changelog entries", str(len(version_changelog))),
    ]))

    # ── Memory learnings summary ───────────────────────────────────────────────
    learnings = memory_data.get("learnings", [])
    decisions = memory_data.get("decisions", [])

    by_phase: dict[str, int] = {}
    by_outcome: dict[str, int] = {}
    for lr in learnings:
        by_phase[lr.get("phase", "unknown")] = by_phase.get(lr.get("phase", "unknown"), 0) + 1
        by_outcome[lr.get("outcome", "unknown")] = by_outcome.get(lr.get("outcome", "unknown"), 0) + 1

    out_lines.append(_section("memory learnings", [
        _kv("total learnings", str(len(learnings))),
        _kv("total decisions", str(len(decisions))),
        _kv("by outcome", "  ".join(f"{k}={v}" for k, v in sorted(by_outcome.items()))),
    ] + [
        _kv(f"  phase/{p}", str(c)) for p, c in sorted(by_phase.items())
    ]))

    # ── Version history ────────────────────────────────────────────────────────
    ver_lines = []
    for entry in reversed(version_changelog[-10:]):
        ver_lines.append(
            _kv(f"  {entry.get('version', '?')}",
                f"{entry.get('improvement', '?')}  |  {entry.get('agents', 0)} agents  |  "
                f"{entry.get('ts', '')[:10]}")
        )
    if not ver_lines:
        ver_lines = ["  (no releases yet)"]
    out_lines.append(_section("version history (last 10)", ver_lines))

    # ── Phase breakdown ───────────────────────────────────────────────────────
    for phase in ["RESEARCH", "PLANNING", "IMPLEMENTATION", "QA", "VALIDATION", "RELEASE"]:
        recs = [r for r in phase_hist if r.get("phase") == phase]
        if not recs:
            continue

        durations = [r.get("duration_s", 0) for r in recs]
        avg_dur = sum(durations) / len(durations) if durations else 0
        last = recs[-1]
        last_metrics = last.get("metrics", {})

        phase_lines = [
            _kv("total recorded", str(len(recs))),
            _kv("avg duration", _dur(avg_dur)),
            _kv("last iteration", str(last.get("iteration", "?"))),
        ]

        if phase == "RESEARCH":
            phase_lines.extend([
                _kv("candidates found (last)", str(last_metrics.get("candidates_found", "–"))),
                _kv("candidates selected (last)", str(last_metrics.get("candidates_selected", "–"))),
                _kv("selection quality (last)", str(round(last_metrics.get("selection_quality", 0), 3))),
                _kv_badge("no improvement found (last)",
                          str(last_metrics.get("no_improvement_found", False)),
                          not last_metrics.get("no_improvement_found", False)),
            ])
        elif phase == "PLANNING":
            phase_lines.extend([
                _kv("plans created (last)", str(last_metrics.get("plans_created", "–"))),
                _kv("plans detail level (last)", str(round(last_metrics.get("plans_detail_level", 0), 1))),
                _kv_badge("plans updated (last)",
                          str(last_metrics.get("plans_updated", False)),
                          last_metrics.get("plans_updated", False)),
            ])
        elif phase == "IMPLEMENTATION":
            phase_lines.extend([
                _kv("agents spawned (last)", str(last_metrics.get("agents_spawned", "–"))),
                _kv("results collected (last)", str(last_metrics.get("results_collected", "–"))),
                _kv_badge("agent success rate (last)",
                          _pct(last_metrics.get("agent_success_rate", 0)),
                          last_metrics.get("agent_success_rate", 0) >= 0.5),
                _kv("files changed (last)", str(last_metrics.get("files_changed", "–"))),
            ])
        elif phase == "QA":
            phase_lines.extend([
                _kv_badge("typecheck pass (last)",
                          str(last_metrics.get("typecheck_pass", False)),
                          last_metrics.get("typecheck_pass", False)),
                _kv_badge("tests pass (last)",
                          str(last_metrics.get("tests_pass", False)),
                          last_metrics.get("tests_pass", False)),
                _kv("improvements accepted (last)",
                    str(last_metrics.get("improvements_accepted", "–"))),
            ])
        elif phase == "VALIDATION":
            phase_lines.extend([
                _kv("improvements validated (last)",
                    str(last_metrics.get("improvements_validated", "–"))),
                _kv_badge("quality score (last)",
                          _pct(last_metrics.get("quality_score", 0)),
                          last_metrics.get("quality_score", 0) >= 0.5),
                _kv_badge("codegraph sync (last)",
                          str(last_metrics.get("codegraph_sync_ok", False)),
                          last_metrics.get("codegraph_sync_ok", False)),
                _kv_badge("plans marked (last)",
                          str(last_metrics.get("plans_marked", False)),
                          last_metrics.get("plans_marked", False)),
            ])
        elif phase == "RELEASE":
            phase_lines.extend([
                _kv_badge("release quality (last)",
                          _pct(last_metrics.get("release_quality", 0)),
                          last_metrics.get("release_quality", 0) >= 0.5),
                _kv_badge("commit clean (last)",
                          str(last_metrics.get("commit_messages_clean", True)),
                          last_metrics.get("commit_messages_clean", True)),
                _kv_badge("changelog updated (last)",
                          str(last_metrics.get("changelog_updated", False)),
                          last_metrics.get("changelog_updated", False)),
                _kv_badge("version bumped (last)",
                          str(last_metrics.get("version_bumped", False)),
                          last_metrics.get("version_bumped", False)),
            ])

        out_lines.append(_section(f"phase: {phase}", phase_lines))

    # ── Iteration-level quality scores ─────────────────────────────────────────
    if hist:
        out_lines.append(_section("iteration quality scores", [
            _kv("iteration", "impl_quality  qa_quality  loop_quality  trend"),
        ] + [
            f"  {r.get('iteration', '?'):<6}  "
            f"  impl={_pct(r.get('impl_quality', 0))}"
            f"  qa={_pct(r.get('qa_quality', 0))}"
            f"  loop={_pct(r.get('loop_quality', 0))}"
            for r in hist
        ]))

        # Trends
        loop_qs = [r.get("loop_quality", 0) for r in hist]
        impl_qs = [r.get("impl_quality", 0) for r in hist]
        qa_qs   = [r.get("qa_quality", 0) for r in hist]

        out_lines.append("\n" + "─" * 70)
        out_lines.append("  QUALITY TRENDS (last 10 iterations)")
        out_lines.append(f"  {'metric':<20} {'values':<40} {'trend'}")
        out_lines.append(f"  {'─'*20} {'─'*40} {'─'*20}")
        out_lines.append(f"  {'loop_quality':<20} {str([round(v,2) for v in loop_qs]):<40} {_trend(loop_qs)}")
        out_lines.append(f"  {'impl_quality':<20} {str([round(v,2) for v in impl_qs]):<40} {_trend(impl_qs)}")
        out_lines.append(f"  {'qa_quality':<20} {str([round(v,2) for v in qa_qs]):<40} {_trend(qa_qs)}")

    # ── Empty-state guidance ────────────────────────────────────────────────────
    if not hist and not phase_hist:
        out_lines.append("""
┌──────────────────────────────────────────────────────────────────────┐
│  BASELINE ONLY — No loop iterations completed yet.                  │
│                                                                      │
│  After the first full RELEASE phase the metrics framework will       │
│  begin accumulating quality scores and trend data automatically.     │
│                                                                      │
│  Current state from state.json is used as the initial baseline.     │
└──────────────────────────────────────────────────────────────────────┘""")

    return "\n".join(out_lines)


def main():
    metrics_data = _load_json(METRICS_FILE)
    memory_data  = _load_memory()
    version_data = _load_version()

    report = print_baseline_report(metrics_data, memory_data, version_data)
    print(report)

    # Also emit machine-readable summary as JSON for tooling
    if "--json" in sys.argv:
        summary = {
            "total_iterations": len(metrics_data.get("history", [])),
            "total_phases": len(metrics_data.get("phase_history", [])),
            "memory_iteration": memory_data.get("iteration", 0),
            "version_entries": len(version_data.get("changelog", [])),
            "last_changelog": version_data.get("changelog", [{}])[-1] if version_data.get("changelog") else {},
        }
        print("\n\n--- JSON SUMMARY ---")
        print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
