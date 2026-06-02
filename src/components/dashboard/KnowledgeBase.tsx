// fallow-ignore-file unused-file
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Search, FileText, Users } from 'lucide-react';
const K = {articles:456,views:12345,searches:5678,helpful:89};
export function KnowledgeBase({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><BookOpen className="w-4 h-4 text-emerald-400" /><span>Knowledge Base</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Articles',v:K.articles,c:'emerald'},{l:'Views',v:K.views.toLocaleString(),c:'cyan'},{l:'Searches',v:K.searches,c:'amber'},{l:'Helpful',v:K.helpful+'%',c:'violet'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default KnowledgeBase;
