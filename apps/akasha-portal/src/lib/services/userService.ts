import { prisma } from '@/lib/infrastructure/prisma';

export const getUserById = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      locale: true,
      pushEnabled: true,
      ichingEnabled: true,
      birthDate: true,
      birthTime: true,
      birthCity: true,
    },
  });
};

export const updateUserIchingEnabled = async (id: string, ichingEnabled: boolean) => {
  return await prisma.user.update({
    where: { id },
    select: { ichingEnabled: true },
    data: { ichingEnabled },
  });
};
