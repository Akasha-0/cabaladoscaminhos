import type { ChatMessage, StreamChunk } from './types';

// ============================================================
// CONFIGURATION
// ============================================================

/**
 * Lê a chave de API do MiniMax exclusivamente de variável de ambiente.
 * Throw explícito se ausente (fail-closed) — antes deste fix
 * (ver docs/SECURITY-FIXES-WAVE10.md · F1) o token estava HARDCODED em
 * 3 arquivos e exposto no git history público.
 *
 * ⚠️ A chave antiga DEVE ser revogada no painel MiniMax antes do merge —
 * assume-se que está comprometida desde o primeiro commit.
 */
function getMinimaxApiToken(): string {
  const token = process.env.MINIMAX_API_TOKEN;
  if (!token || token.length === 0) {
    throw new MinimaxError(
      'MINIMAX_API_TOKEN não configurada. Defina em .env.local ou Vercel env vars.',
      500,
      'E_MINIMAX_KEY_MISSING'
    );
  }
  return token;
}
const MINIMAX_API_BASE = 'https://api.minimaxi.chat/v1';
const MINIMAX_MODEL = 'minimax/m3';

const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 1000;

// ============================================================
// ERROR TYPES
// ============================================================

export class MinimaxError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'MinimaxError';
  }
}

// ============================================================
// API CALLS
// ============================================================

/**
 * Generate a non-streaming response from Minimax
 */
export async function generateMinimaxResponse(
  messages: ChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  } = {}
): Promise<{ content: string; usage?: { total_tokens: number } }> {
  const model = options.model || MINIMAX_MODEL;
  const temperature = options.temperature ?? DEFAULT_TEMPERATURE;
  const max_tokens = options.max_tokens ?? DEFAULT_MAX_TOKENS;

  const response = await fetch(`${MINIMAX_API_BASE}/text/chatcompletion_v2`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getMinimaxApiToken()}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new MinimaxError(
      `Minimax API error: ${response.status} ${response.statusText} - ${errorText}`,
      response.status
    );
  }

  const data = await response.json();

  return {
    content: data.choices?.[0]?.message?.content || '',
    usage: data.usage ? { total_tokens: data.usage.total_tokens } : undefined,
  };
}

/**
 * Stream a response from Minimax
 */
export async function* streamMinimaxResponse(
  messages: ChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    max_tokens?: number;
  } = {}
): AsyncGenerator<StreamChunk> {
  const model = options.model || MINIMAX_MODEL;
  const temperature = options.temperature ?? DEFAULT_TEMPERATURE;
  const max_tokens = options.max_tokens ?? DEFAULT_MAX_TOKENS;

  const response = await fetch(`${MINIMAX_API_BASE}/text/chatcompletion_v2`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getMinimaxApiToken()}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    yield {
      content: '',
      done: true,
      error: `Minimax API error: ${response.status} ${response.statusText} - ${errorText}`,
    };
    return;
  }

  if (!response.body) {
    yield { content: '', done: true, error: 'Response body is null' };
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        yield { content: '', done: true };
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const data = trimmed.slice(6).trim();
        if (data === '[DONE]') {
          yield { content: '', done: true };
          return;
        }

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            yield { content, done: false };
          }
        } catch {
          // Skip malformed JSON
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}