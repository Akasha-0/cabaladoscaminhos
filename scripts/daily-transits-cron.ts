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
 *
 * Doc 08 Onda 3.6 · Doc 25 §4 (Motor Diário)
 */

import { PrismaClient } from '@prisma/client';
import { buildDailyContent } from '../src/lib/akasha/daily-engine';

const prisma = new PrismaClient();

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
        },
        update: {
          climate: content.climate,
          ritual: content.ritual as object,
          alert: content.alert,
          tensionPoint: content.tensionPoint as object,
        },
      });

      upserted++;
    } catch (err) {
      // Falha ao persistir este usuário: registrar e seguir (não abortar o batch).
      console.error(`[daily-transits-cron] Erro para userId=${user.id}:`, err);
      skipped++;
    }
  }

  console.log(`[daily-transits-cron] Concluído: ${upserted} processados, ${skipped} com erro`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('[daily-transits-cron] Fatal:', err);
  process.exit(1);
});
