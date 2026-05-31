/**
 * Orixá-Element Correlation Module
 * Maps Orixás to spiritual elements, planets, days, colors and ritual tools
 * Based on IDEIA.md Cabala dos Caminhos framework
 */

export interface OrixaElement {
  orixa: string;
  elemento_principal: 'fogo' | 'água' | 'ar' | 'terra' | 'éter';
  planeta_regente: string;
  dia_da_semana: string;
  cores_principais: string[];
  ferramentas: string[];
  significado_espiritual: string;
  elementos_secundarios?: string[];
  planeta_secundario?: string;
}

// Main Orixá mappings based on IDEIA.md
const ORIXAS_MAP: Record<string, OrixaElement> = {
  'Oxalá': {
    orixa: 'Oxalá',
    elemento_principal: 'éter',
    planeta_regente: 'Sol',
    dia_da_semana: 'Sexta-feira',
    cores_principais: ['Branco', 'Marfim', 'Opala'],
    ferramentas: [
      'Boldo (Tapete de Oxalá)',
      'Saião',
      'Manjericão Branco',
      'Algodoeiro',
      'Colônia'
    ],
    significado_espiritual: 'O Criador supremo, Pai de todos os Orixás. Governa a criação, pureza, paz e reconciliação. Simboliza o princípio masculino da fecundidade cósmica e a energia etérea que conecta o físico ao espiritual.',
    elementos_secundarios: ['fogo'],
    planeta_secundario: 'Júpiter'
  },
  'Iemanjá': {
    orixa: 'Iemanjá',
    elemento_principal: 'água',
    planeta_regente: 'Lua',
    dia_da_semana: 'Sábado',
    cores_principais: ['Azul Escuro', 'Branco', 'Transparente'],
    ferramentas: [
      'Colônia',
      'Alcaparra',
      'Folha de Lágrima-de-Nossa-Senhora',
      'Pata-de-vaca',
      'Erva-de-Santa-Luzia'
    ],
    significado_espiritual: 'Mãe das águas e Rainha do Mar. Provedora, nutridora e protetora maternal. Governa os ciclos reprodutivos, a fertilidade, os partos e o amor incondicional. Sua energia hídrica traz cura emocional e renovação espiritual.',
    elementos_secundarios: ['éter'],
    planeta_secundario: 'Netuno'
  },
  'Oxum': {
    orixa: 'Oxum',
    elemento_principal: 'água',
    planeta_regente: 'Vênus',
    dia_da_semana: 'Sábado',
    cores_principais: ['Rosa', 'Amarelo-ouro', 'Azul-celeste'],
    ferramentas: [
      'Erva-doce',
      'Calêndula',
      'Camomila',
      'Folha de Dinheiro-em-penca',
      'Melissa',
      'Rosa Branca/Amarela'
    ],
    significado_espiritual: 'A riqueza interior e a prosperidade material. Deusa do ouro, dos rios e do amor. Governa a vaidade, a beleza, a sensualidade e a abundância. Sua energia hídrica ensina a fluir com gracejo e a atrair recursos com elegância.'
  },
  'Ogum': {
    orixa: 'Ogum',
    elemento_principal: 'terra',
    planeta_regente: 'Marte',
    dia_da_semana: 'Terça-feira',
    cores_principais: ['Azul Claro', 'Vermelho', 'Verde'],
    ferramentas: [
      'Espada-de-são-jorge',
      'Quebra-demanda',
      'Guiné',
      'Aroeira',
      'Losna',
      'Folha de Manga'
    ],
    significado_espiritual: 'O guerreiro, ferreiro e senhor das encruzilhadas. Abre caminhos, vence batalhas e conquista territórios. Sua energia telúrica representa a força, a perseverança e a capacidade de superar obstáculos com coragem.',
    elementos_secundarios: ['fogo'],
    planeta_secundario: 'Plutão'
  },
  'Oxóssi': {
    orixa: 'Oxóssi',
    elemento_principal: 'terra',
    planeta_regente: 'Júpiter',
    dia_da_semana: 'Quinta-feira',
    cores_principais: ['Verde', 'Azul-turquesa'],
    ferramentas: [
      'Guiné',
      'Alecrim',
      'Samambaia',
      'Folha de Jurema',
      'Arruda',
      'Eucalipto',
      'Peregum Verde'
    ],
    significado_espiritual: 'O caçador, provedor e senhor das matas. Busca constante, sabedoria ancestral e conexão com a natureza. Sua energia terrestre ensina a buscar com persistência, a confiar no processo e a celebrar as conquistas com alegria.'
  },
  'Xangô': {
    orixa: 'Xangô',
    elemento_principal: 'fogo',
    planeta_regente: 'Sol',
    dia_da_semana: 'Quarta-feira',
    cores_principais: ['Amarelo', 'Marrom', 'Vermelho', 'Branco'],
    ferramentas: [
      'Quebra-pedra',
      'Erva-de-são-joão',
      'Folha de Café',
      'Manjericão Roxo',
      'Levante'
    ],
    significado_espiritual: 'O senhor da justiça, do raio e do trovão. Governa a lei cósmica, a verdade e o equilíbrio social. Sua energia ígnea traz poder, autoridade e a capacidade de destruir o que não serve para reconstruir com maior força.',
    elementos_secundarios: ['ar'],
    planeta_secundario: 'Marte'
  },
  'Iansã': {
    orixa: 'Iansã',
    elemento_principal: 'fogo',
    planeta_regente: 'Urano',
    dia_da_semana: 'Terça-feira',
    cores_principais: ['Laranja', 'Amarelo', 'Vermelho', 'Coral'],
    ferramentas: [
      'Pinhão Roxo',
      'Espada-de-santa-bárbara',
      'Bambu',
      'Folha de Fumo',
      'Louro',
      'Manjericão Roxo'
    ],
    significado_espiritual: 'A guerreira dos ventos e das tempestades. Dona das mudanças bruscas e das transformações radicais. Sua energia ígnea representa a libertação, a revolution interior e a capacidade de se adaptar aos ventos da vida com determinação.',
    elementos_secundarios: ['ar'],
    planeta_secundario: 'Plutão'
  },
  'Omolu': {
    orixa: 'Omolu',
    elemento_principal: 'terra',
    planeta_regente: 'Saturno',
    dia_da_semana: 'Segunda-feira',
    cores_principais: ['Preto', 'Branco', 'Vermelho', 'Violeta'],
    ferramentas: [
      'Canela-de-velho',
      'Assa-peixe',
      'Erva-de-bicho',
      'Vassourinha de Relógio',
      'Manjericão Roxo'
    ],
    significado_espiritual: 'O senhor das doenças e da cura, das portas e do destino. Transforma a escuridão em luz, a doença em saúde. Sua energia telúrica ensina que através do confronto com a escuridão encontramos a verdadeira cura e renascimento.'
  },
  'Nanã': {
    orixa: 'Nanã',
    elemento_principal: 'água',
    planeta_regente: 'Saturno',
    dia_da_semana: 'Terça-feira',
    cores_principais: ['Lilás', 'Roxo', 'Azul-violeta'],
    ferramentas: [
      'Manjericão Roxo',
      'Assa-peixe',
      'Folha de Mostarda',
      'Trapoeraba Roxa',
      'Avenca'
    ],
    significado_espiritual: 'A anciã, senhora das águas paradas e do barro. Governa a sabedoria dos anciãos, os segredos ancestrais e a transformação da matéria. Sua energia hídrica ensina que a verdadeira sabedoria vem com o tempo e a experiência.',
    elementos_secundarios: ['terra'],
    planeta_secundario: 'Lua'
  }
};

/**
 * Get Orixá element correlation mapping
 * @param orixa - Name of the Orixá (case-insensitive)
 * @returns OrixaElement mapping or undefined if not found
 */
export function getOrixaElement(orixa: string): OrixaElement | undefined {
  const normalized = orixa.trim();
  return ORIXAS_MAP[normalized] || Object.values(ORIXAS_MAP).find(
    entry => entry.orixa.toLowerCase() === normalized.toLowerCase()
  );
}

/**
 * Get all registered Orixás
 * @returns Array of all Orixá names
 */
export function getAllOrixas(): string[] {
  return Object.keys(ORIXAS_MAP);
}

/**
 * Get Orixás by element
 * @param elemento - Element type (fogo, água, ar, terra, éter)
 * @returns Array of Orixás with that primary element
 */
export function getOrixasByElement(elemento: OrixaElement['elemento_principal']): OrixaElement[] {
  return Object.values(ORIXAS_MAP).filter(
    entry => entry.elemento_principal === elemento
  );
}

/**
 * Get Orixás by day of week
 * @param dia - Day of week (e.g., 'Segunda-feira', 'Terça-feira')
 * @returns Array of Orixás associated with that day
 */
export function getOrixasByDay(dia: string): OrixaElement[] {
  return Object.values(ORIXAS_MAP).filter(
    entry => entry.dia_da_semana.toLowerCase() === dia.toLowerCase()
  );
}

/**
 * Get reverse mapping: element to associated Orixás
 * @returns Record mapping each element to its associated Orixás
 */
export function getElementOrixa(): Record<OrixaElement['elemento_principal'], string[]> {
  const result: Record<OrixaElement['elemento_principal'], string[]> = {
    fogo: [],
    água: [],
    ar: [],
    terra: [],
    éter: [],
  };
  
  for (const entry of Object.values(ORIXAS_MAP)) {
    result[entry.elemento_principal].push(entry.orixa);
  }
  
  return result;
}

/**
 * Get all Orixá-element mappings
 * @returns Array of all OrixaElement objects
 */
export function getAllOrixaElements(): OrixaElement[] {
  return Object.values(ORIXAS_MAP);
}

export default {
  getOrixaElement,
  getAllOrixas,
  getOrixasByElement,
  getOrixasByDay,
  getElementOrixa,
  getAllOrixaElements,
};