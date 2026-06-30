'use client';

// ============================================================================
// ReaderOnboarding — UI para reader iniciar onboarding Stripe Connect
// ============================================================================
// Wave 30. Mobile-first. Botão chama /api/payments/connect/onboard e
// redireciona para hosted onboarding da Stripe.
// ============================================================================

import { useState } from 'react';

interface ReaderOnboardingProps {
  readerId: string;
  initialStatus?: {
    onboarded: boolean;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
    requirements: {
      currentlyDue: string[];
      pastDue: string[];
      pendingVerification: string[];
    };
  };
}

const COUNTRY_OPTIONS: Array<{ code: string; label: string }> = [
  { code: 'BR', label: '🇧🇷 Brasil' },
  { code: 'US', label: '🇺🇸 Estados Unidos' },
  { code: 'PT', label: '🇵🇹 Portugal' },
  { code: 'ES', label: '🇪🇸 Espanha' },
  { code: 'MX', label: '🇲🇽 México' },
  { code: 'AR', label: '🇦🇷 Argentina' },
];

export function ReaderOnboarding({
  readerId,
  initialStatus,
}: ReaderOnboardingProps) {
  const [country, setCountry] = useState('BR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOnboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const origin = window.location.origin;
      const response = await fetch('/api/payments/connect/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country,
          returnUrl: `${origin}/dashboard/reader/onboarding/return`,
          refreshUrl: `${origin}/dashboard/reader/onboarding/refresh`,
        }),
      });
      const json = await response.json();
      if (!response.ok) {
        setError(
          json?.error?.message ?? `Erro ${response.status} ao criar conta`
        );
        setLoading(false);
        return;
      }
      const url = json?.data?.onboardingUrl as string | undefined;
      if (!url) {
        // Já onboarded
        window.location.reload();
        return;
      }
      window.location.href = url;
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  };

  const onboarded = initialStatus?.onboarded;
  const ready = onboarded && initialStatus?.chargesEnabled && initialStatus?.payoutsEnabled;

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <header className="mb-4">
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">
          Receba por suas leituras
        </h2>
        <p className="text-sm text-gray-600">
          Conecte sua conta Stripe para receber pagamentos de clientes do mundo todo.
        </p>
      </header>

      {ready && (
        <div
          role="status"
          aria-live="polite"
          className="p-4 mb-4 bg-green-50 border border-green-200 rounded-md"
        >
          <p className="text-green-800 font-medium">✓ Conta conectada e ativa</p>
          <p className="text-xs text-green-700 mt-1">
            Você já pode receber pagamentos. Os repasses são automáticos via Stripe.
          </p>
        </div>
      )}

      {onboarded && !ready && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-4 mb-4 bg-amber-50 border border-amber-200 rounded-md"
        >
          <p className="text-amber-800 font-medium">⚠️ Complete seu cadastro</p>
          {initialStatus?.requirements.currentlyDue.length > 0 && (
            <ul className="text-xs text-amber-700 mt-2 list-disc list-inside">
              {initialStatus.requirements.currentlyDue.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!onboarded && (
        <div className="mb-4">
          <label
            htmlFor="country"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            País da sua conta bancária
          </label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            disabled={loading}
            className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-md"
          >
            {COUNTRY_OPTIONS.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-gray-500">
            A Stripe pedirá documentos (CPF/CNPJ, RG, comprovante de endereço) e
            dados bancários. Tudo é criptografado e protegido pela Stripe.
          </p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md"
        >
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleOnboard}
        disabled={loading}
        aria-busy={loading}
        className="w-full min-h-[48px] px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-medium rounded-md transition-colors"
      >
        {loading
          ? 'Conectando…'
          : onboarded
          ? 'Continuar onboarding'
          : 'Conectar com Stripe'}
      </button>

      <details className="mt-4 text-xs text-gray-600">
        <summary className="cursor-pointer font-medium">
          Como funciona o repasse?
        </summary>
        <ul className="mt-2 space-y-1 list-disc list-inside">
          <li>Akasha retém 10% do valor como taxa da plataforma</li>
          <li>Você recebe o líquido direto na sua conta bancária</li>
          <li>Pagamentos ficam em escrow até a leitura ser confirmada</li>
          <li>Reembolso integral disponível em até 7 dias após a compra</li>
          <li>Repasses padrão Stripe: 2 dias úteis (BR) / 7 dias (US/EU)</li>
        </ul>
      </details>
    </div>
  );
}

export default ReaderOnboarding;