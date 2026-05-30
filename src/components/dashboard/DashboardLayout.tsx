'use client';

import { useState } from 'react';
import { SpiritualSidebar } from './SpiritualSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { Sparkles } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Desktop Sidebar */}
      <SpiritualSidebar />
      
      {/* Main Content */}
      <main 
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'md:ml-20' : 'md:ml-72'
        }`}
      >
        <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
          {children}
        </div>
      </main>
      
      {/* Mobile Bottom Nav */}
      <MobileBottomNav />
    </div>
  );
}