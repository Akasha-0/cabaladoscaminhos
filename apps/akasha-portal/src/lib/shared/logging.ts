/**
 * Structured logging — Wave 12.3
 *
 * JSON-lines logger padronizado para API routes e infraestrutura.
 *
 * Convenção de campos:
 *   - timestamp  ISO 8601 UTC
 *   - level      'debug' | 'info' | 'warn' | 'error'
 *   - requestId  propagado do header `X-Request-Id` (middleware) ou gerado
 *   - userId     opcional — populado em rotas autenticadas
 *   - route      opcional — ex: '/api/mentor/ask'
 *   - message    string curta (evento humano-legível)
 *   - meta       objeto com contexto adicional (NUNCA PII cru)
 *
 * LGPD by design:
 *   - `error` em `meta` deve ser um `Error` OU um objeto serializável.
 *   - O logger serializa apenas `name + message` do Error (NÃO stack).
 *   - Para stack trace, use a flag explícita `includeStack: true`.
 *
 * Edge Runtime:
 *   - `process.stdout.write` funciona em ambos Node e Edge Runtime.
 *   - NÃO usar `process.stderr` no middleware (Edge não suporta).
 *   - O default em produção é `stdout` (12-factor app).
 *
 * Backward compatibility:
 *   - A função `generateRequestId()` é preservada (usada pelo middleware).
 *   - Rotas que ainda usam `console.log('[mentor] ...')` continuam
 *     funcionando lado-a-lado — é só ruído textual, não quebra logs.
 *   - O test suite de mentor/ask depende de `console.log('[mentor]
 *     emotion=...')` e NÃO é alterado por esta refatoração.
 *
 * Uso típico em API route:
 *
 *   import { log, getRequestId } from '@/lib/shared/logging';
 *
 *   export async function POST(request: NextRequest) {
 *     const requestId = getRequestId(request);
 *     const logCtx = { requestId, route: '/api/foo' };
 *
 *     log.info('foo.start', logCtx);
 *     try {
 *       ...
 *       log.info('foo.success', { ...logCtx, userId });
 *     } catch (err) {
 *       log.error('foo.failure', { ...logCtx, error: err });
 *     }
 *   }
 */
import type { NextRequest } from 'next/server';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogMeta {
  /** Request ID (X-Request-Id) — para correlação middleware↔route */
  requestId?: string;
  /** User ID autenticado (de `requireAkashaApi`) */
  userId?: string;
  /** Rota ou handler — ex: '/api/mentor/ask', 'middleware', 'cron' */
  route?: string;
  /** Método HTTP — para rotas API */
  method?: string;
  /** Path da URL — útil quando `route` é genérico */
  path?: string;
  /** Status code de resposta */
  status?: number;
  /** Latência em ms */
  durationMs?: number;
  /** Error object — serializado com segurança (sem stack por default) */
  error?: unknown;
  /** Quaisquer campos contextuais adicionais — NUNCA PII cru */
  [key: string]: unknown;
}

export interface LogLine {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  userId?: string;
  route?: string;
  meta?: Record<string, unknown>;
}

/** Header usado pelo middleware para propagar o requestId. */
export const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Gera um ID único para cada request (para tracing/logging).
 * Usado pelo middleware (Edge Runtime) — preservado por compatibilidade.
 */
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Extrai o requestId do header `X-Request-Id` (case-insensitive).
 * Fallback para `generateRequestId()` se ausente (logs ad-hoc).
 *
 * IMPORTANTE: para logs emitidos no MESMO request, capture o requestId
 * uma vez no topo do handler e re-use em `log.info/warn/error(...)`.
 */
export function getRequestId(request: NextRequest): string {
  return (
    request.headers.get(REQUEST_ID_HEADER) ||
    request.headers.get('X-Request-Id') ||
    generateRequestId()
  );
}

/**
 * Serializa um Error de forma segura para logs JSON.
 * Por padrão NÃO inclui stack (pode conter PII em stack frames).
 * Para debugging local, passe `includeStack: true`.
 */
function serializeError(
  err: unknown,
  options: { includeStack?: boolean } = {}
): Record<string, unknown> {
  if (err === null || err === undefined) {
    return { kind: 'unknown' };
  }
  if (err instanceof Error) {
    const out: Record<string, unknown> = {
      kind: err.name,
      message: err.message,
    };
    if (options.includeStack && err.stack) {
      out.stack = err.stack;
    }
    return out;
  }
  if (typeof err === 'string') {
    return { kind: 'string', message: err };
  }
  if (typeof err === 'object') {
    // Objeto plain — assume seguro (não incluir chaves obvious PII: 'password', 'token')
    const safe: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(err as Record<string, unknown>)) {
      if (/^(password|token|secret|authorization|cookie)$/i.test(k)) {
        safe[k] = '[REDACTED]';
      } else {
        safe[k] = v;
      }
    }
    return safe;
  }
  return { kind: typeof err, value: String(err) };
}

/**
 * Remove chaves com PII obvious do objeto `meta`.
 * Defesa em profundidade: callers podem esquecer; o logger sempre filtra.
 *
 * Cycle-safe: usa WeakSet para detectar ciclos e substitui por marker.
 */
const PII_KEY_PATTERN = /^(password|pwd|token|secret|authorization|cookie|email|phone|cpf|cnpj|creditCard|card)$/i;

function redactPii(
  meta: Record<string, unknown> | undefined,
  seen: WeakSet<object> = new WeakSet()
): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  if (seen.has(meta)) return { '[Circular]': '[REDACTED]' };
  seen.add(meta);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (PII_KEY_PATTERN.test(k)) {
      out[k] = '[REDACTED]';
    } else if (v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) {
      out[k] = redactPii(v as Record<string, unknown>, seen);
    } else {
      out[k] = v;
    }
  }
  return out;
}

/** Constrói a LogLine final (sem serializar) — útil para testes. */
export function buildLogLine(
  level: LogLevel,
  message: string,
  meta: LogMeta = {},
  options: { includeStack?: boolean } = {}
): LogLine {
  const { requestId, userId, route, error, ...rest } = meta;
  const cleanedMeta = redactPii(rest);
  const line: LogLine = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };
  if (requestId) line.requestId = requestId;
  if (userId) line.userId = userId;
  if (route) line.route = route;
  if (cleanedMeta && Object.keys(cleanedMeta).length > 0) {
    line.meta = { ...cleanedMeta };
  }
  if (error !== undefined) {
    line.meta = { ...(line.meta ?? {}), error: serializeError(error, options) };
  }
  return line;
}

/**
 * Replacer tolerante a referências circulares — substitui por string marker.
 * Cria um WeakSet novo a cada stringify para evitar vazamento entre chamadas.
 *
 * IMPORTANTE: `visited` é compartilhado por referência DENTRO de um stringify
 * (a função replacer é chamada recursivamente com o mesmo set). Para isso
 * usamos um IIFE que captura o set local.
 */
function stringifySafe(line: LogLine): string {
  const seen = new WeakSet<object>();
  return JSON.stringify(line, (_key, value: unknown) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
    }
    return value;
  });
}

/**
 * Emite uma linha de log estruturada (JSON) para stdout.
 * Em produção é capturado pelo Vercel/CloudWatch/etc.
 *
 * O output é sempre 1 linha JSON (newline-terminated) — compatível
 * com coletores JSON-lines (Vector, Fluentbit, Datadog).
 */
export function emit(level: LogLevel, message: string, meta: LogMeta = {}): void {
  const line = buildLogLine(level, message, meta);
  try {
    process.stdout.write(stringifySafe(line) + '\n');
  } catch {
    // Fallback silencioso: nunca quebrar a request por causa de log.
    // Em último caso, console.error escreve em stderr (Node runtime).
    try {
      console.error('[logging] failed to serialize log line:', line);
    } catch {
      // swallow
    }
  }
}

/**
 * Logger estruturado — objeto com métodos por nível.
 * Uso: `log.info('event.name', { requestId, route, ... })`.
 *
 * Cada método recebe (message, meta) e delega para `emit(level, ...)`.
 */
export const log = {
  debug(message: string, meta?: LogMeta): void {
    if (process.env.LOG_LEVEL === 'debug' || process.env.NODE_ENV === 'development') {
      emit('debug', message, meta);
    }
  },
  info(message: string, meta?: LogMeta): void {
    emit('info', message, meta);
  },
  warn(message: string, meta?: LogMeta): void {
    emit('warn', message, meta);
  },
  error(message: string, meta?: LogMeta): void {
    emit('error', message, meta);
  },
} as const;