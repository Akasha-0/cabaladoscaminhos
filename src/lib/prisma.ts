import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL não está definida');
  }

  // Connection pool settings optimized for Next.js serverless
  // - Low max connections to prevent pool exhaustion in serverless
  // - Connection timeout to fail fast
  // - Idle timeout to release connections quickly
  const pool = new pg.Pool({
    connectionString,
    max: 5,                    // Max connections per instance
    idleTimeoutMillis: 10000,  // Release idle connections after 10s
    connectionTimeoutMillis: 5000, // Fail fast if can't connect
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    // Disable PreparedStatementCache in serverless to prevent memory leaks
    datasources: {
      db: {
        url: connectionString,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});