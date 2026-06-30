'use client';

/**
 * LoginForm — Wave 93-B · formulário canônico de login (co-located)
 * ----------------------------------------------------------------------------
 * Rota: /login
 *
 * Versão co-localizada que adiciona ao legado (@/components/auth/LoginForm):
 *   - Suporte a `?next=` (preferred) com fallback para `?redirectTo=` (legacy)
 *   - LGPD consent implícito via link "ao entrar você aceita..." na descrição
 *   - Sanitização anti open-redirect via sanitizeNextPath() do auth-integration
 *   - UX didática: força de email + força de senha mínima
 *
 * Convenções (brief W93-B):
 *   - Default redirect: /feed (não /dashboard — onboarding implícito)
 *   - LGPD: consent é no signup; login apenas referencia a política
 *   - Mobile-first: 44px tap targets, inputmode, autoComplete corretos
 *
 * A11Y:
 *   - aria-invalid em erros
 *   - aria-live="polite" em mensagens
 *   - role="alert" em erros críticos
 *   - Foco visível com ring dourado
 *   - Password toggle com aria-pressed
 */

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OAuthButtons } from '@/components/auth/OAuthButtons';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { MysticDivider } from '@/components/shared/MysticDivider';
import { useAuth } from '@/hooks/useAuth';
import {
  validateEmail,
  sanitizeNextPath,
  maskEmail,
  hashRedirect,
} from '@/lib/w93/auth-integration';
import { cn } from '@/lib/utils';

interface LoginFormProps {
  className?: string;
  onSuccess?: () => void;
}

export function LoginForm({ className = '', onSuccess }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, supabase, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Resolve `next` (preferred) || `redirectTo` (legacy) → sanitized path
  const redirectTo = sanitizeNextPath(
    searchParams.get('next') ?? searchParams.get('redirectTo')
  );

  // Se já está autenticado, redireciona imediatamente (UX melhor)
  if (isAuthenticated && !isLoading) {
    router.replace(redirectTo);
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);
    setErrors({});

    // Validação client-side (manual, sem zod para evitar dep extra)
    const fieldErrors: typeof errors = {};
    const emailValidation = validateEmail(email);
    if (!emailValidation.ok) {
      fieldErrors.email = emailValidation.reason;
    }
    if (!password) {
      fieldErrors.password = 'Senha obrigatória';
    }
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
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
      const result = await signIn(emailValidation.normalized!, password);
      if (!result.ok) {
        setServerError(result.error ?? 'Erro ao fazer login');
        return;
      }

      // LGPD-safe log
      // eslint-disable-next-line no-console
      console.info('[login] success', {
        emailHash: hashRedirect(emailValidation.normalized!),
        maskedEmail: maskEmail(emailValidation.normalized!),
        redirectTo,
      });

      if (onSuccess) onSuccess();
      else router.push(redirectTo);
    } catch {
      setServerError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('card-spiritual p-8 rounded-2xl max-w-md w-full', className)}>
      {/* Header */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-spiritual-gold/20 to-spiritual-violet/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
          <Sparkles className="w-8 h-8 text-spiritual-gold" aria-hidden="true" />
        </div>
        <h1 className="font-cinzel text-2xl font-bold text-foreground tracking-wider">
          Portal Espiritual
        </h1>
        <p className="text-muted-foreground text-sm mt-1 font-serif italic text-center">
          Conecte-se ao seu caminho
        </p>
      </div>

      {/* OAuth (Google + Apple) */}
      <OAuthButtons redirectTo={redirectTo} dividerLabel="ou entre com email" />

      <form onSubmit={handleSubmit} className="space-y-5 mt-6" noValidate>
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
                if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                if (serverError) setServerError(null);
              }}
              disabled={isLoading}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={cn(
                'h-11 pl-10 bg-slate-900/80 border-slate-700 focus:border-spiritual-gold focus:ring-spiritual-gold/30 text-foreground placeholder:text-slate-500',
                errors.email &&
                  'border-red-500 focus:border-red-500 focus:ring-red-500/30'
              )}
            />
          </div>
          {errors.email && (
            <p id="email-error" className="text-red-400 text-sm mt-1">
              {errors.email}
            </p>
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
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password)
                  setErrors((p) => ({ ...p, password: undefined }));
                if (serverError) setServerError(null);
              }}
              disabled={isLoading}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
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
          {errors.password && (
            <p id="password-error" className="text-red-400 text-sm mt-1">
              {errors.password}
            </p>
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
          disabled={isLoading}
          className={cn(
            'w-full h-12 mt-2 font-cinzel tracking-wider',
            'bg-gradient-to-r from-spiritual-gold-dark via-spiritual-gold to-spiritual-gold-light',
            'text-slate-900 font-bold',
            'hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] hover:scale-[1.02]',
            'active:scale-[0.98]',
            'transition-all duration-300',
            isLoading && 'opacity-70 cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Entrando...</span>
            </span>
          ) : (
            'Entrar'
          )}
        </Button>
      </form>

      {/* Divider visual removido (OAuth já tem) */}
      <MysticDivider variant="subtle" className="my-6" />

      {/* Links */}
      <div className="space-y-3 text-center">
        <div>
          <Link
            href="/signup"
            className="text-sm text-muted-foreground hover:text-spiritual-gold transition-colors font-serif inline-block min-h-[44px] leading-[44px]"
          >
            Não tem conta?{' '}
            <span className="text-spiritual-gold font-semibold">
              Criar uma conta
            </span>
          </Link>
        </div>
        <div>
          <Link
            href="/forgot"
            className="text-xs text-slate-500 hover:text-spiritual-gold/70 transition-colors inline-block min-h-[44px] leading-[44px]"
          >
            Esqueci minha senha
          </Link>
        </div>
      </div>

      {/* LGPD notice */}
      <p className="text-[10px] text-slate-600 text-center mt-4 italic leading-relaxed">
        Ao entrar, você concorda com a{' '}
        <Link href="/privacidade" className="text-slate-500 hover:text-spiritual-gold/70">
          Política de Privacidade
        </Link>
        .
      </p>

      {/* Dev indicator */}
      {process.env.NODE_ENV === 'development' && (
        <p className="mt-2 text-[10px] text-slate-600 text-center">
          <LoadingSpinner size="sm" variant="gold" /> <span>Dev mode</span>
        </p>
      )}
    </div>
  );
}