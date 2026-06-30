'use client';

/**
 * SignupForm — Wave 93-B · formulário canônico de signup (co-located)
 * ----------------------------------------------------------------------------
 * Rota: /signup
 *
 * Estrutura por brief W93-B:
 *   - Nome completo (2-80 chars)
 *   - Email
 *   - Senha (min 8, com força didática)
 *   - Tradição primária (opcional — pode pular)
 *   - LGPD consent (obrigatório)
 *
 * Diferenças em relação a OptimizedSignupForm (Wave 20):
 *   - Estrutura tradicional multi-campo (não magic-link-first)
 *   - Adiciona picker de tradição primária (brief W93-B explícito)
 *   - Validação Zod client-side (vs regex ad-hoc)
 *   - Redirect pós-signup: `/onboarding` (via getPostSignupPath)
 *
 * A11Y:
 *   - 44px tap targets
 *   - aria-invalid em erros
 *   - aria-live="polite" em mensagens
 *   - role="alert" em erros críticos
 *   - Strength meter visual com 5 níveis
 *
 * LGPD:
 *   - Email nunca vai para log
 *   - Hash + mask em logs
 *   - Consent explícito antes de submit
 */

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Mail,
  Lock,
  Loader2,
  User as UserIcon,
  ChevronRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import {
  validateEmail,
  validatePassword,
  isPasswordAcceptable,
  sanitizeNextPath,
  getPostSignupPath,
  hashRedirect,
  maskEmail,
  w93SignupSchema,
} from '@/lib/w93/auth-integration';
import { TRADITIONS } from '@/lib/validation/auth';
import { cn } from '@/lib/utils';

interface SignupFormProps {
  className?: string;
  onSuccess?: () => void;
}

// Tradições com label didático em pt-BR (subset do TRADITIONS canônico)
const TRADITION_LABELS: Record<string, string> = {
  cabala: 'Cabala',
  ifa: 'Ifá',
  astrologia: 'Astrologia',
  tantra: 'Tantra',
  xamanismo: 'Xamanismo',
  'cristianismo-mistico': 'Cristianismo Místico',
  umbanda: 'Umbanda',
  budismo: 'Budismo',
  hinduismo: 'Hinduísmo',
  sufismo: 'Sufismo',
};

export function SignupForm({ className = '', onSuccess }: SignupFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, supabase } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [primaryTradition, setPrimaryTradition] = useState<string>('none');
  const [acceptLgpd, setAcceptLgpd] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Resolve `next` ou fallback `/onboarding` para signup
  const redirectTo = getPostSignupPath({
    explicitNext: searchParams.get('next'),
  });

  // Força de senha em tempo real (didático UX)
  const strength = validatePassword(password);
  const passwordOk = isPasswordAcceptable(password);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);
    setErrors({});

    // Validação Zod
    const parsed = w93SignupSchema.safeParse({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
      primaryTradition: primaryTradition === 'none' ? undefined : primaryTradition,
      acceptLgpd,
    });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = String(issue.path[0] ?? '_');
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // Validação email normalizada (mesma lógica do engine)
    const emailValidation = validateEmail(parsed.data.email);
    if (!emailValidation.ok) {
      setErrors({ email: emailValidation.reason ?? 'Email inválido' });
      return;
    }

    if (!supabase) {
      setServerError(
        'Supabase não configurado. Veja docs/SUPABASE-SETUP.md para configurar.'
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await signUp(
        emailValidation.normalized!,
        parsed.data.password,
        {
          fullName: parsed.data.fullName,
          traditions:
            primaryTradition && primaryTradition !== 'none'
              ? [primaryTradition]
              : [],
        }
      );

      if (!result.ok) {
        setServerError(result.error ?? 'Erro ao criar conta');
        return;
      }

      // LGPD-safe log
      // eslint-disable-next-line no-console
      console.info('[signup] success', {
        emailHash: hashRedirect(emailValidation.normalized!),
        maskedEmail: maskEmail(emailValidation.normalized!),
        tradition: primaryTradition,
        redirectTo,
      });

      if (onSuccess) onSuccess();
      else router.push(redirectTo);
    } catch {
      setServerError('Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('card-spiritual p-6 md:p-8 rounded-2xl max-w-md w-full', className)}>
      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-spiritual-gold/20 to-spiritual-violet/20 flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
          <Sparkles className="w-7 h-7 text-spiritual-gold" aria-hidden="true" />
        </div>
        <h1 className="font-cinzel text-xl md:text-2xl font-bold text-foreground tracking-wider">
          Iniciar Jornada
        </h1>
        <p className="text-muted-foreground text-xs mt-1 font-serif italic text-center">
          Crie sua conta e conecte-se ao seu caminho
        </p>
      </div>

      {/* OAuth (Google + Apple) */}
      <OAuthButtons redirectTo={redirectTo} dividerLabel="ou crie com email" />

      <form onSubmit={handleSubmit} className="space-y-4 mt-6" noValidate>
        {/* Nome */}
        <div className="space-y-2">
          <Label
            htmlFor="fullName"
            className="font-cinzel uppercase text-xs tracking-widest text-spiritual-gold"
          >
            Nome completo
          </Label>
          <div className="relative">
            <UserIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
              aria-hidden="true"
            />
            <Input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="Como devemos te chamar?"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName)
                  setErrors((p) => ({ ...p, fullName: '' }));
              }}
              disabled={isLoading}
              aria-invalid={Boolean(errors.fullName)}
              className={cn(
                'h-11 pl-10 bg-slate-900/80 border-slate-700 focus:border-spiritual-gold focus:ring-spiritual-gold/30 text-foreground placeholder:text-slate-500',
                errors.fullName &&
                  'border-red-500 focus:border-red-500 focus:ring-red-500/30'
              )}
            />
          </div>
          {errors.fullName && (
            <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="font-cinzel uppercase text-xs tracking-widest text-spiritual-gold"
          >
            Email
          </Label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
              aria-hidden="true"
            />
            <Input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((p) => ({ ...p, email: '' }));
                if (serverError) setServerError(null);
              }}
              disabled={isLoading}
              aria-invalid={Boolean(errors.email)}
              className={cn(
                'h-11 pl-10 bg-slate-900/80 border-slate-700 focus:border-spiritual-gold focus:ring-spiritual-gold/30 text-foreground placeholder:text-slate-500',
                errors.email &&
                  'border-red-500 focus:border-red-500 focus:ring-red-500/30'
              )}
            />
          </div>
          {errors.email && (
            <p className="text-red-400 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="font-cinzel uppercase text-xs tracking-widest text-spiritual-gold"
          >
            Senha
          </Label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
              aria-hidden="true"
            />
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password)
                  setErrors((p) => ({ ...p, password: '' }));
                if (serverError) setServerError(null);
              }}
              disabled={isLoading}
              aria-invalid={Boolean(errors.password)}
              className={cn(
                'h-11 pl-10 pr-12 bg-slate-900/80 border-slate-700 focus:border-spiritual-gold focus:ring-spiritual-gold/30 text-foreground placeholder:text-slate-500',
                errors.password &&
                  'border-red-500 focus:border-red-500 focus:ring-red-500/30'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md text-slate-400 hover:text-spiritual-gold hover:bg-slate-800/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spiritual-gold/60"
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Eye className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Strength meter */}
          {password.length > 0 && (
            <div
              className="flex items-center gap-2 text-xs"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="flex-1 h-1 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all',
                    strength.score === 0 && 'bg-red-500 w-0',
                    strength.score === 1 && 'bg-red-400 w-1/4',
                    strength.score === 2 && 'bg-amber-400 w-2/4',
                    strength.score === 3 && 'bg-amber-300 w-3/4',
                    strength.score === 4 && 'bg-emerald-400 w-full'
                  )}
                />
              </div>
              <span
                className={cn(
                  'font-cinzel uppercase tracking-widest text-[10px]',
                  strength.score <= 1 && 'text-red-400',
                  strength.score === 2 && 'text-amber-400',
                  strength.score === 3 && 'text-amber-300',
                  strength.score === 4 && 'text-emerald-400'
                )}
              >
                {strength.label}
              </span>
            </div>
          )}
          {errors.password && (
            <p className="text-red-400 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        {/* Tradição primária (opcional) */}
        <div className="space-y-2">
          <Label
            htmlFor="primaryTradition"
            className="font-cinzel uppercase text-xs tracking-widest text-spiritual-gold"
          >
            Tradição primária{' '}
            <span className="normal-case text-slate-500 italic">
              (opcional)
            </span>
          </Label>
          <select
            id="primaryTradition"
            value={primaryTradition}
            onChange={(e) => setPrimaryTradition(e.target.value)}
            disabled={isLoading}
            className={cn(
              'w-full h-11 px-3 rounded-lg',
              'bg-slate-900/80 border border-slate-700',
              'focus:border-spiritual-gold focus:ring-2 focus:ring-spiritual-gold/30 focus:outline-none',
              'text-foreground',
              'transition'
            )}
          >
            <option value="none">Prefiro não dizer</option>
            {TRADITIONS.map((t) => (
              <option key={t} value={t}>
                {TRADITION_LABELS[t] ?? t}
              </option>
            ))}
          </select>
        </div>

        {/* LGPD consent */}
        <div>
          <label
            htmlFor="accept-lgpd-signup"
            className="flex items-start gap-2 cursor-pointer text-xs text-slate-400 leading-relaxed"
          >
            <input
              id="accept-lgpd-signup"
              type="checkbox"
              checked={acceptLgpd}
              onChange={(e) => {
                setAcceptLgpd(e.target.checked);
                if (errors.acceptLgpd)
                  setErrors((p) => ({ ...p, acceptLgpd: '' }));
              }}
              disabled={isLoading}
              required
              aria-describedby="lgpd-desc-signup"
              aria-invalid={Boolean(errors.acceptLgpd)}
              className="mt-0.5 accent-spiritual-gold min-w-[16px] min-h-[16px]"
            />
            <span id="lgpd-desc-signup">
              Li e aceito os{' '}
              <Link
                href="/termos"
                className="text-spiritual-gold hover:underline"
              >
                Termos
              </Link>{' '}
              e a{' '}
              <Link
                href="/privacidade"
                className="text-spiritual-gold hover:underline"
              >
                Política de Privacidade
              </Link>
              .
            </span>
          </label>
          {errors.acceptLgpd && (
            <p className="text-red-400 text-xs mt-1 ml-6">{errors.acceptLgpd}</p>
          )}
        </div>

        {/* Server Error */}
        {serverError && (
          <div
            role="alert"
            aria-live="assertive"
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm text-center"
          >
            {serverError}
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={isLoading || !passwordOk || !acceptLgpd}
          className={cn(
            'w-full h-12 mt-2 font-cinzel tracking-wider',
            'bg-gradient-to-r from-spiritual-gold-dark via-spiritual-gold to-spiritual-gold-light',
            'text-slate-900 font-bold',
            'hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] hover:scale-[1.02]',
            'active:scale-[0.98]',
            'transition-all duration-300',
            (isLoading || !passwordOk || !acceptLgpd) && 'opacity-70 cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Criando conta...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Criar conta
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </span>
          )}
        </Button>
      </form>

      {/* Login link */}
      <div className="mt-6 text-center">
        <Link
          href={redirectTo ? `/login?next=${encodeURIComponent(redirectTo)}` : '/login'}
          className="text-xs text-muted-foreground hover:text-spiritual-gold transition-colors inline-block min-h-[44px] leading-[44px]"
        >
          Já tem conta?{' '}
          <span className="text-spiritual-gold font-semibold">Entrar</span>
        </Link>
      </div>

      {/* Dev indicator */}
      {process.env.NODE_ENV === 'development' && (
        <p className="mt-2 text-[10px] text-slate-600 text-center">
          <LoadingSpinner size="sm" variant="gold" /> <span>Dev mode</span>
        </p>
      )}
    </div>
  );
}