// fallow-ignore-file unused-file
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Send, AlertTriangle } from 'lucide-react';
const E = {emails:5678,sent:4567,openRate:45,clickRate:23};
export function EmailAutomation({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-violet-400" /><span>Email</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Emails',v:E.emails,c:'violet'},{l:'Sent',v:E.sent,c:'emerald'},{l:'Open Rate',v:E.openRate+'%',c:'cyan'},{l:'Click Rate',v:E.clickRate+'%',c:'amber'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default EmailAutomation;
