// src/app/cockpit/dados-natais/page.tsx
// Autoconhecimento B2C: exibe os mapas e diagnósticos do próprio usuário logado de forma cruzada.
import { Calendar, MapPin, FileText } from 'lucide-react';
import { notFound, redirect } from 'next/navigation';
import { ClientMapPreview } from '@/components/cockpit/clients/ClientMapPreview';
import { getOperatorFromServerContext } from '@/lib/auth/operator-session';
import { prisma } from '@/lib/prisma';

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

export default async function DadosNataisPage() {
  const operator = await getOperatorFromServerContext();
  if (!operator) redirect('/login');

  const client = await prisma.soulBlueprint.findUnique({
    where: { userId: operator.id },
    select: {
      id: true,
      fullName: true,
      birthDate: true,
      birthTime: true,
      birthCity: true,
      birthState: true,
      birthCountry: true,
      notes: true,
      astrologyMap: true,
      kabalisticMap: true,
      tantricMap: true,
      oduBirth: true,
      forestMedicineMap: true,
      energyHealingMap: true,
    },
  });

  if (!client) {
    redirect('/cockpit/setup-perfil');
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-border/30 pb-6">
        <div className="space-y-2">
          <h1 className="font-cinzel text-2xl text-primary font-bold">Dados Natais Cruzados</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Portal Akasha · Diagnóstico Espiritual e Vibracional</p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-secondary" />
              {formatDate(client.birthDate)} às {client.birthTime}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-secondary" />
              {client.birthCity}, {client.birthState} — {client.birthCountry}
            </span>
          </div>
        </div>
      </header>

      {client.notes && (
        <div className="flex items-start gap-1.5 text-sm text-muted-foreground/80 p-3 bg-muted/30 rounded-lg border border-border/50">
          <FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <p className="italic">{client.notes}</p>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="font-cinzel text-lg text-foreground/90 font-semibold">Alinhamentos e Correspondências</h2>
        <ClientMapPreview
          astrology={client.astrologyMap}
          kabalistic={client.kabalisticMap}
          tantric={client.tantricMap}
          odu={client.oduBirth}
          forestMedicine={client.forestMedicineMap}
          energyHealing={client.energyHealingMap}
          clientId={client.id}
          birthCity={client.birthCity}
          birthState={client.birthState}
          birthCountry={client.birthCountry}
        />
      </section>
    </div>
  );
}
