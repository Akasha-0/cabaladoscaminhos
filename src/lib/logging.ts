// ============================================================
// LOGGING & MONITORING - CABALA DOS CAMINHOS
// ============================================================
// Structured logging with spiritual context and monitoring
// ============================================================

import { ErrorCode } from "./error-handling";

// ============================================================
// LOG LEVELS
// ============================================================

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}
const LOG_LEVEL_NAMES: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: "DEBUG",
  [LogLevel.INFO]: "INFO",
  [LogLevel.WARN]: "WARN",
  [LogLevel.ERROR]: "ERROR",
  [LogLevel.FATAL]: "FATAL",
};
const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: "\x1b[36m",    // Cyan
  [LogLevel.INFO]: "\x1b[32m",     // Green
  [LogLevel.WARN]: "\x1b[33m",     // Yellow
  [LogLevel.ERROR]: "\x1b[31m",    // Red
  [LogLevel.FATAL]: "\x1b[35m",    // Magenta
};

const RESET_COLOR = "\x1b[0m";

// ============================================================
// LOG CONTEXT
// ============================================================

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

export interface LogEntry {
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
  performance?: {
    memory?: number;
    cpu?: number;
  };
}

// ============================================================
// LOGGER CLASS
// ============================================================

class Logger {
  private static instance: Logger;
  private minLevel: LogLevel;
  private entries: LogEntry[] = [];
  private readonly maxEntries = 1000;
  private isProduction = process.env.NODE_ENV === "production";

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

  private formatEntry(entry: LogEntry): string {
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

    const entry: LogEntry = {
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

    // In production, send to external service (e.g., Sentry, Datadog)
    if (this.isProduction && level >= LogLevel.ERROR) {
      this.sendToMonitoring(entry);
    }
  }

  private async sendToMonitoring(entry: LogEntry): Promise<void> {
    // Sentry integration (Wave 11) — dynamic import pra evitar bundle bloat.
    try {
      const sentry = await import("./monitoring/sentry");
      if (!sentry.isSentryEnabled()) return;

      const err = entry.error
        ? Object.assign(new Error(entry.error.message), { name: entry.error.code })
        : new Error(entry.message);
      sentry.captureException(err, {
        level: entry.level >= LogLevel.FATAL ? "fatal" : entry.level >= LogLevel.ERROR ? "error" : "warning",
        tags: {
          logger: "akasha-portal",
          ...(entry.context?.requestId ? { requestId: entry.context.requestId } : {}),
        },
        extra: {
          context: entry.context,
          duration: entry.duration,
        },
      });
    } catch {
      // Sentry nao inicializado ou modulo ausente — silent fallback.
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
  getRecentLogs(count = 100): LogEntry[] {
    return this.entries.slice(-count);
  }

  // Clear logs
  clearLogs(): void {
    this.entries = [];
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// ============================================================
// PERFORMANCE MONITORING
// ============================================================

export interface PerformanceMetrics {
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
      logger.warn("Slow request detected", {
        requestId: metric.requestId,
        path: metric.path,
        duration: metric.duration,
      });
    }
  }

  getMetrics(filter?: {
    path?: string;
    minDuration?: number;
    since?: Date;
  }): PerformanceMetrics[] {
    let filtered = this.metrics;

    if (filter?.path) {
      filtered = filtered.filter((m) => m.path.includes(filter.path!));
    }

    if (filter?.minDuration) {
      filtered = filtered.filter((m) => m.duration >= filter.minDuration!);
    }

    if (filter?.since) {
      filtered = filtered.filter((m) => new Date(m.timestamp) >= filter.since!);
    }

    return filtered;
  }

  getStats(path?: string): {
    count: number;
    avgDuration: number;
    p50Duration: number;
    p95Duration: number;
    p99Duration: number;
    errorRate: number;
  } {
    const metrics = path ? this.getMetrics({ path }) : this.metrics;

    if (metrics.length === 0) {
      return {
        count: 0,
        avgDuration: 0,
        p50Duration: 0,
        p95Duration: 0,
        p99Duration: 0,
        errorRate: 0,
      };
    }

    const durations = metrics.map((m) => m.duration).sort((a, b) => a - b);
    const errors = metrics.filter((m) => m.statusCode && m.statusCode >= 400).length;

    return {
      count: metrics.length,
      avgDuration: Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
      p50Duration: durations[Math.floor(durations.length * 0.5)],
      p95Duration: durations[Math.floor(durations.length * 0.95)],
      p99Duration: durations[Math.floor(durations.length * 0.99)],
      errorRate: Math.round((errors / metrics.length) * 100 * 100) / 100,
    };
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export function createLogContext(request: Request): LogContext {
  return {
    requestId: generateRequestId(),
    ip: request.headers.get("x-forwarded-for") || undefined,
    userAgent: request.headers.get("user-agent") || undefined,
    path: new URL(request.url).pathname,
    method: request.method,
  };
}

export function withLogging<T extends (request: Request, ...rest: unknown[]) => Promise<Response>>(
  handler: T,
  options?: { path?: string }
): T {
  return (async (request: Request, ...rest: unknown[]) => {
    const endTimer = logger.startTimer();
    logger.info(`→ ${request.method} ${options?.path || request.url}`, { requestId: request.headers.get('x-request-id') ?? undefined });
    try {
      const response = await handler(request, ...rest);
      const duration = endTimer();
      logger.info(`← ${response.status} ${request.method} ${request.url}`, {
        duration,
        statusCode: response.status,
      });
      return response;
    } catch (error) {
      const duration = endTimer();
      logger.error(`✗ ${request.method} ${request.url}`, error as Error, {
        duration,
      });
      throw error;
    }
  }) as T;
}
