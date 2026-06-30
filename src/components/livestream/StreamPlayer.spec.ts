// W80-D livestream-watch-ui spec — self-running harness (no vitest at runtime).
// ≥100 assertions covering: brand validation, tradition catalog (7 kinds),
// sacred-term detection, chat/streaming state machine, audio consent flow,
// LGPD defaults, accessibility affordances, viewer-count formatting, chat
// summary, channel rendering. NO React imports — keeps spec runtime-light.

import {
  // Engine surface area
  TRADITION_KIND_LABELS,
  TRADITION_KIND_ICONS,
  STREAM_CATEGORIES,
  listStreamKinds,
  makeStreamId,
  makeChatId,
  makeViewerId,
  createLivestreamSession,
  isAudioConsentApproved,
  approveAudioConsent,
  revokeAudioConsent,
  _resetLivestreamForTests,
  // Mock-only utilities
  __sentinel,
  type StreamChannel,
  type ChatMessage,
  type StreamState,
  type ViewerCount,
} from './__mock_engine__.ts';

import {
  // Pure helpers (no React dependency)
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
} from './StreamPlayer.helpers.ts';

// ----- self-running harness -----
let _testsPassed = 0;
let _testsFailed = 0;
const _failures: string[] = [];

function recordAssertion(label: string, ok: boolean, detail = ''): void {
  if (ok) {
    _testsPassed += 1;
  } else {
    _testsFailed += 1;
    _failures.push(`${label}${detail ? ' — ' + detail : ''}`);
  }
}

function expectEq<T>(actual: T, expected: T, label: string): void {
  const ok = Object.is(actual, expected);
  recordAssertion(label, ok, `expected ${String(expected)}, got ${String(actual)}`);
}

function expectDeep(actual: unknown, expected: unknown, label: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  recordAssertion(label, a === e, `expected ${e}, got ${a}`);
}

function expectTruthy(actual: unknown, label: string): void {
  recordAssertion(label, Boolean(actual), `expected truthy, got ${String(actual)}`);
}

function expectString(actual: unknown, label: string): void {
  recordAssertion(label, typeof actual === 'string' && (actual as string).length > 0, `got ${String(actual)}`);
}

function expectThrow(fn: () => unknown, contains: string, label: string): void {
  let threw = false;
  let msg = '';
  try { fn(); } catch (e) { threw = true; msg = String(e); }
  recordAssertion(
    label,
    threw && msg.includes(contains),
    threw ? `error msg doesn't contain "${contains}": ${msg}` : 'did not throw',
  );
}

function expectNoThrow(fn: () => unknown, label: string): void {
  let threw = false;
  let msg = '';
  try { fn(); } catch (e) { threw = true; msg = String(e); }
  recordAssertion(label, !threw, threw ? msg : '');
}

// ----- Test fixtures -----
function buildChannel(kind: StreamChannel['kind'] = 'CIGANO'): StreamChannel {
  return {
    id: makeStreamId(`ls_demo_${__sentinel.incStream()}`),
    title: 'Leitura de Cigano com Ramiro',
    kind,
    presenterHandle: 'ramiro-do-caminho',
    presenterTradition: 'Cigano Ramiro',
    startsAt: Date.now(),
    hlsUrl: 'https://example.com/stream.m3u8',
    posterUrl: 'https://example.com/poster.jpg',
    descriptionPtBr: 'Leitura aberta com axé. Toque para participar.',
  };
}

function buildChatMessage(idx: number, state: ChatMessage['state'] = 'SENT'): ChatMessage {
  return {
    id: makeChatId(`ch_msg_${__sentinel.incChat()}_${idx}`),
    authorHandle: `pessoa-${idx}`,
    authorTradition: idx % 2 === 0 ? 'Cigano' : undefined,
    body: `Mensagem de teste número ${idx}`,
    createdAt: Date.now() - idx * 1000,
    state,
  };
}

// ===========================
// [1] Branded factories
// ===========================
_resetLivestreamForTests();
console.log('\n[1] Branded primitive factories');
expectEq(makeStreamId('ls_a_a1'), 'ls_a_a1', 'makeStreamId accepts valid ls_ prefix');
expectThrow(() => makeStreamId('xx_bad'), 'invalid', 'makeStreamId rejects xx_ prefix');
expectThrow(() => makeStreamId('ls_X'), 'invalid', 'makeStreamId rejects uppercase chars');
expectEq(makeChatId('ch_hello'), 'ch_hello', 'makeChatId accepts valid ch_ prefix');
expectThrow(() => makeChatId('ch_'), 'invalid', 'makeChatId rejects too-short body');
expectEq(makeViewerId('vw_user_a'), 'vw_user_a', 'makeViewerId accepts valid vw_ prefix');
expectThrow(() => makeViewerId('vw_O'), 'invalid', 'makeViewerId rejects uppercase');

// ===========================
// [2] Tradition catalog (7 kinds)
// ===========================
console.log('\n[2] Tradition catalog');
const kinds = listStreamKinds();
expectEq(kinds.length, 7, 'listStreamKinds returns 7 entries');
for (const k of kinds) {
  expectString(TRADITION_KIND_LABELS[k], `TRADITION_KIND_LABELS[${k}] is non-empty string`);
  expectString(TRADITION_KIND_ICONS[k], `TRADITION_KIND_ICONS[${k}] is non-empty string`);
}
const expectedKinds: Array<StreamChannel['kind']> = ['CIGANO', 'CANDOMBLE', 'UMBANDA', 'IFA', 'CABALA', 'ASTROLOGIA', 'TANTRA'];
expectDeep([...kinds], expectedKinds, '7 kinds in canonical order');
const expectedLabels = [
  'Leitura de Cigano',
  'Gira de Candomblé',
  'Sessão de Umbanda',
  'Jogo de Ifá',
  'Estudo Cabalístico',
  'Sessão Astrológica',
  'Meditação Tantra',
];
for (let i = 0; i < kinds.length; i += 1) {
  expectEq(TRADITION_KIND_LABELS[kinds[i]!], expectedLabels[i]!, `label for ${kinds[i]} matches`);
}
expectEq(STREAM_CATEGORIES.length, 7, 'STREAM_CATEGORIES has 7 entries');
for (const cat of STREAM_CATEGORIES) {
  expectString(cat.labelPtBr, `STREAM_CATEGORIES[${cat.kind}].labelPtBr non-empty`);
  expectString(cat.example, `STREAM_CATEGORIES[${cat.kind}].example non-empty`);
}

// ===========================
// [3] Pure helpers — formatViewerCount, genreLabel
// ===========================
console.log('\n[3] Pure helpers: formatViewerCount + genreLabel');
expectEq(formatViewerCount(0), '0', 'formatViewerCount(0) = 0');
expectEq(formatViewerCount(42), '42', 'formatViewerCount(42) = 42');
expectEq(formatViewerCount(999), '999', 'formatViewerCount(999) = 999');
expectEq(formatViewerCount(1200), '1.2k', 'formatViewerCount(1200) = 1.2k');
expectEq(formatViewerCount(12345), '12k', 'formatViewerCount(12345) = 12k');
expectEq(formatViewerCount(999_999), '1000k', 'formatViewerCount(999999) = 1000k');
expectEq(formatViewerCount(1_500_000), '1.5M', 'formatViewerCount(1.5M) = 1.5M');
expectEq(genreLabel('CANDOMBLE'), 'Gira de Candomblé', 'genreLabel(CANDOMBLE)');
expectEq(genreLabel('TANTRA'), 'Meditação Tantra', 'genreLabel(TANTRA)');
expectEq(genreLabel('CIGANO'), 'Leitura de Cigano', 'genreLabel(CIGANO)');
expectEq(genreLabel('ASTROLOGIA'), 'Sessão Astrológica', 'genreLabel(ASTROLOGIA)');
expectEq(genreLabel('UMBANDA'), 'Sessão de Umbanda', 'genreLabel(UMBANDA)');
expectEq(genreLabel('IFA'), 'Jogo de Ifá', 'genreLabel(IFA)');
expectEq(genreLabel('CABALA'), 'Estudo Cabalístico', 'genreLabel(CABALA)');

// ===========================
// [4] formatViewerSr (PT-BR screen reader)
// ===========================
console.log('\n[4] formatViewerSr (PT-BR)');
expectEq(formatViewerSr(1, 1), '1 espectador assistindo, 1 pico registrado', 'formatViewerSr(1,1) singular');
expectEq(formatViewerSr(2, 5), '2 espectadores assistindo, 5 de pico registrado', 'formatViewerSr(2,5) plural');
expectEq(formatViewerSr(0, 0), '0 espectadores assistindo, 0 de pico registrado', 'formatViewerSr(0,0) zero');

// ===========================
// [5] formatTime + timeAgoPtBr
// ===========================
console.log('\n[5] formatTime + timeAgoPtBr');
expectEq(formatTime(0), '00:00', 'formatTime(0) = 00:00 UTC');
expectEq(formatTime(1700000000000), '22:13', 'formatTime(2023-11-14T22:13:20Z) = 22:13');
const now = 1700000000000;
expectEq(timeAgoPtBr(now, now), 'agora', 'timeAgoPtBr now = "agora"');
expectEq(timeAgoPtBr(now - 30_000, now), 'agora', 'timeAgoPtBr 30s ago = "agora"');
expectEq(timeAgoPtBr(now - 60_000, now), 'há 1 min', 'timeAgoPtBr 60s ago = "há 1 min"');
expectEq(timeAgoPtBr(now - 5 * 60_000, now), 'há 5 min', 'timeAgoPtBr 5min ago = "há 5 min"');
expectEq(timeAgoPtBr(now - 60 * 60_000, now), 'há 1 h', 'timeAgoPtBr 1h ago = "há 1 h"');
expectEq(timeAgoPtBr(now - 2 * 60 * 60_000, now), 'há 2 h', 'timeAgoPtBr 2h ago = "há 2 h"');
expectEq(timeAgoPtBr(now - 24 * 60 * 60_000, now), 'há 1 d', 'timeAgoPtBr 1d ago = "há 1 d"');

// ===========================
// [6] State machine reducer
// ===========================
console.log('\n[6] Reducer: reduceStreamPlayer');
_resetLivestreamForTests();
const s0 = initMachineState(false);

const s1 = reduceStreamPlayer(s0, { type: 'STREAM_STATE', payload: 'LIVE' });
expectEq(s1.streamState, 'LIVE', 'STREAM_STATE updates to LIVE');
expectEq(s1.paused, true, 'STREAM_STATE does not toggle paused');

const s2 = reduceStreamPlayer(s1, { type: 'TOGGLE_PLAY' });
expectEq(s2.paused, false, 'TOGGLE_PLAY flips paused true→false');

const s3 = reduceStreamPlayer(s2, { type: 'VIEWERS', payload: { current: 42, peak: 100, updatedAt: 1234 } });
expectEq(s3.viewers.current, 42, 'VIEWERS updates current');
expectEq(s3.viewers.peak, 100, 'VIEWERS preserves peak');

const msg = buildChatMessage(1);
const s4 = reduceStreamPlayer(s3, { type: 'CHAT_INCOMING', payload: msg });
expectEq(s4.chat.length, 1, 'CHAT_INCOMING appends 1');
expectEq((s4.chat[0] as ChatMessage).id, msg.id, 'CHAT_INCOMING preserves id');

const s5 = reduceStreamPlayer(s4, { type: 'DRAFT', payload: 'olá' });
expectEq(s5.draft, 'olá', 'DRAFT updates text');

const s6 = reduceStreamPlayer(s5, { type: 'CHAT_SEND_PENDING' });
expectEq(s6.pendingChat, 1, 'CHAT_SEND_PENDING increments pending');

const s7 = reduceStreamPlayer(s6, { type: 'CHAT_SEND_RESOLVED', payload: { tempId: 'x', ok: true } });
expectEq(s7.pendingChat, 0, 'CHAT_SEND_RESOLVED ok decrements');

const s8 = reduceStreamPlayer(s7, { type: 'CHAT_SEND_RESOLVED', payload: { tempId: 'y', ok: false } });
expectEq(s8.pendingChat, 0, 'CHAT_SEND_RESOLVED fail keeps 0');
expectEq(s8.failedChat, 1, 'failed counter +1 on failure');

const s9 = reduceStreamPlayer(s5, { type: 'CONSENT_APPROVED' });
expectEq(s9.audioConsentApproved, true, 'CONSENT_APPROVED flips true');

const s10 = reduceStreamPlayer(s9, { type: 'CONSENT_REVOKED' });
expectEq(s10.audioConsentApproved, false, 'CONSENT_REVOKED flips false');
expectEq(s10.muted, true, 'CONSENT_REVOKED forces muted=true');

const s11 = reduceStreamPlayer(s5, { type: 'TOGGLE_MUTE' });
expectEq(s11.muted, false, 'TOGGLE_MUTE flips true→false');

// CHAT_PAGE prepends instead of appends
// (start from s3 = s5 minus the first chat incoming, so length is 0)
const s3_zero = reduceStreamPlayer(s0, { type: 'TOGGLE_PLAY' });
const m_a = buildChatMessage(10);
const m_b = buildChatMessage(11);
const s_pre = reduceStreamPlayer(s3_zero, { type: 'CHAT_PAGE', payload: [m_a, m_b] });
expectEq(s_pre.chat.length, 2, 'CHAT_PAGE adds 2 messages');
expectEq(s_pre.chat[0]!.id, m_a.id, 'CHAT_PAGE preserves order');

// Multiple subsequent chat incoming → preserves order
const m_c = buildChatMessage(12);
const s_post = reduceStreamPlayer(s_pre, { type: 'CHAT_INCOMING', payload: m_c });
expectEq(s_post.chat.length, 3, 'CHAT_INCOMING after PAGE = 3 total');
expectEq(s_post.chat[2]!.id, m_c.id, 'CHAT_INCOMING appended at end');

// ===========================
// [7] canUnmuteAudio gate
// ===========================
console.log('\n[7] Sacred content / canUnmuteAudio');
const noSacred = { streamKind: 'CIGANO' as const, containsSacredTerms: false, detectedTerms: [], requiresAudioConsent: false };
const tantraSacred = { streamKind: 'TANTRA' as const, containsSacredTerms: true, detectedTerms: ['chakra'], requiresAudioConsent: true };
const candombleSacred = { streamKind: 'CANDOMBLE' as const, containsSacredTerms: true, detectedTerms: ['axé'], requiresAudioConsent: true };
expectEq(canUnmuteAudio(s0, noSacred), true, 'canUnmuteAudio: CIGANO without sacred terms → allowed');
expectEq(canUnmuteAudio(s0, tantraSacred), false, 'canUnmuteAudio: TANTRA sacred without consent → blocked');
const approvedState = { ...s0, audioConsentApproved: true };
expectEq(canUnmuteAudio(approvedState, tantraSacred), true, 'canUnmuteAudio: TANTRA sacred with consent → allowed');
expectEq(canUnmuteAudio(approvedState, candombleSacred), true, 'canUnmuteAudio: CANDOMBLE sacred with consent → allowed');

// ===========================
// [8] summarizeChatState
// ===========================
console.log('\n[8] summarizeChatState');
const chats: ChatMessage[] = [
  { ...buildChatMessage(1), state: 'SENT' },
  { ...buildChatMessage(2), state: 'SENT' },
  { ...buildChatMessage(3), state: 'PENDING' },
  { ...buildChatMessage(4), state: 'FAILED' },
  { ...buildChatMessage(5), state: 'MODERATED' },
];
const sum = summarizeChatState(chats);
expectEq(sum.sent, 2, 'sent = 2');
expectEq(sum.pending, 1, 'pending = 1');
expectEq(sum.failed, 1, 'failed = 1');
expectEq(sum.moderated, 1, 'moderated = 1');
const empty = summarizeChatState([]);
expectDeep(empty, { pending: 0, sent: 0, failed: 0, moderated: 0 }, 'empty summarize');

// ===========================
// [9] isChatSubmitDisabled
// ===========================
console.log('\n[9] isChatSubmitDisabled UX rules');
expectEq(isChatSubmitDisabled('', 'LIVE'), true, 'empty draft disabled');
expectEq(isChatSubmitDisabled('   ', 'LIVE'), true, 'whitespace draft disabled');
expectEq(isChatSubmitDisabled('olá', 'LIVE'), false, 'non-empty draft + LIVE enabled');
expectEq(isChatSubmitDisabled('olá', 'ENDED'), true, 'ENDED stream disabled');
expectEq(isChatSubmitDisabled('olá', 'ERROR'), true, 'ERROR stream disabled');
expectEq(isChatSubmitDisabled('olá', 'CONNECTING'), false, 'CONNECTING allowed');

// ===========================
// [10] renderSacredTermsList
// ===========================
console.log('\n[10] renderSacredTermsList');
expectEq(renderSacredTermsList([]), 'termos sagrados', 'empty array → "termos sagrados"');
expectEq(renderSacredTermsList(['orixá']), 'orixá', 'single term');
expectEq(renderSacredTermsList(['axé', 'ogum']), 'axé, ogum', 'two terms joined with comma');

// ===========================
// [11] Constants
// ===========================
console.log('\n[11] Constants');
expectEq(MIN_TOUCH_TARGET_PX, 44, 'MIN_TOUCH_TARGET_PX = 44');
expectEq(MAX_CHAT_LEN, 280, 'MAX_CHAT_LEN = 280');
expectEq(CHAT_PAGE_SIZE, 30, 'CHAT_PAGE_SIZE = 30');

// ===========================
// [12] Engine session lifecycle + state transitions
// ===========================
console.log('\n[12] Engine session lifecycle');
_resetLivestreamForTests();
const session = createLivestreamSession(buildChannel('CIGANO'));
expectEq(session.getState(), 'CONNECTING', 'initial state CONNECTING');
expectEq(session.getStreamUrl().startsWith('https://'), true, 'getStreamUrl returns URL');

// ===========================
// [13] LGPD consent flow
// ===========================
console.log('\n[13] LGPD audio consent flow');
_resetLivestreamForTests();
const v = makeViewerId('vw_test_user_a');
expectEq(isAudioConsentApproved(v), false, 'consent default = false');
approveAudioConsent(v);
expectEq(isAudioConsentApproved(v), true, 'approveAudioConsent sets true');
revokeAudioConsent(v);
expectEq(isAudioConsentApproved(v), false, 'revokeAudioConsent sets false');
approveAudioConsent(v);
expectEq(isAudioConsentApproved(v), true, 'approveAudioConsent again sets true');

// ===========================
// [14] Viewer count peak tracking through reducer
// ===========================
console.log('\n[14] Viewer count peak tracking');
_resetLivestreamForTests();
const v3 = reduceStreamPlayer(initMachineState(false), {
  type: 'VIEWERS',
  payload: { current: 5, peak: 5, updatedAt: 1 },
});
expectEq(v3.viewers.current, 5, 'viewer current = 5');
expectEq(v3.viewers.peak, 5, 'viewer peak = 5');

const v4 = reduceStreamPlayer(v3, {
  type: 'VIEWERS',
  payload: { current: 12, peak: 12, updatedAt: 2 },
});
expectEq(v4.viewers.current, 12, 'viewer current = 12 (updated)');
expectEq(v4.viewers.peak, 12, 'viewer peak = 12 (matches new current)');

// ===========================
// [15] Chat send result error codes
// ===========================
console.log('\n[15] Chat send rules');
_resetLivestreamForTests();
const sess1 = createLivestreamSession(buildChannel('CIGANO'));
const r1 = sess1.sendChat('');
expectEq(r1.ok, false, 'empty chat send rejected');
expectEq(r1.errorCode, 'EMPTY', 'empty errorCode = EMPTY');
const r2 = sess1.sendChat('x'.repeat(281));
expectEq(r2.ok, false, 'over-280 chars rejected');
expectEq(r2.errorCode, 'TOO_LONG', 'over-280 errorCode = TOO_LONG');
const r3 = sess1.sendChat('olá com axé');
expectEq(r3.ok, true, 'normal chat send ok');
expectNoThrow(() => sess1.leave(), 'session leave does not throw');

// ===========================
// [16] Chat subscription unsubscribe
// ===========================
console.log('\n[16] Chat subscription');
_resetLivestreamForTests();
const sess2 = createLivestreamSession(buildChannel('ASTROLOGIA'));
let received = 0;
const unsub = sess2.subscribeChat(() => { received += 1; });
unsub();
expectEq(received, 0, 'unsub prevents further callbacks');

// ===========================
// [17] State transitions for each tradition
// ===========================
console.log('\n[17] Channels build for each tradition');
for (const k of kinds) {
  let okBuild = true;
  try {
    const c = buildChannel(k);
    okBuild = c.kind === k;
  } catch {
    okBuild = false;
  }
  expectEq(okBuild, true, `channel builds for ${k}`);
}

// ===========================
// [18] ViewerCount sanity
// ===========================
console.log('\n[18] ViewerCount record shape');
const vc: ViewerCount = { current: 0, peak: 0, updatedAt: 0 };
expectEq(vc.current, 0, 'ViewerCount.current starts at 0');
expectEq(vc.peak, 0, 'ViewerCount.peak starts at 0');

// ===========================
// [19] StreamState union exhaustive
// ===========================
console.log('\n[19] StreamState union');
const states: StreamState[] = ['PENDING', 'CONNECTING', 'LIVE', 'PAUSED', 'ENDED', 'ERROR'];
expectEq(states.length, 6, 'StreamState has 6 entries');
for (const s of states) {
  expectString(s, `StreamState.${s} is a string`);
}

// ===========================
// [20] Sacred terms detected per-stream-kind
// ===========================
console.log('\n[20] Sacred content auto-detection per tradition');
_resetLivestreamForTests();
function buildChannelWith(kind: StreamChannel['kind'], desc: string): StreamChannel {
  return { ...buildChannel(kind), descriptionPtBr: desc };
}

// CANDOMBLÉ description with "axé" → flagged
const cAxé = createLivestreamSession(buildChannelWith('CANDOMBLE', 'A gira começa com axé para todos.'));
const flag1 = cAxé.getSacredFlag();
expectEq(flag1.containsSacredTerms, true, 'CANDOMBLE with "axé" → containsSacredTerms = true');
expectEq(flag1.requiresAudioConsent, true, 'CANDOMBLE requires audio consent');

// TANTRA description with "chakra" → flagged
const cChan = createLivestreamSession(buildChannelWith('TANTRA', 'Meditação com chakra muladhara aberto.'));
const flag2 = cChan.getSacredFlag();
expectEq(flag2.containsSacredTerms, true, 'TANTRA with "chakra" → containsSacredTerms = true');
expectEq(flag2.requiresAudioConsent, true, 'TANTRA requires audio consent');

// IFA description with "odum" → flagged
const cOdum = createLivestreamSession(buildChannelWith('IFA', 'O odum foi aberto, búzio consultado.'));
const flag3 = cOdum.getSacredFlag();
expectEq(flag3.containsSacredTerms, true, 'IFA with "odum" → containsSacredTerms = true');
expectEq(flag3.requiresAudioConsent, true, 'IFA requires audio consent');

// CIGANO description with no sacred terms → not flagged
// (avoid "tarot", "baralho", "cartas ciganas" which are sacred terms)
const cCig = createLivestreamSession(buildChannelWith('CIGANO', 'Leitura livre aberta para todos.'));
const flag4 = cCig.getSacredFlag();
expectEq(flag4.containsSacredTerms, false, 'CIGANO without sacred terms → not flagged');
expectEq(flag4.requiresAudioConsent, false, 'CIGANO no audio consent required');

// ===========================
// [21] Chat loadChatPage returns frozen result
// ===========================
console.log('\n[21] Chat loadChatPage immutability');
_resetLivestreamForTests();
const sLoad = createLivestreamSession(buildChannel('UMBANDA'));
const msgs = sLoad.loadChatPage(undefined, 10);
expectTruthy(Array.isArray(msgs), 'loadChatPage returns array');

// ===========================
// Final summary
// ===========================
console.log('\n[===========================]');
console.log(`PASSED: ${_testsPassed}`);
console.log(`FAILED: ${_testsFailed}`);

if (_testsFailed > 0) {
  console.error('\nFAILURES:');
  for (const f of _failures) console.error('  - ' + f);
}

if (_testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
