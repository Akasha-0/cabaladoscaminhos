import { createChatCompletion, AIError, CircuitBreakerOpenError } from '../openai';
import { gerarSystemPrompt, gerarContextoUsuario, gerarPromptInsight, type UsuarioContext } from '../prompt-system';
import { parseInsightResponse, criarInsightFallback } from './parser';
import { getFromCache, setCache, clearCache } from './cache';
import type { InsightData } from './types';
import type { ChatMessage } from '../types';

const DEFAULT_MAX_TOKENS_INSIGHT = parseInt(process.env.OPENAI_MAX_TOKENS_INSIGHT || '500', 10);
const MAX_RETRIES = parseInt(process.env.OPENAI_MAX_RETRIES || '3', 10);

export interface GerarInsightOptions {
  usarCache?: boolean;
  temperatura?: number;
  maxTokens?: number;
}

export interface InsightGenerationResult {
  insight: InsightData;
  fromCache: boolean;
  retries: number;
  error?: string;
}

/**
 * Main function to generate daily insight with caching
 */
export async function gerarInsightDiario(
  contexto: UsuarioContext,
  options: GerarInsightOptions = {}
): Promise<InsightData> {
  const { usarCache = true, temperatura = 0.8, maxTokens = DEFAULT_MAX_TOKENS_INSIGHT } = options;

  // Check cache first
  const cacheKey = contexto.nome;
  if (usarCache) {
    const cached = getFromCache<InsightData>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const systemPrompt = gerarSystemPrompt();
  const contextoUsuario = gerarContextoUsuario(contexto);
  const promptInsight = gerarPromptInsight(contexto);

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: contextoUsuario + '\n\n' + promptInsight }
  ];

  try {
    const resposta = await createChatCompletion({
      messages,
      temperature: temperatura,
      max_tokens: maxTokens,
    });

    const insight = parseInsightResponse(resposta.content);

    // Cache successful response
    if (usarCache) {
      setCache(cacheKey, insight);
    }

    return insight;
  } catch (error) {
    console.error('[InsightGenerator] Erro ao gerar insight:', error);
    
    // If circuit breaker is open or non-retryable error, return fallback immediately
    if (error instanceof CircuitBreakerOpenError) {
      console.warn('[InsightGenerator] Circuit breaker open - using fallback');
      return criarInsightFallback();
    }
    
    if (error instanceof AIError && !error.isRetryable) {
      console.warn('[InsightGenerator] Non-retryable error - using fallback');
      return criarInsightFallback();
    }

    // Retryable errors will have been handled in createChatCompletion
    // If we reach here with an error, it means all retries failed
    const insightFallback = criarInsightFallback();
    return insightFallback;
  }
}

/**
 * Generate insight with explicit retry mechanism (for critical operations)
 */
export async function gerarInsightComRetry(
  contexto: UsuarioContext,
  maxTentativas = MAX_RETRIES
): Promise<InsightGenerationResult> {
  let ultimoErro: Error | null = null;
  let retries = 0;

  for (let i = 0; i < maxTentativas; i++) {
    retries = i;
    try {
      const insight = await gerarInsightDiario(contexto);
      return { insight, fromCache: false, retries };
    } catch (error) {
      ultimoErro = error instanceof Error ? error : new Error(String(error));
      console.error(`[InsightGenerator] Tentativa ${i + 1} falhou:`, ultimoErro.message);
    }
  }

  // All retries failed - return fallback with error info
  if (ultimoErro) {
    console.error(`[InsightGenerator] Falha após ${maxTentativas} tentativas:`, ultimoErro.message);
  }

  return {
    insight: criarInsightFallback(),
    fromCache: false,
    retries,
    error: ultimoErro?.message || 'Erro desconhecido',
  };
}

/**
 * Generate insight with forced cache refresh (bypass cache)
 */
export async function gerarInsightFresh(
  contexto: UsuarioContext,
  options?: GerarInsightOptions
): Promise<InsightData> {
  return gerarInsightDiario(contexto, { ...options, usarCache: false });
}

/**
 * Check if insight is available in cache
 */
export function hasCachedInsight(nome: string): boolean {
  const cached = getFromCache<InsightData>(nome);
  return cached !== null;
}

/**
 * Clear insight cache for a specific user
 */
export function limparCacheInsight(nome: string): void {
  clearCache(nome);
}
