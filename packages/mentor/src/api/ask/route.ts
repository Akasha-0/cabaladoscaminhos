// API route: POST /api/mentor/ask

import { NextRequest, NextResponse } from 'next/server';

interface AskRequest {
  question: string;
  userId?: string;
  context?: {
    name?: string;
    birthDate?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: AskRequest = await request.json();

    if (!body.question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Placeholder implementation
    const response = {
      answer: `Processing your question: "${body.question}". This is a placeholder response.`,
      confidence: 0.7,
      system: 'mentor-v0.0.11',
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/mentor/ask',
    method: 'POST',
  });
}
