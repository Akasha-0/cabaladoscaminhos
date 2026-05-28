'use client';

import { useState, memo, useCallback, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface SacredGeometryProps {
  type: 'flower-of-life' | 'metatron-cube' | 'sri-yantra';
  rotation: number;
  scale: number;
  colorScheme: string;
}

const FlowerOfLifeSVG = memo(function FlowerOfLifeSVG({ 
  rotation, 
  scale, 
  colorScheme 
}: Omit<SacredGeometryProps, 'type'>) {
  const colors = {
    violet: { stroke: '#9333EA', fill: 'rgba(147, 51, 234, 0.1)' },
    gold: { stroke: '#EAB308', fill: 'rgba(234, 179, 8, 0.1)' },
    cyan: { stroke: '#06B6D4', fill: 'rgba(6, 182, 212, 0.1)' },
  };
  const c = colors[colorScheme as keyof typeof colors] || colors.violet;
  const r = 30;
  
  return (
    <g transform={`rotate(${rotation} 150 150) scale(${scale})`}>
      {Array.from({ length: 7 }).map((_, row) =>
        Array.from({ length: 7 }).map((_, col) => {
          const cx = 150 + (col - 3) * r * 1.732;
          const cy = 150 + (row - 3) * r * 1.5;
          const distFromCenter = Math.sqrt((col - 3) ** 2 + (row - 3) ** 2);
          if (distFromCenter > 3) return null;
          return (
            <circle
              key={`${row}-${col}`}
              cx={cx}
              cy={cy}
              r={r}
              stroke={c.stroke}
              strokeWidth="2"
              fill={c.fill}
            />
          );
        })
      )}
    </g>
  );
});

const MetatronCubeSVG = memo(function MetatronCubeSVG({ 
  rotation, 
  scale, 
  colorScheme 
}: Omit<SacredGeometryProps, 'type'>) {
  const colors = {
    violet: ['#9333EA', '#7C3AED', '#A855F7', '#8B5CF6', '#C084FC', '#D8B4FE'],
    gold: ['#EAB308', '#CA8A04', '#FACC15', '#FDE047', '#FDE047', '#FEF08A'],
    cyan: ['#06B6D4', '#0891B2', '#22D3EE', '#67E8F9', '#A5F3FC', '#CFFAFE'],
  };
  const palette = colors[colorScheme as keyof typeof colors] || colors.violet;
  
  const points = [
    { x: 150, y: 50 },
    { x: 250, y: 50 },
    { x: 350, y: 50 },
    { x: 100, y: 150 },
    { x: 200, y: 150 },
    { x: 300, y: 150 },
    { x: 400, y: 150 },
    { x: 150, y: 250 },
    { x: 250, y: 250 },
    { x: 350, y: 250 },
    { x: 200, y: 350 },
    { x: 300, y: 350 },
  ];

  const lines = [
    [0, 1], [1, 2], [0, 4], [1, 3], [1, 5], [2, 6], [3, 4], [4, 5], [5, 6],
    [3, 7], [4, 7], [4, 8], [4, 10], [5, 8], [5, 9], [5, 11], [6, 9],
    [7, 10], [8, 10], [9, 11], [10, 11],
  ];

  return (
    <g transform={`rotate(${rotation} 250 200) scale(${scale})`}>
      {lines.map(([a, b], i) => (
        <line
          key={i}
          x1={points[a].x}
          y1={points[a].y}
          x2={points[b].x}
          y2={points[b].y}
          stroke={palette[i % palette.length]}
          strokeWidth="2"
          opacity="0.8"
        />
      ))}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={8}
          fill={palette[i % palette.length]}
          stroke="#fff"
          strokeWidth="2"
        />
      ))}
    </g>
  );
});

const SriYantraSVG = memo(function SriYantraSVG({ 
  rotation, 
  scale, 
  colorScheme 
}: Omit<SacredGeometryProps, 'type'>) {
  const colors = {
    violet: { stroke: '#9333EA', fill: 'rgba(147, 51, 234, 0.15)', accent: '#C084FC' },
    gold: { stroke: '#EAB308', fill: 'rgba(234, 179, 8, 0.15)', accent: '#FDE047' },
    cyan: { stroke: '#06B6D4', fill: 'rgba(6, 182, 212, 0.15)', accent: '#67E8F9' },
  };
  const c = colors[colorScheme as keyof typeof colors] || colors.violet;
  
  const triangles: [number, number, number, number, number, number][] = [
    [200, 60, 100, 260, 300, 260],
    [200, 60, 300, 260, 100, 260],
    [200, 100, 80, 220, 320, 220],
    [200, 100, 320, 220, 80, 220],
    [200, 140, 120, 220, 280, 220],
    [200, 140, 280, 220, 120, 220],
    [200, 180, 160, 220, 240, 220],
    [200, 180, 240, 220, 160, 220],
  ];
  
  const binduY = 60;

  return (
    <g transform={`rotate(${rotation} 200 220) scale(${scale})`}>
      <circle cx={200} cy={binduY} r={8} fill={c.accent} />
      {triangles.map((t, i) => (
        <polygon
          key={i}
          points={t.map((v, idx) => idx % 2 === 0 ? v : v).join(',')}
          stroke={i < 4 ? c.stroke : c.accent}
          strokeWidth="2"
          fill={c.fill}
          opacity={i < 4 ? 0.6 : 0.4}
        />
      ))}
      <circle cx={200} cy={220} r={150} stroke={c.stroke} strokeWidth="3" fill="none" opacity="0.3" />
      <circle cx={200} cy={220} r={140} stroke={c.stroke} strokeWidth="2" fill="none" opacity="0.2" />
    </g>
  );
});

const COLOR_SCHEMES = [
  { id: 'violet', name: 'Violeta Sagrada', description: 'Conexão espiritual e intuição', color: '#9333EA' },
  { id: 'gold', name: 'Ouro Divino', description: 'Prosperidade e energia solar', color: '#EAB308' },
  { id: 'cyan', name: 'Cyan Cristal', description: 'Comunicação e clareza', color: '#06B6D4' },
];

const GEOMETRY_TYPES = [
  { 
    id: 'flower-of-life' as const, 
    name: 'Flor da Vida', 
    description: 'Padrão fundamental da criação, contém todos os sólidos platônicos',
    meaning: 'Proteção, harmonia, criação infinita'
  },
  { 
    id: 'metatron-cube' as const, 
    name: 'Cubo de Metatron', 
    description: 'Contém os 5 elementos da geometria sagrada platônica',
    meaning: 'Canalização, proteção contra energias negativas'
  },
  { 
    id: 'sri-yantra' as const, 
    name: 'Sri Yantra', 
    description: 'Diagrama sagrado do hinduísmo para meditação e expansão da consciência',
    meaning: 'Abundância, meditação profunda, elevação espiritual'
  },
];

interface GeometryViewerProps {
  type: SacredGeometryProps['type'];
}

const GeometryViewer = memo(function GeometryViewer({ type }: GeometryViewerProps) {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [colorScheme, setColorScheme] = useState('violet');
  const [isAutoRotate, setIsAutoRotate] = useState(false);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (isAutoRotate) {
      const animate = () => {
        setRotation(prev => (prev + 0.5) % 360);
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isAutoRotate]);

  const handleScaleChange = useCallback((value: number | readonly number[]) => {
    setScale(Array.isArray(value) ? value[0] : value);
  }, []);

  return (
    <Card className="p-4 space-y-4">
      <div className="relative aspect-square bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {type === 'flower-of-life' && (
            <FlowerOfLifeSVG rotation={rotation} scale={scale} colorScheme={colorScheme} />
          )}
          {type === 'metatron-cube' && (
            <MetatronCubeSVG rotation={rotation} scale={scale} colorScheme={colorScheme} />
          )}
          {type === 'sri-yantra' && (
            <SriYantraSVG rotation={rotation} scale={scale} colorScheme={colorScheme} />
          )}
        </svg>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Rotação: {Math.round(rotation)}°</Label>
          <Button
            variant={isAutoRotate ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsAutoRotate(!isAutoRotate)}
          >
            {isAutoRotate ? 'Parar' : 'Auto'}
          </Button>
        </div>
        <Slider
          value={[rotation]}
          min={0}
          max={360}
          step={1}
          onValueChange={(v) => setRotation(Array.isArray(v) ? v[0] : v)}
          className="w-full"
        />
      </div>

      <div className="space-y-3">
        <Label>Zoom: {(scale * 100).toFixed(0)}%</Label>
        <Slider
          value={[scale]}
          min={0.5}
          max={2}
          step={0.1}
          onValueChange={handleScaleChange}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label>Esquema de Cores</Label>
        <div className="grid grid-cols-3 gap-2">
          {COLOR_SCHEMES.map((scheme) => (
            <button
              key={scheme.id}
              onClick={() => setColorScheme(scheme.id)}
              className={`p-2 rounded-lg border-2 transition-all ${
                colorScheme === scheme.id 
                  ? 'border-current bg-slate-800' 
                  : 'border-slate-700 bg-slate-900/50 hover:border-slate-500'
              }`}
              style={{ borderColor: colorScheme === scheme.id ? scheme.color : undefined }}
            >
              <div 
                className="w-full h-8 rounded mb-1" 
                style={{ backgroundColor: scheme.color }}
              />
              <span className="text-xs text-slate-300 block truncate">{scheme.name}</span>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
});

export function GeometriaSagrada() {
  const [selectedType, setSelectedType] = useState<SacredGeometryProps['type']>('flower-of-life');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Geometria Sagrada
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Explore os padrões universais da criação
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {GEOMETRY_TYPES.map((geo) => (
          <Card
            key={geo.id}
            className={`p-4 cursor-pointer transition-all hover:ring-2 hover:ring-purple-500/50 ${
              selectedType === geo.id ? 'ring-2 ring-purple-500 bg-slate-800/50' : 'bg-slate-900/50'
            }`}
            onClick={() => setSelectedType(geo.id)}
          >
            <h3 className="font-semibold text-slate-100 mb-1">{geo.name}</h3>
            <p className="text-sm text-slate-400 mb-2">{geo.description}</p>
            <p className="text-xs text-purple-400 italic">{geo.meaning}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GeometryViewer type={selectedType} />
        
        <Card className="p-6 bg-slate-900/50">
          <h3 className="font-semibold text-slate-100 mb-4">
            Significado Espiritual
          </h3>
          {GEOMETRY_TYPES.filter(g => g.id === selectedType).map((geo) => (
            <div key={geo.id} className="space-y-4">
              <div>
                <h4 className="text-purple-400 font-medium mb-2">Sobre o {geo.name}</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {geo.description}. {geo.meaning}.
                </p>
              </div>
              
              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-cyan-400 font-medium mb-2">Uso na Meditação</h4>
                <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
                  <li>Visualize a forma com respiração profunda</li>
                  <li>Permita que as cores transmitam energia</li>
                  <li>Conecte-se com a geometria do universo</li>
                </ul>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-amber-400 font-medium mb-2">Cores e Chakras</h4>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_SCHEMES.map((c) => (
                    <span 
                      key={c.id}
                      className="px-2 py-1 rounded text-xs text-slate-200"
                      style={{ backgroundColor: `${c.color}33` }}
                    >
                      {c.name}: {c.description}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}