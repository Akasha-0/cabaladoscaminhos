import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { getOperatorFromServerContext } from '@/lib/auth/operator-session';
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
  provider: 'openai' | 'minimax' | 'anthropic' | 'local' | 'gemini' | 'groq' | 'deepseek' | 'openrouter';
  openaiKey: string | null;
  openaiModel: string;
  minimaxKey: string | null;
  minimaxModel: string;
  anthropicKey: string | null;
  anthropicModel: string;
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

/**
 * Resolves the LLM configuration for the operator.
 * Falls back to env variables.
 */
export async function getLlmConfig(operatorId?: string): Promise<LlmConfig> {
  let resolvedOperatorId = operatorId;

  if (!resolvedOperatorId) {
    const operator = await getOperatorFromServerContext();
    if (operator) resolvedOperatorId = operator.id;
  }

  if (resolvedOperatorId) {
    const setting = await prisma.userLlmSetting.findUnique({
      where: { userId: resolvedOperatorId },
    });

    if (setting) {
      return {
        provider: setting.provider as LlmConfig['provider'],
        openaiKey: setting.openaiKey,
        openaiModel: setting.openaiModel ?? 'gpt-4o',
        minimaxKey: setting.minimaxKey,
        minimaxModel: setting.minimaxModel ?? 'minimax/m3',
        anthropicKey: setting.anthropicKey,
        anthropicModel: setting.anthropicModel ?? 'claude-3-5-sonnet',
        localEndpoint: setting.localEndpoint ?? 'http://localhost:1234/v1',
        localModel: setting.localModel ?? 'meta-llama-3-8b-instruct',
        
        geminiKey: setting.geminiKey,
        geminiModel: setting.geminiModel ?? 'gemini-1.5-flash',
        groqKey: setting.groqKey,
        groqModel: setting.groqModel ?? 'llama-3.3-70b-versatile',
        deepseekKey: setting.deepseekKey,
        deepseekModel: setting.deepseekModel ?? 'deepseek-chat',
        openrouterKey: setting.openrouterKey,
        openrouterModel: setting.openrouterModel ?? 'google/gemini-2.5-flash',
      };
    }
  }

  // Fallback to Environment Variables
  return {
    provider: (process.env.LLM_PROVIDER as LlmConfig['provider']) || DEFAULT_CONFIG.provider,
    openaiKey: process.env.OPENAI_API_KEY || null,
    openaiModel: process.env.OPENAI_MODEL || DEFAULT_CONFIG.openaiModel,
    minimaxKey: process.env.MINIMAX_API_TOKEN || null,
    minimaxModel: process.env.MINIMAX_MODEL || DEFAULT_CONFIG.minimaxModel,
    anthropicKey: process.env.ANTHROPIC_API_KEY || null,
    anthropicModel: process.env.ANTHROPIC_MODEL || DEFAULT_CONFIG.anthropicModel,
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

/**
 * Execute non-streaming completion using the resolved LLM configuration
 */
export async function generateCompletion(
  options: RouterCompletionOptions,
  operatorId?: string
): Promise<AIResponse> {
  const config = await getLlmConfig(operatorId);
  const startMs = Date.now();

  const openAiCompatibleProviders = ['openai', 'local', 'gemini', 'groq', 'deepseek', 'openrouter'];
  
  if (openAiCompatibleProviders.includes(config.provider)) {
    let apiKey = '';
    let baseURL: string | undefined = undefined;
    let model = '';

    if (config.provider === 'openai') {
      apiKey = config.openaiKey ?? process.env.OPENAI_API_KEY ?? '';
      model = options.model ?? config.openaiModel;
    } else if (config.provider === 'local') {
      apiKey = 'local';
      baseURL = config.localEndpoint;
      model = config.localModel;
    } else if (config.provider === 'gemini') {
      apiKey = config.geminiKey ?? process.env.GEMINI_API_KEY ?? '';
      baseURL = 'https://generativelanguage.googleapis.com/v1beta/openai';
      model = options.model ?? config.geminiModel;
    } else if (config.provider === 'groq') {
      apiKey = config.groqKey ?? process.env.GROQ_API_KEY ?? '';
      baseURL = 'https://api.groq.com/openai/v1';
      model = options.model ?? config.groqModel;
    } else if (config.provider === 'deepseek') {
      apiKey = config.deepseekKey ?? process.env.DEEPSEEK_API_KEY ?? '';
      baseURL = 'https://api.deepseek.com/v1';
      model = options.model ?? config.deepseekModel;
    } else if (config.provider === 'openrouter') {
      apiKey = config.openrouterKey ?? process.env.OPENROUTER_API_KEY ?? '';
      baseURL = 'https://openrouter.ai/api/v1';
      model = options.model ?? config.openrouterModel;
    }

    const client = new OpenAI({ apiKey, baseURL });
    const completion = await client.chat.completions.create({
      model,
      messages: options.messages as any,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 1000,
    });

    const durationMs = Date.now() - startMs;
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: 'info',
        event: 'llm.call',
        provider: config.provider,
        model,
        durationMs,
        totalTokens: completion.usage?.total_tokens,
      })
    );

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
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model,
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens ?? 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Minimax API error: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    const totalTokens = data.usage?.total_tokens ?? 0;
    const durationMs = Date.now() - startMs;
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: 'info',
        event: 'llm.call',
        provider: 'minimax',
        model,
        durationMs,
        totalTokens,
      })
    );

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
    const key = config.anthropicKey ?? process.env.ANTHROPIC_API_KEY ?? '';
    const model = options.model ?? config.anthropicModel;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: options.messages.filter((m) => m.role !== 'system').map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        system: options.messages.find((m) => m.role === 'system')?.content,
        max_tokens: options.max_tokens ?? 1000,
        temperature: options.temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    const promptTokens = data.usage?.input_tokens ?? 0;
    const completionTokens = data.usage?.output_tokens ?? 0;
    const totalTokens = promptTokens + completionTokens;
    const durationMs = Date.now() - startMs;

    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: 'info',
        event: 'llm.call',
        provider: 'anthropic',
        model,
        durationMs,
        totalTokens,
      })
    );

    return {
      content: data.content?.[0]?.text || '',
      usage: {
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens,
      },
      model,
    };
  }

  throw new Error(`Provedor de LLM não suportado: ${config.provider}`);
}

/**
 * Execute streaming completion yielding SSE chunks
 */
export async function* streamCompletion(
  options: RouterCompletionOptions,
  operatorId?: string
): AsyncGenerator<RouterStreamChunk> {
  const config = await getLlmConfig(operatorId);

  const openAiCompatibleProviders = ['openai', 'local', 'gemini', 'groq', 'deepseek', 'openrouter'];

  if (openAiCompatibleProviders.includes(config.provider)) {
    let apiKey = '';
    let baseURL: string | undefined = undefined;
    let model = '';

    if (config.provider === 'openai') {
      apiKey = config.openaiKey ?? process.env.OPENAI_API_KEY ?? '';
      model = options.model ?? config.openaiModel;
    } else if (config.provider === 'local') {
      apiKey = 'local';
      baseURL = config.localEndpoint;
      model = config.localModel;
    } else if (config.provider === 'gemini') {
      apiKey = config.geminiKey ?? process.env.GEMINI_API_KEY ?? '';
      baseURL = 'https://generativelanguage.googleapis.com/v1beta/openai';
      model = options.model ?? config.geminiModel;
    } else if (config.provider === 'groq') {
      apiKey = config.groqKey ?? process.env.GROQ_API_KEY ?? '';
      baseURL = 'https://api.groq.com/openai/v1';
      model = options.model ?? config.groqModel;
    } else if (config.provider === 'deepseek') {
      apiKey = config.deepseekKey ?? process.env.DEEPSEEK_API_KEY ?? '';
      baseURL = 'https://api.deepseek.com/v1';
      model = options.model ?? config.deepseekModel;
    } else if (config.provider === 'openrouter') {
      apiKey = config.openrouterKey ?? process.env.OPENROUTER_API_KEY ?? '';
      baseURL = 'https://openrouter.ai/api/v1';
      model = options.model ?? config.openrouterModel;
    }

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
      yield { content: '', done: true, error: err instanceof Error ? err.message : `Erro no stream ${config.provider}` };
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          model,
          messages: options.messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.max_tokens ?? 1000,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Minimax API error: ${response.status} - ${await response.text()}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

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
              if (text) {
                yield { content: text, done: false };
              }
            } catch {
              // Ignore malformed JSON chunks
            }
          }
        }
        yield { content: '', done: true };
      } finally {
        reader.releaseLock();
      }
    } catch (err) {
      yield { content: '', done: true, error: err instanceof Error ? err.message : 'Erro no stream Minimax' };
    }
    return;
  }

  if (config.provider === 'anthropic') {
    const key = config.anthropicKey ?? process.env.ANTHROPIC_API_KEY ?? '';
    const model = options.model ?? config.anthropicModel;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: options.messages.filter((m) => m.role !== 'system').map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
          system: options.messages.find((m) => m.role === 'system')?.content,
          max_tokens: options.max_tokens ?? 1000,
          temperature: options.temperature ?? 0.7,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status} - ${await response.text()}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

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
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                yield { content: parsed.delta.text, done: false };
              }
            } catch {
              // Ignore malformed JSON chunks
            }
          }
        }
        yield { content: '', done: true };
      } finally {
        reader.releaseLock();
      }
    } catch (err) {
      yield { content: '', done: true, error: err instanceof Error ? err.message : 'Erro no stream Anthropic' };
    }
    return;
  }

  throw new Error(`Provedor de LLM não suportado: ${config.provider}`);
}
