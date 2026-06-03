'use client';
// src/components/operator/auth/ForgotPasswordForm.tsx
// Form de solicitação de recuperação de senha — Fase 25.
//
// Recebe email, POST /api/operator/auth/forgot-password.
// Mostra mensagem de sucesso genérica (não revela se o email existe).
//
// Fluxo de UI:
//   Input email → Submit → Loading → Mensagem "verifique seu email"

import { useState } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const schema = z.object({
  email: z.string().email('Email inválido'),
});

type FormData = z.infer<typeof schema>;

interface ForgotPasswordFormProps {
  className?: string;
}

export function ForgotPasswordForm({ className = '' }: ForgotPasswordFormProps) {
  const [formData, setFormData] = useState<FormData>({ email: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpa erro do campo ao digitar
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

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
      const res = await fetch('/api/operator/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setServerError(data.error ?? 'Erro ao processar. Tente novamente.');
        return;
      }

      setDone(true);
    } catch {
      setServerError('Erro de conexão. Verifique sua internet.');
    } finally {
      setIsLoading(false);
    }
  };

  if (done) {
    return (
      <div className={cn('w-full max-w-md space-y-6 text-center', className)}>
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">Verifique seu email</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Se o email <strong>{formData.email}</strong> estiver cadastrado,
            você receberá instruções para redefinir sua senha.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            O link é válido por 1 hora.
          </p>
        </div>
        <Button variant="outline" asChild className="w-full">
          <Link href="/operator/login">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao login
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('w-full max-w-md space-y-6', className)}>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Recuperar senha</h1>
        <p className="text-sm text-muted-foreground">
          Informe o email da sua conta. Você receberá um link para criar uma nova senha.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="operador@exemplo.com"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive" role="alert">
              {errors.email}
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
              Enviando...
            </>
          ) : (
            'Enviar link de recuperação'
          )}
        </Button>
      </form>

      <div className="text-center">
        <Button variant="link" asChild className="text-sm">
          <Link href="/operator/login">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar ao login
          </Link>
        </Button>
      </div>
    </div>
  );
}
