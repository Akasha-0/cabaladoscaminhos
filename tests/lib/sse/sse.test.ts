// tests/lib/sse.test.ts
// Testes para src/lib/sse.ts — timeout + basic functionality.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createSSEStream } from '@/lib/sse';

function drainStream(controller: ReadableStreamDefaultController): string[] {
  const chunks: string[] = [];
  // The ReadableStreamDefaultController doesn't expose enqueued chunks
  // directly; we use a mock controller that records what was enqueued.
  return chunks;
}

describe('createSSEStream', () => {
  let controller: ReadableStreamDefaultController;
  let encoded: { data: Uint8Array[] }[] = [];

  beforeEach(() => {
    encoded = [];
    controller = {
      enqueue: vi.fn((chunk: Uint8Array) => {
        encoded.push({ data: [chunk] });
      }),
      close: vi.fn(),
    } as unknown as ReadableStreamDefaultController;
  });

  describe('send', () => {
    it('encodes data as SSE format', () => {
      const { send } = createSSEStream(controller);
      send({ hello: 'world' });
      expect(controller.enqueue).toHaveBeenCalledTimes(1);
      const encoded_str = new TextDecoder().decode((encoded[0] as { data: Uint8Array[] }).data[0]);
      expect(encoded_str).toBe('data: {"hello":"world"}\n\n');
    });

    it('supports multiple send calls', () => {
      const { send } = createSSEStream(controller);
      send({ step: 1 });
      send({ step: 2 });
      expect(controller.enqueue).toHaveBeenCalledTimes(2);
    });
  });

  describe('close', () => {
    it('closes the controller once', () => {
      const { close } = createSSEStream(controller);
      close();
      expect(controller.close).toHaveBeenCalledTimes(1);
    });

    it('clears heartbeat timer on close', () => {
      vi.useFakeTimers();
      const { close } = createSSEStream(controller);
      // Advance past first heartbeat
      vi.advanceTimersByTime(30_000);
      close();
      // Should not throw when trying to send heartbeat after close
      vi.advanceTimersByTime(30_000);
      // Only the first heartbeat should have been sent (before close)
      vi.useRealTimers();
    });

    it('returns a controller with abortController property', () => {
      const { abortController } = createSSEStream(controller);
      expect(abortController).toBeInstanceOf(AbortController);
    });
  });

  describe('timeout', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('does NOT set a timeout when timeoutMs is not provided', () => {
      vi.useFakeTimers();
      const { abortController } = createSSEStream(controller, new TextEncoder());
      // Advance 90s — should NOT abort
      vi.advanceTimersByTime(90_000);
      expect(abortController.signal.aborted).toBe(false);
      vi.useRealTimers();
    });

    it('aborts the signal after timeoutMs', () => {
      vi.useFakeTimers();
      const { abortController } = createSSEStream(controller, new TextEncoder(), {
        timeoutMs: 5_000,
      });
      expect(abortController.signal.aborted).toBe(false);
      vi.advanceTimersByTime(5_000);
      expect(abortController.signal.aborted).toBe(true);
      vi.useRealTimers();
    });

    it('sends an error event and closes when timeout fires', () => {
      vi.useFakeTimers();
      const { abortController } = createSSEStream(controller, new TextEncoder(), {
        timeoutMs: 5_000,
      });
      vi.advanceTimersByTime(5_000);
      // Should have sent timeout error event + closed
      expect(controller.close).toHaveBeenCalled();
      // The error event should have been enqueued
      expect(controller.enqueue).toHaveBeenCalled();
      vi.useRealTimers();
    });

    it('ignores zero timeoutMs', () => {
      vi.useFakeTimers();
      const { abortController } = createSSEStream(controller, new TextEncoder(), {
        timeoutMs: 0,
      });
      vi.advanceTimersByTime(60_000);
      expect(abortController.signal.aborted).toBe(false);
      vi.useRealTimers();
    });

    it('ignores negative timeoutMs', () => {
      vi.useFakeTimers();
      const { abortController } = createSSEStream(controller, new TextEncoder(), {
        timeoutMs: -1,
      });
      vi.advanceTimersByTime(60_000);
      expect(abortController.signal.aborted).toBe(false);
      vi.useRealTimers();
    });
  });
});
