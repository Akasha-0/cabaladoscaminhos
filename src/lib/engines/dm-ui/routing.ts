// routing.ts — type-safe route params for /dm paths
// W83-A dm-messages-ui. Cycle 82 lesson: param validation in pure helpers.

import type { ConversaId } from './types.ts';
import { toConversaId } from './types.ts';
import type { DmRouteName, DmRouteState, ListRouteState, ThreadRouteState } from './pages.ts';

export const EMPTY_LIST_ROUTE: ListRouteState = Object.freeze({
  name: 'list',
  searchQuery: '',
  incluirArquivadas: false,
});

export function listRoute(args?: { searchQuery?: string; incluirArquivadas?: boolean }): DmRouteState {
  return Object.freeze({
    name: 'list',
    searchQuery: args?.searchQuery ?? '',
    incluirArquivadas: args?.incluirArquivadas ?? false,
  });
}

export function threadRoute(conversaId: ConversaId): ThreadRouteState {
  return Object.freeze({
    name: 'thread',
    conversaId,
  });
}

export interface ParsedDmPath {
  readonly route: DmRouteName;
  readonly params: Readonly<Record<string, string>>;
}

const ID_REGEX = /^[a-zA-Z0-9_-]+$/;

export function parseDmPath(path: string): ParsedDmPath | null {
  if (path === '/dm' || path === '/dm/') {
    return { route: 'list', params: {} };
  }
  const threadMatch = path.match(/^\/dm\/([a-zA-Z0-9_-]+)\/?$/);
  if (threadMatch) {
    const id = threadMatch[1]!;
    if (!ID_REGEX.test(id)) return null;
    return {
      route: 'thread',
      params: { conversaId: id },
    };
  }
  return null;
}

export function buildDmPath(
  route: DmRouteName,
  params: Readonly<Record<string, string>> = {}
): string {
  if (route === 'list') return '/dm';
  const id = params.conversaId;
  if (!id) return '/dm';
  if (!ID_REGEX.test(id)) return '/dm';
  return '/dm/' + id;
}

export function pathToRoute(path: string): DmRouteState | null {
  const parsed = parseDmPath(path);
  if (!parsed) return null;
  if (parsed.route === 'list') return listRoute();
  const id = parsed.params.conversaId;
  if (!id) return null;
  return threadRoute(toConversaId(id));
}