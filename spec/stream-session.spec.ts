/**
 * W71-D: stream-session.spec.ts
 *
 * Self-running spec harness for stream-session.ts (no vitest binary needed).
 * Pattern: cycle 60+ — assertIt/assertEq with explicit polarity, runXxxSpec().
 */

import {
  createStream,
  startStream,
  endStream,
  cancelStream,
  getStream,
  listStreams,
  subscribeToStream,
  clearStreamStore,
  validateTraditionTags,
  isTraditionTag,
  auditStreamSession,
  auditStreamTaxonomy,
  setHmacSecret,
  TRADITION_TAGS,
  type StreamConfig,
  type StreamSession,
} from '../engines/stream-session.ts';

// ─── Harness ────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assertIt(cond: unknown, label: string): void {
  if (cond) {
    passed++;
  } else {
    failed++;
    failures.push(label);
  }
}

function assertEq<T>(actual: T, expected: T, label: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) {
    passed++;
  } else {
    failed++;
    failures.push(`${label}: expected ${e}, got ${a}`);
  }
}

function assertThrows(fn: () => unknown, pattern: RegExp | string, label: string): void {
  try {
    fn();
    failed++;
    failures.push(`${label}: expected throw, got none`);
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    const ok = typeof pattern === 'string' ? msg.includes(pattern) : pattern.test(msg);
    if (ok) passed++;
    else {
      failed++;
      failures.push(`${label}: throw message '${msg}' did not match ${pattern}`);
    }
  }
}

function section(name: string): void {
  console.log(`  ▶ ${name}`);
}

function reset(): void {
  clearStreamStore();
  setHmacSecret('test-secret');
}

// ─── Tests ──────────────────────────────────────────────────────────────────

export function runStreamSessionSpec(): {
  passed: number;
  failed: number;
  total: number;
  failures: readonly string[];
} {
  reset();
  passed = 0;
  failed = 0;
  failures.length = 0;

  section('Tradition validation (7 traditions)');
  assertEq(TRADITION_TAGS.length, 7, '7-tradition count');
  for (const t of TRADITION_TAGS) {
    assertIt(isTraditionTag(t), `valid tag: ${t}`);
  }
  assertIt(!isTraditionTag('runas'), 'invalid tag rejected');
  assertEq(
    validateTraditionTags(['cigano', 'tarot', 'cigano']).length,
    2,
    'dedupe tradition tags',
  );
  assertThrows(
    () => validateTraditionTags([]),
    /at least one tag is required/,
    'empty traditionTags rejected',
  );
  assertThrows(
    () => validateTraditionTags(['unknown-tradition']),
    /unknown tradition/,
    'unknown tradition rejected',
  );
  assertThrows(
    () => validateTraditionTags(['cigano', 'Runas'] as any),
    /unknown tradition/,
    'case-insensitive unknown rejected',
  );

  section('createStream — happy path');
  const cfg1: StreamConfig = {
    title: 'Tarot ao Vivo — O Caminho do Mês',
    description: 'Leitura coletiva das cartas',
    traditionTags: ['cigano', 'tarot'],
    scheduledStart: Date.now() + 60_000,
    recordingEnabled: true,
    maxViewers: 100,
    visibility: 'public',
  };
  const s1 = createStream('host-alice', cfg1);
  assertIt(s1.id.startsWith('stream_'), 'session id starts with stream_');
  assertEq(s1.hostId, 'host-alice', 'hostId');
  assertEq(s1.title, 'Tarot ao Vivo — O Caminho do Mês', 'title');
  assertEq(s1.state, 'scheduled', 'initial state scheduled');
  assertEq(s1.viewerCount, 0, 'initial viewerCount 0');
  assertEq(s1.maxViewers, 100, 'maxViewers');
  assertEq(s1.traditionTags.length, 2, 'traditionTags length');
  assertIt(s1.chatRoomId.startsWith('room_'), 'chatRoomId prefixed');
  assertEq(s1.recordingEnabled, true, 'recordingEnabled');
  assertEq(s1.actualStart, undefined, 'no actualStart');
  assertEq(s1.endedAt, undefined, 'no endedAt');

  section('createStream — validation');
  assertThrows(
    () => createStream('', cfg1),
    /hostId is required/,
    'empty hostId rejected',
  );
  assertThrows(
    () =>
      createStream('host-x', {
        ...cfg1,
        title: '',
      }),
    /title is required/,
    'empty title rejected',
  );
  assertThrows(
    () =>
      createStream('host-x', {
        ...cfg1,
        maxViewers: 0,
      }),
    /maxViewers must be in/,
    'maxViewers=0 rejected',
  );
  assertThrows(
    () =>
      createStream('host-x', {
        ...cfg1,
        maxViewers: 200000,
      }),
    /maxViewers must be in/,
    'maxViewers>100000 rejected',
  );
  assertThrows(
    () =>
      createStream('host-x', {
        ...cfg1,
        visibility: 'private' as any,
      }),
    /visibility must be/,
    'invalid visibility rejected',
  );
  assertThrows(
    () =>
      createStream('host-x', {
        ...cfg1,
        scheduledStart: -1,
      }),
    /scheduledStart must be/,
    'negative scheduledStart rejected',
  );
  assertThrows(
    () =>
      createStream('host-x', {
        ...cfg1,
        scheduledStart: NaN,
      }),
    /scheduledStart must be a finite number/,
    'NaN scheduledStart rejected',
  );

  section('Lifecycle: start → live → end');
  const live = startStream(s1.id, 'host-alice');
  assertEq(live.state, 'live', 'state=live after startStream');
  assertIt(typeof live.actualStart === 'number', 'actualStart set');
  assertIt(live.actualStart! > 0, 'actualStart positive');
  assertThrows(
    () => startStream(s1.id, 'host-alice'),
    /cannot start from state 'live'/,
    'cannot restart live stream',
  );
  assertThrows(
    () => startStream(s1.id, 'host-not-alice'),
    /forbidden: hostId mismatch/,
    'non-host cannot start',
  );
  const ended = endStream(s1.id, 'host-alice', 'https://cdn.example.com/recording.mp4');
  assertEq(ended.state, 'ended', 'state=ended');
  assertIt(typeof ended.endedAt === 'number', 'endedAt set');
  assertEq(ended.recordingUrl, 'https://cdn.example.com/recording.mp4', 'recordingUrl');
  assertThrows(
    () => endStream(s1.id, 'host-alice'),
    /cannot end from state 'ended'/,
    'cannot end already-ended',
  );

  section('Cancel');
  reset();
  const s2 = createStream('host-bob', cfg1);
  const cancelled = cancelStream(s2.id, 'host-bob', 'host is sick');
  assertEq(cancelled.state, 'cancelled', 'state=cancelled');
  assertIt(typeof cancelled.endedAt === 'number', 'cancel sets endedAt');
  assertThrows(
    () => cancelStream(s2.id, 'host-bob', 'again'),
    /cannot cancel from state 'cancelled'/,
    'cannot cancel twice',
  );
  assertThrows(
    () => cancelStream('nonexistent', 'host-bob', 'x'),
    /stream not found/,
    'cancel unknown throws',
  );
  assertThrows(
    () => {
      const x = createStream('host-bob', cfg1);
      cancelStream(x.id, 'host-bob', '');
    },
    /reason is required/,
    'cancel empty reason rejected',
  );

  section('getStream / listStreams');
  reset();
  const a = createStream('host-a', cfg1);
  const b = createStream('host-b', { ...cfg1, traditionTags: ['orixas'] });
  startStream(a.id, 'host-a');
  const byId = getStream(a.id);
  assertIt(byId !== null, 'getStream finds');
  assertEq(getStream('nope'), null, 'getStream null on miss');
  const all = listStreams({}, { limit: 10, offset: 0 });
  assertEq(all.length, 2, 'listStreams returns 2');
  const liveOnly = listStreams({ state: 'live' }, { limit: 10, offset: 0 });
  assertEq(liveOnly.length, 1, 'filter by state=live returns 1');
  assertEq(liveOnly[0].id, a.id, 'filter returns a');
  const hostA = listStreams({ hostId: 'host-a' }, { limit: 10, offset: 0 });
  assertEq(hostA.length, 1, 'filter by hostId returns 1');
  const cigano = listStreams({ tradition: 'cigano' }, { limit: 10, offset: 0 });
  assertEq(cigano.length, 1, 'filter by tradition=cigano returns 1');
  assertThrows(
    () => listStreams({}, { limit: -1, offset: 0 }),
    /opts.limit must be >= 0/,
    'negative limit rejected',
  );
  assertThrows(
    () => listStreams({}, { limit: 10, offset: -1 }),
    /opts.offset must be >= 0/,
    'negative offset rejected',
  );

  section('subscribeToStream (HMAC tokens)');
  reset();
  const s3 = createStream('host-c', { ...cfg1, maxViewers: 2 });
  startStream(s3.id, 'host-c');
  const token1 = subscribeToStream(s3.id, 'viewer-1');
  assertIt(typeof token1.viewerToken === 'string', 'token1 is string');
  assertIt(token1.viewerToken.length > 20, 'token1 length ok');
  assertIt(token1.expiresAt > Date.now(), 'token1 not expired');
  assertIt(
    Math.abs(token1.expiresAt - (Date.now() + 1000 * 60 * 30)) < 5_000,
    'token1 expiresAt ~30min',
  );
  subscribeToStream(s3.id, 'viewer-2');
  assertEq(getStream(s3.id)!.viewerCount, 2, 'viewerCount=2 after 2 subs');
  assertThrows(
    () => subscribeToStream(s3.id, 'viewer-3'),
    /stream is full/,
    'cannot exceed maxViewers',
  );
  // Tokens from different viewers must differ
  assertThrows(
    () => subscribeToStream('nonexistent', 'viewer-x'),
    /stream not found/,
    'subscribe to nonexistent throws',
  );
  assertThrows(
    () => subscribeToStream(s3.id, ''),
    /viewerId is required/,
    'empty viewerId rejected',
  );
  // Need to also test cannot subscribe to non-live stream
  reset();
  const s4 = createStream('host-d', cfg1); // scheduled, not live
  assertThrows(
    () => subscribeToStream(s4.id, 'viewer-x'),
    /stream is not live/,
    'cannot subscribe to non-live',
  );

  section('audit functions');
  const audited = auditStreamSession(s1);
  assertEq(audited.id, s1.id, 'audit id matches');
  assertEq(audited.state, 'ended', 'audit state matches');
  assertEq(audited.isLive, false, 'audit isLive=false for ended');
  assertEq(audited.hasRecording, true, 'audit hasRecording=true');
  const taxonomy = auditStreamTaxonomy();
  assertEq(taxonomy.traditions.length, 7, 'audit taxonomy=7 traditions');
  assertEq(taxonomy.states.length, 4, 'audit taxonomy=4 states');
  assertEq(taxonomy.visibilities.length, 3, 'audit taxonomy=3 visibilities');
  assertEq(taxonomy.minTags, 1, 'audit minTags=1');

  section('HMAC chain uniqueness');
  reset();
  const s5 = createStream('host-e', cfg1);
  startStream(s5.id, 'host-e');
  const tokenA = subscribeToStream(s5.id, 'viewer-A');
  const tokenB = subscribeToStream(s5.id, 'viewer-B');
  assertIt(tokenA.viewerToken !== tokenB.viewerToken, 'different viewers get different tokens');

  section('List pagination');
  reset();
  for (let i = 0; i < 5; i++) {
    createStream(`host-${i}`, { ...cfg1, title: `Stream ${i}` });
  }
  const page1 = listStreams({}, { limit: 2, offset: 0 });
  const page2 = listStreams({}, { limit: 2, offset: 2 });
  assertEq(page1.length, 2, 'page1 size=2');
  assertEq(page2.length, 2, 'page2 size=2');
  assertIt(page1[0].id !== page2[0].id, 'pages do not overlap');

  return { passed, failed, total: passed + failed, failures };
}

// Direct execution guard (allows `node --experimental-strip-types spec/foo.spec.ts`)
if (import.meta.url === `file://${process.argv[1]}`) {
  const r = runStreamSessionSpec();
  console.log(`stream-session.spec: ${r.passed}/${r.total} passed`);
  if (r.failed > 0) {
    console.error('FAILURES:');
    for (const f of r.failures) console.error('  - ' + f);
    process.exit(1);
  }
}