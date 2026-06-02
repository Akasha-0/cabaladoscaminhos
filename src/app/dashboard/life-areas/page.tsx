'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WidgetProgress, WidgetCard } from '@/components/dashboard/SpiritualWidgetSystem';
import { LifeAreasOverview } from '@/components/dashboard/LifeAreasOverview';
import {
  Compass, Sparkles, Loader2, ArrowLeft, Brain,
  Briefcase, DollarSign, Heart, Home, Users, BookOpen,
  Flame, Palette, Stethoscope, Eye, Star, Download,
  ChevronRight, Activity, Calendar, Lock, Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  correlateLifeAreas,
  generateDetailedAreaInsight,
  UserProfile,
  LifeMapResult,
  LifeAreaId,
  LIFE_AREAS,
  AIInsight,
} from '@/lib/life-areas';

// ============================================================
// ICON MAP
// ============================================================

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Compass, Briefcase, DollarSign, Heart, Home, Sparkles, Flame, Users, BookOpen, Eye, Stethoscope, Palette,
  Star, ChevronRight, Activity, Calendar, Brain,
};

// ============================================================
// DEMO PROFILE (para preview sem login)
// ============================================================

const DEMO_PROFILE: UserProfile = {
  nome: 'Buscador Espiritual',
  dataNascimento: '1990-03-15',
  horaNascimento: '14:30',
  localNascimento: 'Salvador, BA',
  caminhoDeVida: 7,
  numeroDestino: 11,
  numeroExpressao: 9,
  anoPessoal: 3,
  signoSolar: 'Peixes',
  ascendente: 'Câncer',
  lua: 'Escorpião',
  planetaDominante: 'Netuno',
  casaForte: 8,
  oduNascimento: 'Irete',
  orixaRegente: 'Oxum',
  chakraDominante: '6º Frontal',
  elementoDominante: 'Água',
};

// ============================================================
// MAIN PAGE
// ============================================================

export default function LifeAreasPage() {
  const [profile, setProfile] = useState<UserProfile>(DEMO_PROFILE);
  const [result, setResult] = useState<LifeMapResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState<LifeAreaId | null>(null);
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  const computeMap = useCallback(async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const map = correlateLifeAreas(profile);
    setResult(map);
    setLoading(false);
  }, [profile]);

  // Compute map on mount
  useEffect(() => {
    computeMap();
  }, [computeMap]);

  const handleSelectArea = async (areaId: LifeAreaId) => {
    setSelectedArea(areaId);
    setInsightLoading(true);
    setInsight(null);

    if (!result) return;

    const corr = result.correlations.find(c => c.area.id === areaId);
    if (!corr) return;

    try {
      const generated = await generateDetailedAreaInsight(profile, areaId, corr);
      setInsight(generated);
    } catch (err) {
      console.error('Error generating insight:', err);
    } finally {
      setInsightLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedArea(null);
    setInsight(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-violet-400 bg-clip-text text-transparent">
              Áreas da Vida
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Correlação multi-tradicional com IA para compreender cada dimensão do seu ser
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5" /> IA M3
            </span>
            <span className="text-xs text-slate-500">|</span>
            <span className="text-xs text-slate-400">12 dimensões</span>
          </div>
        </div>

        {/* Selected area view OR overview */}
        {selectedArea ? (
          <AreaDetailView
            areaId={selectedArea}
            insight={insight}
            loading={insightLoading}
            correlation={result?.correlations.find(c => c.area.id === selectedArea) || null}
            onBack={handleBack}
            onRegenerate={() => handleSelectArea(selectedArea)}
          />
        ) : (
          <>
            {/* Overview card */}
            <LifeAreasOverview
              result={result}
              loading={loading}
              onSelectArea={handleSelectArea}
            />

            {/* Grid of all 12 areas */}
            {result && !loading && (
              <LifeAreasGrid
                result={result}
                onSelectArea={handleSelectArea}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// LIFE AREAS GRID (12 áreas)
// ============================================================

function LifeAreasGrid({ result, onSelectArea }: {
  result: LifeMapResult;
  onSelectArea: (id: LifeAreaId) => void;
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-400" />
        Todas as 12 Áreas
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {result.correlations.map((corr) => {
          const IconComponent = ICON_MAP[corr.area.icon] || Compass;
          return (
            <button
              key={corr.area.id}
              onClick={() => onSelectArea(corr.area.id)}
              className="text-left group"
            >
              <div
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/50 hover:border-slate-700/80 transition-all group-hover:scale-[1.02] group-hover:shadow-xl"
                style={{
                  boxShadow: `0 4px 20px -8px ${corr.area.color}30`,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${corr.area.color}25, ${corr.area.color}08)`,
                        border: `1px solid ${corr.area.color}30`,
                      }}
                    >
                      <IconComponent className="w-5 h-5" style={{ color: corr.area.color }} />
                    </div>
                    <div>
                      <span className="text-2xl">{corr.area.emoji}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </div>

                <h3 className="text-sm font-semibold text-white mb-1">{corr.area.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                  {corr.area.description}
                </p>

                <WidgetProgress
                  label="Afinidade"
                  value={corr.score}
                  max={100}
                  color="amber"
                />

                <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: `${corr.area.color}15`,
                      color: corr.area.color,
                    }}
                  >
                    {corr.intensidade}
                  </span>
                  {corr.matches.slice(0, 2).map((m, i) => (
                    <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-slate-800/60 text-slate-400">
                      {m.value}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// AREA DETAIL VIEW
// ============================================================

// fallow-ignore-next-line complexity
function AreaDetailView({
  areaId,
  insight,
  loading,
  correlation,
  onBack,
  onRegenerate,
}: {
  areaId: LifeAreaId;
  insight: AIInsight | null;
  loading: boolean;
  correlation: any;
  onBack: () => void;
  onRegenerate: () => void;
}) {
  const area = LIFE_AREAS[areaId];
  if (!area) return null;

  const IconComponent = ICON_MAP[area.icon] || Compass;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-amber-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para o mapa
      </button>

      {/* Area Header */}
      <div
        className="p-6 rounded-2xl border backdrop-blur-sm"
        style={{
          background: `linear-gradient(135deg, ${area.color}20, ${area.color}05)`,
          borderColor: `${area.color}40`,
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${area.color}30, ${area.color}10)`,
              border: `1px solid ${area.color}40`,
            }}
          >
            <IconComponent className="w-8 h-8" style={{ color: area.color }} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-3xl">{area.emoji}</span>
              <h2 className="text-2xl font-bold text-white">{area.name}</h2>
            </div>
            <p className="text-sm text-slate-300 mb-3">{area.description}</p>

            {correlation && (
              <div className="flex items-center gap-3">
                <span
                  className="text-sm px-3 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: `${area.color}20`,
                    color: area.color,
                  }}
                >
                  {correlation.score}% de afinidade
                </span>
                <span className="text-xs text-slate-400">
                  Intensidade {correlation.intensidade}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Correlation details */}
      {correlation && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Astrologia */}
          <WidgetCard
            title="Astrologia"
            icon={<Star className="w-4 h-4" />}
            gradient="amber"
          >
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400 mb-1.5">Planetas</p>
                <div className="flex flex-wrap gap-1.5">
                  {area.astrology.planets.map(p => (
                    <span key={p} className="text-xs px-2 py-1 rounded bg-slate-800/60 text-slate-300">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1.5">Casas</p>
                <div className="flex flex-wrap gap-1.5">
                  {area.astrology.houses.map(h => (
                    <span key={h} className="text-xs px-2 py-1 rounded bg-slate-800/60 text-slate-300">
                      Casa {h}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1.5">Pontos especiais</p>
                <div className="flex flex-wrap gap-1.5">
                  {area.astrology.points.map(p => (
                    <span key={p} className="text-xs px-2 py-1 rounded bg-slate-800/60 text-amber-300">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1.5">Palavras-chave</p>
                <div className="flex flex-wrap gap-1.5">
                  {area.astrology.keywords.map(k => (
                    <span key={k} className="text-xs px-2 py-1 rounded bg-slate-800/60 text-slate-300">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </WidgetCard>

          {/* Numerologia */}
          <WidgetCard
            title="Numerologia"
            icon={<Activity className="w-4 h-4" />}
            gradient="emerald"
          >
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400 mb-1.5">Caminhos de vida</p>
                <div className="flex flex-wrap gap-1.5">
                  {area.numerology.lifePath.map(n => (
                    <span key={n} className="text-xs px-2 py-1 rounded bg-slate-800/60 text-emerald-300 font-mono">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
              {area.numerology.masterNumbers.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-1.5">Números mestres</p>
                  <div className="flex flex-wrap gap-1.5">
                    {area.numerology.masterNumbers.map(n => (
                      <span key={n} className="text-xs px-2 py-1 rounded bg-slate-800/60 text-amber-300 font-mono">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-400 mb-1.5">Anos pessoais favoráveis</p>
                <div className="flex flex-wrap gap-1.5">
                  {area.numerology.personalYear.map(n => (
                    <span key={n} className="text-xs px-2 py-1 rounded bg-slate-800/60 text-slate-300 font-mono">
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </WidgetCard>

          {/* Odu */}
          <WidgetCard
            title="Odu de Ifá"
            icon={<Compass className="w-4 h-4" />}
            gradient="violet"
          >
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400 mb-1.5">Odus principais</p>
                <div className="flex flex-wrap gap-1.5">
                  {area.odu.primaryOdus.map(o => (
                    <span key={o} className="text-xs px-2 py-1 rounded bg-slate-800/60 text-violet-300">
                      {o}
                    </span>
                  ))}
                </div>
              </div>
              {area.odu.favorableOdus.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-1.5">Odus favoráveis</p>
                  <div className="flex flex-wrap gap-1.5">
                    {area.odu.favorableOdus.map(o => (
                      <span key={o} className="text-xs px-2 py-1 rounded bg-slate-800/60 text-emerald-300">
                        {o}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {area.odu.eboSuggestions.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-1.5">Ebós sugeridos</p>
                  <div className="flex flex-wrap gap-1.5">
                    {area.odu.eboSuggestions.map(e => (
                      <span key={e} className="text-xs px-2 py-1 rounded bg-slate-800/60 text-amber-300">
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </WidgetCard>

          {/* Orixá */}
          <WidgetCard
            title="Orixá & Elementos"
            icon={<Flame className="w-4 h-4" />}
            gradient="orange"
          >
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400 mb-1.5">Orixás regentes</p>
                <div className="flex flex-wrap gap-1.5">
                  {area.orixa.primary.map(o => (
                    <span key={o} className="text-xs px-2 py-1 rounded bg-slate-800/60 text-pink-300">
                      {o}
                    </span>
                  ))}
                </div>
              </div>
              {area.orixa.secondary.length > 0 && (
                <div>
                  <p className="text-xs text-slate-400 mb-1.5">Orixás auxiliares</p>
                  <div className="flex flex-wrap gap-1.5">
                    {area.orixa.secondary.map(o => (
                      <span key={o} className="text-xs px-2 py-1 rounded bg-slate-800/60 text-slate-300">
                        {o}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs text-slate-400 mb-1.5">Elemento primário</p>
                <span
                  className="text-xs px-2 py-1 rounded"
                  style={{ backgroundColor: `${area.color}20`, color: area.color }}
                >
                  {area.element.primary}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1.5">Chakra regente</p>
                <div className="flex flex-wrap gap-1.5">
                  {area.chakra.primary.map(c => (
                    <span key={c} className="text-xs px-2 py-1 rounded bg-slate-800/60 text-cyan-300">
                      {c} ({area.chakra.mantra})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </WidgetCard>
        </div>
      )}

      {/* AI Insight */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Brain className="w-4 h-4 text-amber-400" />
            Insight Profundo com IA
            {insight?.source === 'minimax-m3' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                M3
              </span>
            )}
          </h3>
          <button
            onClick={onRegenerate}
            disabled={loading}
            className="text-xs text-slate-400 hover:text-amber-300 transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <Loader2 className={cn('w-3.5 h-3.5', loading && 'animate-spin')} />
            {loading ? 'Gerando...' : 'Regenerar'}
          </button>
        </div>

        {loading ? (
          <Card className="bg-slate-900/60 border-slate-800/50">
            <CardContent className="p-8 flex flex-col items-center justify-center min-h-[200px]">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-3" />
              <p className="text-sm text-slate-400">Consultando a IA M3 sobre {area.name.toLowerCase()}...</p>
            </CardContent>
          </Card>
        ) : insight ? (
          <InsightContent content={insight.content} />
        ) : null}
      </div>

      {/* Practical info grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Practices */}
        <WidgetCard
          title="Práticas Recomendadas"
          icon={<Sparkles className="w-4 h-4" />}
          gradient="emerald"
        >
          <ul className="space-y-2">
            {area.practices.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-amber-400 mt-0.5">✦</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </WidgetCard>

        {/* Reflections */}
        <WidgetCard
          title="Perguntas de Reflexão"
          icon={<Eye className="w-4 h-4" />}
          gradient="violet"
        >
          <ul className="space-y-2">
            {area.questions.map((q, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-violet-400 mt-0.5">?</span>
                <span className="italic">{q}</span>
              </li>
            ))}
          </ul>
        </WidgetCard>

        {/* Crystals */}
        <WidgetCard
          title="Cristais Aliados"
          icon={<Sparkles className="w-4 h-4" />}
          gradient="pink"
        >
          <div className="flex flex-wrap gap-2">
            {area.crystals.map(c => (
              <span
                key={c}
                className="text-sm px-3 py-1.5 rounded-xl"
                style={{
                  backgroundColor: `${area.color}15`,
                  border: `1px solid ${area.color}30`,
                  color: area.color,
                }}
              >
                💎 {c}
              </span>
            ))}
          </div>
        </WidgetCard>

        {/* Affirmations */}
        <WidgetCard
          title="Afirmações"
          icon={<Heart className="w-4 h-4 fill-pink-400 text-pink-400" />}
          gradient="pink"
        >
          <div className="space-y-2">
            {area.affirmations.map((a, i) => (
              <p key={i} className="text-sm text-slate-300 italic leading-relaxed">
                &ldquo;{a}&rdquo;
              </p>
            ))}
          </div>
        </WidgetCard>
      </div>
    </div>
  );
}

// ============================================================
// INSIGHT CONTENT - Renders markdown-like content
// ============================================================

function InsightContent({ content }: { content: string }) {
  const lines = content.split('\n');
  const rendered: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    if (line.startsWith('## ')) {
      rendered.push(
        <h3 key={i} className="text-base font-semibold text-amber-300 mt-4 mb-2 flex items-center gap-2">
          <span className="w-1 h-4 bg-amber-400 rounded" />
          {line.replace('## ', '')}
        </h3>
      );
    } else if (line.startsWith('# ')) {
      rendered.push(
        <h2 key={i} className="text-lg font-bold text-white mt-4 mb-2">
          {line.replace('# ', '')}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      rendered.push(
        <h4 key={i} className="text-sm font-semibold text-violet-300 mt-3 mb-1.5">
          {line.replace('### ', '')}
        </h4>
      );
    } else if (line.match(/^\d+\.\s/)) {
      rendered.push(
        <p key={i} className="text-sm text-slate-300 leading-relaxed ml-4 mb-1.5">
          {line}
        </p>
      );
    } else if (line.startsWith('> ')) {
      rendered.push(
        <blockquote key={i} className="border-l-2 border-amber-400/50 pl-3 my-2 italic text-sm text-slate-300">
          {line.replace('> ', '')}
        </blockquote>
      );
    } else if (line.trim() === '') {
      // skip empty lines
    } else {
      const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
      const processed = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="text-white font-semibold">{part.replace(/\*\*/g, '')}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={j} className="italic">{part.replace(/\*/g, '')}</em>;
        }
        return <span key={j}>{part}</span>;
      });
      rendered.push(
        <p key={i} className="text-sm text-slate-300 leading-relaxed mb-2">
          {processed}
        </p>
      );
    }
  });

  return (
    <Card className="bg-slate-900/60 border-slate-800/50">
      <CardContent className="p-6">
        {rendered}
      </CardContent>
    </Card>
  );
}
