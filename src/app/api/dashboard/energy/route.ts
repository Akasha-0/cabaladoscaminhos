import { NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────

const PortalDaySchema = z.enum(['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']);
const PortalSchema = z.object({
  orixa: z.string(),
  planeta: z.string(),
  chakra: z.string(),
});
const EnergyResponseSchema = z.object({
  success: z.boolean(),
  energy: z.object({
    day: PortalDaySchema,
    orixa: z.string(),
    planeta: z.string(),
    chakra: z.string(),
    lunarPhase: z.string(),
    lunarIllumination: z.number(),
  }),
});

const PORTALS: Record<z.infer<typeof PortalDaySchema>, z.infer<typeof PortalSchema>> = {
  domingo: { orixa: 'Xangô', planeta: 'Sol', chakra: '3º Plexo Solar' },
  segunda: { orixa: 'Iemanjá', planeta: 'Lua', chakra: '6º Frontal' },
  terca: { orixa: 'Iansã', planeta: 'Marte', chakra: '2º Sacro' },
  quarta: { orixa: 'Xangô', planeta: 'Mercúrio', chakra: '3º Plexo Solar' },
  quinta: { orixa: 'Oxóssi', planeta: 'Júpiter', chakra: '4º Cardíaco' },
  sexta: { orixa: 'Oxalá', planeta: 'Vênus', chakra: '7º Coronário' },
  sabado: { orixa: 'Oxum', planeta: 'Saturno', chakra: '4º Cardíaco' },
};

const DAYS: z.infer<typeof PortalDaySchema>[] = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

export async function GET() {
  const dayIndex = new Date().getDay();
  const dayName = DAYS[dayIndex];
  const portal = PORTALS[dayName];

  const response = {
    success: true as const,
    energy: {
      day: dayName,
      ...portal,
      lunarPhase: 'Lua Crescente',
      lunarIllumination: 45,
    },
  };

  // Validate response with Zod
  const parsed = EnergyResponseSchema.safeParse(response);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Erro de validação' }, { status: 500 });
  }

  return NextResponse.json(parsed.data);
}