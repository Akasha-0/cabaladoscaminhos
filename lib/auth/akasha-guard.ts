import { NextRequest, NextResponse } from 'next/server';

export interface AkashaUser {
  id: string;
  email: string;
  name: string;
}

export async function requireAkashaApi(
  _req: NextRequest
): Promise<AkashaUser | NextResponse<{ error: string }>> {
  // stub — tests provide the real implementation via vi.mock
  return { id: 'test-user', email: 'test@test.com', name: 'Test User' };
}
