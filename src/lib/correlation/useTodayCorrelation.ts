'use client';

import { useMemo } from 'react';
import { getTodayCorrelation, DayCorrelation } from './SpiritualCorrelationEngine';

export function useTodayCorrelation(): DayCorrelation {
  return useMemo(() => getTodayCorrelation(), []);
}
