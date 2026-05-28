'use client';

import { useState, useMemo } from 'react';
import type { MapaNatal, PosicaoPlaneta, Aspecto, Casa } from '@/lib/astrologia/tipos';
import type { SynastryAspect } from '@/lib/astrologia/synastry';
import SynastryChart from './SynastryChart';

interface SynastryOverlayProps {
  chart1: MapaNatal;
  chart2: MapaNatal;
  aspects: SynastryAspect[];
  name1?: string;
  name2?: string;
  size?: number;
}

interface LayerState {
  signs: boolean;
  planets: boolean;
  houses: boolean;
  aspects: boolean;
  degrees: boolean;
  orbLabels: boolean;
}

const CORES_ASPECTOS: Record<string, string> = {
  'conjunção': '#FFD700',
  'sextil': '#00CED1',
  'quadratura': '#FF4500',
  'trino': '#32CD32',
  'oposição': '#FF1493',
};

const LABELS_ASPECTOS: Record<string, string> = {
  'conjunção': '☌',
  'sextil': '✶',
  'quadratura': '□',
  'trino': '△',
  'oposição': '☍',
};

export function SynastryOverlay({
  chart1,
  chart2,
  aspects,
  name1 = 'Pessoa 1',
  name2 = 'Pessoa 2',
  size = 700,
}: SynastryOverlayProps) {
  const [layers, setLayers] = useState<LayerState>({
    signs: true,
    planets: true,
    houses: true,
    aspects: true,
    degrees: false,
    orbLabels: true,
  });
  const [opacity, setOpacity] = useState(0.6);
  const [showLegend, setShowLegend] = useState(true);

  const toggleLayer = (layer: keyof LayerState) => {
    setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const aspectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    aspects.forEach(aspect => {
      const key = aspect.type;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [aspects]);

  return (
    <div className="relative w-full">
      {/* Layer Controls */}
      <div className="flex flex-wrap gap-2 mb-4 p-3 bg-card/80 backdrop-blur-sm rounded-lg border">
        <button
          onClick={() => toggleLayer('signs')}
          className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
            layers.signs 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground'
          }`}
        >
          ♈ Signos
        </button>
        <button
          onClick={() => toggleLayer('planets')}
          className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
            layers.planets 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground'
          }`}
        >
          ☉ Planetas
        </button>
        <button
          onClick={() => toggleLayer('houses')}
          className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
            layers.houses 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground'
          }`}
        >
          ⌂ Casas
        </button>
        <button
          onClick={() => toggleLayer('aspects')}
          className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
            layers.aspects 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground'
          }`}
        >
          ✧ Aspectos
        </button>
        <button
          onClick={() => toggleLayer('degrees')}
          className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
            layers.degrees 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground'
          }`}
        >
          ° Graus
        </button>
        <button
          onClick={() => toggleLayer('orbLabels')}
          className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
            layers.orbLabels 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground'
          }`}
        >
          ◐ Órbis
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-muted-foreground">Opacidade</span>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            className="w-20 h-1"
          />
          <span className="text-xs text-muted-foreground w-8">{opacity}</span>
        </div>

        <button
          onClick={() => setShowLegend(!showLegend)}
          className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
            showLegend 
              ? 'bg-secondary text-secondary-foreground' 
              : 'bg-muted text-muted-foreground'
          }`}
        >
          ℹ Legenda
        </button>
      </div>

      {/* Combined Chart View */}
      <div 
        className="relative mx-auto rounded-full overflow-hidden border-2 border-border"
        style={{ 
          width: size, 
          height: size,
          boxShadow: '0 0 60px rgba(147, 51, 234, 0.2)'
        }}
      >
        <SynastryChart
          chart1={chart1}
          chart2={chart2}
          size={size}
          name1={name1}
          name2={name2}
        />

        {/* Layer overlays */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ opacity }}
        >
          {/* Aspect lines overlay */}
          {layers.aspects && (
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {aspects
                .filter(a => CORES_ASPECTOS[a.type])
                .map((aspect, idx) => {
                  const planet1Pos = chart1.planetas.find(p => p.planeta === aspect.planet1);
                  const planet2Pos = chart2.planetas.find(p => p.planeta === aspect.planet2);
                  
                  if (!planet1Pos || !planet2Pos) return null;
                  
                  const center = size / 2;
                  const radius1 = size * 0.42;
                  const radius2 = size * 0.38;
                  
                  const angle1 = ((planet1Pos.longe - 90 + 360) % 360) * (Math.PI / 180);
                  const angle2 = ((planet2Pos.longe - 90 + 360) % 360) * (Math.PI / 180);
                  
                  const x1 = center + radius1 * Math.cos(angle1);
                  const y1 = center + radius1 * Math.sin(angle1);
                  const x2 = center + radius2 * Math.cos(angle2);
                  const y2 = center + radius2 * Math.sin(angle2);
                  
                  const color = CORES_ASPECTOS[aspect.type] || '#888';
                  const isApp = aspect.strength > 0.8;
                  
                  return (
                    <g key={`aspect-${idx}`} filter="url(#glow)">
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={color}
                        strokeWidth={isApp ? 2.5 : 1.5}
                        strokeDasharray={isApp ? 'none' : '4,4'}
                        opacity={0.7}
                      />
                      {layers.orbLabels && (
                        <circle
                          cx={(x1 + x2) / 2}
                          cy={(y1 + y2) / 2}
                          r={8}
                          fill={color}
                          opacity={0.9}
                        />
                      )}
                    </g>
                  );
                })}
            </svg>
          )}
        </div>
      </div>

      {/* Legend Panel */}
      {showLegend && (
        <div className="mt-4 p-4 bg-card/90 rounded-lg border">
          <h3 className="text-sm font-semibold mb-3">Aspectos Sinastrais</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {Object.entries(CORES_ASPECTOS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs">{LABELS_ASPECTOS[type]}</span>
                <span className="text-xs text-muted-foreground">
                  {aspectCounts[type] || 0}
                </span>
              </div>
            ))}
          </div>

          {/* Aspect details */}
          <div className="mt-3 pt-3 border-t">
            <h4 className="text-xs font-medium mb-2">Detalhes dos Aspectos</h4>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {aspects.map((aspect, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-2 text-xs py-1 px-2 rounded hover:bg-muted"
                >
                  <span 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: CORES_ASPECTOS[aspect.type] }}
                  />
                  <span className="font-medium">{aspect.planet1}</span>
                  <span className="text-muted-foreground">{LABELS_ASPECTOS[aspect.type]}</span>
                  <span className="font-medium">{aspect.planet2}</span>
                  {layers.orbLabels && (
                    <span className="ml-auto text-muted-foreground">
                      Orb: {aspect.orb.toFixed(1)}°
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div className="mt-4 flex gap-4 text-xs">
        <div className="px-3 py-2 rounded-lg bg-muted">
          <span className="text-muted-foreground">Total: </span>
          <span className="font-semibold">{aspects.length}</span>
        </div>
        <div className="px-3 py-2 rounded-lg bg-muted">
          <span className="text-muted-foreground">Major: </span>
          <span className="font-semibold">
            {aspects.filter(a => ['conjunção', 'oposição', 'trino', 'quadratura'].includes(a.type)).length}
          </span>
        </div>
        <div className="px-3 py-2 rounded-lg bg-muted">
          <span className="text-muted-foreground">Minor: </span>
          <span className="font-semibold">
            {aspects.filter(a => ['sextil'].includes(a.type)).length}
          </span>
        </div>
      </div>
    </div>
  );
}

export default SynastryOverlay;