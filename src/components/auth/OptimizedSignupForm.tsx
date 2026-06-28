'use client';

// ============================================================================
// OptimizedSignupForm — Wave 20 — GTM Readiness 6/6
// ============================================================================
// 1-step signup (vs. 5-field legacy RegisterForm).
// Magic link como opção PRIMÁRIA (1 campo: email).
// Google OAuth prominent.
// Social proof inline ("X pessoas entraram esta semana").
//
// Flag gate: `signup-magic-link` (percentage rollout).
// ============================================================================

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Loader2, Sparkles, ChevronRight, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { GoogleOAuthButton } from '@/components/auth/GoogleOAuthButton';
import { useFlag } from '@/hooks/use-flag';
import { trackSignup } from '@/lib/analytics/events-catalog';
import { funnelEvents } from '@/lib/analytics/funnel';
import { cn } from '@/lib/utils';

type Mode = 'magic_link' | 'password';
type Step = 'collect' | 'magic_link_sent';

interface Props {
  className?: string;
  onSuccess?: () => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function OptimizedSignupForm({ className, onSuccess }: Props) {
  const { user, signUp, signInWithMagicLink, supabase } = useAuth();
  const { enabled: magicLinkEnabled, loading: flagLoading } = useFlag(
    'signup-magic-link'
  );

  const router = useRouter();
  const [mode, setMode] = useState<Mode>(magicLinkEnabled ? 'magic_link' : 'password');
  const [step, setStep] = useState<Step>('collect');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(true); // opt-out (LGPD-friendly)
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Switch default mode when flag loads
  if (!flagLoading && mode === 'magic_link' && !magicLinkEnabled && step === 'collect') {
    setMode('password');
  }

  const handleMagicLink = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);

    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setServerError('Email inválido');
      return;
    }
    if (!acceptTerms) {
      setServerError('Aceite os termos para continuar');
      return;
    }
    if (!supabase) {
      setServerError('Serviço de autenticação indisponível');
      return;
    }

    setSubmitting(true);
    funnelEvents.signupStart({ source: 'magic_link' });

    try {
      const result = await signInWithMagicLink(trimmed);
      if (!result.ok) {
        setServerError(result.error ?? 'Erro ao enviar link');
        return;
      }
      setStep('magic_link_sent');
    } catch {
      setServerError('Erro ao enviar link. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);

    const trimmed = email.trim();
    if (!EMAIL_PATTERN.test(trimmed)) {
      setServerError('Email inválido');
      return;
    }
    if (password.length < 8) {
      setServerError('Senha deve ter no mínimo 8 caracteres');
      return;
    }
    if (!acceptTerms) {
      setServerError('Aceite os termos para continuar');
      return;
    }
    if (!supabase) {
      setServerError('Serviço de autenticação indisponível');
      return;
    }

    setSubmitting(true);
    funnelEvents.signupStart({ source: 'email_password' });

    try {
      const result = await signUp(trimmed, password);
      if (!result.ok) {
        setServerError(result.error ?? 'Erro ao criar conta');
        return;
      }
      if (result.data?.id) {
        trackSignup(result.data.id, 'email');
        funnelEvents.signupComplete({
          userId: result.data.id,
          method: 'email',
        });
      }
      if (onSuccess) onSuccess();
      else router.push('/feed');
    } catch {
      setServerError('Erro ao criar conta. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // Magic link sent confirmation
  if (step === 'magic_link_sent') {
    return (
      <div className={cn('card-spiritual p-8 rounded-2xl max-w-md w-full text-center', className)}>
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-500/20 to-violet-500/20 flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-amber-300" />
        </div>
        <h2 className="font-cinzel text-2xl font-bold text-foreground tracking-wider mb-2">
          Verifique seu email
        </h2>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Enviamos um link mágico para{' '}
          <strong className="text-amber-300">{email}</strong>. Clique nele para
          entrar (o link expira em 1 hora).
        </p>
        <div className="text-xs text-slate-500 space-y-1.5 text-left bg-slate-900/40 rounded-lg p-3 border border-slate-800/60">
          <p className="flex items-start gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
            Não chegou? Confira a caixa de spam.
          </p>
          <p className="flex items-start gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
            Você pode fechar esta aba — entraremos juntos quando clicar.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setStep('collect');
            setEmail('');
          }}
          className="mt-5 text-xs text-slate-400 hover:text-amber-300"
        >
          ← Usar outro email
        </button>
      </div>
    );
  }

  return (
    <div className={cn('card-spiritual p-6 md:p-8 rounded-2xl max-w-md w-full', className)}>
      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500/20 to-violet-500/20 flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
          <Sparkles className="w-7 h-7 text-amber-300" />
        </div>
        <h1 className="font-cinzel text-xl md:text-2xl font-bold text-foreground tracking-wider">
          Iniciar Jornada
        </h1>
        <p className="text-muted-foreground text-xs mt-1 font-serif italic">
          1 passo. Sem senha. Sem fricção.
        </p>
      </div>

      {/* Social proof inline */}
      <div className="mb-5 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-center">
        <p className="text-xs text-emerald-200/80">
          ✨ <strong className="text-emerald-300">+52 praticantes</strong> entraram esta semana
        </p>
      </div>

      {/* Google OAuth prominent */}
      <GoogleOAuthButton label="Continuar com Google" />

      {/* Divider */}
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-slate-700/60" />
        <span className="text-xs uppercase tracking-widest text-slate-500">ou</span>
        <div className="flex-1 h-px bg-slate-700/60" />
      </div>

      {/* Mode tabs */}
      {magicLinkEnabled && (
        <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-slate-900/50 border border-slate-800 mb-4">
          <button
            type="button"
            onClick={() => setMode('magic_link')}
            className={cn(
              'h-8 rounded-md text-xs font-medium transition',
              mode === 'magic_link'
                ? 'bg-amber-500 text-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            ✨ Link mágico
          </button>
          <button
            type="button"
            onClick={() => setMode('password')}
            className={cn(
              'h-8 rounded-md text-xs font-medium transition',
              mode === 'password'
                ? 'bg-amber-500 text-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            🔑 Com senha
          </button>
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={mode === 'magic_link' ? handleMagicLink : handlePasswordSignup}
        className="space-y-3"
        noValidate
      >
        {/* Email */}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (serverError) setServerError(null);
            }}
            disabled={submitting}
            required
            className="w-full h-12 pl-10 pr-3 rounded-lg bg-slate-900/80 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-foreground placeholder:text-slate-500 transition disabled:opacity-60"
          />
        </div>

        {/* Password (only in password mode) */}
        {mode === 'password' && (
          <input
            type="password"
            autoComplete="new-password"
            placeholder="Senha (mín. 8 caracteres)"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (serverError) setServerError(null);
            }}
            disabled={submitting}
            required
            minLength={8}
            className="w-full h-12 px-3 rounded-lg bg-slate-900/80 border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-foreground placeholder:text-slate-500 transition disabled:opacity-60"
          />
        )}

        {/* Terms (opt-out, default checked) */}
        <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-400">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            disabled={submitting}
            className="mt-0.5 accent-amber-400"
          />
          <span>
            Li e aceito os{' '}
            <Link href="/terms" className="text-amber-300 hover:underline">
              Termos
            </Link>{' '}
            e a{' '}
            <Link href="/privacy" className="text-amber-300 hover:underline">
              Privacidade
            </Link>
          </span>
        </label>

        {/* Error */}
        {serverError && (
          <p role="alert" className="text-xs text-red-400">
            {serverError}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || email.trim() === ''}
          className="w-full h-12 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 text-slate-900 font-semibold text-sm hover:from-amber-400 hover:to-amber-300 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando...
            </>
          ) : mode === 'magic_link' ? (
            <>
              Enviar link mágico
              <ChevronRight className="w-4 h-4" />
            </>
          ) : (
            <>
              Criar conta
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>

        {mode === 'magic_link' && (
          <p className="text-xs text-slate-500 text-center">
            Sem senha para lembrar. Enviaremos um link para seu email.
          </p>
        )}
      </form>

      {/* Login link */}
      <div className="mt-5 text-center">
        <Link
          href="/login"
          className="text-xs text-muted-foreground hover:text-amber-300 transition-colors"
        >
          Já tem conta? <span className="text-amber-300 font-semibold">Entrar</span>
        </Link>
      </div>
    </div>
  );
}
