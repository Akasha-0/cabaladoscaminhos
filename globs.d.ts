/**
 * W71-D: Browser API stubs for Node test environment
 *
 * Engine code (engines/*.ts) references browser APIs (RTCPeerConnection,
 * RTCSessionDescription, RTCIceCandidate, RTCStatsReport, MediaStream,
 * EventTarget, Event) that don't exist in Node by default.
 * Spec files mock these out via setWebRtcFactory().
 * Engine code uses them as TYPES only at type-check time.
 */

// ─── EventTarget / Event (browser globals) ─────────────────────────────────

declare class Event {
  readonly type: string;
  readonly target: EventTarget | null;
  readonly currentTarget: EventTarget | null;
  readonly eventPhase: number;
  readonly bubbles: boolean;
  readonly cancelable: boolean;
  readonly defaultPrevented: boolean;
  readonly timeStamp: number;
  constructor(type: string, init?: EventInit);
  preventDefault(): void;
  stopPropagation(): void;
  stopImmediatePropagation(): void;
}

declare interface EventInit {
  bubbles?: boolean;
  cancelable?: boolean;
  composed?: boolean;
}

declare class EventTarget {
  addEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions): void;
  dispatchEvent(event: Event): boolean;
}

declare type EventListener = (event: Event) => void;
declare type EventListenerObject = { handleEvent(object: Event): void };
declare type EventListenerOrEventListenerObject = EventListener | EventListenerObject;
declare interface AddEventListenerOptions {
  capture?: boolean;
  once?: boolean;
  passive?: boolean;
}
declare interface EventListenerOptions {
  capture?: boolean;
}

// ─── RTCPeerConnection minimal surface ─────────────────────────────────────

declare type RTCSdpType = 'offer' | 'answer' | 'pranswer' | 'rollback';

declare interface RTCSessionDescriptionInit {
  type: RTCSdpType;
  sdp?: string;
}

declare interface RTCIceCandidateInit {
  candidate?: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
  usernameFragment?: string | null;
}

declare interface RTCIceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

declare type RTCIceTransportPolicy = 'all' | 'relay';
declare type RTCBundlePolicy = 'balanced' | 'max-compat' | 'max-bundle';

declare interface RTCConfiguration {
  iceServers?: RTCIceServer[];
  iceTransportPolicy?: RTCIceTransportPolicy;
  bundlePolicy?: RTCBundlePolicy;
}

declare interface RTCOfferOptions {
  offerToReceiveAudio?: boolean;
  offerToReceiveVideo?: boolean;
  iceRestart?: boolean;
}

declare interface RTCAnswerOptions {
  iceRestart?: boolean;
}

declare type RTCPeerConnectionState =
  | 'new'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'failed'
  | 'closed';

declare type RTCIceConnectionState =
  | 'new'
  | 'checking'
  | 'connected'
  | 'completed'
  | 'failed'
  | 'disconnected'
  | 'closed';

declare type RTCIceGatheringState = 'new' | 'gathering' | 'complete';

declare type RTCSignalingState =
  | 'stable'
  | 'have-local-offer'
  | 'have-remote-offer'
  | 'have-local-pranswer'
  | 'have-remote-pranswer'
  | 'closed';

declare interface RTCStats {
  readonly id: string;
  readonly timestamp: number;
  readonly type: string;
  [key: string]: unknown;
}

declare interface RTCStatsReport {
  forEach(cb: (stat: RTCStats) => void): void;
  get(id?: string): RTCStats | undefined;
  has(id: string): boolean;
  readonly size: number;
}

declare class RTCError extends Event {
  readonly errorDetail: string;
  readonly message: string;
  readonly name: string;
}

declare class RTCPeerConnection extends EventTarget {
  constructor(configuration?: RTCConfiguration);
  readonly connectionState: RTCPeerConnectionState;
  readonly iceConnectionState: RTCIceConnectionState;
  readonly iceGatheringState: RTCIceGatheringState;
  readonly signalingState: RTCSignalingState;
  readonly localDescription: RTCSessionDescriptionInit | null;
  readonly remoteDescription: RTCSessionDescriptionInit | null;
  createOffer(options?: RTCOfferOptions): Promise<RTCSessionDescriptionInit>;
  createAnswer(options?: RTCAnswerOptions): Promise<RTCSessionDescriptionInit>;
  setLocalDescription(description?: RTCSessionDescriptionInit): Promise<void>;
  setRemoteDescription(description: RTCSessionDescriptionInit): Promise<void>;
  addIceCandidate(candidate: RTCIceCandidateInit): Promise<void>;
  getStats(selector?: MediaStreamTrack | null): Promise<RTCStatsReport>;
  close(): void;
  addEventListener(
    type:
      | 'connectionstatechange'
      | 'icecandidate'
      | 'iceconnectionstatechange'
      | 'icegatheringstatechange'
      | 'signalingstatechange'
      | 'track'
      | 'datachannel'
      | 'negotiationneeded',
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions,
  ): void;
}

declare class RTCSessionDescription {
  readonly type: RTCSdpType;
  readonly sdp: string;
  constructor(init: RTCSessionDescriptionInit);
  toJSON(): RTCSessionDescriptionInit;
}

declare class RTCIceCandidate {
  readonly candidate: string;
  readonly sdpMid: string | null;
  readonly sdpMLineIndex: number | null;
  readonly foundation?: string;
  readonly component?: 'rtp' | 'rtcp';
  readonly priority?: number;
  readonly protocol?: 'udp' | 'tcp';
  readonly type?: 'host' | 'srflx' | 'prflx' | 'relay';
  readonly relatedAddress?: string | null;
  readonly relatedPort?: number | null;
  readonly tcpType?: 'active' | 'passive' | 'so';
  readonly usernameFragment?: string | null;
  constructor(init: RTCIceCandidateInit);
  toJSON(): RTCIceCandidateInit;
}

// ─── MediaStream minimal surface (used as a type ref only) ─────────────────

declare interface MediaStreamConstraints {
  audio?: boolean | MediaTrackConstraints;
  video?: boolean | MediaTrackConstraints;
}

declare interface MediaTrackConstraints {
  width?: number | ConstrainULongRange;
  height?: number | ConstrainULongRange;
  frameRate?: number | ConstrainDoubleRange;
}

declare interface ConstrainULongRange {
  min?: number;
  max?: number;
  ideal?: number;
  exact?: number;
}

declare interface ConstrainDoubleRange {
  min?: number;
  max?: number;
  ideal?: number;
  exact?: number;
}

declare class MediaStream extends EventTarget {
  constructor();
  constructor(tracks: MediaStreamTrack[]);
  constructor(stream: MediaStream);
  readonly active: boolean;
  readonly id: string;
  getTracks(): MediaStreamTrack[];
  getAudioTracks(): MediaStreamTrack[];
  getVideoTracks(): MediaStreamTrack[];
  addTrack(track: MediaStreamTrack): void;
  removeTrack(track: MediaStreamTrack): void;
  clone(): MediaStream;
}

declare class MediaStreamTrack extends EventTarget {
  readonly kind: string;
  readonly id: string;
  readonly label: string;
  readonly enabled: boolean;
  readonly muted: boolean;
  readonly readyState: 'live' | 'ended';
}

// ─── Node-side type allowances (no @types/node dep) ────────────────────────

declare const process: {
  argv: string[];
  env: { [key: string]: string | undefined };
  exit(code?: number): never;
  stdout: { write(s: string): boolean };
  stderr: { write(s: string): boolean };
  cwd(): string;
  version: string;
  platform: string;
};

declare const console: {
  log(...args: unknown[]): void;
  error(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  info(...args: unknown[]): void;
  debug(...args: unknown[]): void;
};

declare class URL {
  constructor(url: string, base?: string | URL);
  href: string;
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  origin: string;
  toString(): string;
  toJSON(): string;
}

declare function setTimeout(callback: () => void, ms?: number): NodeJS.Timeout;
declare function setTimeout(callback: (...args: unknown[]) => void, ms: number, ...args: unknown[]): NodeJS.Timeout;
declare function clearTimeout(timeout: NodeJS.Timeout | string | number | undefined): void;
declare function setInterval(callback: () => void, ms?: number): NodeJS.Timeout;
declare function clearInterval(timeout: NodeJS.Timeout | string | number | undefined): void;
declare function queueMicrotask(callback: () => void): void;

declare namespace NodeJS {
  interface Timeout {
    unref(): void;
    ref(): void;
    hasRef(): boolean;
    refresh(): void;
    [Symbol.toPrimitive](): number;
  }
}

declare class Buffer extends Uint8Array {
  static from(data: string | ArrayBuffer | Uint8Array | number[], encoding?: string): Buffer;
  static alloc(size: number, fill?: string | number | Buffer): Buffer;
  static allocUnsafe(size: number): Buffer;
  static isBuffer(obj: unknown): obj is Buffer;
  static byteLength(string: string, encoding?: string): number;
  static compare(a: Uint8Array, b: Uint8Array): number;
  static concat(list: Uint8Array[], totalLength?: number): Buffer;
  toString(encoding?: string): string;
  write(string: string, encoding?: string): number;
  toJSON(): { type: 'Buffer'; data: number[] };
  length: number;
}

// ─── Module stubs (no @types/node dep) ────────────────────────────────────

declare module 'crypto' {
  export function randomUUID(): string;
  export function createHmac(algorithm: string, key: string | Buffer): {
    update(data: string | Buffer, inputEncoding?: string): {
      digest(encoding: string): string;
    };
  };
  export function createHash(algorithm: string): {
    update(data: string | Buffer, inputEncoding?: string): {
      digest(encoding: string): string;
    };
  };
}

declare module 'url' {
  export function pathToFileURL(path: string): { href: string };
  export function fileURLToPath(url: string | URL): string;
}

declare const globalThis: {
  RTCPeerConnection?: typeof RTCPeerConnection;
  RTCSessionDescription?: typeof RTCSessionDescription;
  RTCIceCandidate?: typeof RTCIceCandidate;
  MediaRecorder?: any;
  MediaStream?: typeof MediaStream;
  [key: string]: unknown;
};