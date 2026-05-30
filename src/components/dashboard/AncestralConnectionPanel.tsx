'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Heart, Leaf, Shield, Sparkles, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface AncestralConnectionPanelProps {
  userData?: {
    name?: string;
    birthDate?: string;
    orixaRegente?: string;
  };
  className?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const ANCESTRAL_PRACTICES = [
  {
    name: 'Bori',
    description: 'Cerimônia de alimentação da cabeça (Ori) para fortalecer a conexão com os ancestrais',
    orixas: ['Oxalá', 'Nanã'],
    day: 'Sexta-feira',
    elements: ['Algodão', 'Canjica branca', 'Velas brancas'],
  },
  {
    name: 'Ebó de Ancestralidade',
    description: 'Oferenda para fortalecer a conexão com os mortos e guias espirituais',
    orixas: ['Omolu', 'Nanã', 'Iemanjá'],
    day: 'Segunda-feira',
    elements: ['Pipoca (Deburu)', 'Velas pretas', 'Flores brancas'],
  },
  {
    name: 'Guerra de Igbã',
    description: 'Ritual de proteção contra demandas espirituais e limpeza de energias pesadas',
    orixas: ['Ogum', 'Iansã', 'Exu'],
    day: 'Terça-feira',
    elements: ['Espada-de-são-jorge', 'Guiné', 'Pinhão roxo'],
  },
];

const ANCESTRAL_WARNINGS = [
  {
    title: 'Evite contato com Egum em dias de quizila',
    description: 'Dias de Omolu (segunda) não são indicados para trabalho com Ancestral',
  },
  {
    title: 'Não faça ebó em dias de Oxum sem orientação',
    description: 'Oxum é muito exigente com a limpeza antes de receber oferendas',
  },
];

// ============================================================
// MAIN COMPONENT
// ============================================================

export function AncestralConnectionPanel({ userData, className = '' }: AncestralConnectionPanelProps) {
  const [expandedPractice, setExpandedPractice] = useState<number | null>(null);
  const [showWarnings, setShowWarnings] = useState(false);

  return (
    <Card className={cn(
      'card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden',
      className
    )}>
      <CardHeader className="pb-3 border-b border-slate-800/50">
        <CardTitle className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-center">
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-base font-semibold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            Conexão Ancestral
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* User Orixá info */}
        {userData?.orixaRegente && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-xs text-amber-400/70">Seu Orixá Regente</p>
                <p className="text-lg font-bold text-white">{userData.orixaRegente}</p>
              </div>
            </div>
          </div>
        )}

        {/* Practices */}
        <div>
          <p className="text-xs text-slate-400 mb-2">Práticas Recomendadas</p>
          <div className="space-y-2">
            {ANCESTRAL_PRACTICES.map((practice, index) => (
              <div
                key={index}
                className="rounded-xl bg-slate-800/50 border border-slate-700/30 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedPractice(expandedPractice === index ? null : index)}
                  className="w-full p-3 flex items-center justify-between hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-white">{practice.name}</span>
                  </div>
                  {expandedPractice === index ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                
                {expandedPractice === index && (
                  <div className="px-3 pb-3 border-t border-slate-700/30 pt-2">
                    <p className="text-xs text-slate-400 mb-2">{practice.description}</p>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div>
                        <span className="text-amber-400">Orixás:</span>
                        <span className="text-slate-300 ml-1">{practice.orixas.join(', ')}</span>
                      </div>
                      <div>
                        <span className="text-amber-400">Dia:</span>
                        <span className="text-slate-300 ml-1">{practice.day}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-amber-400">Elementos:</span>
                        <span className="text-slate-300 ml-1">{practice.elements.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Warnings */}
        <div className="border-t border-slate-800/50 pt-4">
          <button
            onClick={() => setShowWarnings(!showWarnings)}
            className="w-full flex items-center justify-between text-left p-2 hover:bg-slate-800/30 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-white">Avisos Importantes</span>
            </div>
            {showWarnings ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>
          
          {showWarnings && (
            <div className="mt-3 space-y-2">
              {ANCESTRAL_WARNINGS.map((warning, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/20"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-300">{warning.title}</p>
                      <p className="text-xs text-slate-400 mt-1">{warning.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default AncestralConnectionPanel;