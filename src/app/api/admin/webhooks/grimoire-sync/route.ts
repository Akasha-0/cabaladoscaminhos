import { NextRequest, NextResponse } from 'next/server';
import { requireOperatorApi } from '@/lib/auth/operator-guard';
import { syncGrimoire } from '@/lib/grimoire/sync';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // 1. Check for token-based webhook auth first
  const authHeader = request.headers.get('authorization');
  const syncSecret = process.env.GRIMOIRE_SYNC_SECRET;
  
  let isAuthorized = false;
  
  if (syncSecret && authHeader === `Bearer ${syncSecret}`) {
    isAuthorized = true;
  } else {
    // Fallback to operator/admin session auth
    const guard = await requireOperatorApi(request);
    if (!(guard instanceof NextResponse)) {
      const operator = guard;
      if (operator.role === 'ADMIN') {
        isAuthorized = true;
      }
    }
  }
  
  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Não autorizado. Requer login de ADMIN ou Bearer token de webhook válido.' },
      { status: 401 }
    );
  }
  
  // 2. Perform synchronization
  try {
    const result = await syncGrimoire();
    return NextResponse.json({
      message: 'Sincronização concluída.',
      ...result
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Falha durante a sincronização', details: (error as Error).message },
      { status: 500 }
    );
  }
}
export async function GET() {
  return NextResponse.json(
    { error: 'Método não permitido. Utilize POST para sincronizar o grimório.' },
    { status: 405 }
  );
}
