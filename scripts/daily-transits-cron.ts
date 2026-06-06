/**
 * daily-transits-cron.ts
 *
 * Cron script: roda à meia-noite UTC e pré-calcula os trânsitos do dia
 * para todos os usuários com mapa natal completo.
 *
 * Uso:
 *   npx ts-node -P tsconfig.json scripts/daily-transits-cron.ts
 *
 * Cron (crontab):
 *   0 0 * * * cd /app && npx ts-node scripts/daily-transits-cron.ts >> /var/log/akasha-daily.log 2>&1
 *
 * O que faz:
 *   1. Busca todos os AkashaUser com BirthChart completo (incomplete=false)
 *   2. Para cada usuário, verifica se já existe AkashaDailyReading para hoje
 *   3. Se não, chama buildDailyContent e persiste no DB
 *   4. Armazena chave Redis SETEX akasha:daily:{userId}:{date} com TTL 25h
 *
 * Doc 08 Onda 3.6 · Doc 25 §4 (Motor Astrológico Diário)
 */

import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import { buildDailyContent } from '../src/lib/akasha/daily-engine';

const prisma = new PrismaClient();

async function main() {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

  console.log(`[daily-transits-cron] Iniciando para ${dateStr}`);

  const redis = createClient({ url: process.env.REDIS_URL ?? 'redis://localhost:6379' });
  await redis.connect();

  const users = await prisma.akashaUser.findMany({
    include: {
      birthChart: { select: { astrologyMap: true, kabalisticMap: true, tantricMap: true, oduBirth: true, incomplete: true } },
    },
    where: { birthChart: { incomplete: false } },
  });

  console.log(`[daily-transits-cron] ${users.length} usuários com mapa completo`);

  let created = 0;
  let skipped = 0;

  for (const user of users) {
    if (!user.birthChart) continue;

    const existing = await prisma.akashaDailyReading.findUnique({
      where: { userId_date: { userId: user.id, date: today } },
      select: { id: true },
    });

    if (existing) { skipped++; continue; }

    try {
      const content = buildDailyContent(
        user.birthChart.astrologyMap,
        user.birthChart.kabalisticMap,
        user.birthChart.tantricMap,
        user.birthChart.oduBirth,
        today,
      );

      await prisma.akashaDailyReading.create({
        data: {
          userId: user.id,
          date: today,
          climate: content.climate,
          ritual: content.ritual as object,
          alert: content.alert,
          tensionPoint: content.tensionPoint as object,
        },
      });

      const cacheKey = `akasha:daily:${user.id}:${dateStr}`;
      await redis.setEx(cacheKey, 25 * 60 * 60, JSON.stringify(content));

      created++;
    } catch (err) {
      console.error(`[daily-transits-cron] Erro para userId=${user.id}:`, err);
    }
  }

  console.log(`[daily-transits-cron] Concluído: ${created} criados, ${skipped} já existiam`);
  await redis.quit();
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('[daily-transits-cron] Fatal:', err);
  process.exit(1);
});
