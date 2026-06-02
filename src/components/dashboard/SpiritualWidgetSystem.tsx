'use client';

// ============================================================
// SPIRITUAL WIDGET CARD - Padronizado para todo o dashboard
// ============================================================

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface WidgetCardProps {
  title: string;
  icon: React.ReactNode;
  gradient?: 'amber' | 'violet' | 'emerald' | 'cyan' | 'pink' | 'orange';
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

const GRADIENT_CLASSES = {
  amber: 'from-amber-400 to-amber-500',
  violet: 'from-violet-400 to-purple-500',
  emerald: 'from-emerald-400 to-emerald-500',
  cyan: 'from-cyan-400 to-cyan-500',
  pink: 'from-pink-400 to-pink-500',
  orange: 'from-orange-400 to-orange-500',
};

const GRADIENT_BG_CLASSES = {
  amber: 'bg-amber-500/10 border-amber-500/20',
  violet: 'bg-violet-500/10 border-violet-500/20',
  emerald: 'bg-emerald-500/10 border-emerald-500/20',
  cyan: 'bg-cyan-500/10 border-cyan-500/20',
  pink: 'bg-pink-500/10 border-pink-500/20',
  orange: 'bg-orange-500/10 border-orange-500/20',
};

export function WidgetCard({ 
  title, 
  icon, 
  gradient = 'amber',
  children, 
  className = '',
  headerClassName = '',
  contentClassName = '',
}: WidgetCardProps) {
  return (
    <Card className={cn(
      'card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 hover:border-slate-700/70 hover:shadow-lg transition-all duration-300',
      className
    )}>
      <CardHeader className={cn('pb-3 border-b border-slate-800/50', headerClassName)}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br',
              GRADIENT_BG_CLASSES[gradient]
            )}>
              <span className={cn('bg-gradient-to-br bg-clip-text text-transparent font-bold')}>
                {icon}
              </span>
            </div>
            <span className={cn(
              'text-base font-semibold bg-gradient-to-r bg-clip-text text-transparent',
              GRADIENT_CLASSES[gradient]
            )}>
              {title}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className={cn('pt-4', contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

// ============================================================
// WIDGET STAT ITEM - Para métricas dentro de widgets
// ============================================================

interface WidgetStatProps {
  label: string;
  value: string | number;
  color?: 'amber' | 'violet' | 'emerald' | 'cyan' | 'pink';
  icon?: React.ReactNode;
}

const STAT_COLORS = {
  amber: 'text-amber-400',
  violet: 'text-violet-400',
  emerald: 'text-emerald-400',
  cyan: 'text-cyan-400',
  pink: 'text-pink-400',
};

const STAT_BG = {
  amber: 'bg-amber-500/10 border-amber-500/20',
  violet: 'bg-violet-500/10 border-violet-500/20',
  emerald: 'bg-emerald-500/10 border-emerald-500/20',
  cyan: 'bg-cyan-500/10 border-cyan-500/20',
  pink: 'bg-pink-500/10 border-pink-500/20',
};

function WidgetStat({ label, value, color = 'amber', icon }: WidgetStatProps) {
  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02]',
      STAT_BG[color]
    )}>
      {icon && (
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', STAT_BG[color])}>
          <span className={STAT_COLORS[color]}>{icon}</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-white truncate">{value}</p>
        <p className="text-xs text-slate-400 truncate">{label}</p>
      </div>
    </div>
  );
}

// ============================================================
// WIDGET STAT GRID - Grid de stats
// ============================================================

interface WidgetStatGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

function WidgetStatGrid({ children, columns = 2, className = '' }: WidgetStatGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };
  
  return (
    <div className={cn('grid gap-3', gridCols[columns], className)}>
      {children}
    </div>
  );
}

// ============================================================
// WIDGET INFO ROW - Linha de informação
// ============================================================

interface WidgetInfoRowProps {
  label: string;
  value: string | React.ReactNode;
  icon?: React.ReactNode;
  valueColor?: string;
  className?: string;
}

export function WidgetInfoRow({ label, value, icon, valueColor = 'text-white', className = '' }: WidgetInfoRowProps) {
  return (
    <div className={cn(
      'flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 transition-all duration-200 hover:bg-slate-800/70',
      className
    )}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-slate-400">{icon}</span>}
        <span className="text-sm text-slate-400">{label}</span>
      </div>
      <span className={cn('text-base font-semibold', valueColor)}>{value}</span>
    </div>
  );
}

// ============================================================
// WIDGET PROGRESS BAR
// ============================================================

interface WidgetProgressProps {
  label: string;
  value: number;
  max: number;
  color?: 'amber' | 'violet' | 'emerald' | 'cyan' | 'pink';
  showPercentage?: boolean;
}

const PROGRESS_COLORS = {
  amber: 'from-amber-500 to-amber-400',
  violet: 'from-violet-500 to-purple-400',
  emerald: 'from-emerald-500 to-emerald-400',
  cyan: 'from-cyan-500 to-cyan-400',
  pink: 'from-pink-500 to-pink-400',
};

export function WidgetProgress({ label, value, max, color = 'amber', showPercentage = true }: WidgetProgressProps) {
  const percentage = Math.round((value / max) * 100);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">{label}</span>
        {showPercentage && (
          <span className="text-sm font-medium text-amber-400">{percentage}%</span>
        )}
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={cn(
            'h-full rounded-full transition-all duration-500 bg-gradient-to-r',
            PROGRESS_COLORS[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ============================================================
// WIDGET TAG - Tags coloridas
// ============================================================

interface WidgetTagProps {
  children: React.ReactNode;
  color?: 'amber' | 'violet' | 'emerald' | 'cyan' | 'pink';
  size?: 'sm' | 'md';
}

const TAG_COLORS = {
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  violet: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  pink: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
};

function WidgetTag({ children, color = 'amber', size = 'sm' }: WidgetTagProps) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border font-medium',
      TAG_COLORS[color],
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
    )}>
      {children}
    </span>
  );
}

// ============================================================
// WIDGET TAG LIST - Lista de tags
// ============================================================

interface WidgetTagListProps {
  tags: string[];
  color?: 'amber' | 'violet' | 'emerald' | 'cyan' | 'pink';
}

function WidgetTagList({ tags, color = 'amber' }: WidgetTagListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <WidgetTag key={index} color={color}>
          {tag}
        </WidgetTag>
      ))}
    </div>
  );
}

// ============================================================
// WIDGET SKELETON - Loading state
// ============================================================

interface WidgetSkeletonProps {
  rows?: number;
  height?: string;
}

function WidgetSkeleton({ rows = 3, height = 'h-4' }: WidgetSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={cn('w-full rounded-xl bg-slate-800/50 animate-pulse', height)} />
      ))}
    </div>
  );
}