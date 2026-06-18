import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';

export interface ChatRequestBody {
  message?: string;
  intent?: string;
}

export interface ChatResponse {
  message: string;
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<ChatResponse | { error: string }>> {
  const authResult = await requireAkashaApi(req);
  if (authResult instanceof NextResponse) return authResult;

  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.message || body.message.trim() === '') {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }

  if (body.intent !== undefined && !['mentor', 'practice', 'ritual'].includes(body.intent)) {
    return NextResponse.json({ error: 'Invalid intent value' }, { status: 400 });
  }

  return NextResponse.json({ message: 'Mentor response placeholder' });
}
