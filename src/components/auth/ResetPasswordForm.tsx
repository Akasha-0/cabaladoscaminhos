'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { emailField } from '@/lib/validation/auth';
import { cn } from '@/lib/utils';

/**
 * ResetPasswordForm — Tela de "esqueci minha senha".
 *
 * Fluxo:
 *  1. Usuário informa email
 *  2. POST /api/auth/reset-password
 *  3. UI mostra estado de sucesso (mesmo se Supabase não responder —
 *     previne enumeração de contas, padrão OWASP).
 *
 * Reuso: este form é client-only e consome o endpoint JSON em
 * /api/auth/reset-password (Wave 11).
 */

export function ResetPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = emailField.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Email inválido');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: parsed.data }),
      });

      if (!res.ok) {
        // 4xx: erro de validação ou rate-limit — mostra mensagem
        // 5xx: erro de servidor — mantém silêncio para não vazar
        if (res.status < 500) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null;
          setError(body?.error ?? 'Não foi possível enviar o email.');
        } else {
          setSent(true);
        }
        return;
      }

      setSent(true);
    } catch {
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      // W24 a11y: status="polite" para screen readers anunciarem o sucesso
      // sem interromper navegação (WCAG 4.1.3 Status Messages).
      <div
        role="status"
        aria-live="polite"
        className="card-spiritual p-8 rounded-2xl max-w-md w-full text-center"
      >
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" aria-hidden="true" />
        </div>
        <h1 className="font-cinzel text-xl font-bold tracking-wider mb-2">
          Email enviado
        </h1>
        <p className="text-sm text-muted-foreground font-serif">
          Se existe uma conta com este email, você receberá um link para
          redefinir sua senha em alguns minutos.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 mt-6 text-sm text-spiritual-gold hover:underline font-cinzel tracking-wide"
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
          <Sparkles className="w-8 h-8 text-spiritual-gold" aria-hidden="true" />
        </div>
        <h1 className="font-cinzel text-xl font-bold tracking-wider">
          Recuperar Senha
        </h1>
        <p className="text-muted-foreground text-sm mt-1 font-serif italic">
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
            autoComplete="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            disabled={loading}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'reset-email-error' : undefined}
            className={cn(
              'h-11 bg-slate-900/80 border-slate-700 focus:border-spiritual-gold focus:ring-spiritual-gold/30 text-foreground placeholder:text-slate-500',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
            )}
          />
        </div>

        {error && (
          <div
            id="reset-email-error"
            role="alert"
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm text-center"
          >
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className={cn(
            'w-full h-12 mt-2 font-cinzel tracking-wider',
            'bg-gradient-to-r from-spiritual-gold-dark via-spiritual-gold to-spiritual-gold-light',
            'text-slate-900 font-bold',
            'hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] hover:scale-[1.02]',
            'active:scale-[0.98]',
            'transition-all duration-300',
            loading && 'opacity-70 cursor-not-allowed'
          )}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <LoadingSpinner size="sm" variant="gold" />
              <span>Enviando...</span>
            </span>
          ) : (
            'Enviar link de redefinição'
          )}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-spiritual-gold transition-colors font-serif"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}
