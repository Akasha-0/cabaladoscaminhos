'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, DollarSign, TrendingUp, Package } from 'lucide-react';
const S = {orders:456,revenue:23456,avgOrder:51,products:89};
export function ShopAnalytics({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><ShoppingBag className="w-4 h-4 text-emerald-400" /><span>Shop Analytics</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Orders',v:S.orders,c:'emerald'},{l:'Revenue',v:'$'+S.revenue.toLocaleString(),c:'cyan'},{l:'Avg Order',v:'$'+S.avgOrder,c:'amber'},{l:'Products',v:S.products,c:'violet'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default ShopAnalytics;