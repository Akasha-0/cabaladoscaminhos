import { NextResponse } from 'next/server';

const SERVER_START = Date.now();

/**
 * Liveness Probe Endpoint (AD-22.8)
 *
 * Purpose: Kubernetes/load balancer liveness check.
 * Returns 200 if the Node.js process is running and can respond.
 *
 * NO dependencies are checked (no DB, no Redis).
 * If this fails, the process is dead and should be restarted.
 *
 * Used by:
 * - Kubernetes livenessProbe
 * - Load balancer health checks
 * - Process monitoring
 */
export async function GET() {
  const body = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - SERVER_START) / 1000),
  };

  return NextResponse.json(body);
}
