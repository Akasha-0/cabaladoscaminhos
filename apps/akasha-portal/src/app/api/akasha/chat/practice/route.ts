import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';

export interface SuggestedPractice {
  name: string;
  description: string;
}

export interface PracticeResponse {
  suggestedPractices: SuggestedPractice[];
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<PracticeResponse | { error: string }>> {
  const authResult = await requireAkashaApi(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  return NextResponse.json({ suggestedPractices: [] });
}
