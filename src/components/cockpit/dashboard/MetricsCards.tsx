// src/components/cockpit/dashboard/MetricsCards.tsx
// 3 cards: Consultas este mês · Consulentes · Pendentes hoje (Doc 05 §3).
// Tokens Ramiro v2: número grande em text-primary (laranja); accent destructive se há pendentes.
import { Calendar, Users, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsCardsProps {
  consultasMes: number;
  totalConsulentes: number;
  pendentesHoje: number;
}

function MetricCard({
  label,
  value,
  icon: Icon,
  accent = 'primary',
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent?: 'primary' | 'destructive' | 'muted';
}) {
  const accentClass =
    accent === 'destructive'
      ? 'text-destructive'
      : accent === 'muted'
        ? 'text-muted-foreground'
        : 'text-primary';

  return (
    <div className="bg-card/60 border border-border rounded-xl p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-secondary/15 border border-secondary/30">
        <Icon className={cn('w-5 h-5', accentClass)} />
      </div>
      <div>
        <p className={cn('text-2xl font-bold font-mono', accentClass)}>{value}</p>
        <p className="text-xs uppercase tracking-widest text-muted-foreground/70">{label}</p>
      </div>
    </div>
  );
}

export function MetricsCards({ consultasMes, totalConsulentes, pendentesHoje }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard label="Consultas este mês" value={consultasMes} icon={Calendar} />
      <MetricCard label="Consulentes cadastrados" value={totalConsulentes} icon={Users} />
      <MetricCard
        label="Pendentes hoje"
        value={pendentesHoje}
        icon={Clock}
        accent={pendentesHoje > 0 ? 'destructive' : 'muted'}
      />
    </div>
  );
}
