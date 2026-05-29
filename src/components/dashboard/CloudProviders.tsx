'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, Globe, DollarSign, Activity } from 'lucide-react';
const C = {providers:3,regions:12,spend:4567,uptime:99.9};
export function CloudProviders({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Cloud className="w-4 h-4 text-cyan-400" /><span>Cloud Providers</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Providers',v:C.providers,c:'cyan'},{l:'Regions',v:C.regions,c:'violet'},{l:'Spend',v:'$'+C.spend,c:'amber'},{l:'Uptime',v:C.uptime+'%',c:'emerald'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default CloudProviders;
