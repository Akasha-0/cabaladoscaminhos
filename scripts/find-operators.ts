import { prisma } from '../src/lib/prisma';
import dotenv from 'dotenv';
dotenv.config(); // ensure env variables are loaded

async function main() {
  console.log('--- Operators in Database ---');
  const operators = await prisma.operator.findMany();
  console.log(`Found ${operators.length} operators:`);
  operators.forEach(op => {
    console.log(`- ID: ${op.id}, Name: ${op.name}, Email: ${op.email}, Role: ${op.role}`);
  });

  console.log('--- LLM Settings in Database ---');
  const settings = await prisma.operatorLlmSetting.findMany();
  console.log(`Found ${settings.length} settings:`);
  settings.forEach(s => {
    console.log(`- Operator ID: ${s.operatorId}, Provider: ${s.provider}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
