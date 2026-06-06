// src/app/cockpit/consulentes/novo/page.tsx
// Cadastro de consulente (Doc 05 §6). Server Component que renderiza o ClientForm.
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ClientForm } from '@/components/cockpit/clients/ClientForm';
import { getOperatorFromServerContext } from '@/lib/auth/operator-session';

export const dynamic = 'force-dynamic';

export default async function NovoConsulentePage() {
  const operator = await getOperatorFromServerContext();
  if (!operator) redirect('/cockpit/login');

  return (
    <div className="p-8 max-w-4xl">
      <Link
        href="/cockpit/consulentes"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft className="w-3 h-3" /> Voltar
      </Link>
      <header className="mb-8">
        <h1 className="font-cinzel text-2xl text-primary">Novo Consulente</h1>
        <p className="text-muted-foreground">
          Cadastre um consulente e calcule os 4 mapas (Astrologia, Cabala, Tântrica, Odu).
        </p>
      </header>
      <ClientForm />
    </div>
  );
}
