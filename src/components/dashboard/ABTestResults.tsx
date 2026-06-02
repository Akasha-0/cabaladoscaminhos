// fallow-ignore-file unused-file
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FlaskConical, TrendingUp, Target, CheckCircle2 } from 'lucide-react';
const A = {tests:23,significant:15,running:3,avgLift:23};
export function ABTestResults({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><FlaskConical className="w-4 h-4 text-emerald-400" /><span>A/B Tests</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Tests',v:A.tests,c:'emerald'},{l:'Significant',v:A.significant,c:'cyan'},{l:'Running',v:A.running,c:'amber'},{l:'Avg Lift',v:A.avgLift+'%',c:'violet'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default ABTestResults;
