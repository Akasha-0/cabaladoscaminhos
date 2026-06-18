// Re-export types so @akasha/core/deep-correlation-engine resolves them
export type {
  UserSpiritualData,
  ChatMessage,
  SpiritualSource,
  SpiritualCorrelation,
  SystemCorrelation,
  DetectedPattern,
  SpiritualSystem,
  CrossSystemPattern,
  EnergyHarmonyReport,
} from './types';

import {
  calculateBaseCorrelation,
  LIFE_PATH_ZODIAC_MAP,
  ODU_SEPHIROT_MAP,
  ODU_ORIXA_MAP,
  TAROT_ORIXA_MAP,
  TAROT_CHAKRA_MAP,
  CHAKRA_ELEMENT_MAP,
  PLANET_ORIXA_MAP,
  DAY_ENERGY_MAP,
  SEPHIROT_PLANET_MAP,
  SEPHIROT_SIGN_MAP,
  SEPHIROT_ORIXA_MAP,
} from './correlation-maps';
import {
  detectRecurringNumberPatterns,
  detectElementalImbalance,
  detectKarmicThemes,
  detectSpiritualBlocks,
  ODU_TAROT_MAP,
} from './pattern-detectors';
import {
  SYSTEM_ENERGIES,
  getTarotName,
  hasDataForSystem,
  getSystemTargets,
  getDataPresenceMultiplier,
  findSharedEnergy,
  calculateSystemHarmony,
  calculatePairHarmony,
} from './system-helpers';
import { generateMinimaxResponse } from './minimax';
import type {
  UserSpiritualData,
  ChatMessage,
  SpiritualCorrelation,
  SystemCorrelation,
  CrossSystemPattern,
  EnergyHarmonyReport,
  SpiritualSource,
} from './types';

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
      kabbalah: (d) =>
        d.sefirotDominante?.includes('Keter') || d.sefirotDominante?.includes('Chokhmah'),
      tarot: (d) => d.arcoMaior?.includes(0) || d.arcoMaior?.includes(1),
      astrology: (d) => d.sign === 'Leo' || d.sign === 'Aries',
    },
    manifestations: [
      'Inner light activation',
      'Spiritual awakening',
      'Teaching ability',
      'Enlightenment energy',
    ],
  },
  {
    name: 'Wisdom Seeker',
    description: 'Pattern of deep knowledge and intellectual spiritual pursuits',
    triggers: {
      kabbalah: (d) =>
        d.sefirotDominante?.includes('Chokhmah') || d.sefirotDominante?.includes('Binah'),
      ifa: (d) => d.odu === 'Ogbe' || d.odu === 'Oxossi',
      numerology: (d) => d.numeroPessoal === 5 || d.numeroPessoal === 7,
    },
    manifestations: [
      'Deep contemplation',
      'Scholarly pursuits',
      'Philosophical insight',
      'Ancient wisdom',
    ],
  },
  {
    name: 'Transformation Master',
    description: 'Pattern of personal and spiritual metamorphosis',
    triggers: {
      kabbalah: (d) =>
        d.sefirotDominante?.includes('Gevurah') || d.sefirotDominante?.includes('Tipheret'),
      tarot: (d) =>
        d.arcoMaior?.includes(12) || d.arcoMaior?.includes(14) || d.arcoMaior?.includes(21),
      candomble: (d) => d.orixaRegente === 'Oxum' || d.orixaRegente === 'Omulu',
    },
    manifestations: [
      'Personal alchemy',
      'Rebirth energy',
      'Psychic integration',
      'Ego transcendence',
    ],
  },
  {
    name: 'Ancestral Channel',
    description: 'Pattern of connection with ancestral wisdom and lineage',
    triggers: {
      candomble: (d) => d.orixaRegente !== undefined,
      ifa: (d) => d.odu !== undefined,
      astrology: (d) => d.houses?.['4'] !== undefined,
    },
    manifestations: [
      'Ancestor veneration',
      'Lineage healing',
      'Family karma resolution',
      'Heritage wisdom',
    ],
  },
  {
    name: 'Fate Walker',
    description: 'Pattern of destiny consciousness and cosmic alignment',
    triggers: {
      ifa: (d) => d.odu !== undefined,
      tarot: (d) =>
        d.arcoMaior?.includes(10) || d.arcoMaior?.includes(15) || d.arcoMaior?.includes(21),
      numerology: (d) => d.numeroPessoal === 9 || d.numeroPessoal === 11,
      astrology: (d) => d.rashi !== undefined,
    },
    manifestations: [
      'Destiny awareness',
      'Karmic reading',
      'Life purpose clarity',
      'Cosmic synchronicity',
    ],
  },
  {
    name: 'Elemental Adept',
    description: 'Pattern of elemental mastery and nature connection',
    triggers: {
      candomble: (d) => d.orixaRegente !== undefined,
      tarot: (d) =>
        d.arcoMaior?.includes(0) ||
        d.arcoMaior?.includes(1) ||
        d.arcoMaior?.includes(2) ||
        d.arcoMaior?.includes(3),
      kabbalah: (d) => d.sefirotDominante?.every((s) => ['Netzach', 'Hod', 'Yesod'].includes(s)),
    },
    manifestations: ['Elemental command', 'Nature spirits', 'Weather attunement', 'Earth healing'],
  },
];

// ============================================================
// DEEP CORRELATION ENGINE
// ============================================================

class DeepCorrelationEngine {
  /**
   * Analyze correlations between all spiritual systems based on user data
   */
  analyzeCorrelations(userData: UserSpiritualData): SpiritualCorrelation[] {
    const correlations: SpiritualCorrelation[] = [];
    const sources: SpiritualSource[] = [
      'kabbalah',
      'ifa',
      'candomble',
      'tarot',
      'astrology',
      'numerology',
    ];

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

      for (const [system, trigger] of Object.entries(patternDef.triggers) as [
        SpiritualSource,
        (data: UserSpiritualData) => boolean,
      ][]) {
        if (trigger(userData)) {
          involvedSystems.push(system);
          matchStrength += 1;
        }
      }

      if (involvedSystems.length >= 2) {
        matchStrength =
          matchStrength / (involvedSystems.length + PATTERN_DEFINITIONS.indexOf(patternDef) + 1);

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
    const sources: SpiritualSource[] = [
      'kabbalah',
      'ifa',
      'candomble',
      'tarot',
      'astrology',
      'numerology',
    ];
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
      recommendations.push(
        'Focus on integrating conflicting systems through meditation and reflection'
      );
    }
    if (maxHarmony > 0.8) {
      recommendations.push('Your dominant energy is strong — use it to support weaker areas');
    }
    if (systemsWithData.length >= 4) {
      recommendations.push(
        'Your spiritual profile is well-rounded — continue exploring cross-tradition insights'
      );
    }
    if (
      !harmonious.includes('kabbalah-numerology') &&
      systemHarmonies.kabbalah > 0 &&
      systemHarmonies.numerology > 0
    ) {
      recommendations.push(
        'Bridge Kabbalah and Numerology through the Sefirot correspondence for deeper numeric wisdom'
      );
    }
    if (
      !harmonious.includes('candomble-ifa') &&
      systemHarmonies.candomble > 0 &&
      systemHarmonies.ifa > 0
    ) {
      recommendations.push(
        'Connect Candomblé and Ifá through African ancestor reverence practices'
      );
    }

    const overallScore =
      systemsWithData.length > 0
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
    const isCompatible = compatibleSigns.some((s) => s.toLowerCase() === sign.toLowerCase());

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
      const isMatch = orixas.some((o) => o.toLowerCase() === orixa.toLowerCase());

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
  detectPatterns(userData: UserSpiritualData) {
    const patterns = detectRecurringNumberPatterns(userData);
    patterns.push(...detectElementalImbalance(userData));
    patterns.push(...detectKarmicThemes(userData));
    patterns.push(...detectSpiritualBlocks(userData));
    return patterns;
  }

  // ============================================================
  // AI-POWERED EXPLANATIONS
  // ============================================================

  /**
   * Generate AI explanation for a system correlation
   */
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
        maxTokens: 500,
      });
      return response;
    } catch {
      return correlation.explanation;
    }
  }

  /**
   * Generate practical advice for a detected pattern
   */
  async generatePracticalAdvice(pattern: {
    patternType: string;
    systems: string[];
    description: string;
    urgency: string;
  }): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content:
          'Você é um conselheiro espiritual especializado em fornecer conselhos práticos para crescimento espiritual. Responda apenas em português, de forma clara e objetiva.',
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
3. Um ritual ou prática diária
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
      return pattern.description;
    }
  }
}

// ============================================================
// EXPORTS
// ============================================================

export { DeepCorrelationEngine };
