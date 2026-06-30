'use client';

// ============================================================================
// DMThreadsClient — wrapper client para a página /dm (W90s-B)
// Conecta DMThreadList + actions do engine puro.
// ============================================================================

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DMThreadList } from '@/components/community/DMThreadList';
import {
  createInitialState,
  startThread,
  listThreads,
  getUnreadSummary,
  type DMState,
  type DMThread,
  toUserId,
  toThreadId,
} from '@/lib/w90s/dm-threads';
import {
  loadDMState,
  saveDMState,
  subscribeDMState,
} from '@/lib/w90s/dm-thread-storage';

const SEED_PEERS = [
  { id: 'yara-do-cipo', display: 'Yara do Cipó', seed: 'yara' },
  { id: 'mestre-ramiro', display: 'Mestre Ramiro', seed: 'ramiro' },
  { id: 'mae-iara', display: 'Mãe Iara', seed: 'iara' },
] as const;

export interface DMThreadsClientProps {
  readonly currentUserId: string;
}

export function DMThreadsClient({ currentUserId }: DMThreadsClientProps) {
  const [state, setState] = useState<DMState>(() =>
    createInitialState({ currentUserId: toUserId(currentUserId) }),
  );

  // carregar do storage na primeira render
  useEffect(() => {
    const loaded = loadDMState(toUserId(currentUserId));
    if (loaded) {
      setState(loaded);
      return;
    }
    // seed: cria threads com os 3 peers se storage vazio
    let s = createInitialState({ currentUserId: toUserId(currentUserId) });
    for (const peer of SEED_PEERS) {
      const res = startThread(s, {
        peerId: toUserId(peer.id),
        peerDisplayName: peer.display,
        peerAvatarSeed: peer.seed,
        nowMs: Date.now() - Math.floor(Math.random() * 1e7),
      });
      s = res.state;
    }
    setState(s);
  }, [currentUserId]);

  // persistir em todo change
  useEffect(() => {
    saveDMState(toUserId(currentUserId), state);
  }, [state, currentUserId]);

  // cross-tab sync
  useEffect(() => {
    const sub = subscribeDMState(toUserId(currentUserId), (fresh) => {
      setState(fresh);
    });
    return () => sub.unsubscribe();
  }, [currentUserId]);

  const handleArchiveToggle = useCallback(
    (threadId: string) => {
      // mutação simples: flipa archived no state local — delegação real fica no engine
      const current = listThreads(state, { view: 'all' });
      const t = current.threads.find((th) => (th.id as unknown as string) === threadId);
      if (!t) return;
      const nextThreads: DMThread[] = state.threads.map((th) =>
        (th.id as unknown as string) === threadId
          ? ({ ...th, archived: !th.archived } as DMThread)
          : th,
      );
      setState({ ...state, threads: nextThreads });
    },
    [state],
  );

  const active = useMemo(() => listThreads(state, { view: 'active' }), [state]);
  const unreadSummary = useMemo(() => getUnreadSummary(state), [state]);

  return (
    <DMThreadList
      threads={active.threads}
      currentThreadId={null}
      unreadSummary={unreadSummary.perThread}
      onArchiveToggle={handleArchiveToggle}
    />
  );
}

export default DMThreadsClient;
