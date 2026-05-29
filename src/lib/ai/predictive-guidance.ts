import { generateMinimaxResponse } from './minimax';
import type { UserSpiritualData } from './types';
import type { ChatMessage } from './types';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export interface SpiritualTrend {
  id: string;
  direction: 'ascending' | 'descending' | 'stable';
  energy_type: string;
  strength: number;
  duration_days: number;
  best_for: string[];
  caution_for: string[];
}

export interface AuspiciousTime {
  id: string;
  start_time: Date;
  end_time: Date;
  significance: string;
  practices_recommended: string[];
  energy_description: string;
}

export interface PredictedChallenge {
  id: string;
  type: string;
  description: string;
  likelihood: number;
  mitigation: string[];
  timing: string;
}

export interface GuidanceRecommendation {
  priority: number;
  action: string;
  rationale: string;
  expected_outcome: string;
}

export interface ProactiveGuidance {
  title: string;
  summary: string;
  recommendations: GuidanceRecommendation[];
  upcoming_opportunities: string[];
  preparation_steps: string[];
}

export interface SpiritualPrediction {
  id: string;
  type: string;
  prediction: string;
  confidence: number;
  timeframe: string;
}

// ============================================================
// PREDICTIVE TYPES (Assignment Requirements)
// ============================================================

export interface Prediction {
  type: 'spiritual' | 'energetic' | 'ritual' | 'relationship' | 'health';
  timeline: 'today' | 'week' | 'month' | 'year';
  confidence: number;
  prediction: string;
  explanation: string;
  action?: string;
}

export interface RitualRecommendation {
  ritual: string;
  bestTiming: string;
  duration: string;
  materials: string[];
  purpose: string;
  orixaConnection: string;
}

export interface EnergyCycle {
  startDate: Date;
  endDate: Date;
  cycleType: 'high' | 'low' | 'transition' | 'balance';
  description: string;
  practices: string[];
}

export interface OptimalTiming {
  activity: string;
  bestDay: string;
  bestTime: string;
  reason: string;
  moonPhase: string;
}

// ============================================================
// HELPERS
// ============================================================

function generateId(): string {
  return `sp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function calculateCyclePosition(dataNascimento: string): number {
  const birth = new Date(dataNascimento);
  const now = new Date();
  const diffMs = now.getTime() - birth.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays % 9;
}

function getNumerologyPhase(numeroPessoal: number): string {
  const phases = [
    'foundation', 'social', 'expression', 'organization',
    'search', 'balance', 'reflection', 'completion', 'fulfillment'
  ];
  return phases[(numeroPessoal - 1) % 9];
}

function getOduPhase(odu: string): 'initiation' | 'development' | 'culmination' {
  const oduLower = odu.toLowerCase();
  if (['ogbe', 'ogu', 'ejife'].includes(oduLower)) return 'initiation';
  if (['oshi', 'iro', 'odorun'].includes(oduLower)) return 'culmination';
  return 'development';
}

// ============================================================
// PREDICTIVE GUIDANCE ENGINE
// ============================================================

export class PredictiveGuidanceEngine {
  /**
   * Predict spiritual trends for user
   */
  predictTrends(userData: UserSpiritualData, daysAhead: number): SpiritualTrend[] {
    const trends: SpiritualTrend[] = [];
    const cyclePos = calculateCyclePosition(userData.dataNascimento);
    const phase = getNumerologyPhase(userData.numeroPessoal);
    const oduPhase = getOduPhase(userData.odu);

    // Trend 1: Numerological cycle
    const numerologyStrength = (cyclePos + 1) / 9;
    trends.push({
      id: generateId(),
      direction: numerologyStrength > 0.6 ? 'ascending' : numerologyStrength < 0.4 ? 'descending' : 'stable',
      energy_type: phase,
      strength: Math.round(numerologyStrength * 100) / 100,
      duration_days: Math.min(daysAhead, 9 - cyclePos),
      best_for: this.getBestActivities(phase, userData),
      caution_for: this.getCautionActivities(phase, userData),
    });

    // Trend 2: Odu-based energy
    const oduStrength = oduPhase === 'initiation' ? 0.8 : oduPhase === 'culmination' ? 0.6 : 0.7;
    trends.push({
      id: generateId(),
      direction: oduPhase === 'initiation' ? 'ascending' : oduPhase === 'culmination' ? 'stable' : 'ascending',
      energy_type: `odu_${userData.odu.toLowerCase()}`,
      strength: oduStrength,
      duration_days: Math.min(daysAhead, 7),
      best_for: this.getOduBestActivities(userData.odu),
      caution_for: this.getOduCautionActivities(userData.odu),
    });

    // Trend 3: Sefirot influence (Karma path)
    const sefira = userData.sefirotDominante[0] || 'chesed';
    trends.push({
      id: generateId(),
      direction: 'stable',
      energy_type: `sefira_${sefira}`,
      strength: 0.65,
      duration_days: Math.min(daysAhead, 14),
      best_for: this.getSefiraBestActivities(sefira),
      caution_for: this.getSefiraCautionActivities(sefira),
    });

    // Trend 4: Personal year cycle
    const personalYearStrength = ((new Date().getMonth() + 1) / 12) * 0.4 + 0.5;
    trends.push({
      id: generateId(),
      direction: 'ascending',
      energy_type: 'personal_year_peak',
      strength: Math.round(personalYearStrength * 100) / 100,
      duration_days: daysAhead,
      best_for: ['introspection', 'new_beginnings', 'spiritual_study'],
      caution_for: ['impulsive_decisions', 'conflict'],
    });

    return trends;
  }

  /**
   * Forecast auspicious times for spiritual practices
   */
  forecastAuspiciousTimes(userData: UserSpiritualData): AuspiciousTime[] {
    const times: AuspiciousTime[] = [];
    const now = new Date();
    const cyclePos = calculateCyclePosition(userData.dataNascimento);

    const peakHours = this.calculatePeakHours(cyclePos, userData.numeroPessoal);

    for (const hour of peakHours) {
      const startTime = new Date(now);
      startTime.setHours(hour, 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setHours(hour + 2, 0, 0, 0);

      times.push({
        id: generateId(),
        start_time: startTime,
        end_time: endTime,
        significance: this.getTimeSignificance(hour, userData),
        practices_recommended: this.getRecommendedPractices(hour, userData),
        energy_description: this.getEnergyDescription(hour, userData),
      });
    }

    const dayOfWeek = now.getDay();
    const weeklyBestDays = [1, 4, 6];
    if (weeklyBestDays.includes(dayOfWeek)) {
      const weekStart = new Date(now);
      weekStart.setHours(6, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setHours(9, 0, 0, 0);

      times.push({
        id: generateId(),
        start_time: weekStart,
        end_time: weekEnd,
        significance: 'weekly_spiritual_peak',
        practices_recommended: ['meditation', 'ritual', 'divination', 'prayer'],
        energy_description: `Enhanced spiritual receptivity during the ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]} morning window for ${userData.orixaRegente} devotees.`,
      });
    }

    const moonPhase = this.getMoonPhase();
    if (moonPhase === 'waxing') {
      const moonTime = new Date(now);
      moonTime.setHours(20, 0, 0, 0);
      const moonEnd = new Date(moonTime);
      moonEnd.setHours(23, 59, 0, 0);

      times.push({
        id: generateId(),
        start_time: moonTime,
        end_time: moonEnd,
        significance: 'waxing_moon_expansion',
        practices_recommended: ['intentions', 'manifestation', 'new_practices'],
        energy_description: 'Waxing moon amplifies intention-setting and new spiritual endeavors.',
      });
    }

    return times;
  }

  /**
   * Predict potential challenges
   */
  predictChallenges(userData: UserSpiritualData): PredictedChallenge[] {
    const challenges: PredictedChallenge[] = [];
    const cyclePos = calculateCyclePosition(userData.dataNascimento);
    const oduPhase = getOduPhase(userData.odu);

    if (cyclePos >= 7) {
      challenges.push({
        id: generateId(),
        type: 'numerological_transition',
        description: 'Approaching end of current numerological cycle - potential restlessness or completion anxiety',
        likelihood: 0.75,
        mitigation: [
          'Practice grounding exercises',
          'Journal current feelings and insights',
          'Prepare for new cycle intentions',
          'Seek spiritual guidance for direction',
        ],
        timing: 'Next 2-3 days',
      });
    }

    if (oduPhase === 'culmination') {
      challenges.push({
        id: generateId(),
        type: 'odu_culmination',
        description: `${userData.odu} culmination energy may bring unresolved matters to surface`,
        likelihood: 0.7,
        mitigation: [
          'Review recent decisions carefully',
          'Practice patience in communications',
          'Engage in contemplative practices',
          'Avoid major commitments until energy stabilizes',
        ],
        timing: 'This week',
      });
    }

    const sefira = userData.sefirotDominante[0] || 'chesed';
    const imbalanceType = this.getSefiraImbalance(sefira);
    challenges.push({
      id: generateId(),
      type: `sefira_imbalance_${sefira}`,
      description: `${sefira} energy may become excessive - ${imbalanceType.description}`,
      likelihood: 0.6,
      mitigation: imbalanceType.mitigation,
      timing: 'Next 3-5 days',
    });

    if (userData.arcoPessoal >= 7) {
      challenges.push({
        id: generateId(),
        type: 'personal_archallenge',
        description: `Life path ${userData.arcoPessoal} may present complex decisions requiring discernment`,
        likelihood: 0.65,
        mitigation: [
          'Meditate before important decisions',
          'Consult with spiritual advisor',
          'Trust intuition over logic',
          'Review long-term goals alignment',
        ],
        timing: 'Next week',
      });
    }

    challenges.push({
      id: generateId(),
      type: 'external_interference',
      description: 'Eighth house energy ( Scorpio/rashi) may attract influential but unclear energies',
      likelihood: 0.5,
      mitigation: [
        'Increase protective rituals',
        'Practice energy clearing',
        'Maintain clear intentions',
        'Limit exposure to negative influences',
      ],
      timing: 'Next 2-4 days',
    });

    return challenges;
  }

  /**
   * Generate proactive guidance
   */
  generateProactiveGuidance(userData: UserSpiritualData): ProactiveGuidance {
    const trends = this.predictTrends(userData, 7);
    const challenges = this.predictChallenges(userData);
    const phase = getNumerologyPhase(userData.numeroPessoal);
    const oduPhase = getOduPhase(userData.odu);

    const recommendations: GuidanceRecommendation[] = [];

    if (challenges.length > 0) {
      const primaryChallenge = challenges.reduce((a, b) => a.likelihood > b.likelihood ? a : b);
      recommendations.push({
        priority: 1,
        action: `Address ${primaryChallenge.type} through ${primaryChallenge.mitigation[0]}`,
        rationale: `${primaryChallenge.description} with ${Math.round(primaryChallenge.likelihood * 100)}% likelihood`,
        expected_outcome: 'Navigate challenge with greater ease and spiritual alignment',
      });
    }

    const ascendingTrend = trends.find(t => t.direction === 'ascending');
    if (ascendingTrend) {
      recommendations.push({
        priority: 2,
        action: `Engage in ${ascendingTrend.best_for[0]} activities`,
        rationale: `${ascendingTrend.energy_type} energy is ${ascendingTrend.direction} with ${ascendingTrend.strength * 100}% strength`,
        expected_outcome: 'Maximize spiritual growth during favorable cycle',
      });
    }

    recommendations.push({
      priority: 3,
      action: `Cultivate ${userData.sefirotDominante[0]} through daily practice`,
      rationale: `${userData.sefirotDominante[0]} is your dominant sefira - consistent practice amplifies its benefits`,
      expected_outcome: 'Deeper alignment with your spiritual path',
    });

    if (oduPhase === 'initiation') {
      recommendations.push({
        priority: 4,
        action: 'Begin one new spiritual practice or study',
        rationale: `${userData.odu} initiation energy supports new beginnings`,
        expected_outcome: 'Establish foundation for spiritual growth',
      });
    }

    recommendations.push({
      priority: 5,
      action: 'Maintain regular meditation and reflection schedule',
      rationale: 'Consistency during any cycle phase ensures stability',
      expected_outcome: 'Smoother transitions and deeper self-awareness',
    });

    const opportunities = this.generateOpportunities(userData, trends);
    const preparationSteps = this.generatePreparationSteps(userData, challenges, trends);

    return {
      title: `Spiritual Guidance for ${userData.nome} - ${new Date().toLocaleDateString('pt-BR')}`,
      summary: `Current cycle phase: ${phase}. ${userData.orixaRegente} energy. ${trends.length} active trends. ${challenges.length} potential challenges.`,
      recommendations,
      upcoming_opportunities: opportunities,
      preparation_steps: preparationSteps,
    };
  }

  /**
   * Generate AI-powered prediction explanation
   */
  async explainPrediction(prediction: SpiritualPrediction): Promise<string> {
    const systemPrompt = `You are a spiritual guidance AI assistant. Explain spiritual predictions with wisdom, clarity, and actionable insight. Always ground your explanations in the user's spiritual context when provided.`;

    const userMessage = `Explain this spiritual prediction in detail:

Prediction ID: ${prediction.id}
Type: ${prediction.type}
Prediction: ${prediction.prediction}
Confidence: ${prediction.confidence * 100}%
Timeframe: ${prediction.timeframe}

Provide a thoughtful explanation that helps the seeker understand:
1. What this prediction means for their spiritual journey
2. Why this timing is significant
3. How to work with this energy constructively

Be supportive and empowering, avoiding fear-based messaging.`;

    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ];

      const response = await generateMinimaxResponse(messages, {
        temperature: 0.8,
        max_tokens: 800,
      });

      return response.content;
    } catch (error) {
      return `Unable to generate AI explanation at this time. The prediction remains valid: ${prediction.prediction}. Consider meditating on its meaning or consulting with a spiritual advisor for personalized guidance.`;
    }
  }

  // ============================================================
  // NEW PREDICTIVE FUNCTIONS (Assignment Requirements)
  // ============================================================

  /**
   * Predict spiritual trends for the next 30 days
   */
  async predictNext30Days(userData: UserSpiritualData): Promise<Prediction[]> {
    const predictions: Prediction[] = [];
    const cyclePos = calculateCyclePosition(userData.dataNascimento);
    const phase = getNumerologyPhase(userData.numeroPessoal);
    const oduPhase = getOduPhase(userData.odu);

    const systemPrompt = `You are a spiritual guide with deep knowledge of Kabbalah, Tarot, Astrology, Numerology, and Candomblé. Predict spiritual developments for the next 30 days based on the user's spiritual data. Return a JSON array of predictions.`;

    const userMessage = `Based on the following spiritual data, predict the spiritual developments for the next 30 days:

Nome: ${userData.nome}
Data de Nascimento: ${userData.dataNascimento}
Número Pessoal: ${userData.numeroPessoal}
Arco Pessoal: ${userData.arcoPessoal}
Odu: ${userData.odu}
Orixá Regente: ${userData.orixaRegente}
Sefirot: ${userData.sefirotDominante.join(', ')}
Signo: ${userData.sign}
Rashi: ${userData.rashi}

Current cycle position: ${cyclePos}
Numerological phase: ${phase}
Odu phase: ${oduPhase}

Generate 5-7 predictions covering spiritual growth, energetic shifts, ritual opportunities, relationship dynamics, and health considerations. Each prediction should include:
- type: 'spiritual' | 'energetic' | 'ritual' | 'relationship' | 'health'
- timeline: 'today' | 'week' | 'month' | 'year'
- confidence: 0.0-1.0
- prediction: brief prediction text
- explanation: why this prediction applies
- action: recommended action (optional)

Return as JSON array like: [{"type": "spiritual", "timeline": "week", "confidence": 0.85, "prediction": "...", "explanation": "...", "action": "..."}]`;

    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ];

      const response = await generateMinimaxResponse(messages, {
        temperature: 0.7,
        max_tokens: 1500,
      });

      const parsed = JSON.parse(response.content.trim());
      if (Array.isArray(parsed)) {
        predictions.push(...parsed.map((p: Partial<Prediction>) => ({
          type: p.type || 'spiritual',
          timeline: p.timeline || 'week',
          confidence: p.confidence || 0.5,
          prediction: p.prediction || '',
          explanation: p.explanation || '',
          action: p.action,
        })));
      }
    } catch (error) {
      predictions.push(...this.generateAlgorithmicPredictions(userData));
    }

    if (predictions.length === 0) {
      predictions.push(...this.generateAlgorithmicPredictions(userData));
    }

    return predictions;
  }

  /**
   * Predict optimal rituals for the next period
   */
  async predictOptimalRituals(userData: UserSpiritualData): Promise<RitualRecommendation[]> {
    const recommendations: RitualRecommendation[] = [];
    const orixa = userData.orixaRegente;

    const systemPrompt = `You are a spiritual ritual advisor for Candomblé and Kabbalah traditions. Recommend optimal rituals based on the user's spiritual profile.`;

    const userMessage = `Based on this spiritual profile, recommend optimal rituals for spiritual growth:

Orixá: ${orixa}
Odu: ${userData.odu}
Sefirot: ${userData.sefirotDominante.join(', ')}
Personal Number: ${userData.numeroPessoal}

Generate 4-6 ritual recommendations with timing, duration, materials, purpose, and orixá connection. Return as JSON array:
[{"ritual": "name", "bestTiming": "description", "duration": "time", "materials": ["item1", "item2"], "purpose": "description", "orixaConnection": "orixá name"}]`;

    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ];

      const response = await generateMinimaxResponse(messages, {
        temperature: 0.7,
        max_tokens: 1200,
      });

      const parsed = JSON.parse(response.content.trim());
      if (Array.isArray(parsed)) {
        recommendations.push(...parsed.map((r: Partial<RitualRecommendation>) => ({
          ritual: r.ritual || 'Ritual',
          bestTiming: r.bestTiming || 'When feels called',
          duration: r.duration || '30 minutes',
          materials: r.materials || [],
          purpose: r.purpose || 'Spiritual alignment',
          orixaConnection: r.orixaConnection || orixa,
        })));
      }
    } catch (error) {
      recommendations.push(...this.generateAlgorithmicRituals(userData));
    }

    if (recommendations.length === 0) {
      recommendations.push(...this.generateAlgorithmicRituals(userData));
    }

    return recommendations;
  }

  /**
   * Calculate energy cycles based on birth date
   */
  calculateEnergyCycles(birthDate: string): EnergyCycle[] {
    const cycles: EnergyCycle[] = [];
    const birth = new Date(birthDate);
    const now = new Date();
    
    const cycleLength = 28;
    const daysSinceBirth = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    const currentCycleDay = daysSinceBirth % cycleLength;

    const phases: Array<{ day: number; type: EnergyCycle['cycleType']; desc: string; practices: string[] }> = [
      { day: 0, type: 'high', desc: 'New cycle begins - high energy, ideal for new intentions', practices: ['intention setting', 'new rituals', 'cleansing'] },
      { day: 7, type: 'transition', desc: 'First quarter - building energy, good for structured work', practices: ['structured meditation', 'learning', 'planning'] },
      { day: 14, type: 'balance', desc: 'Full cycle point - balanced energy, peak spiritual receptivity', practices: ['divination', 'deep meditation', 'ritual work'] },
      { day: 21, type: 'transition', desc: 'Last quarter - releasing energy, good for reflection', practices: ['shadow work', 'release rituals', 'gratitude practice'] },
    ];

    for (const phase of phases) {
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() + ((phase.day - currentCycleDay + cycleLength) % cycleLength) - 1);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      cycles.push({
        startDate,
        endDate,
        cycleType: phase.type,
        description: phase.desc,
        practices: phase.practices,
      });
    }

    // Add seasonal cycle (90-day quarter year)
    const seasonalDay = daysSinceBirth % 90;
    const seasonalPhase = Math.floor(seasonalDay / 90);
    const seasonalTypes: EnergyCycle['cycleType'][] = ['high', 'transition', 'low', 'balance'];
    const seasonalDescriptions: string[] = [
      'Quarter year begins - fresh energy for growth',
      'Quarter midpoint - steady development phase',
      'Quarter end - preparation for next cycle',
      'Quarter transition - integration and completion',
    ];

    const seasonalStart = new Date(now);
    seasonalStart.setDate(seasonalStart.getDate() + (seasonalDay < 45 ? 0 : seasonalDay < 90 ? 45 : -45));
    const seasonalEnd = new Date(seasonalStart);
    seasonalEnd.setDate(seasonalEnd.getDate() + 44);

    cycles.push({
      startDate: seasonalStart,
      endDate: seasonalEnd,
      cycleType: seasonalTypes[seasonalPhase],
      description: seasonalDescriptions[seasonalPhase],
      practices: ['quarter review', 'intention realignment', 'energetic reset'],
    });

    return cycles;
  }

  /**
   * Recommend optimal timing for activities
   */
  recommendOptimalTiming(activity: string): OptimalTiming {
    const activityLower = activity.toLowerCase();
    
    const activityMap: Record<string, { day: string; time: string; reason: string; moon: string }> = {
      meditation: {
        day: 'Sunday',
        time: '5:00-7:00 AM',
        reason: 'Dawn quiet hours align with spiritual receptivity',
        moon: 'waxing or full',
      },
      ritual: {
        day: 'Saturday',
        time: '8:00-10:00 PM',
        reason: 'Evening darkness amplifies ritual energy',
        moon: 'full or waning',
      },
      divination: {
        day: 'Thursday',
        time: '6:00-8:00 PM',
        reason: 'Jupiter hour favors prophetic insight',
        moon: 'any',
      },
      prayer: {
        day: 'Wednesday',
        time: '6:00-7:00 AM',
        reason: 'Mercury hour for spiritual communication',
        moon: 'waxing',
      },
      cleansing: {
        day: 'Friday',
        time: '6:00-8:00 AM',
        reason: 'Venus hour supports purification',
        moon: 'waning or new',
      },
      offering: {
        day: 'Saturday',
        time: '7:00-9:00 PM',
        reason: 'Saturn hour for honoring ancestors and orixás',
        moon: 'full or waning',
      },
    };

    let match = activityMap[activityLower];
    if (!match) {
      for (const [key, value] of Object.entries(activityMap)) {
        if (activityLower.includes(key) || key.includes(activityLower)) {
          match = value;
          break;
        }
      }
    }

    if (!match) {
      match = {
        day: 'Sunday',
        time: '6:00-8:00 AM',
        reason: 'General spiritual practice time',
        moon: 'waxing',
      };
    }

    return {
      activity,
      bestDay: match.day,
      bestTime: match.time,
      reason: match.reason,
      moonPhase: match.moon,
    };
  }

  // ============================================================
  // PRIVATE HELPER METHODS
  // ============================================================

  private calculatePeakHours(cyclePos: number, numeroPessoal: number): number[] {
    const baseHours = [4, 5, 20, 21];
    const offset = (cyclePos + numeroPessoal) % 4;
    return baseHours.map(h => (h + offset) % 24).filter(h => h >= 4 || h <= 6 || h >= 20);
  }

  private getTimeSignificance(hour: number, userData: UserSpiritualData): string {
    if (hour >= 4 && hour < 6) return 'dawn_spiritual_peak';
    if (hour >= 20 && hour < 22) return 'evening_spiritual_peak';
    return 'general_spiritual_window';
  }

  private getRecommendedPractices(hour: number, userData: UserSpiritualData): string[] {
    if (hour >= 4 && hour < 6) {
      return ['meditation', 'prayer', 'intention_setting', 'yoga'];
    }
    return ['contemplation', 'reading', 'ritual', 'gratitude_practice'];
  }

  private getEnergyDescription(hour: number, userData: UserSpiritualData): string {
    if (hour >= 4 && hour < 6) {
      return `Pre-dawn spiritual window - ideal for ${userData.orixaRegente} devotees to connect with their orixá before the world awakens.`;
    }
    return `Evening spiritual window - peaceful time for reflection and connecting with the divine within.`;
  }

  private getBestActivities(phase: string, userData: UserSpiritualData): string[] {
    const activityMap: Record<string, string[]> = {
      foundation: ['planning', 'organization', 'grounding'],
      social: ['collaboration', 'networking', 'community'],
      expression: ['creative_arts', 'communication', 'self_expression'],
      organization: ['structure', 'routine', 'discipline'],
      search: ['study', 'exploration', 'research'],
      balance: ['harmony', 'mediation', 'adjustment'],
      reflection: ['introspection', 'journaling', 'meditation'],
      completion: ['wrapping_up', 'finalizing', 'letting_go'],
      fulfillment: ['celebration', 'gratitude', 'sharing'],
    };
    return activityMap[phase] || ['general_spiritual_practice'];
  }

  private getCautionActivities(phase: string, userData: UserSpiritualData): string[] {
    const cautionMap: Record<string, string[]> = {
      foundation: ['impulsiveness', 'over_commitment'],
      social: ['isolation', 'gossip'],
      expression: ['overwhelming_others', 'vanity'],
      organization: ['rigidity', 'perfectionism'],
      search: ['distraction', 'superficiality'],
      balance: ['indecision', 'extremism'],
      reflection: ['self_pity', 'isolation'],
      completion: ['resistance', 'clinging'],
      fulfillment: ['overindulgence', 'arrogance'],
    };
    return cautionMap[phase] || ['excessive_ambition'];
  }

  private getOduBestActivities(odu: string): string[] {
    const oduLower = odu.toLowerCase();
    if (['ogbe', 'ogu'].includes(oduLower)) return ['new_beginnings', 'courage', 'action'];
    if (['oshi', 'ewi'].includes(oduLower)) return ['wisdom', 'patience', 'strategic_thinking'];
    return ['general_spiritual_practice', 'devotion'];
  }

  private getOduCautionActivities(odu: string): string[] {
    const oduLower = odu.toLowerCase();
    if (['ogbe', 'ogu'].includes(oduLower)) return ['haste', 'recklessness'];
    if (['oshi', 'ewi'].includes(oduLower)) return ['impatience', 'confrontation'];
    return ['spiritualComplacency'];
  }

  private getSefiraBestActivities(sefira: string): string[] {
    const sefiraMap: Record<string, string[]> = {
      chesed: ['giving', 'expansion', 'teaching'],
      gevura: ['discernment', 'strength', 'limits'],
      tiferet: ['harmony', 'beauty', 'compassion'],
      netzach: ['endurance', 'victory', 'creative_expression'],
      hod: ['humility', 'structured_thought', 'communication'],
      yesod: ['foundation', 'imagination', 'connection'],
      malchut: ['leadership', 'manifestation', 'service'],
    };
    return sefiraMap[sefira] || ['spiritual_practice'];
  }

  private getSefiraCautionActivities(sefira: string): string[] {
    const cautionMap: Record<string, string[]> = {
      chesed: ['excessive_leniency', 'overexpansion'],
      gevura: ['harshness', 'judgment'],
      tiferet: ['vanity', 'imbalance'],
      netzach: ['stubbornness', 'obsession'],
      hod: ['self-deprecation', 'scattered_thought'],
      yesod: ['foundationlessness', 'fantasy'],
      malchut: ['authoritarianism', 'materialism'],
    };
    return cautionMap[sefira] || ['spiritualComplacency'];
  }

  private getSefiraImbalance(sefira: string): { description: string; mitigation: string[] } {
    const imbalances: Record<string, { description: string; mitigation: string[] }> = {
      chesed: {
        description: 'excessive generosity or martyrdom',
        mitigation: ['Set healthy boundaries', 'Practice saying no', 'Receive as well as give'],
      },
      gevura: {
        description: 'excessive severity or fear',
        mitigation: ['Cultivate self-compassion', 'Practice gentle strength', 'Allow joy'],
      },
      tiferet: {
        description: 'vanity or emotional volatility',
        mitigation: ['Practice humility', 'Balance giving and receiving', 'Ground in truth'],
      },
      netzach: {
        description: 'obsessive drive or bitterness',
        mitigation: ['Detach from outcomes', 'Practice forgiveness', 'Find inner peace'],
      },
      hod: {
        description: 'self-doubt or intellectual pride',
        mitigation: ['Honor your wisdom', 'Balance logic and feeling', 'Speak your truth'],
      },
      yesod: {
        description: 'foundation instability or escapism',
        mitigation: ['Ground in practical matters', 'Face reality directly', 'Build healthy routines'],
      },
      malchut: {
        description: 'powerlessness or domination',
        mitigation: ['Trust your authority', 'Serve others', 'Accept finite limitations'],
      },
    };
    return imbalances[sefira] || { description: 'energetic fluctuation', mitigation: ['Maintain spiritual balance'] };
  }

  private getMoonPhase(): 'waxing' | 'waning' | 'full' | 'new' {
    const dayOfMonth = new Date().getDate();
    if (dayOfMonth <= 7) return 'waxing';
    if (dayOfMonth <= 14) return 'waxing';
    if (dayOfMonth <= 21) return 'waning';
    if (dayOfMonth <= 28) return 'waning';
    return 'waxing';
  }

  private generateOpportunities(userData: UserSpiritualData, trends: SpiritualTrend[]): string[] {
    const opportunities: string[] = [];
    const ascendingTrends = trends.filter(t => t.direction === 'ascending');

    for (const trend of ascendingTrends) {
      if (trend.best_for.length > 0) {
        opportunities.push(`Excellent time for ${trend.best_for[0]} (${trend.energy_type} energy)`);
      }
    }

    opportunities.push('Weekend is optimal for extended spiritual practice');
    opportunities.push('Current cycle favors introspection and planning');
    opportunities.push(`Align with ${userData.orixaRegente} energy through dedicated practice`);

    return opportunities.slice(0, 5);
  }

  private generatePreparationSteps(
    userData: UserSpiritualData,
    challenges: PredictedChallenge[],
    trends: SpiritualTrend[]
  ): string[] {
    const steps: string[] = [];

    for (const challenge of challenges.slice(0, 2)) {
      steps.push(`Prepare for ${challenge.type}: ${challenge.mitigation[0]}`);
    }

    const topTrend = trends.find(t => t.direction === 'ascending');
    if (topTrend) {
      steps.push(`Prepare spiritual space for ${topTrend.energy_type} work`);
    }

    steps.push('Clear and consecrate personal altar space');
    steps.push('Review and reaffirm spiritual intentions');
    steps.push('Gather any ritual materials needed this week');

    return steps.slice(0, 5);
  }

  private generateAlgorithmicPredictions(userData: UserSpiritualData): Prediction[] {
    const predictions: Prediction[] = [];
    const cyclePos = calculateCyclePosition(userData.dataNascimento);
    const phase = getNumerologyPhase(userData.numeroPessoal);

    predictions.push({
      type: 'spiritual',
      timeline: cyclePos < 4 ? 'week' : 'month',
      confidence: 0.75,
      prediction: `Your ${phase} phase energy is building`,
      explanation: `Based on your personal number ${userData.numeroPessoal} and current cycle position ${cyclePos}, this is a favorable period for ${phase}-related activities.`,
      action: `Focus on ${phase} themes in your spiritual practice`,
    });

    predictions.push({
      type: 'energetic',
      timeline: 'week',
      confidence: 0.8,
      prediction: `${userData.orixaRegente} energy is particularly active`,
      explanation: `Your ruling orixá ${userData.orixaRegente} governs this period's spiritual energy. Connection practices will be amplified.`,
      action: `Increase ${userData.orixaRegente} devotional practices`,
    });

    predictions.push({
      type: 'ritual',
      timeline: 'month',
      confidence: 0.7,
      prediction: 'Optimal ritual window approaching',
      explanation: 'Your sefirot configuration suggests ritual work will be especially effective in the coming weeks.',
      action: 'Prepare ritual materials and space',
    });

    predictions.push({
      type: 'health',
      timeline: 'week',
      confidence: 0.65,
      prediction: 'Energy conservation recommended',
      explanation: `Arco ${userData.arcoPessoal} indicates periods where rest supports spiritual integration.`,
      action: 'Balance activity with restorative practices',
    });

    return predictions;
  }

  private generateAlgorithmicRituals(userData: UserSpiritualData): RitualRecommendation[] {
    const orixa = userData.orixaRegente;
    
    return [
      {
        ritual: `Morning Hymn to ${orixa}`,
        bestTiming: 'Dawn (5-6 AM)',
        duration: '15 minutes',
        materials: ['water', 'white candle', 'flowers'],
        purpose: `Daily connection with ${orixa} energy`,
        orixaConnection: orixa,
      },
      {
        ritual: 'Gratitude Offering',
        bestTiming: 'Evening (7-8 PM)',
        duration: '20 minutes',
        materials: ['food offering', 'incense', 'cloth'],
        purpose: 'Express gratitude and receive blessing',
        orixaConnection: orixa,
      },
      {
        ritual: 'Numerological Meditation',
        bestTiming: 'Night (9-10 PM)',
        duration: '30 minutes',
        materials: ['paper', 'pen', 'crystal'],
        purpose: `Contemplate personal number ${userData.numeroPessoal} meaning`,
        orixaConnection: orixa,
      },
      {
        ritual: 'Odu Divination Session',
        bestTiming: 'Thursday evening',
        duration: '45 minutes',
        materials: ['opon ifá', 'cowrie shells', 'cloth'],
        purpose: 'Seek guidance for current cycle',
        orixaConnection: userData.odu,
      },
    ];
  }
}

// ============================================================
// EXPORTS
// ============================================================

export default PredictiveGuidanceEngine;