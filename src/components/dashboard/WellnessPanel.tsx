'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Wind,
  Heart,
  Sparkles,
} from 'lucide-react';
import BreathingExercise from './BreathingExercise';
import GratitudeJournal from './GratitudeJournal';
import AffirmationFlow from './AffirmationFlow';

type TabId = 'breathing' | 'gratitude' | 'affirmation';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

const tabs: Tab[] = [
  { id: 'breathing', label: 'Respiração', icon: Wind },
  { id: 'gratitude', label: 'Gratidão', icon: Heart },
  { id: 'affirmation', label: 'Afirmações', icon: Sparkles },
];

export default function WellnessPanel() {
  const [activeTab, setActiveTab] = useState<TabId>('breathing');

  return (
    <Card className="bg-slate-900/50 border-slate-700/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-100">
            Painel de Bem-Estar
          </CardTitle>
          <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-600">
            Wellness
          </Badge>
        </div>
        <div className="flex gap-2 mt-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 transition-all',
                  isActive
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent>
        {activeTab === 'breathing' && <BreathingExercise />}
        {activeTab === 'gratitude' && <GratitudeJournal />}
        {activeTab === 'affirmation' && <AffirmationFlow />}
      </CardContent>
    </Card>
  );
}