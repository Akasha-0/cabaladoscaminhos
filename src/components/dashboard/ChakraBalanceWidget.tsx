'use client';

import React from 'react';
import { CircleDot } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const CHAKRAS = [
  { nome: 'Raiz', cor: '#DC2626', energia: 85 },
  { nome: 'Sacro', cor: '#EA580C', energia: 72 },
  { nome: 'Plexo', cor: '#EAB308', energia: 90 },
  { nome: 'Coração', cor: '#22C55E', energia: 78 },
  { nome: 'Laríngeo', cor: '#06B6D4', energia: 65 },
  { nome: 'Frontal', cor: '#3B82F6', energia: 88 },
  { nome: 'Coronário', cor: '#8B5CF6', energia: 70 },
];

export function ChakraBalanceWidget({ className = '' }: { className?: string }) {
  const today = new Date();
  const dayOfWeek = today.getDay();

  const adjustedChakras = CHAKRAS.map((chakra, i) => {
    let modifier = 0;
    if (dayOfWeek === 1 && (i === 0 || i === 5)) modifier = 10;
    if (dayOfWeek === 2 && i === 1) modifier = 12;
    if (dayOfWeek === 3 && i === 2) modifier = 8;
    if (dayOfWeek === 4 && i === 3) modifier = 15;
    if (dayOfWeek === 5 && i === 6) modifier = 18;
    if (dayOfWeek === 6 && (i === 5 || i === 3)) modifier = 10;
    if (dayOfWeek === 0 && i === 2) modifier = 12;
    return { ...chakra, energia: Math.min(100, chakra.energia + modifier) };
  });

  const mostActive = adjustedChakras.reduce((a, b) => a.energia > b.energia ? a : b);

  return (
    <Card className={`card-spiritual ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CircleDot className="w-5 h-5 text-amber-400" />
          <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Chakras</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {adjustedChakras.map((chakra) => (
            <div key={chakra.nome} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span style={{ color: chakra.cor }}>{chakra.nome}</span>
                <span className="text-slate-400">{chakra.energia}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${chakra.energia}%`,
                    backgroundColor: chakra.cor,
                    opacity: chakra === mostActive ? 1 : 0.6,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-4 text-center">
          Mais ativo: <span className="text-amber-400">{mostActive.nome}</span>
        </p>
      </CardContent>
    </Card>
  );
}
