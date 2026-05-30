'use client';

import { cn } from '@/lib/utils';
import { BodyText, Heading } from '@/components/design-system/Typography';
import { MysticDivider } from '@/components/shared/MysticDivider';
import { Sparkles } from 'lucide-react';
import type { Convergence } from '@/lib/engines/types/mapa-alma';

interface CorrelacaoInsightProps {
  convergencias: Convergence[];
  className?: string;
}

const SYSTEM_COLORS: Record<string, string> = {
  'Numerologia': 'var(--color-gold)',
  'Odu': 'var(--color-wine)',
  'Astrologia': 'var(--color-indigo)',
  'Tarot': 'var(--color-purple)',
  'Chakras': 'var(--color-teal)',
  'Cabala': 'var(--color-purple-light)',
};

const STRENGTH_CONFIG = {
  forte: {
    label: 'Forte',
    borderColor: 'border-l-gold',
    bgTint: 'bg-gold/5',
  },
  medio: {
    label: 'Médio',
    borderColor: 'border-l-purple',
    bgTint: 'bg-purple/5',
  },
  fraco: {
    label: 'Fraco',
    borderColor: 'border-l-muted',
    bgTint: '',
  },
};

function SystemIcon({ name }: { name: string }) {
  const color = SYSTEM_COLORS[name] ?? 'var(--color-muted)';
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="text-sm font-medium text-spiritual-text">{name}</span>
    </span>
  );
}

function ConvergenceCard({ convergencia, index }: { convergencia: Convergence; index: number }) {
  const config = STRENGTH_CONFIG[convergencia.forca];
  const sistemas = convergencia.sistemas;

  return (
    <div
      className={cn(
        'animate-fade-in-up border-l-4 rounded-lg p-4',
        config.borderColor,
        config.bgTint
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Header: strength badge + sistemas */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-sm font-semibold text-spiritual-text">
          [{config.label}]
        </span>
        <span className="text-spiritual-accent-muted">
          ✦ Tríplice Convergência
        </span>
      </div>

      {/* System icons row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
        {sistemas.map((sistema, i) => (
          <span key={sistema} className="inline-flex items-center gap-2">
            <SystemIcon name={sistema} />
            {i < sistemas.length - 1 && (
              <span className="text-spiritual-text-muted text-xs">←→</span>
            )}
          </span>
        ))}
      </div>

      {/* System values */}
      <div className="text-sm text-spiritual-text-muted mb-3">
        <span className="font-medium">{convergencia.energia}</span>
      </div>

      {/* Description */}
      <BodyText variant="mystical" size="sm" className="text-spiritual-text">
        {convergencia.descricao}
      </BodyText>
    </div>
  );
}

export function CorrelacaoInsight({ convergencias, className = '' }: CorrelacaoInsightProps) {
  const forcaCount = convergencias.filter(c => c.forca === 'forte').length;

  return (
    <div className={cn('card-spiritual', className)}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-spiritual-accent" />
          <Heading variant="card" size="md">
            Convergência Espiritual
          </Heading>
        </div>
        {convergencias.length > 0 && (
          <p className="text-sm text-spiritual-text-muted">
            {forcaCount} convergência{forcaCount !== 1 ? 's' : ''} forte{forcaCount !== 1 ? 's' : ''} · {convergencias.length} total
          </p>
        )}
      </div>

      <MysticDivider className="px-6" />

      {/* Content */}
      <div className="p-6">
        {convergencias.length > 0 ? (
          <div className="space-y-4">
            {convergencias.map((conv, i) => (
              <ConvergenceCard key={i} convergencia={conv} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-spiritual-text-muted italic">
              Ainda calculando suas convergências espirituais...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}