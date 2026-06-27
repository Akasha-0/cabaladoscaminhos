// ============================================================================
// NOTIFICATIONS — Public API (barrel export)
// ============================================================================
// Importadores devem usar `@/lib/notifications` ao invés de arquivos internos
// para desacoplar da estrutura interna.
// ============================================================================

export * from './types';
export * from './preferences';
export * from './email';
export * from './push';
export * from './triggers';
