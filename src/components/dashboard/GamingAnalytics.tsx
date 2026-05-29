'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2, Users, TrendingUp, Trophy } from 'lucide-react';
const G = {players:56789,currentOnline:2345,matchmaking:134,avgSession:'45m'};
export function GamingAnalytics({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Gamepad2 className="w-4 h-4 text-violet-400" /><span>Gaming</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Players',v:G.players,c:'violet'},{l:'Online',v:G.currentOnline,c:'emerald'},{l:'Matchmaking',v:G.matchmaking,c:'cyan'},{l:'Session',v:G.avgSession,c:'amber'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default GamingAnalytics;
