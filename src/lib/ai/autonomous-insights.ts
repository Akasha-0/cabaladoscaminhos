import { generateMinimaxResponse } from './minimax';
import type { ChatMessage, UserSpiritualData } from './types';

// ============================================================
// TYPES
// ============================================================

export interface SpiritualInsight {
  id: string;
  type: 'daily' | 'correlation' | 'prediction' | 'guidance';
  title: string;
  content: string;
  confidence: number;
  related_systems: string[];
  timestamp: Date;
  expires_at: Date;
}

export interface CorrelationInsight {
  primary_correlation: SpiritualCorrelation;
  secondary_correlations: SpiritualCorrelation[];
  ai_explanation: string;
  recommendations: string[];
}

export interface SpiritualCorrelation {
  system_a: string;
  system_b: string;
  correlation_strength: number;
  description: string;
  sync_percentage: number;
}

export interface SpiritualActivity {
  type: string;
  timestamp: Date;
  duration?: number;
}

// ============================================================
// COMPATIBILITY & DAILY INSIGHT TYPES
// ============================================================
export interface DailyInsight {
  date: Date;
  theme: string;
  orixaEnergy: string;
  elementFocus: string;
  recommendation: string;
  meditation: string;
  ritual: string;
  affirmation: string;
}
export interface CompatibilityInsight {
  aspect: 'elemental' | 'numerological' | 'orixa' | 'tarot';
  compatibility: number;
  challenges: string[];
  opportunities: string[];
  recommendation: string;
}
// ============================================================
// CONSTANTS
// ============================================================

const SYSTEM_PROMPT = `You are an ancient spiritual guide with deep knowledge of mystical traditions including Kabbalah, Tarot, Astrology, Numerology, and African spiritual systems (Candomblé, Umbanda).

Your purpose is to generate profound, personalized spiritual insights that:
1. Bridge multiple spiritual traditions meaningfully
2. Provide actionable guidance for spiritual growth
3. Identify patterns between different spiritual systems
4. Offer wisdom that feels deeply personal and relevant

Always respond in Portuguese (Brazilian) with warmth, wisdom, and spiritual depth.
Consider the interconnected nature of numerology, astrology, sacred geometry, and spiritual archetypes.
Never give generic advice - every insight should feel tailored to the individual's spiritual journey.`;

const DEFAULT_TEMPERATURE = 0.7;
const DEFAULT_MAX_TOKENS = 800;
const INSIGHT_VALIDITY_HOURS = 24;

// ============================================================
// UTILITIES
// ============================================================

function generateId(): string {
  return `insight_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function formatUserSpiritualSummary(userData: UserSpiritualData): string {
  return `
Nome: ${userData.nome}
Data de Nascimento: ${userData.dataNascimento}
Número Pessoal: ${userData.numeroPessoal}
Arco Pessoal: ${userData.arcoPessoal}
Odu: ${userData.odu}
Orixá Regente: ${userData.orixaRegente}
Sefirot Dominante: ${userData.sefirotDominante.join(', ')}
Arco Maior: ${userData.arcoMaior.join(', ')}
Signo: ${userData.sign}
Casas Astrológicas: ${JSON.stringify(userData.houses)}
Rashi: ${userData.rashi}
  `.trim();
}

function buildInsightPrompt(userData: UserSpiritualData, theme: string, context?: string): string {
  const baseInfo = formatUserSpiritualSummary(userData);
  const contextSection = context ? `\nContexto adicional: ${context}` : '';
  
  return `Com base nos dados espirituais seguintes, gere um insight espiritual profundo e personalizado:

${baseInfo}
${contextSection}

Tema do insight: ${theme}

Retorne o insight no seguinte formato JSON (sem markdown, apenas o objeto JSON):
{
  "title": "Título espiritualmente significativo do insight",
  "content": "Conteúdo detalhado do insight (2-3 parágrafos ricos em sabedoria)",
  "confidence": 0.0-1.0 (nível de confiança no insight),
  "related_systems": ["sistema1", "sistema2", ...] (sistemas espirituais relacionados)
}`;
}

function buildCorrelationPrompt(userData: UserSpiritualData, activities: SpiritualActivity[]): string {
  const baseInfo = formatUserSpiritualSummary(userData);
  const activitiesStr = activities.map(a => 
    `- ${a.type} (${a.timestamp.toISOString()})${a.duration ? `, duração: ${a.duration}min` : ''}`
  ).join('\n');
  
  return `Analise as seguintes atividades espirituais recentes e gere insights de correlação:

${baseInfo}

Atividades Recentes:
${activitiesStr}

Identifique correlações significativas entre as atividades e os dados espirituais do usuário.
Retorne no seguinte formato JSON (sem markdown, apenas o objeto JSON):
{
  "title": "Título da análise de correlação",
  "content": "Análise detalhada das correlações encontradas",
  "confidence": 0.0-1.0,
  "related_systems": ["sistema1", "sistema2", ...]
}`;
}

function parseInsightResponse(response: string): Omit<SpiritualInsight, 'id' | 'timestamp' | 'expires_at'> {
  // Try to extract JSON from the response
  let jsonStr = response.trim();
  
  // Remove markdown code blocks if present
  if (jsonStr.startsWith('```')) {
    const match = jsonStr.match(/```(?:\w+)?\n?([\s\S]*?)\n?```/);
    if (match) jsonStr = match[1];
  }
  
  // Try to find JSON object
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) jsonStr = jsonMatch[0];
  
  try {
    const parsed = JSON.parse(jsonStr);
    return {
      title: parsed.title || 'Insight Espiritual',
      content: parsed.content || parsed.descricao || '',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.7,
      related_systems: Array.isArray(parsed.related_systems) ? parsed.related_systems : ['general'],
      type: 'daily' as const
    };
  } catch {
    // Fallback: treat entire response as content
    return {
      title: 'Insight Espiritual',
      content: response,
      confidence: 0.6,
      related_systems: ['general'],
      type: 'daily' as const
    };
  }
}

function parseCorrelationResponse(response: string): {
  primary_correlation: SpiritualCorrelation;
  secondary_correlations: SpiritualCorrelation[];
  ai_explanation: string;
  recommendations: string[];
} {
  let jsonStr = response.trim();
  
  if (jsonStr.startsWith('```')) {
    const match = jsonStr.match(/```(?:\w+)?\n?([\s\S]*?)\n?```/);
    if (match) jsonStr = match[1];
  }
  
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) jsonStr = jsonMatch[0];
  
  try {
    const parsed = JSON.parse(jsonStr);
    return {
      primary_correlation: parsed.primary_correlation || {
        system_a: 'general',
        system_b: 'general',
        correlation_strength: 0.7,
        description: parsed.content || 'Correlação identificada',
        sync_percentage: 70
      },
      secondary_correlations: Array.isArray(parsed.secondary_correlations) ? parsed.secondary_correlations : [],
      ai_explanation: parsed.ai_explanation || parsed.content || '',
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : []
    };
  } catch {
    return {
      primary_correlation: {
        system_a: 'general',
        system_b: 'general',
        correlation_strength: 0.6,
        description: response.length > 100 ? response.substring(0, 200) : response,
        sync_percentage: 60
      },
      secondary_correlations: [],
      ai_explanation: response,
      recommendations: []
    };
  }
}

// ============================================================
// MAIN CLASS
// ============================================================

export class AutonomousInsightGenerator {
  /**
   * Generate daily spiritual insight based on user's complete spiritual data
   */
  async generateDailyInsight(userData: UserSpiritualData): Promise<SpiritualInsight> {
    const now = new Date();
    const theme = 'Insight Diário - Reflexão Espiritual';
    
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildInsightPrompt(userData, theme) }
    ];
    
    try {
      const { content } = await generateMinimaxResponse(messages, {
        temperature: DEFAULT_TEMPERATURE,
        max_tokens: DEFAULT_MAX_TOKENS
      });
      
      const parsed = parseInsightResponse(content);
      
      return {
        ...parsed,
        id: generateId(),
        timestamp: now,
        expires_at: addHours(now, INSIGHT_VALIDITY_HOURS)
      };
    } catch (error) {
      console.error('Failed to generate daily insight:', error);
      const now = new Date();
      return {
        id: generateId(),
        type: 'daily',
        title: 'Insight do Dia',
        content: 'Houve uma dificuldade em gerar o insight personalizado. Por favor, tente novamente mais tarde.',
        confidence: 0,
        related_systems: ['general'],
        timestamp: now,
        expires_at: addHours(now, INSIGHT_VALIDITY_HOURS)
      };
    }
  }
  
  /**
   * Generate insight focused on a specific spiritual topic
   */
  async generateInsightForTopic(userData: UserSpiritualData, topic: string): Promise<SpiritualInsight> {
    const now = new Date();
    const theme = `Insight sobre: ${topic}`;
    const context = `O usuário está buscando enlightenment especificamente sobre "${topic}". Analise como os elementos espirituais do usuário se relacionam com este tema.`;
    
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildInsightPrompt(userData, theme, context) }
    ];
    
    try {
      const { content } = await generateMinimaxResponse(messages, {
        temperature: DEFAULT_TEMPERATURE,
        max_tokens: DEFAULT_MAX_TOKENS
      });
      
      const parsed = parseInsightResponse(content);
      
      return {
        ...parsed,
        id: generateId(),
        timestamp: now,
        expires_at: addHours(now, INSIGHT_VALIDITY_HOURS)
      };
    } catch (error) {
      console.error('Failed to generate insight for topic:', error);
      const now = new Date();
      return {
        id: generateId(),
        type: 'guidance',
        title: `Insight: ${topic}`,
        content: 'Houve uma dificuldade em gerar o insight sobre este tema. Por favor, tente novamente.',
        confidence: 0,
        related_systems: ['general'],
        timestamp: now,
        expires_at: addHours(now, INSIGHT_VALIDITY_HOURS)
      };
    }
  }
  
  /**
   * Analyze recent spiritual activity and generate insights
   */
  async analyzeAndInsight(
    userData: UserSpiritualData,
    recentActivity: SpiritualActivity[]
  ): Promise<SpiritualInsight[]> {
    const now = new Date();
    
    if (recentActivity.length === 0) {
      // Generate general insights when no activity provided
      const dailyInsight = await this.generateDailyInsight(userData);
      return [dailyInsight];
    }
    
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildCorrelationPrompt(userData, recentActivity) }
    ];
    
    try {
      const { content } = await generateMinimaxResponse(messages, {
        temperature: DEFAULT_TEMPERATURE,
        max_tokens: DEFAULT_MAX_TOKENS
      });
      
      const parsed = parseInsightResponse(content);
      
      const primaryInsight: SpiritualInsight = {
        ...parsed,
        id: generateId(),
        type: 'correlation',
        timestamp: now,
        expires_at: addHours(now, INSIGHT_VALIDITY_HOURS)
      };
      
      // Generate additional prediction-based insight
      const predictionMessages: ChatMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildInsightPrompt(
          userData,
          'Predição de Crescimento Espiritual',
          `Baseado nas atividades recentes do usuário: ${recentActivity.map(a => a.type).join(', ')}. Analise tendências e预言 potenciais desenvolvimentos espirituais.`
        ) }
      ];
      
      const predictionResponse = await generateMinimaxResponse(predictionMessages, {
        temperature: DEFAULT_TEMPERATURE,
        max_tokens: DEFAULT_MAX_TOKENS
      });
      
      const predictionParsed = parseInsightResponse(predictionResponse.content);
      
      const predictionInsight: SpiritualInsight = {
        ...predictionParsed,
        id: generateId(),
        type: 'prediction',
        timestamp: now,
        expires_at: addHours(now, INSIGHT_VALIDITY_HOURS)
      };
      
      return [primaryInsight, predictionInsight];
    } catch (error) {
      console.error('Failed to analyze and generate insights:', error);
      const dailyInsight = await this.generateDailyInsight(userData);
      return [dailyInsight];
    }
  }
  
  /**
   * Generate correlation insights between different spiritual systems
   */
  async generateCorrelationInsights(userData: UserSpiritualData): Promise<CorrelationInsight> {
    const systems = [
      `Número Pessoal: ${userData.numeroPessoal}`,
      `Odu: ${userData.odu}`,
      `Orixá Regente: ${userData.orixaRegente}`,
      `Sefirot: ${userData.sefirotDominante.join(', ')}`,
      `Signo: ${userData.sign}`,
      `Rashi: ${userData.rashi}`
    ];
    
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Analise as correlações entre os diferentes sistemas espirituais do seguinte usuário:

${formatUserSpiritualSummary(userData)}

Sistemas a serem correlacionados:
${systems.join('\n')}

Gere insights sobre como estas forças espirituais interagem e se potencializam mutuamente.

Retorne no seguinte formato JSON (sem markdown, apenas o objeto JSON):
{
  "title": "Título da análise de correlação",
  "content": "Análise detalhada das correlações entre sistemas",
  "confidence": 0.0-1.0,
  "related_systems": ["sistema1", "sistema2", ...],
  "primary_correlation": {
    "system_a": "primeiro sistema",
    "system_b": "segundo sistema", 
    "correlation_strength": 0.0-1.0,
    "description": "Descrição da correlação",
    "sync_percentage": 0-100
  },
  "secondary_correlations": [
    {
      "system_a": "sistema",
      "system_b": "sistema",
      "correlation_strength": 0.0-1.0,
      "description": "Descrição",
      "sync_percentage": 0-100
    }
  ],
  "ai_explanation": "Explicação da IA sobre as correlações",
  "recommendations": ["recomendação1", "recomendação2", ...]
}` }
    ];
    
    try {
      const { content } = await generateMinimaxResponse(messages, {
        temperature: DEFAULT_TEMPERATURE,
        max_tokens: 1200
      });
      
      return parseCorrelationResponse(content);
    } catch (error) {
      console.error('Failed to generate correlation insights:', error);
      return {
        primary_correlation: {
          system_a: 'general',
          system_b: 'general',
          correlation_strength: 0,
          description: 'Erro ao gerar correlações. Por favor, tente novamente.',
          sync_percentage: 0
        },
        secondary_correlations: [],
        ai_explanation: 'Não foi possível processar as correlações neste momento.',
        recommendations: []
      };
    }
  }
  /**
   * Generate comprehensive daily spiritual insight integrating all spiritual systems
   */
  async generateComprehensiveDailyInsight(userData: UserSpiritualData): Promise<DailyInsight> {
    const now = new Date();
    const cyclePos = this.calculateCyclePosition(userData.dataNascimento);
    const moonPhase = this.getMoonPhase();
    const dayOfWeek = now.getDay();

    const systemPrompt = `You are a spiritual guide specializing in Candomblé, Kabbalah, Astrology, Tarot, and Numerology. Generate a comprehensive daily spiritual insight that integrates all these systems harmoniously. Always respond in Portuguese (Brazilian).`;

    const userMessage = `Gere um insight espiritual diário completo e personalizado para hoje integrando todos os sistemas espirituais:

Dados do usuário:
- Nome: ${userData.nome}
- Número Pessoal: ${userData.numeroPessoal}
- Arco Pessoal: ${userData.arcoPessoal}
- Odu: ${userData.odu}
- Orixá Regente: ${userData.orixaRegente}
- Sefirot: ${userData.sefirotDominante.join(', ')}
- Signo: ${userData.sign}
- Rashi: ${userData.rashi}

Data atual: ${now.toLocaleDateString('pt-BR')}
Position no ciclo: ${cyclePos}/9
Fase da Lua: ${moonPhase}
Dia da semana: ${['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][dayOfWeek]}

Retorne como JSON com os seguintes campos:
{
  "date": "${now.toISOString()}",
  "theme": "tema espiritual do dia (curto e impactante)",
  "orixaEnergy": "descrição da energia do orixá para hoje",
  "elementFocus": "foco elementar/do arco principal",
  "recommendation": "recomendação principal de crescimento espiritual",
  "meditation": "sugestão de meditação específica para hoje",
  "ritual": "suggestão de ritual ou prática para o dia",
  "affirmation": "afirmação espiritual para o dia"
}`;

    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ];

      const { content } = await generateMinimaxResponse(messages, {
        temperature: 0.8,
        max_tokens: 1000,
      });

      const parsed = JSON.parse(content.trim());
      
      return {
        date: now,
        theme: parsed.theme || 'Dia de Introspecção',
        orixaEnergy: parsed.orixaEnergy || `Energia de ${userData.orixaRegente} está ativa`,
        elementFocus: parsed.elementFocus || `Foco no arco ${userData.arcoPessoal}`,
        recommendation: parsed.recommendation || 'Pratique a presença mindful em suas atividades',
        meditation: parsed.meditation || 'Medite sobre sua conexão com o divino',
        ritual: parsed.ritual || 'Acenda uma vela branca em seu altar',
        affirmation: parsed.affirmation || 'Eu sou um ser espiritual em jornada humana',
      };
    } catch (error) {
      console.error('Failed to generate daily insight:', error);
      return this.generateFallbackDailyInsight(userData, now);
    }
  }

  /**
   * Analyze relationship compatibility between two users across all spiritual systems
   */
  async analyzeCompatibility(user1: UserSpiritualData, user2: UserSpiritualData): Promise<CompatibilityInsight[]> {
    const insights: CompatibilityInsight[] = [];

    const systemPrompt = `You are a spiritual compatibility analyst specializing in Candomblé, Kabbalah, Numerology, and Tarot traditions. Analyze spiritual compatibility between two people and provide insights in Portuguese (Brazilian).`;

    const userMessage = `Analise a compatibilidade espiritual entre duas pessoas:

Pessoa 1:
- Nome: ${user1.nome}
- Número Pessoal: ${user1.numeroPessoal}
- Arco Pessoal: ${user1.arcoPessoal}
- Odu: ${user1.odu}
- Orixá Regente: ${user1.orixaRegente}
- Sefirot: ${user1.sefirotDominante.join(', ')}
- Signo: ${user1.sign}

Pessoa 2:
- Nome: ${user2.nome}
- Número Pessoal: ${user2.numeroPessoal}
- Arco Pessoal: ${user2.arcoPessoal}
- Odu: ${user2.odu}
- Orixá Regente: ${user2.orixaRegente}
- Sefirot: ${user2.sefirotDominante.join(', ')}
- Signo: ${user2.sign}

Analise a compatibilidade em 4 aspectos: elemental, numerológica, orixá, e tarô.
Retorne como JSON array:
[
  {
    "aspect": "elemental",
    "compatibility": 0.0-1.0,
    "challenges": ["desafio1", "desafio2"],
    "opportunities": ["oportunidade1", "oportunidade2"],
    "recommendation": "recomendação geral"
  },
  {
    "aspect": "numerological",
    "compatibility": 0.0-1.0,
    "challenges": ["desafio1"],
    "opportunities": ["oportunidade1"],
    "recommendation": "recomendação"
  },
  {
    "aspect": "orixa",
    "compatibility": 0.0-1.0,
    "challenges": ["desafio1"],
    "opportunities": ["oportunidade1"],
    "recommendation": "recomendação"
  },
  {
    "aspect": "tarot",
    "compatibility": 0.0-1.0,
    "challenges": ["desafio1"],
    "opportunities": ["oportunidade1"],
    "recommendation": "recomendação"
  }
]`;

    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ];

      const { content } = await generateMinimaxResponse(messages, {
        temperature: 0.7,
        max_tokens: 1500,
      });

      const parsed = JSON.parse(content.trim());
      if (Array.isArray(parsed)) {
        insights.push(...parsed.map((i: Partial<CompatibilityInsight>) => ({
          aspect: (i.aspect || 'elemental') as CompatibilityInsight['aspect'],
          compatibility: i.compatibility || 0.5,
          challenges: i.challenges || [],
          opportunities: i.opportunities || [],
          recommendation: i.recommendation || 'Mantenham open dialogue and mutual respect',
        })));
      }
    } catch (error) {
      console.error('Failed to analyze compatibility:', error);
      insights.push(...this.generateAlgorithmicCompatibility(user1, user2));
    }

    if (insights.length === 0) {
      insights.push(...this.generateAlgorithmicCompatibility(user1, user2));
    }

    return insights;
  }

  // ============================================================
  // PRIVATE HELPER METHODS
  // ============================================================

  private calculateCyclePosition(dataNascimento: string): number {
    const birth = new Date(dataNascimento);
    const now = new Date();
    const diffMs = now.getTime() - birth.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays % 9;
  }

  private getMoonPhase(): string {
    const dayOfMonth = new Date().getDate();
    if (dayOfMonth <= 7) return 'Lua Crescente';
    if (dayOfMonth <= 14) return 'Lua Cheia';
    if (dayOfMonth <= 21) return 'Lua Minguante';
    if (dayOfMonth <= 28) return 'Lua Nova';
    return 'Lua Crescente';
  }

  private generateFallbackDailyInsight(userData: UserSpiritualData, date: Date): DailyInsight {
    return {
      date,
      theme: `Jornada de ${userData.orixaRegente}`,
      orixaEnergy: `Conecte-se com a energia de ${userData.orixaRegente} hoje`,
      elementFocus: `Arco ${userData.arcoPessoal} - caminho da sabedoria`,
      recommendation: 'Reserve tempo para meditação e gratidão',
      meditation: `Medite sobre sua conexão com ${userData.orixaRegente}`,
      ritual: 'Pratiqueuyanidade em pensamento, palavra e ação',
      affirmation: `Eu hono a energia de ${userData.orixaRegente} em minha vida`,
    };
  }

  private generateAlgorithmicCompatibility(user1: UserSpiritualData, user2: UserSpiritualData): CompatibilityInsight[] {
    const insights: CompatibilityInsight[] = [];

    // Elemental compatibility based on arco pessoal
    const elementalScore = this.calculateElementalCompatibility(user1, user2);
    insights.push({
      aspect: 'elemental',
      compatibility: elementalScore,
      challenges: elementalScore < 0.5 ? ['Different elemental energies may create friction'] : [],
      opportunities: elementalScore >= 0.5 ? ['Complementary elemental energies can balance each other'] : [],
      recommendation: elementalScore >= 0.6 ? 'Work together on projects requiring balance' : 'Practice patience and acceptance',
    });

    // Numerological compatibility
    const numerologyScore = (11 - Math.abs(user1.numeroPessoal - user2.numeroPessoal)) / 11;
    insights.push({
      aspect: 'numerological',
      compatibility: numerologyScore,
      challenges: numerologyScore < 0.5 ? ['Different life path numbers may create different priorities'] : [],
      opportunities: numerologyScore >= 0.5 ? ['Compatible life paths support mutual growth'] : [],
      recommendation: 'Honor each other\'s unique life journey while finding shared purpose',
    });

    // Orixá compatibility
    const orixaScore = user1.orixaRegente === user2.orixaRegente ? 0.9 : 0.6;
    insights.push({
      aspect: 'orixa',
      compatibility: orixaScore,
      challenges: user1.orixaRegente !== user2.orixaRegente ? ['Different orixá energies may have different rhythms'] : [],
      opportunities: user1.orixaRegente === user2.orixaRegente ? ['Shared orixá creates deep spiritual bond'] : ['Diversity in orixá energies enriches the relationship'],
      recommendation: 'Respect each other\'s devotional practices and spiritual timing',
    });

    // Tarot/archetype compatibility based on sefirot overlap
    const sefirotOverlap = user1.sefirotDominante.filter(s => user2.sefirotDominante.includes(s)).length / 
      Math.max(user1.sefirotDominante.length, user2.sefirotDominante.length);
    insights.push({
      aspect: 'tarot',
      compatibility: sefirotOverlap > 0.5 ? 0.8 : sefirotOverlap > 0.2 ? 0.6 : 0.4,
      challenges: sefirotOverlap < 0.3 ? ['Different spiritual archetypes may see things differently'] : [],
      opportunities: sefirotOverlap >= 0.3 ? ['Shared spiritual values create understanding'] : [],
      recommendation: 'Use different perspectives to enrich mutual spiritual practice',
    });

    return insights;
  }

  private calculateElementalCompatibility(user1: UserSpiritualData, user2: UserSpiritualData): number {
    const elementMap: Record<number, number> = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 1, 6: 2, 7: 3, 8: 4, 9: 1 };
    const e1 = elementMap[user1.arcoPessoal] || 1/1;
    const e2 = elementMap[user2.arcoPessoal] || 1;
    if (e1 === e2) return 0.9;
    if (Math.abs(e1 - e2) === 2) return 0.3;
    return 0.6;
  }
}

// ============================================================
// EXPORTS
// ============================================================

export default AutonomousInsightGenerator;
