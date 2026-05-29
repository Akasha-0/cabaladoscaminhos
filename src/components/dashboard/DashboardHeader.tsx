'use client';

import { Bell, Settings } from 'lucide-react';
import { EnergyIndicator } from './EnergyIndicator';
import { NotificationBell } from './NotificationBell';
import { UserProfileMenu } from './UserProfileMenu';

export function DashboardHeader() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 py-4 bg-slate-950/80 backdrop-blur border-b border-slate-800">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white">{greeting}</h1>
        <p className="text-sm text-slate-400">Buscadores da luz</p>
      </div>
      
      <div className="flex items-center gap-3">
        <EnergyIndicator />
        <NotificationBell />
        <UserProfileMenu />
        <button className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}