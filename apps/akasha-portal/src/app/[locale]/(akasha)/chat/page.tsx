/**
 * /[locale]/(akasha)/chat — Wave 28.3 Mentor Chat UX Unificado
 *
 * Página unificada que combina:
 *   - Wave 10.4 <MentorChat> (chat streaming + typewriter + tool indicators)
 *   - Wave 23.2/27.2 papers inline ("Papers que sustentam isso")
 *
 * Quando o usuário envia uma mensagem e o Mentor responde, a coluna
 * lateral (desktop) / painel inferior (mobile < 768px) carrega os
 * papers que sustentam aquela resposta — via adapter
 * `loadDiscoveryViewModel` com id derivado deterministicamente da query.
 *
 * Arquitetura (ADR-013 — universalista + visceral):
 *   - Server shell: auth + render client island.
 *   - Client island <MentorChatUnified>: orquestra MentorChat + papers panel.
 *   - NÃO mexe em /api/mentor/ask (backend Wave 10.4 untouched).
 *   - NÃO mexe em packages/mentor/src/* (Wave 10.4 untouched).
 *   - RE-USA PaperChip (Wave 23.2) para renderizar papers — visual
 *     consistente com /discoveries/[id] e /atendimento/[discoveryId].
 *
 * Mobile-first 360px: stack vertical (chat → papers). Desktop ≥ 768px:
 * grid 2 colunas (chat 60% | papers 40%).
 *
 * LGPD: o adapter filtra PII — view-model tem só contexto derivado.
 * Nenhum User row é exposto na response (server filtra antes).
 *
 * i18n: namespace `mentor.unified.*` (10 chaves pt-BR + 10 en).
 */

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { MentorChatUnified } from '@/components/akasha/mentor-unified/MentorChatUnified';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';

export const metadata = {
  title: 'Chat com Mentor — Akasha OS',
  description:
    'Converse com seu Mentor Akasha. Cada resposta vem com os papers científicos que a sustentam. (Wave 28.3)',
};

interface ChatPageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Decodifica o sub (userId) do JWT sem validar a assinatura.
 * Mesmo padrão de /meu-dia, /mentor, /dashboard — extraído aqui
 * para evitar dependência circular entre server components.
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

export default async function ChatPage({ params }: ChatPageProps) {
  const { locale } = await params;

  // Auth — mesmo padrão Wave 10.4 /mentor + Wave 22.2 /atendimento.
  // Middleware já gated a rota, mas defense-in-depth aqui também.
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

  return <MentorChatUnified locale={locale} userId={userId} />;
}
