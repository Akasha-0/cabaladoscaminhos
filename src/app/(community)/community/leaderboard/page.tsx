// ============================================================================
// /community/leaderboard — Página pública de Reconhecimento Universalista
// ============================================================================
// Server Component. Reads the leaderboard data at request time, renders the
// table + a top-10 widget. Force-dynamic (no static caching) because the
// leaderboard is a moving target — sacred-cultural data, not marketing
// copy.
//
// Sacred-cultural compliance:
//   - All 5 traditions render with verbatim PT-BR labels
//   - Positive framing: "Reconhecimento", "Contribuição", "Universalista"
//   - No negative-binding vocabulary (see W91 engine spec for the policy)
//
// Accessibility:
//   - Skip-friendly heading hierarchy (h1 → h2)
//   - <main> focus target via CommunityShell (cycle 11 layout)
//   - ARIA region wrapping the page intro
// ============================================================================

import React from 'react';
import { LeaderboardWidget } from '@/components/community/leaderboard/LeaderboardWidget';
import { LeaderboardTable } from '@/components/community/leaderboard/LeaderboardTable';
import { Sparkles, ScrollText } from 'lucide-react';
import {
  asUserId,
  asDisplayName,
  type LeaderboardEntry,
  type TraditionId,
} from '@/lib/w91/reputation-leaderboard-engine';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type TraditionKey =
  | 'candomble'
  | 'umbanda'
  | 'ifa'
  | 'cabala'
  | 'astrologia';

interface LeaderboardEntryDto {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  primaryTradition: TraditionKey;
  traditionsActive: ReadonlyArray<TraditionKey>;
  metrics: {
    posts: number;
    helpfulReactions: number;
    crossTraditionReads: number;
    mentorshipGiven: number;
  };
}

/**
 * Adapter: DTO → engine LeaderboardEntry. Branded types are applied here
 * (cycle 90 lesson: branded types need explicit casts).
 */
function dtoToEntry(dto: LeaderboardEntryDto): LeaderboardEntry {
  return {
    userId: asUserId(dto.userId),
    displayName: asDisplayName(dto.displayName),
    avatarUrl: dto.avatarUrl,
    primaryTradition: dto.primaryTradition,
    traditionsActive: Object.freeze([...dto.traditionsActive]) as ReadonlyArray<TraditionId>,
    metrics: Object.freeze({ ...dto.metrics }),
  };
}

/**
 * Server-side data fetch. Cycles 89/90s used the in-process API; for W91-B
 * we keep the same shape but mark this as the integration seam for the
 * real /api/community/leaderboard endpoint that ships in a follow-up.
 *
 * No Date.now() in pure logic — the timestamp is supplied by caller.
 */
async function loadLeaderboardEntries(): Promise<
  ReadonlyArray<LeaderboardEntryDto>
> {
  // Placeholder seed data — replaced in cycle 92 by the real Prisma query.
  // The data is intentionally heterogeneous across the 5 traditions so the
  // table exercises all badge styles.
  const seed: ReadonlyArray<LeaderboardEntryDto> = Object.freeze([
    {
      userId: 'u_mestra_oba',
      displayName: 'Mestra Obá',
      avatarUrl: null,
      primaryTradition: 'candomble',
      traditionsActive: Object.freeze([
        'candomble',
        'umbanda',
        'ifa',
      ]) as ReadonlyArray<LeaderboardEntryDto['primaryTradition']>,
      metrics: Object.freeze({
        posts: 84,
        helpfulReactions: 312,
        crossTraditionReads: 142,
        mentorshipGiven: 28,
      }),
    },
    {
      userId: 'u_ravi_cabala',
      displayName: 'Ravi Cohen',
      avatarUrl: null,
      primaryTradition: 'cabala',
      traditionsActive: Object.freeze([
        'cabala',
        'astrologia',
      ]) as ReadonlyArray<LeaderboardEntryDto['primaryTradition']>,
      metrics: Object.freeze({
        posts: 56,
        helpfulReactions: 198,
        crossTraditionReads: 240,
        mentorshipGiven: 12,
      }),
    },
    {
      userId: 'u_iala_umbanda',
      displayName: 'Ialá do Cruzeiro',
      avatarUrl: null,
      primaryTradition: 'umbanda',
      traditionsActive: Object.freeze([
        'umbanda',
        'candomble',
        'astrologia',
      ]) as ReadonlyArray<LeaderboardEntryDto['primaryTradition']>,
      metrics: Object.freeze({
        posts: 102,
        helpfulReactions: 421,
        crossTraditionReads: 96,
        mentorshipGiven: 19,
      }),
    },
    {
      userId: 'u_babaifa',
      displayName: 'Babalaô Ifatunde',
      avatarUrl: null,
      primaryTradition: 'ifa',
      traditionsActive: Object.freeze(['ifa']) as ReadonlyArray<
        LeaderboardEntryDto['primaryTradition']
      >,
      metrics: Object.freeze({
        posts: 64,
        helpfulReactions: 256,
        crossTraditionReads: 88,
        mentorshipGiven: 41,
      }),
    },
    {
      userId: 'u_paula_astros',
      displayName: 'Paula Estrela',
      avatarUrl: null,
      primaryTradition: 'astrologia',
      traditionsActive: Object.freeze([
        'astrologia',
        'cabala',
        'candomble',
        'umbanda',
        'ifa',
      ]) as ReadonlyArray<LeaderboardEntryDto['primaryTradition']>,
      metrics: Object.freeze({
        posts: 71,
        helpfulReactions: 188,
        crossTraditionReads: 312,
        mentorshipGiven: 9,
      }),
    },
    {
      userId: 'u_kira_cabala',
      displayName: 'Kira Lumiar',
      avatarUrl: null,
      primaryTradition: 'cabala',
      traditionsActive: Object.freeze(['cabala', 'astrologia']) as ReadonlyArray<
        LeaderboardEntryDto['primaryTradition']
      >,
      metrics: Object.freeze({
        posts: 39,
        helpfulReactions: 142,
        crossTraditionReads: 187,
        mentorshipGiven: 6,
      }),
    },
    {
      userId: 'u_ogum_umbanda',
      displayName: 'Ogum Beira-Mar',
      avatarUrl: null,
      primaryTradition: 'umbanda',
      traditionsActive: Object.freeze(['umbanda', 'candomble']) as ReadonlyArray<
        LeaderboardEntryDto['primaryTradition']
      >,
      metrics: Object.freeze({
        posts: 47,
        helpfulReactions: 121,
        crossTraditionReads: 73,
        mentorshipGiven: 11,
      }),
    },
    {
      userId: 'u_oya_ifa',
      displayName: 'Oyá Ventania',
      avatarUrl: null,
      primaryTradition: 'ifa',
      traditionsActive: Object.freeze(['ifa', 'candomble', 'umbanda']) as ReadonlyArray<
        LeaderboardEntryDto['primaryTradition']
      >,
      metrics: Object.freeze({
        posts: 58,
        helpfulReactions: 165,
        crossTraditionReads: 119,
        mentorshipGiven: 14,
      }),
    },
    {
      userId: 'u_moises_astros',
      displayName: 'Moisés Cordeiro',
      avatarUrl: null,
      primaryTradition: 'astrologia',
      traditionsActive: Object.freeze(['astrologia']) as ReadonlyArray<
        LeaderboardEntryDto['primaryTradition']
      >,
      metrics: Object.freeze({
        posts: 28,
        helpfulReactions: 87,
        crossTraditionReads: 142,
        mentorshipGiven: 4,
      }),
    },
    {
      userId: 'u_ze_caboclo',
      displayName: 'Zé do Caboclo',
      avatarUrl: null,
      primaryTradition: 'candomble',
      traditionsActive: Object.freeze(['candomble', 'umbanda']) as ReadonlyArray<
        LeaderboardEntryDto['primaryTradition']
      >,
      metrics: Object.freeze({
        posts: 33,
        helpfulReactions: 96,
        crossTraditionReads: 41,
        mentorshipGiven: 7,
      }),
    },
  ]) as ReadonlyArray<LeaderboardEntryDto>;

  // Simulate async — real fetch in follow-up.
  return Promise.resolve(seed);
}

export default async function LeaderboardPage() {
  const dtos = await loadLeaderboardEntries();
  const entries: ReadonlyArray<LeaderboardEntry> = Object.freeze(
    dtos.map(dtoToEntry)
  ) as ReadonlyArray<LeaderboardEntry>;
  const generatedAt = new Date().toISOString();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-full sm:max-w-5xl mx-auto px-4 py-6 sm:py-10 space-y-6">
        {/* Header */}
        <header
          role="region"
          aria-label="Cabeçalho do reconhecimento universalista"
          className="space-y-2"
        >
          <div className="flex items-center gap-2 text-amber-300">
            <Sparkles className="w-5 h-5" aria-hidden="true" />
            <span className="text-xs uppercase tracking-wider">Cigano · Candomblé · Umbanda · Ifá · Cabala · Astrologia</span>
          </div>
          <h1
            data-testid="leaderboard-page-title"
            className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-300 via-violet-300 to-sky-300 bg-clip-text text-transparent"
          >
            Reconhecimento universalista
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Celebramos as contribuições que atravessam as cinco tradições da
            casa. Mérito é construído com presença, generosidade e curiosidade —
            <span className="text-slate-400"> nunca em disputa entre caminhos.</span>
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
            <ScrollText className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Atualizado em {formatPtBr(generatedAt)}</span>
          </div>
        </header>

        {/* Top-10 widget */}
        <section aria-label="Top 10 contribuições">
          <h2 className="sr-only">Top 10 contribuições universalistas</h2>
          <LeaderboardWidget entries={entries} top={10} />
        </section>

        {/* Full sortable table */}
        <section aria-label="Tabela completa de reconhecimento">
          <h2 className="text-lg font-semibold text-slate-100 mb-3">
            Classificação completa
          </h2>
          <LeaderboardTable
            entries={entries}
            initialPageSize={20}
            generatedAt={generatedAt}
          />
        </section>

        {/* Methodology footnote */}
        <footer
          role="contentinfo"
          aria-label="Metodologia do reconhecimento universalista"
          className="border-t border-slate-800/60 pt-4 mt-8 text-xs text-slate-400 max-w-2xl space-y-2"
        >
          <p>
            <strong className="text-slate-200">Como calculamos o mérito universalista</strong>
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Cada post publicado soma 1 ponto</li>
            <li>Cada reação útil recebida soma 2 pontos</li>
            <li>Cada leitura cruzada entre tradições soma 3 pontos</li>
            <li>Cada mentoria oferecida soma 5 pontos</li>
            <li>Bônus de +3 por tradição adicional além da principal</li>
          </ul>
          <p className="pt-1 text-slate-500">
            Os dados são públicos e respeitam a LGPD. Você pode solicitar a
            remoção da sua conta da listagem a qualquer momento.
          </p>
        </footer>
      </div>
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function formatPtBr(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}