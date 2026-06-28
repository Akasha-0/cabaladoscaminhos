// ============================================================================
// EMAIL SEQUENCES — Welcome series + utilitários (Wave 20, 2026-06-28)
// ============================================================================
// Welcome series: 3 emails programados para Day 0, Day 2, Day 7.
//
// Funções:
//   - scheduleWelcomeSeries(user) — agenda os 3 jobs na tabela email_jobs
//   - cancelWelcomeSeries(userId) — cancela jobs pendentes (se user desativou)
//   - getOrCreateUnsubscribeToken(userId) — pega/cria token pra embed no email
//
// O cron /api/cron/process-email-queue processa os jobs a cada 15min.
// ============================================================================

import { prisma } from '@/lib/prisma';
import { enqueueBatch, cancelCampaign } from '@/lib/email/db';

// ============================================================================
// Types
// ============================================================================

export interface WelcomeSequenceUser {
  id: string;
  email: string;
  nomeCompleto: string;
  /** Tradições já escolhidas no onboarding. */
  traditions: string[];
  /** Caminho de vida numerológico (opcional — só se onboarding completou). */
  caminhoDeVida: number | null;
  /** Tradição principal detectada (slug canônico). */
  mainTradition: string | null;
}

export interface WelcomeScheduleResult {
  ok: boolean;
  campaignId: string;
  jobsScheduled: number;
  /** Job IDs criados (em ordem cronológica). */
  jobIds: string[];
}

// ============================================================================
// scheduleWelcomeSeries — agenda 3 emails (Day 0, Day 2, Day 7)
// ============================================================================

export async function scheduleWelcomeSeries(
  user: WelcomeSequenceUser
): Promise<WelcomeScheduleResult> {
  const campaignId = `welcome:${user.id}`;

  // Idempotência: se já existe campanha ativa, não duplica
  const existing = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint AS count
    FROM "email_jobs"
    WHERE "campaignId" = ${campaignId} AND status = 'PENDING'
  `;
  if (Number(existing[0]?.count ?? 0n) > 0) {
    return {
      ok: false,
      campaignId,
      jobsScheduled: 0,
      jobIds: [],
    };
  }

  const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cabala-dos-caminhos.com.br';

  const unsubscribeToken = await getOrCreateUnsubscribeToken(user.id, 'welcome');
  const firstName = user.nomeCompleto.split(' ')[0] || 'Caminhante';

  const now = new Date();
  const day2 = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  const day7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const jobIds = await enqueueBatch([
    {
      toEmail: user.email,
      templateId: 'welcome',
      userId: user.id,
      campaignId,
      scheduledFor: now,
      payload: {
        displayName: firstName,
        traditions: user.traditions,
        onboardingUrl: `${SITE_URL}/onboarding`,
        communityUrl: `${SITE_URL}/comunidade`,
        unsubscribeToken,
      },
    },
    {
      toEmail: user.email,
      templateId: 'welcome-day2',
      userId: user.id,
      campaignId,
      scheduledFor: day2,
      payload: {
        displayName: firstName,
        akashaUrl: `${SITE_URL}/akashic`,
        libraryUrl: `${SITE_URL}/biblioteca`,
        unsubscribeToken,
      },
    },
    {
      toEmail: user.email,
      templateId: 'welcome-day7',
      userId: user.id,
      campaignId,
      scheduledFor: day7,
      payload: {
        displayName: firstName,
        mainTradition: user.mainTradition,
        caminhoDeVida: user.caminhoDeVida,
        composePostUrl: `${SITE_URL}/comunidade/post/novo`,
        groupUrl: user.mainTradition
          ? `${SITE_URL}/comunidade/grupos/${user.mainTradition}`
          : null,
        unsubscribeToken,
      },
    },
  ]);

  return {
    ok: true,
    campaignId,
    jobsScheduled: jobIds.length,
    jobIds,
  };
}

// ============================================================================
// cancelWelcomeSeries — cancela todos os jobs pendentes da campanha
// ============================================================================

export async function cancelWelcomeSeries(userId: string): Promise<number> {
  return cancelCampaign(`welcome:${userId}`);
}

// ============================================================================
// getOrCreateUnsubscribeToken — pega token existente ou cria novo
// ============================================================================
// Reusa o modelo UnsubscribeToken (já existente no schema) para embed no
// footer dos emails. Token pode ser específico por tipo (welcome, comment,
// etc) ou null = unsubscribe all.
// ============================================================================

export async function getOrCreateUnsubscribeToken(
  userId: string,
  type: string | null
): Promise<string> {
  // Tenta pegar um token ativo para este user + type
  const existing = await prisma.unsubscribeToken.findFirst({
    where: {
      userId,
      type,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (existing) return existing.token;

  // Cria novo token (expira em 90 dias)
  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  const created = await prisma.unsubscribeToken.create({
    data: {
      userId,
      type,
      token: crypto.randomUUID(),
      expiresAt,
    },
  });

  return created.token;
}

// ============================================================================
// scheduleNotificationEmail — helper para enfileirar emails de notificação
// ============================================================================
// Usado pelo código de domínio (ex: ao criar comentário, like, follow).
// Centraliza o pattern: lookup token, enfileirar, retornar jobId.
// ============================================================================

export interface NotificationEmailInput {
  recipientUserId: string;
  recipientEmail: string;
  templateId:
    | 'comment-notification'
    | 'like-notification'
    | 'mention-notification'
    | 'follow-notification';
  payload: Record<string, unknown>;
  /** Quando enfileirar (default: imediato). */
  scheduledFor?: Date;
}

export async function scheduleNotificationEmail(
  input: NotificationEmailInput
): Promise<string | null> {
  // Respeita preference do usuário (NotificationPreference.email)
  const pref = await prisma.notificationPreference.findUnique({
    where: {
      userId_type: {
        userId: input.recipientUserId,
        type: mapTemplateToNotificationType(input.templateId),
      },
    },
  });

  // Default: se sem preference, EMAIL=true (legado)
  if (pref && pref.email === false) return null;

  // Pega/cria token de unsubscribe
  const unsubscribeToken = await getOrCreateUnsubscribeToken(
    input.recipientUserId,
    input.templateId
  );

  // Embed token no payload (template extrai)
  const payloadWithToken = { ...input.payload, unsubscribeToken };

  const jobId = await (
    await import('@/lib/email/db')
  ).enqueueEmail({
    toEmail: input.recipientEmail,
    templateId: input.templateId,
    payload: payloadWithToken,
    userId: input.recipientUserId,
    scheduledFor: input.scheduledFor ?? new Date(),
    campaignId: `notif:${input.templateId}:${input.recipientUserId}`,
  });

  return jobId;
}

function mapTemplateToNotificationType(
  templateId: NotificationEmailInput['templateId']
): 'COMMENT' | 'LIKE' | 'MENTION' | 'FOLLOW' {
  switch (templateId) {
    case 'comment-notification':
      return 'COMMENT';
    case 'like-notification':
      return 'LIKE';
    case 'mention-notification':
      return 'MENTION';
    case 'follow-notification':
      return 'FOLLOW';
  }
}
