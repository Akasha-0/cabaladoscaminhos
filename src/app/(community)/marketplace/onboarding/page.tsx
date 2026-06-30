// ============================================================================
// MARKETPLACE — /marketplace/onboarding (Wave 30)
// ============================================================================
// Página onde o reader conecta sua conta Stripe Connect.
// Mobile-first. Server component que faz prefetch + passa para client.
// ============================================================================

import { ReaderOnboarding } from '@/components/marketplace/ReaderOnboarding';
import { getReaderConnectStatus } from '@/lib/payments/marketplace-service';
import { getViewer } from '@/lib/community/auth';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Conectar conta Stripe — Akasha',
  description:
    'Conecte sua conta Stripe para receber pagamentos por leituras e mentorias.',
};

export default async function MarketplaceOnboardingPage() {
  const viewer = await getViewer();
  // Default status para usuários não logados
  let initialStatus:
    | {
        onboarded: boolean;
        chargesEnabled: boolean;
        payoutsEnabled: boolean;
        detailsSubmitted: boolean;
        requirements: {
          currentlyDue: string[];
          pastDue: string[];
          pendingVerification: string[];
        };
      }
    | undefined;
  if (viewer) {
    const status = await getReaderConnectStatus(viewer.id).catch(() => null);
    if (status) {
      initialStatus = {
        onboarded: true,
        chargesEnabled: status.chargesEnabled,
        payoutsEnabled: status.payoutsEnabled,
        detailsSubmitted: status.detailsSubmitted,
        requirements: status.requirements,
      };
    } else {
      initialStatus = {
        onboarded: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
        requirements: {
          currentlyDue: [],
          pastDue: [],
          pendingVerification: [],
        },
      };
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12 px-4">
      <ReaderOnboarding
        readerId={viewer?.id ?? 'anonymous'}
        initialStatus={initialStatus}
      />
    </main>
  );
}