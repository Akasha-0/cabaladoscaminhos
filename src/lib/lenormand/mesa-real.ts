/**
 * Mesa Real Reading System
 * Based on IDEIA.md pp.124-136
 * 8x4+4 and 9x4 spread layouts
 */

import {
  LENORMAND_CARDS,
  getCardByNumero,
  type LenormandCard,
} from './data';

/**
 * Mesa Real spread formats
 */
export interface MesaRealSpread {
  format: '8x4+4' | '9x4';
  totalCards: number;
  rows: number;
  cols: number;
  destinyCards: number;
  casaLabels: string[];
}

/**
 * Card drawn in a spread position
 */
export interface SpreadCard {
  position: number;
  house: number;
  cardIndex: number;
  cardName: string;
  orientation: 'upright' | 'reversed';
  significado: string;
}

/**
 * Destiny/future card (last 4 in 8x4+4 spread)
 */
export interface DestinyCard {
  position: number;
  cardIndex: number;
  cardName: string;
  significado: string;
}

/**
 * Complete Mesa Real reading
 */
export interface MesaRealReading {
  spreadFormat: string;
  cards: SpreadCard[];
  destinyCards?: DestinyCard[];
  themes: {
    dinheiro: { cards: number[]; description: string };
    amor: { cards: number[]; description: string };
    trabalho: { cards: number[]; description: string };
    saude: { cards: number[]; description: string };
  };
  analysis: {
    totalFavoravel: number;
    totalDesafio: number;
    totalAlerta: number;
    totalNeutro: number;
    convergencias: string[];
    mensagemGeral: string;
  };
}

/**
 * Mesa Real spread configurations
 */
export const MESA_REAL_SPREADS: Record<string, MesaRealSpread> = {
  '8x4+4': {
    format: '8x4+4',
    totalCards: 36, // 8*4 + 4 destiny
    rows: 4,
    cols: 8,
    destinyCards: 4,
    casaLabels: [
      'Cavaleiro', 'Trevo', 'Navio', 'Casa', 'Árvore', 'Nuvens', 'Cobra', 'Caixão',
      'Flores', 'Foice', 'Chicote', 'Pássaros', 'Criança', 'Raposa', 'Urso', 'Estrela',
      'Cegonha', 'Cachorro', 'Torre', 'Jardim', 'Montanha', 'Caminhos', 'Rato', 'Coração',
      'Anel', 'Livro', 'Carta', 'Cigano', 'Cigana', 'Lírios', 'Sol', 'Lua',
      'Coroa', 'Destino', 'Firmeza', 'Prova',
    ],
  },
  '9x4': {
    format: '9x4',
    totalCards: 36,
    rows: 4,
    cols: 9,
    destinyCards: 0,
    casaLabels: [
      'Cavaleiro', 'Trevo', 'Navio', 'Casa', 'Árvore', 'Nuvens', 'Cobra', 'Caixão', 'Flores',
      'Foice', 'Chicote', 'Pássaros', 'Criança', 'Raposa', 'Urso', 'Estrela', 'Cegonha', 'Cachorro',
      'Torre', 'Jardim', 'Montanha', 'Caminhos', 'Rato', 'Coração', 'Anel', 'Livro', 'Carta', 'Cigano',
      'Cigana', 'Lírios', 'Sol', 'Lua', 'Chave', 'Peixes', 'Âncora', 'Cruz',
    ],
  },
};

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Deterministic shuffle using seed
 */
export function deterministicShuffle(array: number[], seed: number): number[] {
  const result = [...array];
  let currentSeed = seed;
  
  for (let i = result.length - 1; i > 0; i--) {
    currentSeed = (currentSeed * 1103515245 + 12345) & 0x7fffffff;
    const j = currentSeed % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Draw random cards for a spread
 */
export function drawCards(count: number, shuffled?: boolean): number[] {
  const indices = Array.from({ length: 36 }, (_, i) => i + 1); // 1-36
  return shuffled ? shuffle(indices) : indices;
}

/**
 * Options for performing a reading
 */
export interface RealizarLeituraOptions {
  format?: '8x4+4' | '9x4';
  cardIndices?: number[];
  seed?: number;
}

/**
 * Perform a complete Mesa Real reading
 */
export function realizarLeitura(options: RealizarLeituraOptions = {}): MesaRealReading {
  const { format = '8x4+4', cardIndices, seed } = options;
  const spread = MESA_REAL_SPREADS[format];
  const totalPositions = format === '8x4+4' ? 32 : 36;

  // Determine cards to use
  let cardsToUse: number[];
  if (cardIndices) {
    cardsToUse = cardIndices;
  } else if (seed !== undefined) {
    const allCards = drawCards(36);
    cardsToUse = deterministicShuffle(allCards, seed).slice(0, totalPositions);
  } else {
    cardsToUse = drawCards(totalPositions, true);
  }

  // Parse cards into positions
  const cards: SpreadCard[] = [];
  const destinyCards: DestinyCard[] = [];

  for (let i = 0; i < Math.min(cardsToUse.length, totalPositions); i++) {
    const cardIndex = cardsToUse[i];
    const card = getCardByNumero(cardIndex);

    if (!card) continue;

    // Determine orientation (alternating pattern for simplicity)
    const orientation: 'upright' | 'reversed' =
      i % 3 === 0 ? 'reversed' : 'upright';

    const spreadCard: SpreadCard = {
      position: i + 1,
      house: i + 1,
      cardIndex,
      cardName: card.nome,
      orientation,
      significado: orientation === 'upright' ? card.significadoCentral : card.areaVida,
    };

    cards.push(spreadCard);
  }

  // Destiny cards (last 4 in 8x4+4)
  if (format === '8x4+4' && cardsToUse.length > 32) {
    for (let i = 32; i < Math.min(cardsToUse.length, 36); i++) {
      const cardIndex = cardsToUse[i];
      const card = getCardByNumero(cardIndex);

      if (!card) continue;

      destinyCards.push({
        position: i + 1,
        cardIndex,
        cardName: card.nome,
        significado: card.significadoCentral,
      });
    }
  }

  // Theme analysis
  const themeAnalysis = analyzeReadingThemes(cards);

  // Count card types
  const typeCounts = {
    totalFavoravel: cards.filter((c) => {
      const card = getCardByNumero(c.cardIndex);
      return card?.tipo === 'favoravel';
    }).length,
    totalDesafio: cards.filter((c) => {
      const card = getCardByNumero(c.cardIndex);
      return card?.tipo === 'desafio';
    }).length,
    totalAlerta: cards.filter((c) => {
      const card = getCardByNumero(c.cardIndex);
      return card?.tipo === 'alerta';
    }).length,
    totalNeutro: cards.filter((c) => {
      const card = getCardByNumero(c.cardIndex);
      return card?.tipo === 'neutro';
    }).length,
  };

  // Detect convergences
  const convergencias = detectConvergences(cards);

  // Generate overall message
  const mensagemGeral = generateOverallMessage(typeCounts, convergencias);

  return {
    spreadFormat: format,
    cards,
    destinyCards: destinyCards.length > 0 ? destinyCards : undefined,
    themes: themeAnalysis,
    analysis: {
      ...typeCounts,
      convergencias,
      mensagemGeral,
    },
  };
}

/**
 * Analyze themes based on card positions
 */
function analyzeReadingThemes(cards: SpreadCard[]): MesaRealReading['themes'] {
  const cardIndices = cards.map((c) => c.cardIndex);

  return {
    dinheiro: {
      cards: cardIndices.filter((i) => [34, 15, 14].includes(i)),
      description:
        cardIndices.filter((i) => [34, 15, 14].includes(i)).length > 0
          ? 'Área financeira indicada'
          : 'Sem cartas significativas de dinheiro',
    },
    amor: {
      cards: cardIndices.filter((i) => [24, 25, 29].includes(i)),
      description:
        cardIndices.filter((i) => [24, 25, 29].includes(i)).length > 0
          ? 'Área amorosa/emocional indicada'
          : 'Sem cartas significativas de amor',
    },
    trabalho: {
      cards: cardIndices.filter((i) => [14, 35, 5].includes(i)),
      description:
        cardIndices.filter((i) => [14, 35, 5].includes(i)).length > 0
          ? 'Área profissional/trabalho indicada'
          : 'Sem cartas significativas de trabalho',
    },
    saude: {
      cards: cardIndices.filter((i) => [5, 8].includes(i)),
      description:
        cardIndices.filter((i) => [5, 8].includes(i)).length > 0
          ? 'Atenção à saúde necessária'
          : 'Saúde estável',
    },
  };
}

/**
 * Detect convergence patterns in the reading
 */
function detectConvergences(cards: SpreadCard[]): string[] {
  const convergencias: string[] = [];
  const cardTypes: Record<string, number> = {};

  for (const card of cards) {
    const data = getCardByNumero(card.cardIndex);
    if (data) {
      cardTypes[data.tipo] = (cardTypes[data.tipo] || 0) + 1;
    }
  }

  if (cardTypes['favoravel'] >= 3) {
    convergencias.push(
      `${cardTypes['favoravel']} cartas favoráveis indicam período de grande bênção`
    );
  }
  if (cardTypes['desafio'] >= 3) {
    convergencias.push(
      `${cardTypes['desafio']} cartas de desafio indicam provações importantes`
    );
  }

  for (let i = 0; i < cards.length - 1; i++) {
    const current = getCardByNumero(cards[i].cardIndex);
    const next = getCardByNumero(cards[i + 1].cardIndex);

    if (current?.tipo === next?.tipo && current?.tipo === 'favoravel') {
      convergencias.push(
        `Sequência positiva: ${current.nome} seguido de ${next.nome}`
      );
    }
  }

  return convergencias;
}

/**
 * Generate overall reading message
 */
function generateOverallMessage(
  typeCounts: {
    totalFavoravel: number;
    totalDesafio: number;
    totalAlerta: number;
    totalNeutro: number;
  },
  convergencias: string[]
): string {
  const { totalFavoravel, totalDesafio, totalAlerta } = typeCounts;
  const total = totalFavoravel + totalDesafio + totalAlerta + typeCounts.totalNeutro;

  if (totalFavoravel > totalDesafio && totalFavoravel > totalAlerta) {
    return `Leitura predominantemente favorável (${totalFavoravel}/${total} cartas positivas). Período de expansão e oportunidades.`;
  } else if (totalDesafio > totalFavoravel) {
    return `Leitura com desafios significativos (${totalDesafio}/${total} cartas). Momento de provações que levam ao crescimento.`;
  } else if (totalAlerta > 0) {
    return `Leitura com alertas importantes (${totalAlerta}/${total} cartas). Cautela e discernimento necessários.`;
  } else {
    return `Leitura equilibrada (${totalFavoravel} favoráveis, ${totalDesafio} desafiadoras). Momento de integração e equilíbrio.`;
  }
}

/**
 * Get interpretation for a specific house position
 */
export function getCasaInterpretacao(
  position: number,
  cardIndex: number,
  orientation: 'upright' | 'reversed'
): string {
  const card = getCardByNumero(cardIndex);
  const spread = MESA_REAL_SPREADS['8x4+4'];
  const casaNome = spread.casaLabels[position - 1] || `Casa ${position}`;

  if (!card) {
    return `${casaNome}: Carta não encontrada.`;
  }

  const baseInterpretation =
    orientation === 'upright' ? card.significadoCentral : card.areaVida;

  return `${casaNome} - ${card.nome} (${orientation}): ${baseInterpretation}`;
}
