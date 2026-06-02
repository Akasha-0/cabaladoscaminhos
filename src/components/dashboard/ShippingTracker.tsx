// fallow-ignore-file unused-file
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Package, MapPin, Clock } from 'lucide-react';
const S = {shipments:145,delivered:123,inTransit:18,delayed:4};
export function ShippingTracker({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Truck className="w-4 h-4 text-emerald-400" /><span>Shipping</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Shipments',v:S.shipments,c:'emerald'},{l:'Delivered',v:S.delivered,c:'cyan'},{l:'In Transit',v:S.inTransit,c:'amber'},{l:'Delayed',v:S.delayed,c:'red'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default ShippingTracker;