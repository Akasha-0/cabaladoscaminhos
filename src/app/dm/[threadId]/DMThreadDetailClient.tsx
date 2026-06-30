'use client';

// ============================================================================
// DMThreadDetailClient — wrapper client para /dm/[threadId] (W90s-B)
// Conecta o DMThreadView ao engine + storage.
// ============================================================================

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DMThreadView } from '@/components/community/DMThreadView';
import {
  archiveThread,
  blockUser,
  createInitialState,
  getThread,
  isBlocked,
  listThreads,
  markRead,
  peerOf,
  sendMessage,
  startThread,
  toMessageId,
  toThreadId,
  toUserId,
  type DMState,
} from '@/lib/w90s/dm-threads';
import {
  loadDMState,
  saveDMState,
  subscribeDMState,
} from '@/lib/w90s/dm-thread-storage';

const PEER_DISPLAY: Record<string, { name: string; seed: string }> = {
  'yara-do-cipo': { name: 'Yara do Cipó', seed: 'yara' },
  'mestre-ramiro': { name: 'Mestre Ramiro', seed: 'ramiro' },
  'mae-iara': { name: 'Mãe Iara', seed: 'iara' },
};

export interface DMThreadDetailClientProps {
  readonly currentUserId: string;
  readonly threadId: string;
}

export function DMThreadDetailClient({ currentUserId, threadId }: DMThreadDetailClientProps) {
  const [state, setState] = useState<DMState>(() =>
    createInitialState({ currentUserId: toUserId(currentUserId) }),
  );
  const [draft, setDraft] = useState('');

  useEffect(() => {
    const loaded = loadDMState(toUserId(currentUserId));
    if (loaded) {
      setState(loaded);
      return;
    }
    // seed mínimo se vazio
    let s = createInitialState({ currentUserId: toUserId(currentUserId) });
    s = startThread(s, {
      peerId: toUserId('yara-do-cipo'),
      peerDisplayName: 'Yara do Cipó',
      peerAvatarSeed: 'yara',
      nowMs: Date.now() - 60_000,
    }).state;
    setState(s);
  }, [currentUserId]);

  useEffect(() => {
    saveDMState(toUserId(currentUserId), state);
  }, [state, currentUserId]);

  useEffect(() => {
    const sub = subscribeDMState(toUserId(currentUserId), (fresh) => {
      setState(fresh);
    });
    return () => sub.unsubscribe();
  }, [currentUserId]);

  // garante thread existe (decodifica do threadId "dm_<peerId>_<meId>" se aplicável)
  useEffect(() => {
    const found = listThreads(state, { view: 'all' }).threads.find(
      (t) => (t.id as unknown as string) === threadId,
    );
    if (found) return;
    // tenta extrair peerId do threadId (assumindo formato dm_<B>_<A>)
    const m = /dm_([^_]+)_([^_]+)/.exec(threadId);
    if (!m) return;
    const [, hi, lo] = m;
    const meStr = currentUserId;
    const peer = hi === meStr ? lo : hi;
    const meta = PEER_DISPLAY[peer];
    if (!meta) return;
    const started = startThread(state, {
      peerId: toUserId(peer),
      peerDisplayName: meta.name,
      peerAvatarSeed: meta.seed,
      nowMs: Date.now(),
    });
    setState(started.state);
  }, [threadId, state, currentUserId]);

  const handleSend = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      const tid = toThreadId(threadId);
      const result = sendMessage(state, {
        threadId: tid,
        text,
        nowMs: Date.now(),
      });
      setState(result.state);
      setDraft('');
    },
    [state, threadId],
  );

  const handleMarkRead = useCallback(() => {
    const tid = toThreadId(threadId);
    const result = markRead(state, {
      threadId: tid,
      nowMs: Date.now(),
    });
    if (result.markedCount === 0) return;
    setState(result.state);
  }, [state, threadId]);

  const handleArchiveToggle = useCallback(() => {
    const tid = toThreadId(threadId);
    const result = archiveThread(state, {
      threadId: tid,
      nowMs: Date.now(),
    });
    if (result.thread === state.threads.find((t) => (t.id as unknown as string) === threadId)) {
      return;
    }
    setState(result.state);
  }, [state, threadId]);

  const handleUnblock = useCallback(() => {
    const view = getThread(state, toThreadId(threadId));
    if (!view.peer) return;
    const result = blockUser(state, { userId: view.peer, blocked: false });
    setState(result.state);
  }, [state, threadId]);

  const view = useMemo(() => getThread(state, toThreadId(threadId)), [state, threadId]);
  const peer = view.peer;
  const blockedPeer = peer ? isBlocked(state, peer) : false;

  if (!view.thread) {
    return (
      <div className="flex flex-col items-center gap-2 p-6 text-center text-sm text-muted-foreground">
        <p>Conversa não encontrada.</p>
        <a href="/dm" className="text-primary hover:underline">
          Voltar para mensagens
        </a>
      </div>
    );
  }

  return (
    <DMThreadView
      thread={view.thread}
      messages={view.messages}
      currentUserId={currentUserId}
      blockedPeer={blockedPeer}
      draftMessage={draft}
      onSend={handleSend}
      onMarkRead={handleMarkRead}
      onArchiveToggle={handleArchiveToggle}
      onUnblock={handleUnblock}
      onDraftChange={setDraft}
    />
  );
}

export default DMThreadDetailClient;
