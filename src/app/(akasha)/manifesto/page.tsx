import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

type ManifestoContent = {
  userName: string;
  generatedAt: string;
  odus: {
    oduName: string;
    oduNumber: number | null;
    orixas: string[];
    elementalForce: string | null;
    description: string;
    provisional: boolean;
  };
  kabala: {
    lifePath: number | null;
    lifePathMaster: boolean;
    expression: number | null;
    motivation: number | null;
    personalYear: number | null;
    description: string;
  };
  tantra: {
    soul: number | null;
    karma: number | null;
    divineGift: number | null;
    tantricPath: number | null;
    description: string;
  };
  astrology: {
    ascendant: string | null;
    dominantPlanet: string | null;
    mainPlanets: Array<{ name: string; sign: string }>;
    description: string;
  };
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(11,14,28,0.8)',
  border: '1px solid rgba(38,48,79,0.8)',
  borderRadius: 12,
  padding: 20,
  marginBottom: 16,
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  letterSpacing: '0.12em',
  textTransform: 'uppercase' as const,
  color: 'rgba(244,245,255,0.45)',
  marginBottom: 4,
};

const valueStyle: React.CSSProperties = {
  color: '#F4F5FF',
  fontSize: '0.95rem',
};

const descriptionStyle: React.CSSProperties = {
  color: 'rgba(244,245,255,0.7)',
  fontSize: '0.875rem',
  lineHeight: 1.65,
  marginTop: 12,
};

function SectionTitle({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <h2
      style={{
        fontFamily: 'var(--font-cinzel, serif)',
        color,
        fontSize: '0.8rem',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        marginBottom: 16,
        paddingBottom: 10,
        borderBottom: `1px solid ${color}33`,
      }}
    >
      {children}
    </h2>
  );
}

function DataPair({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>{value ?? '—'}</div>
    </div>
  );
}

function DataRow({ pairs }: { pairs: Array<{ label: string; value: React.ReactNode }> }) {
  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' as const, marginBottom: 2 }}>
      {pairs.map((p) => (
        <DataPair key={p.label} label={p.label} value={p.value} />
      ))}
    </div>
  );
}

export default async function ManifestoPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('akasha_session')?.value;

  if (!token) redirect('/onboarding');

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/akasha/manifesto/generate`,
    {
      method: 'POST',
      headers: { Cookie: `akasha_session=${token}`, 'Content-Type': 'application/json' },
      cache: 'no-store',
    }
  );

  if (res.status === 401 || res.status === 404) redirect('/onboarding');

  const { content }: { manifestoId: string; content: ManifestoContent } = await res.json();

  const { userName, odus, kabala, tantra, astrology } = content;

  return (
    <main
      style={{ background: '#06070F', minHeight: 'calc(100vh - 56px)' }}
      className="flex flex-col items-center py-10 px-4"
    >
      {/* Header */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: 32,
          maxWidth: 680,
          width: '100%',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-cinzel, serif)',
            color: '#F0B429',
            fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          Manifesto Akáshico
        </h1>
        <p
          style={{
            color: 'rgba(244,245,255,0.55)',
            fontSize: '0.9rem',
            letterSpacing: '0.06em',
          }}
        >
          {userName}
        </p>
      </div>

      {/* Download button */}
      <div style={{ marginBottom: 32 }}>
        <a
          href="/api/akasha/manifesto/pdf"
          download
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(240,180,41,0.12)',
            border: '1px solid rgba(240,180,41,0.45)',
            borderRadius: 8,
            padding: '9px 20px',
            color: '#F0B429',
            fontSize: '0.85rem',
            letterSpacing: '0.08em',
            textDecoration: 'none',
            transition: 'background 0.2s',
          }}
        >
          <span>↓</span>
          <span>Baixar PDF</span>
        </a>
      </div>

      {/* Sections */}
      <div style={{ maxWidth: 680, width: '100%' }}>

        {/* I — Odus */}
        <div style={cardStyle}>
          <SectionTitle color="#F0B429">I. Bússola Ancestral — Odus</SectionTitle>

          <DataRow
            pairs={[
              { label: 'Odu', value: odus.oduName },
              ...(odus.oduNumber !== null
                ? [{ label: 'Número', value: String(odus.oduNumber) }]
                : []),
              ...(odus.elementalForce
                ? [{ label: 'Força Elemental', value: odus.elementalForce }]
                : []),
            ]}
          />

          {odus.orixas.length > 0 && (
            <DataPair label="Orixás" value={odus.orixas.join(' · ')} />
          )}

          <p style={descriptionStyle}>{odus.description}</p>

          {odus.provisional && (
            <div
              style={{
                display: 'inline-block',
                marginTop: 12,
                background: 'rgba(240,180,41,0.12)',
                border: '1px solid rgba(240,180,41,0.35)',
                borderRadius: 6,
                padding: '3px 10px',
                fontSize: '0.7rem',
                letterSpacing: '0.1em',
                color: '#F0B429',
                textTransform: 'uppercase',
              }}
            >
              Provisório
            </div>
          )}
        </div>

        {/* II — Kabala */}
        <div style={cardStyle}>
          <SectionTitle color="#7C5CFF">II. O Verbo — Numerologia Cabalística</SectionTitle>

          <DataRow
            pairs={[
              {
                label: 'Caminho de Vida',
                value:
                  kabala.lifePath !== null
                    ? `${kabala.lifePath}${kabala.lifePathMaster ? ' ✦' : ''}`
                    : null,
              },
              { label: 'Expressão', value: kabala.expression },
              { label: 'Motivação', value: kabala.motivation },
              ...(kabala.personalYear !== null
                ? [{ label: 'Ano Pessoal', value: String(kabala.personalYear) }]
                : []),
            ]}
          />

          <p style={descriptionStyle}>{kabala.description}</p>
        </div>

        {/* III — Tântrica */}
        <div style={cardStyle}>
          <SectionTitle color="#2DD4BF">III. A Anatomia Sutil — Tântrica</SectionTitle>

          <DataRow
            pairs={[
              { label: 'Corpo da Alma', value: tantra.soul },
              { label: 'Karma', value: tantra.karma },
              { label: 'Dom Divino', value: tantra.divineGift },
              ...(tantra.tantricPath !== null
                ? [{ label: 'Caminho Tântrico', value: String(tantra.tantricPath) }]
                : []),
            ]}
          />

          <p style={descriptionStyle}>{tantra.description}</p>
        </div>

        {/* IV — Astrologia */}
        <div style={cardStyle}>
          <SectionTitle color="#7C5CFF">IV. O Mapa de Bordo — Astrologia</SectionTitle>

          <DataRow
            pairs={[
              { label: 'Ascendente', value: astrology.ascendant },
              { label: 'Planeta Dominante', value: astrology.dominantPlanet },
            ]}
          />

          {astrology.mainPlanets.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={labelStyle}>Planetas Principais</div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginTop: 4,
                }}
              >
                {astrology.mainPlanets.map((planet) => (
                  <span
                    key={planet.name}
                    style={{
                      background: 'rgba(124,92,255,0.12)',
                      border: '1px solid rgba(124,92,255,0.3)',
                      borderRadius: 6,
                      padding: '3px 10px',
                      fontSize: '0.8rem',
                      color: 'rgba(244,245,255,0.85)',
                    }}
                  >
                    {planet.name} em {planet.sign}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p style={descriptionStyle}>{astrology.description}</p>
        </div>

      </div>
    </main>
  );
}
