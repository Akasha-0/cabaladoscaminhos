/**
 * Significado Primeiro — F-238
 *
 * Após o onboarding, o usuário recebe 1 tela de boas-vindas com o
 * Significado do Pilar principal. Resolve o exemplo "Caminho de Vida
 * 11, e daí?" — antes do primeiro acesso, o usuário VÊ o que seu
 * número SIGNIFICA.
 *
 * Server component. Lê o mapa via API. Renderiza 1 Significado do
 * Pilar principal em destaque, com 1 prática, e CTA para o Mapa
 * completo.
 *
 * A página é MÍNIMA — não repete o Diario nem o Mural. É 1 ABRAÇO
 * de boas-vindas com o que ENTREGA DE VALOR (significado, não número).
 */
import { cookies, headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SignificadoPilar } from '@/components/akasha/SignificadoPilar';
import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';
import { significadosEspecificos, type PilaresDados } from '@/lib/grimoire/significados-curados';

const C = {
  violeta: '#7C5CFF',
  aurora: '#2DD4BF',
  dourado: '#F0B429',
  magenta: '#FB5781',
  ocre: '#A0763A',
  bgVoid: '#06070F',
  txtPri: '#F4F5FF',
  txtSec: '#A7AECF',
  txtMut: '#5C6691',
} as const;

const CORES_PILAR = {
  cabala: C.violeta,
  astrologia: C.aurora,
  tantrica: C.dourado,
  odu: C.magenta,
  iching: C.ocre,
} as const;

const PILAR_NOME = {
  cabala: 'Cabala',
  astrologia: 'Astrologia',
  tantrica: 'Tântrica',
  odu: 'Odu',
  iching: 'I Ching',
} as const;

type MandatoEsqueleto = {
  escala: 'D' | 'S' | 'Z' | 'V';
  pilares_relevantes: string[];
};

type MandatoDoDiaResponse = {
  date: string;
  mandato: MandatoEsqueleto;
  pilares?: PilaresDados;
  mentor_hook: { crise_detectada: boolean; recurso: string | null };
};

const PILARES_VALIDOS = ['cabala', 'astrologia', 'tantrica', 'odu', 'iching'] as const;

function saudacao(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export const metadata = {
  title: 'Bem-vindo — o Significado do seu Mapa',
  description: 'O que seus 5 Pilares significam — para você, hoje.',
};

export default async function SignificadoPrimeiroPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;
  const authStatus = (await headers()).get('X-Akasha-Auth');
  if (authStatus !== 'refreshed' && !verifyAkashaToken(token, 'access'))
    redirect(`/${locale}/login`);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/akasha/mandato-do-dia`,
    { headers: { Cookie: `akasha_session=${token}` }, cache: 'no-store' }
  );

  let pilares: PilaresDados | null = null;
  let pilarPrincipal: 'cabala' | 'astrologia' | 'tantrica' | 'odu' | 'iching' = 'cabala';
  if (res.ok) {
    const data: MandatoDoDiaResponse = await res.json();
    pilares = data.pilares ?? null;
    const p = data.mandato.pilares_relevantes[0] ?? 'cabala';
    if ((PILARES_VALIDOS as readonly string[]).includes(p)) {
      pilarPrincipal = p as typeof pilarPrincipal;
    }
  }

  const cor = CORES_PILAR[pilarPrincipal];
  const sig = pilares ? significadosEspecificos(pilares)[pilarPrincipal] : null;

  return (
    <main
      style={{
        background: C.bgVoid,
        minHeight: 'calc(100vh - 56px)',
        padding: '32px 20px 80px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at top right, rgba(124,92,255,0.12) 0%, transparent 60%)',
        }}
      />

      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <header style={{ marginBottom: 20 }}>
          <span
            style={{
              fontSize: '0.7rem',
              color: C.txtMut,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            {saudacao()} · bem-vindo ao Akasha
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-cinzel, serif)',
              color: C.txtPri,
              fontSize: '1.8rem',
              margin: '8px 0 6px',
              lineHeight: 1.2,
            }}
          >
            Você chegou. Seu Mapa já está aberto.
          </h1>
          <p
            style={{
              color: C.txtSec,
              fontSize: '0.95rem',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Cinco tradições convergem em você. Aqui, você começa pelo Pilar que mais ilumina o seu
            momento. Não é só um número — é o que ele SIGNIFICA.
          </p>
        </header>

        {sig ? (
          <SignificadoPilar significado={sig} cor={cor} destaque />
        ) : (
          <p style={{ color: C.txtSec, lineHeight: 1.5 }}>
            Não conseguimos carregar seu mapa agora. Volte mais tarde.
          </p>
        )}

        <div
          style={{
            marginTop: 28,
            textAlign: 'center',
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href={`/${locale}/mandala`}
            style={{
              display: 'inline-block',
              padding: '12px 22px',
              background: cor,
              color: '#0B0E1C',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            Ver meu Mapa visual →
          </Link>
          <Link
            href={`/${locale}/diario`}
            style={{
              display: 'inline-block',
              padding: '12px 22px',
              background: 'rgba(11,14,28,0.6)',
              border: `1px solid ${cor}55`,
              color: C.txtPri,
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
            }}
          >
            Mandato do Dia →
          </Link>
          <Link
            href={`/${locale}/mapa/significado`}
            style={{
              display: 'inline-block',
              padding: '12px 22px',
              background: 'transparent',
              border: `1px solid ${C.txtMut}55`,
              color: C.txtSec,
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '0.85rem',
            }}
          >
            Ler Significado Completo →
          </Link>
        </div>

        <p
          style={{
            marginTop: 24,
            color: C.txtMut,
            fontSize: '0.7rem',
            textAlign: 'center',
          }}
        >
          Pilar de hoje:{' '}
          <span style={{ color: cor, fontWeight: 600 }}>{PILAR_NOME[pilarPrincipal]}</span>
        </p>
      </div>
    </main>
  );
}
