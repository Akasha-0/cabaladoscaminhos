/**
 * /api/export/map — LGPD Art. 18 (V) + (VI)
 *
 * Retorna um JSON serializável e versionado com o mapa completo do
 * usuário autenticado. Inclui:
 *   - Identidade (id, nome, email, locale)
 *   - Dados de nascimento
 *   - Mapa astral dos 5 Pilares (BirthChart + User.ichingMap)
 *   - Subscription (plano, status — sem stripeCustomerId)
 *   - Manifesto (se existir)
 *   - DailyReading mais recente (apenas metadados)
 *
 * LGPD: dados sensíveis são explicitamente omitidos:
 *   - passwordHash, currentRefreshTokenJti, stripeCustomerId/SubId
 *   - tokens, p256dh/auth (PushSubscription)
 *
 * Schema versionado em `version: '1.0'` para migrações futuras.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAkashaApi } from '@/lib/application/auth/akasha-guard';
import { prisma } from '@/lib/infrastructure/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EXPORT_SCHEMA_VERSION = '1.0';

export async function GET(request: NextRequest) {
  const authResult = await requireAkashaApi(request);
  if (authResult instanceof NextResponse) return authResult;
  const userId = authResult.id;

  const [user, chart, subscription, manifesto, lastDaily] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        emailVerified: true,
        name: true,
        locale: true,
        role: true,
        birthDate: true,
        birthTime: true,
        birthCity: true,
        birthLatitude: true,
        birthLongitude: true,
        birthTimezone: true,
        ichingMap: true,
        ichingEnabled: true,
        intentionProfile: true,
        consentAt: true,
        pushEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.birthChart.findUnique({
      where: { userId },
      select: {
        id: true,
        astrologyMap: true,
        kabalisticMap: true,
        tantricMap: true,
        oduBirth: true,
        ichingMap: true,
        incomplete: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.subscription.findUnique({
      where: { userId },
      select: {
        id: true,
        plan: true,
        status: true,
        monthlyCreditQuota: true,
        currentPeriodEnd: true,
        dashboardUntil: true,
        createdAt: true,
        updatedAt: true,
        // Explicitamente omitido: stripeCustomerId, stripeSubscriptionId
      },
    }),
    prisma.manifesto.findUnique({
      where: { userId },
      select: {
        id: true,
        content: true,
        llmModel: true,
        tokensUsed: true,
        createdAt: true,
        // Explicitamente omitido: pdfUrl (pode conter token temporário)
      },
    }),
    prisma.dailyReading.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
      select: {
        id: true,
        date: true,
        climate: true,
        hexagram: true,
        hexagramLines: true,
        alert: true,
        tensionPoint: true,
        createdAt: true,
      },
    }),
  ]);

  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
  }

  const payload = {
    version: EXPORT_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    source: 'akasha-portal',
    lgpd: {
      article: 'Art. 18, V (portabilidade) e VI (eliminação mediante solicitação)',
      contact: 'privacidade@akasha.portal',
    },
    user: {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      name: user.name,
      locale: user.locale,
      role: user.role,
      consentAt: user.consentAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    birth: {
      birthDate: user.birthDate,
      birthTime: user.birthTime,
      birthCity: user.birthCity,
      birthLatitude: user.birthLatitude,
      birthLongitude: user.birthLongitude,
      birthTimezone: user.birthTimezone,
    },
    mandala: chart
      ? {
          id: chart.id,
          incomplete: chart.incomplete,
          astrology: chart.astrologyMap,
          kabbalistic: chart.kabalisticMap,
          tantric: chart.tantricMap,
          odu: chart.oduBirth,
          iching: chart.ichingMap ?? user.ichingMap,
          ichingEnabled: user.ichingEnabled,
          intentionProfile: user.intentionProfile,
          createdAt: chart.createdAt,
          updatedAt: chart.updatedAt,
        }
      : null,
    subscription: subscription
      ? {
          plan: subscription.plan,
          status: subscription.status,
          monthlyCreditQuota: subscription.monthlyCreditQuota,
          currentPeriodEnd: subscription.currentPeriodEnd,
          dashboardUntil: subscription.dashboardUntil,
          createdAt: subscription.createdAt,
          updatedAt: subscription.updatedAt,
        }
      : null,
    manifesto: manifesto
      ? {
          id: manifesto.id,
          content: manifesto.content,
          llmModel: manifesto.llmModel,
          tokensUsed: manifesto.tokensUsed,
          createdAt: manifesto.createdAt,
        }
      : null,
    lastDailyReading: lastDaily
      ? {
          id: lastDaily.id,
          date: lastDaily.date,
          climate: lastDaily.climate,
          hexagram: lastDaily.hexagram,
          hexagramLines: lastDaily.hexagramLines,
          alert: lastDaily.alert,
          tensionPoint: lastDaily.tensionPoint,
          createdAt: lastDaily.createdAt,
        }
      : null,
    notificationPreferences: {
      pushEnabled: user.pushEnabled,
    },
  };

  const filename = `akasha-map-${userId.slice(0, 8)}-${Date.now()}.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
      'X-Export-Schema-Version': EXPORT_SCHEMA_VERSION,
    },
  });
}