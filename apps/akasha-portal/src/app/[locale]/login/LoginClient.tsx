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
      // Use manual redirect to ensure cookies are processed before navigation.
      // Without this, the browser may fire router.push() before the Set-Cookie
      // header is committed to the browser jar, causing all pages to redirect
      // to /onboarding after login.
      const res = await fetch('/api/akasha/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
        redirect: 'manual',
      });

      if (res.type === 'opaqueredirect' || res.redirected) {
        // 307 → browser set cookies, navigate manually to ensure they're sent.
        const destination = res.url || `/${locale}/conta`;
        window.location.href = destination;
        return;
      }

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? 'Falha ao entrar. Tente novamente.');
        setLoading(false);
        return;
      }
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
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2rem',
        width: '100%',
      }}
    >
      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <span style={{ fontSize: '0.875rem', color: '#8B92B5', fontWeight: 500 }}>
          Email
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          placeholder="seu@email.com"
          required
          autoComplete="email"
        />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <span style={{ fontSize: '0.875rem', color: '#8B92B5', fontWeight: 500 }}>
          Senha
        </span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
      </label>

      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: '#FCA5A5',
            fontSize: '0.875rem',
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          background: loading
            ? 'rgba(124, 92, 255, 0.4)'
            : 'linear-gradient(135deg, #7C5CFF 0%, #A78BFA 100%)',
          border: 'none',
          borderRadius: '10px',
          padding: '0.875rem',
          color: '#fff',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          fontFamily: 'inherit',
          marginTop: '0.25rem',
        }}
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>

      <div
        style={{
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#5C6691',
        }}
      >
        Não tem conta?{' '}
        <Link
          href={`/${locale}/onboarding`}
          style={{
            color: '#A78BFA',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          Cadastre-se
        </Link>
      </div>
    </form>
  );
}
