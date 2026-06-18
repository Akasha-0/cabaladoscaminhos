#!/usr/bin/env python3
"""
AdaptivePacer — quality-driven pacing state machine for autonomous agent loops.

State transitions
----------------
  FAST   : quality_ema > 95 AND failure_rate < 0.05
  NORMAL : 85 < quality_ema <= 95
  SLOW   : 70 < quality_ema <= 85
  PAUSE  : quality_ema <= 70 OR failure_rate > 0.20

Pacing multipliers (applied to base iteration interval)
  FAST   : 1.5   — accelerate when healthy
  NORMAL : 1.0   — baseline
  SLOW   : 0.5   — throttle
  PAUSE  : 0.0   — halt new iterations

Minimum delays (seconds)
  FAST   :  5
  NORMAL : 15
  SLOW   : 60
  PAUSE  : 300

Quality is tracked via an exponential moving average (EMA) with alpha=0.1.
Failure rate is a simple rolling window ratio over the last N outcomes.

All mutable state is persisted to MA / pacer-state.json so the pacer
survives process restarts.
"""

from __future__ import annotations

import json
import os
import sys
import traceback
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Literal

# ── Path constants ──────────────────────────────────────────────────────────────

ROOT = Path("/home/skynet/cabala-dos-caminhos")
MA = ROOT / ".autonomous" / "multi-agent"
PACER_STATE_FILE = MA / "pacer-state.json"

os.makedirs(MA, exist_ok=True)

# ── Quality EMA constants ──────────────────────────────────────────────────────

EMA_ALPHA: float = 0.1          # smoothing factor for quality EMA
INITIAL_QUALITY_EMA: float = 85.0  # start in NORMAL band

# ── Failure tracking ───────────────────────────────────────────────────────────

FAILURE_WINDOW_SIZE: int = 20   # number of recent outcomes to consider

# ── State band thresholds ──────────────────────────────────────────────────────

THRESHOLD_FAST_QUALITY: float = 95.0
THRESHOLD_NORMAL_UPPER: float = 95.0
THRESHOLD_NORMAL_LOWER: float = 85.0
THRESHOLD_SLOW_UPPER: float = 85.0
THRESHOLD_SLOW_LOWER: float = 70.0
THRESHOLD_PAUSE_QUALITY: float = 70.0
THRESHOLD_PAUSE_FAILURE: float = 0.20
THRESHOLD_FAST_FAILURE: float = 0.05

# ── Pacing multipliers per state ───────────────────────────────────────────────

MULTIPLIER_FAST: float = 1.5
MULTIPLIER_NORMAL: float = 1.0
MULTIPLIER_SLOW: float = 0.5
MULTIPLIER_PAUSE: float = 0.0

# ── Minimum delay seconds per state ───────────────────────────────────────────

MIN_DELAY_FAST: float = 5.0
MIN_DELAY_NORMAL: float = 15.0
MIN_DELAY_SLOW: float = 60.0
MIN_DELAY_PAUSE: float = 300.0

# ── Valid state names ──────────────────────────────────────────────────────────

VALID_STATES: list[str] = ["FAST", "NORMAL", "SLOW", "PAUSE"]

# ── State transition reasons ───────────────────────────────────────────────────

REASON_QUALITY_IMPROVED: str = "quality_ema crossed upper threshold"
REASON_QUALITY_DECLINED: str = "quality_ema crossed lower threshold"
REASON_FAILURE_HIGH: str = "failure_rate exceeded pause threshold"
REASON_FAILURE_LOW: str = "failure_rate dropped below fast threshold"
REASON_FORCED: str = "forced by call to force_state()"
REASON_INIT: str = "initial state on first run"

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────


def load_json(path: Path, default=None) -> dict | list:
    """Load JSON from *path*, returning *default* if the file is missing or corrupt."""
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            return default if default is not None else {}
    return default if default is not None else {}


def save_json(path: Path, data: dict | list) -> None:
    """Atomically write *data* as JSON to *path* (write then rename for atomicity)."""
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    tmp.rename(path)


def log(msg: str, file=None) -> None:
    """
    Print *msg* to *file* (default stdout) with an ISO timestamp prefix.

    Example
        log("pacer initialized")   →  2026-06-18T12:00:00.000Z  pacer initialized
    """
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
    line = f"{ts}  {msg}"
    print(line, file=file or sys.stdout)


def _multiplier_for_state(state: str) -> float:
    return {
        "FAST":   MULTIPLIER_FAST,
        "NORMAL": MULTIPLIER_NORMAL,
        "SLOW":   MULTIPLIER_SLOW,
        "PAUSE":  MULTIPLIER_PAUSE,
    }.get(state, MULTIPLIER_NORMAL)


def _min_delay_for_state(state: str) -> float:
    return {
        "FAST":   MIN_DELAY_FAST,
        "NORMAL": MIN_DELAY_NORMAL,
        "SLOW":   MIN_DELAY_SLOW,
        "PAUSE":  MIN_DELAY_PAUSE,
    }.get(state, MIN_DELAY_NORMAL)


def _derive_state(quality_ema: float, failure_rate: float) -> str:
    """
    Determine the state that matches the given quality and failure metrics.

    PAUSE takes precedence over all other states so that a high failure rate
    triggers an immediate halt regardless of quality.
    """
    if quality_ema <= THRESHOLD_PAUSE_QUALITY or failure_rate > THRESHOLD_PAUSE_FAILURE:
        return "PAUSE"
    if quality_ema > THRESHOLD_FAST_QUALITY and failure_rate < THRESHOLD_FAST_FAILURE:
        return "FAST"
    if THRESHOLD_NORMAL_LOWER < quality_ema <= THRESHOLD_NORMAL_UPPER:
        return "NORMAL"
    # Covers the SLOW band: THRESHOLD_SLOW_LOWER < quality_ema <= THRESHOLD_SLOW_UPPER
    return "SLOW"


# ─────────────────────────────────────────────────────────────────────────────
# AdaptivePacer
# ─────────────────────────────────────────────────────────────────────────────


class AdaptivePacer:
    """
    Quality-driven pacing state machine.

    Tracks the health of an autonomous loop via an EMA of quality scores and
    a rolling failure rate, then recommends whether to proceed and at what
    speed.  All state is persisted to *PACER_STATE_FILE*.

    Parameters
    ----------
    state_file : Path, optional
        Path to the JSON state file.  Defaults to ``PACER_STATE_FILE``.
        Pass a custom path when testing with an in-memory or temp file.

    Attributes
    ----------
    state : str
        One of ``FAST``, ``NORMAL``, ``SLOW``, ``PAUSE``.
    quality_ema : float
        Exponential moving average of quality scores (0-100).
    failure_rate : float
        Rolling ratio of failed outcomes over the last
        ``FAILURE_WINDOW_SIZE`` records (0.0-1.0).
    outcome_count : int
        Total number of ``record_outcome`` calls ever made.
    forced : bool
        True when the current state was set via ``force_state()``.
    force_reason : str
        Human-readable reason passed to the last ``force_state()`` call.
    transition_log : list[dict]
        Append-only list of every state transition with timestamp and reason.

    Example
    -------
    >>> pacer = AdaptivePacer()
    >>> pacer.get_pace()
    {'state': 'NORMAL', 'multiplier': 1.0, 'quality_ema': 85.0,
     'failure_rate': 0.0, 'min_delay_seconds': 15.0}
    >>> pacer.record_outcome(success=True)
    >>> pacer.should_proceed(current_quality=88.0)
    True
    """

    # ── Initial state (used when state file is absent) ─────────────────────────

    _INITIAL_STATE: dict[str, Any] = {
        "state":            "NORMAL",
        "quality_ema":      INITIAL_QUALITY_EMA,
        "failure_rate":     0.0,
        "outcome_count":    0,
        "outcome_history":  [],          # list[bool] — rolling window
        "forced":           False,
        "force_reason":     "",
        "transition_log":   [
            {
                "ts":      datetime.now(timezone.utc).isoformat(),
                "from":    "",
                "to":      "NORMAL",
                "reason":  REASON_INIT,
                "quality": INITIAL_QUALITY_EMA,
                "failure": 0.0,
            }
        ],
    }

    # ── Construction ───────────────────────────────────────────────────────────

    def __init__(
        self,
        state_file: Path | None = None,
    ) -> None:
        self._sf: Path = state_file if state_file is not None else PACER_STATE_FILE
        self._load_or_init()

    # ── Public API ─────────────────────────────────────────────────────────────

    def get_pace(self) -> dict[str, Any]:
        """
        Return the current pacing parameters.

        Returns
        -------
        dict with keys
          ``state``             — current state name (``FAST``, ``NORMAL``, …)
          ``multiplier``        — pacing multiplier (0.0 – 1.5)
          ``quality_ema``      — EMA of quality scores (0-100)
          ``failure_rate``     — rolling failure ratio (0.0-1.0)
          ``min_delay_seconds`` — minimum seconds to wait in this state
        """
        return {
            "state":             self.state,
            "multiplier":        _multiplier_for_state(self.state),
            "quality_ema":       round(self.quality_ema, 4),
            "failure_rate":      round(self.failure_rate, 4),
            "min_delay_seconds": _min_delay_for_state(self.state),
        }

    def should_proceed(self, current_quality: float | None = None) -> bool:
        """
        Decide whether the loop should start a new iteration.

        Parameters
        ----------
        current_quality : float, optional
            If supplied, the EMA is updated with this value before the
            decision is made (mirroring the pattern used by
            ``record_outcome``).  If omitted the existing EMA is used.

        Returns
        -------
        bool
            ``True`` for ``FAST``, ``NORMAL``, ``SLOW``; ``False`` for ``PAUSE``.
        """
        if current_quality is not None:
            self._update_ema(current_quality)
            if not self.forced:
                new_state = _derive_state(self.quality_ema, self.failure_rate)
                if new_state != self.state:
                    self._transition_to(new_state, reason=self._transition_reason(new_state))
                    self._persist()
        return self.state != "PAUSE"

    def record_outcome(self, success: bool) -> None:
        """
        Record a single iteration outcome and update internal metrics.

        Parameters
        ----------
        success : bool
            ``True`` if the iteration succeeded, ``False`` if it failed.
        """
        self.outcome_count += 1

        # Maintain rolling history window
        self.outcome_history.append(success)
        if len(self.outcome_history) > FAILURE_WINDOW_SIZE:
            self.outcome_history.pop(0)

        # Recompute rolling failure rate
        if self.outcome_history:
            self.failure_rate = sum(not s for s in self.outcome_history) / len(
                self.outcome_history
            )
        else:
            self.failure_rate = 0.0

        # Determine the new state (only if not forced)
        if not self.forced:
            new_state = _derive_state(self.quality_ema, self.failure_rate)
            if new_state != self.state:
                self._transition_to(new_state, reason=self._transition_reason(new_state))

        self._persist()

    def force_state(self, state: str, reason: str = "") -> None:
        """
        Override the current state regardless of metrics.

        Parameters
        ----------
        state : str
            Target state — must be one of ``FAST``, ``NORMAL``, ``SLOW``, ``PAUSE``.
        reason : str
            Human-readable justification stored in the transition log.

        Raises
        ------
        ValueError
            If *state* is not a known state name.
        """
        if state not in VALID_STATES:
            raise ValueError(
                f"Unknown state {state!r}. Valid states: {VALID_STATES}"
            )
        if not reason:
            reason = REASON_FORCED
        self._transition_to(state, reason=reason, forced=True)
        self._persist()

    def get_recommended_action(self) -> dict[str, str]:
        """
        Return a human-readable action and reason for the current state.

        Returns
        -------
        dict with keys
          ``action`` — one of ``continue``, ``throttle``, ``halt``, ``accelerate``
          ``reason`` — concise explanation of why this action is recommended
        """
        table: dict[str, tuple[str, str]] = {
            "FAST":   (
                "accelerate",
                f"quality_ema={self.quality_ema:.1f} > {THRESHOLD_FAST_QUALITY} "
                f"and failure_rate={self.failure_rate:.1%} < {THRESHOLD_FAST_FAILURE:.1%}",
            ),
            "NORMAL": (
                "continue",
                f"quality_ema={self.quality_ema:.1f} within normal band "
                f"({THRESHOLD_NORMAL_LOWER}-{THRESHOLD_NORMAL_UPPER})",
            ),
            "SLOW":   (
                "throttle",
                f"quality_ema={self.quality_ema:.1f} in slow band "
                f"({THRESHOLD_SLOW_LOWER}-{THRESHOLD_SLOW_UPPER})",
            ),
            "PAUSE":  (
                "halt",
                f"quality_ema={self.quality_ema:.1f} <= {THRESHOLD_PAUSE_QUALITY} "
                f"or failure_rate={self.failure_rate:.1%} > {THRESHOLD_PAUSE_FAILURE:.1%}",
            ),
        }
        action, reason = table.get(
            self.state, ("continue", "unknown state")
        )
        return {"action": action, "reason": reason}

    # ── Diagnostics & utility ───────────────────────────────────────────────────

    def summary(self) -> dict[str, Any]:
        """
        Return a full diagnostic snapshot of the pacer.

        Includes current pacing values, counters, history length,
        forced flag, and the last few transition log entries.
        """
        return {
            "state":               self.state,
            **self.get_pace(),
            "outcome_count":       self.outcome_count,
            "outcome_history_len": len(self.outcome_history),
            "forced":              self.forced,
            "force_reason":        self.force_reason,
            "recent_transitions":  self.transition_log[-5:],
        }

    def reset(self) -> None:
        """
        Wipe all accumulated history and return to the initial NORMAL state.

        The state file is updated immediately.
        """
        init = self._INITIAL_STATE.copy()
        self.__dict__.update(
            state           = init["state"],
            quality_ema     = init["quality_ema"],
            failure_rate    = init["failure_rate"],
            outcome_count   = init["outcome_count"],
            outcome_history = init["outcome_history"],
            forced          = init["forced"],
            force_reason    = init["force_reason"],
            transition_log  = init["transition_log"],
        )
        self._persist()
        log(f"[AdaptivePacer] reset to NORMAL")

    def state_dict(self) -> dict[str, Any]:
        """
        Return a serialisable dict representation of the current state.
        Useful for serialising to a parent manager or serialising to JSON.
        """
        return {
            "state":           self.state,
            "quality_ema":     self.quality_ema,
            "failure_rate":    self.failure_rate,
            "outcome_count":   self.outcome_count,
            "outcome_history": self.outcome_history,
            "forced":          self.forced,
            "force_reason":    self.force_reason,
            "transition_log":  self.transition_log,
        }

    def load_state_dict(self, d: dict[str, Any]) -> None:
        """
        Restore pacer state from a dict (the inverse of ``state_dict``).

        This is useful when the caller manages state externally and wants to
        hand a snapshot back to the pacer (e.g. after a fork).
        """
        self.state           = d.get("state",           "NORMAL")
        self.quality_ema     = d.get("quality_ema",      INITIAL_QUALITY_EMA)
        self.failure_rate    = d.get("failure_rate",    0.0)
        self.outcome_count   = d.get("outcome_count",   0)
        self.outcome_history = d.get("outcome_history", [])
        self.forced          = d.get("forced",          False)
        self.force_reason    = d.get("force_reason",    "")
        self.transition_log  = d.get("transition_log",  [])
        self._persist()

    def validate(self) -> list[str]:
        """
        Run self-checks on the current state.

        Returns
        -------
        list of human-readable problem descriptions (empty = all OK).
        """
        problems: list[str] = []

        if self.state not in VALID_STATES:
            problems.append(f"state {self.state!r} not in {VALID_STATES}")

        if not (0.0 <= self.quality_ema <= 100.0):
            problems.append(
                f"quality_ema {self.quality_ema} outside valid range [0, 100]"
            )

        if not (0.0 <= self.failure_rate <= 1.0):
            problems.append(
                f"failure_rate {self.failure_rate} outside valid range [0, 1]"
            )

        if self.outcome_count < 0:
            problems.append(f"outcome_count {self.outcome_count} is negative")

        if len(self.outcome_history) > FAILURE_WINDOW_SIZE:
            problems.append(
                "outcome_history exceeds FAILURE_WINDOW_SIZE "
                f"({len(self.outcome_history)} > {FAILURE_WINDOW_SIZE})"
            )

        if not isinstance(self.forced, bool):
            problems.append(f"forced flag is not bool: {type(self.forced)}")

        # Verify transition log is internally consistent
        for i, entry in enumerate(self.transition_log):
            if not isinstance(entry, dict):
                problems.append(f"transition_log[{i}] is not a dict")
                continue
            for key in ("ts", "from", "to", "reason"):
                if key not in entry:
                    problems.append(
                        f"transition_log[{i}] missing key {key!r}"
                    )

        return problems

    # ── Internal helpers ───────────────────────────────────────────────────────

    def _load_or_init(self) -> None:
        """
        Load persisted state from ``self._sf``, or initialise to defaults.

        Gracefully handles: file absent, corrupt JSON, missing keys, and
        type mismatches — falling back to initial values rather than crashing.
        """
        raw = load_json(self._sf, default=None)

        if raw is None:
            log(f"[AdaptivePacer] state file {self._sf} not found — initialising fresh")
            init = self._INITIAL_STATE.copy()
            self.state           = init["state"]
            self.quality_ema     = init["quality_ema"]
            self.failure_rate    = init["failure_rate"]
            self.outcome_count   = init["outcome_count"]
            self.outcome_history = init["outcome_history"]
            self.forced          = init["forced"]
            self.force_reason    = init["force_reason"]
            self.transition_log  = init["transition_log"]
            self._persist()
            return

        def _get(LK, default):
            try:
                v = raw.get(LK)
                if v is None:
                    return default
                return default if (default is not None and not isinstance(v, type(default))) else v
            except Exception:
                return default

        self.state           = _get("state",           "NORMAL")
        self.quality_ema     = _get("quality_ema",     INITIAL_QUALITY_EMA)
        self.failure_rate    = _get("failure_rate",    0.0)
        self.outcome_count   = _get("outcome_count",   0)
        self.outcome_history = _get("outcome_history", [])
        self.forced          = _get("forced",          False)
        self.force_reason    = _get("force_reason",    "")
        self.transition_log  = _get("transition_log",  [])

        # Sanitise types that may have been persisted as wrong types
        self.state           = str(self.state) if self.state else "NORMAL"
        self.quality_ema     = float(self.quality_ema) if self.quality_ema is not None else INITIAL_QUALITY_EMA
        self.failure_rate    = float(self.failure_rate) if self.failure_rate is not None else 0.0
        self.outcome_count   = int(self.outcome_count) if self.outcome_count is not None else 0
        self.outcome_history = list(self.outcome_history) if self.outcome_history is not None else []
        self.forced          = bool(self.forced)
        self.force_reason    = str(self.force_reason) if self.force_reason is not None else ""
        self.transition_log  = list(self.transition_log) if self.transition_log is not None else []

        # Validate outcome_history elements are bools
        cleaned: list[bool] = []
        for item in self.outcome_history:
            if isinstance(item, bool):
                cleaned.append(item)
            elif isinstance(item, (int, float)) and item in (0, 1, 0.0, 1.0):
                cleaned.append(bool(item))
        self.outcome_history = cleaned

        log(
            f"[AdaptivePacer] loaded state from {self._sf}  "
            f"state={self.state}  quality_ema={self.quality_ema:.2f}  "
            f"failure_rate={self.failure_rate:.2%}"
        )

    def _persist(self) -> None:
        """Serialise the current state dict to ``self._sf``."""
        try:
            save_json(self._sf, self.state_dict())
        except Exception as exc:
            log(f"[AdaptivePacer] WARNING — failed to persist state: {exc}")

    def _update_ema(self, quality: float) -> None:
        """
        Apply the EMA update rule.

        EMA_{new} = alpha * quality + (1 - alpha) * EMA_{old}
        """
        self.quality_ema = EMA_ALPHA * quality + (1.0 - EMA_ALPHA) * self.quality_ema

    def _transition_reason(self, new_state: str) -> str:
        """
        Generate a human-readable reason for the transition into *new_state*.
        """
        if new_state == "FAST":
            return REASON_QUALITY_IMPROVED
        if new_state == "PAUSE":
            if self.failure_rate > THRESHOLD_PAUSE_FAILURE:
                return REASON_FAILURE_HIGH
            return REASON_QUALITY_DECLINED
        if new_state == "SLOW":
            return REASON_QUALITY_DECLINED
        # NORMAL
        return REASON_QUALITY_IMPROVED if self.state == "SLOW" else REASON_QUALITY_DECLINED

    def _transition_to(
        self,
        new_state: str,
        reason: str,
        forced: bool = False,
    ) -> None:
        """
        Execute a state transition, appending a log entry.
        """
        old_state = self.state
        self.state      = new_state
        self.forced     = forced
        self.force_reason = reason if forced else ""

        entry: dict[str, Any] = {
            "ts":      datetime.now(timezone.utc).isoformat(),
            "from":    old_state,
            "to":      new_state,
            "reason":  reason,
            "quality": round(self.quality_ema, 4),
            "failure": round(self.failure_rate, 4),
        }
        self.transition_log.append(entry)

        # Keep the log bounded to the last 200 entries to prevent unbounded growth
        if len(self.transition_log) > 200:
            self.transition_log = self.transition_log[-200:]

        log(
            f"[AdaptivePacer] transition  {old_state} → {new_state}  "
            f"reason={reason}  quality_ema={self.quality_ema:.2f}  "
            f"failure_rate={self.failure_rate:.2%}"
        )


# ─────────────────────────────────────────────────────────────────────────────
# Module-level convenience helpers
# ─────────────────────────────────────────────────────────────────────────────

# Singleton instance — created on first import, reused for the process lifetime.
_pacer_instance: AdaptivePacer | None = None


def get_pacer(state_file: Path | None = None) -> AdaptivePacer:
    """
    Return the global ``AdaptivePacer`` singleton, creating it on first call.

    Pass ``state_file`` only on the very first call; subsequent calls ignore
    any ``state_file`` argument and return the existing instance.
    """
    global _pacer_instance
    if _pacer_instance is None:
        _pacer_instance = AdaptivePacer(state_file=state_file)
    return _pacer_instance


# ─────────────────────────────────────────────────────────────────────────────
# CLI (useful for debugging)
# ─────────────────────────────────────────────────────────────────────────────


def _cli() -> None:
    """Simple interactive CLI for manual pacer inspection and manipulation."""
    pacer = get_pacer()

    import argparse

    parser = argparse.ArgumentParser(description="AdaptivePacer CLI")
    parser.add_argument("--pace",    action="store_true", help="print current pace")
    parser.add_argument("--action", action="store_true", help="print recommended action")
    parser.add_argument("--summary", action="store_true", help="print full summary")
    parser.add_argument("--validate", action="store_true", help="run self-checks")
    parser.add_argument("--reset",   action="store_true", help="reset to initial state")
    parser.add_argument(
        "--record", metavar="SUCCESS", type=str,
        help="record outcome: '1'/'true'/'y' for success, '0'/'false'/'n' for failure"
    )
    parser.add_argument(
        "--force", metavar="STATE", help=f"force state: {VALID_STATES}"
    )
    parser.add_argument(
        "--quality", metavar="Q", type=float,
        help="quality value to feed should_proceed()"
    )
    parser.add_argument(
        "--history-len", metavar="N", type=int, default=None,
        help="number of synthetic history entries to seed (for testing)"
    )
    args = parser.parse_args()

    if args.history_len is not None:
        n = args.history_len
        for i in range(n):
            # Alternate successes with some failures to exercise the bands
            pacer.record_outcome(success=(i % 5 != 0))

    if args.pace:
        print(json.dumps(pacer.get_pace(), indent=2))

    if args.action:
        print(json.dumps(pacer.get_recommended_action(), indent=2))

    if args.summary:
        print(json.dumps(pacer.summary(), indent=2))

    if args.validate:
        problems = pacer.validate()
        if problems:
            for p in problems:
                print(f"VALIDATION ERROR: {p}", file=sys.stderr)
            sys.exit(1)
        else:
            print("OK — no problems found")

    if args.reset:
        pacer.reset()

    if args.record is not None:
        val = args.record.lower()
        success = val in ("1", "true", "y", "yes")
        pacer.record_outcome(success=success)
        print(f"recorded: success={success}  pace={pacer.get_pace()}")

    if args.force:
        try:
            pacer.force_state(args.force, reason="CLI forced")
            print(f"forced to {pacer.state}")
        except ValueError as exc:
            print(exc, file=sys.stderr)
            sys.exit(1)

    if args.quality is not None:
        result = pacer.should_proceed(current_quality=args.quality)
        print(f"should_proceed({args.quality}) = {result}")

    # Default: print pace if no options given
    if len(sys.argv) == 1:
        print(json.dumps(pacer.get_pace(), indent=2))


if __name__ == "__main__":
    _cli()
