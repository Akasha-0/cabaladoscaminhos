// fallow-ignore-file unused-file
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
const N = {notifications:456,unread:34,read:422,alerts:12};
export function NotificationsCenter({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Bell className="w-4 h-4 text-amber-400" /><span>Notifications</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Total',v:N.notifications,c:'amber'},{l:'Unread',v:N.unread,c:'cyan'},{l:'Read',v:N.read,c:'emerald'},{l:'Alerts',v:N.alerts,c:'red'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default NotificationsCenter;