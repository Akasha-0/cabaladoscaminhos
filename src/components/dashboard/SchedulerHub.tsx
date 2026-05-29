'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, CheckCircle2, RefreshCw } from 'lucide-react';
const S = {schedules:45,daily:20,weekly:15,monthly:10};
export function SchedulerHub({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-emerald-400" /><span>Scheduler</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Schedules',v:S.schedules,c:'emerald'},{l:'Daily',v:S.daily,c:'cyan'},{l:'Weekly',v:S.weekly,c:'amber'},{l:'Monthly',v:S.monthly,c:'violet'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default SchedulerHub;
