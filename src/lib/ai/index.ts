// ============================================================================
// AI barrel — public re-exports
// ============================================================================
// Note (cycle 19): orphan re-exports for prompt-system, insights/parser,
// insights/types, and tradition-mapper were removed. The corresponding files
// don't exist in src/lib/ai/ yet (W21 roadmap). If consumers need them back,
// add the source files under src/lib/ai/ first, then restore the re-export.
// ============================================================================

export type { AIResponse, ChatCompletionOptions, ChatMessage, StreamChunk } from './types';
export { sanitizeInput } from './sanitize';

// Re-export error types for convenience
export {
  AIError,
  CircuitBreakerOpenError,
  RateLimitError,
  getCircuitBreakerStatus,
  resetCircuitBreaker,
  createChatCompletionStream,
} from './openai';
