// src/components/cockpit/leituras/ReadingsTable.tsx
// Tabela completa de leituras com busca client-side (Doc 05 §3).
'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ReadingStatus = 'PENDING' | 'GENERATING' | 'COMPLETED' | 'ERROR';

interface ReadingRow {
  id: string;
  date: Date | string;
  status: ReadingStatus;
  client: { id: string; fullName: string };
}

interface ReadingsTableProps {
  readings: ReadingRow[];
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

function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function ReadingsTable({ readings }: ReadingsTableProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return readings;
    return readings.filter((r) => r.client.fullName.toLowerCase().includes(q));
  }, [readings, query]);

  if (readings.length === 0) {
    return (
      <div className="bg-card/40 border border-dashed border-border rounded-xl p-12 text-center">
        <p className="text-muted-foreground">Nenhuma leitura ainda.</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Suas leituras aparecerão aqui após uma consulta.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome do consulente..."
          className="pl-9 bg-muted/30 border-border"
        />
      </div>

      {/* Table */}
      <div className="bg-card/40 border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-card/30">
              <th className="text-left text-xs uppercase tracking-widest text-muted-foreground/70 px-4 py-3">
                Consulente
              </th>
              <th className="text-left text-xs uppercase tracking-widest text-muted-foreground/70 px-4 py-3">
                Data
              </th>
              <th className="text-left text-xs uppercase tracking-widest text-muted-foreground/70 px-4 py-3">
                Status
              </th>
              <th className="text-right text-xs uppercase tracking-widest text-muted-foreground/70 px-4 py-3">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-sm">
                  Nenhum resultado para &ldquo;{query}&rdquo;.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-border/30 last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3 text-foreground/90">{r.client.fullName}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {formatDate(r.date)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {r.status === 'PENDING' && (
                        <Link
                          href={`/cockpit/leituras/${r.id}/consulta`}
                          className="text-primary hover:text-primary/80 text-xs font-medium"
                        >
                          Consultar →
                        </Link>
                      )}
                      <Link
                        href={`/cockpit/leituras/${r.id}`}
                        className={cn(
                          'text-xs font-medium',
                          r.status === 'PENDING'
                            ? 'text-muted-foreground hover:text-foreground'
                            : 'text-primary hover:text-primary/80'
                        )}
                      >
                        Ver →
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {query && filtered.length > 0 && (
        <p className="text-xs text-muted-foreground/60">
          {filtered.length} de {readings.length} leitura
          {readings.length === 1 ? '' : 's'}
        </p>
      )}
    </div>
  );
}
