/**
 * Daily Reflection — Pool loader
 * ============================================================================
 * Carrega o JSON curado de prompts e expõe funções tipadas para seleção.
 *
 * REGRAS:
 *   - NUNCA gerar prompts em runtime (não usar LLM, não usar templates dinâmicos)
 *   - Conteúdo espiritual sempre curado pelo skill `curator` antes de virar JSON
 *   - Toda tradição nova deve ser adicionada em KNOWN_TRADITIONS (fail-loud)
 *
 * FONTE: /data/daily-prompts.json (carregado com require para compatibilidade
 * com Next.js webpack/turbopack — JSON estático não precisa de fs runtime).
 * ============================================================================
 */

import poolJson from "../../data/daily-prompts.json";

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------

export type Tradition = keyof typeof KNOWN_TRADITIONS;

export const KNOWN_TRADITIONS = {
  universal: "Convites universais (não-tradicional-específico)",
  cabala: "Cabala / Árvore da Vida",
  candomble: "Candomblé (matriz Yorubá)",
  umbanda: "Umbanda (sincrética brasileira)",
  ifa: "Ifá (sistema oracular Yorubá)",
  tantra: "Tantra (tradições índicas)",
} as const;

export type Locale = "pt-BR" | "en-US";

export const SUPPORTED_LOCALES: readonly Locale[] = ["pt-BR", "en-US"];

export interface Prompt {
  id: string;
  tradition: string;
  tone: string;
  /** Texto localizado por idioma. Sempre prover ao menos pt-BR. */
  "pt-BR": string;
  "en-US": string;
}

// ----------------------------------------------------------------------------
// Pool validation (fail-loud se JSON tiver schema errado)
// ----------------------------------------------------------------------------

const _pool: Prompt[] = (poolJson as { prompts: Prompt[] }).prompts;

function assertValidPool(pool: Prompt[]): void {
  const seen = new Set<string>();
  for (const p of pool) {
    if (!p.id || typeof p.id !== "string") {
      throw new Error(`[daily-reflection] prompt sem id válido: ${JSON.stringify(p)}`);
    }
    if (seen.has(p.id)) {
      throw new Error(`[daily-reflection] prompt id duplicado: ${p.id}`);
    }
    seen.add(p.id);
    if (!(p.tradition in KNOWN_TRADITIONS)) {
      throw new Error(
        `[daily-reflection] prompt "${p.id}" tem tradição desconhecida: ${p.tradition}. ` +
        `Adicione em KNOWN_TRADITIONS (src/lib/daily-reflection/pool.ts).`,
      );
    }
    if (!p["pt-BR"] || typeof p["pt-BR"] !== "string") {
      throw new Error(`[daily-reflection] prompt "${p.id}" sem texto pt-BR`);
    }
    if (!p["en-US"] || typeof p["en-US"] !== "string") {
      throw new Error(`[daily-reflection] prompt "${p.id}" sem texto en-US`);
    }
    // Regra ética: todo prompt DEVE começar com "Convite à reflexão" (ou "An invitation")
    // — fail-loud se alguém esquecer, garantindo consistência de tom.
    const pt = p["pt-BR"];
    const en = p["en-US"];
    if (!pt.startsWith("Convite à reflexão") && !en.startsWith("An invitation")) {
      throw new Error(
        `[daily-reflection] prompt "${p.id}" não começa com "Convite à reflexão" / "An invitation". ` +
        `Tom deve ser convite, não instrução.`,
      );
    }
  }
}

assertValidPool(_pool);

// ----------------------------------------------------------------------------
// Pool accessors
// ----------------------------------------------------------------------------

export function getPool(): readonly Prompt[] {
  return _pool;
}

export function getPromptsByTradition(tradition: Tradition | string): Prompt[] {
  return _pool.filter((p) => p.tradition === tradition);
}

export function getUniversalPrompts(): Prompt[] {
  return getPromptsByTradition("universal");
}

export function getPromptById(id: string): Prompt | undefined {
  return _pool.find((p) => p.id === id);
}

export function getPoolStats(): { total: number; byTradition: Record<string, number> } {
  const byTradition: Record<string, number> = {};
  for (const p of _pool) {
    byTradition[p.tradition] = (byTradition[p.tradition] ?? 0) + 1;
  }
  return { total: _pool.length, byTradition };
}