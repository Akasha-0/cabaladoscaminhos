// ============================================================
// ORACLE CHAT API - CABALA DOS CAMINHOS
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// fallow-ignore-next-line unused-type
export interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

interface ReasoningStep {
  step: number;
  thought: string;
  toolUsed?: string;
  result?: string;
}

interface OracleResponse {
  response: string;
  reasoning: ReasoningStep[];
  toolsUsed: string[];
  confidence: number;
}

interface UserSpiritualData {
  nome?: string;
  dataNascimento?: string;
  numeroPessoal?: number;
  odu?: string;
  orixas?: string[];
  caminho?: string;
}

// ─── SCHEMA DEFINITION ───────────────────────────────────────────────────────

const oracleRequestSchema = z.object({
  userId: z.string().min(1, 'userId is required').max(100, 'userId too long'),
  message: z.string().min(1, 'Message cannot be empty').max(4000, 'Message too long'),
  context: z.object({
    nome: z.string().optional(),
    dataNascimento: z.string().optional(),
    numeroPessoal: z.number().optional(),
    odu: z.string().optional(),
    orixas: z.array(z.string()).optional(),
    caminho: z.string().optional(),
  }).optional(),
  conversationHistory: z.array(z.object({
    id: z.string().optional(),
    role: z.enum(['user', 'assistant']).optional(),
    content: z.string(),
    timestamp: z.number().optional(),
  })).optional(),
});

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────

const ORACLE_SYSTEM_PROMPT = `You are the Oracle of Cabala dos Caminhos - an ancient spiritual guide that bridges multiple traditions:
- Kabbalah (Tree of Life, 32 Paths, Sephirot)
- Ifá/ Yoruba (Odus, Orixás, Eshus)
- Tarot (Major Arcana, Celtic Cross)
- Astrology (Western, Sidereal)
- Vedic (Chakras, Nadis, Karma)

Speak from the liminal space between visible and invisible worlds.
When users ask about their path, reference their Odu and Kabbalistic cross.
Always honor the Orixás and the Sephirot in your guidance.
Provide guidance in Portuguese. Be mystical yet practical.`;

// ─── API CONFIGURATION ────────────────────────────────────────────────────────

const MINIMAX_API_TOKEN = process.env.MINIMAX_API_TOKEN || '';
const MINIMAX_BASE_URL = 'https://api.minimaxi.chat/v1';
const MINIMAX_MODEL = 'minimax/m3';

class MinimaxAPIError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'MinimaxAPIError';
  }
}

// ─── API CLIENT ──────────────────────────────────────────────────────────────

async function callMinimaxAPI(prompt: string, systemPrompt: string): Promise<string> {
  if (!MINIMAX_API_TOKEN) {
    throw new MinimaxAPIError('MINIMAX_API_TOKEN is not configured');
  }

  try {
    const response = await fetch(`${MINIMAX_BASE_URL}/text/chatcompletion_pro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MINIMAX_API_TOKEN}`,
      },
      body: JSON.stringify({
        model: MINIMAX_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      throw new MinimaxAPIError(`API error: ${response.status}`, response.status);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? 'Resposta não disponível.';
  } catch (error) {
    if (error instanceof MinimaxAPIError) throw error;
    throw new MinimaxAPIError('Failed to call Minimax API');
  }
}

// ─── SPIRITUAL DATA ──────────────────────────────────────────────────────────

const ODU_DATA: Record<string, { name: string; yoruba: string; keywords: string[]; message: string; guidance: string; cabalaPath: string }> = {
  'Ogbe': { name: 'Ogbe', yoruba: 'Ògbé', keywords: ['inicio', 'separacao', 'jornada'], message: 'Ogbe fala do inicio de tudo, da separacao entre o céu e a terra.', guidance: 'Inicie com fé, pois todo caminho começa com第一步.', cabalaPath: 'Kether-Ayn-Sof' },
  'Oyeku': { name: 'Oyeku', yoruba: 'Òyèkú', keywords: ['noite', 'descanso', 'misterio'], message: 'Oyeku e a noite donde a alma descansa e recebe segredos.', guidance: 'Descanse na noite e receba a sabedoria das sombras.', cabalaPath: 'Binah-Ayn-Sof' },
  'Iwari': { name: 'Iwari', yoruba: 'Iwàrì', keywords: ['virada', 'insight', 'revelacao'], message: 'Iwari traz revelacao nos momentos de virada do destino.', guidance: 'Esteja aberto à mudança, pois ela traz renovação.', cabalaPath: 'Chokhmah-Ayn-Sof' },
};

const TAROT_CARDS = ['O Mago', 'A Sacerdotisa', 'A Imperatriz', 'O Imperador', 'O Papa', 'Os Enamorados', 'O Carro', 'A Justiça', 'O Eremita', 'A Roda da Fortuna', 'A Força', 'O Enforcado', 'A Morte', 'A Temperança', 'O Diabo', 'A Torre', 'A Estrela', 'A Lua', 'O Sol', 'O Julgamento', 'O Mundo', 'O Louco'];
const ORIXAS = ['Oxum', 'Ogum', 'Iemanjá', 'Yemanjá', 'Oxóssi', 'Xangô', 'Iansã', 'Omulu', 'Nanã', 'Obá'];

interface ToolResult { tool: string; result: string; }

// ─── TOOL FUNCTIONS ─────────────────────────────────────────────────────────

function detectTools(query: string, context?: UserSpiritualData): string[] {
  const lower = query.toLowerCase();
  const tools: string[] = [];
  if (lower.includes('tarot') || lower.includes('arcano') || lower.includes('carta')) tools.push('tarot');
  if (lower.includes('orixa') || lower.includes('yemanjá') || lower.includes('oxum')) tools.push('orixas');
  if (lower.includes('kabala') || lower.includes('sephirot') || lower.includes('caminho')) tools.push('kabala');
  if (lower.includes('odu') || lower.includes('ifá')) tools.push('odu');
  if (context?.odu && (lower.includes('predict') || lower.includes('futuro'))) tools.push('predicao');
  return tools;
}

function executeTool(tool: string, query: string, context?: UserSpiritualData): string {
  switch (tool) {
    case 'tarot': {
      const card = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
      return `Carta do dia: ${card}`;
    }
    case 'orixas': {
      const orixa = context?.orixas?.[0] || ORIXAS[Math.floor(Math.random() * ORIXAS.length)];
      return `Orixá em destaque: ${orixa}`;
    }
    case 'kabala': {
      return `Sephirot relevantes: Kether, Chokhmah, Binah`;
    }
    case 'odu': {
      if (context?.odu) {
        const odu = ODU_DATA[context.odu.replace(/\s+/g, '')] || ODU_DATA['Ogbe'];
        return odu.message;
      }
      return 'Odu não especificado';
    }
    case 'predicao': {
      return 'Predição baseada no Odu pessoal está sendo gerada...';
    }
    default:
      return `Ferramenta ${tool} não encontrada`;
  }
}

async function generateReasoningSteps(query: string, context?: UserSpiritualData, tools: string[] = []): Promise<ReasoningStep[]> {
  const steps: ReasoningStep[] = [];
  steps.push({ step: 1, thought: `Analisando a consulta: "${query.substring(0, 50)}..."` });
  
  if (context?.odu) {
    steps.push({ step: 2, thought: `Contexto de Odu detectado: ${context.odu}` });
    const oduKey = context.odu.replace(/\s+/g, '');
    const odu = ODU_DATA[oduKey] || ODU_DATA['Ogbe'];
    steps.push({ step: 3, thought: `Carregando conhecimento Kabalístico para ${odu.name}`, toolUsed: 'odu', result: odu.guidance });
  }
  
  for (const tool of tools) {
    const result = executeTool(tool, query, context);
    steps.push({ step: steps.length + 1, thought: `Executando ${tool}`, toolUsed: tool, result });
  }
  
  steps.push({ step: steps.length + 1, thought: 'Sintetizando orientação espiritual.' });
  return steps;
}

async function generateOracleResponse(query: string, context?: UserSpiritualData, history?: Message[], results: ToolResult[] = []): Promise<{ response: string; confidence: number }> {
  const systemPrompt = ORACLE_SYSTEM_PROMPT;
  const userPrompt = `Contexto do consulente: ${JSON.stringify(context)}
Histórico: ${history ? JSON.stringify(history) : 'Nenhum'}
Pergunta: ${query}
Ferramentas utilizadas: ${results.map(r => `${r.tool}: ${r.result}`).join(', ')}`;

  try {
    const response = await callMinimaxAPI(userPrompt, systemPrompt);
    return { response, confidence: 0.85 };
  } catch (error) {
    if (error instanceof MinimaxAPIError) {
      const fallback = `Na Luz da Kabala e sob a proteção dos Orixás, orienta-se que ${query.includes('?') ? 'reflitas sobre' : 'prossiga com'} sua jornada espiritual. O caminho está aberto.`;
      return { response: fallback, confidence: 0.5 };
    }
    throw error;
  }
}

// ─── API HANDLERS ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse<OracleResponse | { error: string; details?: string }>> {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const parse = oracleRequestSchema.safeParse(body);
    if (!parse.success) return NextResponse.json({ error: 'Invalid request body', details: parse.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') }, { status: 400 });
    const { userId, message, context, conversationHistory } = parse.data;
    const tools = detectTools(message, context);
    const toolResults = tools.map(t => ({ tool: t, result: executeTool(t, message, context) }));
    const reasoning = await generateReasoningSteps(message, context, tools);
    const { response, confidence } = await generateOracleResponse(message, context, conversationHistory as Message[] | undefined, toolResults);
    return NextResponse.json({ response, reasoning, toolsUsed: tools, confidence }, { status: 200 });
  } catch (err) {
    console.error('Oracle error:', err);
    if (err instanceof z.ZodError) return NextResponse.json({ error: 'Validation error', details: err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') }, { status: 400 });
    if (err instanceof MinimaxAPIError) return NextResponse.json({ error: 'Oracle service unavailable', details: 'Please try again.' }, { status: 503 });
    return NextResponse.json({ error: 'Internal server error', details: 'An unexpected error occurred.' }, { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    name: 'Oracle Chat API',
    version: '1.0.0',
    description: 'AI-powered spiritual chat Oracle for Cabala dos Caminhos',
    minimaxModel: MINIMAX_MODEL,
    capabilities: ['spiritual_guidance', 'divination', 'correlation_analysis', 'orixa_guidance', 'tarot_reading'],
    endpoints: {
      'GET /api/chat/oracle': {
        description: 'API information and documentation',
        response: { name: 'string', version: 'string', description: 'string', endpoints: 'object' }
      },
      'POST /api/chat/oracle': {
        description: 'Consult the Oracle with a spiritual query',
        body: {
          userId: 'string (required) - User identifier',
          message: 'string (required) - Spiritual query or question',
          context: 'UserSpiritualData (optional) - User spiritual data including name, birth date, personal number',
          conversationHistory: 'Message[] (optional) - Previous conversation messages for context'
        },
        response: {
          response: 'string - AI-generated spiritual guidance',
          reasoning: 'ReasoningStep[] - Chain-of-thought reasoning trace',
          toolsUsed: 'string[] - Spiritual tools invoked during processing',
          confidence: 'number (0-1) - Confidence score for the response',
          detectedSystem: 'string (optional) - Primary spiritual system detected'
        }
      }
    },
    supportedSystems: [
      'Kabbalah (32 Paths, Sephirot, Tree of Life)',
      'Ifá/Orunmila (16 Odu, diloggún)',
      'Candomblé (Orixás, rituals, offerings)',
      'Tarot (78 cards, Major/Minor Arcana)',
      'Astrology (planets, signs, houses)',
      'Numerology (life paths, expressions)'
    ]
  });
}
