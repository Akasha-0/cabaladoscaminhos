// Dashboard data
export interface DashboardData {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeSessions: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  userId: string;
  action: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export async function getDashboard(): Promise<DashboardData> {
  return {
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeSessions: 0,
    recentActivity: [],
  };
}
