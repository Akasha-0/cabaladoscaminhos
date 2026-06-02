// fallow-ignore-file unused-file
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GitBranch, Globe, MapPin, Clock } from 'lucide-react';
const S = {suppliers:234,shipments:567,locations:45,delayed:12};
export function SupplyChainVisibility({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><GitBranch className="w-4 h-4 text-emerald-400" /><span>Supply Chain</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Suppliers',v:S.suppliers,c:'emerald'},{l:'Shipments',v:S.shipments,c:'cyan'},{l:'Locations',v:S.locations,c:'amber'},{l:'Delayed',v:S.delayed,c:'red'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default SupplyChainVisibility;
