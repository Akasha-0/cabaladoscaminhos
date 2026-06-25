/**
 * Process uptime tracker for monitoring endpoints.
 *
 * Captures a single timestamp at module-load time and exposes
 * `getUptimeSeconds()` so API routes (notably `/api/health`) can
 * report how long the Node process has been running.
 *
 * Why a module-level constant instead of `process.uptime()`:
 * - `process.uptime()` is accurate but not portable to edge runtimes.
 * - Having a shared `SERVER_START` lets us mock time in tests
 *   (`vi.setSystemTime`) without monkey-patching Node internals.
 *
 * Wave 12.2 — Health Check structured endpoint.
 */

// Captured once at module load. In serverless environments (Vercel
// Fluid Compute) this resets per cold start, which is the desired
// behavior for "uptime since boot".
const SERVER_START_MS = Date.now();

/**
 * Returns the number of seconds elapsed since this module was loaded
 * (i.e., since the server process started). Always returns a
 * non-negative integer.
 */
export function getUptimeSeconds(): number {
  const elapsedMs = Date.now() - SERVER_START_MS;
  // Defensive: if clock skew makes this negative, clamp to 0.
  return Math.max(0, Math.floor(elapsedMs / 1000));
}

/**
 * Returns the absolute timestamp (ms since epoch) when the server
 * process started. Useful for building a full ISO timestamp in
 * responses alongside the uptime seconds.
 */
export function getServerStartMs(): number {
  return SERVER_START_MS;
}