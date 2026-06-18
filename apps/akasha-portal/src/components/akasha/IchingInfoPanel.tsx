'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Divider, InfoPanel, Insight, Row } from '@/components/akasha/MandalaChartInfoPanel';
import { SignificadoEmbed, resolveSig } from '@/components/akasha/mandala-meanings';

export interface IchingInfo {
  hexagramNumber: number | null;
  hexagramName: string | null;
  hexagramChineseName: string | null;
  upperTrigram: number | null;
  upperTrigramName: string | null;
  lowerTrigram: number | null;
  lowerTrigramName: string | null;
  lines: boolean[];
  algorithm: string | null;
  provisional: boolean;
  birthDate: string | null;
  birthTime: string | null;
  available: boolean;
  error: string | null;
}

/**
 * Layer 5 — Mutação do Caminho — Hexagrama do Ori.
 * Self-contained info panel: hexagram, trigrams, the 6 lines (bottom→top),
 * birth date/time, and the SignificadoEmbed from the grimoire.
 */
export function IchingInfoPanel({ iching }: { iching: IchingInfo }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  return (
    <InfoPanel
      color="#A0763A"
      title="Mutação do Caminho — Hexagrama do Ori"
      subtitle="Sabedoria Ancestral Chinesa · Camada 5"
    >
      {iching.available ? (
        <>
          <Row
            label="Hexagrama — sua forma de agir no mundo"
            value={
              iching.hexagramChineseName
                ? `${iching.hexagramNumber} — ${iching.hexagramName} (${iching.hexagramChineseName})`
                : `${iching.hexagramNumber} — ${iching.hexagramName}`
            }
          />
          <Row
            label="Trigrama superior — a energia que recebe"
            value={
              iching.upperTrigram != null && iching.upperTrigramName
                ? `${iching.upperTrigram} — ${iching.upperTrigramName}`
                : iching.upperTrigramName
            }
          />
          <Row
            label="Trigrama inferior — a energia que sustenta"
            value={
              iching.lowerTrigram != null && iching.lowerTrigramName
                ? `${iching.lowerTrigram} — ${iching.lowerTrigramName}`
                : iching.lowerTrigramName
            }
          />
          {showAdvanced ? (
            <>
              {Array.isArray(iching.lines) && iching.lines.length === 6 && (
                <>
                  <Divider />
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: '#A0763A',
                      fontWeight: 600,
                      marginBottom: '0.35rem',
                    }}
                  >
                    As 6 Linhas (de baixo para cima){' '}
                    <span style={{ color: '#A7AECF', fontWeight: 400 }}>
                      — o yang e yin que moldam seu hexagrama
                    </span>
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column-reverse',
                      gap: '4px',
                      alignItems: 'center',
                    }}
                  >
                    {iching.lines.map((yang, i) => (
                      <span
                        key={i}
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.875rem',
                          color: yang ? '#F4F5FF' : '#A0763A',
                          letterSpacing: '0.15em',
                        }}
                      >
                        {yang ? '———' : '— — —'}
                      </span>
                    ))}
                  </div>
                </>
              )}
              <Divider />
              <Row
                label="Data de nascimento — quando seu hexagrama foi selado"
                value={
                  iching.birthDate
                    ? new Date(iching.birthDate + 'T00:00:00').toLocaleDateString('pt-BR')
                    : null
                }
              />
              {iching.birthTime && (
                <Row label="Hora — o momento cósmico da sua consulta" value={iching.birthTime} />
              )}
              {iching.provisional && (
                <p style={{ fontSize: '0.6875rem', color: '#5C6691', marginTop: '0.25rem' }}>
                  * Cálculo provisório — hora de nascimento não informada.
                </p>
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
                color: '#A0763A',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline',
              }}
            >
              Mostrar detalhes avançados →
            </button>
          )}
          <SignificadoEmbed
            significado={resolveSig('iching', iching.hexagramNumber)}
            color="#A0763A"
          />
        </>
      ) : (
        <div>
          <p style={{ fontSize: '0.8125rem', color: '#A7AECF', lineHeight: 1.55 }}>
            Forneça sua data e hora de nascimento no perfil para revelar o Hexagrama do seu Ori.{' '}
            <Link href="/oraculo" style={{ color: '#A0763A', textDecoration: 'underline' }}>
              Consulte o Oráculo
            </Link>{' '}
            para orientação ancestral personalizada.
          </p>
        </div>
      )}
    </InfoPanel>
  );
}
