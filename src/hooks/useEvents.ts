'use client';

// ============================================================================
// useEvents — Hooks do sistema de eventos (lista, detalhe, RSVP)
// ============================================================================
// Mesma estratégia do useGroups/usePosts: useState + useEffect + fetcher
// com envelope padronizado.
// ============================================================================

import { useCallback, useEffect, useState } from 'react';
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
// Tipos (espelham src/lib/community/events.ts DTOs)
// ============================================================================

export interface EventDto {
  id: string;
  title: string;
  description: string;
  tradition: string;
  hostId: string;
  hostDisplayName: string;
  startsAt: string;
  durationMin: number;
  maxParticipants: number;
  isPublic: boolean;
  meetingUrl: string | null;
  groupId: string | null;
  participantsCount: number;
  viewerIsParticipant: boolean;
  viewerIsHost: boolean;
  spotsRemaining: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface EventParticipantDto {
  userId: string;
  displayName: string;
  joinedAt: string;
}

// ============================================================================
// useEventsList — GET /api/events
// ============================================================================

export interface UseEventsListOptions {
  tradition?: string;
  upcoming?: boolean;
  isPublic?: boolean;
  hostId?: string;
  groupId?: string;
  search?: string;
  devUserId?: string;
  limit?: number;
}

export function useEventsList(opts: UseEventsListOptions = {}) {
  const [events, setEvents] = useState<EventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const params = new URLSearchParams();
  if (opts.tradition) params.set('tradition', opts.tradition);
  if (opts.upcoming === false) params.set('upcoming', 'false');
  if (opts.isPublic !== undefined) params.set('isPublic', String(opts.isPublic));
  if (opts.hostId) params.set('hostId', opts.hostId);
  if (opts.groupId) params.set('groupId', opts.groupId);
  if (opts.search) params.set('search', opts.search);
  if (opts.limit) params.set('limit', String(opts.limit));

  const url = `/api/events${params.toString() ? `?${params.toString()}` : ''}`;

  const headers: Record<string, string> = {};
  if (opts.devUserId) headers['x-dev-user-id'] = opts.devUserId;

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fetchJson<EventDto[]>(url, { headers });
    if (res.ok) {
      setEvents(res.data);
    } else {
      setError(res.error);
    }
    setLoading(false);
  }, [url]);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, refresh: fetchEvents };
}

// ============================================================================
// useEvent — GET /api/events/[id]
// ============================================================================

export function useEvent(id: string | null, devUserId?: string) {
  const [event, setEvent] = useState<EventDto | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setEvent(null);
      return;
    }
    setLoading(true);
    setError(null);
    const headers: Record<string, string> = {};
    if (devUserId) headers['x-dev-user-id'] = devUserId;
    const res = await fetchJson<EventDto>(`/api/events/${id}`, { headers });
    if (res.ok) {
      setEvent(res.data);
    } else {
      setError(res.error);
      setEvent(null);
    }
    setLoading(false);
  }, [id, devUserId]);

  useEffect(() => {
    void fetchEvent();
  }, [fetchEvent]);

  return { event, loading, error, refresh: fetchEvent };
}

// ============================================================================
// useEventParticipants — GET /api/events/[id]/participants
// ============================================================================

export function useEventParticipants(
  eventId: string | null,
  devUserId?: string
) {
  const [participants, setParticipants] = useState<EventParticipantDto[]>([]);
  const [loading, setLoading] = useState(!!eventId);
  const [error, setError] = useState<string | null>(null);

  const fetchParts = useCallback(async () => {
    if (!eventId) {
      setLoading(false);
      setParticipants([]);
      return;
    }
    setLoading(true);
    setError(null);
    const headers: Record<string, string> = {};
    if (devUserId) headers['x-dev-user-id'] = devUserId;
    const res = await fetchJson<EventParticipantDto[]>(
      `/api/events/${eventId}/participants`,
      { headers }
    );
    if (res.ok) {
      setParticipants(res.data);
    } else {
      setError(res.error);
    }
    setLoading(false);
  }, [eventId, devUserId]);

  useEffect(() => {
    void fetchParts();
  }, [fetchParts]);

  return { participants, loading, error, refresh: fetchParts };
}

// ============================================================================
// useJoinEvent — POST /api/events/[id]/join
// ============================================================================

export function useJoinEvent(devUserId?: string) {
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const join = useCallback(
    async (eventId: string) => {
      setJoining(true);
      setError(null);
      const headers: Record<string, string> = {};
      if (devUserId) headers['x-dev-user-id'] = devUserId;
      const res = await fetchJson<{ role: 'PARTICIPANT'; joined: boolean }>(
        `/api/events/${eventId}/join`,
        { method: 'POST', headers }
      );
      setJoining(false);
      if (!res.ok) {
        setError(res.error);
        return { ok: false as const, error: res.error };
      }
      return { ok: true as const, data: res.data };
    },
    [devUserId]
  );

  return { join, joining, error };
}

// ============================================================================
// useCreateEvent — POST /api/events
// ============================================================================

export interface CreateEventPayload {
  title: string;
  description: string;
  tradition: string;
  startsAt: string; // ISO 8601
  durationMin?: number;
  maxParticipants?: number;
  isPublic?: boolean;
  meetingUrl?: string | null;
  groupId?: string | null;
}

export function useCreateEvent(devUserId?: string) {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (payload: CreateEventPayload) => {
      setCreating(true);
      setError(null);
      const headers: Record<string, string> = {};
      if (devUserId) headers['x-dev-user-id'] = devUserId;
      const res = await fetchJson<EventDto>(`/api/events`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      setCreating(false);
      if (!res.ok) {
        setError(res.error);
        return { ok: false as const, error: res.error };
      }
      return { ok: true as const, data: res.data };
    },
    [devUserId]
  );

  return { create, creating, error };
}