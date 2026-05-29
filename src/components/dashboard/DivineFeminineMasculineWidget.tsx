'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleDot } from 'lucide-react';
const D = {feminine:55,masculine:45,balance:'Harmonizado'};
export function DivineFeminineMasculineWidget({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><CircleDot className="w-4 h-4 text-pink-400" /><span>Divine Balance</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2"><div className="text-center p-2 bg-pink-500/20 rounded"><p className="text-xl text-pink-400 font-bold">{D.feminine}%</p><p className="text-xs text-slate-500">Feminine</p></div><div className="text-center p-2 bg-amber-500/20 rounded"><p className="text-xl text-amber-400 font-bold">{D.masculine}%</p><p className="text-xs text-slate-500">Masculine</p></div></div><p className="text-xs text-emerald-400">{D.balance}</p></CardContent></Card>);
}
export default DivineFeminineMasculineWidget;