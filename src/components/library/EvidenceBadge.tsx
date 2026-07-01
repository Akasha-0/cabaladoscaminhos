// ============================================================================
// EvidenceBadge — Badge do nível de evidência científica (Wave 29)
// ============================================================================
// GRADE-aligned. Hierarquia visual:
//   HIGH (META_ANALYSIS / SYSTEMATIC_REVIEW) — gold star
//   MEDIUM (RCT / COHORT) — silver
//   LOW — bronze
//   ANECDOTAL — pearl/slate
//
// Ícones são lucide-react. Acessibilidade: aria-label descritivo + role.
// ============================================================================

'use client';

import React from 'react';
import { Star, FlaskConical, Microscope, Sparkles, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export type EvidenceLevelValue =
  | 'ANECDOTAL'
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH';

interface EvidenceBadgeProps {
  level: EvidenceLevelValue | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Mostrar ícone (default true) */
  showIcon?: boolean;
  /** Mostrar label completa (default true). Se false, só o ícone. */
  showLabel?: boolean;
}

interface LevelMeta {
  label: string;
  shortLabel: string;
  ariaLabel: string;
  classes: string;
  Icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
}

const LEVEL_META: Record<EvidenceLevelValue, LevelMeta> = {
  HIGH: {
    label: 'Alta evidência',
    shortLabel: 'Alta',
    ariaLabel: 'Nível de evidência ALTO: revisões sistemáticas ou meta-análises de RCTs',
    classes:
      'text-amber-200 border-amber-400/40 bg-gradient-to-r from-amber-500/15 to-yellow-500/10',
    Icon: Star,
  },
  MEDIUM: {
    label: 'Média evidência',
    shortLabel: 'Média',
    ariaLabel: 'Nível de evidência MÉDIO: ensaios randomizados controlados ou coortes',
    classes: 'text-slate-200 border-slate-300/40 bg-slate-300/10',
    Icon: FlaskConical,
  },
  LOW: {
    label: 'Baixa evidência',
    shortLabel: 'Baixa',
    ariaLabel: 'Nível de evidência BAIXO: estudos observacionais pequenos ou séries de casos',
    classes: 'text-orange-300 border-orange-500/30 bg-orange-500/10',
    Icon: Microscope,
  },
  ANECDOTAL: {
    label: 'Anecdótico',
    shortLabel: 'Trad.',
    ariaLabel:
      'Nível de evidência ANECDÓTICO: ensaios, tradição oral ou opinião de especialista',
    classes: 'text-slate-400 border-slate-600/40 bg-slate-700/20',
    Icon: BookOpen,
  },
};

const SIZE_CLASSES: Record<NonNullable<EvidenceBadgeProps['size']>, string> = {
  sm: 'text-[10px] px-1.5 py-0.5 gap-1',
  md: 'text-xs px-2 py-1 gap-1.5',
  lg: 'text-sm px-3 py-1.5 gap-2',
};

const ICON_SIZE: Record<NonNullable<EvidenceBadgeProps['size']>, string> = {
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

export function EvidenceBadge({
  level,
  size = 'md',
  className,
  showIcon = true,
  showLabel = true,
}: EvidenceBadgeProps) {
  const meta = LEVEL_META[level as EvidenceLevelValue] ?? LEVEL_META.ANECDOTAL;
  const { Icon } = meta;

  return (
    <span
      role="status"
      aria-label={meta.ariaLabel}
      title={meta.ariaLabel}
      className={cn(
        'inline-flex items-center rounded-full border font-medium whitespace-nowrap',
        SIZE_CLASSES[size],
        meta.classes,
        className
      )}
    >
      {showIcon && (
        <Icon
          className={cn(ICON_SIZE[size], 'fill-current/20 flex-shrink-0')}
          aria-hidden={true}
        />
      )}
      {showLabel && <span>{meta.shortLabel}</span>}
    </span>
  );
}

// ============================================================================
// TypeBadge — Badge do tipo de fonte (paper, artigo, livro, etc.)
// ============================================================================

export type ArticleTypeValue =
  | 'SCIENTIFIC_PAPER'
  | 'MAGAZINE_ARTICLE'
  | 'BOOK'
  | 'VIDEO'
  | 'PODCAST'
  | 'ESSAY';

interface TypeBadgeProps {
  type: ArticleTypeValue | string;
  size?: 'sm' | 'md';
  className?: string;
}

interface TypeMeta {
  label: string;
  Icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
}

const TYPE_META: Record<ArticleTypeValue, TypeMeta> = {
  SCIENTIFIC_PAPER: { label: 'Paper', Icon: FlaskConical },
  MAGAZINE_ARTICLE: { label: 'Artigo', Icon: Sparkles },
  BOOK: { label: 'Livro', Icon: BookOpen },
  VIDEO: { label: 'Vídeo', Icon: Sparkles },
  PODCAST: { label: 'Podcast', Icon: Sparkles },
  ESSAY: { label: 'Ensaio', Icon: BookOpen },
};

export function TypeBadge({ type, size = 'sm', className }: TypeBadgeProps) {
  const meta = TYPE_META[type as ArticleTypeValue] ?? TYPE_META.ESSAY;
  const { Icon } = meta;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border font-medium',
        size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1',
        'text-slate-300 border-slate-700/40 bg-slate-800/40',
        className
      )}
      aria-label={`Tipo: ${meta.label}`}
    >
      <Icon
        className={cn(size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3', 'flex-shrink-0')}
        aria-hidden={true}
      />
      <span>{meta.label}</span>
    </span>
  );
}