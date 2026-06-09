export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Verifica rate limit para uma ação/IP específico
 * Stub: sempre permite (implementação real virá na Onda 4)
 */
export async function checkRateLimit(
  ip: string,
  action: string
): Promise<RateLimitResult> {
  return { allowed: true, remaining: 100, resetAt: new Date() };
}
