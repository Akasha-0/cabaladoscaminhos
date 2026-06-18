#!/usr/bin/env python3
"""
continuity_manager.py — Session continuity and warm-state persistence.

Manages atomic save/restore of agent session state across restarts.
Detects git HEAD mismatches between sessions and provides CLI subcommands.

Files written:
  MA/memory-warm.json      — warm session state (plans, progress, decisions)
  MA/state-checkpoint.json — state machine checkpoint + git HEAD at save time
"""

from __future__ import annotations

import atexit
import json
import os
import subprocess
import sys
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

# ─── Path constants ────────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent if '__file__' in globals() else Path.cwd()
MA = ROOT / ".autonomous" / "multi-agent"

MEMORY_WARM_FILE = MA / "memory-warm.json"
STATE_CHECKPOINT_FILE = MA / "state-checkpoint.json"
HEAD_TRACKING_FILE = MA / ".git-head-tracked.json"

# ─── JSON helpers ─────────────────────────────────────────────────────────────

def load_json(path: Path, default: Optional[dict] = None) -> dict:
    """Load JSON from path, returning default on any error or missing file."""
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            pass
    return default if default is not None else {}


def save_json(path: Path, data: dict) -> None:
    """Serialize data to JSON, creating parent directories as needed."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    os.replace(tmp, path)


# ─── Git helpers ──────────────────────────────────────────────────────────────

def get_git_head() -> str:
    """Return the current git HEAD commit hash (short form)."""
    try:
        cp = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            capture_output=True, text=True, timeout=10, cwd=str(ROOT),
        )
        if cp.returncode == 0:
            return cp.stdout.strip()
    except Exception:
        pass
    return ""


def get_git_status() -> dict:
    """Return git status summary: clean/dirty, branch, any uncommitted changes."""
    try:
        branch_cp = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True, text=True, timeout=10, cwd=str(ROOT),
        )
        branch = branch_cp.stdout.strip() if branch_cp.returncode == 0 else "unknown"

        diff_cp = subprocess.run(
            ["git", "diff", "--stat", "--quiet"],
            capture_output=True, text=True, timeout=10, cwd=str(ROOT),
        )
        dirty = diff_cp.returncode != 0

        stash_cp = subprocess.run(
            ["git", "stash", "list"],
            capture_output=True, text=True, timeout=10, cwd=str(ROOT),
        )
        has_stash = bool(stash_cp.stdout.strip())

        return {
            "branch": branch,
            "dirty": dirty,
            "has_stash": has_stash,
            "head": get_git_head(),
        }
    except Exception as e:
        return {"branch": "unknown", "dirty": False, "has_stash": False, "head": "", "error": str(e)}


# ─── Atomic write helper ───────────────────────────────────────────────────────

def atomic_save(path: Path, data: dict) -> None:
    """Write data to a temporary file then rename (atomic on POSIX)."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + f".{os.getpid()}.tmp")
    try:
        tmp.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
        os.replace(tmp, path)
    finally:
        if tmp.exists():
            try:
                tmp.unlink()
            except OSError:
                pass


# ─── ContinuityManager ─────────────────────────────────────────────────────────

class ContinuityManager:
    """
    Thread-safe session continuity manager.

    Persists warm state and checkpoints atomically, detects git HEAD drift,
    and can auto-save on a timer.

    Example:
        cm = ContinuityManager()
        cm.save_session({"plans": [...], "iteration": 4})
        state = cm.restore_session()   # returns warm state or {}
        cm.start_auto_save(interval_seconds=60)
        # ... work ...
        cm.stop_auto_save()
    """

    def __init__(
        self,
        memory_file: Path = MEMORY_WARM_FILE,
        checkpoint_file: Path = STATE_CHECKPOINT_FILE,
        head_tracking_file: Path = HEAD_TRACKING_FILE,
    ) -> None:
        self._memory_file = memory_file
        self._checkpoint_file = checkpoint_file
        self._head_tracking_file = head_tracking_file
        self._lock = threading.Lock()
        self._auto_save_timer: Optional[threading.Timer] = None
        self._auto_save_interval: Optional[float] = None
        self._auto_save_active = False
        self._auto_save_count = 0
        self._at_exit_registered = False

    # ── public API ─────────────────────────────────────────────────────────────

    def _save_session_inner(self, warm_state: Optional[dict]) -> dict:
        """Core logic without lock — caller must hold _lock."""
        current_head = get_git_head()
        now = datetime.now(timezone.utc).isoformat()

        checkpoint = {
            "git_head": current_head,
            "saved_at": now,
            "auto_save_count": self._auto_save_count,
            "pid": os.getpid(),
        }

        tracked = load_json(self._head_tracking_file, {})
        prev_head = tracked.get("head", "")

        if prev_head and prev_head != current_head:
            checkpoint["git_head_mismatch"] = True
            checkpoint["previous_head"] = prev_head
            checkpoint["mismatch_detected_at"] = now

        if warm_state is not None:
            existing = load_json(self._memory_file, {})
            merged = {**existing, **warm_state}
        else:
            merged = load_json(self._memory_file, {})

        tracked = {"head": current_head, "saved_at": now}
        atomic_save(self._head_tracking_file, tracked)
        atomic_save(self._memory_file, merged)
        atomic_save(self._checkpoint_file, checkpoint)

        return checkpoint

    def save_session(self, warm_state: Optional[dict] = None) -> dict:
        """
        Atomically save session state to memory-warm.json and state-checkpoint.json.

        Args:
            warm_state: Optional warm state dict. If None, loads existing warm state
                        and merges in the current checkpoint git HEAD (no overwrite).

        Returns:
            The checkpoint dict written (includes git HEAD + timestamp).
        """
        with self._lock:
            return self._save_session_inner(warm_state)

    def restore_session(self) -> dict:
        """
        Restore the warm session state.

        Returns:
            The warm state dict, or empty dict if no session was saved.
        """
        with self._lock:
            return load_json(self._memory_file, {})

    def get_last_checkpoint(self) -> dict:
        """Return the last checkpoint metadata without modifying any files."""
        with self._lock:
            return load_json(self._checkpoint_file, {})

    def get_saved_git_head(self) -> str:
        """Return the git HEAD that was active when the last save ran."""
        tracked = load_json(self._head_tracking_file, {})
        return tracked.get("head", "")

    def check_git_mismatch(self) -> dict:
        """
        Check whether the current git HEAD differs from the last saved HEAD.

        Returns:
            Dict with keys: mismatch (bool), current_head, saved_head, saved_at.
        """
        saved_head = self.get_saved_git_head()
        current_head = get_git_head()
        tracked = load_json(self._head_tracking_file, {})
        saved_at = tracked.get("saved_at", "")

        return {
            "mismatch": bool(saved_head and saved_head != current_head),
            "current_head": current_head,
            "saved_head": saved_head,
            "saved_at": saved_at,
        }

    def start_auto_save(self, interval_seconds: float) -> None:
        """
        Start automatic periodic saving.

        The first tick fires after `interval_seconds`. Each subsequent tick
        re-saves the current warm state (acquired at tick time).

        Args:
            interval_seconds: Seconds between saves. Must be > 0.
        """
        if interval_seconds <= 0:
            raise ValueError("interval_seconds must be positive")

        with self._lock:
            self.stop_auto_save(lock_held=True)
            self._auto_save_interval = float(interval_seconds)
            self._schedule_next_auto_save()

    def stop_auto_save(self, lock_held: bool = False) -> None:
        """
        Stop the auto-save timer if running.

        Args:
            lock_held: Pass True if the caller already holds self._lock.
        """
        if not lock_held:
            self._lock.acquire()
            try:
                self._stop_inner()
            finally:
                self._lock.release()
        else:
            self._stop_inner()

    def _stop_inner(self) -> None:
        if self._auto_save_timer is not None:
            self._auto_save_timer.cancel()
            self._auto_save_timer = None
        self._auto_save_active = False

    def _schedule_next_auto_save(self) -> None:
        """Schedule the next auto-save tick (must hold self._lock)."""
        self._auto_save_active = True
        interval = self._auto_save_interval
        if interval is None:
            return
        self._auto_save_timer = threading.Timer(interval, self._auto_save_tick)
        self._auto_save_timer.daemon = True
        self._auto_save_timer.start()

    def _auto_save_tick(self) -> None:
        """Called on a timer tick; re-saves then schedules the next tick."""
        with self._lock:
            if not self._auto_save_active:
                return
            self._auto_save_count += 1
            current_warm = load_json(self._memory_file, {})
            self._save_session_inner(current_warm)  # holds lock already

        # Schedule next tick (outside lock to avoid blocking)
        with self._lock:
            self._schedule_next_auto_save()

    def has_auto_save(self) -> bool:
        """Return True if auto-save is currently running."""
        with self._lock:
            return self._auto_save_active

    def is_auto_save_running(self) -> bool:
        """Alias for has_auto_save (for readability)."""
        return self.has_auto_save()

    def get_auto_save_interval(self) -> Optional[float]:
        """Return the configured auto-save interval, or None if not running."""
        with self._lock:
            return self._auto_save_interval

    def get_auto_save_count(self) -> int:
        """Return how many auto-saves have fired since start."""
        with self._lock:
            return self._auto_save_count

    def clear_session(self) -> None:
        """
        Wipe warm state and checkpoint files.
        Does NOT touch the git HEAD tracking file.
        """
        with self._lock:
            for path in (self._memory_file, self._checkpoint_file):
                if path.exists():
                    try:
                        path.unlink()
                    except OSError:
                        pass

    def get_git_status(self) -> dict:
        """Return current git status (branch, dirty, head)."""
        return get_git_status()

    # ── CLI subcommands ────────────────────────────────────────────────────────

    def cli(self, argv: Optional[list[str]] = None) -> int:
        """
        CLI entry point. Supports subcommands:

          restore        — print warm state as JSON to stdout
          checkpoint     — print last checkpoint info
          first-session  — return exit code 0 if no prior session exists, else 1
          mismatch       — check git HEAD mismatch and exit 1 if mismatched

        Args:
            argv: Command-line args (defaults to sys.argv[1:])

        Returns:
            Exit code (0 = success, 1 = not-found/mismatch/error)
        """
        if argv is None:
            argv = sys.argv[1:]

        if not argv or argv[0] in ("-h", "--help"):
            print(self._cli_help())
            return 0

        cmd = argv[0]
        handlers = {
            "restore": self._cmd_restore,
            "checkpoint": self._cmd_checkpoint,
            "first-session": self._cmd_first_session,
            "mismatch": self._cmd_mismatch,
            "status": self._cmd_status,
            "clear": self._cmd_clear,
        }

        if cmd not in handlers:
            print(f"Unknown subcommand: {cmd}", file=sys.stderr)
            print(self._cli_help(), file=sys.stderr)
            return 1

        try:
            return handlers[cmd](argv[1:])
        except Exception as e:
            print(f"Error in {cmd}: {e}", file=sys.stderr)
            return 1

    def _cmd_restore(self, _args: list[str]) -> int:
        """Print warm state JSON to stdout."""
        state = self.restore_session()
        print(json.dumps(state, indent=2, ensure_ascii=False))
        return 0

    def _cmd_checkpoint(self, _args: list[str]) -> int:
        """Print last checkpoint to stdout."""
        cp = self.get_last_checkpoint()
        print(json.dumps(cp, indent=2, ensure_ascii=False))
        return 0

    def _cmd_first_session(self, _args: list[str]) -> int:
        """Exit 0 if no prior session (no memory-warm.json), else exit 1."""
        if self._memory_file.exists() or self._checkpoint_file.exists():
            return 1
        return 0

    def _cmd_mismatch(self, _args: list[str]) -> int:
        """Exit 0 if no mismatch, exit 1 and print details if mismatch found."""
        result = self.check_git_mismatch()
        if result["mismatch"]:
            print(json.dumps(result, indent=2, ensure_ascii=False), file=sys.stderr)
            return 1
        return 0

    def _cmd_status(self, _args: list[str]) -> int:
        """Print combined status: git, checkpoint, auto-save state."""
        git = get_git_status()
        cp = self.get_last_checkpoint()
        warm = self.restore_session()
        status = {
            "git": git,
            "checkpoint": cp,
            "warm_state_keys": list(warm.keys()),
            "auto_save": {
                "active": self.has_auto_save(),
                "interval": self.get_auto_save_interval(),
                "count": self.get_auto_save_count(),
            },
        }
        print(json.dumps(status, indent=2, ensure_ascii=False))
        return 0

    def _cmd_clear(self, _args: list[str]) -> int:
        """Clear session files and exit 0."""
        self.clear_session()
        print("Session cleared.")
        return 0

    @staticmethod
    def _cli_help() -> str:
        return """\
continuity_manager.py — Session continuity CLI

Usage: continuity_manager.py <subcommand> [args]

Subcommands:
  restore          Print warm session state as JSON.
  checkpoint       Print last checkpoint metadata.
  first-session    Exit 0 if no prior session saved, else exit 1.
  mismatch         Check git HEAD mismatch; exit 1 if mismatched.
  status           Print combined git, checkpoint, and auto-save status.
  clear            Wipe warm state and checkpoint files.

Python API:
  from continuity_manager import ContinuityManager
  cm = ContinuityManager()
  cm.save_session({"key": "value"})
  state = cm.restore_session()
  cm.start_auto_save(60)
  cm.stop_auto_save()
  cm.has_auto_save()   # bool
"""


# ─── Singleton instance ───────────────────────────────────────────────────────

_default_cm: Optional[ContinuityManager] = None


def _get_default_cm() -> ContinuityManager:
    global _default_cm
    if _default_cm is None:
        _default_cm = ContinuityManager()
    return _default_cm


# ─── main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    sys.exit(_get_default_cm().cli())
