// fallow-ignore-file unused-file
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users, PieChart } from 'lucide-react';
const L = {avgLTV:2345,predicted:3456,cohortLTV:1890,arpa:45};
export function LTVAnalysis({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><DollarSign className="w-4 h-4 text-emerald-400" /><span>LTV Analysis</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Avg LTV',v:'$'+L.avgLTV,c:'emerald'},{l:'Predicted',v:'$'+L.predicted,c:'cyan'},{l:'Cohort LTV',v:'$'+L.cohortLTV,c:'amber'},{l:'ARPA',v:'$'+L.arpa,c:'violet'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default LTVAnalysis;
