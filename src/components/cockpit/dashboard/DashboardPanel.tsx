// src/components/cockpit/dashboard/DashboardPanel.tsx
// Dashboard B2B — client component (Onda E / Doc 05 §3).
// Autenticação via requireOperator (dev-header em dev, JWT cookie em prod).
// Paleta Ramiro v2: laranja (números) + royal (estrutura).

'use client';

import { useEffect, useState } from 'react';
import { Calendar, Users, Clock, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type ReadingStatus = 'PENDING' | 'GENERATING' | 'COMPLETED' | 'ERROR';

interface DashboardMetrics {
  readingsThisMonth: number;
  totalClients: number;
  readingsToday: number;
}

interface DashboardReading {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  status: ReadingStatus;
}

interface DashboardData {
  metrics: DashboardMetrics;
  recentReadings: DashboardReading[];
}

// ─── MetricCard ────────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent?: 'primary' | 'destructive' | 'muted';
}

function MetricCard({ label, value, icon: Icon, accent = 'primary' }: MetricCardProps) {
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

// ─── StatusBadge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ReadingStatus }) {
  const styles: Record<ReadingStatus, string> = {
    PENDING: 'bg-primary/15 border-primary/40 text-primary',
    GENERATING: 'bg-secondary/15 border-secondary/40 text-secondary',
    COMPLETED: 'bg-secondary/15 border-secondary/40 text-secondary',
    ERROR: 'bg-destructive/15 border-destructive/40 text-destructive',
  };
  const labels: Record<ReadingStatus, string> = {
    PENDING: 'Pendente',
    GENERATING: 'Gerando',
    COMPLETED: 'Pronto',
    ERROR: 'Erro',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border',
        styles[status]
      )}
    >
      {labels[status]}
    </span>
  );
}

// ─── RecentReadingsTable ──────────────────────────────────────────────────────

function formatDate(d: string) {
  const date = new Date(d);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function RecentReadingsTable({ readings }: { readings: DashboardReading[] }) {
  if (readings.length === 0) {
    return (
      <div className="bg-card/40 border border-dashed border-border rounded-xl p-8 text-center">
        <p className="text-muted-foreground">Nenhuma leitura ainda.</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Comece uma nova consulta no Cockpit.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card/40 border border-border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/50 bg-card/30">
            <th className="text-left text-xs uppercase tracking-widest text-muted-foreground/70 px-4 py-3">
              Nome
            </th>
            <th className="text-left text-xs uppercase tracking-widest text-muted-foreground/70 px-4 py-3">
              Data
            </th>
            <th className="text-left text-xs uppercase tracking-widest text-muted-foreground/70 px-4 py-3">
              Status
            </th>
            <th className="text-right text-xs uppercase tracking-widest text-muted-foreground/70 px-4 py-3">
              Ação
            </th>
          </tr>
        </thead>
        <tbody>
          {readings.map((r) => (
            <tr
              key={r.id}
              className="border-b border-border/30 last:border-0 hover:bg-muted/30"
            >
              <td className="px-4 py-3 text-foreground/90">{r.clientName}</td>
              <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                {formatDate(r.date)}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={r.status} />
              </td>
              <td className="px-4 py-3 text-right">
                <a
                  href={`/cockpit/leituras/${r.id}`}
                  className="text-primary hover:text-primary/80 text-xs font-medium"
                >
                  Ver →
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── DashboardPanel ────────────────────────────────────────────────────────────

export function DashboardPanel() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/operator/dashboard')
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = '/cockpit/login';
            return;
          }
          throw new Error(`Erro ${res.status}`);
        }
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error('[DashboardPanel] fetch failed', err);
        setError('Não foi possível carregar o painel.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-destructive">
        <p>{error ?? 'Erro desconhecido.'}</p>
      </div>
    );
  }

  const { metrics, recentReadings } = data;

  return (
    <div className="p-8 space-y-8 max-w-6xl">
      {/* Header + CTA */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-cinzel text-2xl text-primary">Painel Principal</h1>
          <p className="text-muted-foreground">
            Visão geral do seu trabalho como terapeuta oraculista.
          </p>
        </div>
        <a
          href="/cockpit"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Consulta
        </a>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="Consultas este mês" value={metrics.readingsThisMonth} icon={Calendar} />
        <MetricCard
          label="Consulentes cadastrados"
          value={metrics.totalClients}
          icon={Users}
        />
        <MetricCard
          label="Pendentes hoje"
          value={metrics.readingsToday}
          icon={Clock}
          accent={metrics.readingsToday > 0 ? 'destructive' : 'muted'}
        />
      </div>

      {/* Tabela de leituras */}
      <section className="space-y-3">
        <h2 className="font-cinzel text-lg text-foreground/90">Últimas Leituras</h2>
        <RecentReadingsTable readings={recentReadings} />
      </section>
    </div>
  );
}
