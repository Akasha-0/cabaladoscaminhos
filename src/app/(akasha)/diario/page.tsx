import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

type Ritual = {
  titulo: string;
  instrucao: string;
  cor: string;
  elemento: string;
  herbs?: string[];
};

type TensionPoint = {
  pillar: string;
  theme: string;
  intensity: number;
  affectedBody?: number;
  affectedElement?: string;
};

type DailyReading = {
  date: string;
  climate: string;
  ritual: Ritual;
  alert: string;
  tensionPoint: TensionPoint;
  moonPhase?: string | null;
  overallTheme?: string | null;
};

// ── Paleta Akasha ────────────────────────────────────────────────────────────
const C = {
  violeta: '#7C5CFF',
  aurora:  '#2DD4BF',
  dourado: '#F0B429',
  magenta: '#FB5781',
  bgVoid:  '#06070F',
  bgDeep:  '#0B0E1C',
  bgNeb:   '#141A33',
  txtPri:  '#F4F5FF',
  txtSec:  '#A7AECF',
  txtMut:  '#5C6691',
} as const;

// ── Nomes dos pilares ────────────────────────────────────────────────────────
const PILLAR_LABELS: Record<string, string> = {
  astrology: 'Astrologia',
  kabala:    'Kabala',
  tantra:    'Tantra',
  odus:      'Odus do Ifá',
};

const TANTRIC_BODIES: Record<number, string> = {
  1:  'Alma (Atma)',
  2:  'Prânico',
  3:  'Negativo',
  4:  'Neutro',
  5:  'Físico',
  6:  'Arcline',
  7:  'Aura',
  8:  'Radiante',
  9:  'Sutil',
  10: 'Divino',
  11: 'Comando (Ajna)',
};

// ── Estilos ──────────────────────────────────────────────────────────────────

const wrapStyle: React.CSSProperties = {
  background: C.bgVoid,
  minHeight: '100dvh',
  overflowY: 'scroll',
  scrollSnapType: 'y mandatory',
  WebkitOverflowScrolling: 'touch',
};

const screenStyle: React.CSSProperties = {
  scrollSnapAlign: 'start',
  minHeight: '100dvh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '48px 20px 64px',
};

const innerStyle: React.CSSProperties = {
  maxWidth: 560,
  margin: '0 auto',
  width: '100%',
};

const cardStyle = (borderColor: string): React.CSSProperties => ({
  background: 'rgba(11,14,28,0.72)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: `1px solid ${borderColor}44`,
  borderLeft: `3px solid ${borderColor}`,
  borderRadius: 14,
  padding: '24px 24px 20px',
  marginBottom: 16,
});

const labelStyle = (color: string): React.CSSProperties => ({
  fontSize: '0.62rem',
  fontFamily: 'var(--font-cinzel, serif)',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color,
  marginBottom: 12,
  display: 'block',
});

const headlineStyle: React.CSSProperties = {
  fontSize: '1.15rem',
  fontFamily: 'var(--font-cinzel, serif)',
  color: C.txtPri,
  marginBottom: 10,
  lineHeight: 1.4,
};

const bodyStyle: React.CSSProperties = {
  color: C.txtSec,
  fontSize: '0.9rem',
  lineHeight: 1.75,
};

const badgeStyle = (color: string): React.CSSProperties => ({
  display: 'inline-block',
  background: `${color}1A`,
  border: `1px solid ${color}55`,
  borderRadius: 20,
  padding: '3px 12px',
  fontSize: '0.72rem',
  letterSpacing: '0.08em',
  color,
  marginRight: 8,
  marginBottom: 8,
});

const pillStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  background: `${C.magenta}18`,
  border: `1px solid ${C.magenta}55`,
  borderRadius: 8,
  padding: '6px 14px',
  fontSize: '0.8rem',
  color: C.magenta,
  marginTop: 12,
  marginBottom: 4,
};

const mandalaStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  marginTop: 16,
  alignItems: 'center',
};

const dotStyle = (color: string, size = 10): React.CSSProperties => ({
  width: size,
  height: size,
  borderRadius: '50%',
  background: color,
  boxShadow: `0 0 8px ${color}99`,
  flexShrink: 0,
});

const dividerStyle: React.CSSProperties = {
  borderTop: `1px solid ${C.bgNeb}`,
  margin: '16px 0',
};

const btnStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'center',
  padding: '14px 0',
  borderRadius: 12,
  background: `linear-gradient(135deg, ${C.violeta}22 0%, ${C.aurora}14 100%)`,
  border: `1px solid ${C.violeta}55`,
  color: C.violeta,
  fontSize: '0.88rem',
  letterSpacing: '0.07em',
  fontFamily: 'var(--font-cinzel, serif)',
  textDecoration: 'none',
  cursor: 'pointer',
  marginTop: 8,
};

const stubBtnStyle: React.CSSProperties = {
  ...btnStyle,
  background: `linear-gradient(135deg, ${C.aurora}22 0%, ${C.dourado}14 100%)`,
  border: `1px solid ${C.aurora}55`,
  color: C.aurora,
};

const screenNumStyle: React.CSSProperties = {
  fontSize: '0.6rem',
  color: C.txtMut,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  marginBottom: 24,
};

const herbsStyle: React.CSSProperties = {
  marginTop: 10,
  fontSize: '0.78rem',
  color: C.txtMut,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  } catch {
    return iso;
  }
}

function buildGreeting(reading: DailyReading): string {
  const moon = reading.moonPhase ?? 'Lua';
  const theme = reading.overallTheme ?? 'Equilíbrio';
  return `As energias de ${moon} revelam o tema de ${theme} no campo de hoje.`;
}

// ── Página ───────────────────────────────────────────────────────────────────

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

  const ritual      = reading.ritual as Ritual;
  const tension     = reading.tensionPoint as TensionPoint;
  const pillarLabel = PILLAR_LABELS[tension.pillar] ?? tension.pillar;
  const bodyLabel   = tension.affectedBody ? TANTRIC_BODIES[tension.affectedBody] : null;
  const greeting    = buildGreeting(reading);

  // Mini-mandala: 3 pontos representando Astrologia (Aurora), Odus (Dourado), Tantra (Violeta)
  const mandalaColors = [C.aurora, C.dourado, C.violeta];

  return (
    <div style={wrapStyle}>

      {/* ── Tela 1: Clima Energético ────────────────────────────────────────── */}
      <div style={screenStyle}>
        <div style={innerStyle}>
          <div style={screenNumStyle}>01 / 03 — Clima</div>

          {/* Saudação magnética (Voz do Akasha) */}
          <div style={cardStyle(C.aurora)}>
            <span style={labelStyle(C.aurora)}>Voz do Akasha</span>
            <p style={{ ...bodyStyle, fontStyle: 'italic', color: C.txtPri, marginBottom: 10 }}>
              {greeting}
            </p>
            <div style={{ fontSize: '0.75rem', color: C.txtMut }}>
              {formatDate(reading.date)}
            </div>
          </div>

          {/* Texto de clima */}
          <div style={cardStyle(C.violeta)}>
            <span style={labelStyle(C.violeta)}>Clima Energético</span>
            <p style={bodyStyle}>{reading.climate}</p>

            {/* Badges: fase lunar + tema geral */}
            <div style={{ marginTop: 14 }}>
              {reading.moonPhase && (
                <span style={badgeStyle(C.aurora)}>{reading.moonPhase}</span>
              )}
              {reading.overallTheme && (
                <span style={badgeStyle(C.dourado)}>{reading.overallTheme}</span>
              )}
            </div>

            {/* Mini-mandala */}
            <div style={mandalaStyle}>
              {mandalaColors.map((color, i) => (
                <span key={i} style={dotStyle(color)} title={['Astrologia', 'Odus', 'Tantra'][i]} />
              ))}
              <span style={{ fontSize: '0.65rem', color: C.txtMut, marginLeft: 4 }}>
                pilares ativos
              </span>
            </div>
          </div>

          {/* Hint de scroll */}
          <div style={{ textAlign: 'center', marginTop: 24, color: C.txtMut, fontSize: '0.7rem' }}>
            role para baixo ↓
          </div>
        </div>
      </div>

      {/* ── Tela 2: Desafio do Dia ──────────────────────────────────────────── */}
      <div style={screenStyle}>
        <div style={innerStyle}>
          <div style={screenNumStyle}>02 / 03 — Desafio</div>

          <div style={cardStyle(C.magenta)}>
            <span style={labelStyle(C.magenta)}>Desafio do Dia</span>
            <h2 style={headlineStyle}>{tension.theme}</h2>

            {/* Corpo tântrico afetado */}
            {bodyLabel && (
              <div style={pillStyle}>
                <span style={dotStyle(C.magenta, 8)} />
                Corpo tântrico em tensão: <strong style={{ marginLeft: 4 }}>{bodyLabel}</strong>
              </div>
            )}

            {/* Pilar em tensão */}
            <div style={{ marginTop: 12, marginBottom: 4 }}>
              <span style={badgeStyle(C.magenta)}>Pilar: {pillarLabel}</span>
              <span style={badgeStyle(C.txtMut)}>
                Intensidade: {tension.intensity}/100
              </span>
            </div>

            <div style={dividerStyle} />

            {/* Orientação prática */}
            <span style={labelStyle(C.violeta)}>Orientação</span>
            <p style={bodyStyle}>{reading.alert}</p>
          </div>

          <div style={{ textAlign: 'center', marginTop: 24, color: C.txtMut, fontSize: '0.7rem' }}>
            role para baixo ↓
          </div>
        </div>
      </div>

      {/* ── Tela 3: A Prescrição ────────────────────────────────────────────── */}
      <div style={screenStyle}>
        <div style={innerStyle}>
          <div style={screenNumStyle}>03 / 03 — Prescrição</div>

          <div style={cardStyle(C.dourado)}>
            <span style={labelStyle(C.dourado)}>A Prescrição do Dia</span>
            <h2 style={{ ...headlineStyle, color: C.dourado }}>{ritual.titulo}</h2>
            <p style={bodyStyle}>{ritual.instrucao}</p>

            <div style={{ marginTop: 14 }}>
              <span style={badgeStyle(C.dourado)}>Cor: {ritual.cor}</span>
              <span style={badgeStyle(C.dourado)}>Elemento: {ritual.elemento}</span>
            </div>

            {ritual.herbs && ritual.herbs.length > 0 && (
              <p style={herbsStyle}>
                Ervas sugeridas: {ritual.herbs.join(', ')}
              </p>
            )}
          </div>

          {/* Botão stub "Realizado" */}
          <button
            style={stubBtnStyle}
            aria-label="Marcar ritual como realizado"
            onClick={undefined /* stub — POST /api/akasha/ritual/complete */}
          >
            Realizado ✓
          </button>

          {/* Link para o Oráculo */}
          <Link href="/oraculo" style={btnStyle}>
            Consultar Oráculo →
          </Link>
        </div>
      </div>

    </div>
  );
}
