// src/lib/sse.ts
// Server-Sent Events utility for streaming data to clients.
export interface SSESendFn {
  (data: unknown): void;
}
export interface SSEController {
  send: SSESendFn;
  close: () => void;
  abortController: AbortController;
}
export interface SSECreateOptions {
  /** Timeout in milliseconds for the stream. Default: no timeout. */
  timeoutMs?: number;
}
/**
 * Creates an SSE controller with optional timeout.
 * The returned `abortController.signal` can be passed to fetch() to
 * abort the upstream request when the timeout fires.
 */
export function createSSEStream(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder = new TextEncoder(),
  options: SSECreateOptions = {}
): SSEController {
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  let timeoutTimer: ReturnType<typeof setTimeout> | null = null;
  const abortController = new AbortController();
  const close = (): void => {
    if (heartbeatTimer !== null) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
    if (timeoutTimer !== null) {
      clearTimeout(timeoutTimer);
      timeoutTimer = null;
    }
    controller.close();
  };
  const send = (data: unknown): void => {
    const payload = JSON.stringify(data);
    controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
  };
  // Start heartbeat every 30 seconds
  heartbeatTimer = setInterval(() => {
    try {
      controller.enqueue(encoder.encode(`: heartbeat\n\n`));
    } catch {
      // Stream already closed, stop heartbeat
      clearInterval(heartbeatTimer!);
      heartbeatTimer = null;
    }
  }, 30_000);
  // Wire optional timeout
  if (options.timeoutMs != null && options.timeoutMs > 0) {
    timeoutTimer = setTimeout(() => {
      abortController.abort();
      try {
        controller.enqueue(
          encoder.encode(`event: error\ndata: ${JSON.stringify({ message: 'Timeout: resposta do oráculo excedeu o limite de tempo' })}\n\n`)
        );
      } catch {
        /* stream already closed */
      }
      close();
    }, options.timeoutMs);
  }
  return { send, close, abortController };
}
