import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Award, TrendingUp } from 'lucide-react';

const TABS = [
  { id: 'daily', label: 'Meu Dia', icon: Sparkles },
  { id: 'profile', label: 'Áreas da Vida', icon: Award },
  { id: 'progress', label: 'Evolução', icon: TrendingUp },
] as const;

type TabId = typeof TABS[number]['id'];

interface TabSegmentedControlProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

export function TabSegmentedControl({ activeTab, setActiveTab }: TabSegmentedControlProps) {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      const nextIndex = (index + 1) % TABS.length;
      setActiveTab(TABS[nextIndex].id);
      document.getElementById(`tab-${TABS[nextIndex].id}`)?.focus();
    } else if (e.key === 'ArrowLeft') {
      const prevIndex = (index - 1 + TABS.length) % TABS.length;
      setActiveTab(TABS[prevIndex].id);
      document.getElementById(`tab-${TABS[prevIndex].id}`)?.focus();
    }
  };

  return (
    <div className="px-4 pt-6 max-w-2xl mx-auto relative z-10">
      <div
        role="tablist"
        className="bg-[#0B0E1C]/80 border border-white/10 rounded-full p-1 flex items-center justify-between backdrop-blur-md"
      >
        {TABS.map((tab, index) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={active}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 relative ${
                active ? 'text-white' : 'text-[#A7AECF] hover:text-white'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-[#7C5CFF]/30 border border-[#7C5CFF]/60 rounded-full z-0"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon size={active ? 16 : 14} className="relative z-10 transition-all duration-300" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
