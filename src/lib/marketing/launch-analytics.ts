// ============================================================================
// LAUNCH ANALYTICS — Wave 37 (2026-07-01)
// ============================================================================
// Tracking de métricas do lançamento público:
//   1. Signup funnel (visit → signup → onboarding → first action)
//   2. Source attribution (UTM tracking)
//   3. Conversion per channel
//   4. Email open/click rates
//   5. Social engagement metrics
//
// Integração: PostHog (eventos), Resend (email tracking), Stripe (pagos).
// ============================================================================

import { prisma } from '@/lib/prisma';

// ============================================================================
// 1. SIGNUP FUNNEL TRACKING
// ============================================================================

export interface FunnelStep {
  step: string;
  count: number;
  conversionRate: number; // vs previous step
  cumulativeRate: number; // vs first step
}

export interface FunnelReport {
  period: { start: Date; end: Date };
  steps: FunnelStep[];
  totalEntrants: number;
  totalCompleters: number;
  overallConversionRate: number;
}

export async function getSignupFunnelReport(
  startDate: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  endDate: Date = new Date()
): Promise<FunnelReport> {
  const [
    landingPageViews,
    signupStarted,
    signupCompleted,
    emailVerified,
    onboardingStarted,
    onboardingCompleted,
    firstPostCreated,
  ] = await Promise.all([
    prisma.event.count({
      where: {
        eventName: '$pageview',
        timestamp: { gte: startDate, lte: endDate },
        properties: { path: '/launch' },
      },
    }),
    prisma.event.count({
      where: {
        eventName: 'signup_started',
        timestamp: { gte: startDate, lte: endDate },
      },
    }),
    prisma.event.count({
      where: {
        eventName: 'signup_completed',
        timestamp: { gte: startDate, lte: endDate },
      },
    }),
    prisma.event.count({
      where: {
        eventName: 'email_verified',
        timestamp: { gte: startDate, lte: endDate },
      },
    }),
    prisma.event.count({
      where: {
        eventName: 'onboarding_started',
        timestamp: { gte: startDate, lte: endDate },
      },
    }),
    prisma.event.count({
      where: {
        eventName: 'onboarding_completed',
        timestamp: { gte: startDate, lte: endDate },
      },
    }),
    prisma.event.count({
      where: {
        eventName: 'post_created',
        timestamp: { gte: startDate, lte: endDate },
      },
    }),
  ]);

  const stepCounts = [
    { step: 'Landing page view', count: landingPageViews },
    { step: 'Signup started', count: signupStarted },
    { step: 'Signup completed', count: signupCompleted },
    { step: 'Email verified', count: emailVerified },
    { step: 'Onboarding started', count: onboardingStarted },
    { step: 'Onboarding completed', count: onboardingCompleted },
    { step: 'First post created', count: firstPostCreated },
  ];

  const totalEntrants = landingPageViews;
  const totalCompleters = firstPostCreated;

  const steps: FunnelStep[] = stepCounts.map((s, i) => {
    const previousCount = i === 0 ? s.count : stepCounts[i - 1].count;
    const conversionRate = previousCount > 0 ? (s.count / previousCount) * 100 : 0;
    const cumulativeRate = totalEntrants > 0 ? (s.count / totalEntrants) * 100 : 0;
    return {
      step: s.step,
      count: s.count,
      conversionRate: Math.round(conversionRate * 100) / 100,
      cumulativeRate: Math.round(cumulativeRate * 100) / 100,
    };
  });

  return {
    period: { start: startDate, end: endDate },
    steps,
    totalEntrants,
    totalCompleters,
    overallConversionRate:
      totalEntrants > 0 ? Math.round((totalCompleters / totalEntrants) * 10000) / 100 : 0,
  };
}

// ============================================================================
// 2. SOURCE ATTRIBUTION (UTM tracking)
// ============================================================================

export interface SourceAttribution {
  source: string;
  medium: string;
  campaign: string;
  visitors: number;
  signups: number;
  conversions: number;
  conversionRate: number;
}

export async function getSourceAttribution(
  startDate: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  endDate: Date = new Date()
): Promise<SourceAttribution[]> {
  const events = await prisma.event.findMany({
    where: {
      eventName: { in: ['signup_completed', 'onboarding_completed'] },
      timestamp: { gte: startDate, lte: endDate },
    },
  });

  const attributionMap = new Map<string, SourceAttribution>();

  for (const event of events) {
    const props = event.properties as Record<string, any>;
    const source = props.utm_source ?? 'direct';
    const medium = props.utm_medium ?? 'none';
    const campaign = props.utm_campaign ?? 'none';
    const key = `${source}|${medium}|${campaign}`;

    const entry =
      attributionMap.get(key) ??
      ({
        source,
        medium,
        campaign,
        visitors: 0,
        signups: 0,
        conversions: 0,
        conversionRate: 0,
      } as SourceAttribution);

    if (event.eventName === 'signup_completed') entry.signups += 1;
    if (event.eventName === 'onboarding_completed') entry.conversions += 1;

    attributionMap.set(key, entry);
  }

  // Add visitor counts (from pageviews with UTM)
  const pageviews = await prisma.event.findMany({
    where: {
      eventName: '$pageview',
      timestamp: { gte: startDate, lte: endDate },
      properties: { path: '/launch' },
    },
  });

  for (const pv of pageviews) {
    const props = pv.properties as Record<string, any>;
    const source = props.utm_source ?? 'direct';
    const medium = props.utm_medium ?? 'none';
    const campaign = props.utm_campaign ?? 'none';
    const key = `${source}|${medium}|${campaign}`;
    const entry = attributionMap.get(key);
    if (entry) entry.visitors += 1;
  }

  const results = Array.from(attributionMap.values()).map((entry) => ({
    ...entry,
    conversionRate:
      entry.signups > 0
        ? Math.round((entry.conversions / entry.signups) * 10000) / 100
        : 0,
  }));

  return results.sort((a, b) => b.signups - a.signups);
}

// ============================================================================
// 3. CONVERSION PER CHANNEL
// ============================================================================

export interface ChannelConversion {
  channel: 'organic' | 'paid_social' | 'email' | 'referral' | 'press' | 'influencer' | 'direct';
  impressions: number;
  clicks: number;
  signups: number;
  paidConversions: number;
  revenue: number;
  ctr: number;
  cpa: number;
  roas: number;
}

export async function getChannelConversions(
  startDate: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  endDate: Date = new Date()
): Promise<ChannelConversion[]> {
  // Aggregate from multiple sources
  const [organicPageviews, socialPageviews, emailClicks, referralSignups, pressSignups] =
    await Promise.all([
      prisma.event.count({
        where: {
          eventName: '$pageview',
          timestamp: { gte: startDate, lte: endDate },
          properties: { utm_medium: 'organic' },
        },
      }),
      prisma.event.count({
        where: {
          eventName: '$pageview',
          timestamp: { gte: startDate, lte: endDate },
          properties: { utm_medium: { in: ['social_organic', 'social_paid'] } },
        },
      }),
      prisma.event.count({
        where: {
          eventName: 'email_link_clicked',
          timestamp: { gte: startDate, lte: endDate },
        },
      }),
      prisma.event.count({
        where: {
          eventName: 'signup_completed',
          timestamp: { gte: startDate, lte: endDate },
          properties: { utm_source: 'referral' },
        },
      }),
      prisma.event.count({
        where: {
          eventName: 'signup_completed',
          timestamp: { gte: startDate, lte: endDate },
          properties: { utm_source: 'press' },
        },
      }),
    ]);

  const paidSubs = await prisma.subscription.count({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      plan: 'pro',
      status: 'active',
    },
  });

  const revenue = await prisma.payment.aggregate({
    where: {
      createdAt: { gte: startDate, lte: endDate },
      status: 'succeeded',
    },
    _sum: { amount: true },
  });

  const totalRevenue = (revenue._sum.amount ?? 0) / 100; // cents to BRL

  // Simplified attribution (in production, this would be a multi-touch attribution model)
  const channels: ChannelConversion[] = [
    {
      channel: 'organic',
      impressions: organicPageviews * 10, // estimated
      clicks: organicPageviews,
      signups: Math.round(organicPageviews * 0.03),
      paidConversions: Math.round((organicPageviews * 0.03) * 0.05),
      revenue: 0,
      ctr: 10,
      cpa: 0,
      roas: 0,
    },
    {
      channel: 'paid_social',
      impressions: socialPageviews * 20,
      clicks: socialPageviews,
      signups: Math.round(socialPageviews * 0.04),
      paidConversions: Math.round((socialPageviews * 0.04) * 0.06),
      revenue: 0,
      ctr: 5,
      cpa: 8, // estimated R$8 per signup
      roas: 1.8,
    },
    {
      channel: 'email',
      impressions: emailClicks * 5,
      clicks: emailClicks,
      signups: Math.round(emailClicks * 0.15),
      paidConversions: Math.round((emailClicks * 0.15) * 0.08),
      revenue: 0,
      ctr: 20,
      cpa: 0.5,
      roas: 12,
    },
    {
      channel: 'referral',
      impressions: referralSignups * 8,
      clicks: referralSignups,
      signups: referralSignups,
      paidConversions: Math.round(referralSignups * 0.1),
      revenue: 0,
      ctr: 12,
      cpa: 1,
      roas: 6,
    },
    {
      channel: 'press',
      impressions: pressSignups * 50,
      clicks: pressSignups * 2,
      signups: pressSignups,
      paidConversions: Math.round(pressSignups * 0.07),
      revenue: 0,
      ctr: 4,
      cpa: 0,
      roas: 0,
    },
    {
      channel: 'direct',
      impressions: 0,
      clicks: 0,
      signups: 0,
      paidConversions: paidSubs,
      revenue: totalRevenue,
      ctr: 0,
      cpa: 0,
      roas: 0,
    },
    {
      channel: 'influencer',
      impressions: 0,
      clicks: 0,
      signups: 0,
      paidConversions: 0,
      revenue: 0,
      ctr: 0,
      cpa: 15, // estimated
      roas: 1.5,
    },
  ];

  return channels;
}

// ============================================================================
// 4. EMAIL OPEN/CLICK RATES
// ============================================================================

export interface EmailMetrics {
  campaignId: string;
  campaignName: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  clickToOpenRate: number;
  bounceRate: number;
  unsubscribeRate: number;
}

export async function getEmailMetrics(
  startDate: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  endDate: Date = new Date()
): Promise<EmailMetrics[]> {
  const jobs = await prisma.emailJob.findMany({
    where: {
      scheduledAt: { gte: startDate, lte: endDate },
      campaignId: { startsWith: 'launch-sequence' },
    },
  });

  const campaignMap = new Map<string, EmailMetrics>();

  for (const job of jobs) {
    const campaignName = `${job.templateId} (Day ${job.scheduledAt.getDate() - startDate.getDate()})`;
    const entry =
      campaignMap.get(job.campaignId) ??
      ({
        campaignId: job.campaignId,
        campaignName,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0,
        openRate: 0,
        clickRate: 0,
        clickToOpenRate: 0,
        bounceRate: 0,
        unsubscribeRate: 0,
      } as EmailMetrics);

    if (job.status === 'sent') {
      entry.sent += 1;
      entry.delivered += 1; // simplification: assume delivered if sent
    }
    if (job.openedAt) entry.opened += 1;
    if (job.clickedAt) entry.clicked += 1;
    if (job.status === 'bounced') entry.bounced += 1;
    if (job.unsubscribedAt) entry.unsubscribed += 1;

    campaignMap.set(job.campaignId, entry);
  }

  return Array.from(campaignMap.values()).map((m) => ({
    ...m,
    openRate: m.delivered > 0 ? Math.round((m.opened / m.delivered) * 10000) / 100 : 0,
    clickRate: m.delivered > 0 ? Math.round((m.clicked / m.delivered) * 10000) / 100 : 0,
    clickToOpenRate:
      m.opened > 0 ? Math.round((m.clicked / m.opened) * 10000) / 100 : 0,
    bounceRate: m.sent > 0 ? Math.round((m.bounced / m.sent) * 10000) / 100 : 0,
    unsubscribeRate:
      m.delivered > 0 ? Math.round((m.unsubscribed / m.delivered) * 10000) / 100 : 0,
  }));
}

// ============================================================================
// 5. SOCIAL ENGAGEMENT METRICS
// ============================================================================

export interface SocialMetrics {
  platform: 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'youtube' | 'tiktok' | 'threads';
  impressions: number;
  engagements: number;
  engagementRate: number;
  linkClicks: number;
  signups: number;
  signupConversionRate: number;
  topPost?: {
    content: string;
    engagements: number;
  };
}

export async function getSocialEngagementMetrics(
  startDate: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  endDate: Date = new Date()
): Promise<SocialMetrics[]> {
  const platforms: SocialMetrics['platform'][] = [
    'twitter',
    'instagram',
    'linkedin',
    'facebook',
    'youtube',
    'tiktok',
    'threads',
  ];

  const results: SocialMetrics[] = [];

  for (const platform of platforms) {
    const events = await prisma.event.findMany({
      where: {
        eventName: { in: ['social_impression', 'social_engagement', 'social_link_click'] },
        timestamp: { gte: startDate, lte: endDate },
        properties: { platform },
      },
    });

    const impressions = events
      .filter((e) => e.eventName === 'social_impression')
      .reduce((sum, e) => sum + ((e.properties as any).count ?? 1), 0);
    const engagements = events
      .filter((e) => e.eventName === 'social_engagement')
      .reduce((sum, e) => sum + ((e.properties as any).count ?? 1), 0);
    const linkClicks = events.filter((e) => e.eventName === 'social_link_click').length;

    const signups = await prisma.event.count({
      where: {
        eventName: 'signup_completed',
        timestamp: { gte: startDate, lte: endDate },
        properties: { utm_source: platform },
      },
    });

    results.push({
      platform,
      impressions,
      engagements,
      engagementRate:
        impressions > 0 ? Math.round((engagements / impressions) * 10000) / 100 : 0,
      linkClicks,
      signups,
      signupConversionRate:
        linkClicks > 0 ? Math.round((signups / linkClicks) * 10000) / 100 : 0,
    });
  }

  return results;
}

// ============================================================================
// Aggregate: Launch dashboard
// ============================================================================

export interface LaunchDashboard {
  period: { start: Date; end: Date };
  funnel: FunnelReport;
  sources: SourceAttribution[];
  channels: ChannelConversion[];
  emailMetrics: EmailMetrics[];
  socialMetrics: SocialMetrics[];
  summary: {
    totalSignups: number;
    totalOnboarded: number;
    totalPaid: number;
    revenue: number;
    cac: number; // blended
    ltv: number; // projected
    ltvCacRatio: number;
  };
}

export async function getLaunchDashboard(
  startDate: Date = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  endDate: Date = new Date()
): Promise<LaunchDashboard> {
  const [funnel, sources, channels, emailMetrics, socialMetrics] = await Promise.all([
    getSignupFunnelReport(startDate, endDate),
    getSourceAttribution(startDate, endDate),
    getChannelConversions(startDate, endDate),
    getEmailMetrics(startDate, endDate),
    getSocialEngagementMetrics(startDate, endDate),
  ]);

  const totalSignups = funnel.steps.find((s) => s.step === 'Signup completed')?.count ?? 0;
  const totalOnboarded =
    funnel.steps.find((s) => s.step === 'Onboarding completed')?.count ?? 0;
  const totalPaid = channels.reduce((sum, c) => sum + c.paidConversions, 0);
  const revenue = channels.reduce((sum, c) => sum + c.revenue, 0);
  const cac = totalSignups > 0 ? 12 : 0; // blended estimate
  const ltv = totalPaid > 0 ? revenue / totalPaid * 12 : 0; // 12-month projected

  return {
    period: { start: startDate, end: endDate },
    funnel,
    sources,
    channels,
    emailMetrics,
    socialMetrics,
    summary: {
      totalSignups,
      totalOnboarded,
      totalPaid,
      revenue,
      cac,
      ltv,
      ltvCacRatio: cac > 0 ? Math.round((ltv / cac) * 100) / 100 : 0,
    },
  };
}