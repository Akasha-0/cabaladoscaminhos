"""
_compression_cb.py — Compression circuit breaker + retry with exponential backoff.

State file: .omp/compression-circuit-breaker.json

Circuit breaker states:
  CLOSED      → normal operation, compression attempts allowed
  TRIPPED     → compression disabled, cooling down
  HALF_OPEN   → trial attempt after cooldown, success → CLOSED, failure → TRIPPED

Error handling:
  - 400 context window: treated as expected failure, no circuit increment
  - 500/999 MiniMax internal errors: circuit increment, triggers breaker
  - timeout/subprocess errors: circuit increment, triggers breaker
  - 429 rate limit: circuit increment, triggers breaker
"""

from __future__ import annotations

import json
import os
import subprocess
import tempfile
import time
import hashlib
from pathlib import Path
from typing import Tuple

ROOT = Path(__file__).resolve().parent.parent if '__file__' in globals() else Path.cwd()
# ── Constants ────────────────────────────────────────────────────────────────

MAX_RETRIES    = 3          # consecutive failures before breaker trips
COOLDOWN_SECS  = 600       # 10 minutes before HALF_OPEN
BASE_DELAY_SECS = [2, 5, 15]  # exponential backoff per retry slot

STATE_FILE = Path(__file__).resolve().parent.parent / ".omp" / "compression-circuit-breaker.json"

# ── State machine ──────────────────────────────────────────────────────────

class CircuitBreaker:
    def __init__(self, state_file: Path | str = STATE_FILE):
        self.state_file: Path = Path(state_file)
        self._load()

    def _load(self) -> None:
        if self.state_file.exists():
            try:
                data = json.loads(self.state_file.read_text())
                self.failures    : int   = data.get("failures", 0)
                self.state       : str   = data.get("state", "CLOSED")
                self.tripped_at  : float | None = data.get("tripped_at")
                self.last_error  : str   = data.get("last_error", "")
            except (json.JSONDecodeError, KeyError):
                self._init_fresh()
        else:
            self._init_fresh()

    def _init_fresh(self) -> None:
        self.failures   = 0
        self.state     = "CLOSED"
        self.tripped_at = None
        self.last_error = ""

    def _save(self) -> None:
        data = {
            "failures":   self.failures,
            "state":      self.state,
            "tripped_at": self.tripped_at,
            "last_error": self.last_error,
        }
        self.state_file.parent.mkdir(parents=True, exist_ok=True)
        self.state_file.write_text(json.dumps(data, indent=2))

    # ── Public API ──────────────────────────────────────────────────────────

    def is_available(self) -> bool:
        """True only when compression should be attempted."""
        if self.state == "CLOSED":
            return True
        if self.state == "HALF_OPEN":
            return True
        # TRIPPED — check cooldown elapsed
        if self.tripped_at and (time.time() - self.tripped_at) >= COOLDOWN_SECS:
            self.state = "HALF_OPEN"
            self.failures = 0
            self._save()
            return True
        return False

    def record_success(self) -> None:
        if self.state == "HALF_OPEN":
            self.state   = "CLOSED"
            self.failures = 0
            self.tripped_at = None
            self._save()

    def record_failure(self, error_msg: str = "") -> None:
        self.failures += 1
        self.last_error = error_msg[:200]

        if self.state == "HALF_OPEN":
            # Any failure in HALF_OPEN trips immediately
            self.state     = "TRIPPED"
            self.tripped_at = time.time()
            self._save()
            return

        if self.state == "CLOSED":
            if self.failures >= MAX_RETRIES:
                self.state     = "TRIPPED"
                self.tripped_at = time.time()
                self._save()


# Singleton
_cb: CircuitBreaker | None = None

def _get_cb() -> CircuitBreaker:
    global _cb
    if _cb is None:
        _cb = CircuitBreaker()
    return _cb


# ── Error classification ───────────────────────────────────────────────────

def _is_context_window_error(error_msg: str) -> bool:
    """400 context window errors are expected at high usage — don't trip breaker."""
    return (
        "context window exceeds" in error_msg.lower()
        or "context_limit_exceeded" in error_msg.lower()
        or "max_tokens" in error_msg.lower()
    )


# ── Core compression with retry + circuit breaker ─────────────────────────

def compress_with_retry(
    text: str,
    headroom_bin: str | Path,
    timeout: int = 60,
) -> Tuple[str, int]:
    """
    Compress `text` using the headroom CLI.

    Returns (compressed_text, tokens_saved).
    Falls back to (text, 0) on any failure.

    Circuit breaker:
      - 400 context errors → silent fallback, no circuit increment
      - 500/999/429/errors → retry with backoff, circuit increment on persistent failure
      - After MAX_RETRIES consecutive failures → breaker trips, compression
        skipped for COOLDOWN_SECS (10 min)
    """
    if len(text) < 5000:
        return text, 0

    cb = _get_cb()

    # ── Circuit: breaker says no ──────────────────────────────────────────
    if not cb.is_available():
        return text, 0

    # ── Retry loop ────────────────────────────────────────────────────────
    last_error = ""
    for attempt in range(MAX_RETRIES):
        tmp_in  = None
        tmp_out = None
        try:
            tmp_in  = tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False)
            tmp_in.write(text)
            tmp_in.close()
            tmp_out = tmp_in.name + ".compressed"

            result = subprocess.run(
                [str(headroom_bin), "-", tmp_in.name, tmp_out],
                input=(
                    "import sys, os\n"
                    "os.environ['HEADROOM_QUIET'] = '1'\n"
                    "from headroom import compress\n"
                    f"src = open('{tmp_in.name}').read()\n"
                    "r = compress(messages=[{'role': 'user', 'content': src}])\n"
                    "out = r.messages[0]['content'] if r.messages else ''\n"
                    f"open('{tmp_out}', 'w').write(out)\n"
                    "print(r.tokens_saved)\n"
                ),
                capture_output=True,
                text=True,
                timeout=timeout,
            )

            # ── Classify outcome ─────────────────────────────────────────
            if result.returncode == 0 and os.path.exists(tmp_out):
                compressed = open(tmp_out).read()
                try:
                    saved = int(result.stdout.strip() or "0")
                except ValueError:
                    saved = 0

                cb.record_success()
                return compressed, saved

            raw = result.stdout + result.stderr
            last_error = raw[:300]

            # 400 context window → do NOT retry, do NOT trip breaker
            if result.returncode == 400 or _is_context_window_error(raw):
                cb.record_success()   # context errors don't penalise the circuit
                return text, 0

            # 429 rate limit → retry with backoff
            if "429" in raw or "rate_limit" in raw.lower():
                last_error = f"[rate_limit] {last_error}"

        except subprocess.TimeoutExpired:
            last_error = "headroom timeout"
        except Exception as exc:
            last_error = str(exc)[:200]

        # ── Failure: backoff then retry ──────────────────────────────────
        cb.record_failure(last_error)
        if attempt < MAX_RETRIES - 1:
            delay = BASE_DELAY_SECS[attempt]
            time.sleep(delay)

        # Clean up temp files even on failure
        for f in [tmp_in.name if tmp_in else None, tmp_out]:
            if f:
                try:
                    os.unlink(f)
                except OSError:
                    pass

    # All retries exhausted — breaker is now TRIPPED (or already was)
    return text, 0
