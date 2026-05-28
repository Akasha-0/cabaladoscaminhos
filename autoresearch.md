# Autoresearch: Harness-Driven Development

## Objective
Measure how well the Pi Agent harness drives autonomous development of this project (cabala-dos-caminhos).

## Metrics
- **Primary**: dev_velocity (tasks/minute, higher is better) — rate of task completion
- **Secondary**: git_commits_per_hour (count, higher is better) — commits made
- **Secondary**: lines_added (count, higher is better) — code written
- **Secondary**: files_changed (count, higher is better) — files modified/created

## How to Run
```bash
./autoresearch.sh
```

## Files in Scope
| Path | Purpose |
|------|---------|
| `src/` | Application source code |
| `tests/` | Test files |
| `docs/` | Documentation |

## Off Limits
- Pi Agent harness files (`~/.pi/agent/`)
- External dependencies

## Constraints
- Tests must pass
- No breaking changes
- Harness runs autonomously

## What's Been Tried

### Baseline
- Harness watchdog implemented
- Auto-continue rules in 3 locations
- Cannot measure: no active harness session

### New Approach
Measure development velocity of THIS project when harness is active.