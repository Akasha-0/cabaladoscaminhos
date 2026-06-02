// fallow-ignore-file unused-file
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GitBranch, TrendingUp, Users, BarChart3 } from 'lucide-react';
const C = {cohorts:12,retention:67,churn:12,avgValue:234};
export function CohortAnalysis({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><GitBranch className="w-4 h-4 text-cyan-400" /><span>Cohort Analysis</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Cohorts',v:C.cohorts,c:'cyan'},{l:'Retention',v:C.retention+'%',c:'emerald'},{l:'Churn',v:C.churn+'%',c:'amber'},{l:'Avg Value',v:'$'+C.avgValue,c:'violet'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default CohortAnalysis;
