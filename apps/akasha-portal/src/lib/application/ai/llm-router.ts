import OpenAI from 'openai';
import type { ChatMessage, AIResponse } from './types';

export interface RouterCompletionOptions {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  model?: string;
}

export interface RouterStreamChunk {
  content: string;
  done: boolean;
  error?: string;
}

export interface LlmConfig {
  provider:
    | 'openai'
    | 'minimax'
    | 'anthropic'
    | 'local'
    | 'gemini'
    | 'groq'
    | 'deepseek'
    | 'openrouter';
  openaiKey: string | null;
  openaiModel: string;
  minimaxKey: string | null;
  minimaxModel: string;
  anthropicKey: string | null;
  anthropicModel: string;
  anthropicBaseUrl: string;
  localEndpoint: string;
  localModel: string;

  // Gemini
  geminiKey: string | null;
  geminiModel: string;

  // Groq
  groqKey: string | null;
  groqModel: string;

  // DeepSeek
  deepseekKey: string | null;
  deepseekModel: string;

  // OpenRouter
  openrouterKey: string | null;
  openrouterModel: string;
}

const DEFAULT_CONFIG: LlmConfig = {
  provider: 'openai',
  openaiKey: null,
  openaiModel: 'gpt-4o',
  minimaxKey: null,
  minimaxModel: 'minimax/m3',
  anthropicKey: null,
  anthropicModel: 'claude-3-5-sonnet',
  anthropicBaseUrl: '',
  localEndpoint: 'http://localhost:1234/v1',
  localModel: 'meta-llama-3-8b-instruct',

  geminiKey: null,
  geminiModel: 'gemini-1.5-flash',
  groqKey: null,
  groqModel: 'llama-3.3-70b-versatile',
  deepseekKey: null,
  deepseekModel: 'deepseek-chat',
  openrouterKey: null,
  openrouterModel: 'google/gemini-2.5-flash',
};

// ─── Configuração ─────────────────────────────────────────────────────────────

/**
 * Resolve the LLM configuration from env vars.
 * Falls back to DEFAULT_CONFIG values.
 */
export async function getLlmConfig(): Promise<LlmConfig> {
  return {
    provider: (process.env.LLM_PROVIDER as LlmConfig['provider']) || DEFAULT_CONFIG.provider,
    openaiKey: process.env.OPENAI_API_KEY || null,
    openaiModel: process.env.OPENAI_MODEL || DEFAULT_CONFIG.openaiModel,
    minimaxKey: process.env.MINIMAX_API_TOKEN || null,
    minimaxModel: process.env.MINIMAX_MODEL || DEFAULT_CONFIG.minimaxModel,
    anthropicKey: process.env.ANTHROPIC_API_KEY || null,
    anthropicModel: process.env.ANTHROPIC_MODEL || DEFAULT_CONFIG.anthropicModel,
    anthropicBaseUrl: process.env.ANTHROPIC_BASE_URL || '',
    localEndpoint: process.env.LOCAL_LLM_ENDPOINT || DEFAULT_CONFIG.localEndpoint,
    localModel: process.env.LOCAL_LLM_MODEL || DEFAULT_CONFIG.localModel,

    geminiKey: process.env.GEMINI_API_KEY || null,
    geminiModel: process.env.GEMINI_MODEL || DEFAULT_CONFIG.geminiModel,
    groqKey: process.env.GROQ_API_KEY || null,
    groqModel: process.env.GROQ_MODEL || DEFAULT_CONFIG.groqModel,
    deepseekKey: process.env.DEEPSEEK_API_KEY || null,
    deepseekModel: process.env.DEEPSEEK_MODEL || DEFAULT_CONFIG.deepseekModel,
    openrouterKey: process.env.OPENROUTER_API_KEY || null,
    openrouterModel: process.env.OPENROUTER_MODEL || DEFAULT_CONFIG.openrouterModel,
  };
}

// ─── Auxiliares de provider ──────────────────────────────────────────────────

const OPENAI_COMPATIBLE = ['openai', 'local', 'gemini', 'groq', 'deepseek', 'openrouter'] as const;

type OpenAICompatibleProvider = (typeof OPENAI_COMPATIBLE)[number];

/**
 * Resolve API key, base URL, and model for OpenAI-compatible providers.
 * Extracted to avoid duplication between completion and streaming paths.
 */
function resolveOpenAICompatibleProvider(
  provider: OpenAICompatibleProvider,
  config: LlmConfig,
  options: RouterCompletionOptions
): { apiKey: string; baseURL?: string; model: string } {
  switch (provider) {
    case 'openai':
      return {
        apiKey: config.openaiKey ?? process.env.OPENAI_API_KEY ?? '',
        model: options.model ?? config.openaiModel,
      };
    case 'local':
      return { apiKey: 'local', baseURL: config.localEndpoint, model: config.localModel };
    case 'gemini':
      return {
        apiKey: config.geminiKey ?? process.env.GEMINI_API_KEY ?? '',
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
        model: options.model ?? config.geminiModel,
      };
    case 'groq':
      return {
        apiKey: config.groqKey ?? process.env.GROQ_API_KEY ?? '',
        baseURL: 'https://api.groq.com/openai/v1',
        model: options.model ?? config.groqModel,
      };
    case 'deepseek':
      return {
        apiKey: config.deepseekKey ?? process.env.DEEPSEEK_API_KEY ?? '',
        baseURL: 'https://api.deepseek.com/v1',
        model: options.model ?? config.deepseekModel,
      };
    case 'openrouter':
      return {
        apiKey: config.openrouterKey ?? process.env.OPENROUTER_API_KEY ?? '',
        baseURL: 'https://openrouter.ai/api/v1',
        model: options.model ?? config.openrouterModel,
      };
  }
}

function logLlmCall(_provider: string, _model: string, _durationMs: number, _totalTokens?: number) {
  // Logging disabled in production
}

// ─── Completion ───────────────────────────────────────────────────────────────

/**
 * Execute non-streaming completion using the resolved LLM configuration.
 */
export async function generateCompletion(options: RouterCompletionOptions): Promise<AIResponse> {
  const config = await getLlmConfig();
  const startMs = Date.now();

  if (OPENAI_COMPATIBLE.includes(config.provider as OpenAICompatibleProvider)) {
    const { apiKey, baseURL, model } = resolveOpenAICompatibleProvider(
      config.provider as OpenAICompatibleProvider,
      config,
      options
    );
    const client = new OpenAI({ apiKey, baseURL });
    const completion = await client.chat.completions.create({
      model,
      messages: options.messages as any,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 1000,
    });
    logLlmCall(config.provider, model, Date.now() - startMs, completion.usage?.total_tokens);
    return {
      content: completion.choices[0]?.message?.content || '',
      usage: completion.usage
        ? {
            prompt_tokens: completion.usage.prompt_tokens,
            completion_tokens: completion.usage.completion_tokens,
            total_tokens: completion.usage.total_tokens,
          }
        : undefined,
      model,
    };
  }

  if (config.provider === 'minimax') {
    const token = config.minimaxKey ?? process.env.MINIMAX_API_TOKEN ?? '';
    const model = options.model ?? config.minimaxModel;
    const baseURL = process.env.MINIMAX_API_BASE_URL ?? 'https://api.minimaxi.chat/v1';

    const response = await fetch(`${baseURL}/text/chatcompletion_v2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        model,
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 1000,
      }),
    });

    if (!response.ok)
      throw new Error(`Minimax API error: ${response.status} - ${await response.text()}`);

    const data = await response.json();
    const totalTokens = data.usage?.total_tokens ?? 0;
    logLlmCall('minimax', model, Date.now() - startMs, totalTokens);
    return {
      content: data.choices?.[0]?.message?.content || '',
      usage: {
        prompt_tokens: data.usage?.prompt_tokens ?? 0,
        completion_tokens: data.usage?.completion_tokens ?? 0,
        total_tokens: totalTokens,
      },
      model,
    };
  }

  if (config.provider === 'anthropic') {
    const key =
      config.anthropicKey ?? process.env.ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_AUTH_TOKEN ?? '';
    const model = options.model ?? config.anthropicModel;
    // Base URL: ANTHROPIC_BASE_URL permite redirecionar para endpoints
    // Anthropic-compatíveis (ex: MiniMax via interface Anthropic).
    const endpoint = config.anthropicBaseUrl
      ? `${config.anthropicBaseUrl.replace(/\/$/, '')}/v1/messages`
      : 'https://api.anthropic.com/v1/messages';
    // Auth: x-api-key para Anthropic nativo, Bearer para proxies Anthropic-compatíveis.
    const isAnthropicNative = !config.anthropicBaseUrl;
    const authHeaders = isAnthropicNative
      ? { 'x-api-key': key }
      : { Authorization: `Bearer ${key}` };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: options.messages
          .filter((m) => m.role !== 'system')
          .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        system: options.messages.find((m) => m.role === 'system')?.content,
        max_tokens: options.max_tokens ?? 1000,
        temperature: options.temperature ?? 0.7,
      }),
    });

    if (!response.ok)
      throw new Error(`Anthropic API error: ${response.status} - ${await response.text()}`);

    const data = await response.json();
    const promptTokens = data.usage?.input_tokens ?? 0;
    const completionTokens = data.usage?.output_tokens ?? 0;
    logLlmCall('anthropic', model, Date.now() - startMs, promptTokens + completionTokens);
    return {
      content: data.content?.[0]?.text || '',
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: promptTokens + completionTokens,
      },
      model,
    };
  }

  throw new Error(`Provedor de LLM não suportado: ${config.provider}`);
}

// ─── Streaming ──────────────────────────────────────────────────────────────

/**
 * Execute streaming completion yielding SSE chunks.
 */
export async function* streamCompletion(
  options: RouterCompletionOptions
): AsyncGenerator<RouterStreamChunk> {
  const config = await getLlmConfig();

  if (OPENAI_COMPATIBLE.includes(config.provider as OpenAICompatibleProvider)) {
    const { apiKey, baseURL, model } = resolveOpenAICompatibleProvider(
      config.provider as OpenAICompatibleProvider,
      config,
      options
    );
    try {
      const client = new OpenAI({ apiKey, baseURL });
      const stream = await client.chat.completions.create({
        model,
        messages: options.messages as any,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 1000,
        stream: true,
      });
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || '';
        if (text) yield { content: text, done: false };
      }
      yield { content: '', done: true };
    } catch (err) {
      yield {
        content: '',
        done: true,
        error: err instanceof Error ? err.message : `Erro no stream ${config.provider}`,
      };
    }
    return;
  }

  if (config.provider === 'minimax') {
    const token = config.minimaxKey ?? process.env.MINIMAX_API_TOKEN ?? '';
    const model = options.model ?? config.minimaxModel;
    const baseURL = process.env.MINIMAX_API_BASE_URL ?? 'https://api.minimaxi.chat/v1';

    try {
      const response = await fetch(`${baseURL}/text/chatcompletion_v2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          model,
          messages: options.messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.max_tokens ?? 1000,
          stream: true,
        }),
      });

      if (!response.ok)
        throw new Error(`Minimax API error: ${response.status} - ${await response.text()}`);
      if (!response.body) throw new Error('Response body is null');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
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
              const text = parsed.choices?.[0]?.delta?.content;
              if (text) yield { content: text, done: false };
            } catch {
              /* ignore malformed JSON */
            }
          }
        }
        yield { content: '', done: true };
      } finally {
        reader.releaseLock();
      }
    } catch (err) {
      yield {
        content: '',
        done: true,
        error: err instanceof Error ? err.message : 'Erro no stream Minimax',
      };
    }
    return;
  }

  if (config.provider === 'anthropic') {
    const key =
      config.anthropicKey ?? process.env.ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_AUTH_TOKEN ?? '';
    const model = options.model ?? config.anthropicModel;
    const endpoint = config.anthropicBaseUrl
      ? `${config.anthropicBaseUrl.replace(/\/$/, '')}/v1/messages`
      : 'https://api.anthropic.com/v1/messages';
    const isAnthropicNative = !config.anthropicBaseUrl;
    const authHeaders = isAnthropicNative
      ? { 'x-api-key': key }
      : { Authorization: `Bearer ${key}` };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: options.messages
            .filter((m) => m.role !== 'system')
            .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
          system: options.messages.find((m) => m.role === 'system')?.content,
          max_tokens: options.max_tokens ?? 1000,
          temperature: options.temperature ?? 0.7,
          stream: true,
        }),
      });

      if (!response.ok)
        throw new Error(`Anthropic API error: ${response.status} - ${await response.text()}`);
      if (!response.body) throw new Error('Response body is null');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;
            try {
              const parsed = JSON.parse(trimmed.slice(6).trim());
              if (parsed.type === 'content_block_delta' && parsed.delta?.text)
                yield { content: parsed.delta.text, done: false };
            } catch {
              /* ignore malformed JSON */
            }
          }
        }
        yield { content: '', done: true };
      } finally {
        reader.releaseLock();
      }
    } catch (err) {
      yield {
        content: '',
        done: true,
        error: err instanceof Error ? err.message : 'Erro no stream Anthropic',
      };
    }
    return;
  }

  throw new Error(`Provedor de LLM não suportado: ${config.provider}`);
}
