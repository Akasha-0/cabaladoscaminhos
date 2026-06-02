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

const registerSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Você deve aceitar os termos',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  className?: string;
  onSuccess?: () => void;
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  const getStrength = () => {
    if (password.length < 8) return 'weak';
    if (password.length <= 12) return 'medium';
    return 'strong';
  };

  const strength = getStrength();

  const strengthConfig = {
    weak: { bars: 1, color: 'bg-red-500', label: 'Fraca', textColor: 'text-red-400' },
    medium: { bars: 2, color: 'bg-amber-500', label: 'Média', textColor: 'text-amber-400' },
    strong: { bars: 3, color: 'bg-emerald-500', label: 'Forte', textColor: 'text-emerald-400' },
  };

  const config = strengthConfig[strength];

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex gap-1">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={cn(
              'h-1.5 w-8 rounded-full transition-colors duration-200',
              level <= config.bars ? config.color : 'bg-slate-700'
            )}
          />
        ))}
      </div>
      <span className={cn('text-xs font-medium', config.textColor)}>
        {config.label}
      </span>
    </div>
  );
}
export function RegisterForm({ className = '', onSuccess }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const router = useRouter();
  const { supabase } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    // Clear error when user types
    const fieldName = name as keyof RegisterFormData;
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
    }
    setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Validate with Zod
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof RegisterFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof RegisterFormData;
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

      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
        },
      });

      if (error) {
        setServerError(error.message);
        return;
      }

      // Success - navigate to dashboard or login
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/dashboard');
      }
    } catch {
      setServerError('Erro ao criar conta. Tente novamente.');
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
          Iniciar Jornada
        </h1>
        <p className="text-muted-foreground text-sm mt-1 font-serif italic">
          Crie sua conta espiritual
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="space-y-2">
          <Label
            htmlFor="name"
            className="font-cinzel uppercase text-xs tracking-widest text-spiritual-gold"
          >
            Nome
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Seu nome"
            value={formData.name}
            onChange={handleChange}
            disabled={isLoading}
            className={cn(
              'h-11 bg-slate-900/80 border-slate-700 focus:border-spiritual-gold focus:ring-spiritual-gold/30 text-foreground placeholder:text-slate-500',
              errors.name && 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
            )}
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name}</p>
          )}
        </div>

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
              autoComplete="new-password"
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
          {formData.password && (
            <PasswordStrengthIndicator password={formData.password} />
          )}
          {errors.password && (
            <p className="text-red-400 text-sm mt-1">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="font-cinzel uppercase text-xs tracking-widest text-spiritual-gold"
          >
            Confirmar Senha
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              className={cn(
                'h-11 bg-slate-900/80 border-slate-700 focus:border-spiritual-gold focus:ring-spiritual-gold/30 text-foreground placeholder:text-slate-500 pr-12',
                errors.confirmPassword && 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-spiritual-gold transition-colors"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                disabled={isLoading}
                className="peer sr-only"
              />
              <div className={cn(
                'w-5 h-5 rounded border-2 transition-all duration-200',
                'bg-slate-900/80 border-slate-600',
                'peer-checked:bg-spiritual-gold peer-checked:border-spiritual-gold',
                'peer-focus-visible:ring-2 peer-focus-visible:ring-spiritual-gold/50',
                'peer-disabled:opacity-50',
                'group-hover:border-spiritual-gold/70',
                errors.acceptTerms && 'border-red-500'
              )}>
                <svg
                  className={cn(
                    'w-full h-full text-slate-900 p-0.5 transition-opacity',
                    formData.acceptTerms ? 'opacity-100' : 'opacity-0'
                  )}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>
            <span className="text-sm text-muted-foreground leading-tight">
              Li e aceito os{' '}
              <Link href="#" className="text-spiritual-gold hover:underline">
                Termos de Uso
              </Link>{' '}
              e a{' '}
              <Link href="#" className="text-spiritual-gold hover:underline">
                Política de Privacidade
              </Link>
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="text-red-400 text-sm mt-1">{errors.acceptTerms}</p>
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
            'w-full h-12 mt-4 font-cinzel tracking-wider',
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
              <span>Criando conta...</span>
            </span>
          ) : (
            'Criar Conta'
          )}
        </Button>
      </form>

      {/* Links */}
      <div className="mt-8 space-y-4">
        <MysticDivider variant="subtle" />

        <div className="flex justify-center">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-spiritual-gold transition-colors font-serif"
          >
            Já tem conta?{' '}
            <span className="text-spiritual-gold font-semibold">Entrar</span>
          </Link>
        </div>
      </div>
    </div>
  );
}