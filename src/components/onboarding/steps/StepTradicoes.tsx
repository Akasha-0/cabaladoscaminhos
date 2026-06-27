'use client';

/**
 * StepTradicoes — Passo 5 do Onboarding Espiritual
 * ----------------------------------------------------------------------------
 * Multi-select de tradições de interesse. Min 1, max 5.
 * Persiste em SpiritualProfile.traditions.
 *
 * Lista de 14 tradições conforme spec (Cabala, Ifá, Astrologia, Tantra,
 * Reiki, Meditação, Xamanismo, Cristianismo Místico, Sufismo, Taoismo,
 * Umbanda, Candomblé, Budismo, Hinduismo).
 *
 * Tag colors: amber/violet/emerald/cyan — paléta espiritual do projeto.
 */

import { Star, Sparkles, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TRADITIONS, MAX_TRADITIONS, MIN_TRADITIONS, type Tradition } from '@/lib/schemas/onboarding';

export interface StepTradicoesProps {
  value: Tradition[];
  onToggle: (t: Tradition) => void;
  error?: string;
}

// Paleta espiritual — 4 cores principais do projeto, ciclada.
const TRADITION_COLORS = [
  { ring: 'ring-amber-500', bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-400/70' },
  { ring: 'ring-violet-500', bg: 'bg-violet-500/15', text: 'text-violet-300', border: 'border-violet-400/70' },
  { ring: 'ring-emerald-500', bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-400/70' },
  { ring: 'ring-cyan-500', bg: 'bg-cyan-500/15', text: 'text-cyan-300', border: 'border-cyan-400/70' },
] as const;

export function StepTradicoes({ value, onToggle, error }: StepTradicoesProps) {
  const remaining = MAX_TRADITIONS - value.length;
  const atMax = value.length >= MAX_TRADITIONS;
  const tooFew = value.length < MIN_TRADITIONS;

  return (
    <div className="space-y-3" data-testid="step-tradicoes">
      <div className="flex items-center gap-2 text-spiritual-gold">
        <Star className="w-5 h-5" aria-hidden />
        <span className="font-cinzel uppercase text-xs tracking-widest">
          Tradições de interesse
        </span>
      </div>

      <p className="text-sm text-muted-foreground font-serif italic">
        Escolha de {MIN_TRADITIONS} a {MAX_TRADITIONS} caminhos que mais ressoam
        com você. Isso filtra dashboards, rituais e conteúdos personalizados.
      </p>

      <div
        className="grid grid-cols-2 sm:grid-cols-3 gap-2"
        role="group"
        aria-label="Tradições de interesse"
        data-testid="traditions-grid"
      >
        {TRADITIONS.map((t, idx) => {
          const selected = value.includes(t);
          const color = TRADITION_COLORS[idx % TRADITION_COLORS.length];
          const disabled = !selected && atMax;
          return (
            <button
              key={t}
              type="button"
              onClick={() => !disabled && onToggle(t)}
              disabled={disabled}
              aria-pressed={selected}
              aria-disabled={disabled}
              data-testid={`tradition-${t}`}
              className={cn(
                'group relative text-left rounded-lg border p-3 transition-all text-sm font-serif',
                selected
                  ? `${color.border} ${color.bg} ${color.text} ring-2 ${color.ring} shadow-[0_0_18px_rgba(212,175,55,0.18)]`
                  : 'border-white/15 bg-white/5 text-foreground/80 hover:border-spiritual-gold/50',
                disabled && !selected && 'opacity-40 cursor-not-allowed hover:border-white/15'
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span>{t}</span>
                {selected && (
                  <Check className={cn('w-4 h-4 shrink-0', color.text)} aria-hidden />
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs">
        <p
          className={cn(
            'flex items-center gap-1',
            tooFew ? 'text-muted-foreground' : remaining === 0 ? 'text-spiritual-gold' : 'text-muted-foreground'
          )}
          data-testid="traditions-counter"
        >
          <Sparkles className="w-3 h-3" aria-hidden />
          {value.length} selecionada{value.length === 1 ? '' : 's'}
          {remaining > 0 && ` (faltam ${remaining})`}
        </p>
        <p className="text-muted-foreground">
          Máx. {MAX_TRADITIONS}
        </p>
      </div>

      {error && (
        <p role="alert" className="text-red-400 text-sm" data-testid="error-traditions">
          {error}
        </p>
      )}
    </div>
  );
}