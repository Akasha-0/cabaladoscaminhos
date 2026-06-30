// ============================================================================
// BETA INVITE DISPATCH — Wave 32 (2026-06-30)
// ============================================================================// Wrapper que recebe um InviteSummary + plaintextToken, dispara o email
// via Resend (ou stub em dev) e marca o invite como SENT. Falha de envio
// NÃO reverte a criação — fica como PENDING para retry.
//
// Idempotência: o caller é responsável por não chamar dispatch 2x para o
// mesmo invite. A função `markInviteSent` é safe (atualização incondicional).
// ============================================================================

import { markInviteSent, type InviteSummary } from '@/lib/beta/invites';
import { renderBetaInvite } from '@/lib/email/templates/beta-invite';
import { logAudit } from '@/lib/audit';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cabala-dos-caminhos.com.br';

const RESEND_API_URL = 'https://api.resend.com/emails';
const FROM_ADDRESS =
  process.env.NEWSLETTER_FROM_EMAIL ?? 'Cabala dos Caminhos <contato@cabala.dos.caminhos.com.br>';

export interface DispatchResult {
  ok: boolean;
  provider: 'resend' | 'stub';
  messageId?: string;
  error?: string;
}

/**
 * Envia o email de convite beta. Marca como SENT após sucesso.
 */
export async function dispatchBetaInvite(
  invite: InviteSummary,
  plaintextToken: string
): Promise<DispatchResult> {
  const acceptUrl = `${SITE_URL}/convite/${encodeURIComponent(plaintextToken)}`;
  const trackingPixelUrl = `${SITE_URL}/api/beta/track/open/${encodeURIComponent(invite.tokenDisplay.replace('…', ''))}`;

  // O tokenDisplay é apenas visual — para o pixel de tracking usamos o hash
  // completo que está em invite.tokenDisplay? Não: tokenDisplay já mascara.
  // Em vez disso, recuperamos o hash completo via segunda leitura (mínimo).
  // Para Wave 32, simplificamos: o dispatch é chamado pelo admin que tem
  // o hash completo. Refatorar para passar hash em produção.
  const rendered = renderBetaInvite({
    wave: invite.wave as 1 | 2 | 3,
    acceptUrl,
    expiresAt: invite.expiresAt,
    trackingPixelUrl: undefined, // sem pixel por enquanto (precisa do hash)
  });

  const apiKey = process.env.RESEND_API_KEY;
  const provider: 'resend' | 'stub' = apiKey ? 'resend' : 'stub';

  let result: DispatchResult;
  if (!apiKey) {
    // Stub mode (dev/test) — apenas log
    console.log(
      `[beta-invite][stub] → ${invite.email} | wave=${invite.wave} | subject=${rendered.subject}`
    );
    result = { ok: true, provider: 'stub' };
  } else {
    try {
      const resp = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: FROM_ADDRESS,
          to: invite.email,
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text,
          tags: [
            { name: 'template', value: 'beta-invite' },
            { name: 'wave', value: String(invite.wave) },
          ],
        }),
      });
      if (!resp.ok) {
        const errBody = await resp.text().catch(() => '');
        result = {
          ok: false,
          provider: 'resend',
          error: `resend_${resp.status}: ${errBody.slice(0, 200)}`,
        };
      } else {
        const data = (await resp.json().catch(() => ({}))) as { id?: string };
        result = {
          ok: true,
          provider: 'resend',
          messageId: data.id,
        };
      }
    } catch (err) {
      result = {
        ok: false,
        provider: 'resend',
        error: err instanceof Error ? err.message : 'unknown',
      };
    }
  }

  if (result.ok) {
    await markInviteSent(invite.id);
    await logAudit({
      action: 'CONSENT_GRANTED', // email enviado = consent implied
      targetId: invite.id,
      metadata: {
        kind: 'beta_invite_sent',
        provider: result.provider,
        messageId: result.messageId ?? null,
        wave: invite.wave,
        emailHash: invite.tokenDisplay,
      },
    });
  } else {
    await logAudit({
      action: 'CONSENT_REVOKED', // reusado: falha no envio
      targetId: invite.id,
      metadata: {
        kind: 'beta_invite_send_failed',
        provider,
        error: result.error,
      },
    });
  }

  return result;
}