'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Wifi, Activity, Clock } from 'lucide-react';
const W = {connections:234,active:189,messages:12345,latency:'12ms'};
export function WebSocketMonitor({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Zap className="w-4 h-4 text-amber-400" /><span>WebSocket</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Connections',v:W.connections,c:'amber'},{l:'Active',v:W.active,c:'emerald'},{l:'Messages',v:W.messages.c:'cyan'},{l:'Latency',v:W.latency,c:'violet'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default WebSocketMonitor;