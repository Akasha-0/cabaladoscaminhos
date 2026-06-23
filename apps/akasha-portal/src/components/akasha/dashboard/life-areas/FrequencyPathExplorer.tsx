'use client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Star,
  ArrowRight,
  Sparkles,
  GitBranch,
} from 'lucide-react';
import { useState, memo } from 'react';
import type { FrequencyLevel } from '@/lib/application/akasha/synthesis-engine/synthesis-types';
import { FrequencyBadge } from '../dashboard-utils';

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

export const FrequencyPathExplorer = memo(function FrequencyPathExplorer({
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
});
