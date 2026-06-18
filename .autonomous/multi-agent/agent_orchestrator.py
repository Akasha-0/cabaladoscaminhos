#!/usr/bin/env python3
"""
AgentOrchestratorV2 — advanced agent pool management with pre-warmed agents,
intelligent routing, result aggregation, and performance tracking.
"""

from __future__ import annotations

import heapq, json, os, signal, shutil, subprocess, sys, threading, time, uuid
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum, auto
from pathlib import Path
from typing import Any

# ── paths ───────────────────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent if '__file__' in globals() else Path.cwd()
MA = ROOT / ".autonomous" / "multi-agent"
LOGS_DIR = MA / "logs"
RESULTS_DIR = MA / "agent-results"
METRICS_FILE = MA / "orchestrator_metrics.json"
for _d in (MA, LOGS_DIR, RESULTS_DIR):
    os.makedirs(_d, exist_ok=True)

# ── low-level JSON helpers ────────────────────────────────────────────────────
def _load_json(path: Path, default=None):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return default if default is not None else {}

def _save_json(path: Path, data) -> None:
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    tmp.rename(path)

# ── logging ───────────────────────────────────────────────────────────────────
def log(msg: str) -> None:
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    print(f"[{ts}] AgentOrchestratorV2: {msg}", flush=True)

# ── enums ─────────────────────────────────────────────────────────────────────
class AgentState(Enum):
    IDLE = auto(); BUSY = auto(); DEAD = auto(); COOLING = auto()

class TaskStatus(Enum):
    PENDING = auto(); RUNNING = auto(); DONE = auto(); FAILED = auto(); CANCELLED = auto()

class Priority(Enum):
    HIGH = 0; NORMAL = 1

# ── data classes ──────────────────────────────────────────────────────────────
@dataclass
class AgentRecord:
    agent_id: str; skill_tags: list[str]; state: AgentState = AgentState.IDLE
    current_task_id: str | None = None; proc: subprocess.Popen | None = None
    started_at: float = field(default_factory=time.time)
    last_heartbeat: float = field(default_factory=time.time)
    tasks_completed: int = 0; tasks_failed: int = 0; total_duration_s: float = 0.0
    success_rate: float = 1.0; quality_score: float = 0.8
    area_success: dict[str, tuple[int, int]] = field(default_factory=dict)

@dataclass
class TaskRecord:
    task_id: str; area: str; prompt: str; priority: Priority
    status: TaskStatus = TaskStatus.PENDING; assigned_agent_id: str | None = None
    created_at: float = field(default_factory=time.time); started_at: float | None = None
    completed_at: float | None = None; result: dict[str, Any] | None = None
    context_used: str = ""

# ── lightweight context builder ───────────────────────────────────────────────
_AREA_PATHS = {
    "frontend": "apps/akasha-portal/src: components, pages, hooks",
    "backend": "apps/api, packages/*/src: routes, services, db",
    "infra": "deploy/, docker*, .github/workflows, terraform",
    "testing": "tests/, __tests__, *.test.*, *.spec.*",
    "docs": "docs/, *.md, grimoire/, SPEC.md",
    "default": "src/, lib/: general library code",
}

def build_injected_context(area: str, hint: str = "", tags: list[str] | None = None) -> str:
    """Build up to 8000-char context: hint, project summary, decisions, area paths, learnings."""
    parts, rem = [], 8000
    if hint:
        chunk = hint[:min(2000, rem)]; parts.append(f"## Task Context\n{chunk}"); rem -= len(chunk) + 2
    pm_file = MA / "project_map.json"
    if rem > 200 and pm_file.exists():
        try:
            pm = _load_json(pm_file, {}); s = pm.get("summary", "")[:min(500, rem)]
            if s: parts.append(f"## Project Summary\n{s}"); rem -= len(s) + 20
        except Exception: pass
    dec_file = ROOT / "DECISIONS.md"
    if rem > 100 and dec_file.exists():
        try:
            lines = dec_file.read_text().splitlines()[-20:]
            chunk = "\n".join(lines)[:min(600, rem)]
            if chunk: parts.append(f"## Recent Decisions\n{chunk}"); rem -= len(chunk) + 20
        except Exception: pass
    if rem > 100:
        hint_lines = [f"- {t}: {_AREA_PATHS.get(t, _AREA_PATHS['default'])}"
                      for t in (tags or []) if t in _AREA_PATHS]
        if not hint_lines: hint_lines = [f"- {_AREA_PATHS['default']}"]
        chunk = "\n".join(hint_lines)[:min(400, rem)]
        if chunk: parts.append(f"## Relevant Paths\n{chunk}"); rem -= len(chunk) + 20
    if rem > 100:
        mem_file = MA / "memory.json"
        if mem_file.exists():
            try:
                mem = _load_json(mem_file, {})
                lns = [f"- {l}" for l in mem.get("learnings", [])[-5:]]
                if lns:
                    chunk = "\n".join(lns)[:min(500, rem)]
                    parts.append(f"## Memory Hints\n{chunk}")
            except Exception: pass
    return "\n\n".join(parts)[:8000]

# ── minimal agent subprocess script (written to temp file at spawn) ───────────
_AGENT_SCRIPT = r"""
import json, sys, os, subprocess, time
from datetime import datetime, timezone
from pathlib import Path

READY = "AGENT_READY"

def log(m): print(f"[{datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')}] SA: {m}", flush=True)

def ctx(skill_tags, hint, ma):
    parts, rem = [], 8000
    if hint:
        c = hint[:min(2000, rem)]; parts.append(f"## Context\n{c}"); rem -= len(c) + 2
    pm = ma / "project_map.json"
    if rem > 200 and pm.exists():
        try:
            d = json.loads(pm.read_text()); s = d.get("summary", "")[:min(500, rem)]
            if s: parts.append(f"## Project\n{s}"); rem -= len(s) + 20
        except: pass
    dec = Path({root}) / "DECISIONS.md"
    if rem > 100 and dec.exists():
        try:
            lines = dec.read_text().splitlines()[-20:]
            c = "\n".join(lines)[:min(600, rem)]
            if c: parts.append(f"## Decisions\n{c}"); rem -= len(c) + 20
        except: pass
    if rem > 100:
        tags = {tags}
        areas = {areas}
        lines = [f"- {t}: {areas.get(t, areas['default'])}" for t in tags if t in areas]
        if not lines: lines = [f"- {areas['default']}"]
        c = "\n".join(lines)[:min(400, rem)]
        if c: parts.append(f"## Paths\n{c}"); rem -= len(c) + 20
    if rem > 100:
        mf = ma / "memory.json"
        if mf.exists():
            try:
                mem = json.loads(mf.read_text())
                lns = [f"- {l}" for l in mem.get("learnings", [])[-5:]]
                if lns:
                    c = "\n".join(lns)[:min(500, rem)]
                    parts.append(f"## Memory\n{c}")
            except: pass
    return "\n\n".join(parts)[:8000]

def run_task(prompt, skill_tags, ma):
    full = f"<<CONTEXT>>\n{ctx(skill_tags, '', ma)}\n<</CONTEXT>>\n\n<<TASK>>\n{prompt}\n<</TASK>>"
    for cmd in [{omp}, {py}]:
        try:
            r = subprocess.run([cmd, "-p", "--model", "MiniMax-M2.7-highspeed", full],
                capture_output=True, text=True, timeout=600, cwd={root_repr},
                env={{**os.environ, "ANTHROPIC_MODEL": "MiniMax-M2.7-highspeed"}})
            return {{"success": r.returncode == 0, "output": r.stdout[:5000],
                     "stderr": r.stderr[:1000], "rc": r.returncode}}
        except Exception: continue
    return {{"success": False, "output": "", "stderr": "No agent binary found", "rc": -1}}

skill_tags = {tags}
agent_id = "{{agent_id}}"
ma = Path("{ma_path}")
log(f"Ready tags={skill_tags}")
print(READY, flush=True)

while True:
    line = sys.stdin.readline()
    if not line: break
    try: msg = json.loads(line.strip())
    except: continue
    cmd = msg.get("cmd")
    if cmd == "execute":
        tid, prompt = msg.get("task_id", ""), msg.get("prompt", "")
        log(f"Task {tid}")
        t0 = time.time()
        res = run_task(prompt, skill_tags, ma)
        print(json.dumps({{"cmd": "result", "task_id": tid, "agent_id": agent_id,
                           "success": res["success"], "output": res["output"],
                           "stderr": res["stderr"],
                           "duration_s": round(time.time() - t0, 2),
                           "timestamp": datetime.now(timezone.utc).isoformat()}}), flush=True)
    elif cmd == "shutdown":
        log("Shutdown"); break
"""

_AREAS_DICT = json.dumps(_AREA_PATHS)

def _build_script(agent_id: str, tags: list[str]) -> str:
    return _AGENT_SCRIPT.format(
        root=repr(str(ROOT)), root_repr=repr(str(ROOT)),
        ma_path=str(MA), agent_id=agent_id,
        tags=repr(tags), areas=_AREAS_DICT,
        omp=repr(str(ROOT / ".local/bin/omp")),
        py=repr(str(ROOT / ".headroom-venv/bin/python")),
    )

# ── orchestrator ──────────────────────────────────────────────────────────────
class AgentOrchestratorV2:
    def __init__(
        self, ma: Path | None = None,
        max_agents: int = 8, min_agents: int = 2,
        respawn_timeout: float = 5.0,
        heartbeat_interval: float = 30.0,
        task_timeout: float = 600.0,
    ):
        self.ma = ma or MA; self.max_agents = max_agents; self.min_agents = min_agents
        self.respawn_timeout = respawn_timeout; self.heartbeat_interval = heartbeat_interval
        self.task_timeout = task_timeout
        self._lock = threading.RLock()
        self._agents: dict[str, AgentRecord] = {}
        self._task_queue: list[tuple[int, int, TaskRecord]] = []
        self._task_counter = 0
        self._tasks: dict[str, TaskRecord] = {}
        self._result_cache: dict[str, dict[str, Any]] = {}
        self._monitor_thread: threading.Thread | None = None
        self._dispatch_thread: threading.Thread | None = None
        self._shutdown_event = threading.Event()
        self._metrics_file = self.ma / "orchestrator_metrics.json"
        self._metrics = _load_json(self._metrics_file, {
            "area_metrics": {}, "agent_metrics": {}, "total_tasks": 0,
            "total_success": 0, "total_failed": 0,
        })
        log(f"Initialized max={max_agents} min={min_agents}")

    # ── public API ──────────────────────────────────────────────────────────────
    def spawn_agent(self, skill_tags: list[str]) -> str:
        with self._lock:
            aid = f"agent-{uuid.uuid4().hex[:8]}"
            sp = self.ma / f".agent_script_{aid}.py"
            sp.write_text(_build_script(aid, skill_tags), encoding="utf-8")
            proc = subprocess.Popen(
                [sys.executable, str(sp)],
                stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                stderr=subprocess.PIPE, text=True, bufsize=1,
                cwd=str(ROOT), env={**os.environ},
                preexec_fn=lambda: os.sched_setaffinity(0, {0, 1})
                    if hasattr(os, "sched_setaffinity") else None,
            )
            self._agents[aid] = AgentRecord(agent_id=aid, skill_tags=skill_tags, proc=proc)
            self._wait_ready(proc, aid)
            log(f"Spawned {aid} tags={skill_tags} pool={len(self._agents)}")
            return aid

    def assign(self, area: str, prompt: str, priority: str = "normal", context: str = "") -> str:
        prio = Priority.HIGH if priority.lower() == "high" else Priority.NORMAL
        with self._lock:
            self._task_counter += 1
            tid = f"task-{uuid.uuid4().hex[:8]}"
            ctx = build_injected_context(area, context)
            rec = TaskRecord(task_id=tid, area=area, prompt=prompt, priority=prio, context_used=ctx)
            self._tasks[tid] = rec
            self._metrics["total_tasks"] = self._metrics.get("total_tasks", 0) + 1
            heapq.heappush(self._task_queue, (prio.value, self._task_counter, rec))
            log(f"Queued {tid} ({area}/{priority}) queue={len(self._task_queue)}")
            return tid

    def get_result(self, task_id: str) -> dict[str, Any] | None:
        with self._lock:
            t = self._tasks.get(task_id)
            return t.result if t and t.status == TaskStatus.DONE else None

    def get_task_status(self, task_id: str) -> str:
        with self._lock:
            t = self._tasks.get(task_id)
            return {TaskStatus.PENDING: "pending", TaskStatus.RUNNING: "running",
                    TaskStatus.DONE: "done", TaskStatus.FAILED: "failed",
                    TaskStatus.CANCELLED: "cancelled"}.get(t.status if t else TaskStatus.PENDING, "pending")

    def wait_all(self, timeout: float = 300.0) -> list[dict[str, Any]]:
        deadline = time.time() + timeout
        while time.time() < deadline:
            with self._lock:
                if not [t for t in self._tasks.values()
                        if t.status in (TaskStatus.PENDING, TaskStatus.RUNNING)]:
                    return [t.result for t in self._tasks.values()
                            if t.status == TaskStatus.DONE and t.result]
            time.sleep(0.5)
        return [t.result for t in self._tasks.values()
                if t.status == TaskStatus.DONE and t.result]

    def wait_any(self, timeout: float = 60.0) -> dict[str, Any] | None:
        deadline = time.time() + timeout
        while time.time() < deadline:
            with self._lock:
                for t in self._tasks.values():
                    if t.status in (TaskStatus.DONE, TaskStatus.FAILED):
                        return t.result or {"success": False, "task_id": t.task_id, "error": "failed"}
            time.sleep(0.25)
        return None

    def cancel(self, task_id: str) -> bool:
        with self._lock:
            t = self._tasks.get(task_id)
            if not t or t.status in (TaskStatus.DONE, TaskStatus.FAILED, TaskStatus.CANCELLED):
                return False
            t.status = TaskStatus.CANCELLED; t.completed_at = time.time()
            if t.assigned_agent_id:
                a = self._agents.get(t.assigned_agent_id)
                if a and a.proc and a.proc.poll() is None:
                    try: a.proc.terminate()
                    except Exception: pass
                if a and a.current_task_id == task_id:
                    a.current_task_id = None
                    if a.state == AgentState.BUSY: a.state = AgentState.IDLE
            log(f"Cancelled {task_id}"); return True

    def resize_pool(self, size: int) -> None:
        size = max(self.min_agents, min(self.max_agents, size))
        with self._lock:
            if size == len(self._agents): return
        if size > len(self._agents):
            for _ in range(size - len(self._agents)): self.spawn_agent(["general"])
        else:
            with self._lock:
                idle = [(aid, r) for aid, r in self._agents.items()
                        if r.state == AgentState.IDLE and r.current_task_id is None]
                for aid, _ in idle[:len(self._agents) - size]:
                    self._shutdown_agent(aid)
        log(f"Pool resized to {size}")

    def shutdown(self) -> None:
        log("Shutting down..."); self._shutdown_event.set()
        with self._lock:
            for aid in list(self._agents.keys()): self._shutdown_agent(aid)
            self._agents.clear(); self._tasks.clear(); self._task_queue.clear()
        for t in (self._monitor_thread, self._dispatch_thread):
            if t and t.is_alive(): t.join(timeout=5.0)
        self._save_metrics(); log("Shutdown complete")

    def get_pool_status(self) -> dict[str, Any]:
        with self._lock:
            agents = [{
                "agent_id": aid, "state": r.state.name, "skill_tags": r.skill_tags,
                "current_task_id": r.current_task_id,
                "tasks_completed": r.tasks_completed, "success_rate": round(r.success_rate, 3),
                "quality_score": round(r.quality_score, 3),
            } for aid, r in self._agents.items()]
            pending = sum(1 for t in self._tasks.values() if t.status == TaskStatus.PENDING)
            running = sum(1 for t in self._tasks.values() if t.status == TaskStatus.RUNNING)
            done = sum(1 for t in self._tasks.values() if t.status == TaskStatus.DONE)
            failed = sum(1 for t in self._tasks.values() if t.status == TaskStatus.FAILED)
            return {"pool_size": len(self._agents), "max_agents": self.max_agents,
                    "agents": agents, "queue_depth": len(self._task_queue),
                    "tasks": {"pending": pending, "running": running, "done": done, "failed": failed},
                    "total_tasks": self._metrics.get("total_tasks", 0),
                    "total_success": self._metrics.get("total_success", 0),
                    "total_failed": self._metrics.get("total_failed", 0)}

    def inject_context(self, area: str, hint: str = "") -> str:
        return build_injected_context(area, hint)

    # ── routing ─────────────────────────────────────────────────────────────────
    def _route_task(self, area: str) -> str | None:
        with self._lock:
            idle = [r for r in self._agents.values()
                    if r.state == AgentState.IDLE and r.current_task_id is None]
            if not idle: return None
            def score(r: AgentRecord):
                ov = len(set(r.skill_tags) & {area})
                act = (r.tasks_completed + r.tasks_failed) / max(r.tasks_completed, 1)
                ok, tot = r.area_success.get(area, (1, 1))
                return (-ov, act, -(ok / max(tot, 1)))
            idle.sort(key=score); return idle[0].agent_id

    # ── background threads ──────────────────────────────────────────────────────
    def start(self) -> None:
        if self._monitor_thread and self._monitor_thread.is_alive(): return
        self._shutdown_event.clear()
        self._monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True, name="Monitor")
        self._monitor_thread.start()
        self._dispatch_thread = threading.Thread(target=self._dispatch_loop, daemon=True, name="Dispatch")
        self._dispatch_thread.start()
        log("Background threads started")

    def _monitor_loop(self) -> None:
        while not self._shutdown_event.is_set():
            try:
                self._cleanup_dead()
                self._check_heartbeats()
            except Exception as e: log(f"Monitor error: {e}")
            self._shutdown_event.wait(self.heartbeat_interval)

    def _dispatch_loop(self) -> None:
        while not self._shutdown_event.is_set():
            try: self._dispatch_one()
            except Exception as e: log(f"Dispatch error: {e}")
            time.sleep(0.25)

    def _dispatch_one(self) -> None:
        with self._lock:
            if not self._task_queue: return
            # find any idle agent
            agent_id = self._route_task("")
            if not agent_id:
                # try harder — any non-busy agent
                idle = [aid for aid, r in self._agents.items()
                        if r.state in (AgentState.IDLE, AgentState.COOLING)
                        and r.current_task_id is None]
                if not idle: return
                agent_id = idle[0]
            agent = self._agents.get(agent_id)
            if not agent or agent.state == AgentState.BUSY: return
            _, _, task = heapq.heappop(self._task_queue)
            if task.status != TaskStatus.PENDING: return
            task.status = TaskStatus.RUNNING; task.assigned_agent_id = agent_id
            task.started_at = time.time()
            agent.state = AgentState.BUSY; agent.current_task_id = task.task_id
        self._send_task(agent, task)

    def _send_task(self, agent: AgentRecord, task: TaskRecord) -> None:
        try:
            msg = {"cmd": "execute", "task_id": task.task_id, "prompt": task.prompt,
                   "context": task.context_used, "skill_tags": agent.skill_tags}
            if agent.proc and agent.proc.stdin:
                agent.proc.stdin.write(json.dumps(msg) + "\n"); agent.proc.stdin.flush()
                log(f"Dispatched {task.task_id} → {agent.agent_id}")
        except Exception as e:
            log(f"Send error {task.task_id}: {e}")
            with self._lock:
                task.status = TaskStatus.FAILED
                task.result = {"success": False, "error": str(e)}
                agent.state = AgentState.DEAD; agent.current_task_id = None

    def _process_agent_output(self, agent: AgentRecord) -> None:
        """Read and dispatch one line of agent stdout."""
        try:
            if not agent.proc or not agent.proc.stdout: return
            import select
            if not select.select([agent.proc.stdout], [], [], 0.1)[0]: return
            line = agent.proc.stdout.readline()
            if not line or "AGENT_READY" in line: return
            try: msg = json.loads(line.strip())
            except json.JSONDecodeError: return
            if msg.get("cmd") == "result":
                tid = msg.get("task_id", "")
                with self._lock:
                    task = self._tasks.get(tid)
                    if not task: return
                    task.completed_at = time.time()
                    ok = msg.get("success", False)
                    task.status = TaskStatus.DONE if ok else TaskStatus.FAILED
                    res = {"success": ok, "task_id": tid, "agent_id": msg.get("agent_id", agent.agent_id),
                           "output": msg.get("output", ""), "stderr": msg.get("stderr", ""),
                           "duration_s": msg.get("duration_s", 0.0),
                           "timestamp": msg.get("timestamp", "")}
                    # deduplicate
                    h = str(hash(res.get("output", "")))
                    prev = self._result_cache.get(h)
                    if prev and prev.get("success") and ok:
                        if len(res.get("stderr", "")) < len(prev.get("stderr", "")):
                            self._result_cache[h] = res; task.result = res
                        else: task.result = prev
                    else:
                        self._result_cache[h] = res; task.result = res
                    # agent metrics
                    agent.tasks_completed += 1 if ok else 0
                    agent.tasks_failed += 1 if not ok else 0
                    tot = agent.tasks_completed + agent.tasks_failed
                    agent.success_rate = agent.tasks_completed / tot if tot else 1.0
                    dur = msg.get("duration_s", 0.0)
                    if dur > 0: agent.total_duration_s += dur
                    # per-area
                    ok2, tot2 = agent.area_success.get(task.area, (0, 0))
                    agent.area_success[task.area] = (ok2 + (1 if ok else 0), tot2 + 1)
                    # global
                    self._metrics["total_success"] = self._metrics.get("total_success", 0) + (1 if ok else 0)
                    self._metrics["total_failed"] = self._metrics.get("total_failed", 0) + (1 if not ok else 0)
                    am = self._metrics.setdefault("area_metrics", {})
                    ae = am.setdefault(task.area, {"success": 0, "total": 0})
                    ae["total"] = ae.get("total", 0) + 1
                    ae["success"] = ae.get("success", 0) + (1 if ok else 0)
                    self._save_metrics()
                    agent.current_task_id = None
                    agent.state = AgentState.IDLE
                    agent.last_heartbeat = time.time()
                    # timeout check for other running tasks
                    for tid, t in self._tasks.items():
                        if t.status == TaskStatus.RUNNING:
                            elapsed = time.time() - (t.started_at or 0)
                            if elapsed > self.task_timeout:
                                t.status = TaskStatus.FAILED
                                t.result = {"success": False, "task_id": tid, "error": f"timeout {elapsed:.0f}s"}
                                ag = self._agents.get(t.assigned_agent_id)
                                if ag: ag.state = AgentState.IDLE; ag.current_task_id = None
                    log(f"Task {tid} {task.status.name.lower()} ({agent.agent_id}, {dur:.1f}s)")
            elif msg.get("cmd") == "pong":
                agent.last_heartbeat = time.time()
        except Exception as e: log(f"Output parse error {agent.agent_id}: {e}")

    def _check_heartbeats(self) -> None:
        with self._lock:
            for agent in self._agents.values():
                if agent.state == AgentState.DEAD: continue
                if time.time() - agent.last_heartbeat > self.heartbeat_interval * 3:
                    log(f"Heartbeat timeout {agent.agent_id} — DEAD")
                    agent.state = AgentState.DEAD
                    if agent.current_task_id:
                        t = self._tasks.get(agent.current_task_id)
                        if t and t.status == TaskStatus.RUNNING:
                            t.status = TaskStatus.FAILED
                            t.result = {"success": False, "task_id": t.task_id,
                                        "error": "heartbeat timeout"}
                    agent.current_task_id = None

    def _cleanup_dead(self) -> None:
        with self._lock:
            dead = [a for a, r in self._agents.items() if r.state == AgentState.DEAD]
            alive = sum(1 for r in self._agents.values() if r.state != AgentState.DEAD)
        for aid in dead:
            rec = self._agents.get(aid)
            if not rec: continue
            try:
                if rec.proc and rec.proc.poll() is None:
                    rec.proc.terminate(); rec.proc.wait(timeout=2.0)
            except Exception: pass
            try: (self.ma / f".agent_script_{aid}.py").unlink(missing_ok=True)
            except Exception: pass
            with self._lock: self._agents.pop(aid, None)
            log(f"Removed dead {aid}")
        # respawn to min
        with self._lock:
            cur = sum(1 for r in self._agents.values() if r.state != AgentState.DEAD)
        need = self.min_agents - cur
        if need > 0:
            log(f"Respawning {need} to maintain min pool")
            for _ in range(need): self.spawn_agent(["general"])

    def _shutdown_agent(self, agent_id: str) -> None:
        with self._lock: agent = self._agents.get(agent_id)
        if not agent: return
        try:
            if agent.proc and agent.proc.poll() is None:
                try:
                    if agent.proc.stdin:
                        agent.proc.stdin.write(json.dumps({"cmd": "shutdown"}) + "\n")
                        agent.proc.stdin.flush()
                    time.sleep(0.5)
                except Exception: pass
                if agent.proc.poll() is None: agent.proc.terminate()
                try: agent.proc.wait(timeout=3.0)
                except Exception: agent.proc.kill()
        except Exception as e: log(f"Shutdown agent {agent_id}: {e}")
        finally:
            with self._lock: self._agents.pop(agent_id, None)
            try: (self.ma / f".agent_script_{agent_id}.py").unlink(missing_ok=True)
            except Exception: pass

    def _wait_ready(self, proc: subprocess.Popen, agent_id: str) -> None:
        if not proc.stdout: return
        start = time.time()
        while time.time() - start < 10.0:
            if proc.poll() is not None: log(f"Agent {agent_id} died at startup rc={proc.returncode}"); return
            try:
                import select
                if select.select([proc.stdout], [], [], 0.5)[0]:
                    line = proc.stdout.readline()
                    if line and "AGENT_READY" in line: return
            except Exception: time.sleep(0.5)
        log(f"Agent {agent_id} READY timeout (10s)")

    def _save_metrics(self) -> None:
        try: _save_json(self._metrics_file, self._metrics)
        except Exception as e: log(f"Metrics save error: {e}")
