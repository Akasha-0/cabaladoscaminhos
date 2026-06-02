// fallow-ignore-file unused-file
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, PieChart, TrendingUp } from 'lucide-react';
const C = {segments:8,users:2345,avgLifetime:18,conversion:34};
export function CustomerSegment({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Users className="w-4 h-4 text-violet-400" /><span>Customer Segments</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Segments',v:C.segments,c:'violet'},{l:'Users',v:C.users,c:'cyan'},{l:'Avg Lifetime',v:C.avgLifetime+'mo',c:'amber'},{l:'Conversion',v:C.conversion+'%',c:'emerald'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default CustomerSegment;
