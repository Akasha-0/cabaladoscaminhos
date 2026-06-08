/**
 * daily-transits-cron.ts
 *
 * Cron script: roda à meia-noite UTC e pré-calcula o conteúdo diário
 * (clima, ritual, alerta) para todos os usuários com mapa natal completo.
 *
 * Uso:
 *   npx ts-node -P tsconfig.json scripts/daily-transits-cron.ts
 *
 * Cron (crontab):
 *   0 0 * * * cd /app && npx ts-node scripts/daily-transits-cron.ts >> /var/log/akasha-daily.log 2>&1
 *
 * O que faz (AD-T5-E):
 *   1. Busca todos os User com BirthChart completo (incomplete=false)
 *   2. Para cada usuário, faz upsert do DailyReading para hoje (idempotente:
 *      a chave única @@unique([userId, date]) impede duplicidade em re-execuções)
 *   3. Persiste o conteúdo no DB; o cache Redis foi removido por ser morto
 *      (chave escrita mas nunca lida em runtime).
 *   4. (T7) Para usuários com `pushEnabled = true` e subscription ativa,
 *      envia uma notificação Web Push genérica (Doc 22 AD-22.2: nunca
 *      incluir conteúdo do ritual no payload).
 *
 * Doc 08 Onda 3.6 · Doc 25 §4 (Motor Diário) · Doc 25 §11 (Push)
 */

import { PrismaClient } from '@prisma/client';
import { buildDailyContent } from '../src/lib/akasha/daily-engine';
import { computeDailyHexagram } from '../src/lib/daily-engine/iching';
import { configureVapid, sendPush } from '../src/lib/push/send';
import { logSecurityEvent } from '../src/lib/logging';

const prisma = new PrismaClient();

const VAPID_READY = configureVapid();

async function main() {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

  console.log(`[daily-transits-cron] Iniciando para ${dateStr}`);

  const users = await prisma.user.findMany({
    include: {
      birthChart: { select: { astrologyMap: true, kabalisticMap: true, tantricMap: true, oduBirth: true, incomplete: true } },
    },
    where: { birthChart: { incomplete: false } },
  });

  console.log(`[daily-transits-cron] ${users.length} usuários com mapa completo`);

  let upserted = 0;
  let skipped = 0;

  for (const user of users) {
    if (!user.birthChart) continue;

    try {
      const content = buildDailyContent(
        user.birthChart.astrologyMap,
        user.birthChart.kabalisticMap,
        user.birthChart.tantricMap,
        user.birthChart.oduBirth,
        today,
      );

      // v0.0.5 T7: hexagrama do dia (5º sistema oracular) persistido.
      // Determinístico por data — mesmo input para todos os usuários no batch.
      const dailyHex = computeDailyHexagram(today);

      // AD-T5-E: upsert idempotente (chave única userId+date).
      // Antes: findUnique + create (vulnerável a corrida/duplicidade em re-execuções).
      await prisma.dailyReading.upsert({
        where: { userId_date: { userId: user.id, date: today } },
        create: {
          userId: user.id,
          date: today,
          climate: content.climate,
          ritual: content.ritual as object,
          alert: content.alert,
          tensionPoint: content.tensionPoint as object,
          hexagram: String(dailyHex.hexagramNumber),
          hexagramLines: dailyHex.lines as object,
        },
        update: {
          climate: content.climate,
          ritual: content.ritual as object,
          alert: content.alert,
          tensionPoint: content.tensionPoint as object,
          hexagram: String(dailyHex.hexagramNumber),
          hexagramLines: dailyHex.lines as object,
        },
      });

      upserted++;
    } catch (err) {
      // Falha ao persistir este usuário: registrar e seguir (não abortar o batch).
      console.error(`[daily-transits-cron] Erro para userId=${user.id}:`, err);
      skipped++;
    }
  }

  // T7 / Doc 25 §11: enviar push genérico (sem conteúdo do ritual)
  // para quem tem pushEnabled + subscription ativa.
  if (VAPID_READY) {
    const subscribers = await prisma.user.findMany({
      where: {
        pushEnabled: true,
        pushSubscriptions: { some: {} },
      },
      select: {
        id: true,
        pushSubscriptions: {
          select: { endpoint: true, p256dh: true, auth: true },
        },
      },
    });

    console.log(`[daily-transits-cron] ${subscribers.length} usuários com push ativo`);

    let pushSent = 0;
    let pushFailed = 0;

    for (const sub of subscribers) {
      for (const ps of sub.pushSubscriptions) {
        const result = await sendPush(
          {
            endpoint: ps.endpoint,
            keys: { p256dh: ps.p256dh, auth: ps.auth },
          },
          {
            title: 'Akasha',
            body: 'Seu ritual de hoje está pronto', // genérico, AD-22.2
            url: '/diario',
          }
        );

        if (result.ok) {
          pushSent++;
        } else {
          pushFailed++;
          // 404/410: subscription morreu — limpar para não tentar de novo amanhã.
          if (result.expired) {
            await prisma.pushSubscription.deleteMany({ where: { endpoint: ps.endpoint } });
          }
        }

        logSecurityEvent('push.sent', {
          userId: sub.id,
          date: dateStr,
          ok: result.ok,
          expired: result.ok ? undefined : Boolean(result.expired),
          error: result.ok ? undefined : result.error,
        });
      }
    }

    console.log(`[daily-transits-cron] Push: ${pushSent} enviados, ${pushFailed} falhos`);
  } else {
    console.warn('[daily-transits-cron] VAPID não configurado — push ignorado');
  }

  console.log(`[daily-transits-cron] Concluído: ${upserted} processados, ${skipped} com erro`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('[daily-transits-cron] Fatal:', err);
  process.exit(1);
});
