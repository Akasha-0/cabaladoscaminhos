# Autoresearch: Project Development Velocity

## Objective
Measure development velocity and maintain test suite health.

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

### Iterations 3-7: Monitoring ✅
- **Status**: Stable - 139 tests passing consistently
- **dev_velocity**: 8 tasks completed
- **tasks_pending**: 11 tasks in progress
- **Development**: Active (43 files changed in recent commits)

## Conclusion
**SUCCESS** - The test suite is properly configured and stable. All 139 tests pass consistently.

## Future Ideas (if needed)
1. Add integration tests for new features
2. Increase test coverage for critical paths
3. Add performance benchmarks
4. Add E2E tests with Playwright