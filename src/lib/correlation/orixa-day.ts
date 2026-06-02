/**
 * Orixá-Day Correlation Module
 * Maps Orixás to sacred days of the week with spiritual elements and meanings
 */

export interface OrixaDay {
  orixa: string;
  day: string;
  element: 'fogo' | 'água' | 'ar' | 'terra' | 'éter';
  spiritual_meaning: string;
  energy: 'yang' | 'yin' | 'balanced';
}

// Main Orixá-day mappings
const ORIXAS_DAY_MAP: Record<string, OrixaDay> = {
  'Oxalá': {
    orixa: 'Oxalá',
    day: 'Sexta-feira',
    element: 'éter',
    spiritual_meaning: 'O Criador supremo, Pai de todos os Orixás. Governa a criação, pureza, paz e reconciliação. Seu dia sagrado fortalece a conexão com o divino e a harmonia entre os seres.',
    energy: 'yang'
  },
  'Iemanjá': {
    orixa: 'Iemanjá',
    day: 'Sábado',
    element: 'água',
    spiritual_meaning: 'Mãe das águas e Rainha do Mar. Provedora, nutridora e protetora maternal. Seu dia sagrado é propício para orações de proteção, fertilidade e cura emocional.',
    energy: 'yin'
  },
  'Oxum': {
    orixa: 'Oxum',
    day: 'Sábado',
    element: 'água',
    spiritual_meaning: 'A riqueza interior e a prosperidade material. Deusa do ouro, dos rios e do amor. Seu dia fortalece a abundância, a vaidade sagrada e a atração de recursos com elegância.',
    energy: 'yin'
  },
  'Ogum': {
    orixa: 'Ogum',
    day: 'Terça-feira',
    element: 'terra',
    spiritual_meaning: 'O guerreiro, ferreiro e senhor das encruzilhadas. Abre caminhos, vence batalhas e conquista territórios. Seu dia é ideal para iniciar projetos e superar obstáculos.',
    energy: 'yang'
  },
  'Oxóssi': {
    orixa: 'Oxóssi',
    day: 'Quinta-feira',
    element: 'terra',
    spiritual_meaning: 'O caçador, provedor e senhor das matas. Busca constante, sabedoria ancestral e conexão com a natureza. Seu dia traz prosperidade e celebra conquistas.',
    energy: 'balanced'
  },
  'Xangô': {
    orixa: 'Xangô',
    day: 'Quarta-feira',
    element: 'fogo',
    spiritual_meaning: 'O senhor da justiça, do raio e do trovão. Governa a lei cósmica, a verdade e o equilíbrio social. Seu dia é propício para decisões importantes e justiça.',
    energy: 'yang'
  },
  'Iansã': {
    orixa: 'Iansã',
    day: 'Terça-feira',
    element: 'fogo',
    spiritual_meaning: 'A guerreira dos ventos e das tempestades. Dona das mudanças bruscas e das transformações radicais. Seu dia fortalece a libertação e a capacidade de adaptação.',
    energy: 'yang'
  },
  'Omolu': {
    orixa: 'Omolu',
    day: 'Segunda-feira',
    element: 'terra',
    spiritual_meaning: 'O senhor das doenças e da cura, das portas e do destino. Transforma a escuridão em luz, a doença em saúde. Seu dia é propício para cura e renovação interior.',
    energy: 'balanced'
  },
  'Nanã': {
    orixa: 'Nanã',
    day: 'Terça-feira',
    element: 'água',
    spiritual_meaning: 'A anciã, senhora das águas paradas e do barro. Governa a sabedoria dos anciãos e os segredos ancestrais. Seu dia fortalece a sabedoria que vem com tempo e experiência.',
    energy: 'yin'
  }
};

/**
 * Get Orixá day correlation mapping
 * @param orixa - Name of the Orixá (case-insensitive)
 * @returns OrixaDay mapping or undefined if not found
 */
export function getOrixaDay(orixa: string): OrixaDay | undefined {
  const normalized = orixa.trim();
  return ORIXAS_DAY_MAP[normalized] || Object.values(ORIXAS_DAY_MAP).find(
    entry => entry.orixa.toLowerCase() === normalized.toLowerCase()
  );
}

/**
 * Get the primary Orixá for a given day of the week
 * @param day - Day of the week (e.g., 'Segunda-feira', 'Terça-feira')
 * @returns OrixaDay mapping or undefined if no Orixá is associated
 */
export function getDayOrixa(day: string): OrixaDay | undefined {
  const normalized = day.trim();
  return Object.values(ORIXAS_DAY_MAP).find(
    entry => entry.day.toLowerCase() === normalized.toLowerCase()
  );
}

/**
 * Get all Orixá-day mappings
 * @returns Array of all OrixaDay objects
 */
export function getAllOrixaDays(): OrixaDay[] {
  return Object.values(ORIXAS_DAY_MAP);
}

export default {
  getOrixaDay,
  getDayOrixa,
  getAllOrixaDays,
};