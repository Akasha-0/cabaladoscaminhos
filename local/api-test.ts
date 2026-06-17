import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { AkashaInputSchema, calcular } from '@akasha/core';
import { sintetizarMapa } from '../apps/akasha-portal/src/lib/grimoire/synthesis/synthesizer';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

function formatISODate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function parseHora(time: string | null | undefined): string | undefined {
  if (!time) return undefined;
  const m = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(time);
  if (!m) return undefined;
  return `${m[1]}:${m[2]}`;
}

async function main() {
  // Use the Gabriel user with birthChart
  const user = await prisma.user.findFirst({
    where: {
      birthChart: { isNot: null }
    },
    select: {
      id: true,
      name: true,
      birthDate: true,
      birthTime: true,
      birthCity: true,
      birthChart: true
    }
  });

  if (!user) {
    console.error('No user with birth chart found.');
    return;
  }

  console.log(`Simulating for User: ${user.name}`);

  const inputParse = AkashaInputSchema.safeParse({
    nome: user.name,
    data_nascimento: formatISODate(user.birthDate!),
    hora_nascimento: parseHora(user.birthTime),
    local_nascimento: user.birthCity ?? 'local não informado',
    intencao_inicial: 'buscar clareza para o dia',
  });

  if (!inputParse.success) {
    console.error('Validation failed:', inputParse.error);
    return;
  }

  console.log('Input parsed successfully:', inputParse.data);

  try {
    const leitura = await calcular(inputParse.data);
    console.log('Calculation successful!');
    console.log('leitura.pilares:', Object.keys(leitura.pilares));
    
    // Now try to run sintetizarMapa
    console.log('Running sintetizarMapa...');
    const sint = sintetizarMapa(leitura.pilares);
    console.log('sintetizarMapa successful!');
    console.log('caminhoDeVida:', sint.caminhoDeVida);
    console.log('perfilGeral preview:', sint.perfilGeral.substring(0, 100) + '...');
    console.log('autoridade:', sint.autoridade.estrategia, sint.autoridade.autoridade);
  } catch (err) {
    console.error('CRASH in engine or synthesizer:', err);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
