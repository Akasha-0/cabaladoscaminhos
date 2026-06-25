'use client';

import { useState } from 'react';
import { CityAutocomplete } from '@/components/ui/city-autocomplete';
import type { CityResult } from '@/components/ui/city-autocomplete';
import { subscribeToPush, unsubscribeFromPush } from '@/lib/application/push/subscribe';

type Subscription = {
  plan: 'FREEMIUM' | 'AKASHA_PRO';
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED';
  currentPeriodEnd?: string | null;
};

type Props = {
  user: {
    name: string;
    email: string;
    birthDate?: string | null; // ISO date string 'YYYY-MM-DD'
    birthTime?: string | null; // 'HH:mm'
    birthCity?: string | null;
  };
  balance: number;
  subscription: Subscription;
  subscriptionError?: boolean;
  checkoutStatus?: string;
  pushEnabled?: boolean;
};

const glassCard: React.CSSProperties = {
  background: 'rgba(124, 58, 237, 0.05)',
  border: '1px solid rgba(124, 58, 237, 0.2)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
};

const CREDIT_PACKS = [
  {
    type: 'credits_10',
    label: '10 Créditos',
    price: 'R$9,90',
    description: '10 consultas simples',
  },
  {
    type: 'credits_30',
    label: '30 Créditos',
    price: 'R$24,90',
    description: '30 consultas simples',
    highlight: true,
  },
  {
    type: 'credits_60',
    label: '60 Créditos',
    price: 'R$44,90',
    description: '60 consultas simples',
  },
];

export default function ContaClient({
  user,
  balance,
  subscription,
  subscriptionError,
  checkoutStatus,
  pushEnabled = false,
}: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [pushOn, setPushOn] = useState(pushEnabled);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushMsg, setPushMsg] = useState('');

  // ── Profile editing ────────────────────────────────────────────────────────
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user.name ?? '',
    birthDate: user.birthDate ?? '',
    birthTime: user.birthTime ?? '',
    birthCity: user.birthCity ?? '',
  });
  const [profileCoords, setProfileCoords] = useState<{
    latitude: number;
    longitude: number;
    timezone?: string;
  } | null>(null);
  const [profileSaveLoading, setProfileSaveLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [chartLoading, setChartLoading] = useState(false);

  function toDateStr(d: Date | string | null | undefined): string {
    if (!d) return '';
    if (d instanceof Date) return d.toISOString().split('T')[0];
    return String(d).split('T')[0];
  }

  function birthDataChanged(orig: Props['user'], form: typeof profileForm): boolean {
    return (
      toDateStr(orig.birthDate) !== form.birthDate ||
      (orig.birthCity ?? '') !== form.birthCity ||
      (orig.birthTime ?? '') !== form.birthTime ||
      orig.name !== form.name
    );
  }

  async function handleProfileSave() {
    if (!profileForm.name.trim()) {
      setProfileError('Nome é obrigatório.');
      return;
    }
    setProfileSaveLoading(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      const body: Record<string, string | undefined> = {
        name: profileForm.name.trim(),
        birthDate: profileForm.birthDate || undefined,
        birthTime: profileForm.birthTime || undefined,
        birthCity: profileForm.birthCity || undefined,
        birthTimezone: profileCoords?.timezone,
      };
      const res = await fetch('/api/akasha/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { error?: string }).error ?? 'Erro ao salvar perfil.');
      }
      // Trigger chart recalculation if birth data changed
      if (birthDataChanged(user, profileForm)) {
        setChartLoading(true);
        try {
          await fetch('/api/akasha/chart', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({}),
          });
        } catch {
          // non-fatal — chart may already be up to date
        } finally {
          setChartLoading(false);
        }
      }
      setProfileSuccess('Perfil atualizado!');
      setEditingProfile(false);
      setTimeout(() => window.location.reload(), 600);
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : 'Erro ao salvar.');
    } finally {
      setProfileSaveLoading(false);
    }
  }

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

  async function handlePushToggle() {
    setPushMsg('');
    setPushBusy(true);
    try {
      if (pushOn) {
        // opt-out
        const sub = await unsubscribeFromPush();
        const res = await fetch('/api/akasha/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        if (!res.ok) throw new Error('Falha ao desativar notificações');
        setPushOn(false);
        setPushMsg(
          sub
            ? 'Notificações desativadas.'
            : 'Notificações desativadas (já não havia subscrição ativa).'
        );
      } else {
        // opt-in
        const subscription = await subscribeToPush();
        if (!subscription) {
          setPushMsg('Seu navegador bloqueou as notificações ou não há suporte.');
          return;
        }
        const res = await fetch('/api/akasha/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: subscription.toJSON() }),
        });
        if (!res.ok) throw new Error('Falha ao ativar notificações');
        setPushOn(true);
        setPushMsg(
          'Notificações ativadas. Você receberá um aviso por dia quando o ritual estiver pronto.'
        );
      }
    } catch (e: unknown) {
      setPushMsg(e instanceof Error ? e.message : 'Erro ao alterar notificações');
    } finally {
      setPushBusy(false);
    }
  }

  {
    chartLoading && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-[#1a1b2e] border border-[#7C5CFF]/40 rounded-2xl p-8 text-center max-w-sm">
          <div className="animate-spin w-8 h-8 border-2 border-[#7C5CFF] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white font-semibold">Recalculando seu mapa…</p>
          <p className="text-white/50 text-sm mt-1">Aguarde um momento</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-[calc(100vh-56px)] px-4 py-12" style={{ background: '#030711' }}>
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        {checkoutStatus === 'success' && (
          <div
            className="px-4 py-3 rounded-xl text-sm"
            style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.3)',
              color: '#34D399',
            }}
          >
            Pagamento confirmado! Seus créditos foram adicionados.
          </div>
        )}
        {checkoutStatus === 'cancel' && (
          <div
            className="px-4 py-3 rounded-xl text-sm"
            style={{
              background: 'rgba(244,63,94,0.1)',
              border: '1px solid rgba(244,63,94,0.3)',
              color: '#f87171',
            }}
          >
            Checkout cancelado. Nenhuma cobrança foi realizada.
          </div>
        )}
        {error && (
          <div
            className="px-4 py-3 rounded-xl text-sm"
            style={{
              background: 'rgba(244,63,94,0.1)',
              border: '1px solid rgba(244,63,94,0.3)',
              color: '#f87171',
            }}
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
            Não foi possível carregar os dados da sua assinatura. O restante da conta continua
            disponível.
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
          <p className="text-sm" style={{ color: 'rgba(226,232,240,0.5)' }}>
            {user.email}
          </p>
        </div>

        {/* Birth Data Edit */}
        <div style={glassCard} className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold" style={{ color: '#E2E8F0' }}>
              Dados do Mapa
            </h2>
            {!editingProfile && (
              <button
                onClick={() => {
                  setProfileForm({
                    name: user.name ?? '',
                    birthDate: user.birthDate ?? '',
                    birthTime: user.birthTime ?? '',
                    birthCity: user.birthCity ?? '',
                  });
                  setProfileCoords(null);
                  setProfileError('');
                  setProfileSuccess('');
                  setEditingProfile(true);
                }}
                className="text-xs text-[#7C5CFF] hover:underline"
              >
                Editar
              </button>
            )}
          </div>

          {!editingProfile ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'rgba(226,232,240,0.5)' }}>Nascimento</span>
                <span style={{ color: '#E2E8F0' }}>
                  {user.birthDate
                    ? new Date(user.birthDate + 'T00:00:00').toLocaleDateString('pt-BR')
                    : '—'}
                  {user.birthTime ? ` às ${user.birthTime}` : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'rgba(226,232,240,0.5)' }}>Cidade</span>
                <span style={{ color: '#E2E8F0' }}>{user.birthCity || '—'}</span>
              </div>
              <p className="text-xs" style={{ color: 'rgba(226,232,240,0.35)' }}>
                Para recalcular seu mapa, edite os dados e salve.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(226,232,240,0.5)' }}>
                  Nome completo
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#7C5CFF]"
                  placeholder="Seu nome completo"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(226,232,240,0.5)' }}>
                    Data de nascimento
                  </label>
                  <input
                    type="date"
                    value={profileForm.birthDate}
                    onChange={(e) => setProfileForm((f) => ({ ...f, birthDate: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7C5CFF]"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: 'rgba(226,232,240,0.5)' }}>
                    Hora (opcional)
                  </label>
                  <input
                    type="time"
                    value={profileForm.birthTime}
                    onChange={(e) => setProfileForm((f) => ({ ...f, birthTime: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7C5CFF]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'rgba(226,232,240,0.5)' }}>
                  Cidade de nascimento
                </label>
                <CityAutocomplete
                  value={profileForm.birthCity}
                  onChange={(val) => setProfileForm((f) => ({ ...f, birthCity: val }))}
                  onSelect={(city: CityResult) => {
                    setProfileForm((f) => ({ ...f, birthCity: city.name }));
                    setProfileCoords({
                      latitude: parseFloat(city.latitude),
                      longitude: parseFloat(city.longitude),
                      timezone: city.timezone,
                    });
                  }}
                  placeholder="São Paulo, BR"
                />
              </div>
              {profileError && (
                <p className="text-xs" style={{ color: '#f87171' }}>
                  {profileError}
                </p>
              )}
              {profileSuccess && (
                <p className="text-xs" style={{ color: '#34D399' }}>
                  {profileSuccess}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingProfile(false);
                    setProfileError('');
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-white/60 hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleProfileSave}
                  disabled={profileSaveLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#7C5CFF] text-sm font-semibold text-white hover:bg-[#6B4EE0] transition-colors disabled:opacity-50"
                >
                  {profileSaveLoading ? 'Salvando…' : 'Salvar'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notificações (T7 / opt-in LGPD) */}
        <div style={glassCard} className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-base font-semibold mb-1" style={{ color: '#E2E8F0' }}>
                Notificações
              </h2>
              <p className="text-sm" style={{ color: 'rgba(226,232,240,0.65)' }}>
                Receba uma notificação por dia quando seu ritual estiver pronto. Você pode desativar
                a qualquer momento.
              </p>
              <p className="text-xs mt-1" style={{ color: 'rgba(226,232,240,0.4)' }}>
                A notificação é genérica — o conteúdo do ritual só é aberto no app.
              </p>
              {pushMsg && (
                <p
                  className="text-xs mt-2"
                  style={{ color: pushOn ? '#34D399' : 'rgba(226,232,240,0.55)' }}
                >
                  {pushMsg}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 items-end">
              <button
                onClick={handlePushToggle}
                disabled={pushBusy}
                aria-pressed={pushOn}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap disabled:opacity-50"
                style={{
                  background: pushOn ? 'rgba(16,185,129,0.15)' : 'rgba(124,58,237,0.15)',
                  border: pushOn
                    ? '1px solid rgba(16,185,129,0.4)'
                    : '1px solid rgba(124,58,237,0.4)',
                  color: pushOn ? '#34D399' : '#A78BFA',
                }}
              >
                {pushBusy ? 'Aguarde...' : pushOn ? 'Desativar' : 'Ativar'}
              </button>
              <a
                href="/conta/notifications"
                className="text-xs underline whitespace-nowrap"
                style={{ color: '#A78BFA' }}
              >
                Preferências por tipo
              </a>
            </div>
          </div>
        </div>

        {/* LGPD — Exportar dados (Wave 13.4) */}
        <div style={glassCard} className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold mb-1" style={{ color: '#A78BFA' }}>
                Seus dados (LGPD)
              </h2>
              <p className="text-sm" style={{ color: 'rgba(226,232,240,0.65)' }}>
                Exporte seus dados pessoais a qualquer momento (PDF, JSON ou CSV).
              </p>
            </div>
            <a
              href="/conta/export"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap"
              style={{
                background: 'rgba(124,58,237,0.15)',
                border: '1px solid rgba(124,58,237,0.4)',
                color: '#A78BFA',
                textDecoration: 'none',
              }}
            >
              Exportar
            </a>
          </div>
        </div>

        {/* Plan + Credits */}
        <div className="grid grid-cols-2 gap-4">
          <div style={glassCard} className="p-5 flex flex-col gap-2">
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: 'rgba(226,232,240,0.4)' }}
            >
              Plano
            </p>
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
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: 'rgba(226,232,240,0.4)' }}
            >
              Créditos
            </p>
            <span
              className="text-3xl font-bold"
              style={{ color: '#F59E0B', fontFamily: 'var(--font-cinzel), serif' }}
            >
              {/* ADR-010: credit gate neutralized; see DECISIONS.md */}
              ∞
            </span>
            <p className="text-xs" style={{ color: 'rgba(226,232,240,0.4)' }}>
              {/* ADR-010: 1 crédito = 1 consulta simples · 3 = complexa */}
              Período de testes — sistema de cobrança em breve
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
                <ul
                  className="text-sm flex flex-col gap-1 mt-2"
                  style={{ color: 'rgba(226,232,240,0.55)' }}
                >
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
              style={{
                background: 'rgba(245,158,11,0.15)',
                border: '1px solid rgba(245,158,11,0.4)',
                color: '#F59E0B',
              }}
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
                  border: pack.highlight
                    ? '1px solid rgba(124,58,237,0.4)'
                    : '1px solid rgba(124,58,237,0.15)',
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
                  <p className="text-xs mt-1" style={{ color: '#A78BFA' }}>
                    Aguarde...
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
