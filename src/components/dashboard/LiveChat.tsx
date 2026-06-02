// fallow-ignore-file unused-file
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Users, Clock, CheckCircle2 } from 'lucide-react';
const L = {chats:456,active:34,resolved:422,avgDuration:'12m'};
export function LiveChat({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><MessageCircle className="w-4 h-4 text-violet-400" /><span>Live Chat</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Chats',v:L.chats,c:'violet'},{l:'Active',v:L.active,c:'amber'},{l:'Resolved',v:L.resolved,c:'emerald'},{l:'Avg Duration',v:L.avgDuration,c:'cyan'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default LiveChat;
