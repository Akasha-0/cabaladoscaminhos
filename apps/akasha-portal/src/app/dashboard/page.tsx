import { Dashboard } from '@/components/akasha/dashboard';

export const metadata = {
  title: 'Dashboard | Akasha OS',
  description: 'Visualize suas estatísticas, streaks e histórico de rituais',
};

export default function DashboardPage() {
  return <Dashboard userId="demo-user" />;
}
