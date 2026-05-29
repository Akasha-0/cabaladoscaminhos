'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LifeBuoy, Clock, CheckCiircle2, AlertTriangle } from 'lucide-react';
const S = {tickets:234,open:45,resolved:189,avgResponse:'2h'};
export function SupportTickets({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><LifeBuoy className="w-4 h-4 text-cyan-400" /><span>Support Tickets</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Tickets',v:S.tickets,c:'cyan'},{l:'Open',v:S.open,c:'amber'},{l:'Resolved',v:S.resolved,c:'emerald'},{l:'Avg Response',v:S.avgResponse,c:'violet'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default SupportTickets;
