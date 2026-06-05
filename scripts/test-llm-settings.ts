import { prisma } from '../src/lib/prisma';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log('Testing connection to OperatorLlmSetting...');
  const count = await prisma.operatorLlmSetting.count();
  console.log('Number of OperatorLlmSetting records:', count);

  const operators = await prisma.operator.findMany({
    take: 3,
    include: {
      llmSetting: true
    }
  });

  console.log('Operators fetched:', operators.length);
  operators.forEach(op => {
    console.log(`- Operator ID: ${op.id}, Name: ${op.name}`);
    console.log('  LlmSetting:', op.llmSetting);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
