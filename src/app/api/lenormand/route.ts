/**
 * Lenormand Mesa Real API — STUB (B2C legado quarentenado via LEGACY_B2C).
 * Rota fora de uso. Mantida apenas como stub de compilação.
 */
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { error: 'B2C legado quarentenado — use /cockpit para o Cockpit Oracular' },
    { status: 404 }
  );
}
