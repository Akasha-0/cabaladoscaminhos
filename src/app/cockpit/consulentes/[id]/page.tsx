// src/app/cockpit/consulentes/[id]/page.tsx
// Perfil do consulente: dados básicos + 4 mapas (Doc 05 §6).
import { ChevronLeft, Calendar, MapPin, FileText } from 'lucide-react';
import Link from 'next/link';
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

export default async function ConsulentePerfilPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const operator = await getOperatorFromServerContext();
  if (!operator) redirect('/cockpit/login');

  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id },
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
    },
  });

  if (!client) notFound();

  return (
    <div className="p-8 max-w-5xl space-y-8">
      <Link
        href="/cockpit/consulentes"
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="w-3 h-3" /> Voltar
      </Link>

      <header className="space-y-2">
        <h1 className="font-cinzel text-2xl text-primary">{client.fullName}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(client.birthDate)} às {client.birthTime}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            {client.birthCity}, {client.birthState} — {client.birthCountry}
          </span>
        </div>
        {client.notes && (
          <div className="flex items-start gap-1.5 text-sm text-muted-foreground/80 mt-3 p-3 bg-muted/30 rounded-lg border border-border/50">
            <FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <p className="italic">{client.notes}</p>
          </div>
        )}
      </header>

      <section className="space-y-3">
        <h2 className="font-cinzel text-lg text-foreground/90">Mapas Calculados</h2>
        <ClientMapPreview
          astrology={client.astrologyMap}
          kabalistic={client.kabalisticMap}
          tantric={client.tantricMap}
          odu={client.oduBirth}
        />
      </section>
    </div>
  );
}
