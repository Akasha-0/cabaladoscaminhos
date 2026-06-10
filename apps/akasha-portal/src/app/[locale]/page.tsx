import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const PILLARS = [
  {
    color: '#7C5CFF',
    glow: 'rgba(124,92,255,0.18)',
    icon: '◯',
    title: 'Astrologia',
    axis: 'O Céu — Quando Agir',
    desc: 'Seu Mapa de Bordo: os trânsitos que moldam seu cenário hoje e os desafios kármicos da sua jornada.',
  },
  {
    color: '#7C5CFF',
    glow: 'rgba(124,92,255,0.18)',
    icon: '△',
    title: 'Numerologia Cabalística',
    axis: 'O Verbo — Identidade',
    desc: 'Seu Contrato de Alma: a frequência do seu nome e o Caminho de Vida revelam seu propósito oculto.',
  },
  {
    color: '#2DD4BF',
    glow: 'rgba(45,212,191,0.15)',
    icon: '⬡',
    title: 'Numerologia Tântrica',
    axis: 'A Anatomia — Energia',
    desc: 'Seus 11 Corpos Espirituais: mostra como a energia flui no seu veículo sutil e onde você trava.',
  },
  {
    color: '#F0B429',
    glow: 'rgba(240,180,41,0.14)',
    icon: '✦',
    title: 'Odus de Nascimento',
    axis: 'A Terra — Ori',
    desc: 'Sua Bússola Ancestral: o Odu, os Orixás regentes e os rituais de correção do seu Ori.',
  },
];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const session = cookieStore.get('akasha_session')?.value;
  if (session) redirect(`/${locale}/mandala`);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#06070F',
        color: '#F4F5FF',
        fontFamily: 'var(--font-inter), sans-serif',
      }}
    >
      {/* Nav */}
      <header
        style={{
          background: 'rgba(6,7,15,0.88)',
          borderBottom: '1px solid rgba(124,92,255,0.15)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span
            style={{
              fontFamily: 'var(--font-cinzel), serif',
              color: '#7C5CFF',
              letterSpacing: '0.18em',
              fontWeight: 600,
              fontSize: '1.1rem',
            }}
          >
            ✦ AKASHA
          </span>
          <div className="flex items-center gap-4">
            <Link
              href={`/${locale}/onboarding`}
              style={{
                background: '#7C5CFF',
                color: '#fff',
                borderRadius: '10px',
                padding: '8px 20px',
                fontSize: '0.875rem',
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Iniciar Jornada
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 pt-20 pb-16 text-center">
        <div
          style={{
            display: 'inline-block',
            padding: '5px 14px',
            background: 'rgba(124,92,255,0.12)',
            border: '1px solid rgba(124,92,255,0.3)',
            borderRadius: '100px',
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            color: '#9D86FF',
            marginBottom: '2rem',
            textTransform: 'uppercase',
          }}
        >
          Tecnologia Espiritual Viva
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-cinzel), serif',
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #F4F5FF 0%, #9D86FF 60%, #2DD4BF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Sua Existência Decifrada em Quatro Dimensões
        </h1>

        <p
          style={{
            color: '#A7AECF',
            fontSize: '1.0625rem',
            lineHeight: 1.7,
            maxWidth: '560px',
            margin: '0 auto 2.5rem',
          }}
        >
          O Sistema Akasha cruza Astrologia, Numerologia Cabalística, Numerologia Tântrica e Odus
          para entregar um diagnóstico vivo e um ritual personalizado — cada manhã, renovado com o céu de hoje.
        </p>

        <Link
          href={`/${locale}/onboarding`}
          style={{
            display: 'inline-block',
            background: '#7C5CFF',
            color: '#fff',
            borderRadius: '14px',
            padding: '14px 36px',
            fontSize: '1rem',
            fontWeight: 600,
            textDecoration: 'none',
            boxShadow: '0 0 32px rgba(124,92,255,0.35)',
            letterSpacing: '0.02em',
          }}
        >
          Revelar meu Mapa Akáshico →
        </Link>
      </section>

      {/* Pillars */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <p
          className="text-center text-xs uppercase tracking-widest mb-10"
          style={{ color: '#5C6691' }}
        >
          Os 4 Pilares da Inteligência Akasha
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
          }}
        >
          {PILLARS.map((p) => (
            <div
              key={p.title}
              style={{
                background: 'rgba(11,14,28,0.7)',
                border: `1px solid rgba(38,48,79,0.8)`,
                borderRadius: '16px',
                padding: '1.5rem',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div
                style={{
                  fontSize: '1.5rem',
                  color: p.color,
                  marginBottom: '0.75rem',
                  filter: `drop-shadow(0 0 8px ${p.glow})`,
                }}
              >
                {p.icon}
              </div>
              <p
                style={{
                  fontFamily: 'var(--font-cinzel), serif',
                  fontSize: '0.875rem',
                  color: '#F4F5FF',
                  fontWeight: 600,
                  marginBottom: '0.25rem',
                }}
              >
                {p.title}
              </p>
              <p style={{ fontSize: '0.75rem', color: p.color, marginBottom: '0.5rem' }}>
                {p.axis}
              </p>
              <p style={{ fontSize: '0.8125rem', color: '#A7AECF', lineHeight: 1.55 }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section
        style={{
          background: 'rgba(11,14,28,0.5)',
          borderTop: '1px solid rgba(38,48,79,0.5)',
          borderBottom: '1px solid rgba(38,48,79,0.5)',
          padding: '4rem 1rem',
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2
            style={{
              fontFamily: 'var(--font-cinzel), serif',
              fontSize: '1.5rem',
              color: '#F4F5FF',
              marginBottom: '1rem',
            }}
          >
            A Inteligência mora no Cruzamento
          </h2>
          <p style={{ color: '#A7AECF', lineHeight: 1.7, maxWidth: '520px', margin: '0 auto 2rem' }}>
            O Akasha não lista quatro mapas lado a lado. Ele cruza os dados e emite um diagnóstico unificado —
            como quando seu Ori está desalinhado por um trânsito astrológico intenso e a correção não é meditar,
            mas um banho específico para pacificar seu Corpo Tântrico.
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              flexWrap: 'wrap',
              color: '#5C6691',
              fontSize: '0.8125rem',
            }}
          >
            {['Diagnóstico personalizado', 'Ritual do dia', 'Oráculo conversacional', 'Mandala interativa'].map((f) => (
              <span key={f} style={{ color: '#A7AECF' }}>✦ {f}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA footer */}
      <section className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2
          style={{
            fontFamily: 'var(--font-cinzel), serif',
            fontSize: '1.75rem',
            color: '#F4F5FF',
            marginBottom: '1rem',
          }}
        >
          Comece agora. Gratuito.
        </h2>
        <p style={{ color: '#A7AECF', marginBottom: '2rem', lineHeight: 1.6 }}>
          Cadastre-se, informe seu nascimento e receba sua Mandala Akáshica em menos de 2 minutos.
        </p>
        <Link
          href={`/${locale}/onboarding`}
          style={{
            display: 'inline-block',
            background: '#7C5CFF',
            color: '#fff',
            borderRadius: '14px',
            padding: '14px 36px',
            fontSize: '1rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Iniciar Jornada →
        </Link>

        <div className="mt-6">
          <Link
            href="/dashboard"
            style={{
              color: '#9D86FF',
              fontSize: '0.875rem',
              textDecoration: 'none',
            }}
          >
            Ver Dashboard →
          </Link>
        </div>
      </section>

      <footer className="py-8 text-center text-xs" style={{ color: '#5C6691' }}>
        Sistema Akasha · Cabala dos Caminhos · Tecnologia Espiritual Viva
      </footer>
    </div>
  );
}
