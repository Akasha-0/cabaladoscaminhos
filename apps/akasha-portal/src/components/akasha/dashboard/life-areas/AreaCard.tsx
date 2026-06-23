'use client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Star,
  ArrowRight,
  Lightbulb,
  GitBranch,
  Sparkles,
} from 'lucide-react';
import { useState, memo } from 'react';
import type { AreaNarrativeUI } from '../hooks/useAkashaSynthesis';
import type { ProcedenciaEntry } from '@akasha/core';
import { AREA_CONFIG, FrequencyBadge, IntensityDots, cleanTraditionName } from '../dashboard-utils';
import { RitualBadge, SexualidadeSection } from '../synthesis-engine/AreaCardSections';

// ─── Procedência legend (synchronized with dashboard barrel) ──────────────────
const TRADICAO_COLORS: Record<string, string> = {
  cabala: '#7C5CFF',
  astrologia: '#2DD4BF',
  iching: '#A0763A',
  odu: '#FB5781',
  tantra: '#F0B429',
};

type CycleModulationEntry = { alignmentScore: number; suggestedBoost: string; rationale: string };

export const AreaCard = memo(function AreaCard({
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
      whileHover={{ scale: 1.02 }}
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
              <AreaCardShadowGift
                label="Padrão de Sombra"
                icon={<XCircle size={12} className="text-[#FF2D55]" />}
                iconColor="#FF2D55"
                content={narrative.shadowPattern}
                tags={narrative.shadowSymptoms}
                tagColor="#FF2D55"
              />

              {/* Gift pattern */}
              <AreaCardShadowGift
                label="Seu Dom"
                icon={<CheckCircle2 size={12} className="text-[#34C759]" />}
                iconColor="#34C759"
                content={narrative.giftPattern}
                tags={narrative.giftStrengths}
                tagColor="#34C759"
              />

              {/* Chain of Reasoning */}
              {narrative.chainOfReasoning && narrative.chainOfReasoning.length > 0 && (
                <AreaCardChainOfReasoning steps={narrative.chainOfReasoning} />
              )}

              {/* Expanded Narrative */}
              {narrative.expandedNarrative && (
                <AreaCardExpandedNarrative
                  expandedNarrative={narrative.expandedNarrative}
                  areaKey={areaKey}
                />
              )}

              {/* Procedência per-area */}
              {narrative.procedencia && narrative.procedencia.length > 0 && (
                <AreaCardProcedencia procedencia={narrative.procedencia} />
              )}

              {/* Trânsito de Hoje */}
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
});

// ─── Sub-components ──────────────────────────────────────────────────────────

function AreaCardShadowGift({
  label,
  icon,
  iconColor,
  content,
  tags,
  tagColor,
}: {
  label: string;
  icon: React.ReactNode;
  iconColor: string;
  content: string;
  tags: string[];
  tagColor: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: `${iconColor}cc` }}>
          {label}
        </span>
      </div>
      <p className="text-sm text-white/75 leading-relaxed">{content}</p>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {tags.map((s, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${tagColor}15`, color: `${tagColor}cc` }}
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function AreaCardChainOfReasoning({ steps }: { steps: string[] }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <GitBranch size={12} className="text-[#64D2FF]" />
        <span className="text-xs font-semibold text-[#64D2FF]/90 uppercase tracking-wider">
          Como chegamos aqui
        </span>
      </div>
      <div className="space-y-1">
        {steps.map((step, i) => {
          const idx = step.indexOf('→');
          const factor = idx >= 0 ? step.slice(0, idx).trim() : step.trim();
          const conclusion = idx >= 0 ? step.slice(idx + 1).trim() : '';
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="text-xs text-[#64D2FF]/60 shrink-0 mt-px">{i + 1}.</span>
              <div className="flex-1 min-w-0">
                {factor && (
                  <span className="text-xs text-white/60">
                    {cleanTraditionName(factor)}
                  </span>
                )}
                {conclusion && (
                  <div className="flex items-start gap-1 mt-0.5">
                    <ArrowRight size={10} className="text-[#64D2FF] mt-0.5 shrink-0" />
                    <span className="text-xs text-[#64D2FF]/90 font-medium leading-relaxed">
                      {cleanTraditionName(conclusion)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AreaCardExpandedNarrative({
  expandedNarrative,
  areaKey,
}: {
  expandedNarrative: AreaNarrativeUI['expandedNarrative'];
  areaKey: string;
}) {
  if (!expandedNarrative) return null;
  return (
    <div className="bg-gradient-to-br from-[#AF52DE]/10 to-[#64D2FF]/10 border border-[#AF52DE]/20 rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-1.5">
        <Star size={12} className="text-[#AF52DE]" />
        <span className="text-xs font-semibold text-[#AF52DE]/90 uppercase tracking-wider">
          Núcleo Akasha
        </span>
      </div>
      <p className="text-xs text-white/80 leading-relaxed italic">
        {expandedNarrative.integratedNarrative}
      </p>
      {expandedNarrative.practicalExample && (
        <div className="flex items-start gap-1.5 mt-1">
          <Lightbulb size={10} className="text-[#FFD60A] mt-0.5 shrink-0" />
          <p className="text-xs text-[#FFD60A]/80 leading-relaxed">
            {expandedNarrative.practicalExample}
          </p>
        </div>
      )}
      {areaKey === 'vitalidadeEnergia' && (expandedNarrative as unknown as { sexualidade?: AreaNarrativeUI['sexualidade'] }).sexualidade && (
        <SexualidadeSection
          sexualidade={(expandedNarrative as unknown as { sexualidade: AreaNarrativeUI['sexualidade'] }).sexualidade!}
        />
      )}
    </div>
  );
}

function AreaCardProcedencia({ procedencia }: { procedencia: ProcedenciaEntry[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1 px-1">
      <span className="text-[9px] text-white/20 uppercase tracking-wider">De:</span>
      {procedencia.slice(0, 4).map((p, i) => {
        const color = TRADICAO_COLORS[p.tradicao] ?? '#888';
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
  );
}
