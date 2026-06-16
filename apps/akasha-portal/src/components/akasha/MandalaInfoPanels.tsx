'use client';

import {
  PILAR_COLORS,
  TANTRIC_BODY_WISDOM,
} from '@/components/akasha/mandala-meanings';
import { resolveSig, SignificadoEmbed } from '@/components/akasha/mandala-meanings';
import { Divider, InfoPanel, Insight, Row } from '@/components/akasha/MandalaChartInfoPanel';
import { KOSHAS } from '@/lib/shared/koshas';
import type { MandalaData } from './MandalaChart';

// ── Layer 3 — Corpo e Energia (Tantric Bodies + Koshas) ──────────────────────

interface TantricBodyInfoPanelProps {
  tantra: MandalaData['tantra'];
  inactiveBodies: Array<{ i: number; active: boolean }>;
}

export function TantricBodyInfoPanel({ tantra, inactiveBodies }: TantricBodyInfoPanelProps) {
  return (
    <InfoPanel
      color="#2DD4BF"
      title="Corpo e Energia — Os 11 Corpos"
      subtitle="Teia de Conexão · Camada 3"
    >
      <Row label="Caminho Tântrico" value={tantra.tantricPath} />
      <Row label="Alma" value={tantra.soul} />
      <Row label="Karma" value={tantra.karma} />
      <Row label="Dom Divino" value={tantra.divineGift} />
      <Divider />
      {inactiveBodies.length === 0 ? (
        <Insight color="#2DD4BF">
          Todos os 11 Corpos estão ativos — seu campo espiritual está em fluxo.
        </Insight>
      ) : (
        <>
          <p style={{ fontSize: '0.75rem', color: '#A7AECF', marginBottom: '0.5rem' }}>
            Corpos em tensão (indicados em magenta na Mandala):
          </p>
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
        </>
      )}
      <SignificadoEmbed
        significado={resolveSig('tantrica', tantra.destiny ?? tantra.soul ?? 1)}
        color="#2DD4BF"
      />
      {/* Mandala Fase 4 (spec mandala-fase3-zodiac-tantra): 5 Koshas védicas
          como enriquecimento textual. SVG Layer 3 permanece com 11 bodies
          de Yogi Bhajan. As 5 koshas são conceito tântrico védico paralelo. */}
      <Divider />
      <p style={{ fontSize: '0.75rem', color: '#2DD4BF', fontWeight: 600, marginBottom: '0.5rem' }}>
        5 Koshas (Tantra Védica)
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
              {k.name.pt} <span style={{ color: '#A7AECF', fontWeight: 400 }}>({k.name.sanskrit})</span>
            </p>
            <p style={{ fontSize: '0.75rem', color: '#A7AECF', margin: 0 }}>
              {k.description.pt}
            </p>
          </div>
        </div>
      ))}
    </InfoPanel>
  );
}

// ── Layer 2 — Número de Vida (Kabala) ─────────────────────────────────────────

interface KabalaInfoPanelProps {
  kabala: MandalaData['kabala'];
  lpMeaning: string | null;
}

export function KabalaInfoPanel({ kabala, lpMeaning }: KabalaInfoPanelProps) {
  return (
    <InfoPanel
      color={PILAR_COLORS[2]}
      title="Número de Vida — Geometria Sagrada"
      subtitle="Geometria Interna · Camada 2"
    >
      <Row
        label="Caminho de Vida"
        value={kabala.lifePath}
        master={kabala.lifePathMaster}
      />
      <Row
        label="Expressão"
        value={kabala.expression}
        master={kabala.expressionMaster}
      />
      <Row label="Motivação" value={kabala.motivation} />
      <Row label="Impressão" value={kabala.impression} />
      <Row label="Missão" value={kabala.mission} />
      <Row label="Ano Pessoal" value={kabala.personalYear} />
      <Row label="Mês Pessoal" value={kabala.personalMonth} />
      <Row label="Dia Pessoal" value={kabala.personalDay} />
      <Row label="Sefira" value={kabala.sefira} />
      <Row label="Letra Hebraica" value={kabala.hebrewLetter} />
      {kabala.tarotCard && (
        <>
          <Row
            label="Carta de Tarot"
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
            Desafios
          </p>
          <Row label="Primeiro Desafio" value={kabala.challenges.first} />
          <Row label="Segundo Desafio" value={kabala.challenges.second} />
          <Row label="Desafio Principal" value={kabala.challenges.main} />
          <Row label="Último Desafio" value={kabala.challenges.last} />
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
            Pináculos
          </p>
          {kabala.pinnacles.first && (
            <>
              <Row
                label="1º Pináculo"
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
                label="2º Pináculo"
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
                label="3º Pináculo"
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
                label="4º Pináculo"
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
            Ciclos de Vida
          </p>
          {kabala.lifeCycles.first && (
            <Row
              label="1º Ciclo"
              value={`${kabala.lifeCycles.first.number} (${kabala.lifeCycles.first.ageStart}–${kabala.lifeCycles.first.ageEnd})`}
            />
          )}
          {kabala.lifeCycles.second && (
            <Row
              label="2º Ciclo"
              value={`${kabala.lifeCycles.second.number} (${kabala.lifeCycles.second.ageStart}–${kabala.lifeCycles.second.ageEnd})`}
            />
          )}
          {kabala.lifeCycles.third && (
            <Row
              label="3º Ciclo"
              value={`${kabala.lifeCycles.third.number} (a partir de ${kabala.lifeCycles.third.ageStart})`}
            />
          )}
        </>
      )}
      <SignificadoEmbed
        significado={resolveSig('cabala', kabala.lifePath)}
        color={PILAR_COLORS[2]}
      />
    </InfoPanel>
  );
}
