// fallow-ignore-file unused-file
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, CheckCircle2, Calendar, Star } from 'lucide-react';
const D = {challenges:5,completed:3,points:234,streak:7};
export function DailyChallenges({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Target className="w-4 h-4 text-red-400" /><span>Daily Challenges</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Challenges',v:D.challenges,c:'red'},{l:'Completed',v:D.completed,c:'emerald'},{l:'Points',v:D.points,c:'amber'},{l:'Streak',v:D.streak,c:'cyan'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default DailyChallenges;