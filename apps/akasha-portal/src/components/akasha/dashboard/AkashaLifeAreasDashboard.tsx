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
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Heart,
  TrendingUp,
  Brain,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Star,
  ArrowRight,
  Lightbulb,
  RefreshCw,
  GitBranch,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import type { FrequencyLevel } from '@/lib/application/akasha/synthesis-engine/synthesis-types';
import { AkashaSignificadoCard } from '../AkashaSignificadoCard';
import { PriorityAreasQuickView } from './PriorityAreasQuickView';
import {
  cleanTraditionName,
  AREA_CONFIG,
  FREQUENCY_CONFIG,
  FrequencyBadge,
  IntensityDots,
} from './dashboard-utils';
import type {
  AkashaSynthesisUI,
  AkashaTypeProfileUI,
  AreaNarrativeUI,
  CycleSnapshotUI,
  DailyDecisionUI,
  SexualidadeUI,
} from './hooks/useAkashaSynthesis';

export { AREA_CONFIG, FREQUENCY_CONFIG, IntensityDots };

// ─── F-235: Frequency Path Explorer — Siddhi journey visualization ──────────────

const PATH_STAGES = [
  {
    id: 'shadow' as FrequencyLevel,
    label: 'Sombra',
    icon: XCircle,
    color: '#FF2D55',
    description:
      'Padrões inconscientes que se repetem como sofrimento. A energia está presa em ciclos reactivos.',
    practice: 'Nomeie o padrão. Tornar o invisível visível é o primeiro passo da libertação.',
    glyph: '☽',
  },
  {
    id: 'gift' as FrequencyLevel,
    label: 'Dom',
    icon: CheckCircle2,
    color: '#34C759',
    description:
      'A energia flui naturalmente como genialidade e amor. O talento opera sem esforço consciente.',
    practice: 'Use seu dom numa situação real. A frequência mais alta consolida-se pela aplicação.',
    glyph: '☉',
  },
  {
    id: 'siddhi' as FrequencyLevel,
    label: 'Realização',
    icon: Star,
    color: '#AF52DE',
    description:
      'O padrão dissolveu-se na consciência. A energia é referência — irradia sem esforço, transforma por presença.',
    practice: 'Compartilhe o que Você É, não o que Você Faz. Ser é suficiente.',
    glyph: '✦',
  },
];

function FrequencyPathExplorer({
  dominantFrequency,
  overallFrequencyScore,
  transformationStage,
}: {
  dominantFrequency: FrequencyLevel;
  overallFrequencyScore: number;
  transformationStage: 'surface' | 'deepening' | 'embodying';
}) {
  const [expanded, setExpanded] = useState(false);
  const currentIndex = PATH_STAGES.findIndex((s) => s.id === dominantFrequency);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#1C1C1E] overflow-hidden">
      {/* Header — always visible */}
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-3">
          <GitBranch size={16} className="text-white/40" />
          <span className="text-sm font-semibold text-white">Caminho de Frequência</span>
          <FrequencyBadge frequency={dominantFrequency} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/40">
            {overallFrequencyScore < 40
              ? 'Superficial'
              : overallFrequencyScore < 70
                ? 'Aprofundando'
                : 'Incorporando'}
          </span>
          {expanded ? (
            <ChevronUp size={14} className="text-white/40" />
          ) : (
            <ChevronDown size={14} className="text-white/40" />
          )}
        </div>
      </button>

      {/* 3-step visual path */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-1">
          {PATH_STAGES.map((stage, i) => {
            const isActive = i === currentIndex;
            const isPast = i < currentIndex;
            const isFuture = i > currentIndex;
            const Icon = stage.icon;
            return (
              <div key={stage.id} className="flex flex-col items-center flex-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all"
                  style={{
                    backgroundColor: isActive
                      ? stage.color
                      : isPast
                        ? `${stage.color}44`
                        : 'transparent',
                    borderColor: isActive ? stage.color : isPast ? stage.color : '#3A3A3C',
                    opacity: isFuture ? 0.3 : 1,
                  }}
                >
                  {isPast ? (
                    <CheckCircle2 size={14} style={{ color: stage.color }} />
                  ) : (
                    <Icon size={14} style={{ color: isActive ? stage.color : '#8E8E93' }} />
                  )}
                </div>
                <span
                  className="text-[10px] mt-1 font-medium text-center leading-tight"
                  style={{ color: isActive ? stage.color : isPast ? '#8E8E93' : '#3A3A3C' }}
                >
                  {stage.glyph} {stage.label}
                </span>
                {i < PATH_STAGES.length - 1 && (
                  <div
                    className="w-full h-0.5 mt-2"
                    style={{ backgroundColor: isPast ? stage.color : '#3A3A3C' }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4">
              {/* Current stage deep dive */}
              <div>
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1.5">
                  Você está aqui
                </p>
                <p className="text-sm text-white/80 leading-relaxed">
                  {PATH_STAGES[currentIndex].description}
                </p>
              </div>

              {/* Next stage teaser */}
              {currentIndex < 2 && (
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: `${PATH_STAGES[currentIndex + 1].color}11` }}
                >
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-1">
                    O próximo passo
                  </p>
                  <div className="flex items-start gap-2">
                    <ArrowRight
                      size={14}
                      className="mt-0.5 shrink-0"
                      style={{ color: PATH_STAGES[currentIndex + 1].color }}
                    />
                    <p className="text-sm text-white/80 leading-relaxed">
                      {PATH_STAGES[currentIndex + 1].description}
                    </p>
                  </div>
                </div>
              )}

              {/* Siddhi achieved message */}
              {currentIndex === 2 && (
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: `${PATH_STAGES[2].color}11` }}
                >
                  <p className="text-sm text-white/90 leading-relaxed italic">
                    ✦ Você opera na frequência da Realização. Sua presença é o ensinamento. O
                    próximo passo não é "subir" — é aprofundar e compartilhar.
                  </p>
                </div>
              )}

              {/* Current stage practice */}
              <div>
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1.5">
                  Prática de Hoje
                </p>
                <div className="flex items-start gap-2">
                  <Sparkles size={14} className="mt-0.5 shrink-0 text-[#FF9500]" />
                  <p className="text-sm text-white/80 leading-relaxed">
                    {PATH_STAGES[currentIndex].practice}
                  </p>
                </div>
              </div>

              {/* Transformation stage label */}
              <div className="flex items-center gap-2 text-xs text-white/40">
                <span>Estágio:</span>
                <span
                  className="px-2 py-0.5 rounded-full capitalize"
                  style={{
                    backgroundColor:
                      transformationStage === 'surface'
                        ? '#FF950022'
                        : transformationStage === 'deepening'
                          ? '#34C75922'
                          : '#AF52DE22',
                    color:
                      transformationStage === 'surface'
                        ? '#FF9500'
                        : transformationStage === 'deepening'
                          ? '#34C759'
                          : '#AF52DE',
                  }}
                >
                  {transformationStage === 'surface'
                    ? ' superficial'
                    : transformationStage === 'deepening'
                      ? ' aprofundando'
                      : ' incorporando'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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

export function DailyDecisionCard({ decision }: { decision: DailyDecisionUI }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1C1C1E] to-[#2C2C2E] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb size={16} className="text-[#FF9500]" />
          <span className="text-sm font-semibold text-white">Decisão do Dia</span>
        </div>
        <StrategyBadge strategy={decision.strategy} />
      </div>

      <p className="text-sm text-white/70 leading-relaxed">{decision.strategyExplanation}</p>

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
          <p className="text-sm text-white/80">{decision.avoid}</p>
        </div>
      </div>
    </div>
  );
}

// ─── F-227: ONE Akasha Profile Card ───────────────────────────────────────────

const AUTHORITY_LABELS: Record<string, string> = {
  emotional: 'Autoridade Emocional',
  sacral: 'Autoridade Sacral',
  splenic: 'Autoridade Esplênica',
  mental: 'Autoridade Mental',
};

export function OneProfileCard({
  profile,
  narrativaCentral,
}: {
  profile: AkashaTypeProfileUI;
  narrativaCentral?: string | null;
}) {
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
              <p className="text-xs text-white/40 uppercase tracking-widest font-medium">
                Seu Tipo Akasha
              </p>
              <h2 className="text-xl font-bold text-white leading-tight">{profile.typeName}</h2>
              <p className="text-sm text-white/60 mt-0.5 italic">
                &ldquo;{profile.corePattern}&rdquo;
              </p>
              {/* Confidence badge */}
              {profile.typeConfidence && (
                <div
                  className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    profile.typeConfidence === 'alta'
                      ? 'bg-[#30D158]/15 border-[#30D158]/30 text-[#30D158]'
                      : profile.typeConfidence === 'media'
                        ? 'bg-[#FFD60A]/15 border-[#FFD60A]/30 text-[#FFD60A]'
                        : 'bg-[#FF375F]/15 border-[#FF375F]/30 text-[#FF375F]'
                  }`}
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
                  {profile.typeConfidence === 'alta'
                    ? 'Alta convergência — perfil bem definido'
                    : profile.typeConfidence === 'media'
                      ? 'Convergência média — perfil em formação'
                      : 'Baixa convergência — mais dados fortalecem o perfil'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* One-liner — a frase que o usuário lembra o dia todo */}
        <div className="mt-4 bg-black/20 rounded-xl p-4">
          <p className="text-base text-white font-semibold leading-snug">{profile.oneLiner}</p>
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
          <p className="text-sm text-white/80 leading-relaxed italic">
            &ldquo;{profile.authorityPractice}&rdquo;
          </p>
        </div>
      </div>

      {/* Daily Directive */}
      <div className="mx-5 mb-4 bg-[#FF9500]/10 border border-[#FF9500]/20 rounded-xl px-4 py-3">
        <p className="text-xs text-[#FF9500]/80 uppercase tracking-wider font-semibold mb-1">
          Diretiva de Hoje
        </p>
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
      {/* F-232: Narrativa Central Akáshica — síntese dos 3 primitivos dominantes */}
      {narrativaCentral && (
        <div className="mx-5 mb-4 bg-gradient-to-r from-[#7C5CFF]/10 to-[#2DD4BF]/10 border border-[#7C5CFF]/20 rounded-xl px-4 py-3">
          <p className="text-xs text-[#7C5CFF]/80 uppercase tracking-wider font-semibold mb-1">
            Síntese Akáshica
          </p>
          <p className="text-sm text-white/80 leading-relaxed italic">
            &ldquo;{narrativaCentral}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}

function RitualBadge({
  ritual,
}: {
  ritual: { title: string; instruction: string; duration: string; element: string; color: string };
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
          <span className="text-xs font-semibold" style={{ color: ritual.color }}>
            {ritual.title}
          </span>
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
      <button onClick={() => setShowDetails((v) => !v)} className="flex items-center gap-2 w-full">
        <span className="text-xs font-semibold text-[#FF2D55]/90 uppercase tracking-wider">
          Sexualidade
        </span>
        <ChevronDown
          size={14}
          className="text-white/30"
          style={{
            transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        />
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
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 rounded-full bg-[#34C759]/15 text-[#34C759]/80"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
          {sexualidade.turnOff.length > 0 && (
            <div>
              <p className="text-xs text-[#FF2D55]/80 font-medium mb-1">DESLIGA</p>
              <div className="flex flex-wrap gap-1">
                {sexualidade.turnOff.map((t, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 rounded-full bg-[#FF2D55]/15 text-[#FF2D55]/80"
                  >
                    {t}
                  </span>
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

// ─── AreaCard ──────────────────────────────────────────────────────────────────
function AreaCard({
  areaKey,
  narrative,
  modulation,
}: {
  areaKey: string;
  narrative: AreaNarrativeUI;
  modulation?: CycleModulationEntry;
}) {
  const [expanded, setExpanded] = useState(narrative.intensity >= 2);
  const cfg = AREA_CONFIG[areaKey] ?? AREA_CONFIG.desafiosSombras;
  const Icon = cfg.icon;

  const isBoosted = modulation?.suggestedBoost === 'increase';
  const isDimmed = modulation?.suggestedBoost === 'decrease';

  return (
    <motion.div
      layout
      className={
        'rounded-2xl border overflow-hidden transition-all duration-300 ' +
        (isDimmed
          ? 'border-white/4 opacity-60'
          : isBoosted
            ? 'border-[#F0B429]/50 shadow-[0_0_12px_rgba(240,180,41,0.18)]'
            : 'border-white/8')
      }
      style={{ backgroundColor: cfg.bgColor }}
    >
      {/* Header — sempre visível */}
      <button
        aria-expanded={expanded}
        aria-controls={`area-content-${areaKey}`}
        onClick={() => setExpanded((v) => !v)}
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
            {modulation?.suggestedBoost === 'increase' && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-[#F0B429]/20 text-[#F0B429] border border-[#F0B429]/30">
                ↑ Foco
              </span>
            )}
            {modulation?.suggestedBoost === 'decrease' && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-white/5 text-white/40 border border-white/10">
                ↓ Suporte
              </span>
            )}
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
            id={areaKey}
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
                  <span className="text-xs font-semibold text-[#FF2D55]/80 uppercase tracking-wider">
                    Padrão de Sombra
                  </span>
                </div>
                <p className="text-sm text-white/75 leading-relaxed">{narrative.shadowPattern}</p>
                {narrative.shadowSymptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {narrative.shadowSymptoms.map((s, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-full bg-[#FF2D55]/15 text-[#FF2D55]/80"
                      >
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
                  <span className="text-xs font-semibold text-[#34C759]/80 uppercase tracking-wider">
                    Seu Dom
                  </span>
                </div>
                <p className="text-sm text-white/75 leading-relaxed">{narrative.giftPattern}</p>
                {narrative.giftStrengths.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {narrative.giftStrengths.map((s, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-full bg-[#34C759]/15 text-[#34C759]/80"
                      >
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
                    <span className="text-xs font-semibold text-[#64D2FF]/90 uppercase tracking-wider">
                      Como chegamos aqui
                    </span>
                  </div>
                  <div className="space-y-1">
                    {narrative.chainOfReasoning.map((step, i) => {
                      const [factor, conclusion] = step.split('→');
                      return (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-xs text-[#64D2FF]/60 shrink-0 mt-px">{i + 1}.</span>
                          <div className="flex-1 min-w-0">
                            {factor && (
                              <span className="text-xs text-white/60">
                                {cleanTraditionName(factor.trim())}
                              </span>
                            )}
                            {conclusion && (
                              <div className="flex items-start gap-1 mt-0.5">
                                <ArrowRight size={10} className="text-[#64D2FF] mt-0.5 shrink-0" />
                                <span className="text-xs text-[#64D2FF]/90 font-medium leading-relaxed">
                                  {cleanTraditionName(conclusion.trim())}
                                </span>
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
                    <span className="text-xs font-semibold text-[#AF52DE]/90 uppercase tracking-wider">
                      Núcleo Akasha
                    </span>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed italic">
                    {narrative.expandedNarrative.integratedNarrative}
                  </p>
                  {narrative.expandedNarrative.practicalExample && (
                    <div className="flex items-start gap-1.5 mt-1">
                      <Lightbulb size={10} className="text-[#FFD60A] mt-0.5 shrink-0" />
                      <p className="text-xs text-[#FFD60A]/80 leading-relaxed">
                        {narrative.expandedNarrative.practicalExample}
                      </p>
                    </div>
                  )}
                  {/* Sexualidade (F-225) — só na área Vitalidade */}
                  {areaKey === 'vitalidadeEnergia' && narrative.sexualidade && (
                    <SexualidadeSection sexualidade={narrative.sexualidade} />
                  )}
                </div>
              )}
              {/* §5 Procedência per-area — fonte simbólica que alimenta esta área */}
              {(narrative as any).procedencia && (narrative as any).procedencia.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 px-1">
                  <span className="text-[9px] text-white/20 uppercase tracking-wider">De:</span>
                  {(
                    (narrative as any).procedencia as Array<{
                      tradicao: string;
                      simbolo: string;
                      intensidade: number;
                    }>
                  )
                    .slice(0, 4)
                    .map((p: any, i: number) => {
                      const colors: Record<string, string> = {
                        cabala: '#7C5CFF',
                        astrologia: '#2DD4BF',
                        iching: '#A0763A',
                        odu: '#FB5781',
                        tantra: '#F0B429',
                      };
                      const color = colors[p.tradicao] ?? '#888';
                      return (
                        <span
                          key={i}
                          className="text-[10px] font-medium"
                          style={{ color: `${color}cc` }}
                        >
                          {p.simbolo}
                        </span>
                      );
                    })}
                </div>
              )}

              {/* F-224: Trânsito de Hoje — dados gerados pelo motor mas nunca renderizados */}

              {narrative.dailyTransit && (
                <div
                  className="rounded-xl p-3 flex items-start gap-2.5"
                  style={{
                    background: 'linear-gradient(135deg, #64D2FF08 0%, #AF52DE08 100%)',
                    border: '1px solid #64D2FF25',
                  }}
                >
                  <Sparkles size={12} className="text-[#64D2FF] mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold text-[#64D2FF]/70 uppercase tracking-wider mb-0.5">
                      Trânsito de Hoje
                    </p>
                    <p className="text-xs text-white/75 leading-relaxed">
                      {narrative.dailyTransit.todayPhrase}
                    </p>
                  </div>
                </div>
              )}

              {/* Practical advice */}
              <div className="bg-[#FF9500]/10 border border-[#FF9500]/20 rounded-xl p-3 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-[#FF9500]" />
                  <span className="text-xs font-semibold text-[#FF9500] uppercase tracking-wider">
                    Prática de Hoje
                  </span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed">{narrative.practicalAdvice}</p>
              </div>

              {/* Ritual */}
              <RitualBadge ritual={narrative.dailyRitual} />

              {/* Transformation prompt */}
              <div className="bg-[#5856D6]/10 border border-[#5856D6]/20 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles size={12} className="text-[#5856D6]" />
                  <span className="text-xs font-semibold text-[#5856D6]/80 uppercase tracking-wider">
                    Pergunta de Transformação
                  </span>
                </div>
                <p className="text-sm text-white/70 italic leading-relaxed">
                  &ldquo;{narrative.transformationPrompt}&rdquo;
                </p>
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
  /** §P5: Ciclo pessoal — per-area alignment modulation from evolutionary agent */
  cycle?: CycleSnapshotUI | null;
}

type CycleModulationEntry = { alignmentScore: number; suggestedBoost: string; rationale: string };

export function AkashaLifeAreasDashboard({
  synthesis,
  loading = false,
  onRefetch,
  cycle,
}: AkashaLifeAreasDashboardProps) {
  const areaKeys = [
    'vitalidadeEnergia',
    'conexoesAmor',
    'carreiraProsperidade',
    'oriCabecaQuizilas',
    'missaoDestino',
    'desafiosSombras',
  ];

  // §P5: Build modulation lookup from cycle data
  const modulationMap: Record<string, CycleModulationEntry> = {};
  if (cycle?.modulation) {
    for (const m of cycle.modulation) {
      modulationMap[m.area] = {
        alignmentScore: m.alignmentScore,
        suggestedBoost: m.suggestedBoost,
        rationale: m.rationale,
      };
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {areaKeys.map((key) => (
          <div
            key={key}
            className="rounded-2xl border border-white/8 bg-[#1C1C1E] p-4 animate-pulse"
          >
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
        <p className="text-white/50 text-sm">Carregando síntese…</p>
      </div>
    );
  }

  const { oneProfile, narrativaCentral } = synthesis;
  const { akashaProfile, areas, dailyDecision, synthesisParagraph } = synthesis;

  return (
    <div className="space-y-5">
      {/* F-227: ONE Akasha Profile Card — tipo unificado visível primeiro */}
      {oneProfile && <OneProfileCard profile={oneProfile} narrativaCentral={narrativaCentral} />}
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
              <button
                onClick={onRefetch}
                className="text-white/30 hover:text-white/60 transition-colors"
              >
                <RefreshCw size={14} />
              </button>
            )}
          </div>
        </div>
        <p className="text-sm text-white/80 leading-relaxed italic">
          &ldquo;{synthesisParagraph}&rdquo;
        </p>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-xs text-white/40">
            Estágio:{' '}
            <span className="text-white/60 capitalize">{akashaProfile.transformationStage}</span>
          </span>
          <span className="text-xs text-white/40">
            Sequência ativa:{' '}
            <span className="text-white/60 capitalize">{akashaProfile.activeSequence}</span>
          </span>
        </div>
        {/* §5 Procedência: top-N proveniência — raiz de cada afirmação */}
        {(synthesis as any).procedenciaTop && (synthesis as any).procedenciaTop.length > 0 && (
          <details className="mt-3 rounded-lg border border-white/10 bg-white/4 p-2">
            <summary className="text-[10px] text-white/30 cursor-pointer select-none uppercase tracking-wider hover:text-white/50">
              Fundamento Akáshico
            </summary>
            <div className="flex flex-wrap gap-1 mt-2">
              {(
                (synthesis as any).procedenciaTop as Array<{
                  tradicao: string;
                  simbolo: string;
                  intensidade: number;
                }>
              )
                .slice(0, 6)
                .map((p: any, i: number) => {
                  const colors: Record<string, string> = {
                    cabala: '#7C5CFF',
                    astrologia: '#2DD4BF',
                    iching: '#A0763A',
                    odu: '#FB5781',
                    tantra: '#F0B429',
                  };
                  const color = colors[p.tradicao] ?? '#888';
                  return (
                    <div
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px]"
                      style={{ borderColor: `${color}44`, color: `${color}bb` }}
                    >
                      <span>{p.simbolo}</span>
                      <span style={{ color: `${color}88` }}>
                        {'●'.repeat(Math.min(3, Math.ceil((p.intensidade ?? 5) / 3)))}
                      </span>
                    </div>
                  );
                })}
            </div>
          </details>
        )}
      </div>
      {/* F-235: Frequency Path Explorer — Siddhi journey visualization */}
      <FrequencyPathExplorer
        dominantFrequency={akashaProfile.dominantFrequency}
        overallFrequencyScore={akashaProfile.overallFrequencyScore}
        transformationStage={akashaProfile.transformationStage}
      />

      {/* P3 — Interpretação profunda: AkashaSignificadoCard */}
      {synthesis.lifePath > 0 && (
        <AkashaSignificadoCard
          lifePath={synthesis.lifePath}
          defaultNivel={akashaProfile.dominantFrequency}
        />
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
        <PriorityAreasQuickView areas={areas} modulationMap={modulationMap} />

        <div className="space-y-2">
          {areaKeys.map((key) => {
            const narrative = areas[key];
            if (!narrative) return null;
            return (
              <AreaCard
                key={key}
                areaKey={key}
                narrative={narrative}
                modulation={modulationMap[key]}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
