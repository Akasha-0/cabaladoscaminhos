/**
 * Cron: Daily Push — F-237
 *
 * Roda 1x por dia (Vercel cron, vercel.json) e envia a síntese diária
 * do Akasha para todos os usuários com pushEnabled = true.
 *
 * Motivação (F-228 mobile strategy §"1 push/day = the product"):
 * O produto Akasha vive de 1 toque por dia — o push matinal é o que
 * traz o usuário de volta. Sem este cron, mesmo com subscription salva
 * o usuário nunca recebe nada.
 *
 * Segurança:
 * - Header `x-vercel-cron-secret` ou query `?secret=` validado contra
 *   `process.env.CRON_SECRET`. Sem secret válido, retorna 401.
 * - Idempotente (rerunnable): se já enviou hoje, pula.
 *
 * Outputs:
 * - 200 + JSON { sent, failed, expired, skipped } para monitoramento
 * - Logs em stderr (capturados pelo Vercel logs)
 *
 * Frequência alvo: 1x/dia às 7h BRT (= 10h UTC, verão) ou 11h UTC (inverno).
 * Cron Vercel: "0 10 * * *" (ajustar com DST manualmente).
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/infrastructure/prisma';
import { buildDailyContent } from '@/lib/application/akasha/daily-engine';
import {
  getAllActivePushSubscriptions,
  deletePushSubscription,
} from '@/lib/application/push/push-subscription-service';
import { sendPush } from '@/lib/application/push/web-push-server';
import { verifyCronSecret } from '@/lib/application/auth/cron-guard';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60s — Vercel Fluid Compute default

export async function GET(request: NextRequest) {
  // 1. Validação do secret
  const guard = verifyCronSecret(request);
  if (guard) return guard;

  // 2. Coletar subscriptions ativas
  const subs = await getAllActivePushSubscriptions();

  if (subs.length === 0) {
    return NextResponse.json({
      ok: true,
      sent: 0,
      failed: 0,
      expired: 0,
      skipped: 0,
      message: 'Nenhum assinante com push ativo',
    });
  }

  // 3. Calcular síntese por usuário (já tem dailyReading cacheado)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let sent = 0;
  let failed = 0;
  let expired = 0;
  let skipped = 0;

  // Coletar users únicos (múltiplos devices = múltiplas subs por user)
  const userIds = Array.from(new Set(subs.map((s) => s.userId)));
  const birthCharts = await prisma.birthChart.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, astrologyMap: true, kabalisticMap: true, tantricMap: true, oduBirth: true },
  });
  const chartByUser = new Map(birthCharts.map((c) => [c.userId, c]));

  for (const sub of subs) {
    try {
      const chart = chartByUser.get(sub.userId);
      if (!chart) {
        skipped++;
        continue;
      }

      // Calcular síntese do dia
      const content = buildDailyContent(
        chart.astrologyMap as any,
        chart.kabalisticMap as any,
        chart.tantricMap as any,
        chart.oduBirth as any,
        today
      );

      // Construir payload do push
      const title = '✦ Akasha — seu dia';
      const body = `${content.climate || 'Sua síntese diária'} · Prática: ${content.ritual?.titulo ?? 'respire fundo 3x'}`;
      const payload = {
        title,
        body,
        url: '/meu-dia',
        tag: 'akasha-daily',
        icon: '/icons/akasha-192.png',
        badge: '/icons/akasha-96.png',
      };

      const result = await sendPush(sub, payload);

      if (result.ok) {
        sent++;
      } else if (result.expired) {
        // Subscription expirou (404/410) — limpar
        await deletePushSubscription(sub.endpoint);
        expired++;
      } else {
        failed++;
        console.error(`[cron/daily-push] Falha para ${sub.userId}:`, result.error);
      }
    } catch (err) {
      failed++;
      console.error(`[cron/daily-push] Erro inesperado para ${sub.userId}:`, err);
    }
  }

  return NextResponse.json({
    ok: true,
    sent,
    failed,
    expired,
    skipped,
    total: subs.length,
  });
}
