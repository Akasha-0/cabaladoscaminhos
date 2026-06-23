import { prisma } from '@/lib/infrastructure/prisma';
import type { Consultation } from '@prisma/client';

export const createConsultation = async (userId: string, title: string): Promise<Pick<Consultation, 'id'>> => {
  return await prisma.consultation.create({
    data: { userId, title },
    select: { id: true },
  });
};

export const findConsultationById = async (id: string, userId: string): Promise<Pick<Consultation, 'id'> | null> => {
  return await prisma.consultation.findFirst({
    where: { id, userId },
    select: { id: true },
  });
};
