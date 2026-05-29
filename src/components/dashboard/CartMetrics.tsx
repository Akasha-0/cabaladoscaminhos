'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Clock, TrendingUp, Target } from 'lucide-react';
const C = {carts:234,active:45,abandoned:123,conversion:36};
export function CartMetrics({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><ShoppingCart className="w-4 h-4 text-amber-400" /><span>Cart Metrics</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Carts',v:C.carts,c:'amber'},{l:'Active',v:C.active,c:'emerald'},{l:'Abandoned',v:C.abandoned,c:'red'},{l:'Conversion',v:C.conversion+'%',c:'cyan'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default CartMetrics;