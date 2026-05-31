import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────

const TransactionTypeSchema = z.enum(['offering', 'merit', 'reward', 'transfer', 'exchange']);
const CurrencySchema = z.enum(['spiritual_credits', 'karma_points', 'merit_units', 'blessing_tokens']);

const TransactionSchema = z.object({
  id: z.string(),
  type: TransactionTypeSchema,
  amount: z.number(),
  currency: CurrencySchema,
  description: z.string(),
  origin: z.string(),
  destination: z.string().optional(),
  timestamp: z.string(),
  status: z.enum(['completed', 'pending', 'cancelled']),
});

const SpiritualBankingQuerySchema = z.object({
  type: TransactionTypeSchema.optional(),
  currency: CurrencySchema.optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

const CreateTransactionSchema = z.object({
  type: TransactionTypeSchema,
  amount: z.number().positive(),
  currency: CurrencySchema,
  description: z.string().min(1).max(500),
  destination: z.string().optional(),
});

// ─── Spiritual Banking Data ────────────────────────────────────────────────

const TRANSACTIONS: z.infer<typeof TransactionSchema>[] = [
  {
    id: 'txn-001',
    type: 'merit',
    amount: 50,
    currency: 'merit_units',
    description: 'Prática de meditação diária concluída',
    origin: 'system',
    timestamp: new Date().toISOString(),
    status: 'completed',
  },
  {
    id: 'txn-002',
    type: 'reward',
    amount: 100,
    currency: 'spiritual_credits',
    description: 'Bênção de Oxum pela prática devocional',
    origin: 'orixa:oxum',
    timestamp: new Date().toISOString(),
    status: 'completed',
  },
  {
    id: 'txn-003',
    type: 'offering',
    amount: 25,
    currency: 'karma_points',
    description: 'Oferta de candle para Xangô',
    origin: 'user:zeus',
    destination: 'orixa:xango',
    timestamp: new Date().toISOString(),
    status: 'completed',
  },
  {
    id: 'txn-004',
    type: 'transfer',
    amount: 30,
    currency: 'spiritual_credits',
    description: 'Transferência de créditos paraebo (corrente de Oxumaré)',
    origin: 'user:maria',
    destination: 'user:joao',
    timestamp: new Date().toISOString(),
    status: 'pending',
  },
  {
    id: 'txn-005',
    type: 'exchange',
    amount: 15,
    currency: 'blessing_tokens',
    description: 'Troca de tokens de bênção por acesso ao mapa astral completo',
    origin: 'user:pedro',
    destination: 'service:astrology',
    timestamp: new Date().toISOString(),
    status: 'completed',
  },
  {
    id: 'txn-006',
    type: 'merit',
    amount: 75,
    currency: 'merit_units',
    description: 'Participação em ritual coletivo de Ogum',
    origin: 'ritual:ogum-collective',
    timestamp: new Date().toISOString(),
    status: 'completed',
  },
  {
    id: 'txn-007',
    type: 'reward',
    amount: 200,
    currency: 'karma_points',
    description: 'Caridade espiritual: doar água sagrada a necessitados',
    origin: 'user:ana',
    timestamp: new Date().toISOString(),
    status: 'completed',
  },
  {
    id: 'txn-008',
    type: 'offering',
    amount: 40,
    currency: 'spiritual_credits',
    description: 'Oferta de flores para Iemanjá (quarta-feira)',
    origin: 'user:carlos',
    destination: 'orixa:iemanja',
    timestamp: new Date().toISOString(),
    status: 'completed',
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = SpiritualBankingQuerySchema.safeParse({
    type: searchParams.get('type'),
    currency: searchParams.get('currency'),
    limit: searchParams.get('limit'),
  });

  if (!parseResult.success) {
    return NextResponse.json({
      success: false,
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const { type, currency, limit } = parseResult.data;
  let transactions = [...TRANSACTIONS];

  if (type) {
    transactions = transactions.filter(t => t.type === type);
  }
  if (currency) {
    transactions = transactions.filter(t => t.currency === currency);
  }
  if (limit) {
    transactions = transactions.slice(0, limit);
  }

  return NextResponse.json({
    success: true,
    transactions,
    count: transactions.length,
    total: TRANSACTIONS.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = CreateTransactionSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Payload inválida',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { type, amount, currency, description, destination } = parseResult.data;

    const newTransaction: z.infer<typeof TransactionSchema> = {
      id: `txn-${Date.now()}`,
      type,
      amount,
      currency,
      description,
      origin: 'user:current',
      destination,
      timestamp: new Date().toISOString(),
      status: 'pending',
    };

    return NextResponse.json({
      success: true,
      transaction: newTransaction,
      message: 'Transação espiritual criada com sucesso',
    }, { status: 201 });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Falha ao processar transação',
    }, { status: 500 });
  }
}