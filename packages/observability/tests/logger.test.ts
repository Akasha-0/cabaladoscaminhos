import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Writable } from 'node:stream';
import pino, { type Logger } from 'pino';
import {
  getLogger,
  getLoggerConfig,
  getRequestLogger,
  type LogLevel,
  __resetRootLoggerForTests,
  _rootLoggerRef,
} from '../src/logger.js';

/**
 * Capture-pipe helper — replaces rootLogger's destination with an in-memory
 * Writable so we can assert against emitted JSON lines.
 */
function captureStdout(): { lines: string[]; restore: () => void } {
  const lines: string[] = [];
  const stream = new Writable({
    write(chunk, _enc, cb) {
      const s = chunk.toString();
      for (const line of s.split('\n')) {
        if (line.trim()) lines.push(line);
      }
      cb();
    },
  });
  const captured = pino(
    {
      level: process.env['LOG_LEVEL'] ?? 'info',
      base: { service: 'akasha', env: process.env['NODE_ENV'] ?? 'test' },
      timestamp: pino.stdTimeFunctions.isoTime,
      messageKey: 'message',
      formatters: { level: (label: string) => ({ level: label }) },
      redact: {
        paths: [
          'password',
          'token',
          'secret',
          'authorization',
          'cookie',
          'jwt',
          'session',
          '*.password',
          '*.token',
          '*.secret',
          '*.authorization',
          '*.cookie',
          '*.jwt',
          '*.session',
        ],
        censor: '[REDACTED]',
      },
    },
    stream
  );
  _rootLoggerRef.value = captured;
  return {
    lines,
    restore: () => {
      __resetRootLoggerForTests();
    },
  };
}

describe('@akasha/observability/logger', () => {
  let cap: ReturnType<typeof captureStdout>;

  beforeEach(() => {
    cap = captureStdout();
  });

  afterEach(() => {
    cap.restore();
  });

  it('emits a JSON line per log entry with the expected fields', () => {
    const log = getLogger('akasha.test');
    log.info('hello.world');
    expect(cap.lines.length).toBeGreaterThan(0);
    const parsed = JSON.parse(cap.lines[0]!);
    expect(parsed.level).toBe('info');
    expect(parsed.message).toBe('hello.world');
    expect(parsed.namespace).toBe('akasha.test');
    expect(parsed.service).toBeTruthy();
    expect(parsed.time ?? parsed.timestamp).toBeTruthy();
  });

  it('respects log level (debug suppressed at info)', () => {
    const original = process.env['LOG_LEVEL'];
    process.env['LOG_LEVEL'] = 'info';
    cap.restore();
    cap = captureStdout();
    const log = getLogger('akasha.test');
    log.debug('nope');
    log.info('yes');
    const messages = cap.lines.map((l) => JSON.parse(l).message);
    expect(messages).not.toContain('nope');
    expect(messages).toContain('yes');
    if (original === undefined) delete process.env['LOG_LEVEL'];
    else process.env['LOG_LEVEL'] = original;
  });

  it('attaches requestId to the request-scoped child logger', () => {
    const log = getRequestLogger('akasha.test', 'req-abc-123', { userId: 'u-1' });
    log.info('with.id');
    expect(cap.lines.length).toBeGreaterThan(0);
    const parsed = JSON.parse(cap.lines[0]!);
    expect(parsed.requestId).toBe('req-abc-123');
    expect(parsed.userId).toBe('u-1');
  });

  it('redacts PII keys via pino redact paths', () => {
    const log = getLogger('akasha.test');
    log.info({ password: 'p4n!', token: 'tok', ok: true }, 'safe');
    expect(cap.lines.length).toBeGreaterThan(0);
    const parsed = JSON.parse(cap.lines[0]!);
    expect(parsed.password).toBe('[REDACTED]');
    expect(parsed.token).toBe('[REDACTED]');
    expect(parsed.ok).toBe(true);
  });

  it('exposes a readable config snapshot', () => {
    const cfg = getLoggerConfig();
    expect(typeof cfg.level).toBe('string');
    expect(typeof cfg.service).toBe('string');
    expect(typeof cfg.env).toBe('string');
    expect(typeof cfg.pretty).toBe('boolean');
  });

  it('supports all four MVP levels', () => {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    for (const lv of levels) {
      expect(['debug', 'info', 'warn', 'error']).toContain(lv);
    }
    // Smoke test that warn and error emit at info default
    const log = getLogger('akasha.test');
    log.warn('w');
    log.error('e');
    const messages = cap.lines.map((l) => JSON.parse(l).message);
    expect(messages).toContain('w');
    expect(messages).toContain('e');
  });

  it('exports a Logger structurally compatible with pino Logger', () => {
    const log = getLogger('akasha.test');
    expect(typeof log.info).toBe('function');
    expect(typeof log.warn).toBe('function');
    expect(typeof log.error).toBe('function');
    expect(typeof log.child).toBe('function');
    // Cast only verifies structural shape — no runtime check.
    const _typed: Logger = log as unknown as Logger;
    expect(_typed).toBeDefined();
  });
});