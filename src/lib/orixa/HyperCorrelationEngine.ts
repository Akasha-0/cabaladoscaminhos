/**
 * ════════════════════════════════════════════════════════════════════════════
 * HYPER CORRELATION ENGINE — Cabala dos Caminhos
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Advanced cross-tradition correlation engine that unifies:
 * - Numerology (Cabalistic, Pythagorean, Tantric, Chaldean)
 * - Astrology (Western, Vedic)
 * - Orixá system (Candomblé, Umbanda)
 * - Tarot (Major, Minor Arcanos)
 * - Kabbalah (Sephiroth, Tree of Life)
 * - Chakras (Yoga, Tantra)
 * - Sacred Geometry (Platonic Solids)
 *
 * Key Question: "How does Vida Path 11 modulate the energy of a
 *                Scorpio native under the regency of Oxum?"
 *
 * Version: 1.0.0
 * Last Updated: 2026-05-30
 */
// ════════════════════════════════════════════════════════════════════════════
// IMPORTS
// ════════════════════════════════════════════════════════════════════════════
import { getOrixaFrequency } from '../correlation/orixa-frequency';
import { getOrixaNumerology } from '../correlation/orixa-numerology';
import { getOrixaPlanet } from '../correlation/orixa-planet';
import {
  getOrixa,
  getAllOrixas,
  normalizeOrixaKey,
  getOrixaElemento,
  getOrixaPlaneta,
  getOrixaChakra,
  getOrixaCores,
  getOrixaNumeros,
  ORIXAS_UNIFIED,
} from './types';

// ════════════════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ════════════════════════════════════════════════════════════════════════════

export interface HyperCorrelationInput {
  // Core birth data
  nomeCompleto?: string;
  dataNascimento?: string;
  signoSolar?: string;
  ascendente?: string;
  signoLunar?: string;

  // Orixá system
  orixaCabeca?: string;
  orixaRegente?: string;

  // Numerology
  caminhoVida?: number;
  numeroExpressao?: number;
  numeroMotivacao?: number;

  // Additional context
  diaAtual?: string;
  faseLua?: string;
}

export interface CrossTraditionCorrelation {
  // The primary entity being analyzed
  primaryEntity: {
    type: 'orixa' | 'numerology' | 'zodiac' | 'chakra' | 'tarot' | 'sephirah';
    value: string;
    number?: number;
  };

  // Correlated entities from other traditions
  correlations: {
    tradition: string;
    entity: string;
    value: string | number;
    strength: number; // 0-1, confidence level
    explanation: string;
  }[];

  // Dominant element across traditions
  dominantElement: string;

  // Dominant energy frequency
  dominantFrequency?: number;

  // Harmonization recommendations
  harmonization: {
    action: string;
    tradition: string;
    timing?: string;
  }[];

  // Potential conflicts to resolve
  conflicts: {
    entity1: string;
    entity2: string;
    resolution: string;
  }[];
}

export interface SynthesisResult {
  // Unique signature combining all traditions
  signature: {
    numerology: number;
    zodiac: string;
    orixa: string;
    sephirah?: number;
    element: string;
  };

  // Strengths (confirmed by 3+ traditions)
  strengths: string[];

  // Shadow patterns (blocked energy)
  shadowPatterns: string[];

  // Deep insights from correlation
  insights: {
    level: 'high' | 'medium' | 'low';
    description: string;
    traditions: string[];
  }[];

  // Recommended practices
  practices: {
    name: string;
    tradition: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    description: string;
  }[];

  // Timeline of cycles
  cycles: {
    phase: string;
    duration: string;
    focus: string;
  }[];
}

// ════════════════════════════════════════════════════════════════════════════
// CORRELATION MATRICES
// ════════════════════════════════════════════════════════════════════════════

const ELEMENT_PLANETS: Record<string, string[]> = {
  Fogo: ['Sol', 'Marte', 'Júpiter'],
  Água: ['Lua', 'Netuno', 'Plutão'],
  Terra: ['Venus', 'Saturno', 'Mercury'],
  Ar: ['Mercury', 'Júpiter', 'Urano'],
  Éter: ['Netuno', 'Plutão'],
};

const CHAKRA_ELEMENTS: Record<number, { element: string; orixa: string }> = {
  1: { element: 'Terra', orixa: 'Olokun' },
  2: { element: 'Água', orixa: 'Iemanjá' },
  3: { element: 'Fogo', orixa: 'Ogum' },
  4: { element: 'Ar', orixa: 'Oxum' },
  5: { element: 'Éter', orixa: 'Xangô' },
  6: { element: 'Ar', orixa: 'Oxalá' },
  7: { element: 'Éter', orixa: 'Oxalá' },
};

const MASTER_NUMBERS = {
  11: { name: 'Intuição Espiritual', element: 'Ar', sephirah: 11 },
  22: { name: 'Mestria Material', element: 'Terra', sephirah: 22 },
  33: { name: 'Serviço Divino', element: 'Fogo', sephirah: 33 },
};

// ════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════════════════════

function getElementFromSigno(signo: string): string {
  const map: Record<string, string> = {
    aries: 'Fogo',
    touro: 'Terra',
    gemeos: 'Ar',
    cancer: 'Água',
    leao: 'Fogo',
    virgem: 'Terra',
    libra: 'Ar',
    escorpiao: 'Água',
    sagitario: 'Fogo',
    capricornio: 'Terra',
    aquario: 'Ar',
    peixes: 'Água',
  };
  return map[signo.toLowerCase()] ?? 'Ar';
}

function getElementFromNumber(num: number): string {
  const base = num % 9 || 9;
  if (base === 1 || base === 9) return 'Fogo';
  if (base === 2 || base === 8) return 'Água';
  if (base === 3 || base === 7) return 'Terra';
  if (base === 4 || base === 6) return 'Ar';
  return 'Éter';
}

function calculateCorrelationStrength(
  tradition1: string,
  entity1: string,
  tradition2: string,
  entity2: string
): number {
  // Base correlation strength
  let strength = 0.5;

  // Element matching increases strength
  const elem1 = getElement(entity1) || '';
  const elem2 = getElement(entity2) || '';
  if (elem1 && elem2 && elem1 === elem2) {
    strength += 0.3;
  }

  // Direct known correlations
  const knownCorrelations: Array<[string, string, number]> = [
    ['oxum', 'venus', 0.95],
    ['ogum', 'marte', 0.95],
    ['iemanja', 'lua', 0.95],
    ['oxala', 'sol', 0.95],
    ['xango', 'jupiter', 0.9],
  ];

  for (const [orixa, planeta, corr] of knownCorrelations) {
    if (
      (entity1.toLowerCase().includes(orixa) && entity2.toLowerCase().includes(planeta)) ||
      (entity1.toLowerCase().includes(planeta) && entity2.toLowerCase().includes(orixa))
    ) {
      strength = Math.max(strength, corr);
    }
  }

  return Math.min(strength, 1.0);
}

function getElement(entity: string): string | null {
  // Try Orixá
  const orixa = getOrixa(entity);
  if (orixa) return orixa.elemento;

  // Try planet
  for (const [element, planets] of Object.entries(ELEMENT_PLANETS)) {
    if (planets.some((p) => entity.toLowerCase().includes(p.toLowerCase()))) {
      return element;
    }
  }

  return null;
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN ENGINE
// ════════════════════════════════════════════════════════════════════════════

class HyperCorrelationEngine {
  /**
   * Analyze cross-tradition correlations for a given profile
   */
  analyze(input: HyperCorrelationInput): CrossTraditionCorrelation {
    // Determine primary entity
    const primaryEntity = this.determinePrimaryEntity(input);

    // Collect correlations from all traditions
    const correlations: CrossTraditionCorrelation['correlations'] = [];

    // Numerology correlations
    if (input.caminhoVida) {
      const element = getElementFromNumber(input.caminhoVida);
      correlations.push({
        tradition: 'Numerologia',
        entity: `Caminho de Vida ${input.caminhoVida}`,
        value: element,
        strength: this.calculateNumerologyStrength(input.caminhoVida, primaryEntity.value),
        explanation: `O número ${input.caminhoVida} vibra em ${element}`,
      });
    }

    // Zodiac correlations
    if (input.signoSolar) {
      const element = getElementFromSigno(input.signoSolar);
      correlations.push({
        tradition: 'Astrologia',
        entity: input.signoSolar,
        value: element,
        strength: calculateCorrelationStrength(
          'zodiac',
          input.signoSolar,
          'orixa',
          primaryEntity.value
        ),
        explanation: `${input.signoSolar} é um signo de ${element}`,
      });
    }

    // Orixá correlations
    if (input.orixaCabeca) {
      const orixaData = getOrixa(input.orixaCabeca);
      if (orixaData) {
        correlations.push({
          tradition: 'Candomblé',
          entity: orixaData.nome,
          value: orixaData.planeta,
          strength: 1.0,
          explanation: `${orixaData.nome} é regido por ${orixaData.planeta}`,
        });

        // Add element correlation
        correlations.push({
          tradition: 'Candomblé',
          entity: `${orixaData.nome} elemento`,
          value: orixaData.elemento,
          strength: 1.0,
          explanation: `A vibração de ${orixaData.nome} é ${orixaData.elemento}`,
        });

        // Add chakra correlation
        correlations.push({
          tradition: 'Chakra',
          entity: `Chakra ${orixaData.chakraPrincipal}`,
          value: orixaData.cores.join(', '),
          strength: 0.9,
          explanation: `Chakra principal de ${orixaData.nome} é o ${orixaData.chakraPrincipal}`,
        });
      }
    }

    // Calculate dominant element
    const elementCounts: Record<string, number> = {};
    for (const corr of correlations) {
      if (corr.value && typeof corr.value === 'string') {
        const elem = this.extractElement(corr.value);
        if (elem) {
          elementCounts[elem] = (elementCounts[elem] || 0) + corr.strength;
        }
      }
    }

    const dominantElement =
      Object.entries(elementCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Ar';

    // Generate harmonization recommendations
    const harmonization = this.generateHarmonization(primaryEntity, correlations, dominantElement);

    // Identify conflicts
    const conflicts = this.identifyConflicts(correlations);

    return {
      primaryEntity,
      correlations,
      dominantElement,
      dominantFrequency: this.getFrequencyForElement(dominantElement),
      harmonization,
      conflicts,
    };
  }

  /**
   * Generate comprehensive synthesis result
   */
  synthesize(input: HyperCorrelationInput): SynthesisResult {
    // Run correlation analysis
    const analysis = this.analyze(input);

    // Build signature
    const signature = this.buildSignature(input, analysis);

    // Determine strengths (confirmed by 3+ traditions)
    const strengths = this.identifyStrengths(analysis);

    // Identify shadow patterns
    const shadowPatterns = this.identifyShadowPatterns(input, analysis);

    // Generate insights
    const insights = this.generateInsights(input, analysis);

    // Recommend practices
    const practices = this.recommendPractices(signature, analysis);

    // Calculate cycles
    const cycles = this.calculateCycles(input, signature);

    return {
      signature,
      strengths,
      shadowPatterns,
      insights,
      practices,
      cycles,
    };
  }

  /**
   * Answer the key question: How does Vida Path 11 modulate the energy of
   * a Scorpio native under the regency of Oxum?
   */
  answerDeepQuestion(caminhoVida: number, signo: string, orixa: string): string {
    const orixaData = getOrixa(orixa);
    if (!orixaData) {
      return `Orixá ${orixa} não encontrado no sistema.`;
    }

    // Get all relevant elements
    const vidaElement = getElementFromNumber(caminhoVida);
    const signoElement = getElementFromSigno(signo);
    const orixaElement = orixaData.elemento;

    // Calculate modulation
    let modulation = '';

    // Master number 11 special handling
    if (caminhoVida === 11) {
      modulation = `O CAMINHO DE VIDA 11 (MASTRE) amplifica a intuição e a sensibilidade espiritual. `;
    }

    // Element interactions
    const elements = [vidaElement, signoElement, orixaElement];
    const uniqueElements = [...new Set(elements)];

    if (uniqueElements.length === 1) {
      modulation += `A energia de ${signo} em ${orixa} sob o Caminho ${caminhoVida} é AMPLAMENTE HARMONIZADA — `;
      modulation += `todos os sistemas vibram em ${uniqueElements[0]}. `;
      modulation += `Esta é uma configuração de PODER CONCENTRADO.`;
    } else if (uniqueElements.length === 2) {
      modulation += `A energia de ${signo} em ${orixa} sob o Caminho ${caminhoVida} apresenta MODULAÇÃO POLARIZADA — `;
      modulation += `${elements.filter((e) => e === uniqueElements[0]).length} sistemas em ${uniqueElements[0]} `;
      modulation += `e ${elements.filter((e) => e === uniqueElements[1]).length} em ${uniqueElements[1]}. `;
      modulation += `Esta configuração requer TRABALHO DE INTEGRAÇÃO.`;
    } else {
      modulation += `A energia de ${signo} em ${orixa} sob o Caminho ${caminhoVida} apresenta MODULAÇÃO DINÂMICA — `;
      modulation += `três elementos diferentes em interação. `;
      modulation += `Esta é uma configuração de MESTRE DA TRANSMUTAÇÃO.`;
    }

    // Specific guidance
    modulation += `\n\nRECOMENDAÇÃO: Para harmonizar:`;
    modulation += `\n- Pratique meditação no chakra ${orixaData.chakraPrincipal} (${orixaData.nome})`;
    modulation += `\n- Use cores ${orixaData.cores.join(', ')} para energizar`;
    modulation += `\n- Mantras específicos para ${orixaData.nome}`;

    return modulation;
  }

  // ─── Private Methods ─────────────────────────────────────────────────────

  private determinePrimaryEntity(
    input: HyperCorrelationInput
  ): CrossTraditionCorrelation['primaryEntity'] {
    if (input.orixaCabeca) {
      const orixa = getOrixa(input.orixaCabeca);
      return {
        type: 'orixa',
        value: orixa?.nome ?? input.orixaCabeca,
        number: orixa?.chakraPrincipal,
      };
    }

    if (input.caminhoVida) {
      return {
        type: 'numerology',
        value: `Caminho ${input.caminhoVida}`,
        number: input.caminhoVida,
      };
    }

    if (input.signoSolar) {
      return {
        type: 'zodiac',
        value: input.signoSolar,
      };
    }

    return {
      type: 'orixa',
      value: 'Oxalá',
    };
  }

  private calculateNumerologyStrength(num: number, orixaValue: string): number {
    // Master numbers have special connection to spiritual orixás
    if ([11, 22, 33].includes(num)) return 0.9;

    // Number-orixa correlations
    const orixa = getOrixa(orixaValue);
    if (orixa && orixa.numerosSagrados.includes(num % 9 || num)) return 0.85;

    return 0.6;
  }

  private extractElement(value: string): string | null {
    const elements = ['Fogo', 'Água', 'Terra', 'Ar', 'Éter'];
    for (const elem of elements) {
      if (value.toLowerCase().includes(elem.toLowerCase())) {
        return elem;
      }
    }
    return null;
  }

  private getFrequencyForElement(element: string): number {
    const frequencies: Record<string, number> = {
      Fogo: 741, // Solfeggio - Transformation
      Água: 528, // Solfeggio - DNA Repair
      Terra: 396, // Solfeggio - Liberation
      Ar: 639, // Solfeggio - Uniting
      Éter: 963, // Solfeggio - Awakening
    };
    return frequencies[element] ?? 528;
  }

  private generateHarmonization(
    primary: CrossTraditionCorrelation['primaryEntity'],
    correlations: CrossTraditionCorrelation['correlations'],
    dominantElement: string
  ): CrossTraditionCorrelation['harmonization'] {
    const harmonization: CrossTraditionCorrelation['harmonization'] = [];

    // Element-based harmonization
    harmonization.push({
      action: `Usar cores e elementos de ${dominantElement}`,
      tradition: 'Universal',
      timing: 'Diário',
    });

    // Orixá-specific harmonization
    if (primary.type === 'orixa') {
      const orixa = getOrixa(primary.value);
      if (orixa) {
        harmonization.push({
          action: `Culto a ${orixa.nome}`,
          tradition: 'Candomblé',
          timing: orixa.diaSemana,
        });

        harmonization.push({
          action: `Ervas sagradas para ${orixa.nome}`,
          tradition: 'Fitoenergética',
        });
      }
    }

    // Numerology harmonization
    if (primary.number && [11, 22, 33].includes(primary.number)) {
      harmonization.push({
        action: `Prática espiritual para MESTRE ${primary.number}`,
        tradition: 'Numerologia Cabalística',
        timing: 'Durante lua cheia',
      });
    }

    return harmonization;
  }

  private identifyConflicts(
    correlations: CrossTraditionCorrelation['correlations']
  ): CrossTraditionCorrelation['conflicts'] {
    const conflicts: CrossTraditionCorrelation['conflicts'] = [];
    const elements = correlations.map((c) => c.value).filter((v) => typeof v === 'string');

    // Check for opposing elements (Fogo vs Água, Terra vs Ar)
    const opposingPairs: Array<[string, string]> = [
      ['Fogo', 'Água'],
      ['Terra', 'Ar'],
    ];

    for (const [elem1, elem2] of opposingPairs) {
      const has1 = elements.some((e) => e.includes(elem1));
      const has2 = elements.some((e) => e.includes(elem2));

      if (has1 && has2) {
        conflicts.push({
          entity1: elem1,
          entity2: elem2,
          resolution: `Integre através de práticas que harmonizam ${elem1} e ${elem2}`,
        });
      }
    }

    return conflicts;
  }

  private buildSignature(
    input: HyperCorrelationInput,
    analysis: CrossTraditionCorrelation
  ): SynthesisResult['signature'] {
    return {
      numerology: input.caminhoVida ?? 1,
      zodiac: input.signoSolar ?? 'Aries',
      orixa: input.orixaCabeca ?? 'Oxalá',
      sephirah: input.caminhoVida === 11 ? 11 : input.caminhoVida === 22 ? 22 : undefined,
      element: analysis.dominantElement,
    };
  }

  private identifyStrengths(analysis: CrossTraditionCorrelation): string[] {
    const strengths: string[] = [];
    const tradicaoContagens: Record<string, number> = {};

    for (const corr of analysis.correlations) {
      tradicaoContagens[corr.tradition] = (tradicaoContagens[corr.tradition] || 0) + 1;
    }

    // Strengths are traditions that confirm the same element
    for (const [trad, count] of Object.entries(tradicaoContagens)) {
      if (count >= 2) {
        strengths.push(`${trad} confirma a energia dominante`);
      }
    }

    return strengths;
  }

  private identifyShadowPatterns(
    input: HyperCorrelationInput,
    analysis: CrossTraditionCorrelation
  ): string[] {
    const shadows: string[] = [];

    // Master numbers can indicate shadow if not integrated
    if (input.caminhoVida === 11) {
      shadows.push('Intuição não canalizada pode gerar ansiedade');
    }

    // Conflicts indicate shadow
    for (const conflict of analysis.conflicts) {
      shadows.push(`Tensão entre ${conflict.entity1} e ${conflict.entity2}`);
    }

    // Orixá challenges
    if (input.orixaCabeca) {
      const orixa = getOrixa(input.orixaCabeca);
      if (orixa?.desafio) {
        shadows.push(`Desafio de ${orixa.nome}: ${orixa.desafio}`);
      }
    }

    return shadows;
  }

  private generateInsights(
    input: HyperCorrelationInput,
    analysis: CrossTraditionCorrelation
  ): SynthesisResult['insights'] {
    const insights: SynthesisResult['insights'] = [];

    // High-level insight for master numbers
    if (input.caminhoVida === 11) {
      insights.push({
        level: 'high',
        description:
          'Você carrega a vibração do MESTRE 11 — a intuição mais elevada da numerologia.',
        traditions: ['Numerologia', 'Cabalá', 'Astrologia'],
      });
    }

    // Element insight
    insights.push({
      level: 'medium',
      description: `Seu elemento dominante é ${analysis.dominantElement}, revelado através de ${analysis.correlations.length} correlações.`,
      traditions: analysis.correlations.map((c) => c.tradition),
    });

    // Frequency insight
    if (analysis.dominantFrequency) {
      insights.push({
        level: 'medium',
        description: `Sua frequência de ressonância é ${analysis.dominantFrequency}Hz — a frequência de ${this.getFrequencyName(analysis.dominantFrequency)}.`,
        traditions: ['Solfeggio', 'Cabalá'],
      });
    }

    return insights;
  }

  private getFrequencyName(hz: number): string {
    const names: Record<number, string> = {
      396: 'Liberação',
      417: 'Mudança',
      528: 'Transformação',
      639: 'Unificação',
      741: 'Awakening',
      852: 'Intuição',
      963: 'Conexão Divina',
    };
    return names[hz] ?? 'Harmonia';
  }

  private recommendPractices(
    signature: SynthesisResult['signature'],
    analysis: CrossTraditionCorrelation
  ): SynthesisResult['practices'] {
    const practices: SynthesisResult['practices'] = [];

    // Orixá practice
    practices.push({
      name: `Oração e oferenda a ${signature.orixa}`,
      tradition: 'Candomblé',
      frequency: 'weekly',
      description: `Culto semanal a ${signature.orixa}`,
    });

    // Numerology practice for masters
    if (signature.numerology === 11 || signature.numerology === 22 || signature.numerology === 33) {
      practices.push({
        name: 'Meditação do Mestre',
        tradition: 'Numerologia Cabalística',
        frequency: 'daily',
        description: 'Prática diária de integração do número mestre',
      });
    }

    // Chakra practice
    const orixa = getOrixa(signature.orixa);
    if (orixa) {
      practices.push({
        name: `Ativação do Chakra ${orixa.chakraPrincipal}`,
        tradition: 'Yoga Tântrico',
        frequency: 'daily',
        description: `Trabalho específico com o chakra de ${signature.orixa}`,
      });
    }

    // Frequency practice
    if (analysis.dominantFrequency) {
      practices.push({
        name: `Sessão com Frequência ${analysis.dominantFrequency}Hz`,
        tradition: 'Solfeggio',
        frequency: 'weekly',
        description: 'Harmonização energética por frequencies',
      });
    }

    return practices;
  }

  private calculateCycles(
    input: HyperCorrelationInput,
    signature: SynthesisResult['signature']
  ): SynthesisResult['cycles'] {
    // Personal year cycle based on birth month + current year
    const currentYear = new Date().getFullYear();
    const birthMonth = input.dataNascimento ? parseInt(input.dataNascimento.split('-')[1]) : 6;
    const personalYear = ((birthMonth + currentYear - 1) % 9) + 1;

    return [
      {
        phase: `Ano Pessoal ${personalYear}`,
        duration: '12 meses',
        focus: `Ciclo de ${this.getCycleFocus(personalYear)}`,
      },
      {
        phase: 'Ciclo Lunar',
        duration: '29.5 dias',
        focus: 'Frequência de manifestações',
      },
      {
        phase: 'Trânsitos Planetários',
        duration: 'Variável',
        focus: 'Oportunidades e desafios cósmicos',
      },
    ];
  }

  private getCycleFocus(num: number): string {
    const focuses: Record<number, string> = {
      1: 'Novos começos e independência',
      2: 'Parcerias e cooperações',
      3: 'Expressão criativa e comunicação',
      4: 'Estrutura e trabalho árduo',
      5: 'Liberdade e mudanças',
      6: 'Responsabilidade familiar e harmonia',
      7: 'Reflexão e desenvolvimento espiritual',
      8: 'Poder e realização material',
      9: 'Conclusão e transformação',
    };
    return focuses[num] ?? 'Crescimento';
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ════════════════════════════════════════════════════════════════════════════

export const hyperCorrelationEngine = new HyperCorrelationEngine();
