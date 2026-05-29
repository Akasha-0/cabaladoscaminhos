'use client';

import { useState } from 'react';
import { User, Settings, LogOut } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function UserProfileMenu() {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
          <User className="w-4 h-4 text-amber-400" />
        </div>
      </button>
      
      {open && (
        <Card className="absolute right-0 top-12 w-56 z-50 card-spiritual shadow-xl">
          <CardContent className="p-2">
            <div className="px-3 py-2 border-b border-slate-700 mb-2">
              <p className="font-medium">Visitante</p>
              <p className="text-xs text-slate-400">sem@email.com</p>
            </div>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-800 text-sm">
              <Settings className="w-4 h-4" />
              Configurações
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-800 text-sm text-red-400">
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}