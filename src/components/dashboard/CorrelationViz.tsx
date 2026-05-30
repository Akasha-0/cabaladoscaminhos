'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Network,
  Link2,
  Sparkles,
  Zap,
  Eye,
  Circle,
  Activity,
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

const SYSTEM_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Numerologia': { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  'Astrologia': { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/30' },
  'Ifá/Odu': { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  'Candomblé': { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'Cabala': { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  'Tarot': { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' },
  'Chakras': { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
};

const DEFAULT_NODES: CorrelationNode[] = [
  { id: 'numerologia', name: 'Numerologia', system: 'Numerologia', strength: 0.9, connections: ['astrologia', 'cabala'], color: 'bg-blue-500' },
  { id: 'astrologia', name: 'Astrologia', system: 'Astrologia', strength: 0.85, connections: ['numerologia', 'ifa'], color: 'bg-violet-500' },
  { id: 'ifa', name: 'Ifá/Odu', system: 'Ifá/Odu', strength: 0.95, connections: ['astrologia', 'candomble'], color: 'bg-amber-500' },
  { id: 'candomble', name: 'Candomblé', system: 'Candomblé', strength: 0.88, connections: ['ifa', 'tarot'], color: 'bg-emerald-500' },
  { id: 'cabala', name: 'Cabala', system: 'Cabala', strength: 0.78, connections: ['numerologia', 'chakras'], color: 'bg-indigo-500' },
  { id: 'tarot', name: 'Tarot', system: 'Tarot', strength: 0.72, connections: ['candomble', 'chakras'], color: 'bg-pink-500' },
  { id: 'chakras', name: 'Chakras', system: 'Chakras', strength: 0.68, connections: ['cabala', 'tarot'], color: 'bg-cyan-500' },
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

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface NodeButtonProps {
  node: CorrelationNode;
  isActive: boolean;
  onClick: () => void;
  position?: { x: number; y: number };
}

function NodeButton({ node, isActive, onClick, position }: NodeButtonProps) {
  const colors = SYSTEM_COLORS[node.system] || SYSTEM_COLORS['Numerologia'];

  return (
    <button
      onClick={onClick}
      className={cn(
        'absolute p-2.5 rounded-xl bg-slate-800/90 backdrop-blur-sm border transition-all duration-300',
        isActive 
          ? 'border-purple-500/50 ring-2 ring-purple-500/30 scale-110 z-10' 
          : 'border-slate-700/50 hover:border-slate-600/50 hover:scale-105'
      )}
      style={position ? { left: position.x - 35, top: position.y - 20 } : {}}
    >
      <div className="flex items-center gap-2">
        <div className={cn('w-2.5 h-2.5 rounded-full', node.color)} />
        <span className={cn('text-xs font-medium', colors.text)}>{node.name}</span>
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
  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke="url(#lineGradient)"
      strokeWidth={1 + strength * 2}
      strokeOpacity={0.3 + strength * 0.5}
      strokeLinecap="round"
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
    const centerX = 140;
    const centerY = 90;
    const radius = 70;
    
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
    <Card className={cn(
      'card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden',
      className
    )}>
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500/10 to-blue-500/10 border border-violet-500/20 flex items-center justify-center">
              <Network className="w-4 h-4 text-violet-400" />
            </div>
            <span className="text-base font-semibold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              Correlações Espirituais
            </span>
          </CardTitle>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link2 className="w-3.5 h-3.5" />
            <span>{correlations.length} sistemas</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Visualization */}
        <div className="relative bg-slate-900/60 rounded-xl overflow-hidden border border-slate-800/50" style={{ height: 180 }}>
          {/* SVG Gradient Definition */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgb(139, 92, 246)" />
                <stop offset="100%" stopColor="rgb(59, 130, 246)" />
              </linearGradient>
            </defs>
            
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
              <NodeButton
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

          {/* Center glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500/10 to-blue-500/10 blur-xl" />
          </div>
        </div>

        {/* Active Node Stats */}
        {activeNode && (
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={cn('w-2.5 h-2.5 rounded-full', activeNode.color)} />
                <span className="text-sm font-medium text-white">{activeNode.name}</span>
              </div>
              <span className="text-xs text-slate-400">{activeNode.connections.length} conexões</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-slate-700/30">
                <p className="text-lg font-bold text-white">{Math.round(activeNode.strength * 100)}%</p>
                <p className="text-xs text-slate-500">Força</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-700/30">
                <p className="text-lg font-bold text-violet-400">{activeNode.connections.length}</p>
                <p className="text-xs text-slate-500">Conexões</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-700/30">
                <p className="text-lg font-bold text-blue-400">{Math.round(activeNode.strength * activeNode.connections.length * 10)}</p>
                <p className="text-xs text-slate-500">Impacto</p>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {Object.entries(SYSTEM_COLORS).slice(0, 5).map(([system, colors]) => (
            <div key={system} className="flex items-center gap-1.5">
              <div className={cn('w-2 h-2 rounded-full', colors.text.replace('text-', 'bg-'))} />
              <span className={cn('text-xs', colors.text)}>{system}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default CorrelationViz;