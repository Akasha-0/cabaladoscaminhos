'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PlainEnglishPlanet } from '@/components/akasha/PlainEnglishPlanet';

type ManifestoContent = {
  userName: string;
  generatedAt: string;
  synthesis: string;
  odus: {
    oduName: string;
    oduNumber: number | null;
    orixas: string[];
    elementalForce: string | null;
    description: string;
    preceitos?: string[];
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

// ─── Styles ────────────────────────────────────────────────────────────────

const glass: React.CSSProperties = {
  background: 'rgba(11,14,28,0.72)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(38,48,79,0.7)',
  borderRadius: 16,
  padding: '24px 28px',
  marginBottom: 20,
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.68rem',
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'rgba(244,245,255,0.38)',
  marginBottom: 3,
};

const valueStyle: React.CSSProperties = {
  color: '#F4F5FF',
  fontSize: '0.95rem',
};

const descriptionStyle: React.CSSProperties = {
  color: 'rgba(244,245,255,0.68)',
  fontSize: '0.875rem',
  lineHeight: 1.7,
  marginTop: 14,
};

const sectionTitleStyle = (color: string): React.CSSProperties => ({
  fontFamily: 'var(--font-cinzel, "Cinzel", serif)',
  color,
  fontSize: '0.78rem',
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  marginBottom: 18,
  paddingBottom: 12,
  borderBottom: `1px solid ${color}28`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

// ─── Sub-components ─────────────────────────────────────────────────────────

function DataPair({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined) return null;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>{value}</div>
    </div>
  );
}

function DataRow({ pairs }: { pairs: Array<{ label: string; value: React.ReactNode }> }) {
  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 4 }}>
      {pairs.map((p) => (
        <DataPair key={p.label} label={p.label} value={p.value} />
      ))}
    </div>
  );
}

function ExpandToggle({
  expanded,
  onToggle,
  color,
}: {
  expanded: boolean;
  onToggle: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        background: 'none',
        border: `1px solid ${color}44`,
        borderRadius: 6,
        color,
        fontSize: '0.65rem',
        letterSpacing: '0.1em',
        padding: '3px 10px',
        cursor: 'pointer',
        textTransform: 'uppercase',
        transition: 'border-color 0.2s',
      }}
    >
      {expanded ? 'Ver menos' : 'Ver mais'}
    </button>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ManifestoPage() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? 'pt-BR';
  const [content, setContent] = useState<ManifestoContent | null>(null);
  const [incomplete, setIncomplete] = useState(false);
  const [loading, setLoading] = useState(true);

  // Expandable section state
  const [expandedOdu, setExpandedOdu] = useState(false);
  const [expandedKabala, setExpandedKabala] = useState(false);
  const [expandedTantra, setExpandedTantra] = useState(false);
  const [expandedAstro, setExpandedAstro] = useState(false);

  useEffect(() => {
    async function loadManifesto() {
      try {
        const res = await fetch('/api/akasha/manifesto/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (res.status === 401 || res.status === 403) {
          router.replace(`/${locale}/onboarding`);
          return;
        }
        if (res.status === 404) {
          router.replace(`/${locale}/onboarding`);
          return;
        }

        const data: { manifestoId: string; content: ManifestoContent; incomplete?: boolean } =
          await res.json();
        setContent(data.content);
        setIncomplete(data.incomplete ?? false);
      } catch {
        router.replace(`/${locale}/onboarding`);
      } finally {
        setLoading(false);
      }
    }
    loadManifesto();
  }, [router, locale]);

  if (loading) {
    return (
      <main
        style={{
          background: '#06070F',
          minHeight: 'calc(100vh - 56px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            color: 'rgba(244,245,255,0.38)',
            fontFamily: 'var(--font-lora, "Lora", serif)',
            fontSize: '0.9rem',
            letterSpacing: '0.06em',
          }}
        >
          Tecendo seu mapa akáshico…
        </div>
      </main>
    );
  }

  if (!content) return null;

  const { userName, generatedAt, synthesis, odus, kabala, tantra, astrology } = content;

  return (
    <main
      style={{ background: '#06070F', minHeight: 'calc(100vh - 56px)', paddingBottom: 100 }}
      className="flex flex-col items-center py-10 px-4"
    >

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: 36, maxWidth: 700, width: '100%' }}>
        <h1
          style={{
            fontFamily: 'var(--font-cinzel, "Cinzel", serif)',
            color: '#F0B429',
            fontSize: 'clamp(1.05rem, 3vw, 1.45rem)',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          Manifesto Akáshico
        </h1>
        <p
          style={{
            color: 'rgba(244,245,255,0.62)',
            fontSize: '0.88rem',
            letterSpacing: '0.06em',
            fontFamily: 'var(--font-lora, "Lora", serif)',
          }}
        >
          {userName}
        </p>
        <p
          style={{
            color: 'rgba(244,245,255,0.28)',
            fontSize: '0.72rem',
            letterSpacing: '0.08em',
            marginTop: 4,
          }}
        >
          Gerado em {generatedAt}
        </p>
      </div>

      {/* ── Incomplete banner ──────────────────────────────────── */}
      {incomplete && (
        <div
          style={{
            maxWidth: 700,
            width: '100%',
            marginBottom: 20,
            background: 'rgba(240,180,41,0.08)',
            border: '1px solid rgba(240,180,41,0.4)',
            borderRadius: 10,
            padding: '12px 18px',
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
          }}
        >
          <span style={{ color: '#F0B429', fontSize: '0.9rem' }}>⚠</span>
          <p
            style={{
              color: '#F0B429',
              fontSize: '0.8rem',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Seu mapa está incompleto — alguns dados podem ser genéricos. Complete seu onboarding para
            uma leitura precisa.
          </p>
        </div>
      )}

      {/* ── Sections ─────────────────────────────────────────── */}
      <div style={{ maxWidth: 700, width: '100%' }}>

        {/* 0 — Síntese */}
        <div style={glass}>
          <div style={sectionTitleStyle('#FB5781')}>
            <span>Síntese dos 4 Pilares</span>
          </div>
          <p
            style={{
              ...descriptionStyle,
              marginTop: 0,
              color: 'rgba(244,245,255,0.82)',
              fontFamily: 'var(--font-lora, "Lora", serif)',
              fontSize: '0.9rem',
              lineHeight: 1.75,
            }}
          >
            {synthesis}
          </p>
        </div>

        {/* I — Odus */}
        <div style={glass}>
          <div style={sectionTitleStyle('#F0B429')}>
            <span>I. Bússola Ancestral — Odus</span>
            <ExpandToggle expanded={expandedOdu} onToggle={() => setExpandedOdu(!expandedOdu)} color="#F0B429" />
          </div>

          <DataRow
            pairs={[
              { label: 'Odu', value: odus.oduName || '—' },
              ...(odus.oduNumber !== null ? [{ label: 'Número', value: String(odus.oduNumber) }] : []),
              ...(odus.elementalForce ? [{ label: 'Força Elemental', value: odus.elementalForce }] : []),
            ]}
          />

          {odus.orixas.length > 0 && (
            <DataPair label="Orixás" value={odus.orixas.join(' · ')} />
          )}

          <p style={descriptionStyle}>{odus.description}</p>

          {expandedOdu && odus.preceitos && odus.preceitos.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={labelStyle}>Preceitos</div>
              <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
                {odus.preceitos.map((p, i) => (
                  <li
                    key={i}
                    style={{
                      color: 'rgba(244,245,255,0.6)',
                      fontSize: '0.83rem',
                      lineHeight: 1.6,
                      marginBottom: 4,
                    }}
                  >
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {odus.provisional && (
            <div
              style={{
                display: 'inline-block',
                marginTop: 14,
                background: 'rgba(240,180,41,0.1)',
                border: '1px solid rgba(240,180,41,0.3)',
                borderRadius: 6,
                padding: '3px 10px',
                fontSize: '0.68rem',
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
        <div style={glass}>
          <div style={sectionTitleStyle('#7C5CFF')}>
            <span>II. O Verbo — Numerologia Cabalística</span>
            <ExpandToggle expanded={expandedKabala} onToggle={() => setExpandedKabala(!expandedKabala)} color="#7C5CFF" />
          </div>

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

        {/* III — Tantra */}
        <div style={glass}>
          <div style={sectionTitleStyle('#2DD4BF')}>
            <span>III. A Anatomia — Tantra</span>
            <ExpandToggle expanded={expandedTantra} onToggle={() => setExpandedTantra(!expandedTantra)} color="#2DD4BF" />
          </div>

          <DataRow
            pairs={[
              { label: 'Alma', value: tantra.soul },
              { label: 'Karma', value: tantra.karma },
              { label: 'Dádiva Divina', value: tantra.divineGift },
              { label: 'Caminho Tântrico', value: tantra.tantricPath },
            ]}
          />

          <p style={descriptionStyle}>{tantra.description}</p>
        </div>

        {/* IV — Astrologia */}
        <div style={glass}>
          <div style={sectionTitleStyle('#7C5CFF')}>
            <span>IV. O Céu — Astrologia</span>
            <ExpandToggle expanded={expandedAstro} onToggle={() => setExpandedAstro(!expandedAstro)} color="#7C5CFF" />
          </div>

          <DataRow
            pairs={[
              { label: 'Ascendente', value: astrology.ascendant },
              { label: 'Planeta Dominante', value: astrology.dominantPlanet },
            ]}
          />

          {astrology.mainPlanets.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={labelStyle}>Posições Planetárias</div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {astrology.mainPlanets.map((p, i) => (
                  <PlainEnglishPlanet
                    key={i}
                    planet={p.name}
                    sign={p.sign}
                    degree={0}
                    variant="compact"
                  />
                ))}
              </div>
            </div>
          )}

          <p style={descriptionStyle}>{astrology.description}</p>
        </div>

      </div>

      {/* ── Floating PDF button ──────────────────────────────── */}
      <a
        href="/api/akasha/manifesto/pdf"
        download
        style={{
          position: 'fixed',
          bottom: 28,
          right: 24,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'linear-gradient(135deg, rgba(240,180,41,0.18) 0%, rgba(240,180,41,0.08) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(240,180,41,0.5)',
          borderRadius: 12,
          padding: '11px 22px',
          color: '#F0B429',
          fontSize: '0.82rem',
          letterSpacing: '0.08em',
          textDecoration: 'none',
          boxShadow: '0 4px 24px rgba(240,180,41,0.15)',
          transition: 'box-shadow 0.2s, border-color 0.2s',
          zIndex: 50,
        }}
      >
        <span style={{ fontSize: '1rem' }}>⬇</span>
        <span>Exportar Manifesto</span>
      </a>

    </main>
  );
}
