/**
 * Testes para o logger estruturado — Wave 12.3.
 *
 * Valida:
 *  - JSON-line format (1 linha por chamada, newline-terminated)
 *  - Campos obrigatórios: timestamp, level, message
 *  - Campos opcionais: requestId, userId, route, meta
 *  - PII redaction: password/token/email removidos
 *  - Error serialization: name + message (sem stack por default)
 *  - Backward compatibility: generateRequestId() preservada
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  log,
  emit,
  buildLogLine,
  generateRequestId,
  getRequestId,
  REQUEST_ID_HEADER,
  type LogMeta,
} from './logging';

describe('logging — backward compatibility', () => {
  it('generateRequestId() retorna ID não-vazio', () => {
    const id = generateRequestId();
    expect(id).toBeTruthy();
    expect(typeof id).toBe('string');
    // Formato: <timestamp>-<random>
    expect(id).toMatch(/^\d+-[a-z0-9]+$/);
  });

  it('generateRequestId() retorna IDs únicos', () => {
    const a = generateRequestId();
    const b = generateRequestId();
    expect(a).not.toBe(b);
  });

  it('REQUEST_ID_HEADER exportado', () => {
    expect(REQUEST_ID_HEADER).toBe('x-request-id');
  });
});

describe('logging — buildLogLine shape', () => {
  it('campos obrigatórios sempre presentes', () => {
    const line = buildLogLine('info', 'test.event');
    expect(line.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(line.level).toBe('info');
    expect(line.message).toBe('test.event');
  });

  it('campos opcionais omitidos quando ausentes', () => {
    const line = buildLogLine('info', 'test.event');
    expect(line.requestId).toBeUndefined();
    expect(line.userId).toBeUndefined();
    expect(line.route).toBeUndefined();
    expect(line.meta).toBeUndefined();
  });

  it('campos opcionais incluídos quando fornecidos', () => {
    const meta: LogMeta = {
      requestId: 'abc-123',
      userId: 'user-1',
      route: '/api/test',
      durationMs: 42,
    };
    const line = buildLogLine('info', 'test.event', meta);
    expect(line.requestId).toBe('abc-123');
    expect(line.userId).toBe('user-1');
    expect(line.route).toBe('/api/test');
    expect(line.meta).toEqual({ durationMs: 42 });
  });

  it('error object é serializado (name + message, sem stack por default)', () => {
    const err = new Error('boom');
    const line = buildLogLine('error', 'test.fail', { error: err });
    expect(line.meta?.error).toEqual({ kind: 'Error', message: 'boom' });
    // Stack NÃO incluído por default (LGPD: pode vazar paths internos)
    expect((line.meta?.error as Record<string, unknown>).stack).toBeUndefined();
  });

  it('error stack incluído quando includeStack=true (debugging)', () => {
    const err = new Error('boom');
    const line = buildLogLine('error', 'test.fail', { error: err }, { includeStack: true });
    expect((line.meta?.error as Record<string, unknown>).stack).toContain('Error: boom');
  });
});

describe('logging — PII redaction', () => {
  it('redacta password/token/authorization/cookie em qualquer nível', () => {
    const meta: LogMeta = {
      requestId: 'r-1',
      password: 'hunter2',
      token: 'abc',
      authorization: 'Bearer x',
      cookie: 'sid=abc',
      nested: {
        secret: 'shh',
        name: 'safe',
      },
    };
    const line = buildLogLine('info', 'test.event', meta);
    expect(line.meta?.password).toBe('[REDACTED]');
    expect(line.meta?.token).toBe('[REDACTED]');
    expect(line.meta?.authorization).toBe('[REDACTED]');
    expect(line.meta?.cookie).toBe('[REDACTED]');
    // nested.secret deve ser redacted
    expect((line.meta?.nested as Record<string, unknown>).secret).toBe('[REDACTED]');
    // nested.name deve passar (não é PII obvious)
    expect((line.meta?.nested as Record<string, unknown>).name).toBe('safe');
  });

  it('redacta email/phone/cpf em PII keys obvious', () => {
    const meta: LogMeta = {
      email: 'user@example.com',
      phone: '+5511999999999',
      cpf: '123.456.789-00',
    };
    const line = buildLogLine('info', 'test.event', meta);
    expect(line.meta?.email).toBe('[REDACTED]');
    expect(line.meta?.phone).toBe('[REDACTED]');
    expect(line.meta?.cpf).toBe('[REDACTED]');
  });
});

describe('logging — emit (stdout)', () => {
  let writeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    writeSpy.mockRestore();
  });

  it('emit escreve 1 linha JSON newline-terminada', () => {
    emit('info', 'test.event', { requestId: 'r-1' });
    expect(writeSpy).toHaveBeenCalledTimes(1);
    const written = writeSpy.mock.calls[0]?.[0] as string;
    expect(written.endsWith('\n')).toBe(true);
    const parsed = JSON.parse(written);
    expect(parsed.level).toBe('info');
    expect(parsed.message).toBe('test.event');
    expect(parsed.requestId).toBe('r-1');
  });

  it('log.info/warn/error delegam para emit', () => {
    log.info('i.test');
    log.warn('w.test');
    log.error('e.test');
    expect(writeSpy).toHaveBeenCalledTimes(3);
  });

  it('log.debug só emite em dev ou LOG_LEVEL=debug', () => {
    const originalLogLevel = process.env.LOG_LEVEL;
    const originalNodeEnv = process.env.NODE_ENV;

    (process.env as Record<string, string>).NODE_ENV = 'production';
    (process.env as Record<string, string>).LOG_LEVEL = 'info';
    log.debug('d.test');
    expect(writeSpy).not.toHaveBeenCalled();

    (process.env as Record<string, string>).NODE_ENV = 'development';
    log.debug('d.test');
    expect(writeSpy).toHaveBeenCalledTimes(1);

    (process.env as Record<string, string>).NODE_ENV = 'production';
    (process.env as Record<string, string>).LOG_LEVEL = 'debug';
    log.debug('d.test');
    expect(writeSpy).toHaveBeenCalledTimes(2);

    // Restore
    (process.env as Record<string, string>).LOG_LEVEL = originalLogLevel ?? '';
    (process.env as Record<string, string>).NODE_ENV = originalNodeEnv ?? '';
  });

  it('emit não quebra com objetos circulares', () => {
    const circ: Record<string, unknown> = { a: 1 };
    circ.self = circ;
    expect(() => emit('error', 'circular', { data: circ })).not.toThrow();
  });
});

describe('logging — getRequestId', () => {
  it('extrai requestId do header X-Request-Id', () => {
    const request = {
      headers: new Headers({ 'x-request-id': 'from-middleware-123' }),
    } as unknown as Parameters<typeof getRequestId>[0];
    expect(getRequestId(request)).toBe('from-middleware-123');
  });

  it('fallback para generateRequestId() quando header ausente', () => {
    const request = { headers: new Headers() } as unknown as Parameters<typeof getRequestId>[0];
    const id = getRequestId(request);
    expect(id).toMatch(/^\d+-[a-z0-9]+$/);
  });
});