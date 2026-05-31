import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getMeanings, SefiraMeaning } from '@/lib/cabala/sefirot-meanings';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotQuerySchema = z.object({
  sefira: z.string().optional(),
  language: z.enum(['pt', 'en', 'he']).optional().default('pt'),
});
const VALID_SEFIROT = ['Keter', 'Chokhmah', 'Binah', 'Daat', 'Chesed', 'Gevurah', 'Tiferet', 'Netzach', 'Hod', 'Yesod', 'Malkut'];
export type { SefiraMeaning };
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parseResult = SefirotQuerySchema.safeParse({
      sefira: searchParams.get('sefira'),
      language: searchParams.get('language'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { sefira, language } = parseResult.data;
    const sefirot = getMeanings(language as 'pt' | 'en' | 'he');
    if (sefira) {
      const normalizedSefira = sefira.charAt(0).toUpperCase() + sefira.slice(1).toLowerCase();
      if (sefirot[normalizedSefira as keyof typeof sefirot]) {
        return NextResponse.json(sefirot[normalizedSefira as keyof typeof sefirot]);
      }
      return NextResponse.json({ error: 'Sefira not found', validSefirot: VALID_SEFIROT }, { status: 404 });
    }
    return NextResponse.json(sefirot);
  } catch {
    return NextResponse.json({ error: 'Erro ao processar sefirot' }, { status: 500 });
  }
}
