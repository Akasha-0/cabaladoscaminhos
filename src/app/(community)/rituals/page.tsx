'use client';

// ============================================================================
// RITUALS — /rituals (Wave 32, 2026-06-30)
// ============================================================================
// Daily Ritual System — Mobile-first bottom sheet UX.
//
// Princípios:
//   - LGPD: opt-in obrigatório (toggle no topo)
//   - Sem leaderboard (gaming ético)
//   - Streak visível, mas não punitivo
//   - 7 tipos em grade de cards (toque = bottom sheet "registrar")
//   - Streak atual + próximo milestone + freeze tokens
//   - Missão semanal (5 rituais) com progress
//
// Server-rendered como shell; lógica interativa toda client-side.
// Para persistência real, conectar a /api/rituals/* (próximo wave).
// ============================================================================

import React, { useState, useMemo, useCallback } from 'react';
import { Flame, Snowflake, Trophy, Sparkles, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/button';
import {
  RITUAL_TYPES,
  RITUAL_TYPE_META,
  STREAK_MILESTONES,
  type RitualType,
  type UserRitualProfile,
  DEFAULT_RITUAL_PROFILE,
  summarizeStreak,
} from '@/lib/community/rituals';

// ============================================================================
// Constantes UI
// ============================================================================

const TIME_OF_DAY_GREETING: Record<'morning' | 'afternoon' | 'evening' | 'night', string> = {
  morning: 'Bom dia',
  afternoon: 'Boa tarde',
  evening: 'Boa noite',
  night: 'Vigília',
};

function timeOfDayGreeting(hour: number): keyof typeof TIME_OF_DAY_GREETING {
  if (hour < 6) return 'night';
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

// ============================================================================
// Component
// ============================================================================

export default function RitualsPage(): React.ReactElement {
  const [profile, setProfile] = useState<UserRitualProfile>({
    ...DEFAULT_RITUAL_PROFILE,
    userId: 'demo-user',
  });
  const [selectedType, setSelectedType] = useState<RitualType | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [weeklyProgress, setWeeklyProgress] = useState(3); // demo: 3/5

  const summary = useMemo(() => summarizeStreak(profile), [profile]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return TIME_OF_DAY_GREETING[timeOfDayGreeting(hour)];
  }, []);

  const handleSelectType = useCallback((type: RitualType) => {
    setSelectedType(type);
    setSheetOpen(true);
  }, []);

  const handleConfirmRitual = useCallback(
    (durationMin: number) => {
      // Demo: incrementa local state. Em produção → POST /api/rituals/entries
      setProfile((p) => ({
        ...p,
        currentStreak: p.currentStreak + 1,
        longestStreak: Math.max(p.longestStreak, p.currentStreak + 1),
        totalRitualsCompleted: p.totalRitualsCompleted + 1,
        lastRitualLocalDate: new Date().toISOString().slice(0, 10),
      }));
      setWeeklyProgress((w) => Math.min(5, w + 1));
      setSheetOpen(false);
      setSelectedType(null);
    },
    []
  );

  const handleToggleOptIn = useCallback(() => {
    setProfile((p) => ({
      ...p,
      optedIn: !p.optedIn,
      // Se opt-out, streak preserva (não punição), mas não computa novos
    }));
  }, []);

  const handleConsumeFreeze = useCallback(() => {
    setProfile((p) =>
      p.freezeTokens > 0
        ? { ...p, freezeTokens: p.freezeTokens - 1 }
        : p
    );
  }, []);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 pb-24">
      {/* Header */}
      <header className="mb-6">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {greeting}
        </p>
        <h1 className="font-serif text-3xl font-semibold text-foreground">
          Rituais Diários
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          7 práticas para nutrir sua presença cotidiana.
        </p>
      </header>

      {/* LGPD Opt-in banner */}
      {!profile.optedIn && (
        <div
          role="region"
          aria-label="Opt-in de rituais"
          className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30"
        >
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-300" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                Opt-in necessário (LGPD)
              </p>
              <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
                Para acompanhar seu streak, você precisa consentir com a coleta
                de dados de presença. Você pode revogar a qualquer momento.
              </p>
              <Button
                size="sm"
                onClick={handleToggleOptIn}
                className="mt-3"
                variant="default"
              >
                Ativar rituais
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Streak summary */}
      {profile.optedIn && (
        <section
          aria-labelledby="streak-heading"
          className="mb-6 rounded-3xl border border-border bg-card p-5 shadow-sm"
        >
          <div className="flex items-baseline justify-between">
            <div>
              <h2
                id="streak-heading"
                className="font-serif text-xl font-medium text-foreground"
              >
                Streak atual
              </h2>
              <div className="mt-2 flex items-baseline gap-2">
                <span
                  className="text-4xl font-bold text-primary"
                  aria-live="polite"
                >
                  {summary.current}
                </span>
                <span className="text-sm text-muted-foreground">dias</span>
              </div>
            </div>
            <Flame
              className={cn(
                'size-12',
                summary.current > 0 ? 'text-orange-500' : 'text-muted-foreground/30'
              )}
              aria-hidden="true"
            />
          </div>

          {summary.nextMilestone && (
            <div className="mt-4 rounded-xl bg-muted/50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Próximo milestone
                </span>
                <span className="font-medium">
                  {summary.nextMilestone.badge} {summary.nextMilestone.days} dias
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-background">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      (summary.current / summary.nextMilestone.days) * 100
                    )}%`,
                  }}
                  role="progressbar"
                  aria-valuenow={summary.current}
                  aria-valuemin={0}
                  aria-valuemax={summary.nextMilestone.days}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Faltam {summary.nextMilestone.daysRemaining} dias
              </p>
            </div>
          )}

          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Trophy className="size-4 text-amber-500" aria-hidden="true" />
              <span>Recorde: {summary.longest}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Snowflake
                className={cn(
                  'size-4',
                  summary.freezeTokens > 0
                    ? 'text-cyan-500'
                    : 'text-muted-foreground/30'
                )}
                aria-hidden="true"
              />
              <span>{summary.freezeTokens} freeze</span>
              {summary.freezeTokens > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleConsumeFreeze}
                  className="h-6 px-2 text-xs"
                  aria-label="Consumir freeze token"
                >
                  usar
                </Button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Weekly mission */}
      {profile.optedIn && (
        <section
          aria-labelledby="mission-heading"
          className="mb-6 rounded-2xl border border-border bg-card p-4"
        >
          <h2
            id="mission-heading"
            className="font-serif text-base font-medium text-foreground"
          >
            Missão semanal
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            5 rituais em 7 dias — sem pressão diária.
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold">{weeklyProgress}/5</span>
            <span className="text-xs text-muted-foreground">
              esta semana
            </span>
          </div>
          <div className="mt-2 flex gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className={cn(
                  'h-2 flex-1 rounded-full',
                  i < weeklyProgress ? 'bg-primary' : 'bg-muted'
                )}
                aria-hidden="true"
              />
            ))}
          </div>
        </section>
      )}

      {/* 7 ritual types grid */}
      <section aria-labelledby="rituals-heading">
        <h2
          id="rituals-heading"
          className="mb-3 font-serif text-lg font-medium text-foreground"
        >
          Registrar ritual
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {RITUAL_TYPES.map((type) => {
            const meta = RITUAL_TYPE_META[type];
            const isPreferred = profile.preferredTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleSelectType(type)}
                disabled={!profile.optedIn}
                aria-label={`Registrar ${meta.labelPt}, duração sugerida ${meta.durationMin} minutos`}
                className={cn(
                  'group relative flex flex-col items-start gap-2 rounded-2xl border border-border bg-card p-4 text-left transition-all',
                  'hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5',
                  'active:scale-[0.98]',
                  'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                  'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0',
                  'min-h-[88px]'
                )}
              >
                <span
                  className="text-3xl"
                  role="img"
                  aria-label={meta.labelPt}
                >
                  {meta.emoji}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{meta.labelPt}</p>
                  <p className="text-xs text-muted-foreground">
                    {meta.durationMin} min
                  </p>
                </div>
                {isPreferred && (
                  <span
                    className="absolute right-2 top-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                    aria-label="Ritual preferido"
                  >
                    ★
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Milestones footer */}
      {profile.optedIn && (
        <section
          aria-labelledby="milestones-heading"
          className="mt-8 rounded-2xl border border-border bg-card p-4"
        >
          <h2
            id="milestones-heading"
            className="mb-3 font-serif text-base font-medium text-foreground"
          >
            Marcos da jornada
          </h2>
          <ul className="space-y-2">
            {STREAK_MILESTONES.map((m) => {
              const reached = summary.current >= m.days;
              const celebrated = summary.celebratedBadges.includes(m.badge);
              return (
                <li
                  key={m.days}
                  className={cn(
                    'flex items-center gap-3 rounded-lg p-2',
                    reached && 'bg-primary/5'
                  )}
                >
                  <span className="text-2xl" aria-hidden="true">
                    {m.badge}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{m.rewardPt}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.days} dias consecutivos
                    </p>
                  </div>
                  {celebrated ? (
                    <Check
                      className="size-5 text-green-600"
                      aria-label="Celebrado"
                    />
                  ) : reached ? (
                    <span
                      className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium text-primary"
                      aria-label="Atingido"
                    >
                      novo!
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {m.days - summary.current}d
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Opt-out footer */}
      {profile.optedIn && (
        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleOptIn}
            className="text-xs text-muted-foreground"
          >
            <X className="mr-1 size-3" />
            Desativar rituais (LGPD)
          </Button>
        </div>
      )}

      {/* Bottom sheet for ritual details */}
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={selectedType ? RITUAL_TYPE_META[selectedType].labelPt : ''}
        description={
          selectedType ? RITUAL_TYPE_META[selectedType].description : ''
        }
      >
        {selectedType && (
          <RitualDetailForm
            type={selectedType}
            onConfirm={handleConfirmRitual}
            onCancel={() => setSheetOpen(false)}
          />
        )}
      </BottomSheet>
    </main>
  );
}

// ============================================================================
// Ritual detail form (inside BottomSheet)
// ============================================================================

interface RitualDetailFormProps {
  type: RitualType;
  onConfirm: (durationMin: number) => void;
  onCancel: () => void;
}

function RitualDetailForm({
  type,
  onConfirm,
  onCancel,
}: RitualDetailFormProps): React.ReactElement {
  const meta = RITUAL_TYPE_META[type];
  const [duration, setDuration] = useState(meta.durationMin);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-2xl bg-muted/30 p-4">
        <span className="text-4xl" role="img" aria-label={meta.labelPt}>
          {meta.emoji}
        </span>
        <div className="flex-1">
          <p className="font-medium">{meta.labelPt}</p>
          <p className="text-sm text-muted-foreground">{meta.description}</p>
        </div>
      </div>

      <div>
        <label
          htmlFor="duration"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Duração efetiva (minutos)
        </label>
        <input
          id="duration"
          type="number"
          min={1}
          max={480}
          value={duration}
          onChange={(e) => setDuration(Math.max(1, Math.min(480, Number(e.target.value))))}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          variant="default"
          onClick={() => onConfirm(duration)}
          className="flex-1"
        >
          <Check className="mr-1 size-4" />
          Registrar
        </Button>
      </div>
    </div>
  );
}