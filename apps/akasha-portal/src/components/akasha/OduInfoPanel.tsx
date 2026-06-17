'use client';
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
  return (
    <InfoPanel
      color="#F0B429"
      title={`Odu: ${odu.oduName}`}
      subtitle="Núcleo — Ancestralidade · Camada 1"
    >
      <Row
        label="Odu de Nascimento — sua essência ancestral"
        value={`${odu.oduName}${odu.oduNumber ? ` (${odu.oduNumber})` : ''}`}
      />
      <Row label="Orixá(s) regente(s) — suas forças espirituais" value={odu.orixaRegency.join(', ')} />
      <Row label="Força Elemental — seu elemento estruturante" value={odu.elementalForce} />
      {odu.provisional && (
        <p style={{ fontSize: '0.6875rem', color: '#5C6691', marginTop: '0.25rem' }}>
          * Cálculo provisório — confirmar com linhagem de referência.
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
              Preceitos do Odu — mandamentos sagrados da sua linhagem
            </summary>
            {odu.preceitos.map((p, i) => (
              <p key={i} style={{ fontSize: '0.8125rem', color: '#A7AECF' }}>
                ✦ {p}
              </p>
            ))}
          </details>
        </>
      )}
]
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
              Quizilás — práticas que enfraquecem sua conexão
            </summary>
            {odu.quizilas.map((q, i) => (
              <p key={i} style={{ fontSize: '0.8125rem', color: '#A7AECF' }}>
                ⚠ {q}
              </p>
            ))}
          </details>
        </>
      )}
]
      {(!odu.preceitos || odu.preceitos.length === 0) && (
        <Insight color="#F0B429">
          As quizilás e preceitos específicos do seu Odu serão exibidos quando o Grimório for
          sincronizado.{' '}
          <Link href="/oraculo" style={{ color: '#F0B429', textDecoration: 'underline' }}>
            Consulte o Oráculo
          </Link>{' '}
          para orientação ancestral personalizada.
        </Insight>
      )}
      <SignificadoEmbed significado={resolveSig('odu', odu.oduName)} color="#F0B429" />
    </InfoPanel>
  );
}
