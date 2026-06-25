/**
 * /[locale]/(akasha)/atendimento — Wave 22.2 Zelador Attendance UI (Visceral)
 *
 * Server-component shell que:
 *   1. Autentica via cookie `__Host-akasha_session` (mesmo padrão de
 *      /meu-dia, /mentor, /dashboard — middleware já gated a rota).
 *   2. Resolve o nome do Zelador para saudação no top bar.
 *   3. Renderiza <AttendanceClient>, um client island que monta o fluxo
 *      completo de atendimento: Cliente | Insights IA | Chat Mentor.
 *
 * Por que server shell + client island:
 *   - A página em si é metadata estática (title + description) + auth.
 *   - O fluxo usa `useEmotionalState` (localStorage) + streaming do Mentor
 *     + POSTs de feedback (POST /api/feedback) — forçam boundary client.
 *
 * Wave 22.2 constraints (ver plan):
 *   - NÃO mexe em /api/mentor/ask (backend) ou /api/feedback (backend).
 *   - NÃO mexe em packages/mentor/src/* (Wave 10.4 já integrado).
 *   - Integração com MessageRating existente (Wave 13.5) para thumbs up/down.
 *   - Mobile-first: 360px stack via tabs (Cliente | Insights | Chat).
 *
 * Universalista + visceral (ADR-013):
 *   - Cross-correlação dos 5 Pilares aparece nos InsightCards.
 *   - Tom ritual sem ser místico-demais: fala direto, sem floreio.
 */

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { AttendanceClient } from '@/components/akasha/attendance/AttendanceClient';
import {
  verifyAkashaToken,
  AKASHA_TOKEN_COOKIE,
} from '@/lib/application/auth/akasha-jwt';

export const metadata = {
  title: 'Atendimento — Akasha OS',
  description:
    'Sessão ao vivo com seu cliente. Estados emocionais, chat com Mentor, insights da IA — tudo em uma tela feita para o celular do Zelador.',
};

interface AtendimentoPageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Decodifica o sub (userId) do JWT sem validar a assinatura.
 * Mesma rotina usada em /meu-dia e /mentor — extraída aqui para evitar
 * dependência circular entre server components.
 */
function extractSubFromJwt(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const decoded = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    ) as { sub?: string };
    return decoded.sub ?? null;
  } catch {
    return null;
  }
}

export default async function AtendimentoPage({ params }: AtendimentoPageProps) {
  const { locale } = await params;

  // Auth — middleware já gated a rota, mas checamos redundância aqui
  // para defense-in-depth (não confiar 100% no middleware de dev).
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

  // Saudação para o Zelador (mesmo padrão de /meu-dia).
  let zeladorName = 'Zelador';
  try {
    const { prisma } = await import('@/lib/infrastructure/prisma');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    if (user?.name) zeladorName = user.name.split(' ')[0];
    else if (user?.email) zeladorName = user.email.split('@')[0];
  } catch {
    // prisma indisponível nesse build (CI sem DB) — fallback.
  }

  return <AttendanceClient locale={locale} zeladorName={zeladorName} />;
}
