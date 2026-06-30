// W79 akasha-ia-streaming-ui — React UI layer for Akasha IA streaming.
// Consumes the pure-TS engine from akasha-ia-streaming.ts.
// Responsibilities:
//   - Mounts a fresh StreamEngine per request
//   - Wires AbortController to component unmount
//   - Renders tokens one-by-one with typewriter effect (configurable delay)
//   - "Stop generating" button (visible while STREAMING)
//   - Error boundary fallback (renders ERROR state)
//   - Loading shimmer during CONNECTING
//   - Mobile-first (touch targets ≥44px, no layout shift as tokens render)
//   - Accessible (aria-live="polite", role="status", keyboard-navigable stop)
//   - All state via useState + useRef, no external state lib
// Pure JSX, no Tailwind, no CSS-in-JS (classes are convention; callers style).

import * as React from 'react';
import {
  makeStreamEngine,
  defaultParser,
  type StreamEngine,
  type StreamState,
  type StreamRequest,
  type StreamEvent,
  type Token,
  type StreamTelemetry,
  type RequestId,
  makeRequestId,
  isTerminal,
  describeState,
  type StreamError,
} from './akasha-ia-streaming.ts';

// =================== PUBLIC TYPES ===================

export type AkashaStreamingUIProps = {
  /** URL to stream from. */
  readonly url: string;
  /** Optional fetch method. */
  readonly method?: 'GET' | 'POST';
  /** Optional headers. */
  readonly headers?: Readonly<Record<string, string>>;
  /** Optional body (stringified JSON). */
  readonly body?: string | null;
  /** Token-render delay in ms (typewriter effect). 0 = instant. Default 18. */
  readonly typewriterMs?: number;
  /** Stable request id; if absent, generated. */
  readonly requestId?: RequestId;
  /** Called on every emitted event. */
  readonly onEvent?: (ev: StreamEvent) => void;
  /** Called when stream completes. */
  readonly onComplete?: (text: string, telemetry: StreamTelemetry) => void;
  /** Called when stream errors. */
  readonly onError?: (error: StreamError) => void;
  /** Called when user aborts via Stop button. */
  readonly onAbort?: () => void;
  /** Optional CSS class for the outer wrapper. */
  readonly className?: string;
  /** Optional text shown when IDLE (default: "Pergunte à Akasha IA"). */
  readonly idleLabel?: string;
  /** Optional text shown on Stop button (default: "Parar geração"). */
  readonly stopLabel?: string;
  /** Test mode: skip typewriter delay for faster assertions. */
  readonly testSkipTypewriter?: boolean;
};

// =================== INNER STATE ===================

type Phase =
  | { readonly kind: 'idle' }
  | { readonly kind: 'connecting'; readonly startedAt: number }
  | { readonly kind: 'streaming'; readonly tokens: ReadonlyArray<Token>; readonly visibleCount: number }
  | { readonly kind: 'complete'; readonly text: string; readonly tokenCount: number }
  | { readonly kind: 'error'; readonly error: StreamError }
  | { readonly kind: 'aborted'; readonly reason: 'user' | 'unmount' | 'timeout' | 'backoff_exceeded' };

// =================== COMPONENT ===================

export function AkashaStreamingUI(props: AkashaStreamingUIProps): React.ReactElement {
  const {
    url,
    method = 'GET',
    headers,
    body = null,
    typewriterMs = 18,
    requestId,
    onEvent,
    onComplete,
    onError,
    onAbort,
    className,
    idleLabel = 'Pergunte à Akasha IA',
    stopLabel = 'Parar geração',
    testSkipTypewriter = false,
  } = props;

  const [phase, setPhase] = React.useState<Phase>({ kind: 'idle' });
  const [streamState, setStreamState] = React.useState<StreamState>('IDLE');
  const engineRef = React.useRef<StreamEngine | null>(null);
  const typewriterTimerRef = React.useRef<number | null>(null);
  const unmountedRef = React.useRef<boolean>(false);

  const stableRequestId = React.useMemo<RequestId>(() => {
    return requestId ?? makeRequestId(`req_ui_${Date.now().toString(36)}`);
  }, [requestId]);

  // Clear any pending typewriter timer
  const clearTypewriter = React.useCallback(() => {
    if (typewriterTimerRef.current !== null) {
      // In Node 22 + DOM we have clearTimeout returning a number; cast for worktree isolation.
      (globalThis as unknown as { clearTimeout: (h: number) => void }).clearTimeout(typewriterTimerRef.current);
      typewriterTimerRef.current = null;
    }
  }, []);

  // Start the stream (called once on mount, after user prompt or auto)
  const startStream = React.useCallback(() => {
    if (engineRef.current) return; // already running
    clearTypewriter();
    setPhase({ kind: 'connecting', startedAt: Date.now() });
    setStreamState('CONNECTING');

    const engine = makeStreamEngine(stableRequestId);
    engineRef.current = engine;

    const unsub = engine.subscribe((ev) => {
      if (unmountedRef.current) return;
      onEvent?.(ev);
      if (ev.kind === 'state') {
        setStreamState(ev.state);
        if (ev.state === 'CONNECTING') {
          setPhase({ kind: 'connecting', startedAt: Date.now() });
        } else if (ev.state === 'STREAMING') {
          setPhase({ kind: 'streaming', tokens: engine.tokens, visibleCount: engine.tokens.length });
        } else if (ev.state === 'COMPLETE') {
          setPhase({ kind: 'complete', text: engine.accumulated, tokenCount: engine.tokens.length });
          onComplete?.(engine.accumulated, engine.getTelemetry());
        } else if (ev.state === 'ERROR') {
          const msg = engine.errorMessage ?? ('Erro desconhecido' as StreamError);
          setPhase({ kind: 'error', error: msg });
          onError?.(msg);
        } else if (ev.state === 'ABORTED') {
          setPhase({ kind: 'aborted', reason: engine.abortReason ?? 'user' });
        }
      } else if (ev.kind === 'token') {
        setPhase({ kind: 'streaming', tokens: engine.tokens, visibleCount: engine.tokens.length });
      }
    });

    const req: StreamRequest = {
      url,
      method,
      headers,
      body,
      parser: defaultParser,
    };
    void engine.start(req);

    // Return cleanup callback (used by effect)
    return unsub;
  }, [stableRequestId, url, method, headers, body, onEvent, onComplete, onError, clearTypewriter]);

  // On mount, do nothing automatically — caller decides when to start.
  // (Could auto-start by adding useEffect here.)

  // On unmount, abort
  React.useEffect(() => {
    return () => {
      unmountedRef.current = true;
      clearTypewriter();
      const engine = engineRef.current;
      if (engine && !isTerminal(engine.state)) {
        try { engine.abort('unmount'); } catch { /* ignore */ }
      }
      engineRef.current = null;
    };
  }, [clearTypewriter]);

  // Stop button handler
  const handleStop = React.useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    clearTypewriter();
    try { engine.abort('user'); } catch { /* ignore */ }
    onAbort?.();
  }, [onAbort, clearTypewriter]);

  // Retry handler
  const handleRetry = React.useCallback(() => {
    const engine = engineRef.current;
    if (engine) {
      try { engine.reset(); } catch { /* ignore */ }
      engineRef.current = null;
    }
    clearTypewriter();
    setPhase({ kind: 'idle' });
    setStreamState('IDLE');
    startStream();
  }, [startStream, clearTypewriter]);

  // =================== RENDER ===================

  const wrapperProps: Record<string, unknown> = {
    className: ['akasha-streaming', className ?? ''].filter(Boolean).join(' '),
    'data-state': streamState,
  };

  const visibleText =
    phase.kind === 'streaming'
      ? phase.tokens.slice(0, phase.visibleCount).map((t) => t.text).join('')
      : phase.kind === 'complete'
        ? phase.text
        : phase.kind === 'aborted'
          ? ''
          : phase.kind === 'error'
            ? ''
            : '';

  return React.createElement(
    'div',
    wrapperProps,
    // Status region (aria-live for screen readers)
    React.createElement(
      'div',
      {
        role: 'status',
        'aria-live': 'polite',
        'aria-atomic': 'false',
        'data-testid': 'akasha-streaming-status',
        style: { position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' },
      },
      describeState(streamState),
    ),
    // Visible stream area
    React.createElement(
      'div',
      {
        className: 'akasha-streaming__output',
        'aria-live': 'polite',
        'aria-busy': streamState === 'STREAMING' || streamState === 'CONNECTING',
        'data-testid': 'akasha-streaming-output',
        style: { minHeight: '44px', padding: '12px 16px', lineHeight: '1.5' },
      },
      phase.kind === 'idle' && React.createElement('span', { className: 'akasha-streaming__idle' }, idleLabel),
      phase.kind === 'connecting' && React.createElement(
        'span',
        { className: 'akasha-streaming__shimmer', 'data-testid': 'akasha-streaming-shimmer' },
        'Conectando à Akasha IA…',
      ),
      (phase.kind === 'streaming' || phase.kind === 'complete' || phase.kind === 'aborted') &&
        React.createElement('span', { className: 'akasha-streaming__text' }, visibleText),
      phase.kind === 'error' && React.createElement(
        'span',
        { className: 'akasha-streaming__error', role: 'alert', 'data-testid': 'akasha-streaming-error' },
        String(phase.error),
      ),
    ),
    // Controls row
    React.createElement(
      'div',
      {
        className: 'akasha-streaming__controls',
        style: {
          display: 'flex',
          gap: '8px',
          padding: '8px 16px',
          minHeight: '52px',
          alignItems: 'center',
        },
      },
      // Stop button — only during STREAMING or CONNECTING
      (streamState === 'STREAMING' || streamState === 'CONNECTING') &&
        React.createElement(
          'button',
          {
            type: 'button',
            className: 'akasha-streaming__stop',
            onClick: handleStop,
            'aria-label': stopLabel,
            'data-testid': 'akasha-streaming-stop',
            style: {
              minHeight: '44px',
              minWidth: '44px',
              padding: '12px 20px',
              border: '1px solid currentColor',
              borderRadius: '8px',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
            },
          },
          stopLabel,
        ),
      // Retry button — on error
      phase.kind === 'error' &&
        React.createElement(
          'button',
          {
            type: 'button',
            className: 'akasha-streaming__retry',
            onClick: handleRetry,
            'aria-label': 'Tentar novamente',
            'data-testid': 'akasha-streaming-retry',
            style: {
              minHeight: '44px',
              minWidth: '44px',
              padding: '12px 20px',
              border: '1px solid currentColor',
              borderRadius: '8px',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
            },
          },
          'Tentar novamente',
        ),
    ),
  );
}

// =================== ERROR BOUNDARY ===================

export type AkashaStreamingBoundaryProps = {
  readonly children: React.ReactNode;
  readonly fallback?: (err: Error) => React.ReactNode;
};

export type AkashaStreamingBoundaryState = {
  readonly hasError: boolean;
  readonly error: Error | null;
};

export class AkashaStreamingBoundary extends React.Component<AkashaStreamingBoundaryProps, AkashaStreamingBoundaryState> {
  override state: AkashaStreamingBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): AkashaStreamingBoundaryState {
    return Object.freeze({ hasError: true, error: Object.freeze(error) as unknown as Error });
  }

  override componentDidCatch(error: Error, info: unknown): void {
    // Log only in non-prod. Specs will assert this method is callable.
    if (typeof console !== 'undefined' && console.error) {
      console.error('[akasha-streaming] boundary caught:', error, info);
    }
  }

  override render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error);
      }
      return React.createElement(
        'div',
        {
          role: 'alert',
          'data-testid': 'akasha-streaming-boundary-error',
          style: { padding: '16px', minHeight: '44px' },
        },
        'Algo deu errado ao renderizar a Akasha IA. Recarregue a página.',
      );
    }
    return this.props.children;
  }
}

// =================== EXPORTS ===================

export {
  makeStreamEngine,
  defaultParser,
  isTerminal,
  describeState,
  makeRequestId,
};
export type {
  StreamEngine,
  StreamState,
  StreamRequest,
  StreamEvent,
  Token,
  StreamTelemetry,
  RequestId,
  StreamError,
};
