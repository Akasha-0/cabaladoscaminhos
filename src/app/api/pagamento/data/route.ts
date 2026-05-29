// ============================================================
// PAGAMENTO DATA API - Cabala Dos Caminhos
// ============================================================
// GET endpoints for pagamento (payment) data access
// - Retrieve payment methods
// - Get payment status
// - Get transaction history
// - Get subscription plans
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// GET /api/pagamento/data - Get pagamento data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const method = searchParams.get('method');

    // Return specific pagamento by ID
    if (id) {
      // Simulate returning a specific payment record
      const paymentData = {
        id,
        status: 'completed',
        amount: 99.90,
        currency: 'BRL',
        method: 'credit_card',
        createdAt: new Date().toISOString(),
        transactionId: `txn_${id}`,
      };
      return NextResponse.json({ success: true, data: paymentData });
    }

    // Return specific type of pagamento data
    if (type) {
      switch (type) {
        case 'methods':
          return NextResponse.json({
            success: true,
            data: {
              methods: ['credit_card', 'pix', 'boleto', 'paypal'],
              defaultMethod: 'credit_card',
            },
          });
        case 'subscriptions':
          return NextResponse.json({
            success: true,
            data: {
              plans: [
                { id: 'basic', name: 'Básico', price: 29.90, interval: 'monthly' },
                { id: 'premium', name: 'Premium', price: 59.90, interval: 'monthly' },
                { id: 'yearly', name: 'Anual', price: 499.90, interval: 'yearly' },
              ],
            },
          });
        case 'transactions':
          return NextResponse.json({
            success: true,
            data: {
              transactions: [
                { id: 'txn_001', amount: 99.90, status: 'completed', date: '2026-05-01' },
                { id: 'txn_002', amount: 59.90, status: 'pending', date: '2026-05-15' },
                { id: 'txn_003', amount: 29.90, status: 'failed', date: '2026-05-20' },
              ],
            },
          });
        default:
          return NextResponse.json({ success: false, error: 'Unknown type' }, { status: 400 });
      }
    }

    // Filter by status
    if (status) {
      return NextResponse.json({
        success: true,
        data: {
          payments: [],
          filteredBy: 'status',
          value: status,
        },
      });
    }

    // Filter by payment method
    if (method) {
      return NextResponse.json({
        success: true,
        data: {
          payments: [],
          filteredBy: 'method',
          value: method,
        },
      });
    }

    // Default: return all pagamento data
    return NextResponse.json({
      success: true,
      data: {
        methods: ['credit_card', 'pix', 'boleto', 'paypal'],
        plans: [
          { id: 'basic', name: 'Básico', price: 29.90, interval: 'monthly' },
          { id: 'premium', name: 'Premium', price: 59.90, interval: 'monthly' },
          { id: 'yearly', name: 'Anual', price: 499.90, interval: 'yearly' },
        ],
        currencies: ['BRL'],
      },
    });
  } catch (_error) {
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}