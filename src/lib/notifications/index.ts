// ============================================================================
// NOTIFICATIONS — Public API (barrel export)
// ============================================================================
// Importadores devem usar `@/lib/notifications` ao invés de arquivos internos
// para desacoplar da estrutura interna.
// ============================================================================

export * from './types';
export * from './preferences';
export * from './email';
// push-server wins over push on name collisions (ES module re-export order)
// New canonical API: subscribeUser / sendPush / sendPushFromNotification /
// getVapidPublicKey / isVapidConfigured. Legacy push.ts (Prisma-injected)
// retained internally for backwards-compat with tests/mocks.
export * from './push-server';
// Explicit re-export of push.ts symbols NOT already exported by push-server
// (avoids TS2308 "has already exported a member" ambiguity errors).
export {
  type PushSubscriptionRow,
  saveSubscription,
  removeSubscription,
  type PushPrismaLike,
} from './push';
export * from './triggers';
