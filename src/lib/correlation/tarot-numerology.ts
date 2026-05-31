/**
 * Element type for spiritual correlations
 */
export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

/**
 * Tarot Arcana-Numerology Spiritual Correlation
 * Maps Major Arcana cards to their corresponding numerology numbers,
 * spiritual meanings, and cross-system connections.
 * 
 * Based on the esoteric correspondence between Tarot archetypes
 * and Pythagorean numerology principles.
 */

/**
 * Represents the correlation between a Tarot arcano and its numerology number
 */
export interface TarotNumerologyMapping {
  /** The Major Arcana arcano name */
  arcano: string;
  /** Card number in the Major Arcana sequence (0-21) */
  numero_carta: number;
  /** Pythagorean numerology number (1-9, or master numbers 11, 22, 33) */
  numero: number;
  /** Elemental association */
  elemento: Elemento;
  /** Full spiritual meaning and symbolism */
  significado_espiritual: string;
  /** Archetype represented by this arcano */
  arquétipo: string;
  /** Associated Orixá from Candomblé tradition */
  orixá: string;
  /** Associated Kabbalistic Sephirah */
  sephirah: string;
  /** Chakra alignment */
  chakra: string;
  /** Key spiritual lesson */
  lição_espiritual: string;
  /** Affirmation for meditation */
  afirmação: string;
}

// ─── Major Arcana to Numerology Mapping ─────────────────────────────────────

/**
 * Complete mapping of Major Arcana cards to their numerology correspondences.
 * Each card carries a specific vibrational frequency that resonates with
 * a numerology number and its spiritual lessons.
 */
export const TAROT_NUMEROLOGIA_MAP: Record<string, TarotNumerologyMapping> = {
  'O Louco': {
    arcano: 'O Louco',
    numero_carta: 0,
    numero: 22,
    elemento: 'Ar',
    significado_espiritual: 'O salto de fé que transcende a razão. A liberdade absoluta que vem do abandono do medo. O início sagrado de toda jornada espiritual.',
    arquétipo: 'O Viajante / O Inocente',
    orixá: 'Logun-Edé / Oxumaré',
    sephirah: 'Daath',
    chakra: '7º Coronário',
    lição_espiritual: 'Confie no processo. O abismo que você teme é na verdade o trampolim para sua libertação.',
    afirmação: 'Eu salto com fé, confiando que o universo me sustenta em cada momento da minha jornada.',
  },
  'O Mago': {
    arcano: 'O Mago',
    numero_carta: 1,
    numero: 1,
    elemento: 'Água',
    significado_espiritual: 'O poder de manifestar através da vontade e intenção. A centelha divina que conecta o céu e a terra.',
    arquétipo: 'O Mago / O Criador',
    orixá: 'Exu / Okaran',
    sephirah: 'Kether',
    chakra: '3º Plexo Solar',
    lição_espiritual: 'Você possui todo o poder necessário para manifestar seus desejos.',
    afirmação: 'Eu sou capaz de manifestar minha realidade através da minha vontade sagrada.',
  },
  'A Alta Sacerdotisa': {
    arcano: 'A Alta Sacerdotisa',
    numero_carta: 2,
    numero: 2,
    elemento: 'Terra',
    significado_espiritual: 'A sabedoria intuitiva que habita no silêncio. O véu entre os mundos visível e invisível.',
    arquétipo: 'A Sacerdotisa / A Guardiã dos Mistérios',
    orixá: 'Ibeji / Ejiokô',
    sephirah: 'Chokmah',
    chakra: '6º Frontal',
    lição_espiritual: 'Confie na sua intuição e na sabedoria que vem do silêncio interior.',
    afirmação: 'Eu escuto a voz da minha alma e confio nos mistérios do universo.',
  },
  'A Imperatriz': {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    numero: 3,
    elemento: 'Terra',
    significado_espiritual: 'A fertilidade criativa em todas as suas formas. A abundância natural que flui da conexão com a natureza.',
    arquétipo: 'A Mãe Divina / A Criadora',
    orixá: 'Iemanjá / Irosun',
    sephirah: 'Binah',
    chakra: '4º Cardíaco',
    lição_espiritual: 'A abundância é seu direito de nascença quando você se conecta com a energia criativa do universo.',
    afirmação: 'Eu nutro minha essência criativa e permito que a abundância flua naturalmente.',
  },
  'O Imperador': {
    arcano: 'O Imperador',
    numero_carta: 4,
    numero: 4,
    elemento: 'Fogo',
    significado_espiritual: 'A autoridade sagrada que estabelece ordem no caos. A disciplina e a estrutura que sustentam a realização.',
    arquétipo: 'O Pai / O Governante',
    orixá: 'Ogum / Etaogundá',
    sephirah: 'Chesed',
    chakra: '1º Básico',
    lição_espiritual: 'A verdadeira autoridade vem do domínio de si mesmo e da criação de estruturas que servem ao bem maior.',
    afirmação: 'Eu establezco ordem em minha vida com sabedoria e disciplina sagrada.',
  },
  'O Hierofante': {
    arcano: 'O Hierofante',
    numero_carta: 5,
    numero: 5,
    elemento: 'Fogo',
    significado_espiritual: 'O mestre espiritual e a tradição sagrada. A ponte entre o conhecimento humano e divino.',
    arquétipo: 'O Sacerdote / O Mestre Espiritual',
    orixá: 'Oxum / Oxé',
    sephirah: 'Geburah',
    chakra: '5º Laríngeo',
    lição_espiritual: 'A sabedoria dos mestres ancestrais aguarda sua busca.',
    afirmação: 'Eu busco a sabedoria sagrada e abro meu coração para os ensinamentos dos mestres.',
  },
  'Os Enamorados': {
    arcano: 'Os Enamorados',
    numero_carta: 6,
    numero: 6,
    elemento: 'Ar',
    significado_espiritual: 'A união das polaridades e a escolha do coração. O amor que transcende o eu individual.',
    arquétipo: 'O Amante / A União Sagrada',
    orixá: 'Oxumaré / Oxumarim',
    sephirah: 'Tiphereth',
    chakra: '4º Cardíaco',
    lição_espiritual: 'O amor verdadeiro requer escolha consciente.',
    afirmação: 'Eu escolho o amor que me eleva e une minhas polaridades em harmonia sagrada.',
  },
  'O Carro': {
    arcano: 'O Carro',
    numero_carta: 7,
    numero: 7,
    elemento: 'Água',
    significado_espiritual: 'A vitória conquistada através da vontade focada e do equilíbrio das forças opostas.',
    arquétipo: 'O Guerreiro / O Vitorioso',
    orixá: 'Xangô / Obará',
    sephirah: 'Netzach',
    chakra: '3º Plexo Solar',
    lição_espiritual: 'O sucesso vem da harmonia entre ação decisiva e receptividade paciente.',
    afirmação: 'Eu avanço em direção aos meus objetivos com determinação e equilíbrio interior.',
  },
  'A Justiça': {
    arcano: 'A Justiça',
    numero_carta: 8,
    numero: 8,
    elemento: 'Ar',
    significado_espiritual: 'A lei cósmica de causa e efeito. O equilíbrio karma que governa todas as ações.',
    arquétipo: 'A Justiça / O Juiz Cósmico',
    orixá: 'Oxalá / EjiOníle',
    sephirah: 'Hod',
    chakra: '4º Cardíaco',
    lição_espiritual: 'Suas ações têm consequências inevitáveis. Escolha sabiamente para semear o que deseja colher.',
    afirmação: 'Eu ajo com integridade, conhecendo que a justiça cósmica equilibra todas as minhas escolhas.',
  },
  'O Eremita': {
    arcano: 'O Eremita',
    numero_carta: 9,
    numero: 9,
    elemento: 'Terra',
    significado_espiritual: 'A sabedoria conquistada na solidão sagrada. A luz interior que brilha para o mundo.',
    arquétipo: 'O Sábio / O Iluminado',
    orixá: 'Nanã / Omolu / Olobón',
    sephirah: 'Yesod',
    chakra: '6º Frontal',
    lição_espiritual: 'Na quietude da alma, a luz da verdade se revela.',
    afirmação: 'Eu ilumino meu caminho com a sabedoria da alma, compartilhando luz com todos que encontre.',
  },
  'A Roda da Fortuna': {
    arcano: 'A Roda da Fortuna',
    numero_carta: 10,
    numero: 1,
    elemento: 'Fogo',
    significado_espiritual: 'O ciclo eterno do destino e a lei de movimento perpetuo.',
    arquétipo: 'O Destino / O Ciclo',
    orixá: 'Obá / Etaobá',
    sephirah: 'Hod',
    chakra: '3º Plexo Solar',
    lição_espiritual: 'O destino gira em seu favor quando você se alinha com o fluxo natural da vida.',
    afirmação: 'Eu aceito os ciclos da vida e navego com sabedoria as mudanças do destino.',
  },
  'A Força': {
    arcano: 'A Força',
    numero_carta: 11,
    numero: 11,
    elemento: 'Terra',
    significado_espiritual: 'O poder da alma que doma os instintos animais. A coragem que não conhece medo.',
    arquétipo: 'O Guerreiro Espiritual / A Força Divina',
    orixá: 'Ibeji / Ejiokô',
    sephirah: 'Tiphereth',
    chakra: '2º Sacral',
    lição_espiritual: 'A verdadeira força está na gentileza.',
    afirmação: 'Eu possuo a força da minha alma que transforma o medo em coragem e a escuridão em luz.',
  },
  'O Enforcado': {
    arcano: 'O Enforcado',
    numero_carta: 12,
    numero: 2,
    elemento: 'Água',
    significado_espiritual: 'A pausa sagrada que permite uma nova perspectiva.',
    arquétipo: 'O Martir / O Sacrificado',
    orixá: 'Omolu / Obaluaiê / Odará',
    sephirah: 'Geburah',
    chakra: '6º Frontal',
    lição_espiritual: 'Às vezes, para avançar, você precisa parar.',
    afirmação: 'Eu libero a necessidade de controlar e aceito que a pausa é parte da jornada.',
  },
  'A Morte': {
    arcano: 'A Morte',
    numero_carta: 13,
    numero: 4,
    elemento: 'Terra',
    significado_espiritual: 'A transformação inevitável e o fim de tudo que não serve mais.',
    arquétipo: 'O Transformador / A Fênix',
    orixá: 'Nanã / Omolu',
    sephirah: 'Tiphereth',
    chakra: '2º Sacral',
    lição_espiritual: 'A morte é apenas o início disfarçado.',
    afirmação: 'Eu libero o que precisa morrer em minha vida, confiando que a transformação me renova.',
  },
  'A Temperança': {
    arcano: 'A Temperança',
    numero_carta: 14,
    numero: 5,
    elemento: 'Fogo',
    significado_espiritual: 'O equilíbrio entre extremos e a integração das polaridades.',
    arquétipo: 'O Equilibrador / O Alquimista',
    orixá: 'Oxum / Oxé',
    sephirah: 'Netzach',
    chakra: '4º Cardíaco',
    lição_espiritual: 'O meio caminho não é mediocridade, é sabedoria.',
    afirmação: 'Eu encontro o ponto de equilíbrio entre minhas polaridades e permito que a harmonia me guie.',
  },
  'O Diabo': {
    arcano: 'O Diabo',
    numero_carta: 15,
    numero: 6,
    elemento: 'Terra',
    significado_espiritual: 'A sombra que nos prende aos ciclos de auto-destruição.',
    arquétipo: 'O Prisioneiro / O Iludido',
    orixá: 'Exu / Logun-Edé',
    sephirah: 'Yesod',
    chakra: '1º Básico',
    lição_espiritual: 'As correntes que você carrega são feitas apenas do medo que você alimenta. Quebre-as.',
    afirmação: 'Eu sou livre de todas as correntes que não servem à minha alma. Meu poder é maior que qualquer sombra.',
  },
  'A Torre': {
    arcano: 'A Torre',
    numero_carta: 16,
    numero: 7,
    elemento: 'Fogo',
    significado_espiritual: 'A destruição das ilusões e a queda dos edifícios falsos.',
    arquétipo: 'O Destruidor / O Libertador',
    orixá: 'Xangô / Ogum',
    sephirah: 'Geburah',
    chakra: '7º Coronário',
    lição_espiritual: 'A Torre precisa cair para que o Phoenix possa nascer.',
    afirmação: 'Eu aceito que a velha estrutura precisa ruir para que algo novo e verdadeiro possa nascer.',
  },
  'A Estrela': {
    arcano: 'A Estrela',
    numero_carta: 17,
    numero: 8,
    elemento: 'Ar',
    significado_espiritual: 'A esperança que renasce das cinzas. A luz que guia os náufragos da noite.',
    arquétipo: 'O Illuminado / A Esperança',
    orixá: 'Oxum / Iemanjá',
    sephirah: 'Chesed',
    chakra: '5º Laríngeo',
    lição_espiritual: 'Depois da noite mais escura, a estrela mais brilhante aparece.',
    afirmação: 'Eu sou a estrela que guia minha própria jornada. Minha luz ilumina o caminho para outros.',
  },
  'A Lua': {
    arcano: 'A Lua',
    numero_carta: 18,
    numero: 9,
    elemento: 'Água',
    significado_espiritual: 'O reino das sombras e da ilusão. O mundo onírico que reflete verdades escondidas.',
    arquétipo: 'O Sonhador / A Viajante Noturna',
    orixá: 'Iemanjá / Nanã',
    sephirah: 'Yesod',
    chakra: '6º Frontal',
    lição_espiritual: 'Na escuridão da lua, os seus medos são apenas fantasmas.',
    afirmação: 'Eu navego pelas águas da minha emoção com clareza, reconhecendo que as sombras são apenas ilusões.',
  },
  'O Sol': {
    arcano: 'O Sol',
    numero_carta: 19,
    numero: 1,
    elemento: 'Fogo',
    significado_espiritual: 'A luz que ilumina toda escuridão. A criança radiante que não conhece cynismo.',
    arquétipo: 'O Iluminado / A Criança Divina',
    orixá: 'Oxalá / Logun-Edé',
    sephirah: 'Kether',
    chakra: '7º Coronário',
    lição_espiritual: 'A luz do sol não precisa lutar para brilhar.',
    afirmação: 'Eu brinco com a luz do sol que é minha herança Divina. Minha alegria é minha verdade.',
  },
  'O Julgamento': {
    arcano: 'O Julgamento',
    numero_carta: 20,
    numero: 2,
    elemento: 'Fogo',
    significado_espiritual: 'O chamado da alma para despertar. A trombeta que convida todos à ressurreição.',
    arquétipo: 'O Arcanjo / O Resurrecto',
    orixá: 'Obatalá / Oxalá',
    sephirah: 'Chokmah',
    chakra: '7º Coronário',
    lição_espiritual: 'O chamado já soou. Responda ao despertar da sua alma.',
    afirmação: 'Eu respondo ao chamado da minha alma e me alinho com meu propósito Divino.',
  },
  'O Mundo': {
    arcano: 'O Mundo',
    numero_carta: 21,
    numero: 3,
    elemento: 'Terra',
    significado_espiritual: 'A completude e a realização de uma era. O fim do ciclo que é também um novo começo.',
    arquétipo: 'O Realizado / O Cosmo',
    orixá: 'Iemanjá / Oxum',
    sephirah: 'Binah',
    chakra: '4º Cardíaco',
    lição_espiritual: 'O fim de um ciclo é o começo de outro.',
    afirmação: 'Eu celebro minha completude e abro as portas para uma nova jornada de crescimento.',
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(TAROT_NUMEROLOGIA_MAP);
Object.values(TAROT_NUMEROLOGIA_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * Returns the numerology correlation for a given Tarot arcano
 * @param arcano - The arcano name (e.g., 'O Mago', 'A Imperatriz')
 * @returns TarotNumerologyMapping object with all correlations
 * @throws Error if arcano is not found in the mapping
 */
export function getTarotNumerology(arcano: string): TarotNumerologyMapping {
  const normalized = arcano.trim();
  const mapping = TAROT_NUMEROLOGIA_MAP[normalized];
  
  if (!mapping) {
    throw new Error(`Arcano não encontrado no mapeamento: "${arcano}". Verifique o nome do arcano.`);
  }
  
  return mapping;
}

/**
 * Get the arcano name corresponding to a numerology number
 * @param numero - The numerology number (1-9, 11, 22, or 33)
 * @returns Array of arcano names that correspond to the number
 */
export function getNumerologyArcano(numero: number): string[] {
  if (!Number.isInteger(numero) || numero < 1) {
    throw new Error(`Número inválido. Recebido: ${numero}`);
  }
  
  const arcano: string[] = [];
  
  for (const [name, mapping] of Object.entries(TAROT_NUMEROLOGIA_MAP)) {
    if (mapping.numero === numero) {
      arcano.push(name);
    }
  }
  
  return arcano.sort((a, b) => {
    const aCard = TAROT_NUMEROLOGIA_MAP[a].numero_carta;
    const bCard = TAROT_NUMEROLOGIA_MAP[b].numero_carta;
    return aCard - bCard;
  });
}

/**
 * Get all Tarot-Numerology mappings
 * @returns Array of all TarotNumerologyMapping objects sorted by card number
 */
export function getAllTarotNumerology(): TarotNumerologyMapping[] {
  return Object.values(TAROT_NUMEROLOGIA_MAP).sort(
    (a, b) => a.numero_carta - b.numero_carta
  );
}

/**
 * Check if an arcano exists in the mapping
 * @param arcano - Arcano name to check
 * @returns True if arcano exists in mapping
 */
export function hasTarotNumerology(arcano: string): boolean {
  return arcano.trim() in TAROT_NUMEROLOGIA_MAP;
}

/**
 * Get mapping by card number
 * @param numero_carta - The card number (0-21)
 * @returns The correlation mapping or null if not found
 */
export function getMappingByCardNumber(numero_carta: number): TarotNumerologyMapping | null {
  if (!Number.isInteger(numero_carta) || numero_carta < 0 || numero_carta > 21) {
    return null;
  }
  
  for (const mapping of Object.values(TAROT_NUMEROLOGIA_MAP)) {
    if (mapping.numero_carta === numero_carta) {
      return mapping;
    }
  }
  
  return null;
}

/**
 * Get mappings filtered by element
 * @param elemento - Element to filter by (Fogo, Água, Terra, Ar, Éter)
 * @returns Array of TarotNumerologyMapping objects matching the element
 */
export function getTarotNumerologyByElement(elemento: string): TarotNumerologyMapping[] {
  return Object.values(TAROT_NUMEROLOGIA_MAP)
    .filter((mapping) => mapping.elemento === elemento)
    .sort((a, b) => a.numero_carta - b.numero_carta);
}

/**
 * Get mappings filtered by Orixá
 * @param orixá - Orixá name to search for
 * @returns Array of TarotNumerologyMapping objects associated with the Orixá
 */
export function getTarotNumerologyByOrixa(orixá: string): TarotNumerologyMapping[] {
  const normalized = orixá.toLowerCase().trim();
  return Object.values(TAROT_NUMEROLOGIA_MAP)
    .filter((mapping) => mapping.orixá.toLowerCase().includes(normalized))
    .sort((a, b) => a.numero_carta - b.numero_carta);
}

/**
 * Get mappings filtered by Sephirah
 * @param sephirah - Sephirah name to search for
 * @returns Array of TarotNumerologyMapping objects with the matching Sephirah
 */
export function getTarotNumerologyBySephirah(sephirah: string): TarotNumerologyMapping[] {
  const normalized = sephirah.toLowerCase().trim();
  return Object.values(TAROT_NUMEROLOGIA_MAP)
    .filter((mapping) => mapping.sephirah.toLowerCase().includes(normalized))
    .sort((a, b) => a.numero_carta - b.numero_carta);
}

/**
 * Get mappings filtered by Chakra
 * @param chakra - Chakra name or number to search for
 * @returns Array of TarotNumerologyMapping objects with the matching Chakra
 */
export function getTarotNumerologyByChakra(chakra: string): TarotNumerologyMapping[] {
  const normalized = chakra.toLowerCase().trim();
  return Object.values(TAROT_NUMEROLOGIA_MAP)
    .filter((mapping) => mapping.chakra.toLowerCase().includes(normalized))
    .sort((a, b) => a.numero_carta - b.numero_carta);
}

/**
 * Get all mappings that have master numbers (11, 22, 33)
 * @returns Array of TarotNumerologyMapping objects with master numbers
 */
export function getMasterNumberMappings(): TarotNumerologyMapping[] {
  return Object.values(TAROT_NUMEROLOGIA_MAP)
    .filter((mapping) => mapping.numero >= 11)
    .sort((a, b) => a.numero_carta - b.numero_carta);
}

/**
 * Get the count of arcano per numerology number
 * @returns Record mapping numerology number to count
 */
export function getNumerologyDistribution(): Record<number, number> {
  const distribution: Record<number, number> = {};
  
  for (const mapping of Object.values(TAROT_NUMEROLOGIA_MAP)) {
    const num = mapping.numero;
    distribution[num] = (distribution[num] || 0) + 1;
  }
  
  return distribution;
}
