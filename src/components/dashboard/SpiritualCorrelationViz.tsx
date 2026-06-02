// fallow-ignore-file unused-file
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Star,
  Moon,
  Sun,
  Globe,
  Compass,
  Zap,
  Circle,
  GitBranch,
  Hexagon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Sacred geometry corner decoration SVG
const SacredCornerSVG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2 L20 2 L20 5 L5 5 L5 20 L2 20 Z" fill="currentColor" opacity="0.3" />
    <path d="M2 2 Q20 2 20 20" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.5" />
    <circle cx="2" cy="2" r="1.5" fill="currentColor" opacity="0.4" />
    <circle cx="20" cy="2" r="1" fill="currentColor" opacity="0.3" />
    <circle cx="2" cy="20" r="1" fill="currentColor" opacity="0.3" />
  </svg>
);

// Loading skeleton component
function CorrelationSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center h-80 gap-4">
      <div className="relative w-48 h-48">
        <div className="absolute inset-0 rounded-full border border-violet-500/20 animate-pulse" />
        <div className="absolute inset-4 rounded-full border border-amber-500/20 animate-pulse" style={{ animationDelay: '150ms' }} />
        <div className="absolute inset-8 rounded-full border border-purple-500/20 animate-pulse" style={{ animationDelay: '300ms' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500/30 to-violet-500/30 animate-pulse" />
        </div>
      </div>
      <div className="space-y-2 w-full px-4">
        <div className="h-3 rounded skeleton-spiritual w-3/4 mx-auto" />
        <div className="h-3 rounded skeleton-spiritual w-1/2 mx-auto" />
      </div>
    </div>
  );
}

export interface SpiritualCorrelationVizProps {
  className?: string;
  loading?: boolean;
}

type SpiritualSystem = 'numerologia' | 'astrologia' | 'ifa' | 'candomble' | 'tarot' | 'cabala';

interface CorrelationNode {
  id: string;
  system: SpiritualSystem;
  label: string;
  value: number;
  x: number;
  y: number;
}

interface CorrelationLink {
  source: string;
  target: string;
  strength: number;
}

interface PlanetAlignment {
  planet: string;
  sign: string;
  house: number;
  aspect: string;
  relatedSystems: SpiritualSystem[];
}

interface SephirotConnection {
  name: string;
  hebrew: string;
  path: number;
  connections: string[];
  alignment: number;
}

const SYSTEM_COLORS: Record<SpiritualSystem, { primary: string; gradient: string; glow: string; border: string }> = {
  numerologia: { primary: 'text-amber-400', gradient: 'from-amber-500/20 to-orange-500/20', glow: 'shadow-amber-500/30', border: 'border-amber-500/30' },
  astrologia: { primary: 'text-purple-400', gradient: 'from-purple-500/20 to-violet-500/20', glow: 'shadow-purple-500/30', border: 'border-purple-500/30' },
  ifa: { primary: 'text-emerald-400', gradient: 'from-emerald-500/20 to-green-500/20', glow: 'shadow-emerald-500/30', border: 'border-emerald-500/30' },
  candomble: { primary: 'text-rose-400', gradient: 'from-rose-500/20 to-pink-500/20', glow: 'shadow-rose-500/30', border: 'border-rose-500/30' },
  tarot: { primary: 'text-indigo-400', gradient: 'from-indigo-500/20 to-blue-500/20', glow: 'shadow-indigo-500/30', border: 'border-indigo-500/30' },
  cabala: { primary: 'text-yellow-400', gradient: 'from-yellow-500/20 to-amber-500/20', glow: 'shadow-yellow-500/30', border: 'border-yellow-500/30' },
};

const SYSTEM_ICONS: Record<SpiritualSystem, React.ReactNode> = {
  numerologia: <Hash className="w-5 h-5" />,
  astrologia: <Star className="w-5 h-5" />,
  ifa: <Compass className="w-5 h-5" />,
  candomble: <Sun className="w-5 h-5" />,
  tarot: <Moon className="w-5 h-5" />,
  cabala: <Hexagon className="w-5 h-5" />,
};

const SYSTEM_LABELS: Record<SpiritualSystem, string> = {
  numerologia: 'Numerologia',
  astrologia: 'Astrologia',
  ifa: 'Ifá/Odu',
  candomble: 'Candomblé',
  tarot: 'Tarot',
  cabala: 'Cabala',
};

const PLANETS = ['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno'];
const SIGNS = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];
const SEPHIROT = [
  { name: 'Keter', hebrew: 'כתר', path: 0, connections: ['Chokhmah', 'Binah'] },
  { name: 'Chokhmah', hebrew: 'חכמה', path: 1, connections: ['Keter', 'Chesed'] },
  { name: 'Binah', hebrew: 'בינה', path: 2, connections: ['Keter', 'Gevurah'] },
  { name: 'Chesed', hebrew: 'חסד', path: 3, connections: ['Chokhmah', 'Gevurah', 'Tiferet'] },
  { name: 'Gevurah', hebrew: 'גבורה', path: 4, connections: ['Binah', 'Chesed', 'Tiferet'] },
  { name: 'Tiferet', hebrew: 'תפארת', path: 5, connections: ['Chesed', 'Gevurah', 'Netzach', 'Hod', 'Yesod'] },
  { name: 'Netzach', hebrew: 'נצח', path: 6, connections: ['Tiferet', 'Hod'] },
  { name: 'Hod', hebrew: 'הוד', path: 7, connections: ['Tiferet', 'Netzach'] },
  { name: 'Yesod', hebrew: 'יסוד', path: 8, connections: ['Tiferet', 'Netzach', 'Hod', 'Malkuth'] },
  { name: 'Malkuth', hebrew: 'מלכות', path: 9, connections: ['Yesod'] },
];

// Import Hash from lucide-react
import { Hash } from 'lucide-react';

function generateCorrelationNodes(): CorrelationNode[] {
  const systems: SpiritualSystem[] = ['numerologia', 'astrologia', 'ifa', 'candomble', 'tarot', 'cabala'];
  const centerX = 50;
  const centerY = 50;
  const radius = 35;

  return systems.map((system, index) => {
    const angle = (index * 60 - 90) * (Math.PI / 180);
    return {
      id: system,
      system,
      label: SYSTEM_LABELS[system],
      value: ((system.length * 17 + index * 31) % 40) + 60,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });
}

function generateCorrelationLinks(nodes: CorrelationNode[]): CorrelationLink[] {
  const links: CorrelationLink[] = [];
  const systems = nodes.map(n => n.system);

  for (let i = 0; i < systems.length; i++) {
    for (let j = i + 1; j < systems.length; j++) {
      if (Math.random() > 0.4) {
        links.push({
          source: systems[i],
          target: systems[j],
          strength: Math.random() * 0.5 + 0.5,
        });
      }
    }
  }
  return links;
}

function generatePlanetAlignments(): PlanetAlignment[] {
  return PLANETS.map(planet => ({
    planet,
    sign: SIGNS[Math.floor(Math.random() * SIGNS.length)],
    house: Math.floor(Math.random() * 12) + 1,
    aspect: ['Conjunção', 'Trino', 'Quadratura', 'Oposição'][Math.floor(Math.random() * 4)],
    relatedSystems: (['numerologia', 'astrologia', 'cabala'] as SpiritualSystem[]).filter(() => Math.random() > 0.5),
  }));
}

// fallow-ignore-next-line complexity
export function SpiritualCorrelationViz({ className = '', loading = false }: SpiritualCorrelationVizProps) {
  const [activeTab, setActiveTab] = useState<'radial' | 'planets' | 'sephirot'>('radial');
  const [selectedNode, setSelectedNode] = useState<SpiritualSystem | null>(null);

  const nodes = useMemo(() => generateCorrelationNodes(), []);
  const links = useMemo(() => generateCorrelationLinks(nodes), [nodes]);
  const planetAlignments = useMemo(() => generatePlanetAlignments(), []);

  const sephirotConnections: SephirotConnection[] = useMemo(() => {
    return SEPHIROT.map((s, i) => ({
      ...s,
      alignment: ((s.name.length * 17 + i * 31) % 40) + 60,
    }));
  }, []);

  const selectedNodeData = selectedNode ? nodes.find(n => n.system === selectedNode) : null;

  if (loading) {
    return (
      <Card className={cn('card-spiritual overflow-hidden', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Correlações Espirituais
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <CorrelationSkeleton />
          <SacredCornerSVG className="sacred-corner sacred-corner-tl text-amber-500" />
          <SacredCornerSVG className="sacred-corner sacred-corner-tr text-violet-500" />
          <SacredCornerSVG className="sacred-corner sacred-corner-bl text-purple-500" />
          <SacredCornerSVG className="sacred-corner sacred-corner-br text-amber-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('card-spiritual overflow-hidden', className)}>
      {/* Sacred corner decorations */}
      <SacredCornerSVG className="sacred-corner sacred-corner-tl text-amber-500 hidden md:block" />
      <SacredCornerSVG className="sacred-corner sacred-corner-tr text-violet-500 hidden md:block" />
      <SacredCornerSVG className="sacred-corner sacred-corner-bl text-purple-500 hidden md:block" />
      <SacredCornerSVG className="sacred-corner sacred-corner-br text-amber-500 hidden md:block" />
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Correlações Espirituais
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant={activeTab === 'radial' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('radial')}
              className={cn(
                'h-8 text-xs transition-all',
                activeTab === 'radial' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              Radial
            </Button>
            <Button
              variant={activeTab === 'planets' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('planets')}
              className={cn(
                'h-8 text-xs transition-all',
                activeTab === 'planets' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              Planetas
            </Button>
            <Button
              variant={activeTab === 'sephirot' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('sephirot')}
              className={cn(
                'h-8 text-xs transition-all',
                activeTab === 'sephirot' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              Sephirot
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 relative z-10">
        {activeTab === 'radial' && (
          <div className="relative">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl p-4 h-80 flex items-center justify-center relative overflow-hidden">
              {/* Sacred geometry decorative rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 rounded-full border border-violet-500/10" />
                <div className="absolute w-48 h-48 rounded-full border border-amber-500/10" />
                <div className="absolute w-32 h-32 rounded-full border border-purple-500/10" />
              </div>
              {/* SVG Radial Diagram */}
              <svg className="w-full h-full relative z-10" viewBox="0 0 100 100">
                {/* Gradient definitions */}
                <defs>
                  <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#4338ca" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#4338ca" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="linkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.6" />
                  </linearGradient>
                </defs>

                {/* Center glow */}
                <circle cx="50" cy="50" r="20" fill="url(#centerGlow)" />

                {/* Connection lines */}
                {links.map((link, i) => {
                  const source = nodes.find(n => n.id === link.source);
                  const target = nodes.find(n => n.id === link.target);
                  if (!source || !target) return null;
                  return (
                    <line
                      key={i}
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke="url(#linkGradient)"
                      strokeWidth={link.strength * 3}
                      strokeOpacity="0.5"
                      className="animate-pulse"
                    />
                  );
                })}

                {/* Connection rings */}
                <circle cx="50" cy="50" r="35" fill="none" stroke="#4338ca" strokeWidth="0.3" strokeDasharray="2 2" opacity="0.3" />
                <circle cx="50" cy="50" r="25" fill="none" stroke="#7c3aed" strokeWidth="0.2" strokeDasharray="1 3" opacity="0.3" />

                {/* Nodes */}
                {nodes.map((node) => {
                  const colors = SYSTEM_COLORS[node.system];
                  const isSelected = selectedNode === node.system;
                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      className="cursor-pointer"
                      onClick={() => setSelectedNode(selectedNode === node.system ? null : node.system)}
                    >
                      {/* Glow effect */}
                      <circle
                        r={isSelected ? 8 : 6}
                        fill={colors.primary.replace('text-', '').replace('-400', '-500')}
                        opacity="0.3"
                        className="animate-pulse"
                      />
                      {/* Main circle */}
                      <circle
                        r={isSelected ? 6 : 4.5}
                        fill={`url(#${node.system}Gradient)`}
                        stroke={colors.primary.replace('text-', 'bg-')}
                        strokeWidth="0.5"
                        className="transition-all duration-300"
                      />
                      {/* Label */}
                      <text
                        y={8}
                        textAnchor="middle"
                        className={`fill-current ${colors.primary} text-[2.5px] font-medium`}
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}

                {/* Center icon */}
                <circle cx="50" cy="50" r="3" fill="#4338ca" opacity="0.8" />
                <circle cx="50" cy="50" r="1.5" fill="#f59e0b" />
              </svg>
            </div>

            {/* Selected node details */}
            {selectedNodeData && (
              <div className={cn('absolute bottom-4 left-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 border', SYSTEM_COLORS[selectedNodeData.system].border)}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={SYSTEM_COLORS[selectedNodeData.system].primary}>
                    {SYSTEM_ICONS[selectedNodeData.system]}
                  </span>
                  <span className="font-semibold text-slate-200">{selectedNodeData.label}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-400">Energia:</span>
                    <span className="text-slate-200">{Math.round(selectedNodeData.value)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitBranch className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-400">Conexões:</span>
                    <span className="text-slate-200">{links.filter(l => l.source === selectedNodeData.system || l.target === selectedNodeData.system).length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'planets' && (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {planetAlignments.map((alignment, i) => (
              <div
                key={i}
                className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-lg p-3 border border-slate-700/50 hover:border-purple-500/30 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
                      <Star className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="font-medium text-slate-200">{alignment.planet}</span>
                  </div>
                  <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-300">
                    {alignment.aspect}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">Signo:</span>
                    <span className="text-slate-300">{alignment.sign}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">Casa:</span>
                    <span className="text-slate-300">{alignment.house}ª</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {alignment.relatedSystems.map((sys) => (
                    <Badge key={sys} variant="secondary" className={cn('text-xs', SYSTEM_COLORS[sys].primary)}>
                      {SYSTEM_LABELS[sys]}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'sephirot' && (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              {sephirotConnections.map((sephira) => (
                <div
                  key={sephira.name}
                  className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg p-3 border border-yellow-500/20 hover:border-yellow-500/40 transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400 font-serif text-lg">{sephira.hebrew}</span>
                      <span className="font-medium text-slate-200 text-sm">{sephira.name}</span>
                    </div>
                    <span className="text-xs text-slate-500">#{sephira.path}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2">
                    <div
                      className="bg-gradient-to-r from-yellow-500 to-amber-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${sephira.alignment}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {sephira.connections.map((conn) => (
                      <span key={conn} className="text-xs text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded">
                        {conn}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-700/50">
          {Object.entries(SYSTEM_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={cn('w-3 h-3 rounded-full bg-gradient-to-br', SYSTEM_COLORS[key as SpiritualSystem].gradient, 'border', SYSTEM_COLORS[key as SpiritualSystem].border)} />
              <span className="text-xs text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default SpiritualCorrelationViz;
