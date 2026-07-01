'use client';

// ============================================================================
// EVENT LIVE — /events-v2/[id]/live
// ============================================================================
// Live streaming page (LIVESTREAM events).
// Features:
//   • Pre-event countdown
//   • Video player (HLS via hls.js, fallback nativo)
//   • Live chat sidebar (opt-in, moderado)
//   • Reactions (PRESENCE coins W20)
//   • Q&A queue
//   • WCAG AA: closed captions toggle
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Loader2, ArrowLeft, Send, Heart, Flame, Sparkles, MessageCircle,
  ChevronUp, Captions, X, Users, Volume2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface LiveConfig {
  eventId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  config: {
    playbackUrl: string;
    chatEnabled: boolean;
    reactionsEnabled: boolean;
    qaEnabled: boolean;
    captionsEnabled: boolean;
    lowLatency: boolean;
  };
  isHost: boolean;
}

interface ChatMessage {
  id: string;
  user: string;
  text: string;
  ts: number;
  flagged?: boolean;
}

interface Question {
  id: string;
  user: string;
  text: string;
  upvotes: number;
  answered: boolean;
  ts: number;
}

export default function LivePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [config, setConfig] = useState<LiveConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeUntilStart, setTimeUntilStart] = useState<number>(0);
  const [isLive, setIsLive] = useState(false);

  // Chat state
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Reactions
  const [reactions, setReactions] = useState<Array<{ id: string; type: string; ts: number }>>([]);
  const [presenceBalance, setPresenceBalance] = useState(100); // mock

  // Q&A
  const [tab, setTab] = useState<'chat' | 'qa'>('chat');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qaInput, setQaInput] = useState('');

  // Captions
  const [captionsOn, setCaptionsOn] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/community/events/${params.id}/live`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? `HTTP ${res.status}`);
        }
        const data = await res.json();
        setConfig(data.data);

        const start = new Date(data.data.startsAt).getTime();
        const now = Date.now();
        setTimeUntilStart(Math.max(0, start - now));
        setIsLive(now >= start && now <= new Date(data.data.endsAt).getTime());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  useEffect(() => {
    if (!config) return;
    const interval = setInterval(() => {
      const start = new Date(config.startsAt).getTime();
      const end = new Date(config.endsAt).getTime();
      const now = Date.now();
      setTimeUntilStart(Math.max(0, start - now));
      setIsLive(now >= start && now <= end);
    }, 1000);
    return () => clearInterval(interval);
  }, [config]);

  // Demo: simular chat e reactions (em prod viria de WebSocket / SSE)
  useEffect(() => {
    if (!isLive || !config?.config.chatEnabled) return;

    const demoMessages = [
      { user: 'Iyá', text: 'Que todos sejam bem-vindos a este círculo 🙏' },
      { user: 'João', text: 'Obrigado por este espaço sagrado' },
      { user: 'Maria', text: 'Sinto a energia fluir' },
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < demoMessages.length) {
        const msg = demoMessages[i];
        setChat((prev) => [...prev.slice(-49), { id: `m-${Date.now()}`, ...msg, ts: Date.now() }]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive, config]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const sendChat = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed || !user) return;

    // Moderation check (heurística simples)
    if (/(viagra|casino|xxx)/i.test(trimmed)) {
      setError('Mensagem bloqueada pela moderação');
      return;
    }

    setChat((prev) => [
      ...prev.slice(-49),
      { id: `m-${Date.now()}`, user: user.displayName ?? 'Você', text: trimmed, ts: Date.now() },
    ]);
    setChatInput('');
  };

  const sendReaction = (type: 'heart' | 'fire' | 'sparkles' | 'om' | 'lotus') => {
    if (!user) return;
    const cost = { heart: 1, fire: 5, sparkles: 10, om: 3, lotus: 25 }[type];
    if (presenceBalance < cost) {
      setError('Saldo PRESENCE insuficiente');
      return;
    }
    setPresenceBalance((b) => b - cost);
    const id = `r-${Date.now()}-${Math.random()}`;
    setReactions((prev) => [...prev, { id, type, ts: Date.now() }]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 3000);
  };

  const sendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = qaInput.trim();
    if (!trimmed || !user) return;
    setQuestions((prev) => [
      ...prev,
      { id: `q-${Date.now()}`, user: user.displayName ?? 'Você', text: trimmed, upvotes: 0, answered: false, ts: Date.now() },
    ]);
    setQaInput('');
  };

  const upvote = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, upvotes: q.upvotes + 1 } : q)),
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen p-8">
        <Card className="card-spiritual bg-red-500/10 border-red-500/30 max-w-md mx-auto">
          <CardContent className="py-12 text-center space-y-3">
            <p className="text-sm text-red-300">{error ?? 'Evento não encontrado'}</p>
            <Link href={`/events-v2/${params.id}`}>
              <Button variant="outline" className="border-slate-700">Voltar ao evento</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950" data-testid="live-page">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] min-h-screen">
        {/* Main: video */}
        <div className="flex flex-col">
          <header className="flex items-center justify-between p-3 border-b border-slate-800/50">
            <Link href={`/events-v2/${params.id}`} className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Link>
            <div className="flex items-center gap-2">
              {isLive ? (
                <Badge className="bg-red-500/20 text-red-300 border-red-500/30 animate-pulse">● AO VIVO</Badge>
              ) : (
                <Badge variant="outline" className="border-slate-700 text-slate-400">Em breve</Badge>
              )}
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Users className="w-3 h-3" /> 0
              </span>
            </div>
          </header>

          {/* Video area */}
          <div className="flex-1 flex items-center justify-center bg-black relative" data-testid="video-area">
            {!isLive ? (
              <Countdown seconds={Math.floor(timeUntilStart / 1000)} title={config.title} />
            ) : (
              <>
                {/* Mock video player (em prod: <video src={config.config.playbackUrl} /> + hls.js) */}
                <video
                  className="w-full h-full max-h-[calc(100vh-200px)] object-contain"
                  controls
                  autoPlay
                  muted
                  playsInline
                  poster=""
                  data-testid="video-player"
                  aria-label={`Live stream: ${config.title}`}
                >
                  {/* Em prod: <source src={config.config.playbackUrl} type="application/x-mpegURL" /> */}
                  <track kind="captions" srcLang="pt-BR" label="Português" default={captionsOn} />
                </video>

                {/* Reactions overlay */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {reactions.map((r) => (
                    <div
                      key={r.id}
                      className="absolute bottom-20 right-10 text-3xl animate-float-up"
                      style={{ animation: 'float-up 3s ease-out forwards' }}
                    >
                      {r.type === 'heart' && '❤️'}
                      {r.type === 'fire' && '🔥'}
                      {r.type === 'sparkles' && '✨'}
                      {r.type === 'om' && '🕉️'}
                      {r.type === 'lotus' && '🪷'}
                    </div>
                  ))}
                </div>

                {/* Captions toggle (WCAG AA) */}
                {config.config.captionsEnabled && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCaptionsOn(!captionsOn)}
                    className={cn(
                      'absolute top-3 right-3 border-slate-700',
                      captionsOn && 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
                    )}
                    data-testid="captions-toggle"
                    aria-label="Toggle closed captions"
                  >
                    <Captions className="w-3 h-3 mr-1" /> CC {captionsOn ? 'on' : 'off'}
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Reactions bar */}
          {isLive && config.config.reactionsEnabled && user && (
            <div className="flex items-center justify-center gap-2 p-3 border-t border-slate-800/50">
              {[
                { type: 'heart' as const, icon: Heart, cost: 1 },
                { type: 'fire' as const, icon: Flame, cost: 5 },
                { type: 'sparkles' as const, icon: Sparkles, cost: 10 },
                { type: 'om' as const, icon: Sparkles, cost: 3 },
                { type: 'lotus' as const, icon: Sparkles, cost: 25 },
              ].map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.type}
                    onClick={() => sendReaction(r.type)}
                    disabled={presenceBalance < r.cost}
                    data-testid={`reaction-${r.type}`}
                    className="flex flex-col items-center p-2 rounded-lg hover:bg-slate-800 disabled:opacity-30 transition-colors"
                    title={`${r.cost} PRESENCE`}
                  >
                    <Icon className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] text-slate-500">{r.cost}</span>
                  </button>
                );
              })}
              <span className="ml-auto text-xs text-slate-500">{presenceBalance} PRESENCE</span>
            </div>
          )}
        </div>

        {/* Sidebar: chat / Q&A */}
        <aside className="border-l border-slate-800/50 flex flex-col bg-slate-900/50" data-testid="live-sidebar">
          <div className="flex border-b border-slate-800/50">
            <button
              onClick={() => setTab('chat')}
              className={cn(
                'flex-1 px-4 py-3 text-xs font-medium transition-colors',
                tab === 'chat' ? 'bg-slate-800 text-slate-200' : 'text-slate-500',
              )}
              data-testid="tab-chat"
            >
              <MessageCircle className="w-3 h-3 inline mr-1" /> Chat
            </button>
            <button
              onClick={() => setTab('qa')}
              className={cn(
                'flex-1 px-4 py-3 text-xs font-medium transition-colors',
                tab === 'qa' ? 'bg-slate-800 text-slate-200' : 'text-slate-500',
              )}
              data-testid="tab-qa"
            >
              <ChevronUp className="w-3 h-3 inline mr-1" /> Perguntas
            </button>
          </div>

          {tab === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-2" data-testid="chat-list">
                {chat.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-6">
                    {isLive ? 'Aguardando mensagens...' : 'Chat abre quando o evento começar'}
                  </p>
                )}
                {chat.map((m) => (
                  <div key={m.id} className="text-xs">
                    <span className="text-amber-400 font-medium">{m.user}:</span>{' '}
                    <span className="text-slate-300">{m.text}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              {isLive && user && (
                <form onSubmit={sendChat} className="p-3 border-t border-slate-800/50 flex items-center gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Mensagem..."
                    maxLength={500}
                    data-testid="chat-input"
                    className="bg-slate-800 border-slate-700 text-slate-200 text-xs"
                  />
                  <Button size="sm" type="submit" className="bg-amber-500 text-slate-950 border-0">
                    <Send className="w-3 h-3" />
                  </Button>
                </form>
              )}
            </>
          )}

          {tab === 'qa' && (
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-2" data-testid="qa-list">
                {questions.length === 0 && <p className="text-xs text-slate-500 text-center py-6">Sem perguntas ainda</p>}
                {questions
                  .sort((a, b) => (a.answered ? 1 : -1) || b.upvotes - a.upvotes || a.ts - b.ts)
                  .map((q) => (
                    <div key={q.id} className="p-2 rounded bg-slate-800/50 flex items-start gap-2">
                      <button
                        onClick={() => upvote(q.id)}
                        className="flex flex-col items-center text-xs text-slate-400 hover:text-amber-400"
                      >
                        <ChevronUp className="w-3 h-3" />
                        <span>{q.upvotes}</span>
                      </button>
                      <div className="flex-1">
                        <p className="text-xs text-slate-200">{q.text}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{q.user}</p>
                      </div>
                    </div>
                  ))}
              </div>
              {isLive && user && (
                <form onSubmit={sendQuestion} className="p-3 border-t border-slate-800/50 flex items-center gap-2">
                  <Input
                    value={qaInput}
                    onChange={(e) => setQaInput(e.target.value)}
                    placeholder="Sua pergunta..."
                    maxLength={500}
                    data-testid="qa-input"
                    className="bg-slate-800 border-slate-700 text-slate-200 text-xs"
                  />
                  <Button size="sm" type="submit" className="bg-violet-500 text-white border-0">
                    <Send className="w-3 h-3" />
                  </Button>
                </form>
              )}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}

// ============================================================
// Countdown component (pre-event)
// ============================================================

function Countdown({ seconds, title }: { seconds: number; title: string }) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return (
    <div className="text-center p-8 space-y-4">
      <h2 className="text-2xl font-cinzel text-amber-300">{title}</h2>
      <p className="text-sm text-slate-400">O evento começará em</p>
      <div className="flex items-center justify-center gap-3 text-4xl font-mono text-slate-100">
        <CountdownCell value={days} label="dias" />
        <span>:</span>
        <CountdownCell value={hours} label="hrs" />
        <span>:</span>
        <CountdownCell value={minutes} label="min" />
        <span>:</span>
        <CountdownCell value={secs} label="seg" />
      </div>
    </div>
  );
}

function CountdownCell({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-amber-400">{String(value).padStart(2, '0')}</span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  );
}