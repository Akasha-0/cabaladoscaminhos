import 'dotenv/config';
// Real implementation: parses ./grimoire/**/*.md, generates embeddings
// via Ollama, upserts to Supabase. The stub at src/lib/grimoire/sync.ts
// always returns { synced: 0 } — kept around for tests.
import { syncGrimoire } from '../src/lib/infrastructure/grimoire-sync';
import { prisma } from '../src/lib/infrastructure/prisma';

async function main() {
  await syncGrimoire();
}

main()
  .catch(err => {
    console.error('Sync failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
