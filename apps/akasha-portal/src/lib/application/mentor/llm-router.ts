/**
 * LLM Router for Mentor — F-236: MiniMax primary, OpenAI, Ollama, Mock
 *
 * Cadeia de provedores (priority order):
 *  1. MiniMax M3 (F-236) — MiniMax Global Token Plan.
 *     Default quando `MINIMAX_API_TOKEN` está setado.
 *     Modelo: MiniMax-M3 (raciocínio profundo + resposta densa).
 *  2. OpenAI (gpt-4o-mini) — quando `OPENAI_API_KEY` está setado.
 *  3. Ollama (llama3.2) — local fallback, se Ollama estiver rodando.
 *  4. Mock — resposta pré-pronta (dev only).
 *
 * Por que MiniMax é o primário:
 *  - Plano global barato (F-236) — não consome cota OpenAI.
 *  - M3 raciocínio profundo: ideal para cruzar 5 Pilares + grimório curado.
 *  - Cadeia de pensamento explícita (reasoning_content) — audita decisões.
 */
import { getCorrelations, correlationsToContext } from '@akasha/mentor/correlation';
import { mapsToPromptContext } from '@akasha/mentor/maps';
import type { UserMaps, MentorMessage } from '@akasha/mentor';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { ragForUserMaps, type UserMapsLike } from '@/lib/grimoire/rag-mapa';
import {
  dispatchToolsForEmotion,
  formatDispatchResultsForLLM,
} from '@akasha/mentor/tool-dispatcher';
import type { EmotionalState } from '@akasha/mentor/emotional-state';

const MINIMAX_ENDPOINT =
  process.env.MINIMAX_API_BASE_URL ?? 'https://api.minimaxi.chat/v1/text/chatcompletion_v2';
const MINIMAX_MODEL = process.env.MENTOR_MODEL ?? 'MiniMax-M3';

export interface LLMConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  ollamaUrl?: string;
  provider?: 'minimax' | 'openai' | 'ollama' | 'mock';
}

const DEFAULT_CONFIG: LLMConfig = {
  model: MINIMAX_MODEL,
  temperature: 0.7,
  maxTokens: 2000,
  ollamaUrl: process.env.OLLAMA_URL ?? 'http://localhost:11434',
  provider: process.env.MINIMAX_API_TOKEN ? 'minimax' : undefined,
};

export interface AskRequest {
  question: string;
  userId: string;
  sessionHistory?: MentorMessage[];
  /**
   * Wave 9.3 — estado emocional detectado (opcional). Quando definido,
   * dispara tools Akasha relevantes antes do LLM call e injeta o
   * resultado como bloco adicional no system prompt.
   *
   * NOTA: também pode vir de detecção automática via `detectEmotion()`
   * no caller. Aqui aceitamos o valor já classificado.
   */
  emotionalState?: EmotionalState | null;
}

export async function* streamMentorResponse(
  request: AskRequest,
  maps: UserMaps,
  history: MentorMessage[],
  config: LLMConfig = DEFAULT_CONFIG
): AsyncGenerator<string> {
  const mapsContext = mapsToPromptContext(maps);
  // F-233: injeta RAG do Grimório (Significados + Insight + Áreas + Conexões).
  const ragContext = ragForUserMaps(maps as unknown as UserMapsLike);

  // Get correlations for the question
  const correlations = await getCorrelations(maps, request.question);
  const correlationsContext = correlationsToContext(correlations);

  // Wave 9.3: dispatch tools Akasha baseadas no emotionalState (se definido).
  // `dispatchToolsForEmotion` já loga [mentor] emotion=X, dispatching tools: ...
  // e isola falhas por tool. Se emotionalState é null/undefined, retorna [].
  const dispatchResults = request.emotionalState
    ? await dispatchToolsForEmotion(request.emotionalState, {
        requestId: `mentor-${request.userId}-${Date.now()}`,
        consulenteId: request.userId,
      })
    : [];
  const toolInsightsBlock = request.emotionalState
    ? formatDispatchResultsForLLM(request.emotionalState, dispatchResults)
    : '';

  // Build messages
  const systemPrompt = await loadSystemPrompt();
  const messages = [
    { role: 'system' as const, content: systemPrompt },
    { role: 'system' as const, content: mapsContext },
    { role: 'system' as const, content: 'GRIMÓRIO CURADO (F-233):\n' + ragContext },
    { role: 'system' as const, content: `CORRELAÇÕES IDENTIFICADAS: ${correlationsContext}` },
    // Wave 9.3: injetar tool insights APÓS correlações e ANTES da history.
    // Só inclui o bloco se houver resultados (string vazia é pulada).
    ...(toolInsightsBlock
      ? [{ role: 'system' as const, content: toolInsightsBlock }]
      : []),
    ...history.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: request.question },
  ];

  // Priority: provider explícito → env detection
  // Ordem: anthropic (MiniMax via interface Anthropic, se setado) → minimax → openai → ollama
  const provider =
    config.provider ??
    (process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_BASE_URL
      ? 'anthropic'
      : process.env.MINIMAX_API_TOKEN
        ? 'minimax'
        : process.env.OPENAI_API_KEY
          ? 'openai'
          : 'ollama');

  try {
    switch (provider) {
      case 'minimax':
        yield await streamWithMiniMax(messages, config);
        return;
      case 'anthropic':
        yield* streamWithAnthropic(messages, config);
        return;
      case 'openai':
        yield* streamWithOpenAI(messages, config);
        return;
      case 'ollama':
        yield* streamWithOllama(messages, config);
        return;
      case 'mock':
        yield* streamWithMock(
          messages as { role: 'user' | 'assistant' | 'system'; content: string }[]
        );
        return;
    }
  } catch (_err) {
    // Fallback chain handles provider failures silently
    if (provider !== 'openai' && process.env.OPENAI_API_KEY) {
      yield* streamWithOpenAI(messages, config);
      return;
    }
    yield* streamWithOllama(messages, config);
  }
}

// ─── MiniMax provider (F-236) ──────────────────────────────────────────────

async function streamWithMiniMax(
  messages: { role: string; content: string }[],
  config: LLMConfig
): Promise<string> {
  const apiToken = process.env.MINIMAX_API_TOKEN;
  if (!apiToken) {
    throw new Error('MINIMAX_API_TOKEN not set');
  }
  const response = await fetch(MINIMAX_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`MiniMax ${response.status}: ${body.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? '';
}

async function* streamWithAnthropic(
  messages: { role: string; content: string }[],
  config: LLMConfig
): AsyncGenerator<string> {
  // Suporta tanto Anthropic nativo quanto proxies Anthropic-compatíveis
  // (ex: MiniMax via interface Anthropic em https://api.minimax.io/anthropic).
  const key = process.env.ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_AUTH_TOKEN ?? '';
  const baseUrl = process.env.ANTHROPIC_BASE_URL;
  const isAnthropicNative = !baseUrl;
  const endpoint = baseUrl
    ? `${baseUrl.replace(/\/$/, '')}/v1/messages`
    : 'https://api.anthropic.com/v1/messages';
  const authHeaders = isAnthropicNative ? { 'x-api-key': key } : { Authorization: `Bearer ${key}` };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        messages: messages
          .filter((m) => m.role !== 'system')
          .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
        system: messages.find((m) => m.role === 'system')?.content,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic/MiniMax ${response.status}: ${(await response.text()).slice(0, 200)}`);
    }
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
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          try {
            const parsed = JSON.parse(trimmed.slice(6).trim());
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              yield parsed.delta.text;
            }
          } catch {
            /* ignore malformed JSON */
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Erro no stream Anthropic/MiniMax');
  }
}

async function* streamWithOpenAI(
  messages: { role: string; content: string }[],
  config: LLMConfig
): AsyncGenerator<string> {
  const { OpenAI } = await import('openai');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const stream = await openai.chat.completions.create({
    model: config.model,
    messages: messages as Parameters<typeof openai.chat.completions.create>[0]['messages'],
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    stream: true,
  });
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) yield content;
  }
}

async function* streamWithMock(
  _messages: { role: string; content: string }[]
): AsyncGenerator<string> {
  // Dev-only mock: yields a simple test response
  const response = 'Olá! Sou o Mentor Akasha. Como posso ajudar você hoje? (mock mode)';
  for (const char of response) {
    yield char;
  }
}

async function* streamWithOllama(
  messages: { role: string; content: string }[],
  config: LLMConfig
): AsyncGenerator<string> {
  const url = process.env.OLLAMA_BASE_URL || 'http://localhost:11434/api/generate';
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: config.model, messages, stream: true }),
  });
  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}`);
  }
  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    try {
      const lines = chunk.split('\n').filter(Boolean);
      for (const line of lines) {
        const data = JSON.parse(line);
        if (data.message?.content) {
          yield data.message.content;
        }
      }
    } catch {
      // Ignore malformed JSON chunks
    }
  }
}

async function loadSystemPrompt(): Promise<string> {
  try {
    const promptPath = join(process.cwd(), 'grimoire', 'mentor', 'system-prompt.md');
    const content = await readFile(promptPath, 'utf-8');
    return content;
  } catch {
    // Fallback to inline prompt
    return `Você é Akáshico, um mentor espiritual que conhece profundamente 
Cabala, Ifá, Astrologia e Tantra. Você usa os mapas do usuário para 
dar respostas personalizadas e ritualísticas. Responda sempre em português brasileiro.

REGRAS:
1. Sempre correlacione elementos dos 4 mapas (Cabala, Ifá, Astrologia, Tantra)
2. Use linguagem ritualística e simbólica
3. Seja pessoal e contextualize com os dados específicos do usuário
4. Nunca invente dados que não estejam nos mapas`;
  }
}
