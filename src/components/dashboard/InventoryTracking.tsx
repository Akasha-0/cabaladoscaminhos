'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Warehouse, Package, AlertTriangle, CheckCircle2 } from 'lucide-react';
const I = {items:234,lowStock:12,outOfStock:3,inTransit:45};
export function InventoryTracking({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Warehouse className="w-4 h-4 text-cyan-400" /><span>Inventory</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Items',v:I.items,c:'cyan'},{l:'Low Stock',v:I.lowStock,c:'amber'},{l:'Out of Stock',v:I.outOfStock,c:'red'},{l:'In Transit',v:I.inTransit,c:'emerald'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default InventoryTracking;