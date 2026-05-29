'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
const C = {deployments:156,successful:145,failed:8,pending:3};
export function CDPipeline({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Play className="w-4 h-4 text-emerald-400" /><span>CD Pipeline</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Deployments',v:C.deployments,c:'emerald'},{l:'Successful',v:C.successful,c:'cyan'},{l:'Failed',v:C.failed,c:'red'},{l:'Pending',v:C.pending,c:'amber'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default CDPipeline;
