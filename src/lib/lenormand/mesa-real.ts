/**
 * Mesa Real Reading System - Cabala Dos Caminhos
 */
import { LENORMAND_CARDS, getCardByNumero, CASAS_TEMATICAS, type LenormandCard } from './data';

export interface MesaRealSpread { format: '8x4+4' | '9x4'; totalCards: number; rows: number; cols: number; destinyCards: number; casaLabels: string[]; }
export const MESA_REAL_SPREADS: Record<string, MesaRealSpread> = {
  '8x4+4': { format: '8x4+4', totalCards: 36, rows: 4, cols: 8, destinyCards: 4, casaLabels: ['Cavaleiro', 'Trevo', 'Navio', 'Casa', 'Árvore', 'Nuvens', 'Cobra', 'Caixão', 'Flores', 'Foice', 'Chicote', 'Pássaros', 'Criança', 'Raposa', 'Urso', 'Estrela', 'Cegonha', 'Cachorro', 'Torre', 'Jardim', 'Montanha', 'Caminhos', 'Rato', 'Coração', 'Anel', 'Livro', 'Carta', 'Cigano', 'Cigana', 'Lírios', 'Sol', 'Lua', 'Coroa', 'Destino', 'Firmeza', 'Prova'] },
  '9x4': { format: '9x4', totalCards: 36, rows: 4, cols: 9, destinyCards: 0, casaLabels: ['Cavaleiro', 'Trevo', 'Navio', 'Casa', 'Árvore', 'Nuvens', 'Cobra', 'Caixão', 'Flores', 'Foice', 'Chicote', 'Pássaros', 'Criança', 'Raposa', 'Urso', 'Estrela', 'Cegonha', 'Cachorro', 'Torre', 'Jardim', 'Montanha', 'Caminhos', 'Rato', 'Coração', 'Anel', 'Livro', 'Carta', 'Cigano', 'Cigana', 'Lírios', 'Sol', 'Lua', 'Chave', 'Peixes', 'Âncora', 'Cruz'] },
};
export interface SpreadCard { position: number; house: number; cardIndex: number; cardName: string; orientation: 'upright' | 'reversed'; significado: string; tipo: LenormandCard['tipo']; }
export interface DestinyCard { position: number; cardIndex: number; cardName: string; significado: string; tipo: LenormandCard['tipo']; }
export interface ThemeHouses { dinheiro: readonly number[]; amor: readonly number[]; trabalho: readonly number[]; saude: readonly number[]; }
export interface MesaRealReading { spreadFormat: '8x4+4' | '9x4'; spreadInfo: { rows: number; cols: number; totalPositions: number; hasDestinyCards: boolean }; cards: SpreadCard[]; destinyCards?: DestinyCard[]; themes: ThemeHouses; analysis: { totalFavoravel: number; totalDesafio: number; totalNeutro: number; totalAlerta: number; convergencias: string[]; mensagemGeral: string; }; timestamp: string; }

function createSeededRandom(seed: number) { return function() { let t = seed += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function shuffle<T>(array: T[]): T[] { const result = [...array]; for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; } return result; }
function seededShuffle<T>(array: T[], seed: number): T[] { const result = [...array]; const random = createSeededRandom(seed); for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; } return result; }
export function drawCards(count: number, seed?: number): number[] { const indices = Array.from({ length: 36 }, (_, i) => i); const shuffled = seed !== undefined ? seededShuffle(indices, seed) : shuffle(indices); return shuffled.slice(0, count); }
export function getOrientation(position: number, seed?: number): 'upright' | 'reversed' { const s = seed ?? Date.now(); return ((s + position * 7) % 100) < 50 ? 'upright' : 'reversed'; }
export function detectarPadrinhos(cards: SpreadCard[], format: '8x4+4' | '9x4'): Array<{ tipo: string; carta: SpreadCard }> { const p: Array<{ tipo: string; carta: SpreadCard }> = []; for (const card of cards) { if (card.house === 28) p.push({ tipo: 'Consulente Masculino', carta: card }); if (card.house === 29) p.push({ tipo: 'Consulente Feminino', carta: card }); } return p; }
export function tecnicaCartaEspelho(houseNumber: number, cardIndex: number): string | null { if (cardIndex + 1 === houseNumber) { const card = getCardByNumero(houseNumber); return card ? `CARTA ESPELHO: ${card.nome}! ${card.comoInterpretar}` : null; } return null; }
type AnalysisCard = { house?: number; cardIndex: number; cardName: string; tipo: LenormandCard['tipo']; };
export function gerarConvergencias(cards: AnalysisCard[]): string[] { const c: string[] = []; const f = cards.filter(x => x.tipo === 'favoravel'); const d = cards.filter(x => x.tipo === 'desafio'); const a = cards.filter(x => x.tipo === 'alerta'); if (f.length >= 3) c.push(`${f.length} cartas favoráveis.`); if (d.length >= 3) c.push(`${d.length} cartas desafiadoras.`); if (a.length > 0) c.push(`ALERTA: ${a.map(x => x.cardName).join(', ')}.`); return c; }

export function realizarLeitura(options: { format?: '8x4+4' | '9x4'; cardIndices?: number[]; orientations?: ('upright' | 'reversed')[]; seed?: number; } = {}): MesaRealReading {
  const { format = '8x4+4', cardIndices, orientations, seed = Date.now() } = options;
  const spread = MESA_REAL_SPREADS[format]; if (!spread) throw new Error(`Invalid`);
  const mainCardCount = format === '8x4+4' ? 32 : 36;
  const drawnCards = cardIndices ? cardIndices.slice(0, mainCardCount) : drawCards(mainCardCount, seed);
  const cardOrientations = orientations ? orientations.slice(0, mainCardCount) : Array.from({ length: mainCardCount }, (_, i) => getOrientation(i, seed + i));
  const spreadCards: SpreadCard[] = drawnCards.map((cardIndex, i) => { const house = i + 1; const card = getCardByNumero(cardIndex + 1); if (!card) throw new Error(`Invalid`); return { position: i + 1, house, cardIndex, cardName: card.nome, orientation: cardOrientations[i], significado: card.significadoCentral, tipo: card.tipo }; });
  let destinyCards: DestinyCard[] | undefined;
  if (format === '8x4+4') { const destinyIndices = cardIndices ? cardIndices.slice(32, 36) : drawCards(4, seed + 1000); destinyCards = destinyIndices.map((cardIndex, i) => { const card = getCardByNumero(cardIndex + 1); if (!card) throw new Error(`Invalid`); return { position: 33 + i, cardIndex, cardName: card.nome, significado: `Destino: ${card.significadoCentral}`, tipo: card.tipo }; }); }
  const themes: ThemeHouses = { dinheiro: CASAS_TEMATICAS.DINHEIRO, amor: CASAS_TEMATICAS.AMOR, trabalho: CASAS_TEMATICAS.TRABALHO, saude: CASAS_TEMATICAS.SAUDE };
  const allCards: AnalysisCard[] = [...spreadCards, ...(destinyCards ?? [])];
  const favorableCount = allCards.filter(c => c.tipo === 'favoravel').length; const challengeCount = allCards.filter(c => c.tipo === 'desafio').length; const alertCount = allCards.filter(c => c.tipo === 'alerta').length;
  let msg = 'Jogo equilibrado.'; if (allCards.length > 0) { const fr = favorableCount / allCards.length; const cr = challengeCount / allCards.length; if (fr > 0.5) msg = 'Jogo geralmente favorável.'; else if (cr > 0.4) msg = 'Jogo com desafios.'; else if (alertCount > 0) msg = 'Jogo requer atenção.'; }
  return { spreadFormat: format, spreadInfo: { rows: spread.rows, cols: spread.cols, totalPositions: spread.totalCards, hasDestinyCards: format === '8x4+4' }, cards: spreadCards, destinyCards, themes, analysis: { totalFavoravel: favorableCount, totalDesafio: challengeCount, totalNeutro: allCards.filter(c => c.tipo === 'neutro').length, totalAlerta: alertCount, convergencias: gerarConvergencias(allCards), mensagemGeral: msg }, timestamp: new Date().toISOString() };
}
