export type { AIResponse, ChatCompletionOptions, ChatMessage, StreamChunk } from './types';
export { sanitizeInput } from './sanitize';
export { gerarContextoUsuario } from './prompt-system';
export { parseInsightResponse, criarInsightFallback } from './insights/parser';
export type { InsightData } from './insights/types';

// Re-export error types for convenience
export {
  AIError,
  CircuitBreakerOpenError,
  RateLimitError,
  getCircuitBreakerStatus,
  resetCircuitBreaker,
  createChatCompletionStream,
} from './openai';

// Re-export generator types
export {
  type GerarInsightOptions,
  type InsightGenerationResult,
  gerarInsightDiario,
  gerarInsightComRetry,
  gerarInsightFresh,
  hasCachedInsight,
  limparCacheInsight,
} from './insights/generator';
export { traditionMapper, TraditionMapper } from './tradition-mapper';
export type { TraditionConnection, TraditionMapData } from './tradition-mapper';
