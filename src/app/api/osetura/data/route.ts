// Osetura API - Cabala Dos Caminhos
// GET endpoints for Osetura spiritual data

import { NextResponse } from 'next/server';
import { getData, Osetura } from '@/lib/osetura/osetura-data';

/**
 * GET /api/osetura/data
 * Returns Osetura spiritual data
 * Supports query parameters: element, name, domain
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const element = searchParams.get('element');
  const name = searchParams.get('name');
  const domain = searchParams.get('domain');

  let data: Osetura[] = getData();

  // Filter by element
  if (element) {
    data = data.filter(item => 
      item.element.toLowerCase().includes(element.toLowerCase())
    );
  }

  // Filter by name
  if (name) {
    data = data.filter(item => 
      item.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  // Filter by domain
  if (domain) {
    data = data.filter(item => 
      item.domain.toLowerCase().includes(domain.toLowerCase())
    );
  }

  return NextResponse.json({ data });
}