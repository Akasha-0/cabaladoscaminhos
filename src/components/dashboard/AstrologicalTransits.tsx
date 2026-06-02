// fallow-ignore-file unused-file
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, TrendingUp, Globe, Clock } from 'lucide-react';
const A = {transits:12,planets:10,aspects:45,retrograde:2};
export function AstrologicalTransits({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Star className="w-4 h-4 text-amber-400" /><span>Astrological Transits</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Transits',v:A.transits,c:'amber'},{l:'Planets',v:A.planets,c:'cyan'},{l:'Aspects',v:A.aspects,c:'emerald'},{l:'Retrograde',v:A.retrograde,c:'red'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default AstrologicalTransits;