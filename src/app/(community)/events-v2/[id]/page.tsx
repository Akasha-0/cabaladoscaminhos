'use client';

// ============================================================================
// EVENT DETAIL — /events-v2/[id]
// ============================================================================
// Server component fetch + client RSVP controls.
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar, MapPin, Globe, Users, Clock, DollarSign, Loader2,
  Check, X, Sparkles, ArrowLeft, Download, Share2, Video,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface EventData {
  id: string;
  title: string;
  description: string;
  tradition: string;
  type: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  location: string | null;
  onlineUrl: string | null;
  capacity: number | null;
  rsvpCount: number;
  waitlistCount: number;
  priceCents: number;
  currency: string;
  coverImage: string | null;
  tags: string[];
  status: string;
  recordingUrl: string | null;
  hostId: string;
  viewerRsvp: string | null;
}

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rsvpStatus, setRsvpStatus] = useState<string | null>(null);
  const [rsvpPending, setRsvpPending] = useState(false);
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null);
  const [guests, setGuests] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/community/events?hostId=__none__&limit=100`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const found = (data.data ?? []).find((e: EventData) => e.id === params.id);
        if (!found) {
          setError('Evento não encontrado');
          return;
        }
        setEvent(found);
        setRsvpStatus(found.viewerRsvp);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  const submitRsvp = async (status: 'GOING' | 'MAYBE' | 'NOT_GOING' | 'CANCELLED') => {
    if (!user) {
      router.push('/login');
      return;
    }
    setRsvpPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/community/events/${params.id}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, guests }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      setRsvpStatus(data.data.status);
      setWaitlistPosition(data.data.position ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao confirmar');
    } finally {
      setRsvpPending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen p-8">
        <Card className="card-spiritual bg-red-500/10 border-red-500/30 max-w-md mx-auto">
          <CardContent className="py-12 text-center space-y-3">
            <p className="text-sm text-red-300">{error ?? 'Evento não encontrado'}</p>
            <Link href="/events-v2">
              <Button variant="outline" className="border-slate-700">Voltar</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const startDate = new Date(event.startsAt);
  const endDate = new Date(event.endsAt);
  const isFull = event.capacity !== null && event.rsvpCount >= event.capacity;
  const isLive = event.type === 'LIVESTREAM' && startDate <= new Date() && endDate >= new Date();
  const isPast = endDate < new Date();
  const isHost = user?.id === event.hostId;

  return (
    <div className="min-h-screen pb-24" data-testid="event-detail-page">
      {/* Hero */}
      {event.coverImage && (
        <div className="aspect-[21/9] w-full overflow-hidden">
          <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
        </div>
      )}

      <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <Link href="/events-v2" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200">
          <ArrowLeft className="w-4 h-4" /> Todos os eventos
        </Link>

        {/* Title block */}
        <header>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">{event.type}</Badge>
            <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30">{event.tradition}</Badge>
            {isLive && <Badge className="bg-red-500/20 text-red-300 border-red-500/30 animate-pulse">● AO VIVO</Badge>}
            {isPast && <Badge variant="outline" className="border-slate-700 text-slate-400">Passado</Badge>}
          </div>
          <h1 className="text-3xl md:text-4xl font-cinzel text-slate-100">{event.title}</h1>
        </header>

        {/* RSVP / Live CTA */}
        {isLive && (
          <Link href={`/events-v2/${event.id}/live`}>
            <Button className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 py-6 text-lg" data-testid="join-live">
              <Video className="w-5 h-5 mr-2" /> Entrar na transmissão
            </Button>
          </Link>
        )}

        {!isPast && !isLive && (
          <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-xs text-slate-500">Sua presença</p>
                  <p className="text-sm text-slate-200 font-medium">
                    {rsvpStatus === 'GOING' && '✓ Confirmado'}
                    {rsvpStatus === 'WAITLIST' && `⏳ Lista de espera (#${waitlistPosition})`}
                    {rsvpStatus === 'MAYBE' && '? Talvez'}
                    {rsvpStatus === 'CANCELLED' && '✗ Cancelado'}
                    {!rsvpStatus && 'Não confirmado'}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    onClick={() => submitRsvp('GOING')}
                    disabled={rsvpPending}
                    className={cn(
                      'border',
                      rsvpStatus === 'GOING'
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                        : 'bg-gradient-to-r from-amber-500 to-violet-500 text-white border-0',
                    )}
                    data-testid="rsvp-going"
                  >
                    {rsvpPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3 mr-1" />}
                    {isFull && rsvpStatus !== 'GOING' ? 'Lista de espera' : 'Confirmar'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => submitRsvp('MAYBE')}
                    disabled={rsvpPending}
                    className="border-slate-700"
                  >
                    Talvez
                  </Button>
                  {rsvpStatus && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => submitRsvp('CANCELLED')}
                      disabled={rsvpPending}
                      className="text-red-400 hover:text-red-300"
                      data-testid="rsvp-cancel"
                    >
                      <X className="w-3 h-3 mr-1" /> Cancelar
                    </Button>
                  )}
                </div>
              </div>

              {/* Guest count */}
              {rsvpStatus === 'GOING' && (
                <div className="flex items-center gap-2 text-xs">
                  <label className="text-slate-400">Acompanhantes:</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value || '0', 10))}
                    onBlur={() => rsvpStatus === 'GOING' && submitRsvp('GOING')}
                    className="w-16 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Recording */}
        {isPast && event.recordingUrl && (
          <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
            <CardHeader>
              <CardTitle className="text-base text-slate-200 flex items-center gap-2">
                <Video className="w-4 h-4 text-amber-400" /> Gravação disponível
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a href={event.recordingUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-slate-700">
                  Assistir gravação
                </Button>
              </a>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="md:col-span-2 space-y-6">
            <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
              <CardHeader>
                <CardTitle className="text-base text-slate-200">Sobre</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{event.description}</p>
              </CardContent>
            </Card>

            {event.tags.length > 0 && (
              <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-1.5">
                    {event.tags.map((t) => (
                      <Badge key={t} variant="outline" className="border-slate-700 text-slate-300">#{t}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
              <CardContent className="pt-6 space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-slate-200">{startDate.toLocaleString('pt-BR', { dateStyle: 'full' })}</p>
                    <p className="text-xs text-slate-500">
                      {startDate.toLocaleString('pt-BR', { timeStyle: 'short' })} — {endDate.toLocaleString('pt-BR', { timeStyle: 'short' })}
                    </p>
                    <p className="text-xs text-slate-600">{event.timezone}</p>
                  </div>
                </div>
                {event.location && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                    <p className="text-slate-200">{event.location}</p>
                  </div>
                )}
                {event.onlineUrl && (
                  <div className="flex items-start gap-2">
                    <Globe className="w-4 h-4 text-pink-400 mt-0.5 flex-shrink-0" />
                    <a href={event.onlineUrl} target="_blank" rel="noopener noreferrer" className="text-slate-200 underline break-all">
                      Link online
                    </a>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    <p className="text-slate-200">{event.rsvpCount} confirmados{event.capacity !== null && ` / ${event.capacity}`}</p>
                    {event.waitlistCount > 0 && <p className="text-slate-500">+{event.waitlistCount} em lista</p>}
                  </div>
                </div>
                {event.priceCents > 0 && (
                  <div className="flex items-start gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <p className="text-slate-200">R$ {(event.priceCents / 100).toFixed(2)} {event.currency}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <a href={`/api/community/events/${event.id}/ics`} download>
                <Button variant="outline" className="w-full border-slate-700 text-slate-300" data-testid="ics-download">
                  <Download className="w-4 h-4 mr-2" /> Adicionar ao calendário (.ics)
                </Button>
              </a>
              <Button
                variant="outline"
                className="w-full border-slate-700 text-slate-300"
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.share) {
                    navigator.share({ title: event.title, url: window.location.href }).catch(() => {});
                  } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copiado!');
                  }
                }}
              >
                <Share2 className="w-4 h-4 mr-2" /> Compartilhar
              </Button>
              {isHost && (
                <Link href={`/events-v2/${event.id}/live`}>
                  <Button variant="outline" className="w-full border-red-500/30 text-red-300 hover:bg-red-500/10">
                    <Video className="w-4 h-4 mr-2" /> Painel do host
                  </Button>
                </Link>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}