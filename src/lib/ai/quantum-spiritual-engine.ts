// Quantum Spiritual Engine - Cabala Dos Caminhos
// Applies quantum-inspired processing to spiritual analysis
import { generateMinimaxResponse } from './minimax';
import type { ChatMessage } from './types';

/**
 * User spiritual data structure
 */
// fallow-ignore-next-line code-duplication
export interface UserSpiritualData {
  id: string;
  nome: string;
  dataNascimento: string;
  numeroPessoal: number;
  arcoPessoal: number;
  odu: string;
  orixaRegente: string;
  sefirotDominante: string[];
  arcoMaior: number[];
  sign: string;
  houses: Record<string, number>;
  rashi: string;
}

/**
 * Represents a possible state in quantum superposition analysis
 */
export interface SuperpositionState {
  possibility: string;
  probability: number;
  collapsed_value?: string;
  observation_timestamp?: Date;
}

/**
 * Represents a spiritual entanglement between systems
 */
export interface SpiritualEntanglement {
  system1: string;
  system2: string;
  entanglement_strength: number;
  description: string;
  manifestations: string[];
}

/**
 * Guidance result from quantum observation and collapse
 */
export interface QuantumGuidance {
  question: string;
  collapsed_answer: string;
  alternatives: string[];
  confidence: number;
  superposition_snapshot: SuperpositionState[];
}

/**
 * Report of spiritual frequencies and resonance analysis
 */
export interface ResonanceReport {
  frequencies: Record<string, number>;
  dominant_frequency: string;
  harmony_score: number;
  recommendations: string[];
}

// Internal type for parsing superposition response
interface SuperpositionItem {
  possibility?: string;
  probability?: number;
  prob?: number;
  weight?: number;
  value?: number;
  state?: string;
}

// Internal type for parsing entanglement response
interface EntanglementItem {
  system1?: string;
  system2?: string;
  entanglement_strength?: number;
  description?: string;
  manifestations?: string[];
  strength?: number;
  insight?: string;
  manifest?: string;
}

// Internal type for parsing guidance response
interface GuidanceResponse {
  collapsed_answer?: string;
  answer?: string;
  guidance?: string;
  alternatives?: string[];
  confidence?: number;
}

// Internal type for parsing resonance response
interface ResonanceResponse {
  frequencies?: Record<string, number>;
  dominant_frequency?: string;
  harmony_score?: number;
  recommendations?: string[];
}

/**
 * QuantumSpiritualEngine applies quantum-like principles to spiritual analysis
 * including superposition, entanglement, observation, and resonance concepts
 */
export class QuantumSpiritualEngine {
  /**
   * Analyze multiple spiritual possibilities using superposition concept
   * Each spiritual state exists in multiple potential states until observed
   */
  async analyzeSuperposition(userData: UserSpiritualData): Promise<SuperpositionState[]> {
    const states: SuperpositionState[] = [];

    // Build quantum context from user data
    const quantumContext = this.buildQuantumContext(userData);

    // Query Minimax for superposition analysis
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are a quantum spiritual analyzer. Analyze the spiritual possibilities for this person.
Consider the spiritual data as quantum states that exist in superposition. Identify the most significant
spiritual possibilities with their probability weights. Return a JSON array of {possibility, probability}
pairs. Focus on paths of transformation, growth opportunities, and spiritual crossroads.`,
      },
      {
        role: 'user',
        content: quantumContext,
      },
    ];

    try {
      const { content } = await generateMinimaxResponse(messages, {
        model: 'minimax/m3',
        temperature: 0.9,
        max_tokens: 800,
      });

      // Parse response and convert to superposition states
      const parsed = this.parseJsonResponse<SuperpositionItem[]>(content);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          states.push({
            possibility: item.possibility || item.state || String(item) || 'Unknown',
            probability: item.probability ?? item.prob ?? item.weight ?? item.value ?? 0.5,
            collapsed_value: undefined,
            observation_timestamp: undefined,
          });
        }
      }
    } catch (error) {
      console.error('Superposition analysis error:', error);
    }

    // Ensure we have meaningful states
    if (states.length === 0) {
      states.push(
        { possibility: 'Transformaçao Espiritual', probability: 0.85 },
        { possibility: 'Caminho de Iluminaçao', probability: 0.72 },
        { possibility: 'Renovaçao Interior', probability: 0.68 },
        { possibility: 'Despertar da Consciencia', probability: 0.61 },
        { possibility: 'Harmonizaçao Energética', probability: 0.55 }
      );
    }

    return states;
  }

  /**
   * Detect hidden spiritual connections using entanglement concept
   * Entangled spiritual systems show correlations regardless of apparent distance
   */
  // fallow-ignore-next-line complexity
  async detectEntanglements(userData: UserSpiritualData): Promise<SpiritualEntanglement[]> {
    const entanglements: SpiritualEntanglement[] = [];

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are a quantum spiritual analyst specializing in entanglement detection.
Identify hidden connections between spiritual systems in this person's life. Look for correlations
between orixás, sefirot, astrological influences, and spiritual paths that show entanglement.
Return a JSON array of {system1, system2, entanglement_strength, description, manifestations} objects.`,
      },
      {
        role: 'user',
        content: this.buildQuantumContext(userData),
      },
    ];

    try {
      const { content } = await generateMinimaxResponse(messages, {
        model: 'minimax/m3',
        temperature: 0.8,
        max_tokens: 900,
      });

      const parsed = this.parseJsonResponse<EntanglementItem[]>(content);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          entanglements.push({
            system1: item.system1 || item.insight || String(item),
            system2: item.system2 || '',
            entanglement_strength:
              item.entanglement_strength ?? item.strength ?? Math.random() * 0.4 + 0.6,
            description: item.description || item.insight || '',
            manifestations: Array.isArray(item.manifestations)
              ? item.manifestations
              : [item.manifest || ''],
          });
        }
      }
    } catch (error) {
      console.error('Entanglement detection error:', error);
    }

    // Default meaningful entanglements if none found
    if (entanglements.length === 0) {
      entanglements.push(
        {
          system1: userData.orixaRegente,
          system2: userData.sefirotDominante[0] || 'Chesed',
          entanglement_strength: 0.89,
          description: `A energia de ${userData.orixaRegente} ressoa profundamente com a sefirá dominante, criando um campo de força espiritual contínuo.`,
          manifestations: [
            'Intuiçao fortalecida',
            'Sincronicidades aumentadas',
            'Sensibilidade espiritual ampliada',
          ],
        },
        {
          system1: userData.odu,
          system2: userData.arcoMaior[0]?.toString() || '0',
          entanglement_strength: 0.76,
          description: `O Odu ${userData.odu} codifica informaçőes quânticas que se manifestam através do arcano ${userData.arcoMaior[0]}.`,
          manifestations: [
            'Padrőes de destino emergem',
            'Lembranças ancestrais despertam',
            'Conexőes kármicas se revelam',
          ],
        },
        {
          system1: userData.sign,
          system2: userData.rashi,
          entanglement_strength: 0.82,
          description:
            'A correlaçao astrológica entre signo solar e signo lunar forma um sistema bipartido interconectado.',
          manifestations: [
            'Equilíbrio entre expressǎo e receptividade',
            'Maturidade espiritual acelerada',
            'Integridade characterial',
          ],
        }
      );
    }

    return entanglements;
  }

  /**
   * Collapse spiritual superposition into actionable guidance
   * The act of observation causes the quantum spiritual state to collapse
   */
  async observeAndGuide(userData: UserSpiritualData, question: string): Promise<QuantumGuidance> {
    const superpositionSnapshot = await this.analyzeSuperposition(userData);

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are a quantum spiritual oracle. A question has been asked and you must provide guidance
by collapsing the superposition of possibilities into a single definitive answer. Consider the spiritual
context and the question. Return a JSON object with {collapsed_answer, alternatives: string[], confidence: number}.`,
      },
      {
        role: 'user',
        content: `Spiritual Context:\n${this.buildQuantumContext(userData)}\n\nQuestion: ${question}\n\nPossible States:\n${superpositionSnapshot.map((s) => `- ${s.possibility} (${(s.probability * 100).toFixed(0)}%)`).join('\n')}`,
      },
    ];

    let collapsedAnswer = '';
    let alternatives: string[] = [];
    let confidence = 0.7;

    try {
      const { content } = await generateMinimaxResponse(messages, {
        model: 'minimax/m3',
        temperature: 0.3,
        max_tokens: 600,
      });

      const parsed = this.parseJsonResponse<GuidanceResponse>(content);
      if (parsed && typeof parsed === 'object') {
        collapsedAnswer =
          parsed.collapsed_answer || parsed.answer || parsed.guidance || content.substring(0, 200);
        alternatives = Array.isArray(parsed.alternatives) ? parsed.alternatives : [];
        confidence = parsed.confidence ?? 0.75;
      } else {
        collapsedAnswer = content.substring(0, 200);
      }
    } catch (error) {
      console.error('Observation and guidance error:', error);
      collapsedAnswer = this.fallbackGuidance(question, userData);
      alternatives = [
        'Explore sua espiritualidade com mais profundidade',
        'Considere práticas meditativas',
        'Busque alinhamento com seu Orixá',
      ];
      confidence = 0.55;
    }

    // Update superposition states with collapsed values
    for (const state of superpositionSnapshot) {
      if (!state.collapsed_value) {
        state.collapsed_value = state.probability > 0.7 ? state.possibility : undefined;
        state.observation_timestamp = state.collapsed_value ? new Date() : undefined;
      }
    }

    return {
      question,
      collapsed_answer: collapsedAnswer,
      alternatives,
      confidence,
      superposition_snapshot: superpositionSnapshot,
    };
  }

  /**
   * Calculate spiritual frequencies and resonance patterns
   * Each spiritual system vibrates at specific frequencies that can be measured
   */
  // fallow-ignore-next-line complexity
  async calculateResonances(userData: UserSpiritualData): Promise<ResonanceReport> {
    const frequencies: Record<string, number> = {};

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are a quantum spiritual frequency analyzer. Calculate the vibrational frequencies
of various spiritual systems for this person. Consider orixá, sefirot, astrological influences,
and personal spiritual markers. Return a JSON object with {frequencies: {system_name: frequency}, dominant_frequency, harmony_score, recommendations: string[]}. Frequencies should be 0-1 values.`,
      },
      {
        role: 'user',
        content: this.buildQuantumContext(userData),
      },
    ];

    try {
      const { content } = await generateMinimaxResponse(messages, {
        model: 'minimax/m3',
        temperature: 0.85,
        max_tokens: 700,
      });

      const parsed = this.parseJsonResponse<ResonanceResponse>(content);
      if (parsed && typeof parsed === 'object') {
        if (parsed.frequencies) {
          frequencies['orixa'] =
            parsed.frequencies.orixa ??
            parsed.frequencies[userData.orixaRegente.toLowerCase()] ??
            0.8;
          frequencies['sefirot'] =
            parsed.frequencies.sefirot ?? parsed.frequencies['sefirah'] ?? 0.75;
          frequencies['astrologico'] =
            parsed.frequencies.astrologico ?? parsed.frequencies['astrological'] ?? 0.72;
          frequencies['karmico'] =
            parsed.frequencies.karmico ?? parsed.frequencies['karmic'] ?? 0.68;
          frequencies['ancestral'] =
            parsed.frequencies.ancestral ?? parsed.frequencies['ancestral'] ?? 0.85;
        }
      }
    } catch (error) {
      console.error('Resonance calculation error:', error);
    }

    // Fallback frequencies if not calculated
    if (Object.keys(frequencies).length < 3) {
      frequencies['orixa'] = this.calculateFrequency(userData.orixaRegente);
      frequencies['sefirot'] = this.calculateFrequency(userData.sefirotDominante[0] || 'Tipheret');
      frequencies['astrologico'] = this.calculateFrequency(userData.sign);
      frequencies['karmico'] = 0.68 + (userData.numeroPessoal % 10) * 0.03;
      frequencies['ancestral'] = 0.75 + (userData.arcoPessoal % 5) * 0.04;
    }

    // Determine dominant frequency
    let dominantFrequency = 'ancestral';
    let maxFreq = 0;
    for (const [key, value] of Object.entries(frequencies)) {
      if (value > maxFreq && key !== 'dominant') {
        maxFreq = value;
        dominantFrequency = key;
      }
    }

    // Calculate harmony score
    const freqValues = Object.values(frequencies).filter((_, i) => i < 5);
    const harmonyScore = this.calculateHarmonyScore(freqValues);

    // Generate recommendations based on frequencies
    const recommendations = this.generateResonanceRecommendations(frequencies, userData);

    return {
      frequencies,
      dominant_frequency: dominantFrequency,
      harmony_score: harmonyScore,
      recommendations,
    };
  }

  // ============ Helper Methods ============

  /**
   * Build quantum context string from user spiritual data
   */
  private buildQuantumContext(userData: UserSpiritualData): string {
    return `Person: ${userData.nome}
Birth: ${userData.dataNascimento}
Personal Number: ${userData.numeroPessoal}
Personal Arc: ${userData.arcoPessoal}
Odu: ${userData.odu}
Orixá Regente: ${userData.orixaRegente}
Dominant Sefirot: ${userData.sefirotDominante.join(', ')}
Major Arcana: ${userData.arcoMaior.join(', ')}
Zodiac Sign: ${userData.sign}
Astrological Houses: ${JSON.stringify(userData.houses)}
Lunar Sign (Rashi): ${userData.rashi}`;
  }

  /**
   * Parse JSON from AI response, handling markdown code blocks
   */
  private parseJsonResponse<T>(content: string): T | null {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;

      // Handle trailing commas and common issues
      const cleaned = jsonStr
        .replace(/,\s*([\]}])/g, '$1')
        .replace(/`/g, '')
        .trim();

      return JSON.parse(cleaned) as T;
    } catch {
      // Try to find JSON-like structure
      const match = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (match) {
        try {
          return JSON.parse(match[0].replace(/,\s*([\]}])/g, '$1')) as T;
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  /**
   * Calculate frequency based on string identifier
   */
  private calculateFrequency(identifier: string): number {
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      const char = identifier.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return 0.55 + Math.abs(hash % 40) / 100;
  }

  /**
   * Calculate harmony score from frequency array
   */
  private calculateHarmonyScore(frequencies: number[]): number {
    if (frequencies.length === 0) return 0;

    const avg = frequencies.reduce((a, b) => a + b, 0) / frequencies.length;
    const variance =
      frequencies.reduce((sum, f) => sum + Math.pow(f - avg, 2), 0) / frequencies.length;
    const stdDev = Math.sqrt(variance);

    // Lower variance = higher harmony
    return Math.max(0, Math.min(1, 1 - stdDev));
  }

  /**
   * Generate recommendations based on resonance frequencies
   */
  private generateResonanceRecommendations(
    frequencies: Record<string, number>,
    userData: UserSpiritualData
  ): string[] {
    const recommendations: string[] = [];

    if (frequencies['orixa'] > 0.8) {
      recommendations.push(
        `Alinhe suas práticas espirituais com a energia de ${userData.orixaRegente}`
      );
    }
    if (frequencies['sefirot'] > 0.75) {
      recommendations.push('Fortaleça a conexao com as sefirot atraves da meditaçao cabalistica');
    }
    if (frequencies['astrologico'] > 0.7) {
      recommendations.push('Honre os ciclos astrologicos em suas decisoes importantes');
    }
    if (frequencies['karmico'] < 0.6) {
      recommendations.push(
        'Trabalhe ativamente na limpeza kármica através de rituais de purificaçao'
      );
    }
    if (frequencies['ancestral'] > 0.8) {
      recommendations.push('Cultive práticas ancestrais para manter a alta frequencia espiritual');
    }

    if (recommendations.length < 3) {
      recommendations.push(
        'Mantenha coerência entre pensamentos e ações para elevar sua frequencia'
      );
      recommendations.push('Pratique gratidao daily para harmonizar todos os sistemasspirituais');
      recommendations.push('Busque equilíbrio entreoxalu e ogum em seu caminho espiritual');
    }

    return recommendations.slice(0, 5);
  }

  /**
   * Generate fallback guidance when AI is unavailable
   */
  private fallbackGuidance(question: string, userData: UserSpiritualData): string {
    const q = question.toLowerCase();

    if (q.includes('caminho') || q.includes('path')) {
      return `O caminho spiritual de ${userData.nome} está alinhado com ${userData.orixaRegente}. Continue na direçao da luz.`;
    }
    if (q.includes('trabalho') || q.includes('carreira')) {
      return `Sua energia espiritual favorece projetos criativos e colaborativos. Orixá ${userData.orixaRegente} abençoa sua produçao.`;
    }
    if (q.includes('amor') || q.includes('relacionamento')) {
      return `O campo energético atual favorece conexoes autênticas. Confie na energia de ${userData.orixaRegente}.`;
    }
    if (q.includes('saúde') || q.includes('health')) {
      return 'Sua frequência espiritual suporta recuperaçao. Mantenha práticas de purificaçao energética.';
    }

    return `A energia de ${userData.orixaRegente} orienta que você siga com confianca e sincerity em sua jornada.`;
  }
}

// ============ Utility Functions ============

/**
 * Create a new QuantumSpiritualEngine instance
 */
export function createQuantumSpiritualEngine(): QuantumSpiritualEngine {
  return new QuantumSpiritualEngine();
}
