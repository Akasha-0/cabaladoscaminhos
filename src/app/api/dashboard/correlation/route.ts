import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const CorrelationSourceSchema = z.enum(['Solar', 'Lunar', 'Chakra', 'Orixá', 'Odu', 'Element', 'Tarot', 'Numerology', 'Astrology']);
const CorrelationTargetSchema = z.enum(['CPU', 'Memory', 'Storage', 'Network', 'Performance', 'Health', 'Energy', 'Vibration']);
const CorrelationTypeSchema = z.enum(['positive', 'negative', 'neutral']);
const CorrelationQuerySchema = z.object({
  type: z.enum(['spiritual', 'technical', 'mixed']).optional(),
  sourceType: z.enum(['spiritual', 'technical']).optional(),
  targetType: z.enum(['spiritual', 'technical']).optional(),
  anomaly: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});
const AnalyzeCorrelationSchema = z.object({
  source: z.string().min(1, 'Source é obrigatório'),
  target: z.string().min(1, 'Target é obrigatório'),
  type: CorrelationTypeSchema.optional().default('positive'),
});
// Correlation data types
interface Correlation {
  id: string;
  source: string;
  sourceType: 'spiritual' | 'technical';
  target: string;
  targetType: 'spiritual' | 'technical';
  strength: number;
  type: 'positive' | 'negative' | 'neutral';
  description: string;
  lastUpdated: string;
  anomaly?: boolean;
}
interface Pattern {
  id: string;
  type: 'spiritual' | 'technical' | 'mixed';
  title: string;
  description: string;
  confidence: number;
  timestamp: string;
  alerts?: string[];
  metrics?: Record<string, number>;
}
interface Pattern {
  id: string;
  type: 'spiritual' | 'technical' | 'mixed';
  title: string;
  description: string;
  confidence: number;
  timestamp: string;
  alerts?: string[];
  metrics?: Record<string, number>;
}

// Spiritual-Technical mappings from IDEIA.md
const SPIRITUAL_TECHNICAL_MAPPINGS: Correlation[] = [
  {
    id: 'corr-1',
    source: 'Solar',
    sourceType: 'spiritual',
    target: 'CPU',
    targetType: 'technical',
    strength: 0.78,
    type: 'positive',
    description: 'Energia solar correlaciona com desempenho de CPU',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'corr-2',
    source: 'Lunar',
    sourceType: 'spiritual',
    target: 'Storage',
    targetType: 'technical',
    strength: 0.85,
    type: 'positive',
    description: 'Fases lunares afetam padrões de escrita/lançamento',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'corr-3',
    source: 'Chakra Raiz',
    sourceType: 'spiritual',
    target: 'Health',
    targetType: 'technical',
    strength: 0.92,
    type: 'positive',
    description: 'Chakra raiz conecta com estabilidade fundamental',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'corr-4',
    source: 'Oxalá',
    sourceType: 'spiritual',
    target: 'Network',
    targetType: 'technical',
    strength: 0.65,
    type: 'positive',
    description: 'Oxalá traz paz e harmonia para conexões de rede',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'corr-5',
    source: 'Ogbe',
    sourceType: 'spiritual',
    target: 'Performance',
    targetType: 'technical',
    strength: 0.71,
    type: 'positive',
    description: 'Ogbe representa novo começo e otimização',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'corr-6',
    source: 'Fogo',
    sourceType: 'spiritual',
    target: 'Temperature',
    targetType: 'technical',
    strength: 0.88,
    type: 'positive',
    description: 'Elemento fogo correlaciona com temperatura',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'corr-7',
    source: 'Água',
    sourceType: 'spiritual',
    target: 'Memory',
    targetType: 'technical',
    strength: 0.82,
    type: 'positive',
    description: 'Água representa fluxo e adaptabilidade na memória',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'corr-8',
    source: 'Oxum',
    sourceType: 'spiritual',
    target: 'DataFlow',
    targetType: 'technical',
    strength: 0.74,
    type: 'positive',
    description: 'Oxum governa águas e fluxo de dados',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'corr-9',
    source: 'Ogum',
    sourceType: 'spiritual',
    target: 'Security',
    targetType: 'technical',
    strength: 0.69,
    type: 'positive',
    description: 'Ogum traz força e proteção para segurança',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'corr-10',
    source: 'Oxossi',
    sourceType: 'spiritual',
    target: 'Metrics',
    targetType: 'technical',
    strength: 0.76,
    type: 'positive',
    description: 'Oxossi caça informações e métricas precisas',
    lastUpdated: new Date().toISOString(),
  },
];

// Detected patterns
const DETECTED_PATTERNS: Pattern[] = [
  {
    id: 'pattern-1',
    type: 'mixed',
    title: 'Energia Lunar → Performance',
    description: 'Detectado padrão entre fases lunares e métricas de performance do sistema',
    confidence: 0.89,
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    alerts: ['Correlação forte detectada', 'Recomendação gerada'],
    metrics: { lunar: 0.85, performance: 0.78 },
  },
  {
    id: 'pattern-2',
    type: 'spiritual',
    title: 'Chakra Raiz → Estabilidade',
    description: 'Alinhamento entre energia do chakra raiz e estabilidade do sistema',
    confidence: 0.92,
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    alerts: [],
    metrics: { chakra: 0.95, stability: 0.91 },
  },
  {
    id: 'pattern-3',
    type: 'technical',
    title: 'Pico de CPU → Memória',
    description: 'Padrão de comportamento entre uso de CPU e alocação de memória',
    confidence: 0.76,
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    alerts: ['Limiar se aproximando'],
    metrics: { cpu: 0.82, memory: 0.79 },
  },
  {
    id: 'pattern-4',
    type: 'mixed',
    title: 'Orixá Oxum → Fluxo de Dados',
    description: 'Conexão entre energia de Oxum e fluxo de dados na rede',
    confidence: 0.68,
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    alerts: [],
    metrics: { energy: 0.72, dataflow: 0.65 },
  },
  {
    id: 'pattern-5',
    type: 'spiritual',
    title: 'Elemento Água → Armazenamento',
    description: 'Padrão cíclico entre elemento água e utilização de armazenamento',
    confidence: 0.81,
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    alerts: ['Ciclo detectado'],
    metrics: { water: 0.88, storage: 0.82 },
  },
];

// GET - Get all correlations or patterns
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'correlations';
  const sourceType = searchParams.get('sourceType') as 'spiritual' | 'technical' | null;
  const minStrength = parseFloat(searchParams.get('minStrength') || '0');

  try {
    if (type === 'patterns') {
      // Return patterns
      let filteredPatterns = [...DETECTED_PATTERNS];

      // Filter by type if specified
      if (searchParams.get('patternType')) {
        filteredPatterns = filteredPatterns.filter(p => p.type === searchParams.get('patternType'));
      }

      return NextResponse.json({
        patterns: filteredPatterns,
        total: filteredPatterns.length,
        timestamp: new Date().toISOString(),
      });
    }

    if (type === 'strength') {
      // Return correlation strength metrics
      const correlations = sourceType
        ? SPIRITUAL_TECHNICAL_MAPPINGS.filter(c => c.sourceType === sourceType)
        : SPIRITUAL_TECHNICAL_MAPPINGS;

      const strengths = correlations.map(c => ({
        id: c.id,
        source: c.source,
        target: c.target,
        strength: c.strength,
        trend: c.strength > 0.7 ? 'up' : c.strength < 0.5 ? 'down' : 'stable',
        lastUpdated: c.lastUpdated,
        anomaly: c.strength > 0.9 || c.strength < 0.4,
      }));

      return NextResponse.json({
        correlations: strengths,
        stats: {
          avg: correlations.reduce((a, c) => a + c.strength, 0) / correlations.length,
          max: Math.max(...correlations.map(c => c.strength)),
          min: Math.min(...correlations.map(c => c.strength)),
          count: correlations.length,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Default: return correlations
    let filteredCorrelations = [...SPIRITUAL_TECHNICAL_MAPPINGS];

    // Filter by source type
    if (sourceType) {
      filteredCorrelations = filteredCorrelations.filter(c => c.sourceType === sourceType);
    }

    // Filter by minimum strength
    if (minStrength > 0) {
      filteredCorrelations = filteredCorrelations.filter(c => c.strength >= minStrength);
    }

    // Sort by strength
    filteredCorrelations.sort((a, b) => b.strength - a.strength);

    return NextResponse.json({
      correlations: filteredCorrelations,
      total: filteredCorrelations.length,
      mappings: {
        spiritual: filteredCorrelations.filter(c => c.sourceType === 'spiritual'),
        technical: filteredCorrelations.filter(c => c.targetType === 'technical'),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Correlation API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch correlation data' },
      { status: 500 }
    );
  }
}

// POST - Analyze new correlation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { source, target, type } = body;

    // Calculate correlation strength based on type
    let strength = 0.5;
    let description = '';

    // Simple correlation calculation based on spiritual-technical mapping
    const spiritualSources = ['Solar', 'Lunar', 'Chakra', 'Orixá', 'Odu', 'Element'];
    const technicalTargets = ['CPU', 'Memory', 'Storage', 'Network', 'Performance', 'Health'];

    if (spiritualSources.some(s => source?.includes(s)) && technicalTargets.some(t => target?.includes(t))) {
      strength = 0.7 + Math.random() * 0.25;
      description = `Nova correlação detectada entre ${source} e ${target}`;
    }

    // Create new correlation
    const newCorrelation: Correlation = {
      id: `corr-${Date.now()}`,
      source: source || 'Unknown',
      sourceType: spiritualSources.some(s => source?.includes(s)) ? 'spiritual' : 'technical',
      target: target || 'Unknown',
      targetType: technicalTargets.some(t => target?.includes(t)) ? 'technical' : 'spiritual',
      strength,
      type: type || 'positive',
      description,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({
      correlation: newCorrelation,
      message: 'Correlation analyzed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Correlation analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze correlation' },
      { status: 500 }
    );
  }
}