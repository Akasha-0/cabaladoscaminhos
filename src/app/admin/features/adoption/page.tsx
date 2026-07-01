// ============================================================================
// /admin/features/adoption — Feature adoption (Wave 38, 2026-07-01)
// ============================================================================
// DAU/MAU, time-to-first-use, retention, power users, tradição + platform.
// ============================================================================

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin/session';
import { AdminNav } from '@/components/admin/AdminNav';
import { FeatureAdoptionClient } from './FeatureAdoptionClient';

export const metadata: Metadata = {
  title: 'Admin · Feature adoption · Cabala dos Caminhos',
  robots: { index: false, follow: false },
  description: 'Per-feature usage stats: DAU/MAU, time-to-first-use, retention, power users.',
};

export const dynamic = 'force-dynamic';

const FEATURES = [
  { id: 'feed', label: 'Feed' },
  { id: 'akasha', label: 'Akasha IA' },
  { id: 'library', label: 'Biblioteca' },
  { id: 'events', label: 'Eventos' },
  { id: 'mentorship', label: 'Mentoria' },
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'groups', label: 'Grupos' },
  { id: 'oraculo', label: 'Oráculo' },
  { id: 'notifications', label: 'Notificações' },
];

export default async function FeatureAdoptionPage() {
  const session = await requireAdmin();
  if (!session.ok) {
    if (process.env.NODE_ENV === 'production') redirect('/');
  }
  return (
    <div className="space-y-6">
      <AdminNav />
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Feature adoption</h1>
          <p className="text-sm text-slate-400">
            DAU/MAU, time-to-first-use, retenção e power users por feature.
          </p>
        </div>
        <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
          {FEATURES.length} features monitoradas
        </span>
      </header>
      <FeatureAdoptionClient features={FEATURES} />
    </div>
  );
}