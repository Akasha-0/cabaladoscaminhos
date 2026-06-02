// fallow-ignore-file unused-file
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Circle, Send, Clock } from 'lucide-react';
const M = {messages:3456,unread:23,sent:234,sessions:67};
export function MessagesHub({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><MessageCircle className="w-4 h-4 text-violet-400" /><span>Messages</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Messages',v:M.messages,c:'violet'},{l:'Unread',v:M.unread,c:'amber'},{l:'Sent',v:M.sent,c:'emerald'},{l:'Sessions',v:M.sessions,c:'cyan'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default MessagesHub;