// Minimal Node + Browser stubs for TS --noEmit under worktree-isolated
// tsconfig. Provides enough React + DOM + ambient globals for
// StreamPlayer.tsx + spec to compile in pure-TS contexts.

declare const process: {
  env: Record<string, string | undefined>;
  platform: string;
  readonly versions?: { readonly node?: string };
  readonly pid?: number;
  exit(code?: number): never;
};

declare namespace NodeJS {
  interface Process {
    env: Record<string, string | undefined>;
  }
  interface ProcessEnv {}
}

// ----- React stub -----
declare module 'react' {
  export = React;
  export as namespace React;
}

declare namespace React {
  type ReactNode = unknown;
  type ReactElement = unknown;
  type ReactText = string | number;
  type Key = string | number | null;
  type Ref<T> = { current: T | null };
  type RefCallback<T> = (instance: T | null) => void;
  type CSSProperties = { [key: string]: string | number | undefined };

  interface HTMLAttributes {
    key?: Key;
    className?: string;
    style?: CSSProperties;
    id?: string;
    role?: string;
    children?: ReactNode;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    'aria-modal'?: boolean | 'true' | 'false';
    'aria-live'?: 'off' | 'polite' | 'assertive';
    'aria-atomic'?: boolean | 'true' | 'false';
    'aria-relevant'?: string;
    'aria-pressed'?: boolean | 'true' | 'false' | 'mixed';
    'aria-hidden'?: boolean | 'true' | 'false';
    [key: string]: unknown;
  }
  interface DOMAttributes extends HTMLAttributes {
    onClick?: (e: BaseSyntheticEvent) => void;
    onSubmit?: (e: BaseSyntheticEvent) => void;
    onChange?: (e: BaseSyntheticEvent & { target: { value: string } }) => void;
    onKeyDown?: (e: BaseSyntheticEvent & { key: string }) => void;
    disabled?: boolean;
    placeholder?: string;
    maxLength?: number;
    src?: string;
    poster?: string;
    muted?: boolean;
    autoPlay?: boolean;
    playsInline?: boolean;
    controls?: boolean;
    type?: string;
    title?: string;
    htmlFor?: string;
    dateTime?: string;
    href?: string;
    target?: string;
    rel?: string;
    value?: string;
  }
  type ButtonHTMLAttributes = HTMLAttributes & DOMAttributes;
  type InputHTMLAttributes = HTMLAttributes & DOMAttributes & { type?: string; placeholder?: string; maxLength?: number; value?: string; };
  type SelectHTMLAttributes = HTMLAttributes & DOMAttributes;
  type OptionHTMLAttributes = HTMLAttributes & DOMAttributes;
  type LabelHTMLAttributes = HTMLAttributes & DOMAttributes & { htmlFor?: string; };
  type TextareaHTMLAttributes = HTMLAttributes & DOMAttributes;
  type FormHTMLAttributes = HTMLAttributes & DOMAttributes;
  type VideoHTMLAttributes = HTMLAttributes & DOMAttributes & {
    src?: string;
    poster?: string;
    muted?: boolean;
    autoPlay?: boolean;
    playsInline?: boolean;
    controls?: boolean;
  };
  type AnchorHTMLAttributes = HTMLAttributes & DOMAttributes & { href?: string; target?: string; rel?: string; };

  // ----- Synthetic event types -----
  interface BaseSyntheticEvent {
    preventDefault: () => void;
    stopPropagation: () => void;
    currentTarget: unknown;
    target: unknown;
  }
  interface ChangeEvent<T = unknown> extends BaseSyntheticEvent {
    target: { value: string };
  }
  interface FormEvent<T = unknown> extends BaseSyntheticEvent {}
  interface KeyboardEvent<T = unknown> extends BaseSyntheticEvent {
    key: string;
  }
  interface MouseEvent<T = unknown> extends BaseSyntheticEvent {}

  function createElement(
    type: unknown,
    props?: Record<string, unknown> | null,
    ...children: unknown[]
  ): ReactElement;

  function cloneElement(
    element: ReactElement,
    props?: Record<string, unknown>,
    ...children: unknown[]
  ): ReactElement;

  const Fragment: unique symbol;
  const Component: { prototype: unknown };
  const StrictMode: unique symbol;

  type ReactFragment = unknown;

  function useState<T>(initial: T | (() => T)): [T, (v: T | ((p: T) => T)) => void];
  function useEffect(effect: () => void | (() => void), deps?: unknown[]): void;
  function useRef<T>(initial: T | null): Ref<T>;
  function useCallback<T extends (...args: never[]) => unknown>(fn: T, deps: unknown[]): T;
  function useMemo<T>(factory: () => T, deps: unknown[]): T;
  function useContext<T>(ctx: unknown): T;
  function useReducer<S, A>(
    reducer: (state: S, action: A) => S,
    initial: S,
  ): [S, (action: A) => void];
  function forwardRef<T, P = unknown>(render: (props: P, ref: Ref<T>) => ReactElement): unknown;
  function memo<P>(component: (props: P) => ReactElement): (props: P) => ReactElement;
  function createContext<T>(defaultValue: T): { Provider: unknown; Consumer: unknown };
}

// ----- JSX global namespace -----
declare namespace JSX {
  interface Element {
    type: unknown;
    props: Record<string, unknown> | null;
  }
  interface IntrinsicElements {
    div: React.HTMLAttributes;
    button: React.ButtonHTMLAttributes;
    select: React.SelectHTMLAttributes;
    option: React.OptionHTMLAttributes;
    input: React.InputHTMLAttributes;
    label: React.LabelHTMLAttributes;
    span: React.HTMLAttributes;
    p: React.HTMLAttributes;
    h1: React.HTMLAttributes;
    h2: React.HTMLAttributes;
    h3: React.HTMLAttributes;
    h4: React.HTMLAttributes;
    section: React.HTMLAttributes;
    article: React.HTMLAttributes;
    aside: React.HTMLAttributes;
    header: React.HTMLAttributes;
    footer: React.HTMLAttributes;
    nav: React.HTMLAttributes;
    main: React.HTMLAttributes;
    form: React.FormHTMLAttributes;
    ol: React.HTMLAttributes;
    ul: React.HTMLAttributes;
    li: React.HTMLAttributes;
    time: React.HTMLAttributes & { dateTime?: string };
    video: React.VideoHTMLAttributes;
    audio: React.HTMLAttributes;
    a: React.AnchorHTMLAttributes;
    button_text?: unknown;
    [elem: string]: { [key: string]: unknown; children?: unknown };
  }
  type ElementType = unknown;
}

// ----- React DOM JSX runtime -----
declare module 'react/jsx-runtime' {
  const jsx: (type: unknown, props: unknown, key?: string) => unknown;
  const jsxs: (type: unknown, props: unknown, key?: string) => unknown;
  const Fragment: unknown;
  export { jsx, jsxs, Fragment };
}

// ----- @/lib/livestream shape — what StreamPlayer.tsx depends on -----
declare module '@/lib/livestream' {
  export type StreamId = string & { readonly __brand: 'StreamId' };
  export type ChatId = string & { readonly __brand: 'ChatId' };
  export type ViewerId = string & { readonly __brand: 'ViewerId' };

  export type StreamKind =
    | 'CIGANO' | 'CANDOMBLE' | 'UMBANDA' | 'IFA'
    | 'CABALA' | 'ASTROLOGIA' | 'TANTRA';
  export type StreamState =
    | 'PENDING' | 'CONNECTING' | 'LIVE' | 'PAUSED' | 'ENDED' | 'ERROR';
  export type ChatMsgState = 'PENDING' | 'SENT' | 'FAILED' | 'MODERATED';

  export interface StreamChannel {
    readonly id: StreamId;
    readonly title: string;
    readonly kind: StreamKind;
    readonly presenterHandle: string;
    readonly presenterTradition: string;
    readonly startsAt: number;
    readonly endsAt?: number;
    readonly hlsUrl: string;
    readonly posterUrl?: string;
    readonly descriptionPtBr: string;
  }

  export interface ViewerCount {
    readonly current: number;
    readonly peak: number;
    readonly updatedAt: number;
  }

  export interface ChatMessage {
    readonly id: ChatId;
    readonly authorHandle: string;
    readonly authorTradition?: string;
    readonly body: string;
    readonly createdAt: number;
    readonly state: ChatMsgState;
  }

  export interface SacredContentFlag {
    readonly streamKind: StreamKind;
    readonly containsSacredTerms: boolean;
    readonly detectedTerms: readonly string[];
    readonly requiresAudioConsent: boolean;
  }

  export interface ChatSendResult {
    readonly ok: boolean;
    readonly tempId: ChatId;
    readonly errorCode?: string;
  }

  export interface LivestreamSession {
    getState(): StreamState;
    subscribe(cb: (s: StreamState) => void): () => void;
    getStreamUrl(): string;
    getSacredFlag(): SacredContentFlag;
    getViewerCount(): ViewerCount;
    subscribeViewerCount(cb: (v: ViewerCount) => void): () => void;
    loadChatPage(before?: number, limit?: number): readonly ChatMessage[];
    sendChat(body: string): ChatSendResult;
    subscribeChat(cb: (msg: ChatMessage) => void): () => void;
    pause(): void;
    resume(): void;
    leave(): void;
  }

  export function createLivestreamSession(channel: StreamChannel): LivestreamSession;

  export const TRADITION_KIND_LABELS: Readonly<Record<StreamKind, string>>;
  export const TRADITION_KIND_ICONS: Readonly<Record<StreamKind, string>>;
  export const STREAM_CATEGORIES: ReadonlyArray<{
    kind: StreamKind;
    labelPtBr: string;
    example: string;
  }>;

  export function makeStreamId(s: string): StreamId;
  export function makeChatId(s: string): ChatId;
  export function makeViewerId(s: string): ViewerId;
  export function listStreamKinds(): readonly StreamKind[];

  export function isAudioConsentApproved(viewerId: ViewerId): boolean;
  export function approveAudioConsent(viewerId: ViewerId): void;
  export function revokeAudioConsent(viewerId: ViewerId): void;

  export function _resetLivestreamForTests(): void;
}

declare module '*.css' {
  const classes: Readonly<Record<string, string>>;
  export default classes;
}

declare module '*.svg' {
  const url: string;
  export default url;
}
