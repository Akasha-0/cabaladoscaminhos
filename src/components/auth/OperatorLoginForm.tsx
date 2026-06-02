'use client'
// src/components/auth/OperatorLoginForm.tsx
// Form de login para Operator (B2B) — usa o novo OperatorAuthProvider.
// NÃO conflitar com o LoginForm Supabase (B2C) — este é o "OperatorLoginForm".
//
// Fase 20: integrado com MFA. Se o /login retornar { mfaRequired: true,
// mfaToken }, troca para o step 2 (MfaChallenge) automaticamente.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOperatorAuth } from '@/components/providers/OperatorAuthProvider';
import { MfaChallenge } from '@/components/operator/MfaChallenge';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface OperatorLoginFormProps {
  className?: string;
  redirectTo?: string;
}

export function OperatorLoginForm({ className = '', redirectTo = '/cockpit' }: OperatorLoginFormProps) {
  const [formData, setFormData] = useState<LoginFormData>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  // Fase 20 — MFA state. Se mfaToken != null, estamos no step 2.
  const [mfaToken, setMfaToken] = useState<string | null>(null);

  const router = useRouter();
  const { signIn, refresh } = useOperatorAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof LoginFormData;
        if (field) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    // Fase 20: detecta MFA via response { mfaRequired, mfaToken }.
    // Em sucesso direto, signIn() já popula o provider — só redireciona.
    const res = await signIn(result.data.email, result.data.password);
    setIsLoading(false);

    if (!res.ok) {
      setServerError(res.error ?? 'Falha no login');
      return;
    }

    // Verifica se o response do /login indicou MFA necessário.
    // O provider signIn não expõe o body inteiro, então fazemos um
    // probe via cookie: se o /me responder 200, login completo.
    // Edge case: se provider já marcou o operator, o cookie de sessão
    // JÁ está setado e o /me funciona. Se só temos mfaToken, signIn
    // não conseguiu setar provider (o provider só seta em res.ok=true
    // do /login, que retorna ok mesmo com mfaRequired=true — então
    // pode ter populado o estado com data.operator). Precisamos checar
    // se o cookie de sessão REALMENTE foi setado.
    const probe = await fetch('/api/operator/auth/me', { credentials: 'include' });
    if (probe.ok) {
      router.push(redirectTo);
      return;
    }
    // MFA challenge: pegamos o mfaToken do probe response? Não — o
    // /me retorna 401 sem cookie. Precisamos de outro método.
    // Workaround: re-fetch /login NÃO (login com senha OK é o que
    // gerou o mfaToken). Em vez disso, mantemos o estado: se o signIn
    // populou o provider mas o /me deu 401, é porque o cookie não
    // foi setado (mfaRequired path) — o mfaToken precisa ser
    // reaproveitado. Solução: refazer signIn e detectar mfaToken no
    // wrapper. Aqui voltamos ao formulário.
    setServerError('Resposta inesperada do servidor. Tente novamente.');
  };

  // ========================================================================
  // MfaChallenge step (Fase 20)
  // ========================================================================

  // Quando entramos no step de MFA, precisamos ter o mfaToken. Como
  // signIn() no provider não o expõe, interceptamos aqui fazendo
  // o login via fetch direto quando o signIn indicar que algo
  // "esperto" aconteceu. Simplificação: refazemos o login via fetch
  // direto para ter o mfaToken.
  const handleStartMfa = async (token: string) => {
    setMfaToken(token);
  };

  if (mfaToken) {
    return (
      <MfaChallenge
        mfaToken={mfaToken}
        onVerified={async () => {
          await refresh();
          router.push(redirectTo);
        }}
        onCancel={() => {
          setMfaToken(null);
          setServerError(null);
        }}
      />
    );
  }

  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      setServerError(null);
      const result = loginSchema.safeParse(formData);
      if (!result.success) {
        const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
        result.error.errors.forEach((err) => {
          const field = err.path[0] as keyof LoginFormData;
          if (field) fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }
      setIsLoading(true);
      // Intercepta: faz o fetch direto para ter acesso ao mfaToken
      try {
        const res = await fetch('/api/operator/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(result.data),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setServerError(data.error ?? 'Falha no login');
          return;
        }
        const data = await res.json();
        if (data.mfaRequired && data.mfaToken) {
          handleStartMfa(data.mfaToken);
          return;
        }
        // Sucesso sem MFA — atualiza provider e redireciona
        await refresh();
        router.push(redirectTo);
      } catch (err) {
        setServerError(err instanceof Error ? err.message : 'Erro de rede');
      } finally {
        setIsLoading(false);
      }
    }} className={cn('w-full max-w-md space-y-4', className)} noValidate>
      {serverError && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300" role="alert">
          {serverError}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm text-slate-300">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="operador@cabala.com"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          autoComplete="email"
          className="bg-slate-800/50 border-slate-700/50"
          aria-invalid={!!errors.email}
        />
        {errors.email && <p className="text-xs text-rose-400">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm text-slate-300">Senha</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            autoComplete="current-password"
            className="bg-slate-800/50 border-slate-700/50 pr-10"
            aria-invalid={!!errors.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200"
            aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-rose-400">{errors.password}</p>}
      </div>

      <Button
        type="submit"
        variant="golden"
        size="lg"
        className="w-full"
        disabled={isLoading}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        {isLoading ? 'Autenticando…' : 'Entrar'}
      </Button>

      <p className="text-xs text-slate-500 text-center">
        Não tem conta?{' '}
        <Link href="/operator/register" className="text-orange-400 hover:text-orange-300">
          Registre-se
        </Link>
      </p>
    </form>
  );
}
