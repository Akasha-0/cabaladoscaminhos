// fallow-ignore-file unused-file
// ============================================================
// ERROR CODES - CABALA DOS CAMINHOS
// ============================================================
// Centralized error code definitions with HTTP status mappings
// ============================================================

// ============================================================
// HTTP STATUS CODES
// ============================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  GONE: 410,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

// ============================================================
// ERROR CODE RANGES
// ============================================================
// 1xxx - Authentication & Authorization
// 2xxx - Validation Errors
// 3xxx - Resource Errors
// 4xxx - Rate Limiting
// 5xxx - Server Errors
// 6xxx - Credit/Billing Errors
// 7xxx - Payment Errors

// ============================================================
// ERROR CODE DEFINITIONS
// ============================================================

export interface ErrorCodeDefinition {
  code: number;
  httpStatus: HttpStatus;
  message: string;
  description?: string;
}

export const ERROR_CODES = {
  // Authentication & Authorization (1000-1999)
  AUTH_INVALID_CREDENTIALS: {
    code: 1001,
    httpStatus: HTTP_STATUS.UNAUTHORIZED,
    message: "Invalid email or password",
    description: "The provided credentials do not match our records",
  },
  AUTH_TOKEN_EXPIRED: {
    code: 1002,
    httpStatus: HTTP_STATUS.UNAUTHORIZED,
    message: "Authentication token has expired",
    description: "Please log in again to obtain a new token",
  },
  AUTH_TOKEN_INVALID: {
    code: 1003,
    httpStatus: HTTP_STATUS.UNAUTHORIZED,
    message: "Invalid authentication token",
    description: "The provided token is malformed or has been tampered with",
  },
  AUTH_USER_NOT_FOUND: {
    code: 1004,
    httpStatus: HTTP_STATUS.NOT_FOUND,
    message: "User not found",
    description: "No account exists with the provided identifier",
  },
  AUTH_UNAUTHORIZED: {
    code: 1005,
    httpStatus: HTTP_STATUS.UNAUTHORIZED,
    message: "Unauthorized access",
    description: "Authentication is required for this resource",
  },
  AUTH_FORBIDDEN: {
    code: 1006,
    httpStatus: HTTP_STATUS.FORBIDDEN,
    message: "Access forbidden",
    description: "You do not have permission to access this resource",
  },
  AUTH_ACCOUNT_LOCKED: {
    code: 1007,
    httpStatus: HTTP_STATUS.FORBIDDEN,
    message: "Account has been locked",
    description: "Too many failed login attempts. Please try again later",
  },
  AUTH_EMAIL_NOT_VERIFIED: {
    code: 1008,
    httpStatus: HTTP_STATUS.FORBIDDEN,
    message: "Email not verified",
    description: "Please verify your email address to continue",
  },

  // Validation Errors (2000-2999)
  VALIDATION_ERROR: {
    code: 2001,
    httpStatus: HTTP_STATUS.BAD_REQUEST,
    message: "Validation failed",
    description: "One or more fields failed validation",
  },
  VALIDATION_MISSING_FIELD: {
    code: 2002,
    httpStatus: HTTP_STATUS.BAD_REQUEST,
    message: "Required field is missing",
    description: "A required field was not provided",
  },
  VALIDATION_INVALID_FORMAT: {
    code: 2003,
    httpStatus: HTTP_STATUS.BAD_REQUEST,
    message: "Invalid field format",
    description: "The field value does not match the expected format",
  },
  VALIDATION_OUT_OF_RANGE: {
    code: 2004,
    httpStatus: HTTP_STATUS.UNPROCESSABLE_ENTITY,
    message: "Value out of allowed range",
    description: "The provided value is outside the acceptable range",
  },
  VALIDATION_INVALID_DATE: {
    code: 2005,
    httpStatus: HTTP_STATUS.BAD_REQUEST,
    message: "Invalid date format",
    description: "The date must be in ISO 8601 format (YYYY-MM-DD)",
  },
  VALIDATION_INVALID_EMAIL: {
    code: 2006,
    httpStatus: HTTP_STATUS.BAD_REQUEST,
    message: "Invalid email address",
    description: "The provided email address is not valid",
  },

  // Resource Errors (3000-3999)
  RESOURCE_NOT_FOUND: {
    code: 3001,
    httpStatus: HTTP_STATUS.NOT_FOUND,
    message: "Resource not found",
    description: "The requested resource does not exist",
  },
  RESOURCE_ALREADY_EXISTS: {
    code: 3002,
    httpStatus: HTTP_STATUS.CONFLICT,
    message: "Resource already exists",
    description: "A resource with the same identifier already exists",
  },
  RESOURCE_LIMIT_EXCEEDED: {
    code: 3003,
    httpStatus: HTTP_STATUS.BAD_REQUEST,
    message: "Resource limit exceeded",
    description: "You have reached the maximum allowed limit for this resource",
  },
  RESOURCE_DELETED: {
    code: 3004,
    httpStatus: HTTP_STATUS.GONE,
    message: "Resource has been deleted",
    description: "The requested resource no longer exists",
  },

  // Rate Limiting (4000-4999)
  RATE_LIMIT_EXCEEDED: {
    code: 4001,
    httpStatus: HTTP_STATUS.TOO_MANY_REQUESTS,
    message: "Rate limit exceeded",
    description: "Too many requests. Please slow down and try again later",
  },
  RATE_LIMIT_QUOTA_EXCEEDED: {
    code: 4002,
    httpStatus: HTTP_STATUS.TOO_MANY_REQUESTS,
    message: "Monthly quota exceeded",
    description: "You have exceeded your monthly API quota",
  },

  // Server Errors (5000-5999)
  INTERNAL_ERROR: {
    code: 5001,
    httpStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: "Internal server error",
    description: "An unexpected error occurred. Please try again later",
  },
  DATABASE_ERROR: {
    code: 5002,
    httpStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: "Database error",
    description: "Failed to process database operation",
  },
  EXTERNAL_SERVICE_ERROR: {
    code: 5003,
    httpStatus: HTTP_STATUS.BAD_GATEWAY,
    message: "External service unavailable",
    description: "A required external service is currently unavailable",
  },
  SERVICE_UNAVAILABLE: {
    code: 5004,
    httpStatus: HTTP_STATUS.SERVICE_UNAVAILABLE,
    message: "Service temporarily unavailable",
    description: "This service is undergoing maintenance. Please try again later",
  },
  GATEWAY_TIMEOUT: {
    code: 5005,
    httpStatus: HTTP_STATUS.GATEWAY_TIMEOUT,
    message: "Request timeout",
    description: "The request took too long to process",
  },

  // Credit/Billing Errors (6000-6999)
  INSUFFICIENT_CREDITS: {
    code: 6001,
    httpStatus: HTTP_STATUS.BAD_REQUEST,
    message: "Insufficient credits",
    description: "You do not have enough credits to complete this operation",
  },
  CREDIT_TRANSACTION_FAILED: {
    code: 6002,
    httpStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: "Credit transaction failed",
    description: "Failed to process credit operation",
  },
  CREDIT_ALREADY_CONSUMED: {
    code: 6003,
    httpStatus: HTTP_STATUS.CONFLICT,
    message: "Credits already consumed",
    description: "This operation has already consumed these credits",
  },

  // Payment Errors (7000-7999)
  PAYMENT_FAILED: {
    code: 7001,
    httpStatus: HTTP_STATUS.BAD_REQUEST,
    message: "Payment failed",
    description: "The payment could not be processed",
  },
  PAYMENT_CANCELLED: {
    code: 7002,
    httpStatus: HTTP_STATUS.BAD_REQUEST,
    message: "Payment cancelled",
    description: "The payment was cancelled by the user",
  },
  SUBSCRIPTION_EXPIRED: {
    code: 7003,
    httpStatus: HTTP_STATUS.FORBIDDEN,
    message: "Subscription expired",
    description: "Your subscription has expired. Please renew to continue",
  },
  SUBSCRIPTION_NOT_FOUND: {
    code: 7004,
    httpStatus: HTTP_STATUS.NOT_FOUND,
    message: "Subscription not found",
    description: "No active subscription found for this account",
  },
} as const;

export type ErrorCodeKey = keyof typeof ERROR_CODES;
export type ErrorCodeValue = (typeof ERROR_CODES)[ErrorCodeKey];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getErrorByCode(code: number): ErrorCodeDefinition | undefined {
  return Object.values(ERROR_CODES).find((error) => error.code === code);
}

export function getHttpStatusForCode(code: number): HttpStatus {
  const error = getErrorByCode(code);
  return error?.httpStatus ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
}

export function getMessageForCode(code: number): string {
  const error = getErrorByCode(code);
  return error?.message ?? "Unknown error";
}