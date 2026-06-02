// fallow-ignore-file unused-file
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Medal, Crown, Users, TrendingUp } from 'lucide-react';
const L = {rank:12,participants:2345,change:3,nextRank:1234};
export function Leaderboard({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Medal className="w-4 h-4 text-amber-400" /><span>Leaderboard</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Your Rank',v:'#'+L.rank,c:'amber'},{l:'Participants',v:L.participants,c:'cyan'},{l:'Change',v:'+'+L.change,c:'emerald'},{l:'Next Rank',v:L.nextRank+' pts',c:'violet'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default Leaderboard;