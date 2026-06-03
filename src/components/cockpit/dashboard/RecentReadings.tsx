// src/components/cockpit/dashboard/RecentReadings.tsx
// Tabela das últimas 10 leituras (Doc 05 §3). Status badges em cores Ramiro.
import Link from 'next/link';
import { cn } from '@/lib/utils';

type ReadingStatus = 'PENDING' | 'GENERATING' | 'COMPLETED' | 'ERROR';
// fallow-ignore-next-line unused-files

interface RecentReadingsProps {
  readings: Array<{
    id: string;
    date: Date | string;
    status: ReadingStatus;
    client: { id: string; fullName: string };
  }>;
}

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

function formatDate(d: Date | string) {
  const date = typeof d === 'string' ? new Date(d) : d;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function RecentReadings({ readings }: RecentReadingsProps) {
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
            <tr key={r.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30">
              <td className="px-4 py-3 text-foreground/90">{r.client.fullName}</td>
              <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                {formatDate(r.date)}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={r.status} />
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/cockpit/leituras/${r.id}`}
                  className="text-primary hover:text-primary/80 text-xs font-medium"
                >
                  Ver →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
