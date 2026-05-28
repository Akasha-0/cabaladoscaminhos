/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server';
import { getCommentary, getCommentaryByText, getCommentaryBySchool, getScholars, getScholarById } from '@/lib/sacred-texts/commentary-library';

/**
 * GET /api/sacred/texts
 * Query params:
 *   - resource: 'commentary' | 'scholars' (default: commentary)
 *   - id: specific scholar ID (when resource=scholars)
 *   - textId: filter commentaries by text ID
 *   - school: filter commentaries by school (rabbinic, patristic, sufi, vedic, zen)
 */
interface QueryParams {
  resource?: string;
  id?: string;
  textId?: string;
  school?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const resource = searchParams.get('resource') as QueryParams['resource'] || 'commentary';
  const id = searchParams.get('id') || undefined;
  const textId = searchParams.get('textId') || undefined;
  const school = searchParams.get('school') || undefined;

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
}