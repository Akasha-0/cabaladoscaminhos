import { prisma } from '../src/lib/prisma';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  // Access a property to force lazy proxy instantiation
  const keys = Object.keys(prisma);
  console.log('Prisma keys:', keys);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
