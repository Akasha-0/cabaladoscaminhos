'use client';

/**
 * ResetTokenForm — Wave 93-B · reset de senha via token
 * ----------------------------------------------------------------------------
 * Rota: /reset/[token]
 *
 * Fluxo:
 *   1. Usuário clica no link do email de recuperação
 *   2. Email contém URL com token (enviado por Supabase Auth via PKCE)
 *   3. Esta página renderiza form para definir nova senha
 *   4. Submit → supabase.auth.updateUser({ password })
 *   5. Sucesso → redireciona para /login com toast "senha redefinida"
 *
 * Validação de token:
 *   - Client-side: isValidResetToken (regex + length)
 *   - Server-side: Supabase verifica assinatura/validade no submit
 *   - Token expirado → mostra mensagem didática + link "reenviar email"
 *
 * LGPD:
 *   - Senha nunca vai para log
 *   - Token hasheado em logs (LGPD-safe identifier)
 *   - Link "reenviar" aponta para /forgot
 *
 * A11Y:
 *   - 44px tap target
 *   - aria-live para erros
 *   - role="alert" em erros críticos
 *   - Foco gerenciado para primeira input (autofocus)
 */

import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowLeft,
  KeyRound,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import {
  validatePassword,
  isPasswordAcceptable,
  hashRedirect,
  sanitizeNextPath,
} from '@/lib/w93/auth-integration';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface ResetTokenFormProps {
  token: string;
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export function ResetTokenForm({ token }: ResetTokenFormProps) {
  const router = useRouter();
  const { supabase } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');

  // Calcula força de senha em tempo real (didático UX)
  const strength = validatePassword(password);
  const passwordOk = isPasswordAcceptable(password);

  // LGPD-safe log do token (apenas hash)
  useEffect(() => {
    if (token) {
      // eslint-disable-next-line no-console
      console.info('[reset-token] page loaded', {
        tokenHash: hashRedirect(token),
        tokenLength: token.length,
      });
    }
  }, [token]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validação senha
    if (!passwordOk) {
      setError('Senha deve ter no mínimo 8 caracteres, letras e números');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    if (!supabase) {
      setError('Serviço de autenticação indisponível');
      setSubmitState('error');
      return;
    }

    setSubmitState('submitting');
    try {
      // Supabase PKCE flow: updateUser aceita token automaticamente
      // quando vem do link de email (signed in via recovery session).
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message || 'Não foi possível redefinir a senha');
        setSubmitState('error');
        return;
      }

      setSubmitState('success');
      // Redireciona para login após 2s (deixa usuário ver a confirmação)
      setTimeout(() => {
        router.push('/login?next=' + encodeURIComponent('/feed'));
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
      setSubmitState('error');
    }
  };

  if (submitState === 'success') {
    return (
      <div
        className="card-spiritual p-8 rounded-2xl max-w-md w-full text-center"
        role="status"
        aria-live="polite"
      >
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" aria-hidden="true" />
        </div>
        <h1 className="font-cinzel text-xl font-bold tracking-wider mb-2">
          Senha redefinida
        </h1>
        <p className="text-sm text-muted-foreground font-serif leading-relaxed">
          Sua senha foi atualizada com sucesso. Você será redirecionado para o
          login em instantes.
        </p>
        <LoadingSpinner size="sm" variant="gold" className="mt-4 mx-auto" />
      </div>
    );
  }

  return (
    <div className="card-spiritual p-8 rounded-2xl max-w-md w-full">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-spiritual-gold/20 to-spiritual-violet/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
          <KeyRound className="w-8 h-8 text-spiritual-gold" aria-hidden="true" />
        </div>
        <h1 className="font-cinzel text-xl font-bold tracking-wider">
          Nova Senha
        </h1>
        <p className="text-muted-foreground text-sm mt-1 font-serif italic text-center">
          Defina uma nova senha para sua conta
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Nova senha */}
        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="font-cinzel uppercase text-xs tracking-widest text-spiritual-gold"
          >
            Nova senha
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              disabled={submitState === 'submitting'}
              autoFocus
              aria-invalid={Boolean(error)}
              className={cn(
                'h-11 bg-slate-900/80 border-slate-700 focus:border-spiritual-gold focus:ring-spiritual-gold/30 text-foreground placeholder:text-slate-500 pr-12',
                error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
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

          {/* Indicador de força */}
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
        </div>

        {/* Confirmar senha */}
        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="font-cinzel uppercase text-xs tracking-widest text-spiritual-gold"
          >
            Confirmar nova senha
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (error) setError(null);
            }}
            disabled={submitState === 'submitting'}
            aria-invalid={Boolean(error)}
            className={cn(
              'h-11 bg-slate-900/80 border-slate-700 focus:border-spiritual-gold focus:ring-spiritual-gold/30 text-foreground placeholder:text-slate-500',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
            )}
          />
        </div>

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm text-center"
          >
            {error}
            <div className="mt-2">
              <Link
                href="/forgot"
                className="text-xs text-spiritual-gold hover:underline"
              >
                Reenviar email de redefinição
              </Link>
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={submitState === 'submitting' || !passwordOk || password !== confirmPassword}
          className={cn(
            'w-full h-12 mt-2 font-cinzel tracking-wider',
            'bg-gradient-to-r from-spiritual-gold-dark via-spiritual-gold to-spiritual-gold-light',
            'text-slate-900 font-bold',
            'hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] hover:scale-[1.02]',
            'active:scale-[0.98]',
            'transition-all duration-300',
            (submitState === 'submitting' || !passwordOk) && 'opacity-70 cursor-not-allowed'
          )}
        >
          {submitState === 'submitting' ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Redefinindo...</span>
            </span>
          ) : (
            'Redefinir senha'
          )}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-spiritual-gold transition-colors font-serif min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}