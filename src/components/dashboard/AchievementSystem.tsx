'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Star, CheckCircle2, Target } from 'lucide-react';
const A = {total:89,unlocked:45,locked:44,rare:12};
export function AchievementSystem({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Award className="w-4 h-4 text-emerald-400" /><span>Achievements</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Total',v:A.total,c:'emerald'},{l:'Unlocked',v:A.unlocked,c:'cyan'},{l:'Locked',v:A.locked,c:'amber'},{l:'Rare',v:A.rare,c:'violet'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default AchievementSystem;