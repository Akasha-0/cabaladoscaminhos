/**
 * @akasha/graphrag/retriever/embedder — Wave 31.1
 *
 * Embedders para o MVP. Interface `Embedder` permite trocar
 * implementação sem mudar consumers.
 *
 * MVP: `HashEmbedder` — hash determinístico de substrings → 768d.
 *      Suficiente para testar retrieval; NÃO é embedder semântico.
 *      Produz vetor esparso-style: cada token hasheado acende 4-8 dims.
 *      Determinístico = idempotente em seeds/testes.
 *
 * Wave 31.2+: `OpenAIEmbedder` (text-embedding-3-small, 1536d).
 */

import type { Embedder } from "../types";

/** FNV-1a hash 32-bit — pequeno, determinístico, sem deps. */
function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export class HashEmbedder implements Embedder {
  public readonly dim = 768;

  async embed(text: string): Promise<number[]> {
    return this.computeVector(text);
  }

  computeVector(text: string): number[] {
    const tokens = text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]+/g, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 3 && t.length <= 32);

    const v = new Array<number>(this.dim).fill(0);
    if (tokens.length === 0) return v;

    for (const t of tokens) {
      const h = fnv1a(t);
      // Acende 4 dims por token para simular esparso-style.
      for (let i = 0; i < 4; i++) {
        const idx = (h >>> (i * 8)) % this.dim;
        v[idx] += 1.0;
      }
      // Bigrama para capturar contexto.
      if (tokens.length > 1) {
        const bi = `${t}|${tokens.indexOf(t) + 1}`;
        const hb = fnv1a(bi);
        for (let i = 0; i < 2; i++) {
          const idx = (hb >>> (i * 12)) % this.dim;
          v[idx] += 0.5;
        }
      }
    }

    // L2 normalize (para cosine similarity).
    let norm = 0;
    for (const x of v) norm += x * x;
    norm = Math.sqrt(norm);
    if (norm > 0) {
      for (let i = 0; i < v.length; i++) v[i] = v[i] / norm;
    }
    return v;
  }

  /** Cosine similarity (helper para debug/inspection). */
  similarity(a: number[], b: number[]): number {
    let dot = 0;
    const n = Math.min(a.length, b.length);
    for (let i = 0; i < n; i++) dot += a[i]! * b[i]!;
    let na = 0;
    let nb = 0;
    for (let i = 0; i < n; i++) {
      na += a[i]! * a[i]!;
      nb += b[i]! * b[i]!;
    }
    const denom = Math.sqrt(na) * Math.sqrt(nb);
    return denom > 0 ? dot / denom : 0;
  }
}

/**
 * Stub para Wave 31.2. Quando wired-up:
 * - usar text-embedding-3-small (1536d, MTEB 62.3%)
 * - cachear via Drizzle/Redis
 * - LGPD: nunca enviar PII (apenas texto canônico de nodes)
 */
export class OpenAIEmbedder implements Embedder {
  public readonly dim = 1536;

  async embed(_text: string): Promise<number[]> {
    throw new Error(
      "OpenAIEmbedder not yet implemented in Wave 31.1 — see AGENTS.md roadmap"
    );
  }

  computeVector(_text: string): number[] {
    return new Array<number>(this.dim).fill(0);
  }
}
