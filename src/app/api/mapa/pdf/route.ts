import { NextRequest, NextResponse } from 'next/server';
import { gerarMapaAlmaCompleto } from '@/lib/engines/spiritual-engine';
import { gerarRelatorioMapaAlmaPDF } from '@/lib/pdf/gerarRelatorio';
import { parseMapaBody } from '@/lib/mapa/mapa-utils';

// ============================================================
// POST — generate PDF
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const parsed = await parseMapaBody(request);
    if (parsed.error) {
      return NextResponse.json(parsed.error.body, { status: parsed.error.status });
    }

    const { nomeCompleto, dataNascimento, hora, cidade, estado, pais } = parsed.data;
    const profile = {
      nomeCompleto,
      dataNascimento,
      hora: hora ?? '',
      cidade: cidade ?? '',
      estado: estado ?? '',
      pais: pais ?? '',
    };

    // Calculate MapaAlmaCompleto
    const mapa = await gerarMapaAlmaCompleto(profile);

    // Generate PDF (Buffer for NextResponse compatibility)
    const pdfBuffer = await gerarRelatorioMapaAlmaPDF(mapa);
    const buffer = Buffer.from(pdfBuffer);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="mapa-alma-${nomeCompleto}.pdf"`,
      },
    });
  } catch (err) {
    console.error('[mapa/pdf] Error:', err);
    return NextResponse.json(
      { error: 'Erro interno ao gerar PDF' },
      { status: 500 }
    );
  }
}
