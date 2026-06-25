/**
 * shared.ts — tipos públicos do módulo `discoveries` (Wave 23.2).
 *
 * ThoughtChainView (e seus filhos PaperChip, ConvergenceBadge) operam
 * puramente em cima desses tipos — NÃO importam de Prisma, @akasha/core,
 * nem de APIs Wave 20.2/21.1/21.2. Isso permite:
 *
 *   1. Renderizar offline (sem DB) — Zelador vê o pensamento da IA
 *      mesmo se o backend caiu.
 *   2. Testar isoladamente — passar mocks literais em `*.test.tsx`.
 *   3. Versionar — quando Wave 20.2/21.1/21.2 mergearem, o adapter
 *      `/api/discoveries/[id]` faz `toThoughtChainViewModel()` e devolve
 *      esses mesmos shapes.
 *
 * ADR-013 (Wave 23): Akasha Portal = consciência viva. Zelador precisa
 * VER a cadeia de pensamento — não só o resultado final.
 */

import type { DiscoverySource } from './sources';

// ─── Chain-of-thought (Wave 23.2 — visível na UI) ──────────────────────────

/**
 * Inputs que entraram na síntese (Wave 20.2 — espelha `ChainOfThought.inputs`
 * mas só com o que é seguro mostrar na UI do Zelador).
 *
 * "transits" e "related" são arrays ordenados por relevância.
 * Não inclui PII — apenas contexto derivado.
 */
export interface ThoughtChainInputs {
  /** Quais pilares contribuíram (1-5 pilares + 'literature'). */
  pilares: DiscoverySource[];
  /** Trânsito(s) do dia que entraram no cruzamento. */
  transits?: string[];
  /** IDs de chains anteriores (retrieval) — UI mostra como chips. */
  relatedChainIds?: string[];
  /** Histórico curto do cliente (padrões dos últimos N dias). */
  historicoCliente?: string[];
}

/**
 * Paper citado pela síntese (Wave 21.1 — espelha `LiteraturePaperDTO`).
 *
 * Source-of-truth é a tabela `LiteraturePaper`. Aqui só os campos que
 * a UI usa pra renderizar o chip + preview do abstract.
 */
export interface ThoughtChainPaper {
  id: string;
  title: string;
  /** Autores formatados: ["Riba J.", "Rodriguez-Fornells A.", "et al"] */
  authors: string[];
  year: number;
  journal: string;
  doi: string | null;
  /** URL open-access (PMC / arXiv / journal OA). */
  fullTextUrl: string | null;
  /** Abstract em inglês (fonte canônica). UI mostra preview ≤ 200 chars. */
  abstractEn: string;
  /** Abstract PT-BR quando disponível (fallback para abstractEn). */
  abstractPtBr: string | null;
}

/**
 * Descoberta relacionada (chain retrieval — Wave 20.2).
 *
 * Mostra ao Zelador: "esta nova síntese cruzou com chains anteriores".
 */
export interface ThoughtChainRelatedDiscovery {
  id: string;
  /** Verdade universal da chain relacionada (≤ 15 palavras, visceral). */
  verdadeUniversal: string;
  /** Tipo Akasha (se disponível). */
  akashaType?: string | null;
  /** Feedback acumulado: up-weighted primeiro (mostra pro Zelador). */
  feedback: 'up' | 'down' | 'neutral';
  /** ISO date. */
  createdAt: string;
}

/**
 * View-model completo consumido por `ThoughtChainView`.
 *
 * Construído server-side (Wave 23.2+) a partir de:
 *   - DiscoveryChain row (JSON `synthesis`)
 *   - `retrieveRelatedDiscoveries` (Wave 20.2)
 *   - `literature.papers` join (Wave 21.1)
 *   - `transits` day table (Wave 18.5+)
 *
 * UI consome APENAS este shape — sem saber nada de Prisma.
 */
export interface ThoughtChainViewModel {
  /** ID da DiscoveryChain. */
  discoveryId: string;
  /** Truth universal — destaque visual (Step 5). ≤ 15 palavras. */
  verdadeUniversal: string;
  /** Headline (≤ 8 palavras). */
  headline: string;
  /** Step 1 — inputs. */
  inputs: ThoughtChainInputs;
  /** Step 2 — reasoning (2-3 frases, visceral). */
  reasoning: string;
  /** Step 3 — papers cited. */
  papers: ThoughtChainPaper[];
  /** Step 4 — related discoveries. */
  relatedDiscoveries: ThoughtChainRelatedDiscovery[];
  /** Confiança 0-1 — mostra como barra/badge discreta. */
  confidence: number;
  /** ISO date (gerada em). */
  createdAt: string;
  /** Locale preferido do Zelador (pt-BR | en). */
  locale: string;
}