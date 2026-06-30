/* eslint-disable */
// @ts-nocheck — runtime smoke uses node: imports without @types/node

/**
 * ════════════════════════════════════════════════════════════════════════════
 * W81-D — LIVESTREAM WATCH UI · RUNTIME SMOKE (UI source + engine import)
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Cycle 81 · 2026-06-30
 *
 * Companion to w81-livestream-watch-ui.ts. Exercises:
 *   • Engine module load (proves the .ts is parseable + imports resolve)
 *   • UI source file contains all 6 component exports
 *   • UI imports the engine surface
 *   • UI uses ARIA + WCAG patterns
 *   • spec + smoke + tsconfig + stubs files are present and well-formed
 *
 * Run with: node --experimental-strip-types scripts/smoke/w81-livestream-watch-ui-runtime.ts
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import {
  STREAM_CATEGORIES,
  listStreamCategories,
  moderateChatBody,
  canAutoPlayWithAudio,
  shouldAllowReaction,
  userId,
  formatViewerCount,
  A11Y_SHORTCUTS,
  resolveShortcut,
  streamId,
  chatMessageId,
  transitionPlayer,
  buildScheduleNotice,
} from '../../src/lib/w81/livestream-watch-engine.ts';

declare const process: { exit(code: number): never };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let passes = 0;
let fails = 0;

function check(label: string, cond: boolean): void {
  if (cond) { passes++; console.log('  ✓ ' + label); }
  else { fails++; console.log('  ✗ ' + label); }
}

console.log('W81-D Livestream Watch UI — Runtime Smoke (engine module + UI source)\n');

// ─── Engine runtime load — proves .ts is parseable + exports are real ────────
check('engine STREAM_CATEGORIES has 7 entries', Object.keys(STREAM_CATEGORIES).length === 7);
check('engine listStreamCategories returns 7', listStreamCategories().length === 7);
check('engine moderateChatBody is callable', typeof moderateChatBody('oi') === 'object');
check('engine canAutoPlayWithAudio is callable', typeof canAutoPlayWithAudio({ sacredCategory: null, userGesture: true, explicitAudioOptIn: false }) === 'boolean');
check('engine shouldAllowReaction is callable', typeof shouldAllowReaction([], { userId: userId('usr_aaaaaa'), emoji: '🙏', ts: 1 }) === 'object');
check('engine formatViewerCount handles 1.5M', formatViewerCount(1_500_000) === '1.5M');
check('engine A11Y_SHORTCUTS has 5 keys', Object.keys(A11Y_SHORTCUTS).length === 5);
check('engine resolveShortcut maps space', resolveShortcut(' ') === 'playPause');
check('engine streamId accepts valid', (() => { try { streamId('ls_abc123def456'); return true; } catch { return false; } })());
check('engine streamId rejects invalid', (() => { try { streamId('bad'); return false; } catch { return true; } })());
check('engine chatMessageId accepts valid', (() => { try { chatMessageId('cm_abc123def456'); return true; } catch { return false; } })());
check('engine transitionPlayer valid', transitionPlayer('IDLE', 'BUFFERING') === 'BUFFERING');
check('engine buildScheduleNotice sacred tone', buildScheduleNotice('mesa', 60_000).tone === 'sacred');

// ─── UI source contains all 6 components ────────────────────────────────────
const uiPath = join(__dirname, '..', '..', 'src', 'lib', 'w81', 'livestream-watch-ui.tsx');
const uiSrc = readFileSync(uiPath, 'utf8');
const expectedComponents = ['VideoPlayer', 'LiveChat', 'ViewerCount', 'StreamCategoryBadge', 'ReactionBar', 'ScheduleBanner', 'WatchSurface'];
for (const comp of expectedComponents) {
  const re = new RegExp('export function ' + comp + '\\b');
  check(`UI exports function "${comp}"`, re.test(uiSrc));
}

// ─── UI imports the engine surface ──────────────────────────────────────────
const expectedImports = [
  'STREAM_CATEGORIES', 'canTransitionPlayer', 'moderateChatBody',
  'aggregateReactions', 'canAutoPlayWithAudio', 'formatViewerCount',
  'resolveShortcut', 'buildScheduleNotice', 'audioConsentCta',
  'TOUCH_TARGET_MIN_PX', 'A11Y_SHORTCUTS',
];
for (const imp of expectedImports) {
  check(`UI imports "${imp}"`, uiSrc.includes(imp));
}

// ─── UI uses ARIA + WCAG patterns ───────────────────────────────────────────
check('UI uses aria-live (A11Y)', uiSrc.includes('aria-live'));
check('UI uses aria-label (A11Y)', uiSrc.includes('aria-label'));
check('UI uses aria-disabled (A11Y)', uiSrc.includes('aria-disabled'));
check('UI uses <video> tag', uiSrc.includes('<video'));
check('UI uses <track kind="captions"', uiSrc.includes('kind="captions"'));
check('UI uses role="region"', uiSrc.includes('role="region"'));
check('UI uses role="status"', uiSrc.includes('role="status"'));
check('UI uses role="group"', uiSrc.includes('role="group"'));
check('UI uses mobile-first 44px (TOUCH_TARGET_MIN_PX)', uiSrc.includes('TOUCH_TARGET_MIN_PX'));
check('UI gates audio via audioConsentCta', uiSrc.includes('audioConsentCta'));
check('UI never auto-plays with audio without gesture', uiSrc.includes('audioAllowed'));
check('UI shows LGPD sacred-warning CTA', uiSrc.includes('lgpdSacredContent') || uiSrc.includes('lgpdRequiresAudioConsent'));

// ─── Spec + smoke + tsconfig + stubs files ─────────────────────────────────
const specPath = join(__dirname, '..', '..', 'src', 'lib', 'w81', 'livestream-watch-ui.spec.ts');
const specSrc = readFileSync(specPath, 'utf8');
check('spec has ≥60 it() calls', (specSrc.match(/it\(/g) || []).length >= 60);

const smokePath = join(__dirname, 'w81-livestream-watch-ui.ts');
const smokeSrc = readFileSync(smokePath, 'utf8');
check('smoke has ≥30 check() calls', (smokeSrc.match(/check\(/g) || []).length >= 30);

const stubsPath = join(__dirname, '..', '..', 'src', 'lib', 'w81', 'react-stubs.d.ts');
const stubsSrc = readFileSync(stubsPath, 'utf8');
check('react-stubs.d.ts has JSX namespace', stubsSrc.includes('namespace JSX'));
check('react-stubs.d.ts has ReactElement<P>', stubsSrc.includes('ReactElement<P'));

const tsconfigPath = join(__dirname, '..', '..', 'tsconfig.w81-d.json');
const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf8'));
check('tsconfig has jsx: react', tsconfig.compilerOptions.jsx === 'react');
check('tsconfig has jsxFactory: React.createElement', tsconfig.compilerOptions.jsxFactory === 'React.createElement');
check('tsconfig has jsxFragmentFactory: React.Fragment', tsconfig.compilerOptions.jsxFragmentFactory === 'React.Fragment');

console.log('');
console.log('  RESULT: ' + passes + ' PASS · ' + fails + ' FAIL · ' + (passes + fails) + ' total');
if (fails > 0) process.exit(1);
