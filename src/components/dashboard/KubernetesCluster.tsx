'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Box, Layers, Activity, CheckCircle2 } from 'lucide-react';
const K = {clusters:3,nodes:12,pods:156,healthy:154};
export function KubernetesCluster({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Box className="w-4 h-4 text-emerald-400" /><span>Kubernetes</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Clusters',v:K.clusters,c:'emerald'},{l:'Nodes',v:K.nodes,c:'cyan'},{l:'Pods',v:K.pods,c:'amber'},{l:'Healthy',v:K.healthy,c:'violet'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default KubernetesCluster;
