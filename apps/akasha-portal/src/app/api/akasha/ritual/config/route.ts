import type { RitualConfig } from '@akasha/core';
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { setRitualConfig } from '@/lib/application/akasha/ritual-storage';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';

// ─── Esquema Zod ────────────────────────────────────────────────────────────

const componentesSchema = z.object({
  codigo: z.boolean(),
  pratica: z.boolean(),
  quizilas: z.boolean(),
  afirmacao: z.boolean(),
  oracao: z.boolean(),
});

const configBodySchema = z.object({
  horario: z.string().regex(/^\d{2}:\d{2}$/, 'Formato esperado: HH:MM'),
  timezone: z.string().min(1),
  componentes: componentesSchema,
  ativo: z.boolean(),
});

export async function POST(request: NextRequest) {
  // 1. Autenticar
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;
  const { id: userId } = authResult;

  // 2. Validar body
  let parsed: z.infer<typeof configBodySchema>;
  try {
    const raw = await request.json();
    parsed = configBodySchema.parse(raw);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos', details: err.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
  }

  // 3. Converter e salvar config
  const config: RitualConfig = {
    horario: parsed.horario,
    timezone: parsed.timezone,
    componentes: {
      codigoDoDia: parsed.componentes.codigo,
      praticaPrincipal: parsed.componentes.pratica,
      quizilas: parsed.componentes.quizilas,
      afirmacao: parsed.componentes.afirmacao,
    },
    ativo: parsed.ativo,
  };

  setRitualConfig(userId, config);

  return NextResponse.json(config, { status: 200 });
}
