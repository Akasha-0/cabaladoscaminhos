// fallow-ignore-file unused-file
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, Flame, Activity } from 'lucide-react';
const K = {chakra:4,energy:78,activation:67,kundalini:89};
export function KundaliniEnergy({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Zap className="w-4 h-4 text-amber-400" /><span>Kundalini</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Chakra',v:K.chakra,c:'amber'},{l:'Energy',v:K.energy+'%',c:'cyan'},{l:'Activation',v:K.activation+'%',c:'emerald'},{l:'Kundalini',v:K.kundalini+'%',c:'violet'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default KundaliniEnergy;