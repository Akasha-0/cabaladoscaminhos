'use client';

// ============================================================================
// EVENT DETAIL — /events/[id]
// ============================================================================
// Página de um círculo específico. Mostra:
//   - Header com título, tradição, host, data/hora
//   - Descrição completa
//   - Botão "Participar" (RSVP) ou "Você está dentro"
//   - Lista de participantes confirmados
// ============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Calendar, Clock, Users, ArrowLeft, Globe, Lock,
  Video, Check, Loader2, Sparkles, ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useEvent, useEventParticipants, useJoinEvent } from '@/hooks/useEvents';
import { useAuth } from '@/hooks/useAuth';

// ============================================================
// Visual maps (espelham a list page)
// ============================================================

const TRADITION_COLOR: Record<string, string> = {
  cabala: 'from-violet-500/20 to-purple-500/20 border-violet-500/40',
  ifa: 'from-amber-500/20 to-orange-500/20 border-amber-500/40',
  astrologia: 'from-pink-500/20 to-rose-500/20 border-pink-500/40',
  tantra: 'from-rose-500/20 to-fuchsia-500/20 border-rose-500/40',
  reiki: 'from-cyan-500/20 to-sky-500/20 border-cyan-500/40',
  meditacao: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40',
  xamanismo: 'from-emerald-500/20 to-lime-500/20 border-emerald-500/40',
  'cristianismo-mistico': 'from-blue-500/20 to-indigo-500/20 border-blue-500/40',
  sufismo: 'from-purple-500/20 to-pink-500/20 border-purple-500/40',
  taoismo: 'from-slate-500/20 to-zinc-500/20 border-slate-500/40',
  umbanda: 'from-orange-500/20 to-red-500/20 border-orange-500/40',
  candomble: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/40',
};

const TRADITION_LABEL: Record<string, string> = {
  cabala: 'Cabala',
  ifa: 'Ifá',
  astrologia: 'Astrologia',
  tantra: 'Tantra',
  reiki: 'Reiki',
  meditacao: 'Meditação',
  xamanismo: 'Xamanismo',
  'cristianismo-mistico': 'Cristianismo Místico',
  sufismo: 'Sufismo',
  taoismo: 'Taoísmo',
  umbanda: 'Umbanda',
  candomble: 'Candomblé',
};

function formatStartsAt(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ============================================================
// MAIN
// ============================================================

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === 'string' ? params.id : null;
  const { user } = useAuth();
  const devUserId = user?.id ?? undefined;

  const { event, loading, error, refresh } = useEvent(id, devUserId);
  const { participants, refresh: refreshParts } = useEventParticipants(
    id,
    devUserId
  );
  const { join, joining, error: joinError } = useJoinEvent(devUserId);
  const [joinFeedback, setJoinFeedback] = useState<string | null>(null);

  const handleJoin = async () => {
    if (!id) return;
    if (!user) {
      window.location.href = '/login?next=' + encodeURIComponent(`/events/${id}`);
      return;
    }
    setJoinFeedback(null);
    const res = await join(id);
    if (res.ok) {
      setJoinFeedback(
        res.data.joined
          ? '✅ Presença confirmada!'
          : 'Você já estava confirmado neste círculo.'
      );
      void refresh();
      void refreshParts();
    } else {
      setJoinFeedback(res.error);
    }
  };

  if (loading && !event) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        data-testid="event-detail-loading"
      >
        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8" data-testid="event-detail-error">
        <div className="max-w-2xl mx-auto">
          <Card className="card-spiritual bg-red-500/10 border-red-500/30">
            <CardContent className="py-8 text-center space-y-3">
              <p className="text-sm text-red-300">Erro ao carregar evento: {error}</p>
              <Link href="/events">
                <Button size="sm" variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
            <CardContent className="py-12 text-center space-y-3">
              <Sparkles className="w-8 h-8 mx-auto text-slate-500" />
              <p className="text-sm text-slate-300">Evento não encontrado.</p>
              <Link href="/events">
                <Button size="sm" variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Ver todos os eventos
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const colorClass =
    TRADITION_COLOR[event.tradition] ||
    'from-slate-500/20 to-slate-500/20 border-slate-500/40';
  const traditionLabel =
    TRADITION_LABEL[event.tradition] ?? event.tradition;
  const isFull =
    event.spotsRemaining !== null && event.spotsRemaining <= 0;
  const isPast = new Date(event.startsAt).getTime() < Date.now();

  return (
    <div
      className="min-h-screen p-4 md:p-6 lg:p-8"
      data-testid={`event-detail-${event.id}`}
    >
      <div className="max-w-3xl mx-auto space-y-6 pb-24 md:pb-8">
        {/* Back */}
        <Link
          href="/events"
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-amber-300 transition-colors"
          data-testid="event-back-link"
        >
          <ArrowLeft className="w-4 h-4" /> Eventos
        </Link>

        {/* Header */}
        <Card
          className={cn(
            'card-spiritual bg-gradient-to-br border',
            colorClass
          )}
        >
          <CardHeader>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="space-y-2 min-w-0 flex-1">
                <Badge
                  variant="outline"
                  className="text-[10px] border-slate-700 text-slate-400"
                >
                  {traditionLabel}
                </Badge>
                <CardTitle className="text-2xl md:text-3xl font-cinzel text-slate-100 leading-tight">
                  {event.title}
                </CardTitle>
                <p className="text-sm text-slate-400">
                  Facilitado por{' '}
                  <span className="text-amber-300">{event.hostDisplayName}</span>
                </p>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] border-slate-700 text-slate-400"
              >
                {event.isPublic ? (
                  <>
                    <Globe className="w-2.5 h-2.5 mr-1" /> público
                  </>
                ) : (
                  <>
                    <Lock className="w-2.5 h-2.5 mr-1" /> privado
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="flex flex-col gap-2 text-sm text-slate-300">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400 flex-shrink-0" />
                {formatStartsAt(event.startsAt)}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-400 flex-shrink-0" />
                {event.durationMin} minutos
              </span>
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-pink-400 flex-shrink-0" />
                {event.participantsCount}
                {event.maxParticipants > 0 && ` / ${event.maxParticipants}`} participantes
                {event.spotsRemaining !== null && !isFull && (
                  <span className="text-emerald-400">· {event.spotsRemaining} vagas restantes</span>
                )}
                {isFull && (
                  <span className="text-red-400">· evento lotado</span>
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
          <CardHeader>
            <CardTitle className="text-sm text-slate-400 uppercase tracking-wider">
              Sobre o círculo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
              {event.description}
            </p>
          </CardContent>
        </Card>

        {/* Action area */}
        <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
          <CardContent className="py-5 space-y-3">
            {isPast ? (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                <Clock className="w-4 h-4" /> Este evento já passou.
              </div>
            ) : event.viewerIsHost ? (
              <div className="flex items-center justify-center gap-2 text-sm text-amber-300">
                <Sparkles className="w-4 h-4" /> Você é o facilitador deste círculo.
              </div>
            ) : event.viewerIsParticipant ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm text-emerald-300">
                  <Check className="w-4 h-4" /> Sua presença está confirmada.
                </div>
                {event.meetingUrl && (
                  <a
                    href={event.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white text-sm font-medium transition-all min-h-[44px]"
                    data-testid="event-meeting-url"
                  >
                    <Video className="w-4 h-4" /> Entrar na sala
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ) : isFull ? (
              <div className="text-center text-sm text-red-300">
                Este círculo está lotado.
              </div>
            ) : (
              <Button
                onClick={handleJoin}
                disabled={joining}
                className="w-full bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white border-0 min-h-[44px]"
                data-testid="event-join-button"
              >
                {joining ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Confirmando...
                  </>
                ) : user ? (
                  <>
                    <Check className="w-4 h-4 mr-2" /> Confirmar presença
                  </>
                ) : (
                  <>
                    Entrar para participar
                  </>
                )}
              </Button>
            )}
            {(joinFeedback || joinError) && (
              <p
                className={cn(
                  'text-xs text-center',
                  joinError ? 'text-red-300' : 'text-emerald-300'
                )}
                data-testid="event-join-feedback"
              >
                {joinError ?? joinFeedback}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Participants */}
        <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
          <CardHeader>
            <CardTitle className="text-sm text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Participantes</span>
              <span className="text-xs text-slate-500">
                {participants.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {participants.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                Ninguém confirmou presença ainda. Seja o primeiro!
              </p>
            ) : (
              <ul
                className="divide-y divide-slate-800/50"
                data-testid="event-participants-list"
              >
                {participants.map((p) => (
                  <li
                    key={p.userId}
                    className="flex items-center gap-3 py-2.5"
                    data-testid={`event-participant-${p.userId}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/30 to-violet-500/30 border border-slate-800/50 flex items-center justify-center text-xs font-medium text-amber-200">
                      {p.displayName[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-200 truncate">
                        {p.displayName}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {new Date(p.joinedAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}