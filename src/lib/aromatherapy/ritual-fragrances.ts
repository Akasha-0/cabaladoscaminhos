/**
 * Ritual Fragrances Module
 * Alchemy of perfumes, defumations, and high magic ritual
 * Based on IDEIA.md pp.207-219
 */

import type { OilProperties } from './aromatherapy-data';

export interface RitualFragrance {
  id: string;
  name: string;
  planeta: string;
  essencia: string[];
  resina: string[];
  simbolo: string;
  instrumento: string;
  proposito: string;
  diaSemana: string;
  horaIdeal: string;
  chakraAlvo: number;
}

export interface DayDefumation {
  dia: string;
  planeta: string;
  essencia: string;
  resina: string;
  propsito: string;
  orixas: string[];
  simbolo: string;
}

export interface DefumationBlend {
  id: string;
  nome: string;
  plantas: string[];
  propsito: string;
  duracao: string;
  diaPreferido: string;
}

/**
 * Ritual fragrances per day of week (pp.207-219)
 */
export const RITUAL_FRAGRANCES: RitualFragrance[] = [
  {
    id: 'segunda-feira',
    name: 'Purificação Lunar',
    planeta: 'Lua / Saturno',
    essencia: ['Sândalo', 'Mirra'],
    resina: ['Mirra', 'Cânfora'],
    simbolo: 'Pentagrama de Proteção',
    instrumento: 'Cálice com Água / Sal',
    proposito: 'Purificação de eguns, quebra de amarrações kármicas e proteção oculta',
    diaSemana: 'Segunda-feira',
    horaIdeal: '16:00-18:00',
    chakraAlvo: 1,
  },
  {
    id: 'terca-feira',
    name: 'Banimento Marcial',
    planeta: 'Marte / Plutão',
    essencia: ['Cravo', 'Gengibre'],
    resina: ['Arruda Seca', 'Cânfora'],
    simbolo: 'Espada Cruzada',
    instrumento: 'Punhal de Ferro / Vela Vermelha',
    proposito: 'Banimento de obsessores, corte drástico de amarras e autodefesa ativa',
    diaSemana: 'Terça-feira',
    horaIdeal: '06:00-10:00',
    chakraAlvo: 2,
  },
  {
    id: 'quarta-feira',
    name: 'Clareza Mercurial',
    planeta: 'Mercúrio',
    essencia: ['Hortelã', 'Alecrim'],
    resina: ['Estoraque', 'Alecrim'],
    simbolo: 'Caduceu / Triângulo',
    instrumento: 'Incensário (Ar) / Pena',
    proposito: 'Clareza intelectual, agilidade nos negócios e equilíbrio dos pensamentos',
    diaSemana: 'Quarta-feira',
    horaIdeal: '08:00-12:00',
    chakraAlvo: 3,
  },
  {
    id: 'quinta-feira',
    name: 'Expansão Joviana',
    planeta: 'Júpiter',
    essencia: ['Cedro', 'Eucalipto'],
    resina: ['Benjoim do Sião'],
    simbolo: 'Selo de Salomão / Flecha',
    instrumento: 'Taça com Vinho / Pedras Verdes',
    proposito: 'Expansão de recursos financeiros, fartura e atração de mentores espirituais',
    diaSemana: 'Quinta-feira',
    horaIdeal: '10:00-14:00',
    chakraAlvo: 4,
  },
  {
    id: 'sexta-feira',
    name: 'Pacificação Vênusiana',
    planeta: 'Vênus',
    essencia: ['Rosa Branca', 'Jasmim'],
    resina: ['Incenso Puro (Olíbano)'],
    simbolo: 'Domba Branca / Rosa',
    instrumento: 'Vela Branca / Água de Colônia',
    proposito: 'Pacificação total da coroa (Ori), Bori espiritual e harmonização do lar',
    diaSemana: 'Sexta-feira',
    horaIdeal: '18:00-21:00',
    chakraAlvo: 7,
  },
  {
    id: 'sabado',
    name: 'Magnetismo Saturino',
    planeta: 'Saturno / Urano',
    essencia: ['Lótus', 'Verbena'],
    resina: ['Resina de Mirra', 'Rosas'],
    simbolo: 'Círculo Sagrado / Âncora',
    instrumento: 'Caldeirão / Quartzo Rosa',
    proposito: 'Ativação do magnetismo pessoal, fertilidade e feitiços de amarração benéfica',
    diaSemana: 'Sábado',
    horaIdeal: '16:00-20:00',
    chakraAlvo: 4,
  },
  {
    id: 'domingo',
    name: 'Consagração Solar',
    planeta: 'Sol',
    essencia: ['Canela', 'Laranja'],
    resina: ['Olíbano em Grãos'],
    simbolo: 'Sol Radiante / Hexagrama',
    instrumento: 'Lamparina de Azeite / Ouro',
    proposito: 'Consagração de amuletos de poder, realeza, cura física e vitalidade',
    diaSemana: 'Domingo',
    horaIdeal: '06:00-10:00',
    chakraAlvo: 3,
  },
];

/**
 * Day-specific defumation blends
 */
export const DAY_DEFUMATIONS: DayDefumation[] = [
  {
    dia: 'Segunda-feira',
    planeta: 'Lua / Saturno',
    essencia: 'Sândalo com Mirra',
    resina: 'Mirra e Cânfora',
    propsito: 'Quebra de amarrações kármicas',
    orixas: ['Omolu', 'Exu'],
    simbolo: 'Pentagrama',
  },
  {
    dia: 'Terça-feira',
    planeta: 'Marte',
    essencia: 'Cravo com Arruda',
    resina: 'Arruda Seca',
    propsito: 'Corte de demandas',
    orixas: ['Iansã', 'Ogum'],
    simbolo: 'Espada',
  },
  {
    dia: 'Quarta-feira',
    planeta: 'Mercúrio',
    essencia: 'Alecrim',
    resina: 'Estoraque',
    propsito: 'Clareza mental',
    orixas: ['Xangô', 'Iansã'],
    simbolo: 'Caduceu',
  },
  {
    dia: 'Quinta-feira',
    planeta: 'Júpiter',
    essencia: 'Eucalipto',
    resina: 'Benjoim',
    propsito: 'Abundância',
    orixas: ['Oxóssi'],
    simbolo: 'Flecha',
  },
  {
    dia: 'Sexta-feira',
    planeta: 'Vênus',
    essencia: 'Rosa com Jasmim',
    resina: 'Olíbano',
    propsito: 'Amor e paz',
    orixas: ['Oxalá', 'Oxum'],
    simbolo: 'Coração',
  },
  {
    dia: 'Sábado',
    planeta: 'Saturno',
    essencia: 'Lótus',
    resina: 'Mirra',
    propsito: 'Fertilidade',
    orixas: ['Oxum', 'Iemanjá'],
    simbolo: 'Âncora',
  },
  {
    dia: 'Domingo',
    planeta: 'Sol',
    essencia: 'Canela',
    resina: 'Olíbano',
    propsito: 'Vitalidade',
    orixas: ['Xangô'],
    simbolo: 'Hexagrama',
  },
];

/**
 * Defumation blends for specific spiritual purposes
 */
export const DEFUMATION_BLENDS: DefumationBlend[] = [
  {
    id: 'descarrego-pesado',
    nome: 'Descarrego Pesado',
    plantas: ['Guiné', 'Pinhão Roxo', 'Arruda'],
    propsito: 'Remoção de energias negativas',
    duracao: '15-20 minutos',
    diaPreferido: 'Terça-feira',
 　},
  {
    id: 'purificacao-ancestral',
    nome: 'Purificação Ancestral',
    plantas: ['Sândalo', 'Mirra', 'Alfazema'],
    propsito: 'Conexão com ancestrais',
    duracao: '20-30 minutos',
    diaPreferido: 'Segunda-feira',
  },
  {
    id: 'atrair-abundancia',
    nome: 'Atrair Abundância',
    plantas: ['Benjoim', 'Canela', 'Alecrim'],
    propsito: 'Prosperidade e fartura',
    duracao: '10-15 minutos',
    diaPreferido: 'Quinta-feira',
 　},
  {
    id: 'amor-proprio',
    nome: 'Amor Próprio',
    plantas: ['Rosa', 'Jasmim', 'Camomila'],
    propsito: 'Autoestima e amor próprio',
    duracao: '15 minutos',
    diaPreferido: 'Sexta-feira',
  },
  {
    id: 'protecao-arcana',
    nome: 'Proteção Arcana',
    plantas: ['Alecrim', 'Arruda', 'Sal grosso'],
    propsito: 'Proteção espiritual',
    duracao: '10 minutos',
    diaPreferido: 'Segunda-feira',
  },
];

/**
 * Get fragrance for a specific day
 */
export function getFragranceForDay(dia: string): RitualFragrance | undefined {
  return RITUAL_FRAGRANCES.find(f => f.diaSemana === dia);
}

/**
 * Get defumation for a specific day
 */
export function getDefumationForDay(dia: string): DayDefumation | undefined {
  return DAY_DEFUMATIONS.find(d => d.dia === dia);
}

/**
 * Get defumation blend by ID
 */
export function getDefumationBlend(id: string): DefumationBlend | undefined {
  return DEFUMATION_BLENDS.find(b => b.id === id);
}

/**
 * Get all defumation blends
 */
export function getAllDefumationBlends(): DefumationBlend[] {
  return DEFUMATION_BLENDS;
}

/**
 * Get all ritual fragrances
 */
export function getAllRitualFragrances(): RitualFragrance[] {
  return RITUAL_FRAGRANCES;
}
