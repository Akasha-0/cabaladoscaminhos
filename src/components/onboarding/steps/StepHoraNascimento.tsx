'use client';

/**
 * StepHoraNascimento — Passo 3 do Onboarding Espiritual
 * ----------------------------------------------------------------------------
 * Hora de nascimento é OPCIONAL. Pode ser pulada.
 * Sem hora, o mapa gerará apenas o signo solar (ascendente fica em branco).
 */

import { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepHoraNascimentoProps {
  value: string; // HH:MM ou ''
  onChange: (next: string) => void;
  error?: string;
  autoFocus?: boolean;
}

export function StepHoraNascimento({
  value,
  onChange,
  error,
  autoFocus = true,
}: StepHoraNascimentoProps) {
  const id = useId();

  return (
    <div className="space-y-3" data-testid="step-hora">
      <div className="flex items-center gap-2 text-spiritual-gold">
        <Clock className="w-5 h-5" aria-hidden />
        <span className="font-cinzel uppercase text-xs tracking-widest">
          Hora do nascimento
        </span>
      </div>

      <p className="text-sm text-muted-foreground font-serif italic">
        Opcional — mas a hora exata destrava o ascendente e a Carta do Céu.
        Não sabe? Pode pular e refinar depois.
      </p>

      <div className="space-y-1.5">
        <Label htmlFor={id} className="sr-only">
          Hora de nascimento
        </Label>
        <Input
          id={id}
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn('h-12 text-lg', error && 'border-red-500')}
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-hint`}
          autoFocus={autoFocus}
          data-testid="input-birthTime"
        />
        <p id={`${id}-hint`} className="text-xs text-muted-foreground flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-spiritual-gold" aria-hidden />
          Formato 24h (HH:MM). Vazio é aceito.
        </p>
        {error && (
          <p role="alert" className="text-red-400 text-sm">
            {error}
          </p>
        )}
      </div>

      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="text-xs text-spiritual-gold/80 underline underline-offset-2 hover:text-spiritual-gold"
          data-testid="clear-birthTime"
        >
          Não sei a hora — limpar
        </button>
      )}
    </div>
  );
}