// ============================================================================
// /stats — Self-service analytics do usuário (Wave 34, 2026-07-01)
// ============================================================================
// Página privada (requer login) com estatísticas pessoais:
//   - Posts criados / curtidas recebidas
//   - Comentários feitos
//   - Conversas com Akasha IA
//   - Marketplace sales
//   - Streak (dias consecutivos)
//   - Engagement score (0..100)
//   - Breakdown por tradição preferida
//
// LGPD: stats são do próprio user (consentimento implícito ao usar o app).
// ============================================================================

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { StatsClient } from './StatsClient';

export const metadata: Metadata = {
  title: 'Minhas estatísticas · Cabala dos Caminhos',
  robots: { index: false, follow: false },
  description: 'Estatísticas privadas da sua jornada espiritual: posts, conversas Akasha, tradições e engajamento.',
};

export const dynamic = 'force-dynamic';

export default async function StatsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/stats');
  }

  return <StatsClient userId={session.user.id} userName={session.user.name ?? 'você'} />;
}
