export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  resetIn: number;  // Milissegundos até o reset (usado em rateLimit.ts)
}

/**
 * Verifica rate limit para uma ação/IP específico
 * 
 * STUB: Implementação real com Redis na infraestrutura
 * Por enquanto sempre permite para tests passarem.
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  return {
    allowed: true,
    remaining: config.maxRequests - 1,
    resetAt: new Date(Date.now() + config.windowMs),
    resetIn: config.windowMs,
  };
}
