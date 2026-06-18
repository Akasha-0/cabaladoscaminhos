"""
SelfHealer — autonomous fault detection and recovery for the multi-agent system.

Detects: DEADLOCK, OOM, TIMEOUT, CORRUPT, CIRCUIT_OPEN
Priorities: CORRUPT > DEADLOCK > OOM > TIMEOUT > CIRCUIT_OPEN
Circuit breaker: >3 retries in 1800s per phase opens circuit.
"""

from __future__ import annotations

import json
import os
import signal
import time
from enum import Enum, auto
from pathlib import Path
from typing import Any, Optional

# --------------------------------------------------------------------------- #
# Constants
# --------------------------------------------------------------------------- #

ROOT = Path("/home/skynet/cabala-dos-caminhos")
MA = ROOT / ".autonomous" / "multi-agent"

STATE_FILE = MA / "state.json"
SOCKET_FILE = MA / "agent.sock"
RECOVERY_HISTORY = MA / "recovery-history.json"
CIRCUIT_BREAKER_FILE = MA / "circuit-breaker.json"

MAX_RETRIES = 3
CIRCUIT_WINDOW_S = 1800  # 30 minutes
RETENTION_S = 86400  # 24 hours — prune history entries older than this


# --------------------------------------------------------------------------- #
# Enums
# --------------------------------------------------------------------------- #

class IssueType(Enum):
    NONE = auto()
    DEADLOCK = auto()
    OOM = auto()
    TIMEOUT = auto()
    CORRUPT = auto()
    CIRCUIT_OPEN = auto()


class RecoveryStrategy(Enum):
    STATE_ROLLBACK = auto()
    GC_RESTART = auto()
    KILL_RETRY = auto()
    RESTORE_BACKUP = auto()
    SKIP_PHASE = auto()


# --------------------------------------------------------------------------- #
# JSON helpers (load / save)
# --------------------------------------------------------------------------- #

def load_json(path: Path) -> Any:
    """Load JSON from *path*, returning {} on any error."""
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def save_json(path: Path, data: Any) -> None:
    """Write *data* as JSON to *path* (pretty-printed)."""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")


# --------------------------------------------------------------------------- #
# System diagnostics (memory / CPU / process)
# --------------------------------------------------------------------------- #

def _read_proc_stat(path: str) -> Optional[str]:
    """Read a /proc/* file as text, or None if unavailable."""
    try:
        return Path(path).read_text(encoding="utf-8", errors="replace").strip()
    except Exception:
        return None


def get_process_memory_mb(pid: int) -> Optional[float]:
    """RSS memory of *pid* in MB, or None if unavailable."""
    try:
        stat = _read_proc_stat(f"/proc/{pid}/status")
        if stat:
            for line in stat.splitlines():
                if line.startswith("VmRSS:"):
                    kb = int(line.split()[1])
                    return kb / 1024
    except Exception:
        pass
    return None


def get_system_memory_percent() -> Optional[float]:
    """Overall system memory usage as percent (0–100), or None if unavailable."""
    try:
        meminfo = _read_proc_stat("/proc/meminfo")
        if not meminfo:
            return None
        total = avail = None
        for line in meminfo.splitlines():
            parts = line.split()
            if len(parts) < 2:
                continue
            if parts[0] == "MemTotal:":
                total = int(parts[1])
            elif parts[0] == "MemAvailable:":
                avail = int(parts[1])
        if total and avail is not None:
            return round((total - avail) / total * 100, 1)
    except Exception:
        pass
    return None


def get_system_cpu_percent() -> Optional[float]:
    """System CPU utilisation as percent (0–100), or None if unavailable."""
    try:
        # Read two snapshots 0.1 s apart
        def _cpu_times() -> Optional[tuple[int, int]]:
            line = _read_proc_stat("/proc/stat")
            if not line or not line.startswith("cpu "):
                return None
            fields = line.split()
            user = int(fields[1])
            nice = int(fields[2])
            system = int(fields[3])
            idle = int(fields[4])
            iowait = int(fields[5]) if len(fields) > 5 else 0
            irq = int(fields[6]) if len(fields) > 6 else 0
            softirq = int(fields[7]) if len(fields) > 7 else 0
            active = user + nice + system + irq + softirq
            total = active + idle + iowait
            return (active, total)

        t1 = _cpu_times()
        if not t1:
            return None
        time.sleep(0.1)
        t2 = _cpu_times()
        if not t2:
            return None
        dac, dtc = t2[0] - t1[0], t2[1] - t1[1]
        if dtc == 0:
            return 0.0
        return round(dac / dtc * 100, 1)
    except Exception:
        return None


def is_process_alive(pid: int) -> bool:
    """Check whether a process with *pid* exists (sends signal 0)."""
    try:
        os.kill(pid, 0)
        return True
    except (ProcessLookupError, PermissionError):
        return False
    except Exception:
        return False


def get_zombie_pids() -> list[int]:
    """Return PIDs of zombie processes whose parent is the current process tree."""
    zombies: list[int] = []
    try:
        for entry in Path("/proc").iterdir():
            if not entry.name.isdigit():
                continue
            pid = int(entry.name)
            try:
                status = entry.joinpath("status").read_text(encoding="utf-8", errors="replace")
            except Exception:
                continue
            is_zombie = False
            ppid = os.getpid()
            for line in status.splitlines():
                if line.startswith("State:") and "Z" in line:
                    is_zombie = True
                if line.startswith("PPid:"):
                    try:
                        ppid = int(line.split()[1])
                    except Exception:
                        pass
            # Only report zombies whose PPid is a process we may be responsible for
            if is_zombie and (ppid == os.getpid() or ppid == 1):
                zombies.append(pid)
    except Exception:
        pass
    return zombies


# --------------------------------------------------------------------------- #
# State / socket / backup helpers
# --------------------------------------------------------------------------- #

def validate_state_json() -> tuple[bool, Optional[str]]:
    """
    Check that state.json is a valid, parseable JSON file.
    Returns (True, None) if valid, (False, reason) otherwise.
    """
    if not STATE_FILE.exists():
        return False, "state.json does not exist"
    try:
        data = json.loads(STATE_FILE.read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            return False, "state.json root must be an object"
        return True, None
    except json.JSONDecodeError as e:
        return False, f"state.json is not valid JSON: {e}"
    except Exception as e:
        return False, f"state.json read error: {e}"


def check_socket_exists() -> tuple[bool, Optional[str]]:
    """Check that the agent socket exists and is a socket."""
    if not SOCKET_FILE.exists():
        return False, "agent.sock does not exist"
    try:
        stat_info = SOCKET_FILE.stat()
        import stat

        if not stat.S_ISSOCK(stat_info.st_mode):
            return False, "agent.sock exists but is not a socket"
        return True, None
    except Exception as e:
        return False, f"socket stat error: {e}"


# --------------------------------------------------------------------------- #
# Backup management
# --------------------------------------------------------------------------- #

BACKUP_DIR = MA / "backups"


def list_backups() -> list[dict[str, Any]]:
    """Return sorted list of backup metadata dicts (newest first)."""
    backups: list[dict[str, Any]] = []
    if not BACKUP_DIR.is_dir():
        return backups
    for entry in sorted(BACKUP_DIR.iterdir(), key=lambda p: p.stat().st_mtime, reverse=True):
        if entry.suffix == ".json":
            meta = load_json(entry)
            if isinstance(meta, dict):
                backups.append({"file": str(entry.name), "mtime": entry.stat().st_mtime, **meta})
    return backups


def create_backup(tag: str) -> Optional[Path]:
    """Snapshot current state.json into backups/ with *tag*."""
    if not STATE_FILE.exists():
        return None
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    dest = BACKUP_DIR / f"{tag}_{int(time.time())}.json"
    try:
        dest.write_text(STATE_FILE.read_text(encoding="utf-8"), encoding="utf-8")
        return dest
    except Exception:
        return None


def restore_backup(backup_file: Path) -> bool:
    """Restore *backup_file* over state.json. Returns True on success."""
    if not backup_file.exists():
        return False
    try:
        # Validate before restoring
        json.loads(backup_file.read_text(encoding="utf-8"))
        BACKUP_DIR.mkdir(parents=True, exist_ok=True)
        STATE_FILE.write_text(backup_file.read_text(encoding="utf-8"), encoding="utf-8")
        return True
    except Exception:
        return False


# --------------------------------------------------------------------------- #
# Recovery history
# --------------------------------------------------------------------------- #

def load_recovery_history() -> list[dict[str, Any]]:
    """Load the recovery history list, or [] if absent / corrupt."""
    return load_json(RECOVERY_HISTORY) if isinstance(load_json(RECOVERY_HISTORY), list) else []


def append_recovery_event(
    issue: IssueType,
    strategy: RecoveryStrategy,
    phase: Optional[str],
    success: bool,
    details: Optional[str] = None,
) -> None:
    """Append a recovery event to the history log, then prune old entries."""
    history = load_recovery_history()
    entry: dict[str, Any] = {
        "ts": time.time(),
        "iso": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "issue": issue.name,
        "strategy": strategy.name,
        "phase": phase,
        "success": success,
    }
    if details:
        entry["details"] = details
    history.insert(0, entry)
    # Prune entries older than RETENTION_S and cap list at 500 entries
    cutoff = time.time() - RETENTION_S
    history = [e for e in history if e.get("ts", 0) > cutoff][:500]
    save_json(RECOVERY_HISTORY, history)


# --------------------------------------------------------------------------- #
# Circuit breaker
# --------------------------------------------------------------------------- #

def load_circuit_state() -> dict[str, list[float]]:
    """Load circuit-breaker state: {phase: [timestamp, ...]}."""
    data = load_json(CIRCUIT_BREAKER_FILE)
    if isinstance(data, dict) and all(
        isinstance(v, list) and all(isinstance(t, (int, float)) for t in v)
        for v in data.values()
    ):
        return data
    return {}


def save_circuit_state(state: dict[str, list[float]]) -> None:
    save_json(CIRCUIT_BREAKER_FILE, state)


def is_circuit_open_for_phase(phase: str) -> bool:
    """Return True if *phase* has exceeded MAX_RETRIES within CIRCUIT_WINDOW_S."""
    state = load_circuit_state()
    now = time.time()
    window = [t for t in state.get(phase, []) if now - t < CIRCUIT_WINDOW_S]
    return len(window) > MAX_RETRIES


def record_retry_for_phase(phase: str) -> None:
    """Record a retry attempt for *phase*."""
    state = load_circuit_state()
    now = time.time()
    window = [t for t in state.get(phase, []) if now - t < CIRCUIT_WINDOW_S]
    window.append(now)
    state[phase] = window
    save_circuit_state(state)


def clear_phase_from_circuit(phase: str) -> None:
    """Remove all retry timestamps for *phase*."""
    state = load_circuit_state()
    state.pop(phase, None)
    save_circuit_state(state)


# --------------------------------------------------------------------------- #
# Issue detection helpers
# --------------------------------------------------------------------------- #

def detect_deadlock() -> bool:
    """
    Detect a potential deadlock.
    Heuristic: state.json exists and reports phase='RUNNING' but the
    process registered in state.json is not alive.
    """
    data = load_json(STATE_FILE)
    if not isinstance(data, dict):
        return False
    # If phase is stuck in a running state for an unreasonably long time,
    # and the tracked PID is dead, suspect deadlock.
    if data.get("phase") in ("RUNNING", "WAITING", "BLOCKED") and data.get("stuck_since"):
        stuck_duration = time.time() - data.get("stuck_since", 0)
        if stuck_duration > 300:  # 5 minutes
            pid = data.get("pid")
            if pid and not is_process_alive(int(pid)):
                return True
    # Check for circular dependency in agent dependencies
    deps = data.get("dependencies", {})
    if isinstance(deps, dict):
        # Simple cycle detection in dependency graph
        visited: set[str] = set()
        stack: list[str] = list(deps.keys())
        while stack:
            node = stack.pop()
            if node in visited:
                return True  # cycle detected
            visited.add(node)
            node_deps = deps.get(node, [])
            if isinstance(node_deps, list):
                stack.extend(node_deps)
    return False


def detect_oom() -> bool:
    """Detect whether the system or a relevant process is near OOM."""
    mem_percent = get_system_memory_percent()
    if mem_percent is not None and mem_percent > 90:
        return True
    # Check if any agent process exceeds 80% of available memory
    data = load_json(STATE_FILE)
    pid = data.get("pid")
    if pid:
        proc_mem = get_process_memory_mb(int(pid))
        if proc_mem:
            total_mem_mb = _total_memory_mb()
            if total_mem_mb and proc_mem / total_mem_mb > 0.8:
                return True
    return False


def _total_memory_mb() -> Optional[float]:
    """Total system memory in MB."""
    try:
        line = _read_proc_stat("/proc/meminfo")
        if line:
            for lline in line.splitlines():
                if lline.startswith("MemTotal:"):
                    return int(lline.split()[1]) / 1024
    except Exception:
        pass
    return None


def detect_timeout() -> bool:
    """Detect a phase timeout condition."""
    data = load_json(STATE_FILE)
    if not isinstance(data, dict):
        return False
    timeout_ts = data.get("phase_timeout")
    if timeout_ts:
        if time.time() > float(timeout_ts):
            return True
    # Check recovery history for recent timeout issues
    history = load_recovery_history()
    now = time.time()
    recent_timeouts = [
        e for e in history
        if e.get("issue") == IssueType.TIMEOUT.name
        and now - e.get("ts", 0) < 600  # 10-minute window
    ]
    return len(recent_timeouts) >= 3


def detect_corrupt() -> bool:
    """Detect corruption: state.json invalid JSON, or socket missing, or zombie PIDs."""
    valid, _ = validate_state_json()
    if not valid:
        return True
    sock_ok, _ = check_socket_exists()
    if not sock_ok:
        return True
    if get_zombie_pids():
        return True
    return False


# --------------------------------------------------------------------------- #
# Recovery executors
# --------------------------------------------------------------------------- #

def rollback_state() -> bool:
    """Rollback state.json to the most recent valid backup."""
    backups = list_backups()
    for backup in backups:
        bp = BACKUP_DIR / backup["file"]
        if restore_backup(bp):
            return True
    return False


def gc_restart() -> bool:
    """
    Attempt to free memory by triggering garbage collection,
    then verify the process is still alive.
    """
    import gc

    gc.collect()
    # Also try to drop inotify watches if any are stuck
    try:
        for fd_path in Path("/proc/self/fd").iterdir():
            try:
                link = os.readlink(str(fd_path))
                if "inotify" in link:
                    pass  # just a hint; we can't safely close FDs from here
            except Exception:
                pass
    except Exception:
        pass

    data = load_json(STATE_FILE)
    pid = data.get("pid")
    if pid and not is_process_alive(int(pid)):
        return False
    return True


def kill_and_retry(phase: Optional[str] = None) -> bool:
    """
    Kill stuck child processes, record retry, and return True
    to signal the loop should re-enter the phase.
    """
    zombies = get_zombie_pids()
    for zp in zombies:
        try:
            os.kill(zp, signal.SIGKILL)
        except Exception:
            pass
    # Also kill any subprocess tree registered in state.json
    data = load_json(STATE_FILE)
    for child in data.get("children", []):
        try:
            os.kill(int(child), signal.SIGKILL)
        except Exception:
            pass
    if phase:
        record_retry_for_phase(phase)
    return True


def restore_from_backup() -> bool:
    """Restore from the most recent backup; rollback_state is preferred."""
    backups = list_backups()
    if not backups:
        return False
    return restore_backup(BACKUP_DIR / backups[0]["file"])


def skip_phase() -> bool:
    """
    Mark the current phase as SKIPPED in state.json and advance.
    Returns True if state was updated, False otherwise.
    """
    if not STATE_FILE.exists():
        return False
    try:
        data = load_json(STATE_FILE)
        data["phase"] = "SKIPPED"
        data["skipped_at"] = time.time()
        save_json(STATE_FILE, data)
        return True
    except Exception:
        return False


# --------------------------------------------------------------------------- #
# Recovery suggestion matrix
# --------------------------------------------------------------------------- #

_RECOVERY_MAP: dict[IssueType, list[RecoveryStrategy]] = {
    IssueType.CORRUPT: [
        RecoveryStrategy.RESTORE_BACKUP,
        RecoveryStrategy.STATE_ROLLBACK,
        RecoveryStrategy.SKIP_PHASE,
    ],
    IssueType.DEADLOCK: [
        RecoveryStrategy.KILL_RETRY,
        RecoveryStrategy.GC_RESTART,
        RecoveryStrategy.STATE_ROLLBACK,
    ],
    IssueType.OOM: [
        RecoveryStrategy.GC_RESTART,
        RecoveryStrategy.KILL_RETRY,
        RecoveryStrategy.SKIP_PHASE,
    ],
    IssueType.TIMEOUT: [
        RecoveryStrategy.KILL_RETRY,
        RecoveryStrategy.STATE_ROLLBACK,
        RecoveryStrategy.SKIP_PHASE,
    ],
    IssueType.CIRCUIT_OPEN: [
        RecoveryStrategy.STATE_ROLLBACK,
        RecoveryStrategy.SKIP_PHASE,
    ],
    IssueType.NONE: [],
}


# --------------------------------------------------------------------------- #
# SelfHealer
# --------------------------------------------------------------------------- #

class SelfHealer:
    """
    Autonomous fault detection and recovery for the multi-agent loop.

    Usage::

        healer = SelfHealer()
        health = healer.check_health()
        issue  = healer.detect_issue()
        healer.recover(RecoveryStrategy.KILL_RETRY)
        healer.is_circuit_open()   # per-phase circuit breaker
        healer.reset_circuit()
    """

    # --------------------------------------------------------------------------- #
    # Public API
    # --------------------------------------------------------------------------- #

    def check_health(self) -> dict[str, Any]:
        """
        Run all health checks and return a structured report.

        Returns::

            {
                "healthy": bool,
                "status": str,          # "OK" | "DEGRADED" | "CRITICAL"
                "details": {
                    "state_json":    {"valid": bool, "reason": Optional[str]},
                    "socket":        {"exists": bool, "reason": Optional[str]},
                    "memory":        {"percent": Optional[float], "pid_mb": Optional[float]},
                    "cpu":           {"percent": Optional[float]},
                    "zombies":      list[int],
                    "pid_alive":     bool,
                }
            }
        """
        state_valid, state_reason = validate_state_json()
        socket_ok, socket_reason = check_socket_exists()
        mem_pct = get_system_memory_percent()
        cpu_pct = get_system_cpu_percent()
        zombies = get_zombie_pids()

        pid_alive = False
        proc_mem_mb: Optional[float] = None
        data = load_json(STATE_FILE)
        pid = data.get("pid") if isinstance(data, dict) else None
        if pid:
            pid_alive = is_process_alive(int(pid))
            proc_mem_mb = get_process_memory_mb(int(pid))

        issues: list[str] = []
        if not state_valid:
            issues.append(f"state.json: {state_reason}")
        if not socket_ok:
            issues.append(f"socket: {socket_reason}")
        if mem_pct and mem_pct > 85:
            issues.append(f"high memory ({mem_pct}%)")
        if zombies:
            issues.append(f"zombie PIDs: {zombies}")
        if not pid_alive:
            issues.append("registered process not alive")

        status = "OK" if not issues else ("CRITICAL" if len(issues) > 2 else "DEGRADED")
        healthy = status == "OK"

        return {
            "healthy": healthy,
            "status": status,
            "details": {
                "state_json": {"valid": state_valid, "reason": state_reason},
                "socket": {"exists": socket_ok, "reason": socket_reason},
                "memory": {"percent": mem_pct, "pid_mb": proc_mem_mb},
                "cpu": {"percent": cpu_pct},
                "zombies": zombies,
                "pid_alive": pid_alive,
            },
        }

    def detect_issue(self) -> IssueType:
        """
        Detect the highest-priority active issue.

        Priority order (highest first):
            1. CORRUPT
            2. DEADLOCK
            3. OOM
            4. TIMEOUT
            5. CIRCUIT_OPEN
            6. NONE
        """
        # Build list in priority order
        checks: list[tuple[IssueType, callable]] = [
            (IssueType.CORRUPT, detect_corrupt),
            (IssueType.DEADLOCK, detect_deadlock),
            (IssueType.OOM, detect_oom),
            (IssueType.TIMEOUT, detect_timeout),
            (IssueType.CIRCUIT_OPEN, lambda: False),  # handled by is_circuit_open
        ]

        for issue_type, check_fn in checks:
            if issue_type == IssueType.CIRCUIT_OPEN:
                # Check circuit breaker per phase
                data = load_json(STATE_FILE)
                phase = data.get("phase", "UNKNOWN") if isinstance(data, dict) else "UNKNOWN"
                if self.is_circuit_open() or is_circuit_open_for_phase(phase):
                    return IssueType.CIRCUIT_OPEN
            else:
                try:
                    if check_fn():
                        return issue_type
                except Exception:
                    pass
        return IssueType.NONE

    def suggest_recovery(self, issue: IssueType) -> list[RecoveryStrategy]:
        """
        Return the ordered list of recovery strategies to try for *issue*,
        from most aggressive to least.
        """
        return list(_RECOVERY_MAP.get(issue, []))

    def recover(self, strategy: RecoveryStrategy, phase: Optional[str] = None) -> bool:
        """
        Execute *strategy* and record the outcome in recovery history.

        Returns True if the recovery succeeded (system recovered),
        False otherwise.
        """
        executor: callable[[], bool]
        if strategy == RecoveryStrategy.STATE_ROLLBACK:
            executor = rollback_state
        elif strategy == RecoveryStrategy.GC_RESTART:
            executor = gc_restart
        elif strategy == RecoveryStrategy.KILL_RETRY:
            executor = lambda: kill_and_retry(phase)
        elif strategy == RecoveryStrategy.RESTORE_BACKUP:
            executor = restore_from_backup
        elif strategy == RecoveryStrategy.SKIP_PHASE:
            executor = skip_phase
        else:
            executor = lambda: False

        try:
            success = bool(executor())
        except Exception as e:
            success = False
            err_msg = str(e)
        else:
            err_msg = None

        # Fetch phase from state if not supplied
        if phase is None:
            data = load_json(STATE_FILE)
            phase = data.get("phase") if isinstance(data, dict) else None

        append_recovery_event(
            issue=self.detect_issue(),
            strategy=strategy,
            phase=phase,
            success=success,
            details=err_msg,
        )

        # If KILL_RETRY succeeded and a phase was set, record the retry
        if success and strategy == RecoveryStrategy.KILL_RETRY and phase:
            record_retry_for_phase(phase)

        return success

    def is_circuit_open(self) -> bool:
        """
        Return True if the global circuit breaker is open
        (>3 retries in the last 1800 s across any phase).
        """
        state = load_circuit_state()
        now = time.time()
        total = 0
        for phase_ts in state.values():
            window = [t for t in phase_ts if now - t < CIRCUIT_WINDOW_S]
            total += len(window)
        return total > MAX_RETRIES

    def reset_circuit(self, phase: Optional[str] = None) -> None:
        """
        Reset the circuit breaker.

        If *phase* is given, only that phase's counters are cleared.
        Otherwise all phases are reset.
        """
        if phase:
            clear_phase_from_circuit(phase)
        else:
            save_circuit_state({})

    # --------------------------------------------------------------------------- #
    # Convenience / debugging helpers
    # --------------------------------------------------------------------------- #

    def full_diagnostic_report(self) -> dict[str, Any]:
        """Return a combined health report + detected issue + recovery suggestions."""
        health = self.check_health()
        issue = self.detect_issue()
        suggestions = self.suggest_recovery(issue)
        circuit_open = self.is_circuit_open()
        recovery_history = load_recovery_history()[:10]  # last 10 events
        backups = list_backups()[:5]  # last 5 backups

        return {
            "health": health,
            "detected_issue": issue.name,
            "recovery_suggestions": [s.name for s in suggestions],
            "circuit_open": circuit_open,
            "recovery_history": recovery_history,
            "available_backups": backups,
        }

    def auto_recover(self) -> tuple[bool, Optional[RecoveryStrategy]]:
        """
        Run detect_issue(), then iterate over suggested strategies in order
        until one succeeds.

        Returns (recovered, strategy_used).
        """
        issue = self.detect_issue()
        if issue == IssueType.NONE:
            return True, None

        # Check circuit breaker before attempting recovery
        if issue == IssueType.CIRCUIT_OPEN or self.is_circuit_open():
            # Cannot auto-recover with circuit open — signal need for manual intervention
            return False, None

        data = load_json(STATE_FILE)
        phase = data.get("phase") if isinstance(data, dict) else None

        for strategy in self.suggest_recovery(issue):
            if self.recover(strategy, phase=phase):
                return True, strategy
        return False, None

    def prune_old_history(self) -> int:
        """Remove entries older than RETENTION_S from recovery history. Returns count removed."""
        history = load_recovery_history()
        before = len(history)
        cutoff = time.time() - RETENTION_S
        history = [e for e in history if e.get("ts", 0) > cutoff]
        save_json(RECOVERY_HISTORY, history)
        return before - len(history)

    def get_phase_retry_count(self, phase: str) -> int:
        """Return the number of retries for *phase* within the circuit window."""
        state = load_circuit_state()
        now = time.time()
        return len([t for t in state.get(phase, []) if now - t < CIRCUIT_WINDOW_S])

    def create_state_backup(self, tag: str = "manual") -> Optional[Path]:
        """Create a manually-tagged snapshot of state.json."""
        return create_backup(tag)
