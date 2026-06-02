// fallow-ignore-file unused-file
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, ThumbsUp, TrendingUp, Users } from 'lucide-react';
const C = {score:4.6,responses:1234,promoters:890,detractors:123};
export function CSATScore({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Star className="w-4 h-4 text-amber-400" /><span>CSAT Score</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Score',v:C.score+'/5',c:'amber'},{l:'Responses',v:C.responses,c:'cyan'},{l:'Promoters',v:C.promoters,c:'emerald'},{l:'Detractors',v:C.detractors,c:'red'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default CSATScore;
