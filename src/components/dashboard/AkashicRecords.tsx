'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Sparkles, Eye, TrendingUp } from 'lucide-react';
const A = {records:256,accessed:34,readings:89,insights:156};
export function AkashicRecords({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><BookOpen className="w-4 h-4 text-violet-400" /><span>Akashic Records</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Records',v:A.records,c:'violet'},{l:'Accessed',v:A.accessed,c:'cyan'},{l:'Readings',v:A.readings,c:'amber'},{l:'Insights',v:A.insights,c:'emerald'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default AkashicRecords;