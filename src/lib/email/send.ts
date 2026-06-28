// ============================================================================
// EMAIL SEND — Resend wrapper + tracking (Wave 20, 2026-06-28)
// ============================================================================
// Funções públicas:
//   - sendEmail(to, template, data)    → wrapper Resend (single)
//   - sendBatch(tos[], template, data) → batch send (max 100/req)
//   - processEmailQueue()              → drain N jobs da queue (cron)
//
// Modos:
//   - live  → com RESEND_API_KEY, POST https://api.resend.com/emails
//   - stub  → sem key, apenas log (dev / test)
//
// Tracking:
//   - analytics: trackEmailSent, trackEmailFailed (PostHog via events-catalog)
//   - DB: atualiza email_jobs (markSent / markFailed)
//
// LGPD:
//   - Nunca logar email cru em produção (usar hashEmailForAnalytics)
//   - unsubscribe token embutido em todo email marketing
// ============================================================================

import { prisma } from '@/lib/prisma';
import {
  claimPendingJobs,
  markSent,
  markFailed,
  type EmailJob,
} from '@/lib/email/db';
import { renderTemplate, type TemplateId } from '@/lib/email/templates';
import {
  hashEmailForAnalytics,
} from '@/lib/analytics/events-catalog';

// ============================================================================
// Config
// ============================================================================

const RESEND_API_URL = 'https://api.resend.com/emails';
const FROM_NAME =
  process.env.NEWSLETTER_FROM_NAME ?? 'Cabala dos Caminhos';
const FROM_ADDRESS =
  process.env.NEWSLETTER_FROM_EMAIL ?? 'Cabala dos Caminhos <contato@cabala.dos.caminhos.com.br>';

const RESEND_BATCH_LIMIT = 100; // Resend aceita até 100 destinatários por request

// ============================================================================
// sendEmail — single send via Resend HTTP API
// ============================================================================

export interface SendResult {
  ok: boolean;
  provider: 'resend' | 'stub';
  messageId?: string;
  toEmail: string;
  error?: string;
}

export async function sendEmail(opts: {
  to: string;
  templateId: TemplateId;
  data: Record<string, unknown>;
  unsubscribeToken?: string | null;
  userId?: string | null;
  /** Quando true, não chama tracking analytics (uso em retries / batch). */
  silent?: boolean;
}): Promise<SendResult> {
  const rendered = renderTemplate(opts.templateId, opts.data, {
    unsubscribeToken: opts.unsubscribeToken,
  });

  const apiKey = process.env.RESEND_API_KEY;
  const provider: 'resend' | 'stub' = apiKey ? 'resend' : 'stub';

  if (provider === 'stub') {
    // eslint-disable-next-line no-console
    console.log(
      `[email][stub] ${opts.templateId} → ${opts.to} (subject: ${rendered.subject})`
    );
    // Fire-and-forget analytics mesmo em stub (sandbox/dev tracking)
    if (!opts.silent) {
      void trackEmailEvent({
        name: 'email_sent',
        to: opts.to,
        templateId: opts.templateId,
        provider: 'stub',
      });
    }
    return { ok: true, provider: 'stub', toEmail: opts.to };
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: opts.to,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        // Resend tags (visíveis no dashboard)
        tags: [
          { name: 'template', value: opts.templateId },
          ...(opts.userId ? [{ name: 'user_id', value: opts.userId }] : []),
        ],
        // Reply-to aponta para o email do app (não para FROM_NAME)
        reply_to: process.env.NEWSLETTER_REPLY_TO ?? FROM_ADDRESS,
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text().catch(() => '');
      const err = `resend_${res.status}:${errorBody.slice(0, 200)}`;
      // eslint-disable-next-line no-console
      console.error('[email] resend failed', opts.to, err);
      if (!opts.silent) {
        void trackEmailEvent({
          name: 'email_failed',
          to: opts.to,
          templateId: opts.templateId,
          provider: 'resend',
          error: err,
        });
      }
      return { ok: false, provider: 'resend', toEmail: opts.to, error: err };
    }

    const json = (await res.json()) as { id?: string };
    if (!opts.silent) {
      void trackEmailEvent({
        name: 'email_sent',
        to: opts.to,
        templateId: opts.templateId,
        provider: 'resend',
      });
    }
    return {
      ok: true,
      provider: 'resend',
      messageId: json.id,
      toEmail: opts.to,
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    // eslint-disable-next-line no-console
    console.error('[email] send error', opts.to, error);
    if (!opts.silent) {
      void trackEmailEvent({
        name: 'email_failed',
        to: opts.to,
        templateId: opts.templateId,
        provider: 'resend',
        error,
      });
    }
    return { ok: false, provider: 'resend', toEmail: opts.to, error };
  }
}

// ============================================================================
// sendBatch — envia o mesmo template para N destinatários
// ============================================================================

export interface BatchRecipient {
  email: string;
  userId?: string | null;
  data: Record<string, unknown>;
  unsubscribeToken?: string | null;
}

export interface BatchResult {
  total: number;
  delivered: number;
  failed: number;
  mode: 'resend' | 'stub';
  errors: Array<{ email: string; error: string }>;
}

export async function sendBatch(
  templateId: TemplateId,
  recipients: BatchRecipient[]
): Promise<BatchResult> {
  if (recipients.length === 0) {
    return { total: 0, delivered: 0, failed: 0, mode: 'stub', errors: [] };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const mode: 'resend' | 'stub' = apiKey ? 'resend' : 'stub';

  let delivered = 0;
  let failed = 0;
  const errors: Array<{ email: string; error: string }> = [];

  // Processa em chunks de RESEND_BATCH_LIMIT
  for (let i = 0; i < recipients.length; i += RESEND_BATCH_LIMIT) {
    const chunk = recipients.slice(i, i + RESEND_BATCH_LIMIT);

    if (mode === 'stub') {
      // Stub: log apenas
      for (const r of chunk) {
        const rendered = renderTemplate(templateId, r.data, {
          unsubscribeToken: r.unsubscribeToken,
        });
        // eslint-disable-next-line no-console
        console.log(
          `[email][stub][batch] ${templateId} → ${r.email} (subject: ${rendered.subject})`
        );
        delivered++;
      }
      continue;
    }

    // Live: Resend batch endpoint aceita até 100 recipients
    // Cada recipient pode ter variáveis próprias (precisamos de 1 chamada / email
    // porque data é per-recipient). Aqui paralelizamos com Promise.allSettled.
    const results = await Promise.allSettled(
      chunk.map((r) =>
        sendEmail({
          to: r.email,
          templateId,
          data: r.data,
          unsubscribeToken: r.unsubscribeToken,
          userId: r.userId,
          silent: true, // batch não trackea individualmente
        })
      )
    );

    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      const recipient = chunk[j];
      if (r.status === 'fulfilled' && r.value.ok) {
        delivered++;
      } else {
        failed++;
        const error =
          r.status === 'fulfilled'
            ? (r.value.error ?? 'unknown')
            : (r.reason instanceof Error ? r.reason.message : String(r.reason));
        errors.push({ email: recipient.email, error });
      }
    }
  }

  // Tracking agregado (1 evento por batch)
  void trackEmailEvent({
    name: 'email_batch_sent',
    templateId,
    total: recipients.length,
    delivered,
    failed,
    provider: mode,
  });

  return { total: recipients.length, delivered, failed, mode, errors };
}

// ============================================================================
// processEmailQueue — drena N jobs da queue (usado pelo cron)
// ============================================================================

export interface ProcessQueueResult {
  picked: number;
  sent: number;
  failed: number;
  skipped: number;
  errors: Array<{ jobId: string; error: string }>;
}

export async function processEmailQueue(batchSize = 25): Promise<ProcessQueueResult> {
  const jobs = await claimPendingJobs(batchSize);
  const result: ProcessQueueResult = {
    picked: jobs.length,
    sent: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  for (const job of jobs) {
    try {
      const sent = await sendEmail({
        to: job.toEmail,
        templateId: job.templateId as TemplateId,
        data: job.payload,
        // unsubscribeToken vem do payload (cada template pode trazer o seu)
        unsubscribeToken:
          (job.payload?.unsubscribeToken as string | undefined) ?? null,
        userId: job.userId,
        silent: true,
      });

      if (sent.ok) {
        await markSent(job.id);
        result.sent++;
      } else {
        await markFailed(job.id, sent.error ?? 'unknown');
        result.failed++;
        result.errors.push({ jobId: job.id, error: sent.error ?? 'unknown' });
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      await markFailed(job.id, error);
      result.failed++;
      result.errors.push({ jobId: job.id, error });
    }
  }

  return result;
}

// ============================================================================
// Helpers internos — tracking analytics
// ============================================================================

interface TrackInput {
  name: 'email_sent' | 'email_failed' | 'email_batch_sent';
  to?: string;
  templateId?: string;
  provider?: 'resend' | 'stub';
  error?: string;
  total?: number;
  delivered?: number;
  failed?: number;
}

async function trackEmailEvent(input: TrackInput): Promise<void> {
  // Hash do email para analytics (LGPD)
  const emailHash =
    input.to !== undefined ? await hashEmailForAnalytics(input.to).catch(() => 'unknown') : undefined;

  // Não temos evento "email_sent" no catálogo — enviamos via trackEventAny
  // (escape hatch). Em produção, adicionar ao events-catalog como entry formal.
  const { trackEventAny } = await import('@/lib/analytics/events-catalog');
  trackEventAny(
    input.name,
    {
      emailHash,
      templateId: input.templateId,
      provider: input.provider,
      error: input.error,
      total: input.total,
      delivered: input.delivered,
      failed: input.failed,
    },
    { serverSide: true }
  );
}
