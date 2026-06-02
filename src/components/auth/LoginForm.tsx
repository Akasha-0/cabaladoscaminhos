'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { MysticDivider } from '@/components/shared/MysticDivider';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  className?: string;
  onSuccess?: () => void;
}

// fallow-ignore-next-line complexity
export function LoginForm({ className = '', onSuccess }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const router = useRouter();
  const { supabase } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setServerError(null);
  };
// fallow-ignore-next-line complexity

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Validate with Zod
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof LoginFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof LoginFormData;
        if (!fieldErrors[field]) {
          fieldErrors[field] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      if (!supabase) {
        setServerError('Serviço de autenticação indisponível');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setServerError(error.message === 'Invalid login credentials'
          ? 'Email ou senha incorretos'
          : error.message
        );
        return;
      }

      // Success - navigate to dashboard
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard');
      }
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

      <form onSubmit={handleSubmit} className="space-y-5">
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
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            className={cn(
              'h-11 bg-slate-900/80 border-slate-700 focus:border-spiritual-gold focus:ring-spiritual-gold/30 text-foreground placeholder:text-slate-500',
              errors.email && 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
            )}
          />
          {errors.email && (
            <p className="text-red-400 text-sm mt-1">{errors.email}</p>
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
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              className={cn(
                'h-11 bg-slate-900/80 border-slate-700 focus:border-spiritual-gold focus:ring-spiritual-gold/30 text-foreground placeholder:text-slate-500 pr-12',
                errors.password && 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-spiritual-gold transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* Server Error */}
        {serverError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm text-center">
            {serverError}
          </div>
        )}

        {/* Submit Button */}
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

      {/* Links */}
      <div className="mt-8 space-y-4">
        <MysticDivider variant="subtle" />

        <div className="flex flex-col items-center gap-3">
          <Link
            href="/register"
            className="text-sm text-muted-foreground hover:text-spiritual-gold transition-colors font-serif"
          >
            Não tem conta?{' '}
            <span className="text-spiritual-gold font-semibold">Criar uma conta</span>
          </Link>

          <Link
            href="#"
            className="text-xs text-slate-500 hover:text-spiritual-gold/70 transition-colors"
          >
            Esqueci minha senha
          </Link>
        </div>
      </div>
    </div>
  );
}