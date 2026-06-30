// ============================================================================
// RATE LIMIT — Wave 32 invite system (in-memory)
// ============================================================================
// Limite conservador: 30 convites/min por admin e 100 verifies/min por IP.
// Suficiente para uso operacional sem bloquear batches legítimos.
//
// Production-grade: substituir por Redis (UPSTASH) ou middleware global.
// Aqui mantemos in-memory + window deslizante para não introduzir deps.
// ============================================================================

interface Bucket {
  count: number;
  resetAt: number;
}

const adminInviteBuckets = new Map<string, Bucket>();
const verifyIpBuckets = new Map<string, Bucket>();

const ADMIN_INVITE_LIMIT = 30; // por minuto
const VERIFY_IP_LIMIT = 100; // por minuto
const WINDOW_MS = 60 * 1000;

export function checkInviteRateLimit(
  actorId: string
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const existing = adminInviteBuckets.get(actorId);
  if (!existing || existing.resetAt < now) {
    adminInviteBuckets.set(actorId, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSec: 0 };
  }
  if (existing.count >= ADMIN_INVITE_LIMIT) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((existing.resetAt - now) / 1000),
    };
  }
  existing.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

export function checkVerifyRateLimit(
  ip: string
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const existing = verifyIpBuckets.get(ip);
  if (!existing || existing.resetAt < now) {
    verifyIpBuckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSec: 0 };
  }
  if (existing.count >= VERIFY_IP_LIMIT) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((existing.resetAt - now) / 1000),
    };
  }
  existing.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

// Limpeza periódica para evitar leak de memória em long-running
if (typeof setInterval !== 'undefined') {
  const CLEANUP_INTERVAL = 5 * 60 * 1000;
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of adminInviteBuckets) if (v.resetAt < now) adminInviteBuckets.delete(k);
    for (const [k, v] of verifyIpBuckets) if (v.resetAt < now) verifyIpBuckets.delete(k);
  }, CLEANUP_INTERVAL).unref?.();
}