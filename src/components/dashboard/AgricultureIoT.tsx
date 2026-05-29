'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sprout, Cloud, Droplets, Sun } from 'lucide-react';
const A = {sensors:234,soilMoisture:67,temperature:25,humidity:72};
export function AgricultureIoT({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Sprout className="w-4 h-4 text-emerald-400" /><span>Agriculture</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Sensors',v:A.sensors,c:'emerald'},{l:'Soil Moisture',v:A.soilMoisture+'%',c:'cyan'},{l:'Temperature',v:A.temperature+'°C',c:'amber'},{l:'Humidity',v:A.humidity+'%',c:'violet'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default AgricultureIoT;
