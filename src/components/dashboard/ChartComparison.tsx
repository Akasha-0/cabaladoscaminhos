'use client';

import { useMemo } from 'react';
import type { MapaNatal, PosicaoPlaneta, Planeta } from '@/lib/astrologia/tipos';
import { calculateSynastry, type SynastryAspect } from '@/lib/astrologia/synastry';
import { BirthChartViz } from './BirthChartViz';

interface ChartComparisonProps {
  chart1: MapaNatal;
  chart2: MapaNatal;
  name1?: string;
  name2?: string;
  size?: number;
}

// Zodiac signs with their symbols and colors
const SIGNOS_DATA: Record<string, { simbolo: string; cor: string }> = {
  aries: { simbolo: '♈', cor: '#E74C3C' },
  touro: { simbolo: '♉', cor: '#27AE60' },
  gemeos: { simbolo: '♊', cor: '#F39C12' },
  cancer: { simbolo: '♋', cor: '#3498DB' },
  leao: { simbolo: '♌', cor: '#E67E22' },
  virgem: { simbolo: '♍', cor: '#2ECC71' },
  libra: { simbolo: '♎', cor: '#9B59B6' },
  escorpiao: { simbolo: '♏', cor: '#C0392B' },
  sagitario: { simbolo: '♐', cor: '#D35400' },
  capricornio: { simbolo: '♑', cor: '#1ABC9C' },
  aquario: { simbolo: '♒', cor: '#2980B9' },
  peixes: { simbolo: '♓', cor: '#8E44AD' },
};

const CORES_ASPECTOS: Record<string, string> = {
  'conjunção': '#FFD700',
  'sextil': '#00CED1',
  'quadratura': '#FF4500',
  'trino': '#32CD32',
  'oposição': '#FF1493',
};

const LABELS_ASPECTOS: Record<string, string> = {
  'conjunção': '☌',
  'sextil': '⚹',
  'quadratura': '□',
  'trino': '△',
  'oposição': '☍',
};

interface PlanetDifference {
  planeta: Planeta;
  chart1Signo: string;
  chart2Signo: string;
  chart1Casa: number;
  chart2Casa: number;
  aspect: SynastryAspect | null;
  isDifferentSigno: boolean;
  isDifferentHouse: boolean;
}

function getAllPlanets(): Planeta[] {
  return ['sol', 'lua', 'mercurio', 'venus', 'marte', 'jupiter', 'saturno', 'urano', 'netuno', 'plutao'];
}

function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

function getAngleDiff(lon1: number, lon2: number): number {
  let diff = Math.abs(normalizeAngle(lon1) - normalizeAngle(lon2));
  if (diff > 180) diff = 360 - diff;
  return diff;
}

function calculateOrb(diff: number, targetAngle: number): number {
  return Math.abs(diff - targetAngle);
}

function getAspectStrength(orb: number, orbMax: number): number {
  if (orb <= 1) return 1;
  if (orb <= orbMax * 0.5) return 0.8;
  if (orb <= orbMax) return 0.5;
  return 0.2;
}

export function ChartComparison({
  chart1,
  chart2,
  name1 = 'Pessoa 1',
  name2 = 'Pessoa 2',
  size = 400,
}: ChartComparisonProps) {
  const synastryResult = useMemo(() => {
    return calculateSynastry(chart1, chart2);
  }, [chart1, chart2]);

  const planetDifferences = useMemo<PlanetDifference[]>(() => {
    const planets = getAllPlanets();
    const differences: PlanetDifference[] = [];

    for (const planeta of planets) {
      const pos1 = chart1.planeta[planeta as keyof typeof chart1.planeta] as PosicaoPlaneta;
      const pos2 = chart2.planeta[planeta as keyof typeof chart2.planeta] as PosicaoPlaneta;

      if (!pos1 || !pos2) continue;

      const isDifferentSigno = pos1.signo !== pos2.signo;
      const isDifferentHouse = pos1.casa !== pos2.casa;

      // Find synastry aspect for this planet pair
      const aspect = synastryResult.aspects.find(
        (a) => a.planet1 === planeta && a.type !== 'conjunção'
      ) || null;

      differences.push({
        planeta,
        chart1Signo: pos1.signo,
        chart2Signo: pos2.signo,
        chart1Casa: pos1.casa,
        chart2Casa: pos2.casa,
        aspect,
        isDifferentSigno,
        isDifferentHouse,
      });
    }

    return differences;
  }, [chart1, chart2, synastryResult]);

  const highlightedDifferences = useMemo(() => {
    return planetDifferences.filter(
      (d) => d.isDifferentSigno || d.isDifferentHouse || d.aspect !== null
    );
  }, [planetDifferences]);

  const aspectCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'conjunção': 0,
      'sextil': 0,
      'quadratura': 0,
      'trino': 0,
      'oposição': 0,
    };

    for (const aspect of synastryResult.aspects) {
      if (counts[aspect.type] !== undefined) {
        counts[aspect.type]++;
      }
    }

    return counts;
  }, [synastryResult.aspects]);

  const scoreColor = useMemo(() => {
    const score = synastryResult.scores.total;
    if (score >= 75) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    if (score >= 25) return 'text-orange-500';
    return 'text-red-500';
  }, [synastryResult.scores.total]);

  const scoreBgColor = useMemo(() => {
    const score = synastryResult.scores.total;
    if (score >= 75) return 'bg-emerald-500/10 border-emerald-500/30';
    if (score >= 50) return 'bg-amber-500/10 border-amber-500/30';
    if (score >= 25) return 'bg-orange-500/10 border-orange-500/30';
    return 'bg-red-500/10 border-red-500/30';
  }, [synastryResult.scores.total]);

  return (
    <div className="w-full space-y-6">
      {/* Header with score */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{name1} vs {name2}</h3>
          <p className="text-sm text-muted-foreground">Comparação de Mapas Natales</p>
        </div>
        <div className={`text-center px-4 py-2 rounded-lg border ${scoreBgColor}`}>
          <div className={`text-2xl font-bold ${scoreColor}`}>
            {synastryResult.scores.total}%
          </div>
          <div className="text-xs text-muted-foreground">Compatibilidade</div>
        </div>
      </div>

      {/* Side-by-side charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col items-center">
          <h4 className="text-sm font-medium mb-2">{name1}</h4>
          <BirthChartViz mapaNatal={chart1} size={size} />
        </div>
        <div className="flex flex-col items-center">
          <h4 className="text-sm font-medium mb-2">{name2}</h4>
          <BirthChartViz mapaNatal={chart2} size={size} />
        </div>
      </div>

      {/* Aspect summary */}
      <div className="grid grid-cols-5 gap-2">
        {Object.entries(aspectCounts).map(([type, count]) => (
          <div
            key={type}
            className="flex flex-col items-center p-2 rounded-lg bg-card border"
          >
            <span
              className="text-lg"
              style={{ color: CORES_ASPECTOS[type] }}
            >
              {LABELS_ASPECTOS[type]}
            </span>
            <span className="text-xs text-muted-foreground capitalize">{type}</span>
            <span className="text-sm font-medium">{count}</span>
          </div>
        ))}
      </div>

      {/* Differences highlight */}
      <div>
        <h4 className="text-sm font-medium mb-3">Diferenças Planetárias</h4>
        <div className="space-y-2">
          {highlightedDifferences.map((diff) => (
            <div
              key={diff.planeta}
              className={`flex items-center gap-4 p-3 rounded-lg border ${
                diff.aspect ? 'bg-primary/5 border-primary/20' : 'bg-card'
              }`}
            >
              <div className="w-20 text-sm font-medium capitalize">
                {diff.planeta}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-lg"
                  style={{ color: SIGNOS_DATA[diff.chart1Signo]?.cor }}
                >
                  {SIGNOS_DATA[diff.chart1Signo]?.simbolo}
                </span>
                <span className="text-xs text-muted-foreground">
                  C{diff.chart1Casa}
                </span>
              </div>
              <span className="text-muted-foreground">vs</span>
              <div className="flex items-center gap-2">
                <span
                  className="text-lg"
                  style={{ color: SIGNOS_DATA[diff.chart2Signo]?.cor }}
                >
                  {SIGNOS_DATA[diff.chart2Signo]?.simbolo}
                </span>
                <span className="text-xs text-muted-foreground">
                  C{diff.chart2Casa}
                </span>
              </div>
              {diff.isDifferentSigno && (
                <span className="px-2 py-0.5 text-xs rounded bg-amber-500/10 text-amber-600">
                  Signo diferente
                </span>
              )}
              {diff.isDifferentHouse && (
                <span className="px-2 py-0.5 text-xs rounded bg-blue-500/10 text-blue-600">
                  Casa diferente
                </span>
              )}
              {diff.aspect && (
                <span
                  className="px-2 py-0.5 text-xs rounded"
                  style={{
                    backgroundColor: `${CORES_ASPECTOS[diff.aspect.type]}20`,
                    color: CORES_ASPECTOS[diff.aspect.type],
                  }}
                >
                  {LABELS_ASPECTOS[diff.aspect.type]} {diff.planeta}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detailed synastry aspects */}
      <div>
        <h4 className="text-sm font-medium mb-3">Aspectos Sinastrais</h4>
        <div className="grid grid-cols-2 gap-2">
          {synastryResult.aspects.slice(0, 12).map((aspect, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 rounded-lg bg-card border"
            >
              <span
                className="text-lg"
                style={{ color: CORES_ASPECTOS[aspect.type] }}
              >
                {LABELS_ASPECTOS[aspect.type]}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium capitalize truncate">
                  {aspect.planet1} — {aspect.planet2}
                </div>
                <div className="text-xs text-muted-foreground">
                  Orb: {aspect.orb.toFixed(1)}°
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Score breakdown */}
      <div>
        <h4 className="text-sm font-medium mb-3">Análise Detalhada</h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="p-3 rounded-lg bg-card border text-center">
            <div className="text-2xl font-bold text-emerald-500">
              {synastryResult.scores.harmony}
            </div>
            <div className="text-xs text-muted-foreground">Harmonia</div>
          </div>
          <div className="p-3 rounded-lg bg-card border text-center">
            <div className="text-2xl font-bold text-amber-500">
              {synastryResult.scores.tension}
            </div>
            <div className="text-xs text-muted-foreground">Tensão</div>
          </div>
          <div className="p-3 rounded-lg bg-card border text-center">
            <div className="text-2xl font-bold text-blue-500">
              {synastryResult.scores.total}
            </div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {synastryResult.summary && (
        <div className="p-4 rounded-lg bg-card border">
          <p className="text-sm text-muted-foreground">{synastryResult.summary}</p>
        </div>
      )}
    </div>
  );
}

export default ChartComparison;