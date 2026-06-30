'use client';

// ============================================================================
// PaymentForm — Stripe Elements wrapper para checkout
// ============================================================================
// Wave 30. Mobile-first. Usa Stripe.js carregado dinamicamente (sem SSR).
//
// IMPORTANTE: este componente assume que o parent já chamou
// /api/payments/charge e recebeu {clientSecret, paymentId}.
// ============================================================================

import { useState, useEffect, useCallback } from 'react';

// Tipos locais (espelham @stripe/stripe-js; sem instalar SDK)
interface StripeElements {
  create: (type: 'payment') => StripeElement;
  getElement: (type: 'payment') => StripeElement;
}
interface StripeElement {
  mount: (selector: string) => void;
  unmount: () => void;
  on: (event: 'change', handler: (e: { error?: { message: string } }) => void) => void;
}
interface StripeInstance {
  elements: (opts: { clientSecret: string; appearance?: object }) => StripeElements;
  confirmPayment: (opts: {
    elements: StripeElements;
    confirmParams: { return_url: string };
    redirect?: 'if_required';
  }) => Promise<{ error?: { message: string }; paymentIntent?: { id: string; status: string } }>;
}

interface PaymentFormProps {
  clientSecret: string;
  paymentId: string;
  amount: number;
  currency: string;
  readerName: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (errorMessage: string) => void;
}

const STRIPE_JS_URL = 'https://js.stripe.com/v3/';

let stripePromise: Promise<StripeInstance | null> | null = null;

async function loadStripe(publishableKey: string): Promise<StripeInstance | null> {
  if (typeof window === 'undefined') return null;
  if (stripePromise) return stripePromise;

  stripePromise = new Promise(async (resolve) => {
    if (!document.querySelector(`script[src="${STRIPE_JS_URL}"]`)) {
      const script = document.createElement('script');
      script.src = STRIPE_JS_URL;
      script.async = true;
      document.head.appendChild(script);
      await new Promise<void>((r) => {
        script.addEventListener('load', () => r());
        script.addEventListener('error', () => r());
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (w.Stripe) {
      resolve(w.Stripe(publishableKey) as StripeInstance);
    } else {
      resolve(null);
    }
  });

  return stripePromise;
}

function formatAmount(amount: number, currency: string): string {
  // amount vem em smallest unit (centavos)
  const major = amount / 100;
  return new Intl.NumberFormat(currency === 'brl' ? 'pt-BR' : 'en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(major);
}

export function PaymentForm({
  clientSecret,
  paymentId,
  amount,
  currency,
  readerName,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const [stripe, setStripe] = useState<StripeInstance | null>(null);
  const [elements, setElements] = useState<StripeElements | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const initStripe = useCallback(async () => {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      setErrorMessage('Chave pública Stripe ausente (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)');
      return;
    }
    const s = await loadStripe(publishableKey);
    if (!s) {
      setErrorMessage('Não foi possível carregar Stripe.js');
      return;
    }
    setStripe(s);
    const e = s.elements({
      clientSecret,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#7c3aed', // Akasha purple
          colorBackground: '#ffffff',
          colorText: '#1f2937',
          borderRadius: '8px',
        },
      },
    });
    setElements(e);
    setReady(true);
  }, [clientSecret]);

  useEffect(() => {
    initStripe();
  }, [initStripe]);

  useEffect(() => {
    if (!elements || !ready) return;
    const paymentElement = elements.create('payment');
    paymentElement.mount('#stripe-payment-element');
    paymentElement.on('change', (e) => {
      setErrorMessage(e.error?.message ?? null);
    });
    return () => {
      paymentElement.unmount();
    };
  }, [elements, ready]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMessage(null);

    const returnUrl = `${window.location.origin}/marketplace/checkout/return?paymentId=${paymentId}`;

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: 'if_required',
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message ?? 'Erro desconhecido');
      onError(error.message ?? 'Erro desconhecido');
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    } else if (paymentIntent) {
      onSuccess(paymentIntent.id);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md"
      aria-label="Formulário de pagamento"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Pagar {readerName}</h2>
      <p className="text-3xl font-bold text-purple-700 mb-4">
        {formatAmount(amount, currency)}
      </p>
      <p className="text-xs text-gray-500 mb-4">
        O valor fica retido em segurança até a leitura ser confirmada. Você pode
        solicitar reembolso integral em até 7 dias.
      </p>

      <div id="stripe-payment-element" className="min-h-[200px] mb-4" />

      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md"
        >
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!ready || loading}
        aria-busy={loading}
        className="w-full min-h-[48px] px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-medium rounded-md transition-colors"
      >
        {loading ? 'Processando…' : `Pagar ${formatAmount(amount, currency)}`}
      </button>

      <p className="mt-4 text-xs text-gray-500 text-center">
        🔒 Pagamento seguro processado pela Stripe. Não armazenamos dados do cartão.
      </p>
    </form>
  );
}

export default PaymentForm;