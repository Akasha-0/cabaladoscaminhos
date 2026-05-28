// ============================================================
// INTEGRATION DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for integration data access
// - Retrieve all integration records
// - Retrieve integration flows
// - Retrieve configuration and status
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface IntegrationRecord {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'active' | 'inactive' | 'pending';
}

interface IntegrationFlow {
  id: string;
  source: string;
  target: string;
  trigger: string;
  enabled: boolean;
}

// GET /api/integration/data - Get integration data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    const integrationRecords: IntegrationRecord[] = [
      { id: 'int-001', name: 'Astrology Sync', description: 'Synchronizes planetary positions with user profile', category: 'astrology', status: 'active' },
      { id: 'int-002', name: 'Tarot Bridge', description: 'Connects tarot readings to daily practice', category: 'divination', status: 'active' },
      { id: 'int-003', name: 'Numerology Link', description: 'Links numerology calculations to user journey', category: 'numerology', status: 'active' },
      { id: 'int-004', name: 'Meditation Tracker', description: 'Tracks meditation sessions and progress', category: 'wellness', status: 'active' },
      { id: 'int-005', name: 'Cleansing Scheduler', description: 'Schedules energy cleansing rituals', category: 'rituals', status: 'inactive' },
      { id: 'int-006', name: 'Orisha Connection', description: 'Connects orisha worship with daily affirmations', category: 'orixa', status: 'pending' },
      { id: 'int-007', name: 'Karma Tracker', description: 'Tracks karma-related actions and outcomes', category: 'karma', status: 'active' },
      { id: 'int-008', name: 'Sacred Geometry Visualizer', description: 'Visualizes sacred geometry patterns', category: 'geometry', status: 'active' },
    ];

    const integrationFlows: IntegrationFlow[] = [
      { id: 'flow-001', source: 'birth_data', target: 'astrology_analysis', trigger: 'on_profile_update', enabled: true },
      { id: 'flow-002', source: 'daily_practice', target: 'karma_tracker', trigger: 'on_completion', enabled: true },
      { id: 'flow-003', source: 'tarot_reading', target: 'journal_entry', trigger: 'on_reading_complete', enabled: true },
      { id: 'flow-004', source: 'meditation_session', target: 'progress_stats', trigger: 'on_session_end', enabled: true },
      { id: 'flow-005', source: 'orixa_selection', target: 'offering_recommendations', trigger: 'on_selection', enabled: false },
    ];

    // Return single integration record by ID
    if (id) {
      const record = integrationRecords.find((r) => r.id === id);
      if (!record) {
        return NextResponse.json(
          { success: false, error: 'Integration record not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: record });
    }

    // Return integration flows only
    if (type === 'flows') {
      return NextResponse.json({ success: true, data: integrationFlows });
    }

    // Return integration records only
    if (type === 'records') {
      return NextResponse.json({ success: true, data: integrationRecords });
    }

    // Return categories with counts
    if (type === 'categories') {
      const categories = integrationRecords.reduce((acc, record) => {
        if (!acc[record.category]) {
          acc[record.category] = { count: 0, active: 0, inactive: 0, pending: 0 };
        }
        acc[record.category].count++;
        acc[record.category][record.status]++;
        return acc;
      }, {} as Record<string, { count: number; active: number; inactive: number; pending: number }>);

      return NextResponse.json({ success: true, data: categories });
    }

    // Default — return all integration data
    return NextResponse.json({
      success: true,
      data: {
        records: integrationRecords,
        flows: integrationFlows,
        summary: {
          totalRecords: integrationRecords.length,
          activeRecords: integrationRecords.filter((r) => r.status === 'active').length,
          totalFlows: integrationFlows.length,
          enabledFlows: integrationFlows.filter((f) => f.enabled).length,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch integration data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
