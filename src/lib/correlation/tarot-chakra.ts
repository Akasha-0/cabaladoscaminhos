/**
 * Tarot-Chakra Spiritual Correlation Mapping
 * Maps Tarot Major Arcana cards to the 7 main chakras
 * Based on IDEIA.md "Tabela de Correspondência Macro: Oito Portais da Consciência"
 */

import type { ChakraName } from './chakra-element';

export interface TarotChakraMapping {
  arcano: string;
  numero_carta: number;
  chakra: ChakraName;
  numero_chakra: number;
  nome_chakra_portugues: string;
  elemento: 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';
  energia_espiritual: string;
  orixa: string;
  keywords: string[];
}

export const TAROT_CHAKRA_MAPPINGS: Record<string, TarotChakraMapping> = {
  'O Louco': { arcano: 'O Louco', numero_carta: 0, chakra: 'Ajna', numero_chakra: 6, nome_chakra_portugues: '6º Terceiro Olho', elemento: 'Ar', energia_espiritual: 'Início da jornada / Libertação', orixa: 'Oxóssi', keywords: ['liberdade', 'início', 'intuição'] },
  'O Mago': { arcano: 'O Mago', numero_carta: 1, chakra: 'Vishuddha', numero_chakra: 5, nome_chakra_portugues: '5º Laríngeo', elemento: 'Éter', energia_espiritual: 'Manifestação da vontade', orixa: 'Ogum', keywords: ['vontade', 'comunicação', 'ação'] },
  'A Sacerdotisa': { arcano: 'A Sacerdotisa', numero_carta: 2, chakra: 'Ajna', numero_chakra: 6, nome_chakra_portugues: '6º Terceiro Olho', elemento: 'Ar', energia_espiritual: 'Sabedoria oculta', orixa: 'Nanã', keywords: ['intuição', 'mistério', 'sabedoria'] },
  'A Imperatriz': { arcano: 'A Imperatriz', numero_carta: 3, chakra: 'Anahata', numero_chakra: 4, nome_chakra_portugues: '4º Cardíaco', elemento: 'Ar', energia_espiritual: 'Fertilidade criativa', orixa: 'Oxum', keywords: ['amor', 'fertilidade', 'criação'] },
  'O Imperador': { arcano: 'O Imperador', numero_carta: 4, chakra: 'Manipura', numero_chakra: 3, nome_chakra_portugues: '3º Plexo Solar', elemento: 'Fogo', energia_espiritual: 'Autoridade', orixa: 'Xangô', keywords: ['autoridade', 'liderança', 'justiça'] },
  'O Hierofante': { arcano: 'O Hierofante', numero_carta: 5, chakra: 'Vishuddha', numero_chakra: 5, nome_chakra_portugues: '5º Laríngeo', elemento: 'Ar', energia_espiritual: 'Tradição espiritual', orixa: 'Oxalá', keywords: ['tradição', 'ensino', 'ritual'] },
  'Os Enamorados': { arcano: 'Os Enamorados', numero_carta: 6, chakra: 'Anahata', numero_chakra: 4, nome_chakra_portugues: '4º Cardíaco', elemento: 'Ar', energia_espiritual: 'União', orixa: 'Oxum', keywords: ['amor', 'união', 'harmonia'] },
  'O Carro': { arcano: 'O Carro', numero_carta: 7, chakra: 'Manipura', numero_chakra: 3, nome_chakra_portugues: '3º Plexo Solar', elemento: 'Fogo', energia_espiritual: 'Vitória', orixa: 'Ogum', keywords: ['vitória', 'determinação', 'conquista'] },
  'A Justiça': { arcano: 'A Justiça', numero_carta: 8, chakra: 'Svadhisthana', numero_chakra: 2, nome_chakra_portugues: '2º Sacro', elemento: 'Água', energia_espiritual: 'Equilíbrio kármico', orixa: 'Xangô', keywords: ['justiça', 'equilíbrio', 'verdade'] },
  'O Eremita': { arcano: 'O Eremita', numero_carta: 9, chakra: 'Ajna', numero_chakra: 6, nome_chakra_portugues: '6º Terceiro Olho', elemento: 'Terra', energia_espiritual: 'Iluminação interior', orixa: 'Oxalá', keywords: ['iluminação', 'busca interior', 'sabedoria'] },
  'A Roda da Fortuna': { arcano: 'A Roda da Fortuna', numero_carta: 10, chakra: 'Manipura', numero_chakra: 3, nome_chakra_portugues: '3º Plexo Solar', elemento: 'Fogo', energia_espiritual: 'Ciclos do destino', orixa: 'Oxóssi', keywords: ['destino', 'ciclos', 'mudança'] },
  'A Força': { arcano: 'A Força', numero_carta: 11, chakra: 'Anahata', numero_chakra: 4, nome_chakra_portugues: '4º Cardíaco', elemento: 'Ar', energia_espiritual: 'Coragem interior', orixa: 'Iemanjá', keywords: ['coragem', 'compaixão', 'equilíbrio'] },
  'O Enforcado': { arcano: 'O Enforcado', numero_carta: 12, chakra: 'Sahasrara', numero_chakra: 7, nome_chakra_portugues: '7º Coronário', elemento: 'Éter', energia_espiritual: 'Sacrifício', orixa: 'Nanã', keywords: ['sacrifício', 'nova visão', 'entrega'] },
  'A Morte': { arcano: 'A Morte', numero_carta: 13, chakra: 'Svadhisthana', numero_chakra: 2, nome_chakra_portugues: '2º Sacro', elemento: 'Água', energia_espiritual: 'Transformação', orixa: 'Iansã', keywords: ['transformação', 'renovação', 'mudança'] },
  'A Temperança': { arcano: 'A Temperança', numero_carta: 14, chakra: 'Svadhisthana', numero_chakra: 2, nome_chakra_portugues: '2º Sacro', elemento: 'Água', energia_espiritual: 'Equilíbrio emocional', orixa: 'Oxum', keywords: ['equilíbrio', 'paciência', 'harmonia'] },
  'O Diabo': { arcano: 'O Diabo', numero_carta: 15, chakra: 'Muladhara', numero_chakra: 1, nome_chakra_portugues: '1º Básico', elemento: 'Terra', energia_espiritual: 'Ilusão material', orixa: 'Omolu', keywords: ['ilusão', 'apego', 'provação'] },
  'A Torre': { arcano: 'A Torre', numero_carta: 16, chakra: 'Manipura', numero_chakra: 3, nome_chakra_portugues: '3º Plexo Solar', elemento: 'Fogo', energia_espiritual: 'Destruição criativa', orixa: 'Xangô', keywords: ['revelação', 'destruição', 'libertação'] },
  'A Estrela': { arcano: 'A Estrela', numero_carta: 17, chakra: 'Anahata', numero_chakra: 4, nome_chakra_portugues: '4º Cardíaco', elemento: 'Ar', energia_espiritual: 'Esperança', orixa: 'Oxum', keywords: ['esperança', 'renovação', 'paz'] },
  'A Lua': { arcano: 'A Lua', numero_carta: 18, chakra: 'Svadhisthana', numero_chakra: 2, nome_chakra_portugues: '2º Sacro', elemento: 'Água', energia_espiritual: 'Inconsciente', orixa: 'Iemanjá', keywords: ['inconsciente', 'sonhos', 'intuição'] },
  'O Sol': { arcano: 'O Sol', numero_carta: 19, chakra: 'Manipura', numero_chakra: 3, nome_chakra_portugues: '3º Plexo Solar', elemento: 'Fogo', energia_espiritual: 'Iluminação', orixa: 'Xangô', keywords: ['iluminação', 'alegria', 'vitalidade'] },
  'O Julgamento': { arcano: 'O Julgamento', numero_carta: 20, chakra: 'Sahasrara', numero_chakra: 7, nome_chakra_portugues: '7º Coronário', elemento: 'Fogo', energia_espiritual: 'Renascimento', orixa: 'Iansã', keywords: ['renascimento', 'avaliação', 'ascensão'] },
  'O Mundo': { arcano: 'O Mundo', numero_carta: 21, chakra: 'Muladhara', numero_chakra: 1, nome_chakra_portugues: '1º Básico', elemento: 'Terra', energia_espiritual: 'Realização', orixa: 'Oxalá', keywords: ['realização', 'completude', 'fulgor'] },
} as const;

Object.freeze(TAROT_CHAKRA_MAPPINGS);
Object.values(TAROT_CHAKRA_MAPPINGS).forEach(m => Object.freeze(m));

export function getTarotChakra(arcano: string): TarotChakraMapping | null {
  const normalized = arcano.trim();
  return TAROT_CHAKRA_MAPPINGS[normalized] ?? null;
}

export function getChakraTarot(chakra: string): string | null {
  const n = chakra.trim().toLowerCase();
  const directMap: Record<string, string> = { muladhara: 'Muladhara', svadhisthana: 'Svadhisthana', manipura: 'Manipura', anahata: 'Anahata', vishuddha: 'Vishuddha', ajna: 'Ajna', sahasrara: 'Sahasrara' };
  const normalized = directMap[n] || n;
  for (const m of Object.values(TAROT_CHAKRA_MAPPINGS)) {
    if (m.chakra === normalized || m.nome_chakra_portugues === normalized) return m.arcano;
  }
  return null;
}

export function getAllTarotChakras(): TarotChakraMapping[] {
  return Object.values(TAROT_CHAKRA_MAPPINGS).sort((a, b) => a.numero_carta - b.numero_carta);
}

export function getAllArcanos(): string[] { return Object.keys(TAROT_CHAKRA_MAPPINGS); }

export function hasTarotChakra(arcano: string): boolean {
  return arcano.trim() in TAROT_CHAKRA_MAPPINGS;
}

export function getChakraByNumber(num: number): string | null {
  const m = Object.values(TAROT_CHAKRA_MAPPINGS).find(m => m.numero_carta === num);
  return m?.chakra ?? null;
}

export function getArcanoByNumber(num: number): string | null {
  const m = Object.values(TAROT_CHAKRA_MAPPINGS).find(m => m.numero_carta === num);
  return m?.arcano ?? null;
}

export function getOrixaByArcano(arcano: string): string | null {
  return getTarotChakra(arcano)?.orixa ?? null;
}

export function getArcanosByOrixa(orixa: string): string[] {
  return Object.values(TAROT_CHAKRA_MAPPINGS).filter(m => m.orixa.toLowerCase() === orixa.trim().toLowerCase()).map(m => m.arcano);
}

export function getElementByArcano(arcano: string): string | null {
  return getTarotChakra(arcano)?.elemento ?? null;
}

export function getArcanosByElement(elemento: string): string[] {
  const elementMap: Record<string, string> = { fogo: 'Fogo', fire: 'Fogo', água: 'Água', agua: 'Água', water: 'Água', ar: 'Ar', air: 'Ar', terra: 'Terra', earth: 'Terra', éter: 'Éter', ether: 'Éter' };
  const target = elementMap[elemento.trim().toLowerCase()] || elemento;
  return Object.values(TAROT_CHAKRA_MAPPINGS).filter(m => m.elemento === target).map(m => m.arcano);
}

export function getArcanoCount(): number { return Object.keys(TAROT_CHAKRA_MAPPINGS).length; }

export default { getTarotChakra, getChakraTarot, getAllTarotChakras, getAllArcanos, hasTarotChakra, getChakraByNumber, getArcanoByNumber, getOrixaByArcano, getArcanosByOrixa, getElementByArcano, getArcanosByElement, getArcanoCount, TAROT_CHAKRA_MAPPINGS };
