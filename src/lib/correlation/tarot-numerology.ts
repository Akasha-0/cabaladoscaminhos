/**
 * Element type for spiritual correlations
 */
export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

/**
 * Tarot-Numerology Arcana Spiritual Correlation
 * Maps Tarot Major Arcana cards (0-21) to their corresponding numerology numbers,
 * including master numbers (11, 22) and reduced single digits (1-9).
 * 
 * This is the inverse correlation of numerology-tarot.ts - here we start from
 * the Tarot Major Arcana and derive the numerological significance.
 */

/**
 * Represents the correlation between a Tarot Major Arcana card and its numerology number
 */
export interface TarotNumerologyMapping {
  /** The Major Arcana arcano name */
  arcano: string;
  /** Card number in the Major Arcana sequence (0-21) */
  numero_carta: number;
  /** The numerology number (1-9, or master numbers 11, 22) */
  numero_numerologia: number;
  /** Whether this is a master number (11, 22, 33) */
  é_mestre: boolean;
  /** Elemental association */
  elemento: Elemento;
  /** Full spiritual meaning and symbolism */
  significado_espiritual: string;
  /** Archetype represented by this arcano-number pair */
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

// ─── Tarot Major Arcana to Numerology Mapping ─────────────────────────────────

/**
 * Complete mapping of Major Arcana (0-21) to their numerology correspondences.
 * Master numbers (11, 22) are preserved without reduction.
 */
export const TAROT_NUMEROLOGIA_MAP: Record<number, TarotNumerologyMapping> = {
  0: {
    arcano: 'O Louco',
    numero_carta: 0,
    numero_numerologia: 22,
    é_mestre: true,
    elemento: 'Ar',
    significado_espiritual: 'O início selvagem da jornada espiritual. A liberdade absoluta que transcende todas as regras. O salto de fé que abraça o desconhecido. Representa o potencial puro, a espontaneidade sagrada e a confiança no universo que sustenta todos os passos.',
    arquétipo: 'O Louco / O Aventureiro Espiritual',
    orixá: 'Nanã / Omolu / Olobón',
    sephirah: 'Malkuth',
    chakra: '7º Coronário',
    lição_espiritual: 'Às vezes você precisa saltar sem olhar para trás. O universo sustenta seus passos quando você confia.',
    afirmação: 'Eu abraço a aventura da vida com coração aberto e confiança no caminho.',
 },
  1: {
    arcano: 'A Sacerdotisa',
    numero_carta: 1,
    numero_numerologia: 2,
    é_mestre: false,
    elemento: 'Água',
    significado_espiritual: 'A sabedoria intuitiva que habita no silêncio. O véu entre os mundos visível e invisível. A receptividade sagrada que recebe sem julgamento. Representa o discernimento profundo, o conhecimento oculto e a conexão com os mistérios ancestrais.',
    arquétipo: 'A Sacerdotisa / A Guardiã dos Mistérios',
    orixá: 'Ibeji / Ejiokô',
    sephirah: 'Chokmah',
    chakra: '6º Frontal',
    lição_espiritual: 'Confie na sua intuição e na sabedoria que vem do silêncio interior.',
    afirmação: 'Eu escuto a voz da minha alma e confio nos mistérios do universo.',
  },
  2: {
    arcano: 'A Imperatriz',
    numero_carta: 2,
    numero_numerologia: 3,
    é_mestre: false,
    elemento: 'Terra',
    significado_espiritual: 'A fertilidade criativa em todas as suas formas. A abundância natural que flui da conexão com a natureza. A expressão artística e a beleza sagrada. Representa a criação, o nurturing, a conexão com a terra e a manifestação da abundância.',
    arquétipo: 'A Mãe Divina / A Criadora',
    orixá: 'Iemanjá / Irosun',
    sephirah: 'Binah',
    chakra: '4º Cardíaco',
    lição_espiritual: 'A abundância é seu direito de nascença quando você se conecta com a energia criativa do universo.',
    afirmação: 'Eu nutro minha essência criativa e permito que a abundância flua naturalmente.',
  },
  3: {
    arcano: 'O Imperador',
    numero_carta: 3,
    numero_numerologia: 4,
    é_mestre: false,
    elemento: 'Fogo',
    significado_espiritual: 'A autoridade sagrada que estabelece ordem no caos. A disciplina e a estrutura que sustentam a realização. O princípio patriarcal que cria fronteiras e leis. Representa o poder de autodisciplina, a capacidade de criar estruturas duradouras e a liderança baseada em princípios.',
    arquétipo: 'O Pai / O Governante',
    orixá: 'Ogum / Etaogundá',
    sephirah: 'Chesed',
    chakra: '1º Básico',
    lição_espiritual: 'A verdadeira autoridade vem do domínio de si mesmo e da criação de estruturas que servem ao bem maior.',
    afirmação: 'Eu establezco ordem em minha vida com sabedoria e disciplina sagrada.',
  },
  4: {
    arcano: 'O Hierofante',
    numero_carta: 4,
    numero_numerologia: 5,
    é_mestre: false,
    elemento: 'Fogo',
    significado_espiritual: 'O mestre espiritual e a tradição sagrada. A ponte entre o conhecimento humano e divino. Os sacramentos que conectam com o transcendente. Representa a busca por significado, a educação espiritual e a conformidade com as leis divinas.',
    arquétipo: 'O Sacerdote / O Mestre Espiritual',
    orixá: 'Oxum / Oxé',
    sephirah: 'Geburah',
    chakra: '5º Laríngeo',
    lição_espiritual: 'A sabedoria dos mestres ancestrais aguarda sua busca. Pergunte e receberá; Bata e a porta se abrirá.',
    afirmação: 'Eu busco a sabedoria sagrada e abro meu coração para os ensinamentos dos mestres.',
  },
  5: {
    arcano: 'Os Enamorados',
    numero_carta: 5,
    numero_numerologia: 6,
    é_mestre: false,
    elemento: 'Ar',
    significado_espiritual: 'A união das polaridades e a escolha do coração. O amor que transcende o eu individual. A harmonia entre mente, corpo e espírito. Representa o amor em todas as suas expressões, as relações sagradas e a integração das sombras.',
    arquétipo: 'O Amante / A União Sagrada',
    orixá: 'Oxumaré / Oxumarim',
    sephirah: 'Tiphereth',
    chakra: '4º Cardíaco',
    lição_espiritual: 'O amor verdadeiro requer escolha consciente. Selecione o que eleva sua alma.',
    afirmação: 'Eu escolho o amor que me eleva e une minhas polaridades em harmonia sagrada.',
  },
  6: {
    arcano: 'O Carro',
    numero_carta: 6,
    numero_numerologia: 7,
    é_mestre: false,
    elemento: 'Água',
    significado_espiritual: 'A vitória conquistada através da vontade focada e do equilíbrio das forças opostas. A determinação que supera todos os obstáculos. Representa o triumpho sobre os desafios, o controle das emoções e a jornada em direção a um objetivo claro.',
    arquétipo: 'O Guerreiro / O Vitorioso',
    orixá: 'Xangô / Obará',
    sephirah: 'Netzach',
    chakra: '3º Plexo Solar',
    lição_espiritual: 'O sucesso vem da harmonia entre ação decisiva e receptividade paciente.',
    afirmação: 'Eu avanço em direção aos meus objetivos com determinação e equilíbrio interior.',
  },
  7: {
    arcano: 'A Justiça',
    numero_carta: 7,
    numero_numerologia: 8,
    é_mestre: false,
    elemento: 'Ar',
    significado_espiritual: 'A lei cósmica de causa e efeito. O equilíbrio karma que governa todas as ações. A verdade que se manifesta inevitavelmente. Representa a integridade, a responsabilidade por nossas escolhas e o retorno infinito da energia que emitimos.',
    arquétipo: 'A Justiça / O Juiz Cósmico',
    orixá: 'Oxalá / EjiOníle',
    sephirah: 'Hod',
    chakra: '4º Cardíaco',
    lição_espiritual: 'Suas ações têm consequências inevitáveis. Escolha sabedor para semear o que deseja colher.',
    afirmação: 'Eu ajo com integridade, conhecendo que a justiça cósmica equilibra todas as minhas escolhas.',
  },
  8: {
    arcano: 'O Eremita',
    numero_carta: 8,
    numero_numerologia: 9,
    é_mestre: false,
    elemento: 'Terra',
    significado_espiritual: 'A sabedoria conquistada na solidão sagrada. A luz interior que brilha para o mundo. A iluminação que vem da introspecção profunda. Representa a busca da verdade, o retiro necessário para o autoconhecimento e a sabedoria dos que caminham sós.',
    arquétipo: 'O Sábio / O Iluminado',
    orixá: 'Nanã / Omolu / Olobón',
    sephirah: 'Yesod',
    chakra: '6º Frontal',
    lição_espiritual: 'Na quietude da alma, a luz da verdade se revela. Não tema a solidão - ela é sua mestra.',
    afirmação: 'Eu ilumino meu caminho com a sabedoria da alma, compartilhando luz com todos que encontram.',
  },
  9: {
    arcano: 'A Roda da Fortuna',
    numero_carta: 9,
    numero_numerologia: 1,
    é_mestre: false,
    elemento: 'Fogo',
    significado_espiritual: 'O ciclo eterno do destino girando entre ascensão e queda. A lei de ação e reação cósmica. O momento perfeito onde todas as forças se alinham. Representa a transformação, a oportunidade que surge do caos e a aceitação do fluxo natural da vida.',
    arquétipo: 'A Roda / O Destino em Movimento',
    orixá: 'Oxumaré / Oxumarim',
    sephirah: 'Hod',
    chakra: '3º Plexo Solar',
    lição_espiritual: 'A vida é um ciclo contínuo. O que desce voltará a subir; o que sobe voltará a descer. Aceite o fluxo.',
    afirmação: 'Eu fluo com os ciclos da vida, confiando que cada volta da roda traz novas oportunidades.',
  },
  10: {
    arcano: 'A Força',
    numero_carta: 10,
    numero_numerologia: 11,
    é_mestre: true,
    elemento: 'Terra',
    significado_espiritual: 'O poder da alma que domina as feras selvagens do ego. A coragem que transciende a força bruta. A compaixão que transforma a agressividade em bondade. Representa o domínio sobre os impulsos, a força interior e a conquista do equilíbrio entre o instinto e o espírito.',
    arquétipo: 'A Força / A Mestra Interior',
    orixá: 'Oxum / Oxé',
    sephirah: 'Tiphereth',
    chakra: '4º Cardíaco',
    lição_espiritual: 'A verdadeira força está na suavidade. A coragem de ser gentil é o maior poder.',
    afirmação: 'Eu canalizo minha força interior com compaixão, domando meus medos com amor.',
 },
  11: {
    arcano: 'O Enforcado',
    numero_carta: 11,
    numero_numerologia: 3,
    é_mestre: false,
    elemento: 'Água',
    significado_espiritual: 'O sacrifício deliberado que abre portas para novas perspectivas. A entrega que liberta a alma. A inversão do ponto de vista que revela verdades ocultas. Representa a pausa necessária, a Generosidade que abençoa e a sabedoria de saber quando parar.',
    arquétipo: 'O Martir / O Sacrifício Consciente',
    orixá: 'Xangô / Obará',
    sephirah: 'Geburah',
    chakra: '6º Frontal',
    lição_espiritual: 'Às vezes você precisa perder para ganhar. A entrega consciente abre novos caminhos.',
    afirmação: 'Eu entrego o que precisa ser solto, confiando que o universo proverá novas perspectivas.',
  },
  12: {
    arcano: 'A Morte',
    numero_carta: 12,
    numero_numerologia: 4,
    é_mestre: false,
    elemento: 'Água',
    significado_espiritual: 'A transformação inevitável que prepara o renascimento. O fim de um ciclo que possibilita um novo começo. A metamorfose que liberta a alma de velhas formas. Representa a mudança profunda, a purificação e a ressurreição espiritual.',
    arquétipo: 'A Transformação / O Renascimento',
    orixá: 'Omolu / Olobón',
    sephirah: 'Tipareth',
    chakra: '2º Sacral',
    lição_espiritual: 'A morte do velho é o nascimento do novo. Não tema as terminações - elas são portais.',
    afirmação: 'Eu aceito a transformação como parte natural da minha jornada, deixando ir o que precisa partir.',
  },
  13: {
    arcano: 'A Temperança',
    numero_carta: 13,
    numero_numerologia: 5,
    é_mestre: false,
    elemento: 'Fogo',
    significado_espiritual: 'O equilíbrio divino entre extremos opostos. A síntese que harmoniza contrários. A alquimia espiritual que transforma chumbo em ouro. Representa a moderação, a paciência cósmica e a integração das polaridades em uma nova substância.',
    arquétipo: 'O Alquimista / O Equilibrador',
    orixá: 'Oxum / Oxé',
    sephirah: 'Yesod',
    chakra: '5º Laríngeo',
    lição_espiritual: 'O equilíbrio entre extremos é a chave para a mastersia. Encontre o ponto central.',
    afirmação: 'Eu encontro o equilíbrio sagrado em todas as coisas, harmonizando minhas polaridades com sabedoria.',
  },
  14: {
    arcano: 'O Diabo',
    numero_carta: 14,
    numero_numerologia: 6,
    é_mestre: false,
    elemento: 'Terra',
    significado_espiritual: 'A sombra que habita em todos os seres. As correntes da matéria que prendem a alma. A ilusão da separação que esquece a unidade divina. Representa a confrontação com a sombra, o reconhecimento das sombras e a libertação das autolimitacões.',
    arquétipo: 'A Sombra / O Prisioneiro',
    orixá: 'Exu / Okaran',
    sephirah: 'Yesod',
    chakra: '1º Básico',
    lição_espiritual: 'O que você nega em si mesmo tem poder sobre você. Enfrente suas sombras para libertação.',
    afirmação: 'Eu honro minha sombra e a integro, reconhecendo que ela é parte da minha totalidade.',
 },
  15: {
    arcano: 'A Torre',
    numero_carta: 15,
    numero_numerologia: 7,
    é_mestre: false,
    elemento: 'Fogo',
    significado_espiritual: 'A destruição libertadora que prepara a reconstrução. O raio que dissipa a ilusão e revela a verdade. A queda dos falsos edifícios que permite a fundação do real. Representa a libertação súbita, a revelação e o novo começo após a queda.',
    arquétipo: 'O Raio / A Libertação Súbita',
    orixá: 'Ogum / Etaogundá',
    sephirah: 'Geburah',
    chakra: '3º Plexo Solar',
    lição_espiritual: 'Às vezes a destruição é necessária para a libertação. O que cai carrega consigo o que precisa ser removido.',
    afirmação: 'Eu permito que o raio da verdade dissipe minhas ilusões, confiando que a destruição precede o renascimento.',
  },
  16: {
    arcano: 'A Estrela',
    numero_carta: 16,
    numero_numerologia: 8,
    é_mestre: false,
    elemento: 'Ar',
    significado_espiritual: 'A esperança que brilha mesmo na escuridão mais profunda. A luz que guia os caminhantes. A inspiração divina que renova a fé. Representa a orientação celestial, a renovação da esperança e a conexão com as forças cósmicas de cura.',
    arquétipo: 'A Esperança / A Luz Guiadora',
    orixá: 'Iemanjá / Irosun',
    sephirah: 'Hod',
    chakra: '6º Frontal',
    lição_espiritual: 'Mesmo na mais profunda escuridão, uma estrela brilha para guiá-lo. Nunca perca a esperança.',
    afirmação: 'Eu brilho como uma estrela no escuro, irradiando esperança e luz para todos que encontro.',
  },
  17: {
    arcano: 'A Lua',
    numero_carta: 17,
    numero_numerologia: 9,
    é_mestre: false,
    elemento: 'Água',
    significado_espiritual: 'O reino das ilusões e da percepção distorcida. O mundo onírico que revela verdades ocultas. A intuição que navega pelas águas profundas do inconsciente. Representa os medos ocultos, a necessidade de discernimento e a jornada através das águas da alma.',
    arquétipo: 'A Ilusão / A Navegadora',
    orixá: 'Iemanjá / Irosun',
    sephirah: 'Yesod',
    chakra: '6º Frontal',
    lição_espiritual: 'Nem tudo é o que parece. Confie na sua intuição para navegar pelas ilusões.',
    afirmação: 'Eu navego pelas águas da minha mente com clareza, discernindo a verdade nas sombras.',
  },
  18: {
    arcano: 'O Sol',
    numero_carta: 18,
    numero_numerologia: 1,
    é_mestre: false,
    elemento: 'Fogo',
    significado_espiritual: 'A luz da consciência que ilumina todas as coisas. A vitalidade que renova o corpo e o espírito. A alegria de viver que celebra a existência. Representa a claridade mental, o sucesso garantido e a criança interior que jubila.',
    arquétipo: 'O Sol / O Iluminado',
    orixá: 'Oxalá / EjiOníle',
    sephirah: 'Tiphereth',
    chakra: '4º Cardíaco',
    lição_espiritual: 'A luz do sol não esconde nada. Seja claro, autêntico e Celebre a vida.',
    afirmação: 'Eu brillo com a luz do sol, celebrando a vida e irradiando alegria e claridade.',
  },
  19: {
    arcano: 'O Julgamento',
    numero_carta: 19,
    numero_numerologia: 2,
    é_mestre: false,
    elemento: 'Fogo',
    significado_espiritual: 'O chamado da alma para seu propósito divino. A trombeta que desperta os mortos para nova vida. O julgamento que liberta ou condena. Representa a redenção, a chamada interior e o renascimento através do reconhecimento doEu Superior.',
    arquétipo: 'O Arcanjo / O Renascimento',
    orixá: 'Oxalá / EjiOníle',
    sephirah: 'Chokmah',
    chakra: '7º Coronário',
    lição_espiritual: 'Responda ao chamado da sua alma. Você foi chamado para uma vida maior.',
    afirmação: 'Eu respondo ao chamado da minha alma, abraçando meu propósito divino com coragem.',
  },
  20: {
    arcano: 'O Mundo',
    numero_carta: 20,
    numero_numerologia: 3,
    é_mestre: false,
    elemento: 'Terra',
    significado_espiritual: 'A completude que simboliza o fim de um ciclo maior. A integração de todos os opostos em harmonia perfeita. O retorno ao paraíso após a jornada. Representa a réalisation, a integração espiritual e a celebração da wholeness.',
    arquétipo: 'O Universo / A Completude',
    orixá: 'Iemanjá / Irosun',
    sephirah: 'Malkuth',
    chakra: '7º Coronário',
    lição_espiritual: 'Você completou a jornada. Tudo que procurava estava dentro de você o tempo todo.',
    afirmação: 'Eu celebro minha completude, integrando todas as lições da minha jornada em sabedoria.',
 },
  21: {
    arcano: 'O Louco',
    numero_carta: 21,
    numero_numerologia: 22,
    é_mestre: true,
    elemento: 'Ar',
    significado_espiritual: 'O retorno ao início selvagem da jornada, agora com sabedoria conquistada. A liberdade absoluta que transcende todas as estruturas. O salto de fé que abraça o infinito. Representa o mestre que retornou ao estado original, a sabedoria da loucura sagrada e o eterno recomeço.',
    arquétipo: 'O Louco Iluminado / O Mestre Retornado',
    orixá: 'Nanã / Omolu / Olobón',
    sephirah: 'Kether',
    chakra: '7º Coronário',
    lição_espiritual: 'A verdadeira mastersia é saber que você não sabe nada. O louco é o mais sábio de todos.',
    afirmação: 'Eu abraço a liberdade sagrada do louco, dançando na borda do infinito com alegria.',
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(TAROT_NUMEROLOGIA_MAP);
// Freeze nested objects
Object.values(TAROT_NUMEROLOGIA_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * Returns the numerology correlation for a given Tarot Major Arcana card number (0-21)
 * @param numeroCarta - The Major Arcana card number (0-21)
 * @returns TarotNumerologyMapping object with all correlations
 * @throws Error if number is outside valid range
 */
export function getTarotNumerologyByNumber(numeroCarta: number): TarotNumerologyMapping {
  if (!Number.isInteger(numeroCarta) || numeroCarta < 0 || numeroCarta > 21) {
    throw new Error(`Número do arcano fora do intervalo válido (0-21). Recebido: ${numeroCarta}`);
  }
  return TAROT_NUMEROLOGIA_MAP[numeroCarta];
}

/**
 * Get the numerology number for a given arcano name
 * @param arcano - The arcano name (e.g., 'O Louco', 'A Sacerdotisa')
 * @returns The numerology number or null if not found
 */
export function getNumerologyByArcano(arcano: string): number | null {
  const found = Object.values(TAROT_NUMEROLOGIA_MAP).find(
    (m) => m.arcano.toLowerCase() === arcano.toLowerCase()
  );
  return found ? found.numero_numerologia : null;
}

/**
 * Get all Tarot-Numerology mappings
 * @returns Array of all TarotNumerologyMapping objects for cards 0-21
 */
export function getAllTarotNumerologies(): TarotNumerologyMapping[] {
  return Object.values(TAROT_NUMEROLOGIA_MAP).sort((a, b) => a.numero_carta - b.numero_carta);
}

/**
 * Check if a card number exists in the mapping
 * @param numeroCarta - Card number to check (0-21)
 * @returns True if card number exists in mapping
 */
export function hasTarotNumerology(numeroCarta: number): boolean {
  return numeroCarta in TAROT_NUMEROLOGIA_MAP;
}

/**
 * Get mapping by arcano name
 * @param arcano - The arcano name
 * @returns The correlation mapping or null if not found
 */
export function getMappingByArcano(arcano: string): TarotNumerologyMapping | null {
  return Object.values(TAROT_NUMEROLOGIA_MAP).find(
    (m) => m.arcano.toLowerCase() === arcano.toLowerCase()
  ) ?? null;
}

/**
 * Get mappings filtered by element
 * @param elemento - Element to filter by (Fogo, Água, Terra, Ar, Éter)
 * @returns Array of TarotNumerologyMapping objects matching the element
 */
export function getTarotNumerologyByElement(elemento: string): TarotNumerologyMapping[] {
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

  return getAllTarotNumerologies().filter((m) => m.elemento === key);
}

/**
 * Get mappings filtered by Orixá
 * @param orixá - Orixá name to search for
 * @returns Array of TarotNumerologyMapping objects associated with the Orixá
 */
export function getTarotNumerologyByOrixa(orixá: string): TarotNumerologyMapping[] {
  const normalized = orixá
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return getAllTarotNumerologies().filter((m) =>
    m.orixá.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalized)
  );
}

/**
 * Get mappings filtered by Sephirah
 * @param sephirah - Sephirah name to search for
 * @returns Array of TarotNumerologyMapping objects with the matching Sephirah
 */
export function getTarotNumerologyBySephirah(sephirah: string): TarotNumerologyMapping[] {
  const normalized = sephirah
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return getAllTarotNumerologies().filter((m) =>
    m.sephirah.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalized)
  );
}

/**
 * Get mappings filtered by Chakra
 * @param chakra - Chakra name or number to search for
 * @returns Array of TarotNumerologyMapping objects with the matching Chakra
 */
export function getTarotNumerologyByChakra(chakra: string): TarotNumerologyMapping[] {
  const normalized = chakra
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return getAllTarotNumerologies().filter((m) =>
    m.chakra.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(normalized)
  );
}

/**
 * Get all master number mappings (11, 22, 33)
 * @returns Array of TarotNumerologyMapping objects with é_mestre = true
 */
export function getMasterNumberMappings(): TarotNumerologyMapping[] {
  return getAllTarotNumerologies().filter((m) => m.é_mestre);
}

/**
 * Get all arcano names
 * @returns Array of arcano names sorted by card number
 */
export function getAllArcanos(): string[] {
  return Object.keys(TAROT_NUMEROLOGIA_MAP).sort((a, b) => Number(a) - Number(b));
}

/**
 * Default export with all functions
 */
export default {
  getTarotNumerologyByNumber,
  getNumerologyByArcano,
  getAllTarotNumerologies,
  hasTarotNumerology,
  getMappingByArcano,
  getTarotNumerologyByElement,
  getTarotNumerologyByOrixa,
  getTarotNumerologyBySephirah,
  getTarotNumerologyByChakra,
  getMasterNumberMappings,
  getAllArcanos,
  TAROT_NUMEROLOGIA_MAP,
};
