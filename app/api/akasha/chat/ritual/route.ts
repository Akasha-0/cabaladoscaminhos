import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';

export interface RitualResponse {
  ritual: {
    titulo: string;
    instrucao: string;
    cor: string;
    elemento: string;
  };
}

export async function POST(req: NextRequest): Promise<NextResponse<RitualResponse | { error: string }>> {
  const authResult = await requireAkashaApi(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  return NextResponse.json({
    ritual: { titulo: 'Ritual', instrucao: 'instrução', cor: 'azul', elemento: 'água' },
  });
}
