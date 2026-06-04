import { requireOperator } from '@/lib/auth/operator-session';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const NotificationTypeSchema = z.enum([
  'ritual_reminder',
  'orixa_message',
  'afirmation',
  'calendar_event',
  'guidance',
  'manifestation_update',
  'system',
]);
const NotificationStatusSchema = z.enum(['unread', 'read', 'dismissed']);
const NotificationQuerySchema = z.object({
  userId: z.string().optional(),
  status: NotificationStatusSchema.optional(),
  type: NotificationTypeSchema.optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
const CreateNotificationSchema = z.object({
  userId: z.string().min(1, 'userId é obrigatório'),
  type: NotificationTypeSchema,
  title: z.string().min(1, 'Título é obrigatório'),
  message: z.string().min(1, 'Mensagem é obrigatória'),
  orixa: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  scheduledAt: z.string().datetime().optional(),
  data: z.record(z.any()).optional(),
});
// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = NotificationQuerySchema.safeParse({
      userId: searchParams.get('userId'),
      status: searchParams.get('status'),
      type: searchParams.get('type'),
      limit: searchParams.get('limit'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { userId, status, type, limit } = parseResult.data;
    return NextResponse.json({
      notifications: [],
      count: 0,
      filters: { userId, status, type },
      limit: limit ?? 20,
    });
  } catch {
    return NextResponse.json({
      error: 'Erro ao processar notificações',
    }, { status: 500 });
  }
}
// POST /api/notifications - Create a notification
export async function POST(request: NextRequest) {
  // Auth guard
  const authResult = await requireOperator(request);
  if (authResult instanceof NextResponse) return authResult;
  try {
    const body = await request.json();
    const parseResult = CreateNotificationSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Corpo inválido',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    return NextResponse.json({
      success: true,
      notification: {
        id: crypto.randomUUID(),
        ...parseResult.data,
        status: 'unread',
        createdAt: new Date().toISOString(),
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json({
      error: 'Erro ao processar notificação',
    }, { status: 500 });
  }
}
// PATCH /api/notifications - Update notification status
export async function PATCH(request: NextRequest) {
  // Auth guard — PATCH modifies data, must require operator auth
  const authResult = await requireOperator(request);
  if (authResult instanceof NextResponse) return authResult;
  try {
    const body = await request.json();
    const parseResult = z.object({
      id: z.string().min(1),
      status: NotificationStatusSchema,
    }).safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Corpo inválido',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    return NextResponse.json({
      success: true,
      updated: {
        id: parseResult.data.id,
        status: parseResult.data.status,
      },
    });
  } catch {
    return NextResponse.json({
      error: 'Erro ao atualizar notificação',
    }, { status: 500 });
  }
}