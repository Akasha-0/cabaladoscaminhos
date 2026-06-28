'use client';

// ============================================================================
// useMentorship — Hooks do sistema de mentoria 1-on-1
// ============================================================================
// Estratégia idêntica ao useGroups: fetch com envelope padrão.
// ============================================================================

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ApiResponse } from '@/types/community';

// ============================================================================
// Internal fetcher
// ============================================================================

async function fetchJson<T>(
  url: string,
  init?: RequestInit
): Promise<{ ok: true; data: T } | { ok: false; error: string; status: number }> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
    const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;
    if (!res.ok || !json || json.error) {
      return {
        ok: false,
        error: json?.error?.message ?? `Erro HTTP ${res.status}`,
        status: res.status,
      };
    }
    return { ok: true, data: json.data as T };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Erro de rede',
      status: 0,
    };
  }
}

// ============================================================================
// Tipos (espelham src/lib/community/mentorship.ts DTOs)
// ============================================================================

export interface MentorDto {
  id: string;
  displayName: string;
  bio: string | null;
  traditions: string[];
  rating: number;
  completed: number;
  isAvailable: boolean;
}

export type MentorshipStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED';

export interface MentorshipDto {
  id: string;
  mentorId: string;
  mentorName: string;
  menteeId: string;
  menteeName: string;
  tradition: string;
  status: MentorshipStatus;
  createdAt: string;
  acceptedAt: string | null;
  endedAt: string | null;
  messageCount: number;
}

export interface MentorshipMessageDto {
  id: string;
  mentorshipId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface MentorshipDetailDto {
  mentorship: MentorshipDto;
  messages: MentorshipMessageDto[];
}

// ============================================================================
// useAvailableMentors — GET /api/mentorship/available
// ============================================================================

export interface UseAvailableMentorsOptions {
  tradition?: string;
  devUserId?: string;
}

export interface UseAvailableMentorsResult {
  mentors: MentorDto[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAvailableMentors(
  options: UseAvailableMentorsOptions = {}
): UseAvailableMentorsResult {
  const { tradition, devUserId } = options;
  const [mentors, setMentors] = useState<MentorDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const queryString = useMemo(() => {
    const sp = new URLSearchParams();
    if (tradition) sp.set('tradition', tradition);
    return sp.toString();
  }, [tradition]);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    const headers: Record<string, string> = {};
    if (devUserId) headers['x-dev-user-id'] = devUserId;

    const result = await fetchJson<MentorDto[]>(
      `/api/mentorship/available${queryString ? `?${queryString}` : ''}`,
      { method: 'GET', headers, signal: ac.signal }
    );

    if (ac.signal.aborted) return;
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setError(null);
    setMentors(result.data);
    setLoading(false);
  }, [queryString, devUserId]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  return { mentors, loading, error, refresh: load };
}

// ============================================================================
// useRequestMentorship — POST /api/mentorship/request
// ============================================================================

export interface UseRequestMentorshipResult {
  request: (input: {
    mentorId: string;
    tradition: string;
    message?: string;
  }) => Promise<{ ok: boolean; mentorship?: MentorshipDto; error?: string }>;
  loading: boolean;
}

export function useRequestMentorship(
  options: { devUserId?: string } = {}
): UseRequestMentorshipResult {
  const [loading, setLoading] = useState(false);
  const { devUserId } = options;

  const request = useCallback(
    async (input: { mentorId: string; tradition: string; message?: string }) => {
      setLoading(true);
      const headers: Record<string, string> = {};
      if (devUserId) headers['x-dev-user-id'] = devUserId;

      const result = await fetchJson<MentorshipDto>(
        '/api/mentorship/request',
        {
          method: 'POST',
          headers,
          body: JSON.stringify(input),
        }
      );
      setLoading(false);
      if (!result.ok) return { ok: false, error: result.error };
      return { ok: true, mentorship: result.data };
    },
    [devUserId]
  );

  return { request, loading };
}

// ============================================================================
// useMentorship — GET /api/mentorship/[id] + polling simples para chat
// ============================================================================

export interface UseMentorshipOptions {
  mentorshipId: string;
  devUserId?: string;
  /** Polling interval em ms (default 5000). Set 0 para desabilitar. */
  pollMs?: number;
}

export interface UseMentorshipResult {
  detail: MentorshipDetailDto | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useMentorship(options: UseMentorshipOptions): UseMentorshipResult {
  const { mentorshipId, devUserId, pollMs = 5000 } = options;
  const [detail, setDetail] = useState<MentorshipDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const headers: Record<string, string> = {};
    if (devUserId) headers['x-dev-user-id'] = devUserId;

    const result = await fetchJson<MentorshipDetailDto>(
      `/api/mentorship/${mentorshipId}`,
      { method: 'GET', headers, signal: ac.signal }
    );

    if (ac.signal.aborted) return;
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setError(null);
    setDetail(result.data);
    setLoading(false);
  }, [mentorshipId, devUserId]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  // Polling simples (sem realtime). Se pollMs<=0, desabilita.
  useEffect(() => {
    if (!pollMs || pollMs <= 0) return;
    const interval = setInterval(() => {
      load();
    }, pollMs);
    return () => clearInterval(interval);
  }, [load, pollMs]);

  return { detail, loading, error, refresh: load };
}

// ============================================================================
// useMentorshipActions — POST /accept, /end, /messages
// ============================================================================

export interface UseMentorshipActionsResult {
  accept: (
    mentorshipId: string
  ) => Promise<{ ok: boolean; mentorship?: MentorshipDto; error?: string }>;
  end: (
    mentorshipId: string,
    reason?: string
  ) => Promise<{ ok: boolean; mentorship?: MentorshipDto; error?: string }>;
  sendMessage: (
    mentorshipId: string,
    content: string
  ) => Promise<{ ok: boolean; message?: MentorshipMessageDto; error?: string }>;
  loading: boolean;
}

export function useMentorshipActions(
  options: { devUserId?: string; onChange?: () => void } = {}
): UseMentorshipActionsResult {
  const [loading, setLoading] = useState(false);
  const { devUserId, onChange } = options;

  const headers: Record<string, string> = {};
  if (devUserId) headers['x-dev-user-id'] = devUserId;

  const accept = useCallback(
    async (mentorshipId: string) => {
      setLoading(true);
      const result = await fetchJson<MentorshipDto>(
        `/api/mentorship/${mentorshipId}/accept`,
        { method: 'POST', headers }
      );
      setLoading(false);
      if (!result.ok) return { ok: false, error: result.error };
      onChange?.();
      return { ok: true, mentorship: result.data };
    },
    [devUserId, onChange]
  );

  const end = useCallback(
    async (mentorshipId: string, reason?: string) => {
      setLoading(true);
      const result = await fetchJson<MentorshipDto>(
        `/api/mentorship/${mentorshipId}/end`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify(reason ? { reason } : {}),
        }
      );
      setLoading(false);
      if (!result.ok) return { ok: false, error: result.error };
      onChange?.();
      return { ok: true, mentorship: result.data };
    },
    [devUserId, onChange]
  );

  const sendMessage = useCallback(
    async (mentorshipId: string, content: string) => {
      setLoading(true);
      const result = await fetchJson<MentorshipMessageDto>(
        `/api/mentorship/${mentorshipId}/messages`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ content }),
        }
      );
      setLoading(false);
      if (!result.ok) return { ok: false, error: result.error };
      onChange?.();
      return { ok: true, message: result.data };
    },
    [devUserId, onChange]
  );

  return { accept, end, sendMessage, loading };
}

// ============================================================================
// useMyMentorships — GET /api/mentorship/me
// ============================================================================

export interface UseMyMentorshipsOptions {
  status?: MentorshipStatus;
  devUserId?: string;
}

export interface UseMyMentorshipsResult {
  mentorships: MentorshipDto[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useMyMentorships(
  options: UseMyMentorshipsOptions = {}
): UseMyMentorshipsResult {
  const { status, devUserId } = options;
  const [mentorships, setMentorships] = useState<MentorshipDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const queryString = useMemo(() => {
    const sp = new URLSearchParams();
    if (status) sp.set('status', status);
    return sp.toString();
  }, [status]);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    const headers: Record<string, string> = {};
    if (devUserId) headers['x-dev-user-id'] = devUserId;

    const result = await fetchJson<MentorshipDto[]>(
      `/api/mentorship/me${queryString ? `?${queryString}` : ''}`,
      { method: 'GET', headers, signal: ac.signal }
    );

    if (ac.signal.aborted) return;
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setError(null);
    setMentorships(result.data);
    setLoading(false);
  }, [queryString, devUserId]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  return { mentorships, loading, error, refresh: load };
}