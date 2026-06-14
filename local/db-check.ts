import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      birthDate: true,
      birthTime: true,
      birthCity: true,
      birthChart: {
        select: {
          id: true,
        }
      }
    }
  });

  console.log(`Total users in DB: ${users.length}`);
  for (const u of users) {
    console.log(`- ID: ${u.id}, Name: ${u.name}, Email: ${u.email}`);
    console.log(`  BirthDate: ${u.birthDate}, Time: ${u.birthTime}, City: ${u.birthCity}`);
    console.log(`  BirthChart ID: ${u.birthChart?.id ?? 'MISSING'}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
