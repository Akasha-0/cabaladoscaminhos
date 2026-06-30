/**
 * W71-B: Browser API stubs for Node test environment.
 *
 * These are intentionally MINIMAL — we only declare the subset of the
 * Notification / ServiceWorker / PushManager / Navigator surface that the
 * engine code touches. Pulling the full `lib.dom.d.ts` would force the
 * mocks in spec files to satisfy every property (clipboard, geolocation,
 * etc.) which isn't worth the maintenance cost.
 *
 * Engine code references browser APIs (navigator, Notification, ServiceWorker,
 * PushManager, crypto.subtle) that don't exist in Node by default. Spec files
 * mock these out via globalThis assignment. Engine code uses them as TYPES only.
 */

// ─── Minimal DOM types (we don't pull lib.dom.d.ts to keep mocks small) ───
type EventListener = (evt: Event) => void;
interface Event {
  type: string;
  target: unknown;
  currentTarget: unknown;
  bubbles: boolean;
  cancelable: boolean;
  defaultPrevented: boolean;
  eventPhase: number;
  timeStamp: number;
  composed: boolean;
  isTrusted: boolean;
  preventDefault(): void;
  stopImmediatePropagation(): void;
  stopPropagation(): void;
}
interface MessageEvent extends Event {
  readonly data: unknown;
  readonly origin: string;
  readonly lastEventId: string;
  readonly source: unknown;
  readonly ports: ReadonlyArray<unknown>;
  new (type: string, eventInitDict?: { data?: unknown; origin?: string; lastEventId?: string; source?: unknown; ports?: unknown[] }): MessageEvent;
}
interface JsonWebKey {
  kty?: string;
  crv?: string;
  alg?: string;
  use?: string;
  key_ops?: string[];
  ext?: boolean;
  d?: string;
  dp?: string;
  dq?: string;
  e?: string;
  k?: string;
  n?: string;
  p?: string;
  q?: string;
  qi?: string;
  x?: string;
  y?: string;
}
interface RequestInit {
  method?: string;
  headers?: HeadersInit;
  body?: BodyInit | null;
  mode?: RequestMode;
  credentials?: RequestCredentials;
  cache?: RequestCache;
  redirect?: RequestRedirect;
  referrer?: string;
  referrerPolicy?: ReferrerPolicy;
  integrity?: string;
  keepalive?: boolean;
  signal?: AbortSignal | null;
  window?: unknown;
}
type RequestInfo = string | Request;
type BodyInit = ArrayBuffer | ArrayBufferView | Blob | FormData | URLSearchParams | string;
type HeadersInit = Headers | Record<string, string> | Array<Array<string>>;
interface Response {
  readonly ok: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly headers: Headers;
  readonly body: ReadableStream<Uint8Array> | null;
  readonly bodyUsed: boolean;
  clone(): Response;
  text(): Promise<string>;
  json(): Promise<unknown>;
  arrayBuffer(): Promise<ArrayBuffer>;
  blob(): Promise<Blob>;
  formData(): Promise<FormData>;
  new (body?: BodyInit | null, init?: ResponseInit): Response;
}
interface ResponseInit {
  status?: number;
  statusText?: string;
  headers?: HeadersInit;
}
interface Headers {
  append(name: string, value: string): void;
  delete(name: string): void;
  get(name: string): string | null;
  has(name: string): boolean;
  set(name: string, value: string): void;
  forEach(callback: (value: string, key: string) => void): void;
  new (init?: HeadersInit): Headers;
}
interface Blob {
  readonly size: number;
  readonly type: string;
  new (parts?: Array<BlobPart>, options?: { type?: string; endings?: 'transparent' | 'native' }): Blob;
}
type BlobPart = ArrayBuffer | ArrayBufferView | Blob | string;
interface FormData {
  append(name: string, value: string | Blob): void;
  delete(name: string): void;
  get(name: string): FormDataEntryValue | null;
  getAll(name: string): FormDataEntryValue[];
  has(name: string): boolean;
  set(name: string, value: string | Blob): void;
  forEach(callback: (value: FormDataEntryValue, key: string) => void): void;
  new (): FormData;
}
type FormDataEntryValue = string | File;
interface File extends Blob {
  readonly name: string;
  readonly lastModified: number;
  new (parts: BlobPart[], name: string, options?: { type?: string; endings?: 'transparent' | 'native'; lastModified?: number }): File;
}
interface URLSearchParams {
  append(name: string, value: string): void;
  delete(name: string): void;
  get(name: string): string | null;
  getAll(name: string): string[];
  has(name: string): boolean;
  set(name: string, value: string): void;
  toString(): string;
  forEach(callback: (value: string, key: string) => void): void;
  new (init?: string | Array<Array<string>> | Record<string, string>): URLSearchParams;
}
interface ReadableStream<R = Uint8Array> {
  readonly locked: boolean;
  cancel(reason?: unknown): Promise<void>;
  getReader(): ReadableStreamDefaultReader<R>;
  pipeThrough<T>(transform: { readable: ReadableStream<T>; writable: WritableStream<R> }, options?: { preventClose?: boolean; preventAbort?: boolean; preventCancel?: boolean }): ReadableStream<T>;
  pipeTo(dest: WritableStream<R>, options?: { preventClose?: boolean; preventAbort?: boolean; preventCancel?: boolean }): Promise<void>;
  tee(): [ReadableStream<R>, ReadableStream<R>];
}
interface ReadableStreamDefaultReader<R = Uint8Array> {
  readonly closed: Promise<void>;
  cancel(reason?: unknown): Promise<void>;
  read(): Promise<{ done: boolean; value: R | undefined }>;
  releaseLock(): void;
}
interface WritableStream<R = Uint8Array> {
  readonly locked: boolean;
  abort(reason?: unknown): Promise<void>;
  close(): Promise<void>;
  getWriter(): WritableStreamDefaultWriter<R>;
}
interface WritableStreamDefaultWriter<R = Uint8Array> {
  readonly closed: Promise<void>;
  readonly desiredSize: number | null;
  readonly ready: Promise<void>;
  abort(reason?: unknown): Promise<void>;
  close(): Promise<void>;
  releaseLock(): void;
  write(chunk: R): Promise<void>;
}
interface AbortSignal {
  readonly aborted: boolean;
  readonly reason: unknown;
  throwIfAborted(): void;
  addEventListener(type: 'abort', listener: EventListener): void;
  removeEventListener(type: 'abort', listener: EventListener): void;
}
declare var AbortSignal: { new (): AbortSignal; abort(reason?: unknown): AbortSignal; timeout(ms: number): AbortSignal };
declare var Headers: { new (init?: HeadersInit): Headers };
declare var Response: { new (body?: BodyInit | null, init?: ResponseInit): Response };
declare var Request: { new (input: RequestInfo, init?: RequestInit): Request };
declare var Blob: { new (parts?: Array<BlobPart>, options?: { type?: string; endings?: 'transparent' | 'native' }): Blob };
declare var FormData: { new (): FormData };
declare var File: { new (parts: BlobPart[], name: string, options?: { type?: string; endings?: 'transparent' | 'native'; lastModified?: number }): File };
declare var URLSearchParams: { new (init?: string | Array<Array<string>> | Record<string, string>): URLSearchParams };
type RequestMode = 'same-origin' | 'no-cors' | 'cors' | 'navigate';
type RequestCredentials = 'omit' | 'same-origin' | 'include';
type RequestCache = 'default' | 'no-store' | 'reload' | 'no-cache' | 'force-cache' | 'only-if-cached';
type RequestRedirect = 'follow' | 'error' | 'manual';
type ReferrerPolicy = '' | 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
declare var fetch: ((input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) | undefined;

// ─── Minimal Notification API stubs ───
type NotificationPermission = 'default' | 'granted' | 'denied';

interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

interface NotificationOptions {
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: unknown;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  dir?: 'auto' | 'ltr' | 'rtl';
  lang?: string;
  renotify?: boolean;
  silent?: boolean;
  timestamp?: number;
  vibrate?: number | number[];
}

interface Notification {
  readonly title: string;
  readonly body: string;
  readonly icon?: string;
  readonly badge?: string;
  readonly tag?: string;
  readonly data?: unknown;
  readonly requireInteraction?: boolean;
  readonly actions?: ReadonlyArray<NotificationAction>;
  close(): void;
  addEventListener(type: 'click' | 'close' | 'error' | 'show', listener: EventListener): void;
  removeEventListener(type: 'click' | 'close' | 'error' | 'show', listener: EventListener): void;
}

interface NotificationStatic {
  readonly permission: NotificationPermission;
  readonly maxActions: number;
  new (title: string, options?: NotificationOptions): Notification;
  requestPermission(callback?: (permission: NotificationPermission) => void): Promise<NotificationPermission>;
}

// ─── Minimal ServiceWorker API stubs ───
type ServiceWorkerUpdateViaCache = 'imports' | 'all' | 'none';
type ServiceWorkerState = 'installing' | 'installed' | 'activating' | 'activated' | 'redundant';

interface ServiceWorkerRegistration {
  readonly scope: string;
  readonly active: ServiceWorker | null;
  readonly installing: ServiceWorker | null;
  readonly waiting: ServiceWorker | null;
  readonly updateViaCache: ServiceWorkerUpdateViaCache;
  readonly pushManager: PushManager;
  update(): Promise<void>;
  unregister(): Promise<boolean>;
  showNotification(title: string, options?: NotificationOptions): Promise<void>;
  getNotifications(filter?: { tag?: string }): Promise<Notification[]>;
}

interface ServiceWorkerContainer {
  readonly controller: ServiceWorker | null;
  readonly ready: Promise<ServiceWorkerRegistration>;
  register(scriptUrl: string, options?: { scope?: string }): Promise<ServiceWorkerRegistration>;
  getRegistration(scope?: string): Promise<ServiceWorkerRegistration | undefined>;
  getRegistrations(): Promise<ReadonlyArray<ServiceWorkerRegistration>>;
  addEventListener(type: 'message' | 'controllerchange' | 'install' | 'activate', listener: EventListener): void;
  removeEventListener(type: 'message' | 'controllerchange' | 'install' | 'activate', listener: EventListener): void;
}

interface ServiceWorker {
  readonly scriptURL: string;
  readonly state: ServiceWorkerState;
  postMessage(message: unknown): void;
  addEventListener(type: 'statechange' | 'error' | 'message', listener: EventListener): void;
  removeEventListener(type: 'statechange' | 'error' | 'message', listener: EventListener): void;
}

// ─── Minimal PushManager stubs ───
type PushEncryptionKeyName = 'p256dh' | 'aes128gcm' | 'aesgcm';

interface PushSubscriptionOptions {
  userVisibleOnly?: boolean;
  applicationServerKey?: string | ArrayBuffer | Uint8Array | null;
}

interface PushSubscriptionJSON {
  endpoint: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
  expirationTime?: number | null;
}

interface PushSubscription {
  readonly endpoint: string;
  readonly expirationTime: number | null | undefined;
  readonly options: PushSubscriptionOptions;
  getKey(name: PushEncryptionKeyName): ArrayBuffer | null;
  toJSON(): PushSubscriptionJSON;
  unsubscribe(): Promise<boolean>;
}

interface PushManager {
  readonly supportedContentEncodings: ReadonlyArray<string>;
  getSubscription(): Promise<PushSubscription | null>;
  subscribe(options: PushSubscriptionOptions): Promise<PushSubscription>;
  permissionState(options?: PushSubscriptionOptions): Promise<NotificationPermission>;
}

// ─── Minimal Navigator stub (only what we use) ───
interface Navigator {
  readonly serviceWorker?: ServiceWorkerContainer;
}

// ─── crypto.subtle stubs (used only as types) ───
interface SubtleCrypto {
  generateKey(algorithm: string | { name: string; namedCurve?: string }, extractable: boolean, keyUsages: string[]): Promise<unknown>;
  exportKey(format: string, key: unknown): Promise<ArrayBuffer | string>;
  importKey(format: string, keyData: ArrayBuffer | string, algorithm: string | { name: string; namedCurve?: string }, extractable: boolean, keyUsages: string[]): Promise<unknown>;
  sign(algorithm: string | { name: string; hash?: string }, key: unknown, data: ArrayBuffer): Promise<ArrayBuffer>;
  deriveKey(algorithm: string, baseKey: unknown, derivedKeyAlgorithm: string | { name: string; length: number }, extractable: boolean, keyUsages: string[]): Promise<unknown>;
  deriveBits(algorithm: string, baseKey: unknown, length: number): Promise<ArrayBuffer>;
  encrypt(algorithm: string | { name: string; iv?: ArrayBuffer | Uint8Array; additionalData?: ArrayBuffer | Uint8Array }, key: unknown, data: ArrayBuffer | Uint8Array): Promise<ArrayBuffer>;
  decrypt(algorithm: string | { name: string; iv?: ArrayBuffer | Uint8Array; additionalData?: ArrayBuffer | Uint8Array }, key: unknown, data: ArrayBuffer | Uint8Array): Promise<ArrayBuffer>;
}

interface Crypto {
  readonly subtle: SubtleCrypto;
}

interface GlobalScope {
  readonly crypto: Crypto;
  readonly navigator: Navigator;
}

// ─── Node global fallbacks (when used as types in engine code) ───
declare global {
  type BrowserNavigator = Navigator;
  type BrowserNotification = Notification;
  type BrowserNotificationStatic = NotificationStatic;
  type BrowserServiceWorkerRegistration = ServiceWorkerRegistration;
  type BrowserPushSubscription = PushSubscription;
}

// Type-only — declared here so TS does not error when engines reference browser globals
declare var navigator: Navigator | undefined;
declare var Notification: NotificationStatic | undefined;
declare var self: GlobalScope | undefined;