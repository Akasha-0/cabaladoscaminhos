'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Props = { locale: string };

export default function LoginClient({ locale }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/akasha/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? 'Falha ao entrar. Tente novamente.');
        setLoading(false);
        return;
      }

      // Cookie akasha_session setado pelo server. Router refresh garante que
      // layouts server-side (header, /conta) leem o cookie novo.
      router.push(`/${locale}/conta`);
      router.refresh();
    } catch {
      setError('Erro de rede. Verifique sua conexão.');
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(11, 14, 28, 0.7)',
    border: '1px solid rgba(38, 48, 79, 0.8)',
    borderRadius: '10px',
    padding: '12px 14px',
    color: '#F4F5FF',
    fontSize: '0.9375rem',
    fontFamily: 'inherit',
    outline: 'none',
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'rgba(11, 14, 28, 0.7)',
        border: '1px solid rgba(38, 48, 79, 0.8)',
        borderRadius: '16px',
        padding: '1.75rem',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <span style={{ fontSize: '0.8125rem', color: '#A7AECF', fontWeight: 500 }}>Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          style={inputStyle}
        />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <span style={{ fontSize: '0.8125rem', color: '#A7AECF', fontWeight: 500 }}>Senha</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          style={inputStyle}
        />
      </label>

      {error && (
        <div
          role="alert"
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '10px 12px',
            color: '#FCA5A5',
            fontSize: '0.8125rem',
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          background: loading ? '#5A4FCC' : '#7C5CFF',
          color: '#fff',
          border: 'none',
          borderRadius: '10px',
          padding: '12px 20px',
          fontSize: '0.9375rem',
          fontWeight: 600,
          cursor: loading ? 'wait' : 'pointer',
          boxShadow: loading ? 'none' : '0 0 24px rgba(124,92,255,0.3)',
          marginTop: '0.25rem',
        }}
      >
        {loading ? 'Entrando…' : 'Entrar'}
      </button>

      <div
        style={{
          textAlign: 'center',
          fontSize: '0.8125rem',
          color: '#A7AECF',
          marginTop: '0.5rem',
        }}
      >
        Ainda não tem conta?{' '}
        <Link
          href={`/${locale}/onboarding`}
          style={{ color: '#9D86FF', textDecoration: 'none', fontWeight: 500 }}
        >
          Criar agora
        </Link>
      </div>
    </form>
  );
}
