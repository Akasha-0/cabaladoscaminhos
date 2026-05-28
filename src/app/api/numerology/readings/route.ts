// ============================================================
// NUMEROLOGY READINGS API - CABALA DOS CAMINHOS
// ============================================================
// GET/POST endpoints for numerology readings
// Generates complete numerology reports from name and birth date
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { calculateNumerology, numerologyMethods, type NumerologyReport } from '@/lib/numerologia/generator';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

interface NumerologyReadingRequest {
  name: string;
  date: string;
  methods?: ('pitagorica' | 'caldeia' | 'cabalistica' | 'tantrica' | 'destino')[];
}

interface NumerologyReadingResponse {
  id: string;
  timestamp: string;
  input: {
    name: string;
    date: string;
  };
  report: NumerologyReport;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateReadingId(): string {
  return `numerology_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function validateInput(data: unknown): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Request body is required' };
  }
  
  const body = data as Record<string, unknown>;
  
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    return { valid: false, error: 'Name is required and must be a non-empty string' };
  }
  
  if (!body.date || typeof body.date !== 'string') {
    return { valid: false, error: 'Date is required' };
  }
  
  // Validate date format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(body.date)) {
    return { valid: false, error: 'Date must be in YYYY-MM-DD format' };
  }
  
  // Validate date is real
  const dateObj = new Date(body.date);
  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: 'Invalid date' };
  }
  
  return { valid: true };
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * POST /api/numerology/readings
 * Generate a complete numerology reading
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = validateInput(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error },
        { status: 400 }
      );
    }
    
    const { name, date } = body as NumerologyReadingRequest;
    
    // Generate the numerology report
    const report = calculateNumerology(name.trim(), date);
    
    // Build response
    const response: NumerologyReadingResponse = {
      id: generateReadingId(),
      timestamp: new Date().toISOString(),
      input: {
        name: name.trim(),
        date,
      },
      report,
    };
    
    return NextResponse.json(response, { status: 201 });
    
  } catch (error) {
    console.error('Numerology reading error:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate numerology reading' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/numerology/readings
 * Get information about available numerology methods
 */
export async function GET() {
  const methodsInfo = {
    pitagorica: {
      name: 'Pythagorean',
      description: 'Western numerology using alphabet values 1-9',
      input: 'name',
    },
    caldeia: {
      name: 'Chaldean',
      description: 'Ancient Babylonian numerology with mystical properties',
      input: 'name',
    },
    cabalistica: {
      name: 'Cabalistic',
      description: 'Hebrew mystical numerology system',
      input: 'name',
    },
    tantrica: {
      name: 'Tantric',
      description: 'Eastern numerology from Vedic traditions',
      input: 'date',
    },
    destino: {
      name: 'Destiny',
      description: 'Fate number based on birth date',
      input: 'date',
    },
  };
  
  const numerologyNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];
  
  return NextResponse.json({
    endpoints: {
      POST: {
        path: '/api/numerology/readings',
        description: 'Generate a complete numerology reading',
        required_fields: {
          name: 'Full birth name (string)',
          date: 'Birth date in YYYY-MM-DD format (string)',
        },
        optional_fields: {
          methods: 'Array of specific methods to calculate',
        },
      },
      GET: {
        path: '/api/numerology/readings',
        description: 'Get information about available numerology methods',
      },
    },
    available_methods: methodsInfo,
    number_range: numerologyNumbers,
    master_numbers: [11, 22, 33],
  });
}