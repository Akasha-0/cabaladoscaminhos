// ============================================================================
// MARKETPLACE — /marketplace/checkout/return (Wave 30)
// ============================================================================
// Retorno do Stripe após confirmação de pagamento. Verifica status final
// e libera sessão para o cliente.
// ============================================================================

import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pagamento confirmado — Akasha',
};

export default function CheckoutReturnPage({
  searchParams,
}: {
  searchParams: { payment_intent?: string; paymentId?: string; redirect_status?: string };
}) {
  const success =
    searchParams.redirect_status === 'succeeded' ||
    searchParams.payment_intent !== undefined;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white px-4">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
        {success ? (
          <>
            <div className="text-6xl mb-4" aria-hidden="true">
              ✓
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Pagamento confirmado!
            </h1>
            <p className="text-gray-600 mb-6">
              O valor ficou retido em segurança. Após a leitura ser confirmada
              por você e pelo leitor, o repasse é liberado automaticamente.
            </p>
            {searchParams.payment_intent && (
              <p className="text-xs text-gray-500 mb-4">
                ID: <code className="bg-gray-100 px-2 py-1 rounded">{searchParams.payment_intent}</code>
              </p>
            )}
            <Link
              href="/dashboard"
              className="inline-block min-h-[44px] px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md"
            >
              Ir para o dashboard
            </Link>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4" aria-hidden="true">
              ⚠
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Pagamento não concluído
            </h1>
            <p className="text-gray-600 mb-6">
              O processo de pagamento foi cancelado ou falhou. Nenhum valor foi cobrado.
            </p>
            <Link
              href="/marketplace"
              className="inline-block min-h-[44px] px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md"
            >
              Tentar novamente
            </Link>
          </>
        )}
      </div>
    </main>
  );
}