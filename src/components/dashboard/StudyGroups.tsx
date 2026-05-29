'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageCircle, Calendar, TrendingUp } from 'lucide-react';
const S = {groups:67,members:1234,meetings:456,sessions:89};
export function StudyGroups({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Users className="w-4 h-4 text-cyan-400" /><span>Study Groups</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Groups',v:S.groups,c:'cyan'},{l:'Members',v:S.members,c:'amber'},{l:'Meetings',v:S.meetings,c:'emerald'},{l:'Sessions',v:S.sessions,c:'violet'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default StudyGroups;
