'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, Brain, RefreshCw, Calendar, Moon, Star, Zap, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// DAILY ACTION WIDGET
// ============================================================
// Widget agêntico DINÂMICO que:
// 1. Calcula automaticamente o contexto espiritual do dia
// 2. Chama a IA MiniMax M3 para gerar recomendação
// 3. Mostra 3 ações práticas prioritárias
// 4. Inclui fase lunar, dia pessoal, trânsitos
//
// TOTALMENTE DINÂMICO - não usa dados estáticos.
// ============================================================

interface UserData {
  nome: string;
  dataNascimento: string;
  horaNascimento?: string;
  localNascimento?: string;
  fullName?: string;
  caminhoDeVida?: number;
  signoSolar?: string;
  ascendente?: string;
  oduNascimento?: string;
  orixaRegente?: string;
}

interface DailyContext {
  personalDay: {
    number: number;
    energy: string;
    action: string;
    affirmation: string;
    favorable: string;
    avoid: string;
    color: string;
    chakra: string;
  };
  personalMonth: { number: number; theme: string };
  personalYear: { number: number; theme: string };
  dailyEnergy: {
    overallEnergy: number;
    overallTheme: string;
    keyAdvice: string;
    luckyColor: string;
    luckyNumber: number;
    powerHour: string;
    moonPhase: {
      name: string;
      energy: string;
      action: string;
      illumination: number;
      favorableFor: string[];
    };
    majorAspects: Array<{
      transitPlanet: string;
      natalPlanet: string;
      aspect: string;
      interpretation: string;
      energy: string;
    }>;
  };
  age: number;
  currentPinnacleTheme: string;
}

interface RecommendationResult {
  content: string;
  source: 'minimax-m3' | 'fallback';
}

interface DailyActionWidgetProps {
  userData: UserData;
  className?: string;
  autoLoad?: boolean;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function DailyActionWidget({ userData, className, autoLoad = true }: DailyActionWidgetProps) {
  const [context, setContext] = useState<DailyContext | null>(null);
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFullRecommendation, setShowFullRecommendation] = useState(false);

  useEffect(() => {
    if (autoLoad) {
      loadDaily();
    }
  }, [userData.nome, userData.dataNascimento]);

  const loadDaily = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'daily',
          user: userData,
          useAI: true,
        }),
      });

      if (!res.ok) throw new Error('Erro ao carregar recomendação');

      const data = await res.json();
      setContext(data.context);
      setRecommendation(data.recommendation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <Card className={cn(
      'card-spiritual bg-gradient-to-br from-slate-900/95 via-amber-950/30 to-violet-950/30 backdrop-blur-sm border-amber-500/30 overflow-hidden',
      className
    )}>
      {/* Glow effect */}
      <div className="absolute -inset-px bg-gradient-to-r from-amber-500/10 via-transparent to-violet-500/10 rounded-xl pointer-events-none" />

      <CardHeader className="pb-3 border-b border-amber-500/20 relative">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/30 to-violet-500/30 border border-amber-500/40 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-base font-bold bg-gradient-to-r from-amber-300 via-amber-200 to-violet-300 bg-clip-text text-transparent block">
                Sua Direção de Hoje
              </span>
              <span className="text-xs text-slate-400">{today}</span>
            </div>
          </CardTitle>

          <div className="flex items-center gap-1.5">
            {recommendation?.source === 'minimax-m3' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium flex items-center gap-1">
                <Brain className="w-3 h-3" /> IA M3
              </span>
            )}
            <button
              onClick={loadDaily}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors disabled:opacity-50"
              title="Atualizar"
            >
              <RefreshCw className={cn('w-4 h-4 text-slate-400', loading && 'animate-spin')} />
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4 relative">
        {loading && !context ? (
          <LoadingState />
        ) : error ? (
          <ErrorState error={error} onRetry={loadDaily} />
        ) : context ? (
          <>
            {/* Header de energia */}
            <div className="grid grid-cols-3 gap-2">
              <EnergyBadge
                label="Dia"
                value={context.personalDay.number}
                color="amber"
                subtitle={context.personalDay.energy.slice(0, 12)}
              />
              <EnergyBadge
                label="Mês"
                value={context.personalMonth.number}
                color="violet"
                subtitle={context.personalMonth.theme.slice(0, 14)}
              />
              <EnergyBadge
                label="Energia"
                value={`${context.dailyEnergy.overallEnergy}`}
                color="emerald"
                subtitle={`/100`}
              />
            </div>

            {/* Lua + Trânsitos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <div className="flex items-center gap-2 mb-1">
                  <Moon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-400">Lua</span>
                </div>
                <p className="text-sm text-white font-medium">{context.dailyEnergy.moonPhase.name}</p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{context.dailyEnergy.moonPhase.energy}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs text-slate-400">Trânsitos</span>
                </div>
                <p className="text-sm text-white font-medium">
                  {context.dailyEnergy.majorAspects.length} aspectos
                </p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                  {context.dailyEnergy.majorAspects[0]
                    ? `${context.dailyEnergy.majorAspects[0].transitPlanet} ${context.dailyEnergy.majorAspects[0].aspect}`
                    : 'Calmo'}
                </p>
              </div>
            </div>

            {/* Recomendação */}
            {recommendation && (
              <div className="rounded-xl bg-gradient-to-br from-amber-500/5 to-violet-500/5 border border-amber-500/20 overflow-hidden">
                <button
                  onClick={() => setShowFullRecommendation(!showFullRecommendation)}
                  className="w-full p-3 text-left hover:bg-amber-500/5 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      {showFullRecommendation ? 'Recomendações Completas' : 'Toque para ver completo'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {showFullRecommendation ? '▼' : '▶'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 line-clamp-3 leading-relaxed">
                    {recommendation.content.replace(/[#*]/g, '').split('\n').filter(l => l.trim()).slice(0, 3).join(' ').slice(0, 250)}...
                  </p>
                </button>

                {showFullRecommendation && (
                  <div className="px-3 pb-3 max-h-[400px] overflow-y-auto">
                    <MarkdownContent content={recommendation.content} />
                  </div>
                )}
              </div>
            )}

            {/* Ações rápidas */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={loadDaily}
                disabled={loading}
                className="p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-700/40 border border-slate-700/40 text-left transition-colors disabled:opacity-50"
              >
                <RefreshCw className={cn('w-3.5 h-3.5 text-amber-400 mb-1', loading && 'animate-spin')} />
                <p className="text-xs font-medium text-white">Nova Recomendação</p>
                <p className="text-[10px] text-slate-500">Da IA M3</p>
              </button>
              <a
                href="/dashboard/life-areas"
                className="p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-700/40 border border-slate-700/40 text-left transition-colors block"
              >
                <Sparkles className="w-3.5 h-3.5 text-violet-400 mb-1" />
                <p className="text-xs font-medium text-white">12 Áreas</p>
                <p className="text-[10px] text-slate-500">Mapa completo</p>
              </a>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function EnergyBadge({
  label,
  value,
  color,
  subtitle,
}: {
  label: string;
  value: string | number;
  color: 'amber' | 'violet' | 'emerald' | 'cyan' | 'pink';
  subtitle: string;
}) {
  const colorClasses = {
    amber: 'from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-300',
    violet: 'from-violet-500/20 to-violet-500/5 border-violet-500/30 text-violet-300',
    emerald: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-300',
    cyan: 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-300',
    pink: 'from-pink-500/20 to-pink-500/5 border-pink-500/30 text-pink-300',
  };

  return (
    <div className={cn(
      'p-2.5 rounded-lg bg-gradient-to-br border text-center',
      colorClasses[color]
    )}>
      <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-[10px] text-slate-500 line-clamp-1">{subtitle}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3 py-4">
      <div className="flex flex-col items-center justify-center gap-2">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        <p className="text-sm text-amber-300">Calculando contexto espiritual...</p>
        <p className="text-xs text-slate-500">Cruzando Numerologia + Astrologia + Odu + Orixá + Trânsitos</p>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="space-y-2 py-4">
      <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-red-300">{error}</p>
          <button
            onClick={onRetry}
            className="text-xs text-amber-400 hover:underline mt-1"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split('\n');
  const rendered: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    if (line.startsWith('## ')) {
      rendered.push(
        <h3 key={i} className="text-sm font-semibold text-amber-300 mt-3 mb-1.5 flex items-center gap-1.5">
          <span className="w-0.5 h-3.5 bg-amber-400 rounded" />
          {line.replace('## ', '')}
        </h3>
      );
    } else if (line.startsWith('### ')) {
      rendered.push(
        <h4 key={i} className="text-xs font-semibold text-violet-300 mt-2 mb-1">
          {line.replace('### ', '')}
        </h4>
      );
    } else if (line.match(/^\d+\.\s/)) {
      rendered.push(
        <p key={i} className="text-xs text-slate-300 leading-relaxed ml-3 mb-1">
          {line}
        </p>
      );
    } else if (line.startsWith('> ')) {
      rendered.push(
        <blockquote key={i} className="border-l-2 border-amber-400/40 pl-2 my-1.5 italic text-xs text-slate-300">
          {line.replace('> ', '')}
        </blockquote>
      );
    } else if (line.trim() === '') {
      // skip
    } else {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const processed = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="text-white font-semibold">{part.replace(/\*\*/g, '')}</strong>;
        }
        return <span key={j}>{part}</span>;
      });
      rendered.push(
        <p key={i} className="text-xs text-slate-300 leading-relaxed mb-1.5">
          {processed}
        </p>
      );
    }
  });

  return <div className="pt-2 border-t border-amber-500/10">{rendered}</div>;
}

export default DailyActionWidget;
