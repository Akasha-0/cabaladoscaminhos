/**
 * Element type for spiritual correlations
 */
export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

/**
 * Numerology-Tarot Arcana Spiritual Correlation
 * Maps Pythagorean numbers 1-9 to their corresponding Tarot Major Arcana cards,
 * elemental associations, and spiritual meanings.
 * 
 * Based on the spiritual essence of each number and its connection to
 * the Major Arcana path on the Tree of Life.
 */

/**
 * Represents the correlation between a numerology number and its Major Arcana correspondence
 */
export interface NumerologyTarotMapping {
  /** The numerology number (1-9) - Pythagorean root number */
  numero: number;
  /** The Major Arcana arcano name */
  arcano: string;
  /** Card number in the Major Arcana sequence (0-21) */
  numero_carta: number;
  /** Elemental association */
  elemento: Elemento;
  /** Full spiritual meaning and symbolism */
  significado_espiritual: string;
  /** Archetype represented by this number-arcano pair */
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

// ─── Numerology 1-9 to Major Arcana Mapping ─────────────────────────────────────

/**
 * Complete mapping of numbers 1-9 to their Major Arcana correspondences.
 * Each number represents a spiritual lesson and cosmic archetype.
 */
export const NUMEROLOGIA_ARCANO_MAP: Record<number, NumerologyTarotMapping> = {
  1: {
    numero: 1,
    arcano: 'O Mago',
    numero_carta: 1,
    elemento: 'Água',
    significado_espiritual: 'O poder de manifestar através da vontade e intenção. Acentelha divina que conecta o céu e a terra. O princípio ativo que transforma o potencial em realidade. Representa a força de vontade criativa, a mestria das ferramentas sagradas e a capacidade de canalizar a energia universal.',
    arquétipo: 'O Mago / O Criador',
    orixá: 'Exu / Okaran',
    sephirah: 'Kether',
    chakra: '3º Plexo Solar',
    lição_espiritual: 'Você possui todo o poder necessário para manifestar seus desejos. A ferramenta está em suas mãos.',
    afirmação: 'Eu sou capaz de manifestar minha realidade através da minha vontade sagrada.',
  },
  2: {
    numero: 2,
    arcano: 'A Alta Sacerdotisa',
    numero_carta: 2,
    elemento: 'Terra',
    significado_espiritual: 'A sabedoria intuitiva que habita no silêncio. O véu entre os mundos visível e invisível. A receptividade sagrada que recebe sem julgamento. Representa o discernimento profundo, o conhecimento oculto e a conexão com os mistérios ancestrais.',
    arquétipo: 'A Sacerdotisa / A Guardiã dos Mistérios',
    orixá: 'Ibeji / Ejiokô',
    sephirah: 'Chokmah',
    chakra: '6º Frontal',
    lição_espiritual: 'Confie na sua intuição e nos sabedoria que vem do silêncio interior.',
    afirmação: 'Eu escuto a voz da minha alma e confio nos mistérios do universo.',
  },
  3: {
    numero: 3,
    arcano: 'A Imperatriz',
    numero_carta: 3,
    elemento: 'Terra',
    significado_espiritual: 'A fertilidade criativa em todas as suas formas. A abundância natural que flui da conexão com a natureza. A expressão artística e a beleza sagrada. Representa a criação, o nurturing, a conexão com a terra e a manifestação da abundância.',
    arquétipo: 'A Mãe Divina / A Criadora',
    orixá: 'Iemanjá / Irosun',
    sephirah: 'Binah',
    chakra: '4º Cardíaco',
    lição_espiritual: 'A abundância é seu direito de nascença quando você se conecta com a energia criativa do universo.',
    afirmação: 'Eu nutro minha essência criativa e permito que a abundância flua naturalmente.',
  },
  4: {
    numero: 4,
    arcano: 'O Imperador',
    numero_carta: 4,
    elemento: 'Fogo',
    significado_espiritual: 'A autoridade sagrada que estabelece ordem no caos. A disciplina e a estrutura que sustentam a realização. O princípio patriarcal que cria fronteiras e leis. Representa o poder de autodisciplina, a capacidade de criar estruturas duradouras e a liderança baseada em princípios.',
    arquétipo: 'O Pai / O Governante',
    orixá: 'Ogum / Etaogundá',
    sephirah: 'Chesed',
    chakra: '1º Básico',
    lição_espiritual: 'A verdadeira autoridade vem do domínio de si mesmo e da criação de estruturas que servem ao bem maior.',
    afirmação: 'Eu establezco ordem em minha vida com sabedoria e disciplina sagrada.',
  },
  5: {
    numero: 5,
    arcano: 'O Hierofante',
    numero_carta: 5,
    elemento: 'Fogo',
    significado_espiritual: 'O mestre espiritual e a tradição sagrada. A ponte entre o conhecimento humano e divino. Os sacramentos que conectam com o transcendente. Representa a busca por significado, a educação espiritual e a conformidade com as leis divinas.',
    arquétipo: 'O Sacerdote / O Mestre Espiritual',
    orixá: 'Oxum / Oxé',
    sephirah: 'Geburah',
    chakra: '5º Laríngeo',
    lição_espiritual: 'A sabedoria dos mestres ancestrais aguarda sua busca. Pergunte e receberá; Bata e a porta se abrirá.',
    afirmação: 'Eu busco a sabedoria sagrada e abro meu coração para os ensinamentos dos mestres.',
  },
  6: {
    numero: 6,
    arcano: 'Os Enamorados',
    numero_carta: 6,
    elemento: 'Ar',
    significado_espiritual: 'A união das polaridades e a escolha do coração. O amor que transcende o eu individual. A harmonia entre mente, corpo e espírito. Representa o amor em todas as suas expressões, as relações sagradas e a integração das sombras.',
    arquétipo: 'O Amante / A União Sagrada',
    orixá: 'Oxumaré / Oxumarim',
    sephirah: 'Tiphereth',
    chakra: '4º Cardíaco',
    lição_espiritual: 'O amor verdadeiro requer escolha consciente. Selecione o que eleva sua alma.',
    afirmação: 'Eu escolho o amor que me eleva e une minhas polaridades em harmonia sagrada.',
  },
  7: {
    numero: 7,
    arcano: 'O Carro',
    numero_carta: 7,
    elemento: 'Água',
    significado_espiritual: 'A vitória conquistada através da vontade focada e do equilíbrio das forças opostas. A determinação que supera todos os obstáculos. Representa o triumpho sobre os desafios, o controle das emoções e a jornada em direção a um objetivo claro.',
    arquétipo: 'O Guerreiro / O Vitorioso',
    orixá: 'Xangô / Obará',
    sephirah: 'Netzach',
    chakra: '3º Plexo Solar',
    lição_espiritual: 'O sucesso vem da harmonia entre ação decisiva e receptividade paciente.',
    afirmação: 'Eu avanço em direção aos meus objetivos com determinação e equilíbrio interior.',
  },
  8: {
    numero: 8,
    arcano: 'A Justiça',
    numero_carta: 8,
    elemento: 'Ar',
    significado_espiritual: 'A lei cósmica de causa e efeito. O equilíbrio karma que governa todas as ações. A verdade que se manifesta inevitavelmente. Representa a integridade, a responsabilidade por nossas escolhas e o retorno infinito da energia que emitimos.',
    arquétipo: 'A Justiça / O Juiz Cosmic',
    orixá: 'Oxalá / EjiOníle',
    sephirah: 'Hod',
    chakra: '4º Cardíaco',
    lição_espiritual: 'Suas ações têm consequências inevitáveis. Escolha sabedor para semear o que deseja colher.',
    afirmação: 'Eu ajo com integridade, conhecendo que a justiça cósmica equilibra todas as minhas escolhas.',
  },
  9: {
    numero: 9,
    arcano: 'O Eremita',
    numero_carta: 9,
    elemento: 'Terra',
    significado_espiritual: 'A sabedoria conquistada na solidão sagrada. A luz interior que brilha para o mundo. A iluminação que vem da introspecção profunda. Representa a busca da verdade, o retiro necessário para o autoconhecimento e a sabedoria dos que caminham sós.',
    arquétipo: 'O Sábio / O Illuminado',
    orixá: 'Nanã / Omolu / Olobón',
    sephirah: 'Yesod',
    chakra: '6º Frontal',
    lição_espiritual: 'Na quietude da alma, a luz da verdade se revela. Não tema a solidão - ela é sua mestra.',
    afirmação: 'Eu ilumino meu caminho com a sabedoria da alma, compartilhando luz com todos que encontram.',
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(NUMEROLOGIA_ARCANO_MAP);
// Freeze nested objects
Object.values(NUMEROLOGIA_ARCANO_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * Returns the arcano correlation for a given numerology number (1-9)
 * @param numero - The number to look up (must be 1-9)
 * @returns NumerologyTarotMapping object with all correlations
 * @throws Error if number is outside valid range
 */
export function getNumerologyTarot(numero: number): NumerologyTarotMapping {
  if (!Number.isInteger(numero) || numero < 1 || numero > 9) {
    throw new Error(`Número fora do intervalo válido (1-9). Recebido: ${numero}`);
  }
  return NUMEROLOGIA_ARCANO_MAP[numero];
}

/**
 * Get the numerology number corresponding to a Tarot arcano
 * @param arcano - The arcano name (e.g., 'O Mago', 'A Imperatriz')
 * @returns The numerology number or null if not found
 */
export function getTarotNumerology(arcano: string): number | null {
  const found = Object.values(NUMEROLOGIA_ARCANO_MAP).find(
    (m) => m.arcano.toLowerCase() === arcano.toLowerCase()
  );
  return found ? found.numero : null;
}

/**
 * Get all numerology-Tarot mappings
 * @returns Array of all NumerologyTarotMapping objects for numbers 1-9
 */
export function getAllNumerologyTarots(): NumerologyTarotMapping[] {
  return Object.values(NUMEROLOGIA_ARCANO_MAP).sort((a, b) => a.numero - b.numero);
}

/**
 * Check if a number exists in the mapping
 * @param numero - Number to check (1-9)
 * @returns True if number exists in mapping
 */
export function hasNumerologyTarot(numero: number): boolean {
  return numero in NUMEROLOGIA_ARCANO_MAP;
}

/**
 * Get mapping by arcano name
 * @param arcano - The arcano name
 * @returns The correlation mapping or null if not found
 */
export function getMappingByArcano(arcano: string): NumerologyTarotMapping | null {
  return Object.values(NUMEROLOGIA_ARCANO_MAP).find(
    (m) => m.arcano.toLowerCase() === arcano.toLowerCase()
  ) ?? null;
}

/**
 * Get mappings filtered by element
 * @param elemento - Element to filter by (Fogo, Água, Terra, Ar, Éter)
 * @returns Array of NumerologyTarotMapping objects matching the element
 */
export function getNumerologyByElement(elemento: string): NumerologyTarotMapping[] {
  const normalized = elemento
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const elementMap: Record<string, Elemento> = {
    fogo: 'Fogo',
    agua: 'Água',
    terra: 'Terra',
    ar: 'Ar',
    eter: 'Éter',
  };

  const key = elementMap[normalized];
  if (!key) return [];

  return getAllNumerologyTarots().filter((m) => m.elemento === key);
}

/**
 * Get mappings filtered by Orixá
 * @param orixá - Orixá name to search for
 * @returns Array of NumerologyTarotMapping objects associated with the Orixá
 */
export function getNumerologyByOrixa(orixá: string): NumerologyTarotMapping[] {
  const normalized = orixá
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return getAllNumerologyTarots().filter((m) =>
    m.orixá.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalized)
  );
}

/**
 * Get mappings filtered by Sephirah
 * @param sephirah - Sephirah name to search for
 * @returns Array of NumerologyTarotMapping objects with the matching Sephirah
 */
export function getNumerologyBySephirah(sephirah: string): NumerologyTarotMapping[] {
  const normalized = sephirah
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return getAllNumerologyTarots().filter((m) =>
    m.sephirah.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalized)
  );
}

/**
 * Get mappings filtered by Chakra
 * @param chakra - Chakra name or number to search for
 * @returns Array of NumerologyTarotMapping objects with the matching Chakra
 */
export function getNumerologyByChakra(chakra: string): NumerologyTarotMapping[] {
  const normalized = chakra
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return getAllNumerologyTarots().filter((m) =>
    m.chakra.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalized)
  );
}