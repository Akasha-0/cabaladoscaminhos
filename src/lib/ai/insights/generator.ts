import { createChatCompletion } from '../openai';
import { gerarSystemPrompt, gerarContextoUsuario, gerarPromptInsight, type UsuarioContext } from '../prompt-system';
import { parseInsightResponse, criarInsightFallback } from './parser';
import { getFromCache, setCache } from './cache';
import type { InsightData } from './types';
import type { ChatMessage } from '../types';

const DEFAULT_MAX_TOKENS_INSIGHT = parseInt(process.env.OPENAI_MAX_TOKENS_INSIGHT || '500', 10);

export interface GerarInsightOptions {
  usarCache?: boolean;
  temperatura?: number;
}

export async function gerarInsightDiario(
  contexto: UsuarioContext,
  options: GerarInsightOptions = {}
): Promise<InsightData> {
  const { usarCache = true, temperatura = 0.8 } = options;

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
      max_tokens: DEFAULT_MAX_TOKENS_INSIGHT
    });

    const insight = parseInsightResponse(resposta.content);

    if (usarCache) {
      setCache(cacheKey, insight);
    }

    return insight;
  } catch (error) {
    console.error('Erro ao gerar insight:', error);

    const insightFallback = criarInsightFallback();
    return insightFallback;
  }
}

export async function gerarInsightComRetry(
  contexto: UsuarioContext,
  maxTentativas = 2
): Promise<InsightData> {
  let ultimoErro: Error | null = null;

  for (let i = 0; i < maxTentativas; i++) {
    try {
      return await gerarInsightDiario(contexto);
    } catch (error) {
      ultimoErro = error instanceof Error ? error : new Error(String(error));
      console.error(`Tentativa ${i + 1} falhou:`, ultimoErro.message);
    }
  }

  if (ultimoErro) {
    throw new Error(`Falha após ${maxTentativas} tentativas: ${ultimoErro.message}`);
  }

  return criarInsightFallback();
}