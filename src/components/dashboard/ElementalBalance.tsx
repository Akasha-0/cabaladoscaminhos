// fallow-ignore-file unused-file
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Droplets, TreePine, Wind } from 'lucide-react';
const E = {fire:25,water:25,earth:25,air:25};
export function ElementalBalance({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Flame className="w-4 h-4 text-red-400" /><span>Elemental Balance</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Fire',v:E.fire+'%',c:'red'},{l:'Water',v:E.water+'%',c:'cyan'},{l:'Earth',v:E.earth+'%',c:'emerald'},{l:'Air',v:E.air+'%',c:'amber'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default ElementalBalance;