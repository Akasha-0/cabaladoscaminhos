/**
 * Moon-Planet Spiritual Correlation Module
 * Maps the 8 lunar phases to their corresponding planets, elemental connections,
 * and spiritual meanings following traditional astrological and mystical wisdom
 */

export type Planeta = 
  | 'Sol' 
  | 'Lua' 
  | 'Mercúrio' 
  | 'Vênus' 
  | 'Marte' 
  | 'Júpiter' 
  | 'Saturno' 
  | 'Netuno' 
  | 'Plutão';

export type FaseLua = 
  | 'lua-nova'
  | 'lua-crescente'
  | 'quarto-crescente'
  | 'lua-cheia'
  | 'quarto-minguante'
  | 'lua-minguante'
  | 'quarto-descrescente'
  | 'lua-velha';

export interface MoonPlanetMapping {
  /** Lunar phase name in Portuguese */
  fase: string;
  /** Associated planet */
  planeta: Planeta;
  /** Planet name in Portuguese */
  planeta_nome: string;
  /** Primary element connection */
  elemento: string;
  /** Secondary elements */
  elementos_secundarios: string[];
  /** Spiritual meaning */
  significado_espiritual: string;
  /** Key spiritual qualities */
  qualidades: string[];
  /** Recommended spiritual practices */
  praticas: string[];
  /** Orixá correspondent */
  orixa: string;
  /** Chakra alignment */
  chakra: string;
  /** Energy polarity */
  polaridade: 'Yang' | 'Yin' | 'Equilibrado';
  /** Energy flow direction */
  fluxo_energetico: 'ascendente' | 'descendente' | 'centripeto' | 'centrifugo' | 'integrado';
  /** Sabat correspondence (Wiccan) */
  sabat?: string;
  /** Color correspondence */
  cor: string;
}

/**
 * Complete mapping of the 8 lunar phases to their corresponding planets
 * Following traditional astrological and mystical correspondences:
 * 
 * - Lua Nova (Plutão): New beginnings, transformation, rebirth
 * - Lua Crescente (Vênus): Growth, attraction, love
 * - Quarto Crescente (Júpiter): expansion, confidence, action
 * - Lua Cheia (Lua): Culmination, illumination, clarity
 * - Quarto Minguante (Saturno): Release, discipline, wisdom
 * - Lua Minguante (Mercúrio): Introspection, inner communication
 * - Quarto Descrescente (Marte): Determination, courage, transformation
 * - Lua Velha (Sol): Completion, integration, wisdom
 */
export const MOON_PLANET_MAP: Record<FaseLua, MoonPlanetMapping> = {
  'lua-nova': {
    fase: 'Lua Nova',
    planeta: 'Plutão',
    planeta_nome: 'Plutão',
    elemento: 'água',
    elementos_secundarios: ['éter', 'fogo'],
    significado_espiritual: 'Renascer das cinzas, transformação profunda, morte e renascimento simbólico. Momento de plantar sementes ocultas para o novo ciclo.',
    qualidades: ['transformação', 'renascimento', 'rebirth', 'regeneração', 'ocultismo', 'profundidade'],
    praticas: [
      'Meditação de interiorização profunda',
      'Rituais de novos começos',
      'Definição de intenções secretas',
      'Trabalho com o inconsciente',
      'Purificação de velhos padrões',
      'Rituais de regeneração pessoal'
    ],
    orixa: 'Oxumaré',
    chakra: '1º Básico (Muladhara)',
    polaridade: 'Yin',
    fluxo_energetico: 'centripeto',
    cor: 'preto',
 },
  'lua-crescente': {
    fase: 'Lua Crescente',
    planeta: 'Vênus',
    planeta_nome: 'Vênus',
    elemento: 'água',
    elementos_secundarios: ['terra'],
    significado_espiritual: 'Crescimento gradual da energia, amor que se expande, atração e magnetismo. Período de fertilidade espiritual e abundância.',
    qualidades: ['amor', 'beleza', 'abundância', 'atração', 'fertilidade', 'gracejo'],
    praticas: [
      'Rituais de abundância',
      'Práticas de amor próprio',
      'Trabalho com o desejo profundo',
      'Manifestação de sonhos',
      'Conexão com a energia criativa',
      'Práticas de gratidão amorosa'
    ],
    orixa: 'Oxum',
    chakra: '2º Sacro (Svadhisthana)',
    polaridade: 'Yang',
    fluxo_energetico: 'ascendente',
    cor: 'prata',
  },
  'quarto-crescente': {
    fase: 'Quarto Crescente',
    planeta: 'Júpiter',
    planeta_nome: 'Júpiter',
    elemento: 'fogo',
    elementos_secundarios: ['ar'],
    significado_espiritual: 'Expansão da consciência,开门 de caminhos, ação decisiva. Momento de grande energia para superar obstáculos e avançar.',
    qualidades: ['expansão', 'otimismo', 'confiança', 'abundância', 'sabedoria', '开门'],
    praticas: [
      'Ações decididas e assertivas',
      'Rituais de开门 de caminhos',
      'Práticas de confiança pessoal',
      'Visualização criativa',
      'Trabalho com metas e propósitos',
      'Práticas de expansão da consciência'
    ],
    orixa: 'Oxóssi',
    chakra: '3º Plexo Solar (Manipura)',
    polaridade: 'Yang',
    fluxo_energetico: 'ascendente',
    cor: 'azul',
  },
  'lua-cheia': {
    fase: 'Lua Cheia',
    planeta: 'Lua',
    planeta_nome: 'Lua',
    elemento: 'água',
    elementos_secundarios: ['éter'],
    significado_espiritual: 'Culminação máxima da energia lunar, iluminação emocional, revelação de verdades ocultas. Momento de máxima força intuitiva.',
    qualidades: ['intuição', 'clareza', 'iluminação', 'culminação', 'revelação', 'maternidade'],
    praticas: [
      'Rituais de cura emocional',
      'Práticas de perdão genuíno',
      'Manifestação de desejos do coração',
      'Meditação à luz da lua',
      'Conexão com o inconsciente',
      'Celebrações de gratidão'
    ],
    orixa: 'Iemanjá',
    chakra: '4º Cardíaco (Anahata)',
    polaridade: 'Equilibrado',
    fluxo_energetico: 'centrifugo',
    cor: 'branco',
 },
  'quarto-minguante': {
    fase: 'Quarto Minguante',
    planeta: 'Saturno',
    planeta_nome: 'Saturno',
    elemento: 'éter',
    elementos_secundarios: ['terra', 'água'],
    significado_espiritual: 'Liberação de padrões obsoletos, disciplina sagrada, purificação através do esforço. Momento de confronto com a verdade.',
    qualidades: ['disciplina', 'liberação', 'sabedoria', 'responsabilidade', 'purificação', 'maturidade'],
    praticas: [
      'Rituais de liberação de padrões',
      'Práticas de disciplina espiritual',
      'Trabalho com ancestrais',
      'Comunicação com o sangue',
      'Purificação de velhas crenças',
      'Práticas de accountability'
    ],
    orixa: 'Xangô',
    chakra: '5º Laríngeo (Vishuddha)',
    polaridade: 'Yin',
    fluxo_energetico: 'descendente',
    cor: 'cinza',
  },
  'lua-minguante': {
    fase: 'Lua Minguante',
    planeta: 'Mercúrio',
    planeta_nome: 'Mercúrio',
    elemento: 'ar',
    elementos_secundarios: ['água'],
    significado_espiritual: 'Discernimento interior, comunicação com o eu profundo, equilíbrio de opostos. Momento de análise e processamento interno.',
    qualidades: ['discernimento', 'introspecção', 'comunicação interior', 'equilíbrio', 'percepção', 'versatilidade'],
    praticas: [
      'Práticas de visão interior',
      'Meditação sobre dualidades',
      'Trabalho com ilusões e maya',
      'Desenvolvimento do terceiro olho',
      'Escrita automática ou journaling',
      'Práticas de autoconhecimento'
    ],
    orixa: 'Nanã',
    chakra: '6º Frontal (Ajna)',
    polaridade: 'Yin',
    fluxo_energetico: 'descendente',
    cor: 'roxo',
  },
  'quarto-descrescente': {
    fase: 'Quarto Descrescente',
    planeta: 'Marte',
    planeta_nome: 'Marte',
    elemento: 'fogo',
    elementos_secundarios: ['éter'],
    significado_espiritual: 'Determinação e coragem para a transformação final, ação transformadora. Momento de confronto e superação de medos.',
    qualidades: ['coragem', 'determinação', 'ação', 'força', 'transformação', 'confronto'],
    praticas: [
      'Práticas de coragem e força',
      'Rituais de proteção',
      'Trabalho com medos e bloqueios',
      'Ações decisivas de fechamento',
      'Práticas de poder pessoal',
      'Meditação de confronto interior'
    ],
    orixa: 'Ogum',
    chakra: '7º Coronário (Sahasrara)',
    polaridade: 'Yang',
    fluxo_energetico: 'descendente',
    cor: 'vermelho',
  },
  'lua-velha': {
    fase: 'Lua Velha (Balsâmica)',
    planeta: 'Sol',
    planeta_nome: 'Sol',
    elemento: 'fogo',
    elementos_secundarios: ['luz'],
    significado_espiritual: 'Completude do ciclo, integração da sabedoria conquistada, preparo para o renascimento. Momento de reflexão profunda e preparo.',
    qualidades: ['sabedoria', 'integração', 'completude', 'preparação', 'transcendência', 'renascimento'],
    praticas: [
      'Purificação interior total',
      'Análise e dissolução de padrões',
      'Perfeccionamento espiritual',
      'Recolhimento meditativo profundo',
      'Integração de lições do ciclo',
      'Preparação consciente para o novo'
    ],
    orixa: 'Omulu',
    chakra: 'Integração de Todos os Chakras',
    polaridade: 'Equilibrado',
    fluxo_energetico: 'integrado',
    cor: 'dourado',
  },
};

/**
 * Get the moon-planet correlation for a given lunar phase
 * @param fase - The lunar phase identifier (slug format: lua-nova, lua-crescente, etc.)
 * @returns The MoonPlanetMapping or null if phase not found
 */
export function getMoonPlanet(fase: string): MoonPlanetMapping | null {
  const normalizedFase = fase.toLowerCase().trim();
  return MOON_PLANET_MAP[normalizedFase as FaseLua] ?? null;
}

/**
 * Get the planet name for a given lunar phase
 * @param fase - The lunar phase identifier
 * @returns The planet name or null if not found
 */
export function getPlanetMoon(fase: string): Planeta | null {
  const mapping = getMoonPlanet(fase);
  return mapping?.planeta ?? null;
}

/**
 * Get all moon-planet mappings
 * @returns Array of all MoonPlanetMapping
 */
export function getAllMoonPlanets(): MoonPlanetMapping[] {
  return Object.values(MOON_PLANET_MAP);
}

/**
 * Get the element connection for a given lunar phase
 * @param fase - The lunar phase identifier
 * @returns The primary element or null if not found
 */
export function getElementMoonPlanet(fase: string): string | null {
  const mapping = getMoonPlanet(fase);
  return mapping?.elemento ?? null;
}

/**
 * Get the spiritual meaning for a given lunar phase
 * @param fase - The lunar phase identifier
 * @returns The spiritual meaning or null if not found
 */
export function getMeaningMoonPlanet(fase: string): string | null {
  const mapping = getMoonPlanet(fase);
  return mapping?.significado_espiritual ?? null;
}

/**
 * Get the polarity for a given lunar phase
 * @param fase - The lunar phase identifier
 * @returns The polarity or null if not found
 */
export function getPolarityMoonPlanet(fase: string): 'Yang' | 'Yin' | 'Equilibrado' | null {
  const mapping = getMoonPlanet(fase);
  return mapping?.polaridade ?? null;
}

/**
 * Get the energy flow for a given lunar phase
 * @param fase - The lunar phase identifier
 * @returns The energy flow or null if not found
 */
export function getEnergyFlowMoonPlanet(fase: string): MoonPlanetMapping['fluxo_energetico'] | null {
  const mapping = getMoonPlanet(fase);
  return mapping?.fluxo_energetico ?? null;
}

/**
 * Get all phases that align with a specific planet
 * @param planeta - Planet name
 * @returns Array of MoonPlanetMapping
 */
export function getMoonPhasesByPlanet(planeta: string): MoonPlanetMapping[] {
  return Object.values(MOON_PLANET_MAP).filter(
    mapping => mapping.planeta.toLowerCase() === planeta.toLowerCase()
  );
}

/**
 * Get all phases that align with a specific element
 * @param elemento - Element name
 * @returns Array of MoonPlanetMapping
 */
export function getMoonPhasesByElement(elemento: string): MoonPlanetMapping[] {
  return Object.values(MOON_PLANET_MAP).filter(
    mapping => mapping.elemento.toLowerCase() === elemento.toLowerCase()
  );
}

/**
 * Get the Orixá for a given lunar phase
 * @param fase - The lunar phase identifier
 * @returns The Orixá or null if not found
 */
export function getOrixaMoonPlanet(fase: string): string | null {
  const mapping = getMoonPlanet(fase);
  return mapping?.orixa ?? null;
}

/**
 * Get the chakra for a given lunar phase
 * @param fase - The lunar phase identifier
 * @returns The chakra or null if not found
 */
export function getChakraMoonPlanet(fase: string): string | null {
  const mapping = getMoonPlanet(fase);
  return mapping?.chakra ?? null;
}

/**
 * Get the color for a given lunar phase
 * @param fase - The lunar phase identifier
 * @returns The color or null if not found
 */
export function getColorMoonPlanet(fase: string): string | null {
  const mapping = getMoonPlanet(fase);
  return mapping?.cor ?? null;
}
