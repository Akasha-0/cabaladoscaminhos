/**
 * Mesa Real Reading System - Cabala Dos Caminhos
 * 
 * Lenormand Grand Tableau reading based on IDEIA.md pp.124-136
 * Supports 8x4+4 and 9x4 spread formats
 */

import { LENORMAND_CARDS, getCardByNumero, CASAS_TEMATICAS, type LenormandCard } from './data';

// ─── SPREAD CONFIGURATION ────────────────────────────────────────────────────

export interface MesaRealSpread {
  format: '8x4+4' | '9x4';
  totalCards: number;
  rows: number;
  cols: number;
  destinyCards: number;
  casaLabels: string[];
}

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
      'Coroa', 'Destino', 'Firmeza', 'Prova' // Houses 33-36: destiny/future
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
      'Cigana', 'Lírios', 'Sol', 'Lua', 'Chave', 'Peixes', 'Âncora', 'Cruz'
    ],
  },
};

// ─── READING TYPES ─────────────────────────────────────────────────────────

export interface SpreadCard {
  position: number;        // 1-36 (or 1-32 for main spread in 8x4+4)
  house: number;          // House number (1-36)
  cardIndex: number;      // Index into LENORMAND_CARDS (0-35)
  cardName: string;       // Card name
  orientation: 'upright' | 'reversed';
  significado: string;    // Combined meaning for this position
  tipo: LenormandCard['tipo'];
}

export interface DestinyCard {
  position: number;        // 33-36 in 8x4+4
  cardIndex: number;
  cardName: string;
  significado: string;
  tipo: LenormandCard['tipo'];
}

export interface ThemeHouses {
  dinheiro: number[];      // Houses with money/business cards
  amor: number[];          // Houses with love cards
  trabalho: number[];      // Houses with work cards
  saude: number[];         // Houses with health cards
}

export interface MesaRealReading {
  spreadFormat: '8x4+4' | '9x4';
  spreadInfo: {
    rows: number;
    cols: number;
    totalPositions: number;
    hasDestinyCards: boolean;
  };
  cards: SpreadCard[];
  destinyCards?: DestinyCard[];
  themes: ThemeHouses;
  analysis: {
    totalFavoravel: number;
    totalDesafio: number;
    totalNeutro: number;
    totalAlerta: number;
    convergencias: string[];
    mensagemGeral: string;
  };
  timestamp: string;
}

// ─── HELPER FUNCTIONS ───────────────────────────────────────────────────────

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Draw random cards for a spread
 */
export function drawCards(count: number): number[] {
  const indices = Array.from({ length: 36 }, (_, i) => i);
  const shuffled = shuffle(indices);
  return shuffled.slice(0, count);
}

/**
 * Determine card orientation (pseudo-random based on position)
 */
export function getOrientation(position: number, seed?: number): 'upright' | 'reversed' {
  const s = seed ?? Date.now();
  const value = (s + position * 7) % 100;
  return value < 50 ? 'upright' : 'reversed';
}

// ─── READING FUNCTIONS ──────────────────────────────────────────────────────

/**
 * Analyze card in a specific house position
 */
export function analisarCasa(
  houseNumber: number,
  cardIndex: number,
  adjacentHouses: number[]
): string {
  const card = getCardByNumero(cardIndex + 1);
  if (!card) return '';

  const adjacentCards = adjacentHouses
    .map(h => getCardByNumero(h + 1))
    .filter(Boolean);

  // Basic adjacency analysis
  const favorableAdjacent = adjacentCards.filter(c => c?.tipo === 'favoravel').length;
  const challengeAdjacent = adjacentCards.filter(c => c?.tipo === 'desafio').length;

  let analysis = `Na Casa ${houseNumber}, ${card.nome} indica: ${card.significadoCentral}`;

  if (favorableAdjacent > challengeAdjacent) {
    analysis += ' O ambiente ao redor fortalece esta posição.';
  } else if (challengeAdjacent > favorableAdjacent) {
    analysis += ' Cartas desafiadoras ao redor podem dificultar esta área.';
  }

  return analysis;
}

/**
 * Detect Padrinhos (Significator cards) - IDEIA.md technique
 * Padrinhos are cards that "rule" or "represent" specific life areas
 */
export function detectarPadrinhos(
  cards: SpreadCard[],
  format: '8x4+4' | '9x4'
): Array<{ tipo: string; carta: SpreadCard }> {
  const padrinhos: Array<{ tipo: string; carta: SpreadCard }> = [];

  for (const card of cards) {
    // House 28 = Cigano = Male significator
    if (card.house === 28) {
      padrinhos.push({ tipo: 'Consulente Masculino', carta: card });
    }
    // House 29 = Cigana = Female significator
    if (card.house === 29) {
      padrinhos.push({ tipo: 'Consulente Feminino', carta: card });
    }
  }

  return padrinhos;
}

/**
 * Carta Espelho technique - when a card falls in its own house
 * This creates intensified meaning
 */
export function tecnicaCartaEspelho(
  houseNumber: number,
  cardIndex: number
): string | null {
  // Card is in its "own" house when card index + 1 equals house number
  if (cardIndex + 1 === houseNumber) {
    const card = getCardByNumero(houseNumber);
    if (card) {
      return `CARTA ESPELHO: ${card.nome} em sua própria casa! ` +
        `Significado intensificado - esta carta governa absolutamente esta área de vida. ` +
        `${card.comoInterpretar}`;
    }
  }
  return null;
}

/**
 * Analyze theme houses for specific life areas
 */
export function analisarTema(
  cards: SpreadCard[],
  themeHouses: readonly number[],
  themeName: string
): { house: number; card: SpreadCard }[] {
  return themeHouses
    .map(house => {
      const cardInHouse = cards.find(c => c.house === house);
      return cardInHouse ? { house, card: cardInHouse } : null;
    })
    .filter((item): item is { house: number; card: SpreadCard } => item !== null);
}

/**
 * Generate convergence interpretations based on card clusters
 */
export function gerarConvergencias(cards: SpreadCard[]): string[] {
  const convergencias: string[] = [];

  // Group cards by type
  const byType = {
    favoravel: cards.filter(c => c.tipo === 'favoravel'),
    desafio: cards.filter(c => c.tipo === 'desafio'),
    neutro: cards.filter(c => c.tipo === 'neutro'),
    alerta: cards.filter(c => c.tipo === 'alerta'),
  };

  // Favorable convergence
  if (byType.favoravel.length >= 3) {
    convergencias.push(
      `${byType.favoravel.length} cartas favoráveis em jogo indicam um período de luz e bênçãos. ` +
      `O consulente pode esperar apoio do destino e boas oportunidades.`
    );
  }

  // Challenge convergence
  if (byType.desafio.length >= 3) {
    convergencias.push(
      `${byType.desafio.length} cartas desafiadoras em sequência pedem cautela. ` +
      `Períodos difíceis podem estar se acumulando - prepare-se para provas.`
    );
  }

  // Alert convergence (Cobra/Raposa)
  const alertCards = byType.alerta;
  if (alertCards.length > 0) {
    const alertNames = alertCards.map(c => c.cardName).join(', ');
    convergencias.push(
      `ALERTA: ${alertNames} em jogo. Fique atento a pessoas que não são o que parecem ` +
      `ou a situações que pedem estratégia e cautela.`
    );
  }

  // Check for card mirror patterns
  const mirrors = cards.map(c => tecnicaCartaEspelho(c.house, c.cardIndex)).filter(Boolean);
  if (mirrors.length > 0) {
    convergencias.push(`PADRÃO DE ESPELHO DETECTADO: ${mirrors.length} carta(s) em sua própria casa.`);
  }

  return convergencias;
}

/**
 * Generate overall message based on spread analysis
 */
export function gerarMensagemGeral(
  cards: SpreadCard[],
  format: '8x4+4' | '9x4'
): string {
  const favorableCount = cards.filter(c => c.tipo === 'favoravel').length;
  const challengeCount = cards.filter(c => c.tipo === 'desafio').length;
  const alertCount = cards.filter(c => c.tipo === 'alerta').length;
  const total = cards.length;

  const favorableRatio = favorableCount / total;
  const challengeRatio = challengeCount / total;

  if (favorableRatio > 0.5) {
    return 'Jogo总体mente favorável. O destino sorri para o consulente neste ciclo. ' +
      'Aproxite-se das oportunidades com confiança e gratidão.';
  } else if (challengeRatio > 0.4) {
    return 'Jogo com desafios significativos. Períodos de prova estão ativos. ' +
      'Use a sabedoria das cartas mais fortes e mantenha a perseverança.';
  } else if (alertCount > 0) {
    return 'Jogo requer atenção especial. Alertas activos pedem cautela nas relações ' +
      'e decisões. Observe antes de agir.';
  } else {
    return 'Jogo equilibrado mostra um momento de transição. As cartas indicam que ' +
      'mudanças estão em curso - abrace o fluxo com consciência.';
  }
}

// ─── MAIN READING FUNCTION ──────────────────────────────────────────────────

export interface RealizarLeituraOptions {
  format?: '8x4+4' | '9x4';
  cardIndices?: number[];       // Specific cards, or undefined to draw randomly
  orientations?: ('upright' | 'reversed')[];
  seed?: number;
}

/**
 * Perform a complete Mesa Real reading
 */
export function realizarLeitura(options: RealizarLeituraOptions = {}): MesaRealReading {
  const {
    format = '8x4+4',
    cardIndices,
    orientations,
    seed = Date.now(),
  } = options;

  const spread = MESA_REAL_SPREADS[format];
  if (!spread) {
    throw new Error(`Invalid spread format: ${format}`);
  }

  // Determine card count based on format
  const mainCardCount = format === '8x4+4' ? 32 : 36;
  const destinyCardCount = format === '8x4+4' ? 4 : 0;

  // Draw or use provided cards
  const drawnCards = cardIndices
    ? cardIndices.slice(0, mainCardCount)
    : drawCards(mainCardCount);

  // Generate orientations
  const cardOrientations = orientations
    ? orientations.slice(0, mainCardCount)
    : Array.from({ length: mainCardCount }, (_, i) => getOrientation(i, seed + i));

  // Build main spread cards
  const spreadCards: SpreadCard[] = drawnCards.map((cardIndex, i) => {
    const house = i + 1; // Houses are 1-indexed
    const card = getCardByNumero(cardIndex + 1);
    const orientation = cardOrientations[i];

    if (!card) {
      throw new Error(`Invalid card index: ${cardIndex}`);
    }

    return {
      position: i + 1,
      house,
      cardIndex,
      cardName: card.nome,
      orientation,
      significado: card.significadoCentral,
      tipo: card.tipo,
    };
  });

  // Build destiny cards for 8x4+4 format
  let destinyCards: DestinyCard[] | undefined;
  if (format === '8x4+4') {
    const destinyIndices = cardIndices
      ? cardIndices.slice(32, 36)
      : drawCards(destinyCardCount);

    const destinyOrientations = orientations
      ? orientations.slice(32, 36)
      : Array.from({ length: destinyCardCount }, (_, i) => getOrientation(i + 32, seed + i + 32));

    destinyCards = destinyIndices.map((cardIndex, i) => {
      const house = 33 + i; // Houses 33-36
      const card = getCardByNumero(cardIndex + 1);

      if (!card) {
        throw new Error(`Invalid destiny card index: ${cardIndex}`);
      }

      return {
        position: house,
        cardIndex,
        cardName: card.nome,
        significado: `Destino: ${card.significadoCentral}`,
        tipo: card.tipo,
      };
    });
  }

  // Analyze themes
  const themeHouses = {
    dinheiro: analisarTema(spreadCards, CASAS_TEMATICAS.DINHEIRO, 'Dinheiro'),
    amor: analisarTema(spreadCards, CASAS_TEMATICAS.AMOR, 'Amor'),
    trabalho: analisarTema(spreadCards, CASAS_TEMATICAS.TRABALHO, 'Trabalho'),
    saude: analisarTema(spreadCards, CASAS_TEMATICAS.SAUDE, 'Saúde'),
  };

  // Build theme arrays with house numbers
  const themes: ThemeHouses = {
    dinheiro: CASAS_TEMATICAS.DINHEIRO,
    amor: CASAS_TEMATICAS.AMOR,
    trabalho: CASAS_TEMATICAS.TRABALHO,
    saude: CASAS_TEMATICAS.SAUDE,
  };

  // Count card types
  const allCards = [...spreadCards, ...(destinyCards ?? [])];
  const analysis = {
    totalFavoravel: allCards.filter(c => c.tipo === 'favoravel').length,
    totalDesafio: allCards.filter(c => c.tipo === 'desafio').length,
    totalNeutro: allCards.filter(c => c.tipo === 'neutro').length,
    totalAlerta: allCards.filter(c => c.tipo === 'alerta').length,
    convergencias: gerarConvergencias(allCards),
    mensagemGeral: gerarMensagemGeral(allCards, format),
  };

  return {
    spreadFormat: format,
    spreadInfo: {
      rows: spread.rows,
      cols: spread.cols,
      totalPositions: spread.totalCards,
      hasDestinyCards: format === '8x4+4',
    },
    cards: spreadCards,
    destinyCards,
    themes,
    analysis,
    timestamp: new Date().toISOString(),
  };
}

// ─── UTILITY EXPORTS ────────────────────────────────────────────────────────

export { getCardByNumero, LENORMAND_CARDS, CASAS_TEMATICAS };
