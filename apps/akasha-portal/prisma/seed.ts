import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Seed inicial — Wave 14.3.
 *
 * Insere o catálogo de 3 planos padrão (FREEMIUM, PRO, ENTERPRISE) +
 * mantém o upsert do admin Gabriel.
 *
 * Slugs são lowercase, únicos, e batem com a nomenclatura que o produto
 * usa no /conta (FREEMIUM / AKASHA_PRO) — a coluna `name` aceita string
 * livre para permitir admin criar planos custom via /admin/plans sem
 * migration.
 *
 * Pricing fictício para dev — substituir quando Stripe for integrado
 * (Wave X). Os valores aqui NÃO são cobrados; só populam o admin UI.
 */
const DEFAULT_PLANS = [
  {
    name: 'freemium',
    displayName: 'Freemium',
    priceCents: 0,
    creditsPerMonth: 5,
    features: [
      'Mandala + Mapa Astral completos',
      'Oráculo com 5 créditos/mês',
      'Diário de Manifestações',
      'Minha Caixa (9 dimensões)',
    ],
    isActive: true,
    sortOrder: 0,
  },
  {
    name: 'pro',
    displayName: 'Akasha Pro',
    priceCents: 3900, // R$ 39,00/mês
    creditsPerMonth: 60,
    features: [
      'Tudo do Freemium',
      '60 créditos/mês com o Mentor',
      'Web Push diário (Meu Dia 6h)',
      'Manifesto PDF ilimitado',
      'Export de dados completo',
    ],
    isActive: true,
    sortOrder: 10,
  },
  {
    name: 'enterprise',
    displayName: 'Enterprise (Zelador)',
    priceCents: 19900, // R$ 199,00/mês
    creditsPerMonth: 500,
    features: [
      'Tudo do Pro',
      '500 créditos/mês',
      'Multi-tenant: até 50 caminhantes',
      'Sessões, Mapas, Grimório Pessoal',
      'Notas de consulente + Pilares 6/7',
      'Suporte prioritário',
    ],
    isActive: true,
    sortOrder: 20,
  },
];

async function seedPlans() {
  for (const plan of DEFAULT_PLANS) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: {
        displayName: plan.displayName,
        priceCents: plan.priceCents,
        creditsPerMonth: plan.creditsPerMonth,
        features: plan.features,
        isActive: plan.isActive,
        sortOrder: plan.sortOrder,
      },
      create: plan,
    });
  }
  console.log(
    `✓ Plans seeded: ${DEFAULT_PLANS.map((p) => p.name).join(', ')}`
  );
}

async function seedAdmin() {
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
  console.log('✓ Admin user upserted: gabriel@cabaladoscaminhos.com');
}

async function main() {
  await seedPlans();
  await seedAdmin();
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());