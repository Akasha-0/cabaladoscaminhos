'use client';

// ============================================================================
// useGroups — Hooks do sistema de grupos (lista, detalhe, membership, invite)
// ============================================================================
// Mesma estratégia do usePosts: useState + useEffect + fetcher com envelope.
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
// Tipos (espelham src/lib/community/groups.ts DTOs)
// ============================================================================

export type GroupRole = 'ADMIN' | 'MODERATOR' | 'MEMBER';

export interface GroupDto {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string | null;
  rules: string[];
  iconUrl: string | null;
  bannerUrl: string | null;
  tradition: string;
  isPublic: boolean;
  requireApproval: boolean;
  createdBy: string | null;
  membersCount: number;
  postsCount: number;
  viewerRole: GroupRole | null;
  isMember: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMemberDto {
  userId: string;
  displayName: string;
  role: GroupRole;
  joinedAt: string;
  invitedBy: string | null;
}

export interface GroupInviteDto {
  id: string;
  token: string;
  groupId: string;
  groupSlug: string;
  groupName: string;
  invitedBy: string;
  inviteeUserId: string | null;
  inviteeEmail: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'REVOKED';
  expiresAt: string;
  createdAt: string;
}

// ============================================================================
// useGroupsList — GET /api/groups
// ============================================================================

export interface UseGroupsListOptions {
  tradition?: string;
  mine?: boolean;
  search?: string;
  isPublic?: boolean;
  devUserId?: string;
}

export interface UseGroupsListResult {
  groups: GroupDto[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useGroupsList(options: UseGroupsListOptions = {}): UseGroupsListResult {
  const { tradition, mine, search, isPublic, devUserId } = options;
  const [groups, setGroups] = useState<GroupDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const queryString = useMemo(() => {
    const sp = new URLSearchParams();
    if (tradition) sp.set('tradition', tradition);
    if (mine) sp.set('mine', 'true');
    if (search) sp.set('search', search);
    if (isPublic !== undefined) sp.set('isPublic', String(isPublic));
    return sp.toString();
  }, [tradition, mine, search, isPublic]);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    const headers: Record<string, string> = {};
    if (devUserId) headers['x-dev-user-id'] = devUserId;

    const result = await fetchJson<GroupDto[]>(
      `/api/groups${queryString ? `?${queryString}` : ''}`,
      { method: 'GET', headers, signal: ac.signal }
    );

    if (ac.signal.aborted) return;
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setError(null);
    setGroups(result.data);
    setLoading(false);
  }, [queryString, devUserId]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  return { groups, loading, error, refresh: load };
}

// ============================================================================
// useGroup — GET /api/groups/[slug]
// ============================================================================

export interface UseGroupResult {
  group: GroupDto | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useGroup(slug: string, devUserId?: string): UseGroupResult {
  const [group, setGroup] = useState<GroupDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    const headers: Record<string, string> = {};
    if (devUserId) headers['x-dev-user-id'] = devUserId;

    const result = await fetchJson<GroupDto>(`/api/groups/${slug}`, {
      method: 'GET',
      headers,
      signal: ac.signal,
    });

    if (ac.signal.aborted) return;
    if (!result.ok) {
      // 404 = grupo não existe → group fica null
      if (result.status === 404) {
        setGroup(null);
        setError(null);
      } else {
        setError(result.error);
      }
      setLoading(false);
      return;
    }
    setError(null);
    setGroup(result.data);
    setLoading(false);
  }, [slug, devUserId]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  return { group, loading, error, refresh: load };
}

// ============================================================================
// useGroupMembership — join/leave/role
// ============================================================================

export interface UseGroupMembershipResult {
  join: (opts?: { token?: string }) => Promise<{ ok: boolean; error?: string }>;
  leave: () => Promise<{ ok: boolean; error?: string }>;
  promote: (
    targetUserId: string,
    role: GroupRole
  ) => Promise<{ ok: boolean; error?: string }>;
  remove: (targetUserId: string) => Promise<{ ok: boolean; error?: string }>;
  loading: boolean;
}

export function useGroupMembership(
  slug: string,
  options: { onChange?: () => void; devUserId?: string } = {}
): UseGroupMembershipResult {
  const [loading, setLoading] = useState(false);
  const { onChange, devUserId } = options;

  const headers: Record<string, string> = {};
  if (devUserId) headers['x-dev-user-id'] = devUserId;

  const join = useCallback(
    async (opts?: { token?: string }) => {
      setLoading(true);
      const result = await fetchJson<{ groupSlug: string; role: GroupRole }>(
        `/api/groups/${slug}/members`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ token: opts?.token }),
        }
      );
      setLoading(false);
      if (!result.ok) return { ok: false, error: result.error };
      onChange?.();
      return { ok: true };
    },
    [slug, onChange, devUserId]
  );

  const leave = useCallback(async () => {
    setLoading(true);
    const result = await fetchJson<{ left: boolean }>(
      `/api/groups/${slug}/members`,
      { method: 'DELETE', headers }
    );
    setLoading(false);
    if (!result.ok) return { ok: false, error: result.error };
    onChange?.();
    return { ok: true };
  }, [slug, onChange, devUserId]);

  const promote = useCallback(
    async (targetUserId: string, role: GroupRole) => {
      setLoading(true);
      const result = await fetchJson<GroupMemberDto>(
        `/api/groups/${slug}/members`,
        {
          method: 'DELETE',
          headers,
          body: JSON.stringify({ targetUserId, role }),
        }
      );
      setLoading(false);
      if (!result.ok) return { ok: false, error: result.error };
      onChange?.();
      return { ok: true };
    },
    [slug, onChange, devUserId]
  );

  const remove = useCallback(
    async (targetUserId: string) => {
      setLoading(true);
      const result = await fetchJson<{ removedUserId: string }>(
        `/api/groups/${slug}/members?targetUserId=${encodeURIComponent(targetUserId)}`,
        { method: 'DELETE', headers }
      );
      setLoading(false);
      if (!result.ok) return { ok: false, error: result.error };
      onChange?.();
      return { ok: true };
    },
    [slug, onChange, devUserId]
  );

  return { join, leave, promote, remove, loading };
}

// ============================================================================
// useGroupMembers — GET /api/groups/[slug]/members
// ============================================================================

export interface UseGroupMembersResult {
  members: GroupMemberDto[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useGroupMembers(
  slug: string,
  devUserId?: string
): UseGroupMembersResult {
  const [members, setMembers] = useState<GroupMemberDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setLoading(true);
    const headers: Record<string, string> = {};
    if (devUserId) headers['x-dev-user-id'] = devUserId;

    const result = await fetchJson<GroupMemberDto[]>(
      `/api/groups/${slug}/members`,
      { method: 'GET', headers, signal: ac.signal }
    );

    if (ac.signal.aborted) return;
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }
    setError(null);
    setMembers(result.data);
    setLoading(false);
  }, [slug, devUserId]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  return { members, loading, error, refresh: load };
}

// ============================================================================
// useGroupPosts — GET /api/groups/[slug]/posts
// ============================================================================

export interface GroupPostSummary {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
}

export interface UseGroupPostsResult {
  posts: GroupPostSummary[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export function useGroupPosts(slug: string, devUserId?: string): UseGroupPostsResult {
  const [posts, setPosts] = useState<GroupPostSummary[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const fetchPage = useCallback(
    async (cursorValue: string | null, replace: boolean) => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      const sp = new URLSearchParams({ limit: '20' });
      if (cursorValue) sp.set('cursor', cursorValue);
      const headers: Record<string, string> = {};
      if (devUserId) headers['x-dev-user-id'] = devUserId;

      const result = await fetchJson<GroupPostSummary[]>(
        `/api/groups/${slug}/posts?${sp.toString()}`,
        { method: 'GET', headers, signal: ac.signal }
      );

      if (ac.signal.aborted) return;
      if (!result.ok) {
        setError(result.error);
        setLoading(false);
        setLoadingMore(false);
        return;
      }
      setError(null);
      setPosts((prev) => (replace ? result.data : [...prev, ...result.data]));
      // Cursor vem no meta; quando omitido → fim do feed
      const meta = (result as unknown as { meta?: { nextCursor?: string | null } });
      setCursor(meta.meta?.nextCursor ?? null);
      setHasMore(Boolean(meta.meta?.nextCursor));
      setLoading(false);
      setLoadingMore(false);
    },
    [slug, devUserId]
  );

  useEffect(() => {
    setLoading(true);
    setPosts([]);
    setCursor(null);
    setHasMore(true);
    fetchPage(null, true);
    return () => abortRef.current?.abort();
  }, [fetchPage]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setPosts([]);
    setCursor(null);
    setHasMore(true);
    await fetchPage(null, true);
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    await fetchPage(cursor, false);
  }, [fetchPage, cursor, hasMore, loading, loadingMore]);

  return { posts, loading, loadingMore, error, hasMore, refresh, loadMore };
}

// ============================================================================
// useGroupInvite — POST /api/groups/[slug]/invite
// ============================================================================

export interface UseGroupInviteResult {
  invite: (input: {
    inviteeUserId?: string;
    inviteeEmail?: string;
  }) => Promise<{ ok: boolean; invite?: GroupInviteDto; error?: string }>;
  loading: boolean;
}

export function useGroupInvite(
  slug: string,
  options: { devUserId?: string } = {}
): UseGroupInviteResult {
  const [loading, setLoading] = useState(false);
  const { devUserId } = options;

  const invite = useCallback(
    async (input: { inviteeUserId?: string; inviteeEmail?: string }) => {
      setLoading(true);
      const headers: Record<string, string> = {};
      if (devUserId) headers['x-dev-user-id'] = devUserId;

      const result = await fetchJson<GroupInviteDto>(
        `/api/groups/${slug}/invite`,
        { method: 'POST', headers, body: JSON.stringify(input) }
      );
      setLoading(false);
      if (!result.ok) return { ok: false, error: result.error };
      return { ok: true, invite: result.data };
    },
    [slug, devUserId]
  );

  return { invite, loading };
}
