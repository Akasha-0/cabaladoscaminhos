// src/components/cockpit/consulentes/ConsulentesTable.tsx
// Tabela de consulentes com busca client-side e contagem de leituras (Doc 05 §6).
'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ConsulenteRow {
  id: string;
  fullName: string;
  birthDate: Date | string | null;
  birthCity: string | null;
  createdAt: Date | string;
  readingCount: number;
}

interface ConsulentesTableProps {
  consulentes: ConsulenteRow[];
}

function formatDate(d: Date | string | null): string {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function ConsulentesTable({ consulentes }: ConsulentesTableProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return consulentes;
    return consulentes.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        (c.birthCity ?? '').toLowerCase().includes(q)
    );
  }, [consulentes, query]);

  if (consulentes.length === 0) {
    return (
      <div className="bg-card/40 border border-dashed border-border rounded-xl p-12 text-center">
        <p className="text-muted-foreground">Nenhum consulente ainda.</p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Comece cadastrando o primeiro consulente.
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
          placeholder="Buscar por nome ou cidade..."
          className="pl-9 bg-muted/30 border-border"
        />
      </div>

      {/* Table */}
      <div className="bg-card/40 border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-card/30">
              <th className="text-left text-xs uppercase tracking-widest text-muted-foreground/70 px-4 py-3">
                Nome
              </th>
              <th className="text-left text-xs uppercase tracking-widest text-muted-foreground/70 px-4 py-3">
                Nascimento
              </th>
              <th className="text-left text-xs uppercase tracking-widest text-muted-foreground/70 px-4 py-3">
                Cidade
              </th>
              <th className="text-left text-xs uppercase tracking-widest text-muted-foreground/70 px-4 py-3">
                Cadastrado em
              </th>
              <th className="text-right text-xs uppercase tracking-widest text-muted-foreground/70 px-4 py-3">
                Leituras
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">
                  Nenhum resultado para &ldquo;{query}&rdquo;.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-border/30 last:border-0 hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/cockpit/consulentes/${c.id}`}
                      className="text-foreground/90 hover:text-primary font-medium"
                    >
                      {c.fullName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {formatDate(c.birthDate)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {c.birthCity ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {formatDate(c.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        'inline-flex items-center justify-center min-w-[24px] h-5 px-1.5 rounded-full text-[10px] font-medium',
                        c.readingCount > 0
                          ? 'bg-secondary/15 text-secondary'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {c.readingCount}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {query && filtered.length > 0 && (
        <p className="text-xs text-muted-foreground/60">
          {filtered.length} de {consulentes.length} consulente
          {consulentes.length === 1 ? '' : 's'}
        </p>
      )}
    </div>
  );
}
