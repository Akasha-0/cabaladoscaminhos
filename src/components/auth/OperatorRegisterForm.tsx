'use client'
// src/components/auth/OperatorRegisterForm.tsx
// Form de registro para Operator (B2B).

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

const registerSchema = z
  .object({
    name: z.string().min(1, 'Nome é obrigatório').max(200, 'Nome muito longo'),
    email: z.string().email('Email inválido').max(200, 'Email muito longo'),
    password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres').max(200, 'Senha muito longa'),
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface OperatorRegisterFormProps {
  className?: string;
  redirectTo?: string;
}

export function OperatorRegisterForm({ className = '', redirectTo = '/cockpit' }: OperatorRegisterFormProps) {
  const [formData, setFormData] = useState<RegisterFormData>({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const router = useRouter();
  const { register } = useOperatorAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof RegisterFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof RegisterFormData;
        if (field) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const res = await register(result.data.name, result.data.email, result.data.password);
    setIsLoading(false);

    if (!res.ok) {
      setServerError(res.error ?? 'Falha no registro');
      return;
    }
    router.push(redirectTo);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('w-full max-w-md space-y-4', className)} noValidate>
      {serverError && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300" role="alert">
          {serverError}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm text-slate-300">Nome</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Seu nome"
          value={formData.name}
          onChange={handleChange}
          disabled={isLoading}
          autoComplete="name"
          className="bg-slate-800/50 border-slate-700/50"
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="text-xs text-rose-400">{errors.name}</p>}
      </div>

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
            placeholder="Mínimo 8 caracteres"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            autoComplete="new-password"
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
        variant="spiritual"
        size="lg"
        className="w-full"
        disabled={isLoading}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        {isLoading ? 'Criando conta…' : 'Criar conta'}
      </Button>

      <p className="text-xs text-slate-500 text-center">
        Já tem conta?{' '}
        <Link href="/operator/login" className="text-orange-400 hover:text-orange-300">
          Entrar
        </Link>
      </p>
    </form>
  );
}
