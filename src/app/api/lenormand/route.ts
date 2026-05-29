/**
 * Lenormand Mesa Real API - Cabala Dos Caminhos
 */
import { NextRequest, NextResponse } from 'next/server';
import { LENORMAND_CARDS, getCardByNumero, CASAS_TEMATICAS } from '@/lib/lenormand/data';
import { realizarLeitura, MESA_REAL_SPREADS } from '@/lib/lenormand/mesa-real';

interface ReadingRequest { format?: '8x4+4' | '9x4'; cardIndices?: number[]; seed?: number; pergunta?: string; }

export async function POST(request: NextRequest) {
  try {
    const body: ReadingRequest = await request.json();
    const format = body.format ?? '8x4+4';
    if (!MESA_REAL_SPREADS[format]) return NextResponse.json({ success: false, error: 'Formato inválido.' }, { status: 400 });
    if (body.cardIndices) { if (!Array.isArray(body.cardIndices)) return NextResponse.json({ success: false, error: 'cardIndices deve ser array.' }, { status: 400 }); for (const idx of body.cardIndices) { if (idx < 0 || idx > 35 || !Number.isInteger(idx)) return NextResponse.json({ success: false, error: `Índice inválido: ${idx}.` }, { status: 400 }); } }
    const reading = realizarLeitura({ format, cardIndices: body.cardIndices, seed: body.seed });
    const spread = MESA_REAL_SPREADS[format];
    const cards = reading.cards.map(card => { const fullCard = getCardByNumero(card.cardIndex + 1); return { position: card.position, house: card.house, houseLabel: spread.casaLabels[card.house - 1], cardIndex: card.cardIndex, cardNumber: card.cardIndex + 1, cardName: card.cardName, orientation: card.orientation, tipo: card.tipo, significadoCentral: fullCard?.significadoCentral ?? '', areaVida: fullCard?.areaVida ?? '', comoInterpretar: fullCard?.comoInterpretar ?? '' }; });
    const destinyCards = reading.destinyCards?.map(card => { const fullCard = getCardByNumero(card.cardIndex + 1); return { position: card.position, houseLabel: spread.casaLabels[card.position - 1], cardIndex: card.cardIndex, cardNumber: card.cardIndex + 1, cardName: card.cardName, tipo: card.tipo, significadoCentral: fullCard?.significadoCentral ?? '' }; });
    return NextResponse.json({ success: true, format, spreadInfo: reading.spreadInfo, cards, destinyCards, themes: reading.themes, analysis: reading.analysis, timestamp: reading.timestamp, pergunta: body.pergunta });
  } catch (error) { console.error('Lenormand error:', error); return NextResponse.json({ success: false, error: 'Erro ao realizar a leitura.' }, { status: 500 }); }
}

export async function GET() {
  const spreads = Object.entries(MESA_REAL_SPREADS).map(([key, s]) => ({ id: key, format: s.format, rows: s.rows, cols: s.cols, totalCards: s.totalCards, destinyCards: s.destinyCards, description: key === '8x4+4' ? '4 linhas de 8 + 4 destino.' : '4 linhas de 9.' }));
  return NextResponse.json({ success: true, totalCards: LENORMAND_CARDS.length, cardNames: LENORMAND_CARDS.map(c => ({ numero: c.numero, nome: c.nome, tipo: c.tipo })), spreads, thematicHouses: { dinheiro: [...CASAS_TEMATICAS.DINHEIRO], amor: [...CASAS_TEMATICAS.AMOR], trabalho: [...CASAS_TEMATICAS.TRABALHO], saude: [...CASAS_TEMATICAS.SAUDE] } });
}
