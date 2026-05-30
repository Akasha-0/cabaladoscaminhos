/**
 * Moon-Chakra Spiritual Correlation Module
 * Maps the 8 lunar phases to their corresponding chakras, energy flows, and spiritual practices
 * Based on the rhythmic cycle of feminine energy and intuitive wisdom traditions
 */

export interface MoonChakra {
  /** Lunar phase name in Portuguese */
  fase: string;
  /** Primary chakra identifier (e.g., "1º Básico", "7º Coronário") */
  chakra: string;
  /** Chakra number (1-7) */
  chakra_numero: number;
  /** Sanskrit chakra name */
  chakra_sanskrito: string;
  /** Energy flow direction during this phase */
  fluxo_energetico: 'ascendente' | 'descendente' | 'centripeto' | 'centrifugo' | 'integrado';
  /** Primary spiritual practice for this phase */
  pratica_principal: string;
  /** List of recommended spiritual practices */
  praticas: string[];
  /** Intention focus for this phase */
  intencao: string;
  /** Element most aligned with this phase */
  elemento: string;
}

/**
 * Complete mapping of the 8 lunar phases to their corresponding chakras
 * Each phase activates specific energetic centers following the feminine lunar cycle
 * 
 * The cycle flows from grounding (Root) through creative expansion (Sacral)
 * to personal power (Solar), emotional illumination (Heart), authentic
 * expression (Throat), inner vision (Third Eye), transcendence (Crown),
 * and complete integration (All Chakras)
 */
export const MOON_CHAKRA_MAP: Record<string, MoonChakra> = {
  'lua-nova': {
    fase: 'Lua Nova',
    chakra: '1º Básico',
    chakra_numero: 1,
    chakra_sanskrito: 'Muladhara',
    fluxo_energetico: 'centripeto',
    pratica_principal: 'Meditação profunda e definição de intenções ocultas',
    praticas: [
      'Meditação de interiorização',
      'Definição de intenções secretas',
      'Trabalho com o inconsciente',
      'Conexão com a energia da terra',
      'Rituais de renovação das fundações',
    ],
    intencao: 'Renovar as bases e plantar sementes para o novo ciclo',
    elemento: 'terra',
  },
  'lua-crescente': {
    fase: 'Lua Crescente',
    chakra: '2º Sacro',
    chakra_numero: 2,
    chakra_sanskrito: 'Svadhisthana',
    fluxo_energetico: 'ascendente',
    pratica_principal: 'Rituais de abertura de caminhos e expansão criativa',
    praticas: [
      'Práticas de criatividade aumentada',
      'Rituais de abundância',
      'Trabalho com emoções e sentimentos',
      'Conexão com o desejo profundo',
      'Expansão da sensibilidade intuitiva',
    ],
    intencao: 'Expandir a consciência e abrir novos caminhos',
    elemento: 'água',
  },
  'quarto-crescente': {
    fase: 'Quarto Crescente',
    chakra: '3º Plexo Solar',
    chakra_numero: 3,
    chakra_sanskrito: 'Manipura',
    fluxo_energetico: 'ascendente',
    pratica_principal: 'Ação decisiva e ativação da força de vontade',
    praticas: [
      'Ações decididas e assertivas',
      'Quebra de obstáculos internos',
      'Ativação da coragem pessoal',
      'Práticas de poder pessoal',
      'Coragem para novos empreendimentos',
    ],
    intencao: 'Acionar a força de vontade e superar barreiras',
    elemento: 'fogo',
  },
  'lua-cheia': {
    fase: 'Lua Cheia',
    chakra: '4º Cardíaco',
    chakra_numero: 4,
    chakra_sanskrito: 'Anahata',
    fluxo_energetico: 'centrifugo',
    pratica_principal: 'Iluminação emocional e rituals de cura e perdão',
    praticas: [
      'Rituais de cura emocional',
      'Práticas de perdão genuíno',
      'Conexão com o amor incondicional',
      'Manifestação de desejos do coração',
      'Celebrações de gratidão',
    ],
    intencao: 'Iluminar as emoções e manifestar pelo coração',
    elemento: 'água',
  },
  'quarto-minguante': {
    fase: 'Quarto Minguante',
    chakra: '5º Laríngeo',
    chakra_numero: 5,
    chakra_sanskrito: 'Vishuddha',
    fluxo_energetico: 'descendente',
    pratica_principal: 'Comunicação da verdade e expressão autêntica',
    praticas: [
      'Expressão autêntica da verdade',
      'Comunicação com ancestrais',
      'Trabalhos com o sangue (ancestralidade)',
      'Purificação da voz interior',
      'Liberação da expressão criativa',
    ],
    intencao: 'Expressar verdades profundas e purificar a comunicação',
    elemento: 'éter',
  },
  'lua-minguante': {
    fase: 'Lua Minguante',
    chakra: '6º Frontal',
    chakra_numero: 6,
    chakra_sanskrito: 'Ajna',
    fluxo_energetico: 'descendente',
    pratica_principal: 'Discernimento interior e equilíbrio de opostos',
    praticas: [
      'Práticas de visão interior',
      'Meditação sobre dualidades',
      'Equilíbrio entre extremos',
      'Trabalho com ilusões e maya',
      'Desenvolvimento do terceiro olho',
    ],
    intencao: 'Desenvolver clareza interior e equilíbrio através do discernimento',
    elemento: 'ar',
  },
  'quarto-descrescente': {
    fase: 'Quarto Descrescente',
    chakra: '7º Coronário',
    chakra_numero: 7,
    chakra_sanskrito: 'Sahasrara',
    fluxo_energetico: 'descendente',
    pratica_principal: 'Libertação de dogmas e visão ampliada da humanidade',
    praticas: [
      'Meditação de transcendência',
      'Liberação de crenças limitantes',
      'Conexão com a sabedoria universal',
      'Práticas de desapego espiritual',
      'Preparação para novo paradigma',
    ],
    intencao: 'Libertar-se das formas e abrir-se para a sabedoria cósmica',
    elemento: 'luz',
  },
  'lua-velha': {
    fase: 'Lua Velha (Balsâmica)',
    chakra: 'Integração de Todos os Chakras',
    chakra_numero: 0,
    chakra_sanskrito: 'Samhara',
    fluxo_energetico: 'integrado',
    pratica_principal: 'Purificação completa e recolhimento para renascimento',
    praticas: [
      'Purificação interior total',
      'Análise e dissolução de padrões',
      'Perfeccionamento espiritual',
      'Recolhimento meditativo profundo',
      'Preparação consciente para o novo ciclo',
    ],
    intencao: 'Purificar completamente e preparar-se para o renascimento',
    elemento: 'espírito',
  },
};

/**
 * Get the moon-chakra correlation for a given lunar phase
 * @param fase - The lunar phase identifier (slug format: lua-nova, lua-crescente, etc.)
 * @returns The MoonChakra mapping or null if phase not found
 */
export function getMoonChakra(fase: string): MoonChakra | null {
  const normalizedFase = fase.toLowerCase().trim();
  return MOON_CHAKRA_MAP[normalizedFase] ?? null;
}

/**
 * Get the chakra name for a given lunar phase
 * @param fase - The lunar phase identifier
 * @returns The chakra name or null if not found
 */
export function getChakraMoon(fase: string): string | null {
  const normalizedFase = fase.toLowerCase().trim();
  return MOON_CHAKRA_MAP[normalizedFase]?.chakra ?? null;
}

/**
 * Get all moon-chakra mappings
 * @returns Array of all MoonChakra mappings
 */
export function getAllMoonChakras(): MoonChakra[] {
  return Object.values(MOON_CHAKRA_MAP);
}

/**
 * Get the energy flow direction for a given lunar phase
 * @param fase - The lunar phase identifier
 * @returns The energy flow or null if not found
 */
export function getEnergyFlowMoon(fase: string): MoonChakra['fluxo_energetico'] | null {
  const normalizedFase = fase.toLowerCase().trim();
  return MOON_CHAKRA_MAP[normalizedFase]?.fluxo_energetico ?? null;
}

/**
 * Get the primary spiritual practice for a given lunar phase
 * @param fase - The lunar phase identifier
 * @returns The primary practice or null if not found
 */
export function getPracticeMoon(fase: string): string | null {
  const normalizedFase = fase.toLowerCase().trim();
  return MOON_CHAKRA_MAP[normalizedFase]?.pratica_principal ?? null;
}

/**
 * Get all phases that align with a specific chakra number
 * @param chakraNumero - Chakra number (1-7) or 0 for integration
 * @returns Array of MoonChakra mappings
 */
export function getMoonPhasesByChakra(chakraNumero: number): MoonChakra[] {
  return Object.values(MOON_CHAKRA_MAP).filter(
    (mapping) => mapping.chakra_numero === chakraNumero
  );
}

/**
 * Get the intention focus for a given lunar phase
 * @param fase - The lunar phase identifier
 * @returns The intention or null if not found
 */
export function getIntentionMoon(fase: string): string | null {
  const normalizedFase = fase.toLowerCase().trim();
  return MOON_CHAKRA_MAP[normalizedFase]?.intencao ?? null;
}

/**
 * Get all phases that have a specific energy flow direction
 * @param fluxo - Energy flow direction
 * @returns Array of MoonChakra mappings
 */
export function getMoonPhasesByEnergyFlow(
  fluxo: MoonChakra['fluxo_energetico']
): MoonChakra[] {
  return Object.values(MOON_CHAKRA_MAP).filter(
    (mapping) => mapping.fluxo_energetico === fluxo
  );
}

/**
 * Get the element aligned with a given lunar phase
 * @param fase - The lunar phase identifier
 * @returns The element or null if not found
 */
export function getElementMoon(fase: string): string | null {
  const normalizedFase = fase.toLowerCase().trim();
  return MOON_CHAKRA_MAP[normalizedFase]?.elemento ?? null;
}