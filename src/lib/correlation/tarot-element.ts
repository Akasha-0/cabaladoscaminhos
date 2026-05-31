/**
 * Tarot-Element Spiritual Correlation Module
 * Maps Tarot Major Arcana cards to the five classical elements.
 * Source: Cabala dos Caminhos spiritual system
 */

export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

/**
 * Represents the correlation between a Tarot Major Arcana card and its elemental nature
 */
export interface TarotElementMapping {
  /** Major Arcana arcano name (Portuguese) */
  arcano: string;
  /** Card number in the Major Arcana sequence (0-21) */
  numero_carta: number;
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
  /** Elemental qualities and characteristics */
  qualidades: string[];
  /** Affirmation for meditation */
  afirmação: string;
  /** Traditional colors associated with this arcano-element */
  cores: string[];
  /** Sacred day associated with this arcano */
  dia_sagrado: string;
}

// ─── Major Arcana to Element Mapping ───────────────────────────────────────────

/**
 * Complete mapping of the 22 Major Arcana cards to their elemental correspondences.
 * Based on ancient esoteric traditions integrated with the Cabala dos Caminhos system.
 * Each arcano carries the archetypal energy of its corresponding element.
 */
export const TAROT_ELEMENT_MAP: Record<string, TarotElementMapping> = {
  'O Louco': {
    arcano: 'O Louco',
    numero_carta: 0,
    elemento: 'Éter',
    significado_espiritual: 'O louco representa a energia primordial do éter, o vazio fértil onde toda criação começa. É o sopro divino, a liberdade absoluta, o salto de fé além das estruturas conhecidas.',
    arquétipo: 'O Inocente / O Viajante',
    orixá: 'Oxumarê',
    sephirah: 'Kether',
    chakra: 'Coronário',
    lição_espiritual: 'Abrace o novo com coração aberto, confiando no processo de crescimento espiritual.',
    qualidades: ['Liberdade', 'Inocência', 'Potencial puro', 'Novo começo', 'Confiança'],
    afirmação: 'Eu me entrego ao fluxo do universo com confiança e abertura.',
    cores: ['Branco', 'Lavanda', 'Amarelo claro'],
    dia_sagrado: 'Domingo',
  },
  'O Mago': {
    arcano: 'O Mago',
    numero_carta: 1,
    elemento: 'Ar',
    significado_espiritual: 'O Mago representa a mente penetrante do ar, a capacidade de manifestar através da vontade e da intenção. É o poder da comunicação, da técnica e da transformação.',
    arquétipo: 'O Criador / O Articulador',
    orixá: 'Oxum',
    sephirah: 'Chokmah',
    chakra: 'Laríngeo',
    lição_espiritual: 'Você possui todas as ferramentas necessárias para manifestar seus desejos.',
    qualidades: ['Vontade', 'Manifestação', 'Comunicação', 'Habilidade', 'Foco'],
    afirmação: 'Eu canalizo minha vontade com clareza e propósito para criar minha realidade.',
    cores: ['Amarelo', 'Azul claro', 'Dourado'],
    dia_sagrado: 'Quarta-feira',
  },
  'A Sacerdotisa': {
    arcano: 'A Sacerdotisa',
    numero_carta: 2,
    elemento: 'Água',
    significado_espiritual: 'A Sacerdotisa encarna a água em sua forma mais pura - o inconsciente, a intuição, os mistérios ocultos. É o conhecimento secreto que habita nas profundezas.',
    arquétipo: 'A Mística / A Guardiã dos Mistérios',
    orixá: 'Iemanjá',
    sephirah: 'Binah',
    chakra: 'Ajna',
    lição_espiritual: 'Confie na sua intuição e nos conhecimentos que vêm das profundezas.',
    qualidades: ['Intuição', 'Mistério', 'Sabedoria oculta', 'Sensibilidade', 'Conhecimento interior'],
    afirmação: 'Eu acesso a sabedoria sagrada que habita em meu interior.',
    cores: ['Azul marinho', 'Branco', 'Prata'],
    dia_sagrado: 'Segunda-feira',
  },
  'A Imperatriz': {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    elemento: 'Terra',
    significado_espiritual: 'A Imperatriz é a fertilidade da terra manifestada - a abundância natural, o cuidado maternal. É a natureza em sua plenitude.',
    arquétipo: 'A Mãe Terra / A Nutridora',
    orixá: 'Oxum',
    sephirah: 'Chesed',
    chakra: 'Cardíaco',
    lição_espiritual: 'A abundância flui quando você se conecta com a fertilidade da terra.',
    qualidades: ['Abundância', 'Fertilidade', 'Cuidado', 'Natureza', 'Criação'],
    afirmação: 'Eu me abro para a abundância infinita que flui através de mim.',
    cores: ['Verde', 'Rosa', 'Azul turquesa'],
    dia_sagrado: 'Sexta-feira',
  },
  'O Imperador': {
    arcano: 'O Imperador',
    numero_carta: 4,
    elemento: 'Fogo',
    significado_espiritual: 'O Imperador representa o fogo estruturante - a autoridade, a disciplina, o poder de criar ordem. É a vontade masculina e a estrutura paterna.',
    arquétipo: 'O Pai / O Governante',
    orixá: 'Xangô',
    sephirah: 'Gevurah',
    chakra: 'Plexo Solar',
    lição_espiritual: 'A verdadeira autoridade vem da disciplina e do uso sábio do poder.',
    qualidades: ['Autoridade', 'Estrutura', 'Disciplina', 'Poder', 'Ordem'],
    afirmação: 'Eu exerço minha autoridade com sabedoria e justiça.',
    cores: ['Vermelho', 'Laranja', 'Preto'],
    dia_sagrado: 'Domingo',
  },
  'O Papa': {
    arcano: 'O Papa',
    numero_carta: 5,
    elemento: 'Terra',
    significado_espiritual: 'O Papa representa a tradição terrestre - a espiritualidade institucionalizada, os ensinamentos ancestrais, a fé organizada. É a conexão com o sagrado através de estruturas.',
    arquétipo: 'O Guia Espiritual / O Mestre',
    orixá: 'Obaluaiê',
    sephirah: 'Tiphereth',
    chakra: 'Cardíaco',
    lição_espiritual: 'Busque orientação espiritual através de mestres e tradições estabelecidas.',
    qualidades: ['Tradição', 'Fé', 'Ensinamento', 'Ritual', 'Guia'],
    afirmação: 'Eu busco sabedoria nas tradições sagradas e nos mestres espirituais.',
    cores: ['Roxo', 'Dourado', 'Branco'],
    dia_sagrado: 'Quinta-feira',
  },
  'O Enamorado': {
    arcano: 'O Enamorado',
    numero_carta: 6,
    elemento: 'Ar',
    significado_espiritual: 'O Enamorado representa o ar dos relacionamentos - a escolha, a união, o conflito entre desejos. É o momento de decisão que define o caminho.',
    arquétipo: 'O Escolhedor / O Amante',
    orixá: 'Oxum',
    sephirah: 'Tiphereth',
    chakra: 'Cardíaco',
    lição_espiritual: 'O amor verdadeiro envolve escolha consciente e compromisso com o que amamos.',
    qualidades: ['Amor', 'Escolha', 'União', 'Desejo', 'Compromisso'],
    afirmação: 'Eu escolho o amor e me comprometo com o que nutre minha alma.',
    cores: ['Rosa', 'Vermelho claro', 'Azul claro'],
    dia_sagrado: 'Sexta-feira',
  },
  'O Carro': {
    arcano: 'O Carro',
    numero_carta: 7,
    elemento: 'Fogo',
    significado_espiritual: 'O Carro é o fogo da conquista - a vitória através da vontade, o controle das emoções, a jornada para o sucesso. É a triumphância sobre obstáculos.',
    arquétipo: 'O Guerreiro / O Vitorioso',
    orixá: 'Ogum',
    sephirah: 'Netzach',
    chakra: 'Plexo Solar',
    lição_espiritual: 'A vitória vem para aqueles que dominam suas emoções e mantêm o foco.',
    qualidades: ['Vitória', 'Controle', 'Determinação', 'Disciplina', 'Conquista'],
    afirmação: 'Eu conduzo minha carruagem com firmeza e alcanço minhas vitórias.',
    cores: ['Vermelho', 'Ouro', 'Preto'],
    dia_sagrado: 'Terça-feira',
  },
  'A Justiça': {
    arcano: 'A Justiça',
    numero_carta: 8,
    elemento: 'Ar',
    significado_espiritual: 'A Justiça representa o ar da lei cósmica - o karma, a verdade, o equilíbrio entre ações e consequências. É a verdade que se revela.',
    arquétipo: 'A Juíza / A Lei Cósmica',
    orixá: 'Obaluaiê',
    sephirah: 'Chesed',
    chakra: 'Laríngeo',
    lição_espiritual: 'Suas ações têm consequências - plante apenas o que deseja colher.',
    qualidades: ['Equilíbrio', 'Verdade', 'Justiça', 'Lei', 'Retribuição'],
    afirmação: 'Eu ago com integridade, sabendo que o universo responde às minhas ações.',
    cores: ['Amarelo', 'Azul', 'Branco'],
    dia_sagrado: 'Quinta-feira',
  },
  'O Eremita': {
    arcano: 'O Eremita',
    numero_carta: 9,
    elemento: 'Água',
    significado_espiritual: 'O Eremita é a água da introspecção - a busca interior, a solidão sagrada, a sabedoria conquistada através da reflexão. É a luz que guia do interior.',
    arquétipo: 'O Sábio / O Busca Interior',
    orixá: 'Nanã',
    sephirah: 'Hod',
    chakra: 'Ajna',
    lição_espiritual: 'A verdadeira sabedoria vem da busca interior e da solidão sagrada.',
    qualidades: ['Sabedoria', 'Introspecção', 'Busca interior', 'Isolamento sagrado', 'Guia interior'],
    afirmação: 'Eu me aprofundo em minha essência para encontrar a luz que me guia.',
    cores: ['Azul escuro', 'Amarelo ouro', 'Branco'],
    dia_sagrado: 'Segunda-feira',
  },
  'A Roda da Fortuna': {
    arcano: 'A Roda da Fortuna',
    numero_carta: 10,
    elemento: 'Fogo',
    significado_espiritual: 'A Roda é o fogo do destino - os ciclos cósmicos, a mudança inevitável, o destino que se cumpre. É o karma em movimento.',
    arquétipo: 'O Destino / O Ciclo Cósmico',
    orixá: 'Oxumarê',
    sephirah: 'Yesod',
    chakra: 'Plexo Solar',
    lição_espiritual: 'Os ciclos se completam - aceite a mudança como parte do plano divino.',
    qualidades: ['Ciclos', 'Destino', 'Mudança', 'Sorte', 'Karma'],
    afirmação: 'Eu aceito os ciclos da vida e confio no fluxo do destino.',
    cores: ['Amarelo', 'Azul', 'Verde'],
    dia_sagrado: 'Domingo',
  },
  'A Força': {
    arcano: 'A Força',
    numero_carta: 11,
    elemento: 'Fogo',
    significado_espiritual: 'A Força representa o fogo da coragem - o poder interior, a compaixão feroz, a gentileza que vence a brutalidade. É a força da alma.',
    arquétipo: 'O Corajoso / O Compassivo',
    orixá: 'Oxum',
    sephirah: 'Gevurah',
    chakra: 'Cardíaco',
    lição_espiritual: 'A verdadeira força está na gentileza e na coragem de ser vulnerável.',
    qualidades: ['Coragem', 'Compaixão', 'Poder interior', 'Paciência', 'Força da alma'],
    afirmação: 'Eu canalizo minha força interior com compaixão e coragem.',
    cores: ['Amarelo', 'Laranja', 'Branco'],
    dia_sagrado: 'Domingo',
  },
  'O Enforcado': {
    arcano: 'O Enforcado',
    numero_carta: 12,
    elemento: 'Água',
    significado_espiritual: 'O Enforcado é a água da rendição - o sacrifício, a nova perspectiva, a entrega ao fluxo. É o suspender-se para enxergar além.',
    arquétipo: 'O Sacrificado / O Martíris',
    orixá: 'Nanã',
    sephirah: 'Hod',
    chakra: 'Laríngeo',
    lição_espiritual: 'Às vezes é preciso se suspender para ganhar uma nova perspectiva.',
    qualidades: ['Sacrifício', 'Rendição', 'Nova perspectiva', 'Entrega', 'Aceitação'],
    afirmação: 'Eu me permito ser guiado pelo fluxo da vida com aceitação.',
    cores: ['Azul', 'Amarelo', 'Branco'],
    dia_sagrado: 'Segunda-feira',
  },
  'A Morte': {
    arcano: 'A Morte',
    numero_carta: 13,
    elemento: 'Água',
    significado_espiritual: 'A Morte representa a água da transformação - o fim de um ciclo, a purificação necessária, a renaissance através da dissolução. É a metamorfose inevitável.',
    arquétipo: 'O Transformador / O Fênix',
    orixá: 'Omulu',
    sephirah: 'Tiphereth',
    chakra: 'Plexo Solar',
    lição_espiritual: 'A morte é apenas uma transformação - o que morre abre espaço para o novo.',
    qualidades: ['Transformação', 'Purificação', 'Fim de ciclo', 'Metamorfose', 'Ressurreição'],
    afirmação: 'Eu abraço a transformação e libero o que precisa morrer em mim.',
    cores: ['Preto', 'Azul escuro', 'Branco'],
    dia_sagrado: 'Segunda-feira',
  },
  'A Temperança': {
    arcano: 'A Temperança',
    numero_carta: 14,
    elemento: 'Água',
    significado_espiritual: 'A Temperança é a água do equilíbrio - a moderação, a cura, a integração dos opostos. É a alquimia de harmonizar extremos.',
    arquétipo: 'O Equilibrador / O Alquimista',
    orixá: 'Iemanjá',
    sephirah: 'Netzach',
    chakra: 'Cardíaco',
    lição_espiritual: 'O equilíbrio vem da integração harmoniosa dos opostos dentro de você.',
    qualidades: ['Equilíbrio', 'Moderação', 'Cura', 'Integração', 'Alquimia'],
    afirmação: 'Eu harmonizo os opostos dentro de mim e encontro o ponto central.',
    cores: ['Azul', 'Verde', 'Amarelo'],
    dia_sagrado: 'Segunda-feira',
  },
  'O Diabo': {
    arcano: 'O Diabo',
    numero_carta: 15,
    elemento: 'Terra',
    significado_espiritual: 'O Diabo representa a terra da materialidade densa - a armadilha, a dependência, o medo. É o lado sombrio da matéria e da ignorância.',
    arquétipo: 'O Trickster / A Armadilha',
    orixá: 'Exu',
    sephirah: 'Yesod',
    chakra: 'Plexo Solar',
    lição_espiritual: 'Reconheça suas cadeias para poder libertar-se delas.',
    qualidades: ['Armadilha', 'Dependência', 'Materialidade', 'Sombras', 'Libertação'],
    afirmação: 'Eu reconheço minhas armadilhas e escolho a libertação.',
    cores: ['Vermelho', 'Preto', 'Branco'],
    dia_sagrado: 'Terça-feira',
  },
  'A Torre': {
    arcano: 'A Torre',
    numero_carta: 16,
    elemento: 'Fogo',
    significado_espiritual: 'A Torre é o fogo da destruição criativa - a revelação súbita, a queda das ilusões, a purificação pela crise. É a verdade que destrói para reconstruir.',
    arquétipo: 'O Catalisador / O Dilúvio',
    orixá: 'Xangô',
    sephirah: 'Hod',
    chakra: 'Plexo Solar',
    lição_espiritual: 'A destruição da torre é na verdade uma libertação das ilusões.',
    qualidades: ['Destruição criativa', 'Revelação', 'Crise', 'Purificação', 'Renovação'],
    afirmação: 'Eu permito que as ilusões caiam para que a verdade se revele.',
    cores: ['Vermelho', 'Laranja', 'Amarelo'],
    dia_sagrado: 'Terça-feira',
  },
  'A Estrela': {
    arcano: 'A Estrela',
    numero_carta: 17,
    elemento: 'Água',
    significado_espiritual: 'A Estrela é a água da esperança - a inspiração, a cura, a renovação da fé. É a luz que brilha após a tempestade.',
    arquétipo: 'O Iluminado / O Esperançoso',
    orixá: 'Oxum',
    sephirah: 'Hod',
    chakra: 'Ajna',
    lição_espiritual: 'Após a escuridão, a estrela traz esperança e renovação.',
    qualidades: ['Esperança', 'Inspiração', 'Cura', 'Renovação', 'Luz'],
    afirmação: 'Eu me abro para a luz da esperança que renova minha alma.',
    cores: ['Azul claro', 'Amarelo', 'Branco'],
    dia_sagrado: 'Segunda-feira',
  },
  'A Lua': {
    arcano: 'A Lua',
    numero_carta: 18,
    elemento: 'Água',
    significado_espiritual: 'A Lua é a água do inconsciente - as ilusões, os medos ocultos, os sonhos. É o reino das sombras e do mistério.',
    arquétipo: 'O Iludido / O Sonhador',
    orixá: 'Iemanjá',
    sephirah: 'Yesod',
    chakra: 'Ajna',
    lição_espiritual: 'Confie na luz da verdade mesmo quando as sombras parecem reais.',
    qualidades: ['Ilusão', 'Inconsciente', 'Medo', 'Sonho', 'Intuição'],
    afirmação: 'Eu navego pelas águas do inconsciente com clareza e discernimento.',
    cores: ['Prata', 'Azul escuro', 'Branco'],
    dia_sagrado: 'Segunda-feira',
  },
  'O Sol': {
    arcano: 'O Sol',
    numero_carta: 19,
    elemento: 'Fogo',
    significado_espiritual: 'O Sol é o fogo da verdade - a alegria, o sucesso, a vitalidade, a criança interior. É a luz que tudo cura e alegra.',
    arquétipo: 'O Iluminado / O Celebrante',
    orixá: 'Oxumarê',
    sephirah: 'Tiphereth',
    chakra: 'Solar',
    lição_espiritual: 'A luz do sol traz alegria e vitalidade quando você se conecta com a criança interior.',
    qualidades: ['Alegria', 'Sucesso', 'Vitalidade', 'Verdade', 'Luz'],
    afirmação: 'Eu me baño na luz do sol que aquece e alegra minha alma.',
    cores: ['Dourado', 'Amarelo', 'Laranja'],
    dia_sagrado: 'Domingo',
  },
  'O Julgamento': {
    arcano: 'O Julgamento',
    numero_carta: 20,
    elemento: 'Fogo',
    significado_espiritual: 'O Julgamento é o fogo da redenção - o despertar, a renovação, o chamado para uma nova vida. É o anjo que anuncia a ressurreição.',
    arquétipo: 'O Redimido / O Renascido',
    orixá: 'Omulu',
    sephirah: 'Malkuth',
    chakra: 'Coronário',
    lição_espiritual: 'O despertar traz redenção - responda ao chamado para renascer.',
    qualidades: ['Redenção', 'Despertar', 'Renovação', 'Chamado', 'Ressurreição'],
    afirmação: 'Eu respondo ao chamado da minha alma e me permito renascer.',
    cores: ['Branco', 'Dourado', 'Azul claro'],
    dia_sagrado: 'Domingo',
  },
  'O Mundo': {
    arcano: 'O Mundo',
    numero_carta: 21,
    elemento: 'Éter',
    significado_espiritual: 'O Mundo é o éter da completude - a integração, a accomplishment, a paz. É o retorno ao paraíso, a dança cósmica completada.',
    arquétipo: 'O Integrado / O Completo',
    orixá: 'Iemanjá',
    sephirah: 'Kether',
    chakra: 'Coronário',
    lição_espiritual: 'A completude vem quando você integra todas as lições da jornada.',
    qualidades: ['Completude', 'Integração', 'Accomplishment', 'Paz', 'Dança cósmica'],
    afirmação: 'Eu celebro a completude de minha jornada e a paz que isso traz.',
    cores: ['Verde', 'Azul', 'Dourado'],
    dia_sagrado: 'Domingo',
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(TAROT_ELEMENT_MAP);
Object.values(TAROT_ELEMENT_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * All 22 Major Arcana arcano names
 */
export const TODOS_ARCANOS: readonly string[] = Object.freeze([
  'O Louco', 'O Mago', 'A Sacerdotisa', 'A Imperatriz', 'O Imperador',
  'O Papa', 'O Enamorado', 'O Carro', 'A Justiça', 'O Eremita',
  'A Roda da Fortuna', 'A Força', 'O Enforcado', 'A Morte', 'A Temperança',
  'O Diabo', 'A Torre', 'A Estrela', 'A Lua', 'O Sol',
  'O Julgamento', 'O Mundo',
]);

/**
 * Normalizes arcano name for consistent lookup.
 * Handles variations like accents, case, and common alternatives.
 */
function normalizarArcano(arcano: string): string | null {
  if (!arcano) return null;

  const normalizado = arcano.trim().toLowerCase();

  // Direct match
  for (const key of Object.keys(TAROT_ELEMENT_MAP)) {
    if (key.toLowerCase() === normalizado) {
      return key;
    }
  }

  // Handle common variations
  const variations: Record<string, string> = {
    'louco': 'O Louco',
    'mago': 'O Mago',
    'sacerdotisa': 'A Sacerdotisa',
    'imperatriz': 'A Imperatriz',
    'imperador': 'O Imperador',
    'papa': 'O Papa',
    'hierofante': 'O Papa',
    'enamorado': 'O Enamorado',
    'amante': 'O Enamorado',
    'carro': 'O Carro',
    'justiça': 'A Justiça',
    'eremita': 'O Eremita',
    'roda': 'A Roda da Fortuna',
    'roda da fortuna': 'A Roda da Fortuna',
    'força': 'A Força',
    'enforcado': 'O Enforcado',
    'morte': 'A Morte',
    'temperança': 'A Temperança',
    'diabo': 'O Diabo',
    'torre': 'A Torre',
    'estrela': 'A Estrela',
    'lua': 'A Lua',
    'sol': 'O Sol',
    'julgamento': 'O Julgamento',
    'juízo': 'O Julgamento',
    'mundo': 'O Mundo',
  };

  return variations[normalizado] || null;
}

/**
 * Get the tarot-element mapping for a given arcano name.
 * @param arcano - Major Arcana arcano name (e.g., 'O Sol', 'A Lua')
 * @returns TarotElementMapping or null if not found
 */
export function getTarotElement(arcano: string): TarotElementMapping | null {
  const normalizado = normalizarArcano(arcano);
  if (!normalizado) return null;
  return TAROT_ELEMENT_MAP[normalizado] || null;
}

/**
 * Get the element for a given arcano name.
 * @param arcano - Major Arcana arcano name
 * @returns Element name or null if not found
 */
export function getElementFromArcano(arcano: string): Elemento | null {
  return getTarotElement(arcano)?.elemento ?? null;
}

/**
 * Get the arcano for a given element.
 * @param elemento - Element name (e.g., 'Fogo', 'Água', 'Ar', 'Terra', 'Éter')
 * @returns Array of TarotElementMapping for that element
 */
export function getArcanoByElement(elemento: string): TarotElementMapping[] {
  const elementoNormalizado = elemento.trim().toLowerCase();
  return Object.values(TAROT_ELEMENT_MAP).filter(
    (mapping) => mapping.elemento.toLowerCase() === elementoNormalizado
  );
}

/**
 * Get all tarot-element mappings.
 * @returns Array of all correlation mappings
 */
export function getAllTarotElements(): TarotElementMapping[] {
  return Object.values(TAROT_ELEMENT_MAP).sort((a, b) => a.numero_carta - b.numero_carta);
}

/**
 * Get all arcano names used in the mapping.
 * @returns Array of arcano names
 */
export function getAllArcanos(): string[] {
  return Object.values(TAROT_ELEMENT_MAP).map((m) => m.arcano);
}

/**
 * Get all elements used in tarot correlations.
 * @returns Array of unique element names
 */
export function getAllElements(): Elemento[] {
  const elements = new Set(Object.values(TAROT_ELEMENT_MAP).map((m) => m.elemento));
  return Array.from(elements) as Elemento[];
}

/**
 * Get the spiritual meaning for a given arcano.
 * @param arcano - Major Arcana arcano name
 * @returns Spiritual meaning or null if not found
 */
export function getSignificadoFromArcano(arcano: string): string | null {
  return getTarotElement(arcano)?.significado_espiritual ?? null;
}

/**
 * Get the orixá for a given arcano.
 * @param arcano - Major Arcana arcano name
 * @returns Orixá name or null if not found
 */
export function getOrixaFromArcano(arcano: string): string | null {
  return getTarotElement(arcano)?.orixá ?? null;
}

/**
 * Get the sephirah for a given arcano.
 * @param arcano - Major Arcana arcano name
 * @returns Sephirah name or null if not found
 */
export function getSephirahFromArcano(arcano: string): string | null {
  return getTarotElement(arcano)?.sephirah ?? null;
}

/**
 * Get the chakra for a given arcano.
 * @param arcano - Major Arcana arcano name
 * @returns Chakra name or null if not found
 */
export function getChakraFromArcano(arcano: string): string | null {
  return getTarotElement(arcano)?.chakra ?? null;
}

/**
 * Get the card number for a given arcano.
 * @param arcano - Major Arcana arcano name
 * @returns Card number or null if not found
 */
export function getNumeroCartaFromArcano(arcano: string): number | null {
  return getTarotElement(arcano)?.numero_carta ?? null;
}

/**
 * Check if an arcano exists in the mapping.
 * @param arcano - Arcano name to check
 * @returns True if arcano exists
 */
export function hasTarotElement(arcano: string): boolean {
  return normalizarArcano(arcano) !== null;
}

/**
 * Get arcano by card number.
 * @param numero - Card number (0-21)
 * @returns Arcano name or null if not found
 */
export function getArcanoByNumero(numero: number): string | null {
  const mapping = Object.values(TAROT_ELEMENT_MAP).find(
    (m) => m.numero_carta === numero
  );
  return mapping?.arcano ?? null;
}

export default {
  getTarotElement,
  getElementFromArcano,
  getArcanoByElement,
  getAllTarotElements,
  getAllArcanos,
  getAllElements,
  getSignificadoFromArcano,
  getOrixaFromArcano,
  getSephirahFromArcano,
  getChakraFromArcano,
  getNumeroCartaFromArcano,
  hasTarotElement,
  getArcanoByNumero,
  TAROT_ELEMENT_MAP,
  TODOS_ARCANOS,
};
