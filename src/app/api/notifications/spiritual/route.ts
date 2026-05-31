import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────

const SpiritualNotificationTypeSchema = z.enum([
  'ritual_reminder',
  ' auspicious_day',
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
});

const CreateSpiritualNotificationSchema = z.object({
  type: SpiritualNotificationTypeSchema,
  title: z.string().min(1, 'Título é obrigatório').max(100),
  message: z.string().min(1, 'Mensagem é obrigatória').max(500),
  metadata: z.record(z.unknown()).optional(),
});

// In-memory storage for spiritual notifications
const spiritualNotifications: z.infer<typeof SpiritualNotificationSchema>[] = [];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') as SpiritualNotificationTypeSchema | null;
  const unreadOnly = searchParams.get('unreadOnly') === 'true';

  let notifications = [...spiritualNotifications];

  if (type && SpiritualNotificationTypeSchema.safeParse(type).success) {
    notifications = notifications.filter(n => n.type === type);
  }

  if (unreadOnly) {
    notifications = notifications.filter(n => !n.read);
  }

  return NextResponse.json({
    success: true,
    notifications,
    total: notifications.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = CreateSpiritualNotificationSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Dados inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const notification: z.infer<typeof SpiritualNotificationSchema> = {
      id: crypto.randomUUID(),
      type: parseResult.data.type,
      title: parseResult.data.title,
      message: parseResult.data.message,
      timestamp: new Date().toISOString(),
      read: false,
      metadata: parseResult.data.metadata,
    };

    spiritualNotifications.push(notification);

    return NextResponse.json({
      success: true,
      notification,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}