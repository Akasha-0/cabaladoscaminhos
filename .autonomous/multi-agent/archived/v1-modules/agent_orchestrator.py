#!/usr/bin/env python3
"""
Agent orchestration for parallel high-efficiency agent management.

Coordinates multiple agents in parallel with resource awareness, monitors health,
merges results, and degrades gracefully under low resources.
"""

from __future__ import annotations

import json
import os
import signal
import subprocess
import sys
import threading
import time
import uuid
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from pathlib import Path
from typing import Any, Literal

# ── path constants ─────────────────────────────────────────────────────────────

ROOT = Path("/home/skynet/cabala-dos-caminhos")
MA = ROOT / ".autonomous/multi-agent"
LOGS_DIR = MA / "logs"
SESSION_DIR = MA / "sessions"
OMP = "/home/skynet/.bun/bin/omp"
PY_HEADROOM = ROOT / ".headroom-venv/bin/python"

os.makedirs(MA, exist_ok=True)
os.makedirs(LOGS_DIR, exist_ok=True)
os.makedirs(SESSION_DIR, exist_ok=True)

# ── low-level JSON helpers ────────────────────────────────────────────────────


def load_json(path: Path, default=None) -> dict[str, Any] | list:
    """Load JSON from *path*, return *default* on any error."""
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return default if default is not None else {}  # type: ignore[return-value]


def save_json(path: Path, data: dict[str, Any] | list) -> None:
    """Atomically write *data* as JSON to *path* via rename."""
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    tmp.rename(path)


# ── log helper ───────────────────────────────────────────────────────────────


def log(msg: str) -> None:
    """Print *msg* with ISO timestamp prefix."""
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    print(f"[{ts}] AgentOrchestrator: {msg}", flush=True)


# ── agent types ────────────────────────────────────────────────────────────────


class AgentType(str, Enum):
    RESEARCHER = "researcher"
    PLANNER = "planner"
    IMPLEMENTER = "implementer"
    QA_ENGINEER = "qa_engineer"
    VALIDATOR = "validator"


# ── agent configs ─────────────────────────────────────────────────────────────


@dataclass
class _AgentConfig:
    timeout_s: int
    cpu_priority: int  # -20 (low) to 20 (high); lower = nicer
    memory_profile_mb: int  # estimated resident memory per agent instance


_AGENT_CONFIGS: dict[AgentType, _AgentConfig] = {
    AgentType.RESEARCHER:    _AgentConfig(timeout_s=300, cpu_priority=10, memory_profile_mb=150),
    AgentType.PLANNER:       _AgentConfig(timeout_s=300, cpu_priority=10, memory_profile_mb=200),
    AgentType.IMPLEMENTER:   _AgentConfig(timeout_s=600, cpu_priority=5,  memory_profile_mb=400),
    AgentType.QA_ENGINEER:   _AgentConfig(timeout_s=300, cpu_priority=15, memory_profile_mb=250),
    AgentType.VALIDATOR:     _AgentConfig(timeout_s=300, cpu_priority=15, memory_profile_mb=180),
}

# System resource thresholds for graceful degradation
_MIN_FREE_MEMORY_MB: int = 512   # below this: run agents sequentially
_LOW_MEMORY_MB: int = 1024       # below this: cap parallel agents at 2
_MIN_CPU_CORES: int = 2           # below this: never parallel

# ── resource monitoring helpers ────────────────────────────────────────────────


def _get_memory_info() -> dict[str, int]:
    """
    Read /proc/self/statm for process-level memory stats.
    Returns {total_kb, resident_kb, share_kb} using Linux page-size (4096 bytes).
    """
    try:
        statm = Path("/proc/self/statm").read_text(encoding="utf-8").split()
        page_kb = os.sysconf("SC_PAGE_SIZE") // 1024
        return {
            "size_kb":    int(statm[0]) * page_kb,
            "resident_kb": int(statm[1]) * page_kb,
            "share_kb":   int(statm[2]) * page_kb,
        }
    except (OSError, IndexError, ValueError):
        return {"size_kb": 0, "resident_kb": 0, "share_kb": 0}


def _system_memory_free_mb() -> int:
    """
    Read /proc/meminfo for system-wide free memory.
    Returns free = MemAvailable if present, else MemFree.
    """
    try:
        for line in Path("/proc/meminfo").read_text(encoding="utf-8").splitlines():
            if line.startswith("MemAvailable:"):
                return int(line.split()[1]) // 1024
            if line.startswith("MemFree:"):
                return int(line.split()[1]) // 1024
    except (OSError, IndexError, ValueError):
        pass
    return 4096  # fallback assumption


def _cpu_count() -> int:
    """Return os.cpu_count() with safe fallback."""
    return os.cpu_count() or 2


def _set_cpu_priority(pid: int, priority: int) -> None:
    """
    Set process nice value via os.setpriority.
    priority=-10 (high) to 10 (low) mapped from agent cpu_priority.
    """
    try:
        os.setpriority(os.PRIO_PROCESS, pid, priority)
    except OSError:
        pass


# ── result dataclasses ───────────────────────────────────────────────────────


@dataclass
class AgentResult:
    agent_id: str
    area: str
    success: bool
    output_summary: str
    files_changed: list[str] = field(default_factory=list)
    quality_score: float = 0.0
    duration_s: float = 0.0
    errors: list[str] = field(default_factory=list)


@dataclass
class CoordinatedResult:
    merged_plan: dict[str, Any]
    conflicts_resolved: list[str]
    quality_score: float
    improvement_count: int


@dataclass
class OrchestratorResult:
    results: list[AgentResult]
    summary: str
    duration_s: float
    resource_usage: dict[str, Any]


# ── agent registry (in-memory) ─────────────────────────────────────────────────


class _AgentRegistry:
    """
    Thread-safe in-memory registry of active agents.
    Tracks: pid, agent_id, agent_type, start_time, status, result_file, log_file.
    """

    def __init__(self) -> None:
        self._lock = threading.RLock()
        self._agents: dict[str, dict[str, Any]] = {}

    def register(self, agent_id: str, agent_type: str, pid: int,
                 result_file: Path, log_file: Path) -> None:
        with self._lock:
            self._agents[agent_id] = {
                "agent_id": agent_id,
                "agent_type": agent_type,
                "pid": pid,
                "result_file": result_file,
                "log_file": log_file,
                "start_time": time.monotonic(),
                "status": "running",
                "quality_score": 0.0,
                "output_summary": "",
                "files_changed": [],
                "errors": [],
            }

    def mark_done(self, agent_id: str, status: str,
                  quality_score: float = 0.0,
                  output_summary: str = "",
                  files_changed: list[str] | None = None,
                  errors: list[str] | None = None) -> None:
        with self._lock:
            if agent_id in self._agents:
                self._agents[agent_id]["status"] = status
                self._agents[agent_id]["quality_score"] = quality_score
                self._agents[agent_id]["output_summary"] = output_summary
                self._agents[agent_id]["files_changed"] = files_changed or []
                self._agents[agent_id]["errors"] = errors or []

    def get(self, agent_id: str) -> dict[str, Any] | None:
        with self._lock:
            return dict(self._agents.get(agent_id, {}))

    def all(self) -> list[dict[str, Any]]:
        with self._lock:
            return [dict(v) for v in self._agents.values()]

    def pids(self) -> list[int]:
        with self._lock:
            return [v["pid"] for v in self._agents.values()]

    def unregister(self, agent_id: str) -> None:
        with self._lock:
            self._agents.pop(agent_id, None)

    def clear(self) -> None:
        with self._lock:
            self._agents.clear()


# ── default agent prompts ─────────────────────────────────────────────────────


_AGENT_PROMPTS: dict[str, str] = {
    "researcher": (
        "You are the Researcher agent. Your role is to gather, validate, and synthesize "
        "information relevant to the assigned improvement. Search the codebase, read "
        "documentation, and produce a concise summary of findings including relevant file "
        "paths, patterns, and gaps. Write your JSON result to the result file."
    ),
    "planner": (
        "You are the Planner agent. Your role is to take research findings and produce "
        "a detailed, phased implementation plan with acceptance criteria, file changes, "
        "and risk assessments. Write your JSON result to the result file."
    ),
    "implementer": (
        "You are the Implementer agent. Your role is to execute the plan by making "
        "targeted code changes. Prefer surgical edits over broad rewrites. Write your "
        "JSON result to the result file listing every file changed."
    ),
    "qa_engineer": (
        "You are the QA Engineer agent. Your role is to write or update tests, verify "
        "correctness, and identify edge cases for the assigned improvement. Write your "
        "JSON result to the result file."
    ),
    "validator": (
        "You are the Validator agent. Your role is to review the entire change — "
        "correctness, security, performance, and alignment with project standards — "
        "and produce a validation report. Write your JSON result to the result file."
    ),
}

# ── AgentOrchestrator ─────────────────────────────────────────────────────────


class AgentOrchestrator:
    """
    Orchestrates multiple agents in parallel with resource awareness.

    Usage:
        orch = AgentOrchestrator()
        result = orch.orchestrate(improvements=[...], context={...})
    """

    def __init__(self) -> None:
        self._registry = _AgentRegistry()
        self._cancel_requested = threading.Event()
        self._lock = threading.RLock()

    # ── public API ────────────────────────────────────────────────────────────

    def orchestrate(
        self,
        improvements: list[dict[str, Any]],
        context: dict[str, Any],
    ) -> OrchestratorResult:
        """
        Orchestrate a list of improvements using parallel agents.

        Returns OrchestratorResult with:
          - results: list of AgentResult per agent
          - summary: human-readable synthesis
          - duration_s: total elapsed time
          - resource_usage: snapshot of resource metrics
        """
        t0 = time.monotonic()
        self._cancel_requested.clear()

        # Determine how many agents can run in parallel given current resources
        available = self.get_available_resources()
        can_parallel = self.should_spawn_parallel(len(improvements))

        log(f"Orchestrating {len(improvements)} improvements | "
            f"parallel={can_parallel} | "
            f"cpu={available['cpu_cores']} | "
            f"free_mem={available['memory_free_mb']}MB")

        if can_parallel:
            results = self._orchestrate_parallel(improvements, context)
        else:
            log("Running in sequential mode due to low resources")
            results = self._orchestrate_sequential(improvements, context)

        # Coordinate and merge results
        coordinated = self.coordinate_results(results)

        duration_s = time.monotonic() - t0
        usage = self._resource_usage_snapshot()

        summary = (
            f"Processed {len(results)} agents in {duration_s:.1f}s. "
            f"Conflicts resolved: {len(coordinated.conflicts_resolved)}. "
            f"Quality score: {coordinated.quality_score:.1f}. "
            f"Merged {coordinated.improvement_count} improvements into plan."
        )

        return OrchestratorResult(
            results=results,
            summary=summary,
            duration_s=duration_s,
            resource_usage=usage,
        )

    def spawn_agent(
        self,
        improvement: dict[str, Any],
        context: dict[str, Any],
    ) -> AgentResult:
        """
        Spawn a single agent for one improvement.

        Returns AgentResult with agent_id, success, output_summary, etc.
        """
        agent_type_str = improvement.get("agent_type", "researcher")
        agent_id = f"{agent_type_str}-{uuid.uuid4().hex[:8]}"

        try:
            cfg = _AGENT_CONFIGS.get(
                AgentType(agent_type_str),
                _AGENT_CONFIGS[AgentType.RESEARCHER],
            )
        except ValueError:
            cfg = _AGENT_CONFIGS[AgentType.RESEARCHER]
        AGENT_RESULTS_DIR = MA / "agent-results"
        result_file = AGENT_RESULTS_DIR / f"result-{agent_id}.json"
        log_file = LOGS_DIR / f"agent-{agent_id}-{datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S')}.log"

        if result_file.exists():
            result_file.unlink()

        t0 = time.monotonic()

        # Build system prompt
        system_prompt = self._build_system_prompt(agent_type_str, improvement, context)

        # Write log header
        try:
            with open(log_file, "w", encoding="utf-8") as f:
                f.write(f"# Agent: {agent_type_str} | ID: {agent_id}\n")
                f.write(f"# Spawned: {datetime.now(timezone.utc).isoformat()}\n")
                f.write(f"# Result: {result_file}\n\n")
        except OSError as exc:
            log(f"Warning: could not write log file {log_file}: {exc}")
            log_file = Path("/dev/null")

        # Spawn subprocess
        proc = None
        pid = 0
        try:
            env = {
                **os.environ,
                "HEADROOM_QUIET": "1",
                "ANTHROPIC_BASE_URL": "http://127.0.0.1:8787",
            }
            proc = subprocess.Popen(
                [
                    OMP, "-p",
                    "--no-lsp", "--no-rules", "--no-extensions", "--no-skills",
                    "--system-prompt", system_prompt,
                    "--session-dir", str(SESSION_DIR / agent_type_str),
                    "--auto-approve",
                    f"You are {agent_type_str}Agent. Work on: {improvement.get('description', '')}. "
                    f"Write JSON result to {result_file}.",
                ],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                cwd=str(ROOT),
                env=env,
            )
            pid = proc.pid
            self._registry.register(agent_id, agent_type_str, pid, result_file, log_file)

            # Set CPU priority
            _set_cpu_priority(pid, cfg.cpu_priority)

            # Stream output to log
            for line in proc.stdout:
                try:
                    with open(log_file, "a", encoding="utf-8") as f:
                        f.write(line)
                except OSError:
                    pass

            proc.wait()

        except Exception as exc:  # noqa: BLE001
            duration_s = time.monotonic() - t0
            self._registry.mark_done(agent_id, "error", errors=[str(exc)])
            return AgentResult(
                agent_id=agent_id,
                area=improvement.get("area", ""),
                success=False,
                output_summary=f"Spawn failed: {exc}",
                duration_s=duration_s,
                errors=[str(exc)],
            )

        # Read result
        raw = load_json(result_file, None)
        duration_s = time.monotonic() - t0

        if raw is None or proc.returncode != 0:
            status = "error"
            success = False
            quality_score = 0.0
            output_summary = raw.get("summary", "no result") if raw else "no result file"
            errors = [f"returncode={proc.returncode}"] if proc else []
            files_changed = []
        else:
            status = "done"
            success = raw.get("status") != "error"
            quality_score = raw.get("quality_score", 0.0)
            output_summary = raw.get("summary", str(raw)[:500])
            errors = raw.get("errors", [])
            files_changed = raw.get("files_changed", [])

        self._registry.mark_done(
            agent_id, status,
            quality_score=quality_score,
            output_summary=output_summary,
            files_changed=files_changed,
            errors=errors,
        )

        return AgentResult(
            agent_id=agent_id,
            area=improvement.get("area", ""),
            success=success,
            output_summary=output_summary,
            files_changed=files_changed,
            quality_score=quality_score,
            duration_s=duration_s,
            errors=errors,
        )

    def monitor_agents(
        self,
        agent_pids: list[int],
    ) -> list[dict[str, Any]]:
        """
        Poll resource usage for a list of agent PIDs.

        Returns list of {pid, status, cpu_percent, memory_mb}.
        """
        # Read /proc/<pid>/stat for cpu and /proc/<pid>/statm for memory
        monitored = []
        for pid in agent_pids:
            try:
                stat = Path(f"/proc/{pid}/stat").read_text(encoding="utf-8")
                parts = stat.split()
                # utime (14) + stime (15) in clock ticks; convert to seconds
                cpu_ticks = int(parts[13]) + int(parts[14])
                cpu_s = cpu_ticks / os.sysconf("SC_CLK_TCK")

                statm = Path(f"/proc/{pid}/statm").read_text(encoding="utf-8").split()
                page_kb = os.sysconf("SC_PAGE_SIZE") // 1024
                resident_mb = int(statm[1]) * page_kb // 1024

                # Status: R=running, S=sleeping, Z=zombie
                state_char = parts[2] if len(parts) > 2 else "?"
                status_map = {"R": "running", "S": "sleeping", "Z": "zombie"}
                status = status_map.get(state_char, f"unknown({state_char})")

                # Rough cpu% using elapsed wall time from stat starttime (22)
                start_ticks = int(parts[21])
                uptime_s = self._system_uptime_s()
                elapsed_s = max(1.0, uptime_s - start_ticks / os.sysconf("SC_CLK_TCK"))
                cpu_percent = min(400.0, (cpu_s / elapsed_s) * 100.0)

                monitored.append({
                    "pid": pid,
                    "status": status,
                    "cpu_percent": round(cpu_percent, 1),
                    "memory_mb": resident_mb,
                })
            except (OSError, IndexError, ValueError):
                # Process may have exited; treat as zombie/unknown
                monitored.append({
                    "pid": pid,
                    "status": "gone",
                    "cpu_percent": 0.0,
                    "memory_mb": 0,
                })
        return monitored

    def coordinate_results(self, results: list[AgentResult]) -> CoordinatedResult:
        """
        Merge multiple AgentResults into a coherent plan.
        Detects conflicts, resolves by quality score, returns CoordinatedResult.
        """
        if not results:
            return CoordinatedResult(
                merged_plan={},
                conflicts_resolved=[],
                quality_score=0.0,
                improvement_count=0,
            )

        # Sort by quality_score descending
        sorted_results = sorted(results, key=lambda r: r.quality_score, reverse=True)

        conflicts: list[str] = []
        merged_files: list[str] = []
        merged_errors: list[str] = []
        total_quality: float = 0.0

        seen_files: set[str] = set()
        for r in sorted_results:
            total_quality += r.quality_score
            for f in r.files_changed:
                if f in seen_files:
                    conflicts.append(f"File modified by multiple agents: {f}")
                else:
                    seen_files.add(f)
                    merged_files.append(f)
            merged_errors.extend(r.errors)

        avg_quality = total_quality / len(results) if results else 0.0

        # Build merged plan: list all changes grouped by agent
        merged_plan: dict[str, Any] = {
            "changes": [
                {
                    "agent_id": r.agent_id,
                    "area": r.area,
                    "success": r.success,
                    "output_summary": r.output_summary,
                    "files_changed": r.files_changed,
                    "quality_score": r.quality_score,
                    "duration_s": round(r.duration_s, 1),
                }
                for r in sorted_results
            ],
            "all_files_changed": merged_files,
            "conflict_count": len(conflicts),
        }

        return CoordinatedResult(
            merged_plan=merged_plan,
            conflicts_resolved=conflicts,
            quality_score=round(avg_quality, 2),
            improvement_count=len(results),
        )

    def get_available_resources(self) -> dict[str, Any]:
        """
        Return current system resource snapshot.

        Returns {cpu_cores, memory_free_mb, can_spawn_more}.
        """
        cpu_cores = _cpu_count()
        memory_free_mb = _system_memory_free_mb()

        # Sum estimated memory of all currently running agents
        running_agents = [a for a in self._registry.all() if a.get("status") == "running"]
        estimated_mem_mb = sum(
            _AGENT_CONFIGS.get(AgentType(at), _AGENT_CONFIGS[AgentType.RESEARCHER]).memory_profile_mb
            for at in [a.get("agent_type", "researcher") for a in running_agents]
        )
        usable_mem_mb = max(0, memory_free_mb - estimated_mem_mb)

        can_spawn_more = (
            usable_mem_mb > _MIN_FREE_MEMORY_MB
            and cpu_cores >= _MIN_CPU_CORES
        )

        return {
            "cpu_cores": cpu_cores,
            "memory_free_mb": memory_free_mb,
            "can_spawn_more": can_spawn_more,
            "running_agents": len(running_agents),
            "estimated_used_mb": estimated_mem_mb,
            "usable_memory_mb": usable_mem_mb,
        }

    def should_spawn_parallel(self, num_requested: int) -> bool:
        """
        Decide whether to spawn *num_requested* agents in parallel.

        Returns True if system has enough CPU cores and free memory.
        """
        res = self.get_available_resources()
        cpu_ok = res["cpu_cores"] >= _MIN_CPU_CORES
        mem_ok = res["memory_free_mb"] > _LOW_MEMORY_MB
        can_do = res["can_spawn_more"]
        cores_ok = res["cpu_cores"] >= num_requested // 2  # at least half in cores

        if not cpu_ok or not mem_ok:
            return False
        if not can_do:
            return False
        # Soft cap: don't spawn more than 4 in parallel on this hardware
        return num_requested <= 4 or cores_ok

    def cancel_all(self) -> None:
        """Send SIGTERM to all running agents and wait for them to exit."""
        log("Cancel requested — terminating all agents")
        self._cancel_requested.set()

        for agent in self._registry.all():
            pid = agent.get("pid", 0)
            if pid and agent.get("status") == "running":
                try:
                    os.kill(pid, signal.SIGTERM)
                except OSError:
                    pass  # already dead

        # Wait briefly for graceful shutdown
        time.sleep(1.0)

        # Force kill any remaining
        for agent in self._registry.all():
            pid = agent.get("pid", 0)
            if pid and agent.get("status") == "running":
                try:
                    os.kill(pid, signal.SIGKILL)
                except OSError:
                    pass

        self._registry.clear()
        log("All agents cancelled")

    def get_agent_status(self, agent_id: str) -> dict[str, Any]:
        """
        Return current status dict for one agent.

        Returns {agent_id, status, quality_score, output_summary, files_changed, errors}
        or empty dict if not found.
        """
        return self._registry.get(agent_id) or {}

    # ── internal helpers ──────────────────────────────────────────────────────

    def _orchestrate_parallel(
        self,
        improvements: list[dict[str, Any]],
        context: dict[str, Any],
    ) -> list[AgentResult]:
        max_workers = min(4, len(improvements), (_cpu_count() or 2))
        log(f"Spawning up to {max_workers} agents in parallel")

        results: list[AgentResult] = []
        cancel_event = self._cancel_requested

        with ThreadPoolExecutor(max_workers=max_workers) as pool:
            futures = {
                pool.submit(self.spawn_agent, imp, context): imp
                for imp in improvements
            }

            for future in as_completed(futures):
                if cancel_event.is_set():
                    log("Cancel event set — aborting remaining futures")
                    pool.shutdown(wait=False, cancel_futures=True)
                    break

                try:
                    result = future.result(timeout=900)
                    results.append(result)
                except Exception as exc:  # noqa: BLE001
                    imp = futures[future]
                    results.append(AgentResult(
                        agent_id="unknown",
                        area=imp.get("area", ""),
                        success=False,
                        output_summary=f"Future failed: {exc}",
                        errors=[str(exc)],
                    ))

        return results

    def _orchestrate_sequential(
        self,
        improvements: list[dict[str, Any]],
        context: dict[str, Any],
    ) -> list[AgentResult]:
        log("Running agents sequentially")
        results: list[AgentResult] = []
        for imp in improvements:
            if self._cancel_requested.is_set():
                break
            results.append(self.spawn_agent(imp, context))
        return results

    def _build_system_prompt(
        self,
        agent_type: str,
        improvement: dict[str, Any],
        context: dict[str, Any],
    ) -> str:
        fid = improvement.get("id", "?")
        ftitle = improvement.get("title", improvement.get("description", ""))[:120]
        agent_prompt = _AGENT_PROMPTS.get(agent_type, _AGENT_PROMPTS["researcher"])

        # Inline relevant context keys
        ctx_lines = []
        for key in ("version", "iteration", "features", "triad", "plans"):
            val = context.get(key)
            if val is not None:
                ctx_lines.append(f"  {key}: {val}")

        context_block = "\n".join(ctx_lines) if ctx_lines else "  (no context available)"

        return f"""You are {agent_type.title()}Agent for the AKASHA spiritual technology project.

{agent_prompt}

=== CURRENT IMPROVEMENT ===
  id: {fid}
  title: {ftitle}
  area: {improvement.get('area', 'general')}
  priority: {improvement.get('priority', 'medium')}
  description: {improvement.get('description', '')[:500]}

=== PROJECT CONTEXT ===
{context_block}

IMPORTANT:
- Write your JSON result to the file specified by the orchestrator
- Use codegraph_explore before making architectural claims
- This is a REAL project. Do not fabricate file paths or code
- Your job is to advance improvement {fid}: {ftitle}
"""

    @staticmethod
    def _system_uptime_s() -> float:
        """Read /proc/uptime and return uptime in seconds."""
        try:
            return float(Path("/proc/uptime").read_text(encoding="utf-8").split()[0])
        except (OSError, IndexError, ValueError):
            return 0.0

    @staticmethod
    def _resource_usage_snapshot() -> dict[str, Any]:
        """Capture a snapshot of current resource usage."""
        mem_info = _get_memory_info()
        free_mb = _system_memory_free_mb()
        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "system_memory_free_mb": free_mb,
            "process_memory_rss_kb": mem_info.get("resident_kb", 0),
            "process_memory_size_kb": mem_info.get("size_kb", 0),
            "cpu_cores": _cpu_count(),
        }


# ── module-level convenience ───────────────────────────────────────────────────

_orchestrator_instance: AgentOrchestrator | None = None
_instance_lock = threading.Lock()


def get_orchestrator() -> AgentOrchestrator:
    """Return a singleton AgentOrchestrator instance."""
    global _orchestrator_instance
    with _instance_lock:
        if _orchestrator_instance is None:
            _orchestrator_instance = AgentOrchestrator()
        return _orchestrator_instance


# ── CLI ───────────────────────────────────────────────────────────────────────


def _cli() -> None:
    """Simple CLI for testing the orchestrator."""
    import argparse

    parser = argparse.ArgumentParser(description="AgentOrchestrator CLI")
    sub = parser.add_subparsers(dest="cmd")

    status = sub.add_parser("status", help="Show resource status")
    status.add_argument("--agent-id", default=None, help="Specific agent ID")

    cancel = sub.add_parser("cancel", help="Cancel all running agents")

    orchestrate = sub.add_parser("orchestrate", help="Run a test orchestration")
    orchestrate.add_argument("--num", type=int, default=3, help="Number of improvements")

    args = parser.parse_args()
    orch = get_orchestrator()

    if args.cmd == "status":
        res = orch.get_available_resources()
        print(json.dumps(res, indent=2))
        if args.agent_id:
            print(json.dumps(orch.get_agent_status(args.agent_id), indent=2))

    elif args.cmd == "cancel":
        orch.cancel_all()
        print("All agents cancelled")

    elif args.cmd == "orchestrate":
        improvements = [
            {
                "id": f"test-{i}",
                "title": f"Test improvement {i}",
                "area": "general",
                "priority": "medium",
                "description": f"Automated test improvement {i}",
                "agent_type": "researcher",
            }
            for i in range(args.num)
        ]
        result = orch.orchestrate(improvements, {"version": "test", "iteration": 0})
        print(json.dumps({
            "summary": result.summary,
            "duration_s": round(result.duration_s, 2),
            "resource_usage": result.resource_usage,
            "result_count": len(result.results),
        }, indent=2))

    else:
        parser.print_help()


if __name__ == "__main__":
    _cli()
