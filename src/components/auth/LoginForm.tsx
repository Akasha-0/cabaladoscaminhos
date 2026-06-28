'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { loginSchema } from '@/lib/validation/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { MysticDivider } from '@/components/shared/MysticDivider';
import { GoogleOAuthButton } from '@/components/auth/GoogleOAuthButton';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LiveRegion } from '@/components/a11y/LiveRegion';

interface LoginFormProps {
  className?: string;
  onSuccess?: () => void;
}

export function LoginForm({ className = '', onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  // W24 a11y: announce login success to screen readers (WCAG 4.1.3).
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/feed';
  const { signIn, supabase } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setErrors({});

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (field === 'email' && !fieldErrors.email) fieldErrors.email = issue.message;
        if (field === 'password' && !fieldErrors.password)
          fieldErrors.password = issue.message;
      });
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
      const result = await signIn(parsed.data.email, parsed.data.password);
      if (!result.ok) {
        setServerError(result.error ?? 'Erro ao fazer login');
        return;
      }
      // Anuncia sucesso para screen readers antes do redirect.
      setSuccessMessage('Login realizado com sucesso. Redirecionando...');
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
          <Sparkles className="w-8 h-8 text-spiritual-gold" />
        </div>
        <h1 className="font-cinzel text-2xl font-bold text-foreground tracking-wider">
          Portal Espiritual
        </h1>
        <p className="text-muted-foreground text-sm mt-1 font-serif italic">
          Conecte-se ao seu caminho
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Email */}
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="font-cinzel uppercase text-xs tracking-widest text-spiritual-gold"
          >
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            className={cn(
              'h-11 bg-slate-900/80 border-slate-700 focus:border-spiritual-gold focus:ring-spiritual-gold/30 text-foreground placeholder:text-slate-500',
              errors.email && 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
            )}
          />
          {errors.email && (
            <p id="login-email-error" role="alert" className="text-red-400 text-sm mt-1">
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
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'login-password-error' : undefined}
              className={cn(
                'h-11 bg-slate-900/80 border-slate-700 focus:border-spiritual-gold focus:ring-spiritual-gold/30 text-foreground placeholder:text-slate-500 pr-12',
                errors.password && 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
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
              {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>
          {errors.password && (
            <p id="login-password-error" role="alert" className="text-red-400 text-sm mt-1">
              {errors.password}
            </p>
          )}
        </div>

        {/* Server Error */}
        {serverError && (
          <div
            role="alert"
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm text-center"
          >
            {serverError}
          </div>
        )}

        {/* W24 a11y: live region anuncia sucesso para screen readers. */}
        <LiveRegion message={successMessage} testId="login-success" />

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
              <LoadingSpinner size="sm" variant="gold" />
              <span>Entrando...</span>
            </span>
          ) : (
            'Entrar'
          )}
        </Button>
      </form>

      {/* Divider + OAuth */}
      <div className="mt-6">
        <MysticDivider variant="subtle" label="ou" />
        <div className="mt-4">
          <GoogleOAuthButton />
        </div>
      </div>

      {/* Links */}
      <div className="mt-8 space-y-3">
        <div className="flex flex-col items-center gap-3">
          <Link
            href="/register"
            className="text-sm text-muted-foreground hover:text-spiritual-gold transition-colors font-serif"
          >
            Não tem conta?{' '}
            <span className="text-spiritual-gold font-semibold">Criar uma conta</span>
          </Link>
          <Link
            href="/forgot-password"
            className="text-xs text-slate-500 hover:text-spiritual-gold/70 transition-colors"
          >
            Esqueci minha senha
          </Link>
        </div>
      </div>
    </div>
  );
}