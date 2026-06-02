// src/app/cockpit/leituras/[id]/page.tsx
// Visualização do Dossiê Cabalístico (Doc 05 §5). Server Component + auth + DossierViewer.
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { DossierViewer } from '@/components/cockpit/dossier/DossierViewer';
import { getOperatorFromServerContext } from '@/lib/auth/operator-session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function LeituraPage({ params }: { params: Promise<{ id: string }> }) {
  const operator = await getOperatorFromServerContext();
  if (!operator) redirect('/cockpit/login');

  const { id } = await params;
  const reading = await prisma.reading.findUnique({
    where: { id },
    include: { client: { select: { fullName: true } } },
  });
  if (!reading || reading.operatorId !== operator.id) notFound();

  return (
    <div className="ramiro flex flex-col h-screen">
      <header className="flex items-center justify-between px-6 py-3 border-b border-border/50 bg-background/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/cockpit/dashboard"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <ChevronLeft className="w-3 h-3" /> Voltar
          </Link>
          <div>
            <h1 className="font-cinzel text-lg text-primary">Dossiê Cabalístico</h1>
            <p className="text-xs text-muted-foreground">
              {reading.client.fullName} · {new Date(reading.date).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </header>
      <DossierViewer readingId={reading.id} />
    </div>
  );
}
