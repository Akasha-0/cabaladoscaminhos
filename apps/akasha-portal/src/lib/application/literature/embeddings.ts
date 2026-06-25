/**
 * embeddings.ts — wrapper sobre OpenAI text-embedding-3-small (1536 dims).
 *
 * Wave 23.1 — usado pelo cron de ingestão para gerar embeddings dos
 * abstracts recém-baixados do PubMed. O endpoint /api/literature/ingest
 * (Wave 21.1, single-paper) também consome esta função.
 *
 * Design:
 *   - Lazy: cliente OpenAI só é instanciado na primeira chamada (não
 *     na importação do módulo — economiza cold-start do serverless).
 *   - Graceful degradation: se OPENAI_API_KEY ausente, retorna embedding
 *     dummy de zeros (length 1536) e loga warning. Cron **não quebra**
 *     se embedding falhar — paper é inserido sem embedding (search
 *     vetorial só funciona depois de regenerar).
 *   - LGPD: texto enviado à OpenAI é o abstract público do paper. Sem
 *     PII do usuário, sem PHI.
 */

export const EMBEDDING_DIMS = 1536;
export const EMBEDDING_MODEL = 'text-embedding-3-small';

export interface EmbeddingResult {
  /** Vetor de 1536 floats. */
  embedding: number[];
  /** Modelo usado (registrado para auditoria). */
  model: string;
  /** True se embedding veio da OpenAI; false se dummy (degraded). */
  fromOpenAi: boolean;
}

/**
 * Lazy singleton do cliente OpenAI — evita custo de cold-start.
 * Em ambiente de teste (sem chave), retorna null.
 */
async function getOpenAiClient(): Promise<{
  embeddings: { create: (args: { model: string; input: string }) => Promise<{ data: Array<{ embedding: number[] }> }> };
} | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  // Import dinâmico — mantém bundle pequeno e cold-start rápido
  try {
    const mod = await import('openai');
    const OpenAI = mod.default;
    return new OpenAI({ apiKey }) as unknown as {
      embeddings: { create: (args: { model: string; input: string }) => Promise<{ data: Array<{ embedding: number[] }> }> };
    };
  } catch {
    return null;
  }
}

/**
 * Gera embedding de 1536 dims para um texto.
 *
 * Comportamento de fallback:
 *   - Se OPENAI_API_KEY ausente OU erro da API → retorna vetor de zeros
 *     com `fromOpenAi: false`. Caller decide se persiste o paper sem
 *     embedding ou aborta (cron: persiste, loga warning).
 */
export async function embedText(text: string): Promise<EmbeddingResult> {
  const trimmed = text.trim().slice(0, 8000); // 8K chars — limite seguro
  if (!trimmed) {
    return {
      embedding: new Array<number>(EMBEDDING_DIMS).fill(0),
      model: 'empty-input',
      fromOpenAi: false,
    };
  }

  const client = await getOpenAiClient();
  if (!client) {
    return {
      embedding: new Array<number>(EMBEDDING_DIMS).fill(0),
      model: `${EMBEDDING_MODEL}-unavailable`,
      fromOpenAi: false,
    };
  }

  try {
    const res = await client.embeddings.create({
      model: EMBEDDING_MODEL,
      input: trimmed,
    });
    const vec = res.data[0]?.embedding;
    if (!vec || vec.length !== EMBEDDING_DIMS) {
      throw new Error(`Unexpected embedding length: ${vec?.length ?? 0}`);
    }
    return { embedding: vec, model: EMBEDDING_MODEL, fromOpenAi: true };
  } catch (err) {
    // Log redacted — sem stack trace, sem API key
    console.warn(
      `[literature/embeddings] OpenAI failed (${err instanceof Error ? err.name : 'unknown'}); returning zero vector`
    );
    return {
      embedding: new Array<number>(EMBEDDING_DIMS).fill(0),
      model: `${EMBEDDING_MODEL}-failed`,
      fromOpenAi: false,
    };
  }
}

/**
 * Helper: gera embedding de um abstract, mas nunca falha.
 * Usado pelo cron para garantir que 1 paper com falha de embedding
 * não bloqueia o batch inteiro.
 */
export async function safeEmbedAbstract(abstract: string): Promise<EmbeddingResult> {
  return embedText(abstract);
}