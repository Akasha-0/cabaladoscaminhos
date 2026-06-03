'use client';
// src/components/operator/auth/ResetPasswordForm.tsx
// Form de redefinição de senha via token — Fase 25.
//
// Recebe token da URL (?token=...) + nova senha, POST /api/operator/auth/reset-password.
// Exibe erro se token for inválido/expirado/usado.
// Em sucesso, redireciona para login.
//
// Dependência: token deve vir da URL (useSearchParams).

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const schema = z.object({
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

interface ResetPasswordFormProps {
  className?: string;
}

export function ResetPasswordForm({ className = '' }: ResetPasswordFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get('token') ?? '';

  const [formData, setFormData] = useState<FormData>({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Token ausente
  const [tokenMissing, setTokenMissing] = useState(false);

  useEffect(() => {
    if (!token) setTokenMissing(true);
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!token) {
      setTokenMissing(true);
      return;
    }

    const parsed = schema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof FormData, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof FormData;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/operator/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: formData.password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 429) {
          setServerError('Muitas tentativas. Aguarde alguns minutos e tente novamente.');
        } else {
          setServerError(data.error ?? 'Erro ao redefinir senha. O link pode ter expirado.');
        }
        return;
      }

      setDone(true);
      // Redireciona para login após 3s
      setTimeout(() => router.push('/operator/login'), 3000);
    } catch {
      setServerError('Erro de conexão. Verifique sua internet.');
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenMissing) {
    return (
      <div className={cn('w-full max-w-md space-y-6 text-center', className)}>
        <div className="flex justify-center">
          <AlertCircle className="h-16 w-16 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Link inválido</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            O link de recuperação de senha está ausente ou incompleto.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Solicite um novo link abaixo.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/operator/forgot-password" className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium border border-input bg-background rounded-md hover:bg-muted transition-colors">Solicitar novo link</Link>
          <Link href="/operator/login" className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao login</Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className={cn('w-full max-w-md space-y-6 text-center', className)}>
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Senha atualizada</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sua senha foi alterada com sucesso.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Redirecionando para o login...
          </p>
        </div>
        <Link href="/operator/login" className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium border border-input bg-background rounded-md hover:bg-muted transition-colors"><ArrowLeft className="mr-2 h-4 w-4" />
            Ir para login agora</Link>
      </div>
    );
  }

  return (
    <div className={cn('w-full max-w-md space-y-6', className)}>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Nova senha</h1>
        <p className="text-sm text-muted-foreground">
          Escolha uma nova senha forte para sua conta.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="password">Nova senha</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="text-sm text-destructive" role="alert">
              {errors.password}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isLoading}
            aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
          />
          {errors.confirmPassword && (
            <p id="confirm-error" className="text-sm text-destructive" role="alert">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {serverError && (
          <p className="text-sm text-destructive" role="alert">
            {serverError}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar nova senha'
          )}
        </Button>
      </form>

      <div className="text-center">
        <Link href="/operator/login" className="text-sm text-primary hover:text-primary/80 underline underline-offset-4"><ArrowLeft className="mr-1 h-4 w-4" />
            Voltar ao login</Link>
      </div>
    </div>
  );
}
