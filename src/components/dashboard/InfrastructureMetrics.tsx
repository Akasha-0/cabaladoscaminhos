'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Server, Cpu, HardDrive, Wifi } from 'lucide-react';
const I = {servers:12,cpuUsage:67,memory:78,network:45};
export function InfrastructureMetrics({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Server className="w-4 h-4 text-violet-400" /><span>Infrastructure</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Servers',v:I.servers,c:'violet'},{l:'CPU',v:I.cpuUsage+'%',c:'cyan'},{l:'Memory',v:I.memory+'%',c:'amber'},{l:'Network',v:I.network+'%',c:'emerald'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default InfrastructureMetrics;
