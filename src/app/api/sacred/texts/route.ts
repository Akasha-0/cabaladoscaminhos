import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCommentary, getCommentaryByText, getCommentaryBySchool, getScholars, getScholarById } from '@/lib/sacred-texts/commentary-library';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SacredTextsQuerySchema = z.object({
  resource: z.enum(['commentary', 'scholars']).optional().default('commentary'),
  id: z.string().optional(),
  textId: z.string().optional(),
  school: z.enum(['rabbinic', 'patristic', 'sufi', 'vedic', 'zen']).optional(),
});
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parseResult = SacredTextsQuerySchema.safeParse({
      resource: searchParams.get('resource'),
      id: searchParams.get('id'),
      textId: searchParams.get('textId'),
      school: searchParams.get('school'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { resource, id, textId, school } = parseResult.data;
    if (resource === 'scholars') {
      if (id) {
        const scholar = getScholarById(id);
        if (!scholar) {
          return NextResponse.json({ error: 'Scholar not found' }, { status: 404 });
        }
        return NextResponse.json(scholar);
      }
      return NextResponse.json(getScholars());
    }
    // Default: commentary resource
    if (id) {
      const commentaries = getCommentaryByText(id);
      if (commentaries.length === 0) {
        return NextResponse.json({ error: 'Commentary not found' }, { status: 404 });
      }
      return NextResponse.json(commentaries);
    }
    if (textId) {
      return NextResponse.json(getCommentaryByText(textId));
    }
    if (school) {
      return NextResponse.json(getCommentaryBySchool(school));
    }
    return NextResponse.json(getCommentary());
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}