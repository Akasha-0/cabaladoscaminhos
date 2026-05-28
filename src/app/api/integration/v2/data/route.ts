// ============================================================
// INTEGRATION DATA API v2 - CABALA DOS CAMINHOS
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

interface Configuration {
  key: string;
  value: string;
  updatedAt: string;
}

// GET /api/integration/v2/data - Get integration data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    const integrationRecords: IntegrationRecord[] = [
      {
        id: 'rec_001',
        name: 'Light System Integration',
        description: 'Integration with Light entity system',
        category: 'light',
        status: 'active',
      },
      {
        id: 'rec_002',
        name: 'Shadow System Integration',
        description: 'Integration with Shadow entity system',
        category: 'shadow',
        status: 'active',
      },
      {
        id: 'rec_003',
        name: 'Embody System Integration',
        description: 'Integration with Embody entity system',
        category: 'embody',
        status: 'pending',
      },
    ];

    const integrationFlows: IntegrationFlow[] = [
      {
        id: 'flow_001',
        source: 'light-system',
        target: 'shadow-system',
        trigger: 'on-light-activated',
        enabled: true,
      },
      {
        id: 'flow_002',
        source: 'shadow-system',
        target: 'embody-system',
        trigger: 'on-shadow-balanced',
        enabled: true,
      },
      {
        id: 'flow_003',
        source: 'embody-system',
        target: 'light-system',
        trigger: 'on-embody-complete',
        enabled: false,
      },
    ];

    const configurations: Configuration[] = [
      {
        key: 'integration.mode',
        value: 'synchronized',
        updatedAt: '2026-05-28T00:00:00Z',
      },
      {
        key: 'integration.timeout',
        value: '30000',
        updatedAt: '2026-05-28T00:00:00Z',
      },
      {
        key: 'integration.retry_count',
        value: '3',
        updatedAt: '2026-05-28T00:00:00Z',
      },
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

    // Return configurations
    if (type === 'config') {
      return NextResponse.json({ success: true, data: configurations });
    }

    // Return categories with counts
    if (type === 'categories') {
      const categories = integrationRecords.reduce(
        (acc, record) => {
          acc[record.category] = (acc[record.category] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );
      return NextResponse.json({ success: true, data: categories });
    }

    // Default — return all integration data
    return NextResponse.json({
      success: true,
      data: {
        records: integrationRecords,
        flows: integrationFlows,
        config: configurations,
      },
      meta: {
        totalRecords: integrationRecords.length,
        totalFlows: integrationFlows.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Integration data API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}