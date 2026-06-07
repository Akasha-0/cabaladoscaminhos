import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error('SEED_ADMIN_PASSWORD é obrigatório para criar o usuário admin.');
  }
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: 'gabriel@cabaladoscaminhos.com' },
    update: {
      name: 'Gabriel',
      emailVerified: true,
      passwordHash,
      role: 'ADMIN',
    },
    create: {
      email: 'gabriel@cabaladoscaminhos.com',
      name: 'Gabriel',
      emailVerified: true,
      passwordHash,
      role: 'ADMIN',
    },
  });
  console.log('✅ Usuário admin criado/atualizado.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
