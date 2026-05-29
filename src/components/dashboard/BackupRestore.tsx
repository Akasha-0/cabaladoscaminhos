'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Save, RotateCcw, Clock } from 'lucide-react';
const B = {backups:45,restorePoints:34,lastBackup:'2h ago',storage:'256GB'};
export function BackupRestore({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Database className="w-4 h-4 text-emerald-400" /><span>Backup/Restore</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Backups',v:B.backups,c:'emerald'},{l:'Restore Points',v:B.restorePoints,c:'cyan'},{l:'Last Backup',v:B.lastBackup,c:'amber'},{l:'Storage',v:B.storage,c:'violet'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default BackupRestore;