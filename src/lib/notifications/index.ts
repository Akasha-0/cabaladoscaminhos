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
export * from './push';
export * from './triggers';
