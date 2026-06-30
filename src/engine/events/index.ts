// ============================================================================
// W86-D — Events/Workshops Engine · barrel
// ----------------------------------------------------------------------------
// Re-exports everything the public surface needs (page + tests + scripts).
// ============================================================================

export * from './types';
export {
  createEventsEngine,
  computeEventStats,
} from './factory';
export { InMemoryEventsAdapter, toEventId, toRSVPId, toUserId } from './adapter-memory';
