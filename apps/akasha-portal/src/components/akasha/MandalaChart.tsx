'use client';

import { memo } from 'react';
import { useCockpitStore } from '@/stores/cockpit-store';
import type { AtmosphereIntensity } from '@/stores/cockpit-store';
import { AstrologyInfoPanel, type AstrologyAspect } from '@/components/akasha/AstrologyInfoPanel';
import { IchingInfoPanel } from '@/components/akasha/IchingInfoPanel';
import { KabalaInfoPanel, TantricBodyInfoPanel } from '@/components/akasha/MandalaInfoPanels';
import { OduInfoPanel } from '@/components/akasha/OduInfoPanel';
import { MandalaAtmosphere } from '@/components/akasha/MandalaAtmosphere';
import { MANDALA_STYLES } from '@/components/akasha/layers/mandala-css';
import { LayerDefs } from '@/components/akasha/layers/LayerDefs';
import { LayerStars } from '@/components/akasha/layers/LayerStars';
import { Layer1Ancestralidade } from '@/components/akasha/layers/Layer1Ancestralidade';
import { Layer2Kabala } from '@/components/akasha/layers/Layer2Kabala';
import { Layer3Tantra } from '@/components/akasha/layers/Layer3Tantra';
import { Layer4Astrology } from '@/components/akasha/layers/Layer4Astrology';
import { Layer5Iching } from '@/components/akasha/layers/Layer5Iching';
import { LayerSynergyLines } from '@/components/akasha/layers/LayerSynergyLines';
import { useMandalaData, type MandalaDerivedData } from '@/components/akasha/hooks/useMandalaData';
import { useReducedMotion } from '@/components/akasha/hooks/useReducedMotion';
import {
  PILAR_COLORS,
  PILAR_LABEL_BY_LAYER,
  toXY,
  type Layer,
} from '@/components/akasha/mandala-geometry';
import { MandalaProvider, useMandalaContext } from '@/lib/application/akasha/mandala-context';
import { AkashaAuthorityPrompt } from '@/components/akasha/AkashaAuthorityPrompt';
import type { PilaresDados } from '@/lib/grimoire/significados-curados';

// ─── MandalaData (unchanged — immutable API contract) ────────────────────────

export interface MandalaData {
  incomplete: boolean;
  odus: {
    oduName: string;
    oduNumber: number | null;
    orixaRegency: string[];
    elementalForce: string | null;
    provisional: boolean;
    preceitos?: string[];
    quizilas?: string[];
  };
  kabala: {
    lifePath: number | null;
    lifePathMaster: boolean;
    expression: number | null;
    expressionMaster: boolean;
    motivation: number | null;
    impression: number | null;
    mission: number | null;
    personalYear: number | null;
    personalMonth: number | null;
    personalDay: number | null;
    sefira: string | null;
    hebrewLetter: string | null;
    tarotCard: { major: number; name: string; meaning: string } | null;
    challenges: { first: number; second: number; main: number; last: number } | null;
    pinnacles: {
      first: { number: number; ageEnd: number; meaning: string } | null;
      second: { number: number; ageStart: number; ageEnd: number; meaning: string } | null;
      third: { number: number; ageStart: number; ageEnd: number; meaning: string } | null;
      fourth: { number: number; ageStart: number; meaning: string } | null;
    } | null;
    lifeCycles: {
      first: { number: number; ageStart: number; ageEnd: number } | null;
      second: { number: number; ageStart: number; ageEnd: number } | null;
      third: { number: number; ageStart: number } | null;
    } | null;
  };
  tantra: {
    soul: number | null;
    karma: number | null;
    divineGift: number | null;
    destiny: number | null;
    tantricPath: number | null;
    bodies: Array<{ index: number; name: string; active: boolean }>;
  };
  astrology: {
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
  };
  iching: {
    hexagramNumber: number | null;
    hexagramName: string | null;
    hexagramChineseName: string | null;
    upperTrigram: number | null;
    lowerTrigram: number | null;
    upperTrigramName: string | null;
    lowerTrigramName: string | null;
    lines: boolean[];
    algorithm: string | null;
    provisional: boolean;
    birthDate: string | null;
    birthTime: string | null;
    available: boolean;
    error: string | null;
  };
  _user?: { birthDate: string | null; birthTime: string | null };
}

interface Props {
  data: MandalaData;
}

// ─── Component ────────────────────────────────────────────────────────────────

const LAYERS: Layer[] = [1, 2, 3, 4, 5];

/**
 * MandalaChart — root orchestrator for the interactive Akashic mandala.
 *
 * Phase 3 change: layer state and synthesis are now provided via MandalaContext
 * (created by MandalaProvider). The outer component fetches shared data
 * (atmosphere intensity, reduced-motion preference, per-layer derived data)
 * and passes them as props to InnerMandalaChart, which consumes the context.
 */
const MandalaChart = memo(function MandalaChart({ data }: Props) {
  const atmosphereIntensity = useCockpitStore((s) => s.atmosphereIntensity);
  const reducedMotion = useReducedMotion();
  const derived = useMandalaData(data);

  return (
    <MandalaProvider>
      <InnerMandalaChart
        data={data}
        atmosphereIntensity={atmosphereIntensity}
        reducedMotion={reducedMotion}
        derived={derived}
      />
    </MandalaProvider>
  );
});

export default MandalaChart;

// ─── Inner component (consumes MandalaContext) ────────────────────────────────

/** Inner component — must be rendered inside MandalaProvider. */
const InnerMandalaChart = memo(function InnerMandalaChart({
  data,
  atmosphereIntensity,
  reducedMotion,
  derived,
}: Props & {
  atmosphereIntensity: AtmosphereIntensity;
  reducedMotion: boolean;
  derived: MandalaDerivedData;
}) {
  const {
    activeLayer,
    ringPaused,
    opacity,
    setActiveLayer,
    setHoveredLayer,
    authority,
  } = useMandalaContext();

  // Build partial pilares from MandalaData for AkashaAuthorityPrompt (F-227).
  // Cast through unknown because MandalaData field names (e.g. lifePath)
  // differ from PilaresDados field names (e.g. life_path).
  const pilares = {
    cabala: data.kabala,
    astrologia: data.astrology,
    tantrica: data.tantra,
    odu: data.odus,
    iching: data.iching,
  } as unknown as Partial<PilaresDados>;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
        width: '100%',
        maxWidth: 460,
      }}
    >
      <style>{MANDALA_STYLES}</style>

      {/* Layer selector buttons */}
      <div
        className="flex gap-2 flex-wrap justify-center"
        aria-label="Camadas da Mandala — selecione para revelar significados"
      >
        {LAYERS.map((layer) => {
          const color = PILAR_COLORS[layer];
          const label = PILAR_LABEL_BY_LAYER[layer];
          return (
            <button
              key={layer}
              className="layer-btn"
              onClick={() => setActiveLayer(layer)}
              aria-label={`Camada ${layer} — ${label}`}
              aria-pressed={activeLayer === layer}
              style={{
                fontSize: '0.75rem',
                padding: '8px 16px',
                minHeight: '44px',
                minWidth: '88px',
                borderRadius: '100px',
                border: `1px solid ${activeLayer === layer ? color : 'rgba(38,48,79,0.8)'}`,
                background: activeLayer === layer ? `${color}22` : 'rgba(11,14,28,0.5)',
                color: activeLayer === layer ? color : '#A7AECF',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              C{layer} · {label}
            </button>
          );
        })}
      </div>

      {/* SVG mandala */}
      <div className="relative w-full" style={{ maxWidth: 400 }}>
        <MandalaAtmosphere intensity={atmosphereIntensity} />

        <svg
          viewBox="0 0 400 400"
          width="100%"
          style={{ maxWidth: 400, display: 'block', position: 'relative', zIndex: 1 }}
          aria-label="Mandala Akáshica Toroidal"
        >
          {/* SVG defs (gradients, filters) */}
          <LayerDefs />

          {/* Deep-space background */}
          <circle cx="200" cy="200" r="200" fill="url(#bgGrad)" />

          {/* Stars */}
          <LayerStars />

          {/* Faint pentagram cross-layer lines (behind all layers) */}
          {[0, 72, 144, 216, 288].map((deg, i) => {
            const outer = toXY(deg, 178);
            const inner = toXY(deg, 80);
            return (
              <line
                key={`cross-${i}`}
                x1={outer.x}
                y1={outer.y}
                x2={inner.x}
                y2={inner.y}
                stroke="rgba(45,212,191,0.08)"
                strokeWidth="0.5"
                strokeDasharray="3 5"
              />
            );
          })}

          {/* Layer 5 — I Ching (outermost, rendered first = behind L4/L3/L2/L1) */}
          <Layer5Iching
            data={data}
            tooltipByLayer={derived.tooltipByLayer}
            opacity={opacity}
            onLayerToggle={setActiveLayer}
            onLayerHover={setHoveredLayer}
          />

          {/* Layer 4 — Astrology (with CSS rotation) */}
          <Layer4Astrology
            planetDots={derived.planetDots}
            tooltipByLayer={derived.tooltipByLayer}
            opacity={opacity}
            onLayerToggle={setActiveLayer}
            onLayerHover={setHoveredLayer}
            ringPaused={ringPaused}
            reducedMotion={reducedMotion}
          />

          {/* Layer 3 — Tantra (synergy lines rendered behind Layer 2) */}
          <LayerSynergyLines tantricNodes={derived.tantricNodes} reducedMotion={reducedMotion} />

          <Layer3Tantra
            tantricNodes={derived.tantricNodes}
            tooltipByLayer={derived.tooltipByLayer}
            opacity={opacity}
            onLayerToggle={setActiveLayer}
            onLayerHover={setHoveredLayer}
          />

          {/* Layer 2 — Kabala */}
          <Layer2Kabala
            data={data}
            kabVerts={derived.kabVerts}
            trianglePath={derived.trianglePath}
            tooltipByLayer={derived.tooltipByLayer}
            opacity={opacity}
            onLayerToggle={setActiveLayer}
            onLayerHover={setHoveredLayer}
          />
          {/* Layer 1 — Ancestralidade (innermost, rendered last = on top) */}
          <Layer1Ancestralidade
            data={data}
            tooltipByLayer={derived.tooltipByLayer}
            opacity={opacity}
            onLayerToggle={setActiveLayer}
            onLayerHover={setHoveredLayer}
          />

          {/* Incomplete data badge */}
          {data.incomplete && (
            <text x="200" y="390" textAnchor="middle" fontSize="10" fill="#FB5781" opacity="0.7">
              * dados parciais — complete o perfil
            </text>
          )}
        </svg>
      </div>

      {/* Active layer legend */}
      {activeLayer !== null && (
        <div
          style={{
            fontFamily: 'var(--font-cinzel, serif)',
            fontSize: '0.65rem',
            letterSpacing: '0.15em',
            color: PILAR_COLORS[activeLayer],
            textAlign: 'center',
            opacity: 0.75,
            marginBottom: '0.25rem',
          }}
          aria-hidden="true"
        >
          CAMADA {activeLayer} — {PILAR_LABEL_BY_LAYER[activeLayer]}
        </div>
      )}

      {/* Info panels */}
      {activeLayer === 4 && (
        <AstrologyInfoPanel astrology={data.astrology} elemGuidance={derived.elemGuidance} />
      )}
      {activeLayer === 3 && (
        <TantricBodyInfoPanel tantra={data.tantra} inactiveBodies={derived.inactiveBodies} />
      )}
      {activeLayer === 2 && <KabalaInfoPanel kabala={data.kabala} lpMeaning={derived.lpMeaning} />}
      {activeLayer === 1 && <OduInfoPanel odu={data.odus} />}
      {activeLayer === 5 && <IchingInfoPanel iching={data.iching} />}
      {activeLayer === null && (
        <p style={{ fontSize: '0.75rem', color: '#5C6691', textAlign: 'center' }}>
          Toque em uma camada para revelar seus dados e orientações práticas.
        </p>
      )}

      {/* F-227: Akasha Authority Prompt — shown when authority data is available */}
      {authority && (
        <AkashaAuthorityPrompt authority={authority} pilares={pilares} />
      )}
    </div>
  );
});
