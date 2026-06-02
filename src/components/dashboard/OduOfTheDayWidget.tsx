// fallow-ignore-file unused-file
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skull, AlertTriangle, CheckCircle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { getOduDoDia } from '@/lib/orixa/widget-data';

function Section({
  title,
  icon: Icon,
  items,
  variant = 'default',
}: {
  title: string;
  icon: React.ElementType;
  items: string[];
  variant?: 'danger' | 'success' | 'info' | 'default';
}) {
  const [open, setOpen] = useState(false);

  const colorMap: Record<string, string> = {
    danger: 'text-red-400 border-red-500/30 bg-red-500/10',
    success: 'text-green-400 border-green-500/30 bg-green-500/10',
    info: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    default: 'text-slate-400 border-slate-500/30 bg-slate-500/10',
  };

  const iconColorMap: Record<string, string> = {
    danger: 'text-red-400',
    success: 'text-green-400',
    info: 'text-amber-400',
    default: 'text-slate-400',
  };

  return (
    <div className={'rounded-lg border ' + colorMap[variant] + ' overflow-hidden'}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className={'w-4 h-4 ' + iconColorMap[variant]} />
          <span className={'text-sm font-medium ' + iconColorMap[variant]}>{title}</span>
        </div>
        {open ? (
          <ChevronUp className={'w-4 h-4 ' + iconColorMap[variant]} />
        ) : (
          <ChevronDown className={'w-4 h-4 ' + iconColorMap[variant]} />
        )}
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-1">
          {items.map((item, i) => (
            <p key={i} className="text-xs text-slate-300 pl-5">
              • {item}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export function OduOfTheDayWidget() {
  const odu = getOduDoDia(new Date());

  const preceptosItems = odu.preceitos
    .split(/[;,]/)
    .map((p: string) => p.trim())
    .filter(Boolean);

  return (
    <Card className="card-spiritual bg-gradient-to-br from-orange-950/60 via-amber-950/40 to-orange-950/60 border-orange-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Skull className="w-5 h-5 text-orange-400" />
          <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
            Odú do Dia
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500/30 to-amber-500/30 border-2 border-orange-500/50 shadow-lg shadow-orange-500/20">
            <span className="text-3xl font-bold text-amber-400">{odu.numero}</span>
          </div>
          <p className="text-xl font-bold text-orange-300">{odu.nome}</p>
          <p className="text-sm text-slate-300">{odu.significado}</p>
        </div>

        <div className="flex justify-center gap-2 flex-wrap">
          {odu.orixas.map((orixa: string) => (
            <span
              key={orixa}
              className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/40 text-orange-300 font-medium"
            >
              {orixa}
            </span>
          ))}
        </div>

        <div className="flex justify-center gap-2 flex-wrap">
          {odu.elementos
            .split(',')
            .map((el: string) => el.trim())
            .filter(Boolean)
            .map((el: string) => (
              <span
                key={el}
                className="px-2 py-0.5 text-xs rounded bg-amber-500/10 text-amber-300 border border-amber-500/20"
              >
                {el}
              </span>
            ))}
        </div>

        <div className="space-y-2">
          <Section
            title="Quizilas (O que evitar)"
            icon={AlertTriangle}
            items={odu.quizilas}
            variant="danger"
          />
          <Section
            title="Preceptos (O que fazer)"
            icon={CheckCircle}
            items={preceptosItems}
            variant="success"
          />
          <Section
            title="Ebó Recomendado"
            icon={Sparkles}
            items={[odu.ebo]}
            variant="info"
          />
        </div>
      </CardContent>
    </Card>
  );
}
