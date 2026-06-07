'use client';

import { useState } from 'react';

type Subscription = {
  plan: 'FREEMIUM' | 'AKASHA_PRO';
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED';
  currentPeriodEnd?: string | null;
};

type Props = {
  user: { name: string; email: string };
  balance: number;
  subscription: Subscription;
  subscriptionError?: boolean;
  checkoutStatus?: string;
};

const glassCard: React.CSSProperties = {
  background: 'rgba(124, 58, 237, 0.05)',
  border: '1px solid rgba(124, 58, 237, 0.2)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
};

const CREDIT_PACKS = [
  { type: 'credits_10', label: '10 Créditos', price: 'R$9,90', description: '10 consultas simples' },
  { type: 'credits_30', label: '30 Créditos', price: 'R$24,90', description: '30 consultas simples', highlight: true },
  { type: 'credits_60', label: '60 Créditos', price: 'R$44,90', description: '60 consultas simples' },
];

export default function ContaClient({ user, balance, subscription, subscriptionError, checkoutStatus }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const isPro = subscription.plan === 'AKASHA_PRO' && subscription.status === 'ACTIVE';

  async function handleCheckout(type: string) {
    setError('');
    setLoading(type);
    try {
      const res = await fetch('/api/akasha/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erro ao iniciar checkout');
      if (data.url) window.location.href = data.url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro inesperado');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div
      className="min-h-[calc(100vh-56px)] px-4 py-12"
      style={{ background: '#030711' }}
    >
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        {checkoutStatus === 'success' && (
          <div
            className="px-4 py-3 rounded-xl text-sm"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34D399' }}
          >
            Pagamento confirmado! Seus créditos foram adicionados.
          </div>
        )}
        {checkoutStatus === 'cancel' && (
          <div
            className="px-4 py-3 rounded-xl text-sm"
            style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#f87171' }}
          >
            Checkout cancelado. Nenhuma cobrança foi realizada.
          </div>
        )}
        {error && (
          <div
            className="px-4 py-3 rounded-xl text-sm"
            style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)', color: '#f87171' }}
          >
            {error}
          </div>
        )}

        {subscriptionError && (
          <div
            className="px-4 py-3 rounded-xl text-sm"
            style={{
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.3)',
              color: '#F59E0B',
            }}
          >
            Não foi possível carregar os dados da sua assinatura. O restante da conta continua disponível.
          </div>
        )}

        {/* Profile */}
        <div style={glassCard} className="p-6">
          <h1
            className="text-xl font-semibold mb-1"
            style={{ fontFamily: 'var(--font-cinzel), serif', color: '#E2E8F0' }}
          >
            {user.name}
          </h1>
          <p className="text-sm" style={{ color: 'rgba(226,232,240,0.5)' }}>{user.email}</p>
        </div>

        {/* Plan + Credits */}
        <div className="grid grid-cols-2 gap-4">
          <div style={glassCard} className="p-5 flex flex-col gap-2">
            <p className="text-xs uppercase tracking-widest" style={{ color: 'rgba(226,232,240,0.4)' }}>Plano</p>
            <div className="flex items-center gap-2">
              <span
                className="text-lg font-semibold"
                style={{ color: isPro ? '#A78BFA' : '#E2E8F0' }}
              >
                {isPro ? 'Akasha Pro' : 'Freemium'}
              </span>
              {isPro && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(124,58,237,0.25)', color: '#A78BFA' }}
                >
                  Ativo
                </span>
              )}
            </div>
            {isPro && subscription.currentPeriodEnd && (
              <p className="text-xs" style={{ color: 'rgba(226,232,240,0.4)' }}>
                Renova em {new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>

          <div style={glassCard} className="p-5 flex flex-col gap-2">
            <p className="text-xs uppercase tracking-widest" style={{ color: 'rgba(226,232,240,0.4)' }}>Créditos</p>
            <span
              className="text-3xl font-bold"
              style={{ color: '#F59E0B', fontFamily: 'var(--font-cinzel), serif' }}
            >
              {balance}
            </span>
            <p className="text-xs" style={{ color: 'rgba(226,232,240,0.4)' }}>
              1 crédito = 1 consulta simples · 3 = complexa
            </p>
          </div>
        </div>

        {/* Upgrade to Pro */}
        {!isPro && (
          <div
            style={{
              ...glassCard,
              border: '1px solid rgba(124,58,237,0.4)',
              background: 'rgba(124,58,237,0.08)',
            }}
            className="p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold mb-1" style={{ color: '#A78BFA' }}>
                  Akasha Pro
                </h2>
                <p className="text-sm mb-1" style={{ color: 'rgba(226,232,240,0.65)' }}>
                  R$39,90/mês
                </p>
                <ul className="text-sm flex flex-col gap-1 mt-2" style={{ color: 'rgba(226,232,240,0.55)' }}>
                  <li>✦ Dashboard Diário ilimitado</li>
                  <li>✦ 30 créditos/mês para o Oráculo</li>
                  <li>✦ Cancele quando quiser</li>
                </ul>
              </div>
              <button
                onClick={() => handleCheckout('pro')}
                disabled={loading === 'pro'}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap disabled:opacity-50"
                style={{ background: '#7C3AED', color: '#fff' }}
              >
                {loading === 'pro' ? 'Aguarde...' : 'Assinar'}
              </button>
            </div>
          </div>
        )}

        {/* Manifesto one-time */}
        <div style={glassCard} className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold mb-1" style={{ color: '#F59E0B' }}>
                Manifesto Akáshico
              </h2>
              <p className="text-sm" style={{ color: 'rgba(226,232,240,0.65)' }}>
                R$29,90 · pagamento único
              </p>
              <p className="text-xs mt-1" style={{ color: 'rgba(226,232,240,0.4)' }}>
                PDF dos seus 4 pilares + 30 dias de Dashboard Diário
              </p>
            </div>
            <button
              onClick={() => handleCheckout('manifesto')}
              disabled={loading === 'manifesto'}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap disabled:opacity-50"
              style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', color: '#F59E0B' }}
            >
              {loading === 'manifesto' ? 'Aguarde...' : 'Comprar'}
            </button>
          </div>
        </div>

        {/* Credit packs */}
        <div>
          <h2
            className="text-sm font-medium mb-3 uppercase tracking-widest"
            style={{ color: 'rgba(226,232,240,0.4)' }}
          >
            Pacotes de Créditos
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {CREDIT_PACKS.map((pack) => (
              <button
                key={pack.type}
                onClick={() => handleCheckout(pack.type)}
                disabled={!!loading}
                className="rounded-xl p-4 text-left transition-colors disabled:opacity-50"
                style={{
                  background: pack.highlight ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.05)',
                  border: pack.highlight ? '1px solid rgba(124,58,237,0.4)' : '1px solid rgba(124,58,237,0.15)',
                }}
              >
                <p className="text-base font-bold mb-0.5" style={{ color: '#E2E8F0' }}>
                  {pack.label}
                </p>
                <p className="text-sm font-semibold mb-1" style={{ color: '#A78BFA' }}>
                  {pack.price}
                </p>
                <p className="text-xs" style={{ color: 'rgba(226,232,240,0.45)' }}>
                  {pack.description}
                </p>
                {loading === pack.type && (
                  <p className="text-xs mt-1" style={{ color: '#A78BFA' }}>Aguarde...</p>
                )}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
