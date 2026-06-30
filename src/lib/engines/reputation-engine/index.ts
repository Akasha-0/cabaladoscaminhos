/**
 * reputation-engine — public surface
 *
 * Reduced-scope (W83-B):
 *   - types.ts           — branded primitives + DTOs
 *   - reputation-events.ts — event taxonomy + 7-tradition weight matrix
 *   - reputation-ledger.ts — append-only ledger + SHA-256 chain
 *
 * Deferred to W84+:
 *   - badge-tier system
 *   - cycles overlay (weekly/monthly aggregation)
 *   - alerts/notifications
 */

export * from './types.ts';
export * from './reputation-events.ts';
export * from './reputation-ledger.ts';