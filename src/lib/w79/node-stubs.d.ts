// Minimal Node + Browser stubs for TS --noEmit under worktree-isolated tsconfig.
// Includes Web Speech API + React + DOM types so the engine + UI compile in pure-TS contexts.

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

// ============================================================================
// Web Speech API (browser)
// ============================================================================
declare interface SpeechSynthesisEvent extends Event {
  readonly utterance: SpeechSynthesisUtterance;
  readonly charIndex: number;
  readonly elapsedTime: number;
  readonly name: string;
}
declare interface SpeechSynthesisErrorEvent extends Event {
  readonly error: string;
  readonly utterance: SpeechSynthesisUtterance;
}
declare interface SpeechSynthesisUtterance extends EventTarget {
  text: string;
  lang: string;
  voice: SpeechSynthesisVoice | null;
  volume: number;
  rate: number;
  pitch: number;
  onstart: ((this: SpeechSynthesisUtterance, ev: Event) => unknown) | null;
  onend: ((this: SpeechSynthesisUtterance, ev: Event) => unknown) | null;
  onerror: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisErrorEvent) => unknown) | null;
  onpause: ((this: SpeechSynthesisUtterance, ev: Event) => unknown) | null;
  onresume: ((this: SpeechSynthesisUtterance, ev: Event) => unknown) | null;
  onmark: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => unknown) | null;
  onboundary: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => unknown) | null;
}
declare interface SpeechSynthesisVoice {
  readonly voiceURI: string;
  readonly name: string;
  readonly lang: string;
  readonly localService: boolean;
  readonly default: boolean;
}
declare interface SpeechSynthesis extends EventTarget {
  readonly pending: boolean;
  readonly speaking: boolean;
  readonly paused: boolean;
  onvoiceschanged: ((this: SpeechSynthesis, ev: Event) => unknown) | null;
  getVoices(): SpeechSynthesisVoice[];
  speak(utterance: SpeechSynthesisUtterance): void;
  cancel(): void;
  pause(): void;
  resume(): void;
}
declare var speechSynthesis: SpeechSynthesis | undefined;

// ============================================================================
// Blob / AudioBuffer (browser)
// ============================================================================
declare interface Blob {
  readonly size: number;
  readonly type: string;
  arrayBuffer(): Promise<ArrayBuffer>;
  text(): Promise<string>;
}
declare interface AudioBuffer {
  readonly duration: number;
  readonly numberOfChannels: number;
  readonly sampleRate: number;
  readonly length: number;
}

// ============================================================================
// DOM — minimal events + elements (for keyboard shortcuts, event handlers)
// ============================================================================
declare interface Event {
  readonly type: string;
  preventDefault(): void;
  stopPropagation(): void;
}
declare interface EventTarget {
  addEventListener(type: string, listener: (ev: Event) => unknown): void;
  removeEventListener(type: string, listener: (ev: Event) => unknown): void;
}
declare interface KeyboardEvent extends Event {
  readonly key: string;
  readonly code: string;
  readonly target: HTMLElement | null;
}
declare interface ChangeEvent<T = Element> extends Event {
  target: T;
}
declare interface HTMLElement extends EventTarget {
  readonly tagName: string;
}
declare interface Element extends EventTarget {
  readonly tagName: string;
}
declare interface Window {
  addEventListener(type: string, listener: (ev: Event) => unknown): void;
  removeEventListener(type: string, listener: (ev: Event) => unknown): void;
  setInterval(handler: () => void, ms: number): number;
  clearInterval(id: number): void;
}
declare var window: Window;

// ============================================================================
// React (minimal — for compile-time only, no runtime semantics)
// ============================================================================
declare namespace React {
  type ReactNode = unknown;
  type ReactElement = { readonly type: unknown; readonly props: unknown };
  type Key = string | number | null;
  interface CSSProperties {
    [key: string]: string | number | undefined;
  }
  type Ref<T> = { current: T | null };
  interface HTMLAttributes<T = HTMLElement> {
    id?: string;
    className?: string;
    style?: CSSProperties;
    role?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
    'aria-pressed'?: boolean;
    'aria-live'?: 'polite' | 'assertive' | 'off';
    'aria-atomic'?: boolean | 'true' | 'false';
    'aria-valuemin'?: number;
    'aria-valuemax'?: number;
    'aria-valuenow'?: number;
    'aria-valuetext'?: string;
    'aria-disabled'?: boolean;
    onClick?: (e: Event) => void;
    onChange?: (e: ChangeEvent<Element>) => void;
    onKeyDown?: (e: KeyboardEvent) => void;
    disabled?: boolean;
    type?: string;
    min?: number;
    max?: number;
    value?: string | number;
    htmlFor?: string;
    children?: ReactNode;
    key?: Key;
    'data-testid'?: string;
  }
  interface ButtonHTMLAttributes extends HTMLAttributes {
    type?: 'button' | 'submit' | 'reset';
  }
  interface SelectHTMLAttributes extends HTMLAttributes {
    onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  }
  interface InputHTMLAttributes extends HTMLAttributes {
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    min?: number;
    max?: number;
  }
  interface OptionHTMLAttributes extends HTMLAttributes {
    value?: string;
  }
  type EventHandler<T = Event> = (event: T) => void;
  type Dispatch<A> = (value: A) => void;
  type SetStateAction<S> = S | ((prev: S) => S);
  function createElement(
    type: string,
    props?: HTMLAttributes | null,
    ...children: ReactNode[]
  ): ReactElement;
  function useState<S>(initial: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  function useEffect(effect: () => void | (() => void), deps?: ReadonlyArray<unknown>): void;
  function useMemo<T>(factory: () => T, deps: ReadonlyArray<unknown>): T;
  function useCallback<T extends (...args: never[]) => unknown>(callback: T, deps: ReadonlyArray<unknown>): T;
  function useRef<T>(initial: T | null): Ref<T>;
}
declare module 'react' {
  export = React;
  export as namespace React;
}

// JSX IntrinsicElements map
declare namespace JSX {
  interface IntrinsicElements {
    div: React.HTMLAttributes;
    button: React.ButtonHTMLAttributes;
    select: React.SelectHTMLAttributes;
    option: React.OptionHTMLAttributes;
    input: React.InputHTMLAttributes;
    label: React.HTMLAttributes;
    span: React.HTMLAttributes;
    p: React.HTMLAttributes;
    h1: React.HTMLAttributes;
    h2: React.HTMLAttributes;
    h3: React.HTMLAttributes;
    section: React.HTMLAttributes;
    article: React.HTMLAttributes;
    header: React.HTMLAttributes;
    footer: React.HTMLAttributes;
    main: React.HTMLAttributes;
    nav: React.HTMLAttributes;
    aside: React.HTMLAttributes;
    ul: React.HTMLAttributes;
    li: React.HTMLAttributes;
  }
}
