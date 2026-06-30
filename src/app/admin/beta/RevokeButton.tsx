'use client';

// ============================================================================
// RevokeButton — Client component para revogar convite via API (Wave 32)
// ============================================================================// Usa o endpoint /api/beta/invite/[token] DELETE — mas como a tabela exibe
// apenas tokenDisplay (mascarado), precisamos primeiro buscar o plaintext
// via API admin. Para Wave 32, simplificamos: revogação por ID interno
// exige nova rota. Aqui usamos uma ação direta via fetch ao endpoint
// admin que aceita inviteId.
//
// (Refatoração Wave 33+: rota dedicada /api/admin/beta/invites/[id]/revoke
// para evitar round-trip de token lookup.)
// ============================================================================

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export function RevokeButton({ inviteId }: { inviteId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onClick = () => {
    if (!confirm('Revogar este convite? O destinatário não poderá mais usá-lo.')) {
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        // Para Wave 32: usamos a rota admin POST com flag de revoke via
        // ID interno. Como ainda não temos DELETE-by-id, fazemos a
        // operação via endpoint genérico.
        const resp = await fetch(`/api/admin/beta/invites/${inviteId}/revoke`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: 'admin_manual' }),
        });
        if (!resp.ok) {
          const j = (await resp.json().catch(() => ({}))) as { error?: string };
          setError(j.error ?? `HTTP ${resp.status}`);
          return;
        }
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro de rede');
      }
    });
  };

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="px-2 py-1 rounded-md text-xs border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 disabled:opacity-50"
      >
        {pending ? 'Revogando…' : 'Revogar'}
      </button>
      {error && (
        <span className="text-[10px] text-rose-300" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}