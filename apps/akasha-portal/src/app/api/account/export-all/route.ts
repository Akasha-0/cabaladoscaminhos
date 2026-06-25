/**
 * GET /api/account/export-all — Wave 19.2 (LGPD Art. 18 §IV — portabilidade)
 *
 * Retorna um `application/gzip` (tar.gz) com TUDO do usuário autenticado:
 *   - profile.json      (identidade, dados de nascimento, subscription)
 *   - mandala.json      (BirthChart + cycle snapshots + area history)
 *   - manifestos.json   (manifesto pessoal + credit entries)
 *   - diario.json       (daily readings + rituais + exercises + notifications)
 *   - chat_history.jsonl (consultations + chat messages, NDJSON)
 *   - feedback.json     (ritual completions + conexões third-party)
 *   - audit_trail.json  (LGPD Art. 37 — histórico de ações do próprio user)
 *   - README.txt        (metadata + instruções)
 *
 * LGPD:
 *   - Art. 18 §IV — portabilidade em formato estruturado (tar.gz + JSON)
 *   - Art. 37 — direito de saber o histórico (audit_trail.json)
 *   - Campos sensíveis (passwordHash, stripeCustomerId, push tokens) NÃO
 *     aparecem — ver `buildAllExport` no helper.
 *
 * Diferencial vs Wave 13.4:
 *   - Wave 13.4 = 3 endpoints específicos (map JSON, manifesto PDF, usage CSV)
 *   - Wave 19.2 = 1 endpoint consolidado com TUDO
 *
 * Streaming: usa `ReadableStream` direto para evitar materializar o tar.gz
 * em memória (limite Vercel Functions: 4.5MB response body max para
 * streaming).
 *
 * Auth: requireAkashaApi (cookie akasha_session).
 */

import { NextResponse, type NextRequest } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { auditLog, hashIpForAudit, extractClientIp } from '@/lib/infrastructure/audit-log';
import {
  buildAllExport,
  buildExportFilename,
  EXPORT_ALL_VERSION,
} from '@/lib/application/lgpd/export-all';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // 1. Auth
  const auth = await requireAkashaApi(request);
  if (auth instanceof NextResponse) return auth;

  const ipHash = hashIpForAudit(extractClientIp(request.headers));
  const requestId = request.headers.get('x-request-id') ?? undefined;

  // 2. Build export (stream)
  let result;
  try {
    result = await buildAllExport({ auth, ipHash, requestId });
  } catch (err) {
    auditLog({
      action: 'export_all_failed',
      userId: auth.id,
      ipHash,
      requestId,
      metadata: {
        reason: 'build_threw',
        error: err instanceof Error ? err.message : String(err),
      },
    });
    return NextResponse.json(
      {
        error:
          'Falha ao gerar exportação. Tente novamente ou contate suporte.',
        code: 'export_failed',
      },
      { status: 500 },
    );
  }

  // 3. Retorna streaming response
  const filename = buildExportFilename(auth.id);

  return new Response(result.stream, {
    status: 200,
    headers: {
      'Content-Type': 'application/gzip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      // Hint para cliente saber que é tar.gz
      'X-Content-Filename': filename,
      // Versionamento do schema
      'X-Export-Version': EXPORT_ALL_VERSION,
      // Cache: nunca — export é point-in-time
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      // LGPD: tamanho aproximado (best-effort)
      'X-PII-Bytes': String(result.piiBytesExported),
    },
  });
}
