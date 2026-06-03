// ============================================================
// ONBOARDING API - Cabala Dos Caminhos
// ============================================================
// POST - Save onboarding data and update user profile
// GET - Get current onboarding step for user
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for onboarding data
const onboardingDataSchema = z.object({
  nome: z.string().optional(),
  dataNascimento: z.string().optional(),
  hora: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  pais: z.string().optional(),
});

const onboardingRequestSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  step: z.number().int().min(0),
  data: onboardingDataSchema.optional(),
});

// fallow-ignore-next-line unused-type
export type OnboardingStep = 0 | 1 | 2 | 3 | 4 | 5;

// GET - Get current onboarding step for user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get user profile to determine current step
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        nomeCompleto: true,
        dataNascimento: true,
        horaNascimento: true,
        localNascimento: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate step based on filled fields
    let step: OnboardingStep = 0;

    if (user.nomeCompleto && user.nomeCompleto.length > 0) {
      step = 1;
    }
    if (user.dataNascimento) {
      step = 2;
    }
    if (user.horaNascimento) {
      step = 3;
    }
    if (user.localNascimento) {
      step = 4;
    }
    // Step 5 would be completion/activation

    return NextResponse.json({
      success: true,
      step,
      data: {
        hasName: !!(user.nomeCompleto && user.nomeCompleto.length > 0),
        hasBirthDate: !!user.dataNascimento,
        hasBirthTime: !!user.horaNascimento,
        hasBirthLocation: !!user.localNascimento,
      },
    });
  } catch (error) {
    // Check if it's a database connection error
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('P1000') || errorMessage.includes('AuthenticationFailed') || errorMessage.includes('connect')) {
      console.error('[API /onboarding GET] Database connection error:', error);
      return NextResponse.json(
        { error: 'Database unavailable', details: 'Unable to connect to database' },
        { status: 503 }
      );
    }
    console.error('[API /onboarding GET]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Save onboarding data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const parseResult = onboardingRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parseResult.error.errors },
        { status: 400 }
      );
    }

    const { userId, step, data } = parseResult.data;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (data) {
      if (data.nome) {
        updateData.nomeCompleto = data.nome;
      }
      if (data.dataNascimento) {
        // Parse date string to Date object
        const birthDate = new Date(data.dataNascimento);
        if (!isNaN(birthDate.getTime())) {
          updateData.dataNascimento = birthDate;
        }
      }
      if (data.hora) {
        updateData.horaNascimento = data.hora;
      }
      if (data.cidade || data.estado || data.pais) {
        // Build location string from parts
        const locationParts = [data.cidade, data.estado, data.pais].filter(Boolean);
        updateData.localNascimento = locationParts.join(', ');
      }
    }

    // Update user profile if there's data to update
    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
    }

    return NextResponse.json({
      success: true,
      step,
      message: 'Onboarding data saved successfully',
    });
  } catch (error) {
    // Check if it's a database connection error
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('P1000') || errorMessage.includes('AuthenticationFailed') || errorMessage.includes('connect')) {
      console.error('[API /onboarding POST] Database connection error:', error);
      return NextResponse.json(
        { error: 'Database unavailable', details: 'Unable to connect to database' },
        { status: 503 }
      );
    }
    console.error('[API /onboarding POST]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
