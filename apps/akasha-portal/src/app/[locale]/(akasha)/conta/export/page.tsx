/**
 * /[locale]/(akasha)/conta/export — LGPD Art. 18 (V) Export Center
 *
 * Lista os 3 tipos de export disponíveis:
 *   - Manifesto (PDF)
 *   - Mapa (JSON)
 *   - Uso (CSV / JSON)
 *
 * Implementação mobile-first: usa links diretos (`<a href>`) com
 * `Content-Disposition: attachment` configurado no servidor. Sem JS —
 * funciona em qualquer browser, inclusive iOS Safari com "Files" app.
 *
 * LGPD: página privada (server-side redirect se não autenticado).
 * Texto introdutório explica Art. 18 (V) — direito à portabilidade.
 */

import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';

export const metadata: Metadata = {
  title: 'Exportar meus dados — Akasha Portal',
  description:
    'Exporte seus dados pessoais conforme LGPD Art. 18 (V) — direito de portabilidade.',
};

const glassCard: React.CSSProperties = {
  background: 'rgba(124, 58, 237, 0.05)',
  border: '1px solid rgba(124, 58, 237, 0.2)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
};

const EXPORTS = [
  {
    id: 'manifesto',
    title: 'Manifesto Akasha (PDF)',
    description:
      'PDF personalizado com seu nome, dados de nascimento e os 5 Pilares. Pronto para imprimir e compartilhar.',
    filename: 'akasha-manifesto.pdf',
    icon: '✦',
    color: '#A78BFA',
  },
  {
    id: 'map',
    title: 'Mapa completo (JSON)',
    description:
      'JSON estruturado com identidade, dados de nascimento, mapa dos 5 Pilares, subscription e manifesto. Schema versionado.',
    filename: 'akasha-map.json',
    icon: '◈',
    color: '#7C3AED',
  },
  {
    id: 'usage',
    title: 'Histórico de uso (CSV)',
    description:
      'Planilha com todo o histórico de créditos: data, delta, razão e saldo. Para análise em Excel/Google Sheets.',
    filename: 'akasha-usage.csv',
    icon: '◇',
    color: '#F59E0B',
    extraLink: { label: 'Versão JSON', href: '/api/export/usage?format=json' },
  },
] as const;

export default async function ExportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Auth (mesmo padrão do /conta/page.tsx)
  const cookieStore = await cookies();
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;
  const authStatus = (await headers()).get('X-Akasha-Auth');
  if (authStatus !== 'refreshed' && (!token || !verifyAkashaToken(token, 'access'))) {
    redirect(`/${locale}/login`);
  }

  return (
    <main
      style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: '1.5rem 1.25rem 6rem',
        fontFamily: 'system-ui, sans-serif',
        color: '#e4e4e7',
      }}
    >
      <header style={{ marginBottom: '1.5rem' }}>
        <p
          style={{
            fontSize: '0.75rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(167, 139, 250, 0.7)',
            marginBottom: '0.4rem',
          }}
        >
          Seus dados · LGPD
        </p>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>
          Exportar meus dados
        </h1>
        <p
          style={{
            fontSize: '0.95rem',
            color: 'rgba(226, 232, 240, 0.7)',
            lineHeight: 1.55,
            marginTop: '0.75rem',
          }}
        >
          Conforme a{' '}
          <strong>Lei Geral de Proteção de Dados (LGPD, Art. 18, V)</strong>,
          você tem direito a uma cópia portátil de todos os seus dados
          armazenados no Akasha Portal. Selecione abaixo o formato que
          deseja baixar. Os arquivos são gerados em tempo real a partir do
          nosso banco e nunca contêm dados de outros usuários.
        </p>
      </header>

      <section
        aria-label="Opções de export"
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        {EXPORTS.map((exp) => (
          <article key={exp.id} style={glassCard} className="p-5">
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
              <span
                aria-hidden
                style={{
                  fontSize: '1.6rem',
                  lineHeight: 1,
                  color: exp.color,
                  flexShrink: 0,
                }}
              >
                {exp.icon}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 600,
                    color: '#E2E8F0',
                    margin: '0 0 0.25rem',
                  }}
                >
                  {exp.title}
                </h2>
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'rgba(226, 232, 240, 0.6)',
                    lineHeight: 1.5,
                    margin: '0 0 0.85rem',
                  }}
                >
                  {exp.description}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <a
                    href={`/api/export/${exp.id}`}
                    download={exp.filename}
                    style={{
                      display: 'inline-block',
                      padding: '0.55rem 1rem',
                      borderRadius: '12px',
                      background: exp.color,
                      color: '#0a0a0f',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                    }}
                  >
                    Baixar {exp.filename}
                  </a>
                  {'extraLink' in exp && exp.extraLink && (
                    <a
                      href={exp.extraLink.href}
                      download={`akasha-usage.json`}
                      style={{
                        display: 'inline-block',
                        padding: '0.55rem 1rem',
                        borderRadius: '12px',
                        background: 'transparent',
                        border: `1px solid ${exp.color}`,
                        color: exp.color,
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                      }}
                    >
                      {exp.extraLink.label}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      <footer
        style={{
          marginTop: '2rem',
          padding: '1rem',
          borderRadius: '12px',
          border: '1px solid rgba(124, 58, 237, 0.12)',
          fontSize: '0.8rem',
          color: 'rgba(226, 232, 240, 0.55)',
          lineHeight: 1.55,
        }}
      >
        <p style={{ margin: '0 0 0.4rem' }}>
          <strong style={{ color: '#A78BFA' }}>Outros direitos LGPD:</strong>
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
          <li>
            <a
              href={`/${locale}/conta/legal`}
              style={{ color: '#A78BFA', textDecoration: 'underline' }}
            >
              Aviso legal e seus direitos completos
            </a>
          </li>
          <li>
            Para excluir sua conta ou revogar consentimento:{' '}
            <a
              href="mailto:privacidade@akasha.portal"
              style={{ color: '#A78BFA', textDecoration: 'underline' }}
            >
              privacidade@akasha.portal
            </a>
          </li>
        </ul>
      </footer>
    </main>
  );
}