// src/app/cockpit/dashboard/page.tsx
// Dashboard B2B (Doc 05 §3 / Doc 16 AD-06.4).
// Server Component: métricas reais do Prisma + tabela de últimas leituras do Operator.
import { redirect } from 'next/navigation';
import { MetricsCards } from '@/components/cockpit/dashboard/MetricsCards';
import { RecentReadings } from '@/components/cockpit/dashboard/RecentReadings';
import { getOperatorFromServerContext } from '@/lib/auth/operator-session';
import { getClientsByOperator } from '@/lib/db/client-actions';
import {
  countReadingsThisMonth,
  countPendingToday,
  getReadingsByOperator,
} from '@/lib/db/reading-actions';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const operator = await getOperatorFromServerContext();
  if (!operator) redirect('/cockpit/login');

  const [consultasMes, leiturasRecentes, clientes, pendentesHoje] = await Promise.all([
    countReadingsThisMonth(operator.id),
    getReadingsByOperator(operator.id, { limit: 10 }),
    getClientsByOperator(operator.id),
    countPendingToday(operator.id),
  ]);

  return (
    <div className="p-8 space-y-8 max-w-6xl">
      <header>
        <h1 className="font-cinzel text-2xl text-primary">Painel Principal</h1>
        <p className="text-muted-foreground">
          Visão geral do seu trabalho como terapeuta oraculista.
        </p>
      </header>

      <MetricsCards
        consultasMes={consultasMes}
        totalConsulentes={clientes.length}
        pendentesHoje={pendentesHoje}
      />

      <section className="space-y-3">
        <h2 className="font-cinzel text-lg text-foreground/90">Últimas Leituras</h2>
        <RecentReadings readings={leiturasRecentes} />
      </section>
    </div>
  );
}
