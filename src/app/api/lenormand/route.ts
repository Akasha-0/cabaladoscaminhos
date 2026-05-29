/**
 * Lenormand Mesa Real API
 */
import { NextRequest, NextResponse } from 'next/server';
import { LENORMAND_CARDS, getCardByNumero, CASAS_TEMATICAS } from '@/lib/lenormand/data';
import { realizarLeitura, MESA_REAL_SPREADS } from '@/lib/lenormand/mesa-real';

interface ReadingRequest { format?: '8x4+4' | '9x4'; seed?: number; pergunta?: string; }

export async function POST(request: NextRequest) {
  try {
    const body: ReadingRequest = await request.json();
    const format = body.format ?? '8x4+4';
    if (!MESA_REAL_SPREADS[format]) return NextResponse.json({ success: false, error: 'Invalid format.' }, { status: 400 });
    const reading = realizarLeitura(format, body.seed);
    return NextResponse.json({ success: true, format, cards: reading });
  } catch (error) { return NextResponse.json({ success: false, error: 'Reading error.' }, { status: 500 }); }
}

export async function GET() {
  const spreads = Object.entries(MESA_REAL_SPREADS).map(([key, s]) => ({ id: key, format: s }));
  return NextResponse.json({ 
    success: true, 
    totalCards: LENORMAND_CARDS.length, 
    cardNames: LENORMAND_CARDS.map((nome, i) => ({ numero: i + 1, nome, tipo: 'cigano' })), 
    spreads, 
    thematicHouses: CASAS_TEMATICAS 
  });
}
