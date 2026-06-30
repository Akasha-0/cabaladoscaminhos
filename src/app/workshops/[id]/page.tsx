// ============================================================================
// W93-D — /WORKSHOPS/[ID] (detalhe de workshop multi-sessão)
// ----------------------------------------------------------------------------
// Mostra workshop + lista de sessões com data/capacidade própria.
// CTA de RSVP por sessão + calendar export do workshop inteiro.
// ============================================================================

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  ArrowLeft,
  Users,
  Clock,
  MapPin,
  Monitor,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarExport } from '@/components/events/CalendarExport';

import { workshopToIcs } from '@/lib/w93/ics-export.ts';
import {
  TRADITION_LABEL,
  type Workshop,
  type WorkshopSession,
} from '@/lib/w93/events-types.ts';

// ============================================================================
// Mock data
// ============================================================================

function findWorkshop(slugOrId: string): Workshop | undefined {
  return seedWorkshops().find((w) => w.slug === slugOrId || w.id === slugOrId);
}

function seedWorkshops(): Workshop[] {
  const t0 = Date.parse('2026-09-10T19:00:00Z');
  const baseId = '22222222-2222-4222-8222-2222222222';
  const wid = `${baseId}01` as Workshop['id'];
  return [
    {
      id: wid,
      slug: 'curso-tantra-modulo-1-set-2026',
      title: 'Curso de Tantra — Módulo 1: Fundamentos',
      description:
        'Curso de 4 semanas cobrindo os fundamentos do Tantra branco: pranayama, bandhas, mudras e meditação tântrica.\n\nCada sessão inclui prática em dupla + roda de partilha. Material didático em PDF enviado após inscrição.',
      tradition: 'tantra',
      coverImage: '/event-covers/tantra-mod1.jpg',
      coverAlt: 'Curso de Tantra com prática em grupo',
      host: {
        id: 'host-shakti' as Workshop['host']['id'],
        displayName: 'Maestra Shakti Devi',
        handle: 'maestra-shakti',
        traditionLine: 'Tântrica · Kundalini Yoga',
        bio: 'Facilitadora de tantra com 12 anos de experiência.',
      },
      capacity: 15,
      priceCents: 40000,
      language: 'pt-BR',
      sessions: [
        {
          id: 'session-1' as WorkshopSession['id'],
          workshopId: wid,
          title: 'Aula 1 — Respiração e corpo',
          description: 'Pranayama básico + body scan.',
          startsAt: new Date(t0).toISOString(),
          endsAt: new Date(t0 + 120 * 60 * 1000).toISOString(),
          durationMin: 120,
          capacityOverride: 15,
          order: 1,
        },
        {
          id: 'session-2' as WorkshopSession['id'],
          workshopId: wid,
          title: 'Aula 2 — Bandhas e mudras',
          description: 'Os 3 bandhas principais + 5 mudras.',
          startsAt: new Date(t0 + 7 * 24 * 60 * 60 * 1000).toISOString(),
          endsAt: new Date(t0 + 7 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000).toISOString(),
          durationMin: 120,
          capacityOverride: 15,
          order: 2,
        },
        {
          id: 'session-3' as WorkshopSession['id'],
          workshopId: wid,
          title: 'Aula 3 — Meditação tântrica',
          description: 'Yantra + mantra + dhyana.',
          startsAt: new Date(t0 + 14 * 24 * 60 * 60 * 1000).toISOString(),
          endsAt: new Date(t0 + 14 * 24 * 60 * 60 * 1000 + 120 * 60 * 60 * 1000).toISOString(),
          durationMin: 120,
          capacityOverride: 15,
          order: 3,
        },
        {
          id: 'session-4' as WorkshopSession['id'],
          workshopId: wid,
          title: 'Aula 4 — Prática em dupla',
          description: 'Prática supervisionada.',
          startsAt: new Date(t0 + 21 * 24 * 60 * 60 * 1000).toISOString(),
          endsAt: new Date(t0 + 21 * 24 * 60 * 60 * 1000 + 180 * 60 * 1000).toISOString(),
          durationMin: 180,
          capacityOverride: 12,
          order: 4,
        },
      ],
      tags: ['curso', 'tantra', 'iniciantes'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

// ============================================================================
// Helpers
// ============================================================================

function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatPrice(priceCents: number | null): string {
  if (priceCents === null) return 'Gratuito';
  return (priceCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

// ============================================================================
// Page
// ============================================================================

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const w = findWorkshop(id);
  if (!w) return { title: 'Workshop não encontrado' };
  return {
    title: `${w.title} · Workshop Akasha`,
    description: w.description.slice(0, 160),
    alternates: { canonical: `/workshops/${w.slug}` },
    openGraph: {
      title: w.title,
      description: w.description.slice(0, 200),
      images: [w.coverImage],
      type: 'article',
    },
  };
}

export default async function WorkshopDetailPage({ params }: PageProps) {
  const { id } = await params;
  const w = findWorkshop(id);
  if (!w) notFound();

  const ics = workshopToIcs(w, { status: 'CONFIRMED' });
  const totalSessions = w.sessions.length;
  const totalDuration = w.sessions.reduce((acc, s) => acc + s.durationMin, 0);
  const firstStart = w.sessions[0]?.startsAt;
  const lastEnd = w.sessions[w.sessions.length - 1]?.endsAt;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <section className="border-b border-zinc-800/60 bg-gradient-to-b from-amber-500/5 to-transparent">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Link href="/eventos" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-amber-400 mb-4">
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Voltar aos eventos
          </Link>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className="bg-amber-500/90 text-zinc-950 border-transparent">Workshop</Badge>
            <Badge variant="outline" className="border-zinc-700 text-zinc-300">
              {TRADITION_LABEL[w.tradition]}
            </Badge>
            <Badge variant="outline" className="border-zinc-700 text-zinc-300">
              {totalSessions} sessões
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold mb-3">{w.title}</h1>
          <p className="text-zinc-300 mb-6">
            por <span className="text-zinc-100">{w.host.displayName}</span>
            {w.host.traditionLine && (
              <span className="text-zinc-500"> · {w.host.traditionLine}</span>
            )}
          </p>

          <div className="relative aspect-[16/9] bg-muted rounded-xl overflow-hidden border border-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={w.coverImage} alt={w.coverAlt} className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="max-w-3xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-3">Sobre o workshop</h2>
              <div className="prose prose-invert prose-zinc max-w-none text-zinc-300 whitespace-pre-line">
                {w.description}
              </div>
              {w.tags && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {w.tags.map((t) => (
                    <Badge key={t} variant="outline" className="border-zinc-700 text-zinc-400">
                      {t}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lista de sessões */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Sessões do workshop</h2>
              <ol className="space-y-3" data-testid="workshop-sessions">
                {w.sessions.map((s) => (
                  <li
                    key={s.id}
                    className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/40"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs uppercase tracking-wider text-amber-400">
                            Aula {s.order}
                          </span>
                          <span className="text-zinc-600">·</span>
                          <span className="text-xs text-zinc-500">
                            {s.durationMin} min
                          </span>
                          {s.capacityOverride > 0 && (
                            <>
                              <span className="text-zinc-600">·</span>
                              <span className="text-xs text-zinc-500">
                                até {s.capacityOverride} pessoas
                              </span>
                            </>
                          )}
                        </div>
                        <h3 className="font-semibold text-zinc-100 mb-1">{s.title}</h3>
                        {s.description && (
                          <p className="text-sm text-zinc-400 mb-2">{s.description}</p>
                        )}
                        <div className="flex items-center gap-1.5 text-sm text-zinc-300">
                          <Calendar className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                          <span>{formatLongDate(s.startsAt)}</span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                Resumo
              </h2>
              <InfoRow icon={<Calendar className="w-4 h-4 text-amber-500" />} label="Primeira aula">
                {firstStart ? formatLongDate(firstStart) : '—'}
              </InfoRow>
              <InfoRow icon={<Calendar className="w-4 h-4 text-amber-500" />} label="Última aula">
                {lastEnd ? formatLongDate(lastEnd) : '—'}
              </InfoRow>
              <InfoRow icon={<Clock className="w-4 h-4 text-amber-500" />} label="Carga horária">
                {Math.round(totalDuration / 60)}h ({totalDuration} min)
              </InfoRow>
              <InfoRow icon={<Users className="w-4 h-4 text-amber-500" />} label="Vagas">
                {w.capacity === 0 ? 'Ilimitadas' : `${w.capacity} vagas`}
              </InfoRow>

              <div className="border-t border-zinc-800 pt-4">
                <div className="text-2xl font-bold text-amber-400 mb-3">
                  {formatPrice(w.priceCents)}
                </div>
                <p className="text-xs text-zinc-500 mb-3">
                  {w.priceCents === null
                    ? 'Workshop gratuito. Inscrição por sessão.'
                    : 'Valor inclui as 4 sessões + material didático.'}
                </p>
                <CalendarExport
                  icsContent={ics}
                  filename={`workshop-${w.slug}.ics`}
                  fullWidth
                  label="Baixar todas as sessões (.ics)"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900/30 border-zinc-800/60">
            <CardContent className="p-5 text-xs text-zinc-500">
              <p className="font-semibold text-zinc-300 mb-2">Facilitadora</p>
              <p>{w.host.displayName}</p>
              <p className="text-amber-400">{w.host.traditionLine}</p>
              <p className="mt-2">{w.host.bio}</p>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm text-zinc-200 break-words">{children}</p>
      </div>
    </div>
  );
}