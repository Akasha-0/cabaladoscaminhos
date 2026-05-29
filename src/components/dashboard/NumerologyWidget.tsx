'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';

interface NumerologyWidgetProps {
  name?: string;
  birthDate?: string;
}

export function NumerologyWidget({ name, birthDate }: NumerologyWidgetProps) {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  
  // Calculate spiritual numbers
  const lifePath = ((day + month + year) % 9) + 1;
  const destiny = ((day * 2 + month) % 9) + 1;
  const soul = ((day + month * 2) % 9) + 1;
  const personality = ((day + year % 100) % 9) + 1;

  const numbers = [
    { label: 'Vida', value: lifePath, color: 'text-cyan-400' },
    { label: 'Destino', value: destiny, color: 'text-amber-400' },
    { label: 'Alma', value: soul, color: 'text-violet-400' },
    { label: 'Personalidade', value: personality, color: 'text-emerald-400' },
  ];

  return (
    <Card className="card-spiritual">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="w-5 h-5 text-cyan-400" />
          <span className="bg-gradient-to-r from-cyan-400 to-amber-400 bg-clip-text text-transparent">
            Numerologia
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {numbers.map((num) => (
            <div key={num.label} className="text-center p-3 rounded-lg bg-slate-800/50">
              <p className={`text-3xl font-bold ${num.color}`}>{num.value}</p>
              <p className="text-xs text-slate-400 mt-1">{num.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
