// ============================================================================
// /api/waitlist/accept-invite — Aceitar invite token (Wave 32, 2026-06-30)
// ============================================================================
// Quando o lead clica no link do email "wave invite", esse endpoint:
//   1. Valida email + inviteToken
//   2. Marca o lead como 'accepted' no JSON
//   3. Redireciona para /onboarding com um magic-link token (auto-cadastro)
//
// Por enquanto, redireciona para /onboarding com query params — o auto-cadastro
// completo será adicionado em W33 quando a tabela Prisma estiver pronta.
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { trackEvent } from '@/lib/analytics/events';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const WAITLIST_PATH = path.join(process.cwd(), 'data', 'waitlist.json');

interface WaitlistEntry {
  email: string;
  displayName?: string;
  tradition: string | null;
  status: string;
  inviteToken: string | null;
  inviteExpiresAt: string | null;
  updatedAt: string;
}

async function readWaitlist(): Promise<{ version: 2; entries: WaitlistEntry[] }> {
  try {
    const raw = await fs.readFile(WAITLIST_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { version: 2, entries: [] };
  }
}

async function writeWaitlist(file: { version: 2; entries: WaitlistEntry[] }): Promise<void> {
  await fs.mkdir(path.dirname(WAITLIST_PATH), { recursive: true });
  await fs.writeFile(WAITLIST_PATH, JSON.stringify(file, null, 2), 'utf-8');
}

function hashEmail(email: string): string {
  let h = 0;
  for (let i = 0; i < email.length; i++) {
    h = ((h << 5) - h + email.charCodeAt(i)) | 0;
  }
  return `h_${Math.abs(h).toString(36)}`;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email')?.trim().toLowerCase();
  const token = url.searchParams.get('token');

  if (!email || !token) {
    return NextResponse.redirect(new URL('/validacao?error=invalid_invite', request.url));
  }

  const file = await readWaitlist();
  const entry = file.entries.find((e) => e.email === email);
  if (!entry || entry.inviteToken !== token) {
    return NextResponse.redirect(new URL('/validacao?error=invalid_invite', request.url));
  }

  if (entry.inviteExpiresAt && new Date(entry.inviteExpiresAt) < new Date()) {
    return NextResponse.redirect(new URL('/validacao?error=expired_invite', request.url));
  }

  if (entry.status !== 'invited') {
    // Já aceito ou outro estado — redireciona para onboarding se accepted
    if (entry.status === 'accepted') {
      return NextResponse.redirect(new URL('/onboarding?from=beta', request.url));
    }
    return NextResponse.redirect(new URL('/validacao?error=invalid_invite', request.url));
  }

  entry.status = 'accepted';
  entry.inviteToken = null;
  entry.updatedAt = new Date().toISOString();
  await writeWaitlist(file);

  void trackEvent({ name: 'invite_accepted', properties: { email_hash: hashEmail(email) } });

  // Redireciona para onboarding com o email pré-preenchido.
  // W33 vai trocar isso por um magic-link que cria a conta automaticamente.
  const onboardingUrl = new URL('/onboarding', request.url);
  onboardingUrl.searchParams.set('email', email);
  onboardingUrl.searchParams.set('from', 'beta-invite');
  return NextResponse.redirect(onboardingUrl);
}