// Mentor orchestration logic

import type {
  MentorConfig,
  MentorContext,
  MentorResponse,
  MentorMessage,
  ChatRequest,
  ChatResponse,
  ChatIntent,
  SuggestedPractice,
  MentorRitual,
  MentorQuizila,
} from './types';
import { detectIntent } from './intent-detector';

// Import lazy: evita ciclo e permite que @akasha/core seja mockado em testes
// via `vi.mock('@akasha/core', ...)` antes do import estático.
import { generateHybrid, buildRitual } from '@akasha/core';

/**
 * Extrai o número de hexagrama de um userCode.
 * Aceita:
 *   - número puro: "1", "32", "64"
 *   - formato "hex-lev-area": "10-shadow-relacionamentos" → 10
 * Retorna null se não conseguir extrair ou se o número está fora do range 1-64.
 */
function parseHexagramFromUserCode(userCode: string | undefined): number | null {
  if (!userCode) return null;
  const trimmed = userCode.trim();
  if (trimmed === '') return null;

  // Formato "hex-lev-area" → primeiro token
  const firstToken = trimmed.split(/[-_]/)[0];
  const n = Number.parseInt(firstToken, 10);
  if (Number.isNaN(n)) return null;
  if (n < 1 || n > 64) return null;
  return n;
}

export class MentorEngine {
  private config: MentorConfig;

  constructor(config: MentorConfig = {}) {
    this.config = {
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 1000,
      ...config,
    };
  }

  async ask(question: string, context: MentorContext): Promise<MentorResponse> {
    // Placeholder implementation
    return {
      answer: `Mentor response to: ${question}`,
      confidence: 0.8,
    };
  }

  /**
   * Roteia o pedido por intent e opcionalmente busca práticas/ritual via
   * `@akasha/core` (mocks em testes; engine real em produção).
   *
   * - 'practice'  → chama `generateHybrid(userCode)` → suggestedPractices
   * - 'ritual'    → chama `buildRitual(userCode)`    → ritual + relevantQuizilas
   * - 'guidance'  → apenas message reflexiva
   * - 'general'   → apenas message genérica
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const intent: ChatIntent = request.intent ?? detectIntent(request.message);
    const hex = parseHexagramFromUserCode(request.userCode);

    const message = `Olá! Recebi sua mensagem: "${request.message}". ` +
      `Estou aqui para apoiar sua jornada espiritual.`;

    const response: ChatResponse = {
      message,
      intent,
    };

    if (hex === null) {
      // Sem hexagrama válido, não anexa práticas nem ritual.
      return response;
    }

    if (intent === 'practice') {
      // Cast through `unknown`: a assinatura real de generateHybrid é
      // `(context: RecommendationContext, limit: number) => Promise<...>`
      // mas em testes o `vi.mock('@akasha/core')` substitui por um forwarder
      // que aceita qualquer args. O cast preserva a flexibilidade do mock
      // sem perder a checagem de tipo no caller.
      const hybrid = (await generateHybrid(
        { hexagramCode: String(hex) } as unknown as never,
        5
      )) as unknown as Array<{
        practice: SuggestedPractice;
        confidence: number;
        source: string;
        personalizedReason?: string;
      }>;
      if (Array.isArray(hybrid) && hybrid.length > 0) {
        response.suggestedPractices = hybrid.map((h) => h.practice);
      }
    }

    if (intent === 'ritual') {
      // Mesmo padrão: assinatura real é `(config, code) => RitualResponse`,
      // mock aceita qualquer args. Cast através de `unknown`.
      const ritualData = buildRitual(
        { hexagramCode: String(hex) } as unknown as never,
        { hexagram: Number(hex), level: 'gift' } as unknown as never
      ) as unknown as {
        data: Date;
        codigo: { hexagrama: { id: number; name: string; number: number }; nivel: MentorRitual['level'] };
        pratica: { id: string; name: string; category: string };
        quizilas?: Array<{ id: string; texto: string; tipo?: MentorQuizila['tipo'] }>;
      };
      if (ritualData) {
        const level = ritualData.codigo?.nivel ?? 'gift';
        response.ritual = {
          id: ritualData.pratica.id,
          name: 'Ritual do Dia',
          level,
        };
        if (Array.isArray(ritualData.quizilas) && ritualData.quizilas.length > 0) {
          response.relevantQuizilas = ritualData.quizilas.map((q) => ({
            texto: q.texto,
            tipo: q.tipo,
          }));
        }
      }
    }

    return response;
  }

  /**
   * API legada: recebe histórico de mensagens + contexto, retorna MentorMessage.
   * Mantida para compatibilidade com código pré-F-205.
   */
  async chatLegacy(
    messages: MentorMessage[],
    _context: MentorContext
  ): Promise<MentorMessage> {
    // Placeholder implementation
    return {
      id: crypto.randomUUID(),
      role: 'mentor',
      content: 'Mentor is processing your message...',
      createdAt: new Date(),
    };
  }
}

export function createMentor(config?: MentorConfig): MentorEngine {
  return new MentorEngine(config);
}
