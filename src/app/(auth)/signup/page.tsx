// ============================================================================
// W79-B · /signup — Criar conta no Portal Akasha
// ----------------------------------------------------------------------------
// Mobile-first. A11Y: labels-for, aria-invalid, role="alert" em toasts.
// LGPD: checkbox de consentimento obrigatório.
// Submit delega para helper W79 + adapter (injetado em runtime).
// ============================================================================

import { Suspense, useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Eye, EyeOff, Loader2, AlertTriangle } from 'lucide-react';
import {
  validateSignupForm, submitSignup, isSignupValid, isSuccess,
  errorMessage, passwordVisibilityHint, DEFAULT_SIGNUP_REDIRECT, LGPD_VERSION,
  type AuthAdapter, type AuthResult, type SignupFormInput,
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

let _devAdapter: AuthAdapter | null = null;
export function setDevSignupAdapter(adapter: AuthAdapter | null): void {
  _devAdapter = adapter;
}

function defaultAdapter(): AuthAdapter {
  if (_devAdapter) return _devAdapter;
  return {
    signIn: async (): Promise<AuthResult> => ({
      kind: 'auth_error',
      code: 'unknown',
      message: 'Use o adapter de dev.',
    }),
    signUp: async (input: SignupFormInput): Promise<AuthResult> => {
      if (!input.email.includes('@') || input.password.length < 8) {
        return { kind: 'auth_error', code: 'weak_password', message: 'Senha fraca' };
      }
      return {
        kind: 'success',
        userId: 'u_dev_' + Date.now().toString(36) as unknown as ReturnType<typeof import('@/lib/w79/auth-pages').toUserId>,
        email: input.email,
        token: 'tok_dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10) as unknown as ReturnType<typeof import('@/lib/w79/auth-pages').toSessionToken>,
        redirectTo: DEFAULT_SIGNUP_REDIRECT,
      };
    },
  };
}

function SignupFormClient(): JSX.Element {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const formErrors = useMemo(
    () => validateSignupForm({ name, email, password, confirmPassword, lgpdConsent }),
    [name, email, password, confirmPassword, lgpdConsent]
  );
  const valid = isSignupValid(formErrors);
  const fieldErrors = formErrors.byField;

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setServerError(null);
      if (!valid || isLoading) return;

      setIsLoading(true);
      try {
        const input: SignupFormInput = { name, email, password, confirmPassword, lgpdConsent };
        const result = await submitSignup(input, defaultAdapter());
        if (!isSuccess(result.result)) {
          const code = result.result && result.result.kind === "auth_error" ? result.result.code : "unknown";
          const msg = code === "email_taken"
            ? "Este email já está cadastrado. Tente fazer login ou use outro email."
            : errorMessage(result.result) || "Não foi possível criar a conta. Tente novamente.";
          setServerError(msg);
          return;
        }
        router.push(result.result.redirectTo ?? DEFAULT_SIGNUP_REDIRECT);
      } catch (err) {
        setServerError("Erro de conexão. Verifique sua internet.");
        // eslint-disable-next-line no-console
        console.error("[signup] submit error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [name, email, password, confirmPassword, lgpdConsent, valid, isLoading, router]
  );

  return (
    <div
      className="card-spiritual p-6 sm:p-8 rounded-2xl max-w-md w-full mx-auto"
      data-testid="w79-signup-form"
    >
      <div className="flex flex-col items-center mb-6">
        <div
          aria-hidden="true"
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-spiritual-gold/20 to-spiritual-violet/20 flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(212,175,55,0.2)]"
        >
          <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-spiritual-gold" />
        </div>
        <h1 className="font-cinzel text-xl sm:text-2xl font-bold text-foreground tracking-wider text-center">
          Criar Conta Espiritual
        </h1>
        <p className="text-muted-foreground text-sm mt-1 font-serif italic text-center">
          Comece sua jornada de autoconhecimento
        </p>
      </div>

      <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit(e)} className="space-y-4" noValidate aria-describedby={serverError ? "w79-signup-toast" : undefined}>
        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="w79-signup-name" className="font-cinzel uppercase text-xs tracking-widest text-spiritual-gold">
            Nome
          </label>
          <input
            id="w79-signup-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Seu nome completo"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            disabled={isLoading}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "w79-signup-name-error" : undefined}
            data-testid="w79-signup-name"
            className={cn(
              "w-full h-12 px-4 rounded-xl bg-slate-900/80 border text-foreground placeholder:text-slate-500",
              "focus:outline-none focus:ring-2 focus:ring-spiritual-gold/40",
              "transition-colors",
              fieldErrors.name
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/40"
                : "border-slate-700 focus:border-spiritual-gold"
            )}
          />
          {fieldErrors.name && (
            <p id="w79-signup-name-error" className="text-red-400 text-sm mt-1" role="alert">
              {fieldErrors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="w79-signup-email" className="font-cinzel uppercase text-xs tracking-widest text-spiritual-gold">
            Email
          </label>
          <input
            id="w79-signup-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            disabled={isLoading}
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "w79-signup-email-error" : undefined}
            data-testid="w79-signup-email"
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
            <p id="w79-signup-email-error" className="text-red-400 text-sm mt-1" role="alert">
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label htmlFor="w79-signup-password" className="font-cinzel uppercase text-xs tracking-widest text-spiritual-gold">
            Senha
          </label>
          <div className="relative">
            <input
              id="w79-signup-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Mín. 8 caracteres, 1 número, 1 especial"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              disabled={isLoading}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "w79-signup-password-error" : undefined}
              data-testid="w79-signup-password"
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
            <p id="w79-signup-password-error" className="text-red-400 text-sm mt-1" role="alert">
              {fieldErrors.password}
            </p>
          )}
        </div>

        {/* Confirm */}
        <div className="space-y-1.5">
          <label htmlFor="w79-signup-confirm" className="font-cinzel uppercase text-xs tracking-widest text-spiritual-gold">
            Confirmar senha
          </label>
          <div className="relative">
            <input
              id="w79-signup-confirm"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
              aria-describedby={fieldErrors.confirmPassword ? "w79-signup-confirm-error" : undefined}
              data-testid="w79-signup-confirm"
              className={cn(
                "w-full h-12 px-4 pr-12 rounded-xl bg-slate-900/80 border text-foreground placeholder:text-slate-500",
                "focus:outline-none focus:ring-2 focus:ring-spiritual-gold/40",
                "transition-colors",
                fieldErrors.confirmConfirm
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/40"
                  : "border-slate-700 focus:border-spiritual-gold"
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md text-slate-400 hover:text-spiritual-gold hover:bg-slate-800/40 transition-colors focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60"
              tabIndex={-1}
              aria-label={passwordVisibilityHint(showConfirm)}
              aria-pressed={showConfirm}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p id="w79-signup-confirm-error" className="text-red-400 text-sm mt-1" role="alert">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        {/* LGPD */}
        <div className="space-y-1.5 pt-2">
          <label htmlFor="w79-signup-lgpd" className="flex items-start gap-3 cursor-pointer text-sm text-slate-300 font-raleway">
            <input
              id="w79-signup-lgpd"
              name="lgpdConsent"
              type="checkbox"
              checked={lgpdConsent}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLgpdConsent(Boolean(e.target.checked))}
              disabled={isLoading}
              aria-invalid={Boolean(fieldErrors.lgpdConsent)}
              aria-describedby={fieldErrors.lgpdConsent ? "w79-signup-lgpd-error" : undefined}
              data-testid="w79-signup-lgpd"
              data-lgpd-version={LGPD_VERSION}
              className={cn(
                "mt-1 h-5 w-5 min-h-[20px] min-w-[20px] rounded border bg-slate-900/80",
                "focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60",
                fieldErrors.lgpdConsent
                  ? "border-red-500 text-red-500"
                  : "border-slate-600 text-spiritual-gold"
              )}
            />
            <span>
              Li e aceito a{" "}
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-spiritual-gold underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 rounded px-0.5"
              >
                Política de Privacidade
              </Link>
              {" "}e os{" "}
              <Link
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-spiritual-gold underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 rounded px-0.5"
              >
                Termos de Uso
              </Link>
              {" "}(LGPD).
            </span>
          </label>
          {fieldErrors.lgpdConsent && (
            <p id="w79-signup-lgpd-error" className="text-red-400 text-sm" role="alert">
              {fieldErrors.lgpdConsent}
            </p>
          )}
        </div>

        {serverError && (
          <div
            id="w79-signup-toast"
            role="alert"
            data-testid="w79-signup-toast"
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm flex items-start gap-2"
          >
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <span>{serverError}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          data-testid="w79-signup-submit"
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
              <span>Criando conta...</span>
            </span>
          ) : (
            "Criar conta"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground font-serif">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="text-spiritual-gold font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 rounded px-1"
          >
            Entrar
          </Link>
        </p>
      </div>

      <span className="sr-only" data-w79-helpers={String(typeof AuthPages === "object")}>
        helpers loaded
      </span>
    </div>
  );
}

function SignupFormFallback(): JSX.Element {
  return (
    <div
      className="card-spiritual p-8 rounded-2xl max-w-md w-full mx-auto flex items-center justify-center min-h-[480px]"
      data-testid="w79-signup-loading"
      role="status"
      aria-label="Carregando formulário de cadastro"
    >
      <LoadingSpinner variant="gold" size="md" />
    </div>
  );
}

export const metadata = {
  title: "Criar conta · Portal Akasha",
  description: "Crie sua conta espiritual e comece sua jornada de autoconhecimento.",
};

export default function SignupPage(): JSX.Element {
  return (
    <Suspense fallback={<SignupFormFallback />}>
      <SignupFormClient />
    </Suspense>
  );
}
