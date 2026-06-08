import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/infrastructure/prisma';
import { requireAkashaApi } from '@/lib/auth/akasha-guard';
import { syncGrimoire } from '@/lib/infrastructure/grimoire-sync';

export const dynamic = 'force-dynamic';

/**
 * Valida assinatura HMAC-SHA256 do GitHub (`X-Hub-Signature-256`).
 * Retorna `true` se a assinatura bater com o body + `GITHUB_WEBHOOK_SECRET`.
 */
function verifyGitHubHmac(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;
  const expected =
    'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  // timingSafeEqual para evitar timing attacks
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signatureHeader, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  // 1. Tenta autenticação: HMAC GitHub > Bearer webhook > ADMIN logado
  const authHeader = request.headers.get('authorization');
  const syncSecret = process.env.GRIMOIRE_SYNC_SECRET;
  const signatureHeader = request.headers.get('x-hub-signature-256');

  let isAuthorized = false;

  // a) HMAC-SHA256 (GitHub)
  if (signatureHeader) {
    const rawBody = await request.text();
    if (verifyGitHubHmac(rawBody, signatureHeader)) {
      isAuthorized = true;
    }
    // Continua para checar Bearer/ADMIN mesmo se HMAC falhou (defesa em profundidade)
  }

  // b) Bearer token de webhook
  if (!isAuthorized && syncSecret && authHeader === `Bearer ${syncSecret}`) {
    isAuthorized = true;
  }

  // c) ADMIN logado
  if (!isAuthorized) {
    const auth = await requireAkashaApi(request);
    if (!(auth instanceof NextResponse)) {
      const user = await prisma.user.findUnique({
        where: { id: auth.id },
        select: { role: true },
      });
      if (user?.role === 'ADMIN') isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Não autorizado. Requer HMAC-SHA256, Bearer token de webhook, ou login ADMIN.' },
      { status: 401 }
    );
  }

  // 2. Perform synchronization
  try {
    const result = await syncGrimoire();
    return NextResponse.json({
      message: 'Sincronização concluída.',
      ...result,
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
