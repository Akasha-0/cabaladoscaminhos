// fallow-ignore-file unused-file
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, TrendingUp, Users, Clock } from 'lucide-react';
const R = {day1:67,day7:45,day30:23,day90:12};
export function RetentionMetrics({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><RefreshCw className="w-4 h-4 text-violet-400" /><span>Retention</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Day 1',v:R.day1+'%',c:'emerald'},{l:'Day 7',v:R.day7+'%',c:'cyan'},{l:'Day 30',v:R.day30+'%',c:'amber'},{l:'Day 90',v:R.day90+'%',c:'violet'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default RetentionMetrics;
