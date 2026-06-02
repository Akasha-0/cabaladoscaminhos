// fallow-ignore-file unused-file
// ============================================================
// ENDPOINT VALIDATION - CABALA DOS CAMINHOS
// ============================================================
// Centralized endpoint validation utilities with Zod schemas
// for API route validation, method checking, and content-type
// ============================================================

import { z } from 'zod';

// ============================================================
// HTTP METHODS
// ============================================================

export const HttpMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS',
} as const;

export type HttpMethodType = (typeof HttpMethod)[keyof typeof HttpMethod];

export const HttpMethodSchema = z.enum([
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
]);

// ============================================================
// CONTENT TYPES
// ============================================================

export const ContentType = {
  JSON: 'application/json',
  FORM: 'application/x-www-form-urlencoded',
  MULTIPART: 'multipart/form-data',
  TEXT: 'text/plain',
  XML: 'application/xml',
} as const;

export type ContentTypeType = (typeof ContentType)[keyof typeof ContentType];

export const ContentTypeSchema = z.enum([
  'application/json',
  'application/x-www-form-urlencoded',
  'multipart/form-data',
  'text/plain',
  'application/xml',
]);

// ============================================================
// ENDPOINT CONFIGURATION SCHEMAS
// ============================================================

export const EndpointConfigSchema = z.object({
  path: z.string().min(1, 'Path is required'),
  method: HttpMethodSchema,
  authenticated: z.boolean().optional().default(false),
  rateLimit: z.object({
    max: z.number().int().positive(),
    windowMs: z.number().int().positive(),
  }).optional(),
  contentType: ContentTypeSchema.optional().default('application/json'),
  requiredParams: z.array(z.string()).optional().default([]),
  optionalParams: z.array(z.string()).optional().default([]),
});

export type EndpointConfig = z.infer<typeof EndpointConfigSchema>;

// ============================================================
// VALIDATION CONTEXT
// ============================================================

export const ValidationContextSchema = z.object({
  path: z.string().optional(),
  method: HttpMethodSchema.optional(),
  query: z.record(z.string(), z.string()).optional(),
  headers: z.record(z.string(), z.string()).optional(),
  authenticated: z.boolean().optional(),
  userId: z.string().optional(),
});

export type ValidationContext = z.infer<typeof ValidationContextSchema>;

// ============================================================
// VALIDATION RESULT
// ============================================================

export const ValidationResultSchema = z.object({
  valid: z.boolean(),
  errors: z.array(z.object({
    field: z.string(),
    message: z.string(),
    code: z.string().optional(),
  })).optional(),
  warnings: z.array(z.string()).optional(),
});

export type ValidationResult = z.infer<typeof ValidationResultSchema>;

// ============================================================
// VALIDATE ENDPOINT FUNCTION
// ============================================================

export interface ValidateEndpointOptions {
  /** Expected HTTP method */
  method: HttpMethodType;
  /** Whether the endpoint requires authentication */
  authenticated?: boolean;
  /** Required query/body parameters */
  requiredParams?: string[];
  /** Optional supported parameters */
  optionalParams?: string[];
  /** Expected content type */
  contentType?: ContentTypeType;
  /** Custom validation function for additional checks */
  customValidator?: (context: ValidationContext) => ValidationResult;
}

/**
 * Validates an endpoint request configuration
 * 
 * @param context - The validation context containing request details
 * @param options - Validation options for the endpoint
 * @returns ValidationResult indicating if the endpoint is valid
 */
// fallow-ignore-next-line complexity
export function validateEndpoint(
  context: ValidationContext,
  options: ValidateEndpointOptions
): ValidationResult {
  const errors: ValidationResult['errors'] = [];

  // Validate HTTP method
  if (context.method && context.method !== options.method) {
    errors.push({
      field: 'method',
      message: `Method not allowed. Expected ${options.method}, got ${context.method}`,
      code: 'METHOD_NOT_ALLOWED',
    });
  }

  // Validate authentication requirement
  if (options.authenticated && !context.authenticated) {
    errors.push({
      field: 'authentication',
      message: 'Authentication required for this endpoint',
      code: 'UNAUTHORIZED',
    });
  }

  // Validate required parameters
  if (options.requiredParams && context.query) {
    for (const param of options.requiredParams) {
      if (!(param in context.query) || context.query[param] === '') {
        errors.push({
          field: `param.${param}`,
          message: `Required parameter '${param}' is missing or empty`,
          code: 'MISSING_PARAMETER',
        });
      }
    }
  }

  // Validate content type if specified
  if (options.contentType && context.headers) {
    const requestContentType = context.headers['content-type'] || context.headers['Content-Type'];
    if (requestContentType && !requestContentType.includes(options.contentType)) {
      errors.push({
        field: 'content-type',
        message: `Invalid content type. Expected ${options.contentType}`,
        code: 'INVALID_CONTENT_TYPE',
      });
    }
  }

  // Run custom validator if provided
  let customWarnings: string[] = [];
  if (options.customValidator) {
    const customResult = options.customValidator(context);
    if (!customResult.valid && customResult.errors) {
      errors.push(...customResult.errors);
    }
    if (customResult.warnings) {
      customWarnings = customResult.warnings;
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: customWarnings.length > 0 ? customWarnings : undefined,
  };
}

// ============================================================
// SCHEMA VALIDATORS FOR COMMON ENDPOINTS
// ============================================================

/**
 * Validates a numeric ID parameter
 */
export const idSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

/**
 * Validates pagination parameters
 */
export const paginationParamsSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
}).refine(data => data.limit === undefined || (data.limit > 0 && data.limit <= 100), {
  message: 'Limit must be between 1 and 100',
});

/**
 * Validates date range parameters
 */
export const dateRangeSchema = z.object({
  start: z.string().datetime().optional(),
  end: z.string().datetime().optional(),
}).refine(data => {
  if (data.start && data.end) {
    return new Date(data.start) <= new Date(data.end);
  }
  return true;
}, {
  message: 'Start date must be before or equal to end date',
});

/**
 * Validates search query parameters
 */
export const searchParamsSchema = z.object({
  q: z.string().optional(),
  filters: z.string().optional().transform(val => val ? JSON.parse(val) : {}),
  include: z.string().optional().transform(val => val ? val.split(',') : undefined),
  exclude: z.string().optional().transform(val => val ? val.split(',') : undefined),
});

// ============================================================
// HELPER VALIDATORS
// ============================================================

/**
 * Creates a validation result for a successful validation
 */
export function validResult(): ValidationResult {
  return { valid: true };
}

/**
 * Creates a validation result with errors
 */
export function invalidResult(errors: ValidationResult['errors']): ValidationResult {
  return { valid: false, errors };
}

/**
 * Validates that a value is one of the allowed values
 */
export function validateEnum<T extends readonly string[]>(
  value: unknown,
  allowed: T,
  fieldName: string
): ValidationResult {
  const typedValue = value as string;
  if (allowed.includes(typedValue)) {
    return validResult();
  }
  return invalidResult([{
    field: fieldName,
    message: `Invalid ${fieldName}. Must be one of: ${allowed.join(', ')}`,
    code: 'INVALID_ENUM',
  }]);
}

/**
 * Validates request headers for required fields
 */
export function validateHeaders(
  headers: Record<string, string>,
  required: string[]
): ValidationResult {
  const errors: ValidationResult['errors'] = [];

  for (const header of required) {
    const normalizedHeader = header.toLowerCase();
    const headerKey = Object.keys(headers).find(
      k => k.toLowerCase() === normalizedHeader
    );

    if (!headerKey || !headers[headerKey]) {
      errors.push({
        field: `header.${header}`,
        message: `Required header '${header}' is missing`,
        code: 'MISSING_HEADER',
      });
    }
  }

  return { valid: errors.length === 0, errors: errors.length > 0 ? errors : undefined };
}

// ============================================================
// DEFAULT ENDPOINT PATTERNS
// ============================================================

export const defaultEndpointOptions: ValidateEndpointOptions = {
  method: 'GET',
  authenticated: false,
  requiredParams: [],
  optionalParams: [],
  contentType: 'application/json',
};

export const apiEndpointPatterns = {
  list: {
    method: 'GET' as const,
    authenticated: false,
    optionalParams: ['page', 'limit', 'sort', 'order'],
  },
  get: {
    method: 'GET' as const,
    authenticated: false,
    requiredParams: ['id'],
  },
  create: {
    method: 'POST' as const,
    authenticated: true,
    contentType: 'application/json' as const,
  },
  update: {
    method: 'PUT' as const,
    authenticated: true,
    requiredParams: ['id'],
    contentType: 'application/json' as const,
  },
  delete: {
    method: 'DELETE' as const,
    authenticated: true,
    requiredParams: ['id'],
  },
};

// ============================================================
// RE-EXPORTS FOR CONVENIENCE
// ============================================================

export { z };