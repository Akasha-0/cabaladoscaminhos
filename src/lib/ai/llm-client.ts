/**
 * LLM Client — Wrapper abstrato para o motor de IA.
 * =================================================
 *
 * O PromptBuilder NUNCA fala diretamente com OpenAI ou Anthropic.
 * Ele sempre passa pelo `generateDossier()`, que seleciona o provider
 * conforme a configuração do ambiente. Isso permite trocar de fornecedor
 * sem refatorar o PromptBuilder.
 *
 * @see docs/06_ai-engine-spec.md §3.3
 *
 * Providers suportados:
 *  - 'openai'    — OpenAI GPT-4o (recomendado, mais barato)
 *  - 'anthropic' — Anthropic Claude Sonnet 4.6
 *  - 'minimax'   — Minimax API (compatível com OpenAI)
 *
 * A função retorna um `ReadableStream<Uint8Array>` que o caller
 * (API route) repassa como Server-Sent Events para o frontend.
 */

export type LLMProvider = 'openai' | 'anthropic' | 'minimax';

export interface GenerateDossierOptions {
  /** Provider preferido. Default: 'openai' */
  provider?: LLMProvider;
  /** Temperature. Default: 0.7 (criativo mas consistente) */
  temperature?: number;
  /** Máximo de tokens de saída. Default: 8000 */
  maxTokens?: number;
  /** System prompt (instruções de comportamento) */
  systemPrompt: string;
  /** Conteúdo do usuário (geralmente JSON.stringify do payload) */
  userContent: string;
  /** Modelo específico (sobrescreve o default do provider) */
  model?: string;
  /** Callback opcional para o modelo a ser reportado no Report */
  onModelResolved?: (model: string) => void;
}

const DEFAULT_MODELS: Record<LLMProvider, string> = {
  openai: 'gpt-4o',
  anthropic: 'claude-sonnet-4-6',
  minimax: 'MiniMax-Text-01',
};

function resolveApiKey(provider: LLMProvider): string {
  const envVar =
    provider === 'openai'
      ? 'OPENAI_API_KEY'
      : provider === 'anthropic'
        ? 'ANTHROPIC_API_KEY'
        : 'MINIMAX_API_KEY';
  const key = process.env[envVar];
  if (!key) {
    throw new Error(`${envVar} não configurado no .env`);
  }
  return key;
}

function resolveBaseUrl(provider: LLMProvider): string {
  if (provider === 'minimax') {
    return process.env.MINIMAX_API_URL ?? 'https://api.minimax.chat/v1';
  }
  return '';
}

/**
 * Gera o dossiê como stream. Retorna um `ReadableStream<Uint8Array>`
 * pronto para ser enviado ao cliente via Server-Sent Events.
 *
 * IMPORTANTE: esta função NÃO parseia o conteúdo — quem recebe
 * trata o stream como texto bruto (Markdown + possíveis chunks JSON).
 */
export async function generateDossier(
  options: GenerateDossierOptions
): Promise<ReadableStream<Uint8Array>> {
  const provider: LLMProvider = options.provider ?? 'openai';
  const temperature = options.temperature ?? 0.7;
  const maxTokens = options.maxTokens ?? 8000;
  const model = options.model ?? DEFAULT_MODELS[provider];
  options.onModelResolved?.(model);

  if (provider === 'anthropic') {
    return callAnthropic({
      apiKey: resolveApiKey('anthropic'),
      model,
      systemPrompt: options.systemPrompt,
      userContent: options.userContent,
      maxTokens,
      temperature,
    });
  }

  // openai e minimax compartilham o schema compatível
  return callOpenAICompatible({
    apiKey: resolveApiKey(provider),
    baseUrl: resolveBaseUrl(provider),
    model,
    systemPrompt: options.systemPrompt,
    userContent: options.userContent,
    maxTokens,
    temperature,
  });
}

// ============================================================================
// OpenAI / Minimax (compatíveis)
// ============================================================================

async function callOpenAICompatible(args: {
  apiKey: string;
  baseUrl: string;
  model: string;
  systemPrompt: string;
  userContent: string;
  maxTokens: number;
  temperature: number;
}): Promise<ReadableStream<Uint8Array>> {
  const url = args.baseUrl
    ? `${args.baseUrl.replace(/\/$/, '')}/chat/completions`
    : 'https://api.openai.com/v1/chat/completions';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${args.apiKey}`,
    },
    body: JSON.stringify({
      model: args.model,
      messages: [
        { role: 'system', content: args.systemPrompt },
        { role: 'user', content: args.userContent },
      ],
      stream: true,
      max_tokens: args.maxTokens,
      temperature: args.temperature,
    }),
  });

  if (!response.ok || !response.body) {
    const text = await response.text().catch(() => '');
    throw new Error(
      `LLM (openai-compatible) retornou ${response.status}: ${text || response.statusText}`
    );
  }
  return response.body;
}

// ============================================================================
// Anthropic Claude
// ============================================================================

async function callAnthropic(args: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  userContent: string;
  maxTokens: number;
  temperature: number;
}): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': args.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: args.model,
      max_tokens: args.maxTokens,
      temperature: args.temperature,
      stream: true,
      system: args.systemPrompt,
      messages: [{ role: 'user', content: args.userContent }],
    }),
  });

  if (!response.ok || !response.body) {
    const text = await response.text().catch(() => '');
    throw new Error(`LLM (anthropic) retornou ${response.status}: ${text || response.statusText}`);
  }

  // O formato do stream da Anthropic é diferente. Convertemos para um
  // stream de texto puro para uniformidade com o caller.
  return transformAnthropicStream(response.body);
}

function transformAnthropicStream(
  upstream: ReadableStream<Uint8Array>
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            if (buffer) {
              controller.enqueue(encoder.encode(buffer));
              buffer = '';
            }
            controller.close();
            return;
          }
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const payload = line.slice(5).trim();
            if (!payload || payload === '[DONE]') continue;
            try {
              const evt = JSON.parse(payload) as {
                type?: string;
                delta?: { type?: string; text?: string };
              };
              if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
                const text = evt.delta.text ?? '';
                if (text) controller.enqueue(encoder.encode(text));
              }
            } catch {
              // Ignora payloads malformados
            }
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        reader.releaseLock();
      }
    },
  });
}

/**
 * Provider default. Lê da env `LLM_PROVIDER` ou cai para 'openai'.
 */
export function getDefaultProvider(): LLMProvider {
  const fromEnv = process.env.LLM_PROVIDER?.toLowerCase();
  if (fromEnv === 'anthropic' || fromEnv === 'minimax') return fromEnv;
  return 'openai';
}

/**
 * Retorna o nome do modelo default para o provider informado.
 */
export function getDefaultModel(provider: LLMProvider): string {
  return DEFAULT_MODELS[provider];
}
