import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { UnifiedSpiritualFlow } from './UnifiedSpiritualFlow';
import { SpiritualRadarChart } from './SpiritualRadarChart';
import { ArvoreVida } from './ArvoreVida';
import { GlowEffect } from '@/components/design-system/GlowEffect';
import { 
  Sparkles, Moon, Sun, Star, Eye, Compass, 
  ChevronDown, Globe, TreeDeciduous, TreePine
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

interface CosmicFlowGridProps {
  userData?: {
    id?: string;
    nome?: string;
    numeroPessoal?: number;
    odu?: string;
    arcanoPessoal?: number;
  };
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
  className?: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

function SectionCard({ title, icon, children, variant = 'primary', className = '', collapsed = false, onToggle }: SectionCardProps) {
  const variantStyles = {
    primary: 'border-amber-500/20 hover:border-amber-500/40',
    secondary: 'border-violet-500/20 hover:border-violet-500/40',
    accent: 'border-emerald-500/20 hover:border-emerald-500/40',
  };

  return (
    <div className={cn(
      'rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/80',
      'backdrop-blur-sm border transition-all duration-300',
      variantStyles[variant],
      className
    )}>
      {/* Section Header */}
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            variant === 'primary' && 'bg-amber-500/10 text-amber-400',
            variant === 'secondary' && 'bg-violet-500/10 text-violet-400',
            variant === 'accent' && 'bg-emerald-500/10 text-emerald-400',
          )}>
            {icon}
          </div>
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        <ChevronDown className={cn(
          'w-4 h-4 text-slate-400 transition-transform duration-300',
          collapsed && '-rotate-90'
        )} />
      </button>

      {/* Section Content */}
      {!collapsed && (
        <div className="p-4 pt-2">
          {children}
        </div>
      )}
    </div>
  );
}

interface UnifiedToolsPanelProps {
  userData?: CosmicFlowGridProps['userData'];
}

function UnifiedToolsPanel({ userData }: UnifiedToolsPanelProps) {
  const [activeTab, setActiveTab] = useState<'numerologia' | 'astrologia' | 'lunar'>('numerologia');

  const tabs = [
    { id: 'numerologia' as const, label: 'Numerologia', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'astrologia' as const, label: 'Astrologia', icon: <Star className="w-4 h-4" /> },
    { id: 'lunar' as const, label: 'Fases Lunares', icon: <Moon className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all',
              activeTab === tab.id
                ? 'bg-gradient-to-r from-amber-500/20 to-violet-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[200px]">
        {activeTab === 'numerologia' && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-amber-400">{userData?.numeroPessoal || 1}</span>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Número Pessoal</p>
                  <p className="text-lg font-semibold text-white">
                    {userData?.numeroPessoal ? `Destino ${userData.numeroPessoal}` : 'Caminho do Início'}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {['Caminho', 'Missao', 'Lição'].map((label, i) => (
                <div key={label} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 text-center">
                  <p className="text-lg font-bold text-violet-400">{Math.floor(Math.random() * 9) + 1}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'astrologia' && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20">
              <div className="flex items-center gap-3">
                <Sun className="w-8 h-8 text-amber-400" />
                <div>
                  <p className="text-sm text-slate-400">Sol em</p>
                  <p className="text-lg font-semibold text-white">Aries</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 text-center">
                <p className="text-2xl">🌙</p>
                <p className="text-xs text-slate-500">Lua em Peixes</p>
              </div>
              <div className="flex-1 p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 text-center">
                <p className="text-2xl">⬆️</p>
                <p className="text-xs text-slate-500">Ascendente em Touro</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lunar' && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
              <div className="flex items-center gap-3">
                <Moon className="w-8 h-8 text-violet-400" />
                <div>
                  <p className="text-sm text-slate-400">Fase Atual</p>
                  <p className="text-lg font-semibold text-white">Gibosa Crescente</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i} 
                  className="flex-1 h-8 rounded-full bg-slate-800/50 border border-slate-700/30 flex items-center justify-center"
                >
                  <div 
                    className={cn(
                      'w-4 h-4 rounded-full',
                      i === 5 && 'bg-violet-400 shadow-lg shadow-violet-400/50'
                    )} 
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface UnifiedDivinationPanelProps {
  userData?: CosmicFlowGridProps['userData'];
}

function UnifiedDivinationPanel({ userData }: UnifiedDivinationPanelProps) {
  const [selectedOdu, setSelectedOdu] = useState<string | null>(null);

  const odus = [
    { name: 'Alafia', symbol: '☀️', meaning: 'Paz e saúde', color: '#22C55E' },
    { name: 'Ogunda', symbol: '⚔️', meaning: 'Combate e conflito', color: '#F97316' },
    { name: 'Oyeku', symbol: '🌑', meaning: 'Perda e separação', color: '#6B7280' },
    { name: 'Iwori', symbol: '🌊', meaning: 'Dificuldade e paciência', color: '#3B82F6' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {odus.map((odu) => (
          <button
            key={odu.name}
            onClick={() => setSelectedOdu(odu.name)}
            className={cn(
              'p-3 rounded-xl border transition-all duration-300',
              'hover:scale-105 hover:shadow-lg',
              selectedOdu === odu.name
                ? 'border-opacity-100 bg-slate-800/80'
                : 'border-slate-700/50 bg-slate-800/30'
            )}
            style={{ 
              borderColor: selectedOdu === odu.name ? odu.color : undefined,
              boxShadow: selectedOdu === odu.name ? `0 0 20px ${odu.color}40` : undefined
            }}
          >
            <div className="text-center">
              <span className="text-2xl">{odu.symbol}</span>
              <p className="text-sm font-medium text-white mt-1">{odu.name}</p>
              <p className="text-xs text-slate-500">{odu.meaning}</p>
            </div>
          </button>
        ))}
      </div>

      {selectedOdu && (
        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-amber-500/20">
          <p className="text-xs text-amber-400 mb-2">Mensagem do Odu</p>
          <p className="text-sm text-slate-300 leading-relaxed">
            {selectedOdu === 'Alafia' && 'O caminho se abre diante de você. A paz interior guia seus passos para realizações significativas.'}
            {selectedOdu === 'Ogunda' && 'Os obstáculos se apresentam, mas através da perseverança e sabedoria, você triumphará sobre os desafios.'}
            {selectedOdu === 'Oyeku' && 'Um período de transformação se inicia. Abrace a mudança com coragem e aceitação.'}
            {selectedOdu === 'Iwori' && 'A paciência será sua maior virtude neste ciclo. Aguarde o momento certo para agir.'}
          </p>
        </div>
      )}

      <button className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-violet-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-colors text-sm font-medium text-amber-400">
        ✨ Consultar Oráculo IA
      </button>
    </div>
  );
}

interface UnifiedPracticePanelProps {
  userData?: CosmicFlowGridProps['userData'];
}

function UnifiedPracticePanel({ userData }: UnifiedPracticePanelProps) {
  const dailyPractice = {
    affirmation: 'Eu fluo em harmonia com o cosmos, permitindo que a sabedoria divina guie meu caminho.',
    ritual: 'Meditação ao amanhecer com fokus na respiração consciente',
    herbs: ['Alecrim', 'Lavanda', 'Salvia'],
    frequency: '528Hz - Frequência do Amor',
  };

  return (
    <div className="space-y-4">
      {/* Affirmation */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
        <p className="text-xs text-emerald-400 mb-2">✨ Afirmação do Dia</p>
        <p className="text-sm text-slate-200 italic leading-relaxed">"{dailyPractice.affirmation}"</p>
      </div>

      {/* Ritual */}
      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <Compass className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Ritual Recomendado</p>
            <p className="text-xs text-slate-400">{dailyPractice.ritual}</p>
          </div>
        </div>

        {/* Herbs */}
        <div className="flex flex-wrap gap-2">
          {dailyPractice.herbs.map((herb) => (
            <span 
              key={herb}
              className="px-3 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            >
              🌿 {herb}
            </span>
          ))}
        </div>
      </div>

      {/* Frequency */}
      <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <span className="text-lg font-bold text-cyan-400">{dailyPractice.frequency.split('-')[0]}</span>
          </div>
          <div>
            <p className="text-xs text-slate-400">Frequência Sagrada</p>
            <p className="text-sm font-medium text-white">{dailyPractice.frequency}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function CosmicFlowGrid({ userData }: CosmicFlowGridProps) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="space-y-4">
      {/* Row 1: Unified Spiritual Flow (Full Width) */}
      <GlowEffect variant="aurora" intensity="medium" animated className="rounded-2xl">
        <UnifiedSpiritualFlow />
      </GlowEffect>
      {/* Row 1.5: Sacred Tree of Life */}
      <GlowEffect variant="gold" intensity="low" className="rounded-2xl">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-sm border border-amber-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <TreePine className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white">Árvore da Vida</span>
                <p className="text-xs text-slate-400">Sefirot e caminhos cabalísticos</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <ArvoreVida 
              highlightedSephiroth={userData?.sefirotDominante || ['kether', 'chokhmah']}
              size="lg"
              showLabels={true}
              showPathNumbers={false}
            />
          </div>
        </div>
      </GlowEffect>
      {/* Row 2: Spiritual Radar + Tools */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Spiritual Radar Chart */}
        <GlowEffect variant="purple" intensity="medium" className="rounded-2xl">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-sm border border-violet-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Eye className="w-4 h-4 text-violet-400" />
              </div>
              <span className="text-sm font-semibold text-white">Mapa Espiritual</span>
            </div>
            <SpiritualRadarChart
              userData={{
                name: userData?.nome || 'Visitante',
                birthDate: '',
                odu: userData?.odu || 'Alafia',
                orixa: 'Oxalá',
              }}
              currentLevels={{
                numerologia: 7,
                astrologia: 6,
                orixas: 8,
                tarot: 5,
                cabala: 4,
                ifa: 6,
              }}
              showTrend
              className=""
            />
          </div>
        </GlowEffect>
        {/* Tools Panel */}
        <SectionCard
          title="Ferramentas Místicas"
          icon={<Globe className="w-4 h-4" />}
          variant="secondary"
        >
          <UnifiedToolsPanel userData={userData} />
        </SectionCard>
      </div>
      {/* Row 3: Divination + Practice */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Divination Panel */}
        <SectionCard
          title="Divinação Integrada"
          icon={<TreeDeciduous className="w-4 h-4" />}
          variant="primary"
        >
          <UnifiedDivinationPanel userData={userData} />
        </SectionCard>

        {/* Practice Panel */}
        <SectionCard
          title="Prática do Dia"
          icon={<Sparkles className="w-4 h-4" />}
          variant="accent"
        >
          <UnifiedPracticePanel userData={userData} />
        </SectionCard>
      </div>

      {/* Row 4: Quick Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        {[
          { icon: <Sun className="w-4 h-4" />, label: 'Consultar Odu', color: 'amber' },
          { icon: <Moon className="w-4 h-4" />, label: 'Ver Ritais', color: 'violet' },
          { icon: <Star className="w-4 h-4" />, label: 'Meditação', color: 'emerald' },
          { icon: <Compass className="w-4 h-4" />, label: 'Mapa Natal', color: 'cyan' },
        ].map((action) => (
          <button
            key={action.label}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl',
              'bg-slate-800/50 border border-slate-700/30',
              'hover:border-amber-500/40 hover:bg-slate-800/80',
              'transition-all duration-300 text-sm font-medium text-slate-300'
            )}
          >
            {action.icon}
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default CosmicFlowGrid;