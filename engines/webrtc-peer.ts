/**
 * W71-D: webrtc-peer.ts
 *
 * Typed stub wrapper around the browser RTCPeerConnection API.
 * Server-side this is exercised in two ways:
 *   1. Unit tests inject a mock factory (RTCPeerConnectionFactory).
 *   2. Production wires the real browser API via globalThis.RTCPeerConnection.
 *
 * Architecture decisions:
 * - Pure factory pattern (cycle 60+): engine code never touches globals
 *   directly. Tests inject; production passes the real browser.
 * - Stats parsing: peer.getStats() returns RTCStatsReport. We parse the
 *   inbound-rtp / outbound-rtp / candidate-pair entries into a PeerStats
 *   record so callers don't need to know the W3C stats dialect.
 * - Signaling state machine covered (stable | have-local-offer |
 *   have-remote-offer | have-local-pranswer | have-remote-pranswer | closed).
 *
 * Honest concerns:
 * - Server-side Node has no RTCPeerConnection. Spec uses MockRTCPeerConnection.
 * - Production browser code wires globalThis.RTCPeerConnection.
 * - No TURN credential rotation; that's a separate concern (cycle 67 lesson:
 *   rotate every 6h via signed TURN REST API).
 */

import { randomUUID } from 'crypto';

// ─── Type stubs for browser WebRTC APIs ─────────────────────────────────────

export type RTCSessionDescriptionInit = {
  type: 'offer' | 'answer' | 'pranswer' | 'rollback';
  sdp?: string;
};

export type RTCIceCandidateInit = {
  candidate?: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
  usernameFragment?: string | null;
};

export type IceServer = {
  urls: string | string[];
  username?: string;
  credential?: string;
};

export type PeerConfig = {
  iceServers: readonly IceServer[];
  iceTransportPolicy: 'all' | 'relay';
  bundlePolicy: 'balanced' | 'max-compat' | 'max-bundle';
};

export type PeerConnectionState =
  | 'new'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'failed'
  | 'closed';

export type IceConnectionState =
  | 'new'
  | 'checking'
  | 'connected'
  | 'completed'
  | 'failed'
  | 'disconnected'
  | 'closed';

export type IceGatheringState = 'new' | 'gathering' | 'complete';

export type SignalingState =
  | 'stable'
  | 'have-local-offer'
  | 'have-remote-offer'
  | 'have-local-pranswer'
  | 'have-remote-pranswer'
  | 'closed';

export type PeerState = {
  connectionState: PeerConnectionState;
  iceConnectionState: IceConnectionState;
  iceGatheringState: IceGatheringState;
  signalingState: SignalingState;
};

export type PeerStats = {
  rttMs: number;
  packetsLost: number;
  packetsReceived: number;
  bytesReceived: number;
  bytesSent: number;
  framesPerSecond: number;
  resolution: string;
  bitrate: number;
};

// ─── RTCStatsReport-shaped minimal stub ─────────────────────────────────────

export type RtcStatsEntry = {
  type: string;
  id: string;
  timestamp: number;
  [k: string]: unknown;
};

export type RTCStatsReportLike = {
  forEach(cb: (entry: RtcStatsEntry) => void): void;
  get(id?: string): RtcStatsEntry | undefined;
  has(id: string): boolean;
  size: number;
};

// ─── RTCPeerConnection factory contract ─────────────────────────────────────

/**
 * Minimal subset of RTCPeerConnection the engine relies on. Production wires
 * the real browser class; tests inject a mock.
 */
export interface RTCPeerConnectionLike {
  connectionState: PeerConnectionState;
  iceConnectionState: IceConnectionState;
  iceGatheringState: IceGatheringState;
  signalingState: SignalingState;
  localDescription: RTCSessionDescriptionInit | null;
  remoteDescription: RTCSessionDescriptionInit | null;
  createOffer(options?: RTCOfferOptions): Promise<RTCSessionDescriptionInit>;
  createAnswer(options?: RTCAnswerOptions): Promise<RTCSessionDescriptionInit>;
  setLocalDescription(desc: RTCSessionDescriptionInit): Promise<void>;
  setRemoteDescription(desc: RTCSessionDescriptionInit): Promise<void>;
  addIceCandidate(candidate: RTCIceCandidateInit): Promise<void>;
  getStats(): Promise<RTCStatsReportLike>;
  close(): void;
}

export type RTCOfferOptions = {
  offerToReceiveAudio?: boolean;
  offerToReceiveVideo?: boolean;
  iceRestart?: boolean;
};

export type RTCAnswerOptions = {
  iceRestart?: boolean;
};

/**
 * Factory signature. Production wires globalThis.RTCPeerConnection; tests
 * inject a MockRTCPeerConnection constructor.
 */
export interface RTCPeerConnectionFactory {
  new (config: PeerConfig): RTCPeerConnectionLike;
}

export type RTCSessionDescriptionCtor = {
  new (init: RTCSessionDescriptionInit): { toJSON(): RTCSessionDescriptionInit };
};

export type RTCIceCandidateCtor = {
  new (init: RTCIceCandidateInit): { toJSON(): RTCIceCandidateInit };
};

// ─── Factory injection ──────────────────────────────────────────────────────

let PEER_OVERRIDE: RTCPeerConnectionFactory | null = null;
let SDP_OVERRIDE: RTCSessionDescriptionCtor | null = null;
let ICE_OVERRIDE: RTCIceCandidateCtor | null = null;

export function setWebRtcFactory(
  peer: RTCPeerConnectionFactory | null,
  sdp?: RTCSessionDescriptionCtor | null,
  ice?: RTCIceCandidateCtor | null,
): void {
  PEER_OVERRIDE = peer;
  SDP_OVERRIDE = sdp ?? null;
  ICE_OVERRIDE = ice ?? null;
}

function peerFactory(): RTCPeerConnectionFactory {
  if (PEER_OVERRIDE) return PEER_OVERRIDE;
  const g = globalThis as any;
  if (typeof g.RTCPeerConnection === 'function') {
    return g.RTCPeerConnection as RTCPeerConnectionFactory;
  }
  return {
    new (_config: PeerConfig): RTCPeerConnectionLike {
      throw new Error(
        'RTCPeerConnection is not available in this environment. Provide a factory via setWebRtcFactory().',
      );
    },
  } as unknown as RTCPeerConnectionFactory;
}

function sdpFactory(): RTCSessionDescriptionCtor {
  if (SDP_OVERRIDE) return SDP_OVERRIDE;
  const g = globalThis as any;
  if (typeof g.RTCSessionDescription === 'function') {
    return g.RTCSessionDescription as RTCSessionDescriptionCtor;
  }
  // Fallback no-op class — wraps the init object.
  return class {
    init: RTCSessionDescriptionInit;
    constructor(init: RTCSessionDescriptionInit) {
      this.init = init;
    }
    toJSON(): RTCSessionDescriptionInit {
      return this.init;
    }
  } as unknown as RTCSessionDescriptionCtor;
}

function iceFactory(): RTCIceCandidateCtor {
  if (ICE_OVERRIDE) return ICE_OVERRIDE;
  const g = globalThis as any;
  if (typeof g.RTCIceCandidate === 'function') {
    return g.RTCIceCandidate as RTCIceCandidateCtor;
  }
  return class {
    init: RTCIceCandidateInit;
    constructor(init: RTCIceCandidateInit) {
      this.init = init;
    }
    toJSON(): RTCIceCandidateInit {
      return this.init;
    }
  } as unknown as RTCIceCandidateCtor;
}

// ─── Validation helpers ─────────────────────────────────────────────────────

export function validatePeerConfig(config: PeerConfig): void {
  if (!config || typeof config !== 'object') {
    throw new Error('createPeerConnection: config is required');
  }
  if (!Array.isArray(config.iceServers)) {
    throw new Error('createPeerConnection: config.iceServers must be an array');
  }
  for (const s of config.iceServers) {
    if (!s || typeof s !== 'object') {
      throw new Error('createPeerConnection: each iceServer must be an object');
    }
    if (s.urls === undefined) {
      throw new Error('createPeerConnection: iceServer.urls is required');
    }
    if (typeof s.urls !== 'string' && !Array.isArray(s.urls)) {
      throw new Error('createPeerConnection: iceServer.urls must be string or string[]');
    }
  }
  if (!['all', 'relay'].includes(config.iceTransportPolicy)) {
    throw new Error(
      `createPeerConnection: iceTransportPolicy must be all|relay (got '${config.iceTransportPolicy}')`,
    );
  }
  if (!['balanced', 'max-compat', 'max-bundle'].includes(config.bundlePolicy)) {
    throw new Error(
      `createPeerConnection: bundlePolicy must be balanced|max-compat|max-bundle (got '${config.bundlePolicy}')`,
    );
  }
}

// ─── Public API: peer lifecycle ─────────────────────────────────────────────

export function createPeerConnection(config: PeerConfig): RTCPeerConnectionLike {
  validatePeerConfig(config);
  const F = peerFactory();
  return new F(config);
}

export async function createOffer(
  peer: RTCPeerConnectionLike,
  options?: RTCOfferOptions,
): Promise<RTCSessionDescriptionInit> {
  if (!peer) throw new Error('createOffer: peer is required');
  if (peer.signalingState !== 'stable' && peer.signalingState !== 'have-remote-offer') {
    throw new Error(
      `createOffer: peer signalingState must be stable or have-remote-offer (got '${peer.signalingState}')`,
    );
  }
  const offer = await peer.createOffer(options);
  if (!offer || typeof offer !== 'object' || !offer.type || !offer.sdp) {
    throw new Error('createOffer: peer.createOffer returned an invalid SDP');
  }
  return offer;
}

export async function createAnswer(
  peer: RTCPeerConnectionLike,
  offer: RTCSessionDescriptionInit,
): Promise<RTCSessionDescriptionInit> {
  if (!peer) throw new Error('createAnswer: peer is required');
  if (!offer || offer.type !== 'offer' || !offer.sdp) {
    throw new Error('createAnswer: offer must be of type "offer" with a valid sdp');
  }
  await peer.setRemoteDescription(offer);
  const answer = await peer.createAnswer();
  if (!answer || !answer.sdp) {
    throw new Error('createAnswer: peer.createAnswer returned an invalid SDP');
  }
  return answer;
}

export async function setRemoteDescription(
  peer: RTCPeerConnectionLike,
  desc: RTCSessionDescriptionInit,
): Promise<void> {
  if (!peer) throw new Error('setRemoteDescription: peer is required');
  if (!desc || !desc.type || !desc.sdp) {
    throw new Error('setRemoteDescription: desc must include type and sdp');
  }
  await peer.setRemoteDescription(desc);
}

export async function setLocalDescription(
  peer: RTCPeerConnectionLike,
  desc: RTCSessionDescriptionInit,
): Promise<void> {
  if (!peer) throw new Error('setLocalDescription: peer is required');
  if (!desc || !desc.type || !desc.sdp) {
    throw new Error('setLocalDescription: desc must include type and sdp');
  }
  await peer.setLocalDescription(desc);
}

export async function addIceCandidate(
  peer: RTCPeerConnectionLike,
  candidate: RTCIceCandidateInit,
): Promise<void> {
  if (!peer) throw new Error('addIceCandidate: peer is required');
  if (!candidate || typeof candidate !== 'object') {
    throw new Error('addIceCandidate: candidate must be an object');
  }
  if (typeof candidate.candidate !== 'string' || candidate.candidate.length === 0) {
    throw new Error('addIceCandidate: candidate.candidate string is required');
  }
  await peer.addIceCandidate(candidate);
}

export function getPeerState(peer: RTCPeerConnectionLike): PeerState {
  if (!peer) throw new Error('getPeerState: peer is required');
  return Object.freeze({
    connectionState: peer.connectionState,
    iceConnectionState: peer.iceConnectionState,
    iceGatheringState: peer.iceGatheringState,
    signalingState: peer.signalingState,
  });
}

/**
 * Parse RTCStatsReport into a PeerStats summary.
 * - rttMs: candidate-pair currentRoundTripTime * 1000
 * - packetsLost / packetsReceived / bytesReceived: inbound-rtp
 * - bytesSent: outbound-rtp
 * - framesPerSecond: inbound-rtp framesPerSecond
 * - resolution: inbound-rtp frameWidth x frameHeight
 * - bitrate: outbound-rtp targetBitrate or bytesSent delta
 */
export async function getPeerStats(peer: RTCPeerConnectionLike): Promise<PeerStats> {
  if (!peer) throw new Error('getPeerStats: peer is required');
  const report = await peer.getStats();
  let rttMs = 0;
  let packetsLost = 0;
  let packetsReceived = 0;
  let bytesReceived = 0;
  let bytesSent = 0;
  let framesPerSecond = 0;
  let width = 0;
  let height = 0;
  let bitrate = 0;
  report.forEach((entry) => {
    if (entry.type === 'candidate-pair' && typeof entry.currentRoundTripTime === 'number') {
      rttMs = Math.max(rttMs, entry.currentRoundTripTime * 1000);
    }
    if (entry.type === 'inbound-rtp') {
      if (typeof entry.packetsLost === 'number') packetsLost += entry.packetsLost;
      if (typeof entry.packetsReceived === 'number') packetsReceived += entry.packetsReceived;
      if (typeof entry.bytesReceived === 'number') bytesReceived += entry.bytesReceived;
      if (typeof entry.framesPerSecond === 'number') {
        framesPerSecond = Math.max(framesPerSecond, entry.framesPerSecond);
      }
      if (typeof entry.frameWidth === 'number') width = Math.max(width, entry.frameWidth);
      if (typeof entry.frameHeight === 'number') height = Math.max(height, entry.frameHeight);
    }
    if (entry.type === 'outbound-rtp') {
      if (typeof entry.bytesSent === 'number') bytesSent += entry.bytesSent;
      if (typeof entry.targetBitrate === 'number') {
        bitrate = Math.max(bitrate, entry.targetBitrate);
      }
    }
  });
  if (bitrate === 0 && bytesSent > 0) {
    bitrate = bytesSent * 8; // fallback: convert to bits
  }
  return Object.freeze({
    rttMs,
    packetsLost,
    packetsReceived,
    bytesReceived,
    bytesSent,
    framesPerSecond,
    resolution: width > 0 && height > 0 ? `${width}x${height}` : '0x0',
    bitrate,
  });
}

export function closePeer(peer: RTCPeerConnectionLike): void {
  if (!peer) throw new Error('closePeer: peer is required');
  peer.close();
}

// ─── Public API: instance metadata helpers ──────────────────────────────────

export type PeerHandle = {
  peerId: string;
  peer: RTCPeerConnectionLike;
  createdAt: number;
  config: PeerConfig;
};

const HANDLE_STORE: Map<string, PeerHandle> = new Map();

export function clearPeerHandles(): void {
  HANDLE_STORE.clear();
}

export function wrapPeer(config: PeerConfig): PeerHandle {
  const peer = createPeerConnection(config);
  const peerId = 'peer_' + randomUUID();
  const handle: PeerHandle = Object.freeze({
    peerId,
    peer,
    createdAt: Date.now(),
    config,
  });
  HANDLE_STORE.set(peerId, handle);
  return handle;
}

export function getHandle(peerId: string): PeerHandle | null {
  return HANDLE_STORE.get(peerId) ?? null;
}

// ─── Public API: audit ──────────────────────────────────────────────────────

export function auditPeerConfig(config: PeerConfig): {
  iceServerCount: number;
  hasRelay: boolean;
  hasStun: boolean;
  policy: PeerConfig['iceTransportPolicy'];
  bundle: PeerConfig['bundlePolicy'];
} {
  let hasStun = false;
  let hasRelay = false;
  for (const s of config.iceServers) {
    const urls = Array.isArray(s.urls) ? s.urls : [s.urls];
    for (const u of urls) {
      if (typeof u !== 'string') continue;
      if (u.startsWith('stun:')) hasStun = true;
      if (u.startsWith('turn:') || u.startsWith('turns:')) hasRelay = true;
    }
  }
  return Object.freeze({
    iceServerCount: config.iceServers.length,
    hasStun,
    hasRelay,
    policy: config.iceTransportPolicy,
    bundle: config.bundlePolicy,
  });
}

export function auditWebRtcSurface(): {
  states: readonly PeerConnectionState[];
  iceStates: readonly IceConnectionState[];
  signalingStates: readonly SignalingState[];
  gatheringStates: readonly IceGatheringState[];
  factoryAvailable: boolean;
} {
  return Object.freeze({
    states: ['new', 'connecting', 'connected', 'disconnected', 'failed', 'closed'] as const,
    iceStates: [
      'new',
      'checking',
      'connected',
      'completed',
      'failed',
      'disconnected',
      'closed',
    ] as const,
    signalingStates: [
      'stable',
      'have-local-offer',
      'have-remote-offer',
      'have-local-pranswer',
      'have-remote-pranswer',
      'closed',
    ] as const,
    gatheringStates: ['new', 'gathering', 'complete'] as const,
    factoryAvailable: PEER_OVERRIDE !== null || typeof (globalThis as any).RTCPeerConnection === 'function',
  });
}

// Re-export for type ergonomics
export type { RTCPeerConnectionLike as RTCPeerConnection };