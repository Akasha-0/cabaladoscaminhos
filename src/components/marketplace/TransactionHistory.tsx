'use client';

// ============================================================================
// TransactionHistory — Lista de transações do reader
// ============================================================================
// Wave 30. Mobile-first. Mostra payments + payouts + totais agregados.
// ============================================================================

import { useEffect, useState } from 'react';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  netAmount: number;
  platformFee: number;
  status: string;
  serviceType: string;
  createdAt: string;
  succeededAt: string | null;
}

interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: string;
  arrivalDate: string;
  method: string;
  destination: string;
}

interface Totals {
  grossAmount: number;
  platformFees: number;
  netEarnings: number;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'bg-gray-100 text-gray-700' },
  PROCESSING: { label: 'Processando', color: 'bg-blue-100 text-blue-700' },
  SUCCEEDED: { label: 'Pago (em escrow)', color: 'bg-amber-100 text-amber-700' },
  RELEASED: { label: 'Liberado', color: 'bg-green-100 text-green-700' },
  REFUNDED: { label: 'Reembolsado', color: 'bg-red-100 text-red-700' },
  DISPUTED: { label: 'Em disputa', color: 'bg-orange-100 text-orange-700' },
  FAILED: { label: 'Falhou', color: 'bg-red-100 text-red-700' },
  CANCELED: { label: 'Cancelado', color: 'bg-gray-100 text-gray-700' },
};

function formatAmount(amount: number, currency: string): string {
  const major = amount / 100;
  return new Intl.NumberFormat(currency === 'brl' ? 'pt-BR' : 'en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(major);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/payments/transactions');
        if (!res.ok) {
          setError(`Erro ${res.status} ao carregar transações`);
          setLoading(false);
          return;
        }
        const json = await res.json();
        if (cancelled) return;
        setTransactions(json?.data?.transactions ?? []);
        setPayouts(json?.data?.payouts ?? []);
        setTotals(json?.data?.totals ?? null);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="p-6 text-gray-600">
        Carregando transações…
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="p-4 text-red-700 bg-red-50 border border-red-200 rounded-md"
      >
        {error}
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        Minhas transações
      </h2>

      {totals && (
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="p-3 bg-purple-50 rounded-md">
            <p className="text-xs text-purple-700">Bruto</p>
            <p className="text-lg font-bold text-purple-900">
              {formatAmount(totals.grossAmount, 'brl')}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-md">
            <p className="text-xs text-gray-700">Taxas Akasha</p>
            <p className="text-lg font-bold text-gray-900">
              −{formatAmount(totals.platformFees, 'brl')}
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded-md">
            <p className="text-xs text-green-700">Líquido</p>
            <p className="text-lg font-bold text-green-900">
              {formatAmount(totals.netEarnings, 'brl')}
            </p>
          </div>
        </div>
      )}

      <section aria-labelledby="transactions-heading">
        <h3
          id="transactions-heading"
          className="text-lg font-medium text-gray-900 mb-2"
        >
          Pagamentos ({transactions.length})
        </h3>
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            Nenhuma transação ainda.
          </p>
        ) : (
          <ul role="list" className="space-y-2">
            {transactions.map((t) => {
              const status = STATUS_LABELS[t.status] ?? {
                label: t.status,
                color: 'bg-gray-100 text-gray-700',
              };
              return (
                <li
                  key={t.id}
                  className="p-3 bg-white border border-gray-200 rounded-md"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatAmount(t.amount, t.currency)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t.serviceType} · {formatDate(t.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Líquido: {formatAmount(t.netAmount, t.currency)} · Taxa:{' '}
                    {formatAmount(t.platformFee, t.currency)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {payouts.length > 0 && (
        <section aria-labelledby="payouts-heading" className="mt-6">
          <h3
            id="payouts-heading"
            className="text-lg font-medium text-gray-900 mb-2"
          >
            Repasses da Stripe ({payouts.length})
          </h3>
          <ul role="list" className="space-y-2">
            {payouts.map((p) => (
              <li
                key={p.id}
                className="p-3 bg-white border border-gray-200 rounded-md"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatAmount(p.amount, p.currency)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {p.method} · {p.destination} · chega em{' '}
                      {formatDate(p.arrivalDate)}
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {p.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default TransactionHistory;