'use client';

import { useState, useMemo } from 'react';
import { chakras } from '@/lib/data/spiritual-data';
import { calculateLifePath, calculateExpression, calculateSoulUrge, calculatePersonality } from '@/lib/numerologia';
import {
  Zap,
  Droplets,
  Flame,
  Heart,
  Wind,
  Eye,
  Crown,
  Activity,
  Sparkles,
  Layers,
  GitCompare,
  TrendingUp,
  Settings2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface CombinationChartsProps {
  nome?: string;
  dataNascimento?: string;
  className?: string;
}

interface ChakraNumerologyLink {
  chakraIndex: number;
  chakraName: string;
  associatedNumber: number;
  relatedNumerology: string[];
  balanceScore: number;
  color: string;
}

interface ChartOverlay {
  id: string;
  name: string;
  enabled: boolean;
  opacity: number;
}

type ViewMode = 'combined' | 'split' | 'radial';

const NUMERO_CORES: Record<number, { primaria: string; secundaria: string; gradiente: string }> = {
  1: { primaria: '#E74C3C', secundaria: '#C0392B', gradiente: 'from-red-500 to-red-700' },
  2: { primaria: '#3498DB', secundaria: '#2980B9', gradiente: 'from-blue-500 to-blue-700' },
  3: { primaria: '#F39C12', secundaria: '#D68910', gradiente: 'from-yellow-500 to-yellow-700' },
  4: { primaria: '#27AE60', secundaria: '#1E8449', gradiente: 'from-green-500 to-green-700' },
  5: { primaria: '#9B59B6', secundaria: '#8E44AD', gradiente: 'from-purple-500 to-purple-700' },
  6: { primaria: '#E91E63', secundaria: '#C2185B', gradiente: 'from-pink-500 to-pink-700' },
  7: { primaria: '#00BCD4', secundaria: '#0097A7', gradiente: 'from-cyan-500 to-cyan-700' },
  8: { primaria: '#607D8B', secundaria: '#455A64', gradiente: 'from-gray-500 to-gray-700' },
  9: { primaria: '#FF5722', secundaria: '#E64A19', gradiente: 'from-orange-500 to-orange-700' },
  11: { primaria: '#7C4DFF', secundaria: '#651FFF', gradiente: 'from-violet-500 to-violet-700' },
  22: { primaria: '#00E676', secundaria: '#00C853', gradiente: 'from-emerald-500 to-emerald-700' },
  33: { primaria: '#FFAB00', secundaria: '#FF8F00', gradiente: 'from-amber-500 to-amber-700' },
};

const CORES_CHAKRA: Record<number, { bg: string; border: string; text: string }> = {
  1: { bg: 'bg-red-500/20', border: 'border-red-500', text: 'text-red-400' },
  2: { bg: 'bg-orange-500/20', border: 'border-orange-500', text: 'text-orange-400' },
  3: { bg: 'bg-yellow-500/20', border: 'border-yellow-500', text: 'text-yellow-400' },
  4: { bg: 'bg-green-500/20', border: 'border-green-500', text: 'text-green-400' },
  5: { bg: 'bg-blue-500/20', border: 'border-blue-500', text: 'text-blue-400' },
  6: { bg: 'bg-indigo-500/20', border: 'border-indigo-500', text: 'text-indigo-400' },
  7: { bg: 'bg-purple-500/20', border: 'border-purple-500', text: 'text-purple-400' },
};

function generateChakraNumerologyLinks(
  nome: string,
  dataNascimento: string
): ChakraNumerologyLink[] {
  const links: ChakraNumerologyLink[] = [];

  try {
    const lifePath = calculateLifePath(dataNascimento);
    const expression = calculateExpression(nome);
    const soulUrge = calculateSoulUrge(nome);
    const personality = calculatePersonality(nome);

    const numerologyValues = [lifePath, expression, soulUrge, personality].filter(v => v > 0);

    chakras.forEach((chakra, index) => {
      const relatedNumbers = chakra.numeros || [];
      const matchingNumbers = numerologyValues.filter(n => relatedNumbers.includes(n));
      const balanceScore = matchingNumbers.length > 0
        ? Math.min(1, (matchingNumbers.length / numerologyValues.length) + 0.3)
        : Math.random() * 0.5 + 0.3;

      links.push({
        chakraIndex: index + 1,
        chakraName: chakra.nome,
        associatedNumber: relatedNumbers[0] || ((index + 1) * 2) % 9 || 9,
        relatedNumerology: matchingNumbers.length > 0
          ? matchingNumbers.map(n => {
              if (n === lifePath) return 'Caminho de Vida';
              if (n === expression) return 'Expressão';
              if (n === soulUrge) return 'Motivação';
              if (n === personality) return 'Personalidade';
              return `Número ${n}`;
            })
          : ['Energia Secundária'],
        balanceScore: Math.round(balanceScore * 100) / 100,
        color: chakra.cor,
      });
    });
  } catch {
    chakras.forEach((chakra, index) => {
      links.push({
        chakraIndex: index + 1,
        chakraName: chakra.nome,
        associatedNumber: ((index + 1) * 2) % 9 || 9,
        relatedNumerology: ['Energia Geral'],
        balanceScore: Math.round((Math.random() * 0.5 + 0.3) * 100) / 100,
        color: chakra.cor,
      });
    });
  }

  return links;
}

function RadialOverlay({ links, overlays }: { links: ChakraNumerologyLink[]; overlays: ChartOverlay[] }) {
  const enabledOverlays = overlays.filter(o => o.enabled);
  const radius = 180;
  const centerX = 200;
  const centerY = 200;

  return (
    <svg viewBox="0 0 400 400" className="w-full h-full">
      {links.map((link, index) => {
        const angle = (index / links.length) * 2 * Math.PI - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        const corChakra = CORES_CHAKRA[link.chakraIndex] || CORES_CHAKRA[1];
        const corNumero = NUMERO_CORES[link.associatedNumber] || NUMERO_CORES[1];

        const chakraOpacity = overlays.find(o => o.id === 'chakra')?.opacity ?? 1;
        const numerologyOpacity = overlays.find(o => o.id === 'numerology')?.opacity ?? 1;

        return (
          <g key={link.chakraIndex}>
            {enabledOverlays.some(o => o.id === 'chakra') && (
              <>
                <circle
                  cx={x}
                  cy={y}
                  r={40 * link.balanceScore}
                  fill={corChakra.bg}
                  stroke={corChakra.border.replace('border-', '')}
                  strokeWidth={2}
                  opacity={chakraOpacity}
                />
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  className={`fill-current ${corChakra.text}`}
                  fontSize={link.chakraIndex === 7 ? 10 : 12}
                  opacity={chakraOpacity}
                >
                  {link.chakraName.split(' ')[0]}
                </text>
              </>
            )}

            {enabledOverlays.some(o => o.id === 'numerology') && (
              <g opacity={numerologyOpacity}>
                <circle
                  cx={x}
                  cy={y}
                  r={25 * link.balanceScore}
                  fill={corNumero.primaria}
                  opacity={0.8}
                />
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  className="fill-white font-bold"
                  fontSize={14}
                >
                  {link.associatedNumber}
                </text>
              </g>
            )}

            {enabledOverlays.some(o => o.id === 'connection') && index > 0 && (
              <line
                x1={centerX + radius * Math.cos(angle - 2 * Math.PI / links.length)}
                y1={centerY + radius * Math.sin(angle - 2 * Math.PI / links.length)}
                x2={x}
                y2={y}
                stroke={corChakra.border.replace('border-', '#666')}
                strokeWidth={link.balanceScore * 2}
                opacity={0.3}
              />
            )}
          </g>
        );
      })}

      <circle cx={centerX} cy={centerY} r={15} fill="#1e293b" stroke="#6366f1" strokeWidth={2} />
      <text x={centerX} y={centerY + 4} textAnchor="middle" className="fill-indigo-400" fontSize={10}>
        ☉
      </text>
    </svg>
  );
}

function SplitView({ links }: { links: ChakraNumerologyLink[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-purple-400 flex items-center gap-2">
          <Crown className="w-4 h-4" /> Numerologia
        </h4>
        {links.map((link) => {
          const corNumero = NUMERO_CORES[link.associatedNumber] || NUMERO_CORES[1];
          return (
            <div
              key={`num-${link.chakraIndex}`}
              className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                style={{ backgroundColor: corNumero.primaria }}
              >
                {link.associatedNumber}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {link.relatedNumerology[0]}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {link.chakraName}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-green-400 flex items-center gap-2">
          <Activity className="w-4 h-4" /> Chakras
        </h4>
        {links.map((link) => {
          const corChakra = CORES_CHAKRA[link.chakraIndex] || CORES_CHAKRA[1];
          return (
            <div
              key={`chakra-${link.chakraIndex}`}
              className={`flex items-center gap-3 p-2 rounded-lg ${corChakra.bg} border ${corChakra.border}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${corChakra.text} font-medium`}
              >
                {link.chakraIndex}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">
                  {link.chakraName}
                </p>
                <div className="w-full bg-slate-700 rounded-full h-1.5 mt-1">
                  <div
                    className={`h-1.5 rounded-full ${corChakra.border.replace('border-', 'bg-')}`}
                    style={{ width: `${link.balanceScore * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CombinedBarView({ links }: { links: ChakraNumerologyLink[] }) {
  return (
    <div className="space-y-3">
      {links.map((link) => {
        const corChakra = CORES_CHAKRA[link.chakraIndex] || CORES_CHAKRA[1];
        const corNumero = NUMERO_CORES[link.associatedNumber] || NUMERO_CORES[1];

        return (
          <div key={link.chakraIndex} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">{link.chakraName}</span>
              <div className="flex items-center gap-2">
                <span className={`${corNumero.text || 'text-slate-400'}`}>
                  #{link.associatedNumber}
                </span>
                <span className="text-slate-500">
                  {Math.round(link.balanceScore * 100)}%
                </span>
              </div>
            </div>
            <div className="relative h-6 bg-slate-800 rounded-lg overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 ${corChakra.bg} ${corChakra.border} border`}
                style={{ width: `${link.balanceScore * 100}%` }}
              />
              <div
                className="absolute inset-y-0 left-1/2 opacity-60"
                style={{
                  width: 4,
                  backgroundColor: corNumero.primaria,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OverlayControls({
  overlays,
  onToggle,
  onOpacityChange
}: {
  overlays: ChartOverlay[];
  onToggle: (id: string) => void;
  onOpacityChange: (id: string, value: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        <Settings2 className="w-4 h-4" />
        <span>Camadas</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <div className="space-y-2 pl-2">
          {overlays.map((overlay) => (
            <div key={overlay.id} className="space-y-1">
              <label className="flex items-center gap-2 text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={overlay.enabled}
                  onChange={() => onToggle(overlay.id)}
                  className="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
                />
                {overlay.name}
              </label>
              {overlay.enabled && (
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={overlay.opacity}
                  onChange={(e) => onOpacityChange(overlay.id, parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CombinationCharts({
  nome = 'Usuário',
  dataNascimento = '1990-01-15',
  className = '',
}: CombinationChartsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('combined');
  const [overlays, setOverlays] = useState<ChartOverlay[]>([
    { id: 'chakra', name: 'Chakras', enabled: true, opacity: 1 },
    { id: 'numerology', name: 'Numerologia', enabled: true, opacity: 1 },
    { id: 'connection', name: 'Conexões', enabled: true, opacity: 0.5 },
  ]);
  const [showInfo, setShowInfo] = useState(false);

  const links = useMemo(() =>
    generateChakraNumerologyLinks(nome, dataNascimento),
    [nome, dataNascimento]
  );

  const toggleOverlay = (id: string) => {
    setOverlays(prev =>
      prev.map(o => o.id === id ? { ...o, enabled: !o.enabled } : o)
    );
  };

  const changeOpacity = (id: string, value: number) => {
    setOverlays(prev =>
      prev.map(o => o.id === id ? { ...o, opacity: value } : o)
    );
  };

  const enabledCount = overlays.filter(o => o.enabled).length;

  return (
    <div className={`bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-slate-100">Combinação Numerologia + Chakras</h3>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </div>

      {showInfo && (
        <div className="mb-4 p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
          <p className="text-xs text-indigo-300">
            Explore a conexão entre seus números numerológicos e a energia dos chakras.
            Ative ou desative camadas para comparar diferentes aspectos.
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setViewMode('combined')}
          className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
            viewMode === 'combined'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
        >
          <TrendingUp className="w-3 h-3 inline mr-1" />
          Barras
        </button>
        <button
          onClick={() => setViewMode('split')}
          className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
            viewMode === 'split'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
        >
          <GitCompare className="w-3 h-3 inline mr-1" />
          Split
        </button>
        <button
          onClick={() => setViewMode('radial')}
          className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
            viewMode === 'radial'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
        >
          <Activity className="w-3 h-3 inline mr-1" />
          Radial
        </button>

        <div className="ml-auto">
          <OverlayControls
            overlays={overlays}
            onToggle={toggleOverlay}
            onOpacityChange={changeOpacity}
          />
        </div>
      </div>

      <div className="h-80">
        {viewMode === 'radial' ? (
          <RadialOverlay links={links} overlays={overlays} />
        ) : viewMode === 'split' ? (
          <SplitView links={links} />
        ) : (
          <CombinedBarView links={links} />
        )}
      </div>

      {enabledCount > 1 && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-500">
            {enabledCount} camadas ativas — arraste os controles para ajustar opacidade
          </p>
        </div>
      )}
    </div>
  );
}

export default CombinationCharts;