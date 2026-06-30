'use client';

// ============================================================================
// SignupForm — client form for /signup
// ----------------------------------------------------------------------------
// Uses the w68-backed /api/auth/signup route via authClient.
// Mobile-first, sacred birth-data opt-in, terms acceptance.
// ============================================================================

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient, type SignupInput } from '@/lib/auth-pages/client';

interface FieldErrors {
  displayName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: string;
  birthDate?: string;
}

export function SignupForm() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [birthDataOptIn, setBirthDataOptIn] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});

    // Light client validation (Zod schema runs server-side)
    const errs: FieldErrors = {};
    if (displayName.trim().length < 2) errs.displayName = 'Nome muito curto';
    if (!email.includes('@')) errs.email = 'Email inválido';
    if (password.length < 8) errs.password = 'Mínimo de 8 caracteres';
    if (password !== confirmPassword) errs.confirmPassword = 'As senhas não coincidem';
    if (!acceptTerms) errs.acceptTerms = 'Você deve aceitar os termos';
    if (birthDataOptIn && !birthDate) errs.birthDate = 'Data obrigatória com opt-in';
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setIsLoading(true);
    const input: SignupInput = {
      displayName,
      email,
      password,
      confirmPassword,
      acceptTerms: true,
      birthDataOptIn,
      birthDate: birthDataOptIn ? birthDate : undefined,
    };
    const result = await authClient.signup(input);
    setIsLoading(false);

    if (!result.ok) {
      setServerError(result.error.message);
      return;
    }
    // Redirect to verify-email with token (dev shortcut)
    const token = (result.data as unknown as { _devVerificationToken?: string })
      ._devVerificationToken;
    if (token) {
      router.push(`/verify-email?token=${encodeURIComponent(token)}`);
    } else {
      router.push('/verify-email');
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3.5" noValidate>
      {serverError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200"
        >
          {serverError}
        </div>
      ) : null}

      {/* Display name */}
      <div className="space-y-1.5">
        <label
          htmlFor="displayName"
          className="block font-cinzel text-[10px] uppercase tracking-[0.2em] text-[var(--spiritual-gold,#D4AF37)]"
        >
          Nome
        </label>
        <input
          id="displayName"
          name="displayName"
          type="text"
          autoComplete="name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={isLoading}
          aria-invalid={Boolean(fieldErrors.displayName)}
          className="
            w-full min-h-[44px] rounded-lg
            border border-white/10 bg-white/5
            px-3 py-2 text-sm text-foreground
            placeholder:text-muted-foreground
            focus:outline-none focus:ring-2 focus:ring-[var(--spiritual-gold,#D4AF37)]/50 focus:border-[var(--spiritual-gold,#D4AF37)]
            disabled:opacity-50
            aria-[invalid=true]:border-red-500/60
          "
          placeholder="Como devemos te chamar"
        />
        {fieldErrors.displayName ? (
          <p className="text-xs text-red-300">{fieldErrors.displayName}</p>
        ) : null}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block font-cinzel text-[10px] uppercase tracking-[0.2em] text-[var(--spiritual-gold,#D4AF37)]"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          aria-invalid={Boolean(fieldErrors.email)}
          className="
            w-full min-h-[44px] rounded-lg
            border border-white/10 bg-white/5
            px-3 py-2 text-sm text-foreground
            placeholder:text-muted-foreground
            focus:outline-none focus:ring-2 focus:ring-[var(--spiritual-gold,#D4AF37)]/50 focus:border-[var(--spiritual-gold,#D4AF37)]
            disabled:opacity-50
            aria-[invalid=true]:border-red-500/60
          "
          placeholder="seu@email.com"
        />
        {fieldErrors.email ? (
          <p className="text-xs text-red-300">{fieldErrors.email}</p>
        ) : null}
      </div>

      {/* Password + confirm (side-by-side on sm+, stacked on mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block font-cinzel text-[10px] uppercase tracking-[0.2em] text-[var(--spiritual-gold,#D4AF37)]"
          >
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            aria-invalid={Boolean(fieldErrors.password)}
            className="
              w-full min-h-[44px] rounded-lg
              border border-white/10 bg-white/5
              px-3 py-2 text-sm text-foreground
              placeholder:text-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-[var(--spiritual-gold,#D4AF37)]/50 focus:border-[var(--spiritual-gold,#D4AF37)]
              disabled:opacity-50
              aria-[invalid=true]:border-red-500/60
            "
            placeholder="Mín. 8 caracteres"
          />
          {fieldErrors.password ? (
            <p className="text-xs text-red-300">{fieldErrors.password}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="confirmPassword"
            className="block font-cinzel text-[10px] uppercase tracking-[0.2em] text-[var(--spiritual-gold,#D4AF37)]"
          >
            Confirmar
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            aria-invalid={Boolean(fieldErrors.confirmPassword)}
            className="
              w-full min-h-[44px] rounded-lg
              border border-white/10 bg-white/5
              px-3 py-2 text-sm text-foreground
              placeholder:text-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-[var(--spiritual-gold,#D4AF37)]/50 focus:border-[var(--spiritual-gold,#D4AF37)]
              disabled:opacity-50
              aria-[invalid=true]:border-red-500/60
            "
            placeholder="Repita a senha"
          />
          {fieldErrors.confirmPassword ? (
            <p className="text-xs text-red-300">{fieldErrors.confirmPassword}</p>
          ) : null}
        </div>
      </div>

      {/* Sacred birth-data opt-in */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <span className="relative inline-block mt-0.5">
            <input
              type="checkbox"
              checked={birthDataOptIn}
              onChange={(e) => setBirthDataOptIn(e.target.checked)}
              disabled={isLoading}
              className="
                peer sr-only
              "
            />
            <span
              aria-hidden="true"
              className="
                block w-5 h-5 rounded border border-white/20
                peer-checked:bg-[var(--spiritual-gold,#D4AF37)]
                peer-checked:border-[var(--spiritual-gold,#D4AF37)]
                peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--spiritual-gold,#D4AF37)]/50
                transition-colors
              "
            >
              {birthDataOptIn ? (
                <span className="block w-full h-full text-black text-center text-xs leading-5">✓</span>
              ) : null}
            </span>
          </span>
          <span className="text-xs text-foreground/90 leading-snug">
            <span className="text-[var(--spiritual-gold,#D4AF37)]">Dados sagrados de nascimento</span>
            <span className="block text-muted-foreground mt-0.5">
              Opcional. Usamos apenas para numerologia, mapa astral e biorritmo. Nunca compartilhamos.
            </span>
          </span>
        </label>
        {birthDataOptIn ? (
          <div className="pl-8">
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              disabled={isLoading}
              aria-label="Data de nascimento"
              aria-invalid={Boolean(fieldErrors.birthDate)}
              className="
                w-full min-h-[44px] rounded-lg
                border border-white/10 bg-white/5
                px-3 py-2 text-sm text-foreground
                focus:outline-none focus:ring-2 focus:ring-[var(--spiritual-gold,#D4AF37)]/50 focus:border-[var(--spiritual-gold,#D4AF37)]
                disabled:opacity-50
                aria-[invalid=true]:border-red-500/60
              "
            />
            {fieldErrors.birthDate ? (
              <p className="text-xs text-red-300 mt-1">{fieldErrors.birthDate}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Terms */}
      <div className="space-y-1">
        <label className="flex items-start gap-3 cursor-pointer">
          <span className="relative inline-block mt-0.5">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              disabled={isLoading}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="
                block w-5 h-5 rounded border border-white/20
                peer-checked:bg-[var(--spiritual-gold,#D4AF37)]
                peer-checked:border-[var(--spiritual-gold,#D4AF37)]
                peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--spiritual-gold,#D4AF37)]/50
                transition-colors
              "
            >
              {acceptTerms ? (
                <span className="block w-full h-full text-black text-center text-xs leading-5">✓</span>
              ) : null}
            </span>
          </span>
          <span className="text-xs text-foreground/90 leading-snug">
            Aceito os{' '}
            <Link href="/termos" className="text-[var(--spiritual-gold,#D4AF37)] hover:underline">
              Termos de Uso
            </Link>{' '}
            e a{' '}
            <Link href="/privacy" className="text-[var(--spiritual-gold,#D4AF37)] hover:underline">
              Política de Privacidade
            </Link>
            .
          </span>
        </label>
        {fieldErrors.acceptTerms ? (
          <p className="text-xs text-red-300 pl-8">{fieldErrors.acceptTerms}</p>
        ) : null}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="
          w-full min-h-[48px] rounded-lg
          bg-gradient-to-r from-[var(--spiritual-gold-dark,#9A7B0A)] via-[var(--spiritual-gold,#C9A227)] to-[var(--spiritual-gold-light,#E6C35C)]
          text-black font-semibold tracking-wider font-cinzel text-sm
          shadow-[0_0_20px_rgba(212,175,55,0.3)]
          hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] hover:brightness-110
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-300
        "
      >
        {isLoading ? 'Criando conta…' : 'Criar conta'}
      </button>

      <p className="text-center text-xs text-muted-foreground pt-2">
        Já tem conta?{' '}
        <Link href="/login" className="text-[var(--spiritual-gold,#D4AF37)] hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
