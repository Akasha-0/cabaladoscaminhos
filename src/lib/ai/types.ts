export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  /** Use fallback model (gpt-4o-mini) on retries */
  useFallback?: boolean;
}

export interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

/**
 * Stream chunk for streaming responses
 */
export interface StreamChunk {
  content: string;
  done: boolean;
}
