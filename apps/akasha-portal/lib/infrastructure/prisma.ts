// DEPRECATED STUB — see src/lib/infrastructure/prisma.ts (canonical singleton).
//
// This file used to host a second PrismaClient without the PrismaPg adapter.
// It is unreferenced: every call site imports `@/lib/infrastructure/prisma`,
// which resolves to `src/lib/infrastructure/prisma.ts` per tsconfig paths.
// Re-export keeps any stray import on the canonical singleton so we never
// instantiate two Prisma clients (which would exhaust the connection pool).
//
// Removal will happen when the surrounding empty `lib/` directory is no
// longer needed for forward-compat with other tooling.

export { prisma } from '../../src/lib/infrastructure/prisma';
