import { generateMinimaxResponse } from '@/lib/ai/minimax';
import { PREDICTION_TYPES, type PredictionType } from './constants';

export interface Prediction {
  id: string;
  type: PredictionType;
  title: string;
  description: string;
  detailedExplanation: string;
  date: Date;
  confidence: number;
  optimalTime?: string;
  system: PredictionType;
  impact: 'low' | 'medium' | 'high';
  recommendations: string[];
  whyPrediction: string;
  historicalPattern: string;
  recommendedAction: string;
}

export interface UserSpiritualData {
  nome: string;
  dataNascimento: string;
  caminho?: string;
  signo?: string;
  numeroCaminho?: number;
  sefiraDominante?: string;
  orixa?: string;
  elementos?: string[];
}

const SYSTEM_PROMPTS: Record<PredictionType, string> = {
  numerologia: 'Você é um mestre numerólogo brasileiro especializado em numerologia cabalística. Analise os dados espirituais e gere previsões numerológicas precisas.',
  astrologia: 'Você é um astrólogo brasileiro expert em astrologia tropical e kabbalistic astrology. Use seu conhecimento astrológico para gerar previsões precisas.',
  ifa: 'Você é um babalawo experiente no sistema de Ifá. Sua sabedoria vem dos Odu Ifá e tradição Iorubá. Gere previsões autênticas.',
  candomble: 'Você é um iniciado de Candomblé com profundo conhecimento dos Orixás. Gere previsões espirituais fundamentadas na tradição.',
  tarot: 'Você é um tarotista experiente combinando tarot clássico com tradição cabalistica. Interprete as energias com precisão.',
  cabala: 'Você é um cabalista experiente no árvore da vida e caminhos das sefirot. Gere previsões kabbalisticamente precisas.',
  ritual: 'Você é um especialista em rituais espirituais brasileiros e昆仑. Combine tradição e prática para gerar recomendações.',
  energia: 'Você é um healer e especialista em fluxos energéticos. Analise e prediga padrões de energia espiritual.',
};

function generateId(): string {
  return `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getSystemPrompt(type: PredictionType): string {
  return SYSTEM_PROMPTS[type] || SYSTEM_PROMPTS.numerologia;
}

interface PredictionResponse {
  title: string;
  description: string;
  detailedExplanation: string;
  optimalTime: string;
  impact: 'low' | 'medium' | 'high';
  recommendations: string[];
  whyPrediction: string;
  historicalPattern: string;
  recommendedAction: string;
  confidence: number;
}

function parsePredictionResponse(text: string, type: PredictionType): PredictionResponse {
  const lines = text.split('\n').filter(l => l.trim());
  
  const title = extractField(lines, ['titulo', 'title', 'título']) || `Predição de ${type}`;
  const description = extractField(lines, ['descricao', 'description', 'descrição']) || '';
  const detailedExplanation = extractField(lines, ['interpretação', 'interpretation', 'detailed']) || description;
  const optimalTime = extractField(lines, ['momento', 'time', 'horário', 'optimal']) || 'Durante oração ou meditação';
  const impactStr = extractField(lines, ['impacto', 'impact']) || 'medium';
  const impact = impactStr.includes('alto') ? 'high' : impactStr.includes('baixo') ? 'low' : 'medium';
  const recommendationsStr = extractField(lines, ['recomendações', 'recommendations', 'ações']) || 'Mantenha-se em harmonia espiritual';
  const recommendations = recommendationsStr.split(/[,;]/).map(r => r.trim()).filter(Boolean);
  const whyPrediction = extractField(lines, ['por que', 'why', 'razao', 'reason']) || 'Baseado na análise energética do período';
  const historicalPattern = extractField(lines, ['padrão', 'pattern', 'historico']) || 'Padrão cíclico identificado';
  const recommendedAction = extractField(lines, ['ação', 'action', 'act']) || 'Continue seu caminho espiritual com devotion';
  const confidenceStr = extractField(lines, ['confiança', 'confidence', 'certeza']) || '75';
  const confidence = parseInt(confidenceStr.replace(/\D/g, '')) || 70 + Math.floor(Math.random() * 20);

  return {
    title,
    description: description.substring(0, 200) || `${type} - momento de insight espiritual`,
    detailedExplanation,
    optimalTime,
    impact,
    recommendations: recommendations.slice(0, 4),
    whyPrediction,
    historicalPattern,
    recommendedAction,
    confidence: Math.min(95, Math.max(50, confidence)),
  };
}

function extractField(lines: string[], keys: string[]): string | null {
  for (const key of keys) {
    const normalizedKey = key.toLowerCase().normalize('NFD');
    for (const line of lines) {
      const normalizedLine = line.toLowerCase().normalize('NFD');
      if (normalizedLine.includes(normalizedKey)) {
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1 && colonIndex < line.length - 1) {
          return line.substring(colonIndex + 1).trim();
        }
        const dashIndex = line.indexOf('-');
        if (dashIndex !== -1 && dashIndex < line.length - 1) {
          return line.substring(dashIndex + 1).trim();
        }
      }
    }
  }
  return null;
}

export async function generatePrediction(
  userData: UserSpiritualData,
  type: PredictionType,
  targetDate: Date
): Promise<Prediction | null> {
  try {
    const systemPrompt = getSystemPrompt(type);
    const daysFromNow = Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    const userContext = `
 dados do usuário:
 - Nome: ${userData.nome}
 - Data de Nascimento: ${userData.dataNascimento}
 ${userData.caminho ? `- Caminho Espiritual: ${userData.caminho}` : ''}
 ${userData.signo ? `- Signo: ${userData.signo}` : ''}
 ${userData.numeroCaminho ? `- Número do Caminho: ${userData.numeroCaminho}` : ''}
 ${userData.sefiraDominante ? `- Sefira Dominante: ${userData.sefiraDominante}` : ''}
 ${userData.orixa ? `- Orixá: ${userData.orixa}` : ''}
`;
    const prompt = `${systemPrompt}
${userContext}
Gere uma predição espiritual
para os próximos ${daysFromNow} dias. Sua resposta deve seguir exatamente este formato (sem markdown, apenas texto simples):
TITULO: [Título curto e impactante da predição]
DESCRICAO: [Breve descrição (1-2 frases)]
INTERPRETACAO: [Interpretação detalhada com contexto espiritual]
MOMENTO: [Quando é melhor agir/manifestar essa energia]
IMPACTO: [alto/medio/baixo]
CONFIANCA: [Número de 50 a 95 representando sua certeza]
RECOMENDACOES: [Lista de ações separadas por vírgula]
POR QUE: [Explicação do motivo desta predição com base nas energias atuais]
PADRAO: [Padrão histórico ou cíclico que sustenta esta previsão]
ACAO: [Uma ação específica recomendada para influenciar o resultado]

Responda apenas com o formato especificado, sem comentários adicionais.`;

    const response = await generateMinimaxResponse([{ role: 'user', content: prompt }], { max_tokens: 600 });
    const parsed = parsePredictionResponse(response.content, type);

    return {
      id: generateId(),
      type,
      title: parsed.title,
      description: parsed.description,
      detailedExplanation: parsed.detailedExplanation,
      date: targetDate,
      confidence: parsed.confidence,
      optimalTime: parsed.optimalTime,
      system: type,
      impact: parsed.impact,
      recommendations: parsed.recommendations,
      whyPrediction: parsed.whyPrediction,
      historicalPattern: parsed.historicalPattern,
      recommendedAction: parsed.recommendedAction,
    };
  } catch (error) {
    console.error(`Error generating ${type} prediction:`, error);
    return null;
  }
}

export async function generateAllPredictions(
  userData: UserSpiritualData,
  period: number,
  types?: PredictionType[]
): Promise<Prediction[]> {
  const targetTypes = types || PREDICTION_TYPES;
  const predictions: Prediction[] = [];
  
  const now = new Date();
  const numPredictions = Math.min(12, Math.max(4, Math.floor(period / 3)));
  
  for (let i = 0; i < numPredictions; i++) {
    const daysAhead = Math.floor((i + 1) * period / numPredictions);
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + daysAhead);
    
    const type = targetTypes[i % targetTypes.length];
    
    const prediction = await generatePrediction(userData, type, targetDate);
    if (prediction) {
      predictions.push(prediction);
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return predictions.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function filterPredictions(
  predictions: Prediction[],
  options: {
    types?: PredictionType[];
    confidenceLevel?: 'high' | 'medium' | 'low';
    minConfidence?: number;
    maxDays?: number;
    category?: string;
  }
): Prediction[] {
  return predictions.filter(pred => {
    if (options.types?.length && !options.types.includes(pred.type)) {
      return false;
    }
    
    if (options.confidenceLevel) {
      const level = getConfidenceLevel(pred.confidence);
      if (level !== options.confidenceLevel) {
        return false;
      }
    }
    
    if (options.minConfidence && pred.confidence < options.minConfidence) {
      return false;
    }
    
    if (options.maxDays) {
      const daysUntil = Math.ceil((pred.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntil > options.maxDays) {
        return false;
      }
    }
    
    return true;
  });
}

export function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= 80) return 'high';
  if (confidence >= 60) return 'medium';
  return 'low';
}

export function getConfidenceColor(level: 'high' | 'medium' | 'low'): string {
  switch (level) {
    case 'high': return 'text-emerald-400';
    case 'medium': return 'text-amber-400';
    case 'low': return 'text-rose-400';
  }
}

export function getConfidenceBgColor(level: 'high' | 'medium' | 'low'): string {
  switch (level) {
    case 'high': return 'bg-emerald-400';
    case 'medium': return 'bg-amber-400';
    case 'low': return 'bg-rose-400';
  }
}