/**
 * Zodiac-Day Spiritual Correlation
 * Maps each zodiac sign to its associated day of the week, element connection, and spiritual meaning.
 * Based on classical Western astrology integrated with the Cabala dos Caminhos system.
 */

import type { Elemento } from './element-sign';

/** The twelve zodiac signs in Portuguese */
export type Signo =
  | 'Áries'
  | 'Touro'
  | 'Gémeos'
  | 'Câncer'
  | 'Leão'
  | 'Virgem'
  | 'Libra'
  | 'Escorpião'
  | 'Sagitário'
  | 'Capricórnio'
  | 'Aquário'
  | 'Peixes';

/** The seven days of the week in Portuguese */
export type DiaSemana =
  | 'Domingo'
  | 'Segunda-feira'
  | 'Terça-feira'
  | 'Quarta-feira'
  | 'Quinta-feira'
  | 'Sexta-feira'
  | 'Sábado';

/**
 * Complete zodiac-day mapping with spiritual practices.
 * Each sign is associated with a day of the week, element connection,
 * and spiritual meaning based on Brazilian and Western astrological traditions.
 */
export interface ZodiacDayMapping {
  /** Signo name */
  signo: Signo;
  /** Associated day of the week */
  dia: DiaSemana;
  /** Primary element connection */
  elemento: Elemento;
  /** Planet ruling the sign */
  planeta_regente: string;
  /** Numerology number associated with the day-sign combination */
  numero_sagrado: number;
  /** Element qualities for the sign */
  qualidades_elementares: {
    quente: boolean;
    frio: boolean;
    seco: boolean;
    humido: boolean;
  };
  /** Spiritual meaning of the sign-day correlation */
  significado_espiritual: string;
  /** Recommended spiritual practices for this day-sign */
  praticas_espirituais: readonly string[];
  /** Affirmations for the day-sign energy */
  afirmacoes: readonly string[];
  /** Chakra associated with this sign-day correlation */
  chakra: string;
  /** Orixá (Brazilian spiritual entity) associated with this day-sign */
  orixa: string;
  /** Sabath/ritual for this day */
  sabat: string | null;
  /** Crystal/mineral associated */
  cristal: string;
  /** Color for spiritual work */
  cor: string;
}

/**
 * Complete mapping of all 12 zodiac signs with their day correspondences.
 * Based on classical Western astrology integrated with Brazilian spiritual traditions.
 * 
 * Day assignments follow traditional associations:
 * - Domingo (Sun): Leo, Cancer
 * - Segunda-feira (Moon): Cancer
 * - Terça-feira (Mars): Aries, Scorpio
 * - Quarta-feira (Mercury): Gemini, Virgo
 * - Quinta-feira (Jupiter): Sagittarius, Pisces
 * - Sexta-feira (Venus): Taurus, Libra
 * - Sábado (Saturn): Capricorn, Aquarius
 */
export const ZODIAC_DAY_MAPPINGS: Readonly<Record<Signo, ZodiacDayMapping>> = {
  'Áries': {
    signo: 'Áries',
    dia: 'Terça-feira',
    elemento: 'Fogo',
    planeta_regente: 'Marte',
    numero_sagrado: 9,
    qualidades_elementares: { quente: true, frio: false, seco: true, humido: false },
    significado_espiritual: 'Iniciação e coragem. O dia de Áries representa o despertar da consciência para novos caminhos. É um momento de ação divina, onde a força vital manifesta-se através da vontade espiritual. Energia de pioneirismo e transformação rápida.',
    praticas_espirituais: [
      'Meditação de abertura de caminho',
      'Ritual de proteção com fogo',
      'Oração de coragem e determinação',
      'Lançamento de intenções ao amanhecer',
      'Trabalho com a energia de Marte'
    ],
    afirmacoes: [
      'Eu sou corajoso e determinedo',
      'Minha vontade está alinhada com o propósito divino',
      'Abro novos caminhos com confiança',
      'A energia divina me fortalece'
    ],
    chakra: 'Muladhara (Raiz)',
    orixa: 'Ogum',
    sabat: null,
    cristal: 'Malaquita',
    cor: 'Vermelho'
  },
  'Touro': {
    signo: 'Touro',
    dia: 'Sexta-feira',
    elemento: 'Terra',
    planeta_regente: 'Vénus',
    numero_sagrado: 6,
    qualidades_elementares: { quente: false, frio: false, seco: true, humido: false },
    significado_espiritual: 'Estabilidade e abundância terrena. O dia de Touro conecta o espírito à natureza e à matéria. É um momento para cultivar a gratitude e reconhecer as bênçãos da terra. A energia taurina ensina a paciência e a persistência no caminho espiritual.',
    praticas_espirituais: [
      'Ritual deGratidão e abundância',
      'Conexão com a energia da terra',
      'Meditação de fertilidade espiritual',
      'Trabalho com cristais e pedras',
      'Oração de prosperidade'
    ],
    afirmacoes: [
      'Eu sou abundante e próspero',
      'A natureza me sustenta e me abençoa',
      'Cultivo a paciência no meu caminho espiritual',
      'Minha vida está em harmonia com a terra'
    ],
    chakra: 'Svadhisthana (Sacro)',
    orixa: 'Oxum',
    sabat: null,
    cristal: 'Malaquita',
    cor: 'Verde'
  },
  'Gémeos': {
    signo: 'Gémeos',
    dia: 'Quarta-feira',
    elemento: 'Ar',
    planeta_regente: 'Mercúrio',
    numero_sagrado: 5,
    qualidades_elementares: { quente: false, frio: true, seco: true, humido: true },
    significado_espiritual: 'Comunicação e dualidade. O dia de Gémeos representa a integração dos opostos e o poder das palavras. É um momento de aprendizado, comunicação com guias, e desenvolvimento da mente espiritual. A energia geminiana abre portais para múltiplas dimensões da consciência.',
    praticas_espirituais: [
      'Comunhão com guias e mentores',
      'Leitura e meditação com runas',
      'Ritual de comunicação espiritual',
      'Trabalho com o elemento Ar',
      'Oração de sabedoria e eloquência'
    ],
    afirmacoes: [
      'Eu me comunico com clareza e verdade',
      'Minha mente está aberta ao conhecimento divino',
      'Integro minha dualidade com harmonia',
      'As palavras são ferramentas de cura em minhas mãos'
    ],
    chakra: 'Vishuddha (Garganta)',
    orixa: 'Iemanjá',
    sabat: null,
    cristal: 'Ágata',
    cor: 'Amarelo'
  },
  'Câncer': {
    signo: 'Câncer',
    dia: 'Segunda-feira',
    elemento: 'Água',
    planeta_regente: 'Lua',
    numero_sagrado: 2,
    qualidades_elementares: { quente: false, frio: true, seco: false, humido: true },
    significado_espiritual: 'Intuição e emocionalidade sagrada. O dia de Câncer conecta o espírito às águas da emoção e à energia lunar. É um momento de purificação emocional, trabalho com a memória ancestral, e desenvolvimento da intuição. A energia canceriana abre portais para o inconsciente e a sabedoria do sangue.',
    praticas_espirituais: [
      'Trabalho com a energia lunar',
      'Ritual de purificação emocional',
      'Meditação de conexão com ancestrais',
      'Oração de proteção do lar',
      'Trabalho com água energizada'
    ],
    afirmacoes: [
      'Minha intuição é minha bússola sagrada',
      'Eu honro minha ancestralidade e lineage',
      'Minhas emoções são portais para a sabedoria',
      'Sou protegido pela energia lunar'
    ],
    chakra: 'Anahata (Coração)',
    orixa: 'Iemanjá',
    sabat: null,
    cristal: 'Pérola',
    cor: 'Prata'
  },
  'Leão': {
    signo: 'Leão',
    dia: 'Domingo',
    elemento: 'Fogo',
    planeta_regente: 'Sol',
    numero_sagrado: 1,
    qualidades_elementares: { quente: true, frio: false, seco: true, humido: false },
    significado_espiritual: 'Autoridade espiritual e criatividade divina. O dia do Sol-Leão representa o momento de brilho interior e reconhecimento doEU SOU. É um momento de cura através da expressão criativa, liderança espiritual, e conexão com a luz crística. A energia leonina despierta o poder pessoal alinhado ao propósito divino.',
    praticas_espirituais: [
      'Meditação solar e trabalho com a luz',
      'Ritual de autoexpressão criativa',
      'Oração de poder pessoal e liderado',
      'Trabalho com fogo transformador',
      'Conexão com o EU SOU'
    ],
    afirmacoes: [
      'Eu sou a luz que ilumina meu caminho',
      'Minha criatividade é um dom divino',
      'Eu mereço brilhar e ser reconhecido',
      'O poder divino flui através de mim'
    ],
    chakra: 'Manipura (Plexo Solar)',
    orixa: 'Oxalá',
    sabat: null,
    cristal: 'Âmbar',
    cor: 'Ouro'
  },
  'Virgem': {
    signo: 'Virgem',
    dia: 'Quarta-feira',
    elemento: 'Terra',
    planeta_regente: 'Mercúrio',
    numero_sagrado: 5,
    qualidades_elementares: { quente: false, frio: false, seco: true, humido: true },
    significado_espiritual: 'Pureza e serviço sagrado. O dia de Virgem representa a busca pela perfeição espiritual através do serviço. É um momento de cura, organização interna, análise espiritual, e desenvolvimento da discriminantção. A energia virginiana ensina que a purityza vem da simplicidade e do desapego.',
    praticas_espirituais: [
      'Ritual de purificação e limpeza',
      'Meditação de organização espiritual',
      'Trabalho com ervas e plantas medicinais',
      'Oração de cura e serviço',
      'Prática de agradece e simplicidade'
    ],
    afirmacoes: [
      'Eu escolho a purityza em meus pensamentos e ações',
      'O serviço aos outros é meu caminho de elevação',
      'Minha mente analítica serve ao meu espírito',
      'A simplicidade me liberta'
    ],
    chakra: 'Vishuddha (Garganta)',
    orixa: 'Oxum',
    sabat: null,
    cristal: 'Amazonite',
    cor: 'Verde-claro'
  },
  'Libra': {
    signo: 'Libra',
    dia: 'Sexta-feira',
    elemento: 'Ar',
    planeta_regente: 'Vénus',
    numero_sagrado: 6,
    qualidades_elementares: { quente: false, frio: true, seco: false, humido: true },
    significado_espiritual: 'Harmonia e justicia divina. O dia de Libra representa a busca pelo equilíbrio entre opostos. É um momento de parcerias espirituais, cura de relacionamentos, e desenvolvimento da justiça interior. A energia libriana ensina que a verdadeira harmonia vem da integração dos opostos dentro de nós.',
    praticas_espirituais: [
      'Ritual de equilíbrio e harmonia',
      'Meditação de relacionamentos sagrados',
      'Trabalho com a energia de Vénus',
      'Oração de paz e reconciliação',
      'Prática de perdão e aceitação'
    ],
    afirmacoes: [
      'Eu busco a harmonia em todas as áreas da minha vida',
      'Meus relacionamentos são espelhos de amor divino',
      'Eu escolho a justiça e a paz',
      'O equilíbrio é meu estado natural'
    ],
    chakra: 'Anahata (Coração)',
    orixa: 'Oxum',
    sabat: null,
    cristal: 'Quartzo Rosa',
    cor: 'Rosa'
  },
  'Escorpião': {
    signo: 'Escorpião',
    dia: 'Terça-feira',
    elemento: 'Água',
    planeta_regente: 'Plutão',
    numero_sagrado: 8,
    qualidades_elementares: { quente: false, frio: true, seco: false, humido: true },
    significado_espiritual: 'Transformação e regeneração profunda. O dia de Escorpião representa a morte e rebirth espiritual. É um momento de profundos mergulhos no inconsciente, cura de traumas, e libertação de padrões densos. A energia escorpiana é a mais poderosa para transformação, exigindo entrega total ao processo de morte/renascimento.',
    praticas_espirituais: [
      'Ritual de morte e rebirth',
      'Meditação profunda e investigação interior',
      'Trabalho com a energia de Plutão',
      'Oração de libertação e renovação',
      'Prática de transformação de traumas'
    ],
    afirmacoes: [
      'Eu sou capaz de me transformar completamente',
      'Minha força está na minha capacidade de renascer',
      'Libero tudo o que não serve mais ao meu crescimento',
      'A morte é apenas um portal para nova vida'
    ],
    chakra: 'Svadhisthana (Sacro)',
    orixa: 'Iemanjá',
    sabat: null,
    cristal: 'Obsidiana',
    cor: 'Preto'
  },
  'Sagitário': {
    signo: 'Sagitário',
    dia: 'Quinta-feira',
    elemento: 'Fogo',
    planeta_regente: 'Júpiter',
    numero_sagrado: 3,
    qualidades_elementares: { quente: true, frio: false, seco: true, humido: false },
    significado_espiritual: 'Expansão e sabedoria universal. O dia de Sagitário representa o momento de busca por truth superior. É um momento de expansão da consciência, peregrinação interior, e conexão com a sabedoria dos mestres. A energia sagitariana abre portais para dimensões elevadas de compreensão espiritual.',
    praticas_espirituais: [
      'Meditação de expansão da consciência',
      'Ritual de busca por sabedoria',
      'Trabalho com a energia de Júpiter',
      'Oração de proteção para viajantes',
      'Prática de fé e confiança no divino'
    ],
    afirmacoes: [
      'Minha mente está aberta à sabedoria universal',
      'Eu sou um viajante no caminho espiritual',
      'A verdade divina é minha bússola',
      'Minha fé me fortalece em todos os momentos'
    ],
    chakra: 'Ajna (Terceiro Olho)',
    orixa: 'Ogum',
    sabat: null,
    cristal: 'Turquesa',
    cor: 'Azul-escuro'
  },
  'Capricórnio': {
    signo: 'Capricórnio',
    dia: 'Sábado',
    elemento: 'Terra',
    planeta_regente: 'Saturno',
    numero_sagrado: 10,
    qualidades_elementares: { quente: false, frio: true, seco: true, humido: false },
    significado_espiritual: 'Disciplina e realização através do esforço sagrado. O dia de Capricórnio representa a conquista espiritual através da perseverança. É um momento de estruturação, organização, e trabalho árduo no caminho espiritual. A energia capricorniana ensina que a verdadeira masters vem do esforço constante e da disciplina.',
    praticas_espirituais: [
      'Ritual de estruturação espiritual',
      'Meditação de disciplina e perseverança',
      'Trabalho com a energia de Saturno',
      'Oração de proteção e长辈 orientação',
      'Prática de limitação e desapego'
    ],
    afirmacoes: [
      'Eu construo minha vida espiritual com disciplina',
      'O esforço constante me leva à masters',
      'Eu sou responsável pelo meu destino espiritual',
      'A paciência é minha virtue'
    ],
    chakra: 'Muladhara (Raiz)',
    orixa: 'Ogum',
    sabat: 'Yule (Solstício de Inverno)',
    cristal: 'Granada',
    cor: 'Preto'
  },
  'Aquário': {
    signo: 'Aquário',
    dia: 'Sábado',
    elemento: 'Ar',
    planeta_regente: 'Urano',
    numero_sagrado: 11,
    qualidades_elementares: { quente: false, frio: true, seco: true, humido: false },
    significado_espiritual: 'Libertação e inovação espiritual. O dia de Aquário representa a quebra de paradigmas e a abertura para novas possibilidades. É um momento de revolucionamento interior, trabalho com a energia de comunidade, e conexão com ideias进步. A energia aquariana é a mais próxima do plano da iluminação coletiva.',
    praticas_espirituais: [
      'Meditação de Libertação e inovação',
      'Ritual de quebra de paradigmas',
      'Trabalho com a energia de Urano',
      'Oração pela humanidade e pelo bem comum',
      'Prática de aceitar a diferença e a diversidade'
    ],
    afirmacoes: [
      'Eu sou um agente de mudança positiva no mundo',
      'Minha mente está aberta a novas possibilidades',
      'Eu sou parte de uma comunidade espiritual maior',
      'A inovação é meu direito divino'
    ],
    chakra: 'Ajna (Terceiro Olho)',
    orixa: 'Oxalá',
    sabat: 'Imbolc (2 de Fevereiro)',
    cristal: 'Sugilite',
    cor: 'Azul-electric'
  },
  'Peixes': {
    signo: 'Peixes',
    dia: 'Quinta-feira',
    elemento: 'Água',
    planeta_regente: 'Neptuno',
    numero_sagrado: 12,
    qualidades_elementares: { quente: false, frio: true, seco: false, humido: true },
    significado_espiritual: 'Unificação com o divino e trascendência. O dia de Peixes representa a dissolução dos limites do ego e a expansão para o oceano divino. É um momento de profundos trabalhos mediúnicos, sonhos proféticos, e conexão com a energia do infinito. A energia piscina é a mais próxima da non-dualidade e da iluminação.',
    praticas_espirituais: [
      'Meditação de dissolução do ego',
      'Ritual de conexão com o divino',
      'Trabalho com a energia de Neptuno',
      'Oração de trascendência e unificação',
      'Prática de intuição e mediunidade'
    ],
    afirmacoes: [
      'Eu sou um com o divino e com toda a criação',
      'Minha intuição é minha bússola para o infinito',
      'Eu fluo com a energia do universo',
      'A trascendência é meu destino'
    ],
    chakra: 'Sahasrara (Coroa)',
    orixa: 'Iemanjá',
    sabat: 'Ostara (Equinócio da Primavera)',
    cristal: 'Moldavite',
    cor: 'Violeta'
  }
} as const;

/**
 * Normalizes sign name for consistent lookup.
 * Handles variations like accents, case, and common alternatives.
 */
function normalizarSigno(signo: string): Signo | null {
  const normalized = signo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  const NORMALIZED_TO_SIGNO: Readonly<Record<string, Signo>> = {
    'aries': 'Áries',
    'touro': 'Touro',
    'gemeos': 'Gémeos',
    'gêmeos': 'Gémeos',
    'cancer': 'Câncer',
    'cancro': 'Câncer',
    'leao': 'Leão',
    'leão': 'Leão',
    'virgem': 'Virgem',
    'libra': 'Libra',
    'escorpiao': 'Escorpião',
    'escorpião': 'Escorpião',
    'sagitario': 'Sagitário',
    'sagitário': 'Sagitário',
    'capricornio': 'Capricórnio',
    'capricórnio': 'Capricórnio',
    'aquario': 'Aquário',
    'aquário': 'Aquário',
    'peixes': 'Peixes'
  };

  return NORMALIZED_TO_SIGNO[normalized] ?? null;
}

/**
 * Returns the complete zodiac-day mapping for a given sign name.
 *
 * @param signo - Sign name (e.g., 'Áries', 'Leão', 'Peixes')
 * @returns ZodiacDayMapping or null if not found
 */
export function getZodiacDay(signo: string): ZodiacDayMapping | null {
  const normalized = normalizarSigno(signo);
  if (normalized === null) return null;
  return ZODIAC_DAY_MAPPINGS[normalized] ?? null;
}

/**
 * Returns the zodiac mapping for a given day of the week.
 *
 * @param dia - Day name (e.g., 'Domingo', 'Terça-feira')
 * @returns ZodiacDayMapping[] or null if day not found
 */
export function getDayZodiac(dia: string): ZodiacDayMapping[] {
  const normalizedDia = dia
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  const DIA_MAP: Readonly<Record<string, DiaSemana>> = {
    'domingo': 'Domingo',
    'segunda-feira': 'Segunda-feira',
    'segunda': 'Segunda-feira',
    'terca-feira': 'Terça-feira',
    'terca': 'Terça-feira',
    'terça-feira': 'Terça-feira',
    'quarta-feira': 'Quarta-feira',
    'quarta': 'Quarta-feira',
    'quinta-feira': 'Quinta-feira',
    'quinta': 'Quinta-feira',
    'sexta-feira': 'Sexta-feira',
    'sexta': 'Sexta-feira',
    'sabado': 'Sábado',
    'sábado': 'Sábado'
  };

  const targetDia = DIA_MAP[normalizedDia];
  if (!targetDia) return [];

  return Object.values(ZODIAC_DAY_MAPPINGS).filter(m => m.dia === targetDia);
}

/**
 * Returns all zodiac-day mappings.
 *
 * @returns Array of all ZodiacDayMapping
 */
export function getAllZodiacDays(): ZodiacDayMapping[] {
  return Object.values(ZODIAC_DAY_MAPPINGS);
}

/**
 * Returns the day associated with a given sign.
 *
 * @param signo - Sign name
 * @returns DiaSemana or null if not found
 */
export function getDiaFromZodiac(signo: string): DiaSemana | null {
  return getZodiacDay(signo)?.dia ?? null;
}

/**
 * Returns the element for a given sign.
 *
 * @param signo - Sign name
 * @returns Elemento or null if not found
 */
export function getElementoFromZodiac(signo: string): Elemento | null {
  return getZodiacDay(signo)?.elemento ?? null;
}

/**
 * Returns the spiritual meaning for a given sign.
 *
 * @param signo - Sign name
 * @returns Spiritual meaning or null if not found
 */
export function getSignificadoFromZodiac(signo: string): string | null {
  return getZodiacDay(signo)?.significado_espiritual ?? null;
}

/**
 * Returns the planet ruler for a given sign.
 *
 * @param signo - Sign name
 * @returns Planet name or null if not found
 */
export function getPlanetaFromZodiac(signo: string): string | null {
  return getZodiacDay(signo)?.planeta_regente ?? null;
}

/**
 * Returns all signs for a given day.
 *
 * @param dia - Day name
 * @returns Array of Signo
 */
export function getSignosByDia(dia: string): Signo[] {
  return getDayZodiac(dia).map(m => m.signo);
}

/**
 * Returns the chakra for a given sign.
 *
 * @param signo - Sign name
 * @returns Chakra name or null if not found
 */
export function getChakraFromZodiac(signo: string): string | null {
  return getZodiacDay(signo)?.chakra ?? null;
}

/**
 * Returns the orixá for a given sign.
 *
 * @param signo - Sign name
 * @returns Orixá name or null if not found
 */
export function getOrixaFromZodiac(signo: string): string | null {
  return getZodiacDay(signo)?.orixa ?? null;
}

/**
 * Returns the affirmations for a given sign.
 *
 * @param signo - Sign name
 * @returns Affirmations array or null if not found
 */
export function getAfirmacoesFromZodiac(signo: string): readonly string[] | null {
  return getZodiacDay(signo)?.afirmacoes ?? null;
}

/**
 * Returns the spiritual practices for a given sign.
 *
 * @param signo - Sign name
 * @returns Practices array or null if not found
 */
export function getPraticasFromZodiac(signo: string): readonly string[] | null {
  return getZodiacDay(signo)?.praticas_espirituais ?? null;
}

/**
 * Returns the sacred number for a given sign.
 *
 * @param signo - Sign name
 * @returns Sacred number or null if not found
 */
export function getNumeroSagradoFromZodiac(signo: string): number | null {
  return getZodiacDay(signo)?.numero_sagrado ?? null;
}

/**
 * Returns all days of the week.
 *
 * @returns Array of DiaSemana
 */
export function getAllDays(): readonly DiaSemana[] {
  return ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
}

/**
 * Default export for convenience
 */
export default {
  getZodiacDay,
  getDayZodiac,
  getAllZodiacDays,
  getDiaFromZodiac,
  getElementoFromZodiac,
  getSignificadoFromZodiac,
  getPlanetaFromZodiac,
  getSignosByDia,
  getChakraFromZodiac,
  getOrixaFromZodiac,
  getAfirmacoesFromZodiac,
  getPraticasFromZodiac,
  getNumeroSagradoFromZodiac,
  getAllDays,
  ZODIAC_DAY_MAPPINGS
};