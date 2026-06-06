import 'dotenv/config';
import { syncGrimoire } from '../src/lib/grimoire/sync';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Starting Grimoire Synchronization...');
  const result = await syncGrimoire();
  console.log('Grimoire Sync Finished.');
  console.log(`Synced count: ${result.count}`);
  if (result.warnings.length > 0) {
    console.warn('Warnings:', result.warnings);
  }
}

main()
  .catch(err => {
    console.error('Sync failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
