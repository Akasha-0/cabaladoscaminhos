// ============================================================
// LOGGING & MONITORING - CABALA DOS CAMINHOS
// ============================================================
// Structured logging with spiritual context and monitoring
// ============================================================
import { ErrorCode } from './error-handling';

// ============================================================
// LOG LEVELS
// ============================================================

enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}
const LOG_LEVEL_NAMES: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.FATAL]: 'FATAL',
};
const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: '\x1b[36m', // Cyan
  [LogLevel.INFO]: '\x1b[32m', // Green
  [LogLevel.WARN]: '\x1b[33m', // Yellow
  [LogLevel.ERROR]: '\x1b[31m', // Red
  [LogLevel.FATAL]: '\x1b[35m', // Magenta
};

const RESET_COLOR = '\x1b[0m';

// ============================================================
// LOG CONTEXT
// ============================================================

// fallow-ignore-next-line unused-type
export interface LogContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  path?: string;
  method?: string;
  [key: string]: unknown;
}

interface LogRecord {
  timestamp: string;
  level: LogLevel;
  levelName: string;
  message: string;
  context?: LogContext;
  error?: {
    code: ErrorCode;
    message: string;
    stack?: string;
  };
  duration?: number;
  requestId?: string;
  userId?: string;
  ip?: string;
}
// ============================================================
// LOGGER CLASS
// ============================================================

class Logger {
  private static instance: Logger;
  private minLevel: LogLevel;
  private entries: LogRecord[] = [];
  private readonly maxEntries = 1000;
  private isProduction = process.env.NODE_ENV === 'production';

  private constructor() {
    this.minLevel = this.isProduction ? LogLevel.INFO : LogLevel.DEBUG;

    // Log to console in development
    if (!this.isProduction) {
      this.setupConsoleLogging();
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private setupConsoleLogging() {
    // Already using console methods, just configure formatting
  }

  private formatEntry(entry: LogRecord): string {
    const color = LOG_LEVEL_COLORS[entry.level];
    const timestamp = new Date(entry.timestamp).toISOString();

    let formatted = `${color}[${timestamp}] [${entry.levelName}]${RESET_COLOR} ${entry.message}`;

    if (entry.context?.requestId) {
      formatted += ` [${entry.context.requestId}]`;
    }

    if (entry.context?.userId) {
      formatted += ` [user:${entry.context.userId}]`;
    }

    if (entry.duration !== undefined) {
      formatted += ` [${entry.duration}ms]`;
    }

    if (entry.context && Object.keys(entry.context).length > 0) {
      const safeContext = { ...entry.context };
      delete safeContext.requestId;
      delete safeContext.userId;
      delete safeContext.sessionId;
      delete safeContext.ip;
      delete safeContext.userAgent;
      delete safeContext.path;
      delete safeContext.method;

      if (Object.keys(safeContext).length > 0) {
        formatted += `\n  Context: ${JSON.stringify(safeContext)}`;
      }
    }

    if (entry.error) {
      formatted += `\n  Error: ${entry.error.code} - ${entry.error.message}`;
      if (entry.error.stack && !this.isProduction) {
        formatted += `\n  Stack: ${entry.error.stack}`;
      }
    }

    return formatted;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    if (level < this.minLevel) return;

    const entry: LogRecord = {
      timestamp: new Date().toISOString(),
      level,
      levelName: LOG_LEVEL_NAMES[level],
      message,
      context,
    };

    if (error) {
      entry.error = {
        code: ((error as { code?: string }).code ?? ErrorCode.INTERNAL_ERROR) as ErrorCode,
        message: error.message,
        stack: error.stack,
      };
    }

    // Store in memory
    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }

    // Output to console
    const formatted = this.formatEntry(entry);
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formatted);
        break;
    }
  }

  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  fatal(message: string, error?: Error, context?: LogContext): void {
    this.log(LogLevel.FATAL, message, context, error);
  }

  // Performance tracking
  startTimer(): () => number {
    const start = performance.now();
    return () => {
      return Math.round(performance.now() - start);
    };
  }

  // Get recent logs (for debugging)
  getRecentLogs(count = 100): LogRecord[] {
    return this.entries.slice(-count);
  }

  // Clear logs
  clearLogs(): void {
    this.entries = [];
  }
}

// Singleton logger instance (internal use by functions in this file)
const logger = Logger.getInstance();

// ============================================================
// PERFORMANCE MONITORING
// ====================================
interface PerformanceMetrics {
  requestId: string;
  path: string;
  method: string;
  statusCode?: number;
  duration: number;
  timestamp: string;
  memory?: {
    used: number;
    total: number;
    percentage: number;
  };
  userId?: string;
}
// ============================================================
// INTERNAL MONITOR
// ====================================

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetrics = 500;

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log slow requests
    if (metric.duration > 5000) {
      logger.warn('Slow request detected', {
        requestId: metric.requestId,
        path: metric.path,
        duration: metric.duration,
      });
    }
  }

  getMetrics(filter?: { path?: string; minDuration?: number; since?: Date }): PerformanceMetrics[] {
    let filtered = this.metrics;

    if (filter?.path) {
      filtered = filtered.filter((m) => m.path === filter.path);
    }

    if (filter?.minDuration) {
      filtered = filtered.filter((m) => m.duration >= filter.minDuration!);
    }

    if (filter?.since) {
      const sinceTime = filter.since.getTime();
      filtered = filtered.filter((m) => new Date(m.timestamp).getTime() >= sinceTime);
    }

    return filtered;
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  getSummary(): {
    totalRequests: number;
    avgDuration: number;
    slowRequests: number;
  } {
    if (this.metrics.length === 0) {
      return { totalRequests: 0, avgDuration: 0, slowRequests: 0 };
    }

    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const slowRequests = this.metrics.filter((m) => m.duration > 5000).length;

    return {
      totalRequests: this.metrics.length,
      avgDuration: Math.round(totalDuration / this.metrics.length),
      slowRequests,
    };
  }
}

const performanceMonitor = PerformanceMonitor.getInstance();

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

function createLogContext(request: Request): LogContext {
  return {
    requestId: generateRequestId(),
    ip: request.headers.get('x-forwarded-for') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
    path: new URL(request.url).pathname,
    method: request.method,
  };
}

function withLogging<T extends (request: Request, ...rest: unknown[]) => Promise<Response>>(
  handler: T,
  options?: { path?: string }
): T {
  return (async (request: Request, ...rest: unknown[]) => {
    const context = createLogContext(request);
    const startTime = performance.now();

    try {
      const response = await handler(request, ...rest);
      const duration = Math.round(performance.now() - startTime);

      logger.info(`${options?.path || request.method} ${request.url}`, {
        ...context,
        duration,
        status: (response as Response).status,
      });

      return response;
    } catch (error) {
      const duration = Math.round(performance.now() - startTime);

      logger.error(`${options?.path || request.method} ${request.url} failed`, error as Error, {
        ...context,
        duration,
      });

      throw error;
    }
  }) as T;
}

// ============================================================
// K.1 — STRUCTURED LOGGING (AD-22.3)
// ============================================================
/**
 * Logs are emitted as single-line JSON to stdout/stderr, suitable
 * for log aggregators (Datadog, CloudWatch, etc.).
 */
export function createLogger(requestId: string, route: string) {
  return {
    info: (event: string, meta?: Record<string, unknown>) =>
      console.log(
        JSON.stringify({
          ts: new Date().toISOString(),
          level: 'info',
          requestId,
          route,
          event,
          ...meta,
        })
      ),
    error: (event: string, meta?: Record<string, unknown>) =>
      console.error(
        JSON.stringify({
          ts: new Date().toISOString(),
          level: 'error',
          requestId,
          route,
          event,
          ...meta,
        })
      ),
    warn: (event: string, meta?: Record<string, unknown>) =>
      console.warn(
        JSON.stringify({
          ts: new Date().toISOString(),
          level: 'warn',
          requestId,
          route,
          event,
          ...meta,
        })
      ),
    debug: (event: string, meta?: Record<string, unknown>) =>
      console.log(
        JSON.stringify({
          ts: new Date().toISOString(),
          level: 'debug',
          requestId,
          route,
          event,
          ...meta,
        })
      ),
  };
}

export type AppLogger = ReturnType<typeof createLogger>;
