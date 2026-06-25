/**
 * /[locale]/(akasha)/mentor — Wave 10.4 Mentor Chat UX
 *
 * Server-component shell that:
 *   1. Authenticates the request via the __Host- cookie (same shape as
 *      /meu-dia and /dashboard — middleware already gated the route).
 *   2. Renders <MentorChat>, a client island, passing the resolved locale.
 *
 * The actual chat UX (streaming, typewriter, suggestion chips, tool
 * indicator, credit counter, empty state, error state) lives in
 * `src/components/akasha/mentor-chat/MentorChat.tsx`.
 *
 * Why server shell + client island:
 *   - The page itself is a static metadata target.
 *   - The chat uses `useEmotionalState` (localStorage) and streams from
 *     `/api/mentor/ask`, both browser-only — forced client boundary.
 *
 * Wave 10.4 constraints (see plan):
 *   - NÃO mexe em /api/mentor/ask (backend).
 *   - NÃO mexe em packages/mentor/src/{intent-detector,tool-dispatcher}.ts.
 *   - Integração com streaming já existente: server returns text/event-stream,
 *     client reads via fetch + ReadableStream.
 */
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { MentorChat } from '@/components/akasha/mentor-chat/MentorChat';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';

export const metadata = {
  title: 'Mentor Akasha — Akasha OS',
  description:
    'Converse com seu Mentor Akasha. Ele cruza os 5 Pilares com seu mapa para responder com profundidade ritualística.',
};

interface MentorPageProps {
  params: Promise<{ locale: string }>;
}

function extractSubFromJwt(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8')) as {
      sub?: string;
    };
    return decoded.sub ?? null;
  } catch {
    return null;
  }
}

export default async function MentorPage({ params }: MentorPageProps) {
  const { locale } = await params;

  // Auth — same shape as /meu-dia and /dashboard.
  const cookieStore = await cookies();
  const authStatus = (await headers()).get('X-Akasha-Auth');
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;

  let userId: string | null = null;
  if (authStatus === 'refreshed') {
    userId = extractSubFromJwt(token);
  } else if (verifyAkashaToken(token, 'access')) {
    userId = extractSubFromJwt(token);
  }

  if (!userId) redirect(`/${locale}/login`);

  return <MentorChat locale={locale} />;
}
