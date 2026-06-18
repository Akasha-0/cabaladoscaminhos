"""
Guardian — multi-agent health monitor and process supervisor.

States: STARTING | HEALTHY | DEGRADED | RESTARTING | UNHEALTHY | CRITICAL

Consecutive failure actions:
  2 consecutive failures → DEGRADED
  3 consecutive failures → CRITICAL + automatic restart

Exponential backoff on health-check intervals:
  initial=5s, max=120s, factor=2  →  5→10→20→40→80→120

Persistence: MA/guardian-state.json  {restart_count, cumulative_downtime_s}

Signal handling:
  SIGTERM/SIGINT  → graceful shutdown (stop)
  SIGHUP          → reload state from disk
"""

from __future__ import annotations

import errno
import json
import os
import signal
import socket
import struct
import sys
import threading
import time
from enum import Enum, auto
from pathlib import Path
from typing import Any, Callable, Optional

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

ROOT: Path = Path("/home/skynet/cabala-dos-caminhos")
MA: Path = ROOT / ".autonomous" / "multi-agent"
STATE_FILE: Path = MA / "guardian-state.json"
PID_FILE: Path = MA / "guardian.pid"
SOCKET_FILE: Path = MA / "guardian.sock"

# Backoff
BACKOFF_INITIAL_S: float = 5.0
BACKOFF_MAX_S: float = 120.0
BACKOFF_FACTOR: float = 2.0

# Failure thresholds
FAILURES_DEGRADED: int = 2
FAILURES_CRITICAL: int = 3

# Health-check interval default (seconds)
DEFAULT_HEALTH_INTERVAL: float = 10.0

# ---------------------------------------------------------------------------
# State enum
# ---------------------------------------------------------------------------

class State(Enum):
    STARTING = auto()
    HEALTHY = auto()
    DEGRADED = auto()
    RESTARTING = auto()
    UNHEALTHY = auto()
    CRITICAL = auto()

    def __str__(self) -> str:
        return self.name


# ---------------------------------------------------------------------------
# JSON helpers
# ---------------------------------------------------------------------------

def load_json(path: Path) -> dict[str, Any]:
    try:
        return json.loads(path.read_text())
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def save_json(path: Path, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, indent=2))
    tmp.replace(path)


# ---------------------------------------------------------------------------
# Health-check results
# ---------------------------------------------------------------------------

class CheckResult:
    """Single health-check result."""
    __slots__ = ("name", "ok", "detail")

    def __init__(self, name: str, ok: bool, detail: str = ""):
        self.name = name
        self.ok = ok
        self.detail = detail

    def to_dict(self) -> dict[str, Any]:
        return {"name": self.name, "ok": self.ok, "detail": self.detail}


# ---------------------------------------------------------------------------
# Guardian
# ---------------------------------------------------------------------------

class Guardian:
    """
    Multi-agent process guardian.

    Monitors the health of the local agent supervisor and automatically
    transitions through STARTING → HEALTHY → DEGRADED → CRITICAL states
    based on consecutive health-check failures.

    On CRITICAL state (3 consecutive failures) an automatic restart is
    triggered.  The restart count and cumulative downtime are persisted to
    MA/guardian-state.json so they survive process restarts.
    """

    # ------------------------------------------------------------------
    # Lifecycle
    # ------------------------------------------------------------------

    def __init__(
        self,
        health_interval: float = DEFAULT_HEALTH_INTERVAL,
        target_pid: Optional[int] = None,
        socket_path: Optional[Path] = None,
    ) -> None:
        self.health_interval = health_interval
        self.target_pid = target_pid  # None = monitor self
        self._socket_path = socket_path or SOCKET_FILE

        # -- volatile state ----------------------------------------------------
        self._state = State.STARTING
        self._consecutive_failures = 0
        self._restart_count = 0
        self._cumulative_downtime_s = 0.0
        self._start_time: Optional[float] = None        # monotonic
        self._down_since: Optional[float] = None       # monotonic
        self._running = False
        self._thread: Optional[threading.Thread] = None
        self._lock = threading.RLock()

        # -- backoff -----------------------------------------------------------
        self._backoff_s = BACKOFF_INITIAL_S

        # -- signal handlers ----------------------------------------------------
        self._orig_sigterm: Optional[Callable[[int, Any], None]] = None
        self._orig_sigint: Optional[Callable[[int, Any], None]] = None
        self._orig_sighup: Optional[Callable[[int, Any], None]] = None

        # -- load persisted state ----------------------------------------------
        self._reload_from_disk()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def start(self) -> None:
        """Begin guardian monitoring loop."""
        with self._lock:
            if self._running:
                return
            self._running = True
            self._state = State.STARTING
            self._start_time = time.monotonic()
            self._down_since = None
            self._consecutive_failures = 0
            self._backoff_s = BACKOFF_INITIAL_S

        self._write_pid()
        self._install_signal_handlers()

        self._thread = threading.Thread(target=self._loop, name="GuardianLoop", daemon=True)
        self._thread.start()

    def stop(self) -> None:
        """Graceful shutdown — stops monitoring."""
        with self._lock:
            if not self._running:
                return
            self._running = False

        self._remove_signal_handlers()
        self._cleanup_pid()
        self._state = State.UNHEALTHY

        if self._thread is not None:
            self._thread.join(timeout=5.0)
            self._thread = None

    def restart(self) -> None:
        """Manual restart: stop and start again."""
        self.stop()
        time.sleep(0.5)
        self._restart_count += 1
        self._save_to_disk()
        self.start()

    def status(self) -> dict[str, Any]:
        """
        Return current guardian status.

        Returns
        -------
        {
            "state": str,
            "restart_count": int,
            "uptime_s": float,
            "consecutive_failures": int,
        }
        """
        with self._lock:
            uptime_s = 0.0
            if self._start_time is not None:
                uptime_s = time.monotonic() - self._start_time
            return {
                "state": self._state.name,
                "restart_count": self._restart_count,
                "uptime_s": round(uptime_s, 2),
                "consecutive_failures": self._consecutive_failures,
            }

    def health_check(self) -> dict[str, Any]:
        """
        Run a single pass of all health checks.

        Returns
        -------
        {
            "healthy": bool,
            "checks": [
                {"name": str, "ok": bool, "detail": str},
                ...
            ],
        }
        """
        checks = [
            self._check_pid_alive(),
            self._check_socket_exists(),
            self._check_socket_ping(),
            self._check_memory_mb(),
            self._check_cpu_percent(),
        ]
        all_ok = all(c.ok for c in checks)
        return {"healthy": all_ok, "checks": [c.to_dict() for c in checks]}

    # ------------------------------------------------------------------
    # Health checks
    # ------------------------------------------------------------------

    def _check_pid_alive(self) -> CheckResult:
        """Verify the target process is still running via os.kill(pid, 0)."""
        pid = self.target_pid or os.getpid()
        try:
            os.kill(pid, 0)
            return CheckResult("pid_alive", True, f"PID {pid} is alive")
        except OSError as e:
            return CheckResult("pid_alive", False, f"PID {pid} unreachable: {e}")

    def _check_socket_exists(self) -> CheckResult:
        """Verify the guardian UNIX domain socket exists."""
        path = self._socket_path
        try:
            exists = path.exists()
            if exists:
                return CheckResult("socket_exists", True, str(path))
            return CheckResult("socket_exists", False, f"{path} not found")
        except OSError as e:
            return CheckResult("socket_exists", False, str(e))

    def _check_socket_ping(self) -> CheckResult:
        """
        Send a 1-byte ping over the UNIX domain socket.
        Returns OK if the socket accepts the connection (daemon is responsive).
        """
        path = self._socket_path
        sock = None
        try:
            sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
            sock.settimeout(3.0)
            sock.connect(str(path))
            # Send a trivial ping; a healthy guardian echoes or closes cleanly
            sock.sendall(b"\x00")
            return CheckResult("socket_ping", True, f"connected to {path}")
        except (OSError, socket.timeout) as e:
            return CheckResult("socket_ping", False, f"ping failed: {e}")
        finally:
            if sock is not None:
                try:
                    sock.close()
                except Exception:
                    pass

    def _check_memory_mb(self) -> CheckResult:
        """
        Read resident memory from /proc/self/statm.
        Returns RSS in MB.
        """
        try:
            # statm fields: size resident shared text lib data dt
            statm = Path("/proc/self/statm").read_text()
            parts = statm.split()
            rss_pages = int(parts[1])
            # Each page is 4096 bytes on Linux
            rss_bytes = rss_pages * 4096
            rss_mb = rss_bytes / (1024 * 1024)
            return CheckResult(
                "memory_mb",
                True,
                f"{rss_mb:.1f} MB",
            )
        except Exception as e:
            return CheckResult("memory_mb", False, str(e))

    def _check_cpu_percent(self) -> CheckResult:
        """
        Compute approximate CPU utilisation from /proc/self/stat.

        On Linux, utime and stime (fields 11 and 12 of /proc/self/stat)
        accumulate in jiffies.  We sample at two points in time and divide
        by the elapsed wall time to get a rough percentage.
        """
        try:
            def _read_cpu() -> tuple[float, float]:
                stat = Path("/proc/self/stat").read_text()
                # The stat file is one line; fields are space-separated.
                # Fields 11=utime, 12=stime (user-space and kernel CPU ticks).
                # Comm field (field 1) may contain spaces if renamed; find the
                # last ')' to anchor parsing.
                last_paren = stat.rfind(")")
                fields = stat[last_paren + 2 :].split()
                utime = int(fields[4])   # after ') '
                stime = int(fields[5])
                return float(utime + stime)

            cpu_before = _read_cpu()
            t_before = time.monotonic()
            # Busy-wait for a short interval to accumulate CPU ticks
            _ = sum(i * i for i in range(50_000))
            t_after = time.monotonic()
            cpu_after = _read_cpu()

            elapsed = t_after - t_before
            if elapsed <= 0:
                return CheckResult("cpu_percent", False, "elapsed time <= 0")

            # clock ticks per second (jiffies)
            clk_tck = os.sysconf(os.sysconf_names["SC_CLK_TCK"])
            cpu_used = (cpu_after - cpu_before) / clk_tck
            pct = cpu_used / elapsed * 100.0
            return CheckResult("cpu_percent", True, f"{pct:.1f}%")
        except Exception as e:
            return CheckResult("cpu_percent", False, str(e))

    # ------------------------------------------------------------------
    # Monitor loop
    # ------------------------------------------------------------------

    def _loop(self) -> None:
        """Main monitoring loop — runs in a daemon thread."""
        # Initial STARTING → HEALTHY transition
        self._transition_to(State.HEALTHY)

        while self._running:
            interval = self._current_interval()
            time.sleep(interval)

            if not self._running:
                break

            result = self.health_check()
            self._process_health_result(result)

        # Persist state on clean exit
        self._save_to_disk()

    def _current_interval(self) -> float:
        """Return the backoff-adjusted health-check interval."""
        with self._lock:
            return self._backoff_s

    def _process_health_result(self, result: dict[str, Any]) -> None:
        """
        Advance state machine based on a health-check result.

        Consecutive failure actions:
          2 → DEGRADED
          3 → CRITICAL + restart
        """
        healthy: bool = result["healthy"]
        checks: list[dict[str, Any]] = result["checks"]

        with self._lock:
            if healthy:
                if self._consecutive_failures > 0:
                    self._consecutive_failures = 0
                    self._backoff_s = BACKOFF_INITIAL_S
                    self._down_since = None
                if self._state in (State.DEGRADED, State.UNHEALTHY):
                    self._transition_to(State.HEALTHY)
                elif self._state == State.STARTING:
                    self._transition_to(State.HEALTHY)
                # CRITICAL stays CRITICAL until a successful restart
            else:
                self._consecutive_failures += 1
                failed_names = [c["name"] for c in checks if not c["ok"]]
                detail = f"failed: {', '.join(failed_names)}"

                if self._consecutive_failures >= FAILURES_CRITICAL:
                    self._transition_to(State.CRITICAL)
                    self._down_since = time.monotonic()
                    self._save_to_disk()
                    # Automatic restart on third consecutive failure
                    self._do_restart()
                elif self._consecutive_failures >= FAILURES_DEGRADED:
                    if self._state != State.CRITICAL:
                        self._transition_to(State.DEGRADED)
                        self._down_since = time.monotonic()
                        self._save_to_disk()
                # else: stay in current state, apply backoff

                # Apply exponential backoff (capped)
                new_backoff = min(
                    self._backoff_s * BACKOFF_FACTOR,
                    BACKOFF_MAX_S,
                )
                self._backoff_s = new_backoff

    def _transition_to(self, new_state: State) -> None:
        """Update state and log the transition."""
        old = self._state
        self._state = new_state
        # Thread-safe enough for logging purposes
        sys.stderr.write(
            f"[Guardian] state transition: {old.name} → {new_state.name}\n"
        )

    def _do_restart(self) -> None:
        """Perform the automatic restart sequence."""
        self._restart_count += 1
        self._save_to_disk()

        # Notify peers
        try:
            import irclib  # type: ignore
            irclib.irc_send("all", "Guardian restarting after CRITICAL state")
        except Exception:
            pass

        # Fork a child to exec the replacement; parent blocks until child is up
        pid = os.fork()
        if pid == 0:
            # Child — re-exec this module as a fresh guardian
            os.execvpe(
                sys.executable,
                [sys.executable, __file__, "--daemon"],
                os.environ,
            )
            sys.exit(1)
        else:
            # Parent — wait briefly then verify child is live
            time.sleep(2.0)
            try:
                os.kill(pid, 0)
                self._transition_to(State.HEALTHY)
                self._consecutive_failures = 0
                self._backoff_s = BACKOFF_INITIAL_S
                self._start_time = time.monotonic()
                self._down_since = None
            except OSError:
                self._transition_to(State.CRITICAL)

    # ------------------------------------------------------------------
    # Persistence
    # ------------------------------------------------------------------

    def _reload_from_disk(self) -> None:
        """Load persistent counters from guardian-state.json."""
        data = load_json(STATE_FILE)
        self._restart_count = data.get("restart_count", 0)
        self._cumulative_downtime_s = data.get("cumulative_downtime_s", 0.0)

    def _save_to_disk(self) -> None:
        """Write restart_count and cumulative_downtime_s to disk."""
        # Track downtime if we are in a degraded/bad state
        if self._down_since is not None and self._start_time is not None:
            down_s = time.monotonic() - self._down_since
            self._cumulative_downtime_s += down_s
            self._down_since = None

        save_json(
            STATE_FILE,
            {
                "restart_count": self._restart_count,
                "cumulative_downtime_s": round(self._cumulative_downtime_s, 2),
            },
        )

    # ------------------------------------------------------------------
    # PID file
    # ------------------------------------------------------------------

    def _write_pid(self) -> None:
        MA.mkdir(parents=True, exist_ok=True)
        PID_FILE.write_text(str(os.getpid()))

    def _cleanup_pid(self) -> None:
        try:
            PID_FILE.unlink(missing_ok=True)
        except OSError:
            pass

    # ------------------------------------------------------------------
    # Signal handling
    # ------------------------------------------------------------------

    def _install_signal_handlers(self) -> None:
        """Install SIGTERM, SIGINT, SIGHUP handlers."""

        def sigterm_handler(sig: int, frame: Any) -> None:
            sys.stderr.write("[Guardian] SIGTERM received — graceful shutdown\n")
            self.stop()

        def sigint_handler(sig: int, frame: Any) -> None:
            sys.stderr.write("[Guardian] SIGINT received — graceful shutdown\n")
            self.stop()

        def sighup_handler(sig: int, frame: Any) -> None:
            sys.stderr.write("[Guardian] SIGHUP received — reloading state\n")
            self._reload_from_disk()

        self._orig_sigterm = signal.signal(signal.SIGTERM, sigterm_handler)
        self._orig_sigint = signal.signal(signal.SIGINT, sigint_handler)
        self._orig_sighup = signal.signal(signal.SIGHUP, sighup_handler)

    def _remove_signal_handlers(self) -> None:
        """Restore original signal handlers."""
        if self._orig_sigterm is not None:
            signal.signal(signal.SIGTERM, self._orig_sigterm)
            self._orig_sigterm = None
        if self._orig_sigint is not None:
            signal.signal(signal.SIGINT, self._orig_sigint)
            self._orig_sigint = None
        if self._orig_sighup is not None:
            signal.signal(signal.SIGHUP, self._orig_sighup)
            self._orig_sighup = None


# ---------------------------------------------------------------------------
# irclib shim (lazy import helper — avoids top-level hard dependency)
# ---------------------------------------------------------------------------

def _irc_send(to: str, message: str) -> None:
    """Send a message via the IRC tool if available."""
    try:
        from irclib import irc_send as _irc_send_impl
        _irc_send_impl(to, message)
    except Exception:
        pass


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

USAGE = """
Guardian CLI — multi-agent process supervisor

Usage:
  python guardian.py start [--health-interval N]
  python guardian.py stop
  python guardian.py status
  python guardian.py restart [--health-interval N]
  python guardian.py health
  python guardian.py daemon

Commands:
  start     Start the guardian monitoring loop (blocking).
  stop      Stop a running guardian.
  status    Print current status JSON and exit.
  restart   Stop then start again.
  health    Run one health check and print result JSON.
  daemon    Run as a background daemon (forked).
  self-test Run built-in health checks without daemon mode.
""".strip()


def _cli() -> None:
    """Command-line entry-point."""
    args = sys.argv[1:]

    if not args or args[0] in ("-h", "--help"):
        sys.stderr.write(USAGE + "\n")
        sys.exit(0)

    cmd = args[0]

    # Parse --health-interval
    health_interval = DEFAULT_HEALTH_INTERVAL
    if "--health-interval" in args:
        idx = args.index("--health-interval")
        try:
            health_interval = float(args[idx + 1])
        except (IndexError, ValueError):
            sys.stderr.write("--health-interval requires a numeric argument\n")
            sys.exit(1)

    if cmd == "start":
        guardian = Guardian(health_interval=health_interval)
        guardian.start()
        sys.stderr.write("[Guardian] started\n")
        # Block forever (signal handlers handle shutdown)
        while True:
            time.sleep(3600)

    elif cmd == "stop":
        guardian = Guardian()
        guardian.stop()
        sys.stderr.write("[Guardian] stopped\n")

    elif cmd == "status":
        guardian = Guardian()
        status = guardian.status()
        print(json.dumps(status, indent=2))

    elif cmd == "restart":
        guardian = Guardian(health_interval=health_interval)
        guardian.restart()
        sys.stderr.write("[Guardian] restarted\n")

    elif cmd == "health":
        guardian = Guardian()
        result = guardian.health_check()
        print(json.dumps(result, indent=2))

    elif cmd == "daemon":
        pid = os.fork()
        if pid == 0:
            # Child — become daemon
            os.chdir("/")
            os.setsid()
            os.umask(0o077)
            # Close stdio
            for fd in (sys.stdin, sys.stdout, sys.stderr):
                try:
                    fd.close()
                except Exception:
                    pass
            # Re-open stderr to /dev/null
            null_fd = os.open("/dev/null", os.O_RDWR)
            os.dup2(null_fd, 0)
            os.dup2(null_fd, 1)
            os.dup2(null_fd, 2)
            os.close(null_fd)

            guardian = Guardian(health_interval=health_interval)
            guardian.start()
            while True:
                time.sleep(3600)
        else:
            sys.stderr.write(f"[Guardian] daemon started with PID {pid}\n")

    elif cmd == "self-test":
        # Smoke-test all health checks in-process
        guardian = Guardian()
        result = guardian.health_check()
        print(json.dumps(result, indent=2))
        sys.exit(0 if result["healthy"] else 1)

    else:
        sys.stderr.write(f"Unknown command: {cmd}\n{USAGE}\n")
        sys.exit(1)


# ---------------------------------------------------------------------------
# Module self-test (run directly)
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    _cli()
