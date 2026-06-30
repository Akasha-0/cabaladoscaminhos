/**
 * W71-D: webrtc-peer.spec.ts
 *
 * Self-running spec harness for webrtc-peer.ts (no vitest binary needed).
 * Uses a MockRTCPeerConnection that satisfies the contract surface.
 */

import {
  createPeerConnection,
  createOffer,
  createAnswer,
  setRemoteDescription,
  setLocalDescription,
  addIceCandidate,
  getPeerState,
  getPeerStats,
  closePeer,
  wrapPeer,
  clearPeerHandles,
  getHandle,
  validatePeerConfig,
  auditPeerConfig,
  auditWebRtcSurface,
  setWebRtcFactory,
  type PeerConfig,
  type RTCPeerConnectionLike,
  type RTCStatsReportLike,
  type RtcStatsEntry,
} from '../engines/webrtc-peer.ts';

// ─── Mock RTCPeerConnection ────────────────────────────────────────────────

class MockRTCStatsReport implements RTCStatsReportLike {
  private readonly entries: RtcStatsEntry[];
  readonly size: number;
  constructor(entries: RtcStatsEntry[]) {
    this.entries = entries;
    this.size = entries.length;
  }
  forEach(cb: (entry: RtcStatsEntry) => void): void {
    for (const e of this.entries) cb(e);
  }
  get(id?: string): RtcStatsEntry | undefined {
    if (id === undefined) return undefined;
    return this.entries.find((e) => e.id === id);
  }
  has(id: string): boolean {
    return this.entries.some((e) => e.id === id);
  }
}

class MockRTCPeerConnection implements RTCPeerConnectionLike {
  connectionState: any = 'new';
  iceConnectionState: any = 'new';
  iceGatheringState: any = 'new';
  signalingState: any = 'stable';
  localDescription: any = null;
  remoteDescription: any = null;
  config: PeerConfig;
  private readonly _closed = { v: false };
  private readonly _statsReport: RTCStatsReportLike;

  constructor(config: PeerConfig) {
    this.config = config;
    this._statsReport = new MockRTCStatsReport([
      {
        type: 'candidate-pair',
        id: 'cp-1',
        timestamp: Date.now(),
        currentRoundTripTime: 0.045, // seconds → 45ms
      },
      {
        type: 'inbound-rtp',
        id: 'in-1',
        timestamp: Date.now(),
        packetsLost: 2,
        packetsReceived: 100,
        bytesReceived: 12345,
        framesPerSecond: 30,
        frameWidth: 1280,
        frameHeight: 720,
      },
      {
        type: 'outbound-rtp',
        id: 'out-1',
        timestamp: Date.now(),
        bytesSent: 67890,
        targetBitrate: 2_500_000,
      },
    ]);
  }

  async createOffer(): Promise<any> {
    if (this._closed.v) throw new Error('closed');
    this.signalingState = 'have-local-offer';
    return { type: 'offer', sdp: 'v=0\r\nm=video 9 UDP/TLS/RTP/SAVPF 96\r\n' };
  }
  async createAnswer(): Promise<any> {
    if (this._closed.v) throw new Error('closed');
    this.signalingState = 'have-local-pranswer';
    this.signalingState = 'stable';
    return { type: 'answer', sdp: 'v=0\r\nm=video 9 UDP/TLS/RTP/SAVPF 96\r\n' };
  }
  async setLocalDescription(desc: any): Promise<void> {
    if (this._closed.v) throw new Error('closed');
    this.localDescription = desc;
  }
  async setRemoteDescription(desc: any): Promise<void> {
    if (this._closed.v) throw new Error('closed');
    this.remoteDescription = desc;
    if (desc.type === 'offer') this.signalingState = 'have-remote-offer';
    else if (desc.type === 'answer') this.signalingState = 'stable';
  }
  async addIceCandidate(_c: any): Promise<void> {
    if (this._closed.v) throw new Error('closed');
  }
  async getStats(): Promise<RTCStatsReportLike> {
    if (this._closed.v) throw new Error('closed');
    return this._statsReport;
  }
  close(): void {
    this._closed.v = true;
    this.connectionState = 'closed';
    this.signalingState = 'closed';
  }
}

class MockRTCSessionDescription {
  init: any;
  constructor(init: any) {
    this.init = init;
  }
  toJSON() {
    return this.init;
  }
}

class MockRTCIceCandidate {
  init: any;
  constructor(init: any) {
    this.init = init;
  }
  toJSON() {
    return this.init;
  }
}

// ─── Harness ────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures: string[] = [];

function assertIt(cond: unknown, label: string): void {
  if (cond) passed++;
  else {
    failed++;
    failures.push(label);
  }
}

function assertEq<T>(actual: T, expected: T, label: string): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) passed++;
  else {
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
      failures.push(`${label}: throw '${msg}' did not match ${pattern}`);
    }
  }
}

async function assertThrowsAsync(
  promise: Promise<unknown>,
  pattern: RegExp | string,
  label: string,
): Promise<void> {
  try {
    await promise;
    failed++;
    failures.push(`${label}: expected throw, got resolve`);
  } catch (e: any) {
    const msg = e?.message ?? String(e);
    const ok = typeof pattern === 'string' ? msg.includes(pattern) : pattern.test(msg);
    if (ok) passed++;
    else {
      failed++;
      failures.push(`${label}: throw '${msg}' did not match ${pattern}`);
    }
  }
}

function section(name: string): void {
  console.log(`  ▶ ${name}`);
}

function reset(): void {
  clearPeerHandles();
  setWebRtcFactory(
    MockRTCPeerConnection as any,
    MockRTCSessionDescription as any,
    MockRTCIceCandidate as any,
  );
}

const VALID_CONFIG: PeerConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: ['turn:turn.example.com:3478'], username: 'u', credential: 'c' },
  ],
  iceTransportPolicy: 'all',
  bundlePolicy: 'balanced',
};

// ─── Tests (async-capable via .then/.catch to keep runXxxSpec sync) ─────────

export async function runWebRtcPeerSpec(): Promise<{
  passed: number;
  failed: number;
  total: number;
  failures: readonly string[];
}> {
  reset();
  passed = 0;
  failed = 0;
  failures.length = 0;

  section('validatePeerConfig');
  assertIt(validatePeerConfig(VALID_CONFIG) === undefined, 'valid config passes');
  assertThrows(
    () => validatePeerConfig(null as any),
    /config is required/,
    'null config rejected',
  );
  assertThrows(
    () => validatePeerConfig({ ...VALID_CONFIG, iceServers: 'not-array' as any }),
    /iceServers must be an array/,
    'iceServers not array rejected',
  );
  assertThrows(
    () =>
      validatePeerConfig({
        ...VALID_CONFIG,
        iceServers: [{ notUrls: 'x' } as any],
      }),
    /urls is required/,
    'missing urls rejected',
  );
  assertThrows(
    () =>
      validatePeerConfig({
        ...VALID_CONFIG,
        iceTransportPolicy: 'bogus' as any,
      }),
    /iceTransportPolicy must be/,
    'invalid iceTransportPolicy rejected',
  );
  assertThrows(
    () =>
      validatePeerConfig({
        ...VALID_CONFIG,
        bundlePolicy: 'none' as any,
      }),
    /bundlePolicy must be/,
    'invalid bundlePolicy rejected',
  );

  section('createPeerConnection');
  const peer = createPeerConnection(VALID_CONFIG);
  assertIt(peer !== null, 'peer created');
  assertEq(peer.signalingState, 'stable', 'initial signaling stable');

  section('createOffer');
  const offer = await createOffer(peer);
  assertEq(offer.type, 'offer', 'offer type=offer');
  assertIt((offer.sdp ?? '').length > 0, 'offer sdp non-empty');
  assertEq(peer.signalingState, 'have-local-offer', 'peer in have-local-offer');

  section('createAnswer');
  const peerForAnswer = createPeerConnection(VALID_CONFIG);
  await peerForAnswer.setRemoteDescription({ type: 'offer', sdp: 'v=0\r\n' });
  assertEq(peerForAnswer.signalingState, 'have-remote-offer', 'signaling=have-remote-offer');
  const answer = await createAnswer(peerForAnswer, { type: 'offer', sdp: 'v=0\r\n' });
  assertEq(answer.type, 'answer', 'answer type=answer');
  assertIt((answer.sdp ?? '').length > 0, 'answer sdp non-empty');
  assertEq(peerForAnswer.signalingState, 'stable', 'back to stable after answer');

  section('createOffer signaling guard');
  const peer3 = createPeerConnection(VALID_CONFIG);
  await peer3.setLocalDescription({ type: 'answer', sdp: 'v=0\r\n' });
  // Force an invalid state via setRemoteDescription of an offer after a local offer
  const peer4 = createPeerConnection(VALID_CONFIG);
  const o = await createOffer(peer4); // moves to have-local-offer
  // Cannot createOffer again in have-local-offer
  let guarded = false;
  try {
    await createOffer(peer4);
  } catch (e: any) {
    guarded = /must be stable or have-remote-offer/.test(e?.message ?? '');
  }
  assertIt(guarded, 'cannot createOffer twice in have-local-offer');

  section('setRemoteDescription / setLocalDescription / addIceCandidate');
  await assertThrowsAsync(
    setRemoteDescription(null as any, { type: 'offer', sdp: 'x' }),
    /peer is required/,
    'setRemoteDescription null peer',
  );
  await assertThrowsAsync(
    setRemoteDescription(peer, { type: 'offer' } as any),
    /desc must include type and sdp/,
    'setRemoteDescription invalid desc',
  );
  await assertThrowsAsync(
    setLocalDescription(null as any, { type: 'answer', sdp: 'x' }),
    /peer is required/,
    'setLocalDescription null peer',
  );
  await setLocalDescription(peer, { type: 'offer', sdp: 'v=0\r\n' });
  assertEq(peer.localDescription?.type, 'offer', 'localDescription set');
  await addIceCandidate(peer, { candidate: 'candidate:1 ...', sdpMid: '0' });
  await assertThrowsAsync(
    addIceCandidate(null as any, { candidate: 'x' }),
    /peer is required/,
    'addIceCandidate null peer',
  );
  await assertThrowsAsync(
    addIceCandidate(peer, {} as any),
    /candidate.candidate string is required/,
    'addIceCandidate missing candidate string',
  );

  section('createOffer / createAnswer validation');
  const peer5 = createPeerConnection(VALID_CONFIG);
  await assertThrowsAsync(
    createOffer(null as any),
    /peer is required/,
    'createOffer null peer',
  );
  await assertThrowsAsync(
    createAnswer(peer5, { type: 'answer', sdp: 'v=0\r\n' } as any),
    /offer must be of type "offer"/,
    'createAnswer with non-offer rejected',
  );
  await assertThrowsAsync(
    createAnswer(peer5, { type: 'offer', sdp: '' } as any),
    /offer must be of type "offer" with a valid sdp/,
    'createAnswer with empty sdp rejected',
  );

  section('getPeerState');
  const state = getPeerState(peer);
  assertEq(state.connectionState, 'new', 'connectionState=new');
  assertEq(state.iceConnectionState, 'new', 'iceConnectionState=new');
  assertEq(state.iceGatheringState, 'new', 'iceGatheringState=new');
  assertEq(state.signalingState, 'have-local-offer', 'signalingState=have-local-offer');

  section('getPeerStats — parses RTCStatsReport');
  const stats = await getPeerStats(peer);
  assertEq(stats.rttMs, 45, 'rttMs=45 (0.045s * 1000)');
  assertEq(stats.packetsLost, 2, 'packetsLost=2');
  assertEq(stats.packetsReceived, 100, 'packetsReceived=100');
  assertEq(stats.bytesReceived, 12345, 'bytesReceived=12345');
  assertEq(stats.bytesSent, 67890, 'bytesSent=67890');
  assertEq(stats.framesPerSecond, 30, 'fps=30');
  assertEq(stats.resolution, '1280x720', 'resolution=1280x720');
  assertEq(stats.bitrate, 2_500_000, 'bitrate=2.5Mbps from targetBitrate');
  assertThrows(
    () => {
      (stats as any).rttMs = 999;
    },
    /TypeError|Cannot assign to read only|read.only/,
    'PeerStats is frozen',
  );

  section('getPeerStats with empty report');
  const emptyPeer: RTCPeerConnectionLike = {
    connectionState: 'new',
    iceConnectionState: 'new',
    iceGatheringState: 'new',
    signalingState: 'stable',
    localDescription: null,
    remoteDescription: null,
    createOffer: async () => ({ type: 'offer', sdp: 'x' }),
    createAnswer: async () => ({ type: 'answer', sdp: 'x' }),
    setLocalDescription: async () => {},
    setRemoteDescription: async () => {},
    addIceCandidate: async () => {},
    getStats: async () => new MockRTCStatsReport([]),
    close: () => {},
  };
  const emptyStats = await getPeerStats(emptyPeer);
  assertEq(emptyStats.rttMs, 0, 'empty report rttMs=0');
  assertEq(emptyStats.packetsLost, 0, 'empty report packetsLost=0');
  assertEq(emptyStats.resolution, '0x0', 'empty report resolution=0x0');

  section('closePeer');
  closePeer(peer);
  assertEq(peer.connectionState, 'closed', 'connectionState=closed after close');
  assertEq(peer.signalingState, 'closed', 'signalingState=closed after close');
  assertThrows(
    () => closePeer(null as any),
    /peer is required/,
    'closePeer null peer rejected',
  );

  section('wrapPeer + clearPeerHandles');
  const handle = wrapPeer(VALID_CONFIG);
  assertIt(handle.peerId.startsWith('peer_'), 'peerId prefixed');
  assertEq(getHandle(handle.peerId)?.peerId, handle.peerId, 'handle retrievable');
  assertEq(getHandle('missing'), null, 'missing handle returns null');
  clearPeerHandles();
  assertEq(getHandle(handle.peerId), null, 'cleared handle returns null');

  section('auditPeerConfig');
  const audited = auditPeerConfig(VALID_CONFIG);
  assertEq(audited.iceServerCount, 2, 'iceServerCount=2');
  assertEq(audited.hasStun, true, 'hasStun=true');
  assertEq(audited.hasRelay, true, 'hasRelay=true');
  assertEq(audited.policy, 'all', 'policy=all');
  assertEq(audited.bundle, 'balanced', 'bundle=balanced');

  const stunOnly = auditPeerConfig({
    ...VALID_CONFIG,
    iceServers: [{ urls: 'stun:s.example.com' }],
  });
  assertEq(stunOnly.hasStun, true, 'stun-only hasStun=true');
  assertEq(stunOnly.hasRelay, false, 'stun-only hasRelay=false');

  section('auditWebRtcSurface');
  const surf = auditWebRtcSurface();
  assertEq(surf.states.length, 6, '6 connection states');
  assertEq(surf.iceStates.length, 7, '7 ice states');
  assertEq(surf.signalingStates.length, 6, '6 signaling states');
  assertEq(surf.gatheringStates.length, 3, '3 gathering states');
  assertEq(surf.factoryAvailable, true, 'factoryAvailable=true (mock injected)');

  section('factory override reset');
  setWebRtcFactory(null);
  const surf2 = auditWebRtcSurface();
  assertEq(surf2.factoryAvailable, false, 'factoryAvailable=false after clear');

  return { passed, failed, total: passed + failed, failures };
}

// Direct execution guard
if (import.meta.url === `file://${process.argv[1]}`) {
  const r = await runWebRtcPeerSpec();
  console.log(`webrtc-peer.spec: ${r.passed}/${r.total} passed`);
  if (r.failed > 0) {
    console.error('FAILURES:');
    for (const f of r.failures) console.error('  - ' + f);
    process.exit(1);
  }
}