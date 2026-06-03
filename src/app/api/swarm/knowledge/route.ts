import { requireOperator } from '@/lib/auth/operator-session';
import { NextRequest, NextResponse } from 'next/server';
import { getKnowledgeBase } from '@/lib/swarm';
import type { KnowledgeDomain } from '@/lib/swarm';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  // Auth guard
  const authResult = await requireOperator(req);
  if (authResult instanceof NextResponse) return authResult;
  try {
    const kb = getKnowledgeBase();
    await kb.load();

    const url = new URL(req.url);
    const domain = url.searchParams.get('domain') as KnowledgeDomain | null;
    const key = url.searchParams.get('key');

    if (domain) {
      const entries = kb.query(domain, key || undefined);
      return NextResponse.json({ entries, total: entries.length });
    }

    const stats = kb.stats();
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('[API /knowledge] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao acessar knowledge base', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Auth guard
  const authResult2 = await requireOperator(req);
  if (authResult2 instanceof NextResponse) return authResult2;
  try {
    const body = await req.json();
    const kb = getKnowledgeBase();
    await kb.load();
    const entry = await kb.add(body);
    await kb.persist();
    return NextResponse.json({ entry });
  } catch (error) {
    console.error('[API /knowledge POST] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar entry', details: String(error) },
      { status: 500 }
    );
  }
}
