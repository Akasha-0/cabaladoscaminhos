'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleDot } from 'lucide-react';
const F = [{n:'Madeira',c:'Verde'},{n:'Fogo',c:'Vermelho'},{n:'Terra',c:'Amarelo'},{n:'Metal',c:'Branco'},{n:'Água',c:'Preto'}];
export function ChineseFiveElementsWidget({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><CircleDot className="w-4 h-4 text-amber-400" /><span>Wu Xing</span></CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2 justify-center">{F.map((f,i) => (<div key={i} className="px-3 py-1 rounded-full" style={{backgroundColor:`${f.c}33`,color:f.c}}><span className="text-sm">{f.n}</span></div>))}</CardContent></Card>);
}
export default ChineseFiveElementsWidget;