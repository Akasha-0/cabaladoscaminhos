// W78 sacred-sound-ui smoke — fast happy-path exercise of the public API.
// Self-running synchronous harness.

import {
  TRADITIONS, isTradition, TRADITION_DISPLAY,
  SOLFEGGIO_HZ, TANTRA_GAMMA_HZ, SCHUMANN_HZ, isSacredHz, getFrequencyForTradition, makeFrequency,
  getTraditionIntentionCategories, isIntentionCategory,
  listTracks, getTrack, listTracksByTradition, listTracksByFrequency, getCaptionsForTrack,
  setIntention, listIntentions, getIntention, completeIntention, exportIntentionHistory, registerUser,
  createSession, play, pause, resume, seek, getCurrentPosition, onStateChange,
  getKeyboardShortcuts, getScreenReaderAnnouncements, isReducedMotionPreferred, _setReducedMotionForTests,
  getRecommendedTrackForTradition,
  saveSessionState, loadSessionState, shouldWarnOnCellular, _setNetworkHintForTests,
  hashSessionState, hashIntentionCanonical,
  _resetUIForTests,
  makeTrackId, makeUserId, makeCategory, makeIntentionId, makeISO, nowISO,
  some, NONE, ok, err, fromNullable,
} from './sacred-sound-ui.ts';

let passed = 0, failed = 0;

function check(label: string, cond: boolean, detail = ''): void {
  if (cond) { passed++; console.log(`  ✓ ${label}`); }
  else { failed++; console.error(`  ✗ ${label}${detail ? ' — ' + detail : ''}`); }
}

function expectThrow(label: string, fn: () => unknown, contains?: string): void {
  let threw = false; let msg = '';
  try { fn(); } catch (e) { threw = true; msg = String(e); }
  const ok = threw && (contains ? msg.includes(contains) : true);
  check(label, ok, threw ? (contains && !msg.includes(contains) ? `error msg doesn't contain "${contains}": ${msg}` : '') : 'did not throw');
}

// === 1. Foundations ===
console.log('\n[1] Foundations');
_resetUIForTests();
check('SOLFEGGIO has 10 entries', SOLFEGGIO_HZ.length === 10);
check('SOLFEGGIO 174 first', SOLFEGGIO_HZ[0] === 174);
check('SOLFEGGIO 963 last', SOLFEGGIO_HZ[9] === 963);
check('TANTRA gamma 40Hz', TANTRA_GAMMA_HZ === 40);
check('SCHUMANN 7.83Hz', SCHUMANN_HZ === 7.83);
check('isSacredHz true for solfeggio', isSacredHz(528));
check('isSacredHz false for 440', !isSacredHz(440));
expectThrow('makeFrequency rejects 440', () => makeFrequency(440, 'A440'));
const someF = makeFrequency(528, 'X');
check('makeFrequency accepts 528', (someF as unknown as { hz: number }).hz === 528);
check('nowISO canonical', nowISO() === '2026-06-30T00:00:00.000Z');

// === 2. Tradition taxonomy ===
console.log('\n[2] Tradition taxonomy');
check('7 traditions', TRADITIONS.length === 7);
check('all are valid', TRADITIONS.every(isTradition));
check('TRADITION_DISPLAY 7 entries', TRADITION_DISPLAY.length === 7);
for (const t of TRADITIONS) {
  check(`${t} has 3 categories`, getTraditionIntentionCategories(t).length === 3);
  check(`${t} has 3 tracks`, listTracksByTradition(t).length === 3);
  check(`${t} has sacred hz`, isSacredHz((getFrequencyForTradition(t) as unknown as { hz: number }).hz));
}
check('isIntentionCategory(ancoramento)', isIntentionCategory('ancoramento'));
check('!isIntentionCategory(bogus)', !isIntentionCategory('bogusx'));

// === 3. Track catalog ===
console.log('\n[3] Track catalog');
const t0 = makeTrackId('t_candomble_01');
_resetUIForTests();
const all = listTracks();
check('catalog size 21', all.length === 21, `got ${all.length}`);
const c = getTrack(t0);
check('getTrack candomble_01 returns some', c.kind === 'some');
const n = getTrack(makeTrackId('t_does_not_exist_xx'));
check('getTrack unknown returns none', n.kind === 'none');
check('filter by tradition = 3', listTracks({ tradition: 'candomble' }).length === 3);
const filtered = listTracks({ category: makeCategory('ancoramento') });
check('filter by category > 0', filtered.length > 0);
const long = listTracks({ minDurationSec: 1500 });
check('filter by minDurationSec excludes', long.every((t) => t.durationSec >= 1500));
const small = listTracks({ maxSizeMb: 8 });
check('filter by maxSizeMb excludes', small.every((t) => t.sizeMb <= 8));
const freq528 = listTracksByFrequency(makeFrequency(528, 'T'));
check('frequency 528 has candomble+cigano', freq528.length >= 6, `got ${freq528.length}`);

// === 4. Captions ===
console.log('\n[4] Captions');
const caps = getCaptionsForTrack(t0);
check('candomble track has >=3 captions', caps.length >= 3, `got ${caps.length}`);
check('candomble captions pt-BR', caps[0]?.lang === 'pt-BR');
const tantraCaps = getCaptionsForTrack(makeTrackId('t_tantra_01'));
check('tantra captions en', tantraCaps[0]?.lang === 'en');

// === 5. Intention system ===
console.log('\n[5] Intention system');
_resetUIForTests();
const adm = makeUserId('u_admin_test_001');
const ghost = makeUserId('u_ghost_no_auth');
registerUser(adm);
const bad1 = setIntention(ghost, t0, { category: makeCategory('ancoramento'), text: 'x' });
check('ghost auth-required', !bad1.ok && (bad1 as { error: { kind: string } }).error.kind === 'auth-required');
const bad2 = setIntention(adm, makeTrackId('t_nope_nope_xx'), { category: makeCategory('ancoramento'), text: 'x' });
check('bad track', !bad2.ok && (bad2 as { error: { kind: string } }).error.kind === 'track-not-found');
const bad3 = setIntention(adm, t0, { category: makeCategory('ancoramento'), text: '   ' });
check('empty text', !bad3.ok && (bad3 as { error: { kind: string } }).error.kind === 'text-empty');
const bad4 = setIntention(adm, t0, { category: makeCategory('ancoramento'), text: 'x'.repeat(281) });
check('too-long text', !bad4.ok && (bad4 as { error: { kind: string } }).error.kind === 'text-too-long');
const bad5 = setIntention(adm, t0, { category: makeCategory('wrongcat'), text: 'x' });
check('wrong category', !bad5.ok && (bad5 as { error: { kind: string } }).error.kind === 'category-mismatch');
const ok1 = setIntention(adm, t0, { category: makeCategory('ancoramento'), text: 'Settle the light' });
check('ok intention', ok1.ok);
const list = listIntentions(adm);
check('list returns 1', list.length === 1);
const foundOpt = getIntention(ok1.ok ? ok1.value : makeIntentionId('i_doesnotexistaa'));
check('getIntention returns some', foundOpt.kind === 'some');
const done = completeIntention(ok1.ok ? ok1.value : makeIntentionId('i_doesnotexistaa'), 'Senti a luz');
check('complete intention', done.ok);
const dbl = completeIntention(ok1.ok ? ok1.value : makeIntentionId('i_doesnotexistaa'), 'again');
check('already-completed', !dbl.ok && (dbl as { error: { kind: string } }).error.kind === 'already-completed');
const bad6 = completeIntention(makeIntentionId('i_doesnotexistaa'), 'x');
check('intention-not-found', !bad6.ok && (bad6 as { error: { kind: string } }).error.kind === 'intention-not-found');
check('export empty for ghost', exportIntentionHistory(ghost).length === 0);
check('export 1 for adm', exportIntentionHistory(adm).length === 1);

// === 6. Playback state machine ===
console.log('\n[6] Playback');
_resetUIForTests();
const sess0 = createSession(t0);
check('createSession idle', sess0.state === 'idle' && sess0.position === 0);
const playing = play(sess0);
check('play → playing', playing.state === 'playing');
const paused = pause(playing);
check('pause → paused', paused.state === 'paused');
const resumed = resume(paused);
check('resume → playing', resumed.state === 'playing');
check('pause(no-op when idle)', pause(sess0).state === 'idle');
check('resume(no-op when not paused)', resume(playing).state === 'playing');
const mid = seek(playing, 60);
check('seek to 60 → playing', mid.state === 'playing' && mid.position === 60);
const neg = seek(playing, -1);
check('seek negative no-op', neg.position === 0);
const over = seek(playing, playing.duration + 100);
check('seek past duration → ended', over.state === 'ended');
check('getCurrentPosition mirrors', getCurrentPosition(mid) === 60);
const failSess = play(createSession(t0, { failOnLoad: true }));
check('failOnLoad → error', failSess.state === 'error');
let calls = 0;
const subSess = createSession(t0);
const u = onStateChange(subSess, () => { calls++; });
play(subSess); // must use the SAME session-key that the listener was registered against
check('subscriber fires', calls >= 1);
u();
let callsAfterUnsub = 0;
const u2 = onStateChange(subSess, () => { callsAfterUnsub++; });
u2();
play(subSess);
check('unsub stopped firing', callsAfterUnsub === 0);

// === 7. Accessibility ===
console.log('\n[7] Accessibility');
check('keyboard shortcuts = 6', getKeyboardShortcuts().length === 6);
const states = ['idle','loading','playing','paused','ended','error'] as const;
check('all states announce', states.every((s) => getScreenReaderAnnouncements(s).length > 0));
_setReducedMotionForTests(true); check('reduced motion true', isReducedMotionPreferred());
_setReducedMotionForTests(false); check('reduced motion false', isReducedMotionPreferred() === false);

// === 8. Tradition selector + persistence ===
console.log('\n[8] Tradition selector');
const rec = getRecommendedTrackForTradition('candomble');
check('recommend returns some', rec.kind === 'some');
registerUser(adm);
saveSessionState(playing, adm);
const loaded = loadSessionState(adm);
check('loadSessionState returns some', loaded.kind === 'some');
saveSessionState(playing, ghost);
const noLoad = loadSessionState(ghost);
check('loadSessionState auth-gated', noLoad.kind === 'none');
_setNetworkHintForTests(true);  check('wifi no warn', !shouldWarnOnCellular(t0));
_setNetworkHintForTests(false); check('cellular small track no warn', !shouldWarnOnCellular(t0));
const big = listTracks().find((t) => t.sizeMb > 20);
if (big) check(`cellular big track warn`, shouldWarnOnCellular(big.id));
_setNetworkHintForTests(true);

// === 9. Hashing + helpers ===
console.log('\n[9] Hashing / helpers');
const ha = hashSessionState(sess0);
const hb = hashSessionState(playing);
check('hash differs across state', ha !== hb);
check('hash deterministic', ha === hashSessionState(sess0));
check('hashIntentionCanonical works', typeof hashIntentionCanonical({
  id: makeIntentionId('i_test00000001'), userId: adm, trackId: t0,
  category: makeCategory('ancoramento'), text: 'x', tradition: 'candomble', createdAt: nowISO(),
  completedAt: NONE, reflection: NONE,
}) === 'string');
check('some(1).kind = some', some(1).kind === 'some');
check('NONE.kind = none', NONE.kind === 'none');
check('ok(1).ok = true', ok(1).ok === true);
check('err("x").ok = false', err('x').ok === false);
check('fromNullable(1).kind = some', fromNullable(1).kind === 'some');
check('fromNullable(null).kind = none', fromNullable(null).kind === 'none');

console.log(`\nSmoke summary: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
