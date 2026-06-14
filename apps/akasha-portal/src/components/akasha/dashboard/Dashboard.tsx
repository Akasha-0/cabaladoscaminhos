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
  Sparkles, Calendar, Moon, Sun, Cloud, AlertCircle, Check, Loader, 
  RefreshCw, TrendingUp, Award, Flame, UserCheck, X, Info, ChevronRight, HelpCircle 
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
import { AREA_ICONE, AREA_LABEL } from '@/lib/grimoire/traducao-areas';

interface DashboardProps {
  userId: string;
  userName?: string;
  initialPilares?: any;
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

const DIMENSAO_ICONE: Record<string, string> = {
  saude: '◈',
  trabalho: '◉',
  sexualidade: '◉',
  amor: '♥',
  criacao: '✦',
  proposito: '★',
  familia: '⬡',
  espiritualidade: '✧',
  superacao: '⛾',
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

export function Dashboard({ userId, userName = 'Viajante', initialPilares }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('daily');
  const [completing, setCompleting] = useState(false);
  const [completedToday, setCompletedToday] = useState(false);
  
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

  if (isLoading && (!statsData || !synthesis || !detSintese)) {
    return (
      <div className="min-h-screen bg-[#06070F] flex flex-col justify-center items-center">
        <Loader className="animate-spin text-[#7C5CFF]" size={40} />
        <p className="text-sm text-[#A7AECF] mt-4 font-cinzel tracking-widest">SINTONIZANDO SEU DIA...</p>
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
            <span className="text-[10px] text-[#A7AECF]/60 uppercase tracking-widest font-mono">Painel de Alinhamento</span>
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
            { id: 'daily', label: 'Meu Dia', icon: Sparkles },
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
                  active ? 'text-white' : 'text-[#A7AECF]/60 hover:text-[#A7AECF]'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-[#7C5CFF]/20 border border-[#7C5CFF]/45 rounded-full z-0"
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
                  <p className="text-xs text-[#A7AECF]/60 font-medium tracking-wide">
                    ✦ {detSintese.caminhoDeVida}
                  </p>
                )}
              </div>

              {/* Cosmic Vibe Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#0B0E1C]/40 border border-white/5 rounded-2xl p-3 text-center">
                  <div className="flex justify-center mb-1 text-[#2DD4BF]"><Cloud size={16} /></div>
                  <p className="text-[10px] text-[#A7AECF]/60 uppercase tracking-widest font-mono">Clima do Dia</p>
                  <p className="text-xs font-semibold mt-0.5 text-white truncate">{dailyData?.climate ?? 'Estável'}</p>
                </div>
                <div className="bg-[#0B0E1C]/40 border border-white/5 rounded-2xl p-3 text-center">
                  <div className="flex justify-center mb-1 text-[#F0B429]"><Moon size={16} /></div>
                  <p className="text-[10px] text-[#A7AECF]/60 uppercase tracking-widest font-mono">Fase Lunar</p>
                  <p className="text-xs font-semibold mt-0.5 text-white truncate">{dailyData?.moonPhase ?? 'Calculando'}</p>
                </div>
                <div className="bg-[#0B0E1C]/40 border border-white/5 rounded-2xl p-3 text-center">
                  <div className="flex justify-center mb-1 text-[#7C5CFF]"><Sun size={16} /></div>
                  <p className="text-[10px] text-[#A7AECF]/60 uppercase tracking-widest font-mono">Tema Geral</p>
                  <p className="text-xs font-semibold mt-0.5 text-white truncate">{dailyData?.overallTheme ?? 'Foco'}</p>
                </div>
              </div>

              {/* 1. Deterministic General Synthesis Card (valiosas informações de /meu-dia) */}
              {detSintese?.perfilGeral && (
                <div className="rounded-2xl border border-white/10 bg-[#0B0E1C]/60 p-5 space-y-3">
                  <div className="flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Sparkles size={14} className="text-[#9D86FF]" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Perfil de Hoje</span>
                  </div>
                  <div className="space-y-1">
                    {renderNarrative(detSintese.perfilGeral)}
                  </div>
                </div>
              )}

              {/* 2. Akasha Authority Card (from /meu-dia) */}
              {detSintese?.autoridade && (
                <div 
                  className="rounded-2xl border p-5 space-y-4"
                  style={{ 
                    backgroundColor: ESTRATEGIA_BG[detSintese.autoridade.estrategia] || 'rgba(255,255,255,0.02)',
                    borderColor: ESTRATEGIA_BORDER[detSintese.autoridade.estrategia] || 'rgba(255,255,255,0.1)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Info size={16} className="text-white/80" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Diretriz de Decisão (Autoridade)</span>
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

                  <div className="bg-black/25 rounded-xl p-3.5 space-y-1">
                    <p 
                      className="text-[9px] uppercase tracking-wider font-mono font-semibold"
                      style={{ color: ESTRATEGIA_COLOR[detSintese.autoridade.estrategia] }}
                    >
                      Regra Prática de Alinhamento
                    </p>
                    <p className="text-xs text-white leading-relaxed font-medium">
                      {detSintese.autoridade.regra.condicao} → <span className="text-[#9D86FF]">{detSintese.autoridade.regra.accao}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-white/5">
                    <div>
                      <p className="text-[9px] text-[#2DD4BF] uppercase tracking-wider font-mono font-semibold">Melhor Timing</p>
                      <p className="text-white/85 mt-0.5 leading-relaxed">{detSintese.autoridade.timing.melhor}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-[#FB5781] uppercase tracking-wider font-mono font-semibold">Evitar Decidir</p>
                      <p className="text-white/85 mt-0.5 leading-relaxed">{detSintese.autoridade.timing.pior}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 text-[11px] text-[#A7AECF]/60 flex items-center justify-between">
                    <span>
                      Autoridade: <strong className="text-white capitalize">{detSintese.autoridade.autoridade}</strong>
                    </span>
                    <span>
                      Área Foco: <strong className="text-white capitalize">{AREA_ICONE[detSintese.autoridade.areaFoco] || '◈'} {AREA_LABEL[detSintese.autoridade.areaFoco] || detSintese.autoridade.areaFoco}</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* 3. Daily Specific Area of Focus Card (from /meu-dia) */}
              {dimFoco && (
                <div className="rounded-2xl border border-white/10 bg-[#0B0E1C]/60 p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#7C5CFF]/10 border border-[#7C5CFF]/30 flex items-center justify-center text-[#9D86FF] text-xl font-bold">
                      {DIMENSAO_ICONE[dimFoco.dimensoesId] || '◈'}
                    </div>
                    <div>
                      <p className="text-[10px] text-[#F0B429] font-bold uppercase tracking-wider font-mono">Foco Prioritário de Hoje</p>
                      <h3 className="text-md font-bold font-cinzel text-white leading-none mt-1">{dimFoco.titulo}</h3>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {renderNarrative(dimFoco.synthes)}
                  </div>

                  {dimFoco.praktika && (
                    <div className="bg-[#2DD4BF]/5 border border-[#2DD4BF]/15 rounded-xl p-3.5 space-y-1">
                      <p className="text-[9px] text-[#2DD4BF] uppercase tracking-wider font-mono font-semibold">Prática do Dia</p>
                      <p className="text-xs text-white/90 leading-relaxed">{dimFoco.praktika}</p>
                    </div>
                  )}

                  {dimFoco.alerta && (
                    <div className="bg-[#FB5781]/5 border border-[#FB5781]/15 rounded-xl p-3.5 space-y-1">
                      <p className="text-[9px] text-[#FB5781] uppercase tracking-wider font-mono font-semibold">O que Evitar</p>
                      <p className="text-xs text-white/90 leading-relaxed">{dimFoco.alerta}</p>
                    </div>
                  )}
                </div>
              )}

              {/* 4. Daily Ritual Card with complete action */}
              {dailyData?.ritual && (
                <div className="bg-[#0B0E1C]/60 border border-white/10 rounded-2xl p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] text-[#2DD4BF] font-semibold uppercase tracking-wider font-mono">Prática Recomendada</p>
                      <h3 className="text-lg font-bold font-cinzel text-white mt-1">{dailyData.ritual.titulo}</h3>
                      <p className="text-xs text-[#A7AECF]/60 mt-0.5">Duração: {dailyData.ritual.cor || '15 min'} · Elemento: {dailyData.ritual.elemento || 'Éter'}</p>
                    </div>
                    <span className="text-2xl">🧘</span>
                  </div>
                  
                  <p className="text-sm text-[#A7AECF] leading-relaxed">
                    {dailyData.ritual.instrucao}
                  </p>

                  <div className="pt-2">
                    {completedToday ? (
                      <div className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#2DD4BF]/10 border border-[#2DD4BF]/30 text-[#2DD4BF] font-semibold text-sm">
                        <Check size={16} />
                        Ritual Concluído! (+1 no seu Streak)
                      </div>
                    ) : (
                      <button
                        onClick={handleCompleteRitual}
                        disabled={completing}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#7C5CFF] hover:bg-[#9D86FF] active:scale-[0.98] transition-all text-white font-semibold text-sm disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_20px_rgba(124,92,255,0.25)]"
                      >
                        {completing ? (
                          <>
                            <Loader size={16} className="animate-spin" />
                            Salvando alinhamento...
                          </>
                        ) : (
                          <>
                            <UserCheck size={16} />
                            Marcar como Praticado
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 5. "Sua Bússola" - Explore all 9 Dimensions (Consolidation of other pages) */}
              {detSintese?.dimensoes && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-white/10" />
                    <span className="text-xs text-white/30 uppercase tracking-widest font-mono">Sua Bússola Existencial (9 Dimensões)</span>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {detSintese.dimensoes.map((dim) => (
                      <button
                        key={dim.dimensoesId}
                        onClick={() => setSelectedDimension(dim)}
                        className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl border border-white/5 bg-[#0B0E1C]/45 hover:bg-white/5 hover:border-[#7C5CFF]/30 active:scale-95 transition-all text-center min-h-[92px] group"
                      >
                        <span className="text-lg text-[#9D86FF] group-hover:scale-110 transition-transform duration-300">
                          {DIMENSAO_ICONE[dim.dimensoesId] || '◈'}
                        </span>
                        <span className="text-[11px] font-bold text-white leading-tight">
                          {dim.titulo.split(' & ')[0]}
                        </span>
                        <span className="text-[9px] text-[#A7AECF]/50 group-hover:text-white transition-colors">
                          Explorar →
                        </span>
                      </button>
                    ))}
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

              {/* Ritual History */}
              <RitualHistory userId={userId} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

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
                  className="absolute top-4 right-4 p-2 text-[#A7AECF]/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
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
                    {DIMENSAO_ICONE[selectedDimension.dimensoesId] || '◈'}
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
                      <p className="text-[9px] text-[#2DD4BF] uppercase tracking-wider font-mono font-semibold">Prática Sugerida</p>
                      <p className="text-xs text-white/95 leading-relaxed">{selectedDimension.praktika}</p>
                    </div>
                  )}
                  {selectedDimension.alerta && (
                    <div className="bg-[#FB5781]/5 border border-[#FB5781]/15 rounded-xl p-3.5 space-y-1">
                      <p className="text-[9px] text-[#FB5781] uppercase tracking-wider font-mono font-semibold">Evitar Padrão</p>
                      <p className="text-xs text-white/95 leading-relaxed">{selectedDimension.alerta}</p>
                    </div>
                  )}
                </div>

                {/* Pilar contributions mapping */}
                {selectedDimension.contribuicoes && selectedDimension.contribuicoes.length > 0 && (
                  <div className="bg-black/25 rounded-2xl p-4 border border-white/5 space-y-2">
                    <p className="text-[9px] text-[#7C5CFF] uppercase tracking-wider font-mono font-semibold">Cruzamento de Influências</p>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {selectedDimension.contribuicoes.map((c, idx) => (
                        <div key={idx} className="text-xs text-[#A7AECF]/80 leading-relaxed border-b border-white/5 pb-2 last:border-0 last:pb-0">
                          <span className="text-white font-medium capitalize font-mono text-[10px] bg-white/5 px-1.5 py-0.5 rounded mr-1">
                            {c.pilar}
                          </span>
                          {c.frase}
                          {c.fonte && (
                            <span className="text-[9px] text-[#A7AECF]/40 italic block mt-0.5">
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
