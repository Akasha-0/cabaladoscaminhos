import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withErrorHandler } from "@/lib/error-handling";

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const NotificationPreferencesSchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
  transitAlerts: z.boolean(),
  dailyInsights: z.boolean(),
  weeklyReport: z.boolean().optional(),
  moonAlerts: z.boolean().optional(),
  orixaReminders: z.boolean().optional(),
});

const PreferencesQuerySchema = z.object({
  format: z.enum(['full', 'summary']).optional(),
});

// ─── Type Definitions ───────────────────────────────────────────────────────
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  transitAlerts: boolean;
  dailyInsights: boolean;
  weeklyReport?: boolean;
  moonAlerts?: boolean;
  orixaReminders?: boolean;
}

export const dynamic = 'force-dynamic';

// In-memory store (would be replaced with database)
const preferenceStore: Map<string, NotificationPreferences> = new Map([
  ['default', {
    email: true,
    push: false,
    transitAlerts: true,
    dailyInsights: true,
    weeklyReport: true,
    moonAlerts: true,
    orixaReminders: false,
  }],
]);

export const GET = withErrorHandler(async (req: NextRequest) => {
  try {
    const userId = req.headers.get('x-user-id') || 'default';
    const { searchParams } = new URL(req.url);
    const parseResult = PreferencesQuerySchema.safeParse({
      format: searchParams.get('format'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const preferences = preferenceStore.get(userId) || preferenceStore.get('default')!;
    const { format } = parseResult.data;

    if (format === 'summary') {
      return NextResponse.json({
        success: true,
        preferences: {
          email: preferences.email,
          push: preferences.push,
          totalEnabled: Object.values(preferences).filter(v => typeof v === 'boolean' && v).length,
        },
      });
    }

    return NextResponse.json({
      success: true,
      preferences: {
        ...preferences,
        channels: {
          email: { enabled: preferences.email, label: 'Email notifications' },
          push: { enabled: preferences.push, label: 'Push notifications' },
        },
        spiritual: {
          transitAlerts: { enabled: preferences.transitAlerts, label: 'Astrological transit alerts' },
          dailyInsights: { enabled: preferences.dailyInsights, label: 'Daily spiritual insights' },
          weeklyReport: { enabled: preferences.weeklyReport ?? false, label: 'Weekly spiritual report' },
          moonAlerts: { enabled: preferences.moonAlerts ?? false, label: 'Moon phase notifications' },
          orixaReminders: { enabled: preferences.orixaReminders ?? false, label: 'Orixá practice reminders' },
        },
      },
    });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar preferências',
    }, { status: 500 });
  }
});

export const PUT = withErrorHandler(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const parseResult = NotificationPreferencesSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Payload inválido',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const userId = req.headers.get('x-user-id') || 'default';
    const current = preferenceStore.get(userId) || preferenceStore.get('default')!;

    const updated: NotificationPreferences = {
      email: parseResult.data.email ?? current.email,
      push: parseResult.data.push ?? current.push,
      transitAlerts: parseResult.data.transitAlerts ?? current.transitAlerts,
      dailyInsights: parseResult.data.dailyInsights ?? current.dailyInsights,
      weeklyReport: parseResult.data.weeklyReport ?? current.weeklyReport,
      moonAlerts: parseResult.data.moonAlerts ?? current.moonAlerts,
      orixaReminders: parseResult.data.orixaReminders ?? current.orixaReminders,
    };

    preferenceStore.set(userId, updated);

    return NextResponse.json({
      success: true,
      preferences: updated,
      message: 'Preferências atualizadas com sucesso',
    });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Erro ao atualizar preferências',
    }, { status: 500 });
  }
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const parseResult = NotificationPreferencesSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Payload inválido',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const userId = req.headers.get('x-user-id') || 'default';
    const preferences: NotificationPreferences = {
      ...parseResult.data,
    };

    preferenceStore.set(userId, preferences);

    return NextResponse.json({
      success: true,
      preferences,
      message: 'Preferências criadas com sucesso',
    }, { status: 201 });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Erro ao criar preferências',
    }, { status: 500 });
  }
});