'use client';

import {
  Calendar,
  Moon,
  Sun,
  TrendingUp,
  Target,
  Heart,
  Zap,
  Clock,
  Award,
  Shield,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Sparkles,
  Activity,
} from 'lucide-react';
import { useState } from 'react';
import { AREA_LABEL } from '@/lib/grimoire/traducao-areas';
import type { Area } from '@/lib/grimoire/traducao-areas';
import type { CycleSnapshotUI } from './hooks/useAkashaSynthesis';

interface MeuCicloProps {
  cycle: NonNullable<CycleSnapshotUI>;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function difficultyBadge(d: string) {
  if (d === 'light')
    return 'bg-green-500/20 text-green-400 border border-green-500/30 text-xs px-2 py-0.5 rounded-full';
  if (d === 'moderate')
    return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs px-2 py-0.5 rounded-full';
  return 'bg-red-500/20 text-red-400 border border-red-500/30 text-xs px-2 py-0.5 rounded-full';
}

function difficultyLabel(d: string) {
  if (d === 'light') return 'Fácil';
  if (d === 'moderate') return 'Moderado';
  return 'Desafiador';
}

function typeBadge(t: string) {
  const map: Record<string, string> = {
    ritual: 'bg-[#9D86FF]/20 text-[#9D86FF] border border-[#9D86FF]/30',
    meditation: 'bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/30',
    journaling: 'bg-[#F0B429]/20 text-[#F0B429] border border-[#F0B429]/30',
    movement: 'bg-[#FB5781]/20 text-[#FB5781] border border-[#FB5781]/30',
    social: 'bg-green-500/20 text-green-400 border border-green-500/30',
  };
  return map[t] ?? 'bg-white/10 text-white/70 border border-white/20';
}

function typeLabel(t: string) {
  const map: Record<string, string> = {
    ritual: 'Ritual',
    meditation: 'Meditação',
    journaling: 'Diário',
    movement: 'Movimento',
    social: 'Social',
  };
  return map[t] ?? t;
}

function boostBadge(b: string) {
  if (b === 'increase') return 'bg-[#2DD4BF]/20 text-[#2DD4BF] text-xs px-2 py-0.5 rounded-full';
  if (b === 'decrease') return 'bg-[#FB5781]/20 text-[#FB5781] text-xs px-2 py-0.5 rounded-full';
  return 'bg-[#F0B429]/20 text-[#F0B429] text-xs px-2 py-0.5 rounded-full';
}

function boostLabel(b: string) {
  if (b === 'increase') return '↑ Aumentar';
  if (b === 'decrease') return '↓ Reduzir';
  return '→ Manter';
}

function alignmentColor(score: number) {
  if (score >= 70) return 'bg-[#2DD4BF]';
  if (score >= 50) return 'bg-[#F0B429]';
  return 'bg-[#FB5781]';
}

function areaName(area: string) {
  return AREA_LABEL[area as Area] ?? area;
}

export function MeuCiclo({ cycle }: MeuCicloProps) {
  const [expanded, setExpanded] = useState(true);
  const { snapshot: snap, exercises, modulation } = cycle;

  const yearNum = snap.personalYear.number;

  return (
    <div className="rounded-2xl border border-[#7C5CFF]/20 bg-[#0B0E1C]/60 overflow-hidden">
      {/* Card header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 flex items-center justify-center">
            <Calendar size={18} className="text-[#9D86FF]" />
          </div>
          <div className="text-left">
            <p className="text-[10px] text-[#9D86FF] font-bold uppercase tracking-widest font-mono">
              Ciclo Pessoal
            </p>
            <p className="text-sm font-bold text-white">
              Ano {snap.personalYear.number} · Dia {snap.personalDay.number}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs text-[#A7AECF]">{snap.personalYear.theme}</span>
          {expanded ? (
            <ChevronUp size={16} className="text-[#A7AECF]" />
          ) : (
            <ChevronDown size={16} className="text-[#A7AECF]" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-5 space-y-5">
          {/* ── Personal Year + Month + Day mini-grid ── */}
          <div className="grid grid-cols-3 gap-3">
            {/* Personal Year */}
            <div className="rounded-xl border border-white/8 bg-[#06070F]/60 p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp size={11} className="text-[#7C5CFF]" />
                <span className="text-[10px] text-[#7C5CFF] font-bold uppercase tracking-widest font-mono">
                  Ano
                </span>
              </div>
              <p className="text-2xl font-bold font-cinzel text-white">
                {snap.personalYear.number}
              </p>
              <p className="text-[10px] text-[#A7AECF] leading-tight">{snap.personalYear.theme}</p>
              <p className="text-[9px] text-[#6B7194] leading-tight mt-1">
                {snap.personalYear.keyAction}
              </p>
            </div>

            {/* Personal Month */}
            <div className="rounded-xl border border-white/8 bg-[#06070F]/60 p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 mb-1">
                <Moon size={11} className="text-[#F0B429]" />
                <span className="text-[10px] text-[#F0B429] font-bold uppercase tracking-widest font-mono">
                  Mês
                </span>
              </div>
              <p className="text-2xl font-bold font-cinzel text-white">
                {snap.personalMonth.number}
              </p>
              <p className="text-[10px] text-[#A7AECF] leading-tight">
                {snap.personalMonth.energy}
              </p>
              <p className="text-[9px] text-[#6B7194] leading-tight mt-1">
                {snap.personalMonth.focus}
              </p>
            </div>

            {/* Personal Day */}
            <div className="rounded-xl border border-white/8 bg-[#06070F]/60 p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 mb-1">
                <Sun size={11} className="text-[#2DD4BF]" />
                <span className="text-[10px] text-[#2DD4BF] font-bold uppercase tracking-widest font-mono">
                  Dia
                </span>
              </div>
              <p className="text-2xl font-bold font-cinzel text-white">{snap.personalDay.number}</p>
              <p className="text-[10px] text-[#A7AECF] leading-tight">{snap.personalDay.energy}</p>
              <p className="text-[9px] text-[#6B7194] leading-tight mt-1">
                {snap.personalDay.action}
              </p>
            </div>
          </div>

          {/* ── Universal Year ── */}
          <div className="flex items-center gap-3 rounded-xl border border-[#F0B429]/15 bg-[#F0B429]/5 p-3">
            <Activity size={16} className="text-[#F0B429] shrink-0" />
            <div>
              <p className="text-[10px] text-[#F0B429] font-bold uppercase tracking-widest font-mono">
                Ano Universal {snap.universalYear.year}
              </p>
              <p className="text-xs text-white/80">
                {snap.universalYear.theme} — {snap.universalYear.globalEnergy}
              </p>
            </div>
          </div>

          {/* ── Current Pinnacle ── */}
          <div className="rounded-xl border border-white/8 bg-[#06070F]/60 p-3 space-y-2">
            <div className="flex items-center gap-1.5">
              <Target size={12} className="text-[#FB5781]" />
              <span className="text-[10px] text-[#FB5781] font-bold uppercase tracking-widest font-mono">
                Pináculo Actual
              </span>
            </div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-bold font-cinzel text-white">
                  Pináculo {snap.currentPinnacle.number}
                </p>
                <p className="text-[11px] text-[#A7AECF]">{snap.currentPinnacle.period}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/70">{snap.currentPinnacle.theme}</p>
              </div>
            </div>
            <p className="text-[11px] text-[#9D86FF] italic">{snap.currentPinnacle.keyQuestion}</p>
            {snap.currentPinnacle.opportunities.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {snap.currentPinnacle.opportunities.slice(0, 3).map((o, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20 px-1.5 py-0.5 rounded-full"
                  >
                    {o}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Karmic Lessons ── */}
          {snap.karmicLessons.length > 0 && (
            <div className="rounded-xl border border-white/8 bg-[#06070F]/60 p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <Shield size={12} className="text-[#7C5CFF]" />
                <span className="text-[10px] text-[#7C5CFF] font-bold uppercase tracking-widest font-mono">
                  Lições Cármicas
                </span>
              </div>
              <div className="space-y-2">
                {snap.karmicLessons.map((lesson, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-[#7C5CFF]/15 border border-[#7C5CFF]/30 flex items-center justify-center text-[10px] font-bold text-[#9D86FF] mt-0.5">
                      {lesson.missing === 0 ? '—' : lesson.missing}
                    </span>
                    <div>
                      <p className="text-xs text-white/80 leading-tight">{lesson.description}</p>
                      <p className="text-[10px] text-[#6B7194] mt-0.5">
                        Como aprender: {lesson.howToLearn}
                      </p>
                      <span className="text-[9px] bg-[#9D86FF]/10 text-[#9D86FF] border border-[#9D86FF]/20 px-1.5 py-0.5 rounded-full mt-1 inline-block">
                        {areaName(lesson.lifeArea)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Cycle Modulation ── */}
          {modulation.length > 0 && (
            <div className="rounded-xl border border-white/8 bg-[#06070F]/60 p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <Zap size={12} className="text-[#2DD4BF]" />
                <span className="text-[10px] text-[#2DD4BF] font-bold uppercase tracking-widest font-mono">
                  Alinhamento por Área
                </span>
              </div>
              <div className="space-y-2">
                {modulation.map((m) => (
                  <div key={m.area} className="flex items-center gap-2">
                    <span className="text-[11px] text-white/70 w-28 shrink-0 truncate">
                      {areaName(m.area)}
                    </span>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${alignmentColor(m.alignmentScore)}`}
                          style={{ width: `${m.alignmentScore}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-[#A7AECF] w-8 text-right shrink-0">
                        {m.alignmentScore}
                      </span>
                    </div>
                    <span className={boostBadge(m.suggestedBoost)}>
                      {boostLabel(m.suggestedBoost)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Top Exercises ── */}
          {exercises.prioritizedExercises.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#9D86FF]" />
                <span className="text-[10px] text-[#9D86FF] font-bold uppercase tracking-widest font-mono">
                  Exercícios Prioritários
                </span>
              </div>
              <div className="space-y-2">
                {exercises.prioritizedExercises.slice(0, 5).map((ex, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-white/8 bg-[#06070F]/60 p-3 space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full border ${typeBadge(ex.type)}`}
                          >
                            {typeLabel(ex.type)}
                          </span>
                          <span className={`${difficultyBadge(ex.difficulty)}`}>
                            {difficultyLabel(ex.difficulty)}
                          </span>
                          <span className="text-[10px] bg-white/5 text-white/50 border border-white/10 px-1.5 py-0.5 rounded-full">
                            {ex.duration}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-white leading-tight">{ex.title}</p>
                        <p className="text-[11px] text-[#A7AECF] mt-1 leading-relaxed">
                          {ex.description}
                        </p>
                      </div>
                    </div>
                    {ex.area && (
                      <span className="text-[9px] bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20 px-1.5 py-0.5 rounded-full">
                        {areaName(ex.area)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
