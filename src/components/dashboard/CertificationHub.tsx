// fallow-ignore-file unused-file
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Star, CheckCircle2, Target } from 'lucide-react';
const C = {certifications:34,earned:12,pending:22,avgScore:85};
export function CertificationHub({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Award className="w-4 h-4 text-violet-400" /><span>Certifications</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Certifications',v:C.certifications,c:'violet'},{l:'Earned',v:C.earned,c:'emerald'},{l:'Pending',v:C.pending,c:'amber'},{l:'Avg Score',v:C.avgScore+'%',c:'cyan'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default CertificationHub;
