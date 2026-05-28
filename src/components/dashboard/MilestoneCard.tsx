'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Clock, Flag } from 'lucide-react';

type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

interface Milestone {
  id: string;
  category: string;
  title: string;
  status: MilestoneStatus;
  completionDate?: string;
}

interface MilestoneCardProps {
  milestone: Milestone;
  variant?: 'default' | 'compact';
  onClick?: () => void;
}

const statusConfig: Record<MilestoneStatus, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: 'Pendente', icon: <Circle className="w-4 h-4" />, color: 'text-muted-foreground' },
  in_progress: { label: 'Em Progresso', icon: <Clock className="w-4 h-4" />, color: 'text-amber-500' },
  completed: { label: 'Concluído', icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-emerald-500' },
  skipped: { label: 'Ignorado', icon: <Flag className="w-4 h-4" />, color: 'text-slate-400' },
};

const categoryColors: Record<string, string> = {
  'caminho': 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  'trilha': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'ritual': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'aprendizado': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'meditacao': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'default': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

function getCategoryColor(category: string): string {
  const key = category.toLowerCase();
  return categoryColors[key] || categoryColors['default'];
}

export function MilestoneCard({ milestone, variant = 'default', onClick }: MilestoneCardProps) {
  const status = statusConfig[milestone.status];
  const categoryColor = getCategoryColor(milestone.category);

  if (variant === 'compact') {
    return (
      <Card
        className="cursor-pointer hover:border-primary/50 transition-colors"
        onClick={onClick}
      >
        <CardContent className="p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className={status.color}>{status.icon}</span>
            <span className="font-medium truncate">{milestone.title}</span>
          </div>
          <Badge className={`${categoryColor} border shrink-0`} variant="outline">
            {milestone.category}
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <h3 className="font-medium leading-tight">{milestone.title}</h3>
            <Badge className={`${categoryColor} border`} variant="outline">
              {milestone.category}
            </Badge>
          </div>
          <div className={`flex items-center gap-1.5 shrink-0 ${status.color}`}>
            {status.icon}
            <span className="text-sm font-medium">{status.label}</span>
          </div>
        </div>
        {milestone.completionDate && milestone.status === 'completed' && (
          <p className="text-xs text-muted-foreground">
            Concluído em: {milestone.completionDate}
          </p>
        )}
      </CardContent>
    </Card>
  );
}