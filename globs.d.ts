/**
 * W71-C: Browser API stubs for Node test environment
 *
 * Engine code (engines/*.ts) references browser APIs (MediaRecorder, HTMLMediaElement,
 * Blob, FileReader, navigator, fetch, AbortController) that don't exist in Node by default.
 * Spec files mock these out. Engine code uses them as TYPES only.
 */

// ─── Minimal MediaRecorder type stubs ───
declare type RecordingState = 'inactive' | 'recording' | 'paused';

interface MediaRecorderOptions {
  mimeType?: string;
  audioBitsPerSecond?: number;
  videoBitsPerSecond?: number;
  audioBitrate?: number;
  videoBitrate?: number;
  bitsPerSecond?: number;
}

interface MediaRecorderEventMap {
  dataavailable: MediaRecorderDataAvailableEvent;
  error: MediaRecorderErrorEvent;
  start: Event;
  stop: Event;
  pause: Event;
  resume: Event;
}

interface MediaRecorderDataAvailableEvent extends Event {
  data: any;
}

interface MediaRecorderErrorEvent extends Event {
  error: any;
}

interface BlobEvent extends Event {
  data: Blob;
}

declare class MediaRecorder extends EventTarget {
  static isTypeSupported(mimeType: string): boolean;
  readonly stream: MediaStream | null;
  readonly mimeType: string;
  readonly state: RecordingState;
  readonly videoBitsPerSecond: number;
  readonly audioBitsPerSecond: number;
  readonly ondataavailable: ((ev: MediaRecorderDataAvailableEvent) => void) | null;
  readonly onerror: ((ev: MediaRecorderErrorEvent) => void) | null;
  readonly onstart: ((ev: Event) => void) | null;
  readonly onstop: ((ev: Event) => void) | null;
  readonly onpause: ((ev: Event) => void) | null;
  readonly onresume: ((ev: Event) => void) | null;
  constructor(stream: MediaStream | null, options?: MediaRecorderOptions);
  start(timeslice?: number): void;
  stop(): void;
  pause(): void;
  resume(): void;
  requestData(): void;
}

interface MediaStreamConstraints {
  audio?: boolean | object;
  video?: boolean | object;
}

interface MediaStream extends EventTarget {
  readonly active: boolean;
  readonly id: string;
  getTracks(): MediaStreamTrack[];
  getAudioTracks(): MediaStreamTrack[];
  getVideoTracks(): MediaStreamTrack[];
}

interface MediaStreamTrack extends EventTarget {
  readonly kind: string;
  readonly id: string;
  readonly label: string;
  readonly enabled: boolean;
  readonly muted: boolean;
  stop(): void;
}

interface MediaDevices {
  getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
  enumerateDevices(): Promise<MediaDeviceInfo[]>;
}

interface MediaDeviceInfo {
  readonly deviceId: string;
  readonly kind: string;
  readonly label: string;
  readonly groupId: string;
}

interface Navigator {
  readonly mediaDevices: MediaDevices;
  readonly userAgent: string;
  readonly language: string;
  readonly languages: readonly string[];
}

declare const navigator: Navigator;

// ─── DOM element types ───
declare class HTMLMediaElement extends EventTarget {
  readonly src: string;
  readonly currentSrc: string;
  readonly duration: number;
  readonly currentTime: number;
  readonly volume: number;
  readonly muted: boolean;
  readonly defaultPlaybackRate: number;
  readonly playbackRate: number;
  readonly paused: boolean;
  readonly ended: boolean;
  readonly readyState: number;
  readonly buffered: TimeRanges;
  readonly networkState: number;
  readonly error: MediaError | null;
  load(): Promise<void>;
  play(): Promise<void>;
  pause(): void;
  readonly onplay: ((ev: Event) => void) | null;
  readonly onpause: ((ev: Event) => void) | null;
  readonly ontimeupdate: ((ev: Event) => void) | null;
  readonly onloadedmetadata: ((ev: Event) => void) | null;
  readonly onended: ((ev: Event) => void) | null;
}

interface TimeRanges {
  readonly length: number;
  start(index: number): number;
  end(index: number): number;
}

interface MediaError {
  readonly code: number;
  readonly message: string | null;
}

// ─── Blob / FileReader ───
interface BlobPart {
  toString(): string;
}

declare class Blob {
  constructor(parts?: BlobPart[], options?: { type?: string; endings?: 'transparent' | 'native' });
  readonly size: number;
  readonly type: string;
  slice(start?: number, end?: number, contentType?: string): Blob;
  stream(): ReadableStream<Uint8Array>;
  text(): Promise<string>;
  arrayBuffer(): Promise<ArrayBuffer>;
}

interface FileReaderEventMap {
  load: ProgressEvent;
  loadend: ProgressEvent;
  error: ProgressEvent;
  loadstart: ProgressEvent;
  progress: ProgressEvent;
  abort: ProgressEvent;
}

interface ProgressEvent extends Event {
  readonly lengthComputable: boolean;
  readonly loaded: number;
  readonly total: number;
}

declare class FileReader extends EventTarget implements EventTarget {
  readonly readyState: number;
  readonly result: string | ArrayBuffer | null;
  readonly error: DOMException | null;
  readonly onload: ((ev: ProgressEvent) => void) | null;
  readonly onerror: ((ev: ProgressEvent) => void) | null;
  readonly onprogress: ((ev: ProgressEvent) => void) | null;
  readAsArrayBuffer(blob: Blob): void;
  readAsDataURL(blob: Blob): void;
  readAsText(blob: Blob, encoding?: string): void;
  abort(): void;
}

// ─── Fetch / AbortController / ReadableStream / Response ───
declare const fetch: any;

declare class AbortController {
  readonly signal: AbortSignal;
  abort(reason?: any): void;
}

interface AbortSignal {
  readonly aborted: boolean;
  addEventListener(type: 'abort', listener: (ev: any) => void): void;
  removeEventListener(type: 'abort', listener: (ev: any) => void): void;
}

declare class ReadableStream<T> {
  constructor(source: any);
  readonly locked: boolean;
  cancel(reason?: any): Promise<void>;
  getReader(): any;
  pipeThrough(dest: any): ReadableStream<T>;
  pipeTo(dest: any): Promise<void>;
  tee(): [ReadableStream<T>, ReadableStream<T>];
}

declare class FormData {
  append(name: string, value: string | Blob, filename?: string): void;
  delete(name: string): void;
  get(name: string): any;
  has(name: string): boolean;
  set(name: string, value: string | Blob, filename?: string): void;
  forEach(callback: (value: any, key: string, parent: FormData) => void): void;
}

declare const FormData: {
  prototype: FormData;
  new (): FormData;
};

interface URL {
  static createObjectURL(blob: Blob | MediaSource): string;
  static revokeObjectURL(url: string): void;
  static parse(url: string): URL;
}

declare class URL {
  constructor(url: string, base?: string);
  readonly href: string;
  readonly origin: string;
  readonly protocol: string;
  readonly host: string;
  readonly hostname: string;
  readonly pathname: string;
  readonly search: string;
  readonly searchParams: URLSearchParams;
  readonly hash: string;
  toString(): string;
}

// ─── Node-style globals (TS-only stubs; real Node has these) ───
declare const process: {
  env: { [k: string]: string | undefined };
  argv: string[];
  pid: number;
  exit(code?: number): never;
  stdout: { write(s: string): boolean };
  stderr: { write(s: string): boolean };
  version: string;
  versions: { node: string };
  nextTick: (cb: () => void) => void;
};

declare const Buffer: {
  from(data: ArrayBuffer | Uint8Array | string, encoding?: string): any;
  alloc(size: number): any;
  toString(encoding?: string): string;
  isBuffer(x: any): boolean;
};

declare function setTimeout(cb: () => void, ms?: number): any;
declare function setInterval(cb: () => void, ms?: number): any;
declare function clearTimeout(id: any): void;
declare function clearInterval(id: any): void;
declare function queueMicrotask(cb: () => void): void;

// EventEmitter base class (Node-side).
declare class EventEmitter {
  on(event: string, listener: (...args: any[]) => void): this;
  off(event: string, listener: (...args: any[]) => void): this;
  emit(event: string, ...args: any[]): boolean;
  removeAllListeners(event?: string): this;
}

// EventTarget polyfill (browser-style).
interface Event {
  readonly type: string;
  readonly target: any;
  readonly currentTarget: any;
}
declare class EventTarget {
  addEventListener(type: string, listener: any, options?: any): void;
  removeEventListener(type: string, listener: any): void;
  dispatchEvent(event: Event): boolean;
}

declare class DOMException extends Error {
  readonly name: string;
  readonly message: string;
}

declare const console: {
  log(...args: any[]): void;
  error(...args: any[]): void;
  warn(...args: any[]): void;
  info(...args: any[]): void;
  debug(...args: any[]): void;
};

// url/path module stubs (we only use fileURLToPath + dirname + resolve).
declare module 'url' {
  export function fileURLToPath(url: string | URL): string;
}
declare module 'path' {
  export function dirname(p: string): string;
  export function resolve(...paths: string[]): string;
  export function join(...paths: string[]): string;
}

declare const globalThis: {
  navigator?: Navigator;
  fetch?: typeof fetch;
  MediaRecorder?: typeof MediaRecorder;
  Blob?: typeof Blob;
  FileReader?: typeof FileReader;
  URL?: typeof URL;
  FormData?: typeof FormData;
  AbortController?: typeof AbortController;
  ReadableStream?: typeof ReadableStream;
  Buffer?: typeof Buffer;
  atob?: (s: string) => string;
  btoa?: (s: string) => string;
  process?: typeof process;
};
