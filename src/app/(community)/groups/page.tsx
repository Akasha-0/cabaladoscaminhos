'use client';

// ============================================================================
// GROUPS LIST — /groups
// ============================================================================
// Grid de cards com filtros (tradição, tamanho, seus grupos) + search.
// ============================================================================

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users, Search, Loader2, Plus, Lock, Globe,
  Hash, MessageCircle, Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useGroupsList, type GroupDto } from '@/hooks/useGroups';
import { useAuth } from '@/hooks/useAuth';

// ============================================================
// Constantes
// ============================================================

const TRADITION_FILTERS = [
  { value: '', label: 'Todas as tradições' },
  { value: 'cabala', label: 'Cabala' },
  { value: 'ifa', label: 'Ifá' },
  { value: 'astrologia', label: 'Astrologia' },
  { value: 'tantra', label: 'Tantra' },
  { value: 'reiki', label: 'Reiki' },
  { value: 'meditacao', label: 'Meditação' },
  { value: 'xamanismo', label: 'Xamanismo' },
  { value: 'cristianismo-mistico', label: 'Cristianismo Místico' },
  { value: 'sufismo', label: 'Sufismo' },
  { value: 'taoismo', label: 'Taoísmo' },
  { value: 'umbanda', label: 'Umbanda' },
  { value: 'candomble', label: 'Candomblé' },
];

const TRADITION_COLOR: Record<string, string> = {
  cabala: 'from-violet-500/20 to-purple-500/20 border-violet-500/30 hover:border-violet-500/60',
  ifa: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 hover:border-amber-500/60',
  astrologia: 'from-pink-500/20 to-rose-500/20 border-pink-500/30 hover:border-pink-500/60',
  tantra: 'from-rose-500/20 to-fuchsia-500/20 border-rose-500/30 hover:border-rose-500/60',
  reiki: 'from-cyan-500/20 to-sky-500/20 border-cyan-500/30 hover:border-cyan-500/60',
  meditacao: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 hover:border-emerald-500/60',
  xamanismo: 'from-emerald-500/20 to-lime-500/20 border-emerald-500/30 hover:border-emerald-500/60',
  'cristianismo-mistico': 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 hover:border-blue-500/60',
  sufismo: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:border-purple-500/60',
  taoismo: 'from-slate-500/20 to-zinc-500/20 border-slate-500/30 hover:border-slate-500/60',
  umbanda: 'from-orange-500/20 to-red-500/20 border-orange-500/30 hover:border-orange-500/60',
  candomble: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30 hover:border-yellow-500/60',
};

const TRADITION_EMOJI: Record<string, string> = {
  cabala: '✡️',
  ifa: '🪶',
  astrologia: '♈',
  tantra: '🕉️',
  reiki: '🔆',
  meditacao: '🧘',
  xamanismo: '🌿',
  'cristianismo-mistico': '✝️',
  sufismo: '☪️',
  taoismo: '☯️',
  umbanda: '🪘',
  candomble: '🌍',
};

// ============================================================
// MAIN
// ============================================================

export default function GroupsPage() {
  const { user } = useAuth();
  const devUserId = user?.id ?? undefined;

  const [tradition, setTradition] = useState<string>('');
  const [mine, setMine] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search (300ms)
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { groups, loading, error, refresh } = useGroupsList({
    tradition: tradition || undefined,
    mine: mine || undefined,
    search: debouncedSearch || undefined,
    ...(devUserId ? { devUserId } : {}),
  });

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" data-testid="groups-list-page">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-cinzel bg-gradient-to-r from-amber-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              🌌 Grupos da Comunidade
            </h1>
            <p className="text-sm text-slate-400 font-raleway mt-1">
              Sub-comunidades focadas em cada tradição espiritual
            </p>
          </div>
          <Link href="/groups/new">
            <Button
              className="bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white border-0"
              data-testid="create-group-button"
            >
              <Plus className="w-4 h-4 mr-2" /> Criar grupo
            </Button>
          </Link>
        </header>

        {/* Filters */}
        <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
          <CardContent className="pt-4 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por nome, descrição ou tradição..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="groups-search-input"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-amber-500/50 text-sm text-slate-200 placeholder-slate-500 outline-none"
                aria-label="Buscar grupos"
              />
            </div>

            {/* Filter row */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Tradição */}
              <label className="flex items-center gap-1.5 text-xs text-slate-400">
                <Hash className="w-3 h-3" />
                <span>Tradição:</span>
                <select
                  value={tradition}
                  onChange={(e) => setTradition(e.target.value)}
                  data-testid="groups-tradition-filter"
                  className="bg-slate-800/40 border border-slate-700/40 rounded-md px-2 py-1 text-xs text-slate-200 focus:border-amber-500/50 focus:outline-none"
                >
                  {TRADITION_FILTERS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              {/* Mine */}
              <button
                type="button"
                onClick={() => setMine(!mine)}
                data-testid="groups-mine-filter"
                aria-pressed={mine}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs transition-all',
                  mine
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-slate-700/30'
                )}
              >
                <Users className="w-3 h-3" />
                Meus grupos
              </button>

              {(tradition || mine || search) && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setTradition('');
                    setMine(false);
                    setSearch('');
                    setDebouncedSearch('');
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200"
                  data-testid="groups-clear-filters"
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {loading && groups.length === 0 && (
          <div
            className="flex justify-center py-12"
            data-testid="groups-loading"
          >
            <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && groups.length === 0 && (
          <Card className="card-spiritual bg-red-500/10 border-red-500/30">
            <CardContent className="py-6 text-center space-y-2">
              <p className="text-sm text-red-300">
                Não foi possível carregar os grupos: {error}
              </p>
              <Button size="sm" variant="outline" onClick={refresh}>
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty */}
        {!loading && !error && groups.length === 0 && (
          <Card className="card-spiritual bg-slate-900/50 border-slate-800/50">
            <CardContent className="py-12 text-center space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-slate-500" />
              <p className="text-sm text-slate-300">Nenhum grupo encontrado.</p>
              <p className="text-xs text-slate-500">
                {mine
                  ? 'Você ainda não participa de nenhum grupo.'
                  : 'Tente outra tradição ou busca.'}
              </p>
              {mine && (
                <Link href="/groups">
                  <Button size="sm" variant="outline" className="mt-2">
                    Ver todos os grupos
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Grid */}
        {groups.length > 0 && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            data-testid="groups-grid"
          >
            {groups.map((g) => (
              <GroupCard key={g.id} group={g} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// GROUP CARD
// ============================================================

function GroupCard({ group }: { group: GroupDto }) {
  const colorClass =
    TRADITION_COLOR[group.tradition] ||
    'from-slate-500/20 to-slate-500/20 border-slate-500/30 hover:border-slate-500/60';
  const emoji = TRADITION_EMOJI[group.tradition] || '🌌';

  return (
    <Link
      href={`/groups/${group.slug}`}
      data-testid={`group-card-${group.slug}`}
      className="block group"
    >
      <Card
        className={cn(
          'card-spiritual bg-gradient-to-br border transition-all h-full',
          colorClass
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-xl bg-slate-950/40 border border-slate-800/50 flex items-center justify-center text-2xl flex-shrink-0">
                {group.iconUrl ? (
                  <Image
                    src={group.iconUrl}
                    alt={group.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover rounded-xl"
                    loading="lazy"
                    sizes="48px"
                  />
                ) : (
                  emoji
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-100 truncate group-hover:text-amber-300 transition-colors">
                  {group.name}
                </h3>
                <p className="text-xs text-slate-500 truncate">
                  {group.tradition}
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] border-slate-700 text-slate-500 flex-shrink-0"
            >
              {group.isPublic ? (
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

        <CardContent className="pt-0 space-y-3">
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
            {group.description}
          </p>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/50">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {group.membersCount} membros
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {group.postsCount} posts
            </span>
            {group.isMember && (
              <Badge
                variant="outline"
                className="text-[10px] border-amber-500/40 text-amber-300"
              >
                membro
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
