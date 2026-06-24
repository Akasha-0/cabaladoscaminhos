import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';
import { TratamentoDashboard } from '@/components/akasha/tratamento/TratamentoDashboard';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ zeladorId?: string; caminhadaId?: string; consulenteNome?: string }>;
}

export default async function TratamentoPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;
  if (!verifyAkashaToken(token ?? '', 'access')) {
    redirect('/onboarding');
  }

  if (!params.zeladorId || !params.caminhadaId) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Tratamento Integrado</h1>
        <p className="text-muted-foreground">
          Faltam parâmetros: zeladorId e caminhadaId são obrigatórios.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-semibold mb-6">
        🧭 Tratamento Integrado
      </h1>
      <TratamentoDashboard
        input={{
          zeladorId: params.zeladorId,
          caminhadaId: params.caminhadaId,
          consulenteNome: params.consulenteNome ?? 'Consulente',
          dataNascimento: '1990-01-01',
          horaNascimento: '12:00',
          localNascimento: 'São Paulo, Brasil',
        }}
      />
    </div>
  );
}
