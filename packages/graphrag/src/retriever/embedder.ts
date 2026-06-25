/**
 * @akasha/graphrag/retriever/embedder — Wave 31.1
 *
 * Embedders para o MVP. Interface `Embedder` permite trocar
 * implementação sem mudar consumers.
 *
 * MVP: `HashEmbedder` — hash determinístico 768d. NÃO usar em
 * produção real; serve para o grafo do MVP ser pesquisável
 * semanticamente (queries similares → vetores similares via hashing
 * estável de substrings).
 *
 * Wave 31.2+: `OpenAIEmbedder` (text-embedding-3-small, 1536d).
 */

import type { Embedder } from "../types";

/**
 * FNV-1a hash estendido para gerar 768 floats pseudo-aleatórios
 * determinísticos a partir de uma string. NÃO é embedding real —
 * é placeholder. Para produção, plugar OpenAI / Cohere / local.
 *
 * Propriedades úteis para MVP:
 * - Determinístico: mesma string → mesmo vetor
 * - Dimensionalidade fixa: 768 (mesmo do `sessao_chunks` schema)
 * - "Similar" strings têm cosine > "dissimilar" (substring overlap
 *   ponderado — heurística leve, não LLM)
 */
export class HashEmbedder implements Embedder {
  readonly dim = 768;

  async embed(text: string): Promise<number[]> {
    return this.computeVector(text);
  }

  /** Síncrono para testes e seed (não precisa de I/O). */
  computeVector(text: string): number[] {
    const normalized = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const tokens = normalized.split(/[^a-z0-9]+/).filter(Boolean);
    const vec = new Array<number>(this.dim).fill(0);

    // Para cada token, distribui sinal em N posições via hash.
    // Tokens similares (substring) compartilham posições → cosine alto.
    for (const token of tokens) {
      for (let i = 0; i < token.length; i++) {
        const substr = token.slice(0, i + 1);
        const h = this.fnv1a(substr);
        const idx = h % this.dim;
        const sign = h & 1 ? 1 : -1;
        vec[idx] = (vec[idx] ?? 0) + sign * 1.0;
      }
    }

    // L2 normalize para cosine ∈ [-1, 1].
    let norm = 0;
    for (const v of vec) norm += v * v;
    norm = Math.sqrt(norm) || 1;
    return vec.map((v) => v / norm);
  }

  private fnv1a(s: string): number {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
}

/**
 * OpenAI embedder — STUB para Wave 31.2. Não chamar; lança erro
 * informativo. Mantido aqui para marcar onde plugar.
 */
export class OpenAIEmbedder implements Embedder {
  readonly dim = 1536;

  async embed(_text: string): Promise<number[]> {
    throw new Error(
      "OpenAIEmbedder: not implemented yet. Wire OPENAI_API_KEY + openai SDK in Wave 31.2. " +
        "See packages/graphrag/AGENTS.md roadmap."
    );
  }
}
