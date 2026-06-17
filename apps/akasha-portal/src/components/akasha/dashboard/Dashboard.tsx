'use client';

/**
 * @akasha/portal — Consolidated Dashboard Container (v2)
 *
 * Coordinates the unified dashboard experience:
 * 1. Meu Dia (Daily Energy, deterministic strategies & authorities from /meu-dia)
 * 2. Áreas da Vida (6 life areas - permanent map)
 * 3. Evolução (Streak, Completed rituals, stats, history)
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Moon, Sun, Cloud, Loader, 
  RefreshCw, TrendingUp, Award, UserCheck, X, Info, 
  Clock, Wind, CheckCircle, Heart, Zap, ChevronUp, ChevronDown
} from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { DashboardStats } from './components/DashboardStats';
import { StreakCalendar } from './StreakCalendar';
import { ProgressChart } from './ProgressChart';
import { RitualHistory } from './RitualHistory';
import { useDashboardData } from './hooks/useDashboardData';
import { useAkashaSynthesis } from './hooks/useAkashaSynthesis';
import { AkashaLifeAreasDashboard } from './AkashaLifeAreasDashboard';
import { sintetizarMapa } from '@/lib/grimoire/synthesis/synthesizer';
import type { CaixaSintese, DimensaoSintese } from '@/lib/grimoire/synthesis/synthesizer';
import type { PilaresDados } from '@/lib/grimoire/significados-curados';
import { AREA_ICONE, AREA_LABEL } from '@/lib/grimoire/traducao-areas';

interface DashboardProps {
  userId: string;
  userName?: string;
  initialPilares?: PilaresDados;
  locale: string;
}

type TabType = 'daily' | 'profile' | 'progress';

// Akasha Strategy Styling (Doc 26)
const ESTRATEGIA_BG: Record<string, string> = {
  act: 'rgba(45,212,191,0.06)',
  wait: 'rgba(240,180,41,0.06)',
  observe: 'rgba(124,92,255,0.06)',
  surrender: 'rgba(196,62,142,0.06)',
};

const ESTRATEGIA_BORDER: Record<string, string> = {
  act: 'rgba(45,212,191,0.2)',
  wait: 'rgba(240,180,41,0.2)',
  observe: 'rgba(124,92,255,0.2)',
  surrender: 'rgba(196,62,142,0.2)',
};

const ESTRATEGIA_COLOR: Record<string, string> = {
  act: '#2DD4BF',
  wait: '#F0B429',
  observe: '#7C5CFF',
  surrender: '#C43E8E',
};

const ESTRATEGIA_LABEL: Record<string, string> = {
  act: 'Aja',
  wait: 'Espere',
  observe: 'Observe',
  surrender: 'Entregue',
};


// Helper to determine greeting based on local hour
function getGreeting(): string {
  const hr = new Date().getHours();
  if (hr < 5) return 'Boa madrugada';
  if (hr < 12) return 'Bom despertar';
  if (hr < 18) return 'Boa tarde';
  return 'Boa noite';
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });
}

// Simple markdown renderer to highlight bold sections
function renderNarrative(text: string, fontSize = '0.9rem'): React.ReactNode[] {
  if (!text) return [];
  const paragraphs = text.split('\n\n').filter(Boolean);
  return paragraphs.map((para, i) => {
    const parts = para.split(/\*\*(.+?)\*\*/g);
    return (
      <p
        key={i}
        className="leading-relaxed text-[#A7AECF] mb-3 last:mb-0"
        style={{ fontSize }}
      >
        {parts.map((part, j) =>
          j % 2 === 1
            ? <strong key={j} className="text-[#9D86FF] font-semibold">{part}</strong>
            : <span key={j}>{part}</span>
        )}
      </p>
    );
  });
}

export function Dashboard({ userId, userName = 'Viajante', initialPilares, locale }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('daily');
  const [completing, setCompleting] = useState(false);
  const [completedToday, setCompletedToday] = useState(false);
  const [streakToast, setStreakToast] = useState<string | null>(null); // e.g. "🔥 3 dias"
  const [activeFilterChip, setActiveFilterChip] = useState<string | null>(null); // filters compass
  
  // Deterministic synthesis state (calculated from mandato-do-dia)
  const [detSintese, setDetSintese] = useState<CaixaSintese | null>(() => {
    if (initialPilares) {
      try {
        return sintetizarMapa(initialPilares);
      } catch (err) {
        console.error('Error synthesizing initial pilares:', err);
      }
    }
    return null;
  });
  const [loadingMandato, setLoadingMandato] = useState(!initialPilares);
  const [selectedDimension, setSelectedDimension] = useState<DimensaoSintese | null>(null);
  const [dimFocoExpanded, setDimFocoExpanded] = useState(false);
  const [ritualExpanded, setRitualExpanded] = useState(false);

  const { data: statsData, loading: statsLoading, refetch: refetchStats } = useDashboardData({ userId });
  const { data: dailyData, synthesis, loading: synthesisLoading, refetch: refetchSynthesis } = useAkashaSynthesis({ userId });

  // Fetch /api/akasha/mandato-do-dia and run local synthesis
  const fetchMandato = async () => {
    setLoadingMandato(true);
    try {
      const res = await fetch('/api/akasha/mandato-do-dia');
      if (res.ok) {
        const data = await res.json();
        if (data.pilares) {
          const sint = sintetizarMapa(data.pilares);
          setDetSintese(sint);
        }
      }
    } catch (err) {
      console.error('Error fetching deterministic mandato:', err);
    } finally {
      setLoadingMandato(false);
    }
  };

  // Filter chips — highlight relevant sections when a chip is active
  useEffect(() => {
    if (!activeFilterChip || !detSintese) return;
    // Scroll to the relevant section based on chip type
    const sectionMap: Record<string, string> = {
      clima: 'daily-vibe',
      lua: 'daily-vibe',
      tema: 'daily-authority',
    };
    const id = sectionMap[activeFilterChip];
    if (id) {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Briefly flash the section
        el.classList.add('chip-highlight');
        setTimeout(() => el.classList.remove('chip-highlight'), 1200);
      }
    }
  }, [activeFilterChip, detSintese]);

  useEffect(() => {
    if (!initialPilares) {
      fetchMandato();
    }
  }, [initialPilares]);

  // Check if today's ritual is already completed in history
  useEffect(() => {
    if (statsData?.history && dailyData?.ritual) {
      const todayStr = new Date().toISOString().split('T')[0];
      const done = statsData.history.some(item => {
        const itemDate = new Date(item.date).toISOString().split('T')[0];
        return itemDate === todayStr && item.ritualName === dailyData.ritual.titulo;
      });
      setCompletedToday(done);
    }
  }, [statsData, dailyData]);

  const handleCompleteRitual = async () => {
    if (!dailyData?.ritual) return;
    setCompleting(true);
    try {
      const res = await fetch('/api/akasha/dashboard/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ritualName: dailyData.ritual.titulo,
          ritualLevel: synthesis?.akashaProfile?.dominantFrequency ?? 'gift',
        }),
      });
      if (res.ok) {
        setCompletedToday(true);
        // Show streak toast after completing
        const currentStreak = statsData?.stats?.currentStreak ?? 0;
        setStreakToast(`🔥 ${currentStreak + 1} dia${currentStreak + 1 !== 1 ? 's' : ''}`);
        setTimeout(() => setStreakToast(null), 4000);
        refetchStats(); // Refresh streak/stats
      }
    } catch (err) {
      console.error('Error completing ritual:', err);
    } finally {
      setCompleting(false);
    }
  };

  const handleRetryAll = () => {
    refetchStats();
    refetchSynthesis();
    fetchMandato();
  };

  const isLoading = statsLoading || synthesisLoading || loadingMandato;

  if (!statsData || !synthesis || !detSintese) {
    // Distinguish loading vs error
    const hasLoadingState = statsLoading || synthesisLoading || loadingMandato;
    if (!hasLoadingState) {
      // Error / empty state — simple language, no technical explanation
      return (
        <div className="min-h-screen bg-[#06070F] flex flex-col justify-center items-center relative overflow-hidden">
          <div aria-hidden className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(124,92,255,0.12)_0%,transparent_50%),radial-gradient(ellipse_at_80%_80%,rgba(45,212,191,0.06)_0%,transparent_40%)]" />
          </div>
          <div className="relative flex flex-col items-center gap-6 p-8">
            <div className="w-16 h-16 rounded-full border border-white/10 bg-[#0B0E1C]/80 flex items-center justify-center">
              <Sparkles size={28} className="text-white/30" />
            </div>
            <div className="text-center space-y-3 max-w-xs">
              <p className="text-base font-semibold text-white">Não foi possível carregar seu alinhamento de hoje.</p>
              <button
                onClick={handleRetryAll}
                className="px-5 py-2.5 rounded-full bg-[#7C5CFF]/20 border border-[#7C5CFF]/40 text-[#9D86FF] text-sm font-semibold hover:bg-[#7C5CFF]/30 transition-all"
              >
                Recarregar
              </button>
            </div>
          </div>
        </div>
      );
    }
    // Loading spinner
    return (
      <div className="min-h-screen bg-[#06070F] flex flex-col justify-center items-center relative overflow-hidden">
        {/* Animated cosmic background */}
        <div aria-hidden className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(124,92,255,0.15)_0%,transparent_50%),radial-gradient(ellipse_at_80%_80%,rgba(45,212,191,0.08)_0%,transparent_40%)] animate-pulse" />
          <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-[#7C5CFF]/10 rounded-full blur-3xl animate-[ping_2s_ease-in-out_infinite]" />
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-[#2DD4BF]/10 rounded-full blur-3xl animate-[ping_3s_ease-in-out_infinite_1s]" />
        </div>
        {/* Pulsing Akasha symbol */}
        <div className="relative">
          <div className="absolute inset-0 bg-[#7C5CFF]/20 rounded-full blur-xl animate-pulse" />
          <div className="w-20 h-20 rounded-full border-2 border-[#7C5CFF]/40 flex items-center justify-center bg-[#0B0E1C]/80 backdrop-blur-sm shadow-[0_0_40px_rgba(124,92,255,0.3)]">
            <Loader className="animate-spin text-[#9D86FF]" size={32} />
          </div>
        </div>
        <div className="mt-8 text-center space-y-2 relative z-10">
          <p className="text-lg font-bold font-cinzel text-white tracking-wider"><Sparkles size={18} className="inline mr-1 text-[#9D86FF]" /> AKASHA</p>
          <p className="text-sm text-[#A7AECF] font-cinzel tracking-widest animate-pulse">SINTONIZANDO SUA ENERGIA...</p>
        </div>
        {/* Orbiting dots */}
        <div className="absolute w-64 h-64">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#7C5CFF] rounded-full animate-[spin_4s_linear_infinite]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#2DD4BF] rounded-full animate-[spin_3s_linear_infinite_reverse]" />
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1 h-1 bg-[#F0B429] rounded-full animate-[spin_5s_linear_infinite]" />
        </div>
      </div>
    );
  }

  // Map areaFoco to dimension ID to extract today's specific focus card
  let dimFoco: DimensaoSintese | null = null;
  if (detSintese) {
    const areaMap: Record<string, string> = {
      saude: 'saude',
      relacoes: 'amor',
      trabalho: 'trabalho',
      dinheiro: 'trabalho',
      proposito: 'proposito',
      criatividade: 'criacao',
      espiritualidade: 'espiritualidade',
    };
    const targetDimId = areaMap[detSintese.autoridade.areaFoco] || 'trabalho';
    dimFoco = detSintese.dimensoes.find(d => d.dimensoesId === targetDimId) || detSintese.dimensoes[0];
  }

  return (
    <div className="min-h-screen bg-[#06070F] text-[#F4F5FF]">
      {/* Background glow effects */}
      <div aria-hidden className="fixed inset-0 z-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(124, 92, 255, 0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(45, 212, 191, 0.04) 0%, transparent 50%)',
      }} />

      {/* Localized dashboard header */}
      <header className="sticky top-0 z-40 bg-[#06070F]/80 backdrop-blur-md border-b border-[#7C5CFF]/15 px-4 py-3 md:px-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#A7AECF] uppercase tracking-widest font-mono">Painel</span>
            <h1 className="text-lg font-bold font-cinzel text-white tracking-wider">AKASHA OS</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleRetryAll}
              className="p-2 text-[#A7AECF] hover:text-[#7C5CFF] rounded-lg transition-colors bg-white/5 border border-white/5"
              title="Sincronizar"
            >
              <RefreshCw size={16} className={`${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Tab Segmented Control */}
      <div className="px-4 pt-6 max-w-2xl mx-auto relative z-10">
        <div className="bg-[#0B0E1C]/80 border border-white/10 rounded-full p-1 flex items-center justify-between backdrop-blur-md">
          {[
            { id: 'daily', label: 'Alinhamento', icon: Sparkles },
            { id: 'profile', label: 'Áreas da Vida', icon: Award },
            { id: 'progress', label: 'Evolução', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 relative ${
                  active ? 'text-white' : 'text-[#A7AECF] hover:text-white'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-[#7C5CFF]/30 border border-[#7C5CFF]/60 rounded-full z-0"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon size={14} className="relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8 relative z-10 min-h-[60vh]">
        <AnimatePresence mode="wait">
          {activeTab === 'daily' && (
            <motion.div
              key="daily"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Daily greeting and header */}
              <div className="space-y-1">
                <p className="text-xs text-[#A7AECF] uppercase tracking-wider font-medium">{getFormattedDate()}</p>
                <h2 className="text-2xl font-bold font-cinzel text-white">
                  {getGreeting()}, <span className="text-[#9D86FF]">{userName}</span>
                </h2>
                {detSintese?.caminhoDeVida && (
                  <p className="text-xs text-[#A7AECF] font-medium tracking-wide">
                    <Sparkles size={12} className="inline mr-1 text-[#9D86FF]" />{detSintese.caminhoDeVida}
                  </p>
                )}
              </div>

              {/* Cosmic Vibe Grid — selectable chips that filter/highlight sections */}
              <p className="text-[10px] text-[#A7AECF]/40 text-center tracking-wide">
                Toque para filtrar · cada bloco destaca sua dimensão abaixo
              </p>
              <div id="daily-vibe" className="grid grid-cols-3 gap-2.5">

                {/* Clima Chip */}
                <button
                  onClick={() => setActiveFilterChip(activeFilterChip === 'clima' ? null : 'clima')}
                  className={`relative group rounded-2xl p-3 text-center transition-all duration-200 ${
                    activeFilterChip === 'clima'
                      ? 'bg-[#2DD4BF]/15 border border-[#2DD4BF]/50 shadow-[0_0_15px_rgba(45,212,191,0.15)]'
                      : 'bg-[#0B0E1C]/60 border border-[#2DD4BF]/20 hover:border-[#2DD4BF]/40 hover:bg-[#2DD4BF]/5'
                  }`}
                >
                  <div className="flex justify-center mb-1">
                    <div className="w-8 h-8 rounded-xl bg-[#2DD4BF]/10 flex items-center justify-center">
                      <Cloud size={16} className="text-[#2DD4BF]" />
                    </div>
                  </div>
                  <p className="text-[11px] text-[#2DD4BF]/70 uppercase tracking-widest font-mono font-semibold">Tempo</p>
                  <p className="text-xs font-bold mt-1 text-white truncate">{dailyData?.climate ?? 'Estável'}</p>
                  {activeFilterChip === 'clima' && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#2DD4BF] flex items-center justify-center">
                      <CheckCircle size={10} className="text-[#06070F]" />
                    </div>
                  )}
                </button>

                {/* Lua Chip */}
                <button
                  onClick={() => setActiveFilterChip(activeFilterChip === 'lua' ? null : 'lua')}
                  className={`relative group rounded-2xl p-3 text-center transition-all duration-200 ${
                    activeFilterChip === 'lua'
                      ? 'bg-[#F0B429]/15 border border-[#F0B429]/50 shadow-[0_0_15px_rgba(240,180,41,0.15)]'
                      : 'bg-[#0B0E1C]/60 border border-[#F0B429]/20 hover:border-[#F0B429]/40 hover:bg-[#F0B429]/5'
                  }`}
                >
                  <div className="flex justify-center mb-1">
                    <div className="w-8 h-8 rounded-xl bg-[#F0B429]/10 flex items-center justify-center">
                      <Moon size={16} className="text-[#F0B429]" />
                    </div>
                  </div>
                  <p className="text-[11px] text-[#F0B429]/80 uppercase tracking-widest font-mono font-semibold">Fase Lunar</p>
                  <p className="text-xs font-bold mt-1 text-white truncate">{dailyData?.moonPhase ?? 'Calculando'}</p>
                  {activeFilterChip === 'lua' && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F0B429] flex items-center justify-center">
                      <CheckCircle size={10} className="text-[#06070F]" />
                    </div>
                  )}
                </button>

                {/* Tema Chip */}
                <button
                  onClick={() => setActiveFilterChip(activeFilterChip === 'tema' ? null : 'tema')}
                  className={`relative group rounded-2xl p-3 text-center transition-all duration-200 ${
                    activeFilterChip === 'tema'
                      ? 'bg-[#7C5CFF]/15 border border-[#7C5CFF]/50 shadow-[0_0_15px_rgba(124,92,255,0.15)]'
                      : 'bg-[#0B0E1C]/60 border border-[#7C5CFF]/20 hover:border-[#7C5CFF]/40 hover:bg-[#7C5CFF]/5'
                  }`}
                >
                  <div className="flex justify-center mb-1">
                    <div className="w-8 h-8 rounded-xl bg-[#7C5CFF]/10 flex items-center justify-center">
                      <Sun size={16} className="text-[#7C5CFF]" />
                    </div>
                  </div>
                  <p className="text-[11px] text-[#7C5CFF]/80 uppercase tracking-widest font-mono font-semibold">Tema</p>
                  <p className="text-xs font-bold mt-1 text-white truncate">{dailyData?.overallTheme ?? 'Foco'}</p>
                  {activeFilterChip === 'tema' && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#7C5CFF] flex items-center justify-center">
                      <CheckCircle size={10} className="text-white" />
                    </div>
                  )}
                </button>
              </div>

              {/* 1. Deterministic General Synthesis Card (valiosas informações de /meu-dia) */}
              {detSintese?.perfilGeral && (
                <div className="rounded-2xl border border-white/10 bg-[#0B0E1C]/60 p-5 space-y-3">
                  <div className="flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Sparkles size={14} className="text-[#9D86FF]" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Perfil de Hoje</h3>
                  </div>
                  <div
                    className="relative"
                    style={{ maxHeight: '4.5em', overflow: 'hidden' }}
                  >
                    <div className="space-y-1">
                      {renderNarrative(detSintese.perfilGeral)}
                    </div>
                    <div
                      aria-hidden
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '2em',
                        background: 'linear-gradient(to bottom, transparent, #0B0E1C)',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* 2. Akasha Authority Card (from /meu-dia) */}
              {detSintese?.autoridade && (
                <div
                  id="daily-authority"
                  className="rounded-2xl border p-5 space-y-4 transition-all duration-500"
                  style={{ 
                    backgroundColor: ESTRATEGIA_BG[detSintese.autoridade.estrategia] || 'rgba(255,255,255,0.02)',
                    borderColor: ESTRATEGIA_BORDER[detSintese.autoridade.estrategia] || 'rgba(255,255,255,0.1)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Info size={16} className="text-white/80" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Diretriz de Decisão (Autoridade)</h3>
                    </div>
                    <span 
                      className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                      style={{ 
                        backgroundColor: `${ESTRATEGIA_COLOR[detSintese.autoridade.estrategia]}22`,
                        color: ESTRATEGIA_COLOR[detSintese.autoridade.estrategia]
                      }}
                    >
                      {ESTRATEGIA_LABEL[detSintese.autoridade.estrategia] || detSintese.autoridade.estrategia}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-cinzel text-white leading-tight">
                    {detSintese.autoridade.decisaoHoje}
                  </h3>

                  <p className="text-xs text-[#A7AECF] leading-relaxed">
                    {detSintese.autoridade.explicacao}
                  </p>

                  <div className="bg-black/25 rounded-xl p-3.5 space-y-2.5">
                    <p 
                      className="text-[11px] uppercase tracking-wider font-mono font-semibold"
                      style={{ color: ESTRATEGIA_COLOR[detSintese.autoridade.estrategia] }}
                    >
                      Regra Prática de Alinhamento
                    </p>
                    <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1.5 items-start">
                      <span className="text-[10px] text-white/40 uppercase tracking-wider font-mono mt-px">Antes de agir:</span>
                      <p className="text-xs text-white/85 leading-relaxed">
                        {detSintese.autoridade.regra.condicao}
                      </p>
                      <span className="text-[10px] text-[#9D86FF] uppercase tracking-wider font-mono mt-px">Faça isto:</span>
                      <p className="text-xs text-[#9D86FF] leading-relaxed font-medium">
                        {detSintese.autoridade.regra.accao}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-white/5">
                    <div className="space-y-2">
                      <p className="text-[11px] text-[#2DD4BF] uppercase tracking-wider font-mono font-semibold">Melhor Timing — janelas de decisão</p>
                      <p className="text-white/85 leading-relaxed">{detSintese.autoridade.timing.melhor}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[11px] text-[#FB5781]/90 uppercase tracking-wider font-mono font-semibold">Evitar Decidir</p>
                      <p className="text-white/85 mt-0.5 leading-relaxed">{detSintese.autoridade.timing.pior}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 text-[11px] text-[#A7AECF]/90 flex items-center justify-between">
                    <span>
                      Autoridade: <strong className="text-white capitalize" title="Sua energia de comando hoje — como você exerce autoridade">{detSintese.autoridade.autoridade}</strong>
                    </span>
                    <span>
                      Área Foco: <strong className="text-white capitalize">{AREA_ICONE[detSintese.autoridade.areaFoco] || '◈'} {AREA_LABEL[detSintese.autoridade.areaFoco] || detSintese.autoridade.areaFoco}</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* 3. Daily Specific Area of Focus Card — Foco Prioritário highlighted */}
              <div className="rounded-2xl border-2 border-[#F0B429]/60 bg-[#0B0E1C]/60 p-5 space-y-4 shadow-[0_0_20px_rgba(240,180,41,0.08)]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#7C5CFF]/10 border border-[#7C5CFF]/30 flex items-center justify-center text-[#9D86FF] text-xl font-bold">
                      <Sparkles size={20} className="text-[#9D86FF]" />
                    </div>
                    <div>
                      <p className="text-[10px] text-[#F0B429] font-bold uppercase tracking-wider font-mono">Foco Prioritário de Hoje</p>
                      <p className="text-base font-bold font-cinzel text-white leading-none mt-1">{dimFoco?.titulo}</p>
                      <p className="text-[10px] text-[#A7AECF]/50 mt-0.5">A energia de hoje favorece fortemente esta dimensão — aproveite o momento</p>
                    </div>
                  </div>
                  <span className="shrink-0 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F0B429] text-[#06070F] shadow-[0_0_8px_rgba(240,180,41,0.4)]">
                    Foco
                  </span>
                </div>

                <div id="foco-prioritario-content" className="relative" style={{ maxHeight: dimFocoExpanded ? 'none' : '4.5em', overflow: 'hidden' }}>
                  <div className="space-y-1">
                    {renderNarrative(dimFoco?.synthes ?? '')}
                  </div>
                  {!dimFocoExpanded && (
                    <div
                      aria-hidden
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '2em',
                        background: 'linear-gradient(to bottom, transparent, #0B0E1C)',
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                </div>
                <button
                  onClick={() => setDimFocoExpanded(!dimFocoExpanded)}
                  aria-expanded={dimFocoExpanded}
                  aria-controls="foco-prioritario-content"
                  className="text-xs text-[#7C5CFF]/90 hover:text-[#7C5CFF] transition-colors px-3 py-2 min-h-11 rounded-lg"
                >
                  {dimFocoExpanded ? <><ChevronUp size={12} className="inline" /> Mostrar menos</> : <><ChevronDown size={12} className="inline" /> Ler mais</>}
                </button>
                {/* aria-controls target is the div above */}

                {dimFoco?.praktika && (
                  <div className="bg-[#2DD4BF]/5 border border-[#2DD4BF]/15 rounded-xl p-3.5 space-y-1">
                    <p className="text-[11px] text-[#2DD4BF] uppercase tracking-wider font-mono font-semibold">Prática do Dia</p>
                    <p className="text-xs text-white/90 leading-relaxed">{dimFoco.praktika}</p>
                  </div>
                )}

                {dimFoco?.alerta && (
                  <div className="bg-[#FB5781]/5 border border-[#FB5781]/15 rounded-xl p-3.5 space-y-1">
                    <p className="text-[11px] text-[#FB5781] uppercase tracking-wider font-mono font-semibold">O que Evitar</p>
                    <p className="text-xs text-white/90 leading-relaxed">{dimFoco.alerta}</p>
                  </div>
                )}
              </div>
              <a href={`/${locale}/akasha`} className="block text-center text-[11px] text-[#7C5CFF]/60 hover:text-[#7C5CFF] transition-colors py-3 min-h-11 border-t border-white/5">
                Ver análise completa do seu mandato →
              </a>
              {/* 4. Daily Ritual Card - Premium Cosmic Design */}
              {dailyData?.ritual && (
                <div className="relative group">
                  {/* Glow effect behind card */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#7C5CFF]/20 via-[#2DD4BF]/10 to-[#7C5CFF]/20 rounded-3xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                  <div className="relative bg-[#0B0E1C]/90 border border-[#7C5CFF]/20 rounded-2xl p-6 backdrop-blur-md">
                    {/* Header with gradient accent */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7C5CFF]/50 to-transparent" />

                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C5CFF]/20 to-[#2DD4BF]/10 border border-[#7C5CFF]/20 flex items-center justify-center">
                            <Sparkles size={18} className="text-[#9D86FF]" />
                          </div>
                          <h3 className="text-[10px] text-[#9D86FF] font-semibold uppercase tracking-widest font-mono">Ritual do Dia</h3>
                        </div>
                        <h3 className="text-xl font-bold font-cinzel text-white leading-tight">{dailyData.ritual.titulo}</h3>
                        <div className="flex items-center gap-3 text-xs text-[#A7AECF]/70">
                          {dailyData.ritual.elemento ? (
                            <span className="flex items-center gap-1">
                              <Wind size={12} className="text-[#2DD4BF]" />
                              <span className="text-[10px] text-[#A7AECF]/50 mr-1">elemento</span>
                              <span className="text-xs text-white">{dailyData.ritual.elemento}</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <span className="text-[10px] text-[#A7AECF]/50">duração</span>
                              <span className="text-xs text-white">{dailyData.ritual.cor || '15 min'}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7C5CFF]/20 to-[#2DD4BF]/10 border border-[#7C5CFF]/20 flex items-center justify-center shadow-[0_0_20px_rgba(124,92,255,0.15)]">
                        <Heart size={28} className="text-[#9D86FF]" />
                      </div>
                    </div>

                    {/* Instruction with truncation */}
                    <div className="relative" style={{ maxHeight: ritualExpanded ? 'none' : '4.5em', overflow: 'hidden' }}>
                      <div className="bg-[#0B0E1C]/80 rounded-xl p-4 mb-2 border border-white/5">
                        <p className="text-sm text-[#A7AECF] leading-relaxed">
                          {dailyData.ritual.instrucao}
                        </p>
                      </div>
                      {!ritualExpanded && (
                        <div
                          aria-hidden
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '2.5em',
                            background: 'linear-gradient(to bottom, transparent, #06070F 85%)',
                            pointerEvents: 'none',
                          }}
                        />
                      )}
                    </div>
                    <button
                      onClick={() => setRitualExpanded(!ritualExpanded)}
                      className="text-xs text-[#7C5CFF]/70 hover:text-[#7C5CFF] transition-colors px-3 py-2 min-h-11 rounded-lg"
                    >
                      {ritualExpanded ? <><ChevronUp size={12} className="inline" /> Mostrar menos</> : <><ChevronDown size={12} className="inline" /> Ver instrução completa</>}
                    </button>

                    {/* Completion Button - Enhanced Design */}
                    <div className="pt-2">
                      {completedToday ? (
                        <div className="relative">
                          <div className="absolute inset-0 bg-[#2DD4BF]/10 rounded-xl blur-md" />
                          <div className="relative w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 text-[#2DD4BF] font-bold text-sm shadow-[0_0_20px_rgba(45,212,191,0.15)]">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                              <CheckCircle size={20} className="text-[#2DD4BF]" />
                            </motion.div>
                            <span>Ritual Concluído! <Sparkles size={14} className="inline ml-1 text-[#2DD4BF]" /></span>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={handleCompleteRitual}
                          disabled={completing}
                          className="w-full relative group/btn"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-[#7C5CFF] to-[#9D86FF] rounded-xl blur-md opacity-50 group-hover/btn:opacity-70 transition-opacity" />
                          <div className="relative flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#9D86FF] text-white font-bold text-sm shadow-[0_0_25px_rgba(124,92,255,0.35)] hover:shadow-[0_0_35px_rgba(124,92,255,0.5)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none">
                            {completing ? (
                              <>
                                <Loader size={16} className="animate-spin" />
                                Salvando...
                              </>
                            ) : (
                              <>
                                <UserCheck size={16} />
                                Confirmar Prática
                              </>
                            )}
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 5. "Sua Bússola" - Explore all 8 Dimensions (Consolidation of other pages) */}
              {detSintese?.dimensoes && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-xs text-white/30 uppercase tracking-widest font-mono">Sua Bússola Existencial ({detSintese?.dimensoes?.length ?? 0} Dimensões)</span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {detSintese.dimensoes.map((dim) => {
                      const isPriority = dim.dimensoesId === dimFoco?.dimensoesId;
                      return (
                        <button
                          key={dim.dimensoesId}
                          onClick={() => setSelectedDimension(dim)}
                          className={`flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl border bg-[#0B0E1C]/45 hover:bg-white/5 hover:border-[#7C5CFF]/30 active:scale-95 transition-all text-center min-h-[92px] group relative ${
                            isPriority
                              ? 'border-[#F0B429]/60 shadow-[0_0_12px_rgba(240,180,41,0.12)]'
                              : 'border-white/5'
                          }`}
                        >
                          {isPriority && (
                            <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-[#F0B429] text-[#06070F] shadow-[0_0_8px_rgba(240,180,41,0.4)]">
                              Foco
                            </span>
                          )}
                          <span className="text-lg text-[#9D86FF] group-hover:scale-110 transition-transform duration-300">
                            {dim.icone ? dim.icone : <Sparkles size={18} className="text-[#9D86FF]" />}
                          </span>
                          <span className="text-[11px] font-bold text-white leading-tight">
                            {dim.titulo.split(' & ')[0]}
                          </span>
                          {dim.descricao && (
                            <span className="text-[10px] text-white/30 leading-tight px-1">{dim.descricao.split('.')[0]}.</span>
                          )}
                          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 text-[10px] text-[#9D86FF] group-hover:bg-[#7C5CFF]/20 group-hover:border-[#7C5CFF]/40 transition-all">
                            Explorar <span>→</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <AkashaLifeAreasDashboard 
                synthesis={synthesis} 
                loading={synthesisLoading} 
                onRefetch={refetchSynthesis} 
              />
            </motion.div>
          )}

          {activeTab === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="space-y-1">
                <p className="text-xs text-[#A7AECF] uppercase tracking-wider font-medium">Histórico e Evolução</p>
                <h2 className="text-2xl font-bold font-cinzel text-white">Sua Jornada</h2>
              </div>

              {/* Stats Grid */}
              <DashboardStats userId={userId} />

              {/* Streak Calendar */}
              {statsData?.streak && (
                <StreakCalendar streak={statsData.streak} loading={statsLoading} />
              )}

              {/* Progress Chart */}
              <div className="bg-[#0B0E1C]/40 rounded-2xl p-5 border border-white/5">
                <h3 className="text-sm font-semibold font-cinzel mb-4 text-[#A7AECF]">Intensidade das Práticas</h3>
                <ProgressChart userId={userId} />
              </div>

              <RitualHistory userId={userId} onAction={() => setActiveTab('daily')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      {/* Streak Toast — "Prática registrada!" + streak count */}
      <AnimatePresence>
        {streakToast && (
          <motion.div
            key="streak-toast"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="flex flex-col items-center gap-1 px-6 py-4 rounded-2xl bg-[#0B0E1C]/95 border border-[#2DD4BF]/30 shadow-[0_0_30px_rgba(45,212,191,0.2)] backdrop-blur-md">
              <p className="text-sm font-bold text-[#2DD4BF]">{streakToast}</p>
              <p className="text-xs text-white/70">Prática registrada!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Dimension Detail Explore Modal ── */}
      <AnimatePresence>
        {selectedDimension && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDimension(null)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-[#0B0E1C] border border-[#7C5CFF]/30 rounded-3xl w-full max-w-lg overflow-y-auto max-h-[85vh] p-6 relative pointer-events-auto shadow-[0_0_50px_rgba(124,92,255,0.15)] space-y-4">
                
                {/* Close Button */}
                <button
                  onClick={() => setSelectedDimension(null)}
                  className="absolute top-4 right-4 p-2 text-[#A7AECF]/90 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                  aria-label="Fechar"
                >
                  <X size={18} />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                    style={{ 
                      backgroundColor: `${selectedDimension.chakraCor}15`, 
                      color: selectedDimension.chakraCor,
                      border: `1px solid ${selectedDimension.chakraCor}30` 
                    }}
                  >
                    <Sparkles size={20} className="text-[#9D86FF]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-cinzel text-white leading-none">{selectedDimension.titulo}</h3>
                    <p className="text-xs text-[#A7AECF]/60 mt-1">{selectedDimension.descricao}</p>
                  </div>
                </div>

                {/* Synthesis Narrative text */}
                <div className="space-y-3 py-1">
                  {renderNarrative(selectedDimension.synthes, '0.875rem')}
                </div>

                {/* Practice & Warnings */}
                <div className="grid grid-cols-1 gap-2.5 pt-2">
                  {selectedDimension.praktika && (
                    <div className="bg-[#2DD4BF]/5 border border-[#2DD4BF]/15 rounded-xl p-3.5 space-y-1">
                      <p className="text-[11px] text-[#2DD4BF] uppercase tracking-wider font-mono font-semibold">Prática Sugerida</p>
                      <p className="text-xs text-white/95 leading-relaxed">{selectedDimension.praktika}</p>
                    </div>
                  )}
                  {selectedDimension.alerta && (
                    <div className="bg-[#FB5781]/5 border border-[#FB5781]/15 rounded-xl p-3.5 space-y-1">
                      <p className="text-[11px] text-[#FB5781] uppercase tracking-wider font-mono font-semibold">Evitar Padrão</p>
                      <p className="text-xs text-white/95 leading-relaxed">{selectedDimension.alerta}</p>
                    </div>
                  )}
                </div>

                {/* Pilar contributions mapping */}
                {selectedDimension.contribuicoes && selectedDimension.contribuicoes.length > 0 && (
                  <div className="bg-black/25 rounded-2xl p-4 border border-white/5 space-y-2">
                    <p className="text-[11px] text-[#7C5CFF] uppercase tracking-wider font-mono font-semibold">Cruzamento de Influências</p>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {selectedDimension.contribuicoes.map((c, idx) => (
                        <div key={idx} className="text-xs text-[#A7AECF]/80 leading-relaxed border-b border-white/5 pb-2 last:border-0 last:pb-0">
                          <span className="text-white font-medium capitalize font-mono text-[10px] bg-white/5 px-1.5 py-0.5 rounded mr-1">
                            {c.pilar}
                          </span>
                          {c.frase}
                          {c.fonte && (
                            <span className="text-[11px] text-[#A7AECF]/40 italic block mt-0.5">
                              Fonte: {c.fonte}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
