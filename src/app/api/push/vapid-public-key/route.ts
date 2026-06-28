// ============================================================================
// VAPID PUBLIC KEY — GET /api/push/vapid-public-key
// ============================================================================
// Wave 21 (2026-06-28) — expõe a VAPID public key para o client.
// O client usa esta chave para fazer `pushManager.subscribe()` no browser
// e gerar o PushSubscription que vai para POST /api/push/subscribe.
//
// A chave privada NUNCA é exposta. Esta rota é pública (não exige auth)
// porque a chave pública é, por design, pública — qualquer pessoa pode
// ver a chave pública VAPID de um serviço.
//
// Se VAPID não estiver configurada (dev local), retornamos 503 com mensagem
// clara. Isso permite que a UI detecte e desabilite o opt-in de push com
// mensagem amigável.
//
// Caching: a VAPID key é estável por deployment, então cacheamos por 1h
// em CDN público (s-maxage=3600). Em desenvolvimento, no-store.
// ============================================================================

import { ok, fail, handleError, ErrorCode } from '@/lib/community/api';
import { getVapidPublicKey, isVapidConfigured } from '@/lib/notifications';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    if (!isVapidConfigured()) {
      return fail(
        503,
        ErrorCode.INTERNAL_ERROR,
        'Push notifications não configuradas (VAPID ausente). ' +
          'Defina VAPID_PUBLIC_KEY e VAPID_PRIVATE_KEY no servidor.'
      );
    }

    const publicKey = getVapidPublicKey();
    if (!publicKey) {
      return fail(
        503,
        ErrorCode.INTERNAL_ERROR,
        'VAPID public key não encontrada no servidor.'
      );
    }

    return ok(
      {
        publicKey,
        // Campo utilitário para a UI saber que está disponível
        available: true,
      },
      {
        // Cache 1h em CDN público. A VAPID key é estável por deployment
        // e é por design pública (não-identificável).
        cache: { sMaxage: 3600, staleWhileRevalidate: 86400 },
        meta: { length: publicKey.length },
      }
    );
  } catch (err) {
    return handleError(err);
  }
}