/**
 * Correlation Map - Mapa de Correlações entre Tradições
 *
 * Mapeia correlações entre I Ching, Ifá, Cabala e Astrologia
 */

export type Tradition = 'iching' | 'ifa' | 'cabala' | 'astrology';

export interface CrossTraditionCorrelation {
  id: string;
  source: {
    tradition: Tradition;
    archetype: number | string;
  };
  target: {
    tradition: Tradition;
    archetype: number | string;
  };
  correlationType: 'elemental' | 'archetypal' | 'numerological' | 'symbolic';
  strength: 'strong' | 'medium' | 'weak';
  description: string;
}

export interface CorrelationMap {
  ichingToIfa: Map<number, string[]>;
  ichingToCabala: Map<number, number[]>;
  ifaToCabala: Map<string, number[]>;
}

// 16 Odús principais de Ifá (excluindo duplicata Owonrin)
export const IFA_ODUS = [
  'Oyekun',
  'Iwori',
  'Odi',
  'Irosun',
  'Owonrin',
  'Obara',
  'Okanran',
  'Ogunda',
  'Osa',
  'Ika',
  'Oturupon',
  'Otura',
  'Irete',
  'Ose',
  'Eji',
] as const;

export type IfaOdu =
  | 'Oyekun'
  | 'Iwori'
  | 'Odi'
  | 'Irosun'
  | 'Owonrin'
  | 'Obara'
  | 'Okanran'
  | 'Ogunda'
  | 'Osa'
  | 'Ika'
  | 'Oturupon'
  | 'Otura'
  | 'Irete'
  | 'Ose'
  | 'Eji';

// 10 Sefirot da Cabala
export const SEFIRot = [
  'Keter',
  'Chokhmah',
  'Binah',
  'Chesed',
  'Gevurah',
  'Tiferet',
  'Netzach',
  'Hod',
  'Yesod',
  'Malkuth',
] as const;

export type Sefirah =
  | 'Keter'
  | 'Chokhmah'
  | 'Binah'
  | 'Chesed'
  | 'Gevurah'
  | 'Tiferet'
  | 'Netzach'
  | 'Hod'
  | 'Yesod'
  | 'Malkuth';

// ============================================
// MAPA: Ifá (16 Odús) → I Ching (64 Hexagramas)
// ============================================
export const ifaToIchingMap: Record<IfaOdu, number[]> = {
  Oyekun: [1, 11],
  Iwori: [2, 12],
  Odi: [3, 43],
  Irosun: [4, 14],
  Owonrin: [5, 15, 21, 22], // Owonrin tem 4 hexagramas na task original
  Obara: [6, 34],
  Okanran: [7, 8],
  Ogunda: [9, 10],
  Osa: [11, 26],
  Ika: [12, 23],
  Oturupon: [13, 14],
  Otura: [15, 16],
  Irete: [17, 18],
  Ose: [19, 20],
  Eji: [23, 24],
};

// ============================================
// MAPA: Sefirot (10) → Trigramas (8)
// ============================================
export const sefirotToTrigramMap: Record<Sefirah, number[]> = {
  Keter: [1], // Céu/Yang puro
  Chokhmah: [1, 5], // Yang
  Binah: [2], // Terra/Yin puro
  Chesed: [3], // Água
  Gevurah: [4], // Fogo
  Tiferet: [5, 6], // Equilíbrio
  Netzach: [7], // Vento
  Hod: [8], // Lago
  Yesod: [3, 7], // Água/Vento
  Malkuth: [2], // Terra
};

// ============================================
// MAPA: Ifá → Cabala
// ============================================
export const ifaToCabalaMap: Record<IfaOdu, number[]> = {
  Oyekun: [1, 10], // Keter/Malkuth - Início/Fim
  Iwori: [2, 3], // Chokhmah/Chesed - Sabedoria/Compaixão
  Odi: [4, 5], // Gevurah/Tiferet - Força/Beleza
  Irosun: [6, 7], // Tiferet/Netzach - Harmonia/Vitória
  Owonrin: [8, 9, 10], // Hod/Yesod/Malkuth - Glória/Fundação/Terra
  Obara: [10, 6], // Malkuth/Tiferet - Terra/Harmonia
  Okanran: [3, 7], // Chesed/Netzach - Compaixão/Vitória
  Ogunda: [4, 5], // Gevurah/Tiferet - Julgamento/Harmonia
  Osa: [1, 10], // Keter/Malkuth - Coroa/Terra
  Ika: [8, 9], // Hod/Yesod - Glória/Fundação
  Oturupon: [2, 6], // Chokhmah/Tiferet - Sabedoria/Harmonia
  Otura: [5, 6], // Gevurah/Tiferet - Julgamento/Harmonia
  Irete: [3, 4], // Chesed/Gevurah - Compaixão/Julgamento
  Ose: [7, 8], // Netzach/Hod - Vitória/Glória
  Eji: [1, 2], // Keter/Chokhmah - Coroa/Sabedoria
};

// ============================================
// MAPA: I Ching → Ifá (inverso do ifaToIchingMap)
// ============================================
export const buildIchingToIfaMap = (): Map<number, Array<string>> => {
  const map = new Map<number, string[]>();

  for (const [odu, hexagrams] of Object.entries(ifaToIchingMap)) {
    for (const hexagram of hexagrams) {
      const existing = map.get(hexagram) || [];
      existing.push(odu);
      map.set(hexagram, existing);
    }
  }

  return map;
};

export const ichingToIfaMap = buildIchingToIfaMap();

// ============================================
// FUNÇÕES DE CONSULTA
// ============================================

/**
 * Retorna os hexagramas do I Ching correspondentes a um Odú de Ifá
 */
export function getIchingsByIfa(odu: IfaOdu): number[] {
  return ifaToIchingMap[odu] || [];
}

/**
 * Retorna os Odús de Ifá correspondentes a um hexagrama do I Ching
 */
export function getIfasByIching(hexagram: number): string[] {
  return ichingToIfaMap.get(hexagram) || [];
}

/**
 * Retorna os Sefirot correspondentes a um trigrama
 */
export function getSefirotByTrigram(trigram: number): Sefirah[] {
  const result: Sefirah[] = [];

  for (const [sefirah, trigrams] of Object.entries(sefirotToTrigramMap)) {
    if (trigrams.includes(trigram)) {
      result.push(sefirah as Sefirah);
    }
  }

  return result;
}

/**
 * Retorna os Sefirot correspondentes a um Odú de Ifá
 */
export function getSefirotByIfa(odu: IfaOdu): Sefirah[] {
  const sefirotIndices = ifaToCabalaMap[odu] || [];
  return sefirotIndices.map((i) => SEFIRot[i - 1]).filter(Boolean) as Sefirah[];
}

/**
 * Retorna a força de correlação entre duas tradições
 */
export function getCorrelationStrength(
  source: Tradition,
  target: Tradition
): 'strong' | 'medium' | 'weak' {
  const strongPairs: [Tradition, Tradition][] = [
    ['iching', 'ifa'],
    ['cabala', 'astrology'],
  ];

  const mediumPairs: [Tradition, Tradition][] = [
    ['iching', 'cabala'],
    ['ifa', 'cabala'],
  ];

  for (const [a, b] of strongPairs) {
    if ((a === source && b === target) || (a === target && b === source)) {
      return 'strong';
    }
  }

  for (const [a, b] of mediumPairs) {
    if ((a === source && b === target) || (a === target && b === source)) {
      return 'medium';
    }
  }

  return 'weak';
}

/**
 * Encontra todas as correlações para uma tradição e arquétipo específicos
 */
export function findCorrelations(
  tradition: Tradition,
  archetype: number | string
): CrossTraditionCorrelation[] {
  const correlations: CrossTraditionCorrelation[] = [];

  if (tradition === 'ifa') {
    const odus = typeof archetype === 'string' ? [archetype] : IFA_ODUS;
    for (const odu of odus) {
      const hexagrams = getIchingsByIfa(odu as IfaOdu);
      for (const hex of hexagrams) {
        correlations.push({
          id: `${odu}-iching-${hex}`,
          source: { tradition: 'ifa', archetype: odu },
          target: { tradition: 'iching', archetype: hex },
          correlationType: 'archetypal',
          strength: 'strong',
          description: `Odú ${odu} correlaciona-se com hexagrama ${hex}`,
        });
      }

      const sefirot = getSefirotByIfa(odu as IfaOdu);
      for (const sef of sefirot) {
        correlations.push({
          id: `${odu}-cabala-${sef}`,
          source: { tradition: 'ifa', archetype: odu },
          target: { tradition: 'cabala', archetype: sef },
          correlationType: 'symbolic',
          strength: 'medium',
          description: `Odú ${odu} correlaciona-se com ${sef}`,
        });
      }
    }
  }

  if (tradition === 'iching') {
    const hexagrams = typeof archetype === 'number' ? [archetype] : [];
    for (const hex of hexagrams) {
      const odus = getIfasByIching(hex);
      for (const odu of odus) {
        correlations.push({
          id: `iching-${hex}-ifa-${odu}`,
          source: { tradition: 'iching', archetype: hex },
          target: { tradition: 'ifa', archetype: odu },
          correlationType: 'archetypal',
          strength: 'strong',
          description: `Hexagrama ${hex} correlaciona-se com Odú ${odu}`,
        });
      }
    }
  }

  return correlations;
}

/**
 * Mapa de correlações completo
 */
export const correlationMap: CorrelationMap = {
  ichingToIfa: ichingToIfaMap,
  ichingToCabala: new Map(), // Será populado conforme necessidade
  ifaToCabala: new Map(Object.entries(ifaToCabalaMap).map(([k, v]) => [k, v])),
};

// Nomes dos 64 hexagramas do I Ching
export const ICHING_NAMES: Record<number, string> = {
  1: 'Qián (Criação)',
  2: 'Kūn (Receptividade)',
  3: 'Zhūn (Dificuldade Inicial)',
  4: 'Méng (Inocência)',
  5: 'Xū (Espera)',
  6: 'Sòng (Conflito)',
  7: 'Shī (Exército)',
  8: 'Bǐ (União)',
  9: 'Xiǎochù (Criar Pequeno)',
  10: 'Lǚ (Andar Cauteloso)',
  11: 'Tài (Paz)',
  12: 'Pǐ (Estagnação)',
  13: 'Tóngrén (Comunhão)',
  14: 'Dàyǒu (Possuir Grandeza)',
  15: 'Qiān (Modéstia)',
  16: 'Yǔ (Entusiasmo)',
  17: 'Suí (Seguir)',
  18: 'Gǔ (Reparação)',
  19: 'Lín (Aproximação)',
  20: 'Guān (Contemplação)',
  21: 'Shìkè (Morder)',
  22: 'Bǐ (Graça)',
  23: 'Bō (Desintegração)',
  24: 'Fù (Retorno)',
  25: 'Wúwàng (Inocência)',
  26: 'Dàchù (Grande Força)',
  27: 'Yí (Nutrição)',
  28: 'Dàguò (Excesso)',
  29: 'Kǎn (Abismo)',
  30: 'Lí (Aderir)',
  31: 'Xián (Mutual)',
  32: 'Héng (Durabilidade)',
  33: 'Dùn (Retirada)',
  34: 'Dàzhuàng (Grande Potência)',
  35: 'Jǐn (Progresso)',
  36: 'Míngyí (Oscurecimento da Luz)',
  37: 'Jiārén (Pessoas)',
  38: 'Kuí (Oposição)',
  39: 'Jiǎn (Obstrução)',
  40: 'Xiè (Liberação)',
  41: 'Sǔn (Diminuição)',
  42: 'Yì (Aumento)',
  43: 'Guài (Ruptura)',
  44: 'Gòu (Encontro)',
  45: 'Cuì (Reunião)',
  46: 'Shēng (Ascensão)',
  47: 'Kùn (Exaustão)',
  48: 'Jǐng (Poço)',
  49: 'Gé (Revolução)',
  50: 'Dǐng (Caldeirāo)',
  51: 'Zhèn (Trovao)',
  52: 'Gèn (Montanha)',
  53: 'Jiān (Desenvolvimento)',
  54: 'Guīmèi (Dona)',
  55: 'Fēng (Abundância)',
  56: 'Lǚ (Viagem)',
  57: 'Xùn (Suave)',
  58: 'Duì (Lago)',
  59: 'Huán (Dispersão)',
  60: 'Jié (Limitação)',
  61: 'Zhōngfú (Verdade Interior)',
  62: 'Xiǎoguò (Pequena Excesso)',
  63: 'Jìjì (Após Conclusão)',
  64: 'Wèijì (Antes da Conclusão)',
};

/**
 * Retorna o mapa completo de correlações para um arquétipo I Ching
 */
export function getFullCorrelation(hexagram: number): {
  hexagram: number;
  iching: { name: string };
  ifas: string[];
  sefirot: number[];
  trigrams: number[];
  strength: 'strong' | 'medium' | 'weak';
} {
  if (hexagram < 1 || hexagram > 64) {
    return {
      hexagram,
      iching: { name: 'Desconhecido' },
      ifas: [],
      sefirot: [],
      trigrams: [],
      strength: 'weak',
    };
  }

  const ifas = getIfasByIching(hexagram);

  // Agregar Sefirot de todos os Ifás relacionados
  const sefirotSet = new Set<number>();
  for (const odu of ifas) {
    const oduSefirot = ifaToCabalaMap[odu as IfaOdu] || [];
    oduSefirot.forEach((s) => sefirotSet.add(s));
  }
  const sefirot = Array.from(sefirotSet).sort((a, b) => a - b);

  // Calcular força baseado na quantidade de correlações
  const totalCorrelations = ifas.length;
  let strength: 'strong' | 'medium' | 'weak' = 'weak';
  if (totalCorrelations >= 3) {
    strength = 'strong';
  } else if (totalCorrelations >= 2) {
    strength = 'medium';
  }

  // Trigramas (derivados dos bits do hexagrama 1-8)
  const trigrams: number[] = [];
  if (hexagram <= 8) {
    trigrams.push(hexagram);
  } else {
    // Hexagramas 9-64 derivam de combinações
    const lower = hexagram % 8 || 8;
    const upper = Math.floor((hexagram - 1) / 8) + 1;
    trigrams.push(upper, lower);
  }

  return {
    hexagram,
    iching: { name: ICHING_NAMES[hexagram] || 'Desconhecido' },
    ifas,
    sefirot,
    trigrams,
    strength,
  };
}
