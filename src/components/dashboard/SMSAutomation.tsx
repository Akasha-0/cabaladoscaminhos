'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
const S = {sms:1234,sent:1123,delivered:1089,failed:34};
export function SMSAutomation({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><MessageSquare className="w-4 h-4 text-cyan-400" /><span>SMS</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'SMS',v:S.sms,c:'cyan'},{l:'Sent',v:S.sent,c:'emerald'},{l:'Delivered',v:S.delivered,c:'amber'},{l:'Failed',v:S.failed,c:'red'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default SMSAutomation;
