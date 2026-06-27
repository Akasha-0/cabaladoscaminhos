'use client';

/**
 * StepNome — Passo 1 do Onboarding Espiritual
 * ----------------------------------------------------------------------------
 * Captura o nome completo do consulente (como em certidão).
 * Validação client: mínimo 3 caracteres via Zod (StepNomeSchema).
 */

import { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepNomeProps {
  value: string;
  onChange: (next: string) => void;
  error?: string;
  autoFocus?: boolean;
}

export function StepNome({ value, onChange, error, autoFocus = true }: StepNomeProps) {
  const id = useId();
  return (
    <div className="space-y-3" data-testid="step-nome">
      <div className="flex items-center gap-2 text-spiritual-gold">
        <User className="w-5 h-5" aria-hidden />
        <span className="font-cinzel uppercase text-xs tracking-widest">
          Seu nome completo
        </span>
      </div>

      <p className="text-sm text-muted-foreground font-serif italic">
        Como aparece na sua certidão de nascimento. Este nome é a base do seu
        mapa cabalístico (número de expressão e motivação).
      </p>

      <div className="space-y-1.5">
        <Label htmlFor={id} className="sr-only">
          Nome completo
        </Label>
        <Input
          id={id}
          type="text"
          inputMode="text"
          autoComplete="name"
          placeholder="Maria da Conceição Santos"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn('h-12 text-lg', error && 'border-red-500')}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : `${id}-hint`}
          maxLength={120}
          autoFocus={autoFocus}
          data-testid="input-fullName"
        />
        {error ? (
          <p
            id={`${id}-error`}
            role="alert"
            className="text-red-400 text-sm"
            data-testid="error-fullName"
          >
            {error}
          </p>
        ) : (
          <p id={`${id}-hint`} className="text-xs text-muted-foreground">
            Mínimo 3 caracteres. Use acentos normalmente.
          </p>
        )}
      </div>
    </div>
  );
}