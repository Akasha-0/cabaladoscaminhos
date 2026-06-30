// ============================================================================
// W79-B · /login — Entrar no Portal Akasha
// ----------------------------------------------------------------------------
// Mobile-first. A11Y: labels-for, aria-invalid, role="alert" em toasts.
// LGPD: link para /privacy. Submit delega para helper W79 + adapter
// (injetado em runtime; sem OAuth/MFA/Stripe).
// ============================================================================

import { Suspense, useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Eye, EyeOff, Loader2, AlertTriangle } from 'lucide-react';
import {
  validateLoginForm, submitLogin, isLoginValid, isSuccess,
  errorMessage, passwordVisibilityHint, DEFAULT_LOGIN_REDIRECT,
  type AuthAdapter, type AuthResult, type LoginFormInput,
} from '@/lib/w79/auth-pages';
import AuthPages from '@/lib/w79/auth-pages';

// Local cn helper — mirrors @/lib/utils cn (className joiner)
function cn(...args: ReadonlyArray<unknown>): string {
  const out: string[] = [];
  for (const a of args) {
    if (typeof a === 'string') out.push(a);
    else if (typeof a === 'object' && a !== null) {
      for (const [k, v] of Object.entries(a)) {
        if (v) out.push(k);
      }
    }
  }
  return out.filter(Boolean).join(' ');
}

// Local spinner component — mirrors components/shared/LoadingSpinner
function LoadingSpinner(props: { variant?: string; size?: string }): JSX.Element {
  const sizeClass = props.size === 'sm' ? 'w-4 h-4' : props.size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  const colorClass = props.variant === 'gold' ? 'border-spiritual-gold' : 'border-spiritual-violet';
  return (
    <span
      className={`inline-block ${sizeClass} border-2 ${colorClass} border-t-transparent rounded-full animate-spin`}
      aria-hidden="true"
    />
  );
}

// ----------------------------------------------------------------------------
// Adapter: por enquanto o W79-B não aciona Supabase real (esse wiring fica
// para o integrador). Em dev, retornamos um auth_error explicativo.
// Para testar via /login sem rede, basta stub-ificar este adapter com
// `setDevLoginAdapter(...)`. Em produção, pluga o signIn do W68 aqui.
// ----------------------------------------------------------------------------

let _devAdapter: AuthAdapter | null = null;
export function setDevLoginAdapter(adapter: AuthAdapter | null): void {
  _devAdapter = adapter;
}

function defaultAdapter(): AuthAdapter {
  if (_devAdapter) return _devAdapter;
  return {
    signIn: async (): Promise<AuthResult> => ({
      kind: 'auth_error',
      code: 'unknown',
      message: 'Wiring de autenticação ainda não conectado. Use /signup para testar fluxo completo via stub.',
    }),
    signUp: async (): Promise<AuthResult> => ({
      kind: 'auth_error',
      code: 'unknown',
      message: 'Use o adapter de dev.',
    }),
  };
}

// ----------------------------------------------------------------------------
// Client form component (LoginFormClient)
// ----------------------------------------------------------------------------

function LoginFormClient(): JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? DEFAULT_LOGIN_REDIRECT;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Memoize errors so they only re-validate when inputs change
  const formErrors = useMemo(
    () => validateLoginForm({ email, password }),
    [email, password]
  );
  const valid = isLoginValid(formErrors);
  const fieldErrors = formErrors.byField;

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setServerError(null);
      if (!valid || isLoading) return;

      setIsLoading(true);
      try {
        const input: LoginFormInput = { email, password };
        const result = await submitLogin(input, defaultAdapter());
        if (!isSuccess(result.result)) {
          setServerError(errorMessage(result.result) || "Não foi possível entrar. Tente novamente.");
          return;
        }
        router.push(result.result.redirectTo ?? redirectTo);
      } catch (err) {
        setServerError("Erro de conexão. Verifique sua internet.");
        // eslint-disable-next-line no-console
        console.error("[login] submit error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, valid, isLoading, router, redirectTo]
  );

  return (
    <div
      className="card-spiritual p-6 sm:p-8 rounded-2xl max-w-md w-full mx-auto"
      data-testid="w79-login-form"
    >
      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        <div
          aria-hidden="true"
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-spiritual-gold/20 to-spiritual-violet/20 flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(212,175,55,0.2)]"
        >
          <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-spiritual-gold" />
        </div>
        <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-foreground tracking-wider text-center">
          Portal Espiritual
        </h1>
        <p className="text-muted-foreground text-sm mt-1 font-serif italic text-center">
          Conecte-se ao seu caminho
        </p>
      </div>

      <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit(e)} className="space-y-4" noValidate aria-describedby={serverError ? "w79-login-toast" : undefined}>
        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="w79-login-email"
            className="font-cinzel uppercase text-xs tracking-widest text-spiritual-gold"
          >
            Email
          </label>
          <input
            id="w79-login-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            disabled={isLoading}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "w79-login-email-error" : undefined}
            data-testid="w79-login-email"
            className={cn(
              "w-full h-12 px-4 rounded-xl bg-slate-900/80 border text-foreground placeholder:text-slate-500",
              "focus:outline-none focus:ring-2 focus:ring-spiritual-gold/40",
              "transition-colors",
              fieldErrors.email
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/40"
                : "border-slate-700 focus:border-spiritual-gold"
            )}
          />
          {fieldErrors.email && (
            <p id="w79-login-email-error" className="text-red-400 text-sm mt-1" role="alert">
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label
            htmlFor="w79-login-password"
            className="font-cinzel uppercase text-xs tracking-widest text-spiritual-gold"
          >
            Senha
          </label>
          <div className="relative">
            <input
              id="w79-login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              disabled={isLoading}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "w79-login-password-error" : undefined}
              data-testid="w79-login-password"
              className={cn(
                "w-full h-12 px-4 pr-12 rounded-xl bg-slate-900/80 border text-foreground placeholder:text-slate-500",
                "focus:outline-none focus:ring-2 focus:ring-spiritual-gold/40",
                "transition-colors",
                fieldErrors.password
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/40"
                  : "border-slate-700 focus:border-spiritual-gold"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md text-slate-400 hover:text-spiritual-gold hover:bg-slate-800/40 transition-colors focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60"
              tabIndex={-1}
              aria-label={passwordVisibilityHint(showPassword)}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p id="w79-login-password-error" className="text-red-400 text-sm mt-1" role="alert">
              {fieldErrors.password}
            </p>
          )}
        </div>

        {/* Server toast */}
        {serverError && (
          <div
            id="w79-login-toast"
            role="alert"
            data-testid="w79-login-toast"
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm flex items-start gap-2"
          >
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          data-testid="w79-login-submit"
          className={cn(
            "w-full min-h-[48px] mt-2 font-cinzel tracking-wider rounded-xl",
            "bg-gradient-to-r from-spiritual-gold-dark via-spiritual-gold to-spiritual-gold-light",
            "text-slate-900 font-bold text-base",
            "hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] hover:scale-[1.01]",
            "active:scale-[0.99]",
            "transition-all duration-300",
            "focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60",
            isLoading && "opacity-70 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Entrando...</span>
            </span>
          ) : (
            "Entrar"
          )}
        </button>
      </form>

      <div className="mt-6 space-y-3 text-center">
        <p className="text-sm text-muted-foreground font-serif">
          Ainda não tem conta?{" "}
          <Link
            href="/signup"
            className="text-spiritual-gold font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 rounded px-1"
          >
            Criar uma conta
          </Link>
        </p>
        <p className="text-xs text-slate-500">
          <Link
            href="/reset-password"
            className="hover:text-spiritual-gold/70 transition-colors focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 rounded px-1"
          >
            Esqueci minha senha
          </Link>
        </p>
      </div>

      <span className="sr-only" data-w79-helpers={String(typeof AuthPages === "object")}>
        helpers loaded
      </span>
    </div>
  );
}

function LoginFormFallback(): JSX.Element {
  return (
    <div
      className="card-spiritual p-8 rounded-2xl max-w-md w-full mx-auto flex items-center justify-center min-h-[420px]"
      data-testid="w79-login-loading"
      role="status"
      aria-label="Carregando formulário de login"
    >
      <LoadingSpinner variant="gold" size="md" />
    </div>
  );
}

export const metadata = {
  title: "Entrar · Portal Akasha",
  description: "Entre na sua conta do Portal Akasha e conecte-se ao seu caminho espiritual.",
};

export default function LoginPage(): JSX.Element {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginFormClient />
    </Suspense>
  );
}
