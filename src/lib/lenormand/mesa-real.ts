/**
 * Mesa Real Reading System - Cabala Dos Caminhos
 * Based on IDEIA.md pp.124-136
 */
import { LENORMAND_CARDS, getCardByNumero, CASAS_TEMATICAS, type LenormandCard } from './data';

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
    totalCards: 36,
    rows: 4,
    cols: 8,
    destinyCards: 4,
    casaLabels: ['Cavaleiro', 'Trevo', 'Navio', 'Casa', 'Árvore', 'Nuvens', 'Cobra', 'Caixão', 'Flores', 'Foice', 'Chicote', 'Pássaros', 'Criança', 'Raposa', 'Urso', 'Estrela', 'Cegonha', 'Cachorro', 'Torre', 'Jardim', 'Montanha', 'Caminhos', 'Rato', 'Coração', 'Anel', 'Livro', 'Carta', 'Cigano', 'Cigana', 'Lírios', 'Sol', 'Lua', 'Coroa', 'Destino', 'Firmeza', 'Prova'],
  },
  '9x4': {
    format: '9x4',
    totalCards: 36,
    rows: 4,
    cols: 9,
    destinyCards: 0,
    casaLabels: ['Cavaleiro', 'Trevo', 'Navio', 'Casa', 'Árvore', 'Nuvens', 'Cobra', 'Caixão', 'Flores', 'Foice', 'Chicote', 'Pássaros', 'Criança', 'Raposa', 'Urso', 'Estrela', 'Cegonha', 'Cachorro', 'Torre', 'Jardim', 'Montanha', 'Caminhos', 'Rato', 'Coração', 'Anel', 'Livro', 'Carta', 'Cigano', 'Cigana', 'Lírios', 'Sol', 'Lua', 'Chave', 'Peixes', 'Âncora', 'Cruz'],
  },
};

export interface SpreadCard {
  position: number;
  house: number;
  cardIndex: number;
  cardName: string;
  orientation: 'upright' | 'reversed';
  significado: string;
  tipo: LenormandCard['tipo'];
}

export interface DestinyCard {
  position: number;
  cardIndex: number;
  cardName: string;
  significado: string;
  tipo: LenormandCard['tipo'];
}

export interface ThemeHouses {
  dinheiro: readonly number[];
  amor: readonly number[];
  trabalho: readonly number[];
  saude: readonly number[];
}

export interface MesaRealReading {
  spreadFormat: '8x4+4' | '9x4';
  spreadInfo: { rows: number; cols: number; totalPositions: number; hasDestinyCards: boolean };
  cards: SpreadCard[];
  destinyCards?: DestinyCard[];
  themes: ThemeHouses;
  analysis: { totalFavoravel: number; totalDesafio: number; totalNeutro: number; totalAlerta: number; convergencias: string[]; mensagemGeral: string };
  timestamp: string;
}

export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function drawCards(count: number): number[] {
  const indices = Array.from({ length: 36 }, (_, i) => i);
  const shuffled = shuffle(indices);
  return shuffled.slice(0, count);
}

export function getOrientation(position: number, seed?: number): 'upright' | 'reversed' {
  const s = seed ?? Date.now();
  const value = (s + position * 7) % 100;
  return value < 50 ? 'upright' : 'reversed';
}

export function detectarPadrinhos(cards: SpreadCard[], format: '8x4+4' | '9x4'): Array<{ tipo: string; carta: SpreadCard }> {
  const padrinhos: Array<{ tipo: string; carta: SpreadCard }> = [];
  for (const card of cards) {
    if (card.house === 28) padrinhos.push({ tipo: 'Consulente Masculino', carta: card });
    if (card.house === 29) padrinhos.push({ tipo: 'Consulente Feminino', carta: card });
  }
  return padrinhos;
}

export function tecnicaCartaEspelho(houseNumber: number, cardIndex: number): string | null {
  if (cardIndex + 1 === houseNumber) {
    const card = getCardByNumero(houseNumber);
    if (card) return `CARTA ESPELHO: ${card.nome} em sua própria casa! Significado intensificado. ${card.comoInterpretar}`;
  }
  return null;
}

type AnalysisCard = SpreadCard & { house?: number };

export function gerarConvergencias(cards: AnalysisCard[]): string[] {
  const convergencias: string[] = [];
  const byType = {
    favoravel: cards.filter(c => c.tipo === 'favoravel'),
    desafio: cards.filter(c => c.tipo === 'desafio'),
    neutro: cards.filter(c => c.tipo === 'neutro'),
    alerta: cards.filter(c => c.tipo === 'alerta'),
  };
  if (byType.favoravel.length >= 3) convergencias.push(`${byType.favoravel.length} cartas favoráveis em jogo indicam um período de luz e bênçãos.`);
  if (byType.desafio.length >= 3) convergencias.push(`${byType.desafio.length} cartas desafiadoras em sequência pedem cautela.`);
  if (byType.alerta.length > 0) {
    const alertNames = byType.alerta.map(c => c.cardName).join(', ');
    convergencias.push(`ALERTA: ${alertNames} em jogo.`);
  }
  const mirrors = cards.filter((c): c is SpreadCard => c.house !== undefined).map(c => tecnicaCartaEspelho(c.house, c.cardIndex)).filter(Boolean);
  if (mirrors.length > 0) convergencias.push(`PADRÃO DE ESPELHO DETECTADO: ${mirrors.length} carta(s) em sua própria casa.`);
  return convergencias;
}

export function realizarLeitura(options: { format?: '8x4+4' | '9x4'; cardIndices?: number[]; orientations?: ('upright' | 'reversed')[]; seed?: number; } = {}): MesaRealReading {
  const { format = '8x4+4', cardIndices, orientations, seed = Date.now() } = options;
  const spread = MESA_REAL_SPREADS[format];
  if (!spread) throw new Error(`Invalid spread format: ${format}`);
  const mainCardCount = format === '8x4+4' ? 32 : 36;
  const destinyCardCount = format === '8x4+4' ? 4 : 0;
  const drawnCards = cardIndices ? cardIndices.slice(0, mainCardCount) : drawCards(mainCardCount);
  const cardOrientations = orientations ? orientations.slice(0, mainCardCount) : Array.from({ length: mainCardCount }, (_, i) => getOrientation(i, seed + i));
  const spreadCards: SpreadCard[] = drawnCards.map((cardIndex, i) => {
    const house = i + 1;
    const card = getCardByNumero(cardIndex + 1);
    const orientation = cardOrientations[i];
    if (!card) throw new Error(`Invalid card index: ${cardIndex}`);
    return { position: i + 1, house, cardIndex, cardName: card.nome, orientation, significado: card.significadoCentral, tipo: card.tipo };
  });
  let destinyCards: DestinyCard[] | undefined;
  if (format === '8x4+4') {
    const destinyIndices = cardIndices ? cardIndices.slice(32, 36) : drawCards(destinyCardCount);
    destinyCards = destinyIndices.map((cardIndex, i) => {
      const house = 33 + i;
      const card = getCardByNumero(cardIndex + 1);
      if (!card) throw new Error(`Invalid destiny card index: ${cardIndex}`);
      return { position: house, cardIndex, cardName: card.nome, significado: `Destino: ${card.significadoCentral}`, tipo: card.tipo };
    });
  }
  const themes: ThemeHouses = { dinheiro: CASAS_TEMATICAS.DINHEIRO, amor: CASAS_TEMATICAS.AMOR, trabalho: CASAS_TEMATICAS.TRABALHO, saude: CASAS_TEMATICAS.SAUDE };
  const allCards: AnalysisCard[] = [...spreadCards, ...(destinyCards ?? [])];
  const analysis = {
    totalFavoravel: allCards.filter(c => c.tipo === 'favoravel').length,
    totalDesafio: allCards.filter(c => c.tipo === 'desafio').length,
    totalNeutro: allCards.filter(c => c.tipo === 'neutro').length,
    totalAlerta: allCards.filter(c => c.tipo === 'alerta').length,
    convergencias: gerarConvergencias(allCards),
    mensagemGeral: (() => {
      const favorableCount = allCards.filter(c => c.tipo === 'favoravel').length;
      const challengeCount = allCards.filter(c => c.tipo === 'desafio').length;
      const alertCount = allCards.filter(c => c.tipo === 'alerta').length;
      const total = allCards.length;
      if (total === 0) return 'Jogo sem cartas.';
      const favorableRatio = favorableCount / total;
      const challengeRatio = challengeCount / total;
      if (favorableRatio > 0.5) return 'Jogo geralmente favorável. O destino sorri para o consulente neste ciclo.';
      if (challengeRatio > 0.4) return 'Jogo com desafios significativos. Períodos de prova estão ativos.';
      if (alertCount > 0) return 'Jogo requer atenção especial. Alertas ativos pedem cautela nas relações e decisões.';
      return 'Jogo equilibrado mostra um momento de transição. As cartas indicam que mudanças estão em curso.';
    })(),
  };
  return {
    spreadFormat: format,
    spreadInfo: { rows: spread.rows, cols: spread.cols, totalPositions: spread.totalCards, hasDestinyCards: format === '8x4+4' },
    cards: spreadCards,
    destinyCards,
    themes,
    analysis,
    timestamp: new Date().toISOString(),
  };
}
