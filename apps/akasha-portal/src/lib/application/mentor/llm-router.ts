/**
 * LLM Router for Mentor - OpenAI primary with Ollama fallback
 */

import { OpenAI } from 'openai';
import type { UserMaps, MentorMessage } from '@akasha/mentor/types';
import { mapsToPromptContext } from '@akasha/mentor/maps';
import { getCorrelations, correlationsToContext } from '@akasha/mentor/correlation';
import { readFile } from 'fs/promises';
import { join } from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface LLMConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  ollamaUrl?: string;
}

const DEFAULT_CONFIG: LLMConfig = {
  model: process.env.MENTOR_MODEL ?? 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 2000,
  ollamaUrl: process.env.OLLAMA_URL ?? 'http://localhost:11434',
};

export interface AskRequest {
  question: string;
  userId: string;
  sessionHistory?: MentorMessage[];
}

export async function* streamMentorResponse(
  request: AskRequest,
  maps: UserMaps,
  history: MentorMessage[],
  config: LLMConfig = DEFAULT_CONFIG
): AsyncGenerator<string> {
  const mapsContext = mapsToPromptContext(maps);

  // Get correlations for the question
  const correlations = await getCorrelations(maps, request.question);
  const correlationsContext = correlationsToContext(correlations);

  // Build messages
  const systemPrompt = await loadSystemPrompt();
  const messages = [
    { role: 'system' as const, content: systemPrompt },
    { role: 'system' as const, content: mapsContext },
    { role: 'system' as const, content: `CORRELAÇÕES IDENTIFICADAS: ${correlationsContext}` },
    ...history.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    })),
    { role: 'user' as const, content: request.question }
  ];

  try {
    // Try OpenAI first
    const stream = await openai.chat.completions.create({
      model: config.model,
      messages,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) yield content;
    }
  } catch (openaiError) {
    // Fallback to Ollama
    console.warn('OpenAI failed, trying Ollama:', openaiError);
    yield* streamWithOllama(messages, config);
  }
}

async function* streamWithOllama(
  messages: { role: string; content: string }[],
  config: LLMConfig
): AsyncGenerator<string> {
  const response = await fetch(`${config.ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3.2',
      messages,
      stream: true,
    }),
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
