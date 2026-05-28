/**
 * Server-Sent Events utility for streaming data to clients.
 */

export interface SSESendFn {
  (data: unknown): void;
}

export interface SSEController {
  send: SSESendFn;
  close: () => void;
}

export function createSSEStream(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder = new TextEncoder()
): SSEController {
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  const send = (data: unknown): void => {
    const payload = JSON.stringify(data);
    controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
  };

  const close = (): void => {
    if (heartbeatTimer !== null) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
    controller.close();
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

  return { send, close };
}
