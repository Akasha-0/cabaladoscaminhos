// src/app/cockpit/consulentes/page.tsx
// Índice de consulentes do Operator com tabela e contagem de leituras (Doc 05 §6).
// Server Component: busca clientes + contagem de leituras, renderiza via ConsulentesTable.
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ConsulentesTable } from '@/components/cockpit/consulentes/ConsulentesTable';
import { getOperatorFromServerContext } from '@/lib/auth/operator-session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ConsulentesPage() {
  const operator = await getOperatorFromServerContext();
  if (!operator) redirect('/cockpit/login');

  // Busca clientes distintos do operator + contagem de leituras por cliente
  const readings = await prisma.reading.findMany({
    where: { operatorId: operator.id },
    select: {
      clientId: true,
      client: {
        select: {
          id: true,
          fullName: true,
          birthDate: true,
          birthCity: true,
          createdAt: true,
        },
      },
    },
    orderBy: { date: 'desc' },
  });

  // Dedupe por clientId, attach readingCount
  const seen = new Set<string>();
  const consulentes = readings
    .filter((r) => {
      if (seen.has(r.clientId)) return false;
      seen.add(r.clientId);
      return true;
    })
    .map((r) => {
      const readingCount = readings.filter((x) => x.clientId === r.clientId).length;
      return { ...r.client, readingCount };
    });

  return (
    <div className="p-8 max-w-5xl space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-cinzel text-2xl text-primary">Consulentes</h1>
          <p className="text-muted-foreground">
            {consulentes.length} consulente{consulentes.length === 1 ? '' : 's'} atendido
            {consulentes.length === 1 ? '' : 's'}.
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

      <ConsulentesTable consulentes={consulentes} />
    </div>
  );
}
