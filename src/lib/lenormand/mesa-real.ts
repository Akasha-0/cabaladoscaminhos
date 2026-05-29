/**
 * Mesa Real Reading System
 */

import { getCardByNumero } from './data';

export const MESA_REAL_SPREADS = {
  '8x4+4': {
    format: '8x4+4' as const,
    totalCards: 36,
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
    format: '9x4' as const,
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

export interface SpreadCard {
  position: number;
  cardIndex: number;
  cardName: string;
  orientation: 'upright' | 'reversed';
}

export interface MesaRealReading {
  spreadFormat: string;
  cards: SpreadCard[];
  themes: {
    dinheiro: { cards: number[] };
    amor: { cards: number[] };
    trabalho: { cards: number[] };
    saude: { cards: number[] };
  };
  analysis: {
    totalFavoravel: number;
    totalDesafio: number;
    mensagemGeral: string;
  };
}

export function realizarLeitura(options: { format?: '8x4+4' | '9x4'; cardIndices?: number[]; seed?: number } = {}): MesaRealReading {
  const { format = '8x4+4', cardIndices, seed } = options;
  const spread = MESA_REAL_SPREADS[format];
  const totalPositions = format === '8x4+4' ? 32 : 36;

  let cardsToUse: number[];
  if (cardIndices) {
    cardsToUse = cardIndices;
  } else if (seed !== undefined) {
    const rng = (s: number) => { let x = Math.sin(s) * 10000; return x - Math.floor(x); };
    cardsToUse = Array.from({ length: 36 }, (_, i) => i + 1).sort(() => rng(seed + i) - 0.5);
  } else {
    cardsToUse = Array.from({ length: 36 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
  }

  const cards: SpreadCard[] = cardsToUse.slice(0, totalPositions).map((cardIndex, i) => ({
    position: i + 1,
    cardIndex,
    cardName: getCardByNumero(cardIndex)?.nome || 'Desconhecido',
    orientation: i % 3 === 0 ? 'reversed' as const : 'upright' as const,
  }));

  const cardIndicesNums = cards.map(c => c.cardIndex);

  return {
    spreadFormat: format,
    cards,
    themes: {
      dinheiro: { cards: cardIndicesNums.filter(i => [34, 15, 14].includes(i)) },
      amor: { cards: cardIndicesNums.filter(i => [24, 25, 29].includes(i)) },
      trabalho: { cards: cardIndicesNums.filter(i => [14, 35, 5].includes(i)) },
      saude: { cards: cardIndicesNums.filter(i => [5, 8].includes(i)) },
    },
    analysis: {
      totalFavoravel: cards.filter(c => getCardByNumero(c.cardIndex)?.tipo === 'favoravel').length,
      totalDesafio: cards.filter(c => getCardByNumero(c.cardIndex)?.tipo === 'desafio').length,
      mensagemGeral: 'Leitura completada.',
    },
  };
}
