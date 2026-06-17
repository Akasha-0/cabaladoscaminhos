// Infrastructure prisma client stub — used by routes and re-exported via lib/prisma
// Tests mock this module directly; production code uses the real Prisma client.

export const prisma = {
  user: {
    findUnique: async () => null,
    update: async () => ({ id: '' }),
  },
  pushSubscription: {
    deleteMany: async () => ({ count: 0 }),
  },
} as const;
