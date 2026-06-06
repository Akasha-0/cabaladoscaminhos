import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

type Ritual = {
  titulo: string;
  instrucao: string;
  cor: string;
  elemento: string;
};

type TensionPoint = {
  pillar: string;
  theme: string;
  intensity: number;
};

type DailyReading = {
  date: string;
  climate: string;
  ritual: Ritual;
  alert: string;
  tensionPoint: TensionPoint;
  moonPhase: string;
  overallTheme: string;
};

const containerStyle: React.CSSProperties = {
  background: '#06070F',
  minHeight: 'calc(100vh - 56px)',
  padding: '32px 16px 48px',
};

const innerStyle: React.CSSProperties = {
  maxWidth: 640,
  margin: '0 auto',
};

const headerRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  marginBottom: 28,
  flexWrap: 'wrap' as const,
};

const badgeStyle = (color: string): React.CSSProperties => ({
  background: `${color}18`,
  border: `1px solid ${color}55`,
  borderRadius: 20,
  padding: '4px 14px',
  fontSize: '0.75rem',
  letterSpacing: '0.08em',
  color,
});

const cardStyle = (borderColor: string): React.CSSProperties => ({
  background: 'rgba(255,255,255,0.03)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: `1px solid ${borderColor}55`,
  borderLeft: `3px solid ${borderColor}`,
  borderRadius: 12,
  padding: '20px 22px',
  marginBottom: 16,
});

const sectionLabelStyle = (color: string): React.CSSProperties => ({
  fontSize: '0.65rem',
  fontFamily: 'var(--font-cinzel, serif)',
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  color,
  marginBottom: 10,
});

const bodyTextStyle: React.CSSProperties = {
  color: 'rgba(226,232,240,0.85)',
  fontSize: '0.9rem',
  lineHeight: 1.7,
};

const metaRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 16,
  marginTop: 12,
  flexWrap: 'wrap' as const,
};

const metaItemStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'rgba(226,232,240,0.5)',
};

const metaValueStyle = (color: string): React.CSSProperties => ({
  color,
  fontWeight: 600,
  marginLeft: 4,
});

const ctaStyle: React.CSSProperties = {
  display: 'block',
  textAlign: 'center' as const,
  marginTop: 28,
  padding: '13px 0',
  borderRadius: 10,
  background: 'linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(45,212,191,0.1) 100%)',
  border: '1px solid rgba(124,58,237,0.4)',
  color: '#A78BFA',
  fontSize: '0.9rem',
  letterSpacing: '0.06em',
  fontFamily: 'var(--font-cinzel, serif)',
  textDecoration: 'none',
  transition: 'border-color 0.2s',
};

export default async function DiarioPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('akasha_session')?.value;

  if (!token) redirect('/onboarding');

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/akasha/daily`,
    {
      method: 'GET',
      headers: { Cookie: `akasha_session=${token}` },
      cache: 'no-store',
    }
  );

  if (res.status === 401 || res.status === 404) redirect('/onboarding');

  const reading: DailyReading = await res.json();

  const ritual = reading.ritual as Ritual;
  const tensionPoint = reading.tensionPoint as TensionPoint;

  return (
    <div style={containerStyle}>
      <div style={innerStyle}>
        <div style={headerRowStyle}>
          <span style={badgeStyle('#2DD4BF')}>{reading.moonPhase ?? '🌙 Lua'}</span>
          <span style={badgeStyle('#F0B429')}>{reading.overallTheme ?? 'Equilíbrio'}</span>
        </div>

        {/* Clima Energético */}
        <div style={cardStyle('#2DD4BF')}>
          <div style={sectionLabelStyle('#2DD4BF')}>🌊 Clima Energético</div>
          <p style={bodyTextStyle}>{reading.climate}</p>
        </div>

        {/* A Prática do Dia */}
        <div style={cardStyle('#F0B429')}>
          <div style={sectionLabelStyle('#F0B429')}>✧ A Prática do Dia</div>
          <p style={{ ...bodyTextStyle, fontWeight: 600, marginBottom: 6 }}>{ritual.titulo}</p>
          <p style={bodyTextStyle}>{ritual.instrucao}</p>
          <div style={metaRowStyle}>
            <span style={metaItemStyle}>
              Cor:<span style={metaValueStyle('#F0B429')}>{ritual.cor}</span>
            </span>
            <span style={metaItemStyle}>
              Elemento:<span style={metaValueStyle('#F0B429')}>{ritual.elemento}</span>
            </span>
          </div>
        </div>

        {/* Alerta 24h */}
        <div style={cardStyle('#FB5781')}>
          <div style={sectionLabelStyle('#FB5781')}>⚠ Alerta — Próximas 24h</div>
          <p style={bodyTextStyle}>{reading.alert}</p>
          {tensionPoint && (
            <div style={metaRowStyle}>
              <span style={metaItemStyle}>
                Pilar:<span style={metaValueStyle('#FB5781')}>{tensionPoint.pillar}</span>
              </span>
              <span style={metaItemStyle}>
                Intensidade:<span style={metaValueStyle('#FB5781')}>{tensionPoint.intensity}/100</span>
              </span>
            </div>
          )}
        </div>

        <Link href="/oraculo" style={ctaStyle}>
          Consultar Oráculo →
        </Link>
      </div>
    </div>
  );
}
