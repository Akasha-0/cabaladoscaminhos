---
lesson: 009
title: Shell quoting in grep ERE breaks vitest on filenames with dots
cycle: 533
date: 2026-06-18
tags: [shell, grep, execSync, vitest, quoting, bug]
summary: Fixing grep ERE patterns that embed quote-matchers inside single-quoted shell strings eliminates 361 "Syntax error" per test run.
---

# Shell quoting in grep ERE breaks vitest on filenames with dots

## Problem

`execSync(\`grep -rE -e '${pattern}' ...\`)` inside vitest tests produces **"Syntax error: Unterminated quoted string"** when `pattern` contains quote characters. The `.` in filenames like `ayanamsa.test` interpolates into grep patterns inside single-quoted shell strings — but when the pattern itself contains `['\"]` to match JS string quotes, the single-quoted shell string cannot contain literal single quotes, and the `\"` escaping is parsed as closing the double-quote context.

## Root cause

`['\"]` inside a single-quoted shell string `'…'` — the single-quote char cannot appear inside single quotes even escaped. `/bin/sh` misparses the command, producing 361 "Syntax error: Unterminated quoted string" per test run.

## Solution

Use **two grep patterns**, one per quote type, both with **double-quoted shell strings**:

```typescript
const patDouble = `from\\s+\\\"@akasha/[^'\\\"]*${seg}[^'\\\"]*\\\"`;
const patSingle = `from\\s+\x27@akasha/[^'\\\"]*${seg}[^'\\\"]*\x27`;

// Double-quoted shell strings: \\\" → \" → " (literal quote in grep ERE)
const result = execSync(`grep -rE "${patDouble}" ...`);
const result2 = execSync(`grep -rE "${patSingle}" ...`);
```

**Key insight**: In double-quoted shell strings, `\\\"` resolves to `\"` which is a literal `"` inside the grep ERE pattern — no confusion with shell quoting.

## Files affected

- `tests/architecture/package-boundaries.test.ts` — 2 grep patterns fixed
- `tests/architecture/clean-architecture.test.ts` — same pattern existed; fixed in cycle 530 (dot in `process.env`)

## Prevention

When writing `execSync` with grep, **never** embed JS string quote-matchers (`['\"]`, `\x27`, etc.) inside single-quoted shell strings. Use double-quoted shell strings with `\\\"` escaping, or use two separate greps with one pattern each.
