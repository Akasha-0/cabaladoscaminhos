'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Clock, Eye, ThumbsUp } from 'lucide-react';
const V = {videos:234,hours:156,views:45678,engagement:78};
export function VideoLessons({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Play className="w-4 h-4 text-emerald-400" /><span>Video Lessons</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Videos',v:V.videos,c:'emerald'},{l:'Hours',v:V.hours,c:'cyan'},{l:'Views',v:V.views.toLocaleString(),c:'amber'},{l:'Engagement',v:V.engagement+'%',c:'violet'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default VideoLessons;
