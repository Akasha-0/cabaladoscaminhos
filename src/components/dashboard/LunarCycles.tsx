'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Star, Sparkles, TrendingUp } from 'lucide-react';
const L = {phases:8,rituals:23,energy:78,moons:12};
export function LunarCycles({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Moon className="w-4 h-4 text-amber-400" /><span>Lunar Cycles</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Phases',v:L.phases,c:'amber'},{l:'Rituals',v:L.rituals,c:'emerald'},{l:'Energy',v:L.energy+'%',c:'cyan'},{l:'Moons',v:L.moons,c:'violet'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default LunarCycles;