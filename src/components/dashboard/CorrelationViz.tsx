'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Network,
  Link2,
  Sparkles,
  Zap,
  Eye,
  ChevronDown,
  Circle,
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

export interface CorrelationVizProps {
  correlations?: CorrelationNode[];
  className?: string;
  onNodeClick?: (node: CorrelationNode) => void;
  activeNodeId?: string;
}

export interface CorrelationNode {
  id: string;
  name: string;
  system: string;
  strength: number;
  connections: string[];
  color: string;
}

export interface CorrelationEdge {
  source: string;
  target: string;
  strength: number;
}

// ============================================================
// CONSTANTS
// ============================================================

const SYSTEM_COLORS: Record<string, string> = {
  'Numerologia': 'text-blue-400',
  'Astrologia': 'text-purple-400',
  'Ifá/Odu': 'text-amber-400',
  'Candomblé': 'text-emerald-400',
  'Cabala': 'text-indigo-400',
  'Tarot': 'text-pink-400',
  'Chakras': 'text-cyan-400',
};

const DEFAULT_NODES: CorrelationNode[] = [
  {
    id: 'numerologia',
    name: 'Numerologia',
    system: 'Numerologia',
    strength: 0.9,
    connections: ['astrologia', 'cabala'],
    color: 'bg-blue-500',
  },
  {
    id: 'astrologia',
    name: 'Astrologia',
    system: 'Astrologia',
    strength: 0.85,
    connections: ['numerologia', 'ifa'],
    color: 'bg-purple-500',
  },
  {
    id: 'ifa',
    name: 'Ifá/Odu',
    system: 'Ifá/Odu',
    strength: 0.95,
    connections: ['astrologia', 'candomble'],
    color: 'bg-amber-500',
  },
  {
    id: 'candomble',
    name: 'Candomblé',
    system: 'Candomblé',
    strength: 0.88,
    connections: ['ifa', 'tarot'],
    color: 'bg-emerald-500',
  },
  {
    id: 'cabala',
    name: 'Cabala',
    system: 'Cabala',
    strength: 0.78,
    connections: ['numerologia', 'chakras'],
    color: 'bg-indigo-500',
  },
  {
    id: 'tarot',
    name: 'Tarot',
    system: 'Tarot',
    strength: 0.72,
    connections: ['candomble', 'chakras'],
    color: 'bg-pink-500',
  },
  {
    id: 'chakras',
    name: 'Chakras',
    system: 'Chakras',
    strength: 0.68,
    connections: ['cabala', 'tarot'],
    color: 'bg-cyan-500',
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function calculateNodePosition(index: number, total: number, centerX: number, centerY: number, radius: number) {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  };
}

function getLineWidth(strength: number): number {
  return Math.max(1, strength * 4);
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface NodeCardProps {
  node: CorrelationNode;
  isActive: boolean;
  onClick: () => void;
  position?: { x: number; y: number };
}

function NodeCard({ node, isActive, onClick, position }: NodeCardProps) {
  const colorClass = SYSTEM_COLORS[node.system] || 'text-slate-400';

  return (
    <button
      onClick={onClick}
      className={cn(
        'absolute p-3 rounded-xl bg-slate-800/80 backdrop-blur-sm border transition-all duration-300',
        isActive 
          ? 'border-purple-500/50 ring-2 ring-purple-500/30 scale-110' 
          : 'border-slate-700/50 hover:border-slate-600/50'
      )}
      style={position ? { left: position.x - 40, top: position.y - 25 } : {}}
    >
      <div className="flex items-center gap-2">
        <div className={cn('w-3 h-3 rounded-full', node.color)} />
        <div className="text-left">
          <p className={cn('text-sm font-semibold', colorClass)}>{node.name}</p>
          <p className="text-xs text-slate-500">{Math.round(node.strength * 100)}%</p>
        </div>
      </div>
    </button>
  );
}

interface ConnectionLineProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  strength: number;
}

function ConnectionLine({ from, to, strength }: ConnectionLineProps) {
  const width = getLineWidth(strength);
  const opacity = 0.3 + strength * 0.5;

  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke="currentColor"
      strokeWidth={width}
      strokeOpacity={opacity}
      className="text-purple-400"
    />
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function CorrelationViz({
  correlations = DEFAULT_NODES,
  className = '',
  onNodeClick,
  activeNodeId,
}: CorrelationVizProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const nodePositions = useMemo(() => {
    const centerX = 150;
    const centerY = 100;
    const radius = 80;
    
    return correlations.map((node, index) => ({
      id: node.id,
      ...calculateNodePosition(index, correlations.length, centerX, centerY, radius),
    }));
  }, [correlations]);

  const edges = useMemo(() => {
    const edgeList: { from: string; to: string; strength: number }[] = [];
    
    correlations.forEach(node => {
      node.connections.forEach(connectedId => {
        const connectedNode = correlations.find(n => n.id === connectedId);
        if (connectedNode) {
          // Avoid duplicates
          const exists = edgeList.some(
            e => (e.from === node.id && e.to === connectedId) ||
                 (e.from === connectedId && e.to === node.id)
          );
          if (!exists) {
            edgeList.push({
              from: node.id,
              to: connectedId,
              strength: (node.strength + connectedNode.strength) / 2,
            });
          }
        }
      });
    });
    
    return edgeList;
  }, [correlations]);

  const activeNode = correlations.find(n => n.id === activeNodeId);

  return (
    <div className={cn('bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden', className)}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg">
              <Network className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Visualização de Correlações</h3>
              <p className="text-slate-400 text-xs">
                {correlations.length} sistemas conectados
              </p>
            </div>
          </div>
          
          {activeNode && (
            <div className="flex items-center gap-2">
              <div className={cn('w-3 h-3 rounded-full', activeNode.color)} />
              <span className="text-sm text-slate-300">{activeNode.name}</span>
              <span className="text-xs text-slate-500">
                ({activeNode.connections.length} conexões)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Visualization */}
      <div className="p-4">
        <div className="relative bg-slate-900/50 rounded-lg overflow-hidden" style={{ height: 200 }}>
          {/* SVG for connections */}
          <svg className="absolute inset-0 w-full h-full">
            {edges.map((edge, index) => {
              const fromPos = nodePositions.find(n => n.id === edge.from);
              const toPos = nodePositions.find(n => n.id === edge.to);
              
              if (!fromPos || !toPos) return null;
              
              return (
                <ConnectionLine
                  key={index}
                  from={{ x: fromPos.x, y: fromPos.y }}
                  to={{ x: toPos.x, y: toPos.y }}
                  strength={edge.strength}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {nodePositions.map((pos, index) => {
            const node = correlations[index];
            return (
              <NodeCard
                key={node.id}
                node={node}
                isActive={activeNodeId === node.id || hoveredNode === node.id}
                onClick={() => {
                  setHoveredNode(node.id);
                  onNodeClick?.(node);
                }}
                position={pos}
              />
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
        <div className="flex flex-wrap gap-3">
          {Object.entries(SYSTEM_COLORS).slice(0, 4).map(([system, colorClass]) => (
            <div key={system} className="flex items-center gap-1">
              <Circle className={cn('w-2 h-2', colorClass)} />
              <span className="text-xs text-slate-400">{system}</span>
            </div>
          ))}
          <div className="flex items-center gap-1 ml-auto">
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="text-xs text-slate-500">Força das conexões</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      {activeNode && (
        <div className="p-4 border-t border-slate-700/50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-bold text-white">{activeNode.strength * 100}%</p>
              <p className="text-slate-500 text-xs">Força</p>
            </div>
            <div>
              <p className="text-xl font-bold text-purple-400">{activeNode.connections.length}</p>
              <p className="text-slate-500 text-xs">Conexões</p>
            </div>
            <div>
              <p className="text-xl font-bold text-blue-400">{Math.round(activeNode.strength * activeNode.connections.length * 10)}</p>
              <p className="text-slate-500 text-xs">Impacto</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CorrelationViz;