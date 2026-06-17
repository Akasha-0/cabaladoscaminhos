/**
 * Página de destino do Share Target — F-240
 *
 * Quando o PWA é instalado, manifest.json expõe `share_target` apontando
 * para `/compartilhar/receber`. Esta página server-side:
 * 1. Faz parse do FormData (enviado pelo SO)
 * 2. Persiste como rascunho do Mentor
 * 3. Redireciona para /oraculo com o rascunho
 *
 * Esta página EXISTS como fallback visual para quando o redirect client-side
 * falha (e.g., user cancela). O 99% dos casos, o browser nem renderiza — só
 * faz POST e redirect.
 */

import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ intent?: string; rascunho?: string }>;
}

export default async function CompartilharReceberPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const authStatus = (await headers()).get('X-Akasha-Auth');
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;
  const payload = authStatus === 'refreshed' ? null : verifyAkashaToken(token, 'access');

  if (!payload && authStatus !== 'refreshed') {
    redirect(`/${locale}/login?return=${encodeURIComponent('/' + locale + '/compartilhar/receber')}`);
  }

  // Se recebeu intent via query (fallback), forward para /oraculo
  const sp = await searchParams;
  if (sp.intent) {
    redirect(`/${locale}/oraculo?intent=${encodeURIComponent(sp.intent)}`);
  }
  if (sp.rascunho) {
    redirect(`/${locale}/oraculo?rascunho=${encodeURIComponent(sp.rascunho)}`);
  }

  // Sem intent — provavelmente chegaram via GET direto
  // (não pelo share target). Mostrar mensagem amigável.
  return (
    <main
      style={{
        background: 'linear-gradient(180deg, #0B0E1C 0%, #1A1F3A 100%)',
        minHeight: 'calc(100vh - 56px)',
        padding: '48px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ maxWidth: 480, textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: 'var(--font-cinzel, serif)',
            color: '#FFFFFF',
            fontSize: '1.75rem',
            margin: '0 0 16px',
          }}
        >
          Compartilhar com Akasha
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontSize: '0.95rem' }}>
          Esta página recebe conteúdo compartilhado de outros apps. Para usar:
        </p>
        <ol
          style={{
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.7,
            textAlign: 'left',
            margin: '20px auto',
            maxWidth: 360,
            fontSize: '0.9rem',
          }}
        >
          <li>Abra qualquer texto/link no seu celular</li>
          <li>Toque em &quot;Compartilhar&quot;</li>
          <li>Escolha &quot;Akasha&quot; na lista de apps</li>
          <li>O Akasha cria um rascunho de pergunta para o Mentor</li>
        </ol>
        <a
          href={`/${locale}/dashboard`}
          style={{
            display: 'inline-block',
            marginTop: 24,
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #FF9500 0%, #FF3B30 100%)',
            color: '#0B0E1C',
            borderRadius: 12,
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
          }}
        >
          ← Voltar ao dashboard
        </a>
      </div>
    </main>
  );
}
