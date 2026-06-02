// fallow-ignore-file unused-file
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag, Percent, TrendingUp, CheckCircle2 } from 'lucide-react';
const C = {coupons:34,active:12,used:456,avgDiscount:15};
export function CouponManagement({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Tag className="w-4 h-4 text-violet-400" /><span>Coupons</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Coupons',v:C.coupons,c:'violet'},{l:'Active',v:C.active,c:'emerald'},{l:'Used',v:C.used,c:'cyan'},{l:'Avg Discount',v:C.avgDiscount+'%',c:'amber'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default CouponManagement;