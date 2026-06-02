// fallow-ignore-file unused-file
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
const R = {reminders:56,active:34,completed:22,missed:3};
export function ReminderSystem({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Bell className="w-4 h-4 text-amber-400" /><span>Reminders</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Reminders',v:R.reminders,c:'amber'},{l:'Active',v:R.active,c:'emerald'},{l:'Completed',v:R.completed,c:'cyan'},{l:'Missed',v:R.missed,c:'red'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default ReminderSystem;
