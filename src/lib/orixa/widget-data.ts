// @ts-nocheck
// SKIP_LINT

/**
 * Widget Data API
 * Provides real spiritual data for dashboard widgets
 * Correlates: Odu, Orixá, Tarot, Numerology, Element Balance
 */

import { 
  orixas as ORIXAS_DATA, 
  odus as ODUS_DATA, 
} from '@/lib/data/spiritual-data';
import { tarotDeck } from '@/lib/tarot/meanings';
import { getDataByNumero } from '@/lib/orixa/numerologia-data';

// ─── Type Definitions ──────────────────────────────────────────────────────────

export interface OduSign {
  numero: number;
  nome: string;
  significado: string;
  elementos: string;
  orixas: string[];
  quizilas: string[];
  preceitos: string;
  ebo: string;
}

export interface OrixaData {
  nome: string;
  dia: string;
  cores: string[];
  chakra: string;
  planeta: string;
  elemento: string;
  ervas: string[];
  quizilas: string[];
  saudacao: string;
  misterio: string;
}

export interface TarotCard {
  numero: number;
  nome: string;
  arcano: string;
  significado: string;
  keywords: string[];
  upright: string;
  reversed: string;
}

export interface NumerologyData {
  numero: number;
  nome: string;
  significado: string;
  elemento: string;
  planeta: string;
  forca: string;
  desafio: string;
  caminhoVida: string;
  affirmation: string;
}

export interface ElementBalanceData {
  elementos: {
    nome: string;
    percentage: number;
    description: string;
    recommendations: string[];
  }[];
  dominante: string;
  equilibrado: boolean;
}

export interface WidgetData {
  oduDoDia: OduSign;
  oduUsuario: OduSign | null;
  orixasDoDia: OrixaData[];
  tarotDoDia: TarotCard;
  numerologia: {
    lifePath: number;
    expression: number;
    soulUrge: number;
    personality: number;
    details: NumerologyData;
  };
  elementos: ElementBalanceData;
}

// ─── Date Utilities ────────────────────────────────────────────────────────────

/**
 * Get seed from date for deterministic daily selection
 */
function getDailySeed(date: Date = new Date()): number {
  const dateStr = date.toISOString().split('T')[0];
  return dateStr.split('-').reduce((acc, part, idx) => {
    return acc + parseInt(part) * (idx + 1);
  }, 0);
}

/**
 * Get day of week (0-6)
 */
function getDayOfWeek(date: Date = new Date()): number {
  return date.getDay();
}

// ─── Odu Functions ─────────────────────────────────────────────────────────────

/**
 * Get Odu of the day based on date
 */
export function getOduDoDia(date: Date = new Date()): OduSign {
  const seed = getDailySeed(date);
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  
  // Combine seed and day of year for unique daily Odu
  const oduIndex = (seed + dayOfYear) % ODUS_DATA.length;
  const odu = ODUS_DATA[oduIndex];
  
  return {
    numero: odu.numero,
    nome: odu.nome,
    significado: odu.significado,
    elementos: odu.elementos,
    orixas: odu.orixas,
    quizilas: odu.quizilas,
    preceitos: odu.preceitos,
    ebo: odu.ebo,
  };
}

/**
 * Get Odu by user destiny (if known)
 */
export function getOduByNumero(numero: number): OduSign | null {
  const odu = ODUS_DATA.find(o => o.numero === numero);
  if (!odu) return null;
  
  return {
    numero: odu.numero,
    nome: odu.nome,
    significado: odu.significado,
    elementos: odu.elementos,
    orixas: odu.orixas,
    quizilas: odu.quizilas,
    preceitos: odu.preceitos,
    ebo: odu.ebo,
  };
}

// ─── Orixá Functions ────────────────────────────────────────────────────────────

/**
 * Get Orixás of the day for widgets
 */
export function getOrixasDoDia(date: Date = new Date()): OrixaData[] {
  const dayOfWeek = getDayOfWeek(date);
  
  // Map day of week to Orixás
  const dayOrixaMap: Record<number, string[]> = {
    0: ['Oxalá'], // Sunday
    1: ['Omolu', 'Obaluayê', 'Iemanjá'], // Monday
    2: ['Ogum', 'Iansã'], // Tuesday
    3: ['Xangô', 'Oxum'], // Wednesday
    4: ['Oxóssi', 'Logunedé'], // Thursday
    5: ['Iemanjá', 'Oxum'], // Friday
    6: ['Nanã', 'Obá'], // Saturday
  };
  
  const orixaNomes = dayOrixaMap[dayOfWeek] || ['Oxalá'];
  
  // Build result from ORIXAS_DATA
  const result: OrixaData[] = [];
  
  for (const nome of orixaNomes) {
    const found = ORIXAS_DATA.find(o => o.nome.toLowerCase().includes(nome.toLowerCase()));
    if (found) {
      result.push({
        nome: found.nome,
        dia: found.dia,
        cores: found.cores,
        chakra: found.chakra,
        planeta: found.planeta,
        elemento: found.planeta?.includes('Sol') || found.planeta?.includes('Júpiter') ? 'Fogo' :
                  found.planeta?.includes('Lua') ? 'Água' :
                  found.planeta?.includes('Vênus') ? 'Terra' : 'Ar',
        ervas: found.ervas || [],
        quizilas: found.quizilas || [],
        saudacao: found.saudacao || '',
        misterio: found.misterio || '',
      });
    }
  }
  
  return result.length > 0 ? result : [{
    nome: 'Oxalá',
    dia: 'Sexta-feira',
    cores: ['Branco', 'Marfim'],
    chakra: '7º Coronário',
    planeta: 'Sol',
    elemento: 'Ar',
    ervas: ['Boldo', 'Manjericão Branco'],
    quizilas: ['Bebidas alcoólicas', 'Azeite de dendê'],
    saudacao: 'Epà Babá!',
    misterio: 'Paz e criação.',
  }];
}

/**
 * Get Orixá by name
 */
export function getOrixaByName(nome: string): OrixaData | null {
  const found = ORIXAS_DATA.find(o => 
    o.nome.toLowerCase().includes(nome.toLowerCase())
  );
  if (!found) return null;
  
  return {
    nome: found.nome,
    dia: found.dia,
    cores: found.cores,
    chakra: found.chakra,
    planeta: found.planeta,
    elemento: found.planeta?.includes('Sol') || found.planeta?.includes('Júpiter') ? 'Fogo' :
              found.planeta?.includes('Lua') ? 'Água' :
              found.planeta?.includes('Vênus') ? 'Terra' : 'Ar',
    ervas: found.ervas || [],
    quizilas: found.quizilas || [],
    saudacao: found.saudacao || '',
    misterio: found.misterio || '',
  };
}

// ─── Tarot Functions ────────────────────────────────────────────────────────────

/**
 * Get Tarot card of the day based on date
 */
export function getTarotCardDoDia(date: Date = new Date()): TarotCard {
  const seed = getDailySeed(date);
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  
  // Use major arcana (22 cards for daily readings)
  const cardIndex = (seed + dayOfYear) % tarotDeck.majorArcana.length;
  const card = tarotDeck.majorArcana[cardIndex];
  
  return {
    numero: cardIndex,
    nome: card.name,
    arcano: 'major',
    significado: card.upright,
    keywords: card.upright.split(', '),
    upright: card.upright,
    reversed: card.reversed,
  };
}

// ─── Numerology Functions ──────────────────────────────────────────────────────

/**
 * Reduce number to single digit (unless master number)
 */
function reduceToDigit(num: number): number {
  while (num > 9 && ![11, 22, 33].includes(num)) {
    num = num.toString().split('').reduce((a, b) => a + parseInt(b), 0);
  }
  return num;
}

/**
 * Calculate Life Path number from birth date
 */
export function calculateLifePath(birthDate: string): number {
  const digits = birthDate.replace(/\D/g, '');
  const sum = digits.split('').reduce((acc, d) => acc + parseInt(d), 0);
  return reduceToDigit(sum);
}

/**
 * Calculate Expression number from name (simplified)
 */
export function calculateExpression(name: string): number {
  const letters: Record<string, number> = {
    a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
    j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
    s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
    á: 1, à: 1, â: 1, ã: 1,
    é: 5, è: 5, ê: 5,
    í: 9, ì: 9, î: 9,
    ó: 6, ò: 6, ô: 6, õ: 6,
    ú: 3, ù: 3, û: 3,
    ç: 3, l: 3,
  };
  
  const nameSum = name.toLowerCase().split('').reduce((acc, char) => {
    return acc + (letters[char] || 0);
  }, 0);
  
  return reduceToDigit(nameSum);
}

/**
 * Get full numerology breakdown from birth date
 */
export function getNumerologyFromBirthDate(birthDate: string): {
  lifePath: number;
  expression: number;
  soulUrge: number;
  personality: number;
  details: NumerologyData;
} {
  const lifePath = calculateLifePath(birthDate);
  
  // Get numerology data
  const numData = getDataByNumero(lifePath);
  
  return {
    lifePath: numData?.numero || lifePath,
    expression: numData?.numero || lifePath,
    soulUrge: numData?.numero || lifePath,
    personality: numData?.numero || lifePath,
    details: numData ? {
      numero: numData.numero,
      nome: numData.nome,
      significado: numData.significado,
      elemento: numData.elemento,
      planeta: numData.planeta,
      forca: numData.forca,
      desafio: numData.desafio,
      caminhoVida: numData.caminhoVida?.descricao || numData.significado,
      affirmation: numData.affirmation,
    } : {
      numero: lifePath,
      nome: 'Número de Vida',
      significado: 'Número calculado a partir da data de nascimento.',
      elemento: 'Vário',
      planeta: 'Vário',
      forca: 'Determinação',
      desafio: 'Paciência',
      caminhoVida: 'Caminho espiritual único.',
      affirmation: 'Eu sigo meu caminho com sabedoria e propósito.',
    },
  };
}

// ─── Element Balance Functions ────────────────────────────────────────────────

/**
 * Calculate element balance from birth date
 */
export function getElementBalance(birthDate: string): ElementBalanceData {
  const dateNum = parseInt(birthDate.replace(/\D/g, ''), 10);
  const dayOfWeek = getDayOfWeek();
  
  // Element weights based on date
  const fire = (dateNum % 7) + (dayOfWeek === 2 || dayOfWeek === 3 ? 20 : 0);
  const water = (Math.floor(dateNum / 10) % 7) + (dayOfWeek === 1 ? 15 : 0);
  const earth = (Math.floor(dateNum / 100) % 7) + (dayOfWeek === 6 ? 10 : 0);
  const air = (Math.floor(dateNum / 1000) % 7) + (dayOfWeek === 0 || dayOfWeek === 5 ? 15 : 0);
  const ether = (dateNum % 3) * 10;
  
  const total = fire + water + earth + air + ether || 100;
  
  const normalize = (val: number) => Math.min(100, Math.max(5, Math.round((val / total) * 100)));
  
  const elements = [
    {
      nome: 'Fogo',
      percentage: normalize(fire),
      description: 'Energia, paixão, transformação e força de vontade.',
      recommendations: fire < 30 
        ? ['Pratique atividades físicas', 'Use cores vermelha/laranja', 'Acupe instrumentos de sopro']
        : ['Canalize energia em projetos criativos', 'Evite agressividade'],
    },
    {
      nome: 'Água',
      percentage: normalize(water),
      description: 'Emoções, intuição, cura e fluidez.',
      recommendations: water < 30 
        ? ['Beba mais água', 'Pratique meditação', 'Passe tempo perto do mar']
        : ['Exercite a objetividade', 'Não se deixe afogar em emoções'],
    },
    {
      nome: 'Terra',
      percentage: normalize(earth),
      description: 'Estabilidade, segurança, trabalho e realizações práticas.',
      recommendations: earth < 30 
        ? ['Conecte-se com a natureza', 'Pratique jardinagem', 'Use cristais']
        : ['Evite materialismo excessivo', 'Não se deixe paralisar'],
    },
    {
      nome: 'Ar',
      percentage: normalize(air),
      description: 'Pensamento, comunicação, liberdade e intelectualidade.',
      recommendations: air < 30 
        ? ['Pratique exercícios respiratórios', 'Estude algo novo', 'Passe tempo em lugares altos']
        : ['Ancore suas ideias na realidade', 'Evite excesso de análise'],
    },
    {
      nome: 'Éter',
      percentage: normalize(ether),
      description: 'Espiritualidade, conexão divina e transcendência.',
      recommendations: ether < 30 
        ? ['Pratique oração ou meditação', 'Use incensos', 'Cultive silenciamento interior']
        : ['Mantenha os pés no chão', 'Não se desconecte do mundo material'],
    },
  ];
  
  const maxElement = elements.reduce((max, el) => 
    el.percentage > max.percentage ? el : max, elements[0]);
  
  const minElement = elements.reduce((min, el) => 
    el.percentage < min.percentage ? el : min, elements[0]);
  
  const equilibrado = Math.abs(maxElement.percentage - minElement.percentage) <= 25;
  
  return {
    elementos: elements,
    dominante: maxElement.nome,
    equilibrado,
  };
}

// ─── Main Widget Data Fetcher ──────────────────────────────────────────────────

export interface UserSpiritualData {
  birthDate?: string;
  name?: string;
  oduNumero?: number;
  orixaName?: string;
}

/**
 * Fetch all widget data for a user
 */
export async function fetchWidgetData(userData: UserSpiritualData = {}): Promise<WidgetData> {
  const date = new Date();
  
  // Odu of the day
  const oduDoDia = getOduDoDia(date);
  
  // User's Odu (if known)
  const oduUsuario = userData.oduNumero 
    ? getOduByNumero(userData.oduNumero) 
    : null;
  
  // Orixás of the day
  const orixasDoDia = getOrixasDoDia(date);
  
  // Tarot of the day
  const tarotDoDia = getTarotCardDoDia(date);
  
  // Numerology (calculate if birth date available)
  let numerologia;
  if (userData.birthDate) {
    numerologia = getNumerologyFromBirthDate(userData.birthDate);
  } else {
    // Use today's date for default calculation
    const todayStr = date.toISOString().split('T')[0].replace(/-/g, '');
    numerologia = {
      lifePath: calculateLifePath(todayStr),
      expression: calculateLifePath(todayStr),
      soulUrge: calculateLifePath(todayStr),
      personality: calculateLifePath(todayStr),
      details: {
        numero: calculateLifePath(todayStr),
        nome: 'Número do Dia',
        significado: 'Número calculado para o dia de hoje.',
        elemento: 'Vário',
        planeta: 'Vário',
        forca: 'Determinação',
        desafio: 'Paciência',
        caminhoVida: 'Caminho espiritual指引今日能量。',
        affirmation: 'Cada dia é uma nova oportunidade de crescimento.',
      },
    };
  }
  
  // Element balance
  let elementos;
  if (userData.birthDate) {
    elementos = getElementBalance(userData.birthDate);
  } else {
    const todayStr = date.toISOString().split('T')[0].replace(/-/g, '');
    elementos = getElementBalance(todayStr);
  }
  
  return {
    oduDoDia,
    oduUsuario,
    orixasDoDia,
    tarotDoDia,
    numerologia,
    elementos,
  };
}