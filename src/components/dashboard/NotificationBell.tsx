'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const NOTIFICATIONS = [
  { id: 1, title: '🌕 Lua Cheia amanhã', message: 'Ritual de manifestação recomendado' },
  { id: 2, title: '📿 Ebó recomendado', message: 'Odu indica necessidade de limpeza' },
  { id: 3, title: '⚠️ Quizila de Ogum', message: 'Evite usar facas hoje' },
];

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const unread = 2;
  
  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-black text-xs font-bold rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
      
      {open && (
        <Card className="absolute right-0 top-12 w-80 z-50 card-spiritual shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notificações Espirituais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {NOTIFICATIONS.map((notif) => (
              <div 
                key={notif.id} 
                className="p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <p className="font-medium text-sm">{notif.title}</p>
                <p className="text-xs text-slate-400 mt-1">{notif.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}