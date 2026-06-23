'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Divider, InfoPanel, Insight, Row } from '@/components/akasha/MandalaChartInfoPanel';
import { SignificadoEmbed, resolveSig } from '@/components/akasha/mandala-meanings';
import { useTranslation } from '@/i18n';

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
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);
  return (
    <InfoPanel
      color="#A0763A"
      title={t('mandala.panels.iching.title')}
      subtitle={t('mandala.panels.iching.subtitle')}
    >
      {iching.available ? (
        <>
          <Row
            label={t('mandala.panels.iching.hexagram')}
            value={
              iching.hexagramChineseName
                ? `${iching.hexagramNumber} — ${iching.hexagramName} (${iching.hexagramChineseName})`
                : `${iching.hexagramNumber} — ${iching.hexagramName}`
            }
          />
          <Row
            label={t('mandala.panels.iching.upperTrigram')}
            value={
              iching.upperTrigram != null && iching.upperTrigramName
                ? `${iching.upperTrigram} — ${iching.upperTrigramName}`
                : iching.upperTrigramName
            }
          />
          <Row
            label={t('mandala.panels.iching.lowerTrigram')}
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
                    {t('mandala.panels.iching.linesTitle')}{' '}
                    <span style={{ color: '#A7AECF', fontWeight: 400 }}>
                      {t('mandala.panels.iching.linesSubtitle')}
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
                label={t('mandala.panels.iching.birthDate')}
                value={
                  iching.birthDate
                    ? new Date(iching.birthDate + 'T00:00:00').toLocaleDateString('pt-BR')
                    : null
                }
              />
              {iching.birthTime && (
                <Row label={t('mandala.panels.iching.birthTime')} value={iching.birthTime} />
              )}
              {iching.provisional && (
                <p style={{ fontSize: '0.6875rem', color: '#5C6691', marginTop: '0.25rem' }}>
                  {t('mandala.panels.iching.provisional')}
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
                {t('mandala.panels.iching.hideAdvanced')}
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
              {t('mandala.panels.iching.showAdvanced')}
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
            {t('mandala.panels.iching.noData')}{' '}
            <Link href="/oraculo" style={{ color: '#A0763A', textDecoration: 'underline' }}>
              {t('mandala.panels.iching.consultOracle')}
            </Link>{' '}
            para orientação ancestral personalizada.
          </p>
        </div>
      )}
    </InfoPanel>
  );
}
