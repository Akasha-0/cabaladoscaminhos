# Autoresearch: Project Development Velocity

## Objective
Measure development velocity of the cabala-dos-caminhos project.

## Metrics
- **Primary**: dev_velocity (tasks, higher is better) — completed Ralph tasks
- **Secondary**: files_changed (count) — files modified in last 5 commits
- **Secondary**: lines_added (count) — lines added in last 5 commits

## How to Run
```bash
./autoresearch.sh
```

## Files in Scope
- `src/` - Application source
- `tests/` - Test files
- `docs/` - Documentation
- `.ralph/*.md` - Ralph task files

## Off Limits
- Harness files (`~/.pi/agent/`) - runs in separate tmux session

## Constraints
- Tests must pass
- No breaking changes

## What's Been Tried

### Baseline (Iteration 1)
- **Result**: 6 tasks completed, 33 files changed
- **Harness status**: Cannot test - runs in separate tmux session (environment limitation)

### Understanding
The Pi Agent harness is a separate tool that runs in a dedicated tmux session. It cannot be measured from within an autoresearch experiment because:
1. Harness starts its own pi session
2. Runs in separate tmux context
3. Requires interactive terminal to function

### Focus Change
Measure project development metrics (what we CAN measure), not harness metrics.

### Ideas for Future (in autoresearch.ideas.md)
- Start harness manually in real terminal before running experiment
- Connect to existing harness session for measurement
- Use harness logs for metrics instead of direct measurement