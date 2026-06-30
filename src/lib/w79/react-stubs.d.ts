// Stubs for React, Next, lucide-react used by the W79 page components.
// At RUNTIME these resolve via the real packages (next build / runtime).
// For ISOLATED TSC we declare them so the .tsx files typecheck without
// pulling @types/react or next into the worktree tsconfig.

declare module 'react' {
  export type ReactNode = unknown;
  export interface FormEvent<T = unknown> {
    preventDefault: () => void;
  }
  export interface ChangeEvent<T = unknown> {
    target: { value: string; checked?: boolean };
  }
  export function useState<T>(initial: T | (() => T)): [T, (next: T | ((prev: T) => T)) => void];
  export function useCallback<T extends (...args: never[]) => unknown>(fn: T, deps: ReadonlyArray<unknown>): T;
  export function useMemo<T>(fn: () => T, deps: ReadonlyArray<unknown>): T;
  export const Suspense: (props: { fallback?: JSX.Element | null; children?: JSX.Element | null }) => JSX.Element;
}

declare module 'next/link' {
  const Link: (props: {
    href: string;
    className?: string;
    children?: JSX.Element | string | null;
    target?: string;
    rel?: string;
  }) => JSX.Element;
  export default Link;
}

declare module 'next/navigation' {
  export function useRouter(): { push: (href: string) => void };
  export function useSearchParams(): { get: (key: string) => string | null };
}

declare module 'lucide-react' {
  export const Sparkles: (props: { className?: string }) => JSX.Element;
  export const Eye: (props: { className?: string }) => JSX.Element;
  export const EyeOff: (props: { className?: string }) => JSX.Element;
  export const Loader2: (props: { className?: string }) => JSX.Element;
  export const AlertTriangle: (props: { className?: string }) => JSX.Element;
}

// Global JSX namespace + React namespace — non-module .d.ts global declarations
declare namespace JSX {
  interface IntrinsicElements {
    [elem: string]: unknown;
  }
  interface Element {}
  interface ElementClass {}
  interface ElementAttributesProperty {}
  interface ElementChildrenAttribute { children: {} }
}

declare namespace React {
  interface FormEvent<T = unknown> {
    preventDefault: () => void;
  }
  interface ChangeEvent<T = unknown> {
    target: { value: string; checked?: boolean };
  }
  type ReactNode = unknown;
}
