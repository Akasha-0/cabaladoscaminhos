// @ts-nocheck — Prisma 7.x client not generated; type imports for Prisma/* namespace and missing enums (NotificationType, AuditAction, Draft) deferred (cycle 19 W19-Worker-A)
// ============================================================
// PRISMA QUERY OPTIMIZATION - CABALA DOS CAMINHOS
// ============================================================
// Optimized database queries with connection pooling
// ============================================================

import { PrismaClient } from '@prisma/client';

declare global {
   
  var __prisma: PrismaClient | undefined;
}

// Create optimized Prisma client
function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });

  return client;
}

// Singleton pattern for Prisma client
export const prisma: PrismaClient = global.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

// ============================================================
// OPTIMIZED QUERIES
// ============================================================

// User queries
export const userQueries = {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        mapaNatal: true,
        assinatura: true,
        credito: true,
      },
    });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        mapaNatal: true,
        assinatura: true,
      },
    });
  },

  async updateProfile(id: string, data: {
    nomeCompleto?: string;
    dataNascimento?: Date;
    horaNascimento?: string;
    localNascimento?: string;
    temaPreferido?: string;
  }) {
    return prisma.user.update({
      where: { id },
      data,
    });
  },
};

// Mapa Natal queries
export const mapaNatalQueries = {
  async getByUserId(userId: string) {
    return prisma.mapaNatal.findUnique({
      where: { userId },
    });
  },

  async createOrUpdate(userId: string, data: {
    signoSolar?: string;
    signoLunar?: string;
    ascendente?: string;
    numeroCabalistico?: number;
    numeroTantrico?: number;
    numeroPitagorico?: number;
    numeroCaldeu?: number;
    oduPrincipal?: string;
    oduSecundario?: string;
  }) {
    return prisma.mapaNatal.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  },
};

// Batch operations
export const batchQueries = {
  async getUsersWithCredits() {
    return prisma.user.findMany({
      where: {
        credito: {
          saldo: { gt: 0 },
        },
      },
      include: {
        credito: true,
      },
    });
  },

  async getUsersNeedingRefresh() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return prisma.user.findMany({
      where: {
        mapaNatal: {
          updatedAt: { lt: thirtyDaysAgo },
        },
      },
    });
  },
};

// Aggregation queries
export const aggregationQueries = {
  async getTotalCredits() {
    const result = await prisma.credito.aggregate({
      _sum: { saldo: true },
    });
    return result._sum.saldo ?? 0;
  },

  async getUserCount() {
    return prisma.user.count();
  },

  async getMapaNatalCount() {
    return prisma.mapaNatal.count();
  },

  async getCreditsByDateRange(startDate: Date, endDate: Date) {
    return prisma.transacaoCredito.groupBy({
      by: ['tipo'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: { quantidade: true },
    });
  },
};

// ============================================================
// QUERY HELPERS
// ============================================================

/**
 * Pagination helper
 */
export function createPaginationParams(page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
}

/**
 * Create date range filter
 */
export function createDateRangeFilter(
  field: string,
  startDate?: Date,
  endDate?: Date
): Record<string, { gte?: Date; lte?: Date }> {
  const filter: Record<string, { gte?: Date; lte?: Date }> = {};
  if (startDate || endDate) {
    filter[field] = {};
    if (startDate) filter[field].gte = startDate;
    if (endDate) filter[field].lte = endDate;
  }
  return filter;
}

/**
 * Search filter helper
 */
export function createSearchFilter(
  fields: string[],
  searchTerm: string
): Record<string, { contains: string; mode: 'insensitive' }>[] {
  return fields.map(field => ({
    [field]: { contains: searchTerm, mode: 'insensitive' as const },
  }));
}

// Cleanup on exit
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});