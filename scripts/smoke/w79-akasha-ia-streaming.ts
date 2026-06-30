// W79 akasha-ia-streaming smoke — fast happy-path exercise of the public API.
// Self-running synchronous harness.

import {
  STREAM_STATES, isStreamState,
  makeRequestId, makeStreamError,
  canTransition, assertTransition, LEGAL_TRANSITIONS,
  parseSSEBlocks, tokenizeChunk, sanitizeToken, isValidUtf8,
  defaultParser, jsonlParser, rawParser,
  makeStreamEngine, mockSSEStream, mockSSEResponse,
  backoffDelay, sleep,
  describeState, snapshotEngine, isTerminal,
  formatForTypewriter, approxTokenCount,
  telemetryDiff,
  NO_RETRY, DEFAULT_RETRY,
  _resetTokenCounterForTests,
  type StreamState, type MockEventSourceMessage,
} from '../../src/lib/w79/akasha-ia-streaming.ts';

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

// === 1. State taxonomy ===
console.log('\n[1] State taxonomy');
_resetTokenCounterForTests();
check('6 states', STREAM_STATES.length === 6);
check('IDLE first', STREAM_STATES[0] === 'IDLE');
check('ABORTED last', STREAM_STATES[5] === 'ABORTED');
check('isStreamState(IDLE)', isStreamState('IDLE'));
check('!isStreamState(bogus)', !isStreamState('bogus'));

// === 2. Branded factories ===
console.log('\n[2] Branded factories');
expectThrow('makeRequestId rejects "bad"', () => makeRequestId('bad'), 'invalid RequestId');
expectThrow('makeStreamError rejects "x"', () => makeStreamError('x'), 'invalid StreamError message');
check('makeRequestId valid', !!makeRequestId('req_smoke_0001'));

// === 3. State transitions ===
console.log('\n[3] State transitions');
check('IDLE→CONNECTING legal', canTransition('IDLE', 'CONNECTING'));
check('CONNECTING→STREAMING legal', canTransition('CONNECTING', 'STREAMING'));
check('CONNECTING→ABORTED legal', canTransition('CONNECTING', 'ABORTED'));
check('STREAMING→COMPLETE legal', canTransition('STREAMING', 'COMPLETE'));
check('STREAMING→ERROR legal', canTransition('STREAMING', 'ERROR'));
check('STREAMING→ABORTED legal', canTransition('STREAMING', 'ABORTED'));
check('COMPLETE→STREAMING illegal', !canTransition('COMPLETE', 'STREAMING'));
check('ERROR→STREAMING illegal', !canTransition('ERROR', 'STREAMING'));
check('ABORTED→CONNECTING illegal', !canTransition('ABORTED', 'CONNECTING'));
expectThrow('assertTransition illegal throws', () => assertTransition('COMPLETE', 'STREAMING'), 'Illegal');
check('COMPLETE is terminal', (LEGAL_TRANSITIONS.get('COMPLETE') ?? []).length === 0);

// === 4. SSE parsing ===
console.log('\n[4] SSE parsing');
const blocks = parseSSEBlocks('data: hello\n\ndata: world\n\n');
check('SSE blocks count = 2', blocks.length === 2);
check('SSE blocks[0].data = "hello"', blocks[0]?.data === 'hello');
const doneBlock = parseSSEBlocks('data: [DONE]\n\n');
check('[DONE] is isFinal', doneBlock[0]?.isFinal === true);
const evented = parseSSEBlocks('event: token\ndata: hi\n\n');
check('event name extracted', evented[0]?.eventName === 'token');

// === 5. tokenizeChunk ===
console.log('\n[5] tokenizeChunk');
check('JSON token', tokenizeChunk('{"token":"x"}')[0] === 'x');
check('JSON text', tokenizeChunk('{"text":"y"}')[0] === 'y');
check('OpenAI delta.content', tokenizeChunk('{"choices":[{"delta":{"content":"z"}}]}')[0] === 'z');
check('JSON array', tokenizeChunk('["a","b"]').length === 2);
check('raw text', tokenizeChunk('plain')[0] === 'plain');
check('empty input', tokenizeChunk('').length === 0);

// === 6. sanitizeToken + isValidUtf8 ===
console.log('\n[6] sanitizeToken + isValidUtf8');
check('strips control', sanitizeToken('a\u0000b') === 'ab');
check('preserves newline', sanitizeToken('a\nb') === 'a\nb');
check('utf8 ASCII', isValidUtf8('hello'));
check('utf8 emoji', isValidUtf8('🌟'));
check('utf8 reject unpaired high', !isValidUtf8('a\uD800b'));

// === 7. Parsers ===
console.log('\n[7] Parsers');
const dP = defaultParser('data: {"token":"a"}\n\ndata: {"token":"b"}\n\ndata: [DONE]\n\n');
check('defaultParser 2 tokens', dP.length === 2);
const jP = jsonlParser('{"text":"a"}\n{"text":"b"}');
check('jsonlParser 2 tokens', jP.length === 2);
const rP = rawParser('full');
check('rawParser 1 token', rP.length === 1 && rP[0] === 'full');

// === 8. backoffDelay ===
console.log('\n[8] backoffDelay');
check('attempt 0 ~200ms', backoffDelay(0, DEFAULT_RETRY) >= 200 && backoffDelay(0, DEFAULT_RETRY) <= 250);
check('attempt 1 ~400ms', backoffDelay(1, DEFAULT_RETRY) >= 400 && backoffDelay(1, DEFAULT_RETRY) <= 500);
check('attempt 10 -> -1', backoffDelay(10, DEFAULT_RETRY) === -1);
check('NO_RETRY -> -1', backoffDelay(0, NO_RETRY) === -1);
check('attempt -1 -> 0', backoffDelay(-1, DEFAULT_RETRY) === 0);

// === 9. describeState + isTerminal + formatters ===
console.log('\n[9] describeState + isTerminal + formatters');
check('describeState IDLE Portuguese', describeState('IDLE').includes('Pronto'));
check('describeState COMPLETE Portuguese', describeState('COMPLETE') === 'Concluído');
check('isTerminal COMPLETE', isTerminal('COMPLETE'));
check('isTerminal STREAMING false', !isTerminal('STREAMING'));
check('formatForTypewriter truncates', formatForTypewriter('a'.repeat(500), 100).length <= 101);
check('approxTokenCount words', approxTokenCount('a b c d') === 4);

// === 10. makeStreamEngine ===
console.log('\n[10] makeStreamEngine');
const e0 = makeStreamEngine(makeRequestId('req_smoke_e0_1'));
check('initial IDLE', e0.state === 'IDLE');
check('initial empty tokens', e0.tokens.length === 0);
check('initial empty accumulated', e0.accumulated === '');
check('initial null error', e0.errorMessage === null);
check('initial null abortReason', e0.abortReason === null);
check('subscribe returns function', typeof e0.subscribe(() => {}) === 'function');
check('abort in IDLE is no-op', (() => { try { e0.abort('user'); return true; } catch { return false; } })());
const snap = snapshotEngine(e0);
check('snapshot state IDLE', snap.state === 'IDLE');
check('snapshot durationMs null', snap.durationMs === null);

// === 11. Mock SSE ===
console.log('\n[11] Mock SSE');
const r1 = mockSSEResponse([{ data: 'x' }]);
check('mockSSEResponse content-type SSE', (r1.headers.get('content-type') ?? '').includes('text/event-stream'));
check('mockSSEResponse default 200', r1.status === 200);
const r2 = mockSSEResponse([], { status: 201 });
check('mockSSEResponse custom 201', r2.status === 201);

// === 12. Engine integration (sync smoke — no real fetch) ===
console.log('\n[12] Engine integration (no real fetch)');
const e1 = makeStreamEngine(makeRequestId('req_smoke_e1_1'));
let aborted = false;
e1.subscribe((ev) => { if (ev.kind === 'abort') aborted = true; });
// Simulate abort without starting — should be no-op in IDLE
e1.abort('user');
check('abort in IDLE safe', e1.state === 'IDLE');

// === 13. telemetryDiff ===
console.log('\n[13] telemetryDiff');
const beforeT = {
  totalTokens: 0, totalEvents: 0, totalStateTransitions: 0,
  totalErrors: 0, totalAborts: 0, totalRetries: 0, totalBytesParsed: 0,
  durationMs: null,
  stateDistribution: { IDLE: 1, CONNECTING: 0, STREAMING: 0, COMPLETE: 0, ERROR: 0, ABORTED: 0 } as Record<StreamState, number>,
  parserHits: { sse: 0, jsonl: 0, raw: 0, mock: 0 },
};
const afterT = { ...beforeT, totalTokens: 3, totalEvents: 4 };
const d = telemetryDiff(beforeT, afterT);
check('diff.totalTokens', d.totalTokens === 3);
check('diff.totalEvents', d.totalEvents === 4);

// === 14. reset() ===
console.log('\n[14] reset()');
const e2 = makeStreamEngine(makeRequestId('req_smoke_e2_1'));
e2.reset();
check('reset state IDLE', e2.state === 'IDLE');
check('reset tokens empty', e2.tokens.length === 0);
check('reset accumulated empty', e2.accumulated === '');

// === 15. sleep ===
console.log('\n[15] sleep');
const t0 = Date.now();
await sleep(20);
const dt = Date.now() - t0;
check('sleep waited ~20ms', dt >= 18 && dt <= 100, `got ${dt}ms`);

// === 16. Engine with mock fetch (async-via-await — since Node 22 supports top-level await) ===
console.log('\n[16] Engine with mock fetch');
{
  const messages: MockEventSourceMessage[] = [
    { data: '{"token":"Olá"}' },
    { data: '{"token":"!"}' },
    { data: '[DONE]' },
  ];
  const response = mockSSEResponse(messages);
  const fetchImpl = (async (_url: string, _init?: unknown) => response) as unknown as typeof fetch;
  const e = makeStreamEngine(makeRequestId('req_smoke_e_mf_1'), { fetchImpl });
  const states: StreamState[] = [];
  e.subscribe((ev) => { if (ev.kind === 'state') states.push(ev.state); });
  await e.start({ url: 'http://test/stream' });
  check('states include CONNECTING', states.includes('CONNECTING'));
  check('states include STREAMING', states.includes('STREAMING'));
  check('states include COMPLETE', states.includes('COMPLETE'));
  check('final state COMPLETE', e.state === 'COMPLETE');
  check('2 tokens received', e.tokens.length === 2);
  check('accumulated "Olá!"', e.accumulated === 'Olá!');
}

// === 17. Engine HTTP error ===
console.log('\n[17] Engine HTTP error');
{
  const errResp = new Response('Server Error', { status: 500 });
  const fetchImpl = (async (_url: string, _init?: unknown) => errResp) as unknown as typeof fetch;
  const e = makeStreamEngine(makeRequestId('req_smoke_e_he_1'), { fetchImpl });
  await e.start({ url: 'http://test/stream' });
  check('error state', e.state === 'ERROR');
  check('errorMessage set', e.errorMessage !== null);
}

// === 18. Engine abort mid-stream ===
console.log('\n[18] Engine abort mid-stream');
{
  const messages: MockEventSourceMessage[] = [
    { data: '{"token":"a"}', delayMs: 40 },
    { data: '{"token":"b"}', delayMs: 40 },
    { data: '[DONE]' },
  ];
  const response = mockSSEResponse(messages);
  const fetchImpl = (async (_url: string, _init?: unknown) => response) as unknown as typeof fetch;
  const e = makeStreamEngine(makeRequestId('req_smoke_e_am_1'), { fetchImpl });
  const startPromise = e.start({ url: 'http://test/stream' });
  await sleep(15);
  e.abort('user');
  await startPromise;
  check('aborted state', e.state === 'ABORTED');
  check('abortReason user', e.abortReason === 'user');
}

// === 19. Telemetry ===
console.log('\n[19] Telemetry');
{
  const messages: MockEventSourceMessage[] = [{ data: '{"token":"x"}' }, { data: '[DONE]' }];
  const response = mockSSEResponse(messages);
  const fetchImpl = (async (_url: string, _init?: unknown) => response) as unknown as typeof fetch;
  const e = makeStreamEngine(makeRequestId('req_smoke_tel_01'), { fetchImpl });
  await e.start({ url: 'http://test/stream' });
  const t = e.getTelemetry();
  check('telemetry totalStateTransitions >= 3', t.totalStateTransitions >= 3);
  check('telemetry totalTokens = 1', t.totalTokens === 1);
  check('telemetry durationMs not null', t.durationMs !== null);
  check('telemetry CONNECTING counted', t.stateDistribution['CONNECTING'] > 0);
}

// === 20. Factory idempotence ===
console.log('\n[20] Factory idempotence');
{
  const reqId = makeRequestId('req_smoke_fac_01');
  const e = makeStreamEngine(reqId);
  const t1 = e.getTelemetry();
  const t2 = e.getTelemetry();
  check('telemetry stable', JSON.stringify(t1) === JSON.stringify(t2));
}

console.log(`\nSmoke summary: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error('Failures:');
  process.exit(1);
}
