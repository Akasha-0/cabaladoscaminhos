// W80-D livestream-watch-ui smoke — fast happy-path exercise of the public API.
// Self-running synchronous harness. ≥40 checks covering all 7 traditions + helpers.

import {
  // Branded primitives
  makeStreamId,
  makeChatId,
  makeViewerId,
  // Tradition catalog
  TRADITION_KIND_LABELS,
  TRADITION_KIND_ICONS,
  STREAM_CATEGORIES,
  listStreamKinds,
  // Engine session
  createLivestreamSession,
  // LGPD
  isAudioConsentApproved,
  approveAudioConsent,
  revokeAudioConsent,
  // Reset
  _resetLivestreamForTests,
  __sentinel,
  type StreamChannel,
  type ChatMessage,
  type SacredContentFlag,
} from '../../src/components/livestream/__mock_engine__.ts';

import {
  formatViewerCount,
  formatViewerSr,
  formatTime,
  timeAgoPtBr,
  genreLabel,
  reduceStreamPlayer,
  initMachineState,
  canUnmuteAudio,
  summarizeChatState,
  isChatSubmitDisabled,
  renderSacredTermsList,
  MIN_TOUCH_TARGET_PX,
  MAX_CHAT_LEN,
  CHAT_PAGE_SIZE,
} from '../../src/components/livestream/StreamPlayer.helpers.ts';

let passed = 0, failed = 0;

function check(label: string, cond: boolean, detail = ''): void {
  if (cond) { passed += 1; console.log(`  ✓ ${label}`); }
  else { failed += 1; console.error(`  ✗ ${label}${detail ? ' — ' + detail : ''}`); }
}

function expectThrow(label: string, fn: () => unknown, contains?: string): void {
  let threw = false; let msg = '';
  try { fn(); } catch (e) { threw = true; msg = String(e); }
  const ok = threw && (contains ? msg.includes(contains) : true);
  check(label, ok, threw ? (contains && !msg.includes(contains) ? `error msg doesn't contain "${contains}": ${msg}` : '') : 'did not throw');
}

// === 1. Branded primitive factories ===
console.log('\n[1] Branded primitive factories');
_resetLivestreamForTests();
const sid = makeStreamId('ls_a_basic');
check('makeStreamId accepts ls_ prefix', (sid as string) === 'ls_a_basic');
expectThrow('makeStreamId rejects bad prefix', () => makeStreamId('xx_bad'), 'invalid');
expectThrow('makeStreamId rejects uppercase', () => makeStreamId('ls_ABC'), 'invalid');
const cid = makeChatId('ch_basic_msg');
check('makeChatId accepts ch_ prefix', (cid as string) === 'ch_basic_msg');
expectThrow('makeChatId rejects too short', () => makeChatId('ch_'), 'invalid');
const vid = makeViewerId('vw_basic_user');
check('makeViewerId accepts vw_ prefix', (vid as string) === 'vw_basic_user');
expectThrow('makeViewerId rejects bad chars', () => makeViewerId('vw_BAD'), 'invalid');

// === 2. Tradition catalog (7 kinds × 2 checks) ===
console.log('\n[2] Tradition catalog');
_resetLivestreamForTests();
const kinds = listStreamKinds();
check('listStreamKinds returns 7 entries', kinds.length === 7);
for (const k of kinds) {
  check(`TRADITION_KIND_LABELS[${k}] defined`, typeof TRADITION_KIND_LABELS[k] === 'string' && TRADITION_KIND_LABELS[k].length > 0);
  check(`TRADITION_KIND_ICONS[${k}] defined`, typeof TRADITION_KIND_ICONS[k] === 'string' && TRADITION_KIND_ICONS[k].length > 0);
}
const expectedKinds = ['CIGANO', 'CANDOMBLE', 'UMBANDA', 'IFA', 'CABALA', 'ASTROLOGIA', 'TANTRA'];
check('7 kinds in canonical order', JSON.stringify(kinds) === JSON.stringify(expectedKinds));
check('STREAM_CATEGORIES length 7', STREAM_CATEGORIES.length === 7);

// === 3. Format helpers ===
console.log('\n[3] Format helpers');
check('formatViewerCount(0)', formatViewerCount(0) === '0');
check('formatViewerCount(1500)', formatViewerCount(1500) === '1.5k');
check('formatViewerCount(2500000)', formatViewerCount(2_500_000) === '2.5M');
check('formatViewerSr singular', formatViewerSr(1, 1) === '1 espectador assistindo, 1 pico registrado');
check('formatViewerSr plural', formatViewerSr(2, 5) === '2 espectadores assistindo, 5 de pico registrado');
check('formatTime(0) = 00:00', formatTime(0) === '00:00');
check('timeAgoPtBr now', timeAgoPtBr(1000, 1000) === 'agora');
check('timeAgoPtBr 5 min ago', timeAgoPtBr(0, 5 * 60_000) === 'há 5 min');
check('timeAgoPtBr 1 h ago', timeAgoPtBr(0, 60 * 60_000) === 'há 1 h');
check('timeAgoPtBr 2 d ago', timeAgoPtBr(0, 2 * 24 * 60 * 60_000) === 'há 2 d');
check('genreLabel(CIGANO)', genreLabel('CIGANO') === 'Leitura de Cigano');
check('genreLabel(CANDOMBLE)', genreLabel('CANDOMBLE') === 'Gira de Candomblé');
check('renderSacredTermsList empty', renderSacredTermsList([]) === 'termos sagrados');
check('renderSacredTermsList single', renderSacredTermsList(['orixá']) === 'orixá');
check('renderSacredTermsList multi', renderSacredTermsList(['axé', 'ogum']) === 'axé, ogum');

// === 4. Constants ===
console.log('\n[4] Constants');
check('MIN_TOUCH_TARGET_PX = 44', MIN_TOUCH_TARGET_PX === 44);
check('MAX_CHAT_LEN = 280', MAX_CHAT_LEN === 280);
check('CHAT_PAGE_SIZE = 30', CHAT_PAGE_SIZE === 30);

// === 5. State machine reducer (smoke subset) ===
console.log('\n[5] Reducer (smoke subset)');
_resetLivestreamForTests();
const s0 = initMachineState(false);
const s1 = reduceStreamPlayer(s0, { type: 'STREAM_STATE', payload: 'LIVE' });
check('STREAM_STATE → LIVE', s1.streamState === 'LIVE');
const s2 = reduceStreamPlayer(s1, { type: 'TOGGLE_PLAY' });
check('TOGGLE_PLAY unpauses', s2.paused === false);
const s3 = reduceStreamPlayer(s2, { type: 'DRAFT', payload: 'olá' });
check('DRAFT updates text', s3.draft === 'olá');
const s4 = reduceStreamPlayer(s3, { type: 'CONSENT_APPROVED' });
check('CONSENT_APPROVED true', s4.audioConsentApproved === true);
const s5 = reduceStreamPlayer(s4, { type: 'CONSENT_REVOKED' });
check('CONSENT_REVOKED false', s5.audioConsentApproved === false);
check('CONSENT_REVOKED forces muted', s5.muted === true);

// === 6. canUnmuteAudio ===
console.log('\n[6] canUnmuteAudio gate');
const approvedState = initMachineState(true);
const tantraSacred: SacredContentFlag = {
  streamKind: 'TANTRA',
  containsSacredTerms: true,
  detectedTerms: Object.freeze(['chakra']),
  requiresAudioConsent: true,
};
const candombleSacred: SacredContentFlag = {
  streamKind: 'CANDOMBLE',
  containsSacredTerms: true,
  detectedTerms: Object.freeze(['axé']),
  requiresAudioConsent: true,
};
const noSacred: SacredContentFlag = {
  streamKind: 'CIGANO',
  containsSacredTerms: false,
  detectedTerms: Object.freeze([]),
  requiresAudioConsent: false,
};
check('noSacred allows unmute', canUnmuteAudio(s0, noSacred) === true);
check('tantraSacred blocks without consent', canUnmuteAudio(s0, tantraSacred) === false);
check('tantraSacred allows with consent', canUnmuteAudio(approvedState, tantraSacred) === true);
check('candombleSacred allows with consent', canUnmuteAudio(approvedState, candombleSacred) === true);

// === 7. summarizeChatState ===
console.log('\n[7] summarizeChatState');
const msgs: ChatMessage[] = [
  { id: makeChatId(`ch_sm_${__sentinel.incChat()}_a`), authorHandle: 'a', body: 'a', createdAt: Date.now(), state: 'SENT' },
  { id: makeChatId(`ch_sm_${__sentinel.incChat()}_b`), authorHandle: 'b', body: 'b', createdAt: Date.now(), state: 'PENDING' },
];
const sum = summarizeChatState(msgs);
check('sent = 1', sum.sent === 1);
check('pending = 1', sum.pending === 1);
check('failed = 0', sum.failed === 0);
check('moderated = 0', sum.moderated === 0);

// === 8. isChatSubmitDisabled ===
console.log('\n[8] isChatSubmitDisabled');
check('empty disabled', isChatSubmitDisabled('', 'LIVE') === true);
check('whitespace disabled', isChatSubmitDisabled('   ', 'LIVE') === true);
check('live enabled', isChatSubmitDisabled('olá', 'LIVE') === false);
check('ENDED disabled', isChatSubmitDisabled('olá', 'ENDED') === true);
check('ERROR disabled', isChatSubmitDisabled('olá', 'ERROR') === true);

// === 9. Engine session + LGPD flow ===
console.log('\n[9] Engine session + LGPD');
_resetLivestreamForTests();
const v = makeViewerId('vw_smoke_user');
check('consent default false', isAudioConsentApproved(v) === false);
approveAudioConsent(v);
check('consent after approve', isAudioConsentApproved(v) === true);
revokeAudioConsent(v);
check('consent after revoke', isAudioConsentApproved(v) === false);

// Build channel for each tradition
for (const k of kinds) {
  const ch: StreamChannel = {
    id: makeStreamId(`ls_sm_${__sentinel.incStream()}`),
    title: `Canal de ${k}`,
    kind: k,
    presenterHandle: `p_${k.toLowerCase()}`,
    presenterTradition: TRADITION_KIND_LABELS[k]!,
    startsAt: Date.now(),
    hlsUrl: 'https://example.com/stream.m3u8',
    descriptionPtBr: 'Canal aberto',
  };
  const sess = createLivestreamSession(ch);
  check(`${k}: session created`, typeof sess.getState() === 'string');
}

// === Final ===
console.log('\n[===========================]');
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);

if (failed > 0) process.exit(1);
else process.exit(0);
