// ============================================================================
// DASHBOARD — /dashboard/transactions (Wave 30)
// ============================================================================
// Lista de transações e repasses do reader.
// ============================================================================

import { TransactionHistory } from '@/components/marketplace/TransactionHistory';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Minhas transações — Akasha',
  description: 'Histórico financeiro de leituras e mentorias.',
};

export default function DashboardTransactionsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <TransactionHistory />
    </main>
  );
}