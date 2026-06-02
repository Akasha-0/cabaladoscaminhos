// fallow-ignore-file unused-file
// Widget data for dashboard components

export interface WidgetData {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: string;
}

export function getWidgetData(): WidgetData[] {
  return [
    { id: 'revenue', title: 'Receita Mensal', value: 'R$ 12.450', change: 8.5, trend: 'up', icon: 'chart' },
    { id: 'users', title: 'Usuários Ativos', value: 2847, change: 12.3, trend: 'up', icon: 'users' },
    { id: 'sessions', title: 'Sessões', value: '4.2K', change: -2.1, trend: 'down', icon: 'activity' },
    { id: 'conversion', title: 'Conversão', value: '3.8%', change: 0.5, trend: 'up', icon: 'target' },
  ];
}