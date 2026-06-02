// fallow-ignore-file unused-file
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Star, CheckCircle2, Lock } from 'lucide-react';
const B = {badges:56,earned:34,locked:22,featured:8};
export function BadgesCollection({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Award className="w-4 h-4 text-amber-400" /><span>Badges</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Badges',v:B.badges,c:'amber'},{l:'Earned',v:B.earned,c:'emerald'},{l:'Locked',v:B.locked,c:'slate-500'},{l:'Featured',v:B.featured,c:'violet'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default BadgesCollection;