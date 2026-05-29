'use client';
import { Card, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Play, Terminal, CheckCircle2 } from 'lucide-react';
const A = {endpoints:123,requests:45678,errors:45,latency:'45ms'};
export function APIExplorer({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Code className="w-4 h-4 text-violet-400" /><span>API Explorer</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Endpoints',v:A.endpoints,c:'violet'},{l:'Requests',v:A.requests,c:'cyan'},{l:'Errors',v:A.errors,c:'red'},{l:'Latency',v:A.latency,c:'emerald'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default APIExplorer;