// ============================================================================
// W87-B — Mentorship Pairing · barrel export
// ----------------------------------------------------------------------------
// Re-exporta types + factory + adapter para que os consumers e o spec possam
// importar tudo de `@/engine/mentorship` sem precisar conhecer a estrutura
// interna.
// ============================================================================

export * from './types';
export * from './factory';
export { InMemoryMentorshipAdapter } from './adapter-memory';
