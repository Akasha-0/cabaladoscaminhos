// fallow-ignore-file unused-file
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Warehouse, Box, Clock, TrendingUp } from 'lucide-react';
const W = {warehouses:12,items:45678,throughput:2345,utilization:89};
export function WarehouseLogistics({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Warehouse className="w-4 h-4 text-violet-400" /><span>Warehouse</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Warehouses',v:W.warehouses,c:'violet'},{l:'Items',v:W.items,c:'cyan'},{l:'Throughput',v:W.throughput,c:'amber'},{l:'Utilization',v:W.utilization+'%',c:'emerald'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded texts-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default WarehouseLogistics;
