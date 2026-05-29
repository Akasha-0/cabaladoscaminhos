'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Zap, Sun, Moon } from 'lucide-react';
const P = {planets:7,signs:12,houses:12,energy:89};
export function PlanetaryEnergy({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Globe className="w-4 h-4 text-emerald-400" /><span>Planetary Energy</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Planets',v:P.planets,c:'emerald'},{l:'Signs',v:P.signs,c:'amber'},{l:'Houses',v:P.houses,c:'violet'},{l:'Energy',v:P.energy+'%',c:'cyan'}].map((i)=>(<div key,...<p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default PlanetaryEnergy;