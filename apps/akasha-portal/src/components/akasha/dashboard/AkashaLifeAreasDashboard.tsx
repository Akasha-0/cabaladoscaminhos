'use client';

/**
 * AkashaLifeAreasDashboard — Dashboard de Áreas de Vida do Akasha
 *
 * Substitui a visualização fragmentada de 5 mapas separados por UMA
 * visão unificada de 6 áreas de vida (Maslow + Akasha):
 *
 *  1. Vitalidade & Energia     → Corpo: saúde, sexualidade, energia vital
 *  2. Conexões & Amor         → Relações: amor, família, vínculos
 *  3. Carreira & Prosperidade  → Recursos: finanças, abundância, vocação
 *  4. Ori, Cabeça & Quizilas  → Mente: intuição, direção, propósito
 *  5. Missão & Destino        → Espiritual: transcendência, Calling
 *  6. Desafios & Sombras      → Transformação: karma, padrões, superação
 *
 * Cada área mostra:
 *  - Frequência atual (Shadow / Dom / Siddhi)
 *  - Narrativa em 2ª pessoa (prática, não técnica)
 *  - Contribuição de cada pilar (Cabala, Tantra, Odus, Astrologia)
 *  - Ritual diário personalizado
 *  - Pergunta de transformação
 *
 * Decisão diária (Strategy + Authority) no topo.
 * Síntese geral em 2ª pessoa abaixo.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Heart, TrendingUp, Brain, Sparkles, AlertTriangle,
  ChevronDown, ChevronUp, CheckCircle2, XCircle, Star,
  ArrowRight, Lightbulb, RefreshCw
} from 'lucide-react';
import type { AkashaSynthesisUI, AreaNarrativeUI, DailyDecisionUI } from './hooks/useAkashaSynthesis';
import type { LucideProps } from 'lucide-react';
type LucideIcon = React.ComponentType<LucideProps>;

// ─── Área config ─────────────────────────────────────────────────────────────

const AREA_CONFIG: Record<string, {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  label: string;
  description: string;
}> = {
  vitalidadeEnergia: {
    icon: Zap,
    color: '#FF9500',
    bgColor: 'rgba(255,149,0,0.12)',
    label: 'Corpo',
    description: 'Saúde, sexualidade e energia vital',
  },
  conexoesAmor: {
    icon: Heart,
    color: '#FF3B30',
    bgColor: 'rgba(255,59,48,0.12)',
    label: 'Relações',
    description: 'Amor, família e vínculos afetivos',
  },
  carreiraProsperidade: {
    icon: TrendingUp,
    color: '#34C759',
    bgColor: 'rgba(52,199,89,0.12)',
    label: 'Recursos',
    description: 'Finanças, carreira e abundância',
  },
  oriCabecaQuizilas: {
    icon: Brain,
    color: '#5856D6',
    bgColor: 'rgba(88,86,214,0.12)',
    label: 'Mente',
    description: 'Intuição, direção e propósito',
  },
  missaoDestino: {
    icon: Sparkles,
    color: '#AF52DE',
    bgColor: 'rgba(175,82,222,0.12)',
    label: 'Espiritual',
    description: 'Missão, destino e transcendência',
  },
  desafiosSombras: {
    icon: AlertTriangle,
    color: '#FF2D55',
    bgColor: 'rgba(255,45,85,0.12)',
    label: 'Transformação',
    description: 'Karma, padrões inconscientes e superação',
  },
};

const FREQUENCY_CONFIG = {
  shadow: {
    label: 'Sombra',
    color: '#FF2D55',
    description: 'Padrão inconsciente de sofrimento',
    icon: XCircle,
  },
  gift: {
    label: 'Dom',
    color: '#34C759',
    description: 'Genialidade e amor inato',
    icon: CheckCircle2,
  },
  siddhi: {
    label: 'Realização',
    color: '#AF52DE',
    description: 'Transcendência do padrão',
    icon: Star,
  },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function FrequencyBadge({ frequency }: { frequency: 'shadow' | 'gift' | 'siddhi' }) {
  const cfg = FREQUENCY_CONFIG[frequency];
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${cfg.color}22`, color: cfg.color }}
    >
      <Icon size={10} />
      {cfg.label}
    </span>
  );
}

function IntensityDots({ intensity }: { intensity: 1 | 2 | 3 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: i <= intensity ? '#FF9500' : '#3A3A3C' }}
        />
      ))}
    </div>
  );
}

function StrategyBadge({ strategy }: { strategy: string }) {
  const cfg: Record<string, { color: string; bg: string; label: string }> = {
    act: { color: '#34C759', bg: 'rgba(52,199,89,0.15)', label: 'Agir' },
    wait: { color: '#FF9500', bg: 'rgba(255,149,0,0.15)', label: 'Aguarde' },
    observe: { color: '#5856D6', bg: 'rgba(88,86,214,0.15)', label: 'Observe' },
  };
  const c = cfg[strategy] ?? cfg.observe;
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {c.label}
    </span>
  );
}

function DailyDecisionCard({ decision }: { decision: DailyDecisionUI }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1C1C1E] to-[#2C2C2E] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb size={16} className="text-[#FF9500]" />
          <span className="text-sm font-semibold text-white">Decisão do Dia</span>
        </div>
        <StrategyBadge strategy={decision.strategy} />
      </div>

      <p className="text-sm text-white/70 leading-relaxed">
        {decision.strategyExplanation}
      </p>

      <div className="bg-white/5 rounded-xl p-3 space-y-2">
        <p className="text-xs text-white/50 font-medium uppercase tracking-wider">Autoridade</p>
        <p className="text-sm text-white/80 italic">"{decision.authorityQuestion}"</p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <div className="flex items-start gap-2">
          <ArrowRight size={14} className="text-[#34C759] mt-0.5 shrink-0" />
          <p className="text-sm text-white/80">{decision.recommendation}</p>
        </div>
        <div className="flex items-start gap-2">
          <XCircle size={14} className="text-[#FF2D55] mt-0.5 shrink-0" />
          <p className="text-sm text-white/60">{decision.avoid}</p>
        </div>
      </div>
    </div>
  );
}

function PillarContribution({
  cabala, tantra, odus, astrologia
}: { cabala: string; tantra: string; odus: string; astrologia: string }) {
  const pillars = [
    { label: 'Cabala', text: cabala, color: '#FFD60A' },
    { label: 'Tantra', text: tantra, color: '#FF9F0A' },
    { label: 'Odus', text: odus, color: '#30D158' },
    { label: 'Astrologia', text: astrologia, color: '#64D2FF' },
  ].filter(p => p.text && p.text.trim().length > 0);

  if (pillars.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Contribuição dos Pilares</p>
      {pillars.map(p => (
        <div key={p.label} className="flex gap-2">
          <span
            className="text-xs font-semibold shrink-0 mt-px"
            style={{ color: p.color }}
          >{p.label}:</span>
          <span className="text-xs text-white/60 leading-relaxed">{p.text}</span>
        </div>
      ))}
    </div>
  );
}

function RitualBadge({ ritual }: {
  ritual: { title: string; instruction: string; duration: string; element: string; color: string }
}) {
  return (
    <div
      className="rounded-xl p-3 flex items-start gap-3"
      style={{ backgroundColor: `${ritual.color}18` }}
    >
      <div
        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
        style={{ backgroundColor: ritual.color }}
      />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: ritual.color }}>{ritual.title}</span>
          <span className="text-xs text-white/40">{ritual.duration}</span>
        </div>
        <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{ritual.instruction}</p>
      </div>
    </div>
  );
}

function AreaCard({ areaKey, narrative }: {
  areaKey: string;
  narrative: AreaNarrativeUI;
}) {
  const [expanded, setExpanded] = useState(narrative.intensity >= 2);
  const cfg = AREA_CONFIG[areaKey] ?? AREA_CONFIG.desafiosSombras;
  const Icon = cfg.icon;

  return (
    <motion.div
      layout
      className="rounded-2xl border border-white/8 overflow-hidden"
      style={{ backgroundColor: cfg.bgColor }}
    >
      {/* Header — sempre visível */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${cfg.color}30` }}
        >
          <Icon size={18} style={{ color: cfg.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{cfg.label}</span>
            <FrequencyBadge frequency={narrative.frequency} />
            <IntensityDots intensity={narrative.intensity} />
          </div>
          <p className="text-xs text-white/50 mt-0.5 truncate">{cfg.description}</p>
        </div>

        <div className="shrink-0 text-white/30">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">

              {/* Shadow pattern */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <XCircle size={12} className="text-[#FF2D55]" />
                  <span className="text-xs font-semibold text-[#FF2D55]/80 uppercase tracking-wider">Padrão de Sombra</span>
                </div>
                <p className="text-sm text-white/75 leading-relaxed">{narrative.shadowPattern}</p>
                {narrative.shadowSymptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {narrative.shadowSymptoms.map((s, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-[#FF2D55]/15 text-[#FF2D55]/80">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Gift pattern */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-[#34C759]" />
                  <span className="text-xs font-semibold text-[#34C759]/80 uppercase tracking-wider">Seu Dom</span>
                </div>
                <p className="text-sm text-white/75 leading-relaxed">{narrative.giftPattern}</p>
                {narrative.giftStrengths.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {narrative.giftStrengths.map((s, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-[#34C759]/15 text-[#34C759]/80">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Pillar contributions */}
              <PillarContribution
                cabala={narrative.pillarContribution.cabala}
                tantra={narrative.pillarContribution.tantra}
                odus={narrative.pillarContribution.odus}
                astrologia={narrative.pillarContribution.astrologia}
              />

              {/* Practical advice */}
              <div className="bg-[#FF9500]/10 border border-[#FF9500]/20 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-[#FF9500]" />
                  <span className="text-xs font-semibold text-[#FF9500] uppercase tracking-wider">Prática de Hoje</span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">{narrative.practicalAdvice}</p>
              </div>

              {/* Ritual */}
              <RitualBadge ritual={narrative.dailyRitual} />

              {/* Transformation prompt */}
              <div className="bg-[#5856D6]/10 border border-[#5856D6]/20 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles size={12} className="text-[#5856D6]" />
                  <span className="text-xs font-semibold text-[#5856D6]/80 uppercase tracking-wider">Pergunta de Transformação</span>
                </div>
                <p className="text-sm text-white/70 italic leading-relaxed">"{narrative.transformationPrompt}"</p>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

interface AkashaLifeAreasDashboardProps {
  synthesis: AkashaSynthesisUI | null;
  loading?: boolean;
  onRefetch?: () => void;
}

export function AkashaLifeAreasDashboard({
  synthesis,
  loading = false,
  onRefetch,
}: AkashaLifeAreasDashboardProps) {
  const areaKeys = [
    'vitalidadeEnergia',
    'conexoesAmor',
    'carreiraProsperidade',
    'oriCabecaQuizilas',
    'missaoDestino',
    'desafiosSombras',
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        {areaKeys.map((key) => (
          <div key={key} className="rounded-2xl border border-white/8 bg-[#1C1C1E] p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-24 bg-white/10 rounded" />
                <div className="h-3 w-40 bg-white/5 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!synthesis) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#1C1C1E] p-8 text-center">
        <AlertTriangle size={32} className="text-white/30 mx-auto mb-3" />
        <p className="text-sm text-white/50">Perfil de síntese não disponível.</p>
        <p className="text-xs text-white/30 mt-1">Complete seu mapa astral para desbloquear.</p>
      </div>
    );
  }

  const { akashaProfile, areas, dailyDecision, synthesisParagraph } = synthesis;

  return (
    <div className="space-y-5">

      {/* Perfil unificado — síntese geral */}
      <div className="rounded-2xl border border-[#FF9500]/30 bg-gradient-to-br from-[#FF9500]/8 to-transparent p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#FF9500]" />
            <span className="text-sm font-semibold text-white">Perfil Akasha</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">
              Score: {akashaProfile.overallFrequencyScore}/100
            </span>
            <FrequencyBadge frequency={akashaProfile.dominantFrequency} />
            {onRefetch && (
              <button onClick={onRefetch} className="text-white/30 hover:text-white/60 transition-colors">
                <RefreshCw size={14} />
              </button>
            )}
          </div>
        </div>
        <p className="text-sm text-white/80 leading-relaxed italic">"{synthesisParagraph}"</p>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-xs text-white/40">
            Estágio: <span className="text-white/60 capitalize">{akashaProfile.transformationStage}</span>
          </span>
          <span className="text-xs text-white/40">
            Sequência ativa: <span className="text-white/60 capitalize">{akashaProfile.activeSequence}</span>
          </span>
        </div>
      </div>

      {/* Decisão diária */}
      {dailyDecision && <DailyDecisionCard decision={dailyDecision} />}

      {/* 6 Áreas de vida */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-white/30 uppercase tracking-widest">6 Áreas de Vida</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="space-y-2">
          {areaKeys.map((key) => {
            const narrative = areas[key];
            if (!narrative) return null;
            return (
              <AreaCard key={key} areaKey={key} narrative={narrative} />
            );
          })}
        </div>
      </div>

    </div>
  );
}
