'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Server, Activity, CheckCircle2, AlertTriangle } from 'lucide-react';
const M = {services:23,healthy:21,degraded:1,down:1};
export function MicroservicesHealth({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Server className="w-4 h-4 text-emerald-400" /><span>Microservices</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Services',v:M.services,c:'emerald'},{l:'Healthy',v:M.healthy,c:'cyan'},{l:'Degraded',v:M.degraded,c:'amber'},{l:'Down',v:M.down,c:'red'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default MicroservicesHealth;