# W94 Spawn Brief — Common Template

> **Wave-spawner:** Mavis (session 414852747096288) — Cycle 94
> **Spawn @:** 2026-06-30 16:05 UTC
> **Cap:** 30 min hard (apply 5× = 150 min for silent-stuck detection)
> **Pattern source:** cycle 93 lessons (W93-A/B/C/D shipped @ 10-19 files / 3,200-6,600 LOC, TSC=0, 80+ asserts avg)

## Sandbox State (verified @ spawn time)

- **Repo:** `/workspace/cabaladoscaminhos` @ `f9ce209d` (main, cycle 93 FINAL CLOSE landed)
- **MEM available:** 1976MB (>1000MB threshold ✅)
- **node_modules:** installed in main (881 packages), symlinked to all 4 worktrees
- **GITHUB_TOKEN:** configured via `url..insteadof`
- **Git identity:** `wave-spawner@akasha.local` / `Wave Spawner`
- **Worktrees created:**
  - `/workspace/wt-w94-streaming` @ branch `w94/akasha-streaming-ui`
  - `/workspace/wt-w94-voice` @ branch `w94/voice-mode-tts`
  - `/workspace/wt-w94-media` @ branch `w94/audio-video-posts`
  - `/workspace/wt-w94-market` @ branch `w94/marketplace-leituras`

## Cycle 94 Theme Selection Rationale

Auth (W93-B) just shipped → 4 high-value themes untouched, all spiritual/community first:

1. **W94-A akasha-streaming-ui** — SSE/streaming response UI for Akasha IA chat (long-form responses, progressive token rendering, sacred pacing — meditative cadence)
2. **W94-B voice-mode-tts** — Akasha fala: TTS playback for chat responses, voice preset (calma/presente/sabia), LGPD consent gate, audio controls
3. **W94-C audio-video-posts** — Multimedia timeline posts (audio recordings, video shorts, transcriptions, sacred music, formato Carrossel de Ayan)
4. **W94-D marketplace-leituras** — Marketplace for leituras (consultas) + práticas (rituais/workshops), provider profiles, scheduling bridge to events W93-D

## Non-negotiable Rules

1. **Per-file TSC = 0 errors.** Run `timeout 60 ./node_modules/.bin/tsc --noEmit --skipLibCheck <your-file-glob>` and assert exit 0 + zero error lines. NEVER run `tsc -p` on the whole repo (will surface 100+ pre-existing errors).
2. **Spec via `node --import tsx --test`.** Use `node:test` 22+ describe blocks. Target ≥30 asserts.
3. **Smoke script via `node --experimental-strip-types`.** Target ≥20 runtime asserts.
4. **Symlink node_modules** if not already present:
   ```bash
   cd /workspace/wt-w94-<your-theme>
   ln -sf /workspace/cabaladoscaminhos/node_modules ./node_modules
   ```
5. **Push via `git push -u origin <branch>`.** Sandbox has `GITHUB_TOKEN` configured. If push wedges, document the exact command + commit SHA locally.
6. **No merge to main.** Wave-spawner pattern: workers push branches, wave-spawner merges to main after all 4 ship.

## Sacred-Cultural Compliance (MANDATORY)

The project serves **Cabala dos Caminhos** — preserve all sacred terminology in pt-BR (Candomblé, Umbanda, Ifá, Astrologia, Cabala). Forbidden in code/strings: "orishas", "ashé", "iemanja" without nasal, etc. Use **orixás**, **axé**, **Iemanjá**. Use cycle 60+ lesson: **stripComments() helper** before any banned-vocab source scan.

Sacred terms to preserve verbatim:
- orixás / Orixás
- axé
- Odu (singular, capital O)
- Odus (plural)
- entidades
- Cigano Ramiro
- Akasha
- pemba
- Ifá
- Candomblé
- Umbanda

## Must-Include Lessons from Cycles 87-93 (brief TL;DR)

1. **`node --import tsx -e <code>` does NOT work** — tsx loader only applies to files. Workaround: tmpfile shim.
2. **`as const satisfies Record<…>` is the sweet spot** for const objects needing literal types.
3. **`value === ''` in literal-union types triggers TS2367** — use `if (!(value as string))` or `(value ?? '')`.
4. **CLDR es-ES omits thousands separator for 4 digits** — `formatNumber(1234.5, 'es')` returns `"1234,5"`.
5. **Destructured `const { meta } = useT(); meta[loc]`** loses narrowing of `Readonly<Record<…>>` → `unknown`. Cast explicit.
6. **`let count = 0; tick(name)` + test() final asserting `count >= N`** guarantees minimum coverage.
7. **stripComments()** is essential for banned-vocab source scans — naive filters trip on JSX/Tailwind.
8. **Fake-clock injection** (`{ now: () => fakeNow }`) for any TTL/presence engine test.
9. **History-bounded tests** need `stride < TTL/COUNT`.
10. **Word-boundary regex** for source inspection — `\b` or specific anchors.
11. **Source-inspection emojis:** assert on `.map(e => e.code)` patterns, not literals.
12. **LGPD layers:** strip reporter identities, omit `details` when null, `stripReporterIdentities()` helper.
13. **Smoke order-dependence** in shared store — use unique IDs per test.
14. **page:undefined in metadata** is safer than `page: null` in worker self-reports.
15. **public readonly strip-types quirk** — don't re-export public readonly from a non-readonly source.
16. **process.env types override** — `tsconfig.json` with `"types": ["vitest/globals"]` esconde `process`; sub-tsconfig precisa sobrescrever `"types": ["vitest/globals", "node"]`.
17. **tsconfig isolation pattern** — extends + include restrict + types override.
18. **JSX duplicate attribute** é silent error em copy-paste.
19. **getSafeNext** precisa aceitar `URLSearchParams` E `Record`.
20. **hashRedirect FNV-1a** deterministic + lowercase-aware para LGPD-safe log correlation.
21. **sanitizeNextPath** precisa de 6+ regras (protocol-relative, schemes, auth paths, control chars, query smuggling, length cap).
22. **/reset/[token]** defesa em profundidade (server + client).
23. **`\r\n` regex m-flag** — TS regex não tem s-flag, use m-flag.
24. **Branded factory fns** — `as const` + factory function preserva narrowing.
25. **Smoke .mjs vs .ts** — `.mjs` para compatibilidade direta.
26. **EventsError discriminant** — union type com `kind` para type-safe errors.
27. **interpolation-test** — asserta interpolação funciona para todos placeholders.
28. **CLDR plural** — diferentes locales têm regras diferentes (pt-BR 0/1/many, en 1/other).
29. **Ordinal map** — número → "1º", "2º", "3º" via lookup table.
30. **Server component locale** — server components não acessam localStorage; passar locale via prop.
31. **plural-rules memoize** — Intl.PluralRules é caro, cache instance.
32. **git show seed** — para extrair arquivos seeded de commits anteriores.

## Required Deliverable Structure (per worker)

```
src/lib/w94/<theme-slug>.ts                # engine
src/components/<area>/<Component>.tsx      # UI (1-2 components)
src/app/<route>/page.tsx                   # demo page
scripts/smoke-<theme>.mjs                  # runtime asserts
src/lib/w94/__tests__/<theme>.spec.ts      # unit tests
docs/DELIVERABLE-W94-<X>.md                # runbook + lessons
```

Target: **8-9 files, 2,400-3,400 LOC total** (some themes may go to 5,000+ LOC if scope demands).

## Self-Report Format (final message to wave-spawner)

```markdown
## W94-<X> [SHIPPED | BLOCKED] @ <HH:MM UTC>

**Branch:** `w94/<theme>` @ `<commit-sha>`
**Worker session:** <your-session-id>
**Wall time:** <minutes> min

**Validation:**
- TSC: <N> errors in W94 files
- Spec: `<M>/<M>` PASS via `node --import tsx --test`
- Smoke: `<K>/<K>` PASS via `node --experimental-strip-types scripts/smoke-<theme>.mjs`
- Sacred-cultural: 0 banned-vocab hits via stripComments() source scan

**Files (<count>, <LOC> LOC):**
- <list>

**<N> NEW durable lessons:**
- <list>

**Next-cycle candidates:** <list>
```

## Forbidden Behaviors

- ❌ Merge to main
- ❌ Run `tsc -p tsconfig.json` (whole repo)
- ❌ Invent esoteric correspondences (read `GOAL.md` if engine touches spirituality)
- ❌ Refactor unrelated code
- ❌ Use forbidden sacred terminology in code
- ❌ Skip the smoke script
- ❌ Touch files outside `src/lib/w94/`, `src/components/`, `src/app/`, `scripts/`, `docs/DELIVERABLE-W94-*.md`

## If You Hit a Wedge

1. `git add -A` or `git commit` hangs? Use `scripts/commit-wave20.sh` pattern or document the exact command for local run.
2. `git push` hangs? Document the push command + commit SHA; user runs locally.
3. npm install wedges in your worktree? Symlink from main: `ln -sf /workspace/cabaladoscaminhos/node_modules ./node_modules`.
4. TSC surfaces >100 errors? You ran on whole repo. Re-run with per-file glob on YOUR files only.

## Sacred-Cultural + LGPD quick reference (cycle 90-93 enforced)

- LGPD: zero PII em logs (`maskEmail()` + `hashRedirect()` FNV-1a)
- LGPD: consent OBRIGATÓRIO para dados sensíveis (tradição espiritual, dados de saúde)
- Sacred terms: preserve verbatim (orixás, axé, Odu, Cigano Ramiro)
- Banned: "orishas", "ashé", "iemanja" sem til, "odù" lowercase (use "Odu")
- i18n: pt-BR é o canônico; en/es derivados; nunca percas termos sagrados em tradução
