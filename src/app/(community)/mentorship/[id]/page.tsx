'use client';

// ============================================================================
// MENTORSHIP DETAIL — /mentorship/[id]
// ============================================================================
// Detalhes da mentoria: status, mentor/mentee, tradição. Chat 1-on-1 simples
// (lista de mensagens, sem realtime — polling a cada 5s).
// Botões de ação (aceitar/encerrar) conforme o papel do viewer.
// ============================================================================

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, Loader2, Send, CheckCircle2, XCircle,
  GraduationCap, Sparkles, User, MessageCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  useMentorship,
  useMentorshipActions,
  type MentorshipDto,
  type MentorshipMessageDto,
} from '@/hooks/useMentorship';
import { useAuth } from '@/hooks/useAuth';
import { useHaptic } from '@/hooks/useHaptic';

// ============================================================
// MAIN
// ============================================================

export default function MentorshipDetailPage() {
  const params = useParams<{ id: string }>();
  const mentorshipId = params?.id ?? '';
  const { user } = useAuth();
  const { trigger } = useHaptic();

  const [input, setInput] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { detail, loading, error, refresh } = useMentorship({
    mentorshipId,
    ...(user?.id ? { devUserId: user.id } : {}),
    pollMs: 5000,
  });

  const { accept, end, sendMessage, loading: acting } = useMentorshipActions({
    ...(user?.id ? { devUserId: user.id } : {}),
    onChange: () => refresh(),
  });

  // Papel do viewer
  const viewerRole: 'MENTOR' | 'MENTEE' | 'OUTSIDER' = useMemo(() => {
    if (!detail || !user) return 'OUTSIDER';
    if (detail.mentorship.mentorId === user.id) return 'MENTOR';
    if (detail.mentorship.menteeId === user.id) return 'MENTEE';
    return 'OUTSIDER';
  }, [detail, user]);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [detail?.messages.length]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || !detail || detail.mentorship.status === 'COMPLETED') return;
    trigger('light');
    setInput('');
    const result = await sendMessage(mentorshipId, trimmed);
    if (!result.ok) {
      setActionFeedback(result.error ?? 'Erro ao enviar mensagem');
      setInput(trimmed); // restaura para o usuário tentar de novo
      trigger('error');
    } else {
      trigger('success');
      refresh();
    }
  };

  const handleAccept = async () => {
    setActionFeedback(null);
    trigger('medium');
    const result = await accept(mentorshipId);
    if (result.ok) {
      setActionFeedback('Mentoria aceita! Agora podem conversar.');
      trigger('success');
    } else {
      setActionFeedback(result.error ?? 'Erro ao aceitar');
      trigger('error');
    }
  };

  const handleEnd = async () => {
    if (!confirm('Encerrar esta mentoria? Esta ação não pode ser desfeita.')) {
      return;
    }
    trigger('medium');
    const result = await end(mentorshipId);
    if (result.ok) {
      setActionFeedback('Mentoria encerrada.');
      trigger('success');
    } else {
      setActionFeedback(result.error ?? 'Erro ao encerrar');
      trigger('error');
    }
  };

  if (loading && !detail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <Link href="/mentorship">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
            </Button>
          </Link>
          <Card className="card-spiritual bg-red-500/10 border-red-500/30">
            <CardContent className="py-8 text-center space-y-2">
              <p className="text-sm text-red-300">
                {error ?? 'Mentoria não encontrada'}
              </p>
              <Button size="sm" variant="outline" onClick={refresh}>
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { mentorship, messages } = detail;
  const isCompleted = mentorship.status === 'COMPLETED';
  const isPending = mentorship.status === 'PENDING';
  const isActive = mentorship.status === 'ACTIVE';
  const canChat = !isCompleted && viewerRole !== 'OUTSIDER';

  return (
    <div className="min-h-screen p-4 md:p-6 pb-24 md:pb-8" data-testid="mentorship-detail-page">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Back link */}
        <Link href="/mentorship">
          <Button variant="ghost" size="sm" data-testid="mentorship-back-link">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para mentorias
          </Button>
        </Link>

        {/* Feedback */}
        {actionFeedback && (
          <Card className="card-spiritual bg-slate-900/70 border-amber-500/40">
            <CardContent className="py-3 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-200 flex-1">{actionFeedback}</p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setActionFeedback(null)}
                className="text-xs text-slate-400"
              >
                Fechar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Header card */}
        <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
          <CardHeader>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-violet-500/20 border border-amber-500/30 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-100">
                    Mentoria · {mentorship.tradition}
                  </CardTitle>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Criada em {new Date(mentorship.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <StatusBadge status={mentorship.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Mentor / Mentee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <PartyCard
                role="Mentor"
                userId={mentorship.mentorId}
                name={mentorship.mentorName}
                viewerRole={viewerRole}
              />
              <PartyCard
                role="Mentee"
                userId={mentorship.menteeId}
                name={mentorship.menteeName}
                viewerRole={viewerRole}
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/50">
              {isPending && viewerRole === 'MENTOR' && (
                <Button
                  onClick={handleAccept}
                  disabled={acting}
                  size="sm"
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0"
                  data-testid="mentorship-accept-button"
                >
                  {acting ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                  )}
                  Aceitar mentoria
                </Button>
              )}
              {(isActive || isPending) && viewerRole !== 'OUTSIDER' && (
                <Button
                  onClick={handleEnd}
                  disabled={acting}
                  size="sm"
                  variant="outline"
                  className="border-red-500/40 text-red-300 hover:bg-red-500/10"
                  data-testid="mentorship-end-button"
                >
                  {acting ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <XCircle className="w-3 h-3 mr-1" />
                  )}
                  Encerrar
                </Button>
              )}
              {isCompleted && (
                <p className="text-xs text-slate-500 self-center">
                  Encerrada em{' '}
                  {mentorship.endedAt
                    ? new Date(mentorship.endedAt).toLocaleDateString('pt-BR')
                    : '—'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat */}
        <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-300/80">
              <MessageCircle className="w-3 h-3" />
              Chat 1-on-1
              <span className="text-slate-500 normal-case tracking-normal">
                · {messages.length} mensagens
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Messages list */}
            <div
              className="space-y-2 max-h-[480px] overflow-y-auto pr-2"
              data-testid="mentorship-messages"
            >
              {messages.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-8">
                  {canChat
                    ? 'Nenhuma mensagem ainda. Comece a conversa!'
                    : 'Sem mensagens.'}
                </p>
              )}
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isMine={msg.authorId === user?.id}
                  authorName={
                    msg.authorId === mentorship.mentorId
                      ? mentorship.mentorName
                      : mentorship.menteeName
                  }
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            {canChat ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-end gap-2 pt-3 border-t border-slate-800/50"
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={1}
                  placeholder="Escreva sua mensagem... (Enter envia, Shift+Enter quebra linha)"
                  className="flex-1 px-3 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-amber-500/50 text-sm text-slate-200 placeholder-slate-500 outline-none resize-none min-h-[44px]"
                  data-testid="mentorship-message-input"
                  aria-label="Mensagem"
                />
                <Button
                  type="submit"
                  disabled={acting || !input.trim()}
                  size="sm"
                  className="bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white border-0 min-h-[44px] min-w-[44px]"
                  data-testid="mentorship-send-button"
                >
                  {acting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            ) : (
              <p className="text-xs text-slate-500 text-center pt-3 border-t border-slate-800/50">
                {isCompleted
                  ? 'Mentoria encerrada — chat fechado.'
                  : 'Apenas mentor e mentee podem conversar.'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================================
// Subcomponentes
// ============================================================

function StatusBadge({ status }: { status: MentorshipDto['status'] }) {
  const map = {
    PENDING: { label: 'Aguardando aceite', cls: 'border-amber-500/40 text-amber-300' },
    ACTIVE: { label: 'Ativa', cls: 'border-emerald-500/40 text-emerald-300' },
    COMPLETED: { label: 'Concluída', cls: 'border-slate-700 text-slate-400' },
  } as const;
  const { label, cls } = map[status];
  return (
    <Badge
      variant="outline"
      className={cn('text-xs', cls)}
      data-testid={`mentorship-status-${status}`}
    >
      {label}
    </Badge>
  );
}

function PartyCard({
  role,
  userId,
  name,
  viewerRole,
}: {
  role: 'Mentor' | 'Mentee';
  userId: string;
  name: string;
  viewerRole: 'MENTOR' | 'MENTEE' | 'OUTSIDER';
}) {
  const isYou =
    (role === 'Mentor' && viewerRole === 'MENTOR') ||
    (role === 'Mentee' && viewerRole === 'MENTEE');
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border',
        isYou
          ? 'bg-amber-500/10 border-amber-500/40'
          : 'bg-slate-800/30 border-slate-800/50'
      )}
    >
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/20 to-violet-500/20 border border-slate-800/50 flex items-center justify-center text-sm font-medium text-amber-300">
        {name[0]?.toUpperCase() ?? '?'}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500 uppercase tracking-wider">{role}</p>
        <p className="text-sm text-slate-100 truncate">
          {name} {isYou && <span className="text-amber-300 text-xs">(você)</span>}
        </p>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  isMine,
  authorName,
}: {
  message: MentorshipMessageDto;
  isMine: boolean;
  authorName: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1',
        isMine ? 'items-end' : 'items-start'
      )}
      data-testid={`message-${message.id}`}
    >
      <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
        {!isMine && <User className="w-2.5 h-2.5" />}
        <span>{isMine ? 'Você' : authorName}</span>
        <span>·</span>
        <span>{new Date(message.createdAt).toLocaleString('pt-BR')}</span>
      </div>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
          isMine
            ? 'bg-gradient-to-br from-amber-500/20 to-violet-500/20 border border-amber-500/30 text-slate-100 rounded-br-sm'
            : 'bg-slate-800/60 border border-slate-700/40 text-slate-200 rounded-bl-sm'
        )}
      >
        {message.content}
      </div>
    </div>
  );
}