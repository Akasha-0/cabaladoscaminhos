// ============================================================
// ERROR HANDLING - CABALA DOS CAMINHOS
// ============================================================
// Centralized error handling with spiritual-themed error codes
// ============================================================

export enum ErrorCode {
  AUTH_INVALID_CREDENTIALS = 1001,
  AUTH_TOKEN_EXPIRED = 1002,
  AUTH_TOKEN_INVALID = 1003,
  AUTH_USER_NOT_FOUND = 1004,
  AUTH_UNAUTHORIZED = 1005,
  AUTH_FORBIDDEN = 1006,
  VALIDATION_ERROR = 2001,
  VALIDATION_MISSING_FIELD = 2002,
  VALIDATION_INVALID_FORMAT = 2003,
  VALIDATION_OUT_OF_RANGE = 2004,
  RESOURCE_NOT_FOUND = 3001,
  RESOURCE_ALREADY_EXISTS = 3002,
  RESOURCE_LIMIT_EXCEEDED = 3003,
  RATE_LIMIT_EXCEEDED = 4001,
  INTERNAL_ERROR = 5001,
  DATABASE_ERROR = 5002,
  EXTERNAL_SERVICE_ERROR = 5003,
  SERVICE_UNAVAILABLE = 5004,
  INSUFFICIENT_CREDITS = 6001,
  CREDIT_TRANSACTION_FAILED = 6002,
  PAYMENT_FAILED = 7001,
  PAYMENT_CANCELLED = 7002,
  SUBSCRIPTION_EXPIRED = 7003,
}

// fallow-ignore-next-line unused-type
export interface AppErrorOptions {
  code: ErrorCode;
  message: string;
  statusCode?: number;
  details?: Record<string, unknown>;
  cause?: Error;
}

class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;
  public readonly isOperational: boolean;

  constructor(options: AppErrorOptions) {
    const { code, message, statusCode, details, cause } = options;
    super(message, { cause });
    this.code = code;
    this.statusCode = statusCode ?? getDefaultStatusCode(code);
    this.details = details;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(process.env.NODE_ENV === "development" && {
          details: this.details,
          stack: this.stack,
        }),
      },
    };
  }
}

function getDefaultStatusCode(code: ErrorCode): number {
  if (code >= 1000 && code < 1100) {
    if (code === ErrorCode.AUTH_FORBIDDEN) return 403;
    return 401;
  }
  if (code >= 2000 && code < 2100) return 400;
  if (code >= 3000 && code < 3100) {
    if (code === ErrorCode.RESOURCE_ALREADY_EXISTS) return 409;
    return 404;
  }
  if (code >= 4000 && code < 4100) return 429;
  if (code === ErrorCode.SERVICE_UNAVAILABLE) return 503;
  if (code >= 5000 && code < 5100) return 500;
  if (code >= 6000 && code < 6100) return 402;
  if (code >= 7000 && code < 7100) return 402;
  return 500;
}

const errors = {
  auth: {
    invalidCredentials: (details?: Record<string, unknown>) =>
      new AppError({ code: ErrorCode.AUTH_INVALID_CREDENTIALS, message: "Credenciais inválidas", details }),
    tokenExpired: (details?: Record<string, unknown>) =>
      new AppError({ code: ErrorCode.AUTH_TOKEN_EXPIRED, message: "Sessão expirada", details }),
    tokenInvalid: (details?: Record<string, unknown>) =>
      new AppError({ code: ErrorCode.AUTH_TOKEN_INVALID, message: "Token inválido", details }),
    userNotFound: (details?: Record<string, unknown>) =>
      new AppError({ code: ErrorCode.AUTH_USER_NOT_FOUND, message: "Usuário não encontrado", details }),
    unauthorized: (details?: Record<string, unknown>) =>
      new AppError({ code: ErrorCode.AUTH_UNAUTHORIZED, message: "Não autorizado", statusCode: 401, details }),
    forbidden: (details?: Record<string, unknown>) =>
      new AppError({ code: ErrorCode.AUTH_FORBIDDEN, message: "Acesso proibido", statusCode: 403, details }),
  },
  validation: {
    error: (details?: Record<string, unknown>) =>
      new AppError({ code: ErrorCode.VALIDATION_ERROR, message: "Erro de validação", statusCode: 400, details }),
    missingField: (field: string, details?: Record<string, unknown>) =>
      new AppError({ code: ErrorCode.VALIDATION_MISSING_FIELD, message: `Campo obrigatório: ${field}`, statusCode: 400, details: { field, ...details } }),
    invalidFormat: (field: string, expected: string, details?: Record<string, unknown>) =>
      new AppError({ code: ErrorCode.VALIDATION_INVALID_FORMAT, message: `Formato inválido para ${field}`, statusCode: 400, details: { field, expected, ...details } }),
    outOfRange: (field: string, min?: number, max?: number, details?: Record<string, unknown>) =>
      new AppError({ code: ErrorCode.VALIDATION_OUT_OF_RANGE, message: `Valor fora do intervalo para ${field}`, statusCode: 400, details: { field, min, max, ...details } }),
  },
  resource: {
    notFound: (resource: string, id?: string, details?: Record<string, unknown>) =>
      new AppError({ code: ErrorCode.RESOURCE_NOT_FOUND, message: `${resource} não encontrado`, statusCode: 404, details: { resource, id, ...details } }),
    alreadyExists: (resource: string, details?: Record<string, unknown>) =>
      new AppError({ code: ErrorCode.RESOURCE_ALREADY_EXISTS, message: `${resource} já existe`, statusCode: 409, details: { resource, ...details } }),
    limitExceeded: (resource: string, limit: number, details?: Record<string, unknown>) =>
      new AppError({ code: ErrorCode.RESOURCE_LIMIT_EXCEEDED, message: `Limite de ${resource} excedido`, statusCode: 429, details: { resource, limit, ...details } }),
  },
  rateLimit: {
    exceeded: (retryAfter: number, details?: Record<string, unknown>) =>
      new AppError({ code: ErrorCode.RATE_LIMIT_EXCEEDED, message: "Rate limit excedido", statusCode: 429, details: { retryAfter, ...details } }),
  },
  system: {
    internal: (details?: Record<string, unknown>) =>
      new AppError({ code: ErrorCode.INTERNAL_ERROR, message: "Erro interno", statusCode: 500, details }),
    database: (details?: Record<string, unknown>) =>
      new AppError({ code: ErrorCode.DATABASE_ERROR, message: "Erro no banco de dados", statusCode: 500, details }),
    externalService: (service: string, details?: Record<string, unknown>) =>
      new AppError({ code: ErrorCode.EXTERNAL_SERVICE_ERROR, message: `Erro no serviço externo: ${service}`, statusCode: 502, details: { service, ...details } }),
    unavailable: (details?: Record<string, unknown>) =>
      new AppError({ code: ErrorCode.SERVICE_UNAVAILABLE, message: "Serviço temporariamente indisponível", statusCode: 503, details }),
  },
  credits: {
    insufficient: (required: number, available: number, details?: Record<string, unknown>) =>
      new AppError({ code: ErrorCode.INSUFFICIENT_CREDITS, message: "Créditos insuficientes", statusCode: 402, details: { required, available, ...details } }),
    transactionFailed: (details?: Record<string, unknown>) =>
      new AppError({ code: ErrorCode.CREDIT_TRANSACTION_FAILED, message: "Falha na transação de créditos", statusCode: 500, details }),
  },
  payment: {
    failed: (details?: Record<string, unknown>) =>
      new AppError({ code: ErrorCode.PAYMENT_FAILED, message: "Pagamento falhou", statusCode: 402, details }),
    cancelled: (details?: Record<string, unknown>) =>
      new AppError({ code: ErrorCode.PAYMENT_CANCELLED, message: "Pagamento cancelado", statusCode: 402, details }),
    subscriptionExpired: (details?: Record<string, unknown>) =>
      new AppError({ code: ErrorCode.SUBSCRIPTION_EXPIRED, message: "Assinatura expirada", statusCode: 402, details }),
  },
};

function handleApiError(error: unknown): { status: number; body: Record<string, unknown> } {
  if (error instanceof AppError) {
    return { status: error.statusCode, body: error.toJSON() };
  }
  console.error("[Unexpected Error]", error);
  return {
    status: 500,
    body: {
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Erro interno do servidor",
        ...(process.env.NODE_ENV === "development" && { stack: (error as Error)?.stack }),
      },
    },
  };
}

export function withErrorHandler<T extends (...args: Parameters<T>) => Promise<Response>>(handler: T): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      const result = handleApiError(error);
      return Response.json(result.body, { status: result.status });
    }
  }) as T;
}
