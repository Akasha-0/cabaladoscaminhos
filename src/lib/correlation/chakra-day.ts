/**
 * Chakra-Day Spiritual Correlation
 * Maps the 7 chakras (Muladhara to Sahasrara) to days of the week,
 * including element connections, spiritual meanings, and ritual associations.
 * 
 * Based on Cabala dos Caminhos hermetic principles and day-energy.ts data.
 */

export type ChakraName = 
  | 'Muladhara'
  | 'Svadhisthana'
  | 'Manipura'
  | 'Anahata'
  | 'Vishuddha'
  | 'Ajna'
  | 'Sahasrara';

export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

export type DayNamePt = 
  | 'Domingo'
  | 'Segunda-feira'
  | 'Terça-feira'
  | 'Quarta-feira'
  | 'Quinta-feira'
  | 'Sexta-feira'
  | 'Sábado';

export type DayNameEn = 
  | 'Sunday'
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday';

export interface ChakraDayMapping {
  chakra: ChakraName;
  chakra_numero: string;
  dia_semana_pt: DayNamePt;
  dia_semana_en: DayNameEn;
  dia_index: number;
  elemento: Elemento;
  significado_espiritual: {
    descricao: string;
    qualidade: string;
    energia: string;
  };
  praticas_rituais: {
    tipo: string;
    descricao: string;
    elementos: string[];
  };
}

/**
 * Complete mapping of chakras to days of the week.
 * Indexed by dayIndex (0=Monday through 6=Sunday) based on day-energy.ts data.
 */
export const CHAKRA_DAY_MAPPINGS: Record<string, ChakraDayMapping[]> = {
  // ─── Domingo (Sunday) ──────────────────────────────────────────────────────
  '6': [
    {
      chakra: 'Vishuddha',
      chakra_numero: '5º Laríngeo',
      dia_semana_pt: 'Domingo',
      dia_semana_en: 'Sunday',
      dia_index: 6,
      elemento: 'Ar',
      significado_espiritual: {
        descricao: 'Domingo associado à garganta - expressão da verdade e comunicação sagrada',
        qualidade: 'Verdade, expressão autêntica, comunicação espiritual',
        energia: 'Energia solar para expresar mensagens divinas',
      },
      praticas_rituais: {
        tipo: 'Comunicação espiritual',
        descricao: 'Dia propício para escrever, falar verdades, cantar mantras e expressar dons artísticos',
        elementos: ['Laranja', 'Cristal透明的', 'Incienso de sálvia'],
      },
    },
  ],

  // ─── Segunda-feira (Monday) ────────────────────────────────────────────────
  '0': [
    {
      chakra: 'Muladhara',
      chakra_numero: '1º Básico',
      dia_semana_pt: 'Segunda-feira',
      dia_semana_en: 'Monday',
      dia_index: 0,
      elemento: 'Terra',
      significado_espiritual: {
        descricao: 'Segunda-feira inicia a semana com energia lunar - ancoramento e sobrevivência',
        qualidade: 'Estabilidade, segurança, ancoramento ancestral',
        energia: 'Energia lunar para aterramento e proteção',
      },
      praticas_rituais: {
        tipo: 'Aterramento e proteção',
        descricao: 'Dia ideal para ebós de transmutação, despachos, firme de proteção e conexão com ancestrais',
        elementos: ['Preto', 'Raízes', 'Terra', 'Carvão'],
      },
    },
    {
      chakra: 'Ajna',
      chakra_numero: '6º Frontal',
      dia_semana_pt: 'Segunda-feira',
      dia_semana_en: 'Monday',
      dia_index: 0,
      elemento: 'Éter',
      significado_espiritual: {
        descricao: 'Ajustar intuição com realidade - visão clara para a semana',
        qualidade: 'Intuição, percepção, clareza mental',
        energia: 'Energia lunar intensifica percepção extrasensorial',
      },
      praticas_rituais: {
        tipo: 'Desenvolvimento da intuição',
        descricao: 'Dia propício para meditação, leitura de oráculos, trabalhos com Omolu e Exu para cura estrutural',
        elementos: ['Roxo', 'Indigo', 'Fumaça', 'Floral'],
      },
    },
  ],

  // ─── Terça-feira (Tuesday) ─────────────────────────────────────────────────
  '1': [
    {
      chakra: 'Svadhisthana',
      chakra_numero: '2º Sacro',
      dia_semana_pt: 'Terça-feira',
      dia_semana_en: 'Tuesday',
      dia_index: 1,
      elemento: 'Água',
      significado_espiritual: {
        descricao: 'Terça-feira regida por Marte - transformação emocional e criatividade',
        qualidade: 'Fluidez emocional, transformação, criatividade',
        energia: 'Energia marciana para quebra de demandas e coragem',
      },
      praticas_rituais: {
        tipo: 'Transmutação criativa',
        descricao: 'Dia de guerra espiritual: corte de laços kármicos, defumações de descarrego, abertura de caminhos',
        elementos: ['Vermelho', 'Laranja', 'Água salgada', 'Guiné'],
      },
    },
  ],

  // ─── Quarta-feira (Wednesday) ─────────────────────────────────────────────
  '2': [
    {
      chakra: 'Manipura',
      chakra_numero: '3º Plexo Solar',
      dia_semana_pt: 'Quarta-feira',
      dia_semana_en: 'Wednesday',
      dia_index: 2,
      elemento: 'Fogo',
      significado_espiritual: {
        descricao: 'Quarta-feira regida por Mercúrio - clareza mental e poder pessoal',
        qualidade: 'Determinação, força de vontade, poder pessoal',
        energia: 'Energia mercuriana para estudos e estratégias',
      },
      praticas_rituais: {
        tipo: 'Ativação do poder pessoal',
        descricao: 'Dia de clareza intelectual: rituals de prosperidade, consultas de Ifá, abertura de portas materiais',
        elementos: ['Amarelo', 'Dourado', 'Fogo', 'Cobre'],
      },
    },
  ],

  // ─── Quinta-feira (Thursday) ─────────────────────────────────────────────
  '3': [
    {
      chakra: 'Anahata',
      chakra_numero: '4º Cardíaco',
      dia_semana_pt: 'Quinta-feira',
      dia_semana_en: 'Thursday',
      dia_index: 3,
      elemento: 'Ar',
      significado_espiritual: {
        descricao: 'Quinta-feira regida por Júpiter - expansão do amor e sabedoria',
        qualidade: 'Amor incondicional, expansão, compaixão',
        energia: 'Energia jupiteriana para fartura e cura',
      },
      praticas_rituais: {
        tipo: 'Expansão áurica',
        descricao: 'Dia do caçador: oferendas para Oxóssi, ebós de fartura, banhos de samambaia, atração de mentores',
        elementos: ['Verde', 'Rosa', 'Cristal de quartzo', 'Ambrosia'],
      },
    },
  ],

  // ─── Sexta-feira (Friday) ─────────────────────────────────────────────────
  '4': [
    {
      chakra: 'Sahasrara',
      chakra_numero: '7º Coronário',
      dia_semana_pt: 'Sexta-feira',
      dia_semana_en: 'Friday',
      dia_index: 4,
      elemento: 'Éter',
      significado_espiritual: {
        descricao: 'Sexta-feira regida por Vênus - conexão espiritual direta e pureza',
        qualidade: 'Iluminação, transcendência, unidade divina',
        energia: 'Energia venussiana para paz e alinhamento divino',
      },
      praticas_rituais: {
        tipo: 'Conexão espiritual direta',
        descricao: 'Dia da pureza: Boris para Oxalá, banhos de boldo no topo da cabeça, velas brancas, silêncio interior',
        elementos: ['Branco', 'Cristal', 'Prata', 'Perola'],
      },
    },
  ],

  // ─── Sábado (Saturday) ─────────────────────────────────────────────────────
  '5': [
    {
      chakra: 'Anahata',
      chakra_numero: '4º Cardíaco',
      dia_semana_pt: 'Sábado',
      dia_semana_en: 'Saturday',
      dia_index: 5,
      elemento: 'Ar',
      significado_espiritual: {
        descricao: 'Sábado regido por Saturno - harmonização emocional e inteligência do coração',
        qualidade: 'Harmonia, equilíbrio emocional, amor maduro',
        energia: 'Energia saturniana para reflexão e cura emocional profunda',
      },
      praticas_rituais: {
        tipo: 'Harmonização do coração',
        descricao: 'Dia de equilíbrio: trabalhos com Oxum e Iemanjá, banhos de limpeza emocional, meditação de compaixão',
        elementos: ['Azul Claro', 'Rosa Antigo', 'Sal Marinho', 'Flores Brancas'],
      },
    },
    {
      chakra: 'Ajna',
      chakra_numero: '6º Frontal',
      dia_semana_pt: 'Sábado',
      dia_semana_en: 'Saturday',
      dia_index: 5,
      elemento: 'Éter',
      significado_espiritual: {
        descricao: 'Sábado intensifica intuição - trabalho interior profundo',
        qualidade: 'Intuição refinada, sabedoria interior, percepção múltipla',
        energia: 'Energia uraniana para percepção elevada e insights',
      },
      praticas_rituais: {
        tipo: 'Desenvolvimento da sabedoria interior',
        descricao: 'Dia propício para Retiro espiritual, jejum, leitura de tarô, contato com guias espirituais',
        elementos: ['Indigo', 'Roxo Escuro', 'Mirra', 'Incenso Palo Santo'],
      },
    },
  ],
};

/**
 * Returns the chakra-day mapping for a given chakra name.
 */
export function getChakraDay(chakra: string): ChakraDayMapping[] {
  const normalizedChakra = normalizeChakraName(chakra);
  const results: ChakraDayMapping[] = [];

  for (const mappings of Object.values(CHAKRA_DAY_MAPPINGS)) {
    const found = mappings.find(m => m.chakra === normalizedChakra);
    if (found) {
      results.push(found);
    }
  }

  return results;
}

/**
 * Returns all chakra mappings for a given day (0=Monday through 6=Sunday).
 */
export function getDayChakra(diaIndex: number): ChakraDayMapping[] {
  const normalizedIndex = normalizeDayIndex(diaIndex);
  const key = String(normalizedIndex);
  return CHAKRA_DAY_MAPPINGS[key] ?? [];
}

/**
 * Returns all chakra-day mappings.
 */
export function getAllChakraDays(): ChakraDayMapping[] {
  const results: ChakraDayMapping[] = [];
  for (const mappings of Object.values(CHAKRA_DAY_MAPPINGS)) {
    results.push(...mappings);
  }
  return results;
}

/**
 * Returns the primary chakra for a given day.
 */
export function getPrimaryChakraForDay(diaIndex: number): ChakraDayMapping | null {
  const normalizedIndex = normalizeDayIndex(diaIndex);
  const key = String(normalizedIndex);
  const mappings = CHAKRA_DAY_MAPPINGS[key];
  return mappings?.[0] ?? null;
}

/**
 * Returns all days associated with a specific chakra.
 */
export function getDaysForChakra(chakra: string): ChakraDayMapping[] {
  return getChakraDay(chakra);
}

/**
 * Normalizes chakra name to match ChakraName type.
 */
function normalizeChakraName(chakra: string): string {
  const chakraMap: Record<string, string> = {
    'muladhara': 'Muladhara',
    'svadhisthana': 'Svadhisthana',
    'manipura': 'Manipura',
    'anahata': 'Anahata',
    'vishuddha': 'Vishuddha',
    'ajna': 'Ajna',
    'sahasrara': 'Sahasrara',
    '1º básico': 'Muladhara',
    '1º Básico': 'Muladhara',
    '2º sacro': 'Svadhisthana',
    '2º Sacro': 'Svadhisthana',
    '3º plexo solar': 'Manipura',
    '3º Plexo Solar': 'Manipura',
    '4º cardíaco': 'Anahata',
    '4º Cardíaco': 'Anahata',
    '5º laríngeo': 'Vishuddha',
    '5º Laríngeo': 'Vishuddha',
    '6º frontal': 'Ajna',
    '6º Frontal': 'Ajna',
    '7º coronário': 'Sahasrara',
    '7º Coronário': 'Sahasrara',
    'basic': 'Muladhara',
    'sacro': 'Svadhisthana',
    'plexo': 'Manipura',
    'cardiaco': 'Anahata',
    'laríngeo': 'Vishuddha',
    'frontal': 'Ajna',
    'coronário': 'Sahasrara',
  };
  return chakraMap[chakra.toLowerCase()] ?? chakra;
}

/**
 * Normalizes day index to valid range (0-6).
 */
function normalizeDayIndex(dia: number): number {
  return ((dia % 7) + 7) % 7; // Handle negative numbers
}