// ============================================================================
// GET /api/flags — Lista todas as flags + estado atual do usuário (Wave 20)
// ============================================================================
// Retorna o snapshot de todas as flags DO REGISTRY, já avaliadas para o
// usuário autenticado (ou anonymousId do cookie). O cliente usa essa
// resposta como cache via FlagsProvider/useFlag.
//
// Cache: private, maxAge=30s. Flags mudam raramente; evita martelar
// o storage em todo page load. Admin pode forçar refetch via header
// `x-cache: bypass`.
// ============================================================================

import { cookies } from 'next/headers';
import { ok, handleError } from '@/lib/community/api';
import { listFlags } from '@/lib/feature-flags/flags';
import { getFlag } from '@/lib/feature-flags/index';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId =
      cookieStore.get('userId')?.value ??
      cookieStore.get('anonymousId')?.value ??
      undefined;

    const url = new URL(request.url);
    const bypassCache = request.headers.get('x-cache') === 'bypass';

    const definitions = listFlags();
    const data: Record<string, unknown> = {};

    // Resolve em paralelo (storage já é cached no I/O)
    const resolved = await Promise.all(
      definitions.map((def) => getFlag(def.key, userId))
    );

    resolved.forEach((r) => {
      data[r.key] = {
        key: r.key,
        enabled: r.enabled,
        reason: r.reason,
      };
    });

    return ok(data, {
      cache: bypassCache
        ? { noStore: true }
        : { private: true, maxAge: 30 },
      meta: { count: Object.keys(data).length, userId: userId ?? 'anonymous' },
    });
  } catch (err) {
    return handleError(err);
  }
}
