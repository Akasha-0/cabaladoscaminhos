
/**
 * Tarot-Chakra Spiritual Correlation Module
 * Maps Tarot Major Arcana cards to their corresponding chakras.
 */
import type { ChakraName } from './chakra-element';

export type TarotArcano = 'O Louco' | 'O Mago' | 'A Sacerdotisa' | 'A Imperatriz' | 'O Imperador' | 'O Hierofante' | 'O Carro' | 'A Justiça' | 'O Eremita' | 'A Roda da Fortuna' | 'A Força' | 'O Enforcado' | 'A Morte' | 'A Temperança' | 'O Diabo' | 'A Torre' | 'A Estrela' | 'A Lua' | 'O Sol' | 'O Julgamento' | 'O Mundo';

export interface TarotChakraMapping {
  arcano: TarotArcano;
  numero_carta: number;
  chakra: ChakraName;
  chakra_numero: string;
  elemento: string;
  temas_espirituais: string[];
  qualidade_emocional: string;
  sombra_psicologica: string;
  afirmacao: string;
}

export const TAROT_CHAKRA_MAPPINGS: Record<TarotArcano, TarotChakraMapping> = {
  'O Louco': { arcano: 'O Louco', numero_carta: 0, chakra: 'Sahasrara', chakra_numero: '7º Coroa', elemento: 'Éter', temas_espirituais: ['Iniciação', 'Liberdade', 'Saudade divina'], qualidade_emocional: 'Liberdade', sombra_psicologica: 'Irresponsabilidade', afirmacao: 'Eu confio na sabedoria do universo' },
  'O Mago': { arcano: 'O Mago', numero_carta: 1, chakra: 'Sahasrara', chakra_numero: '7º Coroa', elemento: 'Ar', temas_espirituais: ['Manifestação', 'Vontade'], qualidade_emocional: 'Confiança', sombra_psicologica: 'Manipulação', afirmacao: 'Eu canalizo a energia divina' },
  'A Sacerdotisa': { arcano: 'A Sacerdotisa', numero_carta: 2, chakra: 'Ajna', chakra_numero: '6º Terceiro Olho', elemento: 'Água', temas_espirituais: ['Intuição', 'Mistério'], qualidade_emocional: 'Paz no silêncio', sombra_psicologica: 'Isolamento', afirmacao: 'Eu honro minha voz interior' },
  'A Imperatriz': { arcano: 'A Imperatriz', numero_carta: 3, chakra: 'Anahata', chakra_numero: '4º Cardíaco', elemento: 'Terra', temas_espirituais: ['Fertilidade', 'Abundância'], qualidade_emocional: 'Amor incondicional', sombra_psicologica: 'Sufocamento', afirmacao: 'Eu irradio amor e acolhimento' },
  'O Imperador': { arcano: 'O Imperador', numero_carta: 4, chakra: 'Ajna', chakra_numero: '6º Terceiro Olho', elemento: 'Fogo', temas_espirituais: ['Autoridade', 'Estrutura'], qualidade_emocional: 'Disciplina', sombra_psicologica: 'Rigidez', afirmacao: 'Eu uso minha autoridade com sabedoria' },
  'O Hierofante': { arcano: 'O Hierofante', numero_carta: 5, chakra: 'Vishuddha', chakra_numero: '5º Laríngeo', elemento: 'Terra', temas_espirituais: ['Tradição', 'Ensinamento'], qualidade_emocional: 'Busca por significado', sombra_psicologica: 'Dogmatismo', afirmacao: 'Eu busco sabedoria nas tradições' },
  'O Carro': { arcano: 'O Carro', numero_carta: 7, chakra: 'Manipura', chakra_numero: '3º Plexo Solar', elemento: 'Fogo', temas_espirituais: ['Vitória', 'Determinação'], qualidade_emocional: 'Força de vontade', sombra_psicologica: 'Agressividade', afirmacao: 'Eu dirijo minha vontade com propósito' },
  'A Justiça': { arcano: 'A Justiça', numero_carta: 8, chakra: 'Vishuddha', chakra_numero: '5º Laríngeo', elemento: 'Ar', temas_espirituais: ['Equilíbrio', 'Verdade'], qualidade_emocional: 'Discernimento', sombra_psicologica: 'Inflexibilidade', afirmacao: 'Eu ajo com integridade' },
  'O Eremita': { arcano: 'O Eremita', numero_carta: 9, chakra: 'Ajna', chakra_numero: '6º Terceiro Olho', elemento: 'Terra', temas_espirituais: ['Introspecção', 'Sabedoria'], qualidade_emocional: 'Paz interior', sombra_psicologica: 'Isolamento', afirmacao: 'Eu encontro luz na escuridão' },
  'A Roda da Fortuna': { arcano: 'A Roda da Fortuna', numero_carta: 10, chakra: 'Manipura', chakra_numero: '3º Plexo Solar', elemento: 'Fogo', temas_espirituais: ['Ciclos', 'Destino'], qualidade_emocional: 'Adaptação', sombra_psicologica: 'Dependência da sorte', afirmacao: 'Eu aceito os ciclos da vida' },
  'A Força': { arcano: 'A Força', numero_carta: 11, chakra: 'Anahata', chakra_numero: '4º Cardíaco', elemento: 'Terra', temas_espirituais: ['Coragem', 'Compaixão'], qualidade_emocional: 'Força gentil', sombra_psicologica: 'Autocrítica', afirmacao: 'Eu canalizo minha força com amor' },
  'O Enforcado': { arcano: 'O Enforcado', numero_carta: 12, chakra: 'Sahasrara', chakra_numero: '7º Coroa', elemento: 'Água', temas_espirituais: ['Sacrifício', 'Entrega'], qualidade_emocional: 'Disposição para sacrifício', sombra_psicologica: 'Vitimização', afirmacao: 'Eu abraço novos pontos de vista' },
  'A Morte': { arcano: 'A Morte', numero_carta: 13, chakra: 'Svadhisthana', chakra_numero: '2º Sacral', elemento: 'Água', temas_espirituais: ['Transformação', 'Renascimento'], qualidade_emocional: 'Aceitação da impermanência', sombra_psicologica: 'Medo de mudanças', afirmacao: 'Eu libero o que precisa morrer' },
  'A Temperança': { arcano: 'A Temperança', numero_carta: 14, chakra: 'Svadhisthana', chakra_numero: '2º Sacral', elemento: 'Fogo', temas_espirituais: ['Equilíbrio', 'Integração'], qualidade_emocional: 'Moderação', sombra_psicologica: 'Indiferença', afirmacao: 'Eu encontro o ponto de equilíbrio' },
  'O Diabo': { arcano: 'O Diabo', numero_carta: 15, chakra: 'Muladhara', chakra_numero: '1º Raiz', elemento: 'Terra', temas_espirituais: ['Apego', 'Escravidão'], qualidade_emocional: 'Reconhecimento dos apegos', sombra_psicologica: 'Vício', afirmacao: 'Eu reconheço minhas correntes' },
  'A Torre': { arcano: 'A Torre', numero_carta: 16, chakra: 'Muladhara', chakra_numero: '1º Raiz', elemento: 'Fogo', temas_espirituais: ['Destruição criativa', 'Revelação'], qualidade_emocional: 'Coragem diante da crise', sombra_psicologica: 'Pânico', afirmacao: 'Eu aceito que a destruição precede o renascimento' },
  'A Estrela': { arcano: 'A Estrela', numero_carta: 17, chakra: 'Anahata', chakra_numero: '4º Cardíaco', elemento: 'Ar', temas_espirituais: ['Esperança', 'Inspiração'], qualidade_emocional: 'Esperança Renovada', sombra_psicologica: 'Desespero', afirmacao: 'Eu recebo a luz divina e irradio esperança' },
  'A Lua': { arcano: 'A Lua', numero_carta: 18, chakra: 'Svadhisthana', chakra_numero: '2º Sacral', elemento: 'Água', temas_espirituais: ['Inconsciente', 'Intuição'], qualidade_emocional: 'Conexão com o inconsciente', sombra_psicologica: 'Ilusão', afirmacao: 'Eu navego pelas águas do inconsciente' },
  'O Sol': { arcano: 'O Sol', numero_carta: 19, chakra: 'Manipura', chakra_numero: '3º Plexo Solar', elemento: 'Fogo', temas_espirituais: ['Alegria', 'Vitalidade'], qualidade_emocional: 'Alegria autêntica', sombra_psicologica: 'Egocentrismo', afirmacao: 'Eu brilho com minha luz autêntica' },
  'O Julgamento': { arcano: 'O Julgamento', numero_carta: 20, chakra: 'Vishuddha', chakra_numero: '5º Laríngeo', elemento: 'Fogo', temas_espirituais: ['Renascimento', 'Novo início'], qualidade_emocional: 'Abertura para chamada divina', sombra_psicologica: 'Autocondenação', afirmacao: 'Eu respondo à minha chamada divina' },
  'O Mundo': { arcano: 'O Mundo', numero_carta: 21, chakra: 'Sahasrara', chakra_numero: '7º Coroa', elemento: 'Terra', temas_espirituais: ['Completude', 'Realização'], qualidade_emocional: 'Plenitude', sombra_psicologica: 'Insatisfação crônica', afirmacao: 'Eu integro todas as partes de mim' },
};

function normalizeArcanoName(arcano: string): TarotArcano | null {
  const map: Record<string, TarotArcano> = { 'o louco': 'O Louco', 'o mago': 'O Mago', 'a sacerdotisa': 'A Sacerdotisa', 'a imperatriz': 'A Imperatriz', 'o imperador': 'O Imperador', 'o hierofante': 'O Hierofante', 'o carro': 'O Carro', 'a justiça': 'A Justiça', 'o eremita': 'O Eremita', 'a roda da fortuna': 'A Roda da Fortuna', 'a força': 'A Força', 'o enforcado': 'O Enforcado', 'a morte': 'A Morte', 'a temperança': 'A Temperança', 'o diabo': 'O Diabo', 'a torre': 'A Torre', 'a estrela': 'A Estrela', 'a lua': 'A Lua', 'o sol': 'O Sol', 'o julgamento': 'O Julgamento', 'o mundo': 'O Mundo', 'the fool': 'O Louco', 'the magician': 'O Mago', 'the high priestess': 'A Sacerdotisa', 'the empress': 'A Imperatriz', 'the emperor': 'O Imperador', 'the hierophant': 'O Hierofante', 'the chariot': 'O Carro', 'the hermit': 'O Eremita', 'death': 'A Morte', 'temperance': 'A Temperança', 'the devil': 'O Diabo', 'the tower': 'A Torre', 'the star': 'A Estrela', 'the moon': 'A Lua', 'the sun': 'O Sol', 'the world': 'O Mundo' };
  return map[arcano.trim().toLowerCase()] ?? null;
}

function normalizeChakraName(chakra: string): ChakraName | null {
  const map: Record<string, ChakraName> = { 'muladhara': 'Muladhara', 'root': 'Muladhara', 'svadhisthana': 'Svadhisthana', 'sacral': 'Svadhisthana', 'manipura': 'Manipura', 'solar plexus': 'Manipura', 'anahata': 'Anahata', 'heart': 'Anahata', 'vishuddha': 'Vishuddha', 'throat': 'Vishuddha', 'ajna': 'Ajna', 'third eye': 'Ajna', 'sahasrara': 'Sahasrara', 'crown': 'Sahasrara' };
  return map[chakra.trim().toLowerCase()] ?? null;
}

export function getTarotChakra(arcano: string): TarotChakraMapping | null {
  const normalized = normalizeArcanoName(arcano);
  if (!normalized) return null;
  return TAROT_CHAKRA_MAPPINGS[normalized] ?? null;
}

export function getChakraTarot(chakra: string): TarotChakraMapping[] {
  const normalized = normalizeChakraName(chakra);
  if (!normalized) return [];
  return Object.values(TAROT_CHAKRA_MAPPINGS).filter((m) => m.chakra === normalized);
}

export function getAllTarotChakras(): TarotChakraMapping[] {
  return Object.values(TAROT_CHAKRA_MAPPINGS);
}

export function getAllArcanos(): TarotArcano[] {
  return Object.values(TAROT_CHAKRA_MAPPINGS).map((m) => m.arcano);
}

export function hasTarotChakra(arcano: string): boolean {
  return normalizeArcanoName(arcano) !== null;
}

export function hasChakraTarot(chakra: string): boolean {
  return normalizeChakraName(chakra) !== null && getChakraTarot(chakra).length > 0;
}

export function getTarotChakrasByElement(): Record<string, TarotChakraMapping[]> {
  const result: Record<string, TarotChakraMapping[]> = {};
  for (const mapping of Object.values(TAROT_CHAKRA_MAPPINGS)) {
    if (!result[mapping.elemento]) result[mapping.elemento] = [];
    result[mapping.elemento].push(mapping);
  }
  return result;
}

export default { getTarotChakra, getChakraTarot, getAllTarotChakras, getAllArcanos, hasTarotChakra, hasChakraTarot, getTarotChakrasByElement, TAROT_CHAKRA_MAPPINGS };
