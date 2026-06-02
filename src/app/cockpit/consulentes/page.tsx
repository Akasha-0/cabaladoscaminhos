// src/app/cockpit/consulentes/page.tsx
// Listagem de consulentes do Operator (Doc 05 §6).
// Server Component — usa getClientsByOperator (já cabeado em C.1).
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getOperatorFromServerContext } from '@/lib/auth/operator-session';
import { getClientsByOperator } from '@/lib/db/client-actions';

export const dynamic = 'force-dynamic';

function formatDate(d: Date | string | null): string {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export default async function ConsulentesPage() {
  const operator = await getOperatorFromServerContext();
  if (!operator) redirect('/cockpit/login');

  const clientes = await getClientsByOperator(operator.id);

  return (
    <div className="p-8 max-w-5xl space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-cinzel text-2xl text-primary">Consulentes</h1>
          <p className="text-muted-foreground">
            {clientes.length} consulente{clientes.length === 1 ? '' : 's'} atendido
            {clientes.length === 1 ? '' : 's'}.
          </p>
        </div>
        <Link href="/cockpit/consulentes/novo">
          <Button
            variant="spiritual"
            size="sm"
            className="shadow-[0_0_20px_var(--accent-orange-glow)]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Consulente
          </Button>
        </Link>
      </header>

      {clientes.length === 0 ? (
        <div className="bg-card/40 border border-dashed border-border rounded-xl p-12 text-center">
          <p className="text-muted-foreground">Nenhum consulente ainda.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Comece cadastrando o primeiro consulente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {clientes.map((c) => (
            <Link
              key={c.id}
              href={`/cockpit/consulentes/${c.id}`}
              className="block bg-card/40 border border-border rounded-lg p-4 hover:bg-card/60 hover:border-primary/30 transition-colors"
            >
              <p className="font-medium text-foreground/90">{c.fullName}</p>
              <p className="text-xs text-muted-foreground/70 mt-1 font-mono">
                {formatDate(c.birthDate)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
