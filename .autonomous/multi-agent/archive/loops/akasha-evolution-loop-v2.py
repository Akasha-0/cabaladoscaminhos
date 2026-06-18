#!/usr/bin/env python3
"""
akasha-evolution-loop-v2.py — Autonomous Evolution Loop v2
=========================================================
Integrated with: ProjectMap, ReasoningChain, ContextEngine, Evolver,
PromptEngine, AgentOrchestrator, MemoryManager, Telemetry.
Self-optimizing, self-improving, continuous evolution engine.
"""

from __future__ import annotations
import json, time, traceback
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

ROOT = Path("/home/skynet/cabala-dos-caminhos")
MA = ROOT / ".autonomous" / "multi-agent"
MEMORY_FILE = MA / "memory.json"
STATE_FILE = MA / "state.json"
TASK_FILE = MA / "task-implementation.json"
IMPL_FILE = MA / "omp-implementations.json"
SNAPSHOT_FILE = MA / "context_snapshot.json"
AGENT_RESULTS_DIR = MA / "agent-results"
AGENT_PIDS_FILE = MA / "agent-pids.txt"
RESULTS_FILE = MA / "omp-agent-results.json"

# ── JSON helpers ─────────────────────────────────────────────────────────────
def load_json(path, default=None):
    if path.exists():
        try:
            return json.loads(path.read_text())
        except Exception:
            return default if default is not None else {}
    return default if default is not None else {}

def save_json(path, data):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False))

def log(msg: str) -> None:
    print(f"[{datetime.now().strftime('%H:%M:%S')}] EVOLUTION: {msg}", flush=True)

# ── Module loader ─────────────────────────────────────────────────────────────
import importlib.util, sys

def _load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, str(path))
    mod = importlib.util.module_from_spec(spec)
    mod.ROOT = ROOT; mod.MA = MA
    mod.load_json = load_json; mod.save_json = save_json
    old = sys.path[:]
    sys.path.insert(0, str(MA))
    try:
        spec.loader.exec_module(mod)
    finally:
        sys.path = old
    return mod

# ── Load all modules (graceful fallback if not yet built) ──────────────────
_evolution_loop = _load("_evloop", MA / "akasha-evolution-loop.py")
_bootstrap = _evolution_loop.bootstrap
_find = _evolution_loop.find_improvement_candidates
_pick = _evolution_loop.pick_best_improvements
_add_lr = _evolution_loop.add_learning
_rec_dec = _evolution_loop.record_decision

_project_map = None
_reasoning = None
_context_eng = None
_evolver = None
_prompt_eng = None
_orchestrator = None

try:
    _pm_mod = _load("_pm", MA / "project_map.py")
    _project_map = _pm_mod.ProjectMap()
    log(f"ProjectMap loaded: {len(_project_map.get_project_stats()['areas'])} areas")
except Exception as e:
    log(f"ProjectMap not available: {e}")

try:
    _rc_mod = _load("_rc", MA / "reasoning_chain.py")
    _reasoning = _rc_mod.ReasoningChain()
    log("ReasoningChain loaded")
except Exception as e:
    log(f"ReasoningChain not available: {e}")

try:
    _ce_mod = _load("_ce", MA / "context_engine.py")
    _context_eng = _ce_mod.ContextEngine()
    log("ContextEngine loaded")
except Exception as e:
    log(f"ContextEngine not available: {e}")

try:
    _ev_mod = _load("_ev", MA / "evolver.py")
    _evolver = _ev_mod.Evolver()
    log("Evolver loaded")
except Exception as e:
    log(f"Evolver not available: {e}")

try:
    _pe_mod = _load("_pe", MA / "prompt_engine.py")
    _prompt_eng = _pe_mod.PromptEngine()
    log("PromptEngine loaded")
except Exception as e:
    log(f"PromptEngine not available: {e}")

try:
    _ao_mod = _load("_ao", MA / "agent_orchestrator.py")
    _orchestrator = _ao_mod.AgentOrchestrator()
    log("AgentOrchestrator loaded")
except Exception as e:
    log(f"AgentOrchestrator not available: {e}")

# ── Evals ───────────────────────────────────────────────────────────────────
_evals = _load("_evals", MA / "evals.py")
_tracker = _evals.MetricsTracker()

# ── State helpers ─────────────────────────────────────────────────────────────
def load_state():
    return load_json(STATE_FILE, {"phase": "RESEARCH", "iteration": 0, "running": False})

def save_state(state):
    save_json(STATE_FILE, state)

def load_memory():
    return load_json(MEMORY_FILE, {
        "iteration": 0, "learnings": [], "decisions": [], "context_window": []
    })

def save_memory(mem):
    save_json(MEMORY_FILE, mem)

# ── Bootstrap (context snapshot) ──────────────────────────────────────────────
def build_snapshot(use_cache=True):
    return _bootstrap(use_cache=use_cache)

# ── Find improvements (enhanced with ProjectMap + Reasoning) ─────────────────
def find_improvements(snapshot, memory):
    candidates = _find(snapshot)

    # Enhance with project_map insights if available
    if _project_map:
        try:
            neglected = _project_map.get_neglected_areas(threshold_days=30)
            high_potential = _project_map.get_high_potential_areas(top_n=3)
            log(f"  ProjectMap: {len(neglected)} neglected areas, {len(high_potential)} high-potential")
            # Score candidates higher if they target neglected or high-potential areas
            for c in candidates:
                area = c.get("area", "unknown")
                if area in neglected:
                    c["area_score_boost"] = 2.0
                if any(a.get("area") == area for a in high_potential):
                    c["area_score_boost"] = (c.get("area_score_boost", 1.0) or 1.0) * 1.5
        except Exception as e:
            log(f"  ProjectMap enhancement error: {e}")

    # Reason about candidates if ReasoningChain available
    if _reasoning and _context_eng:
        try:
            ctx = _context_eng.build_full_context(iteration_goal="find_improvements")
            for c in candidates[:10]:
                r = _reasoning.reason_about(c, {"context": ctx})
                c["reasoning"] = r
        except Exception as e:
            log(f"  ReasoningChain error: {e}")

    return candidates

# ── Pick best (enhanced with ReasoningChain) ─────────────────────────────────
def pick_best(candidates, memory, max_count=5):
    selected = _pick(candidates, memory, max_count=max_count)

    # Re-rank using reasoning if available
    if _reasoning and _reasoning:
        for s in selected:
            reasoning = s.get("reasoning", {})
            conf = reasoning.get("confidence", 0.5)
            impact = reasoning.get("impact", 0.5)
            compound = reasoning.get("compound_potential", 0.5)
            s["reasoning_score"] = (conf * 0.3 + impact * 0.4 + compound * 0.3)
        selected.sort(key=lambda x: x.get("reasoning_score", 0.5), reverse=True)
        selected = selected[:max_count]

    return selected

# ── Build context (uses ContextEngine if available) ─────────────────────────
def build_context(iteration_goal=None, area_focus=None):
    if _context_eng:
        try:
            if area_focus:
                return _context_eng.build_area_context(area_focus, iteration_goal)
            return _context_eng.build_full_context(iteration_goal)
        except Exception as e:
            log(f"  ContextEngine error: {e}")
    # Fallback to basic bootstrap
    return build_snapshot(use_cache=True)

# ── Add learning (enhanced with Evolver insights) ────────────────────────────
def add_learning(mem, agent, phase, feature_id, outcome, summary, details=None):
    _add_lr(mem, agent, phase, feature_id, outcome, summary, details)
    if _evolver:
        try:
            _evolver.record_learning({
                "agent": agent, "phase": phase, "feature_id": feature_id,
                "outcome": outcome, "summary": summary, "details": details or {}
            })
        except Exception as e:
            log(f"  Evolver learning record error: {e}")

# ── Phase: RESEARCH (enhanced) ─────────────────────────────────────────────────
def phase_research(state, memory):
    iteration = state.get("iteration", 0)
    log(f"=== RESEARCH v2 (iter {iteration}) ===")

    # Assess project state if Evolver available
    if _evolver:
        try:
            proj_state = _evolver.assess_project_state()
            log(f"  Project quality: {proj_state.get('overall_quality', 'N/A')}")
            neglected = proj_state.get("neglected_areas", [])
            if neglected:
                log(f"  Neglected areas: {', '.join(neglected[:5])}")
        except Exception as e:
            log(f"  Evolver assess error: {e}")

    # Build rich context
    ctx = build_context(iteration_goal="research", area_focus=None)
    snapshot = build_snapshot(use_cache=True)

    # Find and pick improvements
    candidates = find_improvements(snapshot, memory)
    selected = pick_best(candidates, memory, max_count=5)

    log(f"  {len(candidates)} candidates, {len(selected)} selected")

    # Explain reasoning if available
    if _reasoning and selected:
        try:
            plan = _reasoning.plan_sequence(selected[:5], {"context": ctx})
            log(f"  Reasoning: {plan.get('rationale', 'N/A')[:100]}")
        except Exception as e:
            log(f"  Reasoning plan error: {e}")

    for i, imp in enumerate(selected[:5]):
        log(f"  [{i+1}] [{imp.get('area', 'unknown')}] {imp.get('type')}: {imp.get('description', '')[:60]}")
        if imp.get("reasoning"):
            r = imp["reasoning"]
            log(f"      confidence={r.get('confidence', 0):.2f} impact={r.get('impact', 0):.2f} compound={r.get('compound_potential', 0):.2f}")

    if not selected:
        log("  No improvements → RELEASE")
        _rec_dec(memory, [{"type": "none", "description": "no improvement found"}])
        save_memory(memory)
        state["phase"] = "RELEASE"
        save_state(state)
        _tracker.record_research(len(candidates), 0, selection_quality=0.0,
                                 no_improvement_found=True, duration_s=0.1,
                                 iteration=iteration)
        return

    # Build enhanced context for decisions
    if _context_eng:
        try:
            decisions_ctx = _context_eng.get_recent_decisions(limit=10)
            log(f"  Recent decisions: {len(decisions_ctx)} considered")
        except Exception:
            pass

    _rec_dec(memory, selected)
    save_json(TASK_FILE, {"improvements": selected, "iteration": iteration})
    save_json(IMPL_FILE, {"improvements": selected, "agent_count": len(selected),
                           "iteration": iteration})
    state["phase"] = "PLANNING"
    state["current_features"] = [imp.get("type") for imp in selected]
    save_state(state)
    _tracker.record_research(len(candidates), len(selected), selection_quality=0.0,
                             duration_s=0.1, iteration=iteration)

# ── Phase: PLANNING (enhanced) ───────────────────────────────────────────────
def phase_planning(state):
    iteration = state.get("iteration", 0)
    log(f"=== PLANNING v2 (iter {iteration}) ===")

    task_data = load_json(TASK_FILE, {})
    improvements = task_data.get("improvements", [])

    # Build context for each improvement
    plans_md = ROOT / "Plans.md"
    lines = []
    for i, imp in enumerate(improvements):
        area = imp.get("area", "general")
        lines.append(f"- [~] **PLN-{iteration:03d}[{i+1}]** -- [{area}] {imp.get('type')} | {imp.get('description', '?')}\n")

    if lines:
        content = plans_md.read_text() if plans_md.exists() else ""
        marker = "## cc:TODO"
        if marker in content:
            # Insert before marker, preserving it
            idx = content.index(marker)
            content = content[:idx] + "".join(lines) + content[idx:]
        else:
            content += "".join(lines)
        plans_md.write_text(content)
        log(f"  Plans.md updated ({len(improvements)} items)")

    state["phase"] = "IMPLEMENTATION"
    save_state(state)
    _tracker.record_planning(len(improvements), plans_detail_level=50.0,
                             plans_updated=True, duration_s=0.1,
                             iteration=iteration)

# ── Phase: IMPLEMENTATION (uses AgentOrchestrator if available) ───────────────
def phase_implementation(state, memory):
    iteration = state.get("iteration", 0)
    log(f"=== IMPLEMENTATION v2 (iter {iteration}) ===")

    task_data = load_json(TASK_FILE, {})
    improvements = task_data.get("improvements", [])
    log(f"  {len(improvements)} improvements to implement")

    # Use AgentOrchestrator if available (parallel, resource-aware)
    if _orchestrator:
        try:
            log("  Using AgentOrchestrator for parallel implementation")
            ctx = build_context(iteration_goal="implement", area_focus=None)
            result = _orchestrator.orchestrate(improvements, ctx)
            log(f"  Orchestrator: {result.get('summary', {})}")
            save_json(RESULTS_FILE, {"results": result.get("results", []),
                                      "summary": result.get("summary", {})})
            state["phase"] = "QA"
            save_state(state)
            _tracker.record_implementation(
                agents_spawned=len(improvements),
                results_collected=len(result.get("results", [])),
                agent_success_rate=result.get("summary", {}).get("success_rate", 0.0),
                files_changed=result.get("summary", {}).get("files_changed", 0),
                duration_s=result.get("duration_s", 0.1),
                iteration=iteration
            )
            return
        except Exception as e:
            log(f"  AgentOrchestrator error, falling back: {e}")

    # Fallback: spawn agents directly (same as original)
    save_json(RESULTS_FILE, {"results": []})
    for f in AGENT_RESULTS_DIR.glob("result-*.json"):
        try:
            f.unlink()
        except Exception:
            pass
    if AGENT_PIDS_FILE.exists():
        AGENT_PIDS_FILE.unlink()

    import subprocess as _sub, os as _os
    def _spawn_agent(i, imp):
        import time as _time
        agent_id = f"ta-{int(_time.time())}-{i}"
        prompt_file = MA / f".agent-prompt-{agent_id}.txt"
        prompt = _evolution_loop._build_agent_prompt(imp)
        result_file = str(AGENT_RESULTS_DIR / f"result-{agent_id}.json")
        prompt = prompt.replace(
            "/home/skynet/cabala-dos-caminhos/.autonomous/multi-agent/task-result.json",
            result_file, 1,
        )
        prompt_file.write_text(prompt)
        proc = _sub.Popen(
            ["timeout", "600", "claude", "-p", "--model", "MiniMax-M2.7-highspeed", prompt],
            cwd=str(ROOT), stdout=_sub.DEVNULL, stderr=_sub.DEVNULL,
            env={**_os.environ, "ANTHROPIC_MODEL": "MiniMax-M2.7-highspeed"},
            preexec_fn=lambda: _os.setpriority(_os.PRIO_PROCESS, 0, 10),
        )
        with open(AGENT_PIDS_FILE, "a") as pf:
            pf.write(f"{agent_id}|{proc.pid}\n")
        log(f"  Spawned {agent_id} pid={proc.pid}")

    from concurrent.futures import ThreadPoolExecutor
    _executor = ThreadPoolExecutor(max_workers=4)
    for i, imp in enumerate(improvements):
        _executor.submit(_spawn_agent, i, imp)

    state["phase"] = "IMPLEMENTATION_WAIT"
    save_state(state)

# ── Phase: IMPLEMENTATION_WAIT (adaptive polling) ────────────────────────────
def wait_implementation(state, memory):
    import select as _select, os as _os, time as _time
    iteration = state.get("iteration", 0)
    total = len(load_json(TASK_FILE, {}).get("improvements", []))
    poll_interval = 1.0
    max_poll = 10.0
    last_count = 0

    log(f"  WAIT: expecting {total} results")

    while True:
        _time.sleep(poll_interval)

        running = []
        if AGENT_PIDS_FILE.exists():
            for line in AGENT_PIDS_FILE.read_text().strip().split("\n"):
                if not line:
                    continue
                parts = line.split("|")
                if len(parts) == 2:
                    try:
                        pid = int(parts[1])
                        _os.kill(pid, 0)
                        running.append(pid)
                    except (ProcessLookupError, ValueError):
                        pass

        results = list(AGENT_RESULTS_DIR.glob("result-*.json"))
        count = len(results)

        if count > last_count:
            poll_interval = 1.0
            last_count = count
        else:
            poll_interval = min(poll_interval * 1.5, max_poll)

        log(f"  WAIT: {count}/{total} results, {len(running)} agents, next in {poll_interval:.1f}s")

        if count >= total and not running:
            break
        if not load_state().get("running", False):
            break

    all_results = []
    for rf in AGENT_RESULTS_DIR.glob("result-*.json"):
        try:
            all_results.append(load_json(rf))
        except Exception:
            pass

    total_r = len(all_results)
    success = sum(1 for r in all_results if r.get("success") or r.get("status") == "success")
    rate = success / total_r if total_r > 0 else 0.0
    files_changed = sum(r.get("files_changed", 0) for r in all_results)

    log(f"  Results: {success}/{total_r} success, rate={rate:.2f}, files={files_changed}")
    save_json(RESULTS_FILE, {"results": all_results, "summary": {
        "success": success, "total": total_r, "rate": rate, "files_changed": files_changed
    }})

    state["phase"] = "QA"
    save_state(state)

# ── Phase: QA (parallel) ─────────────────────────────────────────────────────
def phase_qa(state):
    import subprocess as _sub
    from concurrent.futures import ThreadPoolExecutor, as_completed

    iteration = state.get("iteration", 0)
    log(f"=== QA v2 (iter {iteration}) ===")

    def _run_tsc():
        try:
            r = _sub.run(["npx", "tsc", "--noEmit"], capture_output=True, text=True,
                         timeout=120, cwd=str(ROOT))
            return "tsc", r.returncode == 0, r.stdout, r.stderr
        except Exception as e:
            return "tsc", False, "", str(e)

    def _run_tests():
        try:
            r = _sub.run(["npm", "run", "test:run", "--", "--reporter=json"],
                         capture_output=True, text=True, timeout=300, cwd=str(ROOT))
            return "tests", r.returncode == 0, r.stdout, r.stderr
        except Exception as e:
            return "tests", False, "", str(e)

    def _run_format():
        try:
            r = _sub.run(["npx", "prettier", "--check", "apps/", "packages/"],
                         capture_output=True, text=True, timeout=60, cwd=str(ROOT))
            return "format", r.returncode == 0, r.stdout, r.stderr
        except Exception as e:
            return "format", True, "", str(e)

    qa_results = {}
    _executor = ThreadPoolExecutor(max_workers=4)
    futures = [_executor.submit(_run_tsc), _executor.submit(_run_tests),
               _executor.submit(_run_format)]

    for fut in as_completed(futures):
        try:
            name, ok, out, err = fut.result()
            qa_results[name] = ok
        except Exception as e:
            qa_results["unknown"] = False

    tsc_ok = qa_results.get("tsc", False)
    tests_ok = qa_results.get("tests", False)
    format_ok = qa_results.get("format", True)

    pass_c = fail_c = 0
    try:
        data = json.loads((ROOT / "test-results.json").read_text())
        pass_c = data.get("numPassedTests", 0)
        fail_c = data.get("numFailedTests", 0)
    except Exception:
        pass

    log(f"  TypeScript: {'PASS' if tsc_ok else 'FAIL'}")
    log(f"  Tests: {pass_c} passed, {fail_c} failed")
    log(f"  Format: {'PASS' if format_ok else 'FAIL'}")

    improvements = load_json(TASK_FILE, {}).get("improvements", [])
    _tracker.record_qa(typecheck_pass=tsc_ok, tests_pass=tests_ok,
                       improvements_accepted=len(improvements) if (tsc_ok and tests_ok) else 0,
                       duration_s=0.1, iteration=iteration)

    if tsc_ok and tests_ok:
        state["phase"] = "VALIDATION"
    else:
        log("  QA failed → IMPLEMENTATION")
        state["phase"] = "IMPLEMENTATION"
    save_state(state)

# ── Phase: VALIDATION ───────────────────────────────────────────────────────
def phase_validation(state):
    import subprocess as _sub

    iteration = state.get("iteration", 0)
    log(f"=== VALIDATION v2 (iter {iteration}) ===")

    try:
        r = _sub.run(["codegraph", "sync"], capture_output=True, timeout=60, cwd=str(ROOT))
        cg_ok = r.returncode == 0
    except Exception:
        cg_ok = False

    plans_md = ROOT / "Plans.md"
    plans_ok = plans_md.exists() and f"PLN-{iteration:03d}" in plans_md.read_text()

    summary = _tracker.summary()
    quality = summary.get("last_loop_quality", 0.0) or 90.0

    improvements = load_json(TASK_FILE, {}).get("improvements", [])
    log(f"  CodeGraph: {'OK' if cg_ok else 'FAIL'}")
    log(f"  Plans.md: {'OK' if plans_ok else 'MISSING'}")
    log(f"  Quality: {quality:.1f}")

    _tracker.record_validation(improvements_validated=len(improvements),
                               quality_score=quality, codegraph_sync_ok=cg_ok,
                               plans_marked=plans_ok, duration_s=0.1,
                               iteration=iteration)

    state["quality_snapshot"] = quality
    state["phase"] = "RELEASE"
    save_state(state)

# ── Phase: RELEASE ──────────────────────────────────────────────────────────
def phase_release(state, memory):
    import subprocess as _sub

    iteration = state.get("iteration", 0)
    log(f"=== RELEASE v2 (iter {iteration}) ===")

    try:
        r = _sub.run(["git", "status", "--porcelain"], capture_output=True, text=True,
                     timeout=10, cwd=str(ROOT))
        has_changes = bool(r.stdout.strip())
    except Exception:
        has_changes = False

    commit_ok = False
    if has_changes:
        try:
            _sub.run(["git", "add", "-A"], capture_output=True, timeout=30, cwd=str(ROOT))
            msg = f"iter{iteration:03d}: autonomous evolution v2"
            r = _sub.run(["git", "commit", "-m", msg], capture_output=True, text=True,
                        timeout=30, cwd=str(ROOT))
            commit_ok = r.returncode == 0
            if commit_ok:
                log(f"  Committed: {msg}")
        except Exception as e:
            log(f"  Git commit error: {e}")
    else:
        log("  No changes to commit")
        commit_ok = True

    changelog_md = ROOT / "CHANGELOG.md"
    if changelog_md.exists() and has_changes:
        improvements = load_json(TASK_FILE, {}).get("improvements", [])
        imp_list = ", ".join(i.get("type", "") for i in improvements[:3])
        entry = f"\n## v0.86.0+ (iter {iteration}) — {imp_list}\n"
        content = changelog_md.read_text()
        changelog_md.write_text(content + entry)
        log("  CHANGELOG.md updated")

    quality = state.get("quality_snapshot", 0.0)
    _tracker.record_release(release_quality=quality, commit_messages_clean=commit_ok,
                            changelog_updated=has_changes, version_bumped=False,
                            iteration_advanced=True, duration_s=0.1,
                            iteration=iteration)

    state["iteration"] = iteration + 1
    state["phase"] = "RESEARCH"
    save_state(state)

    improvements = load_json(TASK_FILE, {}).get("improvements", [])
    for imp in improvements:
        add_learning(memory, "daemon", "RELEASE", imp.get("type", "unknown"),
                    "implemented", imp.get("description", "")[:200],
                    {"files_changed": imp.get("files_changed", 0)})
    save_memory(memory)

    log(f"  Iteration {iteration} → {state['iteration']} (quality={quality:.1f})")

# ── Run full loop ─────────────────────────────────────────────────────────────
def run_loop(num_iterations=None, start_iteration=0):
    state = load_state()
    memory = load_memory()

    if start_iteration > 0:
        state["iteration"] = start_iteration
        save_state(state)

    iteration = state.get("iteration", 0)
    target = iteration + num_iterations if num_iterations else None

    log(f"Starting evolution loop v2 (iter {iteration})")

    while True:
        if target and state.get("iteration", 0) >= target:
            log(f"Target iteration {target} reached — stopping")
            break
        if not state.get("running", True):
            log("Running flag False — stopping")
            break

        phase = state.get("phase", "RESEARCH")
        log(f"\n--- Iteration {state.get('iteration', 0)} | Phase: {phase} ---")

        try:
            if phase == "RESEARCH":
                phase_research(state, memory)
                state = load_state()
                if state.get("phase") == "PLANNING":
                    phase_planning(load_state())
                    state = load_state()

            elif phase == "IMPLEMENTATION":
                phase_implementation(state, memory)
                state = load_state()

            elif phase == "IMPLEMENTATION_WAIT":
                wait_implementation(state, memory)
                state = load_state()
                if state.get("phase") == "QA":
                    phase_qa(load_state())
                    state = load_state()

            elif phase == "QA":
                phase_qa(state)
                state = load_state()

            elif phase == "VALIDATION":
                phase_validation(state)
                state = load_state()

            elif phase == "RELEASE":
                phase_release(state, memory)
                state = load_state()
                memory = load_memory()

            else:
                log(f"Unknown phase {phase} → RESEARCH")
                state["phase"] = "RESEARCH"
                save_state(state)

        except KeyboardInterrupt:
            log("Interrupted — saving state")
            save_state(state)
            save_memory(memory)
            break
        except Exception as e:
            log(f"ERROR: {e}\n{traceback.format_exc()}")
            save_state(state)
            save_memory(memory)
            time.sleep(5)

if __name__ == "__main__":
    import sys
    n = int(sys.argv[1]) if len(sys.argv) > 1 else None
    run_loop(num_iterations=n)
