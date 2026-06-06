import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const registerSchema = z.object({
  email: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
    z.string().email('Email inválido')
  ),
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
  fullName: z.string().min(2, 'Nome completo obrigatório'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'birthDate deve ser YYYY-MM-DD'),
  birthTime: z.string().min(1, 'Horário de nascimento obrigatório'),
  birthCity: z.string().min(1, 'Cidade de nascimento obrigatória'),
  birthState: z.string().min(1, 'Estado de nascimento obrigatório'),
  birthCountry: z.string().min(1, 'País de nascimento obrigatório'),
  birthLatitude: z.number().optional(),
  birthLongitude: z.number().optional(),
  birthTimezone: z.string().optional(),
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: 'Consentimento é obrigatório' }),
  }),
});

export async function POST(request: NextRequest) {
  let body: z.infer<typeof registerSchema>;
  try {
    body = registerSchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: err.flatten() },
        { status: 400 }
      );
    }
    throw err;
  }

  const existing = await prisma.akashaUser.findUnique({
    where: { email: body.email },
    select: { id: true },
  });
  if (existing) {
    // Mensagem genérica — anti-enumeração de emails.
    return NextResponse.json(
      { message: 'Conta criada. Verifique seu e-mail.' },
      { status: 201 }
    );
  }

  const passwordHash = await bcrypt.hash(body.password, 12);

  await prisma.akashaUser.create({
    data: {
      email: body.email,
      passwordHash,
      fullName: body.fullName,
      birthDate: new Date(body.birthDate),
      birthTime: body.birthTime,
      birthCity: body.birthCity,
      birthState: body.birthState,
      birthCountry: body.birthCountry,
      birthLatitude: body.birthLatitude,
      birthLongitude: body.birthLongitude,
      birthTimezone: body.birthTimezone,
      consentGiven: true,
      consentAt: new Date(),
    },
  });

  return NextResponse.json(
    { message: 'Conta criada. Verifique seu e-mail.' },
    { status: 201 }
  );
}
