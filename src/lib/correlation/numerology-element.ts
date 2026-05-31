/**
 * Numerology-Element Spiritual Correlation Module
 *
 * Maps numerology numbers (1-13) to their elemental correspondences.
 * Each number carries specific vibrational signatures aligned with
 * elements in the Cabala dos Caminhos spiritual system.
 */

export type ElementoTipo = 'fogo' | 'água' | 'terra' | 'ar' | 'éter';

export interface NumerologyElement {
  numero: number;
  elemento: ElementoTipo;
  elemento_nome: string;
  elemento_english: string;
  significado_espiritual: string;
  arquetipo: string;
  orixa: string;
  sephirah: string;
  chakra: string;
  planeta: string;
  cor: string;
  direcao: string;
  qualidades: {
    forca: string;
    desafio: string;
    licao: string;
    afirmacao: string;
  };
  energia: {
    tipo: 'Quente' | 'Frio' | 'Neutro';
    polaridade: 'Yang' | 'Yin' | 'Equilibrado';
  };
}

// fogo: 1, 3, 6, 12
// água: 2, 5, 9
// terra: 4, 10, 13
// ar: 7, 8
// éter: 11

export const NUMEROLOGY_ELEMENT_MAP: Record<number, NumerologyElement> = {
  1: {
    numero: 1,
    elemento: 'fogo',
    elemento_nome: 'Fogo',
    elemento_english: 'Fire',
    significado_espiritual:
      'O número 1 é a chama da vontade divina, a centelha criadora que inicia toda manifestação. Representa a liderança, a coragem e o poder de transformar sonhos em realidade através da intenção pura.',
    arquetipo: 'O Guerreiro da Luz / O Criador',
    orixa: 'Xangô',
    sephirah: 'Geburah',
    chakra: '3º Plexo Solar (Manipura)',
    planeta: 'Marte',
    cor: 'Vermelho',
    direcao: 'Sul',
    qualidades: {
      forca: 'Determinação, coragem, paixão transformadora, capacidade de manifestar',
      desafio: 'Impaciência, agressividade, controle excessivo, fanatismo',
      licao: 'Canalizar a energia do fogo em propósito construtivo e amoroso',
      afirmacao: 'Eu transformo minha paixão em ação sagrada e serviço amoroso',
    },
    energia: { tipo: 'Quente', polaridade: 'Yang' },
  },
  2: {
    numero: 2,
    elemento: 'água',
    elemento_nome: 'Água',
    elemento_english: 'Water',
    significado_espiritual:
      'O número 2 é a sabedoria emocional, a fluidez do universo e a compaixão profunda. Representa a receptividade, a intuição e a capacidade de acolher as águas da sabedoria divina.',
    arquetipo: 'O Guardião das Emoções / O Sábio Compassivo',
    orixa: 'Iemanjá',
    sephirah: 'Yesod',
    chakra: '2º Sacro (Svadhisthana)',
    planeta: 'Lua',
    cor: 'Azul',
    direcao: 'Oeste',
    qualidades: {
      forca: 'Intuição profunda, compaixão, adaptabilidade, sensibilidade',
      desafio: 'Dificuldade em estabelecer limites, volatilidade emocional',
      licao: 'Manter a clareza emocional sem perder a sensibilidade e conexão',
      afirmacao: 'Eu fluo com a vida mantendo minha essência e meus limites sagrados',
    },
    energia: { tipo: 'Frio', polaridade: 'Yin' },
  },
  3: {
    numero: 3,
    elemento: 'fogo',
    elemento_nome: 'Fogo',
    elemento_english: 'Fire',
    significado_espiritual:
      'O número 3 é a expressão criativa sagrada, a trindade divina em ação. Representa a comunicação, a alegria e a capacidade de transformar a energia em criação artística e espiritual.',
    arquetipo: 'O Guerreiro da Luz / O Artista Sagrado',
    orixa: 'Xangô',
    sephirah: 'Geburah',
    chakra: '3º Plexo Solar (Manipura)',
    planeta: 'Marte',
    cor: 'Vermelho',
    direcao: 'Sul',
    qualidades: {
      forca: 'Determinação, coragem, paixão transformadora, capacidade de manifestar',
      desafio: 'Impaciência, agressividade, controle excessivo, fanatismo',
      licao: 'Canalizar a energia do fogo em propósito construtivo e amoroso',
      afirmacao: 'Eu transformo minha paixão em ação sagrada e serviço amoroso',
    },
    energia: { tipo: 'Quente', polaridade: 'Yang' },
  },
  4: {
    numero: 4,
    elemento: 'terra',
    elemento_nome: 'Terra',
    elemento_english: 'Earth',
    significado_espiritual:
      'O número 4 é a estabilidade material, a ancoragem espiritual e a manifestação prática. Representa a construção de alicerces sólidos, o trabalho árduo sagrado e a perseverança divina.',
    arquetipo: 'O Fundador / O Ancestral',
    orixa: 'Oxóssi',
    sephirah: 'Malkuth',
    chakra: '1º Básico (Muladhara)',
    planeta: 'Saturno',
    cor: 'Verde',
    direcao: 'Norte',
    qualidades: {
      forca: 'Paciência, confiabilidade, prática, ancoramento, perseverança',
      desafio: 'Rigidez, materialismo, resistência a mudanças, apego ao passado',
      licao: 'Equilibrar estabilidade com flexibilidade e abertura à transformação',
      afirmacao: 'Eu sou abundante, merecedor de prosperidade e segurança material e espiritual',
    },
    energia: { tipo: 'Quente', polaridade: 'Yang' },
  },
  5: {
    numero: 5,
    elemento: 'água',
    elemento_nome: 'Água',
    elemento_english: 'Water',
    significado_espiritual:
      'O número 5 é a transformação alquímica, a liberdade sagrada e a mudança certa. Representa a adaptação, a curiosidade espiritual e a capacidade de fluir através das transformações da vida.',
    arquetipo: 'O Guardião das Emoções / O Alquimista',
    orixa: 'Iemanjá',
    sephirah: 'Yesod',
    chakra: '2º Sacro (Svadhisthana)',
    planeta: 'Lua',
    cor: 'Azul',
    direcao: 'Oeste',
    qualidades: {
      forca: 'Intuição profunda, compaixão, adaptabilidade, sensibilidade',
      desafio: 'Dificuldade em estabelecer limites, volatilidade emocional',
      licao: 'Manter a clareza emocional sem perder a sensibilidade e conexão',
      afirmacao: 'Eu fluo com a vida mantendo minha essência e meus limites sagrados',
    },
    energia: { tipo: 'Frio', polaridade: 'Yin' },
  },
  6: {
    numero: 6,
    elemento: 'fogo',
    elemento_nome: 'Fogo',
    elemento_english: 'Fire',
    significado_espiritual:
      'O número 6 é o amor harmônico, a responsabilidade sagrada e a paz divina. Representa a capacidade de irradiar luz e calor amoroso, criando harmonia nos relacionamentos e no lar espiritual.',
    arquetipo: 'O Guerreiro da Luz / O Guardião do Lar',
    orixa: 'Xangô',
    sephirah: 'Geburah',
    chakra: '3º Plexo Solar (Manipura)',
    planeta: 'Marte',
    cor: 'Vermelho',
    direcao: 'Sul',
    qualidades: {
      forca: 'Determinação, coragem, paixão transformadora, capacidade de manifestar',
      desafio: 'Impaciência, agressividade, controle excessivo, fanatismo',
      licao: 'Canalizar a energia do fogo em propósito construtivo e amoroso',
      afirmacao: 'Eu transformo minha paixão em ação sagrada e serviço amoroso',
    },
    energia: { tipo: 'Quente', polaridade: 'Yang' },
  },
  7: {
    numero: 7,
    elemento: 'ar',
    elemento_nome: 'Ar',
    elemento_english: 'Air',
    significado_espiritual:
      'O número 7 é a sabedoria introspectiva, o misticismo profundo e a contemplação sagrada. Representa a busca interior, a análise espiritual e a conexão com os mistérios do universo.',
    arquetipo: 'O Mensageiro / O Filósofo',
    orixa: 'Iansã',
    sephirah: 'Netzach',
    chakra: '5º Laríngeo (Vishuddha)',
    planeta: 'Mercúrio',
    cor: 'Amarelo',
    direcao: 'Leste',
    qualidades: {
      forca: 'Comunicação clara, objetividade, visão ampla, intelectualidade',
      desafio: 'Superficialidade, indecisão, excesso de análise, desancoramento',
      licao: 'Ancorar pensamentos em ação concreta e consistente com o propósito',
      afirmacao: 'Eu comunico minha verdade com clareza, amor e sabedoria divina',
    },
    energia: { tipo: 'Neutro', polaridade: 'Equilibrado' },
  },
  8: {
    numero: 8,
    elemento: 'ar',
    elemento_nome: 'Ar',
    elemento_english: 'Air',
    significado_espiritual:
      'O número 8 é o poder pessoal, a autoridade interior e a justiça kármica. Representa a capacidade de manifestar abundância, a sabedoria prática e o equilíbrio entre o céu e a terra.',
    arquetipo: 'O Mensageiro / O Justiceiro',
    orixa: 'Iansã',
    sephirah: 'Netzach',
    chakra: '5º Laríngeo (Vishuddha)',
    planeta: 'Mercúrio',
    cor: 'Amarelo',
    direcao: 'Leste',
    qualidades: {
      forca: 'Comunicação clara, objetividade, visão ampla, intelectualidade',
      desafio: 'Superficialidade, indecisão, excesso de análise, desancoramento',
      licao: 'Ancorar pensamentos em ação concreta e consistente com o propósito',
      afirmacao: 'Eu comunico minha verdade com clareza, amor e sabedoria divina',
    },
    energia: { tipo: 'Neutro', polaridade: 'Equilibrado' },
  },
  9: {
    numero: 9,
    elemento: 'água',
    elemento_nome: 'Água',
    elemento_english: 'Water',
    significado_espiritual:
      'O número 9 é a iluminação universal, a compaixão infinita e o encerramento sagrado. Representa a sabedoria conquistada, a generosidade espiritual e a capacidade de transcender limites.',
    arquetipo: 'O Guardião das Emoções / O Iluminado',
    orixa: 'Iemanjá',
    sephirah: 'Yesod',
    chakra: '2º Sacro (Svadhisthana)',
    planeta: 'Lua',
    cor: 'Azul',
    direcao: 'Oeste',
    qualidades: {
      forca: 'Intuição profunda, compaixão, adaptabilidade, sensibilidade',
      desafio: 'Dificuldade em estabelecer limites, volatilidade emocional',
      licao: 'Manter a clareza emocional sem perder a sensibilidade e conexão',
      afirmacao: 'Eu fluo com a vida mantendo minha essência e meus limites sagrados',
    },
    energia: { tipo: 'Frio', polaridade: 'Yin' },
  },
  10: {
    numero: 10,
    elemento: 'terra',
    elemento_nome: 'Terra',
    elemento_english: 'Earth',
    significado_espiritual:
      'O número 10 é a renovação e transformação, o recomeço sagrado e a nova era. Representa a sabedoria divina recebida, a capacidade de renascimento e a manifestação de novos ciclos.',
    arquetipo: 'O Fundador / O Renascido',
    orixa: 'Oxóssi',
    sephirah: 'Malkuth',
    chakra: '1º Básico (Muladhara)',
    planeta: 'Saturno',
    cor: 'Verde',
    direcao: 'Norte',
    qualidades: {
      forca: 'Paciência, confiabilidade, prática, ancoramento, perseverança',
      desafio: 'Rigidez, materialismo, resistência a mudanças, apego ao passado',
      licao: 'Equilibrar estabilidade com flexibilidade e abertura à transformação',
      afirmacao: 'Eu sou abundante, merecedor de prosperidade e segurança material e espiritual',
    },
    energia: { tipo: 'Quente', polaridade: 'Yang' },
  },
  11: {
    numero: 11,
    elemento: 'éter',
    elemento_nome: 'Éter',
    elemento_english: 'Ether',
    significado_espiritual:
      'O número 11 é a conexão direta com a Fonte criadora, o número mestre da iluminação espiritual. Carrega a intuição desperta e o channeling da vontade divina para transformação coletiva.',
    arquetipo: 'O Canalizador / O Desperto',
    orixa: 'Oxalá',
    sephirah: 'Kether',
    chakra: '7º Coronário (Sahasrara)',
    planeta: 'Sol',
    cor: 'Branco-dourado',
    direcao: 'Centro',
    qualidades: {
      forca: 'Sabedoria transcendental, espiritualidade profunda, intuição desperta',
      desafio: 'Desconexão da realidade terrena, idealismo excessivo, vulnerabilidade',
      licao: 'Manifestar a luz espiritual no mundo físico sem perder a transcendência',
      afirmacao: 'Eu sou um canal de luz e paz divina que ilumina o mundo ao meu redor',
    },
    energia: { tipo: 'Neutro', polaridade: 'Equilibrado' },
  },
  12: {
    numero: 12,
    elemento: 'fogo',
    elemento_nome: 'Fogo',
    elemento_english: 'Fire',
    significado_espiritual:
      'O número 12 é a justiça divina, o sacrifício sagrado e a ordem cósmica. Representa a aplicação da lei espiritual, o equilíbrio entre retribuição e misericórdia e a transformação pela prova.',
    arquetipo: 'O Guerreiro da Luz / O Executor da Lei',
    orixa: 'Xangô',
    sephirah: 'Geburah',
    chakra: '3º Plexo Solar (Manipura)',
    planeta: 'Marte',
    cor: 'Vermelho',
    direcao: 'Sul',
    qualidades: {
      forca: 'Determinação, coragem, paixão transformadora, capacidade de manifestar',
      desafio: 'Impaciência, agressividade, controle excessivo, fanatismo',
      licao: 'Canalizar a energia do fogo em propósito construtivo e amoroso',
      afirmacao: 'Eu transformo minha paixão em ação sagrada e serviço amoroso',
    },
    energia: { tipo: 'Quente', polaridade: 'Yang' },
  },
  13: {
    numero: 13,
    elemento: 'terra',
    elemento_nome: 'Terra',
    elemento_english: 'Earth',
    significado_espiritual:
      'O número 13 é a evolução através da morte e renascimento, a transformação radical e a nova vida. Representa a coragem de atravessar o umbral, deixando o velho para nascer de novo.',
    arquetipo: 'O Fundador / O Renascido das Cinzas',
    orixa: 'Oxóssi',
    sephirah: 'Malkuth',
    chakra: '1º Básico (Muladhara)',
    planeta: 'Saturno',
    cor: 'Verde',
    direcao: 'Norte',
    qualidades: {
      forca: 'Paciência, confiabilidade, prática, ancoramento, perseverança',
      desafio: 'Rigidez, materialismo, resistência a mudanças, apego ao passado',
      licao: 'Equilibrar estabilidade com flexibilidade e abertura à transformação',
      afirmacao: 'Eu sou abundante, merecedor de prosperidade e segurança material e espiritual',
    },
    energia: { tipo: 'Quente', polaridade: 'Yang' },
  },
};

Object.freeze(NUMEROLOGY_ELEMENT_MAP);
Object.values(NUMEROLOGY_ELEMENT_MAP).forEach((m) => Object.freeze(m));

export function getNumerologyElement(n: number): NumerologyElement | undefined {
  return NUMEROLOGY_ELEMENT_MAP[n];
}

export function getAllNumerologyElements(): NumerologyElement[] {
  return Object.values(NUMEROLOGY_ELEMENT_MAP);
}

export function getElementNumerology(n: number): string | null {
  return NUMEROLOGY_ELEMENT_MAP[n]?.elemento_nome ?? null;
}

export function getNumerologyArquetipo(n: number): string | null {
  return NUMEROLOGY_ELEMENT_MAP[n]?.arquetipo ?? null;
}

export function getNumerologySignificado(n: number): string | null {
  return NUMEROLOGY_ELEMENT_MAP[n]?.significado_espiritual ?? null;
}

export function getNumerologyQualidades(n: number): NumerologyElement['qualidades'] | null {
  return NUMEROLOGY_ELEMENT_MAP[n]?.qualidades ?? null;
}

export function getNumerologyEnergia(n: number): 'Quente' | 'Frio' | 'Neutro' | null {
  return NUMEROLOGY_ELEMENT_MAP[n]?.energia.tipo ?? null;
}

export function getNumerologyPolaridade(n: number): 'Yang' | 'Yin' | 'Equilibrado' | null {
  return NUMEROLOGY_ELEMENT_MAP[n]?.energia.polaridade ?? null;
}

export function getAllNumerologyNumbers(): number[] {
  return Array.from({ length: 13 }, (_, i) => i + 1);
}

export function getAllElementsFromNumerology(): ElementoTipo[] {
  return [...new Set(Object.values(NUMEROLOGY_ELEMENT_MAP).map((m) => m.elemento))];
}

export default {
  getNumerologyElement,
  getAllNumerologyElements,
  getElementNumerology,
  getNumerologyArquetipo,
  getNumerologySignificado,
  getNumerologyQualidades,
  getNumerologyEnergia,
  getNumerologyPolaridade,
  getAllNumerologyNumbers,
  getAllElementsFromNumerology,
  NUMEROLOGY_ELEMENT_MAP,
};
