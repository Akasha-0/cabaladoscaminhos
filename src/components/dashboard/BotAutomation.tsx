'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, MessageCircle, CheckCircle2, Zap } from 'lucide-react';
const B = {interactions:5678,automated:4567,satisfaction:89,escalated:234};
export function BotAutomation({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Bot className="w-4 h-4 text-cyan-400" /><span>Bot Automation</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Interactions',v:B.interactions,c:'cyan'},{l:'Automated',v:B.automated,c:'emerald'},{l:'Satisfaction',v:B.satisfaction+'%',c:'amber'},{l:'Escalated',v:B.escalated,c:'red'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default BotAutomation;
