import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { gerarMapaAlmaCompleto } from '@/lib/engines/spiritual-engine';
import { gerarRelatorioMapaAlmaPDF } from '@/lib/pdf/gerarRelatorio';

const mapaSchema = z.object({
  nomeCompleto: z.string().min(2).max(200),
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hora: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  pais: z.string().optional(),
});

type MapaInput = z.infer<typeof mapaSchema>;

// ============================================================
// POST — generate PDF
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as unknown;
    const parsed = mapaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { nomeCompleto, dataNascimento, hora, cidade, estado, pais } = parsed.data as MapaInput;
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
