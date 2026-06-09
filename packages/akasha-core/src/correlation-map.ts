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
  'Oyekun', 'Iwori', 'Odi', 'Irosun', 'Owonrin', 'Obara',
  'Okanran', 'Ogunda', 'Osa', 'Ika', 'Oturupon', 'Otura',
  'Irete', 'Ose', 'Eji'
] as const;

export type IfaOdu = 'Oyekun' | 'Iwori' | 'Odi' | 'Irosun' | 'Owonrin' | 'Obara' |
                     'Okanran' | 'Ogunda' | 'Osa' | 'Ika' | 'Oturupon' | 'Otura' |
                     'Irete' | 'Ose' | 'Eji';

// 10 Sefirot da Cabala
export const SEFIRot = [
  'Keter', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tiferet', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
] as const;

export type Sefirah = 'Keter' | 'Chokhmah' | 'Binah' | 'Chesed' | 'Gevurah' |
                      'Tiferet' | 'Netzach' | 'Hod' | 'Yesod' | 'Malkuth';

// ============================================
// MAPA: Ifá (16 Odús) → I Ching (64 Hexagramas)
// ============================================
export const ifaToIchingMap: Record<IfaOdu, number[]> = {
  Oyekun: [1, 11],
  Iwori: [2, 12],
  Odi: [3, 43],
  Irosun: [4, 14],
  Owonrin: [5, 15, 21, 22],  // Owonrin tem 4 hexagramas na task original
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
  Keter: [1],          // Céu/Yang puro
  Chokhmah: [1, 5],    // Yang
  Binah: [2],          // Terra/Yin puro
  Chesed: [3],         // Água
  Gevurah: [4],        // Fogo
  Tiferet: [5, 6],     // Equilíbrio
  Netzach: [7],        // Vento
  Hod: [8],            // Lago
  Yesod: [3, 7],       // Água/Vento
  Malkuth: [2],        // Terra
};

// ============================================
// MAPA: Ifá → Cabala
// ============================================
export const ifaToCabalaMap: Record<IfaOdu, number[]> = {
  Oyekun: [1, 10],      // Keter/Malkuth - Início/Fim
  Iwori: [2, 3],        // Chokhmah/Chesed - Sabedoria/Compaixão
  Odi: [4, 5],          // Gevurah/Tiferet - Força/Beleza
  Irosun: [6, 7],       // Tiferet/Netzach - Harmonia/Vitória
  Owonrin: [8, 9, 10],  // Hod/Yesod/Malkuth - Glória/Fundação/Terra
  Obara: [10, 6],       // Malkuth/Tiferet - Terra/Harmonia
  Okanran: [3, 7],      // Chesed/Netzach - Compaixão/Vitória
  Ogunda: [4, 5],       // Gevurah/Tiferet - Julgamento/Harmonia
  Osa: [1, 10],         // Keter/Malkuth - Coroa/Terra
  Ika: [8, 9],          // Hod/Yesod - Glória/Fundação
  Oturupon: [2, 6],     // Chokhmah/Tiferet - Sabedoria/Harmonia
  Otura: [5, 6],        // Gevurah/Tiferet - Julgamento/Harmonia
  Irete: [3, 4],        // Chesed/Gevurah - Compaixão/Julgamento
  Ose: [7, 8],          // Netzach/Hod - Vitória/Glória
  Eji: [1, 2],          // Keter/Chokhmah - Coroa/Sabedoria
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
}

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
  return sefirotIndices.map(i => SEFIRot[i - 1]).filter(Boolean) as Sefirah[];
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
  ifaToCabala: new Map(Object.entries(ifaToCabalaMap).map(
    ([k, v]) => [k, v]
  )),
};
