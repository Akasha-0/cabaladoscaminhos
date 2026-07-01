// ============================================================================
// GET /api/billing/invoices — Lista invoices do customer
// ============================================================================
// Wave 37 (2026-07-01). User pode baixar invoices diretamente do Stripe
// (PCI-friendly; nós só listamos URLs).
//
// OUTPUT: InvoiceDetails[]
// ============================================================================

import { NextRequest } from 'next/server';
import { ok, fail, ErrorCode } from '@/lib/community/api';
import { listInvoices } from '@/lib/billing/stripe-subscriptions';
import { getBillingPrisma } from '@/lib/billing/prisma-adapter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return fail(401, ErrorCode.UNAUTHORIZED, 'Authentication required');
    }

    const prisma = getBillingPrisma();
    const subscription = await prisma.subscription.findUnique({ where: { userId } });

    if (!subscription?.stripeCustomerId) {
      return ok({ invoices: [], count: 0 });
    }

    const invoices = await listInvoices(subscription.stripeCustomerId, { limit: 24 });

    return ok({
      invoices: invoices.map((inv) => ({
        id: inv.id,
        number: inv.number,
        amountDue: inv.amountDue,
        amountPaid: inv.amountPaid,
        currency: inv.currency,
        status: inv.status,
        hostedInvoiceUrl: inv.hostedInvoiceUrl,
        invoicePdf: inv.invoicePdf,
        periodStart: inv.periodStart,
        periodEnd: inv.periodEnd,
        created: inv.created,
      })),
      count: invoices.length,
    });
  } catch (err) {
    console.error('[billing/invoices] erro:', (err as Error).message);
    return fail(500, ErrorCode.INTERNAL_ERROR, 'Erro listando invoices');
  }
}