'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar, Loader2, ArrowLeft, Plus, Users, Video,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';

interface EventItem {
  id: string;
  title: string;
  tradition: string;
  type: string;
  startsAt: string;
  endsAt: string;
  rsvpCount: number;
  capacity: number | null;
  status: string;
}

export default function MyEventsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'going' | 'organized' | 'past'>('going');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (tab === 'organized' && user) params.set('hostId', user.id);
        if (tab === 'past') params.set('past', '1');
        if (tab === 'going') params.set('upcoming', '1');
        params.set('limit', '50');

        const res = await fetch(`/api/community/events?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        let evts = data.data ?? [];
        if (tab === 'going') {
          evts = evts.filter((e: any) => e.viewerRsvp === 'GOING' || e.viewerRsvp === 'WAITLIST');
        }
        setEvents(evts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tab, user]);

  if (!user) {
    return (
      <div className="min-h-screen p-8">
        <Card className="card-spiritual bg-slate-900/50 border-slate-800/50 max-w-md mx-auto">
          <CardContent className="py-12 text-center space-y-3">
            <p className="text-slate-300">Faça login para ver seus eventos.</p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-amber-500 to-violet-500 text-white border-0">Entrar</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8" data-testid="my-events-page">
      <main className="max-w-4xl mx-auto space-y-6 pb-24">
        <header className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <Link href="/events-v2" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 mb-2">
              <ArrowLeft className="w-4 h-4" /> Todos os eventos
            </Link>
            <h1 className="text-2xl md:text-3xl font-cinzel bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent">
              Meus eventos
            </h1>
          </div>
          <Link href="/events-v2/new">
            <Button className="bg-gradient-to-r from-amber-500 to-violet-500 text-white border-0">
              <Plus className="w-4 h-4 mr-1" /> Criar evento
            </Button>
          </Link>
        </header>

        <div className="flex items-center gap-2 border-b border-slate-800/50">
          {([
            { key: 'going', label: '✓ Indo' },
            { key: 'organized', label: '🎤 Organizando' },
            { key: 'past', label: '📜 Passados' },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              data-testid={`tab-${t.key}`}
              className={
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors ' +
                (tab === t.key
                  ? 'border-amber-500 text-amber-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200')
              }
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
          </div>
        )}

        {error && (
          <Card className="card-spiritual bg-red-500/10 border-red-500/30">
            <CardContent className="py-6 text-center text-sm text-red-300">{error}</CardContent>
          </Card>
        )}

        {!loading && !error && events.length === 0 && (
          <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
            <CardContent className="py-12 text-center space-y-3">
              <Calendar className="w-8 h-8 mx-auto text-slate-500" />
              <p className="text-sm text-slate-300">
                {tab === 'going' && 'Você não confirmou presença em nenhum evento futuro.'}
                {tab === 'organized' && 'Você não organizou nenhum evento ainda.'}
                {tab === 'past' && 'Nenhum evento passado.'}
              </p>
              <Link href="/events-v2">
                <Button variant="outline" className="border-slate-700">Explorar eventos</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {!loading && events.length > 0 && (
          <div className="space-y-3" data-testid="my-events-list">
            {events.map((e) => (
              <Link key={e.id} href={`/events-v2/${e.id}`} className="block group">
                <Card className="card-spiritual bg-slate-900/50 border-slate-800/50 hover:border-amber-500/40 transition-colors">
                  <CardContent className="py-4 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">{e.type}</Badge>
                        <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">{e.tradition}</Badge>
                        {e.status !== 'PUBLISHED' && (
                          <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-300">{e.status}</Badge>
                        )}
                      </div>
                      <h3 className="text-base font-medium text-slate-100 group-hover:text-amber-300 truncate">{e.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(e.startsAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                        <Users className="w-3 h-3 ml-2" />
                        {e.rsvpCount}{e.capacity !== null && ` / ${e.capacity}`}
                      </p>
                    </div>
                    {e.type === 'LIVESTREAM' && (
                      <Link href={`/events-v2/${e.id}/live`}>
                        <Button size="sm" variant="outline" className="border-red-500/30 text-red-300">
                          <Video className="w-3 h-3 mr-1" /> Live
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}