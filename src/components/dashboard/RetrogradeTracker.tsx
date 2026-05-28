'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getRetrogradePeriods, type RetrogradePeriod } from '@/lib/cosmic/retrograde';
import { RotateCcw, AlertTriangle, Clock } from 'lucide-react';

const PLANET_LABELS = {
  mercury: 'Mercúrio',
  venus: 'Vênus',
  mars: 'Marte',
};

const PLANET_COLORS = {
  mercury: {
    border: 'border-yellow-500/30',
    bg: 'bg-gradient-to-br from-yellow-900/20 to-orange-950/50',
    badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    icon: 'text-yellow-400',
  },
  venus: {
    border: 'border-pink-500/30',
    bg: 'bg-gradient-to-br from-pink-900/20 to-rose-950/50',
    badge: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    icon: 'text-pink-400',
  },
  mars: {
    border: 'border-red-500/30',
    bg: 'bg-gradient-to-br from-red-900/20 to-red-950/50',
    badge: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: 'text-red-400',
  },
};

function formatDateRange(start: Date, end: Date): string {
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  const startStr = start.toLocaleDateString('pt-BR', opts);
  const endStr = end.toLocaleDateString('pt-BR', opts);
  return `${startStr} – ${endStr}`;
}

function getDaysRemaining(end: Date): number {
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getStatusBadge(period: RetrogradePeriod, isActive: boolean) {
  if (isActive) {
    const daysLeft = getDaysRemaining(period.end);
    return (
      <Badge className={`${PLANET_COLORS[period.planet].badge} animate-pulse`}>
        <Clock className="w-3 h-3 mr-1" />
        {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Encerra hoje'}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-slate-500/30 text-slate-400">
      <Clock className="w-3 h-3 mr-1" />
      {formatDateRange(period.start, period.end)}
    </Badge>
  );
}

function RetrogradeCard({ period, isActive }: { period: RetrogradePeriod; isActive: boolean }) {
  const colors = PLANET_COLORS[period.planet];

  return (
    <div className={`
      p-4 rounded-lg border ${colors.border}
      ${isActive ? 'ring-1 ring-yellow-500/50' : ''}
      transition-all
    `}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <RotateCcw className={`w-4 h-4 ${colors.icon}`} />
          <span className="font-cinzel text-sm font-semibold text-slate-200">
            {PLANET_LABELS[period.planet]}
          </span>
        </div>
        {getStatusBadge(period, isActive)}
      </div>

      {isActive && (
        <div className="mt-3 space-y-2">
          <div className="flex items-start gap-2 p-2 bg-amber-950/30 rounded border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200 leading-relaxed">
              {period.advice}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export function RetrogradeTracker() {
  const { activePeriods, upcomingPeriods } = useMemo(() => {
    const now = new Date();
    const all = getRetrogradePeriods();

    const active = all.filter(p => now >= p.start && now <= p.end);
    const upcoming = all
      .filter(p => now < p.start)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 4);

    return { activePeriods: active, upcomingPeriods: upcoming };
  }, []);

  if (activePeriods.length === 0 && upcomingPeriods.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-slate-900/50 to-slate-950 border-slate-700/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-slate-400" />
            <CardTitle className="font-cinzel text-slate-400">
              Trânsitos Retrógrados
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            Nenhum trânsito retrógrado ativo ou próximo.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-900/20 to-purple-950/50 border-indigo-500/30">
      <CardHeader>
        <div className="flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-indigo-400" />
          <CardTitle className="font-cinzel text-indigo-400">
            Trânsitos Retrógrados
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activePeriods.length > 0 ? (
          <>
            <div className="flex items-center gap-2 p-2 bg-amber-900/20 rounded border border-amber-500/30">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-amber-300 font-medium">
                {activePeriods.length} planeta(s) em retrogradação
              </span>
            </div>
            <div className="space-y-3">
              {activePeriods.map((period, i) => (
                <RetrogradeCard key={`active-${i}`} period={period} isActive={true} />
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-emerald-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Nenhum planeta retrógrado neste momento
          </p>
        )}

        {upcomingPeriods.length > 0 && (
          <>
            <div className="border-t border-indigo-500/20 pt-3">
              <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">
                Próximas retrogradações
              </p>
              <div className="space-y-2">
                {upcomingPeriods.map((period, i) => (
                  <RetrogradeCard key={`upcoming-${i}`} period={period} isActive={false} />
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}