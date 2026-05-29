'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Star, Medal, Target } from 'lucide-react';
const G = {points:23456,rank:12,achievements:45,streaks:23};
export function GamificationHub({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Trophy className="w-4 h-4 text-amber-400" /><span>Gamification</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Points',v:G.points.toLocaleString(),c:'amber'},{l:'Rank',v:'#'+G.rank,c:'violet'},{l:'Achievements',v:G.achievements,c:'emerald'},{l:'Streaks',v:G.streaks,c:'cyan'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default GamificationHub;