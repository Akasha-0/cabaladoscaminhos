export interface UserSpiritualData {
  id: string;
  nome: string;
  dataNascimento: string;
  numeroPessoal: number;
  arcoPessoal: number;
  odu: string;
  orixaRegente: string;
  sefirotDominante: string[];
  arcoMaior: number[];
  sign: string;
  houses: Record<string, number>;
  rashi: string;
  planetPositions?: Record<string, number>;
}

/**
 * Chat message structure for AI API calls
 */
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
  error?: string;
}
