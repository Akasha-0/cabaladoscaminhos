'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Heart, Share2, Users } from 'lucide-react';
const S = {posts:1234,likes:4567,comments:2345,shares:890};
export function SocialFeed({ className = '' }: { className?: string }) {
  return (<Card className={`card-spiritual ${className}`}><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><MessageCircle className="w-4 h-4 text-cyan-400" /><span>Social Feed</span></CardTitle></CardHeader><CardContent className="space-y-2"><div className="grid grid-cols-2 gap-2">{[{l:'Posts',v:S.posts,c:'cyan'},{l:'Likes',v:S.likes,c:'red'},{l:'Comments',v:S.comments,c:'amber'},{l:'Shares',v:S.shares,c:'emerald'}].map((i)=>(<div key={i.l} className="p-2 bg-slate-800/50 rounded text-center"><p className={`text-lg text-${i.c}-400 font-bold`}>{i.v}</p><p className="text-xs text-slate-500">{i.l}</p></div>))}</div></CardContent></Card>);
}
export default SocialFeed;