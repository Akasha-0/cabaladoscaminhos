'use client';

/**
 * ForgotForm — Wave 93-B · fluxo de "esqueci minha senha"
 * ----------------------------------------------------------------------------
 * Rota: /forgot
 *
 * Comportamento:
 *   1. Usuário digita email
 *   2. Marca LGPD consent (emails transacionais)
 *   3. Submit → POST /api/auth/reset-password
 *   4. UI mostra confirmação (mesmo se Supabase não responder — anti enumeração)
 *
 * Diferença em relação a ResetPasswordForm (Wave 11):
 *   - Rota `/forgot` (canonical W93-B) vs `/reset-password` (legacy)
 *   - LGPD consent checkbox obrigatório (Wave 20+)
 *   - UX didático: força de email (1 campo) + consent + CTA
 *   - Link "Voltar para login" preserva `?next=` se presente
 *
 * A11Y:
 *   - 44px tap target
 *   - aria-live="polite" para mensagens
 *   - role="alert" para erro
 *   - foco visível com ring dourado
 *
 * LGPD:
 *   - Email nunca vai para log
 *   - Consent explícito antes de submeter
 *   - Não revela se email existe (anti enumeração)
 */

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Sparkles, ArrowLeft, CheckCircle2, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { validateEmail } from '@/lib/w93/auth-integration';
import { maskEmail, hashRedirect } from '@/lib/w93/auth-integration';
import { cn } from '@/lib/utils';

export function ForgotForm() {
  const [email, setEmail] = useState('');
  const [acceptLgpd, setAcceptLgpd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const next = searchParams.get('next');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validação email
    const v = validateEmail(email);
    if (!v.ok) {
      setError(v.reason ?? 'Email inválido');
      return;
    }
    // LGPD consent
    if (!acceptLgpd) {
      setError('Você precisa aceitar receber o email transacional');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: v.normalized }),
      });

      if (!res.ok) {
        if (res.status < 500) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null;
          setError(body?.error ?? 'Não foi possível enviar o email.');
        } else {
          // 5xx — silencia para anti-enumeração (OWASP A07)
          setSent(true);
        }
        return;
      }

      setSent(true);

      // LGPD-safe log: só hash + masked local part
      // eslint-disable-next-line no-console
      console.info('[forgot] email solicitado', {
        emailHash: hashRedirect(v.normalized),
        maskedEmail: maskEmail(v.normalized),
      });
    } catch {
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
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
          Email enviado
        </h1>
        <p className="text-sm text-muted-foreground font-serif leading-relaxed">
          Se existe uma conta com este email, você receberá um link para
          redefinir sua senha em alguns minutos.
        </p>
        <p className="text-xs text-slate-500 mt-3 italic">
          Não compartilhamos seu email com terceiros (LGPD).
        </p>
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'}
          className="inline-flex items-center gap-2 mt-6 text-sm text-spiritual-gold hover:underline font-cinzel tracking-wide min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <div className="card-spiritual p-8 rounded-2xl max-w-md w-full">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-spiritual-gold/20 to-spiritual-violet/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
          <Mail className="w-8 h-8 text-spiritual-gold" aria-hidden="true" />
        </div>
        <h1 className="font-cinzel text-xl font-bold tracking-wider">
          Recuperar Senha
        </h1>
        <p className="text-muted-foreground text-sm mt-1 font-serif italic text-center">
          Informe seu email para receber o link de redefinição
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
            inputMode="email"
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            disabled={loading}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'email-error' : undefined}
            className={cn(
              'h-11 bg-slate-900/80 border-slate-700 focus:border-spiritual-gold focus:ring-spiritual-gold/30 text-foreground placeholder:text-slate-500',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
            )}
          />
        </div>

        {/* LGPD consent */}
        <div>
          <label
            htmlFor="accept-lgpd"
            className="flex items-start gap-2 cursor-pointer text-xs text-slate-400 leading-relaxed"
          >
            <input
              id="accept-lgpd"
              type="checkbox"
              checked={acceptLgpd}
              onChange={(e) => {
                setAcceptLgpd(e.target.checked);
                if (error) setError(null);
              }}
              disabled={loading}
              required
              aria-describedby="lgpd-desc"
              className="mt-0.5 accent-spiritual-gold min-w-[16px] min-h-[16px]"
            />
            <span id="lgpd-desc">
              Concordo em receber um email transacional com o link de
              redefinição, conforme a{' '}
              <Link
                href="/privacidade"
                className="text-spiritual-gold hover:underline"
              >
                Política de Privacidade
              </Link>
              .
            </span>
          </label>
        </div>

        {error && (
          <div
            id="email-error"
            role="alert"
            aria-live="assertive"
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm text-center"
          >
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || !acceptLgpd}
          className={cn(
            'w-full h-12 mt-2 font-cinzel tracking-wider',
            'bg-gradient-to-r from-spiritual-gold-dark via-spiritual-gold to-spiritual-gold-light',
            'text-slate-900 font-bold',
            'hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] hover:scale-[1.02]',
            'active:scale-[0.98]',
            'transition-all duration-300',
            (loading || !acceptLgpd) && 'opacity-70 cursor-not-allowed'
          )}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Enviando...</span>
            </span>
          ) : (
            'Enviar link de redefinição'
          )}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-spiritual-gold transition-colors font-serif min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Voltar para o login
        </Link>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <p className="mt-4 text-[10px] text-slate-600 text-center">
          <LoadingSpinner size="sm" variant="gold" /> <span>Dev mode</span>
        </p>
      )}
    </div>
  );
}