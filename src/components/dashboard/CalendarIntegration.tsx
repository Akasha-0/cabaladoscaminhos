'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
const C = {events:89,synced:78,reminders:123,conflicts:4};
export function CalendarIntegration({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4 text-violet-400" /><span>Calendar Sync</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Events',v:C.events,c:'violet'},{l:'Synced',v:C.synced,c:'emerald'},{l:'Reminders',v:C.reminders,c:'cyan'},{l:'Conflicts',v:C.conflicts,c:'red'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default CalendarIntegration;
