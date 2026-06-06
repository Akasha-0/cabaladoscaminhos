// src/app/cockpit/leituras/[id]/consulta/page.tsx
// Q&A Chat UI (Doc 05 §9 + Doc 12 §8). Server Component + auth + OraculoChat.
import { ChevronLeft, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { OraculoChat } from '@/components/cockpit/consultation/OraculoChat';
import { getOperatorFromServerContext } from '@/lib/auth/operator-session';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ConsultaPage({ params }: { params: Promise<{ id: string }> }) {
  const operator = await getOperatorFromServerContext();
  if (!operator) redirect('/cockpit/login');

  const { id } = await params;
  const [reading, recentConsultations] = await Promise.all([
    prisma.reading.findUnique({
      where: { id },
      include: { client: { select: { fullName: true } } },
    }),
    prisma.consultation.findMany({
      where: { readingId: id },
      orderBy: { updatedAt: 'desc' },
      take: 1,
      select: { id: true },
    }),
  ]);
  if (!reading || reading.operatorId !== operator.id) notFound();

  const consultationId = recentConsultations[0]?.id ?? null;

  return (
    <div className="ramiro flex flex-col h-screen">
      <header className="flex items-center justify-between px-6 py-3 border-b border-border/50 bg-background/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={`/cockpit/leituras/${reading.id}`}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <ChevronLeft className="w-3 h-3" /> Voltar
          </Link>
          <div>
            <h1 className="font-cinzel text-lg text-primary inline-flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Consultar o Oráculo
            </h1>
            <p className="text-xs text-muted-foreground">
              {reading.client.fullName} · Leitura de{' '}
              {new Date(reading.date).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </header>
      <OraculoChat
        readingId={reading.id}
        clientName={reading.client.fullName}
        consultationId={consultationId}
      />
    </div>
  );
}
