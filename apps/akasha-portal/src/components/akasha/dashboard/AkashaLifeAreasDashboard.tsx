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
  ArrowRight, Lightbulb, RefreshCw, GitBranch,
  type LucideIcon,
} from 'lucide-react';
import type {
  AkashaSynthesisUI,
  AkashaTypeProfileUI,
  AreaNarrativeUI,
  DailyDecisionUI,
  DailyTransitUI,
  SexualidadeUI,
} from './hooks/useAkashaSynthesis';
import { AkashaSignificadoCard } from '@/components/akasha/AkashaSignificadoCard';

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
        <p className="text-sm text-white/80 italic">&ldquo;{decision.authorityQuestion}&rdquo;</p>
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

// ─── F-227: ONE Akasha Profile Card ───────────────────────────────────────────

const AUTHORITY_ICONS: Record<string, string> = {
  emotional: '❤️',
  sacral: '🟠',
  splenic: '🟣',
  mental: '🔵',
};

const AUTHORITY_LABELS: Record<string, string> = {
  emotional: 'Autoridade Emocional',
  sacral: 'Autoridade Sacral',
  splenic: 'Autoridade Esplênica',
  mental: 'Autoridade Mental',
};

function OneProfileCard({ profile }: { profile: AkashaTypeProfileUI }) {
  const iconMap: Record<string, string> = {
    catalisador: '#FF6B35',
    receptor: '#0A84FF',
    construtor: '#30D158',
    transformador: '#BF5AF2',
    guardiao: '#64D2FF',
    curador: '#FF375F',
    canal: '#FFD60A',
    alquimista: '#AC8E68',
    arquiteto: '#8E8E93',
  };
  const accentColor = iconMap[profile.type] ?? '#FF9500';

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1C1C1E] to-[#2C2C2E] overflow-hidden">
      {/* Header: type + icon */}
      <div
        className="px-5 pt-5 pb-4"
        style={{ background: `linear-gradient(135deg, ${accentColor}22 0%, transparent 60%)` }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{profile.typeIcon}</span>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-widest font-medium">Seu Tipo Akasha</p>
              <h2 className="text-xl font-bold text-white leading-tight">{profile.typeName}</h2>
              <p className="text-sm text-white/60 mt-0.5 italic">&ldquo;{profile.corePattern}&rdquo;</p>
            </div>
          </div>
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: `${accentColor}22`, color: accentColor }}
          >
            {profile.dominantPillar.split('—')[0].trim()}
          </span>
        </div>

        {/* One-liner — a frase que o usuário lembra o dia todo */}
        <div className="mt-4 bg-black/20 rounded-xl p-4">
          <p className="text-base text-white font-semibold leading-snug">
            {profile.oneLiner}
          </p>
        </div>
      </div>

      {/* Strategy + Authority */}
      <div className="px-5 py-4 border-t border-white/8 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1.5">Estratégia</p>
          <p className="text-sm font-semibold text-white">{profile.strategy}</p>
          <p className="text-xs text-white/50 mt-1 leading-relaxed">{profile.strategyDetail}</p>
        </div>
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1.5">
            {AUTHORITY_LABELS[profile.authority] ?? 'Autoridade'}
          </p>
          <p className="text-sm text-white/80 leading-relaxed italic">&ldquo;{profile.authorityPractice}&rdquo;</p>
        </div>
      </div>

      {/* Daily Directive */}
      <div className="mx-5 mb-4 bg-[#FF9500]/10 border border-[#FF9500]/20 rounded-xl px-4 py-3">
        <p className="text-xs text-[#FF9500]/80 uppercase tracking-wider font-semibold mb-1">Diretiva de Hoje</p>
        <p className="text-sm text-white font-medium leading-snug">{profile.dailyDirective}</p>
      </div>

      {/* Growth + Shadow */}
      <div className="px-5 pb-5 grid grid-cols-1 gap-2">
        <div className="flex items-start gap-2">
          <ArrowRight size={14} className="text-[#30D158] mt-0.5 shrink-0" />
          <p className="text-xs text-white/60">
            <span className="text-[#30D158] font-medium">Crescimento: </span>
            {profile.growthEdge}
          </p>
        </div>
        <div className="flex items-start gap-2">
          <AlertTriangle size={14} className="text-[#FF375F] mt-0.5 shrink-0" />
          <p className="text-xs text-white/60">
            <span className="text-[#FF375F] font-medium">Armadilha: </span>
            {profile.shadowTrap}
          </p>
        </div>
      </div>
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

function SexualidadeSection({ sexualidade }: { sexualidade: SexualidadeUI }) {
  const [showDetails, setShowDetails] = useState(false);
  return (
    <div className="border-t border-[#FF2D55]/20 pt-2 mt-2">
      <button
        onClick={() => setShowDetails(v => !v)}
        className="flex items-center gap-2 w-full"
      >
        <span className="text-xs font-semibold text-[#FF2D55]/90 uppercase tracking-wider">Sexualidade</span>
        <span className="text-xs text-white/40">{sexualidade.name}</span>
        <span className="text-xs text-white/30 ml-auto">{showDetails ? '▲' : '▼'}</span>
      </button>
      {showDetails && (
        <div className="mt-2 space-y-2">
          {sexualidade.description && (
            <p className="text-xs text-white/60 leading-relaxed">{sexualidade.description}</p>
          )}
          {sexualidade.desirePattern && (
            <div className="bg-[#FF2D55]/08 rounded-lg p-2">
              <p className="text-xs text-[#FF2D55]/80 font-medium">Padrão de Desejo</p>
              <p className="text-xs text-white/50 mt-0.5">{sexualidade.desirePattern}</p>
            </div>
          )}
          {sexualidade.turnOn.length > 0 && (
            <div>
              <p className="text-xs text-[#34C759]/80 font-medium mb-1">LIGA</p>
              <div className="flex flex-wrap gap-1">
                {sexualidade.turnOn.map((t, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-[#34C759]/15 text-[#34C759]/80">{t}</span>
                ))}
              </div>
            </div>
          )}
          {sexualidade.turnOff.length > 0 && (
            <div>
              <p className="text-xs text-[#FF2D55]/80 font-medium mb-1">DESLIGA</p>
              <div className="flex flex-wrap gap-1">
                {sexualidade.turnOff.map((t, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-[#FF2D55]/15 text-[#FF2D55]/80">{t}</span>
                ))}
              </div>
            </div>
          )}
          {sexualidade.hiddenDesires.length > 0 && (
            <div>
              <p className="text-xs text-[#FFD60A]/80 font-medium mb-1">Desejos Ocultos</p>
              {sexualidade.hiddenDesires.map((d, i) => (
                <div key={i} className="text-xs text-white/50 mb-1">
                  <span className="text-white/70">{d.desire}</span>
                  <span className="text-white/30"> → medo: {d.fear}</span>
                </div>
              ))}
            </div>
          )}
          {sexualidade.transformationKey && (
            <div className="bg-[#AF52DE]/08 rounded-lg p-2">
              <p className="text-xs text-[#AF52DE]/80 font-medium">Chave de Transformação</p>
              <p className="text-xs text-white/50 mt-0.5">{sexualidade.transformationKey}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Priority Quick View ─────────────────────────────────────────────────────

const FREQUENCY_SORT: Record<string, number> = { siddhi: 3, gift: 2, shadow: 1 };

function PriorityAreasQuickView({ areas }: { areas: Record<string, AreaNarrativeUI> }) {
  const sorted = Object.entries(areas)
    .filter(([, n]) => n != null)
    .sort(([ak, a], [bk, b]) => {
      const fa = FREQUENCY_SORT[a.frequency] ?? 1;
      const fb = FREQUENCY_SORT[b.frequency] ?? 1;
      if (fa !== fb) return fb - fa;
      return (b.intensity ?? 0) - (a.intensity ?? 0);
    })
    .slice(0, 3);

  if (sorted.length === 0) return null;

  return (
    <div className="bg-[#1C1C1E]/80 rounded-2xl border border-white/8 p-3 space-y-2">
      <div className="flex items-center gap-1.5">
        <Sparkles size={11} className="text-[#FFD60A]" />
        <span className="text-[10px] font-semibold text-[#FFD60A]/80 uppercase tracking-wider">
          Prioridades de Hoje
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-0.5 -mx-0.5 px-0.5">
        {sorted.map(([areaKey, narrative]) => {
          const cfg = AREA_CONFIG[areaKey] ?? AREA_CONFIG.desafiosSombras;
          const freqCfg = FREQUENCY_CONFIG[narrative.frequency];
          return (
            <div
              key={areaKey}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border shrink-0"
              style={{
                backgroundColor: `${cfg.color}12`,
                borderColor: `${cfg.color}30`,
              }}
            >
              <span style={{ color: cfg.color }}>{cfg.label}</span>
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: freqCfg.color }}
                title={narrative.frequency}
              />
              <IntensityDots intensity={narrative.intensity} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── AreaCard ──────────────────────────────────────────────────────────────────
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
              {narrative.chainOfReasoning && narrative.chainOfReasoning.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <GitBranch size={12} className="text-[#64D2FF]" />
                    <span className="text-xs font-semibold text-[#64D2FF]/90 uppercase tracking-wider">Como chegamos aqui</span>
                  </div>
                  <div className="space-y-1">
                    {narrative.chainOfReasoning.map((step, i) => {
                      const [factor, conclusion] = step.split('→');
                      return (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-xs text-[#64D2FF]/60 shrink-0 mt-px">{i + 1}.</span>
                          <div className="flex-1 min-w-0">
                            {factor && (
                              <span className="text-xs text-white/60">{factor.trim()}</span>
                            )}
                            {conclusion && (
                              <div className="flex items-start gap-1 mt-0.5">
                                <ArrowRight size={10} className="text-[#64D2FF] mt-0.5 shrink-0" />
                                <span className="text-xs text-[#64D2FF]/90 font-medium leading-relaxed">{conclusion.trim()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {/* F-226: Expanded Narrative — Akasha Synthesis */}
              {narrative.expandedNarrative && (
                <div className="bg-gradient-to-br from-[#AF52DE]/10 to-[#64D2FF]/10 border border-[#AF52DE]/20 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Star size={12} className="text-[#AF52DE]" />
                    <span className="text-xs font-semibold text-[#AF52DE]/90 uppercase tracking-wider">Núcleo Akasha</span>
                    <span className="text-xs text-white/30 ml-auto">{narrative.expandedNarrative.sourceLabel}</span>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed italic">
                    {narrative.expandedNarrative.integratedNarrative}
                  </p>
                  {narrative.expandedNarrative.practicalExample && (
                    <div className="flex items-start gap-1.5 mt-1">
                      <Lightbulb size={10} className="text-[#FFD60A] mt-0.5 shrink-0" />
                      <p className="text-xs text-[#FFD60A]/80 leading-relaxed">{narrative.expandedNarrative.practicalExample}</p>
                    </div>
                  )}
                  {/* Sexualidade (F-225) — só na área Vitalidade */}
                  {areaKey === 'vitalidadeEnergia' && narrative.sexualidade && (
                    <SexualidadeSection sexualidade={narrative.sexualidade} />
                  )}
                </div>
              )}

              {/* F-224: Trânsito de Hoje — dados gerados pelo motor mas nunca renderizados */}
              {narrative.dailyTransit && (
                <div
                  className="rounded-xl p-3 flex items-start gap-2.5"
                  style={{ background: 'linear-gradient(135deg, #64D2FF08 0%, #AF52DE08 100%)', border: '1px solid #64D2FF25' }}
                >
                  <Sparkles size={12} className="text-[#64D2FF] mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-[#64D2FF]/70 uppercase tracking-wider mb-0.5">Trânsito de Hoje</p>
                    <p className="text-xs text-white/75 leading-relaxed">{narrative.dailyTransit.todayPhrase}</p>
                  </div>
                </div>
              )}

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
                <p className="text-sm text-white/70 italic leading-relaxed">&ldquo;{narrative.transformationPrompt}&rdquo;</p>
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

  // F-227: ONE Profile Card — primeira coisa que o usuário vê
  const { oneProfile } = synthesis;

  const { akashaProfile, areas, dailyDecision, synthesisParagraph } = synthesis;

  return (
    <div className="space-y-5">

      {/* F-227: ONE Akasha Profile Card — tipo unificado visível primeiro */}
      {oneProfile && <OneProfileCard profile={oneProfile} />}
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
        <p className="text-sm text-white/80 leading-relaxed italic">&ldquo;{synthesisParagraph}&rdquo;</p>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-xs text-white/40">
            Estágio: <span className="text-white/60 capitalize">{akashaProfile.transformationStage}</span>
          </span>
          <span className="text-xs text-white/40">
            Sequência ativa: <span className="text-white/60 capitalize">{akashaProfile.activeSequence}</span>
          </span>
        </div>
      </div>

      {/* P3 — Interpretação profunda: AkashaSignificadoCard */}
      {synthesis.lifePath > 0 && (
        <AkashaSignificadoCard lifePath={synthesis.lifePath} defaultNivel={akashaProfile.dominantFrequency} />
      )}

      {/* Decisão diária */}
      {dailyDecision && <DailyDecisionCard decision={dailyDecision} />}

      {/* 6 Áreas de vida */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-white/30 uppercase tracking-widest">6 Áreas de Vida</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Prioridades de Hoje — top 3 áreas por frequency + intensity */}
        <PriorityAreasQuickView areas={areas} />

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
