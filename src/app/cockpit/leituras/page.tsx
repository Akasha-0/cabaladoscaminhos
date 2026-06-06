// src/app/cockpit/leituras/page.tsx
// Índice de todas as leituras do Operator (Doc 05 §3).
// Server Component: lista completa com table via ReadingsTable client component.
import { redirect } from 'next/navigation';
import { ReadingsTable } from '@/components/cockpit/leituras/ReadingsTable';
import { getOperatorFromServerContext } from '@/lib/auth/operator-session';
import { getReadingsByOperator } from '@/lib/db/reading-actions';

export const dynamic = 'force-dynamic';

export default async function LeiturasPage() {
  const operator = await getOperatorFromServerContext();
  if (!operator) redirect('/cockpit/login');

  // Lista completa — sem limit para o índice
  const readings = await getReadingsByOperator(operator.id);

  return (
    <div className="p-8 max-w-5xl space-y-6">
      <header>
        <h1 className="font-cinzel text-2xl text-primary">Leituras</h1>
        <p className="text-muted-foreground">
          {readings.length} leitura{readings.length === 1 ? '' : 's'} encontrada
          {readings.length === 1 ? '' : 's'}.
        </p>
      </header>

      <ReadingsTable readings={readings} />
    </div>
  );
}
