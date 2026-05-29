'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Activity, Wifi, AlertTriangle } from 'lucide-react';
const D = {databases:5,connections:234,queries:5678,latency:'12ms'};
export function DatabaseMonitoring({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Database className="w-4 h-4 text-violet-400" /><span>Database</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Databases',v:D.databases,c:'violet'},{l:'Connections',v:D.connections,c:'cyan'},{l:'Queries',v:D.queries,c:'amber'},{l:'Latency',v:D.latency,c:'emerald'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default DatabaseMonitoring;
