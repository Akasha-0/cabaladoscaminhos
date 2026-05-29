'use client';

import { SpiritualSidebar } from './SpiritualSidebar';
import { DashboardHeader } from './DashboardHeader';
import { MobileBottomNav } from './MobileBottomNav';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 fixed h-full">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-amber-400">✦ Cabala</h1>
          <p className="text-xs text-slate-500">dos Caminhos</p>
        </div>
        <SpiritualSidebar />
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 md:ml-64 flex flex-col">
        <DashboardHeader />
        <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
          {children}
        </div>
      </main>
      
      {/* Mobile Bottom Nav */}
      <MobileBottomNav />
    </div>
  );
}