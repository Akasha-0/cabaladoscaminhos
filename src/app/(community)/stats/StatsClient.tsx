// ============================================================================
// StatsClient — UI self-service analytics (Wave 34)
// ============================================================================
// Carrega dados via `/api/me/stats` (server endpoint). Mostra contagens,
// breakdowns, gráfico de streak e engagement score (0..100).
// ============================================================================

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

interface StatsData {
  posts: { count: number; likes: number; commentsReceived: number };
  comments: { count: number; likesReceived: number };
  akasha: { conversations: number; messagesSent: number; messagesReceived: number };
  marketplace: { sales: number; purchases: number; revenueCents: number };
  library: { articlesBookmarked: number; articlesRead: number };
  groups: { joined: number; created: number };
  events: { joined: number; created: number };
  reputation: { points: number; level: string };
  traditions: Record<string, number>;
  streak: { current: number; longest: number; history: Array<{ date: string; active: boolean }> };
  engagement: { score: number; rank: string; percentile: number };
  /** Periodo coberto. */
  periodStart: string;
  periodEnd: string;
  isDemoMode: boolean;
}

export function StatsClient({ userId, userName }: { userId: string; userName: string }) {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/me/stats`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as StatsData;
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'erro desconhecido');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 text-center text-slate-400">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-500" />
        <p className="mt-3 text-sm">Carregando suas estatísticas…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="rounded-lg border border-red-800 bg-red-900/20 p-4 text-sm text-red-200">
          Não foi possível carregar suas estatísticas ({error}). Tente novamente mais tarde.
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-100">Minhas estatísticas</h1>
        <p className="text-sm text-slate-400">
          Olá, {userName}! Resumo da sua jornada em {new Date(data.periodStart).toLocaleDateString('pt-BR')} →{' '}
          {new Date(data.periodEnd).toLocaleDateString('pt-BR')}.
        </p>
        {data.isDemoMode && (
          <p className="mt-2 inline-block rounded bg-amber-500/10 px-2 py-1 text-xs text-amber-200">
            Demo mode — esses números são ilustrativos.
          </p>
        )}
      </header>

      {/* Engagement score */}
      <EngagementScoreCard score={data.engagement} />

      {/* Streak */}
      <StreakCard streak={data.streak} />

      {/* Grid: 5 stat cards */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <StatTile label="Posts" value={data.posts.count} subValue={`${data.posts.likes} ❤️ · ${data.posts.commentsReceived} 💬`} icon="📝" />
        <StatTile label="Comentários" value={data.comments.count} subValue={`${data.comments.likesReceived} ❤️`} icon="💬" />
        <StatTile label="Akasha IA" value={data.akasha.conversations} subValue={`${data.akasha.messagesSent} msgs enviadas`} icon="🪶" />
        <StatTile label="Marketplace" value={data.marketplace.sales} subValue={`R$ ${(data.marketplace.revenueCents / 100).toFixed(2)}`} icon="🛒" />
        <StatTile label="Reputação" value={data.reputation.points} subValue={data.reputation.level} icon="⭐" />
      </section>

      {/* Library + Groups + Events */}
      <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <SmallTile title="Biblioteca" items={[
          { label: 'Artigos salvos', value: data.library.articlesBookmarked },
          { label: 'Artigos lidos', value: data.library.articlesRead },
        ]} icon="📚" />
        <SmallTile title="Grupos" items={[
          { label: 'Membro de', value: data.groups.joined },
          { label: 'Criados', value: data.groups.created },
        ]} icon="👥" />
        <SmallTile title="Eventos" items={[
          { label: 'Participou', value: data.events.joined },
          { label: 'Organizou', value: data.events.created },
        ]} icon="🎉" />
      </section>

      {/* Tradições */}
      <TraditionsBreakdown traditions={data.traditions} />

      {/* Quick links */}
      <footer className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-400">
        <p className="mb-2 font-semibold text-slate-200">Aprofundar</p>
        <ul className="space-y-1">
          <li>
            • Explore a <Link href="/community/feed" className="text-cyan-400 hover:underline">comunidade</Link> para aumentar seu engajamento.
          </li>
          <li>
            • Visite a <Link href="/library" className="text-cyan-400 hover:underline">biblioteca</Link> para acumular pontos de leitura.
          </li>
          <li>
            • Converse com a <Link href="/akashic" className="text-cyan-400 hover:underline">Akasha IA</Link> — preditor #1 de retenção.
          </li>
        </ul>
      </footer>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function EngagementScoreCard({ score }: { score: StatsData['engagement'] }) {
  const color = score.score >= 70 ? 'text-emerald-300' : score.score >= 40 ? 'text-yellow-300' : 'text-slate-400';
  return (
    <section className="rounded-lg border border-slate-800 bg-gradient-to-br from-cyan-900/30 to-slate-900 p-6">
      <div className="flex items-baseline justify-between">
        <p className="text-xs uppercase tracking-wider text-slate-400">Engagement score</p>
        <p className="text-xs text-slate-500">Top {100 - score.percentile}%</p>
      </div>
      <p className={`mt-2 text-5xl font-bold ${color}`}>{score.score}<span className="text-2xl text-slate-500">/100</span></p>
      <p className="mt-1 text-sm text-slate-300">{score.rank}</p>
    </section>
  );
}

function StreakCard({ streak }: { streak: StatsData['streak'] }) {
  const last30 = streak.history.slice(-30);
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <header className="mb-2 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Streak</h2>
        <span className="text-xs text-slate-500">recorde: {streak.longest} dias</span>
      </header>
      <div className="flex items-baseline gap-3">
        <p className="text-4xl font-bold text-orange-300">🔥 {streak.current}</p>
        <p className="text-sm text-slate-400">dias consecutivos ativos</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-0.5">
        {last30.map((d, i) => (
          <span
            key={i}
            className={`h-4 w-4 rounded-sm ${d.active ? 'bg-orange-400' : 'bg-slate-700'}`}
            title={`${d.date}: ${d.active ? 'ativo' : 'inativo'}`}
          />
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500">Últimos 30 dias.</p>
    </section>
  );
}

function StatTile({ label, value, subValue, icon }: { label: string; value: number; subValue: string; icon: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xl" aria-hidden>{icon}</span>
        <p className="text-xs uppercase text-slate-400">{label}</p>
      </div>
      <p className="text-2xl font-bold text-slate-100">{value}</p>
      <p className="text-xs text-slate-500">{subValue}</p>
    </div>
  );
}

function SmallTile({ title, items, icon }: { title: string; items: Array<{ label: string; value: number }>; icon: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg" aria-hidden>{icon}</span>
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
      </div>
      <ul className="space-y-1 text-sm">
        {items.map((it) => (
          <li key={it.label} className="flex items-center justify-between text-slate-300">
            <span className="text-xs text-slate-400">{it.label}</span>
            <span className="font-mono font-bold text-slate-100">{it.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TraditionsBreakdown({ traditions }: { traditions: Record<string, number> }) {
  const total = Object.values(traditions).reduce((a, b) => a + b, 0);
  const sorted = useMemo(
    () => Object.entries(traditions).sort(([, a], [, b]) => b - a),
    [traditions]
  );
  if (total === 0) {
    return (
      <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-400">
        Você ainda não definiu suas tradições preferidas.{' '}
        <Link href="/settings/profile" className="text-cyan-400 hover:underline">Definir agora</Link>.
      </section>
    );
  }
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <h2 className="mb-3 text-lg font-semibold text-slate-100">Suas tradições</h2>
      <div className="space-y-2">
        {sorted.map(([name, count]) => {
          const pct = (count / total) * 100;
          return (
            <div key={name}>
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-slate-200">{name}</span>
                <span className="font-mono text-slate-400">{pct.toFixed(1)}%</span>
              </div>
              <div className="mt-1 h-2 rounded bg-slate-800">
                <div
                  className="h-2 rounded bg-gradient-to-r from-amber-500 to-amber-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
