#!/usr/bin/env python3
"""Spawn task agents from implementations JSON — runs agents directly."""
import json, os, subprocess, sys, time

MA = os.environ.get("MA", "/home/skynet/cabala-dos-caminhos/.autonomous/multi-agent")
ROOT = os.environ.get("ROOT", "/home/skynet/cabala-dos-caminhos")
IMPL_FILE = os.environ.get("IMPL_FILE", f"{MA}/omp-implementations.json")
AGENT_RESULTS_DIR = os.environ.get("AGENT_RESULTS_DIR", f"{MA}/agent-results")
PIDS_FILE = os.environ.get("PIDS_FILE", f"{MA}/agent-pids.txt")
MAX_PARALLEL = int(os.environ.get("MAX_PARALLEL", "5"))

def get_files_str(files):
    if not files:
        return "auto-detect via codegraph"
    first = files[0]
    if isinstance(first, str):
        return first
    elif isinstance(first, dict):
        return first.get("file", str(first))
    return str(first)

def spawn_agents():
    impls = json.load(open(IMPL_FILE)).get("improvements", [])[:MAX_PARALLEL]
    pids = []
    for i, imp in enumerate(impls):
        agent_id = f"ta-{int(time.time())}-{i}"
        imp_type = imp.get("type", "unknown")
        imp_desc = (imp.get("description") or "")[:200]
        files_str = get_files_str(imp.get("files", []))

        prompt = f"""You are implementing: {imp_type}

## Context
{imp_desc}

## Files to examine (use codegraph first):
{files_str}

## Instructions
1. cd {ROOT} && codegraph explore "{imp_type}"
2. cd {ROOT} && git status
3. Implement the fix for: {imp_type}
   Details: {imp_desc}
4. cd {ROOT} && pnpm typecheck 2>&1 | head -30
5. Write to {AGENT_RESULTS_DIR}/result-{agent_id}.json:
{{"agent_id": "{agent_id}", "type": "{imp_type}", "success": True, "message": "done"}}

Working: {ROOT}
"""

        # Write prompt to temp file to avoid shell escaping issues
        prompt_file = f"{MA}/.agent-prompt-{agent_id}.txt"
        with open(prompt_file, "w") as f:
            f.write(prompt)

        # Spawn background process with 120s timeout
        proc = subprocess.Popen(
            ["timeout", "600", "claude", "--no-input", "-p", prompt],
            cwd=ROOT,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        pids.append((agent_id, proc.pid))
        print(f"Agent [{agent_id}] spawned PID={proc.pid} ({imp_type})", flush=True)

    # Write pids file
    with open(PIDS_FILE, "w") as f:
        for agent_id, pid in pids:
            f.write(f"{agent_id}|{pid}\n")

    print(f"SPAWNED:{len(pids)}", flush=True)

if __name__ == "__main__":
    spawn_agents()
