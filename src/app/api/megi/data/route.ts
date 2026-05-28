import { NextResponse } from 'next/server';
import { getData } from '@/lib/megi/megi-data';

export async function GET() {
  return NextResponse.json(getData());
}
