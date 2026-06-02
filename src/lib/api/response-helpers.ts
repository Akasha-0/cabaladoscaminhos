// ============================================================
// API RESPONSE HELPERS - CABALA DOS CAMINHOS
// ============================================================
// Standardized response wrappers for API routes.
//
// Clone group: 79280d17 (200 lines, 28 instances)
// Pattern: Response wrapper with status/data structure
// ============================================================

import { NextResponse } from 'next/server';

// fallow-ignore-next-line unused-type
export interface SuccessResponse<T = unknown> {
  success: true;
  data?: T;
  [key: string]: unknown;
}

// fallow-ignore-next-line unused-type
export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}

/**
 * Create a standardized success response
 */
// fallow-ignore-next-line unused-export
export function createAPIResponse<T>(
  data: T,
  options: {
    /** Additional metadata to include */
    meta?: Record<string, unknown>;
    /** Custom status code (default: 200) */
    status?: number;
  } = {}
): NextResponse {
  const { meta, status = 200 } = options;

  const response: SuccessResponse<T> = {
    success: true,
    data,
  };

  // Spread additional properties from data if it's an object
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    Object.assign(response, data as Record<string, unknown>);
    response.data = undefined; // Remove redundant data field
  }

  if (meta) {
    response.meta = meta;
  }

  return NextResponse.json(response, { status });
}

/**
 * Create a list response with pagination metadata
 */
// fallow-ignore-next-line unused-export
export function createListResponse<T>(
  items: T[],
  options: {
    /** Total count of all items (for pagination) */
    total?: number;
    /** Current page number */
    page?: number;
    /** Items per page */
    limit?: number;
    /** Custom metadata */
    meta?: Record<string, unknown>;
  } = {}
): NextResponse {
  const { total, page, limit, meta } = options;
  const count = items.length;

  const response: SuccessResponse<T[]> = {
    success: true,
    data: items,
    count,
  };

  if (total !== undefined) response.total = total;
  if (page !== undefined) response.page = page;
  if (limit !== undefined) response.limit = limit;
  if (meta) response.meta = meta;

  return NextResponse.json(response);
}

/**
 * Create an error response
 */
export function createErrorResponse(
  error: string,
  options: {
    /** HTTP status code */
    status?: number;
    /** Error code for client handling */
    code?: string;
    /** Detailed field errors (for validation) */
    details?: Record<string, string[]>;
  } = {}
): NextResponse {
  const { status = 500, code, details } = options;

  const response: ErrorResponse = {
    success: false,
    error,
  };

  if (code) response.code = code;
  if (details) response.details = details;

  return NextResponse.json(response, { status });
}

/**
 * Create a formatListResponse helper for generic list formatting
 */
// fallow-ignore-next-line unused-export
export function formatListResponse<T extends { id: string | number }>(
  items: T[],
  options: {
    /** Key to extract spiritual correlations from items */
    spiritualKey?: string;
    /** Total count of all items */
    total?: number;
    /** Include pagination info */
    pagination?: {
      page?: number;
      limit?: number;
    };
    /** Additional metadata */
    meta?: Record<string, unknown>;
  } = {}
): NextResponse {
  const { spiritualKey, total, pagination, meta } = options;
  const count = items.length;

  const response: Record<string, unknown> = {
    success: true,
    items,
    count,
  };

  if (total !== undefined) response.total = total;
  if (pagination) {
    response.page = pagination.page;
    response.limit = pagination.limit;
  }
  if (meta) response.meta = meta;

  return NextResponse.json(response);
}
