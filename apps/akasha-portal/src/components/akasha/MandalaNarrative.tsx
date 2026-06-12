'use client';

/**
 * MandalaNarrative — F-229: Primeira Experiência Narrativa Akasha
 *
 * Substitui os 5 cards com números crus por UMA narrativa unificada.
 * Mostra o Tipo Akasha, frase de poder, síntese dos 5 pilares,
 * e as 6 áreas de vida com frequência — tudo em 2ª pessoa.
 *
 * O usuário entende SEU perfil antes de ver qualquer número ou símbolo.
 */

import { useState } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Zap, Heart, TrendingUp, Brain, Sparkles, AlertTriangle,
  ChevronDown, ArrowRight, Star, CheckCircle2, XCircle,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AreaNarrative {
  area: string;
  title: string;
  frequency: 'shadow' | 'gift' | 'siddhi';
  intensity: 1 | 2 | 3;
  integratedNarrative: string;
  practicalExample: string;
}

interface MandalaNarrativeProps {
  synthesis: {
    oneProfile: {
      typeName: string;
      typeIcon: string;
      corePattern: string;
      oneLiner: string;
      strategy: string;
      strategyDetail: string;
      authority: string;
      authorityPractice: string;
      dailyDirective: string;
      growthEdge: string;
      shadowTrap: string;
      dominantPillar: string;
    } | null;
    areas: Record<string, AreaNarrative>;
    synthesisParagraph: string;
  } | null;
  loading?: boolean;
  locale: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const AREA_CONFIG: Record<string, {
  icon: typeof Zap;
  color: string;
  bgColor: string;
  label: string;
}> = {
  vitalidadeEnergia:    { icon: Zap,           color: '#FF9500', bgColor: 'rgba(255,149,0,0.12)',  label: 'Corpo & Energia' },
  conexoesAmor:        { icon: Heart,         color: '#FF3B30', bgColor: 'rgba(255,59,48,0.12)',  label: 'Relações & Amor' },
  carreiraProsperidade: { icon: TrendingUp,    color: '#34C759', bgColor: 'rgba(52,199,89,0.12)', label: 'Carreira & Dinheiro' },
  oriCabecaQuizilas:    { icon: Brain,         color: '#5856D6', bgColor: 'rgba(88,86,214,0.12)', label: 'Mente & Propósito' },
  missaoDestino:       { icon: Sparkles,      color: '#AF52DE', bgColor: 'rgba(175,82,222,0.12)', label: 'Missão & Destino' },
  desafiosSombras:     { icon: AlertTriangle, color: '#FF375F', bgColor: 'rgba(255,55,95,0.12)',  label: 'Transformação' },
};

const FREQ_CONFIG = {
  shadow: { label: 'Sombra', color: '#FF2D55', Icon: XCircle },
  gift:   { label: 'Dom',   color: '#34C759', Icon: CheckCircle2 },
  siddhi: { label: 'Siddhi',color: '#AF52DE', Icon: Star },
};

const TYPE_COLORS: Record<string, string> = {
  catalisador: '#FF6B35', receptor: '#0A84FF', construtor: '#30D158',
  transformador: '#BF5AF2', guardiao: '#64D2FF', curador: '#FF375F',
  canal: '#FFD60A', alquimista: '#AC8E68', arquiteto: '#8E8E93',
};
const TYPE_ICONS: Record<string, string> = {
  catalisador: '⚡', receptor: '🌊', construtor: '🏗️',
  transformador: '🔥', guardiao: '🛡️', curador: '💖',
  canal: '📡', alquimista: '⚗️', arquiteto: '🏛️',
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function FrequencyBadge({ frequency }: { frequency: 'shadow' | 'gift' | 'siddhi' }) {
  const { label, color, Icon } = FREQ_CONFIG[frequency];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${color}22`, color }}
    >
      <Icon size={10} />
      {label}
    </span>
  );
}

function AreaCard({
  area,
  narrative,
  defaultOpen = false,
}: {
  area: string;
  narrative: AreaNarrative;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const cfg = AREA_CONFIG[area] ?? { icon: Zap, color: '#888', bgColor: 'rgba(136,136,136,0.12)', label: area };
  const { label } = cfg;
  const Icon = cfg.icon;
  const freqColor = FREQ_CONFIG[narrative.frequency]?.color ?? '#888';

  return (
    <div
      className="rounded-2xl border border-white/8 overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${cfg.bgColor} 0%, rgba(20,20,24,0.95) 100%)` }}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${cfg.color}22` }}
        >
          <Icon size={18} style={{ color: cfg.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-white">{label}</span>
            <FrequencyBadge frequency={narrative.frequency} />
          </div>
          <p className="text-xs text-white/40 line-clamp-1">{narrative.title}</p>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown size={16} className="text-white/30" />
        </motion.div>
      </button>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Narrative */}
              <p className="text-sm text-white/80 leading-relaxed">
                {narrative.integratedNarrative}
              </p>

              {/* Practical example */}
              <div
                className="rounded-xl p-3 text-sm"
                style={{ backgroundColor: `${freqColor}15`, borderLeft: `3px solid ${freqColor}` }}
              >
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1 font-medium">Prática de Hoje</p>
                <p className="text-sm text-white/90 leading-snug">{narrative.practicalExample}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function MandalaNarrative({ synthesis, loading, locale }: MandalaNarrativeProps) {
  const [areasOpen, setAreasOpen] = useState(false);

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-48 rounded-2xl bg-white/5" />
        <div className="h-24 rounded-2xl bg-white/5" />
        <div className="h-24 rounded-2xl bg-white/5" />
      </div>
    );
  }

  if (!synthesis?.oneProfile) {
    return (
      <div className="rounded-2xl border border-[#FF9500]/30 bg-[#FF9500]/5 p-6 text-center">
        <p className="text-white/60 text-sm">
          Seu perfil Akasha está sendo calculado…
        </p>
      </div>
    );
  }

  const { oneProfile, areas, synthesisParagraph } = synthesis;
  const accentColor = TYPE_COLORS[oneProfile.typeName.toLowerCase().replace(' ', '')] ?? '#FF9500';
  const typeIcon = TYPE_ICONS[oneProfile.typeName.toLowerCase().replace(' ', '')] ?? '✨';

  return (
    <div className="space-y-5">
      {/* ── ONE PROFILE HERO ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl border border-white/10 overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #1C1C1E 0%, #0A0A0C 100%)' }}
      >
        {/* Header band */}
        <div
          className="px-6 pt-6 pb-5"
          style={{ background: `linear-gradient(135deg, ${accentColor}18 0%, transparent 60%)` }}
        >
          {/* Type + icon */}
          <div className="flex items-start gap-4 mb-5">
            <span className="text-6xl leading-none">{typeIcon}</span>
            <div className="flex-1">
              <p className="text-xs text-white/40 uppercase tracking-widest font-medium mb-1">Seu Tipo Akasha</p>
              <h2 className="text-2xl font-bold text-white leading-tight">{oneProfile.typeName}</h2>
              <p className="text-sm text-white/60 mt-1 italic">{oneProfile.corePattern}</p>
            </div>
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold shrink-0"
              style={{ backgroundColor: `${accentColor}22`, color: accentColor }}
            >
              {oneProfile.dominantPillar.split('—')[0].trim()}
            </span>
          </div>

          {/* Power phrase */}
          <div
            className="rounded-2xl p-5 mb-5"
            style={{ background: 'rgba(0,0,0,0.4)', borderLeft: `4px solid ${accentColor}` }}
          >
            <p className="text-lg font-semibold text-white leading-snug">
              {oneProfile.oneLiner}
            </p>
          </div>

          {/* Strategy + Authority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1 font-medium">Estratégia</p>
              <p className="text-sm font-semibold text-white">{oneProfile.strategy}</p>
              <p className="text-xs text-white/50 mt-1 leading-relaxed">{oneProfile.strategyDetail}</p>
            </div>
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1 font-medium">Autoridade</p>
              <p className="text-sm text-white/80 italic leading-snug">"{oneProfile.authorityPractice}"</p>
            </div>
          </div>
        </div>

        {/* Daily directive + growth */}
        <div className="px-6 pb-6 border-t border-white/8 pt-4 grid grid-cols-1 gap-3">
          <div className="bg-[#FF9500]/10 border border-[#FF9500]/20 rounded-xl px-4 py-3">
            <p className="text-xs text-[#FF9500]/80 uppercase tracking-wider font-semibold mb-1">Diretiva de Hoje</p>
            <p className="text-sm text-white font-medium leading-snug">{oneProfile.dailyDirective}</p>
          </div>
          <div className="flex items-start gap-2">
            <ArrowRight size={14} className="text-[#30D158] mt-0.5 shrink-0" />
            <p className="text-xs text-white/60">
              <span className="text-[#30D158] font-medium">Crescimento: </span>
              {oneProfile.growthEdge}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="text-[#FF375F] mt-0.5 shrink-0" />
            <p className="text-xs text-white/60">
              <span className="text-[#FF375F] font-medium">Armadilha: </span>
              {oneProfile.shadowTrap}
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── SÍNTESE GERAL ── */}
      {synthesisParagraph && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-2xl border border-[#7C5CFF]/20 bg-gradient-to-br from-[#7C5CFF]/8 to-transparent p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-[#7C5CFF]" />
            <span className="text-xs text-[#7C5CFF] uppercase tracking-wider font-semibold">Síntese Akasha</span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed">{synthesisParagraph}</p>
        </motion.div>
      )}

      {/* ── 6 ÁREAS DE VIDA ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <button
          onClick={() => setAreasOpen(!areasOpen)}
          className="w-full flex items-center justify-between mb-3"
        >
          <h3 className="text-sm font-semibold text-white/80">Suas 6 Áreas de Vida</h3>
          <motion.span
            animate={{ rotate: areasOpen ? 180 : 0 }}
            className="text-white/30"
          >
            <ChevronDown size={16} />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {areasOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2 overflow-hidden"
            >
              {Object.entries(areas)
                .filter(([, v]) => v?.integratedNarrative)
                .map(([area, narrative]) => (
                  <AreaCard key={area} area={area} narrative={narrative} />
                ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── CTA: IR PARA DASHBOARD ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center pt-2"
      >
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}99 100%)`,
            boxShadow: `0 4px 24px ${accentColor}40`,
          }}
        >
          Ver Análise Completa
          <ArrowRight size={16} />
        </Link>
        <p className="text-xs text-white/30 mt-2">
          Dashboard com ritual diário, trânsitos e alertas personalizados
        </p>
      </motion.div>
    </div>
  );
}
