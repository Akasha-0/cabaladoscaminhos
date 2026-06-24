'use client';
import { useTranslation } from '@/i18n';
import Link from 'next/link';
import { Divider, InfoPanel, Insight, Row } from '@/components/akasha/MandalaChartInfoPanel';
import { resolveSig, SignificadoEmbed } from '@/components/akasha/mandala-meanings';

export interface OduInfo {
  oduName: string;
  oduNumber: number | null;
  orixaRegency: string[];
  elementalForce: string | null;
  provisional: boolean;
  preceitos?: string[];
  quizilas?: string[];
}

interface Props {
  odu: OduInfo;
}

/**
 * Layer 1 — Odu (Núcleo / Ancestralidade).
 * Extraído de MandalaChart.tsx em F-219/220 refactor para manter o componente
 * abaixo de 500 linhas e isolar a lógica de rendering do Pilar 1.
 */
export function OduInfoPanel({ odu }: Props) {
  const { t } = useTranslation();
  return (
    <InfoPanel
      color="#F0B429"
      title={t('mandala.panels.odu.title', { name: odu.oduName })}
      subtitle={t('mandala.panels.odu.subtitle')}
    >
      <Row
        label={t('mandala.panels.odu.oduName')}
        value={`${odu.oduName}${odu.oduNumber ? ` (${odu.oduNumber})` : ''}`}
      />
      <Row
        label={t('mandala.panels.odu.orixaRegency')}
        value={odu.orixaRegency.join(', ')}
      />
      <Row label={t('mandala.panels.odu.elementalForce')} value={odu.elementalForce} />
      {odu.provisional && (
        <p style={{ fontSize: '0.6875rem', color: '#5C6691', marginTop: '0.25rem' }}>
          {t('mandala.panels.odu.provisional')}
        </p>
      )}
      {odu.preceitos && odu.preceitos.length > 0 && (
        <>
          <Divider />
          <details>
            <summary
              style={{
                fontSize: '0.75rem',
                color: '#F0B429',
                fontWeight: 600,
                cursor: 'pointer',
                userSelect: 'none',
                listStyle: 'none',
                marginBottom: '0.35rem',
              }}
            >
              {t('mandala.panels.odu.preceitos')}
            </summary>
            {odu.preceitos.map((p, i) => (
              <p key={i} style={{ fontSize: '0.8125rem', color: '#A7AECF' }}>
                ✦ {p}
              </p>
            ))}
          </details>
        </>
      )}
      {odu.quizilas && odu.quizilas.length > 0 && (
        <>
          <Divider />
          <details>
            <summary
              style={{
                fontSize: '0.75rem',
                color: '#FB5781',
                fontWeight: 600,
                cursor: 'pointer',
                userSelect: 'none',
                listStyle: 'none',
                marginBottom: '0.35rem',
              }}
            >
              {t('mandala.panels.odu.quizilas')}
            </summary>
            {odu.quizilas.map((q, i) => (
              <p key={i} style={{ fontSize: '0.8125rem', color: '#A7AECF' }}>
                ⚠ {q}
              </p>
            ))}
          </details>
        </>
      )}
      {(!odu.preceitos || odu.preceitos.length === 0) && (
        <Insight color="#F0B429">
          {t('mandala.panels.odu.noData')}{' '}
          <Link href="/oraculo" style={{ color: '#F0B429', textDecoration: 'underline' }}>
            {t('mandala.panels.odu.consultOracle')}
          </Link>{' '}
          para orientação ancestral personalizada.
        </Insight>
      )}
      <SignificadoEmbed significado={resolveSig('odu', odu.oduName)} color="#F0B429" />
    </InfoPanel>
  );
}
