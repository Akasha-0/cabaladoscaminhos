import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether',
  'Chokhmah',
  'Binah',
  'Chesed',
  'Gevurah',
  'Tipheret',
  'Netzach',
  'Hod',
  'Yesod',
  'Malkuth',
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const SpiritualNotificationTypeSchema = z.enum([
  'ritual_reminder',
  'auspicious_day',
  'orixa_message',
  'astrology_alert',
  'numerology_insight',
  'ancestral_guidance',
  'gratitude_reminder',
]);

const SpiritualNotificationSchema = z.object({
  id: z.string(),
  type: SpiritualNotificationTypeSchema,
  title: z.string(),
  message: z.string(),
  timestamp: z.string(),
  read: z.boolean().default(false),
  metadata: z.record(z.unknown()).optional(),
  spiritualCorrelations: z
    .object({
      sefirot: z.array(z.string()),
      chakra: z.number(),
      element: z.string(),
      orixa: z.string(),
      affirmation: z.string(),
      frequency: z.string(),
    })
    .optional(),
});

const CreateSpiritualNotificationSchema = z.object({
  type: SpiritualNotificationTypeSchema,
  title: z.string().min(1, 'Título é obrigatório').max(100),
  message: z.string().min(1, 'Mensagem é obrigatória').max(500),
  metadata: z.record(z.unknown()).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

const NotificationsQuerySchema = z.object({
  type: SpiritualNotificationTypeSchema.optional(),
  unreadOnly: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

// ─── Spiritual Correlations for Notification Types ──────────────────────────────────────────
const NOTIFICATION_SPIRITUAL_CORRELATIONS: Record<
  string,
  {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  }
> = {
  ritual_reminder: {
    sefirot: ['Tipheret', 'Gevurah'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'O ritual purifica meu caminho',
    frequency: '528 Hz',
  },
  auspicious_day: {
    sefirot: ['Kether', 'Chokhmah'],
    chakra: 7,
    element: 'Éter',
    orixa: 'Oxalá',
    affirmation: 'Este dia é abençoado pela luz',
    frequency: '963 Hz',
  },
  orixa_message: {
    sefirot: ['Tipheret', 'Chesed'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'O Orixá fala através de mim',
    frequency: '528 Hz',
  },
  astrology_alert: {
    sefirot: ['Binah', 'Chokhmah'],
    chakra: 6,
    element: 'Água',
    orixa: 'Orunmilá',
    affirmation: 'Os astros revelam minha verdade',
    frequency: '639 Hz',
  },
  numerology_insight: {
    sefirot: ['Hod', 'Malkuth'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Orunmilá',
    affirmation: 'Os números guiam minha jornada',
    frequency: '741 Hz',
  },
  ancestral_guidance: {
    sefirot: ['Yesod', 'Malkuth'],
    chakra: 2,
    element: 'Água',
    orixa: 'Nanã',
    affirmation: 'Meus ancestrais me guiam',
    frequency: '285 Hz',
  },
  gratitude_reminder: {
    sefirot: ['Chesed', 'Netzach'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'Gratidão abre as portas da abundância',
    frequency: '528 Hz',
  },
};

// In-memory storage for spiritual notifications
const spiritualNotifications: z.infer<typeof SpiritualNotificationSchema>[] = [];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = NotificationsQuerySchema.safeParse({
    type: searchParams.get('type'),
    // fallow-ignore-next-line code-duplication
    unreadOnly: searchParams.get('unreadOnly'),
    sefirot: searchParams.get('sefirot'),
    chakra: searchParams.get('chakra'),
    element: searchParams.get('element'),
    orixa: searchParams.get('orixa'),
  });

  if (!parseResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { type, unreadOnly, sefirot, chakra, element, orixa } = parseResult.data;

  let notifications = [...spiritualNotifications];

  if (type) {
    notifications = notifications.filter((n) => n.type === type);
  }

  if (unreadOnly) {
    notifications = notifications.filter((n) => !n.read);
  }

  if (sefirot) {
    notifications = notifications.filter((n) => n.spiritualCorrelations?.sefirot.includes(sefirot));
  }

  if (chakra) {
    notifications = notifications.filter((n) => n.spiritualCorrelations?.chakra === chakra);
  }

  if (element) {
    notifications = notifications.filter((n) => n.spiritualCorrelations?.element === element);
  }

  if (orixa) {
    notifications = notifications.filter((n) => n.spiritualCorrelations?.orixa === orixa);
  }

  // Calculate spiritual stats
  const spiritualStats = {
    byType: notifications.reduce(
      (acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    bySefirot: notifications.reduce(
      (acc, n) => {
        n.spiritualCorrelations?.sefirot.forEach((s) => {
          acc[s] = (acc[s] || 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>
    ),
    byChakra: notifications.reduce(
      (acc, n) => {
        const c = n.spiritualCorrelations?.chakra;
        if (c) acc[c] = (acc[c] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    byElement: notifications.reduce(
      (acc, n) => {
        const e = n.spiritualCorrelations?.element;
        if (e) acc[e] = (acc[e] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
    byOrixa: notifications.reduce(
      (acc, n) => {
        const o = n.spiritualCorrelations?.orixa;
        if (o) acc[o] = (acc[o] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
  };

  return NextResponse.json({
    success: true,
    notifications,
    total: notifications.length,
    spiritualCorrelations: NOTIFICATION_SPIRITUAL_CORRELATIONS,
    spiritualStats,
    meta: {
      filters: { type, unreadOnly, sefirot, chakra, element, orixa },
    },
  });
}

// fallow-ignore-next-line complexity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = CreateSpiritualNotificationSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { type, title, message, metadata, sefirot, chakra, element, orixa } = parseResult.data;

    const baseCorr = NOTIFICATION_SPIRITUAL_CORRELATIONS[type];
    const spiritualCorr = {
      sefirot: sefirot ? [sefirot] : baseCorr?.sefirot || [],
      chakra: chakra || baseCorr?.chakra || 5,
      element: element || baseCorr?.element || 'Ar',
      orixa: orixa || baseCorr?.orixa || 'Oxalá',
      affirmation: baseCorr?.affirmation || '',
      frequency: baseCorr?.frequency || '528 Hz',
    };

    const notification: z.infer<typeof SpiritualNotificationSchema> = {
      id: crypto.randomUUID(),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      metadata,
      spiritualCorrelations: spiritualCorr,
    };

    spiritualNotifications.push(notification);

    return NextResponse.json(
      {
        success: true,
        notification,
        spiritualCorrelations: spiritualCorr,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno',
      },
      { status: 500 }
    );
  }
}
