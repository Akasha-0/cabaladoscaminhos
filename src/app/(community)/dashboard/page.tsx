'use client';

// ============================================================================
// DASHBOARD — /dashboard
// ============================================================================
// Painel pessoal do membro autenticado. Mostra:
//   - 4 KPI cards (posts, likes recebidos, comments, followers)
//   - Chart de atividade nos últimos 30 dias (SVG inline)
//   - "Continue de onde parou" — último post lido
//   - Sugestões: pessoas que você talvez conheça
//   - Posts populares em suas tradições
//
// Dados vêm de:
//   - /api/users/me        → perfil + contadores
//   - /api/users/me/history → último lido
//   - /api/posts?popular=1 → top posts por tradição
//   - /api/users/suggested → sugestões (gracefully degrada se 404)
//
// Se o viewer não está autenticado, redireciona para /login.
// ============================================================================

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText, Heart, MessageCircle, UserPlus,
  BookOpen, Sparkles, TrendingUp, Users,
  ArrowRight, Loader2, AlertTriangle, Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

// ============================================================
// TYPES
// ============================================================

interface DashboardStats {
  postsCount: number;
  likesReceived: number;
  commentsReceived: number;
  followersCount: number;
}

interface ActivityDay {
  date: string; // YYYY-MM-DD
  count: number;
}

interface LastRead {
  postId: string;
  postTitle: string | null;
  excerpt: string | null;
  readAt: string;
}

interface SuggestedUser {
  id: string;
  handle: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  tradition: string | null;
  mutuals: number;
}

interface PopularPost {
  id: string;
  authorId: string;
  authorName: string;
  authorTradition: string | null;
  content: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

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

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityDay[]>([]);
  const [lastRead, setLastRead] = useState<LastRead | null>(null);
  const [suggested, setSuggested] = useState<SuggestedUser[]>([]);
  const [popular, setPopular] = useState<PopularPost[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth redirect — defesa em profundidade, layout (community) já lida
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirectTo=/dashboard');
    }
  }, [authLoading, user, router]);

  // Stats + activity
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function loadStats() {
      try {
        const res = await fetch('/api/users/me/stats', {
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`stats ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setStats(data.stats ?? null);
        setActivity(Array.isArray(data.activity) ? data.activity : []);
      } catch (err) {
        if (cancelled) return;
        // Graceful degradation — não bloqueia o resto do dashboard
         
        console.warn('[dashboard] stats falhou:', err);
        setStats({
          postsCount: 0,
          likesReceived: 0,
          commentsReceived: 0,
          followersCount: 0,
        });
        setActivity(buildEmptyActivity(30));
      }
    }

    void loadStats();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Last read (history)
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function loadLastRead() {
      try {
        const res = await fetch('/api/users/me/history?limit=1', {
          credentials: 'include',
        });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const items = Array.isArray(data.items) ? data.items : [];
        setLastRead(items[0] ?? null);
      } catch {
        // silent
      }
    }

    void loadLastRead();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Suggested users
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function loadSuggested() {
      try {
        const res = await fetch('/api/users/suggested?limit=6', {
          credentials: 'include',
        });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setSuggested(Array.isArray(data.items) ? data.items : []);
      } catch {
        // silent — feature opcional
      }
    }

    void loadSuggested();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Popular posts
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function loadPopular() {
      try {
        const res = await fetch('/api/posts?sort=popular&limit=5', {
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`posts ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setPopular(Array.isArray(data.items) ? data.items : []);
      } catch (err) {
        if (cancelled) return;
         
        console.warn('[dashboard] popular falhou:', err);
        setPopular([]);
      }
    }

    void loadPopular();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Mark dashboard as ready quando o primeiro batch terminar
  useEffect(() => {
    if (user && stats !== null) setLoading(false);
  }, [user, stats]);

  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    // Trigger refetch by remounting state
    setStats(null);
    setActivity([]);
    setLastRead(null);
    setSuggested([]);
    setPopular([]);
    // The other useEffects won't refire automatically, but stats will.
    // For simplicity, just reload the page on hard retry:
    if (typeof window !== 'undefined') window.location.reload();
  }, []);

  if (authLoading || !user) {
    return (
      <div
        className="min-h-[60vh] flex items-center justify-center"
        data-testid="dashboard-auth-loading"
      >
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" aria-label="Carregando" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" data-testid="dashboard-page">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-spiritual-gold font-cinzel">
            seu caminho
          </p>
          <h1 className="text-3xl md:text-4xl font-cinzel bg-gradient-to-r from-amber-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
            🌌 Dashboard Espiritual
          </h1>
          <p className="text-sm text-slate-400 font-raleway">
            Acompanhe sua jornada na comunidade
          </p>
        </header>

        {error && (
          <div
            className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 flex items-start gap-3"
            role="alert"
          >
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-sm text-red-300">{error}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="text-xs text-red-300 underline hover:text-red-200 min-h-[44px]"
              >
                Recarregar página
              </button>
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <section
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          data-testid="dashboard-kpis"
        >
          <KpiCard
            icon={<FileText className="w-5 h-5" />}
            label="Posts"
            value={stats?.postsCount ?? 0}
            color="amber"
            loading={loading}
          />
          <KpiCard
            icon={<Heart className="w-5 h-5" />}
            label="Curtidas"
            value={stats?.likesReceived ?? 0}
            color="pink"
            loading={loading}
          />
          <KpiCard
            icon={<MessageCircle className="w-5 h-5" />}
            label="Comentários"
            value={stats?.commentsReceived ?? 0}
            color="violet"
            loading={loading}
          />
          <KpiCard
            icon={<UserPlus className="w-5 h-5" />}
            label="Seguidores"
            value={stats?.followersCount ?? 0}
            color="cyan"
            loading={loading}
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          <div className="space-y-4">
            {/* Activity Chart */}
            <section
              className="rounded-xl bg-slate-900/50 border border-slate-800/50 p-5"
              data-testid="dashboard-activity"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-cinzel text-base text-slate-100 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    Atividade · últimos 30 dias
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    posts, comentários e curtidas por dia
                  </p>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  {activity.reduce((s, d) => s + d.count, 0)} ações
                </span>
              </div>
              <ActivityChart data={activity} loading={loading} />
            </section>

            {/* Continue de onde parou */}
            <section
              className="rounded-xl bg-slate-900/50 border border-slate-800/50 p-5"
              data-testid="dashboard-continue"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-cinzel text-base text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-violet-400" />
                  Continue de onde parou
                </h2>
              </div>
              {lastRead ? (
                <Link
                  href={`/post/${lastRead.postId}`}
                  className="block rounded-lg bg-slate-950/60 border border-slate-800/40 p-4 hover:border-violet-500/40 transition-colors group"
                  data-testid="dashboard-continue-link"
                >
                  <p className="text-sm font-semibold text-slate-100 group-hover:text-violet-300 line-clamp-1">
                    {lastRead.postTitle || 'Post sem título'}
                  </p>
                  {lastRead.excerpt && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {lastRead.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      lido em{' '}
                      {new Date(lastRead.readAt).toLocaleString('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </span>
                    <span className="text-violet-400 inline-flex items-center gap-1 ml-auto">
                      abrir <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ) : (
                <EmptyHint
                  icon={<BookOpen className="w-6 h-6" />}
                  title="Nenhuma leitura recente"
                  subtitle="Abra um post do feed para começar."
                  cta={{ href: '/feed', label: 'Ir para o feed' }}
                />
              )}
            </section>

            {/* Popular posts */}
            <section
              className="rounded-xl bg-slate-900/50 border border-slate-800/50 p-5"
              data-testid="dashboard-popular"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-cinzel text-base text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Populares em suas tradições
                </h2>
                <Link
                  href="/explore"
                  className="text-xs text-slate-400 hover:text-amber-300"
                >
                  ver mais →
                </Link>
              </div>
              {popular.length === 0 ? (
                <EmptyHint
                  icon={<Sparkles className="w-6 h-6" />}
                  title="Sem posts populares ainda"
                  subtitle="Em breve recomendações baseadas nas suas tradições."
                />
              ) : (
                <div className="space-y-2">
                  {popular.map((p) => (
                    <Link
                      key={p.id}
                      href={`/post/${p.id}`}
                      className="block rounded-lg bg-slate-950/60 border border-slate-800/40 p-3 hover:border-amber-500/40 transition-colors"
                      data-testid={`dashboard-popular-${p.id}`}
                    >
                      <div className="flex items-start gap-2">
                        {p.authorTradition && (
                          <span className="text-base flex-shrink-0">
                            {TRADITION_EMOJI[p.authorTradition] ?? '🌌'}
                          </span>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-200 line-clamp-2">
                            {p.content}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                            <span>@{p.authorName}</span>
                            <span>♥ {p.likesCount}</span>
                            <span>💬 {p.commentsCount}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar — sugestões */}
          <aside className="space-y-4" data-testid="dashboard-suggested">
            <section className="rounded-xl bg-slate-900/50 border border-slate-800/50 p-5">
              <h2 className="font-cinzel text-base text-slate-100 flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-cyan-400" />
                Talvez você conheça
              </h2>
              {suggested.length === 0 ? (
                <EmptyHint
                  icon={<Users className="w-6 h-6" />}
                  title="Sugestões em breve"
                  subtitle="Vamos recomendar pessoas com base nas suas tradições."
                  compact
                />
              ) : (
                <ul className="space-y-3">
                  {suggested.slice(0, 6).map((u) => (
                    <li
                      key={u.id}
                      className="flex items-center gap-3"
                      data-testid={`dashboard-suggested-${u.id}`}
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/20 to-violet-500/20 border border-slate-800/50 flex items-center justify-center text-sm flex-shrink-0">
                        {u.tradition
                          ? TRADITION_EMOJI[u.tradition] ?? '🌌'
                          : u.displayName[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/u/${u.handle}`}
                          className="text-sm text-slate-200 hover:text-amber-300 truncate block"
                        >
                          {u.displayName}
                        </Link>
                        <p className="text-xs text-slate-500 truncate">
                          {u.bio ?? `@${u.handle}`}
                          {u.mutuals > 0 && ` · ${u.mutuals} conexões`}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-xl bg-slate-900/50 border border-slate-800/50 p-5">
              <h3 className="text-sm font-cinzel text-slate-100 mb-2">
                Atalhos
              </h3>
              <ul className="space-y-1.5 text-sm">
                <li>
                  <Link
                    href="/feed"
                    className="text-slate-300 hover:text-amber-300 inline-flex items-center gap-1.5 min-h-[44px]"
                  >
                    <FileText className="w-3 h-3" /> Feed da comunidade
                  </Link>
                </li>
                <li>
                  <Link
                    href="/groups"
                    className="text-slate-300 hover:text-amber-300 inline-flex items-center gap-1.5 min-h-[44px]"
                  >
                    <Users className="w-3 h-3" /> Grupos por tradição
                  </Link>
                </li>
                <li>
                  <Link
                    href="/library"
                    className="text-slate-300 hover:text-amber-300 inline-flex items-center gap-1.5 min-h-[44px]"
                  >
                    <BookOpen className="w-3 h-3" /> Biblioteca
                  </Link>
                </li>
                <li>
                  <Link
                    href="/settings"
                    className="text-slate-300 hover:text-amber-300 inline-flex items-center gap-1.5 min-h-[44px]"
                  >
                    <Sparkles className="w-3 h-3" /> Configurações
                  </Link>
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// KPI CARD
// ============================================================

function KpiCard({
  icon,
  label,
  value,
  color,
  loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'amber' | 'pink' | 'violet' | 'cyan';
  loading: boolean;
}) {
  const colors: Record<typeof color, string> = {
    amber: 'from-amber-500/15 to-amber-500/5 border-amber-500/30 text-amber-300',
    pink: 'from-pink-500/15 to-pink-500/5 border-pink-500/30 text-pink-300',
    violet: 'from-violet-500/15 to-violet-500/5 border-violet-500/30 text-violet-300',
    cyan: 'from-cyan-500/15 to-cyan-500/5 border-cyan-500/30 text-cyan-300',
  };
  return (
    <div
      className={cn(
        'rounded-xl border bg-gradient-to-br p-4',
        colors[color]
      )}
      data-testid={`dashboard-kpi-${label.toLowerCase()}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-cinzel">
          {label}
        </span>
        <span className="opacity-70">{icon}</span>
      </div>
      {loading ? (
        <div className="mt-2 h-8 w-16 rounded skeleton" />
      ) : (
        <p className="mt-2 text-2xl md:text-3xl font-bold font-cinzel text-slate-100">
          {value.toLocaleString('pt-BR')}
        </p>
      )}
    </div>
  );
}

// ============================================================
// ACTIVITY CHART (SVG inline — sem deps externas)
// ============================================================

function ActivityChart({
  data,
  loading,
}: {
  data: ActivityDay[];
  loading: boolean;
}) {
  const max = useMemo(() => Math.max(1, ...data.map((d) => d.count)), [data]);

  if (loading) {
    return (
      <div
        className="h-32 rounded-lg skeleton"
        aria-label="Carregando gráfico"
        role="status"
      />
    );
  }

  if (data.length === 0) {
    return (
      <p className="text-xs text-slate-500 py-6 text-center">
        Sem atividade registrada nos últimos 30 dias.
      </p>
    );
  }

  const W = 600;
  const H = 120;
  const padX = 4;
  const padY = 8;
  const stepX = (W - padX * 2) / Math.max(1, data.length - 1);
  const points = data.map((d, i) => {
    const x = padX + i * stepX;
    const y = H - padY - ((d.count / max) * (H - padY * 2));
    return [x, y] as const;
  });
  const pathD = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ');
  const areaD = `${pathD} L${points[points.length - 1]?.[0]?.toFixed(1) ?? padX},${H} L${points[0]?.[0]?.toFixed(1) ?? padX},${H} Z`;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H + 20}`}
        className="w-full h-32"
        role="img"
        aria-label="Gráfico de atividade dos últimos 30 dias"
      >
        <defs>
          <linearGradient id="dash-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid */}
        <line
          x1="0"
          y1={H / 2}
          x2={W}
          y2={H / 2}
          stroke="#1e293b"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        {/* Area */}
        <path d={areaD} fill="url(#dash-area)" />
        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#fbbf24"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Dots (apenas primeiro/último) */}
        {points.length > 0 && (
          <>
            <circle
              cx={points[0]?.[0]}
              cy={points[0]?.[1]}
              r="3"
              fill="#fbbf24"
            />
            <circle
              cx={points[points.length - 1]?.[0]}
              cy={points[points.length - 1]?.[1]}
              r="3"
              fill="#fbbf24"
            />
          </>
        )}
        {/* Eixo X labels (3 marcadores) */}
        {[0, Math.floor(data.length / 2), data.length - 1].map((i) => {
          const d = data[i];
          if (!d) return null;
          return (
            <text
              key={i}
              x={points[i]?.[0] ?? 0}
              y={H + 14}
              fill="#64748b"
              fontSize="10"
              textAnchor="middle"
            >
              {new Date(d.date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
              })}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// ============================================================
// EMPTY HINT
// ============================================================

function EmptyHint({
  icon,
  title,
  subtitle,
  cta,
  compact = false,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  cta?: { href: string; label: string };
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        'text-center text-slate-400',
        compact ? 'py-4' : 'py-6'
      )}
    >
      <div className="w-10 h-10 mx-auto rounded-full bg-slate-800/50 flex items-center justify-center text-slate-500 mb-2">
        {icon}
      </div>
      <p className="text-sm text-slate-300">{title}</p>
      <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      {cta && (
        <Link
          href={cta.href}
          className="inline-block mt-3 text-xs text-amber-300 hover:text-amber-200 underline min-h-[44px] leading-[44px]"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Gera um array vazio de 30 dias (zeros) — usado quando /stats falha
 * para ainda renderizar o gráfico sem erro de runtime.
 */
function buildEmptyActivity(days: number): ActivityDay[] {
  const out: ActivityDay[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push({
      date: d.toISOString().slice(0, 10),
      count: 0,
    });
  }
  return out;
}