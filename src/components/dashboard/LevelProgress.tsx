'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, ArrowUp, Star, Target } from 'lucide-react';
const L = {level:23,currentXP:4567,nextLevel:7890,progress:58};
export function LevelProgress({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><TrendingUp className="w-4 h-4 text-violet-400" /><span>Level Progress</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Level',v:L.level,c:'violet'},{l:'Current XP',v:L.currentXP.toLocaleString(),c:'cyan'},{l:'Next Level',v:L.nextLevel.toLocaleString(),c:'amber'},{l:'Progress',v:L.progress+'%',c:'emerald'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default LevelProgress;