/**
 * Tarot Major Arcana - Sephirot Spiritual Correlation Mapping
 * Correlates the 22 Major Arcana cards to the 10 Sephiroth of the Tree of Life
 * Based on traditional Kabbalistic correspondences and the paths between Sephiroth
 */

/** Element type for spiritual correlations */
export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

/**
 * Represents the correlation between a Major Arcana card and its Sephirot properties
 */
export interface TarotSephirotMapping {
  /** The Major Arcana arcano name */
  arcano: string;
  /** Card number in the Major Arcana (0-21) */
  numero_carta: number;
  /** The associated Sephirah name */
  sephirah: string;
  /** The corresponding classical element */
  elemento: Elemento;
  /** Path number on the Tree of Life (22 paths) */
  numero_caminho: number;
  /** Spiritual energy and quality of the arcano-sephirah connection */
  energia_espiritual: string;
  /** Key spiritual lesson */
  lição_espiritual: string;
  /** Archetype represented by this arcano-sephirah pair */
  arquétipo: string;
}

// ─── Major Arcana to Sephirot Mapping ─────────────────────────────────────────

/**
 * Complete mapping of Major Arcana cards to their Sephirot correspondences.
 * Based on the 22 paths of the Tree of Life and traditional Kabbalistic correspondences.
 */
export const TAROT_SEPHIROT_MAPPINGS: Record<string, TarotSephirotMapping> = {
  'O Louco': {
    arcano: 'O Louco',
    numero_carta: 0,
    sephirah: 'Kether',
    elemento: 'Éter',
    numero_caminho: 0,
    energia_espiritual: 'Iniciação Divina / Espaço Infinito / Potencial Puro / Além do Tempo',
    lição_espiritual: 'O espírito precisa se libertar de todas as amarras para alcançar a iluminação.',
    arquétipo: 'O Iniciado / O Louco Sagrado / O Viajante Cósmico',
  },
  'O Mago': {
    arcano: 'O Mago',
    numero_carta: 1,
    sephirah: 'Kether',
    elemento: 'Água',
    numero_caminho: 1,
    energia_espiritual: 'Vontade Divina / Poder de Manifestação / Mestria das Ferramentas Sagradas',
    lição_espiritual: 'Você possui todo o poder necessário para manifestar seus desejos. A ferramenta está em suas mãos.',
    arquétipo: 'O Mago / O Criador / O Arquiteto da Realidade',
  },
  'A Alta Sacerdotisa': {
    arcano: 'A Alta Sacerdotisa',
    numero_carta: 2,
    sephirah: 'Chokmah',
    elemento: 'Água',
    numero_caminho: 2,
    energia_espiritual: 'Sabedoria Oculta / Intuição Profunda / Véu entre os Mundos / Conhecimento Lunar',
    lição_espiritual: 'Confie na sua intuição e na sabedoria que vem do silêncio interior.',
    arquétipo: 'A Sacerdotisa / A Guardiã dos Mistérios / A Profetisa',
  },
  'A Imperatriz': {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    sephirah: 'Binah',
    elemento: 'Terra',
    numero_caminho: 3,
    energia_espiritual: 'Fertilidade Divina / Abundância Natural / Criação Materna / Beleza Sagrada',
    lição_espiritual: 'A abundância é seu direito de nascença quando você se conecta com a energia criativa do universo.',
    arquétipo: 'A Mãe Divina / A Criadora / A Nutridora Universal',
  },
  'O Imperador': {
    arcano: 'O Imperador',
    numero_carta: 4,
    sephirah: 'Chesed',
    elemento: 'Fogo',
    numero_caminho: 4,
    energia_espiritual: 'Autoridade Sagrada / Estrutura Divina / Expansão Abundante / Ordem no Caos',
    lição_espiritual: 'A verdadeira autoridade vem do domínio de si mesmo e da criação de estruturas que servem ao bem maior.',
    arquétipo: 'O Pai / O Governante / O Estruturador Divino',
  },
  'O Hierofante': {
    arcano: 'O Hierofante',
    numero_carta: 5,
    sephirah: 'Geburah',
    elemento: 'Fogo',
    numero_caminho: 5,
    energia_espiritual: 'Sabedoria Tradicional / Mestre Espiritual / Tradição Sagrada / Lei Divina',
    lição_espiritual: 'A sabedoria dos mestres ancestrais aguarda sua busca. Pergunte e receberá.',
    arquétipo: 'O Sacerdote / O Mestre Espiritual / O Tradicionalista',
  },
  'Os Enamorados': {
    arcano: 'Os Enamorados',
    numero_carta: 6,
    sephirah: 'Tiphereth',
    elemento: 'Ar',
    numero_caminho: 6,
    energia_espiritual: 'União das Polaridades / Amor Sagrado / Escolha Consciente / Harmonia Interior',
    lição_espiritual: 'O amor verdadeiro requer escolha consciente. Selecione o que eleva sua alma.',
    arquétipo: 'O Amante / A União Sagrada / O Reconciliador',
  },
  'O Carro': {
    arcano: 'O Carro',
    numero_carta: 7,
    sephirah: 'Netzach',
    elemento: 'Água',
    numero_caminho: 7,
    energia_espiritual: 'Vitória Triunfante / Vontade Focada / Controle das Polaridades / Determinação',
    lição_espiritual: 'O sucesso vem da harmonia entre ação decisiva e receptividade paciente.',
    arquétipo: 'O Guerreiro / O Vitorioso / O Conquistador',
  },
  'A Justiça': {
    arcano: 'A Justiça',
    numero_carta: 8,
    sephirah: 'Hod',
    elemento: 'Ar',
    numero_caminho: 8,
    energia_espiritual: 'Lei Cósmica / Equilíbrio Kármico / Verdade Inevitável / Integridade Divina',
    lição_espiritual: 'Suas ações têm consequências inevitáveis. Escolha sabedor para semear o que deseja colher.',
    arquétipo: 'A Justiça / O Juiz Cósmico / O Equilibrador',
  },
  'O Eremita': {
    arcano: 'O Eremita',
    numero_carta: 9,
    sephirah: 'Yesod',
    elemento: 'Terra',
    numero_caminho: 9,
    energia_espiritual: 'Sabedoria Solitária / Luz Interior / Iluminação Íntima / Profundidade Subconsciente',
    lição_espiritual: 'Na quietude da alma, a luz da verdade se revela. Não tema a solidão - ela é sua mestra.',
    arquétipo: 'O Sábio / O Iluminado / O Caminhante Solitário',
  },
  'A Roda da Fortuna': {
    arcano: 'A Roda da Fortuna',
    numero_carta: 10,
    sephirah: 'Malkuth',
    elemento: 'Fogo',
    numero_caminho: 10,
    energia_espiritual: 'Ciclos Cósmicos / Destino em Movimento / Lei de Causa e Efeito / Mudança Inevitável',
    lição_espiritual: 'A roda sempre gira. O que foi enterrado pode renascer. Aceite os ciclos com sabedoria.',
    arquétipo: 'O Destino / A Roda Cósmica / O Gestor do Karma',
  },
  'A Força': {
    arcano: 'A Força',
    numero_carta: 11,
    sephirah: 'Kether',
    elemento: 'Fogo',
    numero_caminho: 11,
    energia_espiritual: 'Coragem Interior / Domínio da Paixão / Poder da Gentileza / Força do Amor',
    lição_espiritual: 'A verdadeira força está em manter a calma quando tudo ao redor muda. A gentileza é mais poderosa que a força bruta.',
    arquétipo: 'A Força / A Guerreira Interior / A Domadora da Besta',
  },
  'O Enforcado': {
    arcano: 'O Enforcado',
    numero_carta: 12,
    sephirah: 'Binah',
    elemento: 'Água',
    numero_caminho: 12,
    energia_espiritual: 'Sacrifício Consciente / Nova Perspectiva / Entrega Divina / Rendição Sagrada',
    lição_espiritual: 'Às vezes é preciso render-se para receber. O sacrifício consciente abre novos caminhos.',
    arquétipo: 'O Martir / O Rendido / O Visionário Invertido',
  },
  'A Morte': {
    arcano: 'A Morte',
    numero_carta: 13,
    sephirah: 'Netzach',
    elemento: 'Água',
    numero_caminho: 13,
    energia_espiritual: 'Transformação Necessária / Fim de Ciclo / Renascimento / Morte do Ego',
    lição_espiritual: 'A morte não é fim, mas transformação. Solte o que precisa morrer para que o novo possa nascer.',
    arquétipo: 'A Transformadora / A Mestra da Morte e Renascimento / A Psicopompa',
  },
  'A Temperança': {
    arcano: 'A Temperança',
    numero_carta: 14,
    sephirah: 'Tiphereth',
    elemento: 'Água',
    numero_caminho: 14,
    energia_espiritual: 'Equilíbrio das Águas / Integração das Partes / Cicatrização / Mediação Divina',
    lição_espiritual: 'A verdadeira cura vem do equilíbrio entre extremos. Encontre o ponto médio sagrado.',
    arquétipo: 'A Curandeira / A Equilibradora / A Alquimista Interior',
  },
  'O Diabo': {
    arcano: 'O Diabo',
    numero_carta: 15,
    sephirah: 'Yesod',
    elemento: 'Fogo',
    numero_caminho: 15,
    energia_espiritual: 'Ilusão e Sombra / Cadeias do Ego / Projeção da Sombra / Reconhecimento da Sombra',
    lição_espiritual: 'Reconheça suas sombras sem julgamento. O que você reprime no escuro controla você na luz.',
    arquétipo: 'A Sombra / O Prisioneiro / O Reconhecedor da Escuridão',
  },
  'A Torre': {
    arcano: 'A Torre',
    numero_carta: 16,
    sephirah: 'Geburah',
    elemento: 'Fogo',
    numero_caminho: 16,
    energia_espiritual: 'Destruição Sagrada / Queda das Estruturas Falsas / Iluminação que Golpeia / Fogo Purificador',
    lição_espiritual: 'Às vezes o destino precisa quebrar nossa resistência antes de nos mostrar o caminho verdadeiro.',
    arquétipo: 'A Destruidora / A Torre dos Portais / A Iluminação Forçada',
  },
  'A Estrela': {
    arcano: 'A Estrela',
    numero_carta: 17,
    sephirah: 'Chesed',
    elemento: 'Ar',
    numero_caminho: 17,
    energia_espiritual: 'Esperança Renovada / Renovação Celeste / Luz Estelar / Guia Celestial',
    lição_espiritual: 'Após a tempestade, a estrela brilha. A esperança é sempre renovável quando você olha para o céu.',
    arquétipo: 'A Esperança / A Estrelada / A Renovadora Celeste',
  },
  'A Lua': {
    arcano: 'A Lua',
    numero_carta: 18,
    sephirah: 'Yesod',
    elemento: 'Água',
    numero_caminho: 18,
    energia_espiritual: 'Ilusão e Realidade / Intuição Profunda / Inconsciente / Caminho Oculto',
    lição_espiritual: 'Nem tudo é o que parece. Confie na sua intuição mesmo quando a realidade parece turva.',
    arquétipo: 'A Sonhadora / A Illuminada pela Lua / A Navegadora do Inconsciente',
  },
  'O Sol': {
    arcano: 'O Sol',
    numero_carta: 19,
    sephirah: 'Tiphereth',
    elemento: 'Fogo',
    numero_caminho: 19,
    energia_espiritual: 'Sucesso Manifesto / Vitalidade Solar / Clareza e Brilho / Alegria de Viver',
    lição_espiritual: 'Você é a luz do seu próprio caminho. O sol brilha quando você aceita quem você realmente é.',
    arquétipo: 'O Sol / O Illuminador / O Radiante',
  },
  'O Julgamento': {
    arcano: 'O Julgamento',
    numero_carta: 20,
    sephirah: 'Kether',
    elemento: 'Fogo',
    numero_caminho: 20,
    energia_espiritual: 'Ressurreição / Despertar Superior / Julgamento Final / Renascimento do Espírito',
    lição_espiritual: 'Você é chamado a um novo nível de consciência. Responda ao chamado com coração aberto.',
    arquétipo: 'O Arauto / O Juiz Interior / O Ressuscitado',
  },
  'O Mundo': {
    arcano: 'O Mundo',
    numero_carta: 21,
    sephirah: 'Malkuth',
    elemento: 'Terra',
    numero_caminho: 21,
    energia_espiritual: 'Completude / Realização Total / Integração do Caminho / Reino Manifestado',
    lição_espiritual: 'O ciclo está completo. Você integrou todas as lições. Celebre a realização do seu caminho.',
    arquétipo: 'O Mundo / A Realizada / A Completa',
  },
} as const;

Object.freeze(TAROT_SEPHIROT_MAPPINGS);
Object.values(TAROT_SEPHIROT_MAPPINGS).forEach(mapping => Object.freeze(mapping));

export function getTarotSephirot(arcano: string): TarotSephirotMapping | null {
  return TAROT_SEPHIROT_MAPPINGS[arcano] ?? null;
}

export function getTarotSephirotByNumber(numero: number): TarotSephirotMapping | null {
  const found = Object.values(TAROT_SEPHIROT_MAPPINGS).find(
    (mapping) => mapping.numero_carta === numero
  );
  return found ?? null;
}

export function getSephirotTarot(arcano: string): string | null {
  const mapping = TAROT_SEPHIROT_MAPPINGS[arcano];
  return mapping?.sephirah ?? null;
}

export function getTarotBySephirah(sephirah: string): TarotSephirotMapping[] {
  return Object.values(TAROT_SEPHIROT_MAPPINGS).filter(
    (mapping) => mapping.sephirah.toLowerCase() === sephirah.toLowerCase()
  );
}

export function getTarotByElement(elemento: string): TarotSephirotMapping[] {
  const normalized = elemento
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

  const elementMap: Record<string, Elemento> = {
    fogo: 'Fogo',
    agua: 'Água',
    terra: 'Terra',
    ar: 'Ar',
    eter: 'Éter',
  };

  const key = elementMap[normalized];
  if (!key) return [];

  return Object.values(TAROT_SEPHIROT_MAPPINGS).filter(
    (mapping) => mapping.elemento === key
  );
}

export function getAllTarotSephiroths(): TarotSephirotMapping[] {
  return Object.values(TAROT_SEPHIROT_MAPPINGS).sort(
    (a, b) => a.numero_carta - b.numero_carta
  );
}

export function hasTarotSephirot(arcano: string): boolean {
  return arcano in TAROT_SEPHIROT_MAPPINGS;
}

export function getAllSephiroth(): string[] {
  const sephiroth = new Set<string>();
  Object.values(TAROT_SEPHIROT_MAPPINGS).forEach((mapping) => {
    sephiroth.add(mapping.sephirah);
  });
  return Array.from(sephiroth).sort();
}

export function getAllElements(): Elemento[] {
  const elements = new Set<Elemento>();
  Object.values(TAROT_SEPHIROT_MAPPINGS).forEach((mapping) => {
    elements.add(mapping.elemento);
  });
  return Array.from(elements);
}
