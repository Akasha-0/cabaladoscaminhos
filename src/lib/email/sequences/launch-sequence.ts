// ============================================================================
// LAUNCH EMAIL SEQUENCE — 5 emails (Wave 37, 2026-07-01)
// ============================================================================
// 5 emails programados para Day 0, Day 3, Day 7, Day 14, Day 30 após
// o signup no /launch. Marca a abertura oficial do beta ao público.
//
// Funções públicas:
//   - scheduleLaunchSequence(user) — agenda os 5 jobs no email_jobs
//   - cancelLaunchSequence(userId) — cancela jobs pendentes
//   - getLaunchSequenceProgress(userId) — % concluído
//
// LGPD: opt-in explícito no signup. Unsubscribe token em todo email.
// ============================================================================

import { prisma } from '@/lib/prisma';
import { enqueueBatch, cancelCampaign } from '@/lib/email/db';

// ============================================================================
// Types
// ============================================================================

export interface LaunchSequenceUser {
  id: string;
  email: string;
  nomeCompleto: string;
  traditions: string[];
  signupSource: 'launch_page' | 'waitlist' | 'referral' | 'organic';
  referrer?: string;
}

export interface LaunchSequenceEmail {
  day: 0 | 3 | 7 | 14 | 30;
  templateId:
    | 'launch-day0'
    | 'launch-day3'
    | 'launch-day7'
    | 'launch-day14'
    | 'launch-day30';
  subject: string;
  preview: string;
  cta: string;
  ctaUrl: string;
}

export interface LaunchScheduleResult {
  ok: boolean;
  campaignId: string;
  jobsScheduled: number;
  jobIds: string[];
  scheduledDays: number[];
}

// ============================================================================
// Sequence definition (5 emails)
// ============================================================================

export const LAUNCH_SEQUENCE: LaunchSequenceEmail[] = [
  {
    day: 0,
    templateId: 'launch-day0',
    subject: '🌅 Bem-vindo(a) à Akasha Portal — onde tradições se encontram',
    preview: 'Sua jornada começa agora. 50 pessoas já estão dentro — você é a próxima.',
    cta: 'Completar onboarding',
    ctaUrl: '/onboarding',
  },
  {
    day: 3,
    templateId: 'launch-day3',
    subject: '✨ Early adopter: seus benefícios exclusivos',
    preview: 'Como beta tester fundador, você tem acesso antecipado a tudo. Veja o que isso significa.',
    cta: 'Conhecer benefícios',
    ctaUrl: '/conta/beneficios',
  },
  {
    day: 7,
    templateId: 'launch-day7',
    subject: '🌿 Tradição em destaque: conheça as 7 linguagens',
    preview: 'Cabala, Ifá, Tantra, Umbanda, Xamanismo, Ayurveda, Meditação — cada uma com sua profundidade.',
    cta: 'Explorar tradições',
    ctaUrl: '/tradicoes',
  },
  {
    day: 14,
    templateId: 'launch-day14',
    subject: '🤝 Histórias da comunidade: como outros caminham',
    preview: 'Beta testers contam como Akasha Portal entrou na prática deles. Histórias reais, sem filtro.',
    cta: 'Ler histórias',
    ctaUrl: '/comunidade/historias',
  },
  {
    day: 30,
    templateId: 'launch-day30',
    subject: '📊 Retrospectiva: 30 dias de beta aberta',
    preview: 'NPS, retenção, Akasha usage, o que aprendemos, o que vem a seguir. Transparência total.',
    cta: 'Ver retrospectiva',
    ctaUrl: '/blog/retrospectiva-30-dias',
  },
];

// ============================================================================
// scheduleLaunchSequence
// ============================================================================

const LAUNCH_CAMPAIGN_PREFIX = 'launch-sequence';

export async function scheduleLaunchSequence(
  user: LaunchSequenceUser
): Promise<LaunchScheduleResult> {
  const campaignId = `${LAUNCH_CAMPAIGN_PREFIX}-${user.id}-${Date.now()}`;
  const now = Date.now();
  const jobsScheduled: string[] = [];
  const scheduledDays: number[] = [];

  for (const email of LAUNCH_SEQUENCE) {
    const scheduledAt = new Date(now + email.day * 24 * 60 * 60 * 1000);
    const jobId = await enqueueBatch({
      userId: user.id,
      email: user.email,
      templateId: email.templateId,
      campaignId,
      scheduledAt,
      data: {
        displayName: user.nomeCompleto.split(' ')[0],
        fullName: user.nomeCompleto,
        traditions: user.traditions,
        signupSource: user.signupSource,
        referrer: user.referrer ?? null,
        emailDay: email.day,
        emailSubject: email.subject,
        emailPreview: email.preview,
        ctaText: email.cta,
        ctaUrl: email.ctaUrl,
      },
    });
    jobsScheduled.push(jobId);
    scheduledDays.push(email.day);
  }

  return {
    ok: true,
    campaignId,
    jobsScheduled: jobsScheduled.length,
    jobIds: jobsScheduled,
    scheduledDays,
  };
}

// ============================================================================
// cancelLaunchSequence
// ============================================================================

export async function cancelLaunchSequence(userId: string): Promise<{
  ok: boolean;
  cancelled: number;
}> {
  const cancelled = await cancelCampaign({
    userId,
    campaignPrefix: LAUNCH_CAMPAIGN_PREFIX,
  });
  return { ok: true, cancelled };
}

// ============================================================================
// getLaunchSequenceProgress
// ============================================================================

export async function getLaunchSequenceProgress(userId: string): Promise<{
  total: number;
  sent: number;
  remaining: number;
  percentComplete: number;
  nextEmail?: { day: number; templateId: string; scheduledAt: Date };
}> {
  const jobs = await prisma.emailJob.findMany({
    where: {
      userId,
      campaignId: { startsWith: LAUNCH_CAMPAIGN_PREFIX },
    },
    orderBy: { scheduledAt: 'asc' },
  });

  const total = jobs.length;
  const sent = jobs.filter((j) => j.status === 'sent').length;
  const remaining = total - sent;
  const percentComplete = total > 0 ? Math.round((sent / total) * 100) : 0;

  const nextJob = jobs.find((j) => j.status === 'pending');

  return {
    total,
    sent,
    remaining,
    percentComplete,
    nextEmail: nextJob
      ? {
          day: nextJob.scheduledAt.getDate() - new Date().getDate(),
          templateId: nextJob.templateId,
          scheduledAt: nextJob.scheduledAt,
        }
      : undefined,
  };
}

// ============================================================================
// Manual triggers (admin)
// ============================================================================

export async function sendLaunchEmailNow(
  userId: string,
  templateId: LaunchSequenceEmail['templateId']
): Promise<{ ok: boolean; jobId?: string; error?: string }> {
  const emailDef = LAUNCH_SEQUENCE.find((e) => e.templateId === templateId);
  if (!emailDef) {
    return { ok: false, error: `Template ${templateId} not in launch sequence` };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { ok: false, error: `User ${userId} not found` };
  }

  const jobId = await enqueueBatch({
    userId: user.id,
    email: user.email,
    templateId: emailDef.templateId,
    campaignId: `${LAUNCH_CAMPAIGN_PREFIX}-manual-${userId}`,
    scheduledAt: new Date(),
    data: {
      displayName: user.nomeCompleto.split(' ')[0],
      fullName: user.nomeCompleto,
      traditions: [],
      signupSource: 'organic',
      emailDay: emailDef.day,
      emailSubject: emailDef.subject,
      emailPreview: emailDef.preview,
      ctaText: emailDef.cta,
      ctaUrl: emailDef.ctaUrl,
    },
  });

  return { ok: true, jobId };
}

// ============================================================================
// Analytics: aggregate stats
// ============================================================================

export async function getLaunchSequenceStats(): Promise<{
  totalScheduled: number;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  openRate: number;
  clickRate: number;
  byDay: Array<{
    day: number;
    templateId: string;
    sent: number;
    opened: number;
    clicked: number;
  }>;
}> {
  const jobs = await prisma.emailJob.findMany({
    where: { campaignId: { startsWith: LAUNCH_CAMPAIGN_PREFIX } },
  });

  const totalScheduled = jobs.length;
  const totalSent = jobs.filter((j) => j.status === 'sent').length;
  const totalOpened = jobs.filter((j) => j.openedAt !== null).length;
  const totalClicked = jobs.filter((j) => j.clickedAt !== null).length;

  const byDay = LAUNCH_SEQUENCE.map((email) => {
    const dayJobs = jobs.filter((j) => j.templateId === email.templateId);
    const sent = dayJobs.filter((j) => j.status === 'sent').length;
    const opened = dayJobs.filter((j) => j.openedAt !== null).length;
    const clicked = dayJobs.filter((j) => j.clickedAt !== null).length;
    return { day: email.day, templateId: email.templateId, sent, opened, clicked };
  });

  return {
    totalScheduled,
    totalSent,
    totalOpened,
    totalClicked,
    openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
    clickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
    byDay,
  };
}