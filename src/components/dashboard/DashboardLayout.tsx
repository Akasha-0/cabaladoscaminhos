'use client';

import { useState, useEffect } from 'react';
import { SpiritualSidebar } from './SpiritualSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-collapse sidebar on smaller screens
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Listen for sidebar toggle from SpiritualSidebar
  useEffect(() => {
    const handleSidebarToggle = (e: CustomEvent<boolean>) => {
      setSidebarCollapsed(e.detail);
    };

    window.addEventListener('sidebar-toggle' as any, handleSidebarToggle);
    return () => window.removeEventListener('sidebar-toggle' as any, handleSidebarToggle);
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-950 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center animate-pulse">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Carregando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <SpiritualSidebar />
      </div>
      
      {/* Main Content */}
      <main 
        className={cn(
          'flex-1 flex flex-col transition-all duration-300',
          isMobile ? 'ml-0' : sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
        )}
      >
        {/* Page content */}
        <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
          {children}
        </div>
      </main>
      
      {/* Mobile Bottom Nav */}
      <MobileBottomNav />

      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top gradient */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}