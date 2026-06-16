import type { UserSpiritualData, ChatMessage } from './types';
import { generateMinimaxResponse } from './minimax';
import {
  SYSTEM_ENERGIES,
  getTarotName,
  hasDataForSystem,
  getSystemTargets,
  getDataPresenceMultiplier,
  findSharedEnergy,
  calculateSystemHarmony,
  calculatePairHarmony,
} from './deep-correlation-engine/system-helpers';

// ============================================================
// TYPES
// ============================================================

export type SpiritualSource = 'kabbalah' | 'ifa' | 'candomble' | 'tarot' | 'astrology' | 'numerology';

export interface SpiritualCorrelation {
  source: SpiritualSource;
  target: string;
  correlation: number; // 0-1
  explanation: string;
  shared_energy: string;
}

export interface SystemCorrelation {
  source: SpiritualSystem;
  target: SpiritualSystem;
  correlationType: 'elemental' | 'numerical' | 'symbolic' | 'temporal';
  strength: number; // 0-1
  explanation: string;
}

export interface DetectedPattern {
  patternType: 'recurring_number' | 'elemental_imbalance' | 'karmic_theme' | 'spiritual_block';
  systems: string[];
  description: string;
  recommendation: string;
  urgency: 'low' | 'medium' | 'high';
}

export type SpiritualSystem = 'kabbalah' | 'ifa' | 'candomble' | 'tarot' | 'astrology' | 'numerology' | 'chakra' | 'element' | 'temporal';

export interface CrossSystemPattern {
  name: string;
  description: string;
  strength: number; // 0-1
  involved_systems: SpiritualSource[];
  manifestations: string[];
}

export interface EnergyHarmonyReport {
  overall_score: number; // 0-1
  system_harmonies: Record<SpiritualSource, number>; // 0-1 per system
  dominant_energy: string;
  balance_indicators: {
    harmonious: string[];
    conflicting: string[];
    neutral: string[];
  };
  recommendations: string[];
}

// ============================================================

// ============================================================
// CROSS-SYSTEM PATTERN DEFINITIONS
// ============================================================

interface PatternDefinition {
  name: string;
  description: string;
  triggers: Partial<Record<SpiritualSource, (data: UserSpiritualData) => boolean>>;
  manifestations: string[];
}

const PATTERN_DEFINITIONS: PatternDefinition[] = [
  {
    name: 'Light Bearer',
    description: 'Pattern of illumination and spiritual enlightenment across traditions',
    triggers: {
      kabbalah: (d) => d.sefirotDominante?.includes('Keter') || d.sefirotDominante?.includes('Chokhmah'),
      tarot: (d) => d.arcoMaior?.includes(0) || d.arcoMaior?.includes(1),
      astrology: (d) => d.sign === 'Leo' || d.sign === 'Aries',
    },
    manifestations: ['Inner light activation', 'Spiritual awakening', 'Teaching ability', 'Enlightenment energy'],
  },
  {
    name: 'Wisdom Seeker',
    description: 'Pattern of deep knowledge and intellectual spiritual pursuits',
    triggers: {
      kabbalah: (d) => d.sefirotDominante?.includes('Chokhmah') || d.sefirotDominante?.includes('Binah'),
      ifa: (d) => d.odu === 'Ogbe' || d.odu === 'Oxossi',
      numerology: (d) => d.numeroPessoal === 5 || d.numeroPessoal === 7,
    },
    manifestations: ['Deep contemplation', 'Scholarly pursuits', 'Philosophical insight', 'Ancient wisdom'],
  },
  {
    name: 'Transformation Master',
    description: 'Pattern of personal and spiritual metamorphosis',
    triggers: {
      kabbalah: (d) => d.sefirotDominante?.includes('Gevurah') || d.sefirotDominante?.includes('Tipheret'),
      tarot: (d) => d.arcoMaior?.includes(12) || d.arcoMaior?.includes(14) || d.arcoMaior?.includes(21),
      candomble: (d) => d.orixaRegente === 'Oxum' || d.orixaRegente === 'Omulu',
    },
    manifestations: ['Personal alchemy', 'Rebirth energy', 'Psychic integration', 'Ego transcendence'],
  },
  {
    name: 'Ancestral Channel',
    description: 'Pattern of connection with ancestral wisdom and lineage',
    triggers: {
      candomble: (d) => d.orixaRegente !== undefined,
      ifa: (d) => d.odu !== undefined,
      astrology: (d) => d.houses?.['4'] !== undefined,
    },
    manifestations: ['Ancestor veneration', 'Lineage healing', 'Family karma resolution', 'Heritage wisdom'],
  },
  {
    name: 'Fate Walker',
    description: 'Pattern of destiny consciousness and cosmic alignment',
    triggers: {
      ifa: (d) => d.odu !== undefined,
      tarot: (d) => d.arcoMaior?.includes(10) || d.arcoMaior?.includes(15) || d.arcoMaior?.includes(21),
      numerology: (d) => d.numeroPessoal === 9 || d.numeroPessoal === 11,
      astrology: (d) => d.rashi !== undefined,
    },
    manifestations: ['Destiny awareness', 'Karmic reading', 'Life purpose clarity', 'Cosmic synchronicity'],
  },
  {
    name: 'Elemental Adept',
    description: 'Pattern of elemental mastery and nature connection',
    triggers: {
      candomble: (d) => d.orixaRegente !== undefined,
      tarot: (d) => d.arcoMaior?.includes(0) || d.arcoMaior?.includes(1) || d.arcoMaior?.includes(2) || d.arcoMaior?.includes(3),
      kabbalah: (d) => d.sefirotDominante?.every(s => ['Netzach', 'Hod', 'Yesod'].includes(s)),
    },
    manifestations: ['Elemental command', 'Nature spirits', 'Weather attunement', 'Earth healing'],
  },
];

// ============================================================
// COMPREHENSIVE SPIRITUAL SYSTEM CORRELATIONS
// ============================================================

// Life Path Number to Zodiac Sign correlations
const LIFE_PATH_ZODIAC_MAP: Record<number, string[]> = {
  1: ['Aries', 'Leo', 'Sagittarius'],
  2: ['Taurus', 'Libra', 'Capricorn'],
  3: ['Gemini', 'Libra', 'Aquarius'],
  4: ['Cancer', 'Virgo', 'Scorpio'],
  5: ['Aries', 'Sagittarius', 'Aquarius'],
  6: ['Taurus', 'Libra', 'Pisces'],
  7: ['Cancer', 'Scorpio', 'Pisces'],
  8: ['Capricorn', 'Taurus', 'Virgo'],
  9: ['Aries', 'Scorpio', 'Sagittarius'],
  11: ['Pisces', 'Cancer', 'Libra'],
  22: ['Capricorn', 'Aquarius', 'Aries'],
};

// 16 Odús to Tarot Major Arcana — canonical names from constants/odus.ts
// Arcano numbers follow Merindilogun position: Ogbe=0, Ejiokô=1, Etogundá=2, etc.
const ODU_TAROT_MAP: Record<string, number[]> = {
  'Ogbe': [0],
  'Ejiokô': [1],
  'Etogundá': [2],
  'Irosun': [3],
  'Oxê': [4],
  'Obará': [5],
  'Odi': [6],
  'Ejionile': [7],
  'Ossá': [8],
  'Ofun': [9],
  'Owarin': [10],
  'Ejilaxebô': [11],
  'Oturupon': [12],
  'Oturá': [13],
  'Iká': [14],
  'Ofurufu': [15],
};

// Odú to Kabbalah Sephirot paths — canonical names from constants/odus.ts
const ODU_SEPHIROT_MAP: Record<string, string[]> = {
  'Ogbe': ['Keter', 'Chokhmah'],
  'Ejiokô': ['Binah', 'Daat'],
  'Etogundá': ['Chokhmah', 'Keter'],
  'Irosun': ['Gevurah', 'Chesed'],
  'Oxê': ['Netzach', 'Hod'],
  'Obará': ['Chesed', 'Gevurah'],
  'Odi': ['Malkuth', 'Yesod'],
  'Ejionile': ['Netzach', 'Hod'],
  'Ossá': ['Hod', 'Yesod'],
  'Ofun': ['Tipheret', 'Malkuth'],
  'Owarin': ['Din', 'Gevurah'],
  'Ejilaxebô': ['Tipheret', 'Yesod'],
  'Oturupon': ['Malkuth', 'Yesod'],
  'Oturá': ['Netzach', 'Hod'],
  'Iká': ['Malkuth'],
  'Ofurufu': ['Keter', 'Tipheret'],
};

// Major Arcana to Orixás correlation
const TAROT_ORIXA_MAP: Record<number, string[]> = {
  0: ['Oxum'],
  1: ['Iemanjá'],
  2: ['Obatalá'],
  3: ['Oxum'],
  4: ['Ogum'],
  5: ['Oxossi'],
  6: ['Omulu'],
  7: ['Ogum'],
  8: ['Obatalá'],
  9: ['Oxumar'],
  10: ['Eshu'],
  11: ['Eshu'],
  12: ['Oxum'],
  13: ['Omulu'],
  14: ['Ogun'],
  15: ['Ogun'],
  16: ['Oxalufa'],
  17: ['Iemanjá'],
  18: ['Oxum'],
  19: ['Oloxum'],
  20: ['Oxalufa'],
  21: ['Olodumare'],
};

// Tarot to Chakra correlations
const TAROT_CHAKRA_MAP: Record<number, string> = {
  0: 'Ajna',
  1: 'Sahasrara',
  2: 'Anahata',
  3: 'Manipura',
  4: 'Vishuddha',
  5: 'Anahata',
  6: 'Muladhara',
  7: 'Svadhisthana',
  8: 'Ajna',
  9: 'Manipura',
  10: 'Muladhara',
  11: 'Ajna',
  12: 'Vishuddha',
  13: 'Anahata',
  14: 'Manipura',
  15: 'Ajna',
  16: 'Sahasrara',
  17: 'Ajna',
  18: 'Sahasrara',
  19: 'Vishuddha',
  20: 'Anahata',
  21: 'Sahasrara',
};

// Chakra to 5 Elements mapping
const CHAKRA_ELEMENT_MAP: Record<string, string> = {
  'Muladhara': 'Terra',
  'Svadhisthana': 'Água',
  'Manipura': 'Fogo',
  'Anahata': 'Ar',
  'Vishuddha': 'Éter',
  'Ajna': 'Luz',
  'Sahasrara': 'Vazio',
};

// Planet to Orixá regents mapping
const PLANET_ORIXA_MAP: Record<string, string> = {
  'Sol': 'Oxum',
  'Lua': 'Iemanjá',
  'Mercúrio': 'Oxossi',
  'Vênus': 'Oxum',
  'Marte': 'Ogum',
  'Júpiter': 'Olodumare',
  'Saturno': 'Omulu',
  'Urano': 'Oxumar',
  'Netuno': 'Iemanjá',
  'Plutão': 'Ogun',
};

// Day of week to spiritual energy mapping
const DAY_ENERGY_MAP: Record<string, { energy: string; orixa: string; element: string; practice: string }> = {
  'Domingo': { energy: 'Solar', orixa: 'Oxum', element: 'Fogo', practice: 'Oração solar, banhos de luz' },
  'Segunda-feira': { energy: 'Lunar', orixa: 'Iemanjá', element: 'Água', practice: 'Meditação aquática, oferendas de água' },
  'Terça-feira': { energy: 'Marcial', orixa: 'Ogum', element: 'Fogo', practice: 'Trabalho com ferro, proteção' },
  'Quarta-feira': { energy: 'Mercurial', orixa: 'Oxossi', element: 'Ar', practice: 'Caça espiritual, busca de conhecimento' },
  'Quinta-feira': { energy: 'Joviana', orixa: 'Olodumare', element: 'Éter', practice: 'Orações de bênção, gratidão' },
  'Sexta-feira': { energy: 'Vênus', orixa: 'Oxum', element: 'Terra', practice: 'Rituais de amor, autoconhecimento' },
  'Sábado': { energy: 'Saturniana', orixa: 'Omulu', element: 'Terra', practice: 'Trabalho de cura, limpeza espiritual' },
};

// Sephirot to Planet mapping
const SEPHIROT_PLANET_MAP: Record<string, string> = {
  'Keter': 'Sem planeta',
  'Chokhmah': 'Sem planeta',
  'Binah': 'Saturno',
  'Chesed': 'Júpiter',
  'Gevurah': 'Marte',
  'Tipheret': 'Sol',
  'Netzach': 'Vênus',
  'Hod': 'Mercúrio',
  'Yesod': 'Lua',
  'Malkuth': 'Terra',
};

// Sephirot to Astrology Sign mapping
const SEPHIROT_SIGN_MAP: Record<string, string> = {
  'Keter': 'Nenhum',
  'Chokhmah': 'Aries',
  'Binah': 'Capricornio',
  'Chesed': 'Sagitário',
  'Gevurah': 'Escorpião',
  'Tipheret': 'Leão',
  'Netzach': 'Touro',
  'Hod': 'Gêmeos',
  'Yesod': 'Câncer',
  'Malkuth': 'Virgem',
};

// Sephirot to Orixá mapping
const SEPHIROT_ORIXA_MAP: Record<string, string> = {
  'Keter': 'Olodumare',
  'Chokhmah': 'Oxossi',
  'Binah': 'Omulu',
  'Chesed': 'Obatalá',
  'Gevurah': 'Ogum',
  'Tipheret': 'Oxum',
  'Netzach': 'Oxum',
  'Hod': 'Oxossi',
  'Yesod': 'Iemanjá',
  'Malkuth': 'Obatalá',
};

// ============================================================
// CORRELATION MATRIX
// ============================================================

function calculateBaseCorrelation(source: SpiritualSource, target: string): number {
  const correlations: Record<string, Record<string, number>> = {
    kabbalah: {
      sefirot: 0.9,
      orixa: 0.6,
      numerology: 0.7,
      tarot: 0.8,
      astrology: 0.5,
    },
    ifa: {
      odu: 0.9,
      orixa: 0.85,
      astrology: 0.5,
      tarot: 0.4,
    },
    candomble: {
      orixa: 0.9,
      ifa: 0.85,
      ancestors: 0.7,
      tarot: 0.3,
    },
    tarot: {
      major_arcana: 0.85,
      numerology: 0.75,
      astrology: 0.7,
      kabbalah: 0.8,
    },
    astrology: {
      planets: 0.9,
      signs: 0.85,
      houses: 0.8,
      numerology: 0.6 as number,
      tarot: 0.7,
    },
    numerology: {
      life_path: 0.9,
      personal_number: 0.85,
      kabbalah: 0.7,
      tarot: 0.75,
    },
  };

  return correlations[source]?.[target] ?? 0.3;
}

// ============================================================
// DEEP CORRELATION ENGINE
// ============================================================

class DeepCorrelationEngine {
  /**
   * Analyze correlations between all spiritual systems based on user data
   */
  analyzeCorrelations(userData: UserSpiritualData): SpiritualCorrelation[] {
    (userData as unknown as { odx?: string }).odx; // Access odx to prevent unused warning
    const correlations: SpiritualCorrelation[] = [];
    const sources: SpiritualSource[] = ['kabbalah', 'ifa', 'candomble', 'tarot', 'astrology', 'numerology'];

    for (const source of sources) {
      if (!hasDataForSystem(userData, source)) continue;

      const systemData = getSystemTargets(userData, source);
      for (const target of systemData) {
        const baseCorr = calculateBaseCorrelation(source, target);
        const dataMultiplier = getDataPresenceMultiplier(userData, source, target);
        const correlation = Math.min(1, baseCorr * dataMultiplier);

        if (correlation > 0.2) {
          correlations.push({
            source,
            target,
            correlation,
            explanation: '', // Generated by AI
            shared_energy: findSharedEnergy(source, target),
          });
        }
      }
    }

    return correlations.sort((a, b) => b.correlation - a.correlation);
  }

  /**
   * Find patterns that manifest across multiple spiritual traditions
   */
  findCrossSystemPatterns(userData: UserSpiritualData): CrossSystemPattern[] {
    const patterns: CrossSystemPattern[] = [];

    for (const patternDef of PATTERN_DEFINITIONS) {
      const involvedSystems: SpiritualSource[] = [];
      let matchStrength = 0;
      const matchedManifestations: string[] = [];

      for (const [system, trigger] of Object.entries(patternDef.triggers) as [SpiritualSource, (data: UserSpiritualData) => boolean][]) {
        if (trigger(userData)) {
          involvedSystems.push(system);
          matchStrength += 1;
        }
      }

      if (involvedSystems.length >= 2) {
        matchStrength = matchStrength / (involvedSystems.length + PATTERN_DEFINITIONS.indexOf(patternDef) + 1);

        if (involvedSystems.length >= 3) {
          matchStrength = Math.min(1, matchStrength * 1.2);
        }

        matchedManifestations.push(...patternDef.manifestations);

        patterns.push({
          name: patternDef.name,
          description: patternDef.description,
          strength: Math.min(1, matchStrength),
          involved_systems: involvedSystems,
          manifestations: matchedManifestations.slice(0, 4),
        });
      }
    }

    return patterns.sort((a, b) => b.strength - a.strength);
  }

  /**
   * Calculate energy harmony between all spiritual systems
   */
  calculateEnergyHarmony(userData: UserSpiritualData): EnergyHarmonyReport {
    const sources: SpiritualSource[] = ['kabbalah', 'ifa', 'candomble', 'tarot', 'astrology', 'numerology'];
    const systemHarmonies: Record<SpiritualSource, number> = {} as Record<SpiritualSource, number>;
    const harmonious: string[] = [];
    const conflicting: string[] = [];
    const neutral: string[] = [];

    for (const system of sources) {
      if (!hasDataForSystem(userData, system)) {
        systemHarmonies[system] = 0;
        continue;
      }
      systemHarmonies[system] = calculateSystemHarmony(userData, system);
    }

    // Determine dominant energy
    let dominantEnergy = 'Mixed Energy';
    let maxHarmony = 0;
    for (const [system, harmony] of Object.entries(systemHarmonies)) {
      if (harmony > maxHarmony) {
        maxHarmony = harmony;
        dominantEnergy = SYSTEM_ENERGIES[system as SpiritualSource].primary;
      }
    }

    // Check pairwise harmonies
    const systemsWithData = Object.entries(systemHarmonies)
      .filter(([, h]) => h > 0)
      .map(([s]) => s);

    for (let i = 0; i < systemsWithData.length; i++) {
      for (let j = i + 1; j < systemsWithData.length; j++) {
        const s1 = systemsWithData[i] as SpiritualSource;
        const s2 = systemsWithData[j] as SpiritualSource;
        const pairHarmony = calculatePairHarmony(userData, s1, s2);

        const pairLabel = `${s1}-${s2}`;
        if (pairHarmony > 0.7) {
          harmonious.push(pairLabel);
        } else if (pairHarmony < 0.4) {
          conflicting.push(pairLabel);
        } else {
          neutral.push(pairLabel);
        }
      }
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (conflicting.length > 0) {
      recommendations.push('Focus on integrating conflicting systems through meditation and reflection');
    }
    if (maxHarmony > 0.8) {
      recommendations.push('Your dominant energy is strong — use it to support weaker areas');
    }
    if (systemsWithData.length >= 4) {
      recommendations.push('Your spiritual profile is well-rounded — continue exploring cross-tradition insights');
    }
    if (!harmonious.includes('kabbalah-numerology') && systemHarmonies.kabbalah > 0 && systemHarmonies.numerology > 0) {
      recommendations.push('Bridge Kabbalah and Numerology through the Sefirot correspondence for deeper numeric wisdom');
    }
    if (!harmonious.includes('candomble-ifa') && systemHarmonies.candomble > 0 && systemHarmonies.ifa > 0) {
      recommendations.push('Connect Candomblé and Ifá through African ancestor reverence practices');
    }

    const overallScore = systemsWithData.length > 0
      ? Object.values(systemHarmonies).reduce((a, b) => a + b, 0) / systemsWithData.length
      : 0;

    return {
      overall_score: overallScore,
      system_harmonies: systemHarmonies,
      dominant_energy: dominantEnergy,
      balance_indicators: { harmonious, conflicting, neutral },
      recommendations,
    };
  }

  // ============================================================
  // CROSS-SYSTEM CORRELATION FUNCTIONS
  /**
   * Correlate Life Path Number with Zodiac Signs
   */
  correlateNumerologyAstrology(lifePath: number, sign: string): SystemCorrelation {
    const compatibleSigns = LIFE_PATH_ZODIAC_MAP[lifePath] || [];
    const isCompatible = compatibleSigns.some(s => s.toLowerCase() === sign.toLowerCase());
    
    return {
      source: 'numerology',
      target: 'astrology',
      correlationType: 'numerical',
      strength: isCompatible ? 0.9 : compatibleSigns.length > 0 ? 0.4 : 0.2,
      explanation: isCompatible 
        ? `O número do caminho de vida ${lifePath} ressoa harmonicamente com ${sign}, indicando uma conexão espiritual profunda entre a numerologia e a astrologia.`
        : `O número do caminho de vida ${lifePath} e o signo ${sign} apresentam diferentes energias, mas podem ser integrados através de práticas espirituais específicas.`,
    };
  }

  /**
   * Correlate Odús (Ifá) with Sephirot (Kabbalah)
   */
  correlateIfaCabala(odu: string, sephirot: string[]): SystemCorrelation[] {
    const correlations: SystemCorrelation[] = [];
    const oduSephirot = ODU_SEPHIROT_MAP[odu] || [];
    
    for (const sp of sephirot) {
      if (oduSephirot.includes(sp)) {
        correlations.push({
          source: 'ifa',
          target: 'kabbalah',
          correlationType: 'symbolic',
          strength: 0.85,
          explanation: `O Odú ${odu} e a Sephirá ${sp} compartilham a mesma essência energética na tradição Ifá e Cabala. Ambos representam archetypes de transformação espiritual.`,
        });
      } else {
        correlations.push({
          source: 'ifa',
          target: 'kabbalah',
          correlationType: 'symbolic',
          strength: 0.4,
          explanation: `O Odú ${odu} e a Sephirá ${sp} operam em frequencies diferentes, mas podem ser conectados através de meditação e práticas contemplativas.`,
        });
      }
    }
    
    return correlations;
  }

  /**
   * Correlate Tarot Major Arcana with Orixás
   */
  correlateTarotOrixa(arcanaNumbers: number[], orixa: string): SystemCorrelation[] {
    const correlations: SystemCorrelation[] = [];
    
    for (const arcanaNum of arcanaNumbers) {
      const orixas = TAROT_ORIXA_MAP[arcanaNum] || [];
      const isMatch = orixas.some(o => o.toLowerCase() === orixa.toLowerCase());
      
      correlations.push({
        source: 'tarot',
        target: 'candomble',
        correlationType: 'symbolic',
        strength: isMatch ? 0.9 : 0.3,
        explanation: isMatch
          ? `O Arcano Maior ${arcanaNum} (${getTarotName(arcanaNum)}) está profundamente conectado a ${orixa} no Candomblé. Esta correlação revela sua trajetória espiritual穿越 múltiplas tradições.`
          : `O Arcano Maior ${arcanaNum} e ${orixa} têm energias complementares que podem ser harmonizadas através de rituais específicos.`,
      });
    }
    
    return correlations;
  }

  /**
   * Correlate Chakras with 5 Elements
   */
  correlateChakraElement(chakras: string[]): SystemCorrelation[] {
    const correlations: SystemCorrelation[] = [];
    
    for (const chakra of chakras) {
      const element = CHAKRA_ELEMENT_MAP[chakra] || 'Desconhecido';
      
      correlations.push({
        source: 'chakra',
        target: 'element',
        correlationType: 'elemental',
        strength: 0.95,
        explanation: `O chakra ${chakra} está asociado ao elemento ${element}. Esta correlação é fundamental para equilibrar sua energia espiritual e física.`,
      });
    }
    
    return correlations;
  }

  /**
   * Correlate Planets with Orixá Regentes
   */
  correlatePlanetOrixa(planet: string, orixa: string): SystemCorrelation {
    const regent = PLANET_ORIXA_MAP[planet];
    const isMatch = regent?.toLowerCase() === orixa.toLowerCase();
    
    return {
      source: 'astrology',
      target: 'candomble',
      correlationType: 'temporal',
      strength: isMatch ? 0.95 : 0.4,
      explanation: isMatch
        ? `O planeta ${planet} é regido por ${orixa} no Candomblé. Esta conexão planetária-orixá orienta suas práticas espirituais e temporais.`
        : `O planeta ${planet} não é diretamente regido por ${orixa}, mas suas energias podem ser harmonizadas através de práticas específicas de alinhamento.`,
    };
  }

  /**
   * Correlate Day of Week with Spiritual Energy
   */
  correlateDayEnergy(dayOfWeek: string): SystemCorrelation {
    const dayData = DAY_ENERGY_MAP[dayOfWeek];
    
    if (!dayData) {
      return {
        source: 'element',
        target: 'temporal',
        correlationType: 'temporal',
        strength: 0.2,
        explanation: `O dia ${dayOfWeek} não possui uma correlação espiritual mapeada em nosso sistema.`,
      };
    }
    
    return {
      source: 'element',
      target: 'temporal',
      correlationType: 'temporal',
      strength: 0.9,
      explanation: `O dia de ${dayOfWeek} carrega energia ${dayData.energy}, sendo regido por ${dayData.orixa}. Prática recomendada: ${dayData.practice}`,
    };
  }

  /**
   * Get all correlations for a user's spiritual data
   */
  getAllSystemCorrelations(userData: UserSpiritualData): SystemCorrelation[] {
    const correlations: SystemCorrelation[] = [];

    // Life Path + Zodiac correlations
    if (userData.numeroPessoal && userData.sign) {
      correlations.push(this.correlateNumerologyAstrology(userData.numeroPessoal, userData.sign));
    }

    // Odú + Sephirot correlations
    if (userData.odu && userData.sefirotDominante?.length) {
      const oduSephirotCorrs = this.correlateIfaCabala(userData.odu, userData.sefirotDominante);
      correlations.push(...oduSephirotCorrs);
    }

    // Tarot + Orixá correlations
    if (userData.arcoMaior?.length && userData.orixaRegente) {
      const tarotOrixaCorrs = this.correlateTarotOrixa(userData.arcoMaior, userData.orixaRegente);
      correlations.push(...tarotOrixaCorrs);
    }
    // Day energy correlation
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = days[new Date().getDay()];
    correlations.push(this.correlateDayEnergy(dayOfWeek));


    return correlations.sort((a, b) => b.strength - a.strength);
  }

  // ============================================================
  // PATTERN DETECTION
  // ============================================================

  /**
   * Detect patterns in user spiritual data
   */
  detectPatterns(userData: UserSpiritualData): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];

    // Recurring number pattern
    if (userData.numeroPessoal) {
      const recurringPatterns = this.detectRecurringNumberPatterns(userData);
      patterns.push(...recurringPatterns);
    }

    // Elemental imbalance
    const elementalPatterns = this.detectElementalImbalance(userData);
    patterns.push(...elementalPatterns);

    // Karmic theme detection
    const karmicPatterns = this.detectKarmicThemes(userData);
    patterns.push(...karmicPatterns);

    // Spiritual block detection
    const blockPatterns = this.detectSpiritualBlocks(userData);
    patterns.push(...blockPatterns);

    return patterns.sort((a, b) => {
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });
  }

  private detectRecurringNumberPatterns(userData: UserSpiritualData): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    
    if (userData.numeroPessoal) {
      // Check if personal number matches any arcana or odu
      const matchingArcana = Object.entries(ODU_TAROT_MAP)
        .filter(([_, nums]) => nums.includes(userData.numeroPessoal!))
        .map(([odu]) => odu);
      
      if (matchingArcana.length > 0) {
        patterns.push({
          patternType: 'recurring_number',
          systems: ['numerology', 'tarot', 'ifa'],
          description: `Seu número pessoal ${userData.numeroPessoal} aparece em múltiplos sistemas: ${matchingArcana.join(', ')}. Este número carrega um significado especial em sua jornada espiritual.`,
          recommendation: `Medite sobre a energia do número ${userData.numeroPessoal} e como ela se manifesta em diferentes aspectos de sua vida.`,
          urgency: 'medium',
        });
      }
    }

    // Check for repeating digits in life path
    if (userData.numeroPessoal && userData.numeroPessoal > 9) {
      const digits = userData.numeroPessoal.toString().split('');
      const hasRepeating = digits.some((d, i) => digits.indexOf(d) !== i);
      
      if (hasRepeating) {
        patterns.push({
          patternType: 'recurring_number',
          systems: ['numerology'],
          description: `Seu número pessoal contém dígitos repetidos, indicando uma ênfase específica em sua energia vibracional.`,
          recommendation: 'Trabalhe com a energia dos dígitos repetidos para amplificar seus pontos fortes.',
          urgency: 'low',
        });
      }
    }

    return patterns;
  }

  private detectElementalImbalance(userData: UserSpiritualData): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    
    // Collect elements from different systems
    const elements: string[] = [];
    
    if (userData.orixaRegente) {
      // Each Orixá has element associations
      const orixaElements: Record<string, string> = {
        'Ogum': 'Fogo',
        'Oxum': 'Água',
        'Iemanjá': 'Água',
        'Oxossi': 'Ar',
        'Obatalá': 'Terra',
        'Omulu': 'Terra',
        'Xangô': 'Fogo',
        'Iansã': 'Ar',
      };
      const elem = orixaElements[userData.orixaRegente];
      if (elem) elements.push(elem);
    }

    if (userData.sign) {
      // Zodiac signs have element associations
      const signElements: Record<string, string> = {
        'Aries': 'Fogo', 'Leo': 'Fogo', 'Sagittarius': 'Fogo',
        'Taurus': 'Terra', 'Virgo': 'Terra', 'Capricorn': 'Terra',
        'Gemini': 'Ar', 'Libra': 'Ar', 'Aquarius': 'Ar',
        'Cancer': 'Água', 'Scorpio': 'Água', 'Pisces': 'Água',
      };
      const elem = signElements[userData.sign];
      if (elem) elements.push(elem);
    }

    // Count element frequencies
    const elementCounts: Record<string, number> = {};
    for (const elem of elements) {
      elementCounts[elem] = (elementCounts[elem] || 0) + 1;
    }

    // Detect imbalance (one element strongly dominant)
    const dominantElement = Object.entries(elementCounts)
      .sort((a, b) => b[1] - a[1])[0];

    if (dominantElement && dominantElement[1] >= 2 && Object.keys(elementCounts).length >= 2) {
      const missingElements = ['Fogo', 'Terra', 'Água', 'Ar'].filter(e => !elementCounts[e]);
      
      patterns.push({
        patternType: 'elemental_imbalance',
        systems: ['candomble', 'astrology'],
        description: `Sua energia espiritual está fortemente趗focusada no elemento ${dominantElement[0]}, com ${dominantElement[1]} manifestações. Elementos ausentes: ${missingElements.join(', ') || 'Nenhum'}.`,
        recommendation: `Incorporar práticas do elemento ${missingElements[0] || 'equilibrado'} para harmonizar sua energia espiritual total.`,
        urgency: missingElements.length > 1 ? 'high' : 'medium',
      });
    }

    return patterns;
  }

  private detectKarmicThemes(userData: UserSpiritualData): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const systems: string[] = [];

    // Check for karmic indicators across systems
    if (userData.numeroPessoal === 9 || userData.numeroPessoal === 11) {
      systems.push('numerology');
    }

    if (userData.arcoMaior?.includes(10) || userData.arcoMaior?.includes(21)) {
      systems.push('tarot');
    }

    if (userData.odu === 'Ofun' || userData.odu === 'Meji') {
      systems.push('ifa');
    }

    if (userData.sign === 'Scorpio' || userData.rashi === 'Vrischika') {
      systems.push('astrology');
    }

    if (systems.length >= 2) {
      patterns.push({
        patternType: 'karmic_theme',
        systems,
        description: `Sua jornada espiritual mostra múltiplos indicadores de temas cármicos: ${systems.join(', ')}. Você está em um caminho de resolução de karma e evoluÇão espiritual profunda.`,
        recommendation: 'Pratique a gratidão e o perdão diariamente. Rituais de ancestor могут ajudar na limpeza cármica.',
        urgency: 'medium',
      });
    }

    return patterns;
  }
  private detectSpiritualBlocks(userData: UserSpiritualData): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    const blocks: string[] = [];

    // Check for potential blocks in each system
    if (userData.sefirotDominante?.length === 1 && userData.numeroPessoal) {
      // Over-reliance on single sephirah
      blocks.push('kabbalah');
    }

    if (!userData.arcoMaior && userData.numeroPessoal) {
      // Strong numerology but no tarot integration
      blocks.push('tarot');
    }

    if (userData.orixaRegente && !userData.odu) {
      // Orixá，但没有对应的Odú
      blocks.push('ifa');
    }

    if (blocks.length >= 2) {
      patterns.push({
        patternType: 'spiritual_block',
        systems: blocks,
        description: `Você apresenta bloqueios espirituais nos sistemas: ${blocks.join(', ')}. Estes gaps estão limitando sua evolução espiritual completa.`,
        recommendation: 'Estude os sistemas faltantes para integrar completamente sua jornada espiritual. Consulte um Babalawo ou especialista em Tarot.',
        urgency: 'high',
      });
    }

    return patterns;
  }

  // ============================================================
  // AI-POWERED EXPLANATIONS
  // ============================================================

  /**
   * Generate AI explanation for a system correlation
  async explainCorrelation(correlation: SystemCorrelation): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'Você é um guia espiritual especializado em explicar correlações entre sistemas místicos. Forneça explicações profundas e práticas em português.',
      },
      {
        role: 'user',
        content: `Explique a correlação espiritual:

Sistema de Origem: ${correlation.source}
Sistema Alvo: ${correlation.target}
Tipo de Correlação: ${correlation.correlationType}
Força: ${(correlation.strength * 100).toFixed(0)}%
Explicação Base: ${correlation.explanation}

Forneça:
1. Uma explicação profunda da conexão energética entre ${correlation.source} e ${correlation.target}
2. Como esta correlação afeta a vida espiritual do praticante
3. Uma prática recomendada para integrar esta correlação
4. Uma advertência espiritual se aplicável`,
      },
    ];

    try {
      const response = await generateMinimaxResponse(messages, {
        temperature: 0.8,
        max_tokens: 500,
      });
      return response.content;
    } catch {
      return correlation.explanation;
    }
  }

  /**
   * Generate practical advice for a detected pattern
   */
  async generatePracticalAdvice(pattern: DetectedPattern): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: 'Você é um conselheiro espiritual especializado em fornecer conselhos práticos para crescimento espiritual. Responda apenas em português, de forma clara e objetiva.',
      },
      {
        role: 'user',
        content: `Gere conselhos práticos para o padrão detectado:

Tipo de Padrão: ${pattern.patternType}
Sistemas Envolvidos: ${pattern.systems.join(', ')}
Descrição: ${pattern.description}
Urgência: ${pattern.urgency}

Forneça:
1. Um exercício espiritual prático para trabalhar este padrão
2. Uma meditação ou oração recomendada
3. Um ritual ou prática一碗 diária
4. Sinais de progresso neste trabalho espiritual
5. Avisos sobre armadilhas comuns neste caminho`,
      },
    ];

    try {
      const response = await generateMinimaxResponse(messages, {
        temperature: 0.8,
        maxTokens: 600,
      });
      return response;
    } catch {
      return pattern.recommendation;
    }
  }
}

// ============================================================
// EXPORTS
// ============================================================

export { DeepCorrelationEngine };