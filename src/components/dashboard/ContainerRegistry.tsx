'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Box, Package, Layers, Tag } from 'lucide-react';
const C = {images:45,versions:234,tags:89,pulled:567};
export function ContainerRegistry({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Box className="w-4 h-4 text-cyan-400" /><span>Container Registry</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Images',v:C.images,c:'cyan'},{l:'Versions',v:C.versions,c:'violet'},{l:'Tags',v:C.tags,c:'amber'},{l:'Pulled',v:C.pulled,c:'emerald'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default ContainerRegistry;
