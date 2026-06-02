// fallow-ignore-file unused-file
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, TrendingDown, Users, Target } from 'lucide-react';
const F = {steps:5,visitors:10000,qualified:2345,converted:456};
export function FunnelAnalysis({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Filter className="w-4 h-4 text-amber-400" /><span>Funnel Analysis</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Steps',v:F.steps,c:'amber'},{l:'Visitors',v:F.visitors.toLocaleString(),c:'cyan'},{l:'Qualified',v:F.qualified.toLocaleString(),c:'emerald'},{l:'Converted',v:F.converted,c:'violet'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default FunnelAnalysis;
