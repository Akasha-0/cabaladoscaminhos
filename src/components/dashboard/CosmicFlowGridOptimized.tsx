'use client';

import { useMemo, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { GlowEffect } from '@/components/design-system/GlowEffect';
import { 
  Sparkles, Moon, Sun, Star, Eye, Compass, 
  Globe, TreeDeciduous, TreePine, ChevronDown
} from 'lucide-react';
import { ArvoreVida } from './ArvoreVida';
import { SpiritualRadarChart } from './SpiritualRadarChart';

// Lazy loaded components
const UnifiedSpiritualFlowComponent = lazy(() => 
  import('./UnifiedSpiritualFlow').then(m => ({ default: m.UnifiedSpiritualFlow }))
);
const UnifiedToolsPanel = lazy(() => 
  import('./UnifiedToolsPanel').then(m => ({ default: m.UnifiedToolsPanel }))
);
const UnifiedDivinationPanel = lazy(() => 
  import('./UnifiedDivinationPanel').then(m => ({ default: m.UnifiedDivinationPanel }))
);
const UnifiedPracticePanel = lazy(() => 
  import('./UnifiedPracticePanel').then(m => ({ default: m.UnifiedPracticePanel }))
);

// Suspense fallback
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface CosmicFlowGridProps {
  userData?: {
    id?: string;
    nome?: string;
    numeroPessoal?: number;
    odu?: string;
    sefirotDominante?: string[];
  };
}

// Optimized SectionCard with memoization
const SectionCard = memo(function SectionCard({ 
  title, icon, children, variant = 'primary', className = '', collapsed = false, onToggle 
}: { 
  title: string; icon: React.ReactNode; children: React.ReactNode; variant?: 'primary' | 'secondary' | 'accent'; className?: string; collapsed?: boolean; onToggle?: () => void;
}) {
  const variantStyles = {
    primary: 'border-amber-500/20 hover:border-amber-500/40',
    secondary: 'border-violet-500/20 hover:border-violet-500/40',
    accent: 'border-emerald-500/20 hover:border-emerald-500/40',
  };

  return (
    <div className={cn(
      'rounded-2xl overflow-hidden',
      'bg-gradient-to-br from-slate-900/80 to-slate-950/80',
      'backdrop-blur-sm border',
      variantStyles[variant],
      'transition-all duration-300',
      className
    )}>
      <div className={cn('flex items-center justify-between p-4', 'border-b border-slate-800/50')}>
        <div className="flex items-center gap-3">
          {icon && <div className="w-8 h-8 rounded-lg bg-slate-800/50 flex items-center justify-center">{icon}</div>}
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        {onToggle && (
          <button onClick={onToggle} className={cn('w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-200', collapsed && 'rotate-180')} aria-label="Toggle">
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>
      {!collapsed && <div className="p-4 pt-0">{children}</div>}
    </div>
  );
});

// Loading skeleton
function GridSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-48 rounded-2xl" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}

export function CosmicFlowGrid({ userData }: CosmicFlowGridProps) {
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = useCallback((section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  }, []);

  // Memoize highlighted sephiroth
  const highlightedSephiroth = useMemo(() => 
    userData?.sefirotDominante || ['kether', 'chokhmah'],
    [userData?.sefirotDominante]
  );

  // Memoize radar chart data
  const radarData = useMemo(() => ({
    userData: {
      name: userData?.nome || 'Visitante',
      birthDate: '',
      odu: userData?.odu || 'Alafia',
      orixa: 'Oxalá',
    },
    currentLevels: {
      numerologia: 7,
      astrologia: 6,
      orixas: 8,
      tarot: 5,
      cabala: 4,
      ifa: 6,
    },
  }), [userData?.nome, userData?.odu]);

  return (
    <div className="space-y-4">
      {/* Row 1: Unified Spiritual Flow */}
      <GlowEffect variant="aurora" intensity="medium" animated className="rounded-2xl animate-in slide-in-from-bottom-8 duration-500">
        <Suspense fallback={<Skeleton className="h-48 rounded-2xl" />}>
          <UnifiedSpiritualFlowComponent />
        </Suspense>
      </GlowEffect>

      {/* Row 2: Sacred Tree of Life */}
      <GlowEffect variant="gold" intensity="low" className="rounded-2xl animate-in slide-in-from-bottom-8 duration-500 delay-100">
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
            <ArvoreVida highlightedSephiroth={highlightedSephiroth} size="lg" showLabels={true} showPathNumbers={false} />
          </div>
        </div>
      </GlowEffect>

      {/* Row 3: Spiritual Radar + Tools */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <GlowEffect variant="purple" intensity="medium" className="rounded-2xl animate-in slide-in-from-bottom-8 duration-500 delay-200">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-sm border border-violet-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Eye className="w-4 h-4 text-violet-400" />
              </div>
              <span className="text-sm font-semibold text-white">Mapa Espiritual</span>
            </div>
            <SpiritualRadarChart {...radarData} showTrend className="" />
          </div>
        </GlowEffect>

        <div className="animate-in slide-in-from-bottom-8 duration-500 delay-300">
          <Suspense fallback={<Skeleton className="h-64 rounded-2xl" />}>
            <SectionCard title="Ferramentas Místicas" icon={<Globe className="w-4 h-4" />} variant="secondary">
              <UnifiedToolsPanel userData={userData} />
            </SectionCard>
          </Suspense>
        </div>
      </div>

      {/* Row 4: Divination + Practice */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="animate-in slide-in-from-bottom-8 duration-500 delay-400">
          <Suspense fallback={<Skeleton className="h-48 rounded-2xl" />}>
            <SectionCard title="Divinação Integrada" icon={<TreeDeciduous className="w-4 h-4" />} variant="primary">
              <UnifiedDivinationPanel userData={userData} />
            </SectionCard>
          </Suspense>
        </div>

        <div className="animate-in slide-in-from-bottom-8 duration-500 delay-500">
          <Suspense fallback={<Skeleton className="h-48 rounded-2xl" />}>
            <SectionCard title="Prática do Dia" icon={<Sparkles className="w-4 h-4" />} variant="accent">
              <UnifiedPracticePanel userData={userData} />
            </SectionCard>
          </Suspense>
        </div>
      </div>

      {/* Row 5: Quick Actions */}
      <div className="animate-in slide-in-from-bottom-8 duration-500 delay-600">
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
    </div>
  );
}

export default CosmicFlowGrid;