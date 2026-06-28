// ============================================================================
// POST /api/newsletter/subscribe — signup com preferences
// ============================================================================
// Body: { email: string, traditions?: string[], frequency?: 'WEEKLY'|'MONTHLY'|'NEVER' }
// Auth: opcional — se logado, vincula userId
// Idempotente: re-assinar com mesmo email atualiza preferences + reativa.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getViewer } from '@/lib/community/auth';
import { trackNewsletterSubscribe, hashEmailForAnalytics } from '@/lib/analytics/events-catalog';

export const dynamic = 'force-dynamic';

// ============================================================================
// Validation
// ============================================================================

const SubscribeSchema = z.object({
  email: z.string().email('Email inválido').max(255),
  traditions: z.array(z.string().min(1).max(64)).max(20).optional(),
  frequency: z.enum(['WEEKLY', 'MONTHLY', 'NEVER']).optional(),
});

// Slugs canônicos — alinhado com Group.tradition
const ALLOWED_TRADITIONS = new Set([
  'cabala',
  'ifa',
  'tantra',
  'xamanismo',
  'reiki',
  'ayurveda',
  'umbanda',
  'cristianismo-mistico',
  'sufismo',
  'meditacao',
]);

// ============================================================================
// POST handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = SubscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, traditions = [], frequency = 'WEEKLY' } = parsed.data;

    // Filtra tradições inválidas silenciosamente (apenas log)
    const validTraditions = traditions.filter((t) => ALLOWED_TRADITIONS.has(t));

    const viewer = await getViewer();

    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email: email.toLowerCase() },
    });

    const subscription = await prisma.newsletterSubscription.upsert({
      where: { email: email.toLowerCase() },
      create: {
        email: email.toLowerCase(),
        userId: viewer?.id ?? null,
        traditions: validTraditions,
        frequency,
        unsubscribedAt: null,
      },
      update: {
        userId: viewer?.id ?? existing?.userId ?? null,
        traditions: validTraditions,
        frequency,
        unsubscribedAt: null, // reativa
      },
    });

    // Wave 18 — analytics: newsletter_subscribed (fire-and-forget, LGPD-safe)
    hashEmailForAnalytics(email)
      .then((emailHash) => {
        trackNewsletterSubscribe({
          emailHash,
          frequency,
          traditionsCount: validTraditions.length,
        });
      })
      .catch(() => {
        // Silencioso: hash falhou, mas subscription foi salva
      });

    return NextResponse.json(
      {
        ok: true,
        subscription: {
          id: subscription.id,
          email: subscription.email,
          traditions: subscription.traditions,
          frequency: subscription.frequency,
        },
      },
      { status: existing ? 200 : 201 }
    );
  } catch (err) {
    console.error('[api/newsletter/subscribe][POST] error', err);
    return NextResponse.json(
      { error: 'Erro ao inscrever na newsletter' },
      { status: 500 }
    );
  }
}
