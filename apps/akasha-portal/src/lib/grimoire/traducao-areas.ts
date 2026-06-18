/**
 * Tradução Pilar → Áreas da Vida — F-229
 *
 * Gap crítico: o Significado do Pilar (F-221) fala de "missão, sombra, prática"
 * em linguagem simbólica (Life Path 11, Sol em Escorpião, Corpo 7). Mas o
 * USUÁRIO FINAL vive em ÁREAS DA VIDA: paz, saúde, relações, dinheiro,
 * trabalho, propósito, criatividade, espiritualidade. O Significado sem
 * tradução para essas áreas não ENTREGA valor real.
 *
 * Esta camada fecha esse gap. Para cada combinação Pilar × Área, há uma
 * tradução curta (1-2 frases) que diz, em linguagem direta, o que o Pilar
 * PEDE à pessoa naquela área HOJE.
 *
 * Estrutura: matriz 5 Pilares × 8 Áreas = 40 entradas curadas.
 * Cada entrada é `frase` (1-2 frases diretas) + `fonte` (que Pilar usa).
 *
 * Princípios:
 *   - Linguagem APLICÁVEL, não esotérica
 *   - 2ª pessoa ("você", "hoje")
 *   - 1 ação prática embutida sempre que possível
 *   - Sem jargão técnico (Cabala, Sefirot, Odu, Hexagrama) sem tradução
 *
 * Pilar 4 (Odu) carrega `requer_terreiro: true` em todas as áreas, por
 * respeito a R-022 §4.4 — o Significado real vem do terreiro, não do app.
 */
import type { Pilar } from './significados-curados';

// ─── Types ───────────────────────────────────────────────────────────────────

export type Area =
  | 'paz'
  | 'saude'
  | 'relacoes'
  | 'dinheiro'
  | 'trabalho'
  | 'proposito'
  | 'criatividade'
  | 'espiritualidade';

export const AREAS: Area[] = [
  'paz',
  'saude',
  'relacoes',
  'dinheiro',
  'trabalho',
  'proposito',
  'criatividade',
  'espiritualidade',
];

export const AREA_LABEL: Record<Area, string> = {
  paz: 'Paz',
  saude: 'Saúde',
  relacoes: 'Relações',
  dinheiro: 'Dinheiro',
  trabalho: 'Trabalho',
  proposito: 'Propósito',
  criatividade: 'Criatividade',
  espiritualidade: 'Espiritualidade',
};

export const AREA_ICONE: Record<Area, string> = {
  paz: '☮',
  saude: '♥',
  relacoes: '◉',
  dinheiro: '◆',
  trabalho: '⚒',
  proposito: '✶',
  criatividade: '✎',
  espiritualidade: '✦',
};

export interface TraducaoArea {
  pilar: Pilar;
  area: Area;
  /** Frase direta de COMO o Pilar fala dessa área (1-2 frases, 2ª pessoa). */
  frase: string;
  /** De onde vem (Pilar + sistema fonte). */
  fonte: string;
  /** Apenas Pilar 4 (Odu) — R-022 §4.4. */
  requer_terreiro?: boolean;
}

// ─── Conteúdo Detalhado por Pilar × Área (F-232) ────────────────────────────

/**
 * Conteúdo profundo por Pilar × Área — estrutura de 8 párrafos:
 *  P1: Explicação central — o que este Pilar PEDE nesta área
 *  P2: Convergência — quando pilares concordam
 *  P3: Tensão — quando pilares pedem coisas diferentes
 *  P4: O que evitar
 *  P5: Prática concreta com timing
 *
 * Fallback: se não existir, usar TraducaoArea.frase (conteúdo de 1-2 frases).
 */
export interface TraducaoAreaDetalhada {
  pilar: Pilar;
  area: Area;
  /** Frase curta (backward compat — ementa) */
  frase: string;
  /** P1: Explicação central — 5-8 frases sobre o que o Pilar PEDE nesta área */
  explicacao: string;
  /** P2: Convergência — 3-5 frases sobre quando pilares concordam */
  convergencia: string;
  /** P3: Tensão — 3-5 frases sobre quando pilares CONFLITAM */
  tensao: string;
  /** P4: O que evitar — 2-3 frases, específico */
  evitar: string;
  /** P5: Prática concreta — 1-2 frases com timing específico */
  pratica: string;
  fonte: string;
  requer_terreiro?: boolean;
}

// ─── Pilar Data (micro-modules) ──────────────────────────────────────────────

export { CABALA } from './traducao-areas.cabala';
export { ASTROLOGIA } from './traducao-areas.astrologia';
export { TANTRICA } from './traducao-areas.tantrica';
export { ODU } from './traducao-areas.odu';
export { ICHING } from './traducao-areas.iching';

import { CABALA } from './traducao-areas.cabala';
import { ASTROLOGIA } from './traducao-areas.astrologia';
import { TANTRICA } from './traducao-areas.tantrica';
import { ODU } from './traducao-areas.odu';
import { ICHING } from './traducao-areas.iching';

// ─── Matriz completa ─────────────────────────────────────────────────────────

const MATRIZ: TraducaoArea[] = [...CABALA, ...ASTROLOGIA, ...TANTRICA, ...ODU, ...ICHING];

// ─── Helper functions ───────────────────────────────────────────────────────

/** Resolve a Tradução para um Pilar + Área. */
export function traducaoPara(pilar: Pilar, area: Area): TraducaoArea | undefined {
  return MATRIZ.find((t) => t.pilar === pilar && t.area === area);
}

/** Devolve 5 traduções (1 por Pilar) para uma Área. */
export function traducoesDaArea(area: Area): TraducaoArea[] {
  return MATRIZ.filter((t) => t.area === area);
}

/** Devolve 8 traduções (1 por Área) para um Pilar. */
export function traducoesDoPilar(pilar: Pilar): TraducaoArea[] {
  return MATRIZ.filter((t) => t.pilar === pilar);
}

/** Métricas estáticas da matriz F-229 */
export function coberturaTraducaoAreas() {
  const pilares = new Set(MATRIZ.map((t) => t.pilar)).size;
  const areas = new Set(MATRIZ.map((t) => t.area)).size;
  const total = MATRIZ.length;
  const com_terreiro = MATRIZ.filter((t) => t.requer_terreiro === true).length;
  return { pilares, areas, total, com_terreiro };
}

// ─── Conteúdo Detalhado (micro-module) ───────────────────────────────────────

export { TRADUCOES_DETALHADO } from './traducao-areas.matrix';
import { TRADUCOES_DETALHADO } from './traducao-areas.matrix';

// ─── Helpers de Conteúdo Detalhado ──────────────────────────────────────────

/** Devolve conteúdo detalhado para um Pilar + Área. Fallback: frase curta. */
export type TraducaoDetalhadaEntry = {
  pilar: Pilar;
  frase: string;
  explicacao: string;
  convergencia: string;
  tensao: string;
  evitar: string;
  pratica: string;
};

/** Devolve conteúdo detalhado para um Pilar + Área. Fallback: frase curta. */
export function traducaoDetalhadaPara(pilar: Pilar, area: Area): TraducaoDetalhadaEntry | null {
  const pilarEntry = TRADUCOES_DETALHADO[pilar];
  if (pilarEntry && pilarEntry[area]) {
    const e = pilarEntry[area]!;
    return {
      pilar,
      frase: e.frase,
      explicacao: e.explicacao,
      convergencia: e.convergencia,
      tensao: e.tensao,
      evitar: e.evitar,
      pratica: e.pratica,
    };
  }
  // Fallback: frase curta do MATRIZ
  const basic = traducaoPara(pilar, area);
  if (basic) {
    return {
      pilar,
      frase: basic.frase,
      explicacao: basic.frase,
      convergencia: '',
      tensao: '',
      evitar: '',
      pratica: '',
    };
  }
  return null;
}

/** Devolve conteúdo detalhado de todos os pilares para uma Área. */
export function traducoesDetalhadasDaArea(area: Area): TraducaoDetalhadaEntry[] {
  const pilares: Pilar[] = ['cabala', 'astrologia', 'tantrica', 'odu', 'iching'];
  return pilares
    .map((p) => traducaoDetalhadaPara(p, area))
    .filter((t): t is NonNullable<typeof t> => t !== null);
}
