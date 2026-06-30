// ============================================================================
// FlagRow — Card mobile-first para uma flag (Wave 20)
// ============================================================================
// Server component: recebe definition + state e renderiza o card com os
// controles client. Os controles (toggle, rollout slider, whitelist input)
// são interativos via subcomponentes 'use client'.
// ============================================================================

import * as React from 'react';
import type { FeatureFlagDefinition } from '@/lib/feature-flags/flags';
import type { FlagState } from '@/lib/feature-flags/storage';
import { FlagControls } from './flag-controls';
import { cn } from '@/lib/utils';

// ============================================================================
// Helpers
// ============================================================================

function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusBadge(def: FeatureFlagDefinition, state: FlagState | null) {
  if (state?.enabled === true) {
    return { label: 'Forced ON', color: 'bg-green-100 text-green-900' };
  }
  if (state?.enabled === false) {
    return { label: 'Forced OFF', color: 'bg-red-100 text-red-900' };
  }
  if (def.type === 'percentage') {
    const pct = state?.rolloutPercent ?? def.rolloutPercent ?? 0;
    return {
      label: `${pct}% rollout`,
      color: 'bg-blue-100 text-blue-900',
    };
  }
  return { label: 'Default', color: 'bg-gray-100 text-gray-900' };
}

// ============================================================================
// Component
// ============================================================================

export function FlagRow({
  definition,
  state,
}: {
  definition: FeatureFlagDefinition;
  state: FlagState | null;
}) {
  const badge = statusBadge(definition, state);
  const effectiveRollout = state?.rolloutPercent ?? definition.rolloutPercent ?? 0;
  const effectiveWhitelist = state?.whitelist ?? definition.whitelist ?? [];

  return (
    <article
      className={cn(
        'rounded-lg border bg-card p-4 text-card-foreground shadow-sm',
        'transition-colors hover:bg-accent/30'
      )}
      aria-label={`Flag ${definition.key}`}
    >
      {/* Header: key + status badge */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <code className="break-all text-sm font-semibold sm:text-base">
          {definition.key}
        </code>
        <span
          className={cn(
            'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
            badge.color
          )}
        >
          {badge.label}
        </span>
      </div>

      {/* Description */}
      <p className="mt-2 text-sm text-muted-foreground">{definition.description}</p>

      {/* Meta: owner + type + expires */}
      <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
        <span className="rounded bg-secondary px-2 py-0.5">
          owner: {definition.owner}
        </span>
        <span className="rounded bg-secondary px-2 py-0.5">
          type: {definition.type}
        </span>
        {definition.expiresAt && (
          <span className="rounded bg-amber-100 px-2 py-0.5 text-amber-900">
            expira: {definition.expiresAt}
          </span>
        )}
      </div>

      {/* Controls (client) */}
      <FlagControls
        flagKey={definition.key}
        type={definition.type}
        currentEnabled={state?.enabled ?? null}
        currentRollout={effectiveRollout}
        currentWhitelist={effectiveWhitelist}
      />

      {/* Audit trail */}
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-border/50 pt-2 text-xs text-muted-foreground">
        <span>atualizado: {formatDate(state?.updatedAt)}</span>
        <span>por: {state?.updatedBy ?? 'system'}</span>
      </div>
    </article>
  );
}
