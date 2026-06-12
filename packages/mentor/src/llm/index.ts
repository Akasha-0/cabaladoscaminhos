// LLM Factory — Abstraction layer for LLM providers
// Supports: Ollama (local), OpenAI (cloud), MiniMax (F-236), Mock (fallback)

// ─── Types ────────────────────────────────────────────────────────────────────

/** Async iterable that yields streaming response chunks. */
export interface LLMStreamResponse {
  stream(prompt: string, systemPrompt?: string): AsyncIterable<string>;
}
export interface LLMProvider {
  readonly name: string;
  readonly model: string;
  stream(prompt: string, systemPrompt?: string): AsyncIterable<string>;
  complete(prompt: string, systemPrompt?: string): Promise<string>;
}

/** Configuration for creating an LLM provider. */
export interface LLMConfig {
  openaiApiKey?: string;
  ollamaUrl?: string;
  /** F-236 — MiniMax Global Token Plan. Quando presente, o factory usa M3. */
  minimaxApiKey?: string;
  minimaxModel?: string;
  model?: string;
  temperature?: number;
}

// ─── Ollama Provider ─────────────────────────────────────────────────────────

const OLLAMA_DEFAULT_URL = 'http://localhost:11434';

class OllamaProvider implements LLMProvider {
  readonly name = 'ollama';
  readonly model: string;
  private readonly baseUrl: string;

  constructor(model: string, baseUrl: string = OLLAMA_DEFAULT_URL) {
    this.model = model;
    this.baseUrl = baseUrl;
  }

  async *stream(prompt: string): AsyncIterable<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Ollama response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.response) {
              yield data.response;
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

  async complete(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.status}`);
    }

    const data = (await response.json()) as { response?: string };
    return data.response ?? '';
  }
}

// ─── OpenAI Provider ──────────────────────────────────────────────────────────

const OPENAI_DEFAULT_URL = 'https://api.openai.com/v1/chat/completions';

class OpenAIProvider implements LLMProvider {
  readonly name = 'openai';
  readonly model: string;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly temperature: number;

  constructor(
    apiKey: string,
    model: string = 'gpt-4',
    baseUrl: string = OPENAI_DEFAULT_URL,
    temperature: number = 0.7
  ) {
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = baseUrl;
    this.temperature = temperature;
  }

  async *stream(prompt: string): AsyncIterable<string> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
        temperature: this.temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('OpenAI response body is not readable');
    }

    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
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

  async complete(prompt: string): Promise<string> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: this.temperature,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed: ${response.status}`);
    }

    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return data.choices?.[0]?.message?.content ?? '';
  }
}

// ─── Mock Provider ───────────────────────────────────────────────────────────

const MOCK_RESPONSES = [
  'A resposta emerge das águas profundas do conhecimento ancestral.',
  'Observe como a energia flui através dos caminhos determinados.',
  'O silêncio contém a sabedoria que as palavras não alcançam.',
  'Cada movimento revela uma verdade oculta no tecido da existência.',
  'A prática correta dissolve os véus da ilusão.',
];

class MockProvider implements LLMProvider {
  readonly name = 'mock';
  readonly model = 'mock-gpt-4';

  async *stream(prompt: string): AsyncIterable<string> {
    const response = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
    const words = response.split(' ');

    for (const word of words) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      yield word + ' ';
    }
  }

  async complete(prompt: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

const DEFAULT_OLLAMA_MODEL = 'llama3.2:latest';
const DEFAULT_OPENAI_MODEL = 'gpt-4';

const DEFAULT_MINIMAX_MODEL = 'MiniMax-M3';

// ─── MiniMax Provider (F-236) ────────────────────────────────────────────────

// Re-exporta MiniMaxProvider para uso externo sem precisar importar o módulo
// interno. A factory abaixo cria a instância com base no config.
export { MiniMaxProvider, MINIMAX_DEFAULT_MODEL, MINIMAX_DEFAULT_URL } from './minimax';

/**
 * Creates an LLM provider with auto-detection fallback.
 * Priority: Ollama → MiniMax (F-236) → OpenAI → Mock
 */
export async function createProvider(config: LLMConfig = {}): Promise<LLMProvider> {
  const { openaiApiKey, ollamaUrl, minimaxApiKey, minimaxModel, model, temperature } = config;

  // 1. Try Ollama (local) — sempre tem prioridade se estiver rodando
  const ollamaEndpoint = ollamaUrl ?? OLLAMA_DEFAULT_URL;

  if (await isOllamaAvailable(ollamaEndpoint)) {
    return new OllamaProvider(model ?? DEFAULT_OLLAMA_MODEL, ollamaEndpoint);
  }

  // 2. MiniMax Global Token Plan (F-236) — M3 raciocínio profundo, plano global
  if (minimaxApiKey) {
    const { MiniMaxProvider } = await import('./minimax');
    return new MiniMaxProvider({
      apiKey: minimaxApiKey,
      model: minimaxModel ?? DEFAULT_MINIMAX_MODEL,
      temperature: temperature ?? 0.7,
    });
  }

  // 3. OpenAI (cloud) — fallback se o usuário trouxer chave própria
  if (openaiApiKey) {
    return new OpenAIProvider(
      openaiApiKey,
      model ?? DEFAULT_OPENAI_MODEL,
      OPENAI_DEFAULT_URL,
      temperature ?? 0.7
    );
  }

  // 4. Mock (sempre disponível, devolve resposta pré-pronta)
  return new MockProvider();
}

/**
 * Check if Ollama is available at the given URL.
 */
async function isOllamaAvailable(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${url}/api/tags`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}


