'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type FormData = {
  fullName: string;
  email: string;
  password: string;
  intention: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  birthState: string;
  birthCountry: string;
  consent: boolean;
};

const INITIAL: FormData = {
  fullName: '',
  email: '',
  password: '',
  intention: '',
  birthDate: '',
  birthTime: '',
  birthCity: '',
  birthState: '',
  birthCountry: 'Brasil',
  consent: false,
};

const glassCard: React.CSSProperties = {
  background: 'rgba(124, 58, 237, 0.05)',
  border: '1px solid rgba(124, 58, 237, 0.2)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
};

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(124, 58, 237, 0.25)',
  borderRadius: '8px',
  color: '#E2E8F0',
  outline: 'none',
  width: '100%',
  padding: '10px 14px',
  fontSize: '0.9375rem',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '0.8125rem',
  color: 'rgba(226,232,240,0.65)',
  letterSpacing: '0.04em',
};

const STEPS = ['Identidade', 'Nascimento', 'Local', 'Confirmação'];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    setError('');
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setError('');
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    if (!form.consent) {
      setError('É necessário consentir com o processamento dos dados.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const reg = await fetch('/api/akasha/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!reg.ok) {
        const body = await reg.json().catch(() => ({}));
        throw new Error(body?.message ?? 'Erro ao criar conta.');
      }

      const login = await fetch('/api/akasha/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      if (!login.ok) {
        throw new Error('Conta criada! Faça login para continuar.');
      }

      await fetch('/api/akasha/chart', { method: 'POST' });

      router.push('/mandala');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 py-12"
      style={{ background: '#030711' }}
    >
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1
            className="text-2xl font-semibold mb-2"
            style={{ fontFamily: 'var(--font-cinzel), serif', color: '#E2E8F0' }}
          >
            Iniciar Jornada
          </h1>
          <p style={{ color: 'rgba(226,232,240,0.55)', fontSize: '0.875rem' }}>
            Passo {step + 1} de {STEPS.length} — {STEPS[step]}
          </p>
        </div>

        <div className="flex gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{
                background: i <= step ? '#7C3AED' : 'rgba(124,58,237,0.15)',
              }}
            />
          ))}
        </div>

        <div style={glassCard} className="p-6 mb-4">
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <div>
                <label style={labelStyle}>Nome completo</label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Seu nome"
                  value={form.fullName}
                  onChange={(e) => set('fullName', e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label style={labelStyle}>E-mail</label>
                <input
                  style={inputStyle}
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>Senha (mínimo 8 caracteres)</label>
                <input
                  style={inputStyle}
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>Por que você busca o Oráculo?</label>
                <textarea
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
                  placeholder="Uma frase sobre sua intenção..."
                  value={form.intention}
                  onChange={(e) => set('intention', e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <label style={labelStyle}>Data de nascimento</label>
                <input
                  style={inputStyle}
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => set('birthDate', e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>Hora de nascimento</label>
                <input
                  style={inputStyle}
                  type="time"
                  value={form.birthTime}
                  onChange={(e) => set('birthTime', e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <p
                className="text-xs mb-1"
                style={{ color: 'rgba(6,182,212,0.8)', lineHeight: '1.5' }}
              >
                Usaremos sua cidade para calcular seu mapa astrológico com precisão.
              </p>
              <div>
                <label style={labelStyle}>Cidade</label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="São Paulo"
                  value={form.birthCity}
                  onChange={(e) => set('birthCity', e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>Estado</label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="SP"
                  value={form.birthState}
                  onChange={(e) => set('birthState', e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>País</label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Brasil"
                  value={form.birthCountry}
                  onChange={(e) => set('birthCountry', e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <h2
                className="text-base font-medium mb-2"
                style={{ color: '#7C3AED', fontFamily: 'var(--font-cinzel), serif' }}
              >
                Resumo da Jornada
              </h2>
              <dl className="flex flex-col gap-2 text-sm">
                {[
                  ['Nome', form.fullName],
                  ['E-mail', form.email],
                  ['Intenção', form.intention],
                  ['Data de nascimento', form.birthDate],
                  ['Hora', form.birthTime || '—'],
                  ['Cidade natal', [form.birthCity, form.birthState, form.birthCountry].filter(Boolean).join(', ')],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-2">
                    <dt style={{ color: 'rgba(226,232,240,0.5)', minWidth: '140px' }}>{label}</dt>
                    <dd style={{ color: '#E2E8F0' }}>{value || '—'}</dd>
                  </div>
                ))}
              </dl>

              <label className="flex items-start gap-3 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={(e) => set('consent', e.target.checked)}
                  className="mt-0.5 accent-[#7C3AED]"
                  style={{ width: '16px', height: '16px', flexShrink: 0 }}
                />
                <span className="text-xs leading-relaxed" style={{ color: 'rgba(226,232,240,0.65)' }}>
                  Consinto com o processamento dos meus dados para geração do mapa natal.
                </span>
              </label>
            </div>
          )}
        </div>

        {error && (
          <p
            className="text-sm mb-4 px-4 py-3 rounded-lg"
            style={{
              background: 'rgba(244,63,94,0.1)',
              border: '1px solid rgba(244,63,94,0.3)',
              color: '#f87171',
            }}
          >
            {error}
          </p>
        )}

        <div className="flex gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={back}
              className="flex-1 py-3 rounded-xl text-sm transition-colors"
              style={{
                background: 'rgba(124,58,237,0.08)',
                border: '1px solid rgba(124,58,237,0.2)',
                color: '#E2E8F0',
              }}
            >
              Voltar
            </button>
          )}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors hover:bg-[#6D28D9]"
              style={{ background: '#7C3AED', color: '#fff' }}
            >
              Continuar
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-colors hover:bg-[#6D28D9] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#7C3AED', color: '#fff' }}
            >
              {loading ? 'Processando...' : 'Revelar meu Mapa'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
