// Minimal React + JSX stubs for type-checking the moderation admin page.
// Module-style: declare global React namespace + JSX IntrinsicElements
// since @types/react isn't installed in this isolated tsconfig scope.

declare global {
  namespace React {
    type ReactNode =
      | string
      | number
      | boolean
      | null
      | undefined
      | ReactElement
      | ReactNodeArray;
    interface ReactNodeArray extends Array<ReactNode> {}
    type Key = string | number | bigint;
    type Ref<T> = { current: T | null } | ((instance: T | null) => void) | null;

    interface Props {
      children?: ReactNode;
      key?: Key | null;
      ref?: Ref<unknown>;
    }

    interface CSSProperties {
      [key: string]: string | number | undefined;
    }

    interface ReactElement<P = unknown> {
      type: string | ReactComponentType<P>;
      props: P;
      key: Key | null;
    }

    interface Component<P = unknown, S = unknown> {
      props: P;
      state: S;
      setState(state: Partial<S>): void;
      render(): ReactNode;
    }

    type ReactComponentType<P = unknown> =
      | string
      | ((props: P) => ReactElement | null)
      | (new (props: P) => Component<P>);

    interface SyntheticEvent {
      stopPropagation(): void;
      preventDefault(): void;
      target: { value: string; checked?: boolean };
    }
    interface KeyboardEvent extends SyntheticEvent {
      key: string;
    }

    interface MouseEventHandler<T = unknown> {
      (event: SyntheticEvent): void;
    }
    interface ChangeEventHandler<T = unknown> {
      (event: SyntheticEvent): void;
    }
    interface KeyboardEventHandler<T = unknown> {
      (event: KeyboardEvent): void;
    }

    interface HTMLAttributes<T = unknown> {
      key?: Key | null;
      ref?: Ref<unknown>;
      style?: CSSProperties | undefined;
      role?: string;
      id?: string;
      'aria-label'?: string;
      'aria-selected'?: boolean;
      'aria-pressed'?: boolean;
      'aria-live'?: 'polite' | 'assertive' | 'off';
      'aria-atomic'?: boolean;
      'aria-hidden'?: boolean;
      'aria-modal'?: boolean;
      'aria-labelledby'?: string;
      'aria-busy'?: boolean;
      'aria-relevant'?: string;
      'aria-keyshortcuts'?: string;
      tabIndex?: number;
      onClick?: MouseEventHandler;
      onKeyDown?: KeyboardEventHandler;
      onChange?: ChangeEventHandler;
      children?: ReactNode;
    }

    interface ButtonHTMLAttributes<T = unknown> extends HTMLAttributes<T> {
      type?: 'button' | 'submit' | 'reset';
      disabled?: boolean;
    }

    interface InputHTMLAttributes<T = unknown> extends HTMLAttributes<T> {
      type?: string;
      value?: string | number;
      placeholder?: string;
      checked?: boolean;
    }

    interface ULProps extends HTMLAttributes {
      onKeyDown?: KeyboardEventHandler;
      tabIndex?: number;
    }

    interface LIProps extends HTMLAttributes {
      onClick?: MouseEventHandler;
    }

    interface DetailsHTMLAttributes extends HTMLAttributes {}

    type EventHandler<E> = (event: E) => void;

    function createElement<P extends Props>(
      type: string | ReactComponentType<P>,
      props?: P | null,
      ...children: ReactNode[]
    ): ReactElement<P>;
    function useState<S>(
      initial: S | (() => S),
    ): [S, (s: S | ((s: S) => S)) => void];
    function useEffect(
      effect: () => void | (() => void),
      deps?: ReadonlyArray<unknown>,
    ): void;
    function useMemo<T>(factory: () => T, deps: ReadonlyArray<unknown>): T;
    function useCallback<T>(callback: T, deps: ReadonlyArray<unknown>): T;
  }

  namespace JSX {
    interface IntrinsicElements {
      main: React.HTMLAttributes;
      header: React.HTMLAttributes;
      h1: React.HTMLAttributes;
      h2: React.HTMLAttributes;
      p: React.HTMLAttributes;
      nav: React.HTMLAttributes;
      button: React.ButtonHTMLAttributes;
      section: React.HTMLAttributes;
      input: React.InputHTMLAttributes;
      span: React.HTMLAttributes;
      ul: React.ULProps;
      li: React.LIProps;
      aside: React.HTMLAttributes;
      div: React.HTMLAttributes;
      footer: React.HTMLAttributes;
      strong: React.HTMLAttributes;
      details: React.DetailsHTMLAttributes;
      summary: React.HTMLAttributes;
    }
    type Element = React.ReactElement;
    type ElementClass = React.Component;
  }

  interface Window {
    confirm(message?: string): boolean;
  }
  var window: Window;
  var document: {
    getElementById(id: string): { focus(): void } | null;
  };
}

declare module 'react' {
  namespace React {
    type ReactNode =
      | string
      | number
      | boolean
      | null
      | undefined
      | ReactElement
      | ReactNodeArray;
    interface ReactNodeArray extends Array<ReactNode> {}
    type Key = string | number | bigint;
    type Ref<T> = { current: T | null } | ((instance: T | null) => void) | null;
    interface Props {
      children?: ReactNode;
      key?: Key | null;
      ref?: Ref<unknown>;
    }
    interface CSSProperties {
      [key: string]: string | number | undefined;
    }
    interface ReactElement<P = unknown> {
      type: string | ReactComponentType<P>;
      props: P;
      key: Key | null;
    }
    interface Component<P = unknown, S = unknown> {
      props: P;
      state: S;
      setState(state: Partial<S>): void;
      render(): ReactNode;
    }
    type ReactComponentType<P = unknown> =
      | string
      | ((props: P) => ReactElement | null)
      | (new (props: P) => Component<P>);
    interface SyntheticEvent {
      stopPropagation(): void;
      preventDefault(): void;
      target: { value: string; checked?: boolean };
    }
    interface KeyboardEvent extends SyntheticEvent {
      key: string;
    }
    interface MouseEventHandler<T = unknown> {
      (event: SyntheticEvent): void;
    }
    interface ChangeEventHandler<T = unknown> {
      (event: SyntheticEvent): void;
    }
    interface KeyboardEventHandler<T = unknown> {
      (event: KeyboardEvent): void;
    }
    interface HTMLAttributes<T = unknown> {
      key?: Key | null;
      ref?: Ref<unknown>;
      style?: CSSProperties | undefined;
      role?: string;
      id?: string;
      'aria-label'?: string;
      'aria-selected'?: boolean;
      'aria-pressed'?: boolean;
      'aria-live'?: 'polite' | 'assertive' | 'off';
      'aria-atomic'?: boolean;
      'aria-hidden'?: boolean;
      'aria-modal'?: boolean;
      'aria-labelledby'?: string;
      'aria-busy'?: boolean;
      'aria-relevant'?: string;
      'aria-keyshortcuts'?: string;
      tabIndex?: number;
      onClick?: MouseEventHandler;
      onKeyDown?: KeyboardEventHandler;
      onChange?: ChangeEventHandler;
      children?: ReactNode;
    }
    interface ButtonHTMLAttributes<T = unknown> extends HTMLAttributes<T> {
      type?: 'button' | 'submit' | 'reset';
      disabled?: boolean;
    }
    interface InputHTMLAttributes<T = unknown> extends HTMLAttributes<T> {
      type?: string;
      value?: string | number;
      placeholder?: string;
      checked?: boolean;
    }
    interface ULProps extends HTMLAttributes {
      onKeyDown?: KeyboardEventHandler;
      tabIndex?: number;
    }
    interface LIProps extends HTMLAttributes {
      onClick?: MouseEventHandler;
    }
    interface DetailsHTMLAttributes extends HTMLAttributes {}
    type EventHandler<E> = (event: E) => void;
    function createElement<P extends Props>(
      type: string | ReactComponentType<P>,
      props?: P | null,
      ...children: ReactNode[]
    ): ReactElement<P>;
    function useState<S>(
      initial: S | (() => S),
    ): [S, (s: S | ((s: S) => S)) => void];
    function useEffect(
      effect: () => void | (() => void),
      deps?: ReadonlyArray<unknown>,
    ): void;
    function useMemo<T>(factory: () => T, deps: ReadonlyArray<unknown>): T;
    function useCallback<T>(callback: T, deps: ReadonlyArray<unknown>): T;
  }
  export = React;
  export as namespace React;
}

declare module 'react/jsx-runtime' {
  export function jsx(type: string, props?: unknown): React.ReactElement;
  export function jsxs(type: string, props?: unknown): React.ReactElement;
  export const Fragment: unique symbol;
}

export {};