/**
 * Day-Sephirot Spiritual Correlation Module
 * Maps days of the week to the 10 Sephiroth of the Kabbalistic Tree of Life
 * Based on traditional Kabbalah and mystical correspondence systems
 */

/** Supported elements in Kabbalistic tradition */
export type Element = 'fogo' | 'água' | 'ar' | 'terra' | 'éter';

/** Path number on the Tree of Life (1-32) */
export type PathNumber = number;

/**
 * Represents the correlation between a day of the week and its associated Sephirah
 */
export interface DaySephirot {
  /** Day name in Portuguese (e.g., 'Domingo', 'Segunda-feira') */
  dia: string;
  /** Day name in English */
  dia_en: string;
  /** Day index (0 = Sunday, 6 = Saturday) */
  indice: number;
  /** Associated Sephirah on the Tree of Life */
  sephirah: string;
  /** Hebrew name of the Sephirah */
  sephirah_he: string;
  /** Numeric value of the Sephirah (1-10) */
  numero: number;
  /** Associated element */
  elemento: Element;
  /** Path number on the Tree of Life */
  caminho: PathNumber;
  /** Spiritual meaning and mystical significance */
  significado_espiritual: string;
  /** Core mystery/secret of this day-Sephirah correspondence */
  misterio: string;
  /** Day energy description */
  energia: string;
  /** Recommended spiritual practices */
  praticas_espirituais: string[];
  /** Associated quality or attribute */
  qualidade: string;
  /** Planetary association */
  planeta: string;
}

// ─── Day-to-Sephirot Mapping ──────────────────────────────────────────────────

export const DAY_SEPHIROT_MAP: Record<string, DaySephirot> = {
  'Domingo': {
    dia: 'Domingo',
    dia_en: 'Sunday',
    indice: 0,
    sephirah: 'Tiphereth',
    sephirah_he: 'תפארת',
    numero: 6,
    elemento: 'fogo',
    caminho: 15,
    significado_espiritual: 'Domingo-Coração do Tree. Tiphereth é a Sephirah da beleza, harmonia e sacrifício redentor. Este dia canaliza a energia do Sol (Shamesh), despertando a capacidade de amar incondicionalmente e transformar o sofrimento em iluminação. A luz solar amplifica a consciência do eu superior e facilita a fusão entre oYO superior e a personalidade.',
    misterio: 'O segredo da beleza escondida no centro da árvore. Tiphereth representa o ponto de encontro entre Chesed (misericórdia) e Geburah (juízo), onde os opostos se reconciliam na harmonia do amor sacrificial.',
    energia: 'Energia de integração e transformação. O Sol em Tiphereth ilumina os caminhos ocultos, revelando a beleza mesmo no caos. É um dia para cura através da compaixão e redenção através do amor.',
    praticas_espirituais: [
      'Meditação sobre a luz solar penetrando o coração',
      'Visualização da fusão entre o eu superior e a personalidade',
      'Rituais de cura para o plexo solar e coração',
      'Práticas de amor incondicional e compaixão',
      'Trabalho com a cor dourada para harmonizar opostos',
      'Oração contemplativa sobre sacrifício e serviço',
    ],
    qualidade: 'Beleza, Harmonia, Sacrifício',
    planeta: 'Sol',
  },
  'Segunda-feira': {
    dia: 'Segunda-feira',
    dia_en: 'Monday',
    indice: 1,
    sephirah: 'Yesod',
    sephirah_he: 'יסוד',
    numero: 9,
    elemento: 'água',
    caminho: 24,
    significado_espiritual: 'Segunda-feira-Fundamento. Yesod é a Sephirah da fundação, da imaginação e da visão clairvoyante. A Lua (Yareach) rege este dia, amplificando a capacidade de perceber além do véu da matéria. Yesod conecta Malkuth (reino) com Tiphereth (beleza), sendo o canal através do qual a luz celestial desce ao mundo material.',
    misterio: 'O segredo da fundação invisível que sustenta todo o universo manifesto. Yesod é a lua psíquica que reflete a luz solar, revelando como a realidade aparente emerge das águas primitivas da existência.',
    energia: 'Energia receptiva e lunar. As águas de Yesod lavam as impurezas da consciência, permitindo que a visão clara emerja. É um dia para trabalho intuitivo, sonhos e práticas de limpeza energética.',
    praticas_espirituais: [
      'Meditação lunar com foco na fundação interior',
      'Trabalho com água para purificação e recharge',
      'Práticas de sonho lúcido e interpretação onírica',
      'Visualização das águas primitivas da criação',
      'Rituais de proteção do corpo de luz',
      'Conexão com o inconsciente profundo',
    ],
    qualidade: 'Fundação, Imaginação, Lua',
    planeta: 'Lua',
  },
  'Terça-feira': {
    dia: 'Terça-feira',
    dia_en: 'Tuesday',
    indice: 2,
    sephirah: 'Geburah',
    sephirah_he: 'גבורה',
    numero: 5,
    elemento: 'fogo',
    caminho: 19,
    significado_espiritual: 'Terça-feira-Força. Geburah é a Sephirah da força, do julgamento e da severidade Divina. Marte (Madim) rege este dia, canalizando energia de ação decisive e transmutação. Geburah representa a chama escarlate que corta, purifica e transforma, sendo necessária para quebrar correntes e destruir obstáculos.',
    misterio: 'O segredo da força que surge da limitation e do julgamento. Geburah ensina que a destruição criativa não é maldade, mas misericórdia disfrazada de severidade para acelerar a evolução da alma.',
    energia: 'Energia de transformação e corte. O fogo de Geburah Queima o desnecessário, criando espaço para o novo. É um dia para trabalhos de proteção, banimento e destruição de padrões limitantes.',
    praticas_espirituais: [
      'Meditação sobre a chama escarlate da purificação',
      'Rituais de proteção e banimento de energías negativas',
      'Visualização do julgamento divino como catalisador de crescimento',
      'Práticas de força interior e resiliência',
      'Trabalho com o vermelho para energizar a vontade',
      'Afirmações de coragem e determinação',
    ],
    qualidade: 'Força, Severidade, Transmutação',
    planeta: 'Marte',
  },
  'Quarta-feira': {
    dia: 'Quarta-feira',
    dia_en: 'Wednesday',
    indice: 3,
    sephirah: 'Hod',
    sephirah_he: 'הוד',
    numero: 8,
    elemento: 'água',
    caminho: 23,
    significado_espiritual: 'Quarta-feira-Glória. Hod é a Sephirah da glória, da comunicação e da compreensão intelectual. Mercúrio (Kokav) rege este dia, amplificando a capacidade de pensar, analisar e comunicar com clareza. Hod é o nível donde la mente se torna un instrumento da service espiritual.',
    misterio: 'O segredo da glória que emerge da comunicação perfeita. Hod representa o momento em que a verdade é falada com tal clareza que ilumina toda a escuridão, tornando o conhecimento acessível a todos.',
    energia: 'Energia de comunicação e análise. Hod permite traduzir experiências místicas em conceitos compreensíveis. É um dia para estudo, escritura, ensino e práticas de comunicação sagrada.',
    praticas_espirituais: [
      'Meditação sobre a luz mercurial da compreensão',
      'Estudo de textos sagrados e místicos',
      'Práticas de comunicação clara e	assertiva',
      'Trabalho com a escrita como ferramenta espiritual',
      'Visualização da energia mercurial fluindo pela mente',
      'Rituais de limpeza dos véus da percepção',
    ],
    qualidade: 'Glória, Comunicação, Entendimento',
    planeta: 'Mercúrio',
  },
  'Quinta-feira': {
    dia: 'Quinta-feira',
    dia_en: 'Thursday',
    indice: 4,
    sephirah: 'Chesed',
    sephirah_he: 'חסד',
    numero: 4,
    elemento: 'água',
    caminho: 18,
    significado_espiritual: 'Quinta-feira-Misericórdia. Chesed é a Sephirah da misericórdia infinita, da expansão e da compaixão Divina. Júpiter (Tzedek) rege este dia, canalizando energia de abundância espiritual e crescimento. Chesed é a Luz que se derrama sem medida, sustentando todas as formas de vida.',
    misterio: 'O segredo da misericórdia que cria espaço para o erro. Chesed ensina que a verdadeira grandeza está em dar sem expectativa, em perdoar mesmo quando o outro ainda não pediu, em expandir-se para incluir o que parece indigno.',
    energia: 'Energia de expansão e graça. O brilho jupiteriano de Chesed remove os limites do eu, abrindo espaço para a consciência se expandir. É um dia para práticas de generosidade, perdão e crescimento espiritual.',
    praticas_espirituais: [
      'Meditação sobre a luz infinita da misericórdia',
      'Práticas de generosidade sem expectativa de retorno',
      'Visualização da expansão da consciência além dos limites',
      'Rituais de cura para o cuerpo emocional',
      'Afirmações de abundância e possibilidades ilimitadas',
      'Trabalho com o azul para abrir o coração à graça',
    ],
    qualidade: 'Misericórdia, Abundância, Expansão',
    planeta: 'Júpiter',
  },
  'Sexta-feira': {
    dia: 'Sexta-feira',
    dia_en: 'Friday',
    indice: 5,
    sephirah: 'Netzach',
    sephirah_he: 'נצח',
    numero: 7,
    elemento: 'água',
    caminho: 22,
    significado_espiritual: 'Sexta-feira-Vitória. Netzach é a Sephirah da vitória, da emoção e da estética. Vênus (Nogah) rege este dia, amplificando a capacidade de sentir, apreciar e criar beleza. Netzach é o coração emocional da árvore, donde los sentimientos se transforman em impulso para a ação.',
    misterio: 'O segredo da vitória que nasce da apreciação do belo. Netzach ensina que a verdadeira conquista não vem da força, mas da capacidade de render-se ao fluxo da vida enquanto mantém o entusiasmo pelo caminho.',
    energia: 'Energia de conexão e apreciação. A luz venusiana de Netzach ilumina as qualidades que merecem ser celebradas na existência. É um dia para práticas de gratidão, expressão artística e harmonização de relaciones.',
    praticas_espirituais: [
      'Meditação sobre a beleza inherente em todo ser',
      'Práticas de gratidão e apreciação da vida',
      'Trabalho artístico como ferramenta espiritual',
      'Rituais de harmonização de relaciones',
      'Visualização da energia venusiana irradiando compaixão',
      'Afirmações de vitória e superação de obstáculos',
    ],
    qualidade: 'Vitória, Emoção, Beleza',
    planeta: 'Vênus',
  },
  'Sábado': {
    dia: 'Sábado',
    dia_en: 'Saturday',
    indice: 6,
    sephirah: 'Malkuth',
    sephirah_he: 'מלכות',
    numero: 10,
    elemento: 'terra',
    caminho: 32,
    significado_espiritual: 'Sábado-Reino. Malkuth é a Sephirah do reino, da manifestação e do mundo material. Saturno (Shabtai) rege este dia, canalizando energia debumildade, disciplina e trabalho terreno. Malkuth é a coroação da árvore, donde o divino se manifesta plenamente no mundo físico.',
    misterio: 'O segredo do divino que se manifesta no mundano. Malkuth ensina que o sagrado não está separado do mundo, mas habita em cada pedra, planta e pessoa. A matéria não é uma queda do espírito, mas sua expressão mais completa.',
    energia: 'Energia de manifestação e presença. A gravidade saturnina de Malkuth ancora a consciência no corpo e na terra. É um dia para práticas de oração, trabalho com o corpo físico e harmonização com a natureza.',
    praticas_espirituais: [
      'Meditação sobre a presença divina no mundo material',
      'Práticas de oração e contemplação em contato com a terra',
      'Trabalho com cristais e elementos da natureza',
      'Visualização da energia saturnina ancorando a consciência',
      'Rituais de consagração do espaço e dos alimentos',
      'Afirmações de sacralidade da existência cotidiana',
    ],
    qualidade: 'Reino, Manifestação, Humildade',
    planeta: 'Saturno',
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(DAY_SEPHIROT_MAP);
// Freeze nested objects
Object.values(DAY_SEPHIROT_MAP).forEach(mapping => Object.freeze(mapping));

/**
 * Get the day-Sephirot correlation mapping
 * @param dia - The day name in Portuguese (e.g., 'Domingo', 'Segunda-feira')
 * @returns The correlation mapping or undefined if not found
 */
export function getDaySephirot(dia: string): DaySephirot | undefined {
  return DAY_SEPHIROT_MAP[dia];
}

/**
 * Alias for getDaySephirot - Get the day-Sephirot correlation mapping
 * @param dia - The day name in Portuguese
 * @returns The correlation mapping or undefined if not found
 */
export function getSephirotByDay(dia: string): DaySephirot | undefined {
  return getDaySephirot(dia);
}

/**
 * Get the Sephirot-day correlation (reverse lookup)
 * @param sephirah - The name of the Sephirah (e.g., 'Tiphereth', 'Yesod')
 * @returns The correlation mapping or undefined if not found
 */
export function getSephirotDay(sephirah: string): DaySephirot | undefined {
  const found = Object.values(DAY_SEPHIROT_MAP).find(
    mapping => mapping.sephirah.toLowerCase() === sephirah.toLowerCase()
  );
  return found;
}

/**
 * Get all available day-Sephirot mappings
 * @returns Array of all correlation mappings
 */
export function getAllDaySephiroth(): DaySephirot[] {
  return Object.values(DAY_SEPHIROT_MAP);
}

/**
 * Alias for getAllDaySephiroth
 * @returns Array of all correlation mappings
 */
export function getAllDaySephiroths(): DaySephirot[] {
  return getAllDaySephiroth();
}

/**
 * Get all days of the week
 * @returns Array of day names in Portuguese
 */
export function getAllDays(): string[] {
  return Object.keys(DAY_SEPHIROT_MAP);
}

/**
 * Get days associated with a specific Sephirah
 * @param sephirah - The name of the Sephirah
 * @returns Array of day names associated with that Sephirah
 */
export function getDaysBySephirah(sephirah: string): string[] {
  const normalized = sephirah.toLowerCase();
  return Object.values(DAY_SEPHIROT_MAP)
    .filter(mapping => mapping.sephirah.toLowerCase() === normalized)
    .map(mapping => mapping.dia);
}

/**
 * Get element association for a specific day
 * @param dia - The day name in Portuguese
 * @returns Element or undefined if day not found
 */
export function getElementByDay(dia: string): Element | undefined {
  return DAY_SEPHIROT_MAP[dia]?.elemento;
}

/**
 * Get path number for a specific day
 * @param dia - The day name in Portuguese
 * @returns Path number or undefined if day not found
 */
export function getPathByDay(dia: string): PathNumber | undefined {
  return DAY_SEPHIROT_MAP[dia]?.caminho;
}

/**
 * Get spiritual practices for a specific day
 * @param dia - The day name in Portuguese
 * @returns Array of spiritual practices or undefined if day not found
 */
export function getDayPractices(dia: string): string[] | undefined {
  return DAY_SEPHIROT_MAP[dia]?.praticas_espirituais;
}

/**
 * Get the mystery/secret for a specific day
 * @param dia - The day name in Portuguese
 * @returns Mystery description or undefined if day not found
 */
export function getDayMystere(dia: string): string | undefined {
  return DAY_SEPHIROT_MAP[dia]?.misterio;
}

/**
 * Get the spiritual meaning for a specific day
 * @param dia - The day name in Portuguese
 * @returns Spiritual meaning or undefined if day not found
 */
export function getDaySpiritualMeaning(dia: string): string | undefined {
  return DAY_SEPHIROT_MAP[dia]?.significado_espiritual;
}

/**
 * Get the Sephirah name for a specific day
 * @param dia - The day name in Portuguese
 * @returns Sephirah name or undefined if day not found
 */
export function getSephirahByDay(dia: string): string | undefined {
  return DAY_SEPHIROT_MAP[dia]?.sephirah;
}

/**
 * Get the day associated with a specific Sephirah
 * @param sephirah - The name of the Sephirah
 * @returns Day name or undefined if not found
 */
export function getDayBySephirah(sephirah: string): string | undefined {
  const mapping = getSephirotDay(sephirah);
  return mapping?.dia;
}

/**
 * Get the energy description for a specific day
 * @param dia - The day name in Portuguese
 * @returns Energy description or undefined if day not found
 */
export function getDayEnergy(dia: string): string | undefined {
  return DAY_SEPHIROT_MAP[dia]?.energia;
}

/**
 * Default export with all functions
 */
export default {
  getDaySephirot,
  getSephirotByDay,
  getSephirotDay,
  getAllDaySephiroth,
  getAllDaySephiroths,
  getAllDays,
  getDaysBySephirah,
  getElementByDay,
  getPathByDay,
  getDayPractices,
  getDayMystere,
  getDaySpiritualMeaning,
  getSephirahByDay,
  getDayBySephirah,
  getDayEnergy,
};