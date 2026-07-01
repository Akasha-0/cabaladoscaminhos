// ============================================================================
// /admin/funnels — Funnel analytics (Wave 38, 2026-07-01)
// ============================================================================
// Predefined funnels + custom funnel builder (sandbox only for custom).
// Conversion rates per step, time-to-conversion, drop-off reasons.
// ============================================================================

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin/session';
import { AdminNav } from '@/components/admin/AdminNav';
import { FunnelsClient } from './FunnelsClient';

export const metadata: Metadata = {
  title: 'Admin · Funis · Cabala dos Caminhos',
  robots: { index: false, follow: false },
  description: 'Análise de funis com conversion rates, time-to-conversion e drop-off.',
};

export const dynamic = 'force-dynamic';

const PREDEFINED_FUNNELS = [
  { id: 'ACQUISITION', name: 'Aquisição (Visitor → Signup)' },
  { id: 'ACTIVATION', name: 'Ativação (Signup → First Post)' },
  { id: 'ENGAGEMENT', name: 'Engajamento (First Post → Akasha)' },
  { id: 'MONETIZATION', name: 'Monetização (Akasha → Marketplace)' },
  { id: 'RETENTION', name: 'Retenção (Booking → Repeat)' },
];

const CUSTOM_BUILDER_SCHEMA = {
  events: [
    'page_viewed',
    'funnel_cta_click',
    'user_signed_up',
    'onboarding_completed',
    'post_created',
    'post_liked',
    'feed_viewed',
    'akashic_chat_opened',
    'akashic_message_sent',
    'marketplace_listing_viewed',
    'marketplace_purchase_intent',
  ],
};

export default async function FunnelsPage() {
  const session = await requireAdmin();
  if (!session.ok) {
    if (process.env.NODE_ENV === 'production') redirect('/');
  }

  return (
    <div className="space-y-6">
      <AdminNav />
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Funis</h1>
          <p className="text-sm text-slate-400">
            Conversion rates por etapa + tempo até conversão + motivos de drop-off.
          </p>
        </div>
        <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
          5 funis pré-definidos
        </span>
      </header>

      <FunnelsClient
        predefined={PREDEFINED_FUNNELS}
        schema={CUSTOM_BUILDER_SCHEMA}
      />
    </div>
  );
}