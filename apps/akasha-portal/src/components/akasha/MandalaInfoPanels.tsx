'use client';
import { useState } from 'react';

import { PILAR_COLORS } from '@/components/akasha/mandala-geometry';
import { TANTRIC_BODY_WISDOM } from '@/components/akasha/mandala-meanings';
import { resolveSig, SignificadoEmbed } from '@/components/akasha/mandala-meanings';
import { Divider, InfoPanel, Insight, Row } from '@/components/akasha/MandalaChartInfoPanel';
import { KOSHAS } from '@/lib/shared/koshas';
import type { MandalaData } from './MandalaChart';
const KOSHA_PT: Record<string, string> = {
  'Anna-maya':    'Corpo Físico — estrutura e movimento',
  'Prana-maya':   'Corpo Vital — respiração e energia',
  'Mano-maya':    'Corpo Mental — pensamentos e emoções',
  'Vijnana-maya': 'Corpo Intuitivo — sabedoria e discernimento',
  'Ananda-maya':  'Corpo de Bem-aventurança — propósito e trascendência',
};

// ── Layer 3 — Corpo e Energia (Tantric Bodies + Koshas) ──────────────────────

interface TantricBodyInfoPanelProps {
  tantra: MandalaData['tantra'];
  inactiveBodies: Array<{ i: number; active: boolean }>;
}

export function TantricBodyInfoPanel({ tantra, inactiveBodies }: TantricBodyInfoPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  return (
    <InfoPanel
      color="#2DD4BF"
      title="Corpo e Energia — Os 11 Corpos"
      subtitle="Teia de Conexão · Camada 3"
    >
      <Row label="Caminho Tântrico — sua prática de integração" value={tantra.tantricPath} />
      <Row label="Alma — essência que reencarna" value={tantra.soul} />
      <Row label="Karma — legado de ações passadas" value={tantra.karma} />
      <Row label="Dom Divino — talento espiritual a cultivar" value={tantra.divineGift} />
      <Divider />
      {inactiveBodies.length === 0 ? (
        <Insight color="#2DD4BF">
          Todos os 11 Corpos estão ativos — seu campo espiritual está em fluxo.
        </Insight>
      ) : (
        <>
          <p style={{ fontSize: '0.75rem', color: '#A7AECF', marginBottom: '0.5rem' }}>
            Corpos a ativar (indicados em magenta na Mandala):
          </p>
          <details aria-label={`${inactiveBodies.length} corpos tântricos inativos`}>
            <summary
              style={{
                color: '#A7AECF',
                fontSize: '0.8rem',
                cursor: 'pointer',
                userSelect: 'none',
                listStyle: 'none',
                marginBottom: '0.35rem',
              }}
            >
              {inactiveBodies.length} Corpos inativos — clique para ver detalhes →
            </summary>
            {inactiveBodies.map((n) => {
              const w = TANTRIC_BODY_WISDOM[n.i + 1];
              return (
                <div key={n.i} style={{ marginBottom: '0.5rem' }}>
                  <p style={{ fontSize: '0.8125rem', color: '#FB5781', fontWeight: 600 }}>
                    Corpo {n.i + 1} — {w?.desc}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#A7AECF' }}>
                    Desafio: {w?.challenge} · Ativar: {w?.activate}
                  </p>
                </div>
              );
            })}
          </details>
        </>
      )}
      <SignificadoEmbed
        significado={resolveSig('tantrica', tantra.destiny ?? tantra.soul ?? 1)}
        color="#2DD4BF"
      />
      {/* Mandala Fase 4 (spec mandala-fase3-zodiac-tantra): 5 Koshas védicas
          como enriquecimento textual. SVG Layer 3 permanece com 11 bodies
          de Yogi Bhajan. As 5 koshas são conceito tântrico védico paralelo. */}
      {showAdvanced ? (
        <>
          <Divider />
          <p style={{ fontSize: '0.75rem', color: '#2DD4BF', fontWeight: 600, marginBottom: '0.5rem' }}>
            5 Koshas (Tantra Védica){' '}
            <span style={{ color: '#A7AECF', fontWeight: 400 }}>
              — os 5 revestimentos do ser
            </span>
          </p>
          {KOSHAS.map((k) => (
            <div
              key={k.id}
              data-testid={`kosha-${k.id}`}
              style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}
            >
              <span
                aria-hidden
                style={{
                  display: 'inline-block',
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: k.color,
                  marginTop: 6,
                  flexShrink: 0,
                }}
              />
              <div>
                <p style={{ fontSize: '0.8125rem', color: '#FFFFFF', fontWeight: 600, margin: 0 }}>
                  {KOSHA_PT[k.name.sanskrit] ?? k.name.pt}{' '}
                  <span style={{ color: '#A7AECF', fontWeight: 400 }}>({k.name.sanskrit})</span>
                </p>
                <p style={{ fontSize: '0.75rem', color: '#A7AECF', margin: 0 }}>
                  {k.description.pt}
                </p>
              </div>
            </div>
          ))}
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
            color: '#2DD4BF',
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
    </InfoPanel>
  );
}

// ── Layer 2 — Número de Vida (Kabala) ─────────────────────────────────────────

interface KabalaInfoPanelProps {
  kabala: MandalaData['kabala'];
  lpMeaning: string | null;
}

export function KabalaInfoPanel({ kabala, lpMeaning }: KabalaInfoPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  return (
    <InfoPanel
      color={PILAR_COLORS[2]}
      title="Número de Vida — Geometria Sagrada"
      subtitle="Geometria Interna · Camada 2"
    >
      <Row
        label="Caminho de Vida — o mapa da sua jornada"
        value={kabala.lifePath}
        master={kabala.lifePathMaster}
      />
      <Row
        label="Expressão — como você se manifesta"
        value={kabala.expression}
        master={kabala.expressionMaster}
      />
      <Row label="Motivação — o que move suas escolhas" value={kabala.motivation} />
      <Row label="Impressão — como os outros te percebem" value={kabala.impression} />
      <Row label="Missão — seu propósito incarnatório" value={kabala.mission} />
      <Row label="Ano Pessoal — energia deste ciclo" value={kabala.personalYear} />
      <Row label="Mês Pessoal — energia deste mês" value={kabala.personalMonth} />
      <Row label="Dia Pessoal — energia de hoje" value={kabala.personalDay} />
      <Row label="Sefira — atributo divino em ação" value={kabala.sefira} />
      <Row label="Letra Hebraica — som sagrado do seu caminho" value={kabala.hebrewLetter} />
      {kabala.tarotCard && (
        <>
          <Row
            label="Carta de Tarot — arcano do seu destino"
            value={`${kabala.tarotCard.name} (#${kabala.tarotCard.major})`}
          />
          {kabala.tarotCard.meaning && (
            <Insight color={PILAR_COLORS[2]}>{kabala.tarotCard.meaning}</Insight>
          )}
        </>
      )}
      {lpMeaning && (
        <>
          <Divider />
          <Insight color={PILAR_COLORS[2]}>{lpMeaning}</Insight>
        </>
      )}
      {(kabala.challenges || kabala.pinnacles || kabala.lifeCycles) && (
        showAdvanced ? (
          <>
            {kabala.challenges && (
              <>
                <Divider />
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: PILAR_COLORS[2],
                    fontWeight: 600,
                    marginBottom: '0.35rem',
                  }}
                >
                  Ciclos de Desafio{' '}
            <span style={{ color: '#A7AECF', fontWeight: 400 }}>
              — provas que moldam seu caminho
            </span>
          </p>
                <Row label="1º Desafio — o que enfrentar primeiro" value={kabala.challenges.first} />
                <Row label="2º Desafio — o que superar" value={kabala.challenges.second} />
                <Row label="Desafio Principal — a prova central" value={kabala.challenges.main} />
                <Row label="Último Desafio — lição final a harmonizar" value={kabala.challenges.last} />
              </>
            )}
            {kabala.pinnacles && (
              <>
                <Divider />
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: PILAR_COLORS[2],
                    fontWeight: 600,
                    marginBottom: '0.35rem',
                  }}
                >
                  Marcos da Vida{' '}
            <span style={{ color: '#A7AECF', fontWeight: 400 }}>
              — transições que redefinem seu caminho
            </span>
          </p>
                {kabala.pinnacles.first && (
                  <>
                    <Row
                      label="1º Pináculo — primeira fase de crescimento"
                      value={`${kabala.pinnacles.first.number} (até ${kabala.pinnacles.first.ageEnd})`}
                    />
                    {kabala.pinnacles.first.meaning && (
                      <Insight color={PILAR_COLORS[2]}>{kabala.pinnacles.first.meaning}</Insight>
                    )}
                  </>
                )}
                {kabala.pinnacles.second && (
                  <>
                    <Row
                      label="2º Pináculo — maturação da identidade"
                      value={`${kabala.pinnacles.second.number} (${kabala.pinnacles.second.ageStart}–${kabala.pinnacles.second.ageEnd})`}
                    />
                    {kabala.pinnacles.second.meaning && (
                      <Insight color={PILAR_COLORS[2]}>{kabala.pinnacles.second.meaning}</Insight>
                    )}
                  </>
                )}
                {kabala.pinnacles.third && (
                  <>
                    <Row
                      label="3º Pináculo — construção do propósito"
                      value={`${kabala.pinnacles.third.number} (${kabala.pinnacles.third.ageStart}–${kabala.pinnacles.third.ageEnd})`}
                    />
                    {kabala.pinnacles.third.meaning && (
                      <Insight color={PILAR_COLORS[2]}>{kabala.pinnacles.third.meaning}</Insight>
                    )}
                  </>
                )}
                {kabala.pinnacles.fourth && (
                  <>
                    <Row
                      label="4º Pináculo — integração da sabedoria"
                      value={`${kabala.pinnacles.fourth.number} (depois de ${kabala.pinnacles.fourth.ageStart})`}
                    />
                    {kabala.pinnacles.fourth.meaning && (
                      <Insight color={PILAR_COLORS[2]}>{kabala.pinnacles.fourth.meaning}</Insight>
                    )}
                  </>
                )}
              </>
            )}
            {kabala.lifeCycles && (
              <>
                <Divider />
                <p
                  style={{
                    fontSize: '0.75rem',
                    color: PILAR_COLORS[2],
                    fontWeight: 600,
                    marginBottom: '0.35rem',
                  }}
                >
                  Ritmo de Vida{' '}
            <span style={{ color: '#A7AECF', fontWeight: 400 }}>
              — ciclos que pedem consciência
            </span>
          </p>
                {kabala.lifeCycles.first && (
                  <Row
                    label="1º Ciclo — primeiro ritmo de vida"
                    value={`${kabala.lifeCycles.first.number} (${kabala.lifeCycles.first.ageStart}–${kabala.lifeCycles.first.ageEnd})`}
                  />
                )}
                {kabala.lifeCycles.second && (
                  <Row
                    label="2º Ciclo — expansão das possibilidades"
                    value={`${kabala.lifeCycles.second.number} (${kabala.lifeCycles.second.ageStart}–${kabala.lifeCycles.second.ageEnd})`}
                  />
                )}
                {kabala.lifeCycles.third && (
                  <Row
                    label="3º Ciclo — amadurecimento espiritual"
                    value={`${kabala.lifeCycles.third.number} (a partir de ${kabala.lifeCycles.third.ageStart})`}
                  />
                )}
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
              color: PILAR_COLORS[2],
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline',
            }}
          >
            Mostrar detalhes avançados →
          </button>
        )
      )}
      <SignificadoEmbed
        significado={resolveSig('cabala', kabala.lifePath)}
        color={PILAR_COLORS[2]}
      />
    </InfoPanel>
  );
}
