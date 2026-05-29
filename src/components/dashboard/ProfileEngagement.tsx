'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, TrendingUp, Eye, Heart } from 'lucide-react';
const P = {visits:3456,followers:234,following:189,interactionRate:12};
export function ProfileEngagement({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><User className="w-4 h-4 text-cyan-400" /><span>Profile</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Visits',v:P.visits,c:'cyan'},{l:'Followers',v:P.followers,c:'emerald'},{l:'Following',v:P.following,c:'amber'},{l:'Interaction',v:P.interactionRate+'%',c:'violet'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default ProfileEngagement;