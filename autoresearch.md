# Autoresearch: Project Development Velocity

## Objective
Measure development velocity of the cabala-dos-caminhos project.

## Metrics
- **Primary**: test_passed (tests, higher is better) — total passing tests
- **Secondary**: dev_velocity (tasks) — completed Ralph tasks
- **Secondary**: files_changed (count) — files modified

## How to Run
```bash
./autoresearch.sh
```

## Files in Scope
- `src/` - Application source
- `tests/` - Test files (requires dual vitest configs)
- `.ralph/*.md` - Ralph task files

## Off Limits
- Harness files (`~/.pi/agent/`) - runs in separate tmux session

## Constraints
- All tests must pass (139 total)
- No breaking changes

## What's Been Tried

### Iteration 1: Baseline
- **Result**: 6 tasks completed, 33 files changed
- **Issue**: 3 JWT tests failing with jsdom environment

### Iteration 2: Fixed JWT Tests ✅
- **Changes**: 
  - Created `vitest.jwt.config.ts` with `environment: 'node'`
  - Excluded JWT tests from main `vitest.config.ts` (jsdom)
  - Updated test script to run both configs
- **Result**: 139 tests passing (135 other + 4 JWT)
- **Root Cause**: jose library requires proper Uint8Array prototype chain, which jsdom affects

### Key Insight
The jose library (v6.2.3) works correctly in Node.js environment but fails in jsdom because jsdom's Uint8Array implementation differs from the native one. Using a separate vitest config with `environment: 'node'` for JWT tests fixes this.

### Success
- test_passed: 139 ✅
- test_failed: 0 ✅
- All constraints satisfied