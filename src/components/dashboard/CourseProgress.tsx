'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, Users, Clock } from 'lucide-react';
const C = {enrolled:456,ongoing:234,completed:189,avgTime:'12h'};
export function CourseProgress({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><TrendingUp className="w-4 h-4 text-amber-400" /><span>Course Progress</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Enrolled',v:C.enrolled,c:'amber'},{l:'Ongoing',v:C.ongoing,c:'cyan'},{l:'Completed',v:C.completed,c:'emerald'},{l:'Avg Time',v:C.avgTime,c:'violet'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default CourseProgress;
