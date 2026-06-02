import { createHash } from 'crypto';
import type { MapaAlmaCompleto } from '@/lib/engines/types/mapa-alma';
import { createChatCompletion } from '@/lib/ai/openai';
import type { ChatMessage } from '@/lib/ai/types';
import { getRedisClient } from '@/lib/redis';
import { gerarSystemPrompt, gerarPromptInsight } from './prompt-builder';
import { parseInsightResponse, criarInsightFallback } from './parser';
import type { InsightData, GenerateInsightsOptions, GenerateInsightsResult } from './types';

/**
 * Generate SHA-256 cache key from nomeCompleto + dataNascimento.
 * Format: insights:{hash}
 * Matches spiritual-engine cache key convention.
 */
// fallow-ignore-next-line unused-export
export function gerarCacheKey(mapa: MapaAlmaCompleto): string {
  const { nomeCompleto, dataNascimento } = mapa.perfil;
  const input = `${nomeCompleto}::${dataNascimento}`;
  const hash = createHash('sha256').update(input).digest('hex');
  return `insights:${hash}`;
}

// ─── Redis cache helpers ───────────────────────────────────────────────────

async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    const client = await getRedisClient();
    const raw = await client.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    // Redis unavailable — fail open, proceed without cache
    return null;
  }
}

async function setCache(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    const client = await getRedisClient();
    await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    // Redis unavailable — non-fatal
  }
}

// ─── Main generator ──────────────────────────────────────────────────────

export async function generateMapaInsights(
  mapa: MapaAlmaCompleto,
  options: GenerateInsightsOptions = {},
): Promise<GenerateInsightsResult> {
  const {
    usarCache = true,
    temperatura = 0.7,
    maxTokens = 2000,
    forcar = false,
  } = options;

  const cacheKey = gerarCacheKey(mapa);

  // Try cache first (skip if forcing regeneration)
  if (usarCache && !forcar) {
    const cached = await getFromCache<InsightData>(cacheKey);
    if (cached) {
      return { insight: cached, fromCache: true, retries: 0, cacheKey };
    }
  }

  // Build prompts
  const systemPrompt = gerarSystemPrompt();
  const userPrompt = gerarPromptInsight(mapa);

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const retries = 0;

  try {
    const response = await createChatCompletion({
      messages,
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      temperature: temperatura,
      max_tokens: maxTokens,
    });

    const insight = parseInsightResponse(response.content);

    // Cache successful result with 24h TTL
    await setCache(cacheKey, insight, 86400);

    return { insight, fromCache: false, retries, cacheKey };
  } catch (err) {
    // Fallback on any error — log and return graceful fallback
    console.error('[MapaInsights] OpenAI call failed, using fallback:', err);

    const fallback = criarInsightFallback(mapa);

    return {
      insight: fallback,
      fromCache: false,
      retries,
      cacheKey,
    };
  }
}
