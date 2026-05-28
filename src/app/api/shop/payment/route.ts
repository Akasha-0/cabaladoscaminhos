import { NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/error-handling';

export const POST = withErrorHandler(async (request: Request) => {
  const body = await request.json();
  const { amount, currency, items, customerEmail } = body;

  if (!amount || !currency || !items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Missing required fields: amount, currency, items' }, { status: 400 });
  }

  if (!customerEmail) {
    return NextResponse.json({ error: 'customerEmail is required' }, { status: 400 });
  }

  const paymentIntent = {
    id: `pi_${Date.now()}`,
    amount,
    currency,
    items,
    customerEmail,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json({ success: true, paymentIntent });
});