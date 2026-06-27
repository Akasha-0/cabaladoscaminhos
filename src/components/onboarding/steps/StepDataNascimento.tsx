'use client';

/**
 * StepDataNascimento — Passo 2 do Onboarding Espiritual
 * ----------------------------------------------------------------------------
 * Captura data de nascimento + mostra preview em tempo real do
 * Caminho de Vida (numerologia cabalística).
 *
 * O cálculo é feito via `computeLifePath` (em lib/engines/mapa-generator),
 * função pura que mantém a paridade com o cálculo do mapa final.
 */

import { useId, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { computeLifePath } from '@/lib/engines/mapa-generator';
import { getLifePathMeaning } from '@/lib/engines/life-path-meanings';

export interface StepDataNascimentoProps {
  value: string; // ISO yyyy-mm-dd
  onChange: (next: string) => void;
  error?: string;
  autoFocus?: boolean;
}

export function StepDataNascimento({
  value,
  onChange,
  error,
  autoFocus = true,
}: StepDataNascimentoProps) {
  const id = useId();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const preview = useMemo(() => {
    if (!value) return null;
    const num = computeLifePath(value);
    if (!num || num <= 0) return null;
    return num;
  }, [value]);

  const meaning = preview ? getLifePathMeaning(preview) : null;

  return (
    <div className="space-y-3" data-testid="step-data">
      <div className="flex items-center gap-2 text-spiritual-gold">
        <Calendar className="w-5 h-5" aria-hidden />
        <span className="font-cinzel uppercase text-xs tracking-widest">
          Data de nascimento
        </span>
      </div>

      <p className="text-sm text-muted-foreground font-serif italic">
        O dia em que sua alma escolheu encarnar. Calculamos seu Caminho de
        Vida em tempo real conforme você digita.
      </p>

      <div className="space-y-1.5">
        <Label htmlFor={id} className="sr-only">
          Data de nascimento
        </Label>
        <Input
          id={id}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          max={today}
          className={cn('h-12 text-lg', error && 'border-red-500')}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : `${id}-hint`}
          autoFocus={autoFocus}
          data-testid="input-birthDate"
        />
        {error ? (
          <p id={`${id}-error`} role="alert" className="text-red-400 text-sm">
            {error}
          </p>
        ) : (
          <p id={`${id}-hint`} className="text-xs text-muted-foreground">
            Use o formato dd/mm/aaaa. Não pode ser uma data futura.
          </p>
        )}
      </div>

      {/* Preview do Caminho de Vida — calcula em tempo real */}
      <div
        data-testid="life-path-preview"
        aria-live="polite"
        className={cn(
          'mt-4 rounded-xl border p-4 transition-all duration-300',
          preview
            ? 'border-spiritual-gold/60 bg-spiritual-gold/5 shadow-[0_0_18px_rgba(212,175,55,0.18)]'
            : 'border-white/10 bg-white/5 opacity-60'
        )}
      >
        <div className="flex items-start gap-3">
          <Sparkles
            className={cn(
              'w-6 h-6 mt-0.5 shrink-0',
              preview ? 'text-spiritual-gold' : 'text-muted-foreground'
            )}
            aria-hidden
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-cinzel uppercase text-xs tracking-widest text-spiritual-gold/80">
                Caminho de Vida
              </span>
              {preview && (
                <span
                  className="font-cinzel text-3xl font-bold text-spiritual-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]"
                  data-testid="life-path-number"
                >
                  {preview}
                </span>
              )}
            </div>
            <p className="text-sm text-foreground/90 mt-1">
              {meaning
                ? meaning
                : 'Digite sua data para revelar seu Caminho de Vida cabalístico.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}