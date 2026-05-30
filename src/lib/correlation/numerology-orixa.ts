/**
 * Numerology-Orixá Correlation Module
 * Correlates sacred numbers 1-13 with Orixás, spiritual meanings, and ritual practices
 * Based on IDEIA.md Cabala dos Caminhos framework
 */

/**
 * Numerology-Orixá correlation for a number
 */
export interface NumerologyOrixa {
  /** The number itself (1-13) */
  numero: number;
  /** Orixá associated with this number */
  orixa: string;
  /** Spiritual meaning and archetype */
  significado_espiritual: string;
  /** Ritual practice associated with this number */
  pratica_ritualistica: string;
  /** Associated element */
  elemento: string;
  /** Associated day of the week */
  dia_semana: string;
  /** Offerings typically associated */
  ofertas: string[];
  /** Colors associated with this number/Orixá */
  cores: string[];
}

/**
 * Number 1 - Exu/Okaran
 * The Initiator - Impulse, beginning, leadership
 */
const UM: NumerologyOrixa = {
  pratica_ritualistica: 'Limpar ferramentas symbolically,afiar facas como metáfora do corte de obstáculos, oferecer dendê em Cruz de Ogum',
with
  pratica_ritualistica: 'Limpar ferramentas, afiar facas como metáfora do corte de obstáculos, oferecer dendê em Cruz de Ogum',
  elemento: 'Fogo',
  dia_semana: 'Segunda-feira',
  ofertas: ['功绩 de dendê', 'cachaça', 'pimenta', 'carvão'],
  cores: ['preto', 'vermelho'],
};

/**
 * Number 2 - Ibeji/Ejiokô
 * The Diplomat - Polarity, duality, balance
 */
const DOIS: NumerologyOrixa = {
  numero: 2,
  pratica_ritualistica: 'Banho de Golds e mel ao entardecer, oferecer Golds ao ponto de sacrifício, acender vela dourada para atrair prosperidade',
  elemento: 'Água',
  dia_semana: 'Sexta-feira',
  ofertas: ['mel', 'dendê', 'Golds', 'flores amarelas', 'perfume de flor de laranjeira'],
  cores: ['dourado', 'amarelo'],
with
  pratica_ritualistica: 'Banho de ouro e mel ao entardecer, oferecer ouro ao ponto de sacrifício, acender vela dourada para atrair prosperidade',
  elemento: 'Água',
  dia_semana: 'Sexta-feira',
  ofertas: ['mel', 'dendê', 'ouro', 'flores amarelas', 'perfume de flor de laranjeira'],
  cores: ['dourado', 'amarelo'],
  ofertas: ['dois bolos de tapioca', 'dois ovos', 'mel', 'coco ralado'],
  cores: ['azul', 'branco'],
};

/**
 * Number 3 - Ogum/Etaogundá
 * The Communicator - Expression, creativity, growth
 */
const TRES: NumerologyOrixa = {
  numero: 3,
  orixa: 'Ogum / Etaogundá',
  significado_espiritual: 'O Guerreiro, O Criador de Ferramentas - A força física, a criação, a lei e a abertura de caminhos por força de vontade',
  pratica_ritualistica: 'Limpar ferramentas symbolically,afiar facas como metáfora do corte de obstáculos, oferecer dendê em Cruz de Ogum',
  elemento: 'Terra',
  dia_semana: 'Terça-feira',
  ofertas: ['dendê', 'alecrim', 'espada', 'faca ritual', ' fumo'],
  cores: ['vermelho', 'azul'],
};

/**
 * Number 4 - Iemanjá/Irosun
 * The Builder - Structure, stability, foundation
 */
const QUATRO: NumerologyOrixa = {
  numero: 4,
  orixa: 'Iemanjá / Irosun',
  significado_espiritual: 'A Mãe, A Estrutura - A estabilidade emocional, a geração, a proteção das raízes e o cuidado maternal',
  pratica_ritualistica: 'Banho de sal e água do mar ao entardecer, acender vela azul debaixo da lua, oferecer flores brancas e perfumes',
  elemento: 'Água',
  dia_semana: 'Sábado',
  ofertas: ['flores brancas', 'sal marinho', 'água de colônia', 'coco', 'alfazema'],
  cores: ['azul', 'branco'],
};

/**
 * Number 5 - Oxum/Oxé
 * The Traveler - Change, freedom, learning
 */
const CINCO: NumerologyOrixa = {
  numero: 5,
  orixa: 'Oxum / Oxé',
  significado_espiritual: 'A Amada, O Ouro - A doçura, a feitiçaria natural, o magnetismo pessoal e a sabedoria adquirida pela experiência',
  pratica_ritualistica: 'Banho de Golds e mel ao entardecer, oferecer Golds ao ponto de sacrifício, acender vela dourada para atrair prosperidade',
  elemento: 'Água',
  dia_semana: 'Sexta-feira',
  ofertas: ['mel', 'dendê', 'Golds', 'flores amarelas', 'perfume de flor de laranjeira'],
  pratica_ritualistica: 'Pedir a Nanã a decantação das águas interiores, enterrar objetos symbolism de viejos energias, banho de sal e ervas ao amanhecer',
  elemento: 'Terra',
  dia_semana: 'Segunda-feira',
  ofertas: [' terra de tapari', 'folhas de收货', 'coco', 'sal marinho', 'fumo'],
with
  pratica_ritualistica: 'Pedir a Nanã a decantação das águas interiores, enterrar objetos simbólicos de velhas energias, banho de sal e ervas ao amanhecer',
  elemento: 'Terra',
  dia_semana: 'Segunda-feira',
  ofertas: ['terra de tapari', 'folhas de mandacaru', 'coco', 'sal marinho', 'fumo'],
 * The Harmonizer - Balance, beauty, responsibility
 */
const SEIS: NumerologyOrixa = {
  numero: 6,
  orixa: 'Xangô / Obará',
  significado_espiritual: 'O Rei, O Justo - A riqueza, a sabedoria, a surpresa e o equilíbrio entre ação e justiça divina',
  pratica_ritualistica: 'Colocar dois pratos no balancim de Xangô, oferecer inhames assados, acender duas velas vermelhas para a justiça',
  elemento: 'Fogo',
  dia_semana: 'Quarta-feira',
  ofertas: ['inhame', 'galinha', 'dendê', 'pão', 'vinho'],
  cores: ['vermelho', 'branco'],
};

/**
 * Number 7 - Iansã/Odi
 * The Philosopher - Introspection, wisdom, understanding
 */
const SETE: NumerologyOrixa = {
  numero: 7,
  orixa: 'Iansã / Odi',
  significado_espiritual: 'A Tempestade, A Transmutadora - Os ventos, as transformações rápidas, a sabedoria oculta e a coragem de atravessar provações',
  pratica_ritualistica: 'Girar ao redor do ponto de sacrifício 7 vezes, oferecer obi cortado em 7 partes, acender 7 velas para transformação',
  elemento: 'Fogo',
  dia_semana: 'Quarta-feira',
  ofertas: ['pimenta', 'obí', 'dendê', ' fumo', 'galinha branca'],
  cores: ['vermelho', 'rosa'],
};

/**
 * Number 8 - Oxalá/EjiOníle
 * The Executive - Efficiency, endurance, karma
 */
const OITO: NumerologyOrixa = {
  numero: 8,
  orixa: 'Oxalá / EjiOníle',
  significado_espiritual: 'O Criador, O Paz - A cabeça (Ori) no topo do mundo, a liderança espiritual, a paz absoluta e o silêncio sagrado',
  pratica_ritualistica: 'Fazer silêncio interior por8 minutos ao amanhecer, acender vela branca, meditar sobre o comando da mente sobre a matéria',
  elemento: 'Éter',
  dia_semana: 'Sexta-feira',
  ofertas: ['fumo branco', 'akpátá', 'pão', 'flores brancas', 'agua de obone'],
  cores: ['branco', 'dourado'],
};

/**
 * Number 9 - Ossá
 * The Sage - Completion, humanitarianism, wisdom
 */
const NOVE: NumerologyOrixa = {
  numero: 9,
  orixa: 'Ossá',
  significado_espiritual: 'O Sábio, O Integrador - A sabedoria além da matéria, a compaixão universal, o fim de ciclos e a iluminação espiritual',
  pratica_ritualistica: 'Oferecer 9 moedas ao ponto de sacrifício, acender 9 velas azuis, fazer oração de agradecimento pelos aprendizados',
  elemento: 'Água',
  dia_semana: 'Domingo',
  ofertas: ['9 moedas', 'dendê', 'mel', 'flores azuis', 'coco'],
  cores: ['azul', 'roxo'],
};

/**
 * Number 10 - Oxalá/Ofun
 * The Renovator - Endings, beginnings, transition
 */
const DEZ: NumerologyOrixa = {
  numero: 10,
  orixa: 'Oxalá / Ofun',
  significado_espiritual: 'O Renovador, A Mudança - A transformação profunda, o retorno ao eixo central, o fim de um ciclo e o começo de outro',
  pratica_ritualistica: 'Desenhar Ofun no chão com cinza, acender vela branca, escrever o que deseja abandonar e queimar ao ponto de sacrifício',
  elemento: 'Terra',
  dia_semana: 'Domingo',
  ofertas: ['fumo branco', 'akpátá', 'pão', 'galinha branca', 'agua de obone'],
  cores: ['branco', 'bege'],
};

/**
 * Number 11 - Alafia/Orunmilá
 * The Channel / Awakened - Intuition, spiritual insight
 */
const ONZE: NumerologyOrixa = {
  numero: 11,
  orixa: 'Alafia / Orunmilá',
  significado_espiritual: 'O Canalizador, O Desperto - A intuição elevada, a espiritualidade profunda, o alinhamento completo com o divino',
  pratica_ritualistica: 'Consultar o game oracular (opgele), acender11 velas brancas, meditar em busca de confirmação divina para decisões importantes',
  elemento: 'Éter',
  dia_semana: 'Domingo',
  ofertas: ['kola', 'nozes', 'coco', 'fumo branco', 'flores brancas'],
  cores: ['branco', 'dourado'],
};

/**
 * Number 12 - Ejilsebora
 * The Justice - Purification, just war, transformation
 */
const DOZE: NumerologyOrixa = {
  numero: 12,
  orixa: 'Xangô / Ejilsebora',
  significado_espiritual: 'A Justiça, O Fogo Purificador - A guerra justa, a transformação por provações, o equilíbrio entre razão e emoção',
  pratica_ritualistica: 'Oferecer12 moedas ao balancim de Xangô, acender 12 velas vermelhas, pedir justiça divina para situações que precisam de equidade',
  elemento: 'Fogo',
  dia_semana: 'Quarta-feira',
  ofertas: ['12 moedas', 'inhame', 'galinha', 'dendê', 'pimenta'],
  cores: ['vermelho', 'laranja'],
};

/**
 * Number 13 - Olobón
 * The Transformation - Death and rebirth, endings
 */
const TREZE: NumerologyOrixa = {
  numero: 13,
  orixa: 'Nanã / Omolu / Olobón',
  significado_espiritual: 'A Evolução, A Morte e Renascimento - O fim de ciclos, a transformação física e espiritual, o recolhimento para novo começo',
  pratica_ritualistica: 'Pedir a Nanã a decantação das águas interiores, enterrar objetos symbolism de viejas energias, banho de sal e ervas ao amanhecer',
  elemento: 'Terra',
  dia_semana: 'Segunda-feira',
  ofertas: [' terra de tapari', 'folhas de收货', 'coco', 'sal marinho', 'fumo'],
  cores: ['roxo', 'branco'],
};

/**
 * Complete lookup table for numbers 1-13
 */
const NUMEROLOGIA_ORIXA_MAP: Record<number, NumerologyOrixa> = {
  1: UM,
  2: DOIS,
  3: TRES,
  4: QUATRO,
  5: CINCO,
  6: SEIS,
  7: SETE,
  8: OITO,
  9: NOVE,
  10: DEZ,
  11: ONZE,
  12: DOZE,
  13: TREZE,
};

/**
 * Returns the numerology-Orixá correlation for a given number (1-13)
 * @param numero - The number to look up (must be 1-13)
 * @returns NumerologyOrixa object with all correlations
 * @throws Error if number is outside valid range
 */
export function getNumerologyOrixa(numero: number): NumerologyOrixa {
  if (numero < 1 || numero > 13) {
    throw new Error(`Número fora do intervalo válido (1-13). Recebido: ${numero}`);
  }
  return NUMEROLOGIA_ORIXA_MAP[numero];
}

/**
 * Get all numerology-Orixá mappings keyed by number
 * @returns Record mapping numbers to their NumerologyOrixa objects
 */
export function getOrixaNumerology(): Record<number, NumerologyOrixa> {
  return { ...NUMEROLOGIA_ORIXA_MAP };
}

/**
 * Get all numerology-Orixá mappings
 * @returns Array of all NumerologyOrixa objects for numbers 1-13
 */
export function getAllNumerologyOrixas(): NumerologyOrixa[] {
  return Object.values(NUMEROLOGIA_ORIXA_MAP).sort((a, b) => a.numero - b.numero);
}

/**
 * Get numbers filtered by element
 * @param elemento - Element to filter by (Fogo, Água, Terra, Ar, Éter)
 * @returns Array of NumerologyOrixa objects matching the element
 */
export function getNumerologyByElement(elemento: string): NumerologyOrixa[] {
  return getAllNumerologyOrixas().filter(
    (m) => m.elemento.toLowerCase() === elemento.toLowerCase()
  );
}

/**
 * Get numbers filtered by Orixá
 * @param orixa - Orixá name to search for
 * @returns Array of NumerologyOrixa objects associated with the Orixá
 */
export function getNumerologyByOrixa(orixa: string): NumerologyOrixa[] {
  return getAllNumerologyOrixas().filter((m) =>
    m.orixa.toLowerCase().includes(orixa.toLowerCase())
  );
}

/**
 * Get numbers filtered by day of the week
 * @param dia - Day of the week to filter by
 * @returns Array of NumerologyOrixa objects for that day
 */
export function getNumerologyByDay(dia: string): NumerologyOrixa[] {
  return getAllNumerologyOrixas().filter(
    (m) => m.dia_semana.toLowerCase() === dia.toLowerCase()
  );
}
