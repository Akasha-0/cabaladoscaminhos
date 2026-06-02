'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { UnifiedSpiritualFlow } from './UnifiedSpiritualFlow';
import { SpiritualRadarChart } from './SpiritualRadarChart';
import { ArvoreVida } from './ArvoreVida';
import { GlowEffect } from '@/components/design-system/GlowEffect';
import { 
  Sparkles, Moon, Sun, Star, Eye, Compass, 
  ChevronDown, Globe, TreeDeciduous, TreePine, Zap
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

interface CosmicFlowGridProps {
  userData?: {
    id?: string;
    nome?: string;
    dataNascimento?: string;
    numeroPessoal?: number;
    odu?: string;
    arcanoPessoal?: number;
    sefirotDominante?: string[];
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

  const variantColors = {
    primary: 'text-amber-400',
    secondary: 'text-violet-400',
    accent: 'text-emerald-400',
  };

  return (
    <div className={cn(
      'rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90',
      'backdrop-blur-sm border transition-all duration-300',
      variantStyles[variant],
      className
    )}>
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 border-b border-slate-800/30 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', variantColors[variant])}>
            {icon}
          </div>
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform duration-300', collapsed && '-rotate-90')} />
      </button>
      {!collapsed && <div className="p-4">{children}</div>}
    </div>
  );
}

interface TabPanelProps {
  tabs: { id: string; label: string; icon: React.ReactNode }[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

function TabPanel({ tabs, activeTab, onTabChange, children }: TabPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-800/50 border border-slate-700/30">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-300',
              activeTab === tab.id
                ? 'bg-gradient-to-r from-amber-500/20 to-violet-500/20 text-amber-400 border border-amber-500/30 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            )}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="min-h-[180px]">{children}</div>
    </div>
  );
}

interface StatBoxProps {
  label: string;
  value: string | number;
  color: string;
  icon?: React.ReactNode;
}

function StatBox({ label, value, color, icon }: StatBoxProps) {
  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/30 hover:border-slate-600/50 hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        {icon && <span style={{ color }}>{icon}</span>}
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

interface OduCardProps {
  name: string;
  symbol: string;
  meaning: string;
  color: string;
  isSelected?: boolean;
  onClick?: () => void;
}

function OduCard({ name, symbol, meaning, color, isSelected, onClick }: OduCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'p-4 rounded-xl border transition-all duration-300 text-center',
        'hover:scale-105 hover:shadow-lg',
        isSelected
          ? 'border-current bg-slate-800/80 scale-105'
          : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
      )}
      style={isSelected ? { borderColor: color, boxShadow: `0 0 20px ${color}40` } : undefined}
    >
      <span className="text-3xl mb-2 block">{symbol}</span>
      <p className="text-sm font-medium text-white">{name}</p>
      <p className="text-xs text-slate-500">{meaning}</p>
    </button>
  );
}

interface PracticeCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  tags: string[];
  color: string;
}

function PracticeCard({ icon, title, description, tags, color }: PracticeCardProps) {
  return (
    <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <span key={i} className="px-2.5 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            🌿 {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  color: string;
}

function QuickAction({ icon, label, color }: QuickActionProps) {
  return (
    <button className={cn(
      'flex items-center gap-3 px-4 py-3 rounded-xl',
      'bg-slate-800/50 border border-slate-700/30',
      'hover:border-amber-500/40 hover:bg-slate-800/80 hover:scale-105',
      'transition-all duration-300 text-sm font-medium text-slate-300'
    )}>
      <span style={{ color }}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================
// fallow-ignore-next-line complexity
export function CosmicFlowGrid({ userData }: CosmicFlowGridProps) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'numerologia' | 'astrologia' | 'lunar'>('numerologia');
  const [selectedOdu, setSelectedOdu] = useState<string | null>(null);
  const [numeros] = useState(() => ({
    caminho: Math.floor(Math.random() * 9) + 1,
    missao: Math.floor(Math.random() * 9) + 1,
    licao: Math.floor(Math.random() * 9) + 1,
  }));

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const tabs = [
    { id: 'numerologia' as const, label: 'Numerologia', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'astrologia' as const, label: 'Astrologia', icon: <Star className="w-4 h-4" /> },
    { id: 'lunar' as const, label: 'Fases Lunares', icon: <Moon className="w-4 h-4" /> },
  ];

  const odus = [
    { name: 'Alafia', symbol: '☀️', meaning: 'Paz e saúde', color: '#22C55E' },
    { name: 'Ogunda', symbol: '⚔️', meaning: 'Combate e conflito', color: '#F97316' },
    { name: 'Oyeku', symbol: '🌑', meaning: 'Perda e separação', color: '#6B7280' },
    { name: 'Iwori', symbol: '🌊', meaning: 'Dificuldade e paciência', color: '#3B82F6' },
  ];

  return (
    <div className="space-y-4">
      {/* Row 1: Unified Spiritual Flow (Full Width) */}
      <GlowEffect variant="aurora" intensity="medium" animated className="rounded-2xl">
        <UnifiedSpiritualFlow />
      </GlowEffect>

      {/* Sacred Tree of Life */}
      <GlowEffect variant="gold" intensity="low" className="rounded-2xl">
        <SectionCard
          title="Árvore da Vida"
          icon={<TreePine className="w-4 h-4" />}
          variant="primary"
          collapsed={collapsedSections['tree']}
          onToggle={() => toggleSection('tree')}
        >
          <div className="flex justify-center">
            <ArvoreVida 
              highlightedSephiroth={userData?.sefirotDominante || ['kether', 'chokhmah']}
              size="lg"
              showLabels={true}
              showPathNumbers={false}
            />
          </div>
        </SectionCard>
      </GlowEffect>

      {/* Row 2: Spiritual Radar + Tools */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <GlowEffect variant="purple" intensity="medium" className="rounded-2xl">
          <SectionCard
            title="Mapa Espiritual"
            icon={<Eye className="w-4 h-4" />}
            variant="secondary"
            collapsed={collapsedSections['radar']}
            onToggle={() => toggleSection('radar')}
          >
            <SpiritualRadarChart
              userData={{
                nome: userData?.nome || 'Visitante',
                dataNascimento: userData?.dataNascimento || '',
                odu: userData?.odu || 'Alafia',
                orixas: ['Oxalá'],
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
            />
          </SectionCard>
        </GlowEffect>

        <SectionCard
          title="Ferramentas Místicas"
          icon={<Globe className="w-4 h-4" />}
          variant="secondary"
          collapsed={collapsedSections['tools']}
          onToggle={() => toggleSection('tools')}
        >
          <TabPanel tabs={tabs} activeTab={activeTab} onTabChange={(t) => setActiveTab(t as typeof activeTab)}>
            {activeTab === 'numerologia' && (
              <div className="space-y-4">
                <StatBox label="Número Pessoal" value={numeros.caminho} color="#F59E0B" icon={<Zap className="w-4 h-4" />} />
                <div className="grid grid-cols-3 gap-3">
                  {[['Caminho', numeros.caminho], ['Missao', numeros.missao], ['Lição', numeros.licao]].map(([label, num]) => (
                    <div key={label} className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 text-center">
                      <p className="text-lg font-bold text-violet-400">{num}</p>
                      <p className="text-xs text-slate-500">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'astrologia' && (
              <div className="space-y-4">
                <StatBox label="Sol em" value="Aries" color="#F59E0B" icon={<Sun className="w-4 h-4" />} />
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 text-center">🌕<br/><span className="text-xs">Lua em Peixes</span></div>
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 text-center">⬆️<br/><span className="text-xs">Ascendente em Touro</span></div>
                </div>
              </div>
            )}
            {activeTab === 'lunar' && (
              <div className="space-y-4">
                <StatBox label="Fase Atual" value="Gibosa" color="#8B5CF6" icon={<Moon className="w-4 h-4" />} />
                <div className="flex gap-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex-1 h-8 rounded-full bg-slate-800/50 border border-slate-700/30 flex items-center justify-center">
                      <div className={cn('w-4 h-4 rounded-full', i === 5 && 'bg-violet-400 shadow-lg shadow-violet-400/50')} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabPanel>
        </SectionCard>
      </div>

      {/* Row 3: Divination + Practice */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard
          title="Divinação Integrada"
          icon={<TreeDeciduous className="w-4 h-4" />}
          variant="primary"
          collapsed={collapsedSections['divination']}
          onToggle={() => toggleSection('divination')}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {odus.map((odu) => (
                <OduCard key={odu.name} {...odu} isSelected={selectedOdu === odu.name} onClick={() => setSelectedOdu(odu.name)} />
              ))}
            </div>
            {selectedOdu && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-amber-500/20">
                <p className="text-xs text-amber-400 mb-2">Mensagem do Odu</p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {selectedOdu === 'Alafia' && 'O caminho se abre diante de você. A paz interior guia seus passos.'}
                  {selectedOdu === 'Ogunda' && 'Os obstáculos se apresentam, mas através da perseverança, você triumphará.'}
                  {selectedOdu === 'Oyeku' && 'Um período de transformação se inicia. Abrace a mudança com coragem.'}
                  {selectedOdu === 'Iwori' && 'A paciência será sua maior virtude neste ciclo.'}
                </p>
              </div>
            )}
            <button className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-violet-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-colors text-sm font-medium text-amber-400">
              ✨ Consultar Oráculo IA
            </button>
          </div>
        </SectionCard>

        <SectionCard
          title="Prática do Dia"
          icon={<Compass className="w-4 h-4" />}
          variant="accent"
          collapsed={collapsedSections['practice']}
          onToggle={() => toggleSection('practice')}
        >
          <div className="space-y-4">
            <PracticeCard
              icon={<Compass className="w-5 h-5" />}
              title="Ritual Recomendado"
              description="Meditação ao amanhecer"
              tags={['Alecrim', 'Lavanda', 'Salvia']}
              color="#22C55E"
            />
            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-cyan-400">528</span>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Frequência Sagrada</p>
                  <p className="text-sm font-medium text-white">Hz — Frequência do Amor</p>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <QuickAction icon={<Sun className="w-4 h-4" />} label="Consultar Odu" color="#F59E0B" />
        <QuickAction icon={<Moon className="w-4 h-4" />} label="Ver Ritais" color="#8B5CF6" />
        <QuickAction icon={<Star className="w-4 h-4" />} label="Meditação" color="#22C55E" />
        <QuickAction icon={<Compass className="w-4 h-4" />} label="Mapa Natal" color="#06B6D4" />
      </div>
    </div>
  );
}

export default CosmicFlowGrid;
