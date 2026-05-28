// ============================================================
// SOURCE DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for source data access
// ============================================================
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */

import { NextResponse } from 'next/server';
import { getData } from '@/lib/source/source-data';

export async function GET() {
  const data = getData();
  return NextResponse.json({ data });
}
