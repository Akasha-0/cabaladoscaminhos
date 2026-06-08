/**
 * AD-22.5: Token Budget Tracking via Redis
 *
 * Tracks cumulative LLM tokens used per day using Redis INCR on a daily key
 * `llm:daily:tokens:<YYYY-MM-DD>`.
 *
 * Falls back to a simple in-process counter if Redis is unavailable.
 *
 * Configuration via env:
 *   LLM_DAILY_TOKEN_BUDGET  — maximum tokens allowed per day (e.g. 100000).
 *                             If not set, budget checks are skipped (no limit).
 */
import { getRedisClient } from '@/lib/infrastructure/redis';

// ----------------------------------------------------------------------------
// Key helpers
// ----------------------------------------------------------------------------

function dailyKey(): string {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `llm:daily:tokens:${today}`;
}

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export interface BudgetCheckResult {
  allowed: boolean;
  budget: string;
  used: number;
  limit: number | null;
}

// ----------------------------------------------------------------------------
// In-process fallback counter (used when Redis is unavailable)
// ----------------------------------------------------------------------------

const inProcessCounter = {
  used: 0,
  limit: 0,
  initialized: false,
};

// ----------------------------------------------------------------------------
// Public API
// ----------------------------------------------------------------------------

/**
 * Checks whether the next LLM call is allowed under the daily token budget.
 *
 * Returns:
 *   { allowed: true, budget: 'ok', used, limit }  — budget not set or not exceeded
 *   { allowed: false, budget: 'exceeded', used, limit } — budget exceeded
 */
export async function checkTokenBudget(): Promise<BudgetCheckResult> {
  const limit = tokenBudgetLimit();
  if (limit === null) {
    return { allowed: true, budget: 'not_configured', used: 0, limit: null };
  }

  try {
    const redis = await getRedisClient();
    const key = dailyKey();
    const raw = await redis.get(key);
    const used = raw ? parseInt(String(raw), 10) : 0;
    const allowed = used < limit;

    return {
      allowed,
      budget: allowed ? 'ok' : 'exceeded',
      used,
      limit,
    };
  } catch {
    // Redis unavailable — fail open but track in-process
    const used = inProcessCounter.used;
    const allowed = used < limit;
    return {
      allowed,
      budget: allowed ? 'ok' : 'exceeded',
      used,
      limit,
    };
  }
}

/**
 * Increments the daily token usage counter by `tokens`.
 * Uses Redis INCR (atomic) with automatic EXPIRE at midnight UTC.
 */
export async function incrementTokenUsage(tokens: number): Promise<void> {
  if (tokens <= 0) return;

  try {
    const redis = await getRedisClient();
    const key = dailyKey();
    const newTotal = await redis.incr(key);

    // Set TTL only on first increment (new key)
    // EXPIRE to 25 hours to safely cover UTC midnight rollover
    if (newTotal === tokens) {
      await redis.expire(key, 90_000); // 25 hours
    }
  } catch {
    // Redis unavailable — track in-process as fallback
    inProcessCounter.used += tokens;
  }
}

/**
 * Returns the numeric budget limit from LLM_DAILY_TOKEN_BUDGET env var,
 * or null if the variable is unset or invalid.
 */
function tokenBudgetLimit(): number | null {
  const raw = process.env.LLM_DAILY_TOKEN_BUDGET;
  if (!raw) return null;
  const parsed = parseInt(raw, 10);
  return isNaN(parsed) || parsed <= 0 ? null : parsed;
}
