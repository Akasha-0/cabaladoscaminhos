'use client';

import { useState, useEffect, ReactNode } from 'react';
import { SpiritualSidebar } from './SpiritualSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
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
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Listen for sidebar toggle
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
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/30 animate-pulse">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            {/* Glow ring */}
            <div className="absolute inset-0 w-20 h-20 rounded-2xl border-2 border-amber-400/30 animate-ping" />
          </div>
          
          {/* Loading text */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-3 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-lg font-medium">Carregando sua jornada...</span>
            </div>
            <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-gradient-to-r from-amber-500 to-violet-500 rounded-full animate-progress" />
            </div>
          </div>
        </div>
        
        <style>{`
          @keyframes progress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
          }
          .animate-progress {
            animation: progress 1.5s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-30">
        <SpiritualSidebar />
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {isMobile && (
        <div className="md:hidden fixed inset-y-0 left-0 z-30">
          <SpiritualSidebar />
        </div>
      )}
      
      {/* Main Content Area */}
      <main 
        className={cn(
          'flex-1 flex flex-col transition-all duration-300',
          'relative z-10',
          isMobile ? 'ml-0' : 'lg:ml-72'
        )}
      >
        {/* Page Content with consistent padding */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-8 max-w-[1800px] mx-auto w-full">
          {children}
        </div>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top gradients */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[120px]" />
        
        {/* Center glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-cyan-500/3 rounded-full blur-[150px]" />
        
        {/* Bottom gradients */}
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-rose-500/5 rounded-full blur-[100px]" />
        
        {/* Noise texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015]" 
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }} 
        />
      </div>
    </div>
  );
}
