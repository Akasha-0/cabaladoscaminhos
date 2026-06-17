'use client';
import { useState } from 'react';
import { Divider, InfoPanel, Insight, Row } from '@/components/akasha/MandalaChartInfoPanel';
import { SignificadoEmbed, resolveSig } from '@/components/akasha/mandala-meanings';
import { ELEMENT_COLORS, ELEMENT_LABELS } from '@/components/akasha/mandala-elements';
import { ASPECT_SYMBOLS } from '@/components/akasha/mandala-geometry';
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
      {(() => {
        const HOUSE_LABELS: Record<number, string> = {
          1: 'Casa 1 — Identidade e aparência',
          2: 'Casa 2 — Recursos e valores',
          3: 'Casa 3 — Comunicação e aprendizado',
          4: 'Casa 4 — Lar e raízes',
          5: 'Casa 5 — Criação e prazer',
          6: 'Casa 6 — Rotina e saúde',
          7: 'Casa 7 — Parcerias e contratos',
          8: 'Casa 8 — Transformação e partilha',
          9: 'Casa 9 — Expansão e propósito',
          10: 'Casa 10 — Missão pública e carreira',
          11: 'Casa 11 — Coletivo e ideais',
          12: 'Casa 12 — Inner world e trascendência',
        };
        const PLANET_MEANING: Record<string, string> = {
          Sol: 'sua vontade central que ilumina',
          Lua: 'seu mundo emocional e memória',
          Marte: 'sua energia de ação e coragem',
          Mercúrio: 'sua mente e comunicação',
          Vênus: 'seu amor e valores',
          Júpiter: 'sua expansão e propósito',
          Saturno: 'sua estrutura e responsabilidade',
          Urano: 'sua individualidade e inovação',
          Netuno: 'sua espiritualidade e intuição',
          Plutão: 'sua transformação e poder',
        };
        return astrology.planets.slice(0, 5).map((p) => {
          const meaning = PLANET_MEANING[p.name] ?? '';
          const houseLabel = HOUSE_LABELS[p.house] ?? `Casa ${p.house}`;
          return (
            <div key={p.name} style={{ marginBottom: '0.25rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline' }}>
                <span style={{ fontSize: '0.75rem', color: '#9D86FF', minWidth: '120px', flexShrink: 0, fontWeight: 600 }}>
                  {p.name}
                </span>
                <span style={{ fontSize: '0.8125rem', color: '#F4F5FF' }}>
                  {formatDegreeToZodiac(p.degree)}
                  {p.retrograde && <span style={{ color: '#FB5781', fontSize: '0.65rem', marginLeft: 4 }}>↺</span>}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'baseline', paddingLeft: '120px' }}>
                <span style={{ fontSize: '0.65rem', color: '#5C6691', minWidth: '140px' }}>{meaning}</span>
                <span style={{ fontSize: '0.7rem', color: '#7C5CFF' }}>{houseLabel}</span>
              </div>
            </div>
          );
        });
      })()}
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
            {(Object.entries(astrology.elementalBalance) as [string, number][]).map(
              ([el, val]) => (
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
              )
            )}
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
