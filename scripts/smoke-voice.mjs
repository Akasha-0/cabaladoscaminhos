#!/usr/bin/env node
// ============================================================================
// smoke-voice.mjs — invariant checks for the W86-A voice engine + page
// ============================================================================
// Runs in plain Node (no vitest). Validates:
//  1. Engine import works (pure ESM, no DOM needed)
//  2. Voice presets cover 6 of 7 tradições (Ifá = coming-soon)
//  3. Voice presets are frozen
//  4. ALL_KNOWN_TRADICOES has 7 entries
//  5. Markdown→plain strips expected patterns
//  6. Engine play() enqueues + speaks via InMemoryVoiceAdapter
//  7. Audit log contains queued+playing+done transitions
//  8. cancel() clears queue
//  9. VoiceEngineError brand-typed code on EMPTY_TEXT
// 10. Page file exists + uses 'use client' + imports engine
// 11. Page has aria-live="polite"
// 12. Page renders all 7 tradição chips
// 13. Page has 48px tap targets
// 14. Page uses matchMedia for mobile breakpoint (≥880px)
// ============================================================================

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

let pass = 0;
let fail = 0;

function check(label, ok, info = '') {
  if (ok) {
    pass++;
    console.log(`  ✓ ${label}${info ? ' — ' + info : ''}`);
  } else {
    fail++;
    console.error(`  ✗ ${label}${info ? ' — ' + info : ''}`);
  }
}

// 1. Engine import works (use --experimental-strip-types for .ts)
const engineIndex = resolve(ROOT, 'src/engine/voice/index.ts');
check('engine/voice/index.ts exists', existsSync(engineIndex));

const types = await import(engineIndex);
const {
  VoiceEngine,
  VoiceEngineError,
  InMemoryVoiceAdapter,
  WebSpeechVoiceAdapter,
  VOICE_PRESETS,
  ALL_KNOWN_TRADICOES,
  IFA_STATUS,
  markdownToPlain,
} = types;

check('VoiceEngine export', typeof VoiceEngine === 'function');
check('VoiceEngineError export', typeof VoiceEngineError === 'function');
check('InMemoryVoiceAdapter export', typeof InMemoryVoiceAdapter === 'function');
check('WebSpeechVoiceAdapter export', typeof WebSpeechVoiceAdapter === 'function');

// 2. Voice presets cover 6 of 7
check('VOICE_PRESETS has 6 entries (Ifá = coming-soon)', VOICE_PRESETS.length === 6, `got ${VOICE_PRESETS.length}`);
check('VOICE_PRESETS is frozen', Object.isFrozen(VOICE_PRESETS));

// 3. ALL_KNOWN_TRADICOES has 7
check('ALL_KNOWN_TRADICOES has 7 entries', ALL_KNOWN_TRADICOES.length === 7, `got ${ALL_KNOWN_TRADICOES.length}`);
check('ALL_KNOWN_TRADICOES is frozen', Object.isFrozen(ALL_KNOWN_TRADICOES));

// 4. IFA_STATUS
check('IFA_STATUS is "coming-soon"', IFA_STATUS === 'coming-soon');

// 5. Markdown→plain
const mdOut = markdownToPlain('# Título\n**bold** `code` [link](https://x.com) ![img](a.png)');
check('markdownToPlain strips headers', !mdOut.includes('#'));
check('markdownToPlain strips bold markers', !mdOut.includes('**'));
check('markdownToPlain strips inline code markers', !mdOut.includes('`'));
check('markdownToPlain drops URLs from links', !mdOut.includes('https://x.com'));
check('markdownToPlain drops images entirely', !mdOut.includes('img') && !mdOut.includes('a.png'));
check('markdownToPlain keeps link text', mdOut.includes('link'));

// 6. Engine play()
const adapter = new InMemoryVoiceAdapter();
const engine = new VoiceEngine(adapter);

let emptyErrCaught = false;
try {
  await engine.play({ text: '' });
} catch (e) {
  emptyErrCaught = e instanceof VoiceEngineError && e.code === 'EMPTY_TEXT';
}
check('engine.play() throws VoiceEngineError with EMPTY_TEXT code', emptyErrCaught);

const state = await engine.play({ text: 'Olá mundo' });
check('engine.play() returns state with cueId', /^cue-\d{4}-[0-9a-f]{8}$/.test(state.cueId));
check('engine.play() reaches done status', state.status === 'done', `got ${state.status}`);
check('engine.play() records in adapter', adapter.getRecordCount() === 1);

// 7. Audit log
const audit = engine.exportAudit();
const statuses = new Set(audit.map((a) => a.status));
check('audit log has queued', statuses.has('queued'));
check('audit log has playing', statuses.has('playing'));
check('audit log has done', statuses.has('done'));

// 8. Cancel
await engine.play({ text: 'segundo' });
await engine.cancel();
check('after cancel(), queue is empty', engine.getQueue().length === 0);

// 9. WebSpeech adapter (smoke)
const ws = new WebSpeechVoiceAdapter();
check('WebSpeechVoiceAdapter.isSupported() returns boolean', typeof ws.isSupported() === 'boolean');

// 10. Page file
const pagePath = resolve(ROOT, 'src/app/voice/page.tsx');
check('page.tsx exists', existsSync(pagePath));
const page = readFileSync(pagePath, 'utf8');
check('page.tsx uses client directive', page.startsWith("'use client'"));
check('page.tsx imports engine/voice', /from\s+['"]@\/engine\/voice['"]/.test(page));

// 11. aria-live polite
check('page has aria-live="polite"', page.includes('aria-live="polite"'));

// 12. 7 tradição chips
check('page renders all 7 tradições (chips iterated from ALL_KNOWN_TRADICOES)', /ALL_KNOWN_TRADICOES\.map/.test(page));

// 13. 48px tap targets
const tapCount = (page.match(/minHeight:\s*'48px'/g) ?? []).length;
check('page has 48px tap targets', tapCount >= 2, `found ${tapCount}`);

// 14. matchMedia breakpoint
check('page uses matchMedia for desktop (>=880px)', /matchMedia\('\(min-width: 880px\)'\)/.test(page));

// Summary
console.log(`\n=== ${pass} pass / ${fail} fail ===`);
process.exit(fail === 0 ? 0 : 1);
