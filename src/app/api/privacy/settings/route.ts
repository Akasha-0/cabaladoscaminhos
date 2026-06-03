import { requireOperator } from '@/lib/auth/operator-session';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────

const PrivacyLevelSchema = z.enum(['public', 'private', 'restricted']);
const DataSharingSchema = z.object({
  shareWithCommunity: z.boolean(),
  allowAnalytics: z.boolean(),
  showInLeaderboards: z.boolean(),
  publicProfile: z.boolean(),
});

const PrivacySettingsSchema = z.object({
  id: z.string(),
  userId: z.string(),
  profileVisibility: PrivacyLevelSchema,
  birthDateVisibility: PrivacyLevelSchema,
  orixaVisibility: PrivacyLevelSchema,
  numerologyVisibility: PrivacyLevelSchema,
  dataSharing: DataSharingSchema,
  communicationPreferences: z.object({
    emailNotifications: z.boolean(),
    pushNotifications: z.boolean(),
    smsAlerts: z.boolean(),
    marketingEmails: z.boolean(),
  }),
  dataRetentionDays: z.number().int().positive(),
  gdprConsent: z.boolean(),
  lastUpdated: z.string(),
});

const UpdatePrivacySettingsSchema = z.object({
  profileVisibility: PrivacyLevelSchema.optional(),
  birthDateVisibility: PrivacyLevelSchema.optional(),
  orixaVisibility: PrivacyLevelSchema.optional(),
  numerologyVisibility: PrivacyLevelSchema.optional(),
  dataSharing: DataSharingSchema.optional(),
  communicationPreferences: z.object({
    emailNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
    smsAlerts: z.boolean().optional(),
    marketingEmails: z.boolean().optional(),
  }).optional(),
  dataRetentionDays: z.number().int().positive().optional(),
  gdprConsent: z.boolean().optional(),
});

const PrivacySettingsQuerySchema = z.object({
  include: z.enum(['data_sharing', 'communication', 'all']).optional(),
});

// ─── Demo Privacy Settings ─────────────────────────────────────────────────

const DEMO_PRIVACY_SETTINGS: z.infer<typeof PrivacySettingsSchema> = {
  id: 'privacy-001',
  userId: 'user-001',
  profileVisibility: 'restricted',
  birthDateVisibility: 'private',
  orixaVisibility: 'private',
  numerologyVisibility: 'restricted',
  dataSharing: {
    shareWithCommunity: false,
    allowAnalytics: true,
    showInLeaderboards: true,
    publicProfile: false,
  },
  communicationPreferences: {
    emailNotifications: true,
    pushNotifications: true,
    smsAlerts: false,
    marketingEmails: false,
  },
  dataRetentionDays: 365,
  gdprConsent: true,
  lastUpdated: new Date().toISOString(),
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = PrivacySettingsQuerySchema.safeParse({
    include: searchParams.get('include'),
  });

  if (!parseResult.success) {
    return NextResponse.json({
      success: false,
      error: 'Parâmetros inválidos',
      details: parseResult.error.flatten().fieldErrors,
    }, { status: 400 });
  }

  const { include } = parseResult.data;
      const settings = { ...DEMO_PRIVACY_SETTINGS };

  if (include === 'data_sharing') {
    return NextResponse.json({
      success: true,
      settings: {
        id: settings.id,
        userId: settings.userId,
        dataSharing: settings.dataSharing,
      },
    });
  } else if (include === 'communication') {
    return NextResponse.json({
      success: true,
      settings: {
        id: settings.id,
        userId: settings.userId,
        communicationPreferences: settings.communicationPreferences,
      },
    });
  }

  return NextResponse.json({
    success: true,
    settings,
  });
}

export async function POST(request: NextRequest) {
  // Auth guard
  const authResult = await requireOperator(request);
  if (authResult instanceof NextResponse) return authResult;
  try {
    const body = await request.json();
    const parseResult = UpdatePrivacySettingsSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Payload inválida',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const updatedSettings: z.infer<typeof PrivacySettingsSchema> = {
      ...DEMO_PRIVACY_SETTINGS,
      ...parseResult.data,
      dataSharing: parseResult.data.dataSharing
        ? { ...DEMO_PRIVACY_SETTINGS.dataSharing, ...parseResult.data.dataSharing }
        : DEMO_PRIVACY_SETTINGS.dataSharing,
      communicationPreferences: parseResult.data.communicationPreferences
        ? { ...DEMO_PRIVACY_SETTINGS.communicationPreferences, ...parseResult.data.communicationPreferences }
        : DEMO_PRIVACY_SETTINGS.communicationPreferences,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
      message: 'Configurações de privacidade atualizadas com sucesso',
    }, { status: 200 });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Falha ao processar atualização de privacidade',
    }, { status: 500 });
  }
}