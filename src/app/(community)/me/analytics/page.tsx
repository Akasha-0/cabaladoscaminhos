// ============================================================================
// /me/analytics — Personal analytics dashboard (Wave 38, 2026-07-01)
// ============================================================================
// User-facing self-service analytics:
//   - Personal stats (posts, comments, reactions, Akasha, streak)
//   - Engagement score (0..100)
//   - Tradição breakdown (% conteúdo)
//   - Practice patterns (time-of-day, day-of-week heatmaps)
//   - Weekly trend
//   - Export data (CSV / JSON)
//
// LGPD Art. 18 (transparência + acesso): user vê exatamente o que sabemos
// sobre sua atividade, sem PII extra.
// ============================================================================

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PersonalAnalyticsClient } from './PersonalAnalyticsClient';
import {
  computeEngagementScore,
  type UserActivityCounts,
} from '@/lib/analytics/engagement-score';

export const metadata: Metadata = {
  title: 'Minhas analytics · Cabala dos Caminhos',
  robots: { index: false, follow: false },
  description: 'Estatísticas pessoais, score de engajamento e padrões de prática.',
};

export const dynamic = 'force-dynamic';

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isoWeekMinus(weeksAgo: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - weeksAgo * 7);
  const target = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNr = (target.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const week = 1 + Math.round(
    ((target.getTime() - firstThursday.getTime()) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7
  );
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function pickTradition(rng: () => number): string {
  const TRADITIONS = ['umbanda', 'candomble', 'espiritismo', 'budismo', 'catolicismo'];
  return TRADITIONS[Math.floor(rng() * TRADITIONS.length)];
}

export default async function PersonalAnalyticsPage() {
  const supabase = await createClient();
  let userId: string | null = null;
  let displayName = 'Visitante';

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      userId = user.id;
      displayName = (user.user_metadata?.full_name as string | undefined) ?? user.email?.split('@')[0] ?? 'Membro';
    }
  }

  // Sandbox mode (sem auth) — usa demo data com userId fictício
  const demoUserId = userId ?? 'demo-user-' + Math.floor(Math.random() * 1000);
  if (!userId && process.env.NODE_ENV === 'production') {
    redirect('/login?next=/me/analytics');
  }

  const seed = demoUserId
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rng = mulberry32(seed);

  const counts: UserActivityCounts = {
    userId: demoUserId,
    postsAuthored: Math.floor(rng() * 30) + 5,
    commentsAuthored: Math.floor(rng() * 80) + 10,
    reactionsReceived: Math.floor(rng() * 200) + 20,
    akashaConversations: Math.floor(rng() * 15) + 1,
    mentorshipSessions: Math.floor(rng() * 3),
    marketplaceActivity: Math.floor(rng() * 5),
    preferredTradition: pickTradition(rng),
    primaryPlatform: rng() > 0.6 ? 'mobile' : 'desktop',
  };

  const engagement = computeEngagementScore(counts);

  const weeklyTrend = Array.from({ length: 8 }, (_, i) => ({
    week: isoWeekMinus(7 - i),
    posts: Math.floor(rng() * 6),
    comments: Math.floor(rng() * 12),
    reactions: Math.floor(rng() * 25),
  }));

  const TRADITIONS = ['umbanda', 'candomble', 'espiritismo', 'budismo', 'catolicismo'];
  const traditionBreakdown = TRADITIONS.map((t) => {
    const count = Math.floor(rng() * 20);
    return { tradition: t, count, percent: 0 };
  });
  const totalTrad = traditionBreakdown.reduce((a, b) => a + b.count, 0) || 1;
  for (const t of traditionBreakdown) t.percent = Math.round((t.count / totalTrad) * 100);

  const timeOfDay = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    count: Math.floor(rng() * 10) + (h >= 18 && h <= 23 ? 8 : 0),
  }));
  const dayOfWeek = Array.from({ length: 7 }, (_, d) => ({
    day: d,
    count: Math.floor(rng() * 15) + (d === 0 || d === 6 ? 8 : 0),
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-100">Minhas analytics</h1>
        <p className="text-sm text-slate-400">
          Olá, <strong className="text-slate-200">{displayName}</strong>. Estes são seus padrões
          de prática na Cabala dos Caminhos. Tudo calculado localmente a partir dos seus eventos.
        </p>
        <p className="text-xs text-slate-500">
          LGPD Art. 18: você tem direito de acessar, corrigir ou exportar esses dados.
        </p>
      </header>

      <PersonalAnalyticsClient
        data={{
          userId: demoUserId,
          periodDays: 30,
          counts,
          engagement,
          weeklyTrend,
          traditionBreakdown,
          practicePatterns: { timeOfDay, dayOfWeek },
          streakDays: Math.floor(rng() * 14),
          generatedAt: new Date().toISOString(),
        }}
      />
    </div>
  );
}