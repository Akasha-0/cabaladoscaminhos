import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────

const ZodiacSignSchema = z.enum([
  'aries', 'touro', 'gemeos', 'cancer', 'leao', 'virgem',
  'libra', 'escorpiao', 'sagitario', 'capricornio', 'aquario', 'peixes'
]);

const OrixaSchema = z.enum([
  'oxala', 'iemanja', 'ogum', 'xango', 'oxum', 'nanã', 'ieiá',
  'omulu', 'oxumaré', 'logun-edé', 'ibuai', 'oregui', 'nanã'
]);

const NumerologyProfileSchema = z.object({
  lifePath: z.number().int().min(1).max(11).or(z.enum([22, 33])),
  expression: z.number().int().min(1).max(9),
  soulUrge: z.number().int().min(1).max(9),
  personality: z.number().int().min(1).max(9),
  masterNumbers: z.array(z.number()).optional(),
});

const SpiritualProfileSchema = z.object({
  orixa: OrixaSchema,
  odu: z.string().optional(),
  lifePath: z.number(),
  element: z.enum(['agua', 'fogo', 'terra', 'ar', 'eter']),
  temperament: z.enum(['sanguineo', 'colerico', 'melancolico', 'fleumatico']),
});

const UserProfileResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  spiritualProfile: SpiritualProfileSchema,
  numerologyProfile: NumerologyProfileSchema,
  birthDate: z.string(),
  birthLocation: z.string().optional(),
  createdAt: z.string(),
  lastLogin: z.string().optional(),
});

const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  spiritualProfile: z.object({
    orixa: OrixaSchema.optional(),
    odu: z.string().optional(),
    lifePath: z.number().int().positive().optional(),
    element: z.enum(['agua', 'fogo', 'terra', 'ar', 'eter']).optional(),
    temperament: z.enum(['sanguineo', 'colerico', 'melancolico', 'fleumatico']).optional(),
  }).optional(),
});

const ProfileQuerySchema = z.object({
  include: z.enum(['numerology', 'orixa', 'all']).optional(),
});

// ─── Demo Profile Data ─────────────────────────────────────────────────────

const DEMO_PROFILE: z.infer<typeof UserProfileResponseSchema> = {
  id: 'user-001',
  email: 'maria.santos@cabala.com',
  name: 'Maria da Conceição',
  spiritualProfile: {
    orixa: 'oxum',
    odu: 'ejionla',
    lifePath: 11,
    element: 'agua',
    temperament: 'melancolico',
  },
  numerologyProfile: {
    lifePath: 11,
    expression: 3,
    soulUrge: 7,
    personality: 2,
    masterNumbers: [11],
  },
  birthDate: '1985-03-15',
  birthLocation: 'Salvador, BA',
  createdAt: '2024-01-15T10:30:00Z',
  lastLogin: new Date().toISOString(),
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parseResult = ProfileQuerySchema.safeParse({
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
  let profile = { ...DEMO_PROFILE };

  if (include === 'numerology') {
    profile = {
      ...profile,
      spiritualProfile: {} as any,
    };
  } else if (include === 'orixa') {
    profile = {
      ...profile,
      numerologyProfile: {} as any,
    };
  }

  return NextResponse.json({
    success: true,
    profile,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = UpdateProfileSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Payload inválida',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { name, spiritualProfile } = parseResult.data;

    const updatedProfile = {
      ...DEMO_PROFILE,
      name: name ?? DEMO_PROFILE.name,
      spiritualProfile: spiritualProfile
        ? { ...DEMO_PROFILE.spiritualProfile, ...spiritualProfile }
        : DEMO_PROFILE.spiritualProfile,
    };

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: 'Perfil atualizado com sucesso',
    }, { status: 200 });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Falha ao processar atualização do perfil',
    }, { status: 500 });
  }
}