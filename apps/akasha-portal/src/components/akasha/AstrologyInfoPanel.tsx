'use client';
import { useState } from 'react';
import { Divider, InfoPanel, Insight, Row } from '@/components/akasha/MandalaChartInfoPanel';
import { PlainEnglishPlanet } from '@/components/akasha/PlainEnglishPlanet';
import { ELEMENT_COLORS, ELEMENT_LABELS } from '@/components/akasha/mandala-elements';
import { ASPECT_SYMBOLS } from '@/components/akasha/mandala-geometry';
import { SignificadoEmbed, resolveSig } from '@/components/akasha/mandala-meanings';
import { formatDegreeToZodiac } from '@/lib/shared/zodiac';

export interface AstrologyAspect {
  planet1: string;
  planet2: string;
  aspect: string;
  orb: number;
  interpretation: string;
}

export interface AstrologyData {
  ascendant: string | null;
  midheaven: string | null;
  dominantPlanet: string | null;
  planets: Array<{
    name: string;
    sign: string;
    degree: number;
    absoluteLongitude: number | null;
    retrograde?: boolean;
    house: number;
  }>;
  aspects: AstrologyAspect[];
  elementalBalance: { fire: number; earth: number; air: number; water: number };
}

export interface ElementGuidance {
  balance: string;
  ritual: string;
}

/**
 * Layer 4 — Movimento Celeste — O Céu.
 * Self-contained info panel: ascendant, midheaven, dominant planet, top 5
 * planets, top 5 aspects, elemental balance pills, and grimoire embed.
 */
export function AstrologyInfoPanel({
  astrology,
  elemGuidance,
}: {
  astrology: AstrologyData;
  elemGuidance: ElementGuidance | null;
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  return (
    <InfoPanel color="#7C5CFF" title="Movimento Celeste — O Céu" subtitle="Anel Cósmico · Camada 4">
      <Row label="Ascendente — como o mundo te percebe" value={astrology.ascendant} />
      <Row label="Meio do Céu — seu chamado público" value={astrology.midheaven} />
      {/* Planetas traduzidos para linguagem prática */}
      {astrology.planets.slice(0, 5).map((p) => (
        <PlainEnglishPlanet
          key={p.name}
          planet={p.name}
          sign={p.sign}
          degree={p.degree}
          house={p.house}
          retrograde={p.retrograde}
          variant="compact"
        />
      ))}
      {showAdvanced ? (
        <>
          <Divider />
          <p
            style={{
              fontSize: '0.75rem',
              color: '#7C5CFF',
              fontWeight: 600,
              marginBottom: '0.35rem',
            }}
          >
            Aspectos Principais{' '}
            <span style={{ color: '#A7AECF', fontWeight: 400 }}>
              — como seus planetas se relacionam entre si
            </span>
          </p>
          {astrology.aspects.slice(0, 5).length === 0 ? (
            <Insight color="#7C5CFF">Sem aspectos principais calculados.</Insight>
          ) : (
            astrology.aspects.slice(0, 5).map((a, i) => {
              const symbol = ASPECT_SYMBOLS[a.aspect.toLowerCase()] ?? a.aspect;
              return (
                <div key={i} style={{ marginBottom: '0.35rem' }}>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: '#F4F5FF',
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {a.planet1} {symbol} {a.planet2} —{' '}
                    <span style={{ color: '#A7AECF' }}>{a.interpretation}</span>
                  </p>
                </div>
              );
            })
          )}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {(Object.entries(astrology.elementalBalance) as [string, number][]).map(([el, val]) => (
              <span
                key={el}
                style={{
                  padding: '3px 10px',
                  borderRadius: '100px',
                  fontSize: '0.6875rem',
                  background: `${ELEMENT_COLORS[el]}18`,
                  border: `1px solid ${ELEMENT_COLORS[el]}44`,
                  color: ELEMENT_COLORS[el],
                }}
              >
                {ELEMENT_LABELS[el]} {val}%
              </span>
            ))}
          </div>
          {elemGuidance && (
            <>
              <Divider />
              <Insight color="#7C5CFF">{elemGuidance.balance}</Insight>
              <Insight color="#2DD4BF">{elemGuidance.ritual}</Insight>
            </>
          )}
          <button
            onClick={() => setShowAdvanced(false)}
            style={{
              marginTop: '0.5rem',
              fontSize: '0.7rem',
              color: '#A7AECF',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline',
            }}
          >
            Ocultar detalhes avançados
          </button>
        </>
      ) : (
        <button
          onClick={() => setShowAdvanced(true)}
          style={{
            marginTop: '0.5rem',
            fontSize: '0.7rem',
            color: '#7C5CFF',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline',
          }}
        >
          Mostrar aspectos e equilíbrio elemental →
        </button>
      )}
      <SignificadoEmbed
        significado={resolveSig('astrologia', astrology.ascendant ?? astrology.dominantPlanet)}
        color="#7C5CFF"
      />
    </InfoPanel>
  );
}
