// fallow-ignore-file unused-file
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Tag, TrendingUp, Star } from 'lucide-react';
const P = {products:156,categories:23,inStock:134,sales:4567};
export function ProductCatalog({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Package className="w-4 h-4 text-cyan-400" /><span>Product Catalog</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Products',v:P.products,c:'cyan'},{l:'Categories',v:P.categories,c:'violet'},{l:'In Stock',v:P.inStock,c:'emerald'},{l:'Sales',v:P.sales.toLocaleString(),c:'amber'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default ProductCatalog;