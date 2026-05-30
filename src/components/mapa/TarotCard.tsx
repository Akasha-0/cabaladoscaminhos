'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { TarotResults } from '@/lib/engines/types/mapa-alma';

// Arcano Maior names (0-22)
const ARCANOS_MAIORES = [
  'O Louco', 'O Mago', 'A Sacerdotisa', 'A Imperatriz', 'O Imperador',
  'O Hierofante', 'Os Enamorados', 'O Carro', 'A Justiça', 'O Eremita',
  'A Roda da Fortuna', 'A Força', 'O Enforcado', 'A Morte', 'A Temperança',
  'O Diabo', 'A Torre', 'A Estrela', 'A Lua', 'O Sol',
  'O Julgamento', 'O Mundo', 'O Ato',
];

// Arcano English names for subtitle
const ARCANOS_ENGLISH: Record<number, string> = {
  0: 'The Fool', 1: 'The Magician', 2: 'The High Priestess', 3: 'The Empress',
  4: 'The Emperor', 5: 'The Hierophant', 6: 'The Lovers', 7: 'The Chariot',
  8: 'Justice', 9: 'The Hermit', 10: 'Wheel of Fortune', 11: 'Strength',
  12: 'The Hanged Man', 13: 'Death', 14: 'Temperance', 15: 'The Devil',
  16: 'The Tower', 17: 'The Star', 18: 'The Moon', 19: 'The Sun',
  20: 'Judgment', 21: 'The World', 22: 'The Aeon',
};

// Mystical symbols for each arcano
const ARCANO_SYMBOLS: Record<number, string> = {
  0: '☽', 1: '☿', 2: '☾', 3: '♀', 4: '♂', 5: '⚕', 6: '♋', 7: '♌',
  8: '♎', 9: '☆', 10: '☸', 11: '♌', 12: '⊥', 13: '☠', 14: '△', 15: '⛧',
  16: '⚡', 17: '★', 18: '☾', 19: '☉', 20: '⚖', 21: '🌍', 22: '∞',
};

// Energy types for each arcano
const ARCANO_ENERGIA: Record<number, string> = {
  0: 'Ar', 1: 'Fogo', 2: 'Água', 3: 'Terra', 4: 'Fogo',
  5: 'Terra', 6: 'Ar', 7: 'Fogo', 8: 'Ar', 9: 'Terra',
  10: 'Fogo', 11: 'Fogo', 12: 'Água', 13: 'Água', 14: 'Água',
  15: 'Fogo', 16: 'Fogo', 17: 'Água', 18: 'Água', 19: 'Fogo',
  20: 'Fogo', 21: 'Terra', 22: 'Ar',
};

// Element colors for each arcano
const ELEMENTO_COLORS: Record<string, string> = {
  'Fogo': 'var(--chakra-root)',
  'Terra': 'var(--chakra-sacral)',
  'Ar': 'var(--chakra-throat)',
  'Água': 'var(--chakra-third-eye)',
};

interface TarotCardProps {
  data: TarotResults;
  className?: string;
}

export function TarotCard({ data, className = '' }: TarotCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleFlip();
    }
  };
  const arcanoNum = data.cartaNascimento;
  const arcanoName = ARCANOS_MAIORES[arcanoNum] || `Arcano ${arcanoNum}`;
  const arcanoEnglish = ARCANOS_ENGLISH[arcanoNum] || '';
  const arcanoSymbol = ARCANO_SYMBOLS[arcanoNum] || '✦';
  const energia = ARCANO_ENERGIA[arcanoNum] || 'Ar';
  const elementoColor = ELEMENTO_COLORS[energia] || 'var(--spiritual-violet)';
  // Additional cards
  const anoPessoalNum = data.cartaAnoPessoal;
  const almaNum = data.cartaAlma;
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Screen reader announcement for flip state */}
      <div role="status" aria-live="polite" className="sr-only">
        {isFlipped ? `Carta revelada: ${arcanoName}. Interpretação: ${data.interpretacao?.upright || 'informação indisponível'}` : `Carta do Nascimento: ${arcanoName}. Toque para revelar.`}
      </div>
      {/* Main Flip Card */}
      <div
        className="card-flip w-full max-w-sm mx-auto focus-visible:outline-none"
        role="button"
        tabIndex={0}
        aria-label={`Carta do Nascimento: ${arcanoName}. Toque para ${isFlipped ? 'fechar e ver a carta' : 'revelar a interpretação'}.`}
        aria-pressed={isFlipped}
        onClick={handleFlip}
        onKeyDown={handleKeyDown}
      >
        <div className={cn(
          'card-flip-inner',
          'rounded-2xl',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
          isFlipped && !prefersReducedMotion && 'rotate-y-180'
        )}
        style={prefersReducedMotion ? { transform: isFlipped ? 'rotateY(180deg)' : 'none' } : undefined}
        >
          <div
            className={cn(
              'card-flip-front card-spiritual rounded-2xl p-4 sm:p-6 min-h-[280px] sm:min-h-[320px]',
            )}
          >
            {/* Header */}
            <div className="flex items-center gap-2 text-sm font-medium tracking-wider text-muted-foreground uppercase">
              <span className="text-spiritual-gold">✦</span>
              <span>Carta do Nascimento</span>
              <span className="text-spiritual-gold">✦</span>
            </div>
            {/* Divider */}
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-spiritual-gold/50 to-transparent" />
            {/* Arcano Symbol & Number */}
            <div className="relative flex flex-col items-center">
              {/* Decorative border */}
              <div
                className="absolute inset-0 rounded-full animate-pulse-soft opacity-30"
                style={{
                  background: `radial-gradient(circle, ${elementoColor}22 0%, transparent 70%)`,
                  transform: 'scale(1.3)',
                }}
              />
              {/* Symbol */}
              <div
                className="text-4xl sm:text-5xl mb-2"
                style={{ color: elementoColor }}
              >
                {arcanoSymbol}
              </div>
              {/* Arcano Number */}
              <div
                className="text-5xl sm:text-7xl font-bold tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #B8860B 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {arcanoNum}
              </div>
              {/* Arcano Name */}
              <h3
                className="text-xl sm:text-2xl font-serif font-semibold mt-2 text-center"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {arcanoName}
              </h3>
              {/* English Name */}
              <p className="text-sm text-muted-foreground italic">
                ({arcanoEnglish})
              </p>
            </div>
            {/* Hint */}
            <div className="mt-auto text-xs text-muted-foreground/70 flex items-center gap-2">
              <span className="text-spiritual-gold/60">✦</span>
              <span>Toque para revelar</span>
              <span className="text-spiritual-gold/60">✦</span>
            </div>
          </div>
          {/* Back Face */}
          <div
            className={cn(
              'card-flip-back card-spiritual rounded-2xl p-4 sm:p-6 min-h-[280px] sm:min-h-[320px]',
              'flex flex-col items-center justify-center gap-3 sm:gap-4',
              'bg-gradient-to-b from-card to-spiritual-violet/5',
              'cursor-pointer select-none'
            )}
          >
            {/* Header */}
            <div className="flex items-center gap-2 text-sm font-medium tracking-wider text-spiritual-violet uppercase">
              <span className="text-spiritual-gold">✦</span>
              <span>Interpretação</span>
              <span className="text-spiritual-gold">✦</span>
            </div>

            {/* Divider */}
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-spiritual-violet/50 to-transparent" />

            {/* Interpretation Text */}
            <div className="flex-1 overflow-y-auto max-h-32 text-center">
              <p className="text-sm leading-relaxed text-card-foreground/90">
                {data.interpretacao?.upright || 'A energia deste arcano guia seu caminho de vida.'}
              </p>
            </div>

            {/* Energy & Element Info */}
            <div className="flex flex-col items-center gap-3 mt-2">
              {/* Arcano Badge */}
              <div
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  background: `${elementoColor}22`,
                  border: `1px solid ${elementoColor}44`,
                  color: elementoColor,
                }}
              >
                <span className="mr-2">{arcanoSymbol}</span>
                {arcanoName}
              </div>

              {/* Energy & Element */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span style={{ color: elementoColor }}>◆</span>
                  <span>Energia: <strong>{energia}</strong></span>
                </div>
                <div className="flex items-center gap-1">
                  <span style={{ color: elementoColor }}>◆</span>
                  <span>Elemento: <strong>{energia}</strong></span>
                </div>
              </div>
            </div>

            {/* Hint */}
            <div className="mt-auto text-xs text-muted-foreground/70 flex items-center gap-2">
              <span className="text-spiritual-gold/60">✦</span>
              <span>Clique para fechar</span>
              <span className="text-spiritual-gold/60">✦</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Cards */}
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {/* Ano Pessoal */}
        <div
          className={cn(
            'card-spiritual rounded-xl px-4 py-2',
            'flex items-center gap-2',
            'text-sm'
          )}
        >
          <span className="text-muted-foreground text-xs">Ano Pessoal:</span>
          <span
            className="font-semibold"
            style={{
              background: 'linear-gradient(135deg, #D4AF37 0%, #FFD700 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {ARCANOS_MAIORES[anoPessoalNum] || `Arcano ${anoPessoalNum}`}
          </span>
          <span className="text-muted-foreground/50 text-xs">#{anoPessoalNum}</span>
        </div>

        {/* Carta da Alma */}
        <div
          className={cn(
            'card-spiritual rounded-xl px-4 py-2',
            'flex items-center gap-2',
            'text-sm'
          )}
        >
          <span className="text-muted-foreground text-xs">Alma:</span>
          <span
            className="font-semibold"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {ARCANOS_MAIORES[almaNum] || `Arcano ${almaNum}`}
          </span>
          <span className="text-muted-foreground/50 text-xs">#{almaNum}</span>
        </div>
      </div>
    </div>
  );
}