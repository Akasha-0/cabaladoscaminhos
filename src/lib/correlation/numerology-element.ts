/**
 * Numerology-Element Spiritual Correlation Module
 *
 * Maps numerology numbers (1-13) to their elemental correspondences.
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

// fogo: 1,3,6,12  água: 2,5,9  terra: 4,10,13  ar: 7,8  éter: 11

export const NUMEROLOGY_ELEMENT_MAP: Record<number, NumerologyElement> = {
  1: {
    numero: 1, elemento: 'fogo', elemento_nome: 'Fogo', elemento_english: 'Fire',
    significado_espiritual: 'O número 1 é a chama da vontade divina, a centelha criadora que inicia toda manifestação.',
    arquetipo: 'O Guerreiro da Luz / O Criador', orixa: 'Xangô', sephirah: 'Geburah',
    chakra: '3º Plexo Solar (Manipura)', planeta: 'Marte', cor: 'Vermelho', direcao: 'Sul',
    qualidades: { forca: 'Determinação, coragem, paixão transformadora', desafio: 'Impaciência, agressividade', licao: 'Canalizar a energia do fogo em propósito construtivo', afirmacao: 'Eu transformo minha paixão em ação sagrada' },
    energia: { tipo: 'Quente', polaridade: 'Yang' },
  },
  2: {
    numero: 2, elemento: 'água', elemento_nome: 'Água', elemento_english: 'Water',
    significado_espiritual: 'O número 2 é a sabedoria emocional, a fluidez do universo e a compaixão profunda.',
    arquetipo: 'O Guardião das Emoções / O Sábio Compassivo', orixa: 'Iemanjá', sephirah: 'Yesod',
    chakra: '2º Sacro (Svadhisthana)', planeta: 'Lua', cor: 'Azul', direcao: 'Oeste',
    qualidades: { forca: 'Intuição profunda, compaixão, adaptabilidade', desafio: 'Dificuldade em estabelecer limites', licao: 'Manter a clareza emocional sem perder a conexão', afirmacao: 'Eu fluo com a vida mantendo meus limites' },
    energia: { tipo: 'Frio', polaridade: 'Yin' },
  },
  3: {
    numero: 3, elemento: 'fogo', elemento_nome: 'Fogo', elemento_english: 'Fire',
    significado_espiritual: 'O número 3 é a expressão criativa sagrada, a trindade divina em ação.',
    arquetipo: 'O Guerreiro da Luz / O Artista Sagrado', orixa: 'Xangô', sephirah: 'Geburah',
    chakra: '3º Plexo Solar (Manipura)', planeta: 'Marte', cor: 'Vermelho', direcao: 'Sul',
    qualidades: { forca: 'Determinação, coragem, paixão transformadora', desafio: 'Impaciência, agressividade', licao: 'Canalizar a energia do fogo em propósito construtivo', afirmacao: 'Eu transformo minha paixão em ação sagrada' },
    energia: { tipo: 'Quente', polaridade: 'Yang' },
  },
  4: {
    numero: 4, elemento: 'terra', elemento_nome: 'Terra', elemento_english: 'Earth',
    significado_espiritual: 'O número 4 é a estabilidade material, a ancoragem espiritual e a manifestação prática.',
    arquetipo: 'O Fundador / O Ancestral', orixa: 'Oxóssi', sephirah: 'Malkuth',
    chakra: '1º Básico (Muladhara)', planeta: 'Saturno', cor: 'Verde', direcao: 'Norte',
    qualidades: { forca: 'Paciência, confiabilidade, prática', desafio: 'Rigidez, resistência a mudanças', licao: 'Equilibrar estabilidade com flexibilidade', afirmacao: 'Eu sou abundante e merecedor de prosperidade' },
    energia: { tipo: 'Quente', polaridade: 'Yang' },
  },
  5: {
    numero: 5, elemento: 'água', elemento_nome: 'Água', elemento_english: 'Water',
    significado_espiritual: 'O número 5 é a transformação alquímica, a liberdade sagrada e a mudança certa.',
    arquetipo: 'O Guardião das Emoções / O Alquimista', orixa: 'Iemanjá', sephirah: 'Yesod',
    chakra: '2º Sacro (Svadhisthana)', planeta: 'Lua', cor: 'Azul', direcao: 'Oeste',
    qualidades: { forca: 'Intuição profunda, compaixão, adaptabilidade', desafio: 'Dificuldade em estabelecer limites', licao: 'Manter a clareza emocional sem perder a conexão', afirmacao: 'Eu fluo com a vida mantendo meus limites' },
    energia: { tipo: 'Frio', polaridade: 'Yin' },
  },
  6: {
    numero: 6, elemento: 'fogo', elemento_nome: 'Fogo', elemento_english: 'Fire',
    significado_espiritual: 'O número 6 é o amor harmônico, a responsabilidade sagrada e a paz divina.',
    arquetipo: 'O Guerreiro da Luz / O Guardião do Lar', orixa: 'Xangô', sephirah: 'Geburah',
    chakra: '3º Plexo Solar (Manipura)', planeta: 'Marte', cor: 'Vermelho', direcao: 'Sul',
    qualidades: { forca: 'Determinação, coragem, paixão transformadora', desafio: 'Impaciência, agressividade', licao: 'Canalizar a energia do fogo em propósito construtivo', afirmacao: 'Eu transformo minha paixão em ação sagrada' },
    energia: { tipo: 'Quente', polaridade: 'Yang' },
  },
  7: {
    numero: 7, elemento: 'ar', elemento_nome: 'Ar', elemento_english: 'Air',
    significado_espiritual: 'O número 7 é a sabedoria introspectiva, o misticismo profundo e a contemplação sagrada.',
    arquetipo: 'O Mensageiro / O Filósofo', orixa: 'Iansã', sephirah: 'Netzach',
    chakra: '5º Laríngeo (Vishuddha)', planeta: 'Mercúrio', cor: 'Amarelo', direcao: 'Leste',
    qualidades: { forca: 'Comunicação clara, objetividade, visão ampla', desafio: 'Superficialidade, indecisão', licao: 'Ancorar pensamentos em ação concreta', afirmacao: 'Eu comunico minha verdade com clareza' },
    energia: { tipo: 'Neutro', polaridade: 'Equilibrado' },
  },
  8: {
    numero: 8, elemento: 'ar', elemento_nome: 'Ar', elemento_english: 'Air',
    significado_espiritual: 'O número 8 é o poder pessoal, a autoridade interior e a justiça kármica.',
    arquetipo: 'O Mensageiro / O Justiceiro', orixa: 'Iansã', sephirah: 'Netzach',
    chakra: '5º Laríngeo (Vishuddha)', planeta: 'Mercúrio', cor: 'Amarelo', direcao: 'Leste',
    qualidades: { forca: 'Comunicação clara, objetividade, visão ampla', desafio: 'Superficialidade, indecisão', licao: 'Ancorar pensamentos em ação concreta', afirmacao: 'Eu comunico minha verdade com clareza' },
    energia: { tipo: 'Neutro', polaridade: 'Equilibrado' },
  },
  9: {
    numero: 9, elemento: 'água', elemento_nome: 'Água', elemento_english: 'Water',
    significado_espiritual: 'O número 9 é a iluminação universal, a compaixão infinita e o encerramento sagrado.',
    arquetipo: 'O Guardião das Emoções / O Iluminado', orixa: 'Iemanjá', sephirah: 'Yesod',
    chakra: '2º Sacro (Svadhisthana)', planeta: 'Lua', cor: 'Azul', direcao: 'Oeste',
    qualidades: { forca: 'Intuição profunda, compaixão, adaptabilidade', desafio: 'Dificuldade em estabelecer limites', licao: 'Manter a clareza emocional sem perder a conexão', afirmacao: 'Eu fluo com a vida mantendo meus limites' },
    energia: { tipo: 'Frio', polaridade: 'Yin' },
  },
  10: {
    numero: 10, elemento: 'terra', elemento_nome: 'Terra', elemento_english: 'Earth',
    significado_espiritual: 'O número 10 é a renovação e transformação, o recomeço sagrado e a nova era.',
    arquetipo: 'O Fundador / O Renascido', orixa: 'Oxóssi', sephirah: 'Malkuth',
    chakra: '1º Básico (Muladhara)', planeta: 'Saturno', cor: 'Verde', direcao: 'Norte',
    qualidades: { forca: 'Paciência, confiabilidade, prática', desafio: 'Rigidez, resistência a mudanças', licao: 'Equilibrar estabilidade com flexibilidade', afirmacao: 'Eu sou abundante e merecedor de prosperidade' },
    energia: { tipo: 'Quente', polaridade: 'Yang' },
  },
  11: {
    numero: 11, elemento: 'éter', elemento_nome: 'Éter', elemento_english: 'Ether',
    significado_espiritual: 'O número 11 é a conexão direta com a Fonte criadora, o número mestre da iluminação espiritual.',
    arquetipo: 'O Canalizador / O Desperto', orixa: 'Oxalá', sephirah: 'Kether',
    chakra: '7º Coronário (Sahasrara)', planeta: 'Sol', cor: 'Branco-dourado', direcao: 'Centro',
    qualidades: { forca: 'Sabedoria transcendental, intuição desperta', desafio: 'Idealismo excessivo, vulnerabilidade', licao: 'Manifestar a luz espiritual no mundo físico', afirmacao: 'Eu sou um canal de luz divina' },
    energia: { tipo: 'Neutro', polaridade: 'Equilibrado' },
  },
  12: {
    numero: 12, elemento: 'fogo', elemento_nome: 'Fogo', elemento_english: 'Fire',
    significado_espiritual: 'O número 12 é a justiça divina, o sacrifício sagrado e a ordem cósmica.',
    arquetipo: 'O Guerreiro da Luz / O Executor da Lei', orixa: 'Xangô', sephirah: 'Geburah',
    chakra: '3º Plexo Solar (Manipura)', planeta: 'Marte', cor: 'Vermelho', direcao: 'Sul',
    qualidades: { forca: 'Determinação, coragem, paixão transformadora', desafio: 'Impaciência, agressividade', licao: 'Canalizar a energia do fogo em propósito construtivo', afirmacao: 'Eu transformo minha paixão em ação sagrada' },
    energia: { tipo: 'Quente', polaridade: 'Yang' },
  },
  13: {
    numero: 13, elemento: 'terra', elemento_nome: 'Terra', elemento_english: 'Earth',
    significado_espiritual: 'O número 13 é a evolução através da morte e renascimento, a transformação radical.',
    arquetipo: 'O Fundador / O Renascido das Cinzas', orixa: 'Oxóssi', sephirah: 'Malkuth',
    chakra: '1º Básico (Muladhara)', planeta: 'Saturno', cor: 'Verde', direcao: 'Norte',
    qualidades: { forca: 'Paciência, confiabilidade, prática', desafio: 'Rigidez, resistência a mudanças', licao: 'Equilibrar estabilidade com flexibilidade', afirmacao: 'Eu sou abundante e merecedor de prosperidade' },
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
  const elements: ElementoTipo[] = [];
  const seen = new Set<ElementoTipo>();
  for (const m of Object.values(NUMEROLOGY_ELEMENT_MAP)) {
    if (!seen.has(m.elemento)) {
      seen.add(m.elemento);
      elements.push(m.elemento);
    }
  }
  return elements;
}
