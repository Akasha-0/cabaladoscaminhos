'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, MapPin, Fuel, Activity } from 'lucide-react';
const F = {vehicles:45,fleetActive:38,fuelEfficiency:8.5,totalMiles:45678};
export function FleetManagement({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Truck className="w-4 h-4 text-cyan-400" /><span>Fleet</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Vehicles',v:F.vehicles,c:'cyan'},{l:'Active',v:F.fleetActive,c:'emerald'},{l:'Efficiency',v:F.fuelEfficiency+'km/l',c:'amber'},{l:'Miles',v:F.totalMiles,c:'violet'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default FleetManagement;
