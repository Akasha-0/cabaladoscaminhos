// W79 akasha-ia-streaming spec — self-running (no vitest at runtime).
// Pattern: cycle 60+ harness with describe/it/expect/beforeEach/afterEach stubs.

import {
  STREAM_STATES, isStreamState,
  makeRequestId, makeStreamError,
  canTransition, assertTransition, LEGAL_TRANSITIONS,
  parseSSEBlocks, tokenizeChunk, sanitizeToken, isValidUtf8,
  defaultParser, jsonlParser, rawParser,
  makeStreamEngine, mockSSEStream, mockSSEResponse,
  backoffDelay, sleep, startWithRetry,
  telemetryDiff, formatForTypewriter, approxTokenCount,
  describeState, snapshotEngine, isTerminal,
  NO_RETRY, DEFAULT_RETRY,
  _resetTokenCounterForTests,
  type StreamState, type StreamEngine, type StreamError,
  type StreamTelemetry, type MockEventSourceMessage,
} from './akasha-ia-streaming.ts';

// ----- self-running harness -----
let _testsPassed = 0;
let _testsFailed = 0;
const _failures: string[] = [];

function recordAssertion(name: string, ok: boolean, msg: string): void {
  if (ok) { _testsPassed++; }
  else {
    _testsFailed++;
    _failures.push(`${name}: ${msg}`);
  }
}

// Per-call negate flag (set by .not via a wrapper).
let _negate = false;

function _record(ok: boolean, msg: string): void {
  if (_negate) ok = !ok;
  if (ok) { _testsPassed++; }
  else { _testsFailed++; _failures.push(msg); }
}

function expect<T>(actual: T): { [k: string]: any; not: { [k: string]: any } } {
  const m: { [k: string]: any; not: { [k: string]: any } } = {
    toBe(expected: T) { _record(Object.is(actual, expected), `toBe: expected ${String(expected)}, got ${String(actual)}`); },
    toEqual(expected: unknown) { _record(JSON.stringify(actual) === JSON.stringify(expected), `toEqual: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`); },
    toBeTruthy() { _record(Boolean(actual), `toBeTruthy: got ${String(actual)}`); },
    toBeFalsy() { _record(!actual, `toBeFalsy: got ${String(actual)}`); },
    toBeDefined() { _record(actual !== undefined, `toBeDefined: got undefined`); },
    toBeUndefined() { _record(actual === undefined, `toBeUndefined: got ${String(actual)}`); },
    toBeNull() { _record(actual === null, `toBeNull: got ${String(actual)}`); },
    toThrow(fn?: () => unknown, msg?: string) {
      // If no fn provided, treat the actual itself as the function under test
      const target = (typeof fn === 'function') ? fn : (typeof actual === 'function' ? actual as () => unknown : null);
      let threw = false; let errMsg = '';
      if (target) {
        try { target(); } catch (e) { threw = true; errMsg = String(e); }
      } else {
        // Nothing callable provided — record as failure
        threw = false;
        errMsg = 'toThrow called with no callable';
      }
      const matched = msg ? threw && errMsg.includes(msg) : threw;
      _record(matched, `toThrow(msg=${msg}): got ${errMsg}`);
    },
    toContain(item: unknown) {
      const isStr = typeof actual === 'string';
      const isArr = Array.isArray(actual);
      const matched = isStr ? (actual as string).includes(String(item)) : isArr ? (actual as unknown[]).includes(item) : false;
      _record(matched, `toContain: ${String(actual)} ${isStr || isArr ? 'does not contain' : 'unsupported'} ${String(item)}`);
    },
    toHaveLength(n: number) { _record((actual as { length: number }).length === n, `toHaveLength: expected ${n}, got ${(actual as { length: number }).length}`); },
    toBeGreaterThan(n: number) { _record((actual as number) > n, `toBeGreaterThan: ${actual} > ${n}`); },
    toBeGreaterThanOrEqual(n: number) { _record((actual as number) >= n, `toBeGreaterThanOrEqual: ${actual} >= ${n}`); },
    toBeLessThan(n: number) { _record((actual as number) < n, `toBeLessThan: ${actual} < ${n}`); },
    toBeLessThanOrEqual(n: number) { _record((actual as number) <= n, `toBeLessThanOrEqual: ${actual} <= ${n}`); },
    not: null as unknown as { [k: string]: any },
  };
  // .not returns the same matcher but toggles _negate via flag wrapper
  m.not = new Proxy(m, {
    get(t, prop) {
      if (prop === 'not') return (t as { not: unknown }).not;
      const v = (t as Record<string | symbol, unknown>)[prop as string];
      if (typeof v === 'function') {
        return (...args: unknown[]) => {
          const saved = _negate;
          _negate = true;
          try { (v as (...a: unknown[]) => unknown).apply(t, args); }
          finally { _negate = saved; }
        };
      }
      return v;
    },
  });
  return m;
}

function describe(name: string, fn: () => void): void {
  console.log(`\n  ${name}`);
  fn();
}
function it(name: string, fn: () => void | Promise<void>): void {
  try {
    const r = fn();
    if (r instanceof Promise) {
      _asyncTests.push({ name, fn: r });
      recordAssertion(`it(${name}) async-queued`, true, '');
      return;
    }
    recordAssertion(`it(${name}) ran`, true, '');
  } catch (e) {
    _testsFailed++;
    _failures.push(`it(${name}) threw: ${String(e)}`);
  }
}

const _asyncTests: Array<{ name: string; fn: Promise<void> }> = [];

function beforeEach(fn: () => void): void { fn(); }

// ============================== SPEC BODY ==============================

describe('STREAM_STATES taxonomy', () => {
  beforeEach(() => _resetTokenCounterForTests());
  it('STREAM_STATES has exactly 6 entries', () => {
    expect(STREAM_STATES).toHaveLength(6);
  });
  it('STREAM_STATES order is canonical', () => {
    expect(STREAM_STATES[0]).toBe('IDLE');
    expect(STREAM_STATES[1]).toBe('CONNECTING');
    expect(STREAM_STATES[2]).toBe('STREAMING');
    expect(STREAM_STATES[3]).toBe('COMPLETE');
    expect(STREAM_STATES[4]).toBe('ERROR');
    expect(STREAM_STATES[5]).toBe('ABORTED');
  });
  it('isStreamState identifies members and rejects non-members', () => {
    expect(isStreamState('IDLE')).toBeTruthy();
    expect(isStreamState('STREAMING')).toBeTruthy();
    expect(isStreamState('bogus')).toBeFalsy();
  });
});

describe('branded primitive factories', () => {
  beforeEach(() => _resetTokenCounterForTests());
  it('makeRequestId accepts valid and rejects invalid', () => {
    expect(makeRequestId('req_test_001')).toBeDefined();
    expect(() => makeRequestId('bad')).toThrow(() => makeRequestId('bad'), 'invalid RequestId');
  });
  it('makeStreamError rejects too-short messages', () => {
    expect(makeStreamError('something bad')).toBeDefined();
    expect(() => makeStreamError('x')).toThrow(() => makeStreamError('x'), 'invalid StreamError message');
  });
});

describe('state machine transitions', () => {
  it('IDLE → CONNECTING is legal', () => {
    expect(canTransition('IDLE', 'CONNECTING')).toBeTruthy();
  });
  it('CONNECTING → STREAMING is legal', () => {
    expect(canTransition('CONNECTING', 'STREAMING')).toBeTruthy();
  });
  it('CONNECTING → ABORTED is legal', () => {
    expect(canTransition('CONNECTING', 'ABORTED')).toBeTruthy();
  });
  it('STREAMING → COMPLETE is legal', () => {
    expect(canTransition('STREAMING', 'COMPLETE')).toBeTruthy();
  });
  it('STREAMING → ERROR is legal', () => {
    expect(canTransition('STREAMING', 'ERROR')).toBeTruthy();
  });
  it('STREAMING → ABORTED is legal', () => {
    expect(canTransition('STREAMING', 'ABORTED')).toBeTruthy();
  });
  it('COMPLETE → STREAMING is ILLEGAL', () => {
    expect(canTransition('COMPLETE', 'STREAMING')).toBeFalsy();
  });
  it('ERROR → STREAMING is ILLEGAL', () => {
    expect(canTransition('ERROR', 'STREAMING')).toBeFalsy();
  });
  it('ABORTED → CONNECTING is ILLEGAL', () => {
    expect(canTransition('ABORTED', 'CONNECTING')).toBeFalsy();
  });
  it('COMPLETE is terminal', () => {
    expect((LEGAL_TRANSITIONS.get('COMPLETE') ?? []).length).toBe(0);
  });
  it('ERROR is terminal', () => {
    expect((LEGAL_TRANSITIONS.get('ERROR') ?? []).length).toBe(0);
  });
  it('ABORTED is terminal', () => {
    expect((LEGAL_TRANSITIONS.get('ABORTED') ?? []).length).toBe(0);
  });
  it('assertTransition throws on illegal', () => {
    expect(() => assertTransition('COMPLETE', 'STREAMING')).toThrow(() => assertTransition('COMPLETE', 'STREAMING'), 'Illegal');
  });
});

describe('SSE parsing', () => {
  it('parseSSEBlocks splits on double newlines', () => {
    const blocks = parseSSEBlocks('data: hello\n\ndata: world\n\n');
    expect(blocks).toHaveLength(2);
    expect(blocks[0]?.data).toBe('hello');
    expect(blocks[1]?.data).toBe('world');
  });
  it('parseSSEBlocks extracts event names', () => {
    const blocks = parseSSEBlocks('event: token\ndata: hi\n\n');
    expect(blocks[0]?.eventName).toBe('token');
  });
  it('parseSSEBlocks marks [DONE] as isFinal', () => {
    const blocks = parseSSEBlocks('data: [DONE]\n\n');
    expect(blocks[0]?.isFinal).toBeTruthy();
  });
  it('parseSSEBlocks strips comments (lines starting with :)', () => {
    const blocks = parseSSEBlocks(': heartbeat\n\ndata: real\n\n');
    expect(blocks).toHaveLength(1);
    expect(blocks[0]?.data).toBe('real');
  });
  it('parseSSEBlocks handles \\r\\n line endings', () => {
    const blocks = parseSSEBlocks('data: x\r\n\r\ndata: y\r\n\r\n');
    expect(blocks).toHaveLength(2);
  });
  it('parseSSEBlocks empty input returns []', () => {
    expect(parseSSEBlocks('')).toHaveLength(0);
  });
});

describe('tokenizeChunk', () => {
  it('extracts token field from JSON', () => {
    expect(tokenizeChunk('{"token":"hello"}')[0]).toBe('hello');
  });
  it('extracts text field from JSON', () => {
    expect(tokenizeChunk('{"text":"world"}')[0]).toBe('world');
  });
  it('extracts delta.content from OpenAI-style choices', () => {
    expect(tokenizeChunk('{"choices":[{"delta":{"content":"ok"}}]}')[0]).toBe('ok');
  });
  it('returns array of strings for JSON array input', () => {
    const r = tokenizeChunk('["a","b","c"]');
    expect(r).toHaveLength(3);
    expect(r[0]).toBe('a');
  });
  it('returns raw text for non-JSON input', () => {
    expect(tokenizeChunk('plain text')[0]).toBe('plain text');
  });
  it('returns empty for empty input', () => {
    expect(tokenizeChunk('')).toHaveLength(0);
  });
  it('returns empty for [DONE]', () => {
    expect(tokenizeChunk('[DONE]')).toHaveLength(0);
  });
  it('falls through to raw text when JSON.parse fails', () => {
    expect(tokenizeChunk('{not valid json')[0]).toBe('{not valid json');
  });
});

describe('sanitizeToken + isValidUtf8', () => {
  it('sanitizeToken strips control chars', () => {
    expect(sanitizeToken('a\u0000b\u0007c')).toBe('abc');
  });
  it('sanitizeToken preserves newlines and tabs', () => {
    expect(sanitizeToken('a\nb\tc')).toBe('a\nb\tc');
  });
  it('sanitizeToken returns empty for empty input', () => {
    expect(sanitizeToken('')).toBe('');
  });
  it('isValidUtf8 accepts plain ASCII', () => {
    expect(isValidUtf8('hello')).toBeTruthy();
  });
  it('isValidUtf8 accepts paired surrogates (emoji)', () => {
    expect(isValidUtf8('hello 🌟 world')).toBeTruthy();
  });
  it('isValidUtf8 rejects unpaired high surrogate', () => {
    expect(isValidUtf8('a\uD800b')).toBeFalsy();
  });
  it('isValidUtf8 rejects unpaired low surrogate', () => {
    expect(isValidUtf8('a\uDC00b')).toBeFalsy();
  });
});

describe('defaultParser + jsonlParser + rawParser', () => {
  it('defaultParser extracts tokens from SSE', () => {
    const toks = defaultParser('data: {"token":"a"}\n\ndata: {"token":"b"}\n\n');
    expect(toks).toHaveLength(2);
    expect(toks[0]).toBe('a');
    expect(toks[1]).toBe('b');
  });
  it('defaultParser skips [DONE] blocks', () => {
    const toks = defaultParser('data: {"token":"x"}\n\ndata: [DONE]\n\n');
    expect(toks).toHaveLength(1);
  });
  it('defaultParser returns empty for empty input', () => {
    expect(defaultParser('')).toHaveLength(0);
  });
  it('jsonlParser splits on newlines', () => {
    const toks = jsonlParser('{"text":"a"}\n{"text":"b"}\n');
    expect(toks).toHaveLength(2);
  });
  it('jsonlParser skips empty lines', () => {
    const toks = jsonlParser('\n\n{"text":"x"}\n\n');
    expect(toks).toHaveLength(1);
  });
  it('jsonlParser empty input returns []', () => {
    expect(jsonlParser('')).toHaveLength(0);
  });
  it('rawParser emits whole payload as one token', () => {
    const toks = rawParser('full response');
    expect(toks).toHaveLength(1);
    expect(toks[0]).toBe('full response');
  });
  it('rawParser empty input returns []', () => {
    expect(rawParser('')).toHaveLength(0);
  });
});

describe('backoffDelay', () => {
  it('attempt 0 returns ~200ms (+0-25% jitter)', () => {
    const d = backoffDelay(0, DEFAULT_RETRY);
    expect(d).toBeGreaterThan(199);
    expect(d).toBeLessThanOrEqual(250);
  });
  it('attempt 1 returns ~400ms', () => {
    const d = backoffDelay(1, DEFAULT_RETRY);
    expect(d).toBeGreaterThan(399);
    expect(d).toBeLessThanOrEqual(500);
  });
  it('attempt >= maxRetries returns -1', () => {
    expect(backoffDelay(10, DEFAULT_RETRY)).toBe(-1);
  });
  it('NO_RETRY policy always returns -1', () => {
    expect(backoffDelay(0, NO_RETRY)).toBe(-1);
  });
  it('negative attempt returns 0', () => {
    expect(backoffDelay(-1, DEFAULT_RETRY)).toBe(0);
  });
});

describe('describeState + isTerminal + format helpers', () => {
  it('describeState has Portuguese labels for every state', () => {
    expect(describeState('IDLE')).toContain('Pronto');
    expect(describeState('CONNECTING')).toContain('Conectando');
    expect(describeState('STREAMING')).toContain('Recebendo');
    expect(describeState('COMPLETE')).toBe('Concluído');
    expect(describeState('ERROR')).toBe('Erro');
    expect(describeState('ABORTED')).toBe('Interrompido');
  });
  it('isTerminal true for COMPLETE / ERROR / ABORTED', () => {
    expect(isTerminal('COMPLETE')).toBeTruthy();
    expect(isTerminal('ERROR')).toBeTruthy();
    expect(isTerminal('ABORTED')).toBeTruthy();
  });
  it('isTerminal false for IDLE / CONNECTING / STREAMING', () => {
    expect(isTerminal('IDLE')).toBeFalsy();
    expect(isTerminal('CONNECTING')).toBeFalsy();
    expect(isTerminal('STREAMING')).toBeFalsy();
  });
  it('formatForTypewriter truncates long text', () => {
    const out = formatForTypewriter('a'.repeat(500), 100);
    expect(out.length).toBeLessThanOrEqual(101);
    expect(out).toContain('…');
  });
  it('formatForTypewriter short text passes through', () => {
    expect(formatForTypewriter('short', 100)).toBe('short');
  });
  it('approxTokenCount counts words', () => {
    expect(approxTokenCount('hello world foo bar')).toBe(4);
    expect(approxTokenCount('')).toBe(0);
    expect(approxTokenCount('   spaces   ')).toBe(1);
  });
});

describe('makeStreamEngine factory', () => {
  it('initial state is IDLE', () => {
    _resetTokenCounterForTests();
    const e = makeStreamEngine(makeRequestId('req_test_init_1'));
    expect(e.state).toBe('IDLE');
    expect(e.tokens).toHaveLength(0);
    expect(e.accumulated).toBe('');
    expect(e.errorMessage).toBeNull();
    expect(e.abortReason).toBeNull();
    expect(e.startedAt).toBe(0);
    expect(e.endedAt).toBeNull();
  });
  it('subscribe returns unsubscribe', () => {
    const e = makeStreamEngine(makeRequestId('req_test_sub_001'));
    let count = 0;
    const unsub = e.subscribe(() => count++);
    expect(typeof unsub).toBe('function');
    unsub();
    expect(count).toBe(0);
  });
  it('abort() in IDLE state is a no-op', () => {
    const e = makeStreamEngine(makeRequestId('req_test_idle_01'));
    expect(() => e.abort('user')).not.toThrow();
    // State doesn't transition from IDLE on abort (no legal transition)
    expect(e.state).toBe('IDLE');
  });
  it('snapshotEngine returns frozen snapshot', () => {
    const e = makeStreamEngine(makeRequestId('req_test_snap_01'));
    const snap = snapshotEngine(e);
    expect(snap.state).toBe('IDLE');
    expect(snap.tokenCount).toBe(0);
    expect(snap.totalEvents).toBe(0);
    expect(snap.errorMessage).toBeNull();
    expect(snap.durationMs).toBeNull();
  });
  it('reset() clears engine back to IDLE', () => {
    const e = makeStreamEngine(makeRequestId('req_test_rst_001'));
    e.reset();
    expect(e.state).toBe('IDLE');
    expect(e.tokens).toHaveLength(0);
  });
});

describe('engine integration with mock SSE', () => {
  it('consumes SSE stream via mock fetchImpl', async () => {
    _resetTokenCounterForTests();
    const messages: MockEventSourceMessage[] = [
      { data: '{"token":"Olá"}' },
      { data: '{"token":", "}' },
      { data: '{"token":"mundo!"}' },
      { data: '[DONE]' },
    ];
    const response = mockSSEResponse(messages);
    const fetchImpl = (async (_url: string, _init?: unknown) => response) as unknown as typeof fetch;
    const e = makeStreamEngine(makeRequestId('req_test_mock_01'), { fetchImpl });
    const states: StreamState[] = [];
    const tokens: string[] = [];
    e.subscribe((ev) => {
      if (ev.kind === 'state') states.push(ev.state);
      if (ev.kind === 'token') tokens.push(ev.token.text);
    });
    await e.start({ url: 'http://test/stream' });
    expect(states).toContain('CONNECTING');
    expect(states).toContain('STREAMING');
    expect(states).toContain('COMPLETE');
    expect(e.state).toBe('COMPLETE');
    expect(e.tokens.length).toBe(3);
    expect(e.accumulated).toBe('Olá, mundo!');
    expect(tokens).toHaveLength(3);
    expect(e.startedAt).toBeGreaterThan(0);
    expect(e.endedAt).not.toBeNull();
  });

  it('abort() during STREAMING transitions to ABORTED', async () => {
    _resetTokenCounterForTests();
    const messages: MockEventSourceMessage[] = [
      { data: '{"token":"a"}', delayMs: 30 },
      { data: '{"token":"b"}', delayMs: 30 },
      { data: '{"token":"c"}', delayMs: 30 },
      { data: '[DONE]' },
    ];
    const response = mockSSEResponse(messages);
    const fetchImpl = (async (_url: string, _init?: unknown) => response) as unknown as typeof fetch;
    const e = makeStreamEngine(makeRequestId('req_test_abor_01'), { fetchImpl });
    const startPromise = e.start({ url: 'http://test/stream' });
    await sleep(15);
    e.abort('user');
    await startPromise;
    expect(e.state).toBe('ABORTED');
    expect(e.abortReason).toBe('user');
  });

  it('HTTP error transitions to ERROR', async () => {
    _resetTokenCounterForTests();
    const errResp = new Response('Bad Request', { status: 400, statusText: 'Bad Request' });
    const fetchImpl = (async (_url: string, _init?: unknown) => errResp) as unknown as typeof fetch;
    const e = makeStreamEngine(makeRequestId('req_test_http_01'), { fetchImpl });
    await e.start({ url: 'http://test/stream' });
    expect(e.state).toBe('ERROR');
    expect(e.errorMessage).not.toBeNull();
  });

  it('telemetry counts state transitions', async () => {
    _resetTokenCounterForTests();
    const messages: MockEventSourceMessage[] = [
      { data: '{"token":"x"}' },
      { data: '[DONE]' },
    ];
    const response = mockSSEResponse(messages);
    const fetchImpl = (async (_url: string, _init?: unknown) => response) as unknown as typeof fetch;
    const e = makeStreamEngine(makeRequestId('req_test_tele_01'), { fetchImpl });
    await e.start({ url: 'http://test/stream' });
    const t = e.getTelemetry();
    expect(t.totalStateTransitions).toBeGreaterThanOrEqual(3);
    expect(t.totalTokens).toBe(1);
    expect(t.stateDistribution['CONNECTING']).toBeGreaterThan(0);
    expect(t.stateDistribution['COMPLETE']).toBeGreaterThan(0);
    expect(t.durationMs).not.toBeNull();
  });

  it('emits state event with prev + new state', async () => {
    _resetTokenCounterForTests();
    const messages: MockEventSourceMessage[] = [{ data: '{"token":"hi"}' }];
    const response = mockSSEResponse(messages);
    const fetchImpl = (async (_url: string, _init?: unknown) => response) as unknown as typeof fetch;
    const e = makeStreamEngine(makeRequestId('req_test_sev_001'), { fetchImpl });
    let lastPrev: StreamState | null = null;
    let lastState: StreamState | null = null;
    e.subscribe((ev) => {
      if (ev.kind === 'state') {
        lastPrev = ev.prev;
        lastState = ev.state;
      }
    });
    await e.start({ url: 'http://test/stream' });
    expect(lastState).toBe('COMPLETE');
    expect(lastPrev).toBe('STREAMING');
  });
});

describe('startWithRetry', () => {
  it('aborts with backoff_exceeded after max retries', async () => {
    _resetTokenCounterForTests();
    let callCount = 0;
    const errResp = new Response('Server Error', { status: 500 });
    const fetchImpl = (async (_url: string, _init?: unknown) => {
      callCount++;
      return errResp;
    }) as unknown as typeof fetch;
    const e = makeStreamEngine(makeRequestId('req_test_retry_1'), { fetchImpl });
    await startWithRetry(e, { url: 'http://test/stream' }, { maxRetries: 2, initialDelayMs: 1, maxDelayMs: 5 });
    expect(callCount).toBeGreaterThanOrEqual(1);
    expect(e.abortReason).toBe('backoff_exceeded');
  });

  it('succeeds on first try when no error', async () => {
    _resetTokenCounterForTests();
    const messages: MockEventSourceMessage[] = [{ data: '{"token":"hi"}' }, { data: '[DONE]' }];
    const response = mockSSEResponse(messages);
    const fetchImpl = (async (_url: string, _init?: unknown) => response) as unknown as typeof fetch;
    const e = makeStreamEngine(makeRequestId('req_test_retry_2'), { fetchImpl });
    await startWithRetry(e, { url: 'http://test/stream' }, DEFAULT_RETRY);
    expect(e.state).toBe('COMPLETE');
    expect(e.tokens.length).toBe(1);
  });
});

describe('mockSSEStream + mockSSEResponse', () => {
  it('mockSSEResponse has text/event-stream content-type', () => {
    const r = mockSSEResponse([{ data: 'x' }]);
    expect(r.headers.get('content-type')).toContain('text/event-stream');
  });
  it('mockSSEResponse defaults to status 200', () => {
    expect(mockSSEResponse([]).status).toBe(200);
  });
  it('mockSSEResponse accepts custom status', () => {
    expect(mockSSEResponse([], { status: 201 }).status).toBe(201);
  });
});

describe('telemetryDiff', () => {
  it('diffs state distribution correctly', () => {
    const before: StreamTelemetry = {
      totalTokens: 0,
      totalEvents: 0,
      totalStateTransitions: 0,
      totalErrors: 0,
      totalAborts: 0,
      totalRetries: 0,
      totalBytesParsed: 0,
      durationMs: null,
      stateDistribution: { IDLE: 1, CONNECTING: 0, STREAMING: 0, COMPLETE: 0, ERROR: 0, ABORTED: 0 },
      parserHits: { sse: 0, jsonl: 0, raw: 0, mock: 0 },
    };
    const after: StreamTelemetry = {
      ...before,
      totalTokens: 5,
      totalEvents: 7,
      stateDistribution: { IDLE: 1, CONNECTING: 1, STREAMING: 1, COMPLETE: 1, ERROR: 0, ABORTED: 0 },
    };
    const d = telemetryDiff(before, after);
    expect(d.totalTokens).toBe(5);
    expect(d.totalEvents).toBe(7);
  });
});

// ============================== ASYNC DRAIN ==============================

// Run all queued async tests sequentially.
async function drainAsync(): Promise<void> {
  for (const t of _asyncTests) {
    try {
      await t.fn;
    } catch (e) {
      _testsFailed++;
      _failures.push(`it(${t.name}) async-threw: ${String(e)}`);
    }
  }
}

// ============================== REPORT ==============================

// Top-level await is allowed under --experimental-strip-types in Node 22+.
await drainAsync();
console.log(`\nSpec summary: ${_testsPassed} passed, ${_testsFailed} failed`);
if (_testsFailed > 0) {
  console.error('Failures:');
  for (const f of _failures) console.error('  - ' + f);
  process.exit(1);
}
