import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-05-27.dahlia',
});

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
}

export async function processPayment(
  amount: number,
  currency: string = 'brl',
  metadata?: Record<string, string>
): Promise<PaymentIntentResult> {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    automatic_payment_methods: { enabled: true },
    metadata,
  });

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  };
}

export async function confirmPayment(paymentIntentId: string): Promise<PaymentResult> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      return { success: true, paymentIntentId };
    }

    return {
      success: false,
      paymentIntentId,
      error: `Payment status: ${paymentIntent.status}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function cancelPayment(paymentIntentId: string): Promise<PaymentResult> {
  try {
    await stripe.paymentIntents.cancel(paymentIntentId);
    return { success: true, paymentIntentId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}