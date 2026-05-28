'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getUpcomingEclipses,
  getEclipseEffects,
  type Eclipse,
  type EclipseEffect,
} from '@/lib/cosmic/eclipses';
import { Sun, Moon, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

function getEclipseTypeIcon(tipo: Eclipse['tipo']) {
  return tipo === 'solar' ? (
    <Sun className="w-5 h-5" />
  ) : (
    <Moon className="w-5 h-5" />
  );
}

function getEclipseTypeLabel(tipo: Eclipse['tipo']): string {
  return tipo === 'solar' ? 'Eclipse Solar' : 'Eclipse Lunar';
}

function getVisibilityColor(visibilidade: Eclipse['visibilidade']): string {
  switch (visibilidade) {
    case 'total':
      return 'bg-red-500/20 text-red-300 border-red-500/50';
    case 'anular':
      return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
    case 'parcial':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
    case 'penumbral':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
  }
}

function getImpactBadgeColor(impacto: EclipseEffect['impactoGeral']): string {
  switch (impacto) {
    case 'transformador':
      return 'bg-red-500/20 text-red-400 border-red-500/50';
    case 'revelador':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
    case 'culminante':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
    case 'introspectivo':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatCountdown(targetDate: Date): { days: number; hours: number; minutes: number; label: string } {
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, label: 'Em andamento' };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  let label = '';
  if (days > 0) {
    label = `${days}d ${hours}h`;
  } else if (hours > 0) {
    label = `${hours}h ${minutes}m`;
  } else {
    label = `${minutes}m`;
  }

  return { days, hours, minutes, label };
}

function getCountdownLabel(targetDate: Date): string {
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs <= 0) return 'Acontecendo agora';
  if (diffDays === 1) return 'Amanhã';
  if (diffDays <= 7) return `Em ${diffDays} dias`;
  if (diffDays <= 30) return `Em ${Math.ceil(diffDays / 7)} semanas`;
  return `Em ${Math.ceil(diffDays / 30)} meses`;
}

function NextEclipseCountdown({ eclipse }: { eclipse: Eclipse }) {
  const [countdown, setCountdown] = useState(() => formatCountdown(eclipse.data));

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(formatCountdown(eclipse.data));
    }, 60000);
    return () => clearInterval(interval);
  }, [eclipse.data]);

  return (
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4 text-amber-400" />
      <span className="text-sm font-medium text-amber-300">{countdown.label}</span>
    </div>
  );
}

function EclipseEffectCard({ effect }: { effect: EclipseEffect }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Badge className={getImpactBadgeColor(effect.impactoGeral)}>
          {effect.impactoGeral}
        </Badge>
        <Badge className="bg-slate-700/50 text-slate-300 border-slate-600/50">
          {effect.areaVida}
        </Badge>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed">
        {effect.eclipse.significadoEspiritual}
      </p>

      <div className="flex flex-wrap gap-1">
        {effect.temas.map((tema, idx) => (
          <span
            key={idx}
            className="px-2 py-0.5 text-xs rounded-full bg-indigo-900/30 text-indigo-300 border border-indigo-500/30"
          >
            {tema}
          </span>
        ))}
      </div>

      <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-600/20">
        <p className="text-xs text-amber-200/80 leading-relaxed">
          <TrendingUp className="w-3 h-3 inline mr-1" />
          {effect.recomendacao}
        </p>
      </div>
    </div>
  );
}

function EclipseCard({ eclipse }: { eclipse: Eclipse }) {
  const effect = getEclipseEffects(eclipse);

  return (
    <div className="p-4 rounded-lg bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${eclipse.tipo === 'solar' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
            {getEclipseTypeIcon(eclipse.tipo)}
          </div>
          <div>
            <p className="font-semibold text-slate-100">{getEclipseTypeLabel(eclipse.tipo)}</p>
            <p className="text-xs text-slate-400">
              {eclipse.signo.charAt(0).toUpperCase() + eclipse.signo.slice(1)} {eclipse.grau}°
            </p>
          </div>
        </div>
        <Badge className={getVisibilityColor(eclipse.visibilidade)}>
          {eclipse.visibilidade}
        </Badge>
      </div>

      <div className="mb-3">
        <p className="text-xs text-slate-400 mb-1">Data do evento</p>
        <p className="text-sm font-medium text-slate-200">{formatDate(eclipse.data)}</p>
        <NextEclipseCountdown eclipse={eclipse} />
      </div>

      <EclipseEffectCard effect={effect} />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="w-32 h-4" />
              <Skeleton className="w-24 h-3" />
            </div>
            <Skeleton className="w-20 h-5 rounded-full ml-auto" />
          </div>
          <Skeleton className="w-full h-4 mb-2" />
          <Skeleton className="w-3/4 h-4 mb-4" />
          <div className="flex gap-2">
            <Skeleton className="w-16 h-5 rounded-full" />
            <Skeleton className="w-16 h-5 rounded-full" />
            <Skeleton className="w-16 h-5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EclipseTracker() {
  const [eclipses, setEclipses] = useState<Eclipse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEclipses = () => {
      const upcomingEclipses = getUpcomingEclipses(new Date(), 5);
      setEclipses(upcomingEclipses);
      setLoading(false);
    };

    loadEclipses();
    const interval = setInterval(loadEclipses, 60000);
    return () => clearInterval(interval);
  }, []);

  const nextEclipse = eclipses.length > 0 ? eclipses[0] : null;

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/90 border-slate-700/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Rastreamento de Eclipses
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (eclipses.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/90 border-slate-700/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Rastreamento de Eclipses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">
              Nenhum eclipse previsto no horizonte próximo
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/90 border-slate-700/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Rastreamento de Eclipses
          </CardTitle>
          {nextEclipse && (
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">
              Próximo: {getCountdownLabel(nextEclipse.data)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {eclipses.map((eclipse, index) => (
            <EclipseCard key={`${eclipse.data.getTime()}-${index}`} eclipse={eclipse} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}