// ============================================================================
// GET /api/payments/transactions — Histórico de transações do reader
// ============================================================================
// Wave 30. Lista payments + payouts do reader logado (com paginação simples).
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, handleError, ErrorCode } from '@/lib/community/api';
import { requireViewer } from '@/lib/community/auth';
import {
  getReaderTransactions,
  getReaderPayouts,
} from '@/lib/payments/marketplace-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    let viewer;
    try {
      viewer = await requireViewer();
    } catch {
      return fail(401, ErrorCode.UNAUTHORIZED, 'Você precisa estar logado');
    }

    const sp = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(sp.get('limit') ?? '20', 10), 100);
    const status = sp.get('status') ?? undefined;

    const [transactions, payouts] = await Promise.all([
      getReaderTransactions(viewer.id, { limit, status }),
      getReaderPayouts(viewer.id, { limit: 10 }),
    ]);

    // Calcula totais agregados
    const totals = transactions.reduce(
      (acc, t) => {
        if (t.status === 'SUCCEEDED' || t.status === 'RELEASED') {
          acc.grossAmount += t.amount;
          acc.platformFees += t.platformFee;
          acc.netEarnings += t.netAmount;
        }
        return acc;
      },
      { grossAmount: 0, platformFees: 0, netEarnings: 0 }
    );

    return ok({
      transactions,
      payouts,
      totals,
    });
  } catch (err) {
    return handleError(err);
  }
}