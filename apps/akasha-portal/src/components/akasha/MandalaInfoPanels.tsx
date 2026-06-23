'use client';
import { useState } from 'react';
import { Divider, InfoPanel, Insight, Row } from '@/components/akasha/MandalaChartInfoPanel';
import { PILAR_COLORS } from '@/components/akasha/mandala-geometry';
import { TANTRIC_BODY_WISDOM } from '@/components/akasha/mandala-meanings';
import { resolveSig, SignificadoEmbed } from '@/components/akasha/mandala-meanings';
import { KOSHAS } from '@/lib/shared/koshas';
import { useTranslation } from '@/i18n';
import type { MandalaData } from './MandalaChart';

const KOSHA_PT: Record<string, string> = {
  'Anna-maya': 'Corpo Físico — estrutura e movimento',
  'Prana-maya': 'Corpo Vital — respiração e energia',
  'Mano-maya': 'Corpo Mental — pensamentos e emoções',
  'Vijnana-maya': 'Corpo Intuitivo — sabedoria e discernimento',
  'Ananda-maya': 'Corpo de Bem-aventurança — propósito e trascendência',
};

// ── Layer 3 — Corpo e Energia (Tantric Bodies + Koshas) ──────────────────────

interface TantricBodyInfoPanelProps {
  tantra: MandalaData['tantra'];
  inactiveBodies: Array<{ i: number; active: boolean }>;
}

export function TantricBodyInfoPanel({ tantra, inactiveBodies }: TantricBodyInfoPanelProps) {
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);
  return (
    <InfoPanel
      color="#2DD4BF"
      title={t('mandala.panels.tantra.title')}
      subtitle={t('mandala.panels.tantra.subtitle')}
    >
      <Row label={t('mandala.panels.tantra.tantricPath')} value={tantra.tantricPath} />
      <Row label={t('mandala.panels.tantra.soul')} value={tantra.soul} />
      <Row label={t('mandala.panels.tantra.karma')} value={tantra.karma} />
      <Row label={t('mandala.panels.tantra.divineGift')} value={tantra.divineGift} />
      <Divider />
      {inactiveBodies.length === 0 ? (
        <Insight color="#2DD4BF">
          {t('mandala.panels.tantra.allBodiesActive')}
        </Insight>
      ) : (
        <>
          <p style={{ fontSize: '0.75rem', color: '#A7AECF', marginBottom: '0.5rem' }}>
            {t('mandala.panels.tantra.inactiveBodiesHint')}
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
              {t('mandala.panels.tantra.inactiveBodiesSummary')}
            </summary>
            {inactiveBodies.map((n) => {
              const w = TANTRIC_BODY_WISDOM[n.i + 1];
              return (
                <div key={n.i} style={{ marginBottom: '0.5rem' }}>
                  <p style={{ fontSize: '0.8125rem', color: '#FB5781', fontWeight: 600 }}>
                    {t('mandala.panels.tantra.title')} {n.i + 1} — {w?.desc}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#A7AECF' }}>
                    {t('mandala.panels.tantra.challenge')}: {w?.challenge} · {t('mandala.panels.tantra.activate')}: {w?.activate}
                  </p>
                </div>
              );
            })}
          </details>
        </>
      )}
      <SignificadoEmbed
        significado={resolveSig('tantrica', tantra.soul ?? 1)}
        color="#2DD4BF"
      />
      {/* Mandala Fase 4 (spec mandala-fase3-zodiac-tantra): 5 Koshas védicas
          como enriquecimento textual. SVG Layer 3 permanece com 11 bodies
          de Yogi Bhajan. As 5 koshas são conceito tântrico védico paralelo. */}
      {showAdvanced ? (
        <>
          <Divider />
          <p
            style={{
              fontSize: '0.75rem',
              color: '#2DD4BF',
              fontWeight: 600,
              marginBottom: '0.5rem',
            }}
          >
            {t('mandala.panels.tantra.koshasTitle')}{' '}
            <span style={{ color: '#A7AECF', fontWeight: 400 }}>
              {t('mandala.panels.tantra.koshasSubtitle')}
            </span>
          </p>
          {KOSHAS.map((k) => (
            <div
              key={k.id}
              data-testid={`kosha-${k.id}`}
              style={{
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
              }}
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
            {t('mandala.panels.tantra.hideAdvanced')}
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
          {t('mandala.panels.tantra.showAdvanced')}
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
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);
  return (
    <InfoPanel
      color={PILAR_COLORS[2]}
      title={t('mandala.panels.kabala.title')}
      subtitle={t('mandala.panels.kabala.subtitle')}
    >
      <Row
        label={t('mandala.panels.kabala.lifePath')}
        value={kabala.lifePath}
        master={kabala.lifePathMaster}
      />
      <Row
        label={t('mandala.panels.kabala.expression')}
        value={kabala.expression}
        master={kabala.expressionMaster}
      />
      <Row label={t('mandala.panels.kabala.motivation')} value={kabala.motivation} />
      <Row label={t('mandala.panels.kabala.impression')} value={kabala.impression} />
      <Row label={t('mandala.panels.kabala.mission')} value={kabala.mission} />
      <Row label={t('mandala.panels.kabala.personalYear')} value={kabala.personalYear} />
      <Row label={t('mandala.panels.kabala.personalMonth')} value={kabala.personalMonth} />
      <Row label={t('mandala.panels.kabala.personalDay')} value={kabala.personalDay} />
      <Row label={t('mandala.panels.kabala.sefira')} value={kabala.sefira} />
      <Row label={t('mandala.panels.kabala.hebrewLetter')} value={kabala.hebrewLetter} />
      {kabala.tarotCard && (
        <>
          <Row
            label={t('mandala.panels.kabala.tarotCard')}
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
      {(kabala.challenges || kabala.pinnacles || kabala.lifeCycles) &&
        (showAdvanced ? (
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
                  {t('mandala.panels.kabala.challenges')}{' '}
                  <span style={{ color: '#A7AECF', fontWeight: 400 }}>
                    {t('mandala.panels.kabala.challengesSubtitle')}
                  </span>
                </p>
                <Row
                  label={t('mandala.panels.kabala.challengeFirst')}
                  value={kabala.challenges.first}
                />
                <Row label={t('mandala.panels.kabala.challengeSecond')} value={kabala.challenges.second} />
                <Row label={t('mandala.panels.kabala.challengeMain')} value={kabala.challenges.main} />
                <Row
                  label={t('mandala.panels.kabala.challengeLast')}
                  value={kabala.challenges.last}
                />
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
                  {t('mandala.panels.kabala.pinnacles')}{' '}
                  <span style={{ color: '#A7AECF', fontWeight: 400 }}>
                    {t('mandala.panels.kabala.pinnaclesSubtitle')}
                  </span>
                </p>
                {kabala.pinnacles.first && (
                  <>
                    <Row
                      label={t('mandala.panels.kabala.pinacleFirst')}
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
                      label={t('mandala.panels.kabala.pinacleSecond')}
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
                      label={t('mandala.panels.kabala.pinacleThird')}
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
                      label={t('mandala.panels.kabala.pinacleFourth')}
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
                  {t('mandala.panels.kabala.lifeCycles')}{' '}
                  <span style={{ color: '#A7AECF', fontWeight: 400 }}>
                    {t('mandala.panels.kabala.lifeCyclesSubtitle')}
                  </span>
                </p>
                {kabala.lifeCycles.first && (
                  <Row
                    label={t('mandala.panels.kabala.cycleFirst')}
                    value={`${kabala.lifeCycles.first.number} (${kabala.lifeCycles.first.ageStart}–${kabala.lifeCycles.first.ageEnd})`}
                  />
                )}
                {kabala.lifeCycles.second && (
                  <Row
                    label={t('mandala.panels.kabala.cycleSecond')}
                    value={`${kabala.lifeCycles.second.number} (${kabala.lifeCycles.second.ageStart}–${kabala.lifeCycles.second.ageEnd})`}
                  />
                )}
                {kabala.lifeCycles.third && (
                  <Row
                    label={t('mandala.panels.kabala.cycleThird')}
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
              {t('mandala.panels.kabala.hideAdvanced')}
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
            {t('mandala.panels.kabala.showAdvanced')}
          </button>
        ))}
      <SignificadoEmbed
        significado={resolveSig('cabala', kabala.lifePath)}
        color={PILAR_COLORS[2]}
      />
    </InfoPanel>
  );
}
