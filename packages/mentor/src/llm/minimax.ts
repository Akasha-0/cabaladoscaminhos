/**
 * MiniMax Provider — F-236
 *
 * Provedor LLM para o MiniMax Global Token Plan.
 * Endpoint: https://api.minimaxi.chat/v1/text/chatcompletion_v2
 * Modelo padrão: MiniMax-M3 (M3 — raciocínio profundo + resposta densa)
 *
 * Diferenças vs OpenAI:
 *  - A API M3 v2 envia tudo em uma única resposta JSON; o `stream` é apenas
 *    compatível com a interface AsyncIterable.
 *  - Resposta inclui `reasoning_content` — o raciocínio do modelo.
 *    Exposto como `lastReasoning` para debug.
 *  - `reasoning_details[]` documenta a cadeia de pensamento.
 *
 * Esta camada é DETERMINÍSTICA em produção (chave fixa do plano global).
 * Para testes, é mockável via `vi.mock('./minimax')`.
 */
import type { LLMProvider } from './index';

const MINIMAX_DEFAULT_URL = 'https://api.minimaxi.chat/v1/text/chatcompletion_v2';
const MINIMAX_DEFAULT_MODEL = 'MiniMax-M3';

export { MINIMAX_DEFAULT_URL, MINIMAX_DEFAULT_MODEL };

export interface MiniMaxProviderOptions {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export class MiniMaxProvider implements LLMProvider {
  readonly name = 'minimax';
  readonly model: string;
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly temperature: number;
  private readonly maxTokens: number;
  /** Último raciocínio exposto pelo modelo (M3 reasoning). Útil para debug. */
  public lastReasoning: string | null = null;

  constructor(opts: MiniMaxProviderOptions) {
    this.apiKey = opts.apiKey;
    this.model = opts.model ?? MINIMAX_DEFAULT_MODEL;
    this.baseUrl = opts.baseUrl ?? MINIMAX_DEFAULT_URL;
    this.temperature = opts.temperature ?? 0.7;
    this.maxTokens = opts.maxTokens ?? 2048;
  }

  async *stream(prompt: string, systemPrompt?: string): AsyncIterable<string> {
    const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `MiniMax API error: ${response.status} ${response.statusText} - ${errorBody}`
      );
    }

    if (!response.body) {
      throw new Error('MiniMax API response has no body');
    }

    const data = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string;
          reasoning_content?: string;
          reasoning_details?: Array<{ type: string; text: string }>;
        };
        finish_reason?: string;
      }>;
      usage?: {
        total_tokens?: number;
        prompt_tokens?: number;
        completion_tokens?: number;
      };
    };

    const content = data.choices?.[0]?.message?.content;
    const reasoning = data.choices?.[0]?.message?.reasoning_content;
    if (reasoning) this.lastReasoning = reasoning;

    if (!content) {
      throw new Error('MiniMax returned empty content');
    }

    // A API M3 devolve uma única resposta; "streamamos" em um único chunk.
    yield content;
  }

  async complete(prompt: string, systemPrompt?: string): Promise<string> {
    const chunks: string[] = [];
    for await (const chunk of this.stream(prompt, systemPrompt)) {
      chunks.push(chunk);
    }
    return chunks.join('');
  }
}
